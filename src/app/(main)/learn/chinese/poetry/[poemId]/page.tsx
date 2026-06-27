'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Loader2, BookOpen, Sparkles, MessageSquare, CheckCircle } from 'lucide-react';
import { POETRY_LIST } from '@/lib/poetry';
import { useSettingsStore } from '@/stores/settingsStore';

type Question = {
  id: string;
  type: 'choice';
  question: string;
  options: string[];
  correct: string;
  analysis: string;
};

export default function PoetryDetailPage() {
  const params = useParams();
  const poemId = params.poemId as string;
  const { settings } = useSettingsStore();

  const poem = POETRY_LIST.find((p) => p.id === poemId);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [wrongQuestions, setWrongQuestions] = useState<any[]>([]);

  const loadAnalysis = useCallback(async (id: string) => {
  setLoading(true);
  try {
    const res = await fetch('/api/analyze-poetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poemId: id }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || '分析失败');
    }
    setAnalysis(json.data);
  } catch (e) {
    console.error(e);
    setAnalysis(null);
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => {
  if (poemId) loadAnalysis(poemId);
}, [poemId, loadAnalysis]);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/analyze-poetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poemId }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.examQuestions)) {
        setQuestions(json.data.examQuestions);
        setAnswers({});
        setWrongQuestions([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSubmitAnswer = (questionId: string, selected: string) => {
    const q = questions.find((item) => item.id === questionId);
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [questionId]: selected }));
    if (selected !== q.correct) {
      setWrongQuestions((prev) => [
        ...prev,
        {
          ...q,
          selected,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const saveWrongQuestions = () => {
    if (!wrongQuestions.length) return;
    const key = `edumind_wrong_questions_${settings?.deepseekKey ? 'ai' : 'local'}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const merged = [
      ...existing,
      ...wrongQuestions.map((q) => ({
        ...q,
        type: 'poetry',
        subject: '语文',
        status: 'wrong',
      })),
    ];
    localStorage.setItem(key, JSON.stringify(merged));
    alert(`已收录 ${wrongQuestions.length} 道错题`);
  };

  if (!poem) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-lg">
          <CardContent className="p-6 text-center">
            <p className="text-slate-500">未找到该诗歌</p>
            <Link href="/learn/chinese/poetry">
              <Button variant="link" className="mt-2">返回诗歌列表</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50/30 dark:from-slate-900 dark:to-rose-950/30">
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/learn/chinese/poetry">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  返回
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {poem.title}
                </h1>
                <p className="text-xs text-slate-500">
                  {poem.dynasty} · {poem.author} · {poem.fromSection}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              诗歌鉴赏
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：原文 */}
          <Card className="border-0 shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                原文
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-2">
                <div className="whitespace-pre-line text-sm leading-7 text-slate-800 dark:text-slate-200">
                  {poem.text}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* 右侧：AI 分析 */}
          <Card className="border-0 shadow">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose-500" />
                AI 分析
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在分析……
                </div>
              ) : analysis ? (
                <ScrollArea className="h-[500px] pr-2 space-y-4">
                  <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase">写作背景</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{analysis.background}</p>
                  </section>
                  <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase">逐句翻译</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-line">
                      {analysis.translation}
                    </p>
                  </section>
                  <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase">意象分析</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{analysis.imagery}</p>
                  </section>
                  <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase">艺术手法</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{analysis.technique}</p>
                  </section>
                  <section>
                    <h3 className="text-xs font-bold text-slate-500 uppercase">思想情感</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{analysis.emotion}</p>
                  </section>
                </ScrollArea>
              ) : (
                <p className="text-sm text-slate-500">暂无分析结果</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 底部：高考真题演练 */}
        <Card className="border-0 shadow mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              高考真题 / 模拟题演练
            </CardTitle>
            <Button variant="outline" size="sm" onClick={loadQuestions} disabled={loadingQuestions}>
              {loadingQuestions ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : null}
              重新生成
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                <p>暂无题目，点击“重新生成”生成诗歌鉴赏题</p>
              </div>
            ) : (
              questions.map((q, idx) => {
                const selected = answers[q.id];
                const isCorrect = selected === q.correct;
                const showResult = selected !== undefined;
                return (
                  <div key={q.id} className="rounded-lg border p-4">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 gap-2 mt-3">
                      {q.options.map((option) => {
                        const letter = option[0];
                        const isSelected = selected === letter;
                        const isAnswer = q.correct === letter;
                        let className = 'h-auto justify-start px-3 py-2 text-sm';
                        if (showResult && isAnswer) className += ' border-green-500 text-green-700';
                        if (showResult && isSelected && !isCorrect) className += ' border-red-500 text-red-700';
                        return (
                          <Button
                            key={option}
                            variant="outline"
                            className={className}
                            disabled={showResult}
                            onClick={() => handleSubmitAnswer(q.id, letter)}
                          >
                            {option}
                            {showResult && isAnswer && <CheckCircle className="ml-auto h-4 w-4 text-green-600" />}
                          </Button>
                        );
                      })}
                    </div>
                    {showResult && (
                      <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                        {isCorrect ? '回答正确' : `回答错误，正确答案：${q.correct}`}
                        <p className="mt-1 text-slate-500">解析：{q.analysis}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            {wrongQuestions.length > 0 && (
              <div className="flex justify-end">
                <Button variant="secondary" size="sm" onClick={saveWrongQuestions}>
                  收录 {wrongQuestions.length} 道错题
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
