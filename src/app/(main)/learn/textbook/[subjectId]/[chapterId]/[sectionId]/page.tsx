'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, Loader2, Save, Trophy, RotateCcw,
  BookOpen, Sparkles, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useHistoryStore } from '@/stores/historyStore';
import { fallbackGetPDF } from '@/lib/localFallback';
import { extractSectionContent, findSectionContent, findNextSectionTitle } from '@/lib/pdf-utils';
import { getBantuMathB1Range, normalizeChapters } from '@/lib/chapterPageMapping';
import { LearningRecord, saveLearningRecord, deleteLearningRecord } from '@/services/supabaseService';
import { storage, StorageKeys } from '@/lib/storage';

interface Section {
  id: number;
  page: number;
  original: string;
  explanation: string;
  keyPoints: string[];
  question: { text: string; options: string[]; correct: string; };
}

interface AnswerFeedback {
  correct: boolean;
  message: string;
  hint?: string;
  nextAction: string;
  explanation?: string;
  isWeak?: boolean;
}

interface PDFData {
  full_text?: string;
  fullText?: string;
  pages?: Array<{ pageNumber: number; content: string }>;
}

function TextbookPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;
  const sectionId = params.sectionId as string;
  const startPage = parseInt(searchParams.get('startPage') || '3', 10);
  const endPage = parseInt(searchParams.get('endPage') || '9', 10);
  const pageType = searchParams.get('pageType') || searchParams.get('pageRangeType') || 'file';
  const fileStart = searchParams.get('fileStart');
  const fileEnd = searchParams.get('fileEnd');
  const sectionTitle = searchParams.get('sectionTitle') || '';
  const subSectionTitle = searchParams.get('subSectionTitle') || '';

  const effectiveRange = pageType === 'printed' && fileStart && fileEnd
    ? { start: parseInt(fileStart, 10), end: parseInt(fileEnd, 10) }
    : { start: startPage, end: endPage };
  const { settings } = useSettingsStore();
  const { currentSubject } = useSubjectStore();
  const addRecord = useHistoryStore((s) => s.addRecord);

  const getSubjectName = (id: string) => {
    const map: Record<string, string> = { math: '数学', physics: '物理', chemistry: '化学', english: '英语', chinese: '语文', biology: '生物', geography: '地理', politics: '政治', history: '历史' };
    return map[id] || id;
  };

  const [sections, setSections] = useState<Section[]>([]);
  const [segmentWarning, setSegmentWarning] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [weakSections, setWeakSections] = useState<number[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [reexplaining, setReexplaining] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [chapters, setChapters] = useState<import('@/lib/pdf-utils').ChapterPages[]>([]);
  
  // 学习计时器（用 ref 便于重置）
  const startTimeRef = useRef(Date.now());
  const [duration, setDuration] = useState(0);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 恢复课本还原学习进度
  useEffect(() => {
    async function loadSavedProgress() {
      if (sections.length === 0) return;
      try {
        const saved = localStorage.getItem(`textbook_progress_${subjectId}_${chapterId}_${sectionId}`);
        if (saved) {
          const progress = JSON.parse(saved);
          const idx = progress?.progress?.currentIndex ?? progress?.currentIndex;
          const paragraphIdx = progress?.progress?.currentParagraphIndex ?? progress?.currentParagraphIndex;
          if (typeof idx === 'number' && idx < sections.length) {
            setCurrentIndex(idx);
            setCompletedSections(progress?.progress?.completedParagraphs || progress?.completedSections || []);
            setWeakSections(progress?.progress?.wrongList || progress?.weakSections || []);
            setRecordId(progress.id || null);
            setShowResumeToast(true);
            setTimeout(() => setShowResumeToast(false), 4000);
          }
        }
      } catch (e) {
        console.error('[Textbook] 恢复进度失败:', e);
      }
    }
    loadSavedProgress();
  }, [sections, subjectId, chapterId, sectionId]);
  
  const currentSection = sections[currentIndex];
  const progressPercent = sections.length > 0 ? Math.round(((currentIndex + 1) / sections.length) * 100) : 0;

  const getSectionContent = useCallback((fullText: string) => {
    if (!fullText) return '';

    // 优先级1：硬编码映射（精确到小节）
    const hardcoded = getBantuMathB1Range(sectionId);
    if (hardcoded) {
      const content = extractSectionContent({ full_text: fullText }, hardcoded.startPage, hardcoded.endPage);
      if (content.length > 100) {
        console.log(`[Textbook] 使用硬编码映射 ${sectionId}: 第${hardcoded.startPage}-${hardcoded.endPage}页，提取${content.length}字符`);
        return content;
      }
    }

    // 优先级2：按小节标题定位（通用）
    const searchTitle = subSectionTitle || sectionTitle || `第 ${chapterId} 章 第 ${sectionId} 节`;
    const nextTitle = subSectionTitle || sectionTitle
      ? findNextSectionTitle(chapters, chapterId, sectionId, subSectionTitle || undefined)
      : undefined;

    const matched = findSectionContent(fullText, searchTitle, nextTitle);
    if (matched && matched.content.length > 100) {
      console.log(`[Textbook] 按标题定位成功：${searchTitle}，长度=${matched.content.length}`);
      return matched.content;
    }

    // 优先级3：URL页码范围
    console.log('[Textbook] 标题定位失败，回退到页码范围');
    return extractSectionContent({ full_text: fullText }, effectiveRange.start, effectiveRange.end);
  }, [chapters, chapterId, sectionId, sectionTitle, subSectionTitle, effectiveRange.start, effectiveRange.end]);

  useEffect(() => {
    async function loadChapters() {
      try {
        const { fallbackGetChapters } = await import('@/lib/localFallback');
        const data = await fallbackGetChapters(subjectId);
        if (Array.isArray(data)) {
          setChapters(normalizeChapters(data));
        }
      } catch (error) {
        console.error('[Textbook] Chapters load error:', error);
      }
    }
    loadChapters();
  }, [subjectId]);

  useEffect(() => {
    async function loadAndSegment() {
      setLoading(true);
      setLoadingPdf(true);
      try {
        let pdfData: PDFData | null = null;
        const { fallbackGetPDF } = await import('@/lib/localFallback');
        const fallbackData = await fallbackGetPDF(subjectId);
        if (fallbackData?.full_text) pdfData = fallbackData as PDFData;

        if (!pdfData) {
          const directKey = `edumind_fallback_pdf_${subjectId}`;
          const directData = localStorage.getItem(directKey);
          if (directData) {
            const parsed = JSON.parse(directData);
            if (parsed.data?.full_text) pdfData = parsed.data as PDFData;
          }
        }

        if (!pdfData) {
          const pdfRaw = storage.get<{ fullText?: string; full_text?: string } | null>(StorageKeys.PDF(subjectId));
          const content = typeof pdfRaw === 'string' ? pdfRaw : (pdfRaw?.fullText || pdfRaw?.full_text || '');
          if (content && content.length > 100) {
            pdfData = (pdfRaw as any) || { full_text: content };
          }
        }

        if (!pdfData || (!pdfData.full_text && !pdfData.fullText)) {
          setLoading(false);
          setLoadingPdf(false);
          return;
        }

        setLoadingPdf(false);
        const fullText = pdfData.full_text || pdfData.fullText || '';
        const content = getSectionContent(fullText);

        if (!content || content.length < 100) {
          setLoading(false);
          return;
        }

        const chapterTitle = `第 ${chapterId} 章 第 ${sectionId} 节`;
        setGenerating(true);
        
        const response = await fetch('/api/textbook/auto-segment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, chapterTitle, pageRange: `${effectiveRange.start}-${effectiveRange.end}`, subjectId, sectionId, apiKey: settings?.deepseekKey })
        });

        const data = await response.json();
        if (data.success && data.sections?.length) {
          const extractedContent = extractSectionContent(fallbackData!, effectiveRange.start, effectiveRange.end);
          const originalLen = extractedContent.replace(/\s+/g, '').length;
          const combinedLen = data.sections.map((s: any) => (s.original || s.content || '').replace(/\s+/g, '')).join('').length;
          if (originalLen > 200 && combinedLen < originalLen * 0.7) {
            const warning = `[课本还原] 警告：可能跳段，原文${originalLen}字，分段合并后仅${combinedLen}字，请检查各段落是否完整`;
            console.warn(warning);
            setSegmentWarning(warning);
          } else {
            setSegmentWarning(null);
          }
          setSections(data.sections);
          const savedProgress = localStorage.getItem(`textbook_progress_${subjectId}_${chapterId}_${sectionId}`);
          if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            if (progress.currentIndex < data.sections.length) {
              setCurrentIndex(progress.currentIndex);
              setCompletedSections(progress.completedSections || []);
              setWeakSections(progress.weakSections || []);
            }
          }
        } else {
          const localSections = generateLocalSections(content);
          setSections(localSections);
        }
      } catch (error) {
        console.error('[Textbook] Error:', error);
      } finally {
        setLoading(false);
        setLoadingPdf(false);
        setGenerating(false);
      }
    }
    loadAndSegment();
  }, [subjectId, chapterId, sectionId, startPage, endPage, settings?.deepseekKey]);

  const generateLocalSections = (content: string): Section[] => {
    const paragraphs = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/\n\s*\n/).filter(p => p.trim().length >= 30).slice(0, 12);
    return paragraphs.map((p, i) => ({
      id: i + 1,
      page: startPage + Math.floor(i / 3),
      original: p.trim(),
      explanation: '请结合上下文理解这段内容。',
      keyPoints: ['理解原文含义', '注意关键概念'],
      question: { text: '这段内容主要讲了什么？', options: ['A. 完全理解了', 'B. 部分理解', 'C. 不太理解', 'D. 完全不懂'], correct: 'A' }
    }));
  };

  const handleAnswer = async (answer: string) => {
    if (!currentSection?.question) return;
    const isCorrect = answer === currentSection.question.correct;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    if (isCorrect) {
      setFeedback({ correct: true, message: '太棒了！回答正确！', hint: '继续保持~', nextAction: 'next' });
      if (!completedSections.includes(currentSection.id)) setCompletedSections(prev => [...prev, currentSection.id]);
      setCorrectAttempts(prev => prev + 1);
      setTimeout(() => handleNext(), 1500);
    } else {
      setAttemptCount(prev => prev + 1);
      if (attemptCount >= 1) {
        setFeedback({ correct: false, message: '再想想呢~', hint: '注意题目中的关键词', nextAction: 'reexplain' });
      }
    }
    setTotalAttempts(prev => prev + 1);
  };

  const handleReexplain = async () => {
    if (!currentSection || !settings?.deepseekKey) return;
    setShowFeedback(false);
    setSelectedAnswer('');
    setReexplaining(true);
    
    try {
      const response = await fetch('/api/textbook/explain-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentSection.original, context: '', previousExplanation: currentSection.explanation, attemptCount: 2, apiKey: settings.deepseekKey })
      });
      const data = await response.json();
      if (data.success) {
        setSections(prev => prev.map((s, i) => i === currentIndex ? { ...s, explanation: data.explanation, keyPoints: data.keyPoints || s.keyPoints, question: data.question ? { text: data.question.question, options: data.question.options, correct: data.question.correctAnswer } : s.question } : s));
      }
    } catch (error) {
      console.error('[Textbook] Reexplain error:', error);
    } finally {
      setReexplaining(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < sections.length - 1) { setCurrentIndex(prev => prev + 1); resetState(); }
    else { setIsCompleted(true); }
  };

  const resetState = () => { setSelectedAnswer(''); setShowFeedback(false); setFeedback(null); setAttemptCount(1); };
  const handleSkip = () => handleNext();
  
  const handleSave = () => {
    setIsSaving(true);
    const correctRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
    const progress = {
      currentIndex,
      currentParagraphIndex: currentIndex,
      totalParagraphs: sections.length,
      totalPages: Math.max(...sections.map(s => s.page || 0)),
      completedParagraphs: completedSections,
      wrongList: weakSections,
      totalAttempts,
      correctAttempts,
      correctRate,
      summary: sections.length > 0 && completedSections.length === sections.length ? '已完成全部段落' : `已完成 ${completedSections.length}/${sections.length} 个段落 | 正确率 ${correctRate}%`,
    };
    const newId = recordId || `t_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const record = {
      id: newId,
      subjectId,
      subjectName: getSubjectName(currentSubject || subjectId),
      chapterId,
      sectionId,
      sectionTitle,
      mode: 'TEXTBOOK',
      duration,
      progress,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('zh-CN'),
    } as unknown as LearningRecord;
    setRecordId(newId);
    saveLearningRecord(record).then(() => {
      addRecord(record);
      localStorage.setItem(`textbook_progress_${subjectId}_${chapterId}_${sectionId}`, JSON.stringify(record));
      alert('✅ 学习记录已保存');
    }).catch((err) => {
      console.error('[Textbook] Save error:', err);
      alert('保存失败，请稍后重试');
    }).finally(() => setIsSaving(false));
  };

  const handleResetProgress = () => {
    if (!confirm('确定要从头开始学习吗？当前进度将被清除。')) return;

    if (recordId) {
      deleteLearningRecord(recordId);
      setRecordId(null);
    }

    setCurrentIndex(0);
    setCompletedSections([]);
    setWeakSections([]);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setIsCompleted(false);
    setFeedback(null);
    setShowFeedback(false);
    setSelectedAnswer('');
    setAttemptCount(1);
    startTimeRef.current = Date.now();
    setDuration(0);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => { setCurrentIndex(0); setCompletedSections([]); setWeakSections([]); setTotalAttempts(0); setCorrectAttempts(0); setIsCompleted(false); resetState(); };

  if (loading || loadingPdf) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl"><BookOpen className="h-10 w-10 text-white animate-pulse" /></div>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">{generating ? 'AI正在分析课本...' : '正在加载课本内容...'}</h2>
          <p className="text-slate-500">{generating ? '正在按知识点分段，请稍候' : `正在提取第 ${startPage}-${endPage} 页`}</p>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">未找到课本内容</h2>
            <p className="text-slate-500 mb-2">页码范围: {startPage} - {endPage}</p>
            <p className="text-slate-400 mb-6">请检查章节设置或上传教材 PDF</p>
            <Link href={`/subjects/${subjectId}`}><Button>返回学科页面</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30"><Trophy className="h-12 w-12 text-white" /></div>
            <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-300 mb-2">太棒了！</h2>
            <p className="text-xl text-slate-500 mb-2">你已完成本章还原课本学习</p>
            <p className="text-lg text-slate-400 mb-4">共学习 {sections.length} 个段落</p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2"><div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></div><span className="text-lg font-medium text-green-600">掌握 {completedSections.length}</span></div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} variant="outline" size="lg" className="gap-2"><RotateCcw className="h-5 w-5" />重新学习</Button>
              <Link href={`/subjects/${subjectId}`}><Button size="lg" className="gap-2">返回学科</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/subjects/${subjectId}`}><Button variant="ghost" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" />返回</Button></Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div><h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">还原课本</h1><p className="text-sm text-slate-500">第 {chapterId} 章 第 {sectionId} 节</p></div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">第 {currentIndex + 1} / {sections.length} 段</Badge>
              {segmentWarning && (
                <Badge variant="destructive" className="text-xs max-w-xs truncate" title={segmentWarning}>
                  <AlertTriangle className="h-3 w-3 mr-1" />分段可能不完整
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="gap-2"><Save className="h-4 w-4" />{isSaving ? '保存中...' : '保存'}</Button>
              <Button variant="outline" size="sm" onClick={handleResetProgress} className="gap-2 text-red-500 hover:text-red-700 border-red-300 hover:border-red-500 hover:bg-red-50"><RotateCcw className="h-4 w-4" />从头开始学</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">{currentIndex + 1}</div><span className="text-sm text-slate-500">当前 / 总数</span></div>
              <div className="flex items-center gap-2 text-sm text-slate-500"><span>📖</span><span>第 {currentSection?.page || startPage} 页</span></div>
              {completedSections.length > 0 && <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle className="h-4 w-4" /><span>已掌握 {completedSections.length}</span></div>}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2.5 rounded-full" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {currentSection && (
          <>
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-500" /><span>原文</span></div>
                  <Badge variant="outline" className="text-slate-500">第 {currentSection.page} 页</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">"{currentSection.original}"</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 pb-4">
                <CardTitle className="flex items-center gap-2"><span className="text-xl">💡</span><span>AI讲解</span>{reexplaining && <Badge variant="secondary" className="animate-pulse">重新生成中...</Badge>}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {reexplaining ? (
                  <div className="space-y-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-11/12" /><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" /></div>
                ) : (
                  <>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{currentSection.explanation}</p>
                    {currentSection.keyPoints?.length > 0 && (
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center gap-2 mb-3"><span className="text-lg">🎯</span><span className="font-semibold text-indigo-700 dark:text-indigo-400">核心要点</span></div>
                        <ul className="space-y-2">{currentSection.keyPoints.map((point, i) => (<li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"><span className="text-indigo-500 font-bold">{i + 1}.</span><span>{point}</span></li>))}</ul>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {currentSection.question && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className={cn('h-1.5', showFeedback && feedback?.correct ? 'bg-gradient-to-r from-green-400 to-emerald-500' : showFeedback ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500')} />
                <CardHeader className="bg-gradient-to-r from-pink-50/50 to-purple-50/30 dark:from-pink-950/20 dark:to-purple-950/10 pb-4">
                  <CardTitle className="flex items-center gap-2"><span className="text-xl">✏️</span><span>趁热打铁</span></CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{currentSection.question.text}</p>
                  <div className="grid grid-cols-1 gap-3">
                    {currentSection.question.options.map((option, index) => {
                      const optionKey = option.charAt(0);
                      const isSelected = selectedAnswer === optionKey;
                      const isCorrectOption = optionKey === currentSection.question.correct;
                      return (
                        <button key={index} onClick={() => !showFeedback && handleAnswer(optionKey)} disabled={showFeedback} className={cn('relative p-4 rounded-xl border-2 transition-all duration-200 text-left', 'hover:scale-[1.01] active:scale-[0.99]', !showFeedback && isSelected && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-lg', !showFeedback && !isSelected && 'border-slate-200 dark:border-slate-700 hover:border-indigo-300', showFeedback && isCorrectOption && 'border-green-500 bg-green-50 dark:bg-green-950/40 shadow-lg', showFeedback && isSelected && !isCorrectOption && 'border-red-500 bg-red-50 dark:bg-red-950/40 shadow-lg', showFeedback && !isSelected && !isCorrectOption && 'border-slate-200 dark:border-slate-700 opacity-50')}>
                          <span className={cn('inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold mr-3', !showFeedback && isSelected && 'bg-indigo-500 text-white', !showFeedback && !isSelected && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400', showFeedback && isCorrectOption && 'bg-green-500 text-white', showFeedback && isSelected && !isCorrectOption && 'bg-red-500 text-white', showFeedback && !isSelected && !isCorrectOption && 'bg-slate-200 dark:bg-slate-700 text-slate-500')}>{optionKey}</span>
                          <span className={cn('font-medium', !showFeedback && 'text-slate-700 dark:text-slate-300', showFeedback && isCorrectOption && 'text-green-700 dark:text-green-400', showFeedback && isSelected && !isCorrectOption && 'text-red-700 dark:text-red-400', showFeedback && !isSelected && !isCorrectOption && 'text-slate-400')}>{option.substring(3).trim()}</span>
                          {showFeedback && isCorrectOption && <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-500" />}
                          {showFeedback && isSelected && !isCorrectOption && <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-red-500" />}
                        </button>
                      );
                    })}
                  </div>
                  {showFeedback && feedback && (
                    <div className={cn('p-4 rounded-xl border-2 animate-fadeIn', feedback.correct ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800')}>
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold', feedback.correct ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-amber-400 to-orange-500')}>{feedback.correct ? '✓' : '🤔'}</div>
                        <div><p className={cn('font-bold text-lg', feedback.correct ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400')}>{feedback.message}</p>{feedback.hint && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">💡 {feedback.hint}</p>}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
        <div className="flex justify-center gap-4">
          {showFeedback && feedback?.nextAction === 'reexplain' && <Button onClick={handleReexplain} variant="outline" size="lg" className="gap-2"><Sparkles className="h-5 w-5" />重新讲解</Button>}
          {!showFeedback && <Button onClick={handleSkip} variant="outline" size="lg" className="gap-2">跳过 →</Button>}
        </div>
      </main>
    </div>
  );
}

export default function TextbookLearnPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-indigo-500" /></div>}>
      <TextbookPageContent />
    </Suspense>
  );
}
