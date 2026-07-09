'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertCircle, Layers } from 'lucide-react';
import type { HistoryCardItem } from '@/components/history/HistoryCard';

interface HistoryCardDeckProps {
  chapterId: string;
  sectionId: string;
}

export function HistoryCardDeck({ chapterId, sectionId }: HistoryCardDeckProps) {
  const [cards, setCards] = useState<HistoryCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/history/cards?chapterId=${encodeURIComponent(chapterId)}&sectionId=${encodeURIComponent(sectionId)}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '加载失败');
      setCards((json.data?.cards || []) as HistoryCardItem[]);
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
      const res = await fetch('/api/history/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, sectionId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '提取失败');
      setCards((json.data?.cards || []) as HistoryCardItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提取失败');
    } finally {
      setExtracting(false);
    }
  };

  useEffect(() => { loadCards(); }, [chapterId, sectionId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">正在加载历史卡牌...</span>
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
          <Button size="sm" onClick={loadCards}>重试</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-500" />
              <div>
                <h3 className="text-sm font-semibold">历史卡牌</h3>
                <p className="text-xs text-muted-foreground">翻转卡片，记忆关键知识</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={handleExtract}
              disabled={extracting}
            >
              {extracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              {extracting ? '生成中' : '从教材生成'}
            </Button>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">暂无历史卡牌</p>
              <Button size="sm" variant="outline" onClick={handleExtract} disabled={extracting}>
                {extracting ? '生成中...' : '从教材生成卡牌'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cards.map((card) => (
                <FlipCard key={card.id} card={card} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FlipCard({ card }: { card: HistoryCardItem }) {
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState(false);

  const typeColors: Record<string, string> = {
    event: 'bg-red-50 border-red-200',
    person: 'bg-blue-50 border-blue-200',
    system: 'bg-purple-50 border-purple-200',
    treaty: 'bg-amber-50 border-amber-200',
  };

  const handleFlip = () => setFlipped((p) => !p);

  return (
    <div
      className={`relative h-32 cursor-pointer perspective-1000 ${flipped ? 'flipped' : ''}`}
      onClick={handleFlip}
    >
      <div className={`absolute inset-0 rounded-xl border-2 transition-all duration-500 ${flipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* 正面 */}
        <div className={`absolute inset-0 rounded-xl border flex flex-col items-center justify-center p-3 ${typeColors[card.type] || 'bg-slate-50 border-slate-200'}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Badge variant="outline" className="text-xs mb-2">
            {card.type === 'event' ? '事件' : card.type === 'person' ? '人物' : card.type === 'system' ? '制度' : '条约'}
          </Badge>
          <p className="text-sm font-semibold text-center text-slate-800">{card.front}</p>
          <p className="text-xs text-muted-foreground mt-2">点击翻转</p>
        </div>
        {/* 反面 */}
        <div className={`absolute inset-0 rounded-xl border flex flex-col items-center justify-center p-3 bg-white border-slate-300`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-sm text-center text-slate-700 leading-relaxed">{card.back}</p>
        </div>
      </div>
    </div>
  );
}
