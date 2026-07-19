'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Clock, Brain, Link2, Layers, FileQuestion,
  BookMarked, GitCompare, Target, Play, CheckCircle, X, ChevronRight
} from 'lucide-react';
import { releasedUnits } from '@/data/history/units';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ConceptItem {
  id: string;
  name: string;
  category: string;
  definition: string;
  keyPoints?: string[];
  importance: number;
  gaokaoFocus?: string;
}

interface TimelineEvent {
  id?: string;
  year: number | string;
  yearEnd?: number | string;
  title: string;
  category?: string;
  dynasty?: string;
  summary?: string;
  effects?: string;
  causes?: string;
  significance?: string;
  location?: string;
  figures?: string[];
  examPoints?: string[];
  difficulty?: string;
  importance?: number;
}

interface CausalLink {
  from: string;
  to: string;
  description: string;
}

interface CardItem {
  id: string;
  front: string;
  back: string;
  category: string;
}

export default function UnitLearningPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params.unitId as string;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [concepts, setConcepts] = useState<ConceptItem[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [causalLinks, setCausalLinks] = useState<CausalLink[]>([]);
  const [cards, setCards] = useState<CardItem[]>([]);
  
  // 详情对话框状态
  const [detailDialog, setDetailDialog] = useState<{open: boolean; type: string; data: any}>({
    open: false, type: '', data: null
  });
  const [loading, setLoading] = useState(true);
  
  const unit = releasedUnits.find(u => u.id === unitId);

  // 从Supabase加载数据
  useEffect(() => {
    async function loadData() {
      if (!unitId) return;
      
      setLoading(true);
      try {
        // 加载必背知识点
        const mustKnowRes = await fetch(`/api/history/must-know?unitId=${unitId}`);
        const mustKnowData = await mustKnowRes.json();
        if (mustKnowData.success && mustKnowData.data?.items) {
          const formattedConcepts: ConceptItem[] = mustKnowData.data.items.map((item: any) => ({
            id: item.id,
            name: item.title,
            category: item.dynasty || item.gaokaoFocus?.split('·')[0] || '知识点',
            definition: item.content,
            keyPoints: item.explanation?.split('。').filter(Boolean),
            importance: item.importance,
            gaokaoFocus: item.gaokaoFocus
          }));
          setConcepts(formattedConcepts);
        }

        // 加载时间轴数据
        const timelineRes = await fetch(`/api/history/timeline-data?unitId=${unitId}`);
        const timelineData = await timelineRes.json();
        if (timelineData.success && timelineData.data?.events) {
          setEvents(timelineData.data.events.slice(0, 20).map((e: any) => ({
            year: e.year?.toString() || '',
            title: e.title || e.title,
            category: e.category || e.difficulty || '政治',
            importance: e.importance || 3
          })));
        }

        // 加载因果链数据
        const causalRes = await fetch(`/api/history/causal-chain?unitId=${unitId}`);
        const causalData = await causalRes.json();
        if (causalData.success && causalData.data?.links) {
          setCausalLinks(causalData.data.links.slice(0, 10).map((link: any) => ({
            from: link.from,
            to: link.to,
            description: link.description
          })));
        }

        // 加载历史卡牌数据
        const cardsRes = await fetch(`/api/history/cards?unitId=${unitId}`);
        const cardsData = await cardsRes.json();
        if (cardsData.success && cardsData.data?.cards) {
          setCards(cardsData.data.cards.slice(0, 15).map((card: any) => ({
            id: card.id,
            front: card.front || card.title,
            back: card.back || card.answer || card.description,
            category: card.category || '知识点'
          })));
        }

      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [unitId]);

  if (!unit) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">单元不存在</p>
            <Button onClick={() => router.push('/subjects/history')}>
              返回历史学科
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      {/* 顶部导航和Tab栏 - 整体固定 */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        {/* 单元标题栏 - 紧凑无间隙 */}
        <div className="px-4 py-2 border-b border-slate-100">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="h-7" onClick={() => router.push('/subjects/history')}>
                <ArrowLeft className="h-4 w-4 mr-1" /> 返回
              </Button>
              <h1 className="font-bold text-base">{unit.name}</h1>
              <p className="text-xs text-muted-foreground line-clamp-1 hidden sm:block">{unit.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {unit.liaoningSummary && (
                <Badge variant="outline" className="bg-red-50 text-xs">
                  {unit.liaoningSummary.totalQuestions}题 · {unit.liaoningSummary.totalScore}分
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* 学习功能Tab栏 */}
        <div className="max-w-6xl mx-auto px-4 py-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 w-full bg-slate-100/50 h-auto">
              <TabsTrigger value="overview" className="text-xs py-1.5">
                <BookMarked className="h-3.5 w-3.5 mr-1" /> 总览
              </TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs py-1.5">
                <Clock className="h-3.5 w-3.5 mr-1" /> 时间轴
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="text-xs py-1.5">
                <Brain className="h-3.5 w-3.5 mr-1" /> 知识点
              </TabsTrigger>
              <TabsTrigger value="category" className="text-xs py-1.5">
                <GitCompare className="h-3.5 w-3.5 mr-1" /> 分类
              </TabsTrigger>
              <TabsTrigger value="causal" className="text-xs py-1.5">
                <Link2 className="h-3.5 w-3.5 mr-1" /> 因果链
              </TabsTrigger>
              <TabsTrigger value="cards" className="text-xs py-1.5">
                <Layers className="h-3.5 w-3.5 mr-1" /> 卡牌
              </TabsTrigger>
              <TabsTrigger value="practice" className="text-xs py-1.5">
                <FileQuestion className="h-3.5 w-3.5 mr-1" /> 练习
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            {/* ====== 总览 ====== */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 课时列表 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      课时列表
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(unit.lessons || []).map((lessonId, idx) => (
                        <div key={lessonId} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100">
                          <Badge variant="outline">{idx + 1}</Badge>
                          <span className="text-sm">
                            {lessonId.includes('l1') ? '中华文明的起源与早期国家' :
                             lessonId.includes('l2') ? '诸侯纷争与民族交融' :
                             lessonId.includes('l3') ? '秦统一多民族封建国家' :
                             lessonId.includes('l4') ? '两汉大一统' :
                             `第${idx + 1}课`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 核心考点 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <GitCompare className="h-4 w-4 text-purple-500" />
                      高频考点
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {concepts.filter(c => c.importance >= 4).slice(0, 8).map((concept) => (
                        <div key={concept.id} className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
                          <CheckCircle className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">{concept.name}</span>
                        </div>
                      ))}
                      {unit.liaoningSummary?.highFrequencyTopics?.map((topic, idx) => (
                        <div key={`hf-${idx}`} className="flex items-center gap-2 p-2 rounded-lg bg-red-50">
                          <Badge variant="outline" className="text-xs">★★★</Badge>
                          <span className="text-sm">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 数据统计 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">数据统计</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 rounded-lg bg-blue-50">
                        <div className="text-2xl font-bold text-blue-600">{concepts.length}</div>
                        <div className="text-xs text-muted-foreground">知识点</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-50">
                        <div className="text-2xl font-bold text-green-600">{events.length}</div>
                        <div className="text-xs text-muted-foreground">时间轴事件</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-purple-50">
                        <div className="text-2xl font-bold text-purple-600">{causalLinks.length}</div>
                        <div className="text-xs text-muted-foreground">因果关系</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-amber-50">
                        <div className="text-2xl font-bold text-amber-600">{cards.length}</div>
                        <div className="text-xs text-muted-foreground">记忆卡牌</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 开始练习 */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <Play className="h-10 w-10 mx-auto mb-3 text-green-600" />
                    <h3 className="font-bold text-lg text-green-800 mb-2">开始综合练习</h3>
                    <p className="text-sm text-green-600 mb-4">检验学习成果 · 高考真题</p>
                    <Button className="bg-green-500 hover:bg-green-600" onClick={() => router.push(`/learn/history/practice`)}>
                      进入练习
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ====== 时间轴 ====== */}
            <TabsContent value="timeline">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    时间轴 - {unit.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">共 {events.length} 个历史事件，点击查看详情</p>
                </CardHeader>
                <CardContent>
                  {events.length > 0 ? (
                    <div className="space-y-3">
                      {events.map((event, idx) => {
                        const imp = event.importance || 3;
                        const displayYear = typeof event.year === 'number' 
                          ? (event.year < 0 ? `前${Math.abs(event.year)}年` : `${event.year}年`)
                          : event.year;
                        // 查找相关知识点
                        const relatedConcepts = concepts.filter(c => 
                          c.name.includes(event.title) || 
                          event.title.includes(c.name) ||
                          (event.summary && c.definition.includes(event.title.substring(0, 4)))
                        ).slice(0, 3);
                        return (
                        <div 
                          key={idx} 
                          className="flex gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors"
                          onClick={() => setDetailDialog({open: true, type: 'timeline', data: {event, relatedConcepts}})}
                        >
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              imp >= 5 ? 'bg-red-500' :
                              imp >= 4 ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            {idx < events.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 min-h-[40px]" />}
                          </div>
                          <div className={`flex-1 p-3 rounded-lg ${
                            imp >= 5 ? 'bg-red-50 border border-red-200' :
                            imp >= 4 ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-slate-200'
                          }`}>
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <Badge variant="outline" className="font-mono text-xs">{displayYear}</Badge>
                              {event.dynasty && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">{event.dynasty}</Badge>
                              )}
                              {event.category && (
                                <Badge className={`text-xs ${
                                  event.category === '政治' ? 'bg-blue-100 text-blue-700' :
                                  event.category === '经济' ? 'bg-green-100 text-green-700' :
                                  event.category === '文化' ? 'bg-purple-100 text-purple-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {event.category}
                                </Badge>
                              )}
                              {imp >= 4 && (
                                <div className="flex">
                                  {Array.from({ length: Math.min(imp, 5) }).map((_, i) => (
                                    <span key={i} className="text-red-500 text-xs">★</span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="font-semibold text-slate-800 mb-1">{event.title}</p>
                            {event.summary && (
                              <p className="text-sm text-slate-600 line-clamp-2 mb-1">{event.summary}</p>
                            )}
                            {/* 显示相关知识点 - 可点击 */}
                            {relatedConcepts.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {relatedConcepts.map((c, ci) => (
                                  <button
                                    key={ci}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetailDialog({open: true, type: 'knowledge', data: c});
                                    }}
                                    className="px-2 py-0.5 rounded-full text-xs bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 hover:border-pink-300 transition-colors cursor-pointer"
                                  >
                                    {c.name} →
                                  </button>
                                ))}
                              </div>
                            )}
                            {event.effects && (
                              <p className="text-xs text-slate-500 mt-1">
                                <span className="font-medium">影响：</span>{event.effects.substring(0, 50)}...
                              </p>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">暂无时间轴数据</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ====== 知识点 ====== */}
            <TabsContent value="knowledge">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-4 w-4 text-pink-500" />
                    必背知识点
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">共 {concepts.length} 个，高频考点 {concepts.filter(c => c.importance >= 4).length} 个，点击卡片查看详情</p>
                </CardHeader>
                <CardContent>
                  {concepts.length > 0 ? (
                    <div className="space-y-3">
                      {concepts.map((concept) => (
                        <div 
                          key={concept.id} 
                          className="p-4 rounded-lg bg-white border hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                          onClick={() => setDetailDialog({open: true, type: 'knowledge', data: concept})}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-800">{concept.name}</h3>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="flex gap-1">
                              {Array.from({ length: concept.importance }).map((_, i) => (
                                <span key={i} className="text-red-500">★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{concept.definition}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {concept.gaokaoFocus && (
                              <Badge variant="outline" className="text-xs bg-blue-50">{concept.gaokaoFocus}</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">{concept.category}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">暂无知识点数据</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ====== 分类 ====== */}
            <TabsContent value="category">
              <div className="space-y-4">
                {/* 政治 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge className="bg-blue-500">政</Badge>
                      政治类知识点
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">共 {concepts.filter(c => c.category?.includes('政治') || c.name?.includes('制') || c.name?.includes('法') || c.name?.includes('皇')).length} 个</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {concepts.filter(c => c.category?.includes('政治') || c.name?.includes('制') || c.name?.includes('法') || c.name?.includes('皇')).map((concept) => (
                        <div 
                          key={concept.id}
                          className="p-3 rounded-lg bg-blue-50 border border-blue-100 hover:shadow-md cursor-pointer"
                          onClick={() => setDetailDialog({open: true, type: 'knowledge', data: concept})}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-800 text-sm">{concept.name}</h3>
                            <div className="flex gap-0.5">
                              {Array.from({ length: concept.importance }).map((_, i) => (
                                <span key={i} className="text-red-500 text-xs">★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{concept.definition}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 经济 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge className="bg-green-500">经</Badge>
                      经济类知识点
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">共 {concepts.filter(c => c.category?.includes('经济') || c.name?.includes('经济') || c.name?.includes('农业') || c.name?.includes('商业')).length} 个</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {concepts.filter(c => c.category?.includes('经济') || c.name?.includes('经济') || c.name?.includes('农业') || c.name?.includes('商业')).map((concept) => (
                        <div 
                          key={concept.id}
                          className="p-3 rounded-lg bg-green-50 border border-green-100 hover:shadow-md cursor-pointer"
                          onClick={() => setDetailDialog({open: true, type: 'knowledge', data: concept})}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-800 text-sm">{concept.name}</h3>
                            <div className="flex gap-0.5">
                              {Array.from({ length: concept.importance }).map((_, i) => (
                                <span key={i} className="text-red-500 text-xs">★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{concept.definition}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 文化/思想 */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge className="bg-purple-500">文</Badge>
                      文化思想类知识点
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">共 {concepts.filter(c => c.category?.includes('文化') || c.category?.includes('思想') || c.name?.includes('学') || c.name?.includes('儒') || c.name?.includes('家')).length} 个</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {concepts.filter(c => c.category?.includes('文化') || c.category?.includes('思想') || c.name?.includes('学') || c.name?.includes('儒') || c.name?.includes('家')).map((concept) => (
                        <div 
                          key={concept.id}
                          className="p-3 rounded-lg bg-purple-50 border border-purple-100 hover:shadow-md cursor-pointer"
                          onClick={() => setDetailDialog({open: true, type: 'knowledge', data: concept})}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-800 text-sm">{concept.name}</h3>
                            <div className="flex gap-0.5">
                              {Array.from({ length: concept.importance }).map((_, i) => (
                                <span key={i} className="text-red-500 text-xs">★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{concept.definition}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 重要考点 */}
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge className="bg-red-500">高</Badge>
                      高频考点（重要性 ≥ 4）
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">高考重点考查内容，需熟练掌握</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {concepts.filter(c => c.importance >= 4).map((concept) => (
                        <div 
                          key={concept.id}
                          className="p-3 rounded-lg bg-white border border-red-200 hover:shadow-md cursor-pointer"
                          onClick={() => setDetailDialog({open: true, type: 'knowledge', data: concept})}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-800 text-sm">{concept.name}</h3>
                            <div className="flex gap-0.5">
                              {Array.from({ length: concept.importance }).map((_, i) => (
                                <span key={i} className="text-red-500 text-xs">★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">{concept.definition}</p>
                          {concept.gaokaoFocus && (
                            <Badge variant="outline" className="text-xs bg-red-50 mt-1">{concept.gaokaoFocus}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ====== 因果链 ====== */}
            <TabsContent value="causal">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-purple-500" />
                    因果关系链
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">共 {causalLinks.length} 条因果关系，点击查看详情</p>
                </CardHeader>
                <CardContent>
                  {causalLinks.length > 0 ? (
                    <div className="space-y-4">
                      {causalLinks.map((link, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 rounded-lg bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border border-slate-200 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setDetailDialog({open: true, type: 'causal', data: link})}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="px-3 py-2 rounded-lg bg-blue-100 border border-blue-300 text-sm font-semibold text-blue-800">
                              {link.from}
                            </div>
                            <div className="flex-1 relative flex items-center">
                              <div className="h-0.5 flex-1 bg-purple-400" />
                              <div className="px-2 py-0.5 bg-purple-100 text-xs font-medium text-purple-700 rounded-full">
                                导致
                              </div>
                              <div className="h-0.5 flex-1 bg-green-400" />
                            </div>
                            <div className="px-3 py-2 rounded-lg bg-green-100 border border-green-300 text-sm font-semibold text-green-800">
                              {link.to}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2 pl-2">
                            <span className="font-medium text-purple-700">原因：</span>{link.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">暂无因果链数据</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ====== 卡牌 ====== */}
            <TabsContent value="cards">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4 text-cyan-500" />
                    历史卡牌
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">共 {cards.length} 张记忆卡牌，点击卡片查看详情</p>
                </CardHeader>
                <CardContent>
                  {cards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-100 hover:shadow-lg transition-all cursor-pointer"
                          onClick={() => setDetailDialog({open: true, type: 'card', data: card})}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted-foreground">{card.category}</span>
                            <ChevronRight className="h-4 w-4 text-cyan-400" />
                          </div>
                          <h3 className="font-semibold text-slate-800 mb-2">{card.front}</h3>
                          <div className="h-px bg-cyan-200 my-2" />
                          <p className="text-sm text-slate-600 line-clamp-3">{card.back}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">暂无卡牌数据</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ====== 练习 ====== */}
            <TabsContent value="practice">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-8 text-center">
                  <FileQuestion className="h-16 w-16 mx-auto mb-4 text-green-600" />
                  <h3 className="font-bold text-xl text-green-800 mb-3">综合练习</h3>
                  <p className="text-green-600 mb-6 max-w-md mx-auto">
                    包含选择题、填空题、材料分析题等多种题型，覆盖单元所有知识点
                  </p>
                  <Button size="lg" className="bg-green-500 hover:bg-green-600" onClick={() => router.push('/learn/history/practice')}>
                    <Play className="h-5 w-5 mr-2" />
                    开始练习
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* 详情对话框 */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({...detailDialog, open})}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {detailDialog.type === 'knowledge' && `知识点：${detailDialog.data?.name}`}
              {detailDialog.type === 'causal' && '因果关系详情'}
              {detailDialog.type === 'timeline' && `历史事件：${detailDialog.data?.event?.title}`}
              {detailDialog.type === 'card' && `卡牌：${detailDialog.data?.front}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            {/* 知识点详情 */}
            {detailDialog.type === 'knowledge' && detailDialog.data && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-pink-100 text-pink-700">重要性：{detailDialog.data.importance}星</Badge>
                  <Badge variant="outline">{detailDialog.data.category}</Badge>
                  {detailDialog.data.gaokaoFocus && (
                    <Badge className="bg-blue-50 text-blue-700">{detailDialog.data.gaokaoFocus}</Badge>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">内容</h4>
                  <p className="text-slate-700 whitespace-pre-wrap">{detailDialog.data.definition}</p>
                </div>
                {detailDialog.data.keyPoints && detailDialog.data.keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">关键点</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {detailDialog.data.keyPoints.map((p: string, i: number) => (
                        <li key={i} className="text-slate-600">{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 因果链详情 */}
            {detailDialog.type === 'causal' && detailDialog.data && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-sm text-muted-foreground mb-1">原因</div>
                  <div className="font-semibold text-blue-800">{detailDialog.data.from}</div>
                </div>
                <div className="flex justify-center">
                  <div className="px-4 py-2 bg-purple-100 rounded-full text-purple-700 font-medium">
                    ↓ 导致 ↓
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-sm text-muted-foreground mb-1">结果</div>
                  <div className="font-semibold text-green-800">{detailDialog.data.to}</div>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-sm font-semibold mb-2 text-purple-700">因果关系说明</div>
                  <p className="text-slate-700">{detailDialog.data.description}</p>
                </div>
              </div>
            )}

            {/* 时间轴详情 */}
            {detailDialog.type === 'timeline' && detailDialog.data && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                    {typeof detailDialog.data.event?.year === 'number' 
                      ? (detailDialog.data.event.year < 0 ? `前${Math.abs(detailDialog.data.event.year)}年` : `${detailDialog.data.event.year}年`)
                      : detailDialog.data.event?.year}
                  </Badge>
                  {detailDialog.data.event?.dynasty && (
                    <Badge className="bg-orange-100 text-orange-700">{detailDialog.data.event.dynasty}</Badge>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">事件概述</h4>
                  <p className="text-slate-700">{detailDialog.data.event?.summary || detailDialog.data.event?.title}</p>
                </div>
                {detailDialog.data.event?.effects && (
                  <div>
                    <h4 className="font-semibold mb-2">历史影响</h4>
                    <p className="text-slate-700">{detailDialog.data.event.effects}</p>
                  </div>
                )}
                {detailDialog.data.event?.causes && (
                  <div>
                    <h4 className="font-semibold mb-2">历史原因</h4>
                    <p className="text-slate-700">{detailDialog.data.event.causes}</p>
                  </div>
                )}
                {detailDialog.data.relatedConcepts && detailDialog.data.relatedConcepts.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">相关知识点</h4>
                    <div className="flex flex-wrap gap-2">
                      {detailDialog.data.relatedConcepts.map((c: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setDetailDialog({open: true, type: 'knowledge', data: c})}
                          className="px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 hover:border-pink-300 transition-colors cursor-pointer text-sm"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 卡牌详情 */}
            {detailDialog.type === 'card' && detailDialog.data && (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 text-center">
                  <div className="text-sm text-muted-foreground mb-2">{detailDialog.data.category}</div>
                  <div className="text-2xl font-bold text-slate-800 mb-4">{detailDialog.data.front}</div>
                  <div className="h-px bg-cyan-300 my-4" />
                  <div className="text-slate-700 whitespace-pre-wrap">{detailDialog.data.back}</div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
