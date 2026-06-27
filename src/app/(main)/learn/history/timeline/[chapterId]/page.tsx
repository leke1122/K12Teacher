'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TimelineChart } from '@/components/history/TimelineChart';
import { TimelineControlBar } from '@/components/history/TimelineControlBar';
import { EventDetailCard } from '@/components/history/EventDetailCard';
import { CausalChainView } from '@/components/history/CausalChain';
import type { CausalChain } from '@/app/api/history/causal-chain/route';
import type { HistoryEvent, EventCategory } from '@/types/history';
import type { HistoryEventData } from '@/components/history/TimelineChart';
import {
  ArrowLeft,
  CalendarDays,
  GitBranch,
  MapPin,
  Users,
  Sparkles,
  Loader2,
  GitFork,
  X,
  RefreshCw,
} from 'lucide-react';
import { updateStepProgress } from '@/lib/historyProgress';

const CHAPTER_TITLES: Record<string, string> = {
  'modern-china': '中国近代史',
};

function TimelinePageContent() {
  const params = useParams();
  const router = useRouter();
  const chapterId = useMemo(
    () => (params.chapterId as string) || 'modern-china',
    [params.chapterId],
  );

  const [activeTab, setActiveTab] = useState('timeline');
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoryEvent[]>([]);
  const [chapterTitle, setChapterTitle] = useState<string>(
    CHAPTER_TITLES[chapterId] || '历史时间轴',
  );
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoryEventData | null>(null);

  // 控制状态
  const [zoom, setZoom] = useState(50);
  const [currentYear, setCurrentYear] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 详情弹窗状态
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // 因果链弹窗状态
  const [chainDialogOpen, setChainDialogOpen] = useState(false);
  const [chainLoading, setChainLoading] = useState(false);
  const [causalChain, setCausalChain] = useState<CausalChain | null>(null);
  const [chainError, setChainError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/history/timeline/${encodeURIComponent(chapterId)}`,
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || '加载失败');
      }
      const loadedEvents = (json.data?.events || []) as HistoryEvent[];
      setEvents(loadedEvents);
      setFilteredEvents(loadedEvents);
      if (json.data?.title) {
        setChapterTitle(json.data.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedEvent(null);
    setCausalChain(null);
    setActiveTab('timeline');
    setCurrentYear(0);
    setIsPlaying(false);
    loadEvents();
    updateStepProgress('history', chapterId, 'timeline', 'in_progress');
  }, [chapterId]);

  const handleExtract = async () => {
    setExtracting(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/history/timeline/${encodeURIComponent(chapterId)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId }),
        },
      );
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || '提取失败');
      }
      const extractedEvents = (json.data?.events || []) as HistoryEvent[];
      setEvents(extractedEvents);
      setFilteredEvents(extractedEvents);
      if (json.data?.title) {
        setChapterTitle(json.data.title);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '提取失败');
    } finally {
      setExtracting(false);
    }
  };

  const handleViewCausalChain = async () => {
    if (!selectedEvent) return;
    setDetailDialogOpen(false);
    setChainDialogOpen(true);
    setChainLoading(true);
    setChainError(null);
    try {
      const response = await fetch('/api/history/causal-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: selectedEvent.title,
          chapterId,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || '加载因果链失败');
      }
      setCausalChain(json.data as CausalChain);
    } catch (err) {
      setChainError(err instanceof Error ? err.message : '加载因果链失败');
    } finally {
      setChainLoading(false);
    }
  };

  const handlePractice = () => {
    // 跳转到练习页面
    router.push(`/learn/history/practice?event=${encodeURIComponent(selectedEvent?.title || '')}`);
  };

  const handleEventSelect = (event: HistoryEventData) => {
    setSelectedEvent(event);
    setCurrentYear(event.year);
    setDetailDialogOpen(true);
  };

  const handleYearSelect = useCallback((year: number) => {
    setCurrentYear(year);
  }, []);

  const handlePlayToggle = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleFilterChange = useCallback((filtered: HistoryEvent[]) => {
    setFilteredEvents(filtered);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  // 获取关联事件
  const getRelatedEvents = useCallback((event: HistoryEventData): HistoryEvent[] => {
    if (!event.relatedIds || event.relatedIds.length === 0) return [];
    return events.filter((e) => event.relatedIds?.includes(e.id));
  }, [events]);

  const selectedInChapter = useMemo(() => {
    if (!selectedEvent) return null;
    return events.find((e) => e.id === selectedEvent.id) || null;
  }, [selectedEvent, events]);

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
              📜 {chapterTitle}时间轴
            </h1>
            <p className="text-xs text-muted-foreground">
              点击事件查看详细信息，了解历史发展脉络
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleExtract}
            disabled={extracting || loading}
          >
            {extracting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {extracting ? '提取中' : '从教材提取'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={loadEvents}
            disabled={loading}
            title="刷新"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="p-3 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-3"
        >
          <TabsList>
            <TabsTrigger value="timeline" className="gap-1">
              <CalendarDays className="h-4 w-4" />
              时间轴
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1">
              <GitBranch className="h-4 w-4" />
              事件列表
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <div className="space-y-4">
              {/* 控制栏 */}
              {!loading && events.length > 0 && (
                <TimelineControlBar
                  events={events}
                  filteredEvents={filteredEvents}
                  onFilterChange={handleFilterChange}
                  onZoomChange={handleZoomChange}
                  currentZoom={zoom}
                  onYearSelect={handleYearSelect}
                  isPlaying={isPlaying}
                  onPlayToggle={handlePlayToggle}
                  currentYear={currentYear}
                />
              )}

              <Card>
                <CardHeader className="pb-3 pt-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>事件时间轴</span>
                    <Badge variant="outline">{filteredEvents.length} 个事件</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      正在加载历史事件...
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                      <p>该章节暂无历史事件数据</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExtract}
                        disabled={extracting}
                      >
                        {extracting ? '提取中...' : '从教材提取事件'}
                      </Button>
                    </div>
                  ) : (
                    <TimelineChart
                      events={filteredEvents}
                      selectedId={selectedEvent?.id}
                      onSelect={handleEventSelect}
                      zoom={zoom}
                      currentYear={currentYear}
                      isPlaying={isPlaying}
                      onYearChange={handleYearSelect}
                    />
                  )}
                </CardContent>
              </Card>

              {/* 快捷事件选择器 */}
              {filteredEvents.length > 0 && (
                <Card className="bg-slate-50/50 dark:bg-slate-800/50">
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground mb-2">快速跳转</p>
                    <div className="flex flex-wrap gap-2">
                      {filteredEvents.slice(0, 8).map((e) => (
                        <Button
                          key={e.id}
                          variant={selectedEvent?.id === e.id ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleEventSelect(e)}
                        >
                          {e.year} {e.title.substring(0, 4)}
                        </Button>
                      ))}
                      {filteredEvents.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{filteredEvents.length - 8} 更多
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 选中事件快捷预览（时间轴视图下） */}
              {selectedInChapter && (
                <Card className="bg-amber-50/60 border-amber-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        {selectedInChapter.title}
                        <Badge variant="secondary" className="text-xs">
                          {selectedInChapter.year}
                          {selectedInChapter.yearEnd
                            ? ` - ${selectedInChapter.yearEnd}`
                            : ''}
                        </Badge>
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => setDetailDialogOpen(true)}
                        >
                          详情
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={handleViewCausalChain}
                        >
                          <GitFork className="h-4 w-4" />
                          因果链
                        </Button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1 mb-1">
                          <MapPin className="h-3.5 w-3.5 text-blue-500" />
                          地点
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedInChapter.location || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1 mb-1">
                          <Users className="h-3.5 w-3.5 text-blue-500" />
                          主要人物
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedInChapter.figures?.join('、') || '-'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">背景原因</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedInChapter.causes || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">历史影响</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedInChapter.effects || '-'}
                      </p>
                    </div>
                    {selectedInChapter.significance && (
                      <div>
                        <p className="text-sm font-medium mb-1">历史意义</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedInChapter.significance}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <Card
                  key={e.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedEvent?.id === e.id
                      ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-200'
                      : ''
                  }`}
                  onClick={() => handleEventSelect(e)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold">{e.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {e.year}
                        {e.yearEnd ? ` - ${e.yearEnd}` : ''}
                      </Badge>
                    </div>
                    {e.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        {e.location}
                      </p>
                    )}
                    {e.figures && e.figures.length > 0 && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        {e.figures.slice(0, 3).join('、')}
                        {e.figures.length > 3 && '等'}
                      </p>
                    )}
                    {e.summary && (
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {e.summary}
                      </p>
                    )}
                    {e.category && (
                      <Badge
                        variant="secondary"
                        className="mt-2 text-xs"
                      >
                        {e.category}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 事件详情弹窗 */}
      {selectedEvent && (
        <EventDetailCard
          event={selectedEvent}
          isOpen={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          onViewCausalChain={handleViewCausalChain}
          onPractice={handlePractice}
          relatedEvents={getRelatedEvents(selectedEvent)}
        />
      )}

      {/* 因果链弹窗 */}
      <Dialog open={chainDialogOpen} onOpenChange={setChainDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitFork className="h-5 w-5 text-amber-500" />
              📜 因果链 · {selectedEvent?.title || ''}
            </DialogTitle>
          </DialogHeader>

          {chainLoading ? (
            <div className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              正在生成因果链分析...
            </div>
          ) : chainError ? (
            <div className="flex flex-col items-center gap-3 py-6 text-sm text-red-600">
              <p>{chainError}</p>
              <Button size="sm" onClick={handleViewCausalChain}>
                重试
              </Button>
            </div>
          ) : causalChain ? (
            <CausalChainView chain={causalChain} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function HistoryTimelinePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <TimelinePageContent />
    </Suspense>
  );
}
