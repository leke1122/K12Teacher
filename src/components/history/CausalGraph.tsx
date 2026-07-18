'use client';

import { useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MarkerType,
  Position,
  NodeProps,
} from 'reactflow';
import dagre from '@dagrejs/dagre';
import 'reactflow/dist/style.css';
import type { TimelineEvent } from '@/types/history';
import type { CausalLink } from '@/data/history/unit1_data';
import { BookOpen } from 'lucide-react';

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  政治: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  经济: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  思想: { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3' },
  文化: { bg: '#fae8ff', border: '#d946ef', text: '#86198f' },
  军事: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  社会: { bg: '#f3f4f6', border: '#6b7280', text: '#374151' },
};

const categoryOrder = ['经济', '政治', '思想', '文化', '军事', '社会'];

function getCategoryWeight(category: string) {
  const weights: Record<string, number> = {
    经济: 1,
    政治: 2,
    社会: 3,
    思想: 4,
    文化: 5,
    军事: 6,
  };
  return weights[category] || 99;
}

function buildDagreLayout(events: TimelineEvent[], links: CausalLink[]) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB',
    nodesep: 80,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
  });
  g.setDefaultEdgeLabel(() => ({}));

  const eventMap = new Map(events.map(e => [e.id, e]));

  events.forEach(event => {
    g.setNode(event.id, {
      label: event.title,
      category: event.category,
      width: 220,
      height: 80,
    });
  });

  links.forEach(link => {
    if (eventMap.has(link.sourceId) && eventMap.has(link.targetId)) {
      g.setEdge(link.sourceId, link.targetId, { type: link.type || '导致' });
    }
  });

  dagre.layout(g);

  const nodeWidth = 220;
  const nodeHeight = 80;

  const nodes: Node[] = events.map(event => {
    const dagreNode = g.node(event.id);
    const position = dagreNode
      ? { x: dagreNode.x - nodeWidth / 2, y: dagreNode.y - nodeHeight / 2 }
      : { x: 0, y: 0 };

    return {
      id: event.id,
      type: 'historyEvent',
      position,
      data: { event },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });

  const edges: Edge[] = [];
  g.edges().forEach(edge => {
    const link = links.find(l => l.sourceId === edge.v && l.targetId === edge.w);
    const linkType = link?.type || '导致';
    const typeColors: Record<string, string> = {
      导致: '#ef4444',
      促进: '#10b981',
      制约: '#f59e0b',
      推动: '#6366f1',
    };
    const color = typeColors[linkType] || '#6b7280';

    edges.push({
      id: link?.id || `${edge.v}-${edge.w}`,
      source: edge.v,
      target: edge.w,
      label: linkType,
      type: 'smoothstep',
      animated: linkType === '推动',
      style: { stroke: color, strokeWidth: 2 },
      labelStyle: { fill: color, fontSize: 12 },
      labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
      markerEnd: { type: MarkerType.ArrowClosed, color },
      data: { logic: link?.logic },
    });
  });

  return { nodes, edges };
}

interface CausalGraphProps {
  events?: TimelineEvent[];
  causalLinks?: CausalLink[];
  onEventClick?: (event: TimelineEvent) => void;
  highlightEventId?: string;
}

function HistoryEventNode({ data }: NodeProps) {
  const event = data?.event as TimelineEvent | undefined;
  const colors = event ? categoryColors[event.category] || categoryColors.社会 : categoryColors.社会;
  const isHighlighted = data?.highlightEventId === event?.id;

  return (
    <div
      onClick={() => event && data?.onEventClick?.(event)}
      style={{
        padding: 10,
        borderRadius: 12,
        border: `2px solid ${colors.border}`,
        background: colors.bg,
        color: colors.text,
        minWidth: 180,
        cursor: 'pointer',
        transform: isHighlighted ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.2s ease',
        boxShadow: isHighlighted ? '0 10px 25px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BookOpen className="h-4 w-4" style={{ color: colors.border }} />
        <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>{event?.title}</div>
      </div>
      <div style={{ marginTop: 6, fontSize: 11, opacity: 0.8 }}>
        {event?.dynasty} {event?.year}
      </div>
    </div>
  );
}

export default function CausalGraph({
  events = [],
  causalLinks = [],
  onEventClick,
  highlightEventId,
}: CausalGraphProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildDagreLayout(events, causalLinks),
    [events, causalLinks],
  );

  const nodeTypes = useMemo(() => ({ historyEvent: HistoryEventNode }), []);

  const styledNodes = useMemo(() => {
    return initialNodes.map(node => {
      const event = node.data?.event as TimelineEvent | undefined;

      return {
        ...node,
        type: 'historyEvent',
        data: {
          ...node.data,
          onEventClick,
          highlightEventId,
        },
      };
    });
  }, [initialNodes, highlightEventId, onEventClick]);

  return (
    <div className="w-full h-full min-h-[520px] bg-white rounded-lg">
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={styledNodes}
        edges={initialEdges}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export function CausalGraphLegend() {
  return (
    <div className="flex flex-wrap gap-3 p-3 bg-slate-50 rounded-lg">
      {Object.entries(categoryColors).map(([category, colors]) => (
        <div key={category} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: colors.bg, border: `2px solid ${colors.border}` }}
          />
          <span className="text-xs text-gray-600">{category}</span>
        </div>
      ))}
    </div>
  );
}
