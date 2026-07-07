'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { generateTutorialForParagraph, type TutorialResult } from '@/lib/aiTextbookTutor';
import {
  ArrowLeft, Loader2, Save, Trophy, RotateCcw,
  BookOpen, Sparkles, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useHistoryStore } from '@/stores/historyStore';
import { extractSectionContent, findSectionContent, findNextSectionTitle, extractContentByPageRange, fixMathSymbols } from '@/lib/pdf-utils';
import { getBantuMathB1Range, normalizeChapters, normalizeSectionId } from '@/lib/chapterPageMapping';
import { LearningRecord, saveLearningRecord, deleteLearningRecord } from '@/services/supabaseService';
import { addWrongQuestion, type WrongQuestion } from '@/services/practiceService';
import { storage, StorageKeys } from '@/lib/storage';
import { startLearning, endLearning } from '@/lib/learningService';

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
  const rawSectionId = params.sectionId as string;
  const decodedSectionId = rawSectionId ? decodeURIComponent(rawSectionId) : '';
  const sectionId = normalizeSectionId(decodedSectionId, chapterId);

  const startPage = parseInt(searchParams.get('startPage') || '3', 10);
  const endPage = parseInt(searchParams.get('endPage') || '9', 10);
  const pageType = searchParams.get('pageType') || 'file';
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
    const map: Record<string, string> = {
      math: '数学', physics: '物理', chemistry: '化学', english: '英语',
      chinese: '语文', biology: '生物', geography: '地理', politics: '政治', history: '历史'
    };
    return map[id] || id;
  };

  // ============================================================
  // 统一状态：sections 是唯一数据源（API 已做长度控制 ≤200字）
  // ============================================================
  const [sections, setSections] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [chapters, setChapters] = useState<any[]>([]);

  // 每段的学习状态（由 tutorial useEffect 管理）
  const [tutorial, setTutorial] = useState<TutorialResult | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isOptionCorrect, setIsOptionCorrect] = useState<boolean | null>(null);
  const [loadingTutorial, setLoadingTutorial] = useState(false);
  const [errorExplanation, setErrorExplanation] = useState('');
  const [mastered, setMastered] = useState(false); // 答对后标记为已掌握
  const [retryCount, setRetryCount] = useState(0); // 重试次数

  // 学习计时
  const startTimeRef = useRef(Date.now());
  const [duration, setDuration] = useState(0);
  const [recordId, setRecordId] = useState<string | null>(null);

  // ============================================================
  // 学习记录
  // ============================================================
  const learningRecordRef = useRef<string | null>(null);

  useEffect(() => {
    const currentSubject = useSubjectStore.getState()?.currentSubject;
    startLearning({
      subjectId,
      subjectName: getSubjectName(currentSubject || subjectId),
      activityType: 'textbook',
      chapterId,
      sectionId: decodedSectionId,
      activityDetail: { sectionTitle, subSectionTitle },
    }).then(id => { learningRecordRef.current = id; });

    const handleUnload = () => { if (learningRecordRef.current) endLearning(learningRecordRef.current); };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      if (learningRecordRef.current) { endLearning(learningRecordRef.current); learningRecordRef.current = null; }
    };
  }, [subjectId, chapterId, decodedSectionId]);

  // ============================================================
  // 计时器
  // ============================================================
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ============================================================
  // 计算属性
  // ============================================================
  const currentSection = sections[currentIndex];
  const progressPercent = sections.length > 0
    ? Math.round(((currentIndex + 1) / sections.length) * 100) : 0;

  // ============================================================
  // 内容提取
  // ============================================================
  const getSectionContent = (fullText: string, pdfDataForExtract?: PDFData | null) => {
    if (!fullText) return '';

    console.log('[getSectionContent] === 调试开始 ===');
    console.log('[getSectionContent] pdfDataForExtract?.pages:', pdfDataForExtract?.pages?.length ?? 'undefined/null');
    console.log('[getSectionContent] sectionId:', sectionId);
    console.log('[getSectionContent] fullText 前50字符:', fullText.slice(0, 50));

    // 优先用 hardcoded 页码范围（来自 pdfData.pages 或 full_text）
    if (pdfDataForExtract?.pages && pdfDataForExtract.pages.length > 0) {
      const hardcoded = getBantuMathB1Range(sectionId);
      console.log('[getSectionContent] 有pages数组，hardcoded:', hardcoded);
      if (hardcoded) {
        const content = extractSectionContent(pdfDataForExtract, hardcoded.startPage, hardcoded.endPage);
        console.log('[getSectionContent] extractSectionContent(pages) 返回长度:', content.length);
        console.log('[getSectionContent] 前100字符:', content.slice(0, 100));
        if (content.length > 100) return content;
      }
    } else {
      const hardcoded = getBantuMathB1Range(sectionId);
      console.log('[getSectionContent] 无pages数组，走full_text路径，hardcoded:', hardcoded);
      if (hardcoded) {
        const content = extractSectionContent({ full_text: fullText }, hardcoded.startPage, hardcoded.endPage);
        console.log('[getSectionContent] extractSectionContent(full_text) 返回长度:', content.length);
        console.log('[getSectionContent] 前100字符:', content.slice(0, 100));
        if (content.length > 100) return content;
      }
    }

    // 按标题搜索内容（注意：findSectionContent 已内置 fixMathSymbols）
    const searchTitle = subSectionTitle || sectionTitle || `第 ${chapterId} 章 第 ${sectionId} 节`;
    const nextTitle = (subSectionTitle || sectionTitle)
      ? findNextSectionTitle(chapters, chapterId, sectionId)
      : undefined;
    const matched = findSectionContent(fullText, searchTitle, nextTitle);
    if (matched && matched.content.length > 100) return matched.content;

    // 最后兜底：按页码范围提取（已在 extractContentByPageRange 中调用过 fixMathSymbols）
    const raw = extractContentByPageRange(fullText, effectiveRange.start, effectiveRange.end);
    return raw.length > 100 ? raw : fixMathSymbols(fullText.slice(0, 2000));
  };

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

  // ============================================================
  // 加载并分段（单次 AI 调用）
  // ============================================================
  useEffect(() => {
    async function loadAndSegment() {
      setLoading(true);
      setLoadingPdf(true);
      try {
        let pdfData: PDFData | null = null;

        const urlTextbookId = searchParams.get('textbookId');
        if (urlTextbookId) {
          try {
            const pdfRes = await fetch(`/api/textbook/pdf?textbookId=${urlTextbookId}`);
            const pdfResult = await pdfRes.json();
            if (pdfResult.success && pdfResult.pdf) {
              const apiPdf = pdfResult.pdf as PDFData;
              if (apiPdf.full_text || apiPdf.fullText || (apiPdf.pages && apiPdf.pages.length > 0)) {
                pdfData = apiPdf;
              }
            }
          } catch (err) {
            console.error('[Textbook] URL参数 PDF 加载失败:', err);
          }
        }

        if (!pdfData) {
          try {
            const listRes = await fetch(`/api/textbook/list?subjectId=${subjectId}`);
            const listData = await listRes.json();
            const textbooks = listData.textbooks || [];
            if (textbooks.length > 0) {
              const latestTextbook = textbooks[0];
              const pdfRes = await fetch(`/api/textbook/pdf?textbookId=${latestTextbook.id}`);
              const pdfResult = await pdfRes.json();
              if (pdfResult.success && pdfResult.pdf) {
                const apiPdf = pdfResult.pdf as PDFData;
                if (apiPdf.full_text || apiPdf.fullText || (apiPdf.pages && apiPdf.pages.length > 0)) {
                  pdfData = apiPdf;
                }
              }
            }
          } catch (apiErr) {
            console.error('[Textbook] API 获取失败:', apiErr);
          }
        }

        if (!pdfData) {
          const { fallbackGetPDF } = await import('@/lib/localFallback');
          const fallbackData = await fallbackGetPDF(subjectId);
          if (fallbackData?.full_text) pdfData = fallbackData as PDFData;
        }

        if (!pdfData) {
          const directKey = `edumind_fallback_pdf_${subjectId}`;
          const directData = localStorage.getItem(directKey);
          if (directData) {
            const parsed = JSON.parse(directData);
            if (parsed.data?.full_text) pdfData = parsed.data as PDFData;
          }
        }

        if (!pdfData) {
          const pdfRaw = storage.get<any>(StorageKeys.PDF(subjectId));
          if (pdfRaw?.fullText || pdfRaw?.full_text) {
            pdfData = pdfRaw;
          }
        }

        if (!pdfData || (!pdfData.full_text && !pdfData.fullText)) {
          console.error('[Textbook] PDF 数据加载失败');
          setLoading(false);
          setLoadingPdf(false);
          return;
        }

        setLoadingPdf(false);
        const fullText = pdfData.full_text || pdfData.fullText || '';
        console.log('[Textbook] fullText 前100字符:', fullText.slice(0, 100));
        const content = getSectionContent(fullText, pdfData);
        console.log('[Textbook] getSectionContent 返回长度:', content.length, '前100字符:', content.slice(0, 100));

        if (!content || content.length < 100) {
          setLoading(false);
          return;
        }

        const chapterTitle = `第 ${chapterId} 章 第 ${sectionId} 节`;
        setGenerating(true);

        const response = await fetch('/api/textbook/auto-segment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            chapterTitle,
            pageRange: `${effectiveRange.start}-${effectiveRange.end}`,
            subjectId,
            sectionId,
            apiKey: settings?.deepseekKey
          })
        });

        const data = await response.json();
        if (data.success && data.sections?.length) {
          setSections(data.sections);
          // 恢复进度
          const savedProgress = localStorage.getItem(`textbook_progress_${subjectId}_${chapterId}_${sectionId}`);
          if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            if (progress.currentIndex < data.sections.length) {
              setCurrentIndex(progress.currentIndex);
              setCompletedSections(progress.completedSections || []);
            }
          }
        } else {
          // 无 AI 时按规则本地分段（每段也做长度控制）
          const rawParagraphs = content
            .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
            .split(/\n\s*\n/).filter(p => p.trim().length >= 20)
            .slice(0, 15);
          const splitLong = (text: string, maxLen = 200): string[] => {
            if (text.length <= maxLen) return [text];
            const sentences = text.split(/(?<=[。！？「」；])/);
            const result: string[] = [];
            let current = '';
            for (const s of sentences) {
              const t = s.trim();
              if (!t) continue;
              if (current.length + t.length <= maxLen) {
                current += t;
              } else {
                if (current) result.push(current.trim());
                current = t.length > maxLen ? t.slice(0, maxLen) : t;
              }
            }
            if (current.trim()) result.push(current.trim());
            return result.length ? result : [text];
          };
          const expanded: any[] = [];
          for (const p of rawParagraphs) {
            const parts = splitLong(p.trim());
            for (const part of parts) {
              expanded.push({
                id: expanded.length + 1,
                page: 3 + Math.floor(expanded.length / 3),
                original: part,
                explanation: '请结合上下文理解这段内容。',
                keyPoints: ['理解原文含义'],
                question: { text: '这段内容主要讲了什么？', options: ['A. 理解了', 'B. 部分理解', 'C. 不太理解', 'D. 完全不懂'], correct: 'A' }
              });
            }
          }
          setSections(expanded);
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
  }, [subjectId, chapterId, sectionId, settings?.deepseekKey]);

  // ============================================================
  // 每段加载时自动生成 AI 讲解和题目
  // ============================================================
  useEffect(() => {
    let cancelled = false;
    setTutorial(null);
    setSelectedOption(null);
    setIsOptionCorrect(null);
    setErrorExplanation('');
    setMastered(false);

    async function loadTutorial() {
      if (!currentSection?.original) {
        console.log('[Tutorial] currentSection 不存在或无 original，跳过，当前 sections 数量:', sections.length, 'currentIndex:', currentIndex);
        return;
      }

      console.log('[Tutorial] ===== 开始加载 =====');
      console.log('[Tutorial] 段落内容长度:', currentSection.original.length);
      console.log('[Tutorial] API Key 存在:', !!settings?.deepseekKey);
      console.log('[Tutorial] API Key 前10位:', settings?.deepseekKey?.slice(0, 10));

      setLoadingTutorial(true);
      try {
        console.log('[Tutorial] 调用 generateTutorialForParagraph...');
        const result = await generateTutorialForParagraph(
          currentSection.original,
          settings?.deepseekKey || ''
        );
        console.log('[Tutorial] AI 返回结果:', JSON.stringify(result));
        if (!cancelled) {
          setTutorial(result);
          console.log('[Tutorial] tutorial 状态已设置');
        }
      } catch (error) {
        console.error('[Tutorial] 加载失败:', error);
        if (!cancelled) {
          setTutorial({
            explanation: 'AI 讲解暂时不可用，请稍后重试。',
            question: '这段内容主要想表达什么？',
            options: ['A. 已理解', 'B. 部分理解', 'C. 还需再读'],
            correctIndex: 0,
            hint: '建议刷新页面后重试。'
          });
        }
      } finally {
        console.log('[Tutorial] finally 执行，关闭加载状态');
        if (!cancelled) {
          setLoadingTutorial(false);
        }
      }
    }

    loadTutorial();
    return () => { cancelled = true; };
  // 关键：加入 currentSection，使其在 sections 加载完成后自动触发
  // 之前缺少此依赖，导致 sections 更新后 loadTutorial 没有重新执行
  }, [currentIndex, settings?.deepseekKey, currentSection, sections.length]);

  // ============================================================
  // 交互处理
  // ============================================================
  const handleSelectOption = async (index: number) => {
    if (selectedOption !== null || !tutorial) return;
    setSelectedOption(index);
    const isCorrect = index === tutorial.correctIndex;
    setIsOptionCorrect(isCorrect);

    if (isCorrect) {
      setMastered(true);
      setErrorExplanation('');
      if (!completedSections.includes(currentSection.id)) {
        setCompletedSections(prev => [...prev, currentSection.id]);
      }
    } else {
      // 答错时记录错题
      const wrongQ: WrongQuestion = {
        id: `wq_t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        subjectId,
        chapterId,
        sectionId: sectionId,
        question: currentSection.original || tutorial.question || '课本还原题',
        options: tutorial.options,
        userAnswer: tutorial.options[index],
        correctAnswer: tutorial.options[tutorial.correctIndex],
        wrongReason: errorExplanation || '选项理解有误',
        knowledgePoint: '课本还原-' + sectionId,
        weakPoint: '课本还原',
        stepAnalysis: '',
        solutionSteps: '',
        difficulty: 'medium',
        createdAt: new Date().toISOString(),
        isMastered: false,
      };
      console.log('[课本还原-错题记录] 记录错题:', wrongQ);
      addWrongQuestion(wrongQ); // 异步存储，会同步到 Supabase

      setMastered(false);
      try {
        const res = await fetch('/api/textbook/explain-section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: currentSection.original,
            context: '',
            previousExplanation: tutorial.explanation,
            attemptCount: retryCount + 1,
            apiKey: settings?.deepseekKey || '',
            mode: 'error_explanation',
            wrongOption: tutorial.options[index],
            correctOption: tutorial.options[tutorial.correctIndex]
          })
        });
        const data = await res.json();
        setErrorExplanation(
          data.success && data.errorExplanation
            ? data.errorExplanation
            : tutorial.hint
        );
      } catch {
        setErrorExplanation(tutorial.hint);
      }
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setIsOptionCorrect(null);
    setErrorExplanation('');
    setRetryCount(prev => prev + 1);
  };

  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRetryCount(0);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setRetryCount(0);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    const progress = {
      currentIndex,
      totalSections: sections.length,
      completedSections,
      summary: sections.length > 0 && completedSections.length === sections.length
        ? '已完成全部段落'
        : `已完成 ${completedSections.length}/${sections.length} 个段落`,
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
      alert('学习记录已保存');
    }).catch(() => {
      alert('保存失败，请稍后重试');
    }).finally(() => setIsSaving(false));
  };

  const handleResetProgress = () => {
    if (!confirm('确定要从头开始吗？')) return;
    if (recordId) deleteLearningRecord(recordId);
    setRecordId(null);
    setCurrentIndex(0);
    setCompletedSections([]);
    setIsCompleted(false);
    startTimeRef.current = Date.now();
    setDuration(0);
    setRetryCount(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedSections([]);
    setIsCompleted(false);
    setRetryCount(0);
  };

  // ============================================================
  // 渲染
  // ============================================================
  if (loading || loadingPdf) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <BookOpen className="h-10 w-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            {generating ? 'AI正在分析课本...' : '正在加载课本内容...'}
          </h2>
          <p className="text-slate-500">
            {generating ? '正在按知识点分段，请稍候' : `正在提取第 ${startPage}-${endPage} 页`}
          </p>
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
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-700 dark:text-slate-300 mb-2">太棒了！</h2>
            <p className="text-xl text-slate-500 mb-2">你已完成本章还原课本学习</p>
            <p className="text-lg text-slate-400 mb-4">共学习 {sections.length} 个段落</p>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-lg font-medium text-green-600">掌握 {completedSections.length}</span>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} variant="outline" size="lg" className="gap-2">
                <RotateCcw className="h-5 w-5" />重新学习
              </Button>
              <Link href={`/subjects/${subjectId}`}><Button size="lg" className="gap-2">返回学科</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/subjects/${subjectId}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />返回
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">还原课本</h1>
                <p className="text-sm text-slate-500">第 {chapterId} 章 第 {sectionId} 节</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm">
                第 {currentIndex + 1} / {sections.length} 段
              </Badge>
              {completedSections.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>已掌握 {completedSections.length}</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />{isSaving ? '保存中...' : '保存'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetProgress}
                className="gap-2 text-red-500 hover:text-red-700 border-red-300 hover:border-red-500 hover:bg-red-50">
                <RotateCcw className="h-4 w-4" />重置
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 进度条 */}
      <div className="container mx-auto px-4 py-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {currentIndex + 1}
                </div>
                <span className="text-sm text-slate-500">当前 / 总数</span>
              </div>
              <span className="text-sm text-slate-500">
                第 {currentSection?.page || startPage} 页
              </span>
              {retryCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  重试 {retryCount} 次
                </Badge>
              )}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2.5 rounded-full" />
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {currentSection && (
          <>
            {/* 课本原文 */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span>课本原文</span>
                  <Badge variant="outline" className="text-slate-500 ml-2">
                    段落 {currentIndex + 1} / {sections.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                    {currentSection.original}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI 拆解讲解 + 选择题 */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500" />
              <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                  <span>AI 拆解讲解</span>
                  {loadingTutorial && <Badge variant="secondary" className="animate-pulse">生成中...</Badge>}
                  {isOptionCorrect === true && (
                    <Badge className="bg-green-100 text-green-700 border-green-300 ml-2">
                      <CheckCircle className="h-3 w-3 mr-1" />已掌握
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {tutorial ? (
                  <>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                        {tutorial.explanation}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <p className="font-medium text-slate-800 dark:text-slate-200 mb-3">
                        {tutorial.question}
                      </p>
                      <div className="space-y-2">
                        {tutorial.options.map((option, idx) => {
                          const isSelected = selectedOption === idx;
                          const isCorrectOption = idx === tutorial.correctIndex;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(idx)}
                              disabled={selectedOption !== null}
                              className={cn(
                                'w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200',
                                'flex items-center gap-3',
                                !isSelected && 'hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30',
                                isSelected && isCorrectOption && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                                isSelected && !isCorrectOption && 'border-red-500 bg-red-50 dark:bg-red-950/40',
                                selectedOption !== null && !isSelected && 'opacity-60 border-slate-200 dark:border-slate-700'
                              )}
                            >
                              <span className={cn(
                                'inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold',
                                isSelected && isCorrectOption && 'bg-emerald-500 text-white',
                                isSelected && !isCorrectOption && 'bg-red-500 text-white',
                                !isSelected && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              )}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className={cn(
                                'text-sm',
                                isSelected && isCorrectOption && 'text-emerald-700 dark:text-emerald-300',
                                isSelected && !isCorrectOption && 'text-red-700 dark:text-red-300'
                              )}>
                                {option.replace(/^[A-C]\.\s*/, '')}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* 答错后显示提示和重新答题按钮 */}
                      {isOptionCorrect === false && (
                        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-sm space-y-2">
                          <div className="text-amber-700 dark:text-amber-300">
                            {errorExplanation || tutorial.hint}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRetry}
                            className="border-amber-300 text-amber-700 hover:bg-amber-50"
                          >
                            再试一次
                          </Button>
                        </div>
                      )}

                      {/* 答对后显示提示 */}
                      {isOptionCorrect === true && (
                        <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>回答正确！点击「下一段」继续学习。</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-5/6" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 导航按钮（答对才解锁下一段） */}
            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                ← 上一段
              </Button>

              <Button
                size="lg"
                onClick={handleNext}
                disabled={!mastered}
                className={cn(
                  'gap-2 transition-all',
                  mastered ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30' : ''
                )}
              >
                {mastered
                  ? (currentIndex < sections.length - 1 ? '下一段 →' : '完成学习 ✓')
                  : '答对后解锁 →'
                }
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function TextbookLearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
      </div>
    }>
      <TextbookPageContent />
    </Suspense>
  );
}
