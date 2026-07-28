'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  FileText,
  Globe,
  Lightbulb,
  Loader2,
  Map,
  Sparkles,
  Target,
  RefreshCw,
  Star,
  ThumbsUp,
} from 'lucide-react';

type Level = 1 | 2 | 3;

interface QuestionData {
  materialType?: string;
  materialDescription?: string;
  keyInformation?: { info: string; significance?: string }[];
  questions?: { question: string; answer?: string; keyPoint?: string }[];
  phenomenon?: string;
  description?: string;
  elements?: { id: string; name: string; description?: string }[];
  correctAnalysis?: { primaryElement?: string; reasoning?: string };
  region?: string;
  question?: string;
  type?: string;
  analysisFramework?: {
    naturalFactors?: string[];
    humanFactors?: string[];
    comprehensive?: string;
  };
  referenceAnswer?: string;
}

const CHAPTER_INFO: Record<string, { title: string }> = {
  ch1: { title: '第一章：宇宙中的地球' },
  ch2: { title: '第二章：地球上的大气' },
  ch3: { title: '第三章：地球上的水' },
};

export default function GeographyThinkingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <GeographyThinkingContent />
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

function GeographyThinkingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chapterId = searchParams.get('chapter') || 'ch1';
  const chapter = CHAPTER_INFO[chapterId] || CHAPTER_INFO.ch1;

  const [level, setLevel] = useState<Level>(1);
  const [generating, setGenerating] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; feedback: string } | null>(null);

  const generateQuestion = useCallback(async () => {
    setGenerating(true);
    setQuestionData(null);
    setUserAnswer('');
    setShowResult(false);

    try {
      const res = await fetch('/api/thinking/thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'geography',
          chapterId,
          level: 'L' + level,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setQuestionData(json.data);
      }
    } catch (err) {
      console.error('生成失败:', err);
    } finally {
      setGenerating(false);
    }
  }, [chapterId, level]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  const handleSubmit = async () => {
    if (!questionData) return;
    setLoading(true);

    try {
      let userPrompt = '请评价学生以下地理解题表现：\n\n学生作答：';
      userPrompt += userAnswer || '（学生未作答）';
      userPrompt += '\n\n题目：' + (questionData.question || questionData.phenomenon || '');
      const refAnswer = questionData.referenceAnswer || JSON.stringify(questionData.analysisFramework || {});
      userPrompt += '\n参考答案：' + refAnswer;
      userPrompt += '\n\n请给出评分和反馈。';

      const res = await fetch('/api/thinking/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'geography',
          type: 'thinking',
          userAnswer,
          referenceAnswer: questionData.referenceAnswer || questionData.analysisFramework,
          prompt: userPrompt,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setScoreResult(json.data);
        setShowResult(true);
      }
    } catch (err) {
      console.error('评分失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
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
            地理 · 解题思维
          </Badge>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm mb-4">
            <Target className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-medium">解题思维训练 · 为什么</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            地理要素分析
          </h1>
          <p className="text-slate-500 text-sm">{chapter.title}</p>
        </div>

        <Card className="mb-6 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">难度选择</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={level === 1 ? 'default' : 'outline'} onClick={() => setLevel(1)} className={level === 1 ? 'bg-emerald-500' : ''}>
                  L1 识别
                </Button>
                <Button size="sm" variant={level === 2 ? 'default' : 'outline'} onClick={() => setLevel(2)} className={level === 2 ? 'bg-emerald-500' : ''}>
                  L2 匹配
                </Button>
                <Button size="sm" variant={level === 3 ? 'default' : 'outline'} onClick={() => setLevel(3)} className={level === 3 ? 'bg-emerald-500' : ''}>
                  L3 自主
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mb-6">
          <Button onClick={generateQuestion} disabled={generating} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'AI 生成中...' : '生成新题目'}
          </Button>
        </div>

        {generating ? (
          <Card className="mb-6">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-emerald-500 mb-4" />
              <p className="text-slate-500">AI 正在生成专属训练题...</p>
            </CardContent>
          </Card>
        ) : questionData ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium">
                    {questionData.phenomenon ? '地理现象' : questionData.region ? '区域分析' : '图文信息'}
                  </span>
                  {questionData.type && <Badge variant="outline" className="ml-2 text-xs">{questionData.type}</Badge>}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">
                    {questionData.materialDescription || questionData.description || questionData.region}
                  </p>
                </div>
                {questionData.question && (
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200">
                    <p className="text-sm font-medium text-emerald-700">{questionData.question}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {level === 1 && questionData.keyInformation && questionData.keyInformation.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium">关键信息点</span>
                  </div>
                  <div className="space-y-2">
                    {questionData.keyInformation.map((item, i) => (
                      <div key={i} className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200">
                        <p className="text-sm font-medium text-amber-700">{item.info}</p>
                        {item.significance && (
                          <p className="text-xs text-amber-600 mt-1">{item.significance}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {questionData.elements && questionData.elements.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-medium">地理要素</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {questionData.elements.map((el) => (
                      <div key={el.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                        <p className="font-medium text-sm">{el.name}</p>
                        {el.description && (
                          <p className="text-xs text-slate-500 mt-1">{el.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {questionData.correctAnalysis && (
                    <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200">
                      <p className="text-sm font-medium text-emerald-700">
                        主导致导要素：{questionData.correctAnalysis.primaryElement}
                      </p>
                      {questionData.correctAnalysis.reasoning && (
                        <p className="text-xs text-emerald-600 mt-1">
                          推理过程：{questionData.correctAnalysis.reasoning}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {questionData.analysisFramework && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Map className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-medium">分析框架</span>
                  </div>
                  <div className="space-y-3">
                    {questionData.analysisFramework.naturalFactors && questionData.analysisFramework.naturalFactors.length > 0 && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <p className="text-xs font-medium text-blue-600 mb-2">自然因素</p>
                        <div className="flex flex-wrap gap-2">
                          {questionData.analysisFramework.naturalFactors.map((f, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {questionData.analysisFramework.humanFactors && questionData.analysisFramework.humanFactors.length > 0 && (
                      <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                        <p className="text-xs font-medium text-orange-600 mb-2">人文因素</p>
                        <div className="flex flex-wrap gap-2">
                          {questionData.analysisFramework.humanFactors.map((f, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium">完整作答</span>
                </div>
                {!showResult ? (
                  <>
                    <Textarea
                      placeholder="请运用地理知识进行要素分析..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="min-h-[150px] mb-4"
                    />
                    <Button onClick={handleSubmit} disabled={loading || !userAnswer.trim()} className="gap-2 bg-emerald-500">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                      提交 AI 评分
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="text-xs text-slate-500 mb-2">你的答案：</p>
                      <p className="text-sm whitespace-pre-wrap">{userAnswer}</p>
                    </div>
                    {questionData.referenceAnswer && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200">
                        <p className="text-xs text-emerald-600 mb-2">参考答案：</p>
                        <p className="text-sm whitespace-pre-wrap">{questionData.referenceAnswer}</p>
                      </div>
                    )}
                    {scoreResult && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-5 w-5 text-emerald-600" />
                          <span className="font-medium text-emerald-700">AI 评价：{scoreResult.feedback}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {showResult && (
          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
              <h3 className="text-lg font-bold text-emerald-700 mb-2">练习完成！</h3>
              <div className="flex justify-center gap-4">
                <Button onClick={() => router.push('/learn/templates/practice?subject=geography&chapter=' + chapterId)} className="gap-2 bg-emerald-500">
                  <FileText className="h-4 w-4" />
                  进入答题模板
                </Button>
                <Button onClick={generateQuestion} variant="outline" className="gap-2">
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
