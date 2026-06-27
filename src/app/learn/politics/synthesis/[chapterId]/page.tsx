'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Loader2, ChevronRight, CheckCircle, MessageSquare, RotateCcw, Sparkles, TrendingUp, Landmark, BookOpen, Send, Eye, EyeOff, BarChart3, Target, Lightbulb, Scale, Shield } from 'lucide-react';
import { POLITICS_CHAPTERS, SYNTHESIS_CASES, type SynthesisCase } from '@/lib/politicsData';
import { cn } from '@/lib/utils';

type AngleKey = 'economic' | 'political' | 'philosophical';
type AngleStatus = 'locked' | 'active' | 'completed';

interface SynthesisState {
  angles: Record<AngleKey, { answer: string; feedback: string }>;
  submitted: boolean;
  showFramework: boolean;
  showAnswer: boolean;
  completed: boolean;
}

const ANGLE_CONFIG: Record<AngleKey, { label: string; icon: typeof TrendingUp; color: string; desc: string }> = {
  economic: { label: '经济视角', icon: TrendingUp, color: 'emerald', desc: '新发展理念、供给侧改革' },
  political: { label: '政治视角', icon: Landmark, color: 'blue', desc: '政府职能、党的领导' },
  philosophical: { label: '哲学视角', icon: BookOpen, color: 'purple', desc: '矛盾分析、辩证思维' },
};

function SynthesisPageContent() {
  const params = useParams();
  const router = useRouter();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : 'politics-compulsory-2';

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<SynthesisCase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [states, setStates] = useState<Record<string, SynthesisState>>({});
  const [inputs, setInputs] = useState<Record<AngleKey, string>>({ economic: '', political: '', philosophical: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submittingAll, setSubmittingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chapterInfo = POLITICS_CHAPTERS.find((ch) => ch.id === chapterId) || {
    id: chapterId,
    title: chapterId,
    module: 'economics' as const,
    moduleName: '经济',
    topics: [],
  };

  const currentCase = cases[currentIndex];
  const currentState = currentCase ? (states[currentCase.id] || {
    angles: {
      economic: { answer: '', feedback: '' },
      political: { answer: '', feedback: '' },
      philosophical: { answer: '', feedback: '' },
    },
    submitted: false,
    showFramework: false,
    showAnswer: false,
    completed: false,
  }) : null;

  const allAnglesCompleted = currentState && Object.values(currentState.angles).every((a) => a.answer.trim().length > 10);
  const completedAnglesCount = currentState ? Object.values(currentState.angles).filter((a) => a.answer.trim().length > 10).length : 0;

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/politics/synthesis');
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        setCases(json.data);
        const initStates: Record<string, SynthesisState> = {};
        json.data.forEach((c: SynthesisCase) => {
          initStates[c.id] = {
            angles: { economic: { answer: '', feedback: '' }, political: { answer: '', feedback: '' }, philosophical: { answer: '', feedback: '' } },
            submitted: false,
            showFramework: false,
            showAnswer: false,
            completed: false,
          };
        });
        setStates(initStates);
      } else {
        setCases([]);
      }
    } catch {
      setError('加载案例失败');
    } finally {
      setLoading(false);
    }
  };

  const getAngleStatus = (caseId: string, angle: AngleKey): AngleStatus => {
    const state = states[caseId];
    if (!state) return 'locked';
    if (state.angles[angle].answer.trim().length > 10) return 'completed';
    return 'active';
  };

  const handleAngleSubmit = async (angle: AngleKey) => {
    if (!currentCase || !inputs[angle].trim() || submitting) return;
    setSubmitting(true);

    const question = currentCase.questions.find((q) => q.angle.includes(ANGLE_CONFIG[angle].label.replace('视角', '')));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `【综合案例分析 · ${ANGLE_CONFIG[angle].label}】
案例：${currentCase.title}
材料：${currentCase.scenario}
问题：${question?.question || ANGLE_CONFIG[angle].label}

学生回答：${inputs[angle]}

请给出引导式反馈：肯定学生分析中的合理之处，指出需要深入的方向，追问关键问题。不要直接给完整答案。`,
          }],
          systemPrompt: '你是一位政治教学导师，擅长引导式综合分析训练。当学生分析不够深入时，通过追问引导深化思考；当分析偏离方向时，温和地指出思考方向。坚持"理论联系实际"的原则。',
        }),
      });
      const json = await res.json();
      const feedback = json.choices?.[0]?.message?.content || json.content || '感谢你的分析！';

      setStates((prev) => ({
        ...prev,
        [currentCase.id]: {
          ...prev[currentCase.id],
          angles: {
            ...prev[currentCase.id].angles,
            [angle]: { answer: inputs[angle], feedback },
          },
        },
      }));

      setInputs((prev) => ({ ...prev, [angle]: '' }));
    } catch {
      setStates((prev) => ({
        ...prev,
        [currentCase.id]: {
          ...prev[currentCase.id],
          angles: {
            ...prev[currentCase.id].angles,
            [angle]: { answer: inputs[angle], feedback: '网络错误，请重试。' },
          },
        },
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!currentCase || !allAnglesCompleted || submittingAll) return;
    setSubmittingAll(true);

    const allAnalysis = Object.entries(currentState?.angles || {})
      .map(([angle, data]) => `${ANGLE_CONFIG[angle as AngleKey].label}：${data.answer}`)
      .join('\n\n');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `【综合应用分析评估】
案例：${currentCase.title}
材料：${currentCase.scenario}

学生完整分析：
${allAnalysis}

请从以下三个维度评估学生分析：
1. 多角度覆盖度：是否涵盖经济、政治、哲学等多个角度？
2. 理论深度：理论运用是否准确、深刻？
3. 结论严谨性：结论是否有理有据、逻辑清晰？

请给出总体评价和提升建议。`,
          }],
          systemPrompt: '你是一位政治教学评估专家，从多角度覆盖度、理论深度、结论严谨性三个维度评估学生的综合分析，给出鼓励性评价和具体提升建议。',
        }),
      });
      const json = await res.json();
      const feedback = json.choices?.[0]?.message?.content || json.content || '分析完成！';

      setStates((prev) => ({
        ...prev,
        [currentCase.id]: {
          ...prev[currentCase.id],
          submitted: true,
          showAnswer: true,
          completed: true,
          angles: {
            ...prev[currentCase.id].angles,
            economic: { ...prev[currentCase.id].angles.economic, feedback: prev[currentCase.id].angles.economic.feedback + '\n\n--- 综合评估 ---\n' + feedback },
          },
        },
      }));
    } catch {
      setStates((prev) => ({
        ...prev,
        [currentCase.id]: {
          ...prev[currentCase.id],
          submitted: true,
          showAnswer: true,
          completed: true,
        },
      }));
    } finally {
      setSubmittingAll(false);
    }
  };

  const toggleFramework = () => {
    if (!currentCase) return;
    setStates((prev) => ({
      ...prev,
      [currentCase.id]: {
        ...prev[currentCase.id],
        showFramework: !prev[currentCase.id].showFramework,
      },
    }));
  };

  const resetCase = (caseId: string) => {
    setStates((prev) => ({
      ...prev,
      [caseId]: {
        angles: { economic: { answer: '', feedback: '' }, political: { answer: '', feedback: '' }, philosophical: { answer: '', feedback: '' } },
        submitted: false,
        showFramework: false,
        showAnswer: false,
        completed: false,
      },
    }));
    setInputs({ economic: '', political: '', philosophical: '' });
  };

  const completedCount = Object.values(states).filter((s) => s.completed).length;
  const totalCount = cases.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30">
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
                <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">综合应用</h1>
                <p className="text-xs text-slate-500">{chapterInfo.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-emerald-50">
                进度：{completedCount}/{totalCount}
              </Badge>
              <Progress value={progress} className="w-24 h-2" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：案例列表 */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Scale className="h-4 w-4 text-emerald-500" />
                  综合案例
                  <Badge variant="outline" className="ml-auto text-xs">{totalCount}个</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cases.map((c, idx) => {
                  const state = states[c.id];
                  const isCurrent = idx === currentIndex;
                  const isCompleted = state?.completed;
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setCurrentIndex(idx); setInputs({ economic: '', political: '', philosophical: '' }); }}
                      className={cn(
                        'w-full flex items-center gap-2 p-3 rounded-lg text-left transition-all',
                        isCurrent ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700' :
                        isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' :
                        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      )}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-2">{c.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {c.modules.map((m) => (
                            <Badge key={m} variant="outline" className="text-xs py-0 px-1">{m}</Badge>
                          ))}
                        </div>
                      </div>
                      {isCurrent && !isCompleted && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs flex-shrink-0">当前</Badge>
                      )}
                    </button>
                  );
                })}
                {cases.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Scale className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">暂无案例</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：案例分析区 */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card className="rounded-xl">
                <CardContent className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mr-3" />
                  <span className="text-slate-500">加载案例中...</span>
                </CardContent>
              </Card>
            ) : !currentCase ? (
              <Card className="rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Sparkles className="h-12 w-12 text-emerald-300 mb-3" />
                  <p className="text-slate-500">还没有案例数据</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 案例材料卡片 */}
                <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="mb-2 text-xs bg-emerald-100 text-emerald-700">
                          综合案例 · {currentCase.modules.join('+')}
                        </Badge>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{currentCase.title}</h2>
                      </div>
                      {currentState?.completed && (
                        <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                          <CheckCircle className="h-3 w-3" /> 已完成
                        </Badge>
                      )}
                    </div>

                    {/* 材料内容 */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="materials">
                        <AccordionTrigger className="text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-emerald-500" />
                            <span>案例材料</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{currentCase.scenario}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* 三个角度问题 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                      {currentCase.questions.map((q, i) => {
                        const angleKey = (['economic', 'political', 'philosophical'] as AngleKey[])[i];
                        const config = ANGLE_CONFIG[angleKey];
                        const status = getAngleStatus(currentCase.id, angleKey);
                        return (
                          <div key={angleKey} className={cn(
                            'rounded-lg p-3 border',
                            status === 'completed' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' :
                            status === 'active' ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' :
                            'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                          )}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center',
                                status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                              )}>
                                {status === 'completed' ? <CheckCircle className="h-3 w-3" /> : <config.icon className="h-3 w-3" />}
                              </div>
                              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{config.label}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{q.question}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 参考框架（先隐藏，完成后展示） */}
                {!currentState?.completed && allAnglesCompleted && (
                  <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">参考框架</h3>
                        </div>
                        <Button variant="outline" size="sm" onClick={toggleFramework} className="gap-1.5">
                          {currentState?.showFramework ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          {currentState?.showFramework ? '隐藏' : '查看'}框架
                        </Button>
                      </div>
                      {currentState?.showFramework && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{currentCase.referenceFramework}</p>
                        </div>
                      )}
                      {!currentState?.showFramework && (
                        <p className="text-xs text-slate-400 italic">先独立完成分析，再对比参考框架</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 分角度输入区 */}
                <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-emerald-500" />
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">分角度分析</h3>
                      <Badge variant="outline" className="ml-auto text-xs">{completedAnglesCount}/3 已完成</Badge>
                    </div>

                    <div className="space-y-4">
                      {(['economic', 'political', 'philosophical'] as AngleKey[]).map((angle) => {
                        const config = ANGLE_CONFIG[angle];
                        const status = getAngleStatus(currentCase.id, angle);
                        const angleData = currentState?.angles[angle];

                        return (
                          <div key={angle} className={cn(
                            'rounded-lg p-4 border',
                            status === 'completed' ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' :
                            'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                          )}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center',
                                status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-emerald-500 text-white'
                              )}>
                                {status === 'completed' ? <CheckCircle className="h-4 w-4" /> : <config.icon className="h-4 w-4" />}
                              </div>
                              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{config.label}</span>
                              <span className="text-xs text-slate-400 ml-auto">{config.desc}</span>
                            </div>

                            {/* AI 反馈 */}
                            {angleData?.feedback && (
                              <div className="mb-3 bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start gap-2">
                                  <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{angleData.feedback}</p>
                                </div>
                              </div>
                            )}

                            {/* 输入框 */}
                            {!status.includes('completed') || true ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={inputs[angle]}
                                  onChange={(e) => setInputs((prev) => ({ ...prev, [angle]: e.target.value }))}
                                  placeholder={`从${config.label}分析这个案例...`}
                                  className="min-h-[80px] resize-none"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleAngleSubmit(angle)}
                                  disabled={!inputs[angle].trim() || submitting}
                                  className="gap-1.5 bg-emerald-500 hover:bg-emerald-600"
                                >
                                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                  提交分析
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm text-emerald-600 font-medium">✓ 分析已提交</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* 提交完整分析按钮 */}
                    {allAnglesCompleted && !currentState?.submitted && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          onClick={handleFinalSubmit}
                          disabled={submittingAll}
                          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                          {submittingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                          {submittingAll ? '评估中...' : '提交完整分析'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 参考答案对比 */}
                {currentState?.showAnswer && (
                  <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">参考答案（对比学习）</h3>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {currentCase.referenceAnswer}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 底部操作 */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => resetCase(currentCase.id)} className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />
                    重新分析
                  </Button>
                  <div className="flex gap-2">
                    {currentIndex > 0 && (
                      <Button variant="outline" size="sm" onClick={() => { setCurrentIndex(currentIndex - 1); setInputs({ economic: '', political: '', philosophical: '' }); }}>
                        上一案例
                      </Button>
                    )}
                    {currentIndex < cases.length - 1 && (
                      <Button size="sm" onClick={() => { setCurrentIndex(currentIndex + 1); setInputs({ economic: '', political: '', philosophical: '' }); }} className="gap-1.5 bg-emerald-500 hover:bg-emerald-600">
                        下一案例
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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <SynthesisPageContent />
    </Suspense>
  );
}
