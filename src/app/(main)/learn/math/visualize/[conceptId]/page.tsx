'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserGradeStore, GRADE_LABELS } from '@/stores/gradeStore';
import { ConceptGraph } from '@/components/visualization/ConceptGraph';
import { AnalogyCard } from '@/components/visualization/AnalogyCard';
import { GuidedThinking } from '@/components/visualization/GuidedThinking';
import { FocusTimer } from '@/components/ui/FocusTimer';
import {
  ArrowLeft, Loader2, Sparkles, BookOpen, PenTool,
  Lightbulb, Brain, ArrowRight
} from 'lucide-react';

const HandwritingPad = lazy(() => import('@/components/canvas/HandwritingPad').then(mod => ({ default: mod.HandwritingPad })));

interface ConceptViz {
  concept: string;
  conceptName: string;
  definition: string;
  visualization: {
    type: string;
    title: string;
    description: string;
    data: unknown;
  };
  analogies: Array<{
    title: string;
    description: string;
    steps: string[];
  }>;
  questions: Array<{
    question: string;
    options: string[];
    correct: string;
    hint: string;
    explanation: string;
  }>;
  guidedSteps: Array<{
    step: number;
    prompt: string;
    type: 'observe' | 'calculate' | 'describe' | 'choose';
  }>;
}

const AVAILABLE_CONCEPTS = [
  { id: 'function', name: '函数', icon: '📈' },
  { id: 'set', name: '集合', icon: '🔵' },
  { id: 'subset', name: '子集', icon: '📦' },
  { id: 'mapping', name: '映射', icon: '➡️' },
  { id: 'quadratic', name: '二次函数', icon: '📊' },
  { id: 'monotonicity', name: '单调性', icon: '↗️' },
  { id: 'parity', name: '奇偶性', icon: '↔️' },
  { id: 'limit', name: '极限', icon: '∞' },
];

const DEFAULT_CONCEPT = 'function';

function VisualizePageContent() {
  const params = useParams();
  const router = useRouter();
  const { grade } = useUserGradeStore();

  const conceptId = (params.conceptId as string) || DEFAULT_CONCEPT;
  const [data, setData] = useState<ConceptViz | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visualize');
  const [showHandwriting, setShowHandwriting] = useState(false);

  useEffect(() => {
    fetchConcept();
  }, [conceptId]);

  const fetchConcept = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/visualize-concept?concept=${conceptId}&grade=${grade}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleHandwritingSave = (imageData: string) => {
    console.log('[手写识别] 提交图像，长度:', imageData.length);
    // TODO: 调用AI识别手写内容
    setShowHandwriting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">无法加载可视化内容</p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  可视化学习 · {data.conceptName}
                </h1>
                <p className="text-xs text-slate-500">当前年级：{GRADE_LABELS[grade]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{data.conceptName}</Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-4 space-y-4">
        {/* 概念切换 - 紧凑横向排列 */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {AVAILABLE_CONCEPTS.map((c) => (
            <Button
              key={c.id}
              variant={conceptId === c.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => router.push(`/learn/math/visualize/${c.id}`)}
              className="gap-1 text-sm"
            >
              <span>{c.icon}</span>
              <span>{c.name}</span>
            </Button>
          ))}
        </div>

        {/* 概念定义卡片 - 紧凑 */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg flex-shrink-0">
                📐
              </div>
              <div>
                <h2 className="font-bold text-base mb-1">🎯 {data.conceptName}的定义</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.definition}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主内容区 - 全宽布局 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList>
            <TabsTrigger value="visualize" className="gap-1">
              <BookOpen className="h-4 w-4" />
              互动图形
            </TabsTrigger>
            <TabsTrigger value="analogy" className="gap-1">
              <Lightbulb className="h-4 w-4" />
              生活类比
            </TabsTrigger>
            <TabsTrigger value="thinking" className="gap-1">
              <Brain className="h-4 w-4" />
              思考引导
            </TabsTrigger>
            <TabsTrigger value="handwriting" className="gap-1">
              <PenTool className="h-4 w-4" />
              手写练习
            </TabsTrigger>
          </TabsList>

          {/* 互动图形 */}
          <TabsContent value="visualize">
            <div className="grid lg:grid-cols-2 gap-4">
              <Card className="flex flex-col">
                <CardHeader className="pb-2 pt-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    {data.visualization.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <ConceptGraph
                    type={data.visualization.type}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={data.visualization.data as any}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    💡 {data.visualization.description}
                  </p>
                </CardContent>
              </Card>

              {/* 右侧：定义 + 小练习 */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2 pt-3">
                    <CardTitle className="text-base">📖 核心要点</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.questions.slice(0, 2).map((q, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="text-sm font-medium mb-1.5">Q{i + 1}: {q.question}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {q.options.map((opt) => (
                            <Badge
                              key={opt}
                              variant={opt === q.correct ? 'default' : 'outline'}
                              className="text-xs"
                            >
                              {opt}
                            </Badge>
                          ))}
                        </div>
                        {q.hint && (
                          <p className="text-xs text-muted-foreground mt-1.5">💡 {q.hint}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 专注入口 */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm flex items-center gap-1">
                          ⏱️ 专注学习 {data.conceptName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          针对这个知识点，专注练习！
                        </p>
                      </div>
                      <div className="w-40">
                        <FocusTimer onFocusEnd={(m) => console.log('[可视化专注]', m)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 生活类比 */}
          <TabsContent value="analogy">
            <div className="max-w-2xl">
              <AnalogyCard analogies={data.analogies} />
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="font-bold text-base mb-2">💡 为什么用类比学习？</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    抽象的数学概念往往和生活经验相通！通过类比，把陌生的知识变成熟悉的事物，
                    就像把新房子和老房子对比，更容易理解。找一个你最容易理解的类比，
                    用它来记住这个概念！
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 思考引导 */}
          <TabsContent value="thinking">
            <div className="max-w-2xl space-y-4">
              <GuidedThinking
                steps={data.guidedSteps}
                questions={data.questions}
              />
              <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <CardContent className="p-4">
                  <h3 className="font-bold text-base flex items-center gap-2 mb-2">
                    🌟 学习建议
                  </h3>
                  <ul className="text-base text-muted-foreground space-y-1">
                    <li>1. 先仔细观察图形，不要急着找答案</li>
                    <li>2. 遇到不会的题，先看提示，不要直接放弃</li>
                    <li>3. 答错了也没关系，看解释再想想</li>
                    <li>4. 尝试用自己的话解释给别人听</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 手写练习 */}
          <TabsContent value="handwriting">
            <Card>
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PenTool className="h-4 w-4 text-indigo-500" />
                    ✏️ 手写练习区
                  </CardTitle>
                  {!showHandwriting && (
                    <Button size="sm" onClick={() => setShowHandwriting(true)} className="gap-1">
                      <PenTool className="h-4 w-4" />
                      打开手写板
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showHandwriting ? (
                  <Suspense fallback={<div className="h-[400px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>}>
                    <div className="h-[400px]">
                      <HandwritingPad
                        onSave={handleHandwritingSave}
                        onCancel={() => setShowHandwriting(false)}
                        loading={false}
                      />
                    </div>
                  </Suspense>
                ) : (
                  <div className="text-center py-10 space-y-4">
                    <div className="text-4xl">✍️</div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">在下方画出你理解的概念</h3>
                      <p className="text-base text-muted-foreground max-w-md mx-auto">
                        {conceptId === 'function'
                          ? '画出你理解的 y = x² 函数图像，或画出你理解"函数"的示意图'
                          : conceptId === 'set'
                          ? '画出两个集合 A 和 B，以及它们的交集、并集区域'
                          : '画出你对这个概念的理解示意图'}
                      </p>
                      <Button onClick={() => setShowHandwriting(true)} className="gap-1">
                        <PenTool className="h-4 w-4" />
                        打开手写板
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground bg-slate-50 dark:bg-slate-800 rounded-lg p-3 max-w-md mx-auto">
                      💡 小提示：点击提交后，AI将识别你画的内容，并给出评价和建议
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 底部导航 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              const idx = AVAILABLE_CONCEPTS.findIndex(c => c.id === conceptId);
              if (idx > 0) router.push(`/learn/math/visualize/${AVAILABLE_CONCEPTS[idx - 1].id}`);
            }}
            disabled={AVAILABLE_CONCEPTS.findIndex(c => c.id === conceptId) === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            上一个概念
          </Button>
          <Button
            onClick={() => {
              const idx = AVAILABLE_CONCEPTS.findIndex(c => c.id === conceptId);
              if (idx < AVAILABLE_CONCEPTS.length - 1) {
                router.push(`/learn/math/visualize/${AVAILABLE_CONCEPTS[idx + 1].id}`);
              }
            }}
            disabled={AVAILABLE_CONCEPTS.findIndex(c => c.id === conceptId) === AVAILABLE_CONCEPTS.length - 1}
          >
            下一个概念
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}

export default function VisualizePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <VisualizePageContent />
    </Suspense>
  );
}
