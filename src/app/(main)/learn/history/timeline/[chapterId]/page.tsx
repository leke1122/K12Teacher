'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft,
  CalendarDays,
  GitBranch,
  MapPin,
  Users,
  Sparkles,
  Loader2,
  GitFork,
  MessageCircle,
  X,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Send,
} from 'lucide-react';
import CausalGraph, { CausalGraphLegend } from '@/components/history/CausalGraph';
import {
  timelineEvents,
  concepts,
  causalLinks,
  dynastyPeriods,
  generateAIContext,
  type TimelineEvent,
} from '@/data/history/unit1_data';

const CHAPTER_TITLES: Record<string, string> = {
  'unit1': '第一单元：从中华文明起源到秦汉统一',
  'modern-china': '中国近代史',
  'ln-gaokao': '辽宁高考历史',
};

function Unit1TimelinePage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = useMemo(
    () => (params.chapterId as string) || 'unit1',
    [params.chapterId],
  );

  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [graphDialogOpen, setGraphDialogOpen] = useState(false);
  const [highlightEventId, setHighlightEventId] = useState<string | undefined>();

  // AI 问答状态
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // 筛选状态
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // 筛选事件
  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'all') return timelineEvents;
    return timelineEvents.filter((e) => e.category === categoryFilter);
  }, [categoryFilter]);

  // 分类统计
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const event of timelineEvents) {
      stats[event.category] = (stats[event.category] || 0) + 1;
    }
    return stats;
  }, []);

  // 处理事件点击
  const handleEventClick = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    setHighlightEventId(event.id);
    setDetailDialogOpen(true);
  }, []);

  // 处理图谱点击
  const handleGraphEventClick = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    setHighlightEventId(event.id);
    setDetailDialogOpen(true);
  }, []);

  // 发送 AI 问题
  const handleAiAsk = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer('');
    try {
      // 从 localStorage 获取 API Key
      const settings = JSON.parse(localStorage.getItem('edumind-settings') || '{}');
      const apiKey = settings.deepseekApiKey || settings.deepseek_api_key || '';

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch('/api/history/qa', {
        method: 'POST',
        headers,
        body: JSON.stringify({ question: aiQuestion }),
      });
      const json = await response.json();
      if (json.success) {
        setAiAnswer(json.data.answer);
      } else {
        setAiAnswer(json.message || '抱歉，AI 服务暂时不可用。请检查是否已在设置页面配置 DeepSeek API Key。');
      }
    } catch {
      setAiAnswer('网络错误，请稍后重试。');
    } finally {
      setAiLoading(false);
    }
  };

  // 查找因果关系
  const getCausalLinks = useCallback((eventId: string) => {
    const causes = causalLinks.filter((c) => c.targetId === eventId);
    const results = causalLinks.filter((c) => c.sourceId === eventId);
    return { causes, results };
  }, []);

  const { causes, results } = useMemo(() => {
    if (!selectedEvent) return { causes: [], results: [] };
    return getCausalLinks(selectedEvent.id);
  }, [selectedEvent, getCausalLinks]);

  // 获取事件详情
  const getEventById = useCallback((id: string) => {
    return timelineEvents.find((e) => e.id === id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <div className="w-full px-4 py-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-amber-500" />
              📜 {CHAPTER_TITLES[chapterId] || '第一单元时间轴'}
            </h1>
            <p className="text-xs text-muted-foreground">
              高中历史统编版 · 必修中外历史纲要上册 · 共 {timelineEvents.length} 个核心事件
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setAiOpen(true)}
          >
            <MessageCircle className="h-4 w-4" />
            AI 助教
          </Button>
        </div>

        {/* 分类筛选 */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground mr-2">筛选类别：</span>
              <Button
                size="sm"
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => setCategoryFilter('all')}
              >
                全部 ({timelineEvents.length})
              </Button>
              {Object.entries(categoryStats).map(([cat, count]) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat} ({count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-3"
        >
          <TabsList>
            <TabsTrigger value="timeline" className="gap-1">
              <CalendarDays className="h-4 w-4" />
              垂直时间轴
            </TabsTrigger>
            <TabsTrigger value="graph" className="gap-1">
              <GitFork className="h-4 w-4" />
              因果图谱
            </TabsTrigger>
            <TabsTrigger value="concepts" className="gap-1">
              <BookOpen className="h-4 w-4" />
              概念词典
            </TabsTrigger>
          </TabsList>

          {/* 垂直时间轴 */}
          <TabsContent value="timeline">
            <div className="relative">
              {/* 时间轴中线 */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500" />

              {/* 时间轴事件 */}
              <div className="space-y-6 pl-4">
                {filteredEvents.map((event, index) => {
                  const colors: Record<string, string> = {
                    政治: 'border-amber-400 bg-amber-50',
                    经济: 'border-emerald-400 bg-emerald-50',
                    思想: 'border-violet-400 bg-violet-50',
                    文化: 'border-pink-400 bg-pink-50',
                    军事: 'border-red-400 bg-red-50',
                    社会: 'border-slate-400 bg-slate-50',
                  };
                  const color = colors[event.category] || colors.社会;

                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {/* 时间点 */}
                      <div className="relative z-10 flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full border-4 ${color} flex items-center justify-center bg-white shadow-sm`}>
                          <span className="text-xs font-bold text-slate-600">{index + 1}</span>
                        </div>
                      </div>

                      {/* 事件卡片 */}
                      <Card
                        className={`flex-1 cursor-pointer transition-all hover:shadow-md border-l-4 ${color}`}
                        onClick={() => handleEventClick(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <Badge variant="outline" className="text-xs mb-1">
                                {event.year} · {event.dynasty}
                              </Badge>
                              <h3 className="text-base font-bold text-slate-800">
                                {event.title}
                              </h3>
                            </div>
                            <Badge className="text-xs">
                              {event.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.summary}
                          </p>
                          {event.impact && (
                            <p className="text-xs text-amber-600 mt-2 font-medium">
                              ✦ {event.impact}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            {event.keyPeople && event.keyPeople.length > 0 && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.keyPeople.slice(0, 2).join('、')}
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                setHighlightEventId(event.id);
                                setGraphDialogOpen(true);
                              }}
                            >
                              <GitFork className="h-3 w-3 mr-1" />
                              查因果
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* 因果图谱 */}
          <TabsContent value="graph">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>因果链知识图谱</span>
                  <Badge variant="outline">{causalLinks.length} 条因果关系</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CausalGraphLegend />
                <div className="h-[600px] border rounded-lg overflow-hidden">
                  <CausalGraph
                    onEventClick={handleGraphEventClick}
                    highlightEventId={highlightEventId}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  点击节点查看详情，点击边查看因果逻辑
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 概念词典 */}
          <TabsContent value="concepts">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {concepts.map((concept) => {
                const colors: Record<string, string> = {
                  政治: 'border-amber-300',
                  经济: 'border-emerald-300',
                  思想: 'border-violet-300',
                  文化: 'border-pink-300',
                  军事: 'border-red-300',
                  社会: 'border-slate-300',
                };
                const color = colors[concept.category] || colors.社会;

                return (
                  <Card key={concept.id} className={`border-l-4 ${color}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-base font-bold text-slate-800">
                          {concept.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {concept.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {concept.definition}
                      </p>
                      {concept.keyPeople && concept.keyPeople.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2">
                          关键人物：{concept.keyPeople.join('、')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 事件详情弹窗 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-amber-500" />
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{selectedEvent.year}</Badge>
                  <Badge variant="outline">{selectedEvent.dynasty}</Badge>
                  <Badge>{selectedEvent.category}</Badge>
                  {selectedEvent.importance >= 4 && (
                    <Badge className="bg-amber-100 text-amber-700">核心考点</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      背景摘要
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedEvent.summary}
                    </p>
                  </div>

                  {selectedEvent.impact && (
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-amber-600">
                        ✦ 历史影响
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedEvent.impact}
                      </p>
                    </div>
                  )}

                  {selectedEvent.keyPeople && selectedEvent.keyPeople.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-400" />
                        关键人物
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {selectedEvent.keyPeople.map((person) => (
                          <Badge key={person} variant="secondary">
                            {person}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 因果关系 */}
                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <GitFork className="h-4 w-4 text-slate-400" />
                    因果关系
                  </h4>
                  {causes.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">前置原因：</p>
                      <div className="space-y-2">
                        {causes.map((link) => {
                          const sourceEvent = getEventById(link.sourceId);
                          return sourceEvent ? (
                            <div
                              key={link.id}
                              className="text-sm p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100"
                              onClick={() => handleEventClick(sourceEvent)}
                            >
                              <span className="font-medium">{sourceEvent.title}</span>
                              <p className="text-xs text-muted-foreground mt-1">{link.logic}</p>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  {results.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">后续结果：</p>
                      <div className="space-y-2">
                        {results.map((link) => {
                          const targetEvent = getEventById(link.targetId);
                          return targetEvent ? (
                            <div
                              key={link.id}
                              className="text-sm p-2 bg-amber-50 rounded cursor-pointer hover:bg-amber-100"
                              onClick={() => handleEventClick(targetEvent)}
                            >
                              <span className="font-medium">{targetEvent.title}</span>
                              <p className="text-xs text-muted-foreground mt-1">{link.logic}</p>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                  {causes.length === 0 && results.length === 0 && (
                    <p className="text-sm text-muted-foreground">暂无因果关系数据</p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 因果图谱弹窗 */}
      <Dialog open={graphDialogOpen} onOpenChange={setGraphDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitFork className="h-5 w-5 text-amber-500" />
              因果链知识图谱
            </DialogTitle>
          </DialogHeader>
          <div className="h-[70vh]">
            <CausalGraph
              onEventClick={handleGraphEventClick}
              highlightEventId={highlightEventId}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* AI 助教悬浮窗 */}
      {aiOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border flex flex-col z-50">
          <div className="flex items-center justify-between p-3 border-b bg-slate-50 rounded-t-lg">
            <h3 className="font-bold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              第一单元 AI 助教
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setAiOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded">
              💡 我是第一单元的专属学习助手，可以回答关于从中华文明起源到秦汉统一的相关问题。
            </div>

            {aiAnswer && (
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{aiAnswer}</p>
              </div>
            )}

            {aiLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI 思考中...
              </div>
            )}
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                placeholder="输入你的问题..."
                className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button
                size="sm"
                onClick={handleAiAsk}
                disabled={aiLoading || !aiQuestion.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Unit1TimelinePageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <Unit1TimelinePage />
    </Suspense>
  );
}
