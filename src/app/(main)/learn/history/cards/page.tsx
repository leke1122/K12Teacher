'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoryCard } from '@/components/history/HistoryCard';
import type { HistoryCardItem } from '@/components/history/HistoryCard';
import { ArrowLeft, Loader2, Sparkles, BookOpen, Layers, Clock } from 'lucide-react';
import Link from 'next/link';
import { timelineEvents, concepts } from '@/data/history/unit1_data';
import { useTextbooks } from '@/hooks/useTextbooks';

// 从 unit1_data 生成默认卡牌
function generateDefaultCards(): HistoryCardItem[] {
  const cards: HistoryCardItem[] = [];

  // 从时间轴事件生成卡牌
  for (const event of timelineEvents.slice(0, 15)) {
    cards.push({
      id: `event-${event.id}`,
      type: 'event',
      title: event.title,
      front: event.title,
      back: `${event.year} · ${event.dynasty}\n\n${event.summary}\n\n历史影响：${event.impact || '详见课本'}`,
      chapterId: 'unit1',
      dynasty: event.dynasty,
    });
  }

  // 从概念生成卡牌
  for (const concept of concepts) {
    cards.push({
      id: `concept-${concept.id}`,
      type: 'system',
      title: concept.name,
      front: concept.name,
      back: `类别：${concept.category}\n\n定义：${concept.definition}${concept.keyPeople?.length ? `\n\n关键人物：${concept.keyPeople.join('、')}` : ''}`,
      chapterId: 'unit1',
      dynasty: concept.category,
    });
  }

  return cards;
}

// 内置卡牌数据（用于展示）
const BUILT_IN_CARDS = generateDefaultCards();

function HistoryCardsPageContent() {
  const params = useParams();
  const chapterId = useMemo(() => (params.chapterId as string) || 'unit1', [params.chapterId]);
  const unitId = useMemo(() => (params.unitId as string) || chapterId, [params.unitId, chapterId]);
  const { chapters } = useTextbooks('history');
  const [cards, setCards] = useState<HistoryCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('practice');
  const [source, setSource] = useState<'default' | 'generated' | 'api' | 'docx_import'>('default');

  // 根据 chapterId 查找章节标题
  const chapterTitle = useMemo(() => {
    for (const ch of chapters) {
      if (String(ch.chapterIndex) === chapterId || ch.chapterIndex?.toString() === chapterId) {
        return `第${ch.chapterIndex}单元 ${ch.chapterTitle}`;
      }
    }
    return '历史';
  }, [chapters, chapterId]);

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/history/cards?chapterId=${encodeURIComponent(chapterId)}&unitId=${encodeURIComponent(unitId)}`);
      const json = await response.json();
      if (response.ok && json.success && json.data?.cards?.length > 0) {
        setCards((json.data.cards || []) as HistoryCardItem[]);
        setSource((json.source as typeof source) || 'api');
        return;
      }
    } catch (err) {
      console.warn('API 获取失败，使用默认数据:', err);
    }

    setCards(BUILT_IN_CARDS);
    setSource('default');
    setLoading(false);
  };

  useEffect(() => {
    setActiveTab('practice');
    loadCards();
  }, [chapterId, unitId]);

  const handleExtract = async () => {
    setExtracting(true);
    setError(null);
    try {
      const response = await fetch(`/api/history/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, unitId }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || '提取失败');
      }
      setCards((json.data?.cards || []) as HistoryCardItem[]);
      setSource((json.source as typeof source) || 'generated');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提取失败');
      setCards(BUILT_IN_CARDS);
      setSource('default');
    } finally {
      setExtracting(false);
    }
  };

  const masteredCount = useMemo(
    () => cards.filter((c) => {
      try {
        const raw = localStorage.getItem('edumind_history_mastery');
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return !!parsed[c.id];
      } catch {
        return false;
      }
    }).length,
    [cards],
  );

  // 按类型分组卡牌
  const cardsByType = useMemo(() => {
    const grouped: Record<string, HistoryCardItem[]> = {
      event: [],
      person: [],
      system: [],
      treaty: [],
    };
    for (const card of cards) {
      const type = card.type || 'event';
      if (grouped[type]) {
        grouped[type].push(card);
      } else {
        grouped.event.push(card);
      }
    }
    return grouped;
  }, [cards]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-amber-50/30">
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
              <Layers className="h-5 w-5 text-blue-500" />
              {chapterTitle} · 历史卡牌
            </h1>
            <p className="text-xs text-muted-foreground">
              共 {cards.length} 张卡牌 · 已掌握 {masteredCount} 张
              {source === 'default' && (
                <span className="ml-2 text-amber-600">（内置卡牌）</span>
              )}
              {source === 'generated' && (
                <span className="ml-2 text-green-600">（已生成）</span>
              )}
              {source === 'docx_import' && (
                <span className="ml-2 text-emerald-600">📝 您导入的知识点</span>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleExtract}
            disabled={extracting || loading}
          >
            {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {extracting ? '生成中' : '生成卡牌'}
          </Button>
        </div>

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="p-3 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList>
            <TabsTrigger value="practice" className="gap-1">
              <Layers className="h-4 w-4" />
              全部卡牌
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1">
              <Clock className="h-4 w-4" />
              事件卡 ({cardsByType.event.length})
            </TabsTrigger>
            <TabsTrigger value="concepts" className="gap-1">
              <BookOpen className="h-4 w-4" />
              概念卡 ({cardsByType.system.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="practice">
            <Card>
              <CardHeader className="pb-3 pt-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>历史卡牌练习</span>
                  <Badge variant="outline">{cards.length} 张</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在加载历史卡牌...
                  </div>
                ) : cards.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <p>该章节暂无历史卡牌</p>
                    <Button size="sm" variant="outline" onClick={handleExtract} disabled={extracting}>
                      {extracting ? '生成中...' : '从教材生成卡牌'}
                    </Button>
                  </div>
                ) : (
                  <HistoryCard cards={cards} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader className="pb-3 pt-3">
                <CardTitle className="text-base">事件卡牌</CardTitle>
              </CardHeader>
              <CardContent>
                {cardsByType.event.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {cardsByType.event.map((card) => (
                      <div
                        key={card.id}
                        className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setCards([card, ...cards.filter(c => c.id !== card.id)]);
                          setActiveTab('practice');
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">事件卡</Badge>
                        </div>
                        <h4 className="font-semibold text-slate-800 mb-1">{card.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{card.back}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">暂无事件卡牌</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concepts">
            <Card>
              <CardHeader className="pb-3 pt-3">
                <CardTitle className="text-base">概念卡牌</CardTitle>
              </CardHeader>
              <CardContent>
                {cardsByType.system.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {cardsByType.system.map((card) => (
                      <div
                        key={card.id}
                        className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setCards([card, ...cards.filter(c => c.id !== card.id)]);
                          setActiveTab('practice');
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">概念卡</Badge>
                        </div>
                        <h4 className="font-semibold text-slate-800 mb-1">{card.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{card.back}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">暂无概念卡牌</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function HistoryCardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <HistoryCardsPageContent />
    </Suspense>
  );
}
