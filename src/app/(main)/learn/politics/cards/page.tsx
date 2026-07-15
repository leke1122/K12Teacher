'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Sparkles, Layers, BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { POLITICS_UNIT1 } from '@/data/politics/unit1_data';

type CardItem = {
  id: string;
  type: 'concept' | 'event' | 'quote';
  title: string;
  front: string;
  back: string;
};

const BUILT_IN_CARDS: CardItem[] = [
  ...POLITICS_UNIT1.concepts.map(c => ({
    id: `concept-${c.id}`,
    type: 'concept' as const,
    title: c.name,
    front: c.name,
    back: `${c.category}\n\n${c.definition}\n\n要点：${c.keyPoints.join('、')}\n\n${c.gaokaoFocus || ''}`,
  })),
  ...POLITICS_UNIT1.timelineEvents.map(ev => ({
    id: `event-${ev.id}`,
    type: 'event' as const,
    title: ev.title,
    front: ev.title,
    back: `${ev.year} · ${ev.category}\n\n${ev.summary}\n\n历史影响：${ev.impact}`,
  })),
  ...POLITICS_UNIT1.keyQuotes.map(q => ({
    id: `quote-${q.id}`,
    type: 'quote' as const,
    title: q.source,
    front: q.source,
    back: `“${q.quote}”\n\n解析：${q.explanation}`,
  })),
];

export default function PoliticsCardsPage() {
  const params = useParams();
  const chapterId = useMemo(() => (params.chapterId as string) || 'politics-compulsory-1', [params.chapterId]);
  const [cards, setCards] = useState<CardItem[]>(BUILT_IN_CARDS);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'default' | 'generated'>('default');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/politics/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: 'politics_unit1', type: 'choice', count: 10 }),
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
        setSource('generated');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50/30">
      <div className="w-full px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/politics">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Layers className="h-5 w-5 text-pink-500" />
              政治 · 卡牌
            </h1>
            <p className="text-xs text-slate-500">
              共 {cards.length} 张卡牌 · {source === 'default' ? '内置卡牌' : '已生成'}
            </p>
          </div>
          <div className="ml-auto">
            <Button variant="outline" size="sm" className="gap-1" onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? '生成中' : '生成卡牌'}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在生成政治卡牌...
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {cards.map(card => (
                  <Card key={card.id}>
                    <CardHeader className="pb-3 pt-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{card.title}</span>
                        <Badge variant="outline">{card.type === 'concept' ? '概念卡' : card.type === 'event' ? '事件卡' : '论述卡'}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-600">
                      <p className="whitespace-pre-wrap font-medium">{card.front}</p>
                      <div className="h-px bg-slate-100" />
                      <p className="whitespace-pre-wrap text-slate-500">{card.back}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
