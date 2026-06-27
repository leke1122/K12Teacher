'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MaterialAnalysis } from '@/components/history/MaterialAnalysis';
import { ArrowLeft, BookOpen, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateStepProgress } from '@/lib/historyProgress';
import type { AnalysisSource } from '@/types/history';

function AnalysisPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceId = searchParams.get('sourceId') || '';

  const [sources, setSources] = useState<AnalysisSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSourceId, setActiveSourceId] = useState<string>(sourceId || '');
  const [activeTab, setActiveTab] = useState<'list' | 'practice'>('list');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [generating, setGenerating] = useState(false);

  const loadSources = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/history/analysis/list', window.location.origin);
      if (chapterFilter !== 'all') url.searchParams.set('chapterId', chapterFilter);
      if (difficultyFilter !== 'all') url.searchParams.set('difficulty', difficultyFilter);
      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success) {
        setSources(Array.isArray(json.data) ? json.data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, [chapterFilter, difficultyFilter]);

  const handleStart = (id: string) => {
    setActiveSourceId(id);
    setActiveTab('practice');
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/history/analysis/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: chapterFilter === 'all' ? 'modern-china' : chapterFilter,
          difficulty: difficultyFilter === 'all' ? '中等' : difficultyFilter,
        }),
      });
      const json = await res.json();
      if (json.success) {
        await loadSources();
      } else {
        alert(json.message || '生成失败');
      }
    } catch {
      alert('生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const filteredSources = useMemo(() => {
    if (!sources.length) return [];
    return sources;
  }, [sources]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40">
      <div className="w-full px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              📝 历史材料分析训练
            </h1>
            <p className="text-xs text-muted-foreground">
              提升材料分析能力，掌握历史大题答题方法
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'practice')} className="space-y-3">
          <TabsList>
            <TabsTrigger value="list" className="gap-1">
              训练列表
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-1">
              当前训练
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="space-y-4">
              {/* 筛选 + 生成 */}
              <Card>
                <CardContent className="p-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">章节</span>
                    <Select value={chapterFilter} onValueChange={setChapterFilter}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="modern-china">中国近代史</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">难度</span>
                    <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部</SelectItem>
                        <SelectItem value="简单">简单</SelectItem>
                        <SelectItem value="中等">中等</SelectItem>
                        <SelectItem value="困难">困难</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={loadSources}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '刷新'}
                  </Button>
                  <Button size="sm" onClick={handleGenerate} disabled={generating} className="gap-1">
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {generating ? '生成中' : '生成新材料'}
                  </Button>
                </CardContent>
              </Card>

              {/* 列表 */}
              {filteredSources.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    暂无材料，点击右上角“生成新材料”开始训练。
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredSources.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            {item.title}
                            <Badge variant="outline" className="text-xs">
                              {item.difficulty}
                            </Badge>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            章节：{item.chapterId} · 共 {item.questions.length} 题
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleStart(item.id)}
                          className="gap-1"
                        >
                          开始训练
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="practice">
            {activeSourceId ? (
              <MaterialAnalysis
                sourceId={activeSourceId}
                onComplete={() => {
                  updateStepProgress('history', 'modern-china', 'analysis', 'completed');
                }}
              />
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  请先从训练列表中选择或生成一篇材料开始练习。
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function HistoryAnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      }
    >
      <AnalysisPageContent />
    </Suspense>
  );
}
