'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, BookOpen, Loader2, AlertCircle, CheckCircle2,
  Eye, Search, Brain, PenTool, MessageCircle
} from 'lucide-react';
import { useTextbooks } from '@/hooks/useTextbooks';
import { useReadingProgress } from '@/lib/chineseReadingProgress';
import { ReadingStep1 } from '@/components/chinese/ReadingStep1';
import { ReadingStep2 } from '@/components/chinese/ReadingStep2';
import { ReadingStep3 } from '@/components/chinese/ReadingStep3';
import { ReadingStep4 } from '@/components/chinese/ReadingStep4';
import { ReadingStep5 } from '@/components/chinese/ReadingStep5';

// 五步的定义
const STEPS = [
  { id: 1, icon: Eye, label: '沉浸式初读', description: '完整阅读课文，感受文章魅力' },
  { id: 2, icon: Search, label: '主动探索', description: '查词解义，与AI对话' },
  { id: 3, icon: Brain, label: '结构梳理', description: '生成思维导图，理清脉络' },
  { id: 4, icon: PenTool, label: '迁移输出', description: '写作练习，深度内化' },
  { id: 5, icon: MessageCircle, label: '反思对话', description: '与AI对话，深化理解' },
];

function ReadingPageContent() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;

  const { activeTextbook, chapters, loading: textbooksLoading } = useTextbooks('chinese');
  const { progress, loading: progressLoading, startReading, updateStep, completeReading } =
    useReadingProgress(chapterId, chapters.find(c => String(c.chapterIndex) === chapterId)?.chapterTitle || '未命名课文');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 获取课文文本
  useEffect(() => {
    const loadText = async () => {
      if (!activeTextbook) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const { getTextbookPDF } = await import('@/lib/textbookStorage');
        const pdf = getTextbookPDF(activeTextbook.id);
        
        if (!pdf) {
          setError('未找到教材内容');
          setLoading(false);
          return;
        }

        // 找到对应章节的页面范围
        const chapter = chapters.find(c => String(c.chapterIndex) === chapterId);
        if (!chapter) {
          setError('未找到对应章节');
          setLoading(false);
          return;
        }

        // 获取该章节的文本内容
        const pageRange = chapter.sections?.[0]?.pages || chapter.pages;
        const startPage = pageRange?.fileStart || pageRange?.start || 1;
        const endPage = pageRange?.fileEnd || pageRange?.end || pdf.pages?.length || 1;

        // 提取该范围的文本
        let chapterText = '';
        if (pdf.pages && pdf.pages.length > 0) {
          pdf.pages.forEach(page => {
            const pageNum = Number(page.pageNumber);
            if (pageNum >= startPage && pageNum <= endPage) {
              chapterText += page.content + '\n';
            }
          });
        }

        if (!chapterText.trim()) {
          // 如果没有找到对应页面，使用全部文本（取前8000字）
          chapterText = pdf.fullText?.slice(0, 8000) || '';
        }

        setText(chapterText);

        // 如果没有进度记录，创建新的
        if (!progress && chapterText) {
          startReading();
        }
      } catch {
        setError('加载课文失败');
      } finally {
        setLoading(false);
      }
    };

    if (!textbooksLoading && activeTextbook) {
      loadText();
    }
  }, [activeTextbook, chapterId, chapters, progress, startReading, textbooksLoading]);

  // 处理步骤完成
  const handleStepComplete = useCallback((step: number, data: Record<string, unknown>) => {
    updateStep(step, data);
    if (step < 5) {
      setCurrentStep(step + 1);
    }
  }, [updateStep]);

  // 渲染当前步骤
  const renderStep = () => {
    const chapterTitle = chapters.find(c => String(c.chapterIndex) === chapterId)?.chapterTitle || '未命名课文';

    switch (currentStep) {
      case 1:
        return (
          <ReadingStep1
            text={text}
            chapterTitle={chapterTitle}
            chapterId={chapterId}
            progress={progress}
            onComplete={(data) => handleStepComplete(1, data)}
          />
        );
      case 2:
        return (
          <ReadingStep2
            text={text}
            chapterTitle={chapterTitle}
            chapterId={chapterId}
            progress={progress}
            onComplete={(data) => handleStepComplete(2, { notes: data.notes })}
          />
        );
      case 3:
        return (
          <ReadingStep3
            text={text}
            chapterTitle={chapterTitle}
            chapterId={chapterId}
            progress={progress}
            onComplete={(data) => handleStepComplete(3, data)}
          />
        );
      case 4:
        return (
          <ReadingStep4
            text={text}
            chapterTitle={chapterTitle}
            chapterId={chapterId}
            progress={progress}
            onComplete={(data) => handleStepComplete(4, data)}
          />
        );
      case 5:
        return (
          <ReadingStep5
            text={text}
            chapterTitle={chapterTitle}
            chapterId={chapterId}
            progress={progress}
            onComplete={(data) => {
              handleStepComplete(5, data);
              completeReading();
            }}
          />
        );
      default:
        return null;
    }
  };

  // 加载状态
  if (loading || progressLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !activeTextbook) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">{error || '请先上传语文教材'}</h2>
            <Button onClick={() => router.push('/subjects/chinese')} className="mt-4">
              返回语文学科页面
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedSteps = progress?.completedSteps || [];
  const progressPercent = (completedSteps.length / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/30">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/subjects/chinese')}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                <h1 className="font-semibold">
                  {chapters.find(c => String(c.chapterIndex) === chapterId)?.chapterTitle || '深度阅读'}
                </h1>
              </div>
            </div>
            
            {/* 步骤指示器 */}
            <div className="flex items-center gap-2">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    {idx > 0 && (
                      <div className={`w-8 h-0.5 ${isCompleted || isCurrent ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                    )}
                    <button
                      onClick={() => isCompleted && setCurrentStep(step.id)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors ${
                        isCurrent 
                          ? 'bg-indigo-500 text-white' 
                          : isCompleted 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Icon className="h-3.5 w-3.5" />
                      )}
                      <span className="text-xs font-medium hidden sm:inline">{step.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">
                当前：第 {currentStep}/5 步 · {STEPS[currentStep - 1].label}
              </span>
              <span className="text-xs text-slate-500">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="min-h-[600px]">
          {renderStep()}
        </div>
      </main>
    </div>
  );
}

export default function ChineseReadingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <ReadingPageContent />
    </Suspense>
  );
}
