'use client';

import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { GEOGRAPHY_CHAPTER1 } from '@/data/geography/chapter1_data';
import type { GeographyCardItem } from '@/lib/geographyData';

type CardItem = {
  id: string;
  type: 'concept' | 'event' | 'table';
  title: string;
  front: string;
  back: string;
};

const BUILT_IN_CARDS: CardItem[] = [
  ...GEOGRAPHY_CHAPTER1.concepts.map(c => ({
    id: `concept-${c.id}`,
    type: 'concept' as const,
    title: c.name,
    front: c.name,
    back: `${c.category}\n\n${c.definition}\n\n要点：${c.keyPoints.join('、')}\n\n${c.gaokaoFocus || ''}`,
  })),
  ...GEOGRAPHY_CHAPTER1.tables.flatMap((table, idx) => table.rows.map((row, rIdx) => ({
    id: `table-${idx}-${rIdx}`,
    type: 'table' as const,
    title: table.title,
    front: row[0],
    back: `${table.title}\n` + table.headers.slice(1).map((h, i) => `${h}：${row[i + 1]}`).join('\n'),
  }))),
];

export default function GeographyCardsPage() {
  const [cards, setCards] = useState<CardItem[]>(BUILT_IN_CARDS);
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [mastered, setMastered] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('geography_mastery');
      if (saved) setMastered(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: Record<string, boolean>) => {
    setMastered(next);
    try { localStorage.setItem('geography_mastery', JSON.stringify(next)); } catch {}
  };

  const current = cards[index];
  const remaining = cards.filter(c => !mastered[c.id]).length;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/geography/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: 'geography_chapter1', type: 'choice', count: 8 }),
      });
      const json = await res.json();
      if (json.success) {
        const generated: CardItem[] = (json.questions || []).map((q: any, idx: number) => ({
          id: q.id || `q${idx}`,
          type: 'concept',
          title: q.question,
          front: q.question,
          back: q.options?.map((o: string, i: number) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n') + `\n\n正确答案：${q.correctAnswer}\n\n解析：${q.explanation}`,
        }));
        setCards(generated);
        setIndex(0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMastery = (known: boolean) => {
    if (!current) return;
    setMastered(prev => {
      const next = { ...prev, [current.id]: known };
      persist(next);
      return next;
    });
    setFlipped(false);
    setTimeout(() => setIndex(prev => (prev + 1) % cards.length), 180);
  };

  if (!current) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-emerald-50/40">
        <div className="w-full px-4 py-4"><p className="text-sm text-slate-500">暂无卡牌</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <Link href="/learn/geography"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button></Link>
            <div className="ml-auto">
              <Button variant="outline" size="sm" className="gap-1" onClick={handleGenerate} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? '生成中' : '生成卡牌'}
              </Button>
            </div>
          </div>

        <Card>
          <CardContent className="p-4">
            <div
              className="relative mx-auto aspect-[3/2] w-full max-w-2xl cursor-pointer"
              onClick={() => setFlipped((prev) => !prev)}
            >
              <div className={`h-full w-full rounded-2xl border bg-white p-5 shadow-sm transition-all ${flipped ? 'rotate-y-180' : ''}`}>
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{current.type === 'concept' ? '概念卡' : current.type === 'event' ? '事件卡' : '表格卡'}</Badge>
                      {mastered[current.id] && <Badge variant="secondary" className="text-xs">已掌握</Badge>}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">{flipped ? current.back : current.front}</h3>
                    <p className="mt-2 text-xs text-slate-500">点击卡片查看{flipped ? '问题' : '答案'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <Button variant="outline" size="sm" disabled={mastered[current.id]} onClick={() => handleMastery(false)}>不记得</Button>
              <Button size="sm" disabled={mastered[current.id]} onClick={() => handleMastery(true)}>记得</Button>
              <Button variant="ghost" size="sm" onClick={() => { setFlipped(false); setIndex((prev) => (prev - 1 + cards.length) % cards.length); }}>上一张</Button>
              <Button variant="ghost" size="sm" onClick={() => { setFlipped(false); setIndex((prev) => (prev + 1) % cards.length); }}>下一张</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
