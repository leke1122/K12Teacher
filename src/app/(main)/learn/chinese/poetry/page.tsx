'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, BookOpen, Filter } from 'lucide-react';
import { POETRY_LIST } from '@/lib/poetry';

const FILTERS = ['全部', '必修上册', '必修下册', '选择性必修上册', '选择性必修中册', '选择性必修下册'] as const;

export default function PoetryListPage() {
  const [filter, setFilter] = useState<string>('全部');
  const [search, setSearch] = useState('');

  const filteredPoems = useMemo(() => {
    return POETRY_LIST.filter((poem) => {
      const matchSection = filter === '全部' || poem.fromSection === filter;
      const matchSearch = !search || poem.title.includes(search) || poem.author.includes(search);
      return matchSection && matchSearch;
    });
  }, [filter, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50/30 dark:from-slate-900 dark:to-rose-950/30">
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/subjects/chinese">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  返回
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">诗歌鉴赏</h1>
                <p className="text-xs text-slate-500">高考必背篇目 + 辽宁高考风格演练</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">{POETRY_LIST.length} 首</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 筛选栏 */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>筛选：</span>
          </div>
          {FILTERS.map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f}
            </Button>
          ))}
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              className="h-8 pl-8 pr-3 text-xs w-48"
              placeholder="搜索诗题、作者"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 诗歌列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPoems.map((poem) => (
            <Link key={poem.id} href={`/learn/chinese/poetry/${encodeURIComponent(poem.id)}`}>
              <Card className="h-full border-0 shadow hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 group-hover:text-rose-600 transition-colors">
                        {poem.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {poem.dynasty} · {poem.author}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {poem.fromSection}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {poem.text.slice(0, 40)}……
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filteredPoems.length === 0 && (
            <p className="text-sm text-slate-500 col-span-full py-12 text-center">没有找到匹配的诗歌</p>
          )}
        </div>
      </main>
    </div>
  );
}
