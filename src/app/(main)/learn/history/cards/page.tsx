'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoryCard } from '@/components/history/HistoryCard';
import type { HistoryCardItem } from '@/components/history/HistoryCard';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';

const CHAPTERS: Record<string, { title: string }> = {
  'modern-china': { title: '中国近代史' },
};

function HistoryCardsPageContent() {
  const params = useParams();
  const chapterId = useMemo(() => (params.chapterId as string) || 'modern-china', [params.chapterId]);
  const [cards, setCards] = useState<HistoryCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('cards');

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/history/cards?chapterId=${encodeURIComponent(chapterId)}`);
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || '加载失败');
      }
      setCards((json.data?.cards || []) as HistoryCardItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveTab('cards');
    loadCards();
  }, [chapterId]);

  const handleExtract = async () => {
    setExtracting(true);
    setError(null);
    try {
      const response = await fetch(`/api/history/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || '提取失败');
      }
      setCards((json.data?.cards || []) as HistoryCardItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提取失败');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <div className="w-full px-4 py-4">
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
              📜 {CHAPTERS[chapterId]?.title || '历史'} · 历史卡牌
            </h1>
            <p className="text-xs text-muted-foreground">
              共 {cards.length} 张卡牌 · 已掌握 {masteredCount} 张
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
            {extracting ? '提取中' : '从教材生成卡牌'}
          </Button>
        </div>

        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="p-3 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList>
            <TabsTrigger value="cards" className="gap-1">
              卡牌练习
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards">
            <Card>
              <CardHeader className="pb-3 pt-3">
                <CardTitle className="text-base">历史卡牌</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在生成历史卡牌...
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
        </Tabs>
      </div>
    </div>
  );
}

export default function HistoryCardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      }
    >
      <HistoryCardsPageContent />
    </Suspense>
  );
}
