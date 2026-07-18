'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, CheckCircle2, Circle, Loader2, ChevronRight,
  Brain, Lightbulb, TrendingUp, Zap
} from 'lucide-react';
import { FunctionGraphNode, NodeCategory } from '@/data/math/functionKnowledgeGraph';

interface NodeMastery {
  nodeId: string;
  level: 'not_started' | 'learning' | 'mastered';
  score: number;
}

interface FunctionGraphVisualizationProps {
  userId?: string;
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string;
}

// 分类颜色配置
const categoryColors: Record<NodeCategory, { bg: string; border: string; text: string }> = {
  '概念': { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-300', text: 'text-blue-600' },
  '性质': { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-300', text: 'text-green-600' },
  '初等函数': { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-300', text: 'text-amber-600' },
  '变换': { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-300', text: 'text-purple-600' },
  '微积分': { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-300', text: 'text-rose-600' },
};

// 掌握度颜色
const masteryColors = {
  mastered: { bg: 'bg-emerald-500', text: 'text-white', label: '已掌握' },
  learning: { bg: 'bg-amber-500', text: 'text-white', label: '学习中' },
  not_started: { bg: 'bg-slate-300 dark:bg-slate-600', text: 'text-white', label: '未学' },
};

export function FunctionGraphVisualization({
  userId = 'personal-user',
  onNodeSelect,
  selectedNodeId,
}: FunctionGraphVisualizationProps) {
  const [mastery, setMastery] = useState<Record<string, NodeMastery>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'category' | 'path'>('category');

  useEffect(() => {
    fetchMastery();
  }, [userId]);

  const fetchMastery = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/math/function/guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'get_status' }),
      });
      const data = await res.json();
      if (data.success && data.nodeStatus) {
        setMastery(data.nodeStatus);
      }
    } catch (err) {
      console.error('[FunctionGraph] 获取掌握度失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 按分类组织节点
  const nodesByCategory = useCallback(() => {
    const categories: Record<NodeCategory, FunctionGraphNode[]> = {
      '概念': [],
      '性质': [],
      '初等函数': [],
      '变换': [],
      '微积分': [],
    };
    return categories;
  }, []);

  const getMasteryLevel = (nodeId: string) => {
    return mastery[nodeId]?.level || 'not_started';
  };

  const getMasteryScore = (nodeId: string) => {
    return mastery[nodeId]?.score || 0;
  };

  const getNodeProgress = () => {
    const mastered = Object.values(mastery).filter(m => m.level === 'mastered').length;
    const learning = Object.values(mastery).filter(m => m.level === 'learning').length;
    return { mastered, learning };
  };

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">加载知识图谱...</span>
        </div>
      </Card>
    );
  }

  const progress = getNodeProgress();

  return (
    <div className="space-y-4">
      {/* 顶部进度条 */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <span className="font-semibold">函数知识图谱</span>
            </div>
            <Badge className="bg-white/20 text-white">
              {progress.mastered}/{progress.mastered + progress.learning + 22} 已掌握
            </Badge>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${(progress.mastered / 22) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 视图切换 */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'category' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('category')}
          className="flex-1"
        >
          <BookOpen className="h-4 w-4 mr-1" /> 按分类
        </Button>
        <Button
          variant={viewMode === 'path' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('path')}
          className="flex-1"
        >
          <TrendingUp className="h-4 w-4 mr-1" /> 学习路径
        </Button>
      </div>

      {/* 知识节点网格 */}
      {viewMode === 'category' ? (
        <CategoryView
          mastery={mastery}
          onNodeSelect={onNodeSelect}
          selectedNodeId={selectedNodeId}
          getMasteryLevel={getMasteryLevel}
          getMasteryScore={getMasteryScore}
        />
      ) : (
        <PathView
          mastery={mastery}
          onNodeSelect={onNodeSelect}
          selectedNodeId={selectedNodeId}
          getMasteryLevel={getMasteryLevel}
          getMasteryScore={getMasteryScore}
        />
      )}
    </div>
  );
}

// 按分类视图
function CategoryView({
  mastery,
  onNodeSelect,
  selectedNodeId,
  getMasteryLevel,
  getMasteryScore,
}: {
  mastery: Record<string, NodeMastery>;
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string;
  getMasteryLevel: (id: string) => string;
  getMasteryScore: (id: string) => number;
}) {
  const categories: { key: NodeCategory; label: string; nodes: FunctionGraphNode[] }[] = [
    { key: '概念', label: '📚 基础概念', nodes: [] },
    { key: '性质', label: '🔍 函数性质', nodes: [] },
    { key: '初等函数', label: '📈 初等函数', nodes: [] },
    { key: '变换', label: '🔄 函数变换', nodes: [] },
    { key: '微积分', label: '📐 导数与微积分', nodes: [] },
  ];

  // 动态导入节点
  const { functionGraphNodes } = require('@/data/math/functionKnowledgeGraph');
  for (const node of functionGraphNodes) {
    const cat = categories.find(c => c.key === node.category);
    if (cat) cat.nodes.push(node);
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 pr-4">
        {categories.map(cat => (
          <div key={cat.key}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              {cat.label}
              <Badge variant="outline" className="text-xs">
                {cat.nodes.filter(n => mastery[n.id]?.level === 'mastered').length}/{cat.nodes.length}
              </Badge>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {cat.nodes.map(node => (
                <NodeCard
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  masteryLevel={getMasteryLevel(node.id)}
                  score={getMasteryScore(node.id)}
                  onClick={() => onNodeSelect?.(node.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// 学习路径视图
function PathView({
  mastery,
  onNodeSelect,
  selectedNodeId,
  getMasteryLevel,
  getMasteryScore,
}: {
  mastery: Record<string, NodeMastery>;
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string;
  getMasteryLevel: (id: string) => string;
  getMasteryScore: (id: string) => number;
}) {
  const { functionGraphNodes } = require('@/data/math/functionKnowledgeGraph');
  
  // 按学习顺序排列
  const order = [
    ['func-basic', 'func-domain', 'func-range'],
    ['func-monotonicity', 'func-parity', 'func-periodicity'],
    ['func-extreme', 'func-maxmin'],
    ['linear-function', 'quadratic-function', 'power-function'],
    ['exp-function', 'log-function'],
    ['trig-function', 'func-transform'],
    ['func-limit', 'derivative-concept', 'derivative-rules', 'derivative-application'],
  ];

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3 pr-4">
        {order.map((row, rowIdx) => (
          <div key={rowIdx} className="relative">
            {rowIdx > 0 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {row.map(nodeId => {
                const node = functionGraphNodes.find((n: any) => n.id === nodeId);
                if (!node) return null;
                return (
                  <NodeCard
                    key={node.id}
                    node={node}
                    isSelected={selectedNodeId === node.id}
                    masteryLevel={getMasteryLevel(node.id)}
                    score={getMasteryScore(node.id)}
                    onClick={() => onNodeSelect?.(node.id)}
                    compact
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// 节点卡片
function NodeCard({
  node,
  isSelected,
  masteryLevel,
  score,
  onClick,
  compact = false,
}: {
  node: FunctionGraphNode;
  isSelected: boolean;
  masteryLevel: string;
  score: number;
  onClick?: () => void;
  compact?: boolean;
}) {
  const colors = categoryColors[node.category];
  const mColors = masteryColors[masteryLevel as keyof typeof masteryColors] || masteryColors.not_started;

  return (
    <button
      onClick={onClick}
      className={`
        relative p-3 rounded-lg border-2 text-left transition-all w-full
        ${isSelected ? 'border-indigo-500 shadow-md ring-2 ring-indigo-200' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'}
        ${colors.bg}
        ${compact ? 'min-w-[100px]' : ''}
      `}
    >
      {/* 掌握度指示器 */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${mColors.bg}`} />
      
      <div className="flex items-start gap-2">
        {masteryLevel === 'mastered' ? (
          <CheckCircle2 className={`h-4 w-4 ${colors.text} flex-shrink-0 mt-0.5`} />
        ) : (
          <Circle className="h-4 w-4 text-slate-300 flex-shrink-0 mt-0.5" />
        )}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium ${colors.text} truncate`}>{node.label}</p>
          {score > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">{score}分</p>
          )}
        </div>
      </div>
    </button>
  );
}

// 节点详情弹窗
export function NodeDetailModal({
  node,
  masteryLevel,
  score,
  onStartLearning,
  onClose,
}: {
  node: FunctionGraphNode;
  masteryLevel: string;
  score: number;
  onStartLearning?: () => void;
  onClose?: () => void;
}) {
  const colors = categoryColors[node.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <Card className="max-w-md w-full mx-4 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className={colors.bg + ' ' + colors.border + ' ' + colors.text}>
              {node.category}
            </Badge>
            <Badge variant={masteryLevel === 'mastered' ? 'default' : 'outline'}>
              {masteryLevel === 'mastered' ? '✅ 已掌握' : masteryLevel === 'learning' ? '🔄 学习中' : '📖 未学'}
            </Badge>
          </div>
          <CardTitle className="text-xl mt-2">{node.label}</CardTitle>
          {score > 0 && <p className="text-sm text-muted-foreground">得分: {score}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold mb-1">📝 知识点描述</h4>
            <p className="text-sm text-muted-foreground">{node.description}</p>
          </div>
          
          {node.keyPoints && node.keyPoints.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-1">🎯 关键考点</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {node.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {node.formula && (
            <div>
              <h4 className="text-sm font-semibold mb-1">📐 相关公式</h4>
              <code className="block bg-slate-100 dark:bg-slate-800 p-2 rounded text-sm">
                {node.formula}
              </code>
            </div>
          )}
          
          {node.prerequisites.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-1">📚 前置知识</h4>
              <div className="flex flex-wrap gap-1">
                {node.prerequisites.map(prereqId => (
                  <Badge key={prereqId} variant="secondary" className="text-xs">
                    {prereqId}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 gap-1" onClick={onStartLearning}>
              <Zap className="h-4 w-4" />
              开始学习
            </Button>
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
