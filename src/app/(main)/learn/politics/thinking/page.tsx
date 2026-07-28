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
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  RefreshCw,
  Star,
  ThumbsUp,
} from 'lucide-react';

type Level = 1 | 2 | 3;

interface QuestionData {
  material?: string;
  source?: string;
  keywords?: { keyword: string; principle?: string; reason?: string }[];
  principles?: { id: string; name: string; content: string }[];
  analysisDimensions?: string[];
  sampleAnalysis?: string;
  topic?: string;
  dimensions?: { dimension: string; analysis: string; principles?: string[] }[];
  answerFramework?: { introduction: string; body: string[]; conclusion: string };
  sampleAnswer?: string;
}

const CHAPTER_INFO: Record<string, { title: string }> = {
  ch1: { title: '第一课：社会主义从空想到科学' },
  ch2: { title: '第二课：社会主义从理论到现实' },
  ch3: { title: '第三课：中国特色社会主义' },
};

export default function PoliticsThinkingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PoliticsThinkingContent />
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

function PoliticsThinkingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const chapterId = searchParams.get('chapter') || 'ch1';
  const chapter = CHAPTER_INFO[chapterId] || CHAPTER_INFO.ch1;

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
          subject: 'politics',
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
      let userPrompt = '请评价学生以下政治解题表现：\n\n学生作答：';
      userPrompt += userAnswer || '（学生未作答）';
      userPrompt += '\n\n材料：' + (questionData.material || '');
      userPrompt += '\n参考答案：' + (questionData.sampleAnswer || '');
      userPrompt += '\n\n请给出评分和反馈。';

      const res = await fetch('/api/thinking/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'politics',
          type: 'thinking',
          userAnswer,
          referenceAnswer: questionData.sampleAnswer,
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50 dark:from-slate-900 dark:via-pink-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
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
            政治 · 解题思维
          </Badge>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm mb-4">
            <Target className="h-5 w-5 text-pink-500" />
            <span className="text-sm font-medium">解题思维训练 · 为什么</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            时政材料分析
          </h1>
          <p className="text-slate-500 text-sm">{chapter.title}</p>
        </div>

        <Card className="mb-6 border-pink-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-pink-500" />
                <span className="text-sm font-medium">难度选择</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant={level === 1 ? 'default' : 'outline'} onClick={() => setLevel(1)} className={level === 1 ? 'bg-pink-500' : ''}>
                  L1 识别
                </Button>
                <Button size="sm" variant={level === 2 ? 'default' : 'outline'} onClick={() => setLevel(2)} className={level === 2 ? 'bg-pink-500' : ''}>
                  L2 匹配
                </Button>
                <Button size="sm" variant={level === 3 ? 'default' : 'outline'} onClick={() => setLevel(3)} className={level === 3 ? 'bg-pink-500' : ''}>
                  L3 自主
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mb-6">
          <Button onClick={generateQuestion} disabled={generating} className="gap-2 bg-pink-500 hover:bg-pink-600">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'AI 生成中...' : '生成新题目'}
          </Button>
        </div>

        {generating ? (
          <Card className="mb-6">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-pink-500 mb-4" />
              <p className="text-slate-500">AI 正在生成专属训练题...</p>
            </CardContent>
          </Card>
        ) : questionData ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-pink-500" />
                  <span className="text-sm font-medium">时政材料</span>
                  {questionData.source && <Badge variant="outline" className="ml-2 text-xs">{questionData.source}</Badge>}
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <p className="text-sm leading-relaxed">{questionData.material}</p>
                </div>
              </CardContent>
            </Card>

            {level === 1 && questionData.keywords && questionData.keywords.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <span className="text-sm font-medium">识别关键词</span>
                    <span className="text-xs text-slate-400 ml-auto">点击选择</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {questionData.keywords.map((item) => (
                      <Button
                        key={item.keyword}
                        size="sm"
                        variant={selectedKeywords.has(item.keyword) ? 'default' : 'outline'}
                        onClick={() => handleKeywordSelect(item.keyword)}
                        className={selectedKeywords.has(item.keyword) ? 'bg-pink-500' : ''}
                      >
                        {item.keyword}
                      </Button>
                    ))}
                  </div>
                  {selectedKeywords.size > 0 && (
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm text-emerald-700">已选择 {selectedKeywords.size} 个关键词</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {questionData.analysisDimensions && questionData.analysisDimensions.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-pink-500" />
                    <span className="text-sm font-medium">多维分析角度</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {questionData.analysisDimensions.map((dim, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{dim}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-pink-500" />
                  <span className="text-sm font-medium">完整作答</span>
                </div>
                {!showResult ? (
                  <>
                    <Textarea
                      placeholder="请运用政治原理进行分析..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="min-h-[150px] mb-4"
                    />
                    <Button onClick={handleSubmit} disabled={loading || !userAnswer.trim()} className="gap-2 bg-pink-500">
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
                    {questionData.sampleAnswer && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200">
                        <p className="text-xs text-emerald-600 mb-2">参考答案：</p>
                        <p className="text-sm whitespace-pre-wrap">{questionData.sampleAnswer}</p>
                      </div>
                    )}
                    {scoreResult && (
                      <div className="p-4 bg-pink-50 dark:bg-pink-950/30 rounded-lg border border-pink-200">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-5 w-5 text-pink-600" />
                          <span className="font-medium text-pink-700">AI 评价：{scoreResult.feedback}</span>
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
                <Button onClick={() => router.push('/learn/templates/practice?subject=politics&chapter=' + chapterId)} className="gap-2 bg-emerald-500">
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
