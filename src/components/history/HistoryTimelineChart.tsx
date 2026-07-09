'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertCircle, CalendarDays, MapPin, Users } from 'lucide-react';
import { TimelineChart } from '@/components/history/TimelineChart';
import type { HistoryEventData } from '@/components/history/TimelineChart';
import type { HistoryEvent } from '@/types/history';

interface HistoryTimelineChartProps {
  chapterId: string;
  sectionId: string;
  sectionTitle: string;
}

export function HistoryTimelineChart({ chapterId, sectionId, sectionTitle }: HistoryTimelineChartProps) {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoryEventData | null>(null);
  const [chapterTitle, setChapterTitle] = useState(sectionTitle);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/history/timeline/${encodeURIComponent(chapterId)}?sectionId=${encodeURIComponent(sectionId)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '加载失败');
      const evts = (json.data?.events || []) as HistoryEvent[];
      setEvents(evts);
      setFilteredEvents(evts);
      if (json.data?.title) setChapterTitle(json.data.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    setExtracting(true);
    setError(null);
    try {
      const res = await fetch(`/api/history/timeline/${encodeURIComponent(chapterId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, sectionId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '提取失败');
      const evts = (json.data?.events || []) as HistoryEvent[];
      setEvents(evts);
      setFilteredEvents(evts);
      if (json.data?.title) setChapterTitle(json.data.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提取失败');
    } finally {
      setExtracting(false);
    }
  };

  useEffect(() => { loadEvents(); }, [chapterId, sectionId]);

  const handleEventSelect = (event: HistoryEventData) => {
    setSelectedEvent(event);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">正在加载历史事件...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
          <Button size="sm" onClick={loadEvents}>重试</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-500" />
              <div>
                <h3 className="text-sm font-semibold">{chapterTitle}时间轴</h3>
                <p className="text-xs text-muted-foreground">共 {filteredEvents.length} 个事件</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={handleExtract} disabled={extracting}>
                {extracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {extracting ? '提取中' : '从教材提取'}
              </Button>
              <Button size="sm" variant="ghost" onClick={loadEvents} disabled={loading}>
                刷新
              </Button>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">暂无历史事件数据</p>
              <Button size="sm" variant="outline" onClick={handleExtract} disabled={extracting}>
                {extracting ? '提取中...' : '从教材提取事件'}
              </Button>
            </div>
          ) : (
            <>
              <TimelineChart
                events={filteredEvents as unknown as HistoryEventData[]}
                selectedId={selectedEvent?.id}
                onSelect={handleEventSelect}
              />

              {/* 事件列表 */}
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">快速跳转</p>
                <div className="flex flex-wrap gap-2">
                  {filteredEvents.slice(0, 10).map((e) => (
                    <Button
                      key={e.id}
                      variant={selectedEvent?.id === e.id ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleEventSelect(e as unknown as HistoryEventData)}
                    >
                      {e.year} {e.title.substring(0, 5)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 选中事件详情 */}
              {selectedEvent && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <h3 className="font-semibold text-slate-800">{selectedEvent.title}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedEvent.location && (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                    {selectedEvent.figures?.length > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3 text-blue-500" />
                        <span>{selectedEvent.figures.slice(0, 2).join('、')}</span>
                      </div>
                    )}
                  </div>
                  {selectedEvent.causes && (
                    <div>
                      <p className="text-xs font-medium text-red-600">原因：</p>
                      <p className="text-sm text-slate-700">{selectedEvent.causes}</p>
                    </div>
                  )}
                  {selectedEvent.effects && (
                    <div>
                      <p className="text-xs font-medium text-emerald-600">影响：</p>
                      <p className="text-sm text-slate-700">{selectedEvent.effects}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
