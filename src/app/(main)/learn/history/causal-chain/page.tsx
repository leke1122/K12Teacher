'use client';

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft,
  GitFork,
  CalendarDays,
  MapPin,
  Users,
  BookOpen,
  GraduationCap,
  MessageCircle,
  Send,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import CausalGraph, { CausalGraphLegend } from '@/components/history/CausalGraph';
import {
  timelineEvents as builtinTimelineEvents,
  concepts as builtinConcepts,
  causalLinks as builtinCausalLinks,
  type TimelineEvent,
} from '@/data/history/unit1_data';
import type { CausalChain } from '@/app/api/history/causal-chain/route';
import { useTextbooks } from '@/hooks/useTextbooks';

const DEFAULT_KNOWLEDGE = {
  timelineEvents: [] as TimelineEvent[],
  causalLinks: [] as typeof builtinCausalLinks,
  concepts: [] as typeof builtinConcepts,
};

function CausalChainPageInner() {
  const params = useParams();
  const chapterId = useMemo(() => (params.chapterId as string) || 'unit1', [params.chapterId]);
  const unitId = useMemo(() => (params.unitId as string) || chapterId, [params.unitId, chapterId]);
  const { chapters } = useTextbooks('history');

  const [activeTab, setActiveTab] = useState('graph');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [highlightEventId, setHighlightEventId] = useState<string | undefined>();
  const [dataSource, setDataSource] = useState<string>('builtin');

  const [chain, setChain] = useState<CausalChain | null>(null);
  const [chainLoading, setChainLoading] = useState(false);
  const [chainError, setChainError] = useState<string | null>(null);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDataSource, setAiDataSource] = useState<string>('');

  const [knowledgeData, setKnowledgeData] = useState(DEFAULT_KNOWLEDGE);
  const [knowledgeLoading, setKnowledgeLoading] = useState(true);

  // 根据 chapterId 查找章节标题
  const chapterTitle = useMemo(() => {
    for (const ch of chapters) {
      if (String(ch.chapterIndex) === chapterId || ch.chapterIndex?.toString() === chapterId) {
        return `第${ch.chapterIndex}单元 ${ch.chapterTitle}`;
      }
    }
    return '历史';
  }, [chapters, chapterId]);

  const loadKnowledgeData = useCallback(async () => {
    setKnowledgeLoading(true);
    try {
      const response = await fetch('/api/history/knowledge/extract-by-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId: unitId, unitId, textbookId: 'history-default' }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        const events = data.data.timelineEvents || [];
        if (events.length > 0) {
          setKnowledgeData({
            timelineEvents: events,
            causalLinks: data.data.causalLinks || [],
            concepts: data.data.concepts || [],
          });
          setDataSource(data.source || '');
          return;
        }
      }
    } catch {
      // 降级到内置数据
    } finally {
      setKnowledgeLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    setSelectedEvent(null);
    setChain(null);
    setChainError(null);
    loadKnowledgeData();
  }, [chapterId, unitId, loadKnowledgeData]);

  const timelineEvents = useMemo(
    () => knowledgeData.timelineEvents.length ? knowledgeData.timelineEvents : builtinTimelineEvents,
    [knowledgeData.timelineEvents],
  );

  const causalLinks = useMemo(
    () => knowledgeData.causalLinks.length ? knowledgeData.causalLinks : builtinCausalLinks,
    [knowledgeData.causalLinks],
  );

  const concepts = useMemo(
    () => knowledgeData.concepts.length ? knowledgeData.concepts : builtinConcepts,
    [knowledgeData.concepts],
  );

  const loadChain = async () => {
    setChainLoading(true);
    setChainError(null);
    try {
      const response = await fetch('/api/history/causal-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName: selectedEvent?.title || chapterId, chapterId, unitId }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || '加载失败');
      }
      setChain(json.data);
      setDataSource(json.source || 'generated');
    } catch (err) {
      setChainError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setChainLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      loadChain();
    }
  }, [selectedEvent]);

  const handleEventClick = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    setHighlightEventId(event.id);
    setDetailDialogOpen(true);
  }, []);

  const handleAiAsk = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer('');
    try {
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
        setAiDataSource(json.data.dataSource || 'builtin');
      } else {
        setAiAnswer(json.message || '抱歉，AI 服务暂时不可用。请检查是否已在设置页面配置 DeepSeek API Key。');
      }
    } catch {
      setAiAnswer('网络错误，请稍后重试。');
    } finally {
      setAiLoading(false);
    }
  };

  const currentCauses = chain?.farCauses || [];
  const currentEffects = chain?.directEffects || [];
  const relatedConcepts = useMemo(() => {
    if (!chain) return concepts;
    const lower = (chain.eventName || '').toLowerCase();
    return concepts.filter(c => c.name.toLowerCase().includes(lower) || c.definition.toLowerCase().includes(lower));
  }, [chain]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <div className="w-full px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/history">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <GitFork className="h-5 w-5 text-purple-500" />
              历史因果链分析
            </h1>
            <p className="text-xs text-muted-foreground">
              高中历史统编版 · {chapterTitle} · {timelineEvents.length} 个核心事件
              {dataSource === 'docx' && <span className="ml-2 text-emerald-600">📝 您导入的知识点</span>}
              {dataSource === 'builtin' && <span className="ml-2 text-muted-foreground">📚 教材内置知识</span>}
              {knowledgeLoading && <span className="ml-2 text-muted-foreground">正在加载知识点...</span>}
            </p>
            {dataSource && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs font-normal">
                  {dataSource === 'docx' ? '📝 您导入的知识点' : '📚 教材内置知识'}
                </Badge>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setAiOpen(true)}>
            <MessageCircle className="h-4 w-4" />
            AI 助教
          </Button>
        </div>

        {selectedEvent && (
          <Card className="mb-4 border-purple-200 bg-purple-50">
            <CardContent className="p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">当前分析：{selectedEvent.title}</p>
                <p className="text-xs text-purple-700">
                  {selectedEvent.year} · {selectedEvent.dynasty} · {selectedEvent.category}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelectedEvent(null)}>
                重置
              </Button>
            </CardContent>
          </Card>
        )}

        {chainLoading && (
          <Card className="mb-4">
            <CardContent className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              正在生成因果链...
            </CardContent>
          </Card>
        )}

        {chainError && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="p-3 text-sm text-red-700">{chainError}</CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList>
            <TabsTrigger value="graph" className="gap-1">
              <GitFork className="h-4 w-4" />
              因果图谱
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-1">
              <BookOpen className="h-4 w-4" />
              因果列表
            </TabsTrigger>
            <TabsTrigger value="concepts" className="gap-1">
              <GraduationCap className="h-4 w-4" />
              核心概念
            </TabsTrigger>
          </TabsList>

          <TabsContent value="graph">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>历史事件因果关系图谱</span>
                  <Badge variant="outline">{causalLinks.length} 条因果关系</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CausalGraphLegend />
                <div className="h-[600px] border rounded-lg overflow-hidden">
                  <CausalGraph
                    onEventClick={handleEventClick}
                    highlightEventId={highlightEventId}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">点击节点查看详情，点击边查看因果逻辑</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>因果关系列表</span>
                  {selectedEvent && (
                    <Button size="sm" variant="outline" onClick={loadChain} disabled={chainLoading}>
                      {chainLoading ? '生成中' : '重新生成'}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedEvent ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg border bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{selectedEvent.year}</Badge>
                        <span className="font-semibold text-slate-800">{selectedEvent.title}</span>
                        <Badge className="bg-purple-100 text-purple-700">当前事件</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedEvent.summary}</p>
                    </div>

                    {currentCauses.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-700">因果原因</h3>
                        {currentCauses.map((node, idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-slate-50">
                            <p className="text-sm font-medium text-slate-800">{node.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentEffects.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-700">因果结果</h3>
                        {currentEffects.map((node, idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-amber-50">
                            <p className="text-sm font-medium text-slate-800">{node.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!currentCauses.length && !currentEffects.length) && (
                      <p className="text-sm text-muted-foreground text-center py-4">点击上方图谱节点查看具体因果链</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(chain?.eventName ? [chain] : []).length > 0 ? (
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg border bg-white">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{chain?.eventName}</Badge>
                            <Badge className="bg-purple-100 text-purple-700">当前事件</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{chain?.event}</p>
                        </div>

                        {currentCauses.map((node, idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-slate-50">
                            <p className="text-sm font-medium text-slate-800">{node.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                          </div>
                        ))}

                        {currentEffects.map((node, idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-amber-50">
                            <p className="text-sm font-medium text-slate-800">{node.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      causalLinks.map((link) => {
                        const sourceEvent = timelineEvents.find((e) => e.id === link.sourceId);
                        const targetEvent = timelineEvents.find((e) => e.id === link.targetId);
                        if (!sourceEvent || !targetEvent) return null;

                        const colors: Record<string, string> = {
                          政治: 'border-amber-400 bg-amber-50',
                          经济: 'border-emerald-400 bg-emerald-50',
                          思想: 'border-violet-400 bg-violet-50',
                          文化: 'border-pink-400 bg-pink-50',
                          军事: 'border-red-400 bg-red-50',
                          社会: 'border-slate-400 bg-slate-50',
                        };

                        return (
                          <div
                            key={link.id}
                            className="flex items-start gap-4 p-4 rounded-lg border bg-white hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleEventClick(sourceEvent)}
                          >
                            <div
                              className={`w-12 h-12 rounded-full border-4 flex-shrink-0 flex items-center justify-center ${
                                colors[sourceEvent.category] || colors.社会
                              }`}
                            >
                              <span className="text-xs font-bold text-slate-600">{sourceEvent.year.slice(0, 4)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">{sourceEvent.year}</Badge>
                                <span className="text-sm font-semibold text-slate-800 truncate">{sourceEvent.title}</span>
                              </div>
                              <div className="flex items-center gap-2 my-2">
                                <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-400 to-purple-500 rounded" />
                                <GitFork className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-500 to-amber-400 rounded" />
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">{targetEvent.year}</Badge>
                                <span className="text-sm font-semibold text-slate-800 truncate">{targetEvent.title}</span>
                              </div>
                              <p className="text-sm text-muted-foreground bg-slate-50 rounded p-2">{link.logic}</p>
                            </div>
                            <div
                              className={`w-12 h-12 rounded-full border-4 flex-shrink-0 flex items-center justify-center ${
                                colors[targetEvent.category] || colors.社会
                              }`}
                            >
                              <span className="text-xs font-bold text-slate-600">{targetEvent.year.slice(0, 4)}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concepts">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {relatedConcepts.map((concept) => {
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
                        <h3 className="text-base font-bold text-slate-800">{concept.name}</h3>
                        <Badge variant="secondary" className="text-xs">{concept.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{concept.definition}</p>
                      {concept.keyPeople && concept.keyPeople.length > 0 && (
                        <p className="text-xs text-slate-500 mt-2">关键人物：{concept.keyPeople.join('、')}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
                  {selectedEvent.importance >= 4 && <Badge className="bg-amber-100 text-amber-700">核心考点</Badge>}
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      背景摘要
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent.summary}</p>
                  </div>

                  {selectedEvent.impact && (
                    <div>
                      <h4 className="text-sm font-medium mb-1 text-amber-600">✦ 历史影响</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedEvent.impact}</p>
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
                          <Badge key={person} variant="secondary">{person}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <GitFork className="h-4 w-4 text-slate-400" />
                    因果关系
                  </h4>
                  {currentCauses.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">前置原因：</p>
                      <div className="space-y-2">
                        {currentCauses.map((node, idx) => (
                          <div key={idx} className="text-sm p-2 bg-slate-50 rounded">
                            <p className="font-medium">{node.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentEffects.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">后续结果：</p>
                      <div className="space-y-2">
                        {currentEffects.map((node, idx) => (
                          <div key={idx} className="text-sm p-2 bg-amber-50 rounded">
                            <p className="font-medium">{node.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{node.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-indigo-500" />
              AI 历史助教
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {aiDataSource && (
              <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded">
                {aiDataSource === 'docx' ? '📝 基于您导入的知识点' : '📚 基于教材知识'}
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2 text-sm"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="请输入历史问题..."
                onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
              />
              <Button onClick={handleAiAsk} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {aiAnswer && (
              <Card>
                <CardContent className="p-3 text-sm text-slate-700 whitespace-pre-wrap">{aiAnswer}</CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CausalChainPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      }
    >
      <CausalChainPageInner />
    </Suspense>
  );
}
