'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Brain,
  Target,
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
  RefreshCw,
  BookOpen,
  AlertTriangle,
  Trophy,
  ChevronRight,
} from 'lucide-react';
import {
  GEOGRAPHY_CHAPTER_OPTIONS,
  GEOGRAPHY_KNOWLEDGE_CHAPTERS,
} from '@/data/geography/knowledgeFull';
import { PracticeQuestion } from '@/components/practice/PracticeQuestion';
import { PracticeResult } from '@/components/practice/PracticeResult';
import { updateStepProgress } from '@/lib/geographyProgress';
import { AutoHideHeader } from '@/components/ui/AutoHideHeader';

interface Question {
  id: string;
  type: 'choice' | 'fill';
  difficulty: string;
  knowledgePoint?: string;
  source?: string;
  text?: string;
  question?: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  steps?: string[];
}

interface AnswerRecord {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

export default function GeographyPracticePage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = (params.chapterId as string) || 'chapter1';
  
  const [selectedDifficulty, setSelectedDifficulty] = useState<'simple' | 'medium' | 'hard'>('medium');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // 答题状态
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [practiceComplete, setPracticeComplete] = useState(false);

  const chapter = GEOGRAPHY_KNOWLEDGE_CHAPTERS.find(ch => ch.id === chapterId) || GEOGRAPHY_KNOWLEDGE_CHAPTERS[0];
  
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalCount = answers.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const progress = totalCount > 0 ? Math.round((totalCount / questions.length) * 100) : 0;

  // 生成练习题
  const generateQuestions = async () => {
    setGenerating(true);
    setLoading(true);
    
    try {
      const response = await fetch('/api/generate-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: 'geography',
          chapterId: chapterId,
          difficulty: selectedDifficulty,
          questionCount: 10,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.questions) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setShowFeedback(false);
        setAnswers([]);
        setPracticeComplete(false);
      } else {
        console.error('生成失败:', data);
      }
    } catch (error) {
      console.error('生成练习题失败:', error);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  // 选择答案
  const handleAnswer = (answer: string) => {
    const question = questions[currentIndex];
    const isCorrect = answer.toUpperCase() === question.correctAnswer.toUpperCase();
    
    setSelectedAnswers(prev => ({ ...prev, [question.id]: answer }));
    setShowFeedback(true);
    
    // 记录答案
    setAnswers(prev => [...prev, {
      questionId: question.id,
      userAnswer: answer,
      isCorrect,
      timestamp: Date.now(),
    }]);
  };

  // 下一题
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowFeedback(false);
    } else {
      // 练习完成
      setPracticeComplete(true);
      updateStepProgress('geography', chapterId, 'practice', 'completed');
    }
  };

  // 重新开始
  const restartPractice = () => {
    generateQuestions();
  };

  // 完成练习后添加错题
  const wrongQuestions: Question[] = answers
    .filter(a => !a.isCorrect)
    .map(a => questions.find(q => q.id === a.questionId))
    .filter((q): q is Question => q !== undefined);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-emerald-50/40">
      {/* 固定页头 */}
      <AutoHideHeader><header className="z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href={`/learn/geography/knowledge-full/${chapterId}`}>
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </Link>
            
            <div className="flex items-center gap-1 ml-4">
              {GEOGRAPHY_CHAPTER_OPTIONS.map((ch) => (
                <Button
                  key={ch.id}
                  variant={ch.id === chapter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => router.push(`/learn/geography/practice/${ch.id}`)}
                  className="text-xs"
                >
                  {ch.title}
                </Button>
              ))}
            </div>
            
            <Badge variant="outline" className="ml-auto bg-emerald-50">
              {chapter.subtitle}
            </Badge>
          </div>
        </div>
      </header></AutoHideHeader>

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {!loading && questions.length === 0 ? (
          // 开始练习界面
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="flex items-center justify-center gap-2">
                <Target className="h-6 w-6 text-emerald-500" />
                地理练习
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  本章：{chapter.title} · {chapter.subtitle}
                </p>
                
                {/* 难度选择 */}
                <div className="flex justify-center gap-2 mb-6">
                  <Button
                    variant={selectedDifficulty === 'simple' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty('simple')}
                    className={selectedDifficulty === 'simple' ? 'bg-green-500' : ''}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    简单
                  </Button>
                  <Button
                    variant={selectedDifficulty === 'medium' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty('medium')}
                    className={selectedDifficulty === 'medium' ? 'bg-amber-500' : ''}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    中等
                  </Button>
                  <Button
                    variant={selectedDifficulty === 'hard' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty('hard')}
                    className={selectedDifficulty === 'hard' ? 'bg-red-500' : ''}
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    困难
                  </Button>
                </div>
              </div>

              {/* 知识点范围提示 */}
              <Card className="bg-white/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-500" />
                    练习范围
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {chapter.sections.slice(0, 3).map(section => (
                      <Badge key={section.id} variant="outline" className="text-xs">
                        {section.title}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 高考考点提示 */}
              <Card className="bg-amber-50/50 border-amber-200">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    高考高频考点
                  </h4>
                  <div className="space-y-1 text-sm text-slate-600">
                    {chapter.examAnalysis.frequency.slice(0, 3).map((item, idx) => (
                      <p key={idx}>• {item.topic}（{item.times}次）</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={generateQuestions} 
                size="lg" 
                className="w-full gap-2"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI正在生成练习题...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    开始练习
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          // 加载中
          <Card className="py-12">
            <CardContent className="text-center space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-emerald-500" />
              <div>
                <p className="font-medium text-lg">正在生成练习题</p>
                <p className="text-sm text-muted-foreground">
                  AI正在根据本章知识点出题，请稍候...
                </p>
              </div>
              <Progress value={null} className="w-48 mx-auto" />
            </CardContent>
          </Card>
        ) : practiceComplete ? (
          // 练习完成
          <div className="space-y-4">
            <PracticeResult
              totalQuestions={questions.length}
              correctCount={correctCount}
              wrongCount={wrongQuestions.length}
              wrongQuestions={wrongQuestions.map(q => ({
                question: q.text || q.question || '',
                userAnswer: answers.find(a => a.questionId === q.id)?.userAnswer || '',
                correctAnswer: q.correctAnswer,
                knowledgePoint: q.knowledgePoint,
                difficulty: q.difficulty,
              }))}
              onRestart={restartPractice}
              subjectId="geography"
              chapterId={chapterId}
              sectionId="chapter"
            />
            
            <div className="flex gap-2">
              <Button onClick={restartPractice} variant="outline" className="flex-1 gap-2">
                <RefreshCw className="h-4 w-4" />
                再练一次
              </Button>
              <Button 
                onClick={() => router.push(`/wrong-questions`)} 
                variant="outline" 
                className="flex-1 gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                查看错题本
              </Button>
            </div>
          </div>
        ) : (
          // 答题中
          <div className="space-y-4">
            {/* 进度条 */}
            <Card className="bg-white/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    第 {currentIndex + 1} / {questions.length} 题
                  </span>
                  <span className="text-sm text-muted-foreground">
                    正确率 {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* 题目 */}
            <PracticeQuestion
              question={questions[currentIndex]}
              index={currentIndex}
              selectedAnswer={selectedAnswers[questions[currentIndex].id]}
              showFeedback={showFeedback}
              onAnswer={handleAnswer}
            />

            {/* 下一题按钮 */}
            {showFeedback && (
              <Button onClick={nextQuestion} className="w-full gap-2" size="lg">
                {currentIndex < questions.length - 1 ? (
                  <>
                    下一题
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    完成练习
                    <CheckCircle className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
