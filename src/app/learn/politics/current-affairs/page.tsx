'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Newspaper, Loader2, ChevronRight, CheckCircle, MessageSquare, RotateCcw, Sparkles, Lightbulb, Link2, Target, Send, Globe, MapPin, TrendingUp, Shield } from 'lucide-react';
import { CURRENT_AFFAIRS, POLITICS_CHAPTERS, type CurrentAffair } from '@/lib/politicsData';
import { cn } from '@/lib/utils';

type AffStep = 1 | 2 | 3;
type StepStatus = 'locked' | 'active' | 'completed';

interface AffState {
  step: AffStep;
  answers: Partial<Record<AffStep, string>>;
  feedback: Partial<Record<AffStep, string>>;
  completed: boolean;
  graphShown: boolean;
  knowledgeLinks: string[];
}

const STEP_CONFIG = [
  { step: 1 as AffStep, label: '事实', icon: Globe, color: 'blue', desc: '发生了什么？' },
  { step: 2 as AffStep, label: '匹配', icon: Link2, color: 'purple', desc: '关联哪些知识？' },
  { step: 3 as AffStep, label: '应用', icon: TrendingUp, color: 'emerald', desc: '如何解决？' },
];

const REGION_COLORS: Record<string, string> = {
  '辽宁': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '东北': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  '全国': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
};

function CurrentAffairsPageContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [hotspots, setHotspots] = useState<CurrentAffair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [states, setStates] = useState<Record<string, AffState>>({});
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentHotspot = hotspots[currentIndex];
  const currentState = currentHotspot ? (states[currentHotspot.id] || {
    step: 1 as AffStep,
    answers: {} as Record<AffStep, string>,
    feedback: {} as Record<AffStep, string>,
    completed: false,
    graphShown: false,
    knowledgeLinks: [],
  }) : null;

  useEffect(() => {
    loadHotspots();
  }, []);

  const loadHotspots = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/politics/current-affairs');
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        setHotspots(json.data);
        const initStates: Record<string, AffState> = {};
        json.data.forEach((item: CurrentAffair) => {
          initStates[item.id] = {
            step: 1,
            answers: {} as Record<AffStep, string>,
            feedback: {} as Record<AffStep, string>,
            completed: false,
            graphShown: false,
            knowledgeLinks: [],
          };
        });
        setStates(initStates);
      } else {
        setHotspots([]);
      }
    } catch {
      setError('加载时政热点失败');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (hotspotId: string, step: AffStep): StepStatus => {
    const state = states[hotspotId];
    if (!state) return 'locked';
    if (state.completed) return 'completed';
    if (state.step === step) return 'active';
    if (state.step > step) return 'completed';
    return 'locked';
  };

  const handleSubmit = async () => {
    if (!currentHotspot || !input.trim() || submitting) return;
    setSubmitting(true);

    const currentStep = currentState?.step || 1;
    const prompt = buildPrompt(currentHotspot, currentStep, input);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          systemPrompt: '你是一位政治教学导师，擅长引导学生建立"时政→理论→实践"的连接思维。你会通过提问帮助学生发现热点与教材知识的关联，培养分析问题和解决问题的能力。绝不直接给答案，而是通过追问引导学生深入思考。',
        }),
      });
      const json = await res.json();
      const feedback = json.choices?.[0]?.message?.content || json.content || '感谢你的分析！';

      const nextStep = advanceStep(currentStep, input);
      const newAnswers = { ...(currentState?.answers || {}), [currentStep]: input };
      const newFeedback = { ...(currentState?.feedback || {}), [currentStep]: feedback };

      if (nextStep > 3) {
        const links = currentHotspot.relatedKnowledge;
        setStates((prev) => ({
          ...prev,
          [currentHotspot.id]: {
            ...prev[currentHotspot.id],
            step: 3 as AffStep,
            answers: newAnswers,
            feedback: newFeedback,
            completed: true,
            graphShown: true,
            knowledgeLinks: links,
          },
        }));
      } else {
        setStates((prev) => ({
          ...prev,
          [currentHotspot.id]: {
            ...prev[currentHotspot.id],
            step: nextStep as AffStep,
            answers: newAnswers,
            feedback: newFeedback,
          },
        }));
      }

      setInput('');
    } catch {
      const nextStep = Math.min((currentState?.step || 1) + 1, 3) as AffStep;
      setStates((prev) => ({
        ...prev,
        [currentHotspot.id]: {
          ...prev[currentHotspot.id],
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

  const buildPrompt = (hotspot: CurrentAffair, step: AffStep, answer: string): string => {
    const base = `【时政热点：${hotspot.title}】
热点摘要：${hotspot.content}
关键词：${hotspot.relatedKnowledge.join('、')}

`;
    const prompts: Record<number, string> = {
      1: `${base}学生第一步（事实陈述）：${answer}
请确认学生概括的关键信息，追问："这个热点最重要的关键词是什么？为什么？"。不要直接给答案。`,
      2: `${base}学生第二步（知识匹配）：${answer}
请追问："为什么选择这个知识点？具体是怎么对应的？有没有其他关联的知识？"。引导学生建立清晰的连接逻辑。`,
      3: `${base}学生第三步（应用决策）：${answer}
请从"原理匹配度"和"可行性"两个维度给出反馈，追问："这个方案有没有考虑其他影响因素？"。`,
    };
    return prompts[step] || prompts[1];
  };

  const advanceStep = (current: AffStep, answer: string): number => {
    const len = answer.trim().length;
    if (current === 1 && len > 5) return 2;
    if (current === 2 && len > 5) return 3;
    if (current === 3 && len > 10) return 4;
    return current;
  };

  const resetHotspot = (hotspotId: string) => {
    setStates((prev) => ({
      ...prev,
      [hotspotId]: {
        step: 1 as AffStep,
        answers: {},
        feedback: {},
        completed: false,
        graphShown: false,
        knowledgeLinks: [],
      },
    }));
    setInput('');
  };

  const completedCount = Object.values(states).filter((s) => s.completed).length;
  const totalCount = hotspots.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30">
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
                <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">时政链接</h1>
                <p className="text-xs text-slate-500">时政热点学习 · 三步关联法</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50">
                进度：{completedCount}/{totalCount}
              </Badge>
              <Progress value={progress} className="w-24 h-2" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：热点列表 */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-blue-500" />
                  时政热点
                  <Badge variant="outline" className="ml-auto text-xs">{totalCount}则</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hotspots.map((hotspot, idx) => {
                  const state = states[hotspot.id];
                  const isCurrent = idx === currentIndex;
                  const isCompleted = state?.completed;
                  const region = hotspot.category.includes('振兴') ? '辽宁' : hotspot.category.includes('生态') ? '东北' : '全国';
                  return (
                    <button
                      key={hotspot.id}
                      onClick={() => { setCurrentIndex(idx); setInput(''); }}
                      className={cn(
                        'w-full flex items-start gap-2 p-3 rounded-lg text-left transition-all',
                        isCurrent ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' :
                        isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' :
                        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      )}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{hotspot.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={cn('text-xs', REGION_COLORS[region])}>{region}</Badge>
                          <span className="text-xs text-slate-400">{hotspot.date}</span>
                        </div>
                      </div>
                      {isCurrent && !isCompleted && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs flex-shrink-0">当前</Badge>
                      )}
                    </button>
                  );
                })}
                {hotspots.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Newspaper className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">暂无时政热点</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：分析训练区 */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card className="rounded-xl">
                <CardContent className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
                  <span className="text-slate-500">加载时政热点中...</span>
                </CardContent>
              </Card>
            ) : !currentHotspot ? (
              <Card className="rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Sparkles className="h-12 w-12 text-blue-300 mb-3" />
                  <p className="text-slate-500">还没有时政热点数据</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 热点详情卡片 */}
                <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-100 text-blue-700 text-xs">{currentHotspot.category}</Badge>
                          <span className="text-xs text-slate-400">{currentHotspot.date}</span>
                          {currentState?.completed && (
                            <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                              <CheckCircle className="h-3 w-3" /> 已分析
                            </Badge>
                          )}
                        </div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{currentHotspot.title}</h2>
                      </div>
                    </div>

                    {/* 热点内容 */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">热点摘要</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{currentHotspot.content}</p>
                    </div>

                    {/* 关联知识点 */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">关联知识点</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {currentHotspot.relatedKnowledge.map((k, i) => (
                          <Badge key={i} variant="outline" className="bg-white dark:bg-slate-700 text-xs">
                            {k}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* 高考命题角度 */}
                    {currentHotspot.examAngles && currentHotspot.examAngles.length > 0 && (
                      <div className="mt-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">高考命题角度</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {currentHotspot.examAngles.map((angle, i) => (
                            <Badge key={i} className="bg-amber-100 text-amber-700 text-xs">
                              {angle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 三步关联法 */}
                <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Link2 className="h-5 w-5 text-blue-500" />
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">三步关联学习法</h3>
                      <div className="ml-auto flex gap-1">
                        {STEP_CONFIG.map((cfg) => {
                          const status = getStepStatus(currentHotspot.id, cfg.step);
                          return (
                            <div key={cfg.step} className={cn(
                              'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                              status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              status === 'active' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-400'
                            )}>
                              {status === 'completed' ? <CheckCircle className="h-3 w-3" /> : <cfg.icon className="h-3 w-3" />}
                              <span className="hidden sm:inline">{cfg.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 步骤进度 */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                      {STEP_CONFIG.map((cfg, idx) => {
                        const status = getStepStatus(currentHotspot.id, cfg.step);
                        const Icon = cfg.icon;
                        return (
                          <div key={cfg.step} className="flex items-center flex-shrink-0">
                            <div className={cn(
                              'flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[80px]',
                              status === 'completed' ? 'bg-emerald-50' :
                              status === 'active' ? 'bg-blue-50 border border-blue-200' :
                              'bg-slate-50 opacity-50'
                            )}>
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center',
                                status === 'completed' ? 'bg-emerald-500 text-white' :
                                status === 'active' ? 'bg-blue-500 text-white' :
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
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 mb-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <strong>第{currentState?.step || 1}步 · {STEP_CONFIG[(currentState?.step || 1) - 1]?.label}：</strong>
                          {currentState?.step === 1 && '这个热点讲了什么？请用你自己的话概括主要事实。'}
                          {currentState?.step === 2 && '这个热点对应教材哪个知识点？它们之间是怎么关联的？'}
                          {currentState?.step === 3 && '如果你是决策者，会如何应对这个问题？请提出你的解决方案。'}
                        </p>
                      </div>
                    )}

                    {/* AI 反馈 */}
                    {Object.values(currentState?.feedback || {}).some(Boolean) && (
                      <div className="space-y-2 mb-4">
                        {([1, 2, 3] as AffStep[]).map((step) => {
                          const fb = currentState?.feedback[step];
                          if (!fb) return null;
                          return (
                            <div key={step} className={cn(
                              'rounded-lg p-3 border',
                              step === 3 && currentState?.completed ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200' :
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

                    {/* 关联知识图谱 */}
                    {currentState?.graphShown && currentState.knowledgeLinks.length > 0 && (
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-3">
                          <Link2 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">时政→知识 关联图谱</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">热</div>
                            <ChevronRight className="h-4 w-4 text-blue-400" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{currentHotspot.title}</p>
                              <p className="text-xs text-slate-400">{currentHotspot.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-6" />
                            <ChevronRight className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {currentState.knowledgeLinks.map((link, i) => (
                              <div key={i} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">知</div>
                                <p className="text-sm text-slate-700 dark:text-slate-200">{link}</p>
                              </div>
                            ))}
                          </div>
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
                            currentState?.step === 1 ? '请用自己的话概括这个热点的主要事实...' :
                            currentState?.step === 2 ? '请说明这个热点与哪些知识点相关联...' :
                            '如果你是决策者，你会如何应对？请提出解决方案...'
                          }
                          className="min-h-[100px] resize-none"
                          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); }}
                        />
                        <div className="flex items-center gap-2">
                          <Button onClick={handleSubmit} disabled={!input.trim() || submitting} className="gap-1.5 bg-blue-500 hover:bg-blue-600">
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {submitting ? '分析中...' : '提交分析'}
                          </Button>
                          <span className="text-xs text-slate-400">Ctrl+Enter 快捷提交</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex-1 h-px bg-emerald-200" />
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">本热点分析完成！</span>
                        </div>
                        <div className="flex-1 h-px bg-emerald-200" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 底部操作 */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => resetHotspot(currentHotspot.id)} className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />
                    重新分析
                  </Button>
                  <div className="flex gap-2">
                    {currentIndex > 0 && (
                      <Button variant="outline" size="sm" onClick={() => { setCurrentIndex(currentIndex - 1); setInput(''); }}>
                        上一则
                      </Button>
                    )}
                    {currentIndex < hotspots.length - 1 && (
                      <Button size="sm" onClick={() => { setCurrentIndex(currentIndex + 1); setInput(''); }} className="gap-1.5 bg-blue-500 hover:bg-blue-600">
                        下一则
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
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <CurrentAffairsPageContent />
    </Suspense>
  );
}
