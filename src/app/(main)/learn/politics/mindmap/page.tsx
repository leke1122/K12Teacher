'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Loader2,
  Sparkles,
  RefreshCw,
  Star,
  ThumbsUp,
  TreePine,
} from 'lucide-react';

type Level = 1 | 2 | 3;

interface BranchNode {
  id: string;
  concept: string;
  definition?: string;
  childConcepts?: string[];
  revealed?: boolean;
}

interface MindmapData {
  title?: string;
  rootConcept?: string;
  branches?: BranchNode[];
}

const CHAPTER_INFO: Record<string, { title: string }> = {
  ch1: { title: '第一课：社会主义从空想到科学' },
  ch2: { title: '第二课：社会主义从理论到现实' },
  ch3: { title: '第三课：只有坚持和发展中国特色社会主义' },
};

export default function PoliticsMindmapPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PoliticsMindmapContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-pink-500" />
        <p className="mt-2 text-sm text-slate-500">加载中...</p>
      </div>
    </div>
  );
}

function PoliticsMindmapContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chapterId = (searchParams.get('chapter') || 'ch1') as string;
  const chapter = CHAPTER_INFO[chapterId] || CHAPTER_INFO.ch1;

  const [level, setLevel] = useState<Level>(1);
  const [generating, setGenerating] = useState(false);
  const [mindmapData, setMindmapData] = useState<MindmapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [showScore, setShowScore] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; feedback: string } | null>(null);

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
          subject: 'politics',
          chapterId,
          level: `L${level}`,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setMindmapData(json.data);
      }
    } catch (err) {
      console.error('生成失败:', err);
    } finally {
      setGenerating(false);
    }
  }, [chapterId, level]);

  useEffect(() => {
    generateMindmap();
  }, [generateMindmap]);

  const handleRevealNode = (nodeId: string) => {
    if (!mindmapData?.branches) return;
    setMindmapData({
      ...mindmapData,
      branches: mindmapData.branches.map(b =>
        b.id === nodeId ? { ...b, revealed: true } : b
      ),
    });
  };

  const handleInputChange = (nodeId: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [nodeId]: value }));
  };

  const handleSubmitScoring = async () => {
    setLoading(true);
    try {
      const userAnswer: Record<string, string> = {};
      mindmapData?.branches?.forEach(b => {
        userAnswer[b.id] = userInputs[b.id] || '';
      });

      const gradingPrompt = '请评价学生以下答题：\n' + 
        JSON.stringify(userAnswer) + '\n\n参考答案：\n' + 
        JSON.stringify(mindmapData);

      const res = await fetch('/api/thinking/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'politics',
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

  const revealedCount = mindmapData?.branches?.filter(b => b.revealed).length || 0;
  const totalCount = mindmapData?.branches?.length || 0;
  const progress = totalCount > 0 ? Math.round((revealedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50 dark:from-slate-900 dark:via-pink-950 dark:to-slate-900">
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
          <Badge className="bg-pink-100 text-pink-700 gap-1">
            <Brain className="h-3 w-3" />
            政治 · 思维导图
          </Badge>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm mb-4">
            <TreePine className="h-5 w-5 text-pink-500" />
            <span className="text-sm font-medium">思维导图训练 · 是什么</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            政治原理树
          </h1>
          <p className="text-slate-500 text-sm">{chapter.title}</p>
        </div>

        {/* 难度选择 */}
        <Card className="mb-6 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <span className="text-sm font-medium">难度选择</span>
              </div>
              <div className="flex gap-2">
                {([1, 2, 3] as Level[]).map((l) => (
                  <Button key={l} size="sm" variant={level === l ? 'default' : 'outline'} onClick={() => setLevel(l)} className={level === l ? 'bg-pink-500' : ''}>
                    L{l} {l === 1 ? '填空' : l === 2 ? '分类' : '自主'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 生成按钮 */}
        <div className="flex justify-center mb-6">
          <Button onClick={generateMindmap} disabled={generating} className="gap-2 bg-pink-500 hover:bg-pink-600">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'AI 生成中...' : '生成新导图'}
          </Button>
        </div>

        {/* 内容 */}
        {generating ? (
          <Card className="mb-6">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-500 mb-4" />
              <p className="text-slate-500">AI 正在生成专属训练题...</p>
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

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TreePine className="h-5 w-5 text-pink-500" />
                  <span className="font-medium">{mindmapData.title || mindmapData.rootConcept || '原理树'}</span>
                </div>

                {/* L1: 点击揭示 */}
                {level === 1 && mindmapData.branches && (
                  <div className="space-y-3">
                    {mindmapData.branches.map((branch) => (
                      <div
                        key={branch.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          branch.revealed ? 'bg-white border-pink-300' : 'bg-slate-50 border-slate-200 cursor-pointer hover:border-pink-300'
                        }`}
                        onClick={() => !branch.revealed && handleRevealNode(branch.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            branch.revealed ? 'bg-pink-500' : 'bg-slate-300'
                          }`}>
                            {branch.revealed ? <CheckCircle2 className="h-4 w-4" /> : '?'}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{branch.concept}</div>
                            {branch.revealed && branch.definition && (
                              <div className="text-sm text-slate-500 mt-1">{branch.definition}</div>
                            )}
                            {branch.revealed && branch.childConcepts && branch.childConcepts.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {branch.childConcepts.map((child, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{child}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* L2/L3: 输入模式 */}
                {(level === 2 || level === 3) && mindmapData.branches && (
                  <div className="space-y-4">
                    {mindmapData.branches.map((branch) => (
                      <div key={branch.id} className="p-4 rounded-lg border bg-slate-50">
                        <div className="font-medium mb-2">{branch.concept}</div>
                        <Input
                          placeholder="填写相关内容..."
                          value={userInputs[branch.id] || ''}
                          onChange={(e) => handleInputChange(branch.id, e.target.value)}
                        />
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <Button onClick={handleSubmitScoring} disabled={loading} className="gap-2 bg-pink-500">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                        提交评分
                      </Button>
                    </div>
                  </div>
                )}

                {/* 评分结果 */}
                {showScore && scoreResult && (
                  <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-emerald-600" />
                      <span className="font-medium text-emerald-700">AI 评价：{scoreResult.feedback}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}

        {/* 完成提示 */}
        {level === 1 && progress === 100 && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
              <h3 className="text-lg font-bold text-emerald-700 mb-2">太棒了！</h3>
              <div className="flex justify-center gap-4">
                <Button onClick={() => router.push(`/learn/politics/thinking?chapter=${chapterId}`)} className="gap-2 bg-purple-500">
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
