'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserGradeStore, GRADE_LABELS } from '@/stores/gradeStore';
import { SUBJECTS } from '@/stores/subjectStore';
import { Loader2, ZoomIn, Info } from 'lucide-react';

interface GraphNode {
  id: string;
  name: string;
  category: number;
  subject: string;
  color?: string;
  accuracy?: number;
}

interface GraphLink {
  source: string;
  target: string;
  relation: string;
  reason?: string;
}

interface KnowledgeGraph {
  nodes: GraphNode[];
  links: GraphLink[];
  categories: string[];
}

interface NodeDetail {
  name: string;
  relation: string;
  reason?: string;
}

const CATEGORY_COLORS = ['#6366f1', '#3b82f6', '#10b981'];

export function KnowledgeGraph() {
  const { grade } = useUserGradeStore();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [graphData, setGraphData] = useState<KnowledgeGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  useEffect(() => {
    fetchGraph();
  }, [selectedSubject, grade]);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/graph/build?subject=${selectedSubject}&grade=${grade}`);
      const json = await res.json();
      if (json.success) {
        setGraphData(json.graph);
      }
    } catch {
      setGraphData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!chartRef.current || !graphData) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const categories = graphData.categories.map((name, idx) => ({
      name,
      itemStyle: { color: CATEGORY_COLORS[idx] || '#6366f1' },
    }));

    const nodes = graphData.nodes.map((n) => ({
      id: n.id,
      name: n.name,
      category: n.category,
      value: n.category === 0 ? 2 : n.category === 1 ? 1 : 0.5,
      symbolSize: n.category === 0 ? 80 : n.category === 1 ? 50 : 35,
      itemStyle: {
        color: n.category === 0
          ? '#6366f1'
          : n.category === 1
          ? '#3b82f6'
          : '#10b981',
        borderColor: n.category === 0 ? '#4338ca' : n.category === 1 ? '#2563eb' : '#059669',
        borderWidth: 2,
      },
    }));

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const node = graphData.nodes.find((n) => n.id === params.data.id);
          if (!node) return '';
          if (node.category === 0) {
            return `<b>${node.name}</b><br/><span style="color:#888">核心概念</span>`;
          }
          return `<b>${node.name}</b>`;
        },
      },
      legend: showLegend
        ? {
            data: categories.map((c) => c.name),
            top: 'bottom',
            textStyle: { fontSize: 11 },
          }
        : undefined,
      series: [
        {
          type: 'graph',
          layout: 'force',
          symbol: 'circle',
          roam: true,
          draggable: true,
          label: {
            show: true,
            formatter: '{b}',
            fontSize: 11,
            color: '#1e293b',
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: { width: 3, color: '#6366f1' },
            itemStyle: { shadowBlur: 20, shadowColor: '#6366f1' },
          },
          force: {
            repulsion: 200,
            edgeLength: [60, 150],
            layoutAnimation: true,
          },
          categories,
          data: nodes,
          links: graphData.links.map((l) => ({
            source: l.source,
            target: l.target,
            label: {
              show: true,
              formatter: l.relation,
              fontSize: 9,
              color: '#94a3b8',
            },
            lineStyle: { color: '#cbd5e1', width: 1 },
          })),
          lineStyle: { curveness: 0.3 },
        },
      ],
    };

    chart.setOption(option);

    // 点击节点显示详情
    chart.on('click', (params: any) => {
      if (params.dataType === 'node') {
        const link = graphData.links.find(
          (l) => l.source === params.data.id || l.target === params.data.id
        );
        setSelectedNode({
          name: params.data.name,
          relation: link?.relation || '知识点',
          reason: link?.reason,
        });
      }
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [graphData, showLegend]);

  return (
    <div className="space-y-4">
      {/* 学科切换 */}
      <div className="flex gap-2 flex-wrap">
        {SUBJECTS.filter(s => ['math', 'politics', 'history', 'geography', 'chinese'].includes(s.id)).map((s) => (
          <Button
            key={s.id}
            size="sm"
            variant={selectedSubject === s.id ? 'default' : 'outline'}
            onClick={() => setSelectedSubject(s.id)}
            className="gap-1"
          >
            <span>{s.icon}</span>
            <span>{s.name}</span>
          </Button>
        ))}
      </div>

      {/* 图例 */}
      <div className="flex items-center gap-4 text-xs">
        <span className="font-medium">图例：</span>
        {graphData?.categories.map((c, i) => (
          <div key={c} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i] }} />
            <span>{c}</span>
          </div>
        ))}
        <Button size="sm" variant="ghost" className="h-auto p-0 text-xs" onClick={() => setShowLegend(!showLegend)}>
          {showLegend ? '隐藏图例' : '显示图例'}
        </Button>
      </div>

      {/* 图谱主体 */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 z-10 flex items-center justify-center rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        )}
        <div ref={chartRef} className="w-full h-[400px] rounded-lg border bg-white dark:bg-slate-900" />

        {/* 操作提示 */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground flex items-center gap-1">
          <ZoomIn className="h-3 w-3" />
          拖拽移动 · 滚轮缩放
        </div>
      </div>

      {/* 节点详情 */}
      {selectedNode && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                {selectedNode.name}
              </CardTitle>
              <Badge variant="outline" className="text-xs">{selectedNode.relation}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {selectedNode.reason ? (
              <div className="flex items-start gap-2">
                <div className="text-amber-400 mt-0.5">🧠</div>
                <p className="text-xs text-muted-foreground">{selectedNode.reason}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">点击连线查看关联原因</p>
            )}
            <Button
              size="sm"
              variant="link"
              className="h-auto p-0 mt-2 text-xs"
              onClick={() => setSelectedNode(null)}
            >
              关闭详情
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 薄弱节点提示 */}
      <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
        💡 小贴士：点击任意节点可查看该知识点详情。红色节点表示需要加强复习。
        可配合「薄弱分析」页面，针对薄弱环节重点学习。
      </div>
    </div>
  );
}
