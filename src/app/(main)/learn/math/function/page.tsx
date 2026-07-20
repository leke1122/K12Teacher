'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Brain, BookOpen, Target, TrendingUp, 
  Sparkles, CheckCircle2, ChevronRight, Loader2,
  Lightbulb, Zap, BarChart3
} from 'lucide-react';
import { FunctionGraphVisualization } from '@/components/math/function/FunctionGraphVisualization';
import { FunctionTutorChat } from '@/components/math/function/FunctionTutorChat';
import { getNodeById, FunctionGraphNode } from '@/data/math/functionKnowledgeGraph';

export default function FunctionLearningPage() {
  const router = useRouter();
  const userId = 'personal-user';
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLearning, setIsLearning] = useState(false);
  const [stats, setStats] = useState({
    masteredCount: 0,
    learningCount: 0,
    totalNodes: 22,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/math/function/progress?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setStats({
          masteredCount: data.stats.masteredCount,
          learningCount: data.stats.learningCount,
          totalNodes: data.stats.totalNodes,
        });
      }
    } catch (err) {
      console.error('[FunctionLearning] 获取统计失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleStartLearning = () => {
    if (selectedNodeId) {
      setIsLearning(true);
    }
  };

  const handleComplete = (nodeId: string, score: number) => {
    console.log(`[FunctionLearning] 完成知识点 ${nodeId}，得分 ${score}`);
    fetchStats(); // 刷新统计
  };

  const handleNext = () => {
    setIsLearning(false);
    setSelectedNodeId(null);
    fetchStats();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
      {/* 顶部导航 */}
      <header className="z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/math')} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-600">
              <Sparkles className="h-3 w-3 mr-1" />
              Neural-Math Lab
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {isLearning && selectedNode ? (
          // 学习模式
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：知识图谱（缩小版） */}
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-500" />
                    学习中：{selectedNode.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground mb-2">{selectedNode.description}</p>
                    {selectedNode.formula && (
                      <code className="block bg-white dark:bg-slate-800 p-2 rounded text-sm text-center">
                        {selectedNode.formula}
                      </code>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedNode.keyPoints.map((point, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：对话学习 */}
            <div className="h-[600px]">
              <FunctionTutorChat
                userId={userId}
                nodeId={selectedNode.id}
                nodeLabel={selectedNode.label}
                nodeDescription={selectedNode.description}
                keyPoints={selectedNode.keyPoints}
                formula={selectedNode.formula}
                onComplete={handleComplete}
                onNext={handleNext}
              />
            </div>
          </div>
        ) : (
          // 浏览模式
          <div className="space-y-6">
            {/* 进度概览 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">已掌握</p>
                      <p className="text-2xl font-bold">{stats.masteredCount}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">学习中</p>
                      <p className="text-2xl font-bold">{stats.learningCount}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">总进度</p>
                      <p className="text-2xl font-bold">
                        {Math.round((stats.masteredCount / stats.totalNodes) * 100)}%
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 opacity-50" />
                  </div>
                  <Progress value={(stats.masteredCount / stats.totalNodes) * 100} className="mt-2 h-1 bg-white/30" />
                </CardContent>
              </Card>
              
              <Card className="border-indigo-200 dark:border-indigo-800">
                <CardContent className="p-4 flex items-center justify-center h-full">
                  <Link href="/learn/math/function/practice">
                    <Button className="gap-2 bg-indigo-500 hover:bg-indigo-600">
                      <Zap className="h-4 w-4" />
                      开始练习
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* 知识图谱 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  函数知识图谱
                  <Badge variant="outline" className="ml-2 text-xs">
                    {stats.masteredCount} / {stats.totalNodes} 已掌握
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <FunctionGraphVisualization
                    userId={userId}
                    selectedNodeId={selectedNodeId || undefined}
                    onNodeSelect={handleNodeSelect}
                  />
                )}
              </CardContent>
            </Card>

            {/* 选中节点详情 */}
            {selectedNode && (
              <Card className="border-indigo-200 dark:border-indigo-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{selectedNode.label}</CardTitle>
                    <Button size="sm" onClick={handleStartLearning} className="gap-1">
                      <Lightbulb className="h-4 w-4" />
                      开始学习
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                  
                  {selectedNode.formula && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1">📐 公式</h4>
                      <code className="block bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm">
                        {selectedNode.formula}
                      </code>
                    </div>
                  )}
                  
                  {selectedNode.keyPoints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">🎯 关键考点</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.keyPoints.map((point, idx) => (
                          <Badge key={idx} variant="secondary">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedNode.prerequisites.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">📚 前置知识</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedNode.prerequisites.map(prereqId => {
                          const prereqNode = getNodeById(prereqId);
                          return prereqNode ? (
                            <Badge 
                              key={prereqId} 
                              variant="outline" 
                              className="cursor-pointer hover:bg-slate-100"
                              onClick={() => setSelectedNodeId(prereqId)}
                            >
                              {prereqNode.label}
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 快捷操作 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link href="/learn/math/function/practice">
                    <Button variant="outline" className="gap-2">
                      <Target className="h-4 w-4" />
                      专项练习
                    </Button>
                  </Link>
                  <Button variant="outline" className="gap-2" onClick={() => router.push('/learn/math/geogebra')}>
                    <BarChart3 className="h-4 w-4" />
                    GeoGebra 可视化
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => router.push('/subjects/math')}>
                    <ArrowLeft className="h-4 w-4" />
                    返回数学中心
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
