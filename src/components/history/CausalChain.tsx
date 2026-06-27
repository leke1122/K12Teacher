'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import type { CausalChain, CausalChainNode } from '@/app/api/history/causal-chain/route';
import { ArrowRight, ChevronDown, ChevronUp, Lightbulb, X, Copy } from 'lucide-react';

interface CausalChainProps {
  chain: CausalChain;
  onClose?: () => void;
}

interface NodeCardProps {
  node: CausalChainNode;
  color: 'cause' | 'event' | 'effect';
  index: number;
}

const COLOR_MAP = {
  cause: {
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
    header: 'text-red-700',
  },
  event: {
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    header: 'text-blue-700',
  },
  effect: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    header: 'text-emerald-700',
  },
};

function NodeCard({ node, color, index }: NodeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = COLOR_MAP[color];

  return (
    <div
      className="group rounded-xl border bg-white p-3 transition-all hover:shadow-md cursor-pointer"
      onClick={() => setExpanded((p) => !p)}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
        <span className={`text-sm font-semibold ${colors.header}`}>
          {index + 1}. {node.title}
        </span>
        <div className="ml-auto">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>
      {expanded && (
        <p className="text-sm text-muted-foreground leading-relaxed pl-4">
          {node.description}
        </p>
      )}
    </div>
  );
}

function CausalChainView({ chain, onClose }: CausalChainProps) {
  const [studentThought, setStudentThought] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [revealedStages, setRevealedStages] = useState<Set<string>>(new Set(['event']));
  const [activeTab, setActiveTab] = useState('chain');

  const allNodes = [
    ...chain.farCauses.map((n) => ({ ...n, role: 'farCause' as const })),
    ...chain.nearCauses.map((n) => ({ ...n, role: 'nearCause' as const })),
    { ...chain, event: chain.event, role: 'event' as const } as unknown as CausalChainNode & { role: string },
    ...chain.directEffects.map((n) => ({ ...n, role: 'directEffect' as const })),
    ...chain.deepEffects.map((n) => ({ ...n, role: 'deepEffect' as const })),
  ];

  const reveal = (stage: string) => {
    setRevealedStages((prev) => new Set([...prev, stage]));
  };

  const handleExport = () => {
    const lines = [
      `# ${chain.eventName} - 因果链分析`,
      '',
      '## 远因',
      ...chain.farCauses.map((n) => `- **${n.title}**：${n.description}`),
      '',
      '## 近因',
      ...chain.nearCauses.map((n) => `- **${n.title}**：${n.description}`),
      '',
      '## 事件',
      `- ${chain.event}`,
      '',
      '## 直接影响',
      ...chain.directEffects.map((n) => `- **${n.title}**：${n.description}`),
      '',
      '## 深远影响',
      ...chain.deepEffects.map((n) => `- **${n.title}**：${n.description}`),
      '',
      `> 生成时间：${new Date().toLocaleString('zh-CN')}`,
    ];
    const text = lines.join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
    try {
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${chain.eventName}_因果链.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback to clipboard
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="chain" className="gap-1">
              因果链
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1">
              学习笔记
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1" onClick={handleExport}>
              <Copy className="h-4 w-4" />
              导出
            </Button>
            {onClose && (
              <Button size="sm" variant="ghost" className="gap-1" onClick={onClose}>
                <X className="h-4 w-4" />
                关闭
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="chain">
          <div className="space-y-4">
            {/* Thinking prompt */}
            <Card className="bg-amber-50/60 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      🧠 先想一想：{chain.eventName}的历史原因是什么？
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="写下你的思考..."
                        value={studentThought}
                        onChange={(e) => setStudentThought(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && setShowHint(true)}
                      />
                      <Button size="sm" onClick={() => setShowHint(true)}>
                        提交
                      </Button>
                    </div>
                    {showHint && (
                      <p className="mt-2 text-xs text-amber-700">
                        💡 参考：可从政治、经济、思想等角度思考历史事件的原因。
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progressive reveal buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {!revealedStages.has('farCauses') && (
                <Button size="sm" variant="outline" onClick={() => reveal('farCauses')}>
                  揭示远因
                </Button>
              )}
              {!revealedStages.has('nearCauses') && revealedStages.has('farCauses') && (
                <Button size="sm" variant="outline" onClick={() => reveal('nearCauses')}>
                  揭示近因
                </Button>
              )}
              {!revealedStages.has('directEffects') && revealedStages.has('nearCauses') && (
                <Button size="sm" variant="outline" onClick={() => reveal('directEffects')}>
                  揭示直接影响
                </Button>
              )}
              {!revealedStages.has('deepEffects') && revealedStages.has('directEffects') && (
                <Button size="sm" variant="outline" onClick={() => reveal('deepEffects')}>
                  揭示深远影响
                </Button>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                逐步揭示，理解历史逻辑
              </span>
            </div>

            {/* Chain display */}
            <div className="grid grid-cols-5 gap-2">
              {/* Far Causes */}
              <div className="space-y-2">
                {revealedStages.has('farCauses') ? (
                  <>
                    <div className="flex items-center gap-1 mb-1">
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">远因</Badge>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </div>
                    {chain.farCauses.map((n, i) => (
                      <NodeCard key={i} node={n} color="cause" index={i} />
                    ))}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-4">
                    <span className="text-xs text-muted-foreground text-center">远因<br />（点击揭示）</span>
                  </div>
                )}
              </div>

              {/* Near Causes */}
              <div className="space-y-2">
                {revealedStages.has('nearCauses') ? (
                  <>
                    <div className="flex items-center gap-1 mb-1">
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">近因</Badge>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                    </div>
                    {chain.nearCauses.map((n, i) => (
                      <NodeCard key={i} node={n} color="cause" index={i} />
                    ))}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-4">
                    <span className="text-xs text-muted-foreground text-center">近因<br />（先揭示远因）</span>
                  </div>
                )}
              </div>

              {/* Event */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 mb-1">
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">⚡ 事件</Badge>
                </div>
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50/40 p-3">
                  <p className="text-sm font-bold text-blue-800 leading-relaxed">{chain.event}</p>
                  <p className="text-xs text-blue-600 mt-1">{chain.eventName}</p>
                </div>
                <ArrowRight className="h-4 w-4 mx-auto text-slate-400 rotate-90" />
              </div>

              {/* Direct Effects */}
              <div className="space-y-2">
                {revealedStages.has('directEffects') ? (
                  <>
                    <div className="flex items-center gap-1 mb-1">
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">直接影响</Badge>
                    </div>
                    {chain.directEffects.map((n, i) => (
                      <NodeCard key={i} node={n} color="effect" index={i} />
                    ))}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-4">
                    <span className="text-xs text-muted-foreground text-center">直接影响<br />（点击揭示）</span>
                  </div>
                )}
              </div>

              {/* Deep Effects */}
              <div className="space-y-2">
                {revealedStages.has('deepEffects') ? (
                  <>
                    <div className="flex items-center gap-1 mb-1">
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <Badge className="bg-teal-100 text-teal-700 border-teal-200 text-xs">深远影响</Badge>
                    </div>
                    {chain.deepEffects.map((n, i) => (
                      <NodeCard key={i} node={n} color="effect" index={i} />
                    ))}
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-4">
                    <span className="text-xs text-muted-foreground text-center">深远影响<br />（先揭示直接影响）</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-base">学习笔记</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">📌 远因</p>
                {chain.farCauses.map((n, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-sm font-semibold">{i + 1}. {n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">📌 近因</p>
                {chain.nearCauses.map((n, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-sm font-semibold">{i + 1}. {n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">📌 事件</p>
                <p className="text-sm text-muted-foreground">{chain.event}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700 mb-1">📌 直接影响</p>
                {chain.directEffects.map((n, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-sm font-semibold">{i + 1}. {n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-teal-700 mb-1">📌 深远影响</p>
                {chain.deepEffects.map((n, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-sm font-semibold">{i + 1}. {n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.description}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  生成时间：{new Date().toLocaleString('zh-CN')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { CausalChainView };
export type { CausalChain };
