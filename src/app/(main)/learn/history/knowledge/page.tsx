'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Brain, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  gaokaoFocus?: string;
  importance: number;
}

export default function HistoryKnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 获取第一单元的知识点
        const res = await fetch('/api/history/must-know?unitId=u1');
        const data = await res.json();
        if (data.success && data.data?.items) {
          setItems(data.data.items);
        }
      } catch (e) {
        console.error('加载知识点失败:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ['全部', ...Array.from(new Set(items.map(i => i.category)))];

  const filtered = items.filter(item => {
    const matchesSearch = !search || 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === '全部' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Link href="/subjects/history">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-500" />
            历史必背知识点
          </h1>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索知识点..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计 */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>共 {filtered.length} 个知识点</span>
          <span>·</span>
          <span>高频考点 {filtered.filter(i => i.importance >= 4).length} 个</span>
        </div>

        {/* 知识点列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-800">{item.title}</h3>
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < item.importance ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2 line-clamp-3">{item.content}</p>
                  {item.gaokaoFocus && (
                    <p className="text-xs text-indigo-600 font-medium">
                      🎯 {item.gaokaoFocus}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p>未找到相关知识点</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
