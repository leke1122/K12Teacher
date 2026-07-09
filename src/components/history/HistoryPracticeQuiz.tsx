'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, AlertCircle, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

interface PracticeQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
  difficulty: string;
}

interface HistoryPracticeQuizProps {
  chapterId: string;
  sectionId: string;
  sectionTitle: string;
}

export function HistoryPracticeQuiz({ chapterId, sectionId, sectionTitle }: HistoryPracticeQuizProps) {
  const { settings } = useSettingsStore();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const handleGenerate = async () => {
    if (!settings?.deepseekKey) {
      setError('请先在设置页面配置 DeepSeek API Key');
      return;
    }
    setLoading(true);
    setError(null);
    setScore(0);
    setAnswered(0);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);

    try {
      const res = await fetch('/api/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: 'history',
          chapterId,
          sectionId,
          count: 5,
          apiKey: settings.deepseekKey,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || '生成失败');
      setQuestions(json.data?.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowResult(true);
    setAnswered((p) => p + 1);
    if (index === questions[currentIndex].correct) {
      setScore((p) => p + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const current = questions[currentIndex];
  const progress = questions.length ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              <div>
                <h3 className="text-sm font-semibold">综合练习</h3>
                <p className="text-xs text-muted-foreground">{sectionTitle}</p>
              </div>
            </div>
            {answered > 0 && questions.length > 0 && (
              <Badge variant="outline" className="text-xs">
                正确率：{Math.round((score / answered) * 100)}%
              </Badge>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm text-muted-foreground">正在生成练习题...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">根据本课内容生成练习题</p>
              <Button size="sm" variant="outline" onClick={handleGenerate} disabled={loading || !settings?.deepseekKey}>
                <Sparkles className="h-3 w-3 mr-1" />
                {settings?.deepseekKey ? '生成练习' : '需配置 API Key'}
              </Button>
              {!settings?.deepseekKey && (
                <p className="text-xs text-muted-foreground mt-2">请先在设置页面配置 DeepSeek API Key</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* 进度 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>第 {currentIndex + 1} / {questions.length} 题</span>
                  <span>得分：{score}/{answered}</span>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>

              {/* 题目 */}
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{current.topic}</Badge>
                  <Badge variant="secondary" className="text-xs">{current.difficulty}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{current.question}</p>

                <div className="space-y-2">
                  {current.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg border text-sm transition-all",
                        selectedAnswer === idx
                          ? idx === current.correct
                            ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                            : "bg-red-100 border-red-300 text-red-800"
                          : selectedAnswer !== null && idx === current.correct
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-white border-slate-200 hover:border-indigo-300"
                      )}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </button>
                  ))}
                </div>

                {showResult && (
                  <div className={cn(
                    "rounded-lg p-3 space-y-2",
                    selectedAnswer === current.correct
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-red-50 border border-red-200"
                  )}>
                    <div className="flex items-center gap-2">
                      {selectedAnswer === current.correct ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-emerald-800">回答正确！</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-semibold text-red-800">回答错误</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{current.explanation}</p>
                    <Button size="sm" onClick={handleNext}>
                      {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
                    </Button>
                  </div>
                )}
              </div>

              {/* 最终结果 */}
              {!showResult && answered === questions.length && (
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-center space-y-2">
                  <p className="text-sm font-semibold text-indigo-800">
                    完成！得分：{score} / {questions.length}
                  </p>
                  <p className="text-xs text-indigo-600">
                    正确率：{Math.round((score / questions.length) * 100)}%
                  </p>
                  <Button size="sm" onClick={() => { setQuestions([]); setScore(0); setAnswered(0); setCurrentIndex(0); }}>
                    再做一组
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
