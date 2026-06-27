'use client';

import { useState, Suspense, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, GraduationCap, BookOpen, ChevronLeft, ChevronRight,
  CheckCircle, AlertTriangle, Loader2, Save, RotateCcw, Trophy, Lock, Sparkles
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useHistoryStore } from '@/stores/historyStore';
import { fallbackGetPDF } from '@/lib/localFallback';
import { getTextbookPDF, getTextbookChapters } from '@/lib/textbookStorage';
import { extractSectionContent, resolvePageRange, findSectionContent, findNextSectionTitle, truncateAtSectionBoundary } from '@/lib/pdf-utils';
import { KnowledgeCard } from '@/components/learning/KnowledgeCard';
import { QuizQuestion, QuizQuestion as QuizQuestionType } from '@/components/learning/QuizQuestion';
import { LearningSummary } from '@/components/learning/LearningProgress';
import { getSectionPageRange, normalizeChapters } from '@/lib/chapterPageMapping';
import { LearningRecord, saveLearningRecord, getLearningRecord, deleteLearningRecord } from '@/services/supabaseService';
import { storage, StorageKeys } from '@/lib/storage';

interface KnowledgePointData {
  id: string | number;
  name: string;
  title?: string;
  type: string;
  description: string;
  content?: string;
  keyPoints?: string[];
}

interface KnowledgeExplanation {
  what: string;
  analogy: string;
  example: string;
  rawContent?: string;
}

interface PDFData {
  full_text?: string;
  fullText?: string;
  pages?: Array<{ pageNumber: number; content: string }>;
}

interface AnswerFeedback {
  correct: boolean;
  message: string;
  nextAction: 'next' | 'retry' | 'mark-weak';
  explanation?: string;
  hint?: string;
}

type LearnState = 'idle' | 'learning' | 'completed';

interface PointState {
  answered: boolean;
  correct: boolean;
  attemptCount: number;
  isWeak: boolean;
  explanation?: KnowledgeExplanation;
}

function KnowledgePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;
  const sectionId = params.sectionId as string;
  const textbookId = searchParams.get('textbookId') || '';
  const startPage = parseInt(searchParams.get('startPage') || '1', 10);
  const endPage = parseInt(searchParams.get('endPage') || '10', 10);
  const pageType = searchParams.get('pageType') || searchParams.get('pageRangeType') || 'file';
  const fileStart = searchParams.get('fileStart');
  const fileEnd = searchParams.get('fileEnd');

  const sectionTitle = searchParams.get('sectionTitle') || '';
  const subSectionTitle = searchParams.get('subSectionTitle') || '';

  const effectiveRange = pageType === 'printed' && fileStart && fileEnd
    ? { start: parseInt(fileStart, 10), end: parseInt(fileEnd, 10) }
    : { start: startPage, end: endPage };

  const { settings } = useSettingsStore();
  const addRecord = useHistoryStore((s) => s.addRecord);
  const { currentSubject } = useSubjectStore();

  const getSubjectName = (id: string) => {
    const map: Record<string, string> = { math: '数学', physics: '物理', chemistry: '化学', english: '英语', chinese: '语文', biology: '生物', geography: '地理', politics: '政治', history: '历史' };
    return map[id] || id;
  };

  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePointData[]>([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const resumeAttemptedRef = useRef(false);
  const [pdfData, setPdfData] = useState<PDFData | null>(null);
  const [chapters, setChapters] = useState<import('@/lib/pdf-utils').ChapterPages[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestionType | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const [pointStates, setPointStates] = useState<Record<string, PointState>>({});

  // 答题统计
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [learnState, setLearnState] = useState<LearnState>('idle');

  // 学习计时器（用 ref 便于重置）
  const startTimeRef = useRef(Date.now());
  const [duration, setDuration] = useState(0);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const resumeRecordId = searchParams.get('recordId');
  const shouldResume = searchParams.get('resume') === 'true';
  const [recordId, setRecordId] = useState<string | null>(resumeRecordId);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 恢复上次学习进度
  useEffect(() => {
    if (resumeAttemptedRef.current) return;
    resumeAttemptedRef.current = true;

    async function loadSavedProgress() {
      try {
        let restored = false;

        if (shouldResume && resumeRecordId) {
          try {
            const record = await getLearningRecord(resumeRecordId);
            console.log('[恢复进度] recordId:', resumeRecordId);
            console.log('[恢复进度] 找到记录:', record?.id);
            console.log('[恢复进度] 知识点数量:', record?.progress?.knowledgePoints?.length ?? 0);
            console.log('[恢复进度] 进度数据:', record?.progress);
            if (record?.progress?.knowledgePoints?.length) {
              const points: KnowledgePointData[] = (record.progress.knowledgePoints || []).map((kp: { id?: string | number; name: string; title?: string; type: string; description?: string; keyPoints?: string[] }, index: number) => ({
                id: typeof kp.id === 'number' ? String(kp.id) : (kp.id || String(index)),
                name: kp.name || kp.title || '未命名',
                type: kp.type || '概念',
                description: kp.description || '',
                keyPoints: kp.keyPoints || [],
              }));
              const savedIndex = record.progress.currentIndex || 0;

              const restoredStates: Record<string, PointState> = {};
              points.forEach(kp => {
                const historyItem = record.progress.history?.find((h: any) => h.knowledge === kp.name);
                restoredStates[kp.name] = {
                  answered: (record.progress.masteredList || []).includes(kp.name) || historyItem?.correct || false,
                  correct: historyItem?.correct || false,
                  attemptCount: historyItem?.attempts || 0,
                  isWeak: (record.progress.wrongList || []).includes(kp.name) || false
                };
              });

              setKnowledgePoints(points);
              setCurrentPointIndex(savedIndex);
              setPointStates(restoredStates);
              setRecordId(resumeRecordId);
              setShowResumeToast(true);
              setTimeout(() => setShowResumeToast(false), 4000);

              if (savedIndex >= (points.length - 1) && (record.progress.completed || 0) >= points.length) {
                setLearnState('completed');
              }

              // 自动生成当前知识点的讲解和题目
              const current = points[savedIndex];
              if (current) {
                const allNames = points.map(kp => kp.name);
                const currentIdx = savedIndex;
                // 讲解
                fetch(`/api/explain-knowledge`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    knowledge: { name: current.name, type: current.type, description: current.description },
                    pdfContext: '',
                    knowledgeIndex: currentIdx,
                    allKnowledgeNames: allNames,
                    attemptCount: restoredStates[current.name]?.attemptCount || 1,
                    apiKey: settings?.deepseekKey
                  })
                }).then(r => r.json()).then(data => {
                  if (data.success && data.data) {
                    setPointStates(prev => ({ ...prev, [current.name]: { ...prev[current.name], explanation: data.data as KnowledgeExplanation } }));
                  }
                }).catch(() => {});
                // 题目
                fetch(`/api/generate-question`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    currentKnowledge: { name: current.name, content: current.content || current.description || '', index: currentIdx },
                    allKnowledge: points.map((kp, i) => ({ name: kp.name, content: kp.content || kp.description || '', index: i })),
                    pdfContext: '',
                    attemptNumber: restoredStates[current.name]?.attemptCount || 1,
                    apiKey: settings?.deepseekKey
                  })
                }).then(r => r.json()).then(data => {
                  if (!data.error) {
                    setCurrentQuestion(data);
                    setAttemptCount(restoredStates[current.name]?.attemptCount || 1);
                    setFeedback(null);
                    setShowFeedback(false);
                  }
                }).catch(() => {});
              }

              restored = true;
            }
          } catch (err) {
            console.error('[恢复进度] 读取记录失败:', err);
          }
        }

        if (!restored) {
          if (knowledgePoints.length === 0) return;
          const saved = localStorage.getItem(`edumind_progress_${subjectId}_${chapterId}_${sectionId}`);
          if (saved) {
            const data = JSON.parse(saved);
            if (data?.progress?.currentIndex != null && data.progress.currentIndex < knowledgePoints.length) {
              const savedIndex = data.progress.currentIndex;
              const restoredStates: Record<string, PointState> = {};
              knowledgePoints.forEach(kp => {
                const historyItem = data.progress.history?.find((h: any) => h.knowledge === kp.name);
                restoredStates[kp.name] = {
                  answered: data.progress.completedList.includes(kp.name) || false,
                  correct: historyItem?.correct || false,
                  attemptCount: historyItem?.attempts || 0,
                  isWeak: (data.progress.wrongList || []).includes(kp.name) || false
                };
              });
              setCurrentPointIndex(savedIndex);
              setPointStates(restoredStates);
              setShowResumeToast(true);
              setTimeout(() => setShowResumeToast(false), 4000);

              const current = knowledgePoints[savedIndex];
              if (current) {
                const allNames = knowledgePoints.map(kp => kp.name);
                const currentIdx = savedIndex;
                fetch(`/api/explain-knowledge`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    knowledge: { name: current.name, type: current.type, description: current.description },
                    pdfContext: '',
                    knowledgeIndex: currentIdx,
                    allKnowledgeNames: allNames,
                    attemptCount: restoredStates[current.name]?.attemptCount || 1,
                    apiKey: settings?.deepseekKey
                  })
                }).then(r => r.json()).then(data => {
                  if (data.success && data.data) {
                    setPointStates(prev => ({ ...prev, [current.name]: { ...prev[current.name], explanation: data.data as KnowledgeExplanation } }));
                  }
                }).catch(() => {});
                fetch(`/api/generate-question`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    currentKnowledge: { name: current.name, content: current.content || current.description || '', index: currentIdx },
                    allKnowledge: knowledgePoints.map((kp, i) => ({ name: kp.name, content: kp.content || kp.description || '', index: i })),
                    pdfContext: '',
                    attemptNumber: restoredStates[current.name]?.attemptCount || 1,
                    apiKey: settings?.deepseekKey
                  })
                }).then(r => r.json()).then(data => {
                  if (!data.error) {
                    setCurrentQuestion(data);
                    setAttemptCount(restoredStates[current.name]?.attemptCount || 1);
                    setFeedback(null);
                    setShowFeedback(false);
                  }
                }).catch(() => {});
              }
            }
          }
        }
      } catch (e) {
        console.error('[Knowledge] 恢复进度失败:', e);
      }
    }
    loadSavedProgress();
  }, [knowledgePoints, subjectId, chapterId, sectionId, shouldResume, resumeRecordId, settings?.deepseekKey]);
  
  const contentRef = useRef<HTMLDivElement>(null);

  const currentPoint = knowledgePoints[currentPointIndex];
  const currentPointState = currentPoint ? pointStates[currentPoint.name] : null;
  const isChapter = sectionId === 'all';
  const progressPercent = knowledgePoints.length > 0 
    ? Math.round(((currentPointIndex + 1) / knowledgePoints.length) * 100) 
    : 0;
  
  const completedCount = Object.values(pointStates).filter(s => s.answered && s.correct).length;
  const weakCount = Object.values(pointStates).filter(s => s.isWeak).length;
  
  const canGoNext = currentPointState 
    ? (currentPointState.answered && currentPointState.correct) || currentPointState.isWeak || (currentPointState.attemptCount >= 2)
    : true;

  useEffect(() => {
    async function loadPdfContent() {
      console.log('[Knowledge] Loading PDF for subjectId:', subjectId, 'textbookId:', textbookId);
      setLoadingPdf(true);
      try {
        // 优先使用 textbookId 加载
        if (textbookId) {
          const textbookPdf = await getTextbookPDF(textbookId);
          if (textbookPdf?.fullText) {
            setPdfData({ full_text: textbookPdf.fullText });
            setLoadingPdf(false);
            return;
          }
        }

        const { fallbackGetPDF } = await import('@/lib/localFallback');
        const fallbackData = await fallbackGetPDF(subjectId);
        if (fallbackData?.full_text) {
          setPdfData(fallbackData as any);
          setLoadingPdf(false);
          return;
        }

        const directKey = `edumind_fallback_pdf_${subjectId}`;
        const directData = localStorage.getItem(directKey);
        if (directData) {
          const parsed = JSON.parse(directData);
          if (parsed.data?.full_text) {
            setPdfData(parsed.data as any);
            setLoadingPdf(false);
            return;
          }
        }

        const pdfRaw = storage.get<{ fullText?: string; full_text?: string } | null>(StorageKeys.PDF(subjectId));
        const content = typeof pdfRaw === 'string' ? pdfRaw : (pdfRaw?.fullText || pdfRaw?.full_text || '');
        if (content && content.length > 100) {
          setPdfData((pdfRaw as any) || { full_text: content });
          setLoadingPdf(false);
          return;
        }
      } catch (error) {
        console.error('[Knowledge] PDF load error:', error);
      } finally {
        setLoadingPdf(false);
      }
    }
    loadPdfContent();
  }, [subjectId, textbookId]);

  useEffect(() => {
    async function loadChapters() {
      try {
        // 优先使用 textbookId 加载
        if (textbookId) {
          const data = await getTextbookChapters(textbookId);
          if (data && data.length > 0) {
            setChapters(normalizeChapters(data));
            return;
          }
        }

        const { fallbackGetChapters } = await import('@/lib/localFallback');
        const data = await fallbackGetChapters(subjectId);
        if (Array.isArray(data)) {
          setChapters(normalizeChapters(data));
        }
      } catch (error) {
        console.error('[Knowledge] Chapters load error:', error);
      }
    }
    loadChapters();
  }, [subjectId, textbookId]);

  // 精确匹配键：优先子节标题，其次节标题（路径参数）
  // 例如：从 1.1.2 子节项点进来 → subSectionTitle="1.1.2", sectionId="1.1"
  const mappingKey = subSectionTitle || sectionId;

  const getSectionContent = useCallback(() => {
    if (!pdfData) return '';
    const fullText = pdfData.full_text || pdfData.fullText || '';
    if (!fullText) return '';

    // 优先级1：全局硬编码映射（subjectId + sectionId）
    const hardcoded = getSectionPageRange(subjectId, mappingKey);
    if (hardcoded) {
      const content = extractSectionContent(pdfData, hardcoded.startPage, hardcoded.endPage);
      if (content.length > 100) {
        console.log(`[Knowledge] 全局映射 ${subjectId}/${mappingKey} 第${hardcoded.startPage}-${hardcoded.endPage}页，${content.length}字符`);
        return truncateAtSectionBoundary(content, mappingKey);
      }
    }

    // 优先级2：按小节标题全文定位（subSectionTitle 优先，其次 sectionTitle）
    const searchTitle = subSectionTitle || sectionTitle || `第 ${chapterId} 章 第 ${sectionId} 节`;
    const nextTitle = subSectionTitle
      ? findNextSectionTitle(chapters, chapterId, sectionId, subSectionTitle)
      : findNextSectionTitle(chapters, chapterId, sectionId);

    const matched = findSectionContent(fullText, searchTitle, nextTitle);
    if (matched && matched.content.length > 100) {
      console.log(`[Knowledge] 按标题定位：${searchTitle}，长度=${matched.content.length}`);
      return truncateAtSectionBoundary(matched.content, mappingKey);
    }

    // 优先级3：URL 页码范围
    console.log('[Knowledge] 标题定位失败，回退到 URL 页码范围');
    const fallback = extractSectionContent(pdfData, effectiveRange.start, effectiveRange.end);
    return truncateAtSectionBoundary(fallback, mappingKey);
  }, [pdfData, chapters, subjectId, chapterId, sectionId, subSectionTitle, sectionTitle, effectiveRange.start, effectiveRange.end, mappingKey]);

  const fetchExplanation = useCallback(async (
    point: KnowledgePointData, 
    attemptNum: number = 1
  ): Promise<KnowledgeExplanation | null> => {
    try {
      const currentIdx = knowledgePoints.findIndex(kp => kp.name === point.name);
      const allNames = knowledgePoints.map(kp => kp.name);
      
      const response = await fetch('/api/explain-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knowledge: { name: point.name, type: point.type, description: point.description },
          pdfContext: getSectionContent(),
          knowledgeIndex: currentIdx,
          allKnowledgeNames: allNames,
          attemptCount: attemptNum,
          apiKey: settings?.deepseekKey
        })
      });

      if (!response.ok) return null;
      const result = await response.json();
      if (result.success && result.data) return result.data as KnowledgeExplanation;
      return null;
    } catch (error) {
      console.error('[Knowledge] Explanation error:', error);
      return null;
    }
  }, [settings?.deepseekKey, knowledgePoints, getSectionContent]);

  const handleGenerateKnowledgePoints = async () => {
    if (!settings?.deepseekKey) {
      alert('请先在设置中配置 DeepSeek API Key');
      return;
    }

    const content = getSectionContent();
    if (!content || content.length < 100) {
      alert('章节内容过短或未加载PDF');
      return;
    }

    const hardcoded = getSectionPageRange(subjectId, mappingKey);
    const apiStartPage = hardcoded?.startPage ?? effectiveRange.start;
    const apiEndPage = hardcoded?.endPage ?? effectiveRange.end;

    console.log(`[知识点提取] subjectId="${subjectId}" sectionId="${mappingKey}" 页码${apiStartPage}-${apiEndPage}，${content.length}字符`);

  const chapterTitle = isChapter ? `第 ${chapterId} 章` : `第 ${chapterId} 章 第 ${mappingKey} 节`;

    setGenerating(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch('/api/generate-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          apiKey: settings.deepseekKey,
          chapterTitle,
          startPage: apiStartPage,
          endPage: apiEndPage,
          sectionId: mappingKey,
          subjectId,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();

      if (data.error || !data.knowledgePoints?.length) {
        alert(data.error || '未提取到知识点');
        return;
      }

      const normalizedPoints: KnowledgePointData[] = data.knowledgePoints.map((kp: { id?: string | number; name?: string; title?: string; type?: string; description?: string; desc?: string; keyPoints?: string[] }, index: number) => ({
        id: typeof kp.id === 'number' ? String(kp.id) : (kp.id || String(index + 1)),
        name: kp.name || kp.title || `知识点${index + 1}`,
        type: kp.type || '概念',
        description: kp.description || kp.desc || '',
        keyPoints: kp.keyPoints || []
      }));

      const initialStates: Record<string, PointState> = {};
      normalizedPoints.forEach(kp => {
        initialStates[kp.name] = { answered: false, correct: false, attemptCount: 0, isWeak: false };
      });

      setKnowledgePoints(normalizedPoints);
      setPointStates(initialStates);
      setCurrentPointIndex(0);
      setLearnState('learning');
      setAttemptCount(1);
      setFeedback(null);
      setShowFeedback(false);
      
      fetchExplanation(normalizedPoints[0]).then(explanation => {
        if (explanation) {
          setPointStates(prev => ({ ...prev, [normalizedPoints[0].name]: { ...prev[normalizedPoints[0].name], explanation } }));
        }
      });
      
      generateQuestion(normalizedPoints[0]);
      alert(`✅ 成功提取 ${normalizedPoints.length} 个知识点！`);
    } catch (err) {
      console.error('[Knowledge] Generate error:', err);
      alert('生成失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setGenerating(false);
    }
  };

  const generateQuestion = async (point?: KnowledgePointData) => {
    const targetPoint = point || currentPoint;
    if (!targetPoint) return;
    
    setIsLoadingQuestion(true);
    setCurrentQuestion(null);
    
    try {
      const currentIdx = knowledgePoints.findIndex(kp => kp.name === targetPoint.name);
      
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentKnowledge: {
            name: targetPoint.name,
            content: targetPoint.content || targetPoint.description || '',
            index: currentIdx,
          },
          allKnowledge: knowledgePoints.map((kp, i) => ({
            name: kp.name,
            content: kp.content || kp.description || '',
            index: i,
          })),
          pdfContext: getSectionContent(),
          attemptNumber: attemptCount,
          apiKey: settings?.deepseekKey
        }),
      });

      const data = await response.json();
      if (!data.error) setCurrentQuestion(data);
    } catch (err) {
      console.error('[Knowledge] Generate question error:', err);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion) return;

    try {
      const response = await fetch('/api/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          userAnswer: answer,
          correctAnswer: currentQuestion.correctAnswer,
          knowledgeName: currentPoint?.name,
          attemptCount,
          pdfContext: getSectionContent(),
          explanation: currentQuestion.explanation,
          apiKey: settings?.deepseekKey
        }),
      });

      const result = await response.json();
      setFeedback(result);
      setShowFeedback(true);

      if (currentPoint) {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (result.correct) {
          setPointStates(prev => ({ ...prev, [currentPoint.name]: { ...prev[currentPoint.name], answered: true, correct: true, attemptCount: newAttemptCount, isWeak: false } }));
          setCorrectAttempts(prev => prev + 1);
        } else if (result.nextAction === 'mark-weak' || newAttemptCount > 2) {
          setPointStates(prev => ({ ...prev, [currentPoint.name]: { ...prev[currentPoint.name], answered: true, correct: false, attemptCount: newAttemptCount, isWeak: true } }));
        } else {
          setPointStates(prev => ({ ...prev, [currentPoint.name]: { ...prev[currentPoint.name], attemptCount: newAttemptCount } }));
        }
        setTotalAttempts(prev => prev + 1);
      }
    } catch (err) {
      console.error('[Knowledge] Answer error:', err);
    }
  };

  const handleRetry = () => {
    setShowFeedback(false);
    setFeedback(null);
    setAttemptCount(2);
    if (currentPoint) {
      fetchExplanation(currentPoint, 2).then(explanation => {
        if (explanation) setPointStates(prev => ({ ...prev, [currentPoint.name]: { ...prev[currentPoint.name], explanation } }));
      });
    }
    generateQuestion();
  };

  const handleNext = () => {
    if (!canGoNext) { alert('请先完成当前知识点的练习题！'); return; }
    if (currentPointIndex < knowledgePoints.length - 1) {
      const nextIndex = currentPointIndex + 1;
      const nextPoint = knowledgePoints[nextIndex];
      setCurrentPointIndex(nextIndex);
      setAttemptCount(1);
      setFeedback(null);
      setShowFeedback(false);
      setCurrentQuestion(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fetchExplanation(nextPoint).then(explanation => {
        if (explanation) setPointStates(prev => ({ ...prev, [nextPoint.name]: { ...prev[nextPoint.name], explanation } }));
      });
      setTimeout(() => generateQuestion(nextPoint), 300);
    } else {
      setLearnState('completed');
    }
  };

  const handleSelectPoint = (index: number) => {
    if (index === currentPointIndex) return;
    const currentState = currentPoint ? pointStates[currentPoint.name] : null;
    const needsAnswer = currentState && !currentState.answered && learnState === 'learning';
    if (needsAnswer) {
      if (confirm('当前知识点还未完成练习，确定要离开吗？')) { setCurrentPointIndex(index); resetPointState(index); }
    } else { setCurrentPointIndex(index); resetPointState(index); }
  };

  const resetPointState = (index: number) => {
    const point = knowledgePoints[index];
    if (point) {
      const existingState = pointStates[point.name];
      setPointStates(prev => ({ ...prev, [point.name]: { answered: false, correct: false, attemptCount: 0, isWeak: false, explanation: existingState?.explanation } }));
      setAttemptCount(1);
      setFeedback(null);
      setShowFeedback(false);
      setCurrentQuestion(null);
      setLearnState('learning');
      if (!existingState?.explanation) {
        fetchExplanation(point).then(explanation => { if (explanation) setPointStates(prev => ({ ...prev, [point.name]: { ...prev[point.name], explanation } })); });
      }
      setTimeout(() => generateQuestion(point), 300);
    }
  };

  const handleSaveProgress = async () => {
    setIsSaving(true);
    try {
      const completedList = Object.entries(pointStates)
        .filter(([, s]) => s.correct)
        .map(([name]) => name);
      const wrongList = Object.entries(pointStates)
        .filter(([, s]) => s.isWeak)
        .map(([name]) => name);
      const answers = Object.entries(pointStates)
        .filter(([, s]) => s.answered)
        .map(([name, s]) => ({
          knowledgeName: name,
          correct: s.correct,
          attempts: s.attemptCount,
          isWeak: s.isWeak,
          timestamp: new Date().toISOString(),
        }));

      const progressData = {
        total: knowledgePoints.length,
        completed: completedList.length,
        currentIndex: currentPointIndex,
        currentKnowledge: currentPoint?.name || '',
        completedList,
        wrongList,
        history: answers,
        knowledgePoints: knowledgePoints as any,
        masteredList: completedList,
        answers,
        totalAttempts,
        correctAttempts,
        correctRate: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
        summary: knowledgePoints.length > 0 && completedList.length === knowledgePoints.length ? '已完成全部知识点' : `已完成 ${completedList.length}/${knowledgePoints.length} 个知识点 | 正确率 ${totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0}%`,
      };

      const record: LearningRecord = {
        id: `k_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        subjectId,
        subjectName: getSubjectName(currentSubject || subjectId),
        textbookId: textbookId || undefined,
        chapterId,
        sectionId,
        sectionTitle,
        mode: 'KNOWLEDGE',
        duration,
        progress: progressData as any,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString('zh-CN'),
      };

      if (!recordId) {
        const newId = `k_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        record.id = newId;
        setRecordId(newId);
      }

      await saveLearningRecord(record);
      addRecord(record);

      localStorage.setItem(`edumind_progress_${subjectId}_${chapterId}_${sectionId}`, JSON.stringify(record));
      alert('✅ 学习记录已保存');
    } catch (err) {
      console.error('[Knowledge] Save error:', err);
      alert('保存失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetProgress = () => {
    if (!confirm('确定要从头开始学习吗？当前进度将被清除。')) return;

    if (recordId) {
      deleteLearningRecord(recordId);
      setRecordId(null);
    }

    const initialStates: Record<string, PointState> = {};
    knowledgePoints.forEach(kp => { initialStates[kp.name] = { answered: false, correct: false, attemptCount: 0, isWeak: false }; });

    setPointStates(initialStates);
    setCurrentPointIndex(0);
    setLearnState('learning');
    setAttemptCount(1);
    setFeedback(null);
    setShowFeedback(false);
    setCurrentQuestion(null);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    startTimeRef.current = Date.now();
    setDuration(0);

    if (knowledgePoints[0]) {
      fetchExplanation(knowledgePoints[0]).then(explanation => {
        if (explanation) {
          setPointStates(prev => ({ ...prev, [knowledgePoints[0].name]: { ...prev[knowledgePoints[0].name], explanation } }));
        }
      });
      generateQuestion(knowledgePoints[0]);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewWeak = () => {
    const weakPoints = knowledgePoints.filter(kp => pointStates[kp.name]?.isWeak);
    if (weakPoints.length === 0) { alert('没有薄弱项需要复习'); return; }
    const firstWeakIndex = knowledgePoints.findIndex(kp => kp.name === weakPoints[0].name);
    if (firstWeakIndex >= 0) { setCurrentPointIndex(firstWeakIndex); resetPointState(firstWeakIndex); }
  };

  const handleRestart = () => {
    const initialStates: Record<string, PointState> = {};
    knowledgePoints.forEach(kp => { initialStates[kp.name] = { answered: false, correct: false, attemptCount: 0, isWeak: false }; });
    setPointStates(initialStates);
    setCurrentPointIndex(0);
    setLearnState('learning');
    setAttemptCount(1);
    setFeedback(null);
    setShowFeedback(false);
    setCurrentQuestion(null);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    fetchExplanation(knowledgePoints[0]).then(explanation => { if (explanation) setPointStates(prev => ({ ...prev, [knowledgePoints[0].name]: { ...prev[knowledgePoints[0].name], explanation } })); });
    generateQuestion(knowledgePoints[0]);
  };

  const getItemStatus = (name: string, index: number) => {
    const state = pointStates[name];
    if (index === currentPointIndex) return 'current';
    if (state?.correct) return 'completed';
    if (state?.isWeak) return 'weak';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/subjects/${subjectId}`} className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <ArrowLeft className="h-5 w-5" />返回
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">{isChapter ? `第 ${chapterId} 章` : `第 ${chapterId} 章 第 ${sectionId} 节`}</h1>
                <p className="text-sm text-slate-500">{knowledgePoints.length > 0 ? `共 ${knowledgePoints.length} 个知识点` : '点击生成知识点开始学习'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/learn/math/visualize/function`}>
                <Button variant="outline" size="sm" className="gap-1.5 border-amber-200 text-amber-600 hover:bg-amber-50">
                  <Sparkles className="h-4 w-4" />
                  可视化
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 继续学习提示 */}
      {showResumeToast && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <span className="text-sm text-indigo-700 dark:text-indigo-300">
                继续上次学习：第 {currentPointIndex + 1} / {knowledgePoints.length} 个知识点
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowResumeToast(false)} className="text-indigo-600">
              知道了
            </Button>
          </div>
        </div>
      )}

      {knowledgePoints.length > 0 && (
        <div className="container mx-auto px-4 py-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">{currentPointIndex + 1}</div>
                  <div><p className="text-sm text-slate-500">当前 / 总数</p><p className="text-lg font-bold text-slate-800 dark:text-slate-200">{currentPointIndex + 1} / {knowledgePoints.length}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white"><CheckCircle className="w-5 h-5" /></div>
                  <div><p className="text-sm text-slate-500">已掌握</p><p className="text-lg font-bold text-green-600">{completedCount}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg', weakCount > 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-slate-200 dark:bg-slate-700')}><AlertTriangle className="w-5 h-5" /></div>
                  <div><p className="text-sm text-slate-500">薄弱项</p><p className={cn('text-lg font-bold', weakCount > 0 ? 'text-amber-600' : 'text-slate-400')}>{weakCount}</p></div>
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <div className="flex items-center justify-between mb-1.5"><span className="text-sm text-slate-500">学习进度</span><span className="text-sm font-medium text-slate-700 dark:text-slate-300">{progressPercent}%</span></div>
                <Progress value={progressPercent} className="h-3 rounded-full" />
              </div>
              <Button variant="outline" size="sm" onClick={handleSaveProgress} disabled={isSaving} className="rounded-xl gap-2"><Save className="h-4 w-4" />{isSaving ? '保存中...' : '保存'}</Button>
              <Button variant="outline" size="sm" onClick={handleResetProgress} className="rounded-xl gap-2 text-red-500 hover:text-red-700 border-red-300 hover:border-red-500 hover:bg-red-50"><RotateCcw className="h-4 w-4" />从头开始学</Button>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 xl:col-span-3">
            <Card className="sticky top-36 border-0 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg"><BookOpen className="h-5 w-5 text-indigo-500" />知识点清单{knowledgePoints.length > 0 && <Badge variant="outline" className="ml-auto">{knowledgePoints.length}个</Badge>}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {knowledgePoints.length === 0 ? (
                  <div className="p-6 text-center">
                    <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">还没有知识点</p>
                    <Button onClick={handleGenerateKnowledgePoints} disabled={generating || loadingPdf} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                      {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />生成中...</> : <><GraduationCap className="h-4 w-4 mr-2" />生成知识点</>}
                    </Button>
                  </div>
                ) : (
                  <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                    {knowledgePoints.map((kp, index) => {
                      const status = getItemStatus(kp.name, index);
                      const isLocked = learnState === 'learning' && status === 'pending' && index > currentPointIndex + 1;
                      return (
                        <button key={kp.id} onClick={() => handleSelectPoint(index)} disabled={isLocked} className={cn('w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 transition-all', status === 'current' && 'bg-indigo-50 dark:bg-indigo-950/30 border-l-4 border-l-indigo-500', status !== 'current' && !isLocked && 'hover:bg-slate-50 dark:hover:bg-slate-800/50', isLocked && 'opacity-50 cursor-not-allowed')}>
                          <div className="flex items-center gap-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold relative', status === 'completed' && 'bg-green-500 text-white', status === 'weak' && 'bg-amber-500 text-white', status === 'current' && 'bg-indigo-500 text-white', status === 'pending' && 'bg-slate-100 dark:bg-slate-800 text-slate-500', isLocked && 'bg-slate-100 dark:bg-slate-800 text-slate-300')}>
                              {status === 'completed' ? <CheckCircle className="w-4 h-4" /> : status === 'weak' ? <AlertTriangle className="w-4 h-4" /> : status === 'current' ? <span className="text-xs">进行中</span> : isLocked ? <Lock className="w-3 h-3" /> : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn('text-sm font-medium truncate', status === 'current' ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300')}>{kp.name}</p>
                              <Badge variant="outline" className="text-xs mt-0.5">{kp.type}</Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-8 xl:col-span-9" ref={contentRef}>
            {!currentPoint ? (
              <Card className="border-0 shadow-xl">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <GraduationCap className="h-20 w-20 text-slate-300 mb-6" />
                  <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">准备好开始学习了吗？</h2>
                  <p className="text-slate-500 mb-8 text-center max-w-md">点击左侧"生成知识点"按钮，AI会帮你从教材中提取本章节的知识点</p>
                  <Button onClick={handleGenerateKnowledgePoints} disabled={generating || loadingPdf} size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-lg px-8 h-14 rounded-xl shadow-lg shadow-indigo-500/30">
                    {generating ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />正在生成知识点...</> : <><GraduationCap className="h-5 w-5 mr-2" />开始生成知识点</>}
                  </Button>
                </CardContent>
              </Card>
            ) : learnState === 'completed' ? (
              <LearningSummary summary={{ totalKnowledge: knowledgePoints.length, completedCount, weakCount, correctRate: knowledgePoints.length > 0 ? Math.round((completedCount / knowledgePoints.length) * 100) : 0, weakItems: knowledgePoints.filter(kp => pointStates[kp.name]?.isWeak).map(kp => kp.name) }} onRestart={handleRestart} onReviewWeak={handleReviewWeak} />
            ) : (
              <div className="space-y-6">
                <KnowledgeCard knowledge={currentPoint as any} explanation={currentPointState?.explanation} index={currentPointIndex} isCompleted={currentPointState?.correct} isWeak={currentPointState?.isWeak} />
                <QuizQuestion knowledgeName={currentPoint.name} question={currentQuestion} isLoading={isLoadingQuestion} onAnswer={handleAnswer} onRetry={handleRetry} onNext={canGoNext ? handleNext : undefined} attemptCount={attemptCount} feedback={feedback} isLast={currentPointIndex >= knowledgePoints.length - 1} />
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => { if (currentPointIndex > 0) { const prevIndex = currentPointIndex - 1; const prevState = pointStates[knowledgePoints[prevIndex].name]; if (prevState && !prevState.answered) { if (confirm('上一个知识点还未完成，确定要回去吗？')) { setCurrentPointIndex(prevIndex); resetPointState(prevIndex); } } else { setCurrentPointIndex(prevIndex); resetPointState(prevIndex); } } }} disabled={currentPointIndex === 0} className="rounded-xl gap-2"><ChevronLeft className="h-4 w-4" />上一个</Button>
                      <Button onClick={handleNext} disabled={!canGoNext} className={cn('flex-1 rounded-xl gap-2', canGoNext ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600' : 'bg-slate-200 dark:bg-slate-700 cursor-not-allowed')}>
                        {currentPointIndex >= knowledgePoints.length - 1 ? <><Trophy className="h-4 w-4" />完成学习</> : <>{canGoNext ? '下一个知识点' : <><Lock className="h-4 w-4" />请先完成练习</>}<ChevronRight className="h-4 w-4" /></>}
                      </Button>
                    </div>
                    {!canGoNext && currentPointState && <p className="text-center text-sm text-slate-500 mt-2">💡 完成练习后即可继续</p>}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-indigo-500" /></div>}>
      <KnowledgePageContent />
    </Suspense>
  );
}
