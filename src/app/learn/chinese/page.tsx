'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, BookOpen, Search, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

type ChinesePoem = {
  id: string;
  title: string;
  author: string;
  category?: string;
  book_name?: string;
};

export default function ChineseLearningCenterPage() {
  const [poems, setPoems] = useState<ChinesePoem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | '文言文' | '诗词曲'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter !== 'all') params.set('category', filter);
        const res = await fetch(`/api/chinese/classical-poems?${params.toString()}`);
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || '加载失败');
        setPoems(json.data || []);
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filter]);

  const filteredPoems = useMemo(() => {
    if (!search.trim()) return poems;
    const q = search.trim();
    return poems.filter((p) => p.title.includes(q) || p.author.includes(q));
  }, [poems, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, ChinesePoem[]> = {};
    for (const poem of filteredPoems) {
      const key = poem.category === '诗词曲' ? '诗词曲' : '文言文';
      groups[key] = groups[key] || [];
      groups[key].push(poem);
    }
    return groups;
  }, [filteredPoems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/40 dark:from-slate-900 dark:to-amber-950/20">
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/subjects/chinese">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  返回
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">语文学习中心</h1>
                <p className="text-xs text-slate-500">古诗文 72 篇 · 原文、拼音、翻译、考点问答与朗读</p>
              </div>
            </div>
            <Badge variant="outline">{filteredPoems.length} 篇</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-4">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3 pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BookOpen className="h-4 w-4" />
              <span>分类：</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', '文言文', '诗词曲'] as const).map((item) => (
                <Button
                  key={item}
                  size="sm"
                  variant={filter === item ? 'default' : 'outline'}
                  onClick={() => setFilter(item)}
                >
                  {item === 'all' ? '全部' : item}
                </Button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索标题或作者"
                className="h-9 w-56"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPoems.map((poem) => (
              <Card key={poem.id} className="transition hover:shadow-md">
                <CardHeader className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-snug">{poem.title}</CardTitle>
                    <Badge variant={poem.category === '诗词曲' ? 'secondary' : 'outline'}>{poem.category || '古诗文'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">{poem.author} {poem.book_name ? `· ${poem.book_name}` : ''}</p>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="default" className="w-full">
                    <Link href={`/learn/chinese/${poem.id}`}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      开始学习
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !filteredPoems.length && (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <Sparkles className="h-8 w-8 text-amber-500" />
              <p className="text-sm text-slate-600">暂无古诗文数据，请先运行导入脚本并确认 Supabase 已配置。</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
