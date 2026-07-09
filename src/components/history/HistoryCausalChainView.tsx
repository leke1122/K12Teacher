'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, AlertCircle, Lightbulb } from 'lucide-react';
import type { CausalChain } from '@/app/api/history/causal-chain/route';
import { cn } from '@/lib/utils';

interface HistoryCausalChainViewProps {
  chapterId: string;
  sectionId: string;
}

const DEMO_EVENTS = [
  '鸦片战争', '甲午中日战争', '辛亥革命', '五四运动',
  '戊戌变法', '洋务运动', '新文化运动', '中国共产党成立'
];

export function HistoryCausalChainView({ chapterId, sectionId }: HistoryCausalChainViewProps) {
  const [eventName, setEventName] = useState(DEMO_EVENTS[0]);
  const [chain, setChain] = useState<CausalChain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentThought, setStudentThought] = useState('');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (DEMO_EVENTS.includes(eventName)) {
      generateChain();
    }
  }, [eventName]);

  const generateChain = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history/causal-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, chapterId, sectionId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '生成失败');
      setChain(json.data as CausalChain);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const revealAll = () => {
    setStudentThought('学生思考区域 - 可在此记录学习笔记');
    setShowHint(true);
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">因果链分析</h3>
          </div>

          {/* 事件选择 */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">选择要分析的历史事件：</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_EVENTS.map((event) => (
                <Button
                  key={event}
                  size="sm"
                  variant={eventName === event ? 'default' : 'outline'}
                  className="text-xs h-7"
                  onClick={() => setEventName(event)}
                >
                  {event}
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <Button size="sm" variant="ghost" onClick={generateChain}>重试</Button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm text-muted-foreground">正在生成因果链...</span>
            </div>
          ) : chain ? (
            <div className="space-y-3">
              {/* 思考提示 */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-amber-800 mb-1">先想一想：{chain.eventName}的历史原因是什么？</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="写下你的思考..."
                        value={studentThought}
                        onChange={(e) => setStudentThought(e.target.value)}
                        className="flex-1 h-8 text-xs"
                      />
                      <Button size="sm" className="h-8 text-xs" onClick={() => setShowHint(true)}>提交</Button>
                    </div>
                    {showHint && (
                      <p className="mt-1 text-xs text-amber-700">
                        可从政治、经济、思想等角度思考
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 因果链展示 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                  <span className="font-medium text-red-600">远因</span>
                  <span>→</span>
                  <span className="font-medium text-orange-600">近因</span>
                  <span>→</span>
                  <span className="font-medium text-blue-600">事件</span>
                  <span>→</span>
                  <span className="font-medium text-emerald-600">直接影响</span>
                  <span>→</span>
                  <span className="font-medium text-teal-600">深远影响</span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {/* 远因 */}
                  <div className="space-y-1">
                    <Badge className="bg-red-100 text-red-700 border-red-200 text-xs w-full justify-center">远因</Badge>
                    {chain.farCauses.map((n, i) => (
                      <div key={i} className="rounded-lg border border-red-200 bg-red-50 p-2">
                        <p className="text-xs font-semibold text-red-800">{i + 1}. {n.title}</p>
                        <p className="text-xs text-red-600 mt-1">{n.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* 近因 */}
                  <div className="space-y-1">
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs w-full justify-center">近因</Badge>
                    {chain.nearCauses.map((n, i) => (
                      <div key={i} className="rounded-lg border border-orange-200 bg-orange-50 p-2">
                        <p className="text-xs font-semibold text-orange-800">{i + 1}. {n.title}</p>
                        <p className="text-xs text-orange-600 mt-1">{n.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* 事件 */}
                  <div className="space-y-1">
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs w-full justify-center">⚡事件</Badge>
                    <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-3">
                      <p className="text-sm font-bold text-blue-800">{chain.event}</p>
                    </div>
                  </div>

                  {/* 直接影响 */}
                  <div className="space-y-1">
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs w-full justify-center">直接影响</Badge>
                    {chain.directEffects.map((n, i) => (
                      <div key={i} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                        <p className="text-xs font-semibold text-emerald-800">{i + 1}. {n.title}</p>
                        <p className="text-xs text-emerald-600 mt-1">{n.description}</p>
                      </div>
                    ))}
                  </div>

                  {/* 深远影响 */}
                  <div className="space-y-1">
                    <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-xs w-full justify-center">深远影响</Badge>
                    {chain.deepEffects.map((n, i) => (
                      <div key={i} className="rounded-lg border border-teal-200 bg-teal-50 p-2">
                        <p className="text-xs font-semibold text-teal-800">{i + 1}. {n.title}</p>
                        <p className="text-xs text-teal-600 mt-1">{n.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">选择一个事件开始分析</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
