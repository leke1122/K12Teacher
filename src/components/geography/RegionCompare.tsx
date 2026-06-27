'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Loader2, ChevronRight, GitCompare } from 'lucide-react';
import type { MapRegion } from '@/lib/geographyData';

interface RegionCompareProps {
  regions: MapRegion[];
}

type CompareStage = 'select' | 'thinking' | 'result';

function CompareTable({ comparison }: { comparison: { dimensions: { dimension: string; valueA: string; valueB: string }[] } }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-4 py-2 text-left font-medium text-slate-600">对比维度</th>
            <th className="px-4 py-2 text-left font-medium text-blue-600">区域 A</th>
            <th className="px-4 py-2 text-left font-medium text-emerald-600">区域 B</th>
          </tr>
        </thead>
        <tbody>
          {comparison.dimensions.map((dim, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
              <td className="px-4 py-2 font-medium text-slate-700">{dim.dimension}</td>
              <td className="px-4 py-2 text-slate-600">{dim.valueA}</td>
              <td className="px-4 py-2 text-slate-600">{dim.valueB}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RegionCompare({ regions }: RegionCompareProps) {
  const [regionA, setRegionA] = useState<string>('');
  const [regionB, setRegionB] = useState<string>('');
  const [comparison, setComparison] = useState<{ regionA: string; regionB: string; dimensions: { dimension: string; valueA: string; valueB: string }[]; summary: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<CompareStage>('select');
  const [thinkingAnswer, setThinkingAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);

  const regionList = useMemo(() => regions, [regions]);

  const handleCompare = async () => {
    if (!regionA || !regionB) return;
    setLoading(true);
    try {
      const res = await fetch('/api/geography/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regionA, regionB }),
      });
      const json = await res.json();
      if (json.success) {
        setComparison(json.data);
        setStage('thinking');
      } else {
        alert(json.message || '对比失败');
      }
    } catch {
      alert('对比失败');
    } finally {
      setLoading(false);
    }
  };

  const handleThinkingSubmit = () => {
    if (!thinkingAnswer.trim()) return;
    setShowResult(true);
  };

  const handleReset = () => {
    setRegionA('');
    setRegionB('');
    setComparison(null);
    setStage('select');
    setThinkingAnswer('');
    setShowResult(false);
  };

  return (
    <div className="space-y-4">
      {/* 区域选择 */}
      {stage === 'select' && (
        <Card>
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-blue-500" />
              选择对比区域
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium mb-2">区域 A</p>
                <div className="flex flex-wrap gap-2">
                  {regionList.map((r) => (
                    <Button
                      key={r.id}
                      size="sm"
                      variant={regionA === r.id ? 'default' : 'outline'}
                      onClick={() => setRegionA(r.id)}
                      className="text-xs"
                    >
                      {r.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">区域 B</p>
                <div className="flex flex-wrap gap-2">
                  {regionList.map((r) => (
                    <Button
                      key={r.id}
                      size="sm"
                      variant={regionB === r.id ? 'default' : 'outline'}
                      onClick={() => setRegionB(r.id)}
                      disabled={r.id === regionA}
                      className="text-xs"
                    >
                      {r.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                辽宁本土对比案例：辽河平原 vs 三江平原、辽东半岛 vs 山东半岛
              </p>
              <Button
                size="sm"
                onClick={handleCompare}
                disabled={!regionA || !regionB || loading}
                className="gap-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '开始对比'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 对比结果 */}
      {stage === 'thinking' && comparison && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3 pt-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitCompare className="h-4 w-4 text-blue-500" />
                {comparison.regionA} vs {comparison.regionB}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompareTable comparison={comparison} />
            </CardContent>
          </Card>

          {/* 思考题 */}
          {!showResult ? (
            <Card className="bg-amber-50/60 border-amber-200">
              <CardHeader className="pb-3 pt-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  🧠 想一想
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-700">
                  两个区域的差异主要是由什么因素造成的？
                </p>
                <Textarea
                  placeholder="写下你的分析..."
                  value={thinkingAnswer}
                  onChange={(e) => setThinkingAnswer(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex items-center justify-between">
                  <Button size="sm" variant="ghost" onClick={handleReset}>
                    重新选择
                  </Button>
                  <Button size="sm" onClick={handleThinkingSubmit} disabled={!thinkingAnswer.trim()} className="gap-1">
                    提交分析 <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-emerald-50/60 border-emerald-200">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-800">📊 对比分析</p>
                <p className="text-sm text-emerald-700">{comparison.summary}</p>
                <Button size="sm" variant="outline" onClick={handleReset} className="mt-2">
                  对比其他区域
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export { RegionCompare };
