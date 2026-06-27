'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Loader2,
  BookOpen,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Target,
  Brain,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import type { AnalysisSource, AnalysisQuestion, AnalysisFeedback } from '@/types/history';

interface MaterialAnalysisProps {
  sourceId: string;
  source?: AnalysisSource | null;
  onComplete?: (score: number) => void;
}

type Stage = 'material' | 'answer' | 'feedback' | 'completed';

function getQuestionTypeLabel(type: AnalysisQuestion['type']): string {
  switch (type) {
    case 'event':
      return '事件识别';
    case 'view':
      return '观点提炼';
    case 'argument':
      return '论证分析';
    case 'conclusion':
      return '结论提炼';
    default:
      return '综合';
  }
}

function getQuestionTypeBadgeVariant(
  type: AnalysisQuestion['type'],
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'event':
      return 'default';
    case 'view':
      return 'secondary';
    case 'argument':
      return 'outline';
    case 'conclusion':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function MaterialAnalysis({ sourceId, source: sourceProp, onComplete }: MaterialAnalysisProps) {
  const [source, setSource] = useState<AnalysisSource | null>(sourceProp || null);
  const [loading, setLoading] = useState(!sourceProp);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<Stage>('material');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<AnalysisFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showHintIndex, setShowHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  const currentQuestion = useMemo(() => {
    if (!source?.questions?.length) return null;
    return source.questions[currentIndex] || null;
  }, [source, currentIndex]);

  const progress = useMemo(() => {
    if (!source?.questions?.length) return 0;
    return Math.round((currentIndex / source.questions.length) * 100);
  }, [currentIndex, source?.questions?.length]);

  useEffect(() => {
    if (!source && sourceId) {
      setLoading(true);
      fetch(`/api/history/analysis/generate?chapterId=${encodeURIComponent(sourceId)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setSource(json.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [sourceId, source]);

  const handleStart = () => {
    setStage('answer');
    setAnswer('');
    setFeedback(null);
    setShowHintIndex(0);
    setAttempts(0);
    setStartTime(Date.now());
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !source || !answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/history/analysis/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: source.id,
          questionId: currentQuestion.id,
          answer: answer.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(json.data.feedback);
        setAttempts((p) => p + 1);
        setScores((p) => [...p, json.data.feedback.score]);
        setStage('feedback');
      } else {
        alert(json.message || '提交失败，请重试');
      }
    } catch {
      alert('提交失败，请检查网络');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!source?.questions) return;
    if (currentIndex < source.questions.length - 1) {
      setCurrentIndex((p) => p + 1);
      setStage('material');
      setAnswer('');
      setFeedback(null);
      setShowHintIndex(0);
      setAttempts(0);
    } else {
      const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
      setCompleted(true);
      setStage('completed');
      onComplete?.(avg);
    }
  };

  const handleRetry = () => {
    setAnswer('');
    setFeedback(null);
    setStage('answer');
    setShowHintIndex(0);
  };

  const handleShowNextHint = () => {
    if (!currentQuestion) return;
    setShowHintIndex((p) => Math.min(p + 1, currentQuestion.hints.length));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-60 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          正在准备材料分析训练...
        </CardContent>
      </Card>
    );
  }

  if (!source || !currentQuestion) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          暂无材料分析题，请先从教材生成。
        </CardContent>
      </Card>
    );
  }

  if (completed || stage === 'completed') {
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    const maxScore = source.questions.length * 100;
    const percent = Math.round((avg / maxScore) * 100);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            练习完成
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-slate-800">{avg}</div>
            <div className="text-sm text-muted-foreground">
              总得分 / {maxScore} 分
              <div className="mt-1">
                <Badge variant={percent >= 80 ? 'default' : 'secondary'}>
                  {percent >= 80 ? '优秀' : percent >= 60 ? '良好' : '继续努力'}
                </Badge>
              </div>
            </div>
          </div>
          <Progress value={percent} className="h-2" />
          <p className="text-sm text-muted-foreground">
            已完成 {source.questions.length} 道题目，平均得分 {avg} 分。
          </p>
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => {
              setCurrentIndex(0);
              setStage('material');
              setAnswer('');
              setFeedback(null);
              setScores([]);
              setCompleted(false);
              setAttempts(0);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            重新练习
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalQuestions = source.questions?.length || 0;

  return (
    <div className="space-y-4">
      {/* 顶部进度 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="font-semibold">{source.title}</span>
              <Badge variant="outline" className="text-xs">
                {source.difficulty}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              第 {currentIndex + 1}/{totalQuestions} 题
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              当前题型：{getQuestionTypeLabel(currentQuestion.type)}
            </span>
            <span>
              {stage === 'answer' && `尝试次数：${attempts}/3`}
              {stage === 'feedback' && attempts > 0 && `最近得分：${scores[scores.length - 1]}`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 材料展示 */}
      {stage !== 'feedback' && (
        <Card className="bg-slate-50/80">
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              📄 材料阅读
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScrollArea className="h-40 rounded-md border bg-white p-3">
              <p className="text-sm leading-relaxed text-slate-700">
                {source.material}
              </p>
            </ScrollArea>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                来源：{source.source}
              </p>
              {stage === 'material' && (
                <Button size="sm" onClick={handleStart} className="gap-1">
                  开始答题 <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 答题区 */}
      {(stage === 'answer' || stage === 'feedback') && (
        <Card>
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              📝 问题 {currentIndex + 1}/{totalQuestions}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2">
              <Badge variant={getQuestionTypeBadgeVariant(currentQuestion.type)} className="mt-0.5">
                {getQuestionTypeLabel(currentQuestion.type)}
              </Badge>
              <p className="text-sm font-medium leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>

            {stage === 'answer' && (
              <div className="space-y-3">
                <Textarea
                  placeholder="请写下你的答案..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[120px]"
                  disabled={submitting}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1"
                      onClick={handleShowNextHint}
                      disabled={showHintIndex >= currentQuestion.hints.length}
                    >
                      <Lightbulb className="h-4 w-4" />
                      提示 {showHintIndex + 1}/{currentQuestion.hints.length}
                    </Button>
                    {showHintIndex > 0 && (
                      <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                        💡 {currentQuestion.hints[showHintIndex - 1]}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRetry}
                      disabled={!answer.trim()}
                    >
                      重置
                    </Button>
                    <Button size="sm" onClick={handleSubmit} disabled={!answer.trim() || submitting}>
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        '提交答案'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {stage === 'feedback' && feedback && (
              <div className="space-y-3">
                {/* 反馈卡片 */}
                <div
                  className={`rounded-lg border p-3 ${
                    feedback.isCorrect
                      ? 'border-emerald-200 bg-emerald-50'
                      : feedback.isPartial
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {feedback.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    ) : feedback.isPartial ? (
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold mb-1">
                        {feedback.isCorrect
                          ? '✅ 回答正确！'
                          : feedback.isPartial
                            ? '⚠️ 部分正确，继续完善'
                            : '❌ 还需要补充思考'}
                      </p>
                      {feedback.correctParts.length > 0 && (
                        <div className="mb-1">
                          <p className="text-xs font-medium text-emerald-700 mb-1">正确部分：</p>
                          <ul className="space-y-0.5">
                            {feedback.correctParts.map((part, idx) => (
                              <li key={idx} className="text-xs text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                {part}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {feedback.missingParts.length > 0 && (
                        <div className="mb-1">
                          <p className="text-xs font-medium text-red-700 mb-1">需要补充：</p>
                          <ul className="space-y-0.5">
                            {feedback.missingParts.map((part, idx) => (
                              <li key={idx} className="text-xs text-red-700 flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                {part}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-xs text-slate-600 mt-2">
                        💡 {feedback.guidance}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {feedback.encouragement}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 参考答案 */}
                {!feedback.isCorrect && (
                  <details className="rounded-lg border border-slate-200">
                    <summary className="cursor-pointer px-3 py-2 text-sm text-slate-600 hover:text-slate-800">
                      查看参考答案
                    </summary>
                    <div className="px-3 py-2 border-t bg-slate-50">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {currentQuestion.modelAnswer}
                      </p>
                    </div>
                  </details>
                )}

                {/* 操作按钮 */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    得分：{feedback.score}/100 · 尝试 {attempts}/3
                  </div>
                  <div className="flex items-center gap-2">
                    {!feedback.isCorrect && attempts < 3 && (
                      <Button size="sm" variant="outline" onClick={handleRetry} className="gap-1">
                        <RotateCcw className="h-4 w-4" />
                        重新回答
                      </Button>
                    )}
                    <Button size="sm" onClick={handleNext} className="gap-1">
                      {currentIndex < totalQuestions - 1 ? (
                        <>
                          下一题 <ChevronRight className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          完成 <Trophy className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 题目导航 */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Brain className="h-3.5 w-3.5" />
              题型分布：{source.questions.map((q) => getQuestionTypeLabel(q.type)).join(' → ')}
            </p>
            <div className="flex items-center gap-1">
              {source.questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-2 rounded-full ${
                    idx === currentIndex
                      ? 'bg-blue-500'
                      : idx < currentIndex
                        ? 'bg-emerald-400'
                        : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { MaterialAnalysis };
