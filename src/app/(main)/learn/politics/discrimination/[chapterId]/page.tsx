'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Sparkles, Lightbulb, ChevronRight, BookOpen, Target, Layers, ArrowRight } from 'lucide-react';

type Concept = {
  name: string;
  definition: string;
  core: string;
  distinction: string;
  example: string;
};

type Option = {
  label: string;
  text: string;
  correct: boolean;
};

type Pair = {
  id: string;
  group: string;
  concepts: Concept[];
  question: string;
  options: Option[];
  explanation: string;
  synthesisQuestion: string;
  synthesisHint: string;
};

export default function PoliticsDiscriminationPage() {
  const params = useParams();
  const chapterId = params.chapterId as string;

  const [loading, setLoading] = useState(true);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [groupId, setGroupId] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<{ isCorrect: boolean; explanation: string; synthesisQuestion: string; synthesisHint: string } | null>(null);
  const [reflection, setReflection] = useState('');

  const filtered = useMemo(() => (groupId === 'all' ? pairs : pairs.filter((p) => p.group === groupId)), [pairs, groupId]);
  const current = filtered[currentIndex] || null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setAnswer('');
      setResult(null);
      setReflection('');
      try {
        const res = await fetch(`/api/politics/discrimination?chapterId=${encodeURIComponent(chapterId)}`);
        const json = await res.json();
        if (json.success) {
          setPairs(json.data || []);
          setCurrentIndex(0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chapterId]);

  const handleSubmit = async () => {
    if (!current || !answer) return;
    try {
      const res = await fetch('/api/politics/discrimination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairId: current.id, answer }),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const progress = filtered.length > 0 ? Math.round(((currentIndex + (result ? 1 : 0)) / filtered.length) * 100) : 0;

  const groups = useMemo(() => {
    const map = new Map<string, string>();
    pairs.forEach((p) => {
      if (!map.has(p.group)) map.set(p.group, p.group);
    });
    return Array.from(map.values());
  }, [pairs]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30">
      <div className="w-full px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/politics">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">政治 · 概念辨析</h1>
            <p className="text-xs text-slate-500">判断→论证→辨析→完善</p>
          </div>
        </div>

        <Tabs value={groupId} onValueChange={setGroupId} className="space-y-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all" className="gap-1">
              <BookOpen className="h-4 w-4" /> 全部
            </TabsTrigger>
            {groups.slice(0, 6).map((g) => (
              <TabsTrigger key={g} value={g} className="gap-1">
                <Target className="h-4 w-4" /> {g}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={groupId} className="space-y-4">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在加载概念辨析...
              </div>
            ) : !current ? (
              <Card>
                <CardContent className="p-6 text-sm text-slate-500">暂无概念辨析数据</CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{current.group}</Badge>
                  <span className="text-xs text-slate-500">
                    {currentIndex + 1} / {filtered.length}
                  </span>
                  <div className="ml-auto">
                    <Progress value={progress} />
                  </div>
                </div>

                <Card className="bg-white/70 dark:bg-slate-800/70">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Layers className="h-4 w-4 text-pink-500" />
                      概念辨析
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      {(current.concepts || []).map((c) => (
                        <div key={c.name} className="rounded-lg border bg-white p-4">
                          <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{c.definition}</p>
                          <div className="mt-2 grid gap-1 text-xs text-slate-600">
                            <p><span className="font-medium">核心：</span>{c.core}</p>
                            <p><span className="font-medium">辨析：</span>{c.distinction}</p>
                            <p><span className="font-medium">示例：</span>{c.example}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border bg-slate-50 dark:bg-slate-900/50 p-4">
                      <p className="text-sm font-medium text-slate-700">{current.question}</p>
                      <RadioGroup value={answer} onValueChange={setAnswer} className="mt-3 space-y-2">
                        {(current.options || []).map((o) => (
                          <div key={o.label} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                            <RadioGroupItem value={o.label} id={`${current.id}-${o.label}`} />
                            <Label htmlFor={`${current.id}-${o.label}`} className="flex-1">
                              <span className="mr-1 text-xs text-slate-500">{o.label}.</span>
                              {o.text}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <div className="mt-3 flex gap-2">
                        <Button onClick={handleSubmit} disabled={!answer || !!result}>
                          判断
                        </Button>
                      </div>
                    </div>

                    {result && (
                      <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 p-4">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          {result.isCorrect ? '判断正确' : '判断有误'}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">{result.explanation}</p>
                        <div className="mt-3 rounded-md border bg-white/70 p-3">
                          <p className="text-sm font-medium text-slate-700">{result.synthesisQuestion}</p>
                          <p className="mt-1 text-xs text-slate-500">{result.synthesisHint}</p>
                          <Textarea
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            placeholder="写下你的完善总结..."
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentIndex === 0}
                        onClick={() => {
                          setCurrentIndex((i) => Math.max(0, i - 1));
                          setAnswer('');
                          setResult(null);
                          setReflection('');
                        }}
                      >
                        上一组
                      </Button>
                      <Button
                        size="sm"
                        disabled={currentIndex >= filtered.length - 1}
                        onClick={() => {
                          setCurrentIndex((i) => Math.min(filtered.length - 1, i + 1));
                          setAnswer('');
                          setResult(null);
                          setReflection('');
                        }}
                      >
                        下一组
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
