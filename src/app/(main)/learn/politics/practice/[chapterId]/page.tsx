'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Sparkles, FileQuestion, Lightbulb, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

type Question = {
  id: string;
  type: 'choice' | 'material' | 'essay';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  material?: { content: string; source?: string };
};

export default function PoliticsPracticePage() {
  const params = useParams();
  const chapterId = useMemo(() => (params.chapterId as string) || 'politics-compulsory-1', [params.chapterId]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  const loadQuestions = async (count: number = 5) => {
    setLoading(true);
    setGenerating(true);
    setAnswers({});
    setRevealed(new Set());
    setCurrentIndex(0);
    setFinished(false);

    try {
      const res = await fetch('/api/politics/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId: 'politics_unit1', type: 'choice', count }),
      });
      const json = await res.json();
      if (json.success && json.questions?.length > 0) {
        setQuestions(json.questions.slice(0, count) as Question[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadQuestions(5);
  }, [chapterId]);

  const handleAnswer = (questionId: string, answer: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setRevealed(prev => new Set([...prev, questionId]));
  };

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(q => answers[q.id] === q.correctAnswer).length;
  const allAnswered = answeredCount === questions.length && questions.length > 0;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const currentQuestion = questions[currentIndex];
  const currentRevealed = currentQuestion ? revealed.has(currentQuestion.id) : false;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const currentCorrect = currentAnswer !== undefined && currentAnswer === currentQuestion?.correctAnswer;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-yellow-50 via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-yellow-950/30">
      <div className="w-full px-4 py-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/politics">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-yellow-500" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">章节练习</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => loadQuestions(5)}
              disabled={generating}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              {generating ? '生成中...' : '重新生成'}
            </Button>
          </div>
        </div>

        {/* 进度卡片 */}
        <Card className="mb-4 border-yellow-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">
                  进度：{answeredCount}/{questions.length} 题
                </span>
                {allAnswered && (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    已完成
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{progress}%</span>
                {allAnswered && (
                  <span className="text-sm font-bold text-emerald-600">
                    正确 {correctCount}/{questions.length}
                  </span>
                )}
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* 题目列表 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {questions.map((q, idx) => {
            const answered = answers[q.id] !== undefined;
            const isCorrect = answered && answers[q.id] === q.correctAnswer;
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 text-xs font-bold transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'border-yellow-400 bg-yellow-100 text-yellow-700'
                    : answered
                    ? isCorrect
                      ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                      : 'border-red-400 bg-red-100 text-red-700'
                    : 'border-slate-200 bg-white dark:bg-slate-800 text-slate-400 hover:border-yellow-300'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* 加载状态 */}
        {loading && generating ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-yellow-500" />
              <p className="text-sm text-slate-500">正在生成练习题...</p>
              <p className="text-xs text-slate-400 mt-1">基于章节内容生成 5 道选择题</p>
            </CardContent>
          </Card>
        ) : questions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileQuestion className="h-8 w-8 mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500">点击"重新生成"按钮获取练习题</p>
            </CardContent>
          </Card>
        ) : allAnswered ? (
          /* 完成页面 */
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-3">
                {correctCount === questions.length ? '🎉' : correctCount >= questions.length * 0.8 ? '👍' : '💪'}
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {correctCount === questions.length ? '全对！太棒了！' :
                 correctCount >= questions.length * 0.8 ? '正确率很高！' :
                 '继续加油！'}
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                本轮正确率：{correctCount}/{questions.length} 题（{Math.round(correctCount / questions.length * 100)}%）
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex(0)}
                >
                  回顾错题
                </Button>
                <Button
                  className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                  onClick={() => loadQuestions(5)}
                >
                  <RotateCcw className="h-4 w-4" />
                  再练一轮
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : currentQuestion ? (
          /* 当前题目 */
          <Card className="mb-4">
            <CardContent className="p-4 space-y-4">
              {/* 题目标题 */}
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                  第 {currentIndex + 1} 题
                </Badge>
                <Badge variant="outline" className="text-xs bg-yellow-50">
                  {currentQuestion.category || '选择题'}
                </Badge>
                {currentRevealed && (
                  currentCorrect ? (
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> 正确
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 text-xs">
                      <XCircle className="h-3 w-3 mr-1" /> 错误
                    </Badge>
                  )
                )}
              </div>

              {/* 题目内容 */}
              <h3 className="text-base font-medium text-slate-800 dark:text-slate-100 leading-snug">
                {currentQuestion.question}
              </h3>

              {/* 选项 */}
              {currentQuestion.options && (
                <RadioGroup
                  value={String(currentAnswer ?? '')}
                  onValueChange={(val) => !currentRevealed && handleAnswer(currentQuestion.id, parseInt(val))}
                  className="space-y-2"
                >
                  {currentQuestion.options.map((opt, oIdx) => {
                    const isCorrectOption = oIdx === Number(currentQuestion.correctAnswer);
                    const isSelected = currentAnswer === oIdx;
                    return (
                      <div
                        key={oIdx}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          currentRevealed
                            ? isCorrectOption
                              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                              : isSelected
                              ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
                              : 'border-slate-200 dark:border-slate-700'
                            : isSelected
                            ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30'
                            : 'border-slate-200 dark:border-slate-700 hover:border-yellow-200 cursor-pointer'
                        }`}
                        onClick={() => !currentRevealed && handleAnswer(currentQuestion.id, oIdx)}
                      >
                        <RadioGroupItem
                          value={String(oIdx)}
                          id={`opt-${oIdx}`}
                          className="flex-shrink-0"
                        />
                        <Label
                          htmlFor={`opt-${oIdx}`}
                          className={`flex-1 cursor-pointer text-sm ${
                            currentRevealed && isCorrectOption ? 'text-emerald-700 dark:text-emerald-300 font-medium' :
                            currentRevealed && isSelected && !isCorrectOption ? 'text-red-700 dark:text-red-300' :
                            'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-slate-400 mr-1">{String.fromCharCode(65 + oIdx)}.</span>
                          {opt}
                        </Label>
                        {currentRevealed && isCorrectOption && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        )}
                        {currentRevealed && isSelected && !isCorrectOption && (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </RadioGroup>
              )}

              {/* 解析（答错后自动显示） */}
              {currentRevealed && (
                <div className={`rounded-lg p-4 ${
                  currentCorrect
                    ? 'bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30'
                    : 'bg-red-50 border border-red-200 dark:bg-red-950/30'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className={`h-4 w-4 ${currentCorrect ? 'text-emerald-600' : 'text-red-600'}`} />
                    <span className={`text-sm font-semibold ${currentCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                      {currentCorrect ? '回答正确！' : '回答错误，正确答案是 ' + String.fromCharCode(65 + Number(currentQuestion.correctAnswer))}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${currentCorrect ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}`}>
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* 底部操作 */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4" /> 上一题
                </Button>
                <span className="text-xs text-slate-400">
                  {currentIndex + 1} / {questions.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                  disabled={currentIndex === questions.length - 1}
                >
                  下一题 <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
