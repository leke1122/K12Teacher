'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Brain, Loader2, ChevronRight, Lightbulb, RefreshCw, CheckCircle, Sparkles, BookOpen, MapPin, Target, Zap, RotateCcw, Send, MessageSquare, Eye, EyeOff } from 'lucide-react';
import { POLITICS_CHAPTERS, type PoliticsKnowledgeItem } from '@/lib/politicsData';
import { updateStepProgress, loadProgress, saveProgress, type PoliticsProgress, type PoliticsStepKey } from '@/lib/politicsProgress';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settingsStore';

type LearnStep = 1 | 2 | 3;
type StepStatus = 'locked' | 'active' | 'completed';

interface LearningState {
  step: LearnStep;
  studentInput: string;
  aiFeedback: string;
  showDefinition: boolean;
  completed: boolean;
}

const STEP_CONFIG = [
  { step: 1 as LearnStep, label: '问题引导', icon: Lightbulb, color: 'pink', desc: '思考：本章要解决什么问题？' },
  { step: 2 as LearnStep, label: '关系构建', icon: Brain, color: 'purple', desc: '理解：概念之间的关系是什么？' },
  { step: 3 as LearnStep, label: '应用实践', icon: Zap, color: 'blue', desc: '运用：如何分析实际案例？' },
];

function KnowledgePageContent() {
  const params = useParams();
  const router = useRouter();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : 'politics-compulsory-2';
  const { settings } = useSettingsStore();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<PoliticsKnowledgeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnStates, setLearnStates] = useState<Record<string, LearningState>>({});
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ show: boolean; text: string; type: 'hint' | 'success' | 'guide' }>({ show: false, text: '', type: 'hint' });
  const [showDefinition, setShowDefinition] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chapterInfo = POLITICS_CHAPTERS.find((ch) => ch.id === chapterId) || {
    id: chapterId,
    title: chapterId,
    module: 'economics' as const,
    moduleName: '经济',
    topics: [],
  };

  const currentItem = knowledgeItems[currentIndex];
  const currentState = currentItem ? (learnStates[currentItem.id] || { step: 1 as LearnStep, studentInput: '', aiFeedback: '', showDefinition: false, completed: false }) : null;

  useEffect(() => {
    loadKnowledge();
  }, [chapterId]);

  const loadKnowledge = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      if (force) {
        setGenerating(true);
      }
      const res = await fetch('/api/politics/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId }),
      });
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        setKnowledgeItems(json.data);
        const states: Record<string, LearningState> = {};
        json.data.forEach((item: PoliticsKnowledgeItem) => {
          states[item.id] = { step: 1 as LearnStep, studentInput: '', aiFeedback: '', showDefinition: false, completed: false };
        });
        setLearnStates(states);
      } else {
        setKnowledgeItems([]);
      }
    } catch {
      setError('加载知识点失败，请重试');
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const getStepStatus = useCallback((itemId: string, step: LearnStep): StepStatus => {
    const state = learnStates[itemId];
    if (!state) return 'locked';
    if (state.completed) return 'completed';
    if (state.step === step) return 'active';
    if (state.step > step) return 'completed';
    return 'locked';
  }, [learnStates]);

  const handleSubmit = async () => {
    if (!currentItem || !input.trim() || submitting) return;
    setSubmitting(true);

    const currentStep = learnStates[currentItem.id]?.step || 1;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: getPromptForStep(currentItem, currentStep, input),
            },
          ],
          systemPrompt: '你是一位政治教学导师，坚持引导式教学理念。当学生回答错误时，你不会直接给答案，而是通过提问、提示、追问的方式引导学生自己发现答案。当学生回答正确或接近正确时，你给予肯定并适当拓展。语言亲切，鼓励为主。',
        }),
      });
      const json = await res.json();
      const feedback = json.choices?.[0]?.message?.content || json.content || '感谢你的思考，请继续探索！';

      const nextStep = advanceStep(currentStep, input, currentItem);

      setLearnStates((prev) => ({
        ...prev,
        [currentItem.id]: {
          ...prev[currentItem.id],
          step: nextStep as LearnStep,
          studentInput: input,
          aiFeedback: feedback,
          showDefinition: nextStep > 1,
          completed: nextStep > 3,
        },
      }));

      setAiFeedback({ show: true, text: feedback, type: nextStep > 3 ? 'success' : 'hint' });
      setInput('');

      if (nextStep > 3) {
        updateStepProgress('politics', chapterId, 'knowledge', 'completed');
      }
    } catch {
      setAiFeedback({ show: true, text: '网络错误，请重试。', type: 'hint' });
    } finally {
      setSubmitting(false);
    }
  };

  const advanceStep = (current: LearnStep, answer: string, item: PoliticsKnowledgeItem): number => {
    const answerLen = answer.trim().length;
    if (current === 1 && answerLen > 5) return 2;
    if (current === 2 && answerLen > 5) return 3;
    if (current === 3 && answerLen > 10) return 4;
    return current;
  };

  const getPromptForStep = (item: PoliticsKnowledgeItem, step: LearnStep, studentAnswer: string): string => {
    const prompts = {
      1: `【知识点：${item.title}】
学生尝试回答："这一章节要解决的核心问题是什么？"
学生答案：${studentAnswer}

请给出引导式反馈：先肯定学生的思路，然后提出一个追问或提示，帮助他进一步思考。不要直接给出完整答案。`,
      2: `【知识点：${item.title}】
学生尝试回答："这个知识点与哪些其他概念有联系？"
学生答案：${studentAnswer}

请给出引导式反馈：从学生提到的概念出发，追问概念间的关系，引导他画出或描述出概念之间的关系图。`,
      3: `【知识点：${item.title}】
学习目标：能用本知识点分析生活中的现象。
学生尝试回答："举一个生活中的例子，并说明其中蕴含的原理"
学生答案：${studentAnswer}

请从"原理匹配度"和"分析深度"两个维度给出引导式反馈。`,
    };
    return prompts[step as 1 | 2 | 3] || prompts[1];
  };

  const resetLearning = (itemId: string) => {
    setLearnStates((prev) => ({
      ...prev,
      [itemId]: { step: 1 as LearnStep, studentInput: '', aiFeedback: '', showDefinition: false, completed: false },
    }));
    setAiFeedback({ show: false, text: '', type: 'hint' });
    setInput('');
  };

  const completedCount = Object.values(learnStates).filter((s) => s.completed).length;
  const totalCount = knowledgeItems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30">
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
                <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">知识点学习</h1>
                <p className="text-xs text-slate-500">{chapterInfo.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-pink-50">
                进度：{completedCount}/{totalCount}
              </Badge>
              <Progress value={progress} className="w-24 h-2" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：知识点列表 */}
          <div className="lg:col-span-1">
            <Card className="rounded-xl shadow-sm border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-pink-500" />
                  知识点列表
                  <Badge variant="outline" className="ml-auto text-xs">{totalCount}个</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {knowledgeItems.map((item, idx) => {
                  const state = learnStates[item.id];
                  const isCurrent = idx === currentIndex;
                  const isCompleted = state?.completed;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentIndex(idx); setAiFeedback({ show: false, text: '', type: 'hint' }); setInput(''); }}
                      className={cn(
                        'w-full flex items-center gap-2 p-3 rounded-lg text-left transition-all',
                        isCurrent ? 'bg-pink-100 dark:bg-pink-900/30 border border-pink-300 dark:border-pink-700' :
                        isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' :
                        'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-pink-300'
                      )}
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-pink-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      )}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 capitalize">{item.type}</p>
                      </div>
                      {isCurrent && (
                        <Badge className="bg-pink-100 text-pink-700 text-xs">当前</Badge>
                      )}
                    </button>
                  );
                })}
                {knowledgeItems.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">暂无知识点</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：学习面板 */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <Card className="rounded-xl">
                <CardContent className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-pink-500 mr-3" />
                  <span className="text-slate-500">加载知识点中...</span>
                </CardContent>
              </Card>
            ) : !currentItem ? (
              <Card className="rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Sparkles className="h-12 w-12 text-pink-300 mb-3" />
                  <p className="text-slate-500 mb-4">还没有知识点内容</p>
                  <Button onClick={() => loadKnowledge(true)} className="gap-1.5 bg-pink-500 hover:bg-pink-600">
                    <Sparkles className="h-4 w-4" />
                    生成知识点
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 知识点卡片 */}
                <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Badge className={cn(
                          'mb-2 text-xs',
                          currentItem.type === 'concept' ? 'bg-blue-100 text-blue-700' :
                          currentItem.type === 'theory' ? 'bg-purple-100 text-purple-700' :
                          currentItem.type === 'assertion' ? 'bg-red-100 text-red-700' :
                          'bg-green-100 text-green-700'
                        )}>
                          {currentItem.type === 'concept' ? '核心概念' :
                           currentItem.type === 'theory' ? '理论体系' :
                           currentItem.type === 'assertion' ? '重要论断' : '原理规律'}
                        </Badge>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{currentItem.title}</h2>
                      </div>
                      {currentState?.completed && (
                        <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                          <CheckCircle className="h-3 w-3" /> 已掌握
                        </Badge>
                      )}
                    </div>

                    {/* 知识点内容（点击揭示） */}
                    <div className="space-y-3">
                      {/* 定义 */}
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-pink-500" />
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">定义</span>
                          <Button variant="ghost" size="sm" className="ml-auto h-6 px-2" onClick={() => setShowDefinition(!showDefinition)}>
                            {showDefinition ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            <span className="ml-1 text-xs">{showDefinition ? '隐藏' : '揭示'}</span>
                          </Button>
                        </div>
                        {showDefinition ? (
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{currentItem.definition}</p>
                        ) : (
                          <p className="text-sm text-slate-400 italic">点击"揭示"查看定义</p>
                        )}
                      </div>

                      {/* 核心要素 */}
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-purple-500" />
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">核心要素</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {currentItem.elements.map((el, i) => (
                            <Badge key={i} variant="outline" className="bg-white dark:bg-slate-700 text-xs">
                              {el}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* 生活化类比 */}
                      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">生活化类比</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{currentItem.analogy}</p>
                      </div>

                      {/* 辽宁案例 */}
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">辽宁案例</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{currentItem.liaoningExample}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 三步引导法 */}
                <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="h-5 w-5 text-pink-500" />
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">三步引导学习法</h3>
                      <div className="ml-auto flex gap-1">
                        {STEP_CONFIG.map((cfg) => {
                          const status = getStepStatus(currentItem.id, cfg.step);
                          return (
                            <div key={cfg.step} className={cn(
                              'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                              status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              status === 'active' ? 'bg-pink-100 text-pink-700' :
                              'bg-slate-100 text-slate-400'
                            )}>
                              {status === 'completed' ? <CheckCircle className="h-3 w-3" /> : <cfg.icon className="h-3 w-3" />}
                              <span className="hidden sm:inline">{cfg.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 步骤指示器 */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                      {STEP_CONFIG.map((cfg, idx) => {
                        const status = getStepStatus(currentItem.id, cfg.step);
                        const Icon = cfg.icon;
                        return (
                          <div key={cfg.step} className="flex items-center flex-shrink-0">
                            <div className={cn(
                              'flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[80px]',
                              status === 'completed' ? 'bg-emerald-50' :
                              status === 'active' ? 'bg-pink-50 border border-pink-200' :
                              'bg-slate-50 opacity-50'
                            )}>
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center',
                                status === 'completed' ? 'bg-emerald-500 text-white' :
                                status === 'active' ? `bg-${cfg.color}-500 text-white` :
                                'bg-slate-200 text-slate-400'
                              )} style={status === 'active' ? { backgroundColor: `var(--${cfg.color}-500, #ec4899)` } : {}}>
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
                    {currentState && !currentState.completed && (
                      <div className="bg-pink-50 dark:bg-pink-950/30 rounded-lg p-3 mb-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <strong>第{currentState.step}步：</strong>
                          {currentState.step === 1 && '这一章要解决的核心问题是什么？请先自己思考，然后尝试概括。'}
                          {currentState.step === 2 && '这个知识点与哪些其他概念有联系？请试着画出或描述出概念间的关系。'}
                          {currentState.step === 3 && '请举一个生活中的例子，并说明其中蕴含的本节原理。'}
                        </p>
                      </div>
                    )}

                    {/* AI 反馈区域 */}
                    {aiFeedback.show && (
                      <div className={cn(
                        'rounded-lg p-3 mb-4',
                        aiFeedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200' :
                        'bg-slate-50 dark:bg-slate-800 border border-slate-200'
                      )}>
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">导师反馈</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{aiFeedback.text}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 输入区域 */}
                    {!currentState?.completed && (
                      <div className="space-y-3">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder={currentState?.step === 1 ? '请输入你的思考...' : currentState?.step === 2 ? '请描述概念间的关系...' : '请举例说明...'}
                          className="min-h-[100px] resize-none"
                          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); }}
                        />
                        <div className="flex items-center gap-2">
                          <Button onClick={handleSubmit} disabled={!input.trim() || submitting} className="gap-1.5 bg-pink-500 hover:bg-pink-600">
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {submitting ? '思考中...' : '提交思考'}
                          </Button>
                          <span className="text-xs text-slate-400">Ctrl+Enter 快捷提交</span>
                        </div>
                      </div>
                    )}

                    {/* 已完成状态 */}
                    {currentState?.completed && (
                      <div className="flex items-center gap-3 mt-4">
                        <div className="flex-1 h-px bg-emerald-200" />
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">本知识点已掌握！</span>
                        </div>
                        <div className="flex-1 h-px bg-emerald-200" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 底部操作 */}
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => resetLearning(currentItem.id)} className="gap-1.5">
                    <RotateCcw className="h-3.5 w-3.5" />
                    重新学习
                  </Button>
                  <div className="flex gap-2">
                    {currentIndex > 0 && (
                      <Button variant="outline" size="sm" onClick={() => { setCurrentIndex(currentIndex - 1); setAiFeedback({ show: false, text: '', type: 'hint' }); setInput(''); }}>
                        上一个
                      </Button>
                    )}
                    {currentIndex < knowledgeItems.length - 1 && (
                      <Button size="sm" onClick={() => { setCurrentIndex(currentIndex + 1); setAiFeedback({ show: false, text: '', type: 'hint' }); setInput(''); }} className="gap-1.5 bg-pink-500 hover:bg-pink-600">
                        下一个知识点
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
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    }>
      <KnowledgePageContent />
    </Suspense>
  );
}
