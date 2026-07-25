'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Lightbulb, ChevronRight, RotateCcw } from 'lucide-react';
import type { GrammarPoint } from '@/types/grammar';
import type { GrammarPracticeQuestion } from '@/types/grammar';

interface GrammarPracticeProps {
  grammarPoint: GrammarPoint;
  onComplete?: (correct: number, total: number) => void;
  onAddToWordBook?: (words: string[]) => void;
}

type PracticeType = 'fill' | 'correct' | 'translate' | 'choice';

const PRACTICE_TYPES: { type: PracticeType; label: string; icon: string }[] = [
  { type: 'fill', label: '填空', icon: '📝' },
  { type: 'correct', label: '改错', icon: '✏️' },
  { type: 'translate', label: '翻译', icon: '🌏' },
];

export function GrammarPractice({ grammarPoint, onComplete, onAddToWordBook }: GrammarPracticeProps) {
  const [type, setType] = useState<PracticeType>('fill');
  const [questions, setQuestions] = useState<GrammarPracticeQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = questions[current];
  const userAnswer = answers[current] || '';

  const generateQuestions = useCallback(async (t: PracticeType) => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setAnswers([]);
    setSubmitted(false);
    setCurrent(0);

    try {
      const res = await fetch('/api/english/grammar/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grammarId: grammarPoint.id,
          grammarName: grammarPoint.name,
          structure: grammarPoint.structure.formula,
          examPoints: grammarPoint.examPoints,
          examples: grammarPoint.examples,
          type: t,
        }),
      });

      if (!res.ok) {
        throw new Error('生成失败');
      }

      const json = await res.json();
      if (json.success && json.questions?.length > 0) {
        setQuestions(json.questions);
        setAnswers(new Array(json.questions.length).fill(''));
      } else {
        throw new Error(json.message || '没有生成题目');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  }, [grammarPoint]);

  const handleAnswerChange = (val: string) => {
    const next = [...answers];
    next[current] = val;
    setAnswers(next);
  };

  const handleSubmit = async () => {
    const correct = userAnswer.trim().toLowerCase() === question?.answer.trim().toLowerCase();
    setSubmitted(true);
    
    // 检查是否错误，错误则记录到错题本
    if (!correct && question) {
      try {
        await fetch('/api/wrong-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId: 'english',
            question: question.question,
            correctAnswer: question.answer,
            userAnswer: userAnswer,
            analysis: question.explanation || '',
            knowledgePoint: grammarPoint.name,
            wrongReason: '语法练习错误',
          }),
        });
        console.log('语法错题已记录');
      } catch (err) {
        console.error('记录语法错题失败:', err);
      }
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      const correct = questions.reduce((n, q, i) => {
        return n + (answers[i]?.trim().toLowerCase() === q.answer.trim().toLowerCase() ? 1 : 0);
      }, 0);
      onComplete?.(correct, questions.length);
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setAnswers([]);
    setSubmitted(false);
    setCurrent(0);
  };

  // 评分
  const correct = questions.reduce((n, q, i) => {
    return n + (answers[i]?.trim().toLowerCase() === q.answer.trim().toLowerCase() ? 1 : 0);
  }, 0);

  if (!questions.length && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📝 语法练习 · {grammarPoint.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">选择练习类型，系统将生成对应的练习题。</p>
          <div className="grid grid-cols-3 gap-3">
            {PRACTICE_TYPES.map(pt => (
              <Button
                key={pt.type}
                variant="outline"
                className="h-20 flex-col gap-1"
                onClick={() => {
                  setType(pt.type);
                  generateQuestions(pt.type);
                }}
              >
                <span className="text-xl">{pt.icon}</span>
                <span className="text-sm">{pt.label}</span>
              </Button>
            ))}
          </div>
          {error && (
            <div className="text-sm text-red-500 p-3 bg-red-50 rounded-lg">{error}</div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500 mb-3" />
          <p className="text-sm text-muted-foreground">正在生成练习题...</p>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          选择练习类型开始练习
        </CardContent>
      </Card>
    );
  }

  const isCorrect = submitted && userAnswer.trim().toLowerCase() === question?.answer.trim().toLowerCase();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
              {type === 'fill' ? '📝 填空' : type === 'correct' ? '✏️ 改错' : '🌏 翻译'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              第 {current + 1} / {questions.length} 题
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1"
            onClick={handleRestart}
          >
            <RotateCcw className="h-4 w-4" />
            重新开始
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 题目 */}
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-base text-slate-800 whitespace-pre-wrap">{question?.question}</p>
        </div>

        {/* 答案输入 */}
        {type !== 'choice' && (
          <Textarea
            value={userAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={type === 'translate' ? '请输入英文翻译...' : '请填写答案...'}
            className="min-h-[80px] text-base"
            disabled={submitted}
          />
        )}

        {/* 结果 */}
        {submitted && (
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {isCorrect ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-700">回答正确！🎉</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-700">
                      正确答案：<span className="font-mono bg-white px-1 rounded">{question?.answer}</span>
                    </p>
                  </div>
                </>
              )}
            </div>
            {question?.explanation && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">{question.explanation}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {!submitted ? (
            <Button
              className="flex-1 gap-2"
              onClick={handleSubmit}
              disabled={!userAnswer.trim()}
            >
              提交答案
            </Button>
          ) : (
            <Button
              className="flex-1 gap-2"
              onClick={handleNext}
            >
              {current < questions.length - 1 ? (
                <>下一题 <ChevronRight className="h-4 w-4" /></>
              ) : (
                <>完成 ({correct}/{questions.length})</>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
