'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  FileText,
  Lightbulb,
  Loader2,
  Search,
  Sparkles,
  Target,
  RefreshCw,
  Star,
  ThumbsUp,
} from 'lucide-react';

type Level = 1 | 2 | 3;

interface QuestionEye {
  keyword: string;
  explanation?: string;
}

interface QuestionData {
  material?: string;
  materialSource?: string;
  question?: string;
  type?: string;
  questionEye?: QuestionEye[];
  timePosition?: string;
  spacePosition?: string;
  steps?: { step: number; prompt: string; keyPoint?: string }[];
  sampleAnswer?: string;
}

const CHAPTER_INFO: Record<string, { title: string }> = {
  unit1: { title: '第一单元：从中华文明起源到秦汉统一' },
  unit2: { title: '第二单元：三国两晋南北朝到隋唐' },
  unit3: { title: '第三单元：辽宋夏金元' },
};

export default function HistoryThinkingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <HistoryThinkingContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
        <p className="mt-2 text-sm text-slate-500">加载中...</p>
      </div>
    </div>
  );
}

function HistoryThinkingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chapterId = searchParams.get('chapter') || 'unit1';
  const chapter = CHAPTER_INFO[chapterId] || CHAPTER_INFO.unit1;

  const [level, setLevel] = useState<Level>(1);
  const [generating, setGenerating] = useState(false);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; feedback: string } | null>(null);

  const generateQuestion = useCallback(async () => {
    setGenerating(true);
    setQuestionData(null);
    setSelectedKeywords(new Set());
    setUserAnswer('');
    setShowResult(false);

    try {
      const res = await fetch('/api/thinking/thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'history',
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

  const handleKeywordSelect = (keyword: string) => {
    const newSet = new Set(selectedKeywords);
    if (newSet.has(keyword)) {
      newSet.delete(keyword);
    } else {
      newSet.add(keyword);
    }
    setSelectedKeywords(newSet);
  };

  const handleSubmit = async () => {
    if (!questionData) return;
    setLoading(true);

    try {
      let userPrompt = '请评价学生以下历史解题表现：\n\n学生作答：';
      userPrompt += userAnswer || '（学生未作答）';
      userPrompt += '\n\n题目：\n材料：' + (questionData.material || '');
      userPrompt += '\n问题：' + (questionData.question || '');
      userPrompt += '\n\n参考答案：' + (questionData.sampleAnswer || '');
      userPrompt += '\n\n请给出评分和反馈。';

      const res = await fetch('/api/thinking/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'history',
          type: 'thinking',
          userAnswer,
          referenceAnswer: { question: questionData.question, answer: questionData.sampleAnswer },
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

  const correctKeywords = questionData?.questionEye?.map((e: QuestionEye) => e.keyword) || [];
  const keywordAccuracy = correctKeywords.length > 0
    ? Math.round((selectedKeywords.size / correctKeywords.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/learn/thinking">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div className="flex-1" />
          <Badge className="bg-purple-100 text-purple-700 gap-1">
            <Brain className="h-3 w-3" />
            历史 · 解题思维
          </Badge>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm mb-4">
            <Target className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">解题思维训练 · 为什么</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            历史材料分析
          </h1>
          <p className="text-slate-500 text-sm">{chapter.title}</p>
        </div>

        <Card className="mb-6 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">难度选择</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={level === 1 ? 'default' : 'outline'}
                  onClick={() => setLevel(1)}
                  className={level === 1 ? 'bg-purple-500' : ''}
                >
                  L1 识别
                </Button>
                <Button
                  size="sm"
                  variant={level === 2 ? 'default' : 'outline'}
                  onClick={() => setLevel(2)}
                  className={level === 2 ? 'bg-purple-500' : ''}
                >
                  L2 匹配
                </Button>
                <Button
                  size="sm"
                  variant={level === 3 ? 'default' : 'outline'}
                  onClick={() => setLevel(3)}
                  className={level === 3 ? 'bg-purple-500' : ''}
                >
                  L3 自主
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mb-6">
          <Button onClick={generateQuestion} disabled={generating} className="gap-2 bg-purple-500 hover:bg-purple-600">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'AI 生成中...' : '生成新题目'}
          </Button>
        </div>

        {generating ? (
          <Card className="mb-6">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-500 mb-4" />
              <p className="text-slate-500">AI 正在生成专属训练题...</p>
            </CardContent>
          </Card>
        ) : questionData ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">材料</span>
                  {questionData.type && <Badge variant="outline" className="ml-2 text-xs">{questionData.type}</Badge>}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{questionData.material}</p>
                  {questionData.materialSource && (
                    <p className="text-xs text-slate-400 mt-2">—— {questionData.materialSource}</p>
                  )}
                </div>
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    问题：{questionData.question}
                  </p>
                </div>
              </CardContent>
            </Card>

            {level === 1 && questionData.questionEye && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium">识别题眼</span>
                    <span className="text-xs text-slate-400 ml-auto">点击选择关键词</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {questionData.questionEye.map((eye: QuestionEye) => (
                      <Button
                        key={eye.keyword}
                        size="sm"
                        variant={selectedKeywords.has(eye.keyword) ? 'default' : 'outline'}
                        onClick={() => handleKeywordSelect(eye.keyword)}
                        className={selectedKeywords.has(eye.keyword) ? 'bg-purple-500' : ''}
                      >
                        {eye.keyword}
                        {selectedKeywords.has(eye.keyword) && <CheckCircle2 className="h-3 w-3 ml-1" />}
                      </Button>
                    ))}
                  </div>

                  {selectedKeywords.size > 0 && (
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm text-emerald-700">
                        已选择 {selectedKeywords.size}/{questionData.questionEye.length} 个关键词
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {level === 1 && questionData.timePosition && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium">时空定位</span>
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-700">
                      <span className="font-medium">时间：</span>{questionData.timePosition}
                    </p>
                    {questionData.spacePosition && (
                      <p className="text-sm text-amber-700 mt-1">
                        <span className="font-medium">空间：</span>{questionData.spacePosition}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium">完整作答</span>
                </div>

                {!showResult ? (
                  <>
                    <Textarea
                      placeholder="请完整作答，展示你的解题思路..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="min-h-[150px] mb-4"
                    />
                    <Button onClick={handleSubmit} disabled={loading || !userAnswer.trim()} className="gap-2 bg-purple-500">
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
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200">
                      <p className="text-xs text-emerald-600 mb-2">参考答案：</p>
                      <p className="text-sm whitespace-pre-wrap">{questionData.sampleAnswer}</p>
                    </div>
                    {scoreResult && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-5 w-5 text-purple-600" />
                          <span className="font-medium text-purple-700">AI 评价：{scoreResult.feedback}</span>
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
                <Button onClick={() => router.push('/learn/templates/practice?subject=history&chapter=' + chapterId)} className="gap-2 bg-emerald-500">
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
