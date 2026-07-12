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

      {/* 3D翻转卡片容器 */}
      <div className="perspective-1000 mx-auto w-full max-w-2xl">
        <div
          className="relative h-[280px] cursor-pointer transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
          onClick={() => setFlipped((prev) => !prev)}
        >
          {/* 正面 - 问题 */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
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
              <h3 className="text-xl font-bold text-slate-800 leading-relaxed">
                {current.front}
              </h3>
              <p className="mt-4 text-sm text-muted-foreground">
                点击查看答案
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {current.chapterId}
              </Badge>
              <span className="text-xs text-muted-foreground">请先回忆</span>
            </div>
          </div>

          {/* 背面 - 答案 */}
          <div
            className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="bg-amber-100 text-xs">
                  答案
                </Badge>
                {currentMastered && (
                  <Badge variant="secondary" className="text-xs">
                    已掌握
                  </Badge>
                )}
              </div>
              <div className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed">
                {current.back}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {current.chapterId}
              </Badge>
              <span className="text-xs text-amber-600">已展示答案</span>
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
