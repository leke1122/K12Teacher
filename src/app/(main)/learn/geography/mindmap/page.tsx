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
  Globe,
  Layers,
  Loader2,
  Map,
  Sparkles,
  RefreshCw,
  Star,
  ThumbsUp,
} from 'lucide-react';

type Level = 1 | 2 | 3;

interface GeoElement {
  id: string;
  name: string;
  icon?: string;
  factors?: string[];
  characteristics?: string;
  revealed?: boolean;
}

interface MindmapData {
  title?: string;
  elements?: GeoElement[];
  regionalContext?: string;
}

const CHAPTER_INFO: Record<string, { title: string }> = {
  ch1: { title: '第一章：宇宙中的地球' },
  ch2: { title: '第二章：地球上的大气' },
  ch3: { title: '第三章：地球上的水' },
};

export default function GeographyMindmapPage() {
  return (
    <Suspense fallback={<Loading />}>
      <GeographyMindmapContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
        <p className="mt-2 text-sm text-slate-500">加载中...</p>
      </div>
    </div>
  );
}

function GeographyMindmapContent() {
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
          subject: 'geography',
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

  const handleRevealElement = (elementId: string) => {
    if (!mindmapData?.elements) return;
    setMindmapData({
      ...mindmapData,
      elements: mindmapData.elements.map(e =>
        e.id === elementId ? { ...e, revealed: true } : e
      ),
    });
  };

  const handleInputChange = (elementId: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [elementId]: value }));
  };

  const handleSubmitScoring = async () => {
    setLoading(true);
    try {
      const userAnswer: Record<string, string> = {};
      mindmapData?.elements?.forEach(e => {
        userAnswer[e.id] = userInputs[e.id] || '';
      });

      const gradingPrompt = '请评价学生以下地理要素框架答题：\n学生作答：\n' + 
        JSON.stringify(userAnswer) + '\n\n参考答案：\n' + 
        JSON.stringify(mindmapData);

      const res = await fetch('/api/thinking/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'geography',
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

  const revealedCount = mindmapData?.elements?.filter(e => e.revealed).length || 0;
  const totalCount = mindmapData?.elements?.length || 0;
  const progress = totalCount > 0 ? Math.round((revealedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900">
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
          <Badge className="bg-emerald-100 text-emerald-700 gap-1">
            <Brain className="h-3 w-3" />
            地理 · 思维导图
          </Badge>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm mb-4">
            <Map className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-medium">思维导图训练 · 是什么</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            地理要素框架
          </h1>
          <p className="text-slate-500 text-sm">{chapter.title}</p>
        </div>

        {/* 难度选择 */}
        <Card className="mb-6 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">难度选择</span>
              </div>
              <div className="flex gap-2">
                {([1, 2, 3] as Level[]).map((l) => (
                  <Button key={l} size="sm" variant={level === l ? 'default' : 'outline'} onClick={() => setLevel(l)} className={level === l ? 'bg-emerald-500' : ''}>
                    L{l} {l === 1 ? '填空' : l === 2 ? '选择' : '自主'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 生成按钮 */}
        <div className="flex justify-center mb-6">
          <Button onClick={generateMindmap} disabled={generating} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'AI 生成中...' : '生成新导图'}
          </Button>
        </div>

        {/* 内容 */}
        {generating ? (
          <Card className="mb-6">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-500 mb-4" />
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
                  <Layers className="h-5 w-5 text-emerald-500" />
                  <span className="font-medium">{mindmapData.title || '区域要素框架'}</span>
                </div>

                {/* L1: 五大要素 */}
                {level === 1 && mindmapData.elements && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mindmapData.elements.map((element) => (
                      <div
                        key={element.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          element.revealed
                            ? 'bg-white border-emerald-300'
                            : 'bg-slate-50 border-slate-200 cursor-pointer hover:border-emerald-300'
                        }`}
                        onClick={() => !element.revealed && handleRevealElement(element.id)}
                      >
                        <div className="text-center mb-3">
                          {element.icon ? (
                            <span className="text-4xl">{element.icon}</span>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto font-bold text-lg">
                              {element.name?.charAt(0)}
                            </div>
                          )}
                          <div className="font-bold mt-2">{element.name}</div>
                        </div>
                        {element.revealed ? (
                          <div className="text-sm text-slate-600 space-y-2">
                            {element.factors && element.factors.length > 0 && (
                              <div>
                                <span className="text-emerald-600 font-medium">影响因素：</span>
                                {element.factors.join('、')}
                              </div>
                            )}
                            {element.characteristics && (
                              <div>
                                <span className="text-emerald-600 font-medium">特征：</span>
                                {element.characteristics}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 text-sm flex items-center justify-center gap-1">
                            <Globe className="h-4 w-4" />
                            点击揭示
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* L2/L3: 输入模式 */}
                {(level === 2 || level === 3) && mindmapData.elements && (
                  <div className="space-y-4">
                    {mindmapData.elements.map((element) => (
                      <div key={element.id} className="p-4 rounded-lg border bg-slate-50">
                        <div className="font-medium mb-2 flex items-center gap-2">
                          {element.icon && <span>{element.icon}</span>}
                          {element.name}
                        </div>
                        <Input
                          placeholder="填写影响因素和特征..."
                          value={userInputs[element.id] || ''}
                          onChange={(e) => handleInputChange(element.id, e.target.value)}
                        />
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <Button onClick={handleSubmitScoring} disabled={loading} className="gap-2 bg-emerald-500">
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
                <Button onClick={() => router.push(`/learn/geography/thinking?chapter=${chapterId}`)} className="gap-2 bg-purple-500">
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
