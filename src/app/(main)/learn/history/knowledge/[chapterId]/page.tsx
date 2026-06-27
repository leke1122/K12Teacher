'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Brain, Loader2, ChevronRight, Lightbulb, RefreshCw, Clock, MapPin, Users, BookOpen, AlertCircle, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { HISTORY_CHAPTERS } from '@/lib/historyData';
import { updateStepProgress } from '@/lib/historyProgress';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';

// 历史知识点类型
interface HistoryKnowledgePoint {
  id: string;
  name: string;
  type: 'event' | 'figure' | 'system' | 'concept';
  time: string;
  location: string;
  figures: string[];
  causes: string;
  process: string;
  effects: string;
  significance: string;
  memoryTip: string;
  relatedEvents: string[];
  source: string;
}

// 历史题目类型
interface HistoryQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const TYPE_LABELS: Record<string, string> = {
  event: '历史事件',
  figure: '历史人物',
  system: '政治制度',
  concept: '历史概念',
};

const TYPE_COLORS: Record<string, string> = {
  event: 'bg-red-100 text-red-700 border-red-200',
  figure: 'bg-blue-100 text-blue-700 border-blue-200',
  system: 'bg-purple-100 text-purple-700 border-purple-200',
  concept: 'bg-green-100 text-green-700 border-green-200',
};

function KnowledgePageContent() {
  const params = useParams();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : 'modern-china';
  const { settings } = useSettingsStore();

  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<HistoryKnowledgePoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<'definition' | 'quiz' | 'result'>('definition');
  const [question, setQuestion] = useState<HistoryQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const chapterInfo = HISTORY_CHAPTERS[chapterId as keyof typeof HISTORY_CHAPTERS] || {
    title: chapterId,
    subtitle: '',
  };

  useEffect(() => {
    updateStepProgress('history', chapterId, 'knowledge', 'in_progress');
    loadKnowledge();
  }, [chapterId]);

  const loadKnowledge = async (forceRefresh = false) => {
    if (forceRefresh) {
      setExtracting(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch('/api/history/knowledge/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chapterId, 
          forceRefresh,
          apiKey: settings?.deepseekKey,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || '加载失败');
      }
      setKnowledgeItems(json.data || []);
      setCached(json.cached || false);
      setCurrentIndex(0);
      setStage('definition');
      setQuestion(null);
      setSelectedAnswer(null);
      setShowHint(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
      setExtracting(false);
    }
  };

  const generateQuiz = async () => {
    if (!currentItem) return;
    setGeneratingQuiz(true);
    setQuestion(null);
    setSelectedAnswer(null);

    try {
      const res = await fetch('/api/history/knowledge/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knowledge: {
            name: currentItem.name,
            time: currentItem.time,
            location: currentItem.location,
            figures: currentItem.figures,
            effects: currentItem.effects,
            significance: currentItem.significance,
          },
          apiKey: settings?.deepseekKey,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || '生成题目失败');
      }
      setQuestion(json.data);
      setStage('quiz');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成题目失败');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setStage('result');
  };

  const handleNext = () => {
    if (currentIndex < knowledgeItems.length - 1) {
      setCurrentIndex((p) => p + 1);
      setStage('definition');
      setQuestion(null);
      setSelectedAnswer(null);
      setShowHint(false);
    } else {
      updateStepProgress('history', chapterId, 'knowledge', 'completed');
    }
  };

  const currentItem = knowledgeItems[currentIndex];
  const progress = knowledgeItems.length ? Math.round(((currentIndex + 1) / knowledgeItems.length) * 100) : 0;
  const isCorrect = selectedAnswer === question?.correct;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm text-muted-foreground">正在从教材中提取知识点...</p>
      </div>
    );
  }

  if (error && knowledgeItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
        <div className="w-full px-4 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </div>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={() => loadKnowledge()}>重试</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <div className="w-full px-4 py-4 space-y-4">
        {/* 顶部 */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Brain className="h-5 w-5 text-amber-500" />
              历史知识点学习 · {chapterInfo.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              基于教材提取，严格遵循史实
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => loadKnowledge(true)}
            disabled={extracting}
          >
            {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {extracting ? '提取中' : '重新提取'}
          </Button>
        </div>

        {knowledgeItems.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">暂无知识点，请先上传历史教材</p>
              <Button variant="outline" onClick={() => loadKnowledge(true)}>
                提取知识点
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 进度 */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      知识点 {currentIndex + 1} / {knowledgeItems.length}
                    </span>
                    {cached && (
                      <Badge variant="outline" className="text-xs bg-emerald-50">
                        已缓存
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${TYPE_COLORS[currentItem?.type] || 'bg-slate-100'}`}
                  >
                    {TYPE_LABELS[currentItem?.type] || '知识'}
                  </Badge>
                </div>
                <Progress value={progress} className="h-1.5" />
              </CardContent>
            </Card>

            {/* 知识点卡片 */}
            <Card className="bg-white">
              <CardHeader className="pb-3 pt-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{currentItem?.name}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground mt-1">来源：{currentItem?.source || '教材'}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 历史要素展示 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-slate-500">时间</span>
                    </div>
                    <p className="text-base text-slate-800">{currentItem?.time || '教材未明确提及'}</p>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-slate-500">地点</span>
                    </div>
                    <p className="text-base text-slate-800">{currentItem?.location || '教材未明确提及'}</p>
                  </div>
                </div>

                {currentItem?.figures && currentItem.figures.length > 0 && (
                  <div className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-slate-500">相关人物</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {currentItem.figures.map((figure, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {figure}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-medium text-amber-700 mb-1">📍 原因（背景）</p>
                  <p className="text-base text-slate-700">{currentItem?.causes || '教材未明确提及'}</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">📖 过程</p>
                  <p className="text-base text-slate-700">{currentItem?.process || '教材未明确提及'}</p>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">📍 影响</p>
                  <p className="text-base text-slate-700">{currentItem?.effects || '教材未明确提及'}</p>
                </div>

                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                  <p className="text-xs font-medium text-purple-700 mb-1">⭐ 历史意义</p>
                  <p className="text-base text-slate-700">{currentItem?.significance || '教材未明确提及'}</p>
                </div>

                {/* 记忆小贴士 */}
                {currentItem?.memoryTip && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700">💡 记忆小贴士</span>
                    </div>
                    <p className="text-base text-emerald-800 font-medium">
                      {currentItem.memoryTip}
                    </p>
                  </div>
                )}

                {/* 相关事件 */}
                {currentItem?.relatedEvents && currentItem.relatedEvents.length > 0 && (
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs font-medium text-slate-500 mb-2">🔗 相关历史事件</p>
                    <div className="flex flex-wrap gap-1">
                      {currentItem.relatedEvents.map((event, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-slate-50">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 练习题区域 */}
                {stage === 'definition' && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700">✏️ 趁热打铁</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={generateQuiz}
                        disabled={generatingQuiz}
                      >
                        {generatingQuiz ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        生成练习题
                      </Button>
                    </div>
                  </div>
                )}

                {/* 练习题 */}
                {stage === 'quiz' && question && (
                  <div className="pt-4 border-t space-y-4">
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                      <p className="text-sm font-medium text-indigo-800 mb-3">{question.question}</p>
                      <div className="space-y-2">
                        {question.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswerSelect(idx)}
                            disabled={selectedAnswer !== null}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg border text-sm transition-all",
                              selectedAnswer === idx
                                ? idx === question.correct
                                  ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                                  : "bg-red-100 border-red-300 text-red-800"
                                : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 结果反馈 */}
                {stage === 'result' && question && (
                  <div className={cn(
                    "rounded-lg p-4 space-y-3",
                    isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"
                  )}>
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                          <p className="text-sm font-semibold text-emerald-800">回答正确！</p>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <p className="text-sm font-semibold text-red-800">回答错误</p>
                        </>
                      )}
                    </div>
                    <div className="rounded-lg bg-white/50 p-3">
                      <p className="text-xs font-medium text-slate-500 mb-1">解析</p>
                      <p className="text-sm text-slate-700">{question.explanation}</p>
                    </div>
                    <Button size="sm" onClick={handleNext} className="gap-1">
                      {currentIndex < knowledgeItems.length - 1 ? (
                        <>下一个知识点 <ChevronRight className="h-4 w-4" /></>
                      ) : (
                        '完成学习'
                      )}
                    </Button>
                  </div>
                )}

                {/* 继续学习按钮（未生成题目时） */}
                {stage === 'definition' && !question && (
                  <div className="pt-4 border-t">
                    <Button size="sm" onClick={handleNext} className="gap-1">
                      {currentIndex < knowledgeItems.length - 1 ? (
                        <>下一个知识点 <ChevronRight className="h-4 w-4" /></>
                      ) : (
                        '完成学习'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 知识点导航 */}
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground mb-2">知识点列表</p>
                <div className="flex flex-wrap gap-1">
                  {knowledgeItems.map((item, idx) => (
                    <Button
                      key={item.id}
                      size="sm"
                      variant={idx === currentIndex ? 'default' : 'ghost'}
                      className="text-xs h-7"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setStage('definition');
                        setQuestion(null);
                        setSelectedAnswer(null);
                        setShowHint(false);
                      }}
                    >
                      {idx + 1}. {item.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function HistoryKnowledgePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <KnowledgePageContent />
    </Suspense>
  );
}
