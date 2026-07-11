'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { timelineEvents, causalLinks, type TimelineEvent, type CausalLink } from '@/data/history/unit1_data';

// 节点颜色配置
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  政治: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  经济: { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  思想: { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3' },
  文化: { bg: '#fae8ff', border: '#d946ef', text: '#86198f' },
  军事: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  社会: { bg: '#f3f4f6', border: '#6b7280', text: '#374151' },
};

// 自定义节点组件
function EventNode({ data }: { data: { event: TimelineEvent; onClick: (event: TimelineEvent) => void } }) {
  const colors = categoryColors[data.event.category] || categoryColors.社会;

  return (
    <div
      className="px-4 py-3 rounded-lg border-2 shadow-sm cursor-pointer transition-all hover:shadow-md min-w-[180px] max-w-[220px]"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
      onClick={() => data.onClick(data.event)}
    >
      <div className="text-xs font-medium mb-1" style={{ color: colors.text }}>
        {data.event.year}
      </div>
      <div className="text-sm font-bold text-gray-800 mb-1">
        {data.event.title}
      </div>
      <div className="text-xs" style={{ color: colors.text }}>
        {data.event.category}
      </div>
    </div>
  );
}

const nodeTypes = {
  event: EventNode,
};

interface CausalGraphProps {
  onEventClick?: (event: TimelineEvent) => void;
  highlightEventId?: string;
}

export default function CausalGraph({ onEventClick, highlightEventId }: CausalGraphProps) {
  // 构建节点和边
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // 为每个事件创建节点
    const eventMap = new Map(timelineEvents.map(e => [e.id, e]));

    // 按类别分组
    const categoryOrder = ['经济', '政治', '思想', '文化', '军事', '社会'];
    const categoryPositions: Record<string, number> = {};
    categoryOrder.forEach((cat, idx) => {
      categoryPositions[cat] = idx;
    });

    // 创建节点
    timelineEvents.forEach((event, index) => {
      const col = categoryPositions[event.category] ?? 5;
      const row = Math.floor(index / 3);
      const isHighlighted = event.id === highlightEventId;

      nodes.push({
        id: event.id,
        type: 'event',
        position: { x: col * 280 + 50, y: row * 120 + 50 },
        data: { event, onClick: onEventClick || (() => {}) },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: isHighlighted ? { transform: 'scale(1.1)', zIndex: 10 } : undefined,
      });
    });

    // 创建边
    causalLinks.forEach((link) => {
      const sourceEvent = eventMap.get(link.sourceId);
      const targetEvent = eventMap.get(link.targetId);
      if (sourceEvent && targetEvent) {
        edges.push({
          id: link.id,
          source: link.sourceId,
          target: link.targetId,
          label: link.logic,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          labelStyle: { fontSize: 10, fill: '#64748b' },
          labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#94a3b8',
          },
        });
      }
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [highlightEventId, onEventClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 当高亮事件改变时，更新节点样式
  useMemo(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        style: node.id === highlightEventId ? { transform: 'scale(1.1)', zIndex: 10 } : { transform: 'scale(1)', zIndex: 1 },
      }))
    );
  }, [highlightEventId, setNodes]);

  return (
    <div className="w-full h-full min-h-[500px] bg-white rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
      >
        <Background color="#e2e8f0" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

// 图例组件
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
