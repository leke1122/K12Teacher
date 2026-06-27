"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface HistoryCardItem {
  id: string;
  type: 'event' | 'person' | 'system' | 'treaty';
  title: string;
  front: string;
  back: string;
  chapterId: string;
}

interface HistoryCardProps {
  cards: HistoryCardItem[];
  onProgressChange?: (remaining: number, reviewed: number) => void;
}

export function HistoryCard({ cards, onProgressChange }: HistoryCardProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [cards]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('edumind_history_mastery');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMastered((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const persist = useCallback((next: Record<string, boolean>) => {
    setMastered(next);
    try {
      localStorage.setItem('edumind_history_mastery', JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }, []);

  const current = cards[index];

  const remaining = useMemo(() => {
    let count = 0;
    for (const c of cards) {
      if (!mastered[c.id]) count += 1;
    }
    return count;
  }, [cards, mastered]);

  useEffect(() => {
    onProgressChange?.(remaining, cards.length - remaining);
  }, [remaining, cards.length, onProgressChange]);

  if (!cards.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-white py-10 text-muted-foreground">
        <p>当前章节暂无卡牌</p>
      </div>
    );
  }

  if (!current) {
    return null;
  }

  const handleMastery = (known: boolean) => {
    setMastered((prev) => {
      const next = { ...prev, [current.id]: known };
      persist(next);
      return next;
    });

    setFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, 180);
  };

  const currentMastered = mastered[current.id];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {index + 1} / {cards.length}
        </div>
        <div>
          已掌握 {cards.length - remaining} / {cards.length}
        </div>
      </div>

      <div
        className="relative mx-auto aspect-[3/2] w-full max-w-2xl cursor-pointer"
        onClick={() => setFlipped((prev) => !prev)}
      >
        <div
          className={`h-full w-full rounded-2xl border bg-white p-5 shadow-sm transition-all ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {current.type === 'event'
                    ? '事件卡'
                    : current.type === 'person'
                    ? '人物卡'
                    : current.type === 'system'
                    ? '制度卡'
                    : '条约卡'}
                </Badge>
                {currentMastered && (
                  <Badge variant="secondary" className="text-xs">
                    已掌握
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {flipped ? current.back : current.front}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground">
                点击卡片查看{flipped ? '问题' : '答案'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Badge variant="secondary" className="text-xs">
                {current.chapterId}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {flipped ? '已展示答案' : '请先回忆'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={currentMastered}
          onClick={() => handleMastery(false)}
          className="gap-1"
        >
          不记得
        </Button>
        <Button
          size="sm"
          disabled={currentMastered}
          onClick={() => handleMastery(true)}
          className="gap-1"
        >
          记得
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFlipped(false);
            setIndex((prev) => (prev - 1 + cards.length) % cards.length);
          }}
        >
          上一张
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFlipped(false);
            setIndex((prev) => (prev + 1) % cards.length);
          }}
        >
          下一张
        </Button>
      </div>
    </div>
  );
}
