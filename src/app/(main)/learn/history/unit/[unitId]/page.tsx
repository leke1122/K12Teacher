'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Clock, Brain, Link2, Layers, FileQuestion,
  BookMarked, GitCompare, Target, Play, CheckCircle
} from 'lucide-react';
import { releasedUnits } from '@/data/history/units';

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
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/history')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> 返回
            </Button>
            <div>
              <h1 className="font-bold text-lg">{unit.name}</h1>
              <p className="text-xs text-muted-foreground line-clamp-1">{unit.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unit.liaoningSummary && (
              <Badge variant="outline" className="bg-red-50">
                {unit.liaoningSummary.totalQuestions}题 · {unit.liaoningSummary.totalScore}分
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">加载中...</div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full bg-white">
              <TabsTrigger value="overview" className="flex items-center gap-1">
                <BookMarked className="h-4 w-4" /> 总览
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> 时间轴
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="flex items-center gap-1">
                <Brain className="h-4 w-4" /> 知识点
              </TabsTrigger>
              <TabsTrigger value="causal" className="flex items-center gap-1">
                <Link2 className="h-4 w-4" /> 因果链
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex items-center gap-1">
                <Layers className="h-4 w-4" /> 卡牌
              </TabsTrigger>
            </TabsList>

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
                  <p className="text-sm text-muted-foreground">共 {events.length} 个历史事件</p>
                </CardHeader>
                <CardContent>
                  {events.length > 0 ? (
                    <div className="space-y-3">
                      {events.map((event, idx) => {
                        const imp = event.importance || 3;
                        const displayYear = typeof event.year === 'number' 
                          ? (event.year < 0 ? `前${Math.abs(event.year)}年` : `${event.year}年`)
                          : event.year;
                        return (
                        <div key={idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              imp >= 5 ? 'bg-red-500' :
                              imp >= 4 ? 'bg-amber-500' : 'bg-blue-500'
                            }`} />
                            {idx < events.length - 1 && <div className="w-0.5 h-full bg-slate-200 min-h-[60px]" />}
                          </div>
                          <div className={`flex-1 p-4 rounded-lg ${
                            imp >= 5 ? 'bg-red-50 border border-red-200' :
                            imp >= 4 ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50'
                          }`}>
                            <div className="flex items-center flex-wrap gap-2 mb-2">
                              <Badge variant="outline" className="font-mono">{displayYear}</Badge>
                              {event.dynasty && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-300">{event.dynasty}</Badge>
                              )}
                              {event.category && (
                                <Badge className={`text-xs ${
                                  event.category === '政治' ? 'bg-blue-100 text-blue-700' :
                                  event.category === '经济' ? 'bg-green-100 text-green-700' :
                                  event.category === '文化' ? 'bg-purple-100 text-purple-700' :
                                  event.category === '民族' ? 'bg-rose-100 text-rose-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {event.category}
                                </Badge>
                              )}
                              {event.difficulty && (
                                <Badge variant="outline" className="text-xs text-red-600">
                                  {event.difficulty}
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
                            {event.effects && (
                              <p className="text-xs text-slate-500 mt-1">
                                <span className="font-medium">影响：</span>{event.effects}
                              </p>
                            )}
                            {event.location && (
                              <p className="text-xs text-slate-400 mt-1">地点：{event.location}</p>
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
                </CardHeader>
                <CardContent>
                  {concepts.length > 0 ? (
                    <div className="space-y-3">
                      {concepts.map((concept) => (
                        <div key={concept.id} className="p-4 rounded-lg bg-white border hover:shadow-md transition-all">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-slate-800">{concept.name}</h3>
                            <div className="flex gap-1">
                              {Array.from({ length: concept.importance }).map((_, i) => (
                                <span key={i} className="text-red-500">★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-2 line-clamp-3">{concept.definition}</p>
                          {concept.gaokaoFocus && (
                            <Badge variant="outline" className="text-xs bg-blue-50">{concept.gaokaoFocus}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">暂无知识点数据</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ====== 因果链 ====== */}
            <TabsContent value="causal">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-purple-500" />
                    因果关系链
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {causalLinks.length > 0 ? (
                    <div className="space-y-4">
                      {causalLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-sm font-medium">
                            {link.from}
                          </div>
                          <div className="flex-1 relative">
                            <div className="h-0.5 bg-purple-300" />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                              导致
                            </span>
                          </div>
                          <div className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm font-medium">
                            {link.to}
                          </div>
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
                </CardHeader>
                <CardContent>
                  {cards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-100 hover:shadow-lg transition-all cursor-pointer"
                        >
                          <div className="text-xs text-muted-foreground mb-2">{card.category}</div>
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
          </Tabs>
        )}
      </div>
    </div>
  );
}
