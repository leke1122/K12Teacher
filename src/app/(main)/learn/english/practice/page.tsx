'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Timer, Trophy, RotateCcw, Volume2, BookOpen, PenLine, Brain } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from '@/components/ui/toast';
import { useEnglishProgress } from '@/hooks/useEnglishProgress';
import { updateStepProgress } from '@/lib/englishProgress';

interface PracticeExam {
  id: string;
  year: number;
  title: string;
  duration: number; // minutes
  totalScore: number;
  sections: Array<{
    id: string;
    name: string;
    score: number;
    questions: Array<{
      id: string;
      type: 'listening' | 'reading' | 'cloze' | 'grammar' | 'writing';
      question: string;
      options?: string[];
      correct: string;
      explanation: string;
    }>;
  }>;
}

const PRACTICE_EXAMS: PracticeExam[] = [
  {
    id: 'exam-2024',
    year: 2024,
    title: '2024年全国新课标II卷（辽宁）',
    duration: 120,
    totalScore: 150,
    sections: [
      {
        id: 'listening',
        name: '听力',
        score: 30,
        questions: [
          {
            id: 'l1',
            type: 'listening',
            question: '听力题：Where does the conversation most probably take place?',
            options: ['At a bank', 'At a post office', 'At a bookstore', 'At a restaurant'],
            correct: 'At a bank',
            explanation: '根据对话中提到的"withdraw"和"account"等关键词，判断场景是在银行。',
          },
        ],
      },
      {
        id: 'reading',
        name: '阅读理解',
        score: 50,
        questions: [
          {
            id: 'r1',
            type: 'reading',
            question: '阅读题：What can be inferred about the author from paragraph 2?',
            options: ['The author is a scientist', 'The author enjoys outdoor activities', 'The author dislikes reading', 'The author is from a big city'],
            correct: 'The author enjoys outdoor activities',
            explanation: '第二段提到作者喜欢徒步旅行和露营，说明热爱户外活动。',
          },
          {
            id: 'r2',
            type: 'reading',
            question: '阅读题：According to the passage, what is the main purpose of...?',
            options: ['To entertain readers', 'To persuade readers to buy products', 'To inform readers about...', 'To criticize a policy'],
            correct: 'To inform readers about...',
            explanation: '文章主要目的是向读者介绍...，属于说明文类型。',
          },
        ],
      },
      {
        id: 'language',
        name: '语言运用',
        score: 30,
        questions: [
          {
            id: 'g1',
            type: 'grammar',
            question: '语法题：选择正确选项填空。',
            options: ['have been', 'has been', 'had been', 'have being'],
            correct: 'have been',
            explanation: '现在完成时结构：have/has + 过去分词。主语为复数，用have been。',
          },
        ],
      },
    ],
  },
];

function PracticeContent() {
  const { settings } = useSettingsStore();
  const { updateStep, markVisited, getStepStatus } = useEnglishProgress('english');
  
  const [selectedExam, setSelectedExam] = useState<PracticeExam | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTiming, setIsTiming] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentSection = selectedExam?.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const totalQuestions = selectedExam?.sections.reduce((acc, s) => acc + s.questions.length, 0) || 0;
  const answeredQuestions = score.total;

  useEffect(() => {
    markVisited('practice');
  }, [markVisited]);

  useEffect(() => {
    if (isTiming && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTiming(false);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTiming, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = (exam: PracticeExam) => {
    setSelectedExam(exam);
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowFeedback(false);
    setScore({ correct: 0, total: 0 });
    setTimeLeft(exam.duration * 60);
    setIsTiming(true);
    setExamFinished(false);
    setShowResult(false);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    const correct = selectedAnswer === currentQuestion.correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  const handleNextQuestion = () => {
    const section = selectedExam!.sections[currentSectionIndex];
    
    if (currentQuestionIndex < section.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
    } else if (currentSectionIndex < selectedExam!.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswer('');
      setShowFeedback(false);
    } else {
      handleFinishExam();
    }
  };

  const handleFinishExam = useCallback(() => {
    setIsTiming(false);
    setExamFinished(true);
    setShowResult(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const finalScore = score.correct;
    const total = score.total;
    const percentage = total > 0 ? Math.round((finalScore / total) * 100) : 0;
    
    updateStep('practice', 'in_progress');

    if (percentage >= 80) {
      toast(`考试完成！得分：${finalScore}/${total} (${percentage}%) - 优秀！`, 'success');
    } else if (percentage >= 60) {
      toast(`考试完成！得分：${finalScore}/${total} (${percentage}%) - 良好`, 'success');
    } else {
      toast(`考试完成！得分：${finalScore}/${total} (${percentage}%) - 继续努力`, 'error');
    }
  }, [score, updateStep]);

  const handleReset = () => {
    setSelectedExam(null);
    setCurrentSectionIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowFeedback(false);
    setScore({ correct: 0, total: 0 });
    setIsTiming(false);
    setExamFinished(false);
    setShowResult(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  // Exam selection view
  if (!selectedExam) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回英语学习中心
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            🎯 真题实战
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            选择一套真题进行限时训练
          </p>
        </div>

        <div className="grid gap-4">
          {PRACTICE_EXAMS.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-800">{exam.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {exam.duration}分钟
                      </span>
                      <span>总分：{exam.totalScore}分</span>
                      <span>{exam.sections.length}个部分</span>
                    </div>
                  </div>
                  <Button onClick={() => handleStartExam(exam)}>
                    开始考试
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              真题实战模拟真实高考环境，限时完成整套试卷。建议严格按照考试时间作答，
              锻炼时间分配能力和应试心态。答题结束后会生成详细成绩报告。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exam in progress or finished
  if (showResult) {
    const finalScore = score.correct;
    const total = score.total;
    const percentage = total > 0 ? Math.round((finalScore / total) * 100) : 0;
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={handleReset} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回选择试卷
        </Button>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">考试完成！</h2>
            <p className="text-muted-foreground mb-4">{selectedExam.title}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">{finalScore}</div>
                <div className="text-xs text-muted-foreground">正确数</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-red-600">{total - finalScore}</div>
                <div className="text-xs text-muted-foreground">错误数</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600">{percentage}%</div>
                <div className="text-xs text-muted-foreground">正确率</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <div className="text-3xl font-bold text-amber-600">
                  {Math.round((finalScore / total) * selectedExam.totalScore)}
                </div>
                <div className="text-xs text-muted-foreground">预估得分</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                再考一次
              </Button>
              <Button onClick={() => updateStep('practice', 'completed')}>
                <Trophy className="h-4 w-4 mr-2" />
                完成训练
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={handleReset} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        退出考试
      </Button>

      {/* 考试信息 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">{selectedExam.title}</h2>
              <p className="text-xs text-muted-foreground">
                {currentSection?.name} · 第 {currentQuestionIndex + 1} 题
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                {formatTime(timeLeft)}
              </Badge>
              <Badge variant="secondary">
                {answeredQuestions}/{totalQuestions}
              </Badge>
            </div>
          </div>
          <Progress value={(answeredQuestions / totalQuestions) * 100} className="h-1 mt-3" />
        </CardContent>
      </Card>

      {/* 题目 */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentQuestion.type === 'listening' && <Volume2 className="h-5 w-5 text-blue-500" />}
              {currentQuestion.type === 'reading' && <BookOpen className="h-5 w-5 text-green-500" />}
              {currentQuestion.type === 'grammar' && <PenLine className="h-5 w-5 text-purple-500" />}
              第 {currentQuestionIndex + 1} 题
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium text-lg">{currentQuestion.question}</p>
            
            {currentQuestion.options && (
              <div className="grid gap-2">
                {currentQuestion.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant={selectedAnswer === option ? 'default' : 'outline'}
                    className={`justify-start ${
                      showFeedback && option === currentQuestion.correct
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : showFeedback && selectedAnswer === option && !isCorrect
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : ''
                    }`}
                    onClick={() => {
                      if (!showFeedback) setSelectedAnswer(option);
                    }}
                    disabled={showFeedback}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
            
            {!showFeedback ? (
              <Button
                onClick={handleCheckAnswer}
                disabled={!selectedAnswer}
                className="w-full"
              >
                提交答案
              </Button>
            ) : (
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? '回答正确！' : '回答错误'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{currentQuestion.explanation}</p>
                <Button onClick={handleNextQuestion} className="w-full">
                  {currentQuestionIndex < currentSection.questions.length - 1 
                    ? '下一题 →' 
                    : currentSectionIndex < selectedExam.sections.length - 1
                      ? '下一部分 →'
                      : '完成考试'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function EnglishPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
