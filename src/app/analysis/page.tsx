'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserGradeStore, GRADE_LABELS } from '@/stores/gradeStore';
import { SUBJECTS } from '@/stores/subjectStore';
import { FocusTimer } from '@/components/ui/FocusTimer';
import { HEURISTIC_PROMPTS } from '@/lib/gradeAdapter';
import {
  ArrowLeft, AlertCircle, TrendingUp, Brain,
  Target, Lightbulb, ArrowRight, Loader2
} from 'lucide-react';

interface WeakPoint {
  id: string;
  knowledge: string;
  type: string;
  subjectId: string;
  chapterId?: string;
  sectionId?: string;
  errorCount: number;
  lastWrong: string;
  accuracy: number;
  suggestion?: string;
}

interface SubjectLossRate {
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  wrongCount: number;
  lossRate: number;
}

interface TypeLossStat {
  type: string;
  count: number;
  percentage: number;
}

interface AnalysisData {
  weakPoints: WeakPoint[];
  subjectLossRates: SubjectLossRate[];
  typeLossStats: TypeLossStat[];
  weeklyProgress: { date: string; improvedCount: number; totalWeak: number }[];
}

export default function AnalysisPage() {
  const router = useRouter();
  const { grade } = useUserGradeStore();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [expandedPoint, setExpandedPoint] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [grade]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analysis/stats?grade=${grade}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch {
      // 数据为空时显示空状态
      setData({
        weakPoints: [],
        subjectLossRates: SUBJECTS.map(s => ({ subjectId: s.id, subjectName: s.name, totalQuestions: 0, wrongCount: 0, lossRate: 0 })),
        typeLossStats: [],
        weeklyProgress: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPoints = selectedSubject === 'all'
    ? (data?.weakPoints || [])
    : (data?.weakPoints.filter(p => p.subjectId === selectedSubject) || []);

  const maxLossRate = Math.max(...(data?.subjectLossRates.map(s => s.lossRate) || [0]), 1);

  const handleGoToStudy = (point: WeakPoint) => {
    if (point.chapterId) {
      router.push(`/subjects/${point.subjectId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  📊 薄弱点分析
                </h1>
                <p className="text-xs text-slate-500">当前年级：{GRADE_LABELS[grade]}</p>
              </div>
            </div>
            <Badge variant="outline">{GRADE_LABELS[grade]}模式</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* 学科失分率卡片行 */}
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
              {data?.subjectLossRates.map((s) => {
                const subject = SUBJECTS.find(sj => sj.id === s.subjectId);
                return (
                  <Card
                    key={s.subjectId}
                    className={`cursor-pointer transition-all ${selectedSubject === s.subjectId ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedSubject(s.subjectId === selectedSubject ? 'all' : s.subjectId)}
                  >
                    <CardContent className="p-2 text-center">
                      <div className="text-lg">{subject?.icon || '📚'}</div>
                      <div className="text-xs font-medium truncate">{s.subjectName}</div>
                      <div className={`text-lg font-bold ${
                        s.lossRate >= 50 ? 'text-red-500' :
                        s.lossRate >= 30 ? 'text-amber-500' :
                        s.lossRate > 0 ? 'text-green-500' : 'text-slate-400'
                      }`}>
                        {s.lossRate > 0 ? `${s.lossRate}%` : '-'}
                      </div>
                      <div className="text-[10px] text-slate-400">失分率</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Tabs defaultValue="weak" className="space-y-4">
              <TabsList>
                <TabsTrigger value="weak" className="gap-1">
                  <AlertCircle className="h-4 w-4" />
                  薄弱知识点
                </TabsTrigger>
                <TabsTrigger value="action" className="gap-1">
                  <Lightbulb className="h-4 w-4" />
                  行动建议
                </TabsTrigger>
                <TabsTrigger value="progress" className="gap-1">
                  <TrendingUp className="h-4 w-4" />
                  进步报告
                </TabsTrigger>
              </TabsList>

              {/* 薄弱知识点列表 */}
              <TabsContent value="weak">
                <div className="grid lg:grid-cols-2 gap-4">
                  {filteredPoints.length === 0 ? (
                    <Card className="col-span-2">
                      <CardContent className="py-16 text-center">
                        <div className="text-5xl mb-4">🎉</div>
                        <h3 className="text-lg font-bold mb-2">太棒了！暂无薄弱知识点</h3>
                        <p className="text-sm text-muted-foreground">
                          继续保持！多做练习来检验自己的掌握程度吧
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredPoints.map((point, idx) => {
                      const subject = SUBJECTS.find(s => s.id === point.subjectId);
                      const isExpanded = expandedPoint === point.id;
                      return (
                        <Card key={point.id} className={idx < 3 ? 'border-red-200 dark:border-red-900' : ''}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                  idx === 0 ? 'bg-red-500 text-white' :
                                  idx === 1 ? 'bg-amber-500 text-white' :
                                  idx === 2 ? 'bg-orange-400 text-white' :
                                  'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}>
                                  {idx + 1}
                                </div>
                                <div>
                                  <CardTitle className="text-sm">{point.knowledge}</CardTitle>
                                  <p className="text-xs text-muted-foreground">
                                    {subject?.icon} {subject?.name} · {point.type}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="destructive" className="text-xs">
                                错误{point.errorCount}次
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {/* 启发式引导：为什么薄弱？ */}
                            <div
                              className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg mb-3 cursor-pointer"
                              onClick={() => setExpandedPoint(isExpanded ? null : point.id)}
                            >
                              <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                <Brain className="h-3 w-3" />
                                为什么这个知识点薄弱？
                              </p>
                              {isExpanded && (
                                <div className="mt-2 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                                  <p>{HEURISTIC_PROMPTS.weakPointAnalysis(point.knowledge)}</p>
                                  <button
                                    className="text-blue-600 underline"
                                    onClick={(e) => { e.stopPropagation(); handleGoToStudy(point); }}
                                  >
                                    去复习 →
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* 失分进度条 */}
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>正确率</span>
                                <span>{point.accuracy}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    point.accuracy >= 80 ? 'bg-green-500' :
                                    point.accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${point.accuracy}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-1"
                                onClick={() => handleGoToStudy(point)}
                              >
                                <Target className="h-3 w-3" />
                                建议复习
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setExpandedPoint(isExpanded ? null : point.id)}
                              >
                                {isExpanded ? '收起' : '详情'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              {/* 行动建议 */}
              <TabsContent value="action">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      该怎么做？
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredPoints.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">暂无薄弱知识点，继续保持！</p>
                    ) : (
                      filteredPoints.slice(0, 5).map((point) => (
                        <div key={point.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600">
                            {filteredPoints.indexOf(point) + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{point.knowledge}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {HEURISTIC_PROMPTS.actionSuggestion(point.knowledge, point.chapterId)}
                            </p>
                            <Button
                              size="sm"
                              variant="link"
                              className="h-auto p-0 mt-1 text-xs text-blue-600"
                              onClick={() => handleGoToStudy(point)}
                            >
                              去复习 <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 进步报告 */}
              <TabsContent value="progress">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      本周进步
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">
                        {data?.weeklyProgress[0]?.improvedCount && data.weeklyProgress[0].improvedCount > 0 ? '📈' : '💪'}
                      </div>
                      <h3 className="text-lg font-bold mb-2">
                        {data?.weeklyProgress[0]?.improvedCount && data.weeklyProgress[0].improvedCount > 0
                          ? `本周你减少了 ${data.weeklyProgress[0].improvedCount} 个薄弱点！`
                          : '继续加油，每天进步一点点！'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        薄弱点总数：{data?.weeklyProgress[0]?.totalWeak || 0}个
                      </p>
                      <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm text-green-700 dark:text-green-400">
                        🌟 鼓励语：每解决一个薄弱点，你就在变强！坚持就是胜利！
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 底部：专注计时器入口 */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      ⏱️ 专注学习
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      针对薄弱点，制定计划，专注攻克！
                    </p>
                  </div>
                  <div className="w-48">
                    <FocusTimer
                      subjectId={selectedSubject !== 'all' ? selectedSubject : undefined}
                      onFocusEnd={(mins) => console.log('[专注完成]', mins, '分钟')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
