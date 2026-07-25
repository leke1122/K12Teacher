'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Brain,
  BookOpen, Trophy, Sparkles, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { releasedUnits } from '@/data/history/units';
import { getUnitQuizData, type KnowledgePoint } from '@/data/history/quiz-data';
import { addWrongQuestion } from '@/lib/wrongQuestionService';
import { useScrollHide } from '@/hooks/useScrollHide';

type UnitQuizData = {
  unitId: string;
  unitName: string;
  knowledgePoints: KnowledgePoint[];
};

type StepType = 'select-unit' | 'select-knowledge' | 'study' | 'quiz' | 'result';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
}

function GuidedLearningContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<StepType>('select-unit');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [unitData, setUnitData] = useState<UnitQuizData | null>(null);
  const [currentKnowledgeIndex, setCurrentKnowledgeIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctInCurrentKP, setCorrectInCurrentKP] = useState(0);
  const [usedQuestionHashes, setUsedQuestionHashes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-hide header on scroll
  const headerHidden = useScrollHide({ threshold: 50, sensitivity: 3, hideDelay: 100 });

  // 从 URL 参数获取 unit
  useEffect(() => {
    const unitParam = searchParams.get('unit');
    if (unitParam) {
      const data = getUnitQuizData(unitParam);
      if (data) {
        setSelectedUnit(unitParam);
        setUnitData(data);
        setStep('select-knowledge');
      }
    }
  }, [searchParams]);

  const currentKnowledge = unitData?.knowledgePoints[currentKnowledgeIndex];
  const correctAnswerNeeded = 4;
  const masteredCount = unitData?.knowledgePoints.filter((kp, idx) => 
    idx < currentKnowledgeIndex || (idx === currentKnowledgeIndex && correctInCurrentKP >= correctAnswerNeeded)
  ).length || 0;

  const hashQuestion = (q: QuizQuestion): string => {
    return `${q.question.substring(0, 20)}-${q.options?.join(',')}`;
  };

  const loadQuestion = async () => {
    if (!selectedUnit || !currentKnowledge || !unitData) return;
    
    setLoading(true);
    setError(null);
    setSelectedAnswer(null);
    setShowExplanation(false);
    
    try {
      const response = await fetch('/api/history/guided-learning/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: selectedUnit,
          knowledgePointId: currentKnowledge.id,
          knowledgePoint: currentKnowledge.name,
          knowledgeDescription: currentKnowledge.description,
          difficulty: 'medium',
          questionCount: 1,
          excludeHashes: Array.from(usedQuestionHashes),
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.question) {
        const questionHash = hashQuestion(data.question);
        if (usedQuestionHashes.has(questionHash)) {
          loadQuestion();
          return;
        }
        setCurrentQuestion(data.question);
        setUsedQuestionHashes(prev => new Set([...prev, questionHash]));
      } else {
        setError(data.error || '生成题目失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const recordWrongAnswer = async (question: QuizQuestion, userAnswer: number) => {
    const correctAnswerText = question.options[question.correctAnswer];
    const userAnswerText = question.options[userAnswer];
    
    await addWrongQuestion(
      'user',
      'history',
      question.question,
      correctAnswerText,
      userAnswerText,
      question.explanation,
      question.difficulty,
      currentKnowledge?.name || ''
    );
  };

  const handleAnswer = async (index: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    setTotalAnswered(prev => prev + 1);
    
    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
      setCorrectInCurrentKP(prev => prev + 1);
    } else {
      await recordWrongAnswer(currentQuestion, index);
    }
  };

  const handleNext = () => {
    if (currentKnowledge && correctInCurrentKP >= correctAnswerNeeded) {
      if (currentKnowledgeIndex < unitData.knowledgePoints.length - 1) {
        setCurrentKnowledgeIndex(prev => prev + 1);
        setCorrectInCurrentKP(0);
        setUsedQuestionHashes(new Set());
        setStep('select-knowledge');
      } else {
        setStep('result');
      }
    } else {
      loadQuestion();
    }
  };

  const startQuiz = () => {
    setCorrectInCurrentKP(0);
    setUsedQuestionHashes(new Set());
    setStep('quiz');
    loadQuestion();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Auto-hide Header */}
      <header
        className={`
          sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm
          transition-all duration-300 ease-out
          ${headerHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
        `}
      >
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/history')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> 返回
          </Button>
          <h1 className="font-bold text-base">引导式学习</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* 进度条 */}
        {step !== 'select-unit' && step !== 'result' && unitData && (
          <Card className="bg-white/80">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground truncate flex-1 mr-2">
                  {unitData.unitName.substring(0, 20)}...
                </span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {currentKnowledgeIndex + 1}/{unitData.knowledgePoints.length}
                </span>
              </div>
              <Progress value={((currentKnowledgeIndex) / unitData.knowledgePoints.length) * 100} className="h-1.5" />
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  已掌握: {masteredCount}
                </span>
                <span>本知识点: {correctInCurrentKP}/{correctAnswerNeeded}</span>
                <span>总分: {score}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== 1. 选择单元 ===== */}
        {step === 'select-unit' && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <CardContent className="p-6 text-center">
                <Brain className="h-14 w-14 mx-auto mb-3" />
                <h2 className="text-xl font-bold mb-2">历史引导式学习</h2>
                <p className="text-white/80 text-sm">
                  选择一个单元开始学习<br/>
                  先阅读知识点，再通过答题巩固<br/>
                  <span className="text-white font-semibold">答对4道不重复的题即掌握该知识点</span>
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {releasedUnits.map((unit, idx) => {
                const data = getUnitQuizData(unit.id);
                return (
                  <Card 
                    key={unit.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setSelectedUnit(unit.id);
                      setUnitData(data || null);
                      setStep('select-knowledge');
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{unit.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{unit.title}</p>
                          {data && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {data.knowledgePoints.length}个知识点
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== 2. 知识点列表 ===== */}
        {step === 'select-knowledge' && unitData && (
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-green-800 text-base">知识点学习</h2>
                  <Badge className="bg-green-100 text-green-700">
                    {masteredCount}/{unitData.knowledgePoints.length} 已掌握
                  </Badge>
                </div>
                <p className="text-green-600 text-sm mb-3">
                  答对4道不重复的题即可掌握该知识点
                </p>
                {currentKnowledge && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep('study')}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      查看知识点
                    </Button>
                    <Button 
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={startQuiz}
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      开始答题
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {unitData.knowledgePoints.map((kp, idx) => {
                const isCompleted = idx < currentKnowledgeIndex || 
                  (idx === currentKnowledgeIndex && correctInCurrentKP >= correctAnswerNeeded);
                const isCurrent = idx === currentKnowledgeIndex;
                
                return (
                  <Card 
                    key={kp.id}
                    className={`cursor-pointer transition-all ${
                      isCurrent 
                        ? 'ring-2 ring-green-500 bg-green-50' 
                        : isCompleted 
                          ? 'bg-green-50/50' 
                          : 'hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      if (!isCompleted) {
                        setCurrentKnowledgeIndex(idx);
                        setCorrectInCurrentKP(0);
                        setUsedQuestionHashes(new Set());
                      }
                    }}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{kp.name}</h3>
                        {isCurrent && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{kp.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== 3. 知识点详情 ===== */}
        {step === 'study' && unitData && currentKnowledge && (
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5 text-green-500" />
                知识点 {currentKnowledgeIndex + 1}：{currentKnowledge.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 leading-relaxed text-sm">{currentKnowledge.description}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>学习进度: {correctInCurrentKP}/{correctAnswerNeeded} 题</span>
                <Progress value={(correctInCurrentKP / correctAnswerNeeded) * 100} className="w-32 h-2" />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('select-knowledge')}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> 返回列表
                </Button>
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={startQuiz}
                >
                  开始答题 <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== 4. 答题 ===== */}
        {step === 'quiz' && (
          <div className="space-y-4">
            {loading ? (
              <Card className="border-2 border-purple-200">
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 text-purple-500 animate-spin" />
                  <p className="text-purple-600">AI 正在生成题目...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    基于知识点：{currentKnowledge?.name}
                  </p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-2 border-red-200">
                <CardContent className="p-6 text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadQuestion}>重试</Button>
                </CardContent>
              </Card>
            ) : currentQuestion ? (
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <Badge className="bg-purple-100 text-purple-700">
                      {currentKnowledge?.name}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        进度: {correctInCurrentKP}/{correctAnswerNeeded}
                      </span>
                      <Progress value={(correctInCurrentKP / correctAnswerNeeded) * 100} className="w-20 h-2" />
                    </div>
                  </div>
                  <p className="text-base font-medium mt-2">{currentQuestion.question}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQuestion.correctAnswer;
                    
                    let bgClass = 'bg-white hover:bg-blue-50';
                    let borderClass = 'border-slate-200';
                    
                    if (showExplanation) {
                      if (isCorrect) {
                        bgClass = 'bg-green-100';
                        borderClass = 'border-green-500';
                      } else if (isSelected) {
                        bgClass = 'bg-red-100';
                        borderClass = 'border-red-500';
                      }
                    }
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${bgClass} ${borderClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold flex-shrink-0 ${
                            showExplanation && isCorrect ? 'bg-green-500 border-green-500 text-white' : 
                            showExplanation && isSelected && !isCorrect ? 'bg-red-500 border-red-500 text-white' :
                            isSelected ? 'border-blue-500 text-blue-500' : 'border-slate-300'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1">{option}</span>
                          {showExplanation && isCorrect && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                          {showExplanation && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                        </div>
                      </button>
                    );
                  })}

                  {showExplanation && (
                    <div className={`p-4 rounded-lg mt-4 ${
                      selectedAnswer === currentQuestion.correctAnswer 
                        ? 'bg-green-50 border-2 border-green-200' 
                        : 'bg-amber-50 border-2 border-amber-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedAnswer === currentQuestion.correctAnswer ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-amber-500" />
                        )}
                        <span className="font-semibold">
                          {selectedAnswer === currentQuestion.correctAnswer ? '回答正确！' : '回答错误'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{currentQuestion.explanation}</p>
                      {selectedAnswer !== currentQuestion.correctAnswer && (
                        <p className="text-xs text-red-600 mt-2">
                          已记录到错题本
                        </p>
                      )}
                    </div>
                  )}

                  {showExplanation && (
                    <Button 
                      className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
                      onClick={handleNext}
                    >
                      {correctInCurrentKP >= correctAnswerNeeded 
                        ? (currentKnowledgeIndex < (unitData?.knowledgePoints.length || 0) - 1 ? '进入下一知识点' : '完成学习')
                        : `继续答题 (${correctAnswerNeeded - correctInCurrentKP}题后掌握)`
                      }
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}

        {/* ===== 5. 结果 ===== */}
        {step === 'result' && unitData && (
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-yellow-800 mb-2">学习完成！</h2>
              <p className="text-yellow-600 mb-6">{unitData.unitName.substring(0, 25)}...</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{masteredCount}</div>
                  <div className="text-xs text-slate-600">掌握知识点</div>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-xs text-slate-600">正确答题</div>
                </div>
                <div className="p-3 bg-white/60 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {unitData.knowledgePoints.length}
                  </div>
                  <div className="text-xs text-slate-600">总知识点</div>
                </div>
              </div>

              <div className="p-4 bg-white/60 rounded-lg mb-6">
                <div className="text-sm text-slate-600 mb-1">正确率</div>
                <div className="text-3xl font-bold text-purple-600">
                  {totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0}%
                </div>
                <Progress value={totalAnswered > 0 ? (score / totalAnswered) * 100 : 0} className="h-3 mt-2" />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setStep('select-unit');
                    setSelectedUnit(null);
                    setUnitData(null);
                    setCurrentKnowledgeIndex(0);
                    setScore(0);
                    setTotalAnswered(0);
                    setCorrectInCurrentKP(0);
                  }}
                >
                  选择其他单元
                </Button>
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={() => router.push('/subjects/history')}
                >
                  返回历史学科
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function GuidedLearningPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
      <GuidedLearningContent />
    </Suspense>
  );
}
