'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Brain, BookOpen, Eye, Sparkles, RotateCcw, MessageSquare } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from '@/components/ui/toast';
import { useEnglishProgress } from '@/hooks/useEnglishProgress';
import { addWrongQuestion } from '@/services/practiceService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

interface ReadingPassage {
  id: string;
  title: string;
  difficulty: 'simple' | 'medium' | 'hard';
  topic: string;
  content: string;
  questions: ReadingQuestion[];
}

// 预置阅读文章（可以作为默认内容）
const DEFAULT_PASSAGES: ReadingPassage[] = [
  {
    id: 'passage-1',
    title: 'The Power of Reading',
    difficulty: 'medium',
    topic: '阅读的重要性',
    content: `Reading is one of the most important skills we can develop. It opens doors to new worlds, ideas, and experiences. When we read, we not only learn new words but also develop our critical thinking abilities.

Good readers can understand complex ideas and communicate them effectively. They can learn from other people's experiences without having to go through everything themselves. This is why reading is considered essential for academic success.

Research has shown that regular reading can improve memory, reduce stress, and expand vocabulary. It also helps us develop empathy by allowing us to see the world from different perspectives.`,
    questions: [
      {
        id: 'q1',
        question: 'What is the main idea of this passage?',
        options: [
          'Reading is only important for students',
          'Reading is one of the most important skills',
          'We should only read books',
          'The internet is better than books'
        ],
        correct: 'Reading is one of the most important skills',
        explanation: 'The passage clearly states "Reading is one of the most important skills we can develop."'
      },
      {
        id: 'q2',
        question: 'According to the passage, what can good readers do?',
        options: [
          'Only read quickly',
          'Understand complex ideas and communicate them',
          'Only read easy books',
          'Avoid reading newspapers'
        ],
        correct: 'Understand complex ideas and communicate them',
        explanation: 'The passage states "Good readers can understand complex ideas and communicate them effectively."'
      },
      {
        id: 'q3',
        question: 'What benefit of reading is mentioned in the last paragraph?',
        options: [
          'It makes us taller',
          'It can reduce stress',
          'It costs money',
          'It takes too much time'
        ],
        correct: 'It can reduce stress',
        explanation: 'The passage mentions "regular reading can improve memory, reduce stress, and expand vocabulary."'
      }
    ]
  }
];

function EnglishReadingContent() {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const progress = useEnglishProgress('english');
  
  const [passages, setPassages] = useState<ReadingPassage[]>(DEFAULT_PASSAGES);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<Set<string>>(new Set());

  const currentPassage = passages[currentPassageIndex];
  const currentQuestion = currentPassage?.questions[currentQuestionIndex];
  const correctCount = currentPassage?.questions.filter((q, i) => !wrongAnswers.has(q.id)).length || 0;
  const isAllPassagesComplete = currentPassageIndex >= passages.length - 1 && currentQuestionIndex >= (currentPassage?.questions.length || 0) - 1 && wrongAnswers.size === 0;

  // 加载阅读理解文章
  useEffect(() => {
    loadPassages();
  }, []);

  const loadPassages = async () => {
    setIsLoading(true);
    try {
      // 尝试从API获取文章，如果没有则使用默认
      const response = await fetch('/api/reading/passages');
      if (response.ok) {
        const data = await response.json();
        if (data.passages && data.passages.length > 0) {
          setPassages(data.passages);
        }
      }
    } catch (error) {
      console.log('使用默认阅读文章');
    } finally {
      setIsLoading(false);
    }
  };

  // AI生成阅读理解题目
  const generateWithAI = async () => {
    if (!settings?.qwenKey && !settings?.deepseekKey) {
      toast('请先在设置中配置API密钥', 'error');
      return;
    }

    setIsAILoading(true);
    try {
      const apiKey = settings?.qwenKey || settings?.deepseekKey;
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            {
              role: 'system',
              content: '你是一位高中英语教师。请根据以下阅读文章，生成3道高中水平的阅读理解选择题。每道题包含问题、4个选项和正确答案。请用JSON格式返回，包含questions数组。'
            },
            {
              role: 'user',
              content: `请为以下阅读文章生成3道阅读理解题：

${currentPassage.content}

要求：
1. 题目符合高考英语阅读理解难度
2. 每题有4个选项
3. 包含正确答案和详细解析
4. JSON格式返回`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) throw new Error('AI生成失败');
      
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // 解析JSON
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.questions) {
          const newQuestions = parsed.questions.map((q: any, i: number) => ({
            id: `ai-q${i + 1}`,
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation
          }));
          
          setPassages(prev => prev.map((p, idx) => 
            idx === currentPassageIndex 
              ? { ...p, questions: newQuestions }
              : p
          ));
          toast('AI已生成阅读理解题目', 'success');
        }
      }
    } catch (error) {
      console.error('AI生成失败:', error);
      toast('AI生成失败，请重试', 'error');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return;
    
    const isCorrect = selectedAnswer === currentQuestion.correct;
    setShowResult(true);
    
    if (!isCorrect) {
      setWrongAnswers(prev => new Set([...prev, currentQuestion.id]));
      
      // 记录到错题本
      try {
        await addWrongQuestion({
          id: `english-reading-${currentPassage.id}-${currentQuestion.id}-${Date.now()}`,
          subjectId: 'english',
          chapterId: 'reading',
          sectionId: currentPassage.id,
          question: currentQuestion.question,
          options: currentQuestion.options,
          userAnswer: selectedAnswer,
          correctAnswer: currentQuestion.correct,
          wrongReason: currentQuestion.explanation,
          knowledgePoint: currentPassage.topic,
          weakPoint: '',
          stepAnalysis: '',
          solutionSteps: currentQuestion.explanation,
          difficulty: currentPassage.difficulty,
          createdAt: new Date().toISOString(),
          isMastered: false,
        });
        toast('已记录到错题本', 'success');
      } catch (error) {
        console.error('记录错题失败:', error);
      }
    }
  };

  // AI错题讲解
  const getAIExplanation = async () => {
    if (!settings?.qwenKey && !settings?.deepseekKey) {
      toast('请先在设置中配置API密钥', 'error');
      return;
    }

    setIsAILoading(true);
    try {
      const apiKey = settings?.qwenKey || settings?.deepseekKey;
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [
            {
              role: 'system',
              content: '你是一位耐心的高中英语教师。请用简洁易懂的语言讲解这道阅读理解题目。'
            },
            {
              role: 'user',
              content: `请讲解这道高中英语阅读理解题：

题目：${currentQuestion.question}

选项：
${currentQuestion.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}

正确答案：${currentQuestion.correct}

原文相关段落：${currentPassage.content}

请解释为什么正确答案正确，其他选项为什么不对。`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) throw new Error('AI讲解失败');
      
      const data = await response.json();
      setAiExplanation(data.choices?.[0]?.message?.content || '讲解生成失败');
    } catch (error) {
      console.error('AI讲解失败:', error);
      toast('AI讲解失败，请重试', 'error');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (currentPassage?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setAiExplanation(null);
    } else if (currentPassageIndex < passages.length - 1) {
      setCurrentPassageIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setWrongAnswers(new Set());
      setAiExplanation(null);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setWrongAnswers(new Set());
    setAiExplanation(null);
  };

  const handleShowTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/subjects/english">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />返回
            </Button>
          </Link>
          <div className="flex-1" />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateWithAI}
            disabled={isAILoading}
            className="gap-1"
          >
            {isAILoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            AI生成题目
          </Button>
        </div>

        {/* 标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">英语阅读理解</h1>
          <p className="text-slate-600 dark:text-slate-400">练习高考英语阅读理解</p>
        </div>

        <Progress value={(currentQuestionIndex / (currentPassage?.questions.length || 1)) * 100} className="h-2 mb-6" />

        {isAllPassagesComplete ? (
          <Card className="bg-green-50 dark:bg-green-950/30 border-green-200">
            <CardContent className="p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                太棒了！
              </h2>
              <p className="text-green-600 dark:text-green-400">
                你已完成所有阅读理解练习！
              </p>
              <div className="flex gap-4 justify-center mt-6">
                <Button onClick={handleRetry} className="gap-2">
                  <RotateCcw className="h-4 w-4" />再练一次
                </Button>
                <Link href="/subjects/english">
                  <Button variant="outline">返回学科主页</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 阅读文章 */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    {currentPassage?.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{currentPassage?.difficulty}</Badge>
                    <Button variant="ghost" size="sm" onClick={handleShowTranslation}>
                      <Eye className="h-4 w-4 mr-1" />
                      译文
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {currentPassage?.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 译文 */}
            {showTranslation && (
              <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    中文译文
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {currentPassage?.content}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 题目 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    第 {currentQuestionIndex + 1} 题 / 共 {currentPassage?.questions.length} 题
                  </CardTitle>
                  {wrongAnswers.size > 0 && (
                    <Badge variant="destructive">{wrongAnswers.size} 题错误</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {currentQuestion?.question}
                </p>

                <div className="space-y-3">
                  {currentQuestion?.options.map((option, idx) => {
                    const optionLetter = String.fromCharCode(65 + idx);
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption = option === currentQuestion?.correct;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showResult}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          showResult
                            ? isCorrectOption
                              ? 'border-green-500 bg-green-50 dark:bg-green-950/40'
                              : isSelected
                                ? 'border-red-500 bg-red-50 dark:bg-red-950/40'
                                : 'border-slate-200 dark:border-slate-700 opacity-50'
                            : isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                              : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${
                            showResult
                              ? isCorrectOption
                                ? 'bg-green-500 text-white'
                                : isSelected
                                  ? 'bg-red-500 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700'
                              : isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-200 dark:bg-slate-700'
                          }`}>
                            {optionLetter}
                          </span>
                          <span className="flex-1">{option}</span>
                          {showResult && isCorrectOption && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                          {showResult && isSelected && !isCorrectOption && (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 结果反馈 */}
                {showResult && (
                  <div className={`p-4 rounded-xl ${
                    selectedAnswer === currentQuestion?.correct
                      ? 'bg-green-50 dark:bg-green-950/40 border border-green-200'
                      : 'bg-red-50 dark:bg-red-950/40 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedAnswer === currentQuestion?.correct ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-700 dark:text-green-400">回答正确！</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="font-medium text-red-700 dark:text-red-400">回答错误</span>
                        </>
                      )}
                    </div>
                    
                    {/* 解析 */}
                    <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      <p className="font-medium mb-1">解析：</p>
                      <p>{currentQuestion?.explanation}</p>
                    </div>

                    {/* AI讲解按钮 */}
                    <Button
                      onClick={getAIExplanation}
                      disabled={isAILoading}
                      variant="outline"
                      size="sm"
                      className="mt-3 gap-1"
                    >
                      {isAILoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                      AI详细讲解
                    </Button>

                    {/* AI讲解内容 */}
                    {aiExplanation && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap">
                          {aiExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3 pt-4">
                  {!showResult ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedAnswer}
                      className="flex-1"
                    >
                      提交答案
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="flex-1"
                    >
                      {currentQuestionIndex < (currentPassage?.questions.length || 0) - 1
                        ? '下一题'
                        : currentPassageIndex < passages.length - 1
                          ? '下一篇'
                          : '完成'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function EnglishReadingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    }>
      <EnglishReadingContent />
    </Suspense>
  );
}
