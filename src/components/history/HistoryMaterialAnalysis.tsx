'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, AlertCircle, FileText, BookOpen } from 'lucide-react';
import type { AnalysisSource } from '@/types/history';

interface HistoryMaterialAnalysisProps {
  chapterId: string;
  sectionId: string;
}

const DIFFICULTY_OPTIONS = ['简单', '中等', '困难'] as const;

export function HistoryMaterialAnalysis({ chapterId, sectionId }: HistoryMaterialAnalysisProps) {
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTY_OPTIONS[number]>('中等');
  const [source, setSource] = useState<AnalysisSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('material');

  const loadSource = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/history/analysis/generate?chapterId=${encodeURIComponent(chapterId)}&difficulty=${encodeURIComponent(difficulty)}&sectionId=${encodeURIComponent(sectionId)}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || '加载失败');
      setSource(json.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/history/analysis/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, sectionId, difficulty }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '生成失败');
      setSource(json.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { loadSource(); }, [chapterId, difficulty]);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-semibold">史料分析</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={difficulty === d ? 'default' : 'outline'}
                    className="h-7 text-xs"
                    onClick={() => setDifficulty(d)}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button size="sm" variant="ghost" onClick={loadSource}>重试</Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm text-muted-foreground">正在加载...</span>
            </div>
          ) : source ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-medium text-emerald-700 mb-1">材料</p>
                <p className="text-sm text-slate-700 leading-relaxed">{source.material}</p>
                <p className="text-xs text-muted-foreground mt-2">—— {source.source}</p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
                <TabsList className="h-auto gap-1">
                  {source.questions?.map((q, i) => (
                    <TabsTrigger key={q.id} value={`q${q.id}`} className="text-xs gap-1">
                      第{q.id}题 · {q.type === 'event' ? '事件识别' : q.type === 'view' ? '观点提炼' : q.type === 'argument' ? '论证分析' : '结论提炼'}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {source.questions?.map((q) => (
                  <TabsContent key={q.id} value={`q${q.id}`} className="space-y-2">
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {q.type === 'event' ? '事件识别' : q.type === 'view' ? '观点提炼' : q.type === 'argument' ? '论证分析' : '结论提炼'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">期望关键词：{q.expectedKeywords?.join('、')}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-700">{q.question}</p>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-500 mb-1">参考答案</p>
                        <p className="text-sm text-slate-700">{q.modelAnswer}</p>
                      </div>
                      {q.hints?.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                          <p className="text-xs font-medium text-amber-700 mb-1">学习提示</p>
                          {q.hints.map((hint, i) => (
                            <p key={i} className="text-xs text-amber-600">{i + 1}. {hint}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">暂无史料分析内容</p>
              <Button size="sm" variant="outline" onClick={handleGenerate} disabled={generating}>
                {generating ? '生成中...' : '生成史料分析'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
