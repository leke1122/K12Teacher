'use client';

import { useState, useEffect, useCallback } from 'react';
import { LanguageQuestion } from '@/lib/chineseLanguage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { addWrongQuestion } from '@/services/practiceService';

type Step = 'setup' | 'practice' | 'result';

interface PracticeProps {
  topic?: string;
  difficulty?: '简单' | '中等' | '困难';
  source?: 'AI生成' | '高考真题' | '模拟题';
}

export function LanguagePractice({ topic, difficulty = '中等', source = 'AI生成' }: PracticeProps) {
  const [step, setStep] = useState<Step>('setup');
  const [passage, setPassage] = useState('');
  const [questions, setQuestions] = useState<LanguageQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [usedTime, setUsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'practice' && startTime) {
      interval = setInterval(() => setUsedTime(Math.floor((Date.now() - startTime) / 1000)), 1000);
    }
    return () => clearInterval(interval);
  }, [step, startTime]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/chinese/language/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, source }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || '生成失败');
      setPassage(data.data.passage);
      setQuestions(data.data.questions);
      setAnswers({});
      setCurrentIndex(0);
      setResults(null);
      setStep('practice');
      setStartTime(Date.now());
      setUsedTime(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  }, [topic, difficulty, source]);

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body = {
        practiceId: 'practice-' + Date.now(),
        passage,
        questions,
        answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId: Number(questionId), answer })),
      };
      const res = await fetch('/api/chinese/language/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || '提交失败');
      setResults(data.data.results);
      (data.data.results as any[]).forEach((result) => {
        if (!result.isCorrect) {
          addWrongQuestion({
            id: 'language-' + result.questionId + '-' + Date.now(),
            subjectId: 'chinese',
            chapterId: 'language-use',
            sectionId: String(result.questionId),
            question: result.question,
            options: result.options,
            userAnswer: result.userAnswer,
            correctAnswer: Array.isArray(result.correctAnswer) ? result.correctAnswer.join('、') : String(result.correctAnswer),
            wrongReason: '语言文字运用',
            knowledgePoint: result.type,
            weakPoint: result.type,
            stepAnalysis: result.explanation,
            solutionSteps: result.explanation,
            difficulty: 'medium',
            createdAt: new Date().toISOString(),
            isMastered: false,
          });
        }
      });
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'setup') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground">选择难度后由 AI 生成语段与混合题型，完成训练后自动收录错题。</p>
            <Button onClick={generate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              开始训练
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'practice') {
    const current = questions[currentIndex];
    const selected = answers[currentIndex];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/learn/chinese/language">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回首页
              </Button>
            </Link>
            <Badge variant="outline">{current?.type === 'idiom' ? '成语' : current?.type === 'sentence' ? '病句' : current?.type === 'fill' ? '补写' : '修辞'}</Badge>
          </div>
          <div className="text-xs text-muted-foreground">用时：{Math.floor(usedTime / 60)}分{usedTime % 60}秒</div>
        </div>
        <Progress value={((currentIndex + 1) / questions.length) * 100} />
        <Card>
          <CardHeader>
            <CardTitle>语段材料</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{passage}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>第 {currentIndex + 1} 题</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">{current?.question}</p>
            {current?.context && <p className="text-xs text-muted-foreground">{current.context}</p>}
            {current?.options?.length ? (
              <div className="space-y-2">
                {current.options.map((opt) => (
                  <Button
                    key={opt}
                    variant={selected === opt ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full rounded-md border p-2 text-sm"
                rows={3}
                value={selected || ''}
                onChange={(e) => handleAnswer(e.target.value)}
              />
            )}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>
                上一题
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button onClick={() => setCurrentIndex((i) => i + 1)}>下一题</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  提交批改
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'result' && results) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const totalCount = results.length;
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    return (
      <div className="space-y-4">
        <Link href="/learn/chinese/language">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>训练结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">正确率：{score}%</p>
            <p className="text-xs text-muted-foreground">用时：{Math.floor(usedTime / 60)}分{usedTime % 60}秒</p>
          </CardContent>
        </Card>
        <div className="space-y-3">
          {results.map((r, idx) => {
            const q = questions[idx];
            return (
              <Card key={r.questionId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {r.isCorrect ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-destructive" />}
                    第 {idx + 1} 题
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{q.question}</p>
                  <p className="text-xs text-muted-foreground">你的答案：{r.userAnswer || '未作答'}</p>
                  <p className="text-xs text-muted-foreground">正确答案：{Array.isArray(r.correctAnswer) ? r.correctAnswer.join('、') : r.correctAnswer}</p>
                  <p className="text-xs">{r.explanation}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
