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
              <span className="text-sm text-muted-foreground">加载中...</span>
            </div>
          ) : !source ? (
            <div className="text-center py-8 space-y-3">
              <BookOpen className="h-10 w-10 mx-auto text-slate-300" />
              <p className="text-sm text-muted-foreground">暂无史料分析内容</p>
              <Button onClick={handleGenerate} disabled={generating} size="sm" className="gap-1">
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    AI 生成史料分析
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-medium text-emerald-700 mb-1">材料</p>
                <p className="text-sm text-slate-700 leading-relaxed">{source.material}</p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
                <TabsList className="h-auto gap-1">
                  <TabsTrigger value="material" className="text-xs gap-1">
                    📜 材料
                  </TabsTrigger>
                  <TabsTrigger value="question" className="text-xs gap-1">
                    ❓ 问题
                  </TabsTrigger>
                  {source.answer && (
                    <TabsTrigger value="answer" className="text-xs gap-1">
                      ✅ 答案
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="material">
                  <Card>
                    <CardContent className="p-3 text-sm">
                      <p className="leading-relaxed">{source.material}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="question">
                  <Card>
                    <CardContent className="p-3 text-sm space-y-2">
                      <p className="leading-relaxed whitespace-pre-wrap">{source.question}</p>
                      {source.knowledgePoints && source.knowledgePoints.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1">相关知识点：</p>
                          <div className="flex flex-wrap gap-1">
                            {source.knowledgePoints.map((kp, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{kp}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {source.answer && (
                  <TabsContent value="answer">
                    <Card>
                      <CardContent className="p-3 text-sm">
                        <pre className="whitespace-pre-wrap font-sans leading-relaxed">{source.answer}</pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
