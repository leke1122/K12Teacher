'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import CausalGraph, { CausalGraphLegend } from '@/components/history/CausalGraph';
import Drawer from '@/components/history/Drawer';
import type { TimelineEvent, CausalLink, Concept } from '@/data/history/unit1_data';

interface ExamFocus {
  conceptId: string;
  conceptName: string;
  frequency: string;
  questionTypes: string[];
  difficulty: string;
  typicalQuestions?: string[];
}

interface LnGaokaoKnowledge {
  timelineEvents: TimelineEvent[];
  causalLinks: CausalLink[];
  concepts: Concept[];
  examFocus: ExamFocus[];
  summary: string;
  unitTitle: string;
  pageRange: string;
}

interface Chapter {
  id: string;
  chapter_title: string;
  chapter_type: string;
  page_start: number;
  page_end: number;
  children?: Chapter[];
}

const DEFAULT_DATA = {
  timelineEvents: [] as TimelineEvent[],
  causalLinks: [] as CausalLink[],
  concepts: [] as Concept[],
  examFocus: [] as ExamFocus[],
  summary: '',
  unitTitle: '请先选择单元',
  pageRange: '',
};

function Unit1TimelinePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const chapterId = useMemo(
    () => (params.chapterId as string) || searchParams.get('chapterId') || 'unit1',
    [params.chapterId, searchParams],
  );

  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [causalDrawerOpen, setCausalDrawerOpen] = useState(false);
  const [highlightEventId, setHighlightEventId] = useState<string | undefined>();

  // AI 问答状态
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // 筛选状态
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // 数据状态
  const [knowledgeData, setKnowledgeData] = useState<LnGaokaoKnowledge>(DEFAULT_DATA);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>(chapterId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取 API Key
  const getApiKey = () => {
    try {
      const stored = localStorage.getItem('edumind-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.settings?.deepseekKey || parsed?.deepseekKey || '';
      }
    } catch {}
    return '';
  };

  // 加载章节列表
  const loadChapters = useCallback(async () => {
    try {
      // 先从本地存储获取教材信息
      const stored = localStorage.getItem('edumind-settings');
      let textbookId = 'history-default';
      if (stored) {
        const parsed = JSON.parse(stored);
        // 尝试获取历史教材ID
        const historyData = parsed?.settings?.historyTextbookId;
        if (historyData) textbookId = historyData;
      }

      const response = await fetch(`/api/history/knowledge/extract-by-pages?textbookId=${textbookId}&subject=history`);
      const data = await response.json();
      if (data.success && data.chapters) {
        setChapters(data.chapters);
      }
    } catch (err) {
      console.error('加载章节列表失败:', err);
    }
  }, []);

  const [dataSource, setDataSource] = useState<string>('');

  // 加载知识点数据
  const loadKnowledgeData = useCallback(async (unitId: string, forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = getApiKey();
      const response = await fetch('/api/history/knowledge/extract-by-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: unitId,
          unitId,
          textbookId: 'history-default',
          forceRefresh,
          apiKey,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setKnowledgeData(data.data);
        setDataSource(data.source || '');
      } else {
        setError(data.message || data.hint || '加载数据失败');
        if (data.hint) {
          setError(`${data.message}\n\n💡 ${data.hint}`);
        }
      }
    } catch (err) {
      console.error('加载知识点失败:', err);
      setError('网络错误，请检查连接后重试');
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载
  useEffect(() => {
    loadChapters();
    loadKnowledgeData(chapterId);
  }, [chapterId, loadChapters, loadKnowledgeData]);

  // 筛选事件
  const filteredEvents = useMemo(() => {
    if (categoryFilter === 'all') return knowledgeData.timelineEvents;
    return knowledgeData.timelineEvents.filter((e) => e.category === categoryFilter);
  }, [knowledgeData.timelineEvents, categoryFilter]);

  // 分类统计
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const event of knowledgeData.timelineEvents) {
      stats[event.category] = (stats[event.category] || 0) + 1;
    }
    return stats;
  }, [knowledgeData.timelineEvents]);

  // 处理单元切换
  const handleUnitChange = (newUnitId: string) => {
    setSelectedUnitId(newUnitId);
    router.push(`/learn/history/timeline/${newUnitId}`);
  };

  // 处理事件点击
  const handleEventClick = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    setHighlightEventId(event.id);
  }, []);

  // 处理图谱点击
  const handleGraphEventClick = useCallback((event: TimelineEvent) => {
    setSelectedEvent(event);
    setHighlightEventId(event.id);
  }, []);

  // 发送 AI 问题
  const handleAiAsk = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiAnswer('');
    try {
      const apiKey = getApiKey();

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
    const causes = knowledgeData.causalLinks.filter((c) => c.targetId === eventId);
    const results = knowledgeData.causalLinks.filter((c) => c.sourceId === eventId);
    return { causes, results };
  }, [knowledgeData.causalLinks]);

  const { causes, results } = useMemo(() => {
    if (!selectedEvent) return { causes: [], results: [] };
    return getCausalLinks(selectedEvent.id);
  }, [selectedEvent, getCausalLinks]);

  // 获取事件详情
  const getEventById = useCallback((id: string) => {
    return knowledgeData.timelineEvents.find((e) => e.id === id);
  }, [knowledgeData.timelineEvents]);

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
              📜 {knowledgeData.unitTitle || '历史时间轴'}
            </h1>
            <p className="text-xs text-muted-foreground">
              高中历史 · {knowledgeData.pageRange || '辽宁高考方向'} · 共 {knowledgeData.timelineEvents.length} 个核心事件
              {dataSource === 'docx_import' && (
                <span className="ml-2 text-emerald-600">📝 您导入的知识点</span>
              )}
            </p>
          </div>

          {/* 单元选择器 */}
          <div className="flex items-center gap-2">
            <Select value={selectedUnitId} onValueChange={handleUnitChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择单元" />
              </SelectTrigger>
              <SelectContent>
                {chapters.length > 0 ? (
                  chapters.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.chapter_title}（第{ch.page_start}-{ch.page_end}页）
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="unit1">第一单元</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => loadKnowledgeData(selectedUnitId, true)}
              disabled={loading}
              title="刷新数据"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>

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
        </div>

        {/* 加载状态 */}
        {loading && (
          <Card className="mb-4">
            <CardContent className="flex items-center justify-center py-8 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              <span className="text-muted-foreground">正在加载知识点...</span>
            </CardContent>
          </Card>
        )}

        {/* 错误提示 */}
        {error && (
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800 whitespace-pre-wrap">{error}</p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadKnowledgeData(selectedUnitId)}
                    >
                      重试
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => router.push('/textbook')}
                    >
                      去上传教材
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 辽宁高考重点提示 */}
        {knowledgeData.examFocus && knowledgeData.examFocus.length > 0 && (
          <Card className="mb-4 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">辽宁高考重点</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {knowledgeData.examFocus.map((focus, idx) => (
                  <Badge
                    key={idx}
                    variant={focus.frequency === '必考' ? 'default' : 'outline'}
                    className={focus.frequency === '必考' ? 'bg-red-500' : ''}
                  >
                    {focus.conceptName} · {focus.frequency}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                全部 ({knowledgeData.timelineEvents.length})
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

        {!loading && !error && (
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
              {filteredEvents.length === 0 ? (
                <Card className="p-8 text-center">
                  <CalendarDays className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-muted-foreground">
                    {chapters.length === 0
                      ? '请先上传历史教材并导入目录'
                      : '该单元暂无时间轴数据'}
                  </p>
                </Card>
              ) : (
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
                                    {event.importance >= 5 && (
                                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                        常考
                                      </span>
                                    )}
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
                                    setSelectedEvent(event);
                                    setHighlightEventId(event.id);
                                    setCausalDrawerOpen(true);
                                  }}
                                >
                                  <GitFork className="h-3 w-3 mr-1" />
                                  查看因果
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 因果图谱 */}
            <TabsContent value="graph">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>因果链知识图谱</span>
                    <Badge variant="outline">{knowledgeData.causalLinks.length} 条因果关系</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CausalGraphLegend />
                  <div className="h-[600px] border rounded-lg overflow-hidden">
                  <CausalGraph
                    events={knowledgeData.timelineEvents as TimelineEvent[]}
                    causalLinks={knowledgeData.causalLinks as CausalLink[]}
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
              {knowledgeData.concepts.length === 0 ? (
                <Card className="p-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-muted-foreground">该单元暂无概念数据</p>
                </Card>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {knowledgeData.concepts.map((concept) => {
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
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* 事件详情 + 因果抽屉 */}
      <Drawer
        open={causalDrawerOpen}
        onOpenChange={setCausalDrawerOpen}
        title={selectedEvent ? selectedEvent.title : '事件详情'}
      >
        {selectedEvent && (
          <div className="space-y-5 p-4">
            <div className="flex flex-wrap gap-2">
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
              {causes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">前置原因：</p>
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
              )}

              {results.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">后续结果：</p>
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
              )}

              {causes.length === 0 && results.length === 0 && (
                <p className="text-sm text-muted-foreground">暂无因果关系数据</p>
              )}

              <div className="h-[420px] border rounded-lg overflow-hidden bg-white">
                <CausalGraph
                  events={knowledgeData.timelineEvents}
                  causalLinks={knowledgeData.causalLinks}
                  onEventClick={handleGraphEventClick}
                  highlightEventId={selectedEvent.id}
                />
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* AI 助教悬浮窗 */}
      {aiOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border flex flex-col z-50">
          <div className="flex items-center justify-between p-3 border-b bg-slate-50 rounded-t-lg">
            <h3 className="font-bold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              历史 AI 助教
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
              💡 我可以回答关于历史知识点、辽宁高考备考策略等相关问题。
            </div>

            {knowledgeData.summary && (
              <div className="text-xs bg-amber-50 p-2 rounded border border-amber-200">
                <p className="font-medium text-amber-800 mb-1">📚 学习建议</p>
                <p className="text-amber-700">{knowledgeData.summary}</p>
              </div>
            )}

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
