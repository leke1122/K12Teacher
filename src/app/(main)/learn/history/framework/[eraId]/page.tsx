'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, ArrowRight, BookOpen, Target, BarChart3, 
  Lightbulb, MapPin, BookMarked, Brain, CheckCircle2,
  FileText, Scroll, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  HISTORY_ERAS,
  type Era
} from '@/data/history/framework/historyData';

export default function EraDetailPage({ params }: { params: { eraId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [era, setEra] = useState<Era | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedComparisons, setExpandedComparisons] = useState<Set<number>>(new Set([0, 1]));
  const [completedPoints, setCompletedPoints] = useState<Set<string>>(new Set());

  useEffect(() => {
    const foundEra = HISTORY_ERAS.find(e => e.id === params.eraId);
    if (!foundEra) return;
    setEra(foundEra);
    
    // 如果URL有highlight参数，切换到对应tab
    const highlight = searchParams.get('highlight');
    if (highlight === 'liaoning') {
      setActiveTab('liaoning');
    }
  }, [params.eraId, searchParams]);

  if (!era) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">时期未找到</h2>
            <p className="text-muted-foreground mb-4">您要学习的历史时期不存在，请返回重新选择。</p>
            <Button onClick={() => router.push('/learn/history/framework')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回框架
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggleComparison = (index: number) => {
    setExpandedComparisons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const markPointComplete = (pointId: string) => {
    setCompletedPoints(prev => {
      const newSet = new Set(prev);
      newSet.add(pointId);
      return newSet;
    });
  };

  const eraIndex = HISTORY_ERAS.findIndex(e => e.id === era.id);
  const prevEra = eraIndex > 0 ? HISTORY_ERAS[eraIndex - 1] : null;
  const nextEra = eraIndex < HISTORY_ERAS.length - 1 ? HISTORY_ERAS[eraIndex + 1] : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/learn/history/framework')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">{era.name}</h1>
            <p className="text-sm text-muted-foreground">{era.period}</p>
          </div>
        </div>

        {/* 学习导航 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="summary" className="text-xs">
              <Target className="h-4 w-4 mr-1" />
              时代特征
            </TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs">
              <BarChart3 className="h-4 w-4 mr-1" />
              三线对比
            </TabsTrigger>
            <TabsTrigger value="fourinone" className="text-xs">
              <BookMarked className="h-4 w-4 mr-1" />
              四合一
            </TabsTrigger>
            <TabsTrigger value="conclusions" className="text-xs">
              <Lightbulb className="h-4 w-4 mr-1" />
              核心结论
            </TabsTrigger>
            <TabsTrigger value="liaoning" className="text-xs">
              <MapPin className="h-4 w-4 mr-1" />
              辽宁专题
            </TabsTrigger>
          </TabsList>

          {/* 时代特征 */}
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  时代特征总括
                  <Badge variant="outline" className="ml-auto">🔑必背</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">🇨🇳 中国</h3>
                  <p className="text-slate-700 leading-relaxed">{era.summary.china}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-800 mb-2">🌍 世界</h3>
                  <p className="text-slate-700 leading-relaxed">{era.summary.world}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-medium text-amber-800 mb-2">🔗 中外关系</h3>
                  <p className="text-slate-700 leading-relaxed">{era.summary.relation}</p>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => markPointComplete('summary')}
                  variant={completedPoints.has('summary') ? 'outline' : 'default'}
                >
                  <CheckCircle2 className={`h-4 w-4 mr-2 ${completedPoints.has('summary') ? 'text-green-500' : ''}`} />
                  {completedPoints.has('summary') ? '已掌握' : '标记为已掌握'}
                </Button>
              </CardContent>
            </Card>

            {/* AI学习助手 */}
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-indigo-500" />
                  AI学习助手
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="justify-start">
                    ❓ 这个时期的特征是什么？
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    📝 大题可能怎么考？
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    🎯 选择题定位关键是什么？
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start">
                    ⚠️ 有哪些易错易混点？
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 三线对比 */}
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                  中外三线对比表
                  <Badge variant="outline" className="ml-auto">📊大题素材</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {era.comparison.map((item, index) => {
                  const isExpanded = expandedComparisons.has(index);
                  
                  return (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleComparison(index)}
                        className="w-full p-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">{item.time}</span>
                          {item.isAnchor && (
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">⭐转折</Badge>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="p-3 space-y-3 bg-white">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <h4 className="font-medium text-blue-700 mb-2 text-sm">🇨🇳 中国</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-slate-500">政治：</span>
                                  <p className="text-slate-700">{item.china.political}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">经济：</span>
                                  <p className="text-slate-700">{item.china.economic}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">文化：</span>
                                  <p className="text-slate-700">{item.china.cultural}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <h4 className="font-medium text-purple-700 mb-2 text-sm">🌍 世界</h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-slate-500">政治：</span>
                                  <p className="text-slate-700">{item.world.political}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">经济：</span>
                                  <p className="text-slate-700">{item.world.economic}</p>
                                </div>
                                <div>
                                  <span className="text-slate-500">文化：</span>
                                  <p className="text-slate-700">{item.world.cultural}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <h4 className="font-medium text-amber-700 mb-2 text-sm flex items-center gap-1">
                              <Lightbulb className="h-4 w-4" />
                              核心对比结论
                            </h4>
                            <p className="text-slate-700">{item.conclusion}</p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant={completedPoints.has(`comparison-${index}`) ? 'outline' : 'default'}
                            onClick={() => markPointComplete(`comparison-${index}`)}
                            className="w-full"
                          >
                            <CheckCircle2 className={`h-4 w-4 mr-2 ${completedPoints.has(`comparison-${index}`) ? 'text-green-500' : ''}`} />
                            {completedPoints.has(`comparison-${index}`) ? '已掌握' : '标记为已掌握'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 四合一 */}
          <TabsContent value="fourinone" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-red-500" />
                  四合一栏目
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    辽宁地方史
                  </h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{era.fourInOne.liaoning}</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    选必融合
                  </h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{era.fourInOne.required}</p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h3 className="font-medium text-amber-700 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    史料类型
                  </h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{era.fourInOne.sources}</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h3 className="font-medium text-purple-700 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    学术视角
                  </h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{era.fourInOne.academic}</p>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => markPointComplete('fourinone')}
                  variant={completedPoints.has('fourinone') ? 'outline' : 'default'}
                >
                  <CheckCircle2 className={`h-4 w-4 mr-2 ${completedPoints.has('fourinone') ? 'text-green-500' : ''}`} />
                  {completedPoints.has('fourinone') ? '已掌握' : '标记为已掌握'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 核心结论 */}
          <TabsContent value="conclusions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-green-500" />
                  核心对比结论
                  <Badge variant="outline" className="ml-auto">💡大题金句</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {era.coreConclusions.map((conclusion, index) => (
                  <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{conclusion}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2"
                      onClick={() => markPointComplete(`conclusion-${index}`)}
                    >
                      <CheckCircle2 className={`h-4 w-4 mr-1 ${completedPoints.has(`conclusion-${index}`) ? 'text-green-500' : 'text-slate-400'}`} />
                      <span className="text-xs">{completedPoints.has(`conclusion-${index}`) ? '已掌握' : '标记为已掌握'}</span>
                    </Button>
                  </div>
                ))}
                
                <div className="p-4 bg-slate-100 rounded-lg">
                  <h4 className="font-medium text-slate-700 mb-2">📝 大题答题提示</h4>
                  <p className="text-sm text-slate-600">
                    答题时先用时代特征总括确定时期，再用核心对比结论作为总结句，
                    中间用三线对比表中的内容填充答案。
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 辽宁专题 */}
          <TabsContent value="liaoning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  辽宁地方史
                  <Badge className="ml-auto bg-red-100 text-red-700 border-red-200">🏠辽宁卷高频</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {era.liaoningDetail ? (
                  <div className="space-y-3">
                    {era.liaoningDetail.events.map((event, index) => (
                      <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-white">{event.time}</Badge>
                        </div>
                        <h4 className="font-medium text-slate-800 mb-1">{event.name}</h4>
                        <p className="text-sm text-slate-600">{event.significance}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500">
                    <p>该时期暂无专门的辽宁地方史内容</p>
                    <p className="text-sm mt-2">请查看其他时期或辽宁"六地"专题</p>
                  </div>
                )}
                
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => router.push('/learn/history/framework/liaoning')}
                >
                  <Scroll className="h-4 w-4 mr-2" />
                  查看完整辽宁"六地"专题
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 上下时期导航 */}
        <div className="flex justify-between">
          {prevEra ? (
            <Button 
              variant="outline" 
              onClick={() => router.push(`/learn/history/framework/${prevEra.id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              上一时期：{prevEra.name.slice(0, 15)}...
            </Button>
          ) : (
            <div />
          )}
          {nextEra && (
            <Button 
              onClick={() => router.push(`/learn/history/framework/${nextEra.id}`)}
            >
              下一时期：{nextEra.name.slice(0, 15)}...
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
