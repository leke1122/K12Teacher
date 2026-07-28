'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Map,
  Sparkles,
  RefreshCw,
  Star,
  ThumbsUp,
} from 'lucide-react';

type Level = 1 | 2 | 3;

interface MindmapNode {
  id: string;
  era: string;
  event: string;
  year?: string;
  causes?: string[];
  effects?: string[];
  revealed?: boolean;
}

interface MindmapData {
  title?: string;
  nodes?: MindmapNode[];
  causalLinks?: { from: string; to: string; label: string }[];
}

interface ScoreResult {
  score: number;
  maxScore?: number;
  feedback: string;
  improvements?: string[];
}

const CHAPTER_INFO: Record<string, { title: string; chapterId: string }> = {
  unit1: { title: '第一单元：从中华文明起源到秦汉统一', chapterId: 'unit1' },
  unit2: { title: '第二单元：三国两晋南北朝到隋唐', chapterId: 'unit2' },
  unit3: { title: '第三单元：辽宋夏金元', chapterId: 'unit3' },
};

export default function HistoryMindmapPage() {
  return (
    <Suspense fallback={<Loading />}>
      <HistoryMindmapContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
        <p className="mt-2 text-sm text-slate-500">加载中...</p>
      </div>
    </div>
  );
}

function HistoryMindmapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chapterId = (searchParams.get('chapter') || 'unit1') as string;
  const chapter = CHAPTER_INFO[chapterId] || CHAPTER_INFO.unit1;

  const [level, setLevel] = useState<Level>(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mindmapData, setMindmapData] = useState<MindmapData | null>(null);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [showScore, setShowScore] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);

  // 生成导图
  const generateMindmap = useCallback(async () => {
    setGenerating(true);
    setMindmapData(null);
    setUserInputs({});
    setShowScore(false);

    try {
      const res = await fetch('/api/thinking/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'history',
          chapterId,
          level: `L${level}`,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMindmapData(json.data);
      } else {
        console.error('生成失败:', json.message);
      }
    } catch (err) {
      console.error('请求失败:', err);
    } finally {
      setGenerating(false);
    }
  }, [chapterId, level]);

  // 加载时自动生成
  useEffect(() => {
    generateMindmap();
  }, [generateMindmap]);

  // L1: 点击揭示节点
  const handleRevealNode = (nodeId: string) => {
    if (!mindmapData?.nodes) return;
    const updated = {
      ...mindmapData,
      nodes: mindmapData.nodes.map(n =>
        n.id === nodeId ? { ...n, revealed: true } : n
      ),
    };
    setMindmapData(updated);
  };

  // L2: 输入排序
  const handleInputChange = (nodeId: string, field: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [`${nodeId}-${field}`]: value }));
  };

  // L3: 完整作答后提交评分
  const handleSubmitForScoring = async () => {
    if (!mindmapData) return;
    setLoading(true);

    try {
      // 构建用户答案
      const userAnswer: Record<string, unknown> = {};
      mindmapData.nodes?.forEach(n => {
        userAnswer[n.id] = {
          era: userInputs[`${n.id}-era`] || '',
          event: userInputs[`${n.id}-event`] || '',
          causes: userInputs[`${n.id}-causes`] || '',
          effects: userInputs[`${n.id}-effects`] || '',
        };
      });

      // 调用评分
      let gradingPrompt = '请评价学生以下历史时间轴答题表现：\n\n学生作答：\n' + 
        JSON.stringify(userAnswer, null, 2) + '\n\n参考答案：\n' + 
        JSON.stringify(mindmapData, null, 2) + '\n\n评分维度：\n- 完整性：时间轴是否完整\n- 准确性：事件、时间、因果关系是否正确\n- 逻辑性：因果链是否清晰\n\n请返回 JSON 格式：\n{\n  "score": 分数(0-100),\n  "feedback": "整体评价",\n  "improvements": ["改进建议1", "改进建议2"]\n}';
      
      const res = await fetch('/api/thinking/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'history',
          type: 'mindmap',
          userAnswer,
          referenceAnswer: mindmapData,
          prompt: gradingPrompt,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setScoreResult(json.data);
        setShowScore(true);
      }
    } catch (err) {
      console.error('评分失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const revealedCount = mindmapData?.nodes?.filter(n => n.revealed).length || 0;
  const totalCount = mindmapData?.nodes?.length || 0;
  const progress = totalCount > 0 ? Math.round((revealedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-orange-50 dark:from-slate-900 dark:via-amber-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/learn/thinking">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div className="flex-1" />
          <Badge className="bg-amber-100 text-amber-700 gap-1">
            <Brain className="h-3 w-3" />
            历史 · 思维导图
          </Badge>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm mb-4">
            <Map className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium">思维导图训练 · 是什么</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            历史时间轴与因果链
          </h1>
          <p className="text-slate-500 text-sm">
            {chapter.title}
          </p>
        </div>

        {/* 难度选择 */}
        <Card className="mb-6 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">难度选择</span>
              </div>
              <div className="flex gap-2">
                {([1, 2, 3] as Level[]).map((l) => (
                  <Button
                    key={l}
                    size="sm"
                    variant={level === l ? 'default' : 'outline'}
                    onClick={() => setLevel(l)}
                    className={level === l ? 'bg-amber-500' : ''}
                  >
                    L{l} {l === 1 ? '填空' : l === 2 ? '排序' : '自主'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 加载/生成按钮 */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={generateMindmap}
            disabled={generating}
            className="gap-2 bg-amber-500 hover:bg-amber-600"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI 生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                生成新导图
              </>
            )}
          </Button>
        </div>

        {/* 内容区 */}
        {generating ? (
          <Card className="mb-6">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-amber-500 mb-4" />
              <p className="text-slate-500">AI 正在为你生成专属训练题...</p>
            </CardContent>
          </Card>
        ) : mindmapData ? (
          <>
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">完成进度</span>
                <span className="text-sm font-medium">{revealedCount}/{totalCount}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* 时间轴 */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  <span className="font-medium">{mindmapData.title || '历史时间轴'}</span>
                </div>

                {/* L1: 填空式 */}
                {level === 1 && mindmapData.nodes && (
                  <div className="space-y-4">
                    {mindmapData.nodes.map((node, idx) => (
                      <div
                        key={node.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          node.revealed
                            ? 'bg-white border-amber-300'
                            : 'bg-slate-50 border-slate-200 cursor-pointer hover:border-amber-300'
                        }`}
                        onClick={() => !node.revealed && handleRevealNode(node.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">{node.era}</Badge>
                              <span className="font-medium">{node.event}</span>
                              {node.year && <span className="text-xs text-amber-600">{node.year}</span>}
                            </div>
                            {node.revealed ? (
                              <div className="space-y-2 text-sm">
                                {node.causes && node.causes.length > 0 && (
                                  <div>
                                    <span className="text-red-600 font-medium">原因：</span>
                                    {node.causes.join('、')}
                                  </div>
                                )}
                                {node.effects && node.effects.length > 0 && (
                                  <div>
                                    <span className="text-emerald-600 font-medium">影响：</span>
                                    {node.effects.join('、')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-400">
                                <Lightbulb className="h-4 w-4" />
                                <span className="text-sm">点击揭示答案</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* L2: 排序输入 */}
                {level === 2 && mindmapData.nodes && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 mb-4">
                      请按正确的时间顺序排列以下事件，并填写因果关系：
                    </p>
                    {mindmapData.nodes.map((node, idx) => (
                      <div key={node.id} className="p-4 rounded-lg border bg-slate-50">
                        <div className="flex items-center gap-4 mb-3">
                          <Input
                            type="number"
                            value={userInputs[`${node.id}-order`] || ''}
                            onChange={(e) => handleInputChange(node.id, 'order', e.target.value)}
                            placeholder="序号"
                            className="w-16 text-center"
                          />
                          <span className="font-medium">{node.event}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="填写原因..."
                            value={userInputs[`${node.id}-causes`] || ''}
                            onChange={(e) => handleInputChange(node.id, 'causes', e.target.value)}
                          />
                          <Input
                            placeholder="填写影响..."
                            value={userInputs[`${node.id}-effects`] || ''}
                            onChange={(e) => handleInputChange(node.id, 'effects', e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <Button onClick={handleSubmitForScoring} disabled={loading} className="gap-2 bg-amber-500">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                        提交评分
                      </Button>
                    </div>
                  </div>
                )}

                {/* L3: 自主构建 */}
                {level === 3 && mindmapData.nodes && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 mb-4">
                      请根据所学知识，完整填写以下时间轴：
                    </p>
                    {mindmapData.nodes.map((node) => (
                      <div key={node.id} className="p-4 rounded-lg border bg-slate-50 space-y-3">
                        <div className="font-medium text-amber-600">事件：{node.event}</div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="text-xs text-slate-500">时代</label>
                            <Input
                              value={userInputs[`${node.id}-era`] || ''}
                              onChange={(e) => handleInputChange(node.id, 'era', e.target.value)}
                              placeholder="时代"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-500">年份</label>
                            <Input
                              value={userInputs[`${node.id}-year`] || ''}
                              onChange={(e) => handleInputChange(node.id, 'year', e.target.value)}
                              placeholder="年份"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-xs text-slate-500">直接原因</label>
                            <Input
                              value={userInputs[`${node.id}-causes`] || ''}
                              onChange={(e) => handleInputChange(node.id, 'causes', e.target.value)}
                              placeholder="直接原因"
                            />
                          </div>
                        </div>
                        <Textarea
                          value={userInputs[`${node.id}-effects`] || ''}
                          onChange={(e) => handleInputChange(node.id, 'effects', e.target.value)}
                          placeholder="历史影响..."
                          className="min-h-[60px]"
                        />
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <Button onClick={handleSubmitForScoring} disabled={loading} className="gap-2 bg-amber-500">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                        提交 AI 评分
                      </Button>
                    </div>
                  </div>
                )}

                {/* 评分结果 */}
                {showScore && scoreResult && (
                  <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsUp className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium text-emerald-700">AI 评分</span>
                      <Badge className="bg-emerald-500 text-white">
                        {scoreResult.score}/{scoreResult.maxScore}
                      </Badge>
                    </div>
                    <p className="text-sm text-emerald-700 mb-2">{scoreResult.feedback}</p>
                    {scoreResult.improvements && scoreResult.improvements.length > 0 && (
                      <div className="text-sm text-emerald-600">
                        改进建议：{scoreResult.improvements.join('；')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-amber-400 mb-4" />
              <p className="text-slate-500 mb-4">点击上方按钮生成专属训练题</p>
            </CardContent>
          </Card>
        )}

        {/* 完成提示 */}
        {level === 1 && progress === 100 && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
              <h3 className="text-lg font-bold text-emerald-700 mb-2">太棒了！</h3>
              <p className="text-emerald-600 mb-4">你已完成本节思维导图训练！</p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => router.push(`/learn/history/thinking?chapter=${chapterId}`)}
                  className="gap-2 bg-purple-500 hover:bg-purple-600"
                >
                  <Brain className="h-4 w-4" />
                  进入解题思维
                </Button>
                <Button onClick={generateMindmap} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  再练一次
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
