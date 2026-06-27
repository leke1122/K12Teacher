'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MathContent } from '@/components/ui/MathContent';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, Loader2, CheckCircle, XCircle,
  Sparkles, ChevronRight, Target
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { fallbackGetPDF } from '@/lib/localFallback';
import { extractSectionContent } from '@/lib/pdf-utils';
import { PracticeResult } from '@/components/practice/PracticeResult';
import { SimilarQuestion } from '@/components/practice/SimilarQuestion';
import { HandwritingPad } from '@/components/canvas/HandwritingPad';
import { ImageUploader } from '@/components/practice/ImageUploader';
import { addWrongQuestion, addOrUpdateWeakPoint, addPracticeRecord, getWrongQuestions } from '@/services/practiceService';
import type { PracticeQuestion, PracticeAnswer, WrongQuestion } from '@/services/practiceService';
import { cn } from '@/lib/utils';

type Difficulty = 'simple' | 'medium' | 'hard';

function PracticePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subjectId = params.subjectId as string;
  const chapterId = params.chapterId as string;
  const sectionId = params.sectionId as string;

  const sectionTitle = searchParams.get('sectionTitle') || '';
  const subSectionTitle = searchParams.get('subSectionTitle') || '';
  const pageType = searchParams.get('pageType') || searchParams.get('pageRangeType') || 'file';
  const fileStart = searchParams.get('fileStart');
  const fileEnd = searchParams.get('fileEnd');
  const startPage = parseInt(searchParams.get('startPage') || '3', 10);
  const endPage = parseInt(searchParams.get('endPage') || '9', 10);

  const effectiveRange = pageType === 'printed' && fileStart && fileEnd
    ? { start: parseInt(fileStart, 10), end: parseInt(fileEnd, 10) }
    : { start: startPage, end: endPage };

  const { settings } = useSettingsStore();

  const getSubjectName = (id: string) => {
    const map: Record<string, string> = {
      math: '数学', physics: '物理', chemistry: '化学', english: '英语',
      chinese: '语文', biology: '生物', geography: '地理', politics: '政治', history: '历史',
    };
    return map[id] || id;
  };

  // 状态
  const [phase, setPhase] = useState<'select' | 'loading' | 'practicing' | 'result'>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<PracticeAnswer[]>([]);
  const [wrongQuestions, setWrongQuestions] = useState<Array<{
    question: string; userAnswer: string; correctAnswer: string; knowledgePoint?: string; difficulty?: string;
  }>>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfContext, setPdfContext] = useState('');
  const [showSimilar, setShowSimilar] = useState(false);
  const [similarCorrect, setSimilarCorrect] = useState(false);
  const [similarWrong, setSimilarWrong] = useState(false);
  // 计算题相关状态
  const [calcInputMethod, setCalcInputMethod] = useState<'handwriting' | 'upload' | null>(null);
  const [inputMethod, setInputMethod] = useState<'handwriting' | 'upload' | 'choice'>('choice');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);

  // 获取教材内容
  useEffect(() => {
    async function loadPdf() {
      setLoadingPdf(true);
      try {
        const data = await fallbackGetPDF(subjectId);
        if (data?.full_text) {
          const content = extractSectionContent(data, effectiveRange.start, effectiveRange.end);
          setPdfContext(content);
        }
      } catch {
        // ignore
      } finally {
        setLoadingPdf(false);
      }
    }
    loadPdf();
  }, [subjectId, effectiveRange.start, effectiveRange.end]);

  const currentQuestion = questions[currentIndex];
  const progressPercent = questions.length > 0
    ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;
  const correctCount = answers.filter(a => a.correct).length;

  const startPractice = async () => {
    if (!settings?.deepseekKey) {
      alert('请先在设置中配置 DeepSeek API Key');
      return;
    }
    setPhase('loading');
    try {
      const response = await fetch('/api/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          chapterId,
          sectionId,
          difficulty,
          pdfContext,
          questionCount: 10,
          apiKey: settings.deepseekKey,
        }),
      });
      const data = await response.json();
      if (data.success && data.questions?.length > 0) {
        const mappedQuestions = data.questions.map((q: any) => {
          const qType: string = q.type;
          const validTypes: readonly string[] = ['choice', 'fill', 'calculation'];
          const finalType = validTypes.includes(qType)
            ? (qType as 'choice' | 'fill' | 'calculation')
            : 'choice';
          return {
            id: String(q.id || `q_${Date.now()}`),
            text: q.text || q.question || '题目内容',
            options: Array.isArray(q.options) ? q.options.map((opt: string, i: number) =>
              opt.startsWith(String.fromCharCode(65 + i) + '.') ? opt : `${String.fromCharCode(65 + i)}. ${opt}`
            ) : [],
            correctAnswer: q.correctAnswer || q.answer || 'A',
            explanation: q.explanation || '请参考解析',
            knowledgePoint: q.knowledgePoint || '基础知识',
            difficulty: q.difficulty || difficulty,
            type: finalType,
            source: q.source || 'current',
            steps: q.steps || [],
          };
        });
        setQuestions(mappedQuestions as PracticeQuestion[]);
        setAnswers([]);
        setWrongQuestions([]);
        setCurrentIndex(0);
        setPhase('practicing');
      } else {
        alert('生成题目失败，请重试');
        setPhase('select');
      }
    } catch {
      alert('网络错误，请重试');
      setPhase('select');
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentQuestion) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer.toUpperCase() === currentQuestion.correctAnswer?.toUpperCase();

    const newAnswer: PracticeAnswer = {
      questionId: currentQuestion.id,
      question: currentQuestion.text,
      userAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      correct: isCorrect,
      knowledgePoint: currentQuestion.knowledgePoint || '',
      difficulty: currentQuestion.difficulty,
    };
    setAnswers(prev => [...prev, newAnswer]);

    if (!isCorrect) {
      setWrongQuestions(prev => [...prev, {
        question: currentQuestion.text,
        userAnswer: answer,
        correctAnswer: currentQuestion.correctAnswer,
        knowledgePoint: currentQuestion.knowledgePoint,
        difficulty: currentQuestion.difficulty,
      }]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
      setShowSimilar(false);
      setCalcInputMethod(null);
      setInputMethod('choice');
      setIsRecognizing(false);
      setRecognitionResult(null);
    } else {
      saveResults();
      setPhase('result');
    }
  };

  const saveResults = async () => {
    const wrongQ = wrongQuestions;
    const correct = answers.filter(a => a.correct).length;

    // 保存错题到本地
    for (const wq of wrongQ) {
      // 薄弱项分析
      let analysis = { wrongReason: '', weakPoint: '', stepAnalysis: '', solutionSteps: '' };
      if (settings?.deepseekKey) {
        try {
          const resp = await fetch('/api/analyze-weak-point', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: wq.question,
              userAnswer: wq.userAnswer,
              correctAnswer: wq.correctAnswer,
              knowledgePoint: wq.knowledgePoint,
              pdfContext,
              apiKey: settings.deepseekKey,
            }),
          });
          const data = await resp.json();
          if (data.success) {
            analysis = data;
            addOrUpdateWeakPoint(subjectId, data.weakPoint, data.wrongReason);
          }
        } catch { /* ignore */ }
      }

      const wrongQItem: WrongQuestion = {
        id: `wq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        subjectId,
        chapterId,
        sectionId,
        question: wq.question,
        userAnswer: wq.userAnswer,
        correctAnswer: wq.correctAnswer,
        wrongReason: analysis.wrongReason,
        knowledgePoint: wq.knowledgePoint || '',
        weakPoint: analysis.weakPoint,
        stepAnalysis: analysis.stepAnalysis,
        solutionSteps: analysis.solutionSteps,
        difficulty: (wq.difficulty as Difficulty) || 'medium',
        createdAt: new Date().toISOString(),
        isMastered: false,
      };
      addWrongQuestion(wrongQItem);
    }

    // 保存练习记录
    addPracticeRecord({
      id: `pr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      subjectId,
      chapterId,
      sectionId,
      difficulty,
      totalQuestions: questions.length,
      correctCount: correct,
      wrongCount: wrongQ.length,
      score: Math.round((correct / questions.length) * 100),
      answers,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleString('zh-CN'),
    });
  };

  const handleRestart = () => {
    setPhase('select');
    setQuestions([]);
    setAnswers([]);
    setWrongQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer('');
    setShowFeedback(false);
    setShowSimilar(false);
    setCalcInputMethod(null);
    setInputMethod('choice');
    setIsRecognizing(false);
    setRecognitionResult(null);
  };

  // ===== 计算题处理 =====
  const handleCalcSubmit = async (imageData: string) => {
    if (!currentQuestion || !settings?.deepseekKey) return;
    setIsRecognizing(true);
    try {
      const response = await fetch('/api/recognize-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          question: currentQuestion.text,
          correctAnswer: currentQuestion.correctAnswer,
          knowledgePoint: currentQuestion.knowledgePoint,
          apiKey: settings.deepseekKey,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setRecognitionResult(data);
        const isCorrect = data.isCorrect;
        const newAnswer: PracticeAnswer = {
          questionId: currentQuestion.id,
          question: currentQuestion.text,
          userAnswer: data.recognizedText || '（手写内容）',
          correctAnswer: currentQuestion.correctAnswer,
          correct: isCorrect,
          knowledgePoint: currentQuestion.knowledgePoint || '',
          difficulty: currentQuestion.difficulty,
        };
        setAnswers(prev => [...prev, newAnswer]);
        if (!isCorrect) {
          setWrongQuestions(prev => [...prev, {
            question: currentQuestion.text,
            userAnswer: data.recognizedText || '（手写内容）',
            correctAnswer: currentQuestion.correctAnswer,
            knowledgePoint: currentQuestion.knowledgePoint,
            difficulty: currentQuestion.difficulty,
          }]);
        }
      }
    } catch {
      setRecognitionResult({
        isCorrect: false,
        recognizedText: '（识别失败）',
        feedback: '识别服务暂时不可用，请检查网络或API配置',
      });
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleCalcRetry = () => {
    setCalcInputMethod(null);
    setInputMethod('handwriting');
    setRecognitionResult(null);
  };

  const qtype: string = currentQuestion?.type ?? '';
  const isCalcQuestion = qtype === 'calculation';
  const isFillQuestion = qtype === 'fill';

  // ===== 渲染 =====

  if (phase === 'result') {
    return (
      <PracticeResult
        totalQuestions={questions.length}
        correctCount={correctCount}
        wrongCount={wrongQuestions.length}
        wrongQuestions={wrongQuestions}
        onRestart={handleRestart}
        subjectId={subjectId}
        chapterId={chapterId}
        sectionId={sectionId}
      />
    );
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">AI正在生成练习题...</h2>
          <p className="text-slate-500">根据辽宁高考要求设计题目，请稍候</p>
          <div className="mt-4 flex items-center justify-center gap-1 text-indigo-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">正在出题，预计10-20秒</span>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'practicing' && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950">
        {/* 顶部导航 */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Link href={`/subjects/${subjectId}`}>
                  <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button>
                </Link>
                <div>
                  <h1 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {getSubjectName(subjectId)} · {sectionTitle || `第${chapterId}章`} · 章节练习
                  </h1>
                  <p className="text-xs text-slate-500">
                    难度：{currentQuestion.difficulty === 'simple' ? '简单' : currentQuestion.difficulty === 'hard' ? '困难' : '中等'}  题号：{currentIndex + 1}/{questions.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-green-600 font-bold">{correctCount}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-600">{questions.length}</span>
                  <span className="text-slate-400 ml-1">正确</span>
                </div>
              </div>
            </div>
            <Progress value={progressPercent} className="h-2 rounded-full" />
          </div>
        </div>

        {/* 左右分栏主体 */}
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
            {/* 左侧 1/4：题目区域 */}
            <div className="lg:col-span-1 space-y-4">
              {/* 题目卡片 */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="h-1.5 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        currentQuestion.difficulty === 'simple' ? 'border-green-300 text-green-600' :
                        currentQuestion.difficulty === 'hard' ? 'border-red-300 text-red-600' :
                        'border-amber-300 text-amber-600'
                      )}
                    >
                      {currentQuestion.difficulty === 'simple' ? '简单' : currentQuestion.difficulty === 'hard' ? '困难' : '中等'}
                    </Badge>
                    {currentQuestion.knowledgePoint && (
                      <Badge variant="outline" className="text-xs">{currentQuestion.knowledgePoint}</Badge>
                    )}
                    <Badge variant="outline" className="text-xs ml-auto">第{currentIndex + 1}题</Badge>
                  </div>
                  <p className="text-base font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    <MathContent content={currentQuestion.text} />
                  </p>
                </div>
              </div>

              {/* 选择题选项（题目区域内） */}
              {currentQuestion.options && currentQuestion.options.length > 0 && !recognitionResult && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-3 space-y-2">
                    {currentQuestion.options.map((opt, i) => {
                      const optionKey = opt.charAt(0);
                      const isSelected = selectedAnswer === optionKey;
                      const isCorrectOpt = optionKey === currentQuestion.correctAnswer;
                      return (
                        <button
                          key={i}
                          onClick={() => !showFeedback && handleAnswer(optionKey)}
                          disabled={showFeedback}
                          className={cn(
                            'w-full p-3 rounded-xl border-2 text-left transition-all duration-200',
                            'hover:scale-[1.01] active:scale-[0.99]',
                            !showFeedback && isSelected && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-lg',
                            !showFeedback && !isSelected && 'border-slate-200 dark:border-slate-700 hover:border-indigo-300',
                            showFeedback && isCorrectOpt && 'border-green-500 bg-green-50 dark:bg-green-950/40 shadow-lg',
                            showFeedback && isSelected && !isCorrectOpt && 'border-red-500 bg-red-50 dark:bg-red-950/40 shadow-lg',
                            showFeedback && !isSelected && !isCorrectOpt && 'border-slate-200 dark:border-slate-700 opacity-50',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs flex-shrink-0',
                              !showFeedback && isSelected && 'bg-indigo-500 text-white',
                              !showFeedback && !isSelected && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                              showFeedback && isCorrectOpt && 'bg-green-500 text-white',
                              showFeedback && isSelected && !isCorrectOpt && 'bg-red-500 text-white',
                              showFeedback && !isSelected && !isCorrectOpt && 'bg-slate-200 dark:bg-slate-700 text-slate-500',
                            )}>{optionKey}</span>
                            <span className={cn(
                              'text-sm font-medium',
                              !showFeedback && 'text-slate-700 dark:text-slate-300',
                              showFeedback && isCorrectOpt && 'text-green-700 dark:text-green-400',
                              showFeedback && isSelected && !isCorrectOpt && 'text-red-700 dark:text-red-400',
                              showFeedback && !isSelected && !isCorrectOpt && 'text-slate-400',
                            )}><MathContent content={opt.substring(3).trim()} /></span>
                            {showFeedback && isCorrectOpt && <CheckCircle className="ml-auto h-4 w-4 text-green-500" />}
                            {showFeedback && isSelected && !isCorrectOpt && <XCircle className="ml-auto h-4 w-4 text-red-500" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 选择题反馈 */}
              {showFeedback && (
                <div className={cn(
                  'rounded-xl p-3 border-2',
                  selectedAnswer.toUpperCase() === currentQuestion.correctAnswer?.toUpperCase()
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                    : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedAnswer.toUpperCase() === currentQuestion.correctAnswer?.toUpperCase() ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={cn(
                      'font-bold text-sm',
                      selectedAnswer.toUpperCase() === currentQuestion.correctAnswer?.toUpperCase()
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-red-700 dark:text-red-400'
                    )}>
                      {selectedAnswer.toUpperCase() === currentQuestion.correctAnswer?.toUpperCase() ? '正确！' : '答错了'}
                    </span>
                  </div>
                  {currentQuestion.explanation && (
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      <MathContent content={currentQuestion.explanation} />
                    </p>
                  )}
                </div>
              )}

              {/* 下一题按钮（选择题用） */}
              {showFeedback && !recognitionResult && (
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="w-full bg-indigo-500 hover:bg-indigo-600 gap-1"
                >
                  {currentIndex < questions.length - 1 ? (<>下一题 <ChevronRight className="h-3 w-3" /></>) : (<>查看成绩 <Sparkles className="h-3 w-3" /></>)}
                </Button>
              )}
            </div>

            {/* 右侧 3/4：手写板/上传区域 */}
            <div className="lg:col-span-3 space-y-4">
              {/* 计算题/填空题：输入方式切换 + 手写板/上传 */}
              {(isCalcQuestion || isFillQuestion) && !recognitionResult && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">作答方式：</span>
                      <Button
                        variant={inputMethod === 'handwriting' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setInputMethod('handwriting')}
                        className="gap-1"
                      >
                        ✏️ 手写板
                      </Button>
                      <Button
                        variant={inputMethod === 'upload' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setInputMethod('upload')}
                        className="gap-1"
                      >
                        📷 上传图片
                      </Button>
                      {currentQuestion.options && currentQuestion.options.length > 0 && (
                        <Button
                          variant={inputMethod === 'choice' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setInputMethod('choice')}
                          className="gap-1"
                        >
                          ☑️ 选择题
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 手写板/上传区域 */}
                  <div className="flex-1 min-h-0 p-4">
                    {inputMethod === 'handwriting' && (
                      <HandwritingPad
                        onSave={handleCalcSubmit}
                        onCancel={handleCalcRetry}
                        loading={isRecognizing}
                        className="h-full"
                      />
                    )}
                    {inputMethod === 'upload' && (
                      <ImageUploader
                        onUpload={handleCalcSubmit}
                        onCancel={handleCalcRetry}
                        loading={isRecognizing}
                      />
                    )}
                    {inputMethod === 'choice' && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-slate-400">
                          <p className="text-4xl mb-2">☑️</p>
                          <p className="text-sm">请在左侧区域选择答案</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {isRecognizing && (
                    <div className="p-4 text-center border-t border-slate-100 dark:border-slate-700">
                      <div className="animate-spin text-2xl mx-auto w-fit mb-2">⟳</div>
                      <p className="text-sm text-slate-500">AI正在识别你的解题步骤...</p>
                    </div>
                  )}
                </div>
              )}

              {/* 非计算题：手写板区域（备选作答） */}
              {!isCalcQuestion && !isFillQuestion && !recognitionResult && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ minHeight: '300px' }}>
                  <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">备选作答：</span>
                      <Button
                        variant={inputMethod === 'handwriting' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setInputMethod('handwriting')}
                        className="gap-1"
                      >
                        ✏️ 手写板
                      </Button>
                      <Button
                        variant={inputMethod === 'upload' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setInputMethod('upload')}
                        className="gap-1"
                      >
                        📷 上传图片
                      </Button>
                    </div>
                  </div>
                  <div className="p-4" style={{ height: '250px' }}>
                    {inputMethod === 'handwriting' && (
                      <HandwritingPad
                        onSave={handleCalcSubmit}
                        onCancel={handleCalcRetry}
                        loading={isRecognizing}
                        className="h-full"
                      />
                    )}
                    {inputMethod === 'upload' && (
                      <ImageUploader
                        onUpload={handleCalcSubmit}
                        onCancel={handleCalcRetry}
                        loading={isRecognizing}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 识别结果展示 */}
              {recognitionResult && (
                <div className={cn(
                  'rounded-xl p-4 border-2',
                  recognitionResult.isCorrect
                    ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                    : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    {recognitionResult.isCorrect ? (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">✓</div>
                        <div>
                          <p className="font-bold text-green-700 dark:text-green-400 text-lg">解题正确！🎉</p>
                          <p className="text-sm text-slate-500">得分：{recognitionResult.score ?? 100} 分</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg">✗</div>
                        <div>
                          <p className="font-bold text-red-700 dark:text-red-400 text-lg">
                            {recognitionResult.wrongStep ? `第 ${recognitionResult.wrongStep} 步有误` : '解题有误'}
                          </p>
                          <p className="text-sm text-slate-500">得分：{recognitionResult.score ?? 0} 分</p>
                        </div>
                      </>
                    )}
                  </div>

                  {recognitionResult.recognizedText && (
                    <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-3 mb-3">
                      <p className="text-xs font-bold text-slate-500 mb-1">识别内容：</p>
                      <MathContent content={recognitionResult.recognizedText} className="text-sm text-slate-700 dark:text-slate-300" />
                    </div>
                  )}

                  {recognitionResult.stepAnalysis && recognitionResult.stepAnalysis.length > 0 && (
                    <div className="space-y-2 mb-3">
                      <p className="text-xs font-bold text-slate-500">步骤分析：</p>
                      {recognitionResult.stepAnalysis.map((step: any, i: number) => (
                        <div key={i} className={cn(
                          'flex items-start gap-2 p-2 rounded-lg text-sm',
                          step.isCorrect ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'
                        )}>
                          <span className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                            step.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          )}>{step.step}</span>
                          <div>
                            <MathContent content={step.content} className="text-slate-700 dark:text-slate-300" />
                            <p className={cn('text-xs mt-0.5', step.isCorrect ? 'text-green-600' : 'text-red-600')}>{step.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!recognitionResult.isCorrect && recognitionResult.correctSolution && (
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 mb-3">
                      <p className="text-xs font-bold text-green-600 mb-1">正确解法：</p>
                      <MathContent content={recognitionResult.correctSolution} className="text-sm text-slate-700 dark:text-slate-300" />
                    </div>
                  )}

                  {recognitionResult.feedback && (
                    <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-xl p-3 mb-3">
                      <p className="text-xs font-bold text-indigo-600 mb-1">评价：</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{recognitionResult.feedback}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCalcRetry} className="flex-1 gap-1">
                      ↩️ 重做
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 gap-1"
                    >
                      {currentIndex < questions.length - 1 ? (<>下一题 <ChevronRight className="h-3 w-3" /></>) : (<>查看成绩 <Sparkles className="h-3 w-3" /></>)}
                    </Button>
                  </div>
                </div>
              )}

              {/* 同类型题 */}
              {showFeedback && selectedAnswer.toUpperCase() !== currentQuestion.correctAnswer?.toUpperCase() && !recognitionResult && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                    <span className="text-xs text-slate-400">同类型题练习</span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <SimilarQuestion
                    question={currentQuestion}
                    onComplete={(correct) => { setSimilarCorrect(correct); setSimilarWrong(!correct); }}
                    apiKey={settings?.deepseekKey}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 难度选择页面
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/subjects/${subjectId}`}>
            <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">章节练习</h1>
          <p className="text-slate-500">
            {getSubjectName(subjectId)} · 第{chapterId}章 · 第{sectionId}节
          </p>
        </div>

        <Card className="border-0 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-lg">选择练习难度</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                key: 'simple' as Difficulty,
                label: '简单',
                desc: '选择5·填空3·计算2',
                sub: '基础概念直接应用',
                icon: '🟢',
                color: 'border-green-200 dark:border-green-900/50'
              },
              {
                key: 'medium' as Difficulty,
                label: '中等',
                desc: '选择4·填空3·计算3',
                sub: '需要1-2步推理计算',
                icon: '🟡',
                color: 'border-amber-200 dark:border-amber-900/50'
              },
              {
                key: 'hard' as Difficulty,
                label: '困难',
                desc: '选择3·填空3·计算4',
                sub: '综合性强，多知识点融合',
                icon: '🔴',
                color: 'border-red-200 dark:border-red-900/50'
              },
            ].map(d => (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all',
                  difficulty === d.key
                    ? `${d.color} bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md`
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{d.icon}</span>
                  <div>
                    <p className={cn('font-bold', difficulty === d.key ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300')}>{d.label}</p>
                    <p className="text-xs text-indigo-500 font-medium">{d.desc}</p>
                    <p className="text-xs text-slate-400">{d.sub}</p>
                  </div>
                  {difficulty === d.key && (
                    <CheckCircle className="ml-auto h-5 w-5 text-indigo-500" />
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Button
          onClick={startPractice}
          disabled={loadingPdf}
          size="lg"
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 h-14 text-lg rounded-xl shadow-lg shadow-indigo-500/30 gap-2"
        >
          {loadingPdf ? (
            <><Loader2 className="h-5 w-5 animate-spin" />加载教材中...</>
          ) : (
            <><Sparkles className="h-5 w-5" />开始练习（10题）</>
          )}
        </Button>

        <p className="text-center text-xs text-slate-400 mt-3">
          符合辽宁高考出题要求 · AI智能出题
        </p>
      </div>
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <PracticePageContent />
    </Suspense>
  );
}
