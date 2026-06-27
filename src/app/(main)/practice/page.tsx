'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, ArrowRight, CheckCircle, XCircle,
  PenTool, Loader2, Trophy, Target,
  Brain, Lightbulb, RotateCcw, Home
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { storage, StorageKeys } from '@/lib/storage';

interface Question {
  id: number;
  type: 'choice' | 'fill' | 'judge';
  question: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  analysis?: string;
}

interface PracticeResult {
  total: number;
  correct: number;
  wrong: number;
  score: number;
}

function PracticePageContent() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId') || '';
  const chapterIndex = searchParams.get('chapterIndex') || '';
  const { settings } = useSettingsStore();
  
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [pdfContent, setPdfContent] = useState('');

  // 从本地存储加载 PDF 内容
  useEffect(() => {
    if (subjectId) {
      const stored = storage.get<{ fullText?: string; full_text?: string }>(StorageKeys.PDF(subjectId));
      if (stored) {
        setPdfContent(stored.fullText || stored.full_text || '');
      }
    }
  }, [subjectId]);

  // 生成练习题
  const handleGenerateQuestions = async () => {
    if (!settings?.deepseekKey) {
      alert('请先在设置中配置 DeepSeek API Key');
      return;
    }
    if (!pdfContent) {
      alert('请先上传教材 PDF');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: pdfContent,
          chapterIndex,
          difficulty,
          apiKey: settings.deepseekKey
        }),
      });
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }

      const parsedQuestions: Question[] = (data.questions || []).map((q: Record<string, unknown>, idx: number) => ({
        id: idx + 1,
        type: (q.type as 'choice' | 'fill' | 'judge') || 'choice',
        question: q.question as string,
        options: q.options as string[] | undefined,
        correctAnswer: q.correctAnswer as string,
        analysis: q.analysis as string | undefined
      }));
      
      setQuestions(parsedQuestions);
      setCurrentIndex(0);
      setAnswers({});
      setSubmitted(false);
      setResult(null);
      setShowAnalysis(false);
    } catch (err) {
      alert('生成失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setGenerating(false);
    }
  };

  // 选择答案
  const handleSelectAnswer = (answer: string) => {
    if (submitted) return;
    const newAnswers = { ...answers, [questions[currentIndex].id]: answer };
    setAnswers(newAnswers);
  };

  // 提交答案
  const handleSubmit = () => {
    let correct = 0;
    let wrong = 0;
    
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    setResult({
      total: questions.length,
      correct,
      wrong,
      score: Math.round((correct / questions.length) * 100)
    });
    setSubmitted(true);
    setShowAnalysis(false);
  };

  // 重新开始
  const handleRestart = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setShowAnalysis(false);
  };

  const currentQuestion = questions[currentIndex];
  const isCorrect = submitted && answers[currentQuestion?.id] === currentQuestion?.correctAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={`/subjects/${subjectId}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  返回
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <PenTool className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    章节练习
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {chapterIndex && `第 ${chapterIndex} 章`}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {questions.length > 0 && !submitted && (
                <>
                  <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20">
                    {Object.keys(answers).length}/{questions.length} 已答
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleSubmit} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    提交答案
                  </Button>
                </>
              )}
              {submitted && (
                <Button variant="outline" size="sm" onClick={handleRestart} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  重新开始
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 开始练习界面 */}
        {questions.length === 0 ? (
          <Card className="shadow-lg">
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl">开始章节练习</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                选择难度，AI 将为你生成针对性的练习题
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">选择难度</Label>
                <RadioGroup value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)} className="grid grid-cols-3 gap-4">
                  <div>
                    <RadioGroupItem value="easy" id="easy" className="peer sr-only" />
                    <Label
                      htmlFor="easy"
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 cursor-pointer transition-all",
                        "hover:border-green-300 dark:hover:border-green-700",
                        difficulty === 'easy' && "border-green-500 bg-green-50 dark:bg-green-900/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                        difficulty === 'easy' ? "bg-green-500 text-white" : "bg-slate-100 dark:bg-slate-800"
                      )}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-green-600 dark:text-green-400">简单</span>
                      <span className="text-xs text-slate-500 mt-1">基础概念题</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
                    <Label
                      htmlFor="medium"
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 cursor-pointer transition-all",
                        "hover:border-amber-300 dark:hover:border-amber-700",
                        difficulty === 'medium' && "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                        difficulty === 'medium' ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800"
                      )}>
                        <Brain className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-amber-600 dark:text-amber-400">中等</span>
                      <span className="text-xs text-slate-500 mt-1">综合应用题</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="hard" id="hard" className="peer sr-only" />
                    <Label
                      htmlFor="hard"
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-700 p-4 cursor-pointer transition-all",
                        "hover:border-red-300 dark:hover:border-red-700",
                        difficulty === 'hard' && "border-red-500 bg-red-50 dark:bg-red-900/20"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                        difficulty === 'hard' ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-slate-800"
                      )}>
                        <Trophy className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-red-600 dark:text-red-400">困难</span>
                      <span className="text-xs text-slate-500 mt-1">拓展提高题</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <Button 
                onClick={handleGenerateQuestions} 
                disabled={generating}
                className="w-full h-12 text-base gap-2"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    AI 正在生成练习题...
                  </>
                ) : (
                  <>
                    <PenTool className="h-5 w-5" />
                    开始练习
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : result ? (
          /* 结果页面 */
          <Card className="shadow-lg">
            <div className={cn(
              "h-2",
              result.score >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
              result.score >= 60 ? "bg-gradient-to-r from-amber-500 to-orange-600" :
              "bg-gradient-to-r from-red-500 to-rose-600"
            )} />
            <CardHeader className="text-center">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                result.score >= 80 ? "bg-green-100 dark:bg-green-900/30" :
                result.score >= 60 ? "bg-amber-100 dark:bg-amber-900/30" :
                "bg-red-100 dark:bg-red-900/30"
              )}>
                <Trophy className={cn(
                  "h-10 w-10",
                  result.score >= 80 ? "text-green-600 dark:text-green-400" :
                  result.score >= 60 ? "text-amber-600 dark:text-amber-400" :
                  "text-red-600 dark:text-red-400"
                )} />
              </div>
              <CardTitle className="text-3xl">{result.score} 分</CardTitle>
              <p className="text-slate-500 dark:text-slate-400">
                {result.score >= 80 ? "太棒了！" : result.score >= 60 ? "继续加油！" : "需要多多练习"}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.correct}</div>
                  <div className="text-xs text-slate-500">正确</div>
                </div>
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.wrong}</div>
                  <div className="text-xs text-slate-500">错误</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">{result.total}</div>
                  <div className="text-xs text-slate-500">总计</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium text-slate-800 dark:text-slate-200">答题详情</h3>
                {questions.map((q, idx) => (
                  <div 
                    key={q.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg",
                      answers[q.id] === q.correctAnswer 
                        ? "bg-green-50 dark:bg-green-900/20" 
                        : "bg-red-50 dark:bg-red-900/20"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      answers[q.id] === q.correctAnswer
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    )}>
                      {answers[q.id] === q.correctAnswer ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1 flex-1">
                      {idx + 1}. {q.question}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleRestart} className="flex-1 gap-2">
                  <RotateCcw className="h-4 w-4" />
                  再练一次
                </Button>
                <Link href={`/subjects/${subjectId}`} className="flex-1">
                  <Button className="w-full gap-2">
                    <Home className="h-4 w-4" />
                    返回学科
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* 答题界面 */
          <>
            {/* 进度条 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  题目进度
                </span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>
              <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
            </div>

            {/* 当前题目 */}
            <Card className="shadow-sm mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn(
                    "capitalize",
                    currentQuestion?.type === 'choice' && "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
                    currentQuestion?.type === 'fill' && "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
                    currentQuestion?.type === 'judge' && "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                  )}>
                    {currentQuestion?.type === 'choice' && '选择题'}
                    {currentQuestion?.type === 'fill' && '填空题'}
                    {currentQuestion?.type === 'judge' && '判断题'}
                  </Badge>
                  {submitted && (
                    isCorrect ? (
                      <Badge className="bg-green-500">正确</Badge>
                    ) : (
                      <Badge variant="destructive">错误</Badge>
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  {currentQuestion?.question}
                </p>

                {/* 选择题选项 */}
                {currentQuestion?.type === 'choice' && currentQuestion.options && (
                  <RadioGroup 
                    value={answers[currentQuestion.id]} 
                    onValueChange={handleSelectAnswer}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option, idx) => (
                      <div key={idx}>
                        <RadioGroupItem 
                          value={option} 
                          id={`option-${idx}`} 
                          className="peer sr-only" 
                          disabled={submitted}
                        />
                        <Label
                          htmlFor={`option-${idx}`}
                          className={cn(
                            "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            submitted
                              ? option === currentQuestion.correctAnswer
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : answers[currentQuestion.id] === option
                                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                  : "border-slate-200 dark:border-slate-700 opacity-50"
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600",
                            answers[currentQuestion.id] === option && !submitted && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            submitted
                              ? option === currentQuestion.correctAnswer
                                ? "bg-green-500 text-white"
                                : answers[currentQuestion.id] === option
                                  ? "bg-red-500 text-white"
                                  : "bg-slate-200 dark:bg-slate-700"
                              : answers[currentQuestion.id] === option
                                ? "bg-blue-500 text-white"
                                : "bg-slate-200 dark:bg-slate-700"
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="flex-1">{option}</span>
                          {submitted && option === currentQuestion.correctAnswer && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {submitted && answers[currentQuestion.id] === option && option !== currentQuestion.correctAnswer && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* 判断题选项 */}
                {currentQuestion?.type === 'judge' && (
                  <RadioGroup 
                    value={answers[currentQuestion.id]} 
                    onValueChange={handleSelectAnswer}
                    className="grid grid-cols-2 gap-4"
                  >
                    {['正确', '错误'].map((option) => (
                      <div key={option}>
                        <RadioGroupItem 
                          value={option} 
                          id={`judge-${option}`} 
                          className="peer sr-only" 
                          disabled={submitted}
                        />
                        <Label
                          htmlFor={`judge-${option}`}
                          className={cn(
                            "flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            submitted
                              ? option === currentQuestion.correctAnswer
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : answers[currentQuestion.id] === option
                                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                  : "border-slate-200 dark:border-slate-700 opacity-50"
                              : "border-slate-200 dark:border-slate-700 hover:border-blue-300",
                            answers[currentQuestion.id] === option && !submitted && "border-blue-500 bg-blue-50"
                          )}
                        >
                          <span className="text-lg">{option === '正确' ? '✓' : '✗'}</span>
                          <span>{option}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* 解析 */}
                {submitted && showAnalysis && currentQuestion?.analysis && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700 dark:text-blue-400">答案解析</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {currentQuestion.analysis}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                上一题
              </Button>
              
              <div className="flex gap-2">
                {submitted && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="gap-2"
                  >
                    <Lightbulb className="h-4 w-4" />
                    {showAnalysis ? '隐藏解析' : '查看解析'}
                  </Button>
                )}
              </div>

              {currentIndex < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                  className="gap-2"
                >
                  下一题
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  提交答案
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    }>
      <PracticePageContent />
    </Suspense>
  );
}
