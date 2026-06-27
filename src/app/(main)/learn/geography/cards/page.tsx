'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Loader2, RotateCcw } from 'lucide-react';
import { updateStepProgress } from '@/lib/geographyProgress';
import { GEOGRAPHY_CARDS, type GeographyCardItem } from '@/lib/geographyData';

function GeographyCardsPageContent() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
    try {
      const saved = localStorage.getItem('geography_mastery');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMastered((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    updateStepProgress('geography', 'compulsory-1', 'cards', 'in_progress');
  }, []);

  const persist = (next: Record<string, boolean>) => {
    setMastered(next);
    try {
      localStorage.setItem('geography_mastery', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const current = GEOGRAPHY_CARDS[index];
  const remaining = useMemo(() => {
    let count = 0;
    for (const c of GEOGRAPHY_CARDS) {
      if (!mastered[c.id]) count += 1;
    }
    return count;
  }, [GEOGRAPHY_CARDS, mastered]);

  const handleMastery = (known: boolean) => {
    if (!current) return;
    setMastered((prev) => {
      const next = { ...prev, [current.id]: known };
      persist(next);
      return next;
    });
    setFlipped(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % GEOGRAPHY_CARDS.length);
    }, 180);
  };

  const handleReset = () => {
    setMastered({});
    persist({});
    setIndex(0);
    setFlipped(false);
  };

  if (!current) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground">暂无卡牌</p>
      </div>
    );
  }

  const currentMastered = mastered[current.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
        {/* 顶部 */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              📝 地理卡牌
            </h1>
            <p className="text-xs text-muted-foreground">
              间隔重复记忆，巩固辽宁高考高频考点
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            重置
          </Button>
        </div>

        {/* 进度 */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                {index + 1} / {GEOGRAPHY_CARDS.length}
              </div>
              <div>
                已掌握 {GEOGRAPHY_CARDS.length - remaining} / {GEOGRAPHY_CARDS.length}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 卡牌 */}
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
                    {current.type === 'climate' ? '气候卡' : current.type === 'landform' ? '地形卡' : current.type === 'region' ? '区域卡' : current.type === 'concept' ? '概念卡' : current.type === 'current' ? '洋流卡' : '植被卡'}
                  </Badge>
                  {currentMastered && (
                    <Badge variant="secondary" className="text-xs">已掌握</Badge>
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

        {/* 操作按钮 */}
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

        {/* 导航 */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFlipped(false);
              setIndex((prev) => (prev - 1 + GEOGRAPHY_CARDS.length) % GEOGRAPHY_CARDS.length);
            }}
          >
            上一张
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFlipped(false);
              setIndex((prev) => (prev + 1) % GEOGRAPHY_CARDS.length);
            }}
          >
            下一张
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function GeographyCardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <GeographyCardsPageContent />
    </Suspense>
  );
}
