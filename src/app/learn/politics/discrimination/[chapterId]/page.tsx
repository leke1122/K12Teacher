'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Scale, Loader2, ChevronRight, CheckCircle, MessageSquare, RotateCcw, Sparkles, Brain, Lightbulb, Target, Send, AlertTriangle, ArrowRight } from 'lucide-react';
import { POLITICS_CHAPTERS, CONCEPT_PAIRS, type ConceptPair } from '@/lib/politicsData';
import { cn } from '@/lib/utils';

type DiscStep = 1 | 2 | 3 | 4;
type StepStatus = 'locked' | 'active' | 'completed';

interface DiscState {
  step: DiscStep;
  answers: Partial<Record<DiscStep, string>>;
  feedback: Partial<Record<DiscStep, string>>;
  completed: boolean;
  pathShown: boolean;
  thinkingPath: string[];
}

const STEP_CONFIG = [
  { step: 1 as DiscStep, label: '判断', icon: Target, color: 'rose', desc: '观点正确吗？' },
  { step: 2 as DiscStep, label: '论证', icon: Lightbulb, color: 'amber', desc: '合理之处？' },
  { step: 3 as DiscStep, label: '辨析', icon: AlertTriangle, color: 'purple', desc: '错误/片面处？' },
  { step: 4 as DiscStep, label: '完善', icon: Brain, color: 'emerald', desc: '正确表述？' },
];

function DiscriminationPageContent() {
  const params = useParams();
  const router = useRouter();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : 'politics-compulsory-2';

  const [loading, setLoading] = useState(true);
  const [conceptPairs, setConceptPairs] = useState<ConceptPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [states, setStates] = useState<Record<string, DiscState>>({});
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chapterInfo = POLITICS_CHAPTERS.find((ch) => ch.id === chapterId) || {
    id: chapterId,
    title: chapterId,
    module: 'economics' as const,
    moduleName: '经济',
    topics: [],
  };

  const currentPair = conceptPairs[currentIndex];
  const currentState = currentPair ? (states[currentPair.id] || {
    step: 1 as DiscStep,
    answers: {},
    feedback: {},
    completed: false,
    pathShown: false,
    thinkingPath: [],
  }) : null;

  useEffect(() => {
    loadConceptPairs();
  }, [chapterId]);

  const loadConceptPairs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/politics/discrimination');
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        setConceptPairs(json.data);
        const initStates: Record<string, DiscState> = {};
        json.data.forEach((pair: ConceptPair) => {
          initStates[pair.id] = {
            step: 1 as DiscStep,
            answers: {},
            feedback: {},
            completed: false,
            pathShown: false,
            thinkingPath: [],
          };
        });
        setStates(initStates);
      } else {
        setConceptPairs([]);
      }
    } catch {
      setError('加载概念对失败');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = useCallback((pairId: string, step: DiscStep): StepStatus => {
    const state = states[pairId];
    if (!state) return 'locked';
    if (state.completed) return 'completed';
    if (state.step === step) return 'active';
    if (state.step > step) return 'completed';
    return 'locked';
  }, [states]);

  const handleSubmit = async () => {
    if (!currentPair || !input.trim() || submitting) return;
    setSubmitting(true);

    const currentStep = currentState?.step || 1;
    const prompt = buildPrompt(currentPair, currentStep, input);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: '你是一位政治教学导师，擅长引导式辩证思维训练。当学生分析不完整时，你会通过追问引导他深化思考，而不是直接给答案。坚持辩证思维：先肯定合理之处，再指出片面或错误之处，最后给出完整表述。',
        }),
      });
      const json = await res.json();
      const feedback = json.choices?.[0]?.message?.content || json.content || '感谢你的思考！';

      const nextStep = advanceStep(currentStep, input);

      const newAnswers = { ...(currentState?.answers || {}), [currentStep]: input };
      const newFeedback = { ...(currentState?.feedback || {}), [currentStep]: feedback };

      if (nextStep > 4) {
        const path = buildThinkingPath(newAnswers, currentPair);
        setStates((prev) => ({
          ...prev,
          [currentPair.id]: {
            ...prev[currentPair.id],
            step: 4 as DiscStep,
            answers: newAnswers,
            feedback: newFeedback,
            completed: true,
            pathShown: true,
            thinkingPath: path,
          },
        }));
      } else {
        setStates((prev) => ({
          ...prev,
          [currentPair.id]: {
            ...prev[currentPair.id],
            step: nextStep as DiscStep,
            answers: newAnswers,
            feedback: newFeedback,
          },
        }));
      }

      setInput('');
    } catch {
      const nextStep = Math.min((currentState?.step || 1) + 1, 4) as DiscStep;
      setStates((prev) => ({
        ...prev,
        [currentPair.id]: {
          ...prev[currentPair.id],
          step: nextStep,
          answers: { ...(currentState?.answers || {}), [currentState?.step || 1]: input },
          feedback: { ...(currentState?.feedback || {}), [currentState?.step || 1]: '网络错误，请重试。' },
        },
      }));
      setInput('');
    } finally {
      setSubmitting(false);
    }
  };

  const buildPrompt = (pair: ConceptPair, step: DiscStep, answer: string): string => {
    const base = `【概念辨析：${pair.concepts.map(c => c.name).join(' vs ')}】
待辨析命题：${pair.question}

`;
    const prompts: Record<number, string> = {
      1: `${base}学生第一步判断：${answer}
请给出引导式反馈：先肯定学生判断的大方向，然后指出需要进一步分析的角度。不要直接给出完整答案，而是通过追问引导学生深化思考。`,
      2: `${base}学生第二步（合理之处）：${answer}
请从"肯定合理→指出片面→引导完善"的辩证思维路径，给出引导式反馈。追问：除了这些合理之处，还有什么需要补充的吗？`,
      3: `${base}学生第三步（错误/片面之处）：${answer}
请给出引导式反馈：深化学生对问题复杂性的认识，追问他是否看到了问题的另一个方面。`,
      4: `${base}学生第四步（正确表述）：${answer}
请给出评价：是否准确完整？适当补充完善，形成完整的正确表述。`,
    };
    return prompts[step] || prompts[1];
  };

  const advanceStep = (current: DiscStep, answer: string): DiscStep => {
    const len = answer.trim().length;
    if (current === 1 && len > 3) return 2;
    if (current === 2 && len > 5) return 3;
    if (current === 3 && len > 5) return 4;
    return current;
  };

  const buildThinkingPath = (answers: Partial<Record<DiscStep, string>>, pair: ConceptPair): string[] => {
    return [
      `📌 命题：${pair.question}`,
      `✅ 第一步判断：${answers[1] || '（学生回答）'}`,
      `💡 合理之处：${answers[2] || '（学生回答）'}`,
      `⚠️ 片面/错误之处：${answers[3] || '（学生回答）'}`,
      `✨ 正确表述：${answers[4] || '（学生回答）'}`,
    ];
  };

  const resetPair = (pairId: string) => {
    setStates((prev) => ({
      ...prev,
      [pairId]: {
        step: 1 as DiscStep,
        answers: {},
        feedback: {},
        completed: false,
        pathShown: false,
        thinkingPath: [],
      },
    }));
    setInput('');
  };

  const completedCount = Object.values(states).filter((s) => s.completed).length;
  const totalCount = conceptPairs.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-pink-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/politics')} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                返回主页
              </Button>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">概念辨析</h1>
                <p className="text-xs text-slate-500">{chapterInfo.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-purple-50">
                进度：{completedCount}/{totalCount}
              </Badge>
              <Progress value={progress} className="w-24 h-2" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：概念对列表 */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="h-4 w-4 text-purple-500" />
                  概念辨析对
                  <Badge variant="outline" className="ml-auto text-xs">{totalCount}组</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {conceptPairs.map((pair, idx) => {
                  const state = states[pair.id];
                  const isCurrent = idx === currentIndex;
                  const isCompleted = state?.completed;
                  return (
                    <button
                      key={pair.id}
                      onClick={() => { setCurrentIndex(idx); setInput(''); }}
                      className={cn(
                        'w-full flex items-center gap-2 p-3 rounded-lg text-left transition-all',
                        isCurrent ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700' :
                        isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' :
                        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      )}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                          {pair.concepts[0]?.name} vs {pair.concepts[1]?.name}
                        </p>
                        <p className="text-xs text-slate-400">{pair.group}</p>
                      </div>
                      {isCurrent && !isCompleted && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs">当前</Badge>
                      )}
                    </button>
                  );
                })}
                {conceptPairs.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Scale className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">暂无概念对</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：辨析训练区 */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card className="rounded-xl">
                <CardContent className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500 mr-3" />
                  <span className="text-slate-500">加载概念对中...</span>
                </CardContent>
              </Card>
            ) : !currentPair ? (
              <Card className="rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Sparkles className="h-12 w-12 text-purple-300 mb-3" />
                  <p className="text-slate-500">还没有概念对数据</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 命题卡片 */}
                <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2 text-xs bg-purple-100 text-purple-700">待辨析命题</Badge>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                          {currentPair.question}
                        </h2>
                      </div>
                      {currentState?.completed && (
                        <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                          <CheckCircle className="h-3 w-3" /> 已完成
                        </Badge>
                      )}
                    </div>

                    {/* 概念对定义 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {currentPair.concepts.map((c, i) => (
                        <div key={i} className={cn(
                          'rounded-lg p-3',
                          i === 0 ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-rose-50 dark:bg-rose-950/30'
                        )}>
                          <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                            {i === 0 ? '概念 A' : '概念 B'}
                          </p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">{c.name}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{c.definition}</p>
                        </div>
                      ))}
                    </div>

                    {/* 核心区别提示 */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        核心区别
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{currentPair.concepts[0]?.core} vs {currentPair.concepts[1]?.core}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 四步引导法 */}
                <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Scale className="h-5 w-5 text-purple-500" />
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">辩证思维四步法</h3>
                      <div className="ml-auto flex gap-1">
                        {STEP_CONFIG.map((cfg) => {
                          const status = getStepStatus(currentPair.id, cfg.step);
                          return (
                            <div key={cfg.step} className={cn(
                              'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                              status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              status === 'active' ? 'bg-purple-100 text-purple-700' :
                              'bg-slate-100 text-slate-400'
                            )}>
                              {status === 'completed' ? <CheckCircle className="h-3 w-3" /> : <cfg.icon className="h-3 w-3" />}
                              <span className="hidden sm:inline">{cfg.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 步骤进度条 */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                      {STEP_CONFIG.map((cfg, idx) => {
                        const status = getStepStatus(currentPair.id, cfg.step);
                        const Icon = cfg.icon;
                        return (
                          <div key={cfg.step} className="flex items-center flex-shrink-0">
                            <div className={cn(
                              'flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[80px]',
                              status === 'completed' ? 'bg-emerald-50' :
                              status === 'active' ? 'bg-purple-50 border border-purple-200' :
                              'bg-slate-50 opacity-50'
                            )}>
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center',
                                status === 'completed' ? 'bg-emerald-500 text-white' :
                                status === 'active' ? 'bg-purple-500 text-white' :
                                'bg-slate-200 text-slate-400'
                              )}>
                                {status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                              </div>
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{cfg.label}</span>
                              <span className="text-xs text-slate-400 hidden sm:block text-center leading-tight">{cfg.desc}</span>
                            </div>
                            {idx < STEP_CONFIG.length - 1 && (
                              <ChevronRight className={cn('h-4 w-4 mx-1 flex-shrink-0', status === 'completed' ? 'text-emerald-400' : 'text-slate-300')} />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* 当前步骤提示 */}
                    {!currentState?.completed && (
                      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 mb-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <strong>第{currentState?.step || 1}步 · {STEP_CONFIG[(currentState?.step || 1) - 1]?.label}：</strong>
                          {currentState?.step === 1 && '这个命题正确吗？请先做出你的判断（正确/错误/片面）。'}
                          {currentState?.step === 2 && '这个命题的合理之处在哪里？请列举支持的理由。'}
                          {currentState?.step === 3 && '这个命题的错误或片面之处是什么？请具体分析。'}
                          {currentState?.step === 4 && '请给出你认为正确的完整表述。'}
                        </p>
                      </div>
                    )}

                    {/* AI 反馈 */}
                    {Object.values(currentState?.feedback || {}).some(Boolean) && (
                      <div className="space-y-2 mb-4">
                        {([1, 2, 3, 4] as DiscStep[]).map((step) => {
                          const fb = currentState?.feedback[step];
                          if (!fb) return null;
                          return (
                            <div key={step} className={cn(
                              'rounded-lg p-3 border',
                              step === 4 && currentState?.completed ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200' :
                              'bg-slate-50 dark:bg-slate-800 border-slate-200'
                            )}>
                              <div className="flex items-start gap-2 mb-1">
                                <Badge variant="outline" className="text-xs bg-white dark:bg-slate-700">{STEP_CONFIG[step - 1].label}反馈</Badge>
                              </div>
                              <div className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{fb}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* 思维路径图 */}
                    {currentState?.pathShown && currentState.thinkingPath.length > 0 && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4 mb-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">辩证思维路径</span>
                        </div>
                        <div className="space-y-2">
                          {currentState.thinkingPath.map((line, i) => (
                            <div key={i} className="flex items-start gap-2">
                              {i > 0 && i < currentState.thinkingPath.length && (
                                <div className="absolute left-5 w-px h-4 bg-purple-300 dark:bg-purple-700" style={{ marginTop: '-16px' }} />
                              )}
                              <div className="flex items-center gap-2 w-full">
                                <ArrowRight className="h-3 w-3 text-purple-400 flex-shrink-0" />
                                <p className="text-sm text-slate-700 dark:text-slate-300">{line}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 输入区域 */}
                    {!currentState?.completed ? (
                      <div className="space-y-3">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={
                            currentState?.step === 1 ? '请判断：正确 / 错误 / 片面，并说明理由...' :
                            currentState?.step === 2 ? '请列举命题的合理之处...' :
                            currentState?.step === 3 ? '请指出命题的错误或片面之处...' :
                            '请给出你认为正确的完整表述...'
                          }
                          className="min-h-[100px] resize-none"
                          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); }}
                        />
                        <div className="flex items-center gap-2">
                          <Button onClick={handleSubmit} disabled={!input.trim() || submitting} className="gap-1.5 bg-purple-500 hover:bg-purple-600">
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {submitting ? '思考中...' : '提交'}
                          </Button>
                          <span className="text-xs text-slate-400">Ctrl+Enter 快捷提交</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex-1 h-px bg-emerald-200" />
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">本组概念辨析完成！</span>
                        </div>
                        <div className="flex-1 h-px bg-emerald-200" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 底部操作 */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => resetPair(currentPair.id)} className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />
                    重新辨析
                  </Button>
                  <div className="flex gap-2">
                    {currentIndex > 0 && (
                      <Button variant="outline" size="sm" onClick={() => { setCurrentIndex(currentIndex - 1); setInput(''); }}>
                        上一组
                      </Button>
                    )}
                    {currentIndex < conceptPairs.length - 1 && (
                      <Button size="sm" onClick={() => { setCurrentIndex(currentIndex + 1); setInput(''); }} className="gap-1.5 bg-purple-500 hover:bg-purple-600">
                        下一组
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    }>
      <DiscriminationPageContent />
    </Suspense>
  );
}
