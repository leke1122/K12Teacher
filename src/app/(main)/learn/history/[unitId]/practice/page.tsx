'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Brain, FileQuestion, CheckCircle, XCircle, 
  BookOpen, Lightbulb, ChevronRight, Shuffle, Trophy
} from 'lucide-react';
import { releasedUnits } from '@/data/history/units';

interface Question {
  id: string;
  type: 'choice' | 'fill' | 'essay';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: '简单' | '中等' | '困难';
  points: number;
  unit: string;
}

interface ExamQuestion {
  id: string;
  topic: string;
  level: string;
  reason: string;
  unit: string;
  year?: number;
  province?: string;
  type?: string;
}

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params.unitId as string;
  
  const [activeTab, setActiveTab] = useState('exam');
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const unit = releasedUnits.find(u => u.id === unitId);

  useEffect(() => {
    async function loadData() {
      try {
        // 加载高考考点
        const examRes = await fetch(`/api/history/exam-focus?unitId=${unitId}`);
        const examData = await examRes.json();
        if (examData.success) {
          setExamQuestions(examData.data.examFocus || []);
        }

        // 生成练习题
        const practiceRes = await fetch(`/api/history/practice-questions?unitId=${unitId}`);
        const practiceData = await practiceRes.json();
        if (practiceData.success) {
          setPracticeQuestions(practiceData.data.questions || []);
        }
      } catch (err) {
        console.error('加载数据失败:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [unitId]);

  const handleAnswer = (answer: string) => {
    if (answered.includes(currentQuestion)) return;
    setSelectedAnswer(answer);
    setShowAnswer(true);
    setAnswered([...answered, currentQuestion]);
    
    if (answer === practiceQuestions[currentQuestion]?.answer) {
      setScore(score + practiceQuestions[currentQuestion].points);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < practiceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setAnswered([]);
  };

  if (!unit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">单元不存在</p>
            <Button className="mt-4" onClick={() => router.push('/subjects/history')}>
              返回历史学习
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/learn/history/unit/${unitId}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">综合练习 - {unit.name}</h1>
              <p className="text-sm text-muted-foreground">{unit.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full bg-white">
              <TabsTrigger value="exam" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                高考考点
              </TabsTrigger>
              <TabsTrigger value="practice" className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4" />
                答题练习
              </TabsTrigger>
              <TabsTrigger value="memory" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                记忆卡牌
              </TabsTrigger>
            </TabsList>

            {/* 高考考点 */}
            <TabsContent value="exam">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    辽宁高考高频考点
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {examQuestions.length} 个高频考点，按考频排序
                  </p>
                </CardHeader>
                <CardContent>
                  {examQuestions.length > 0 ? (
                    <div className="space-y-3">
                      {examQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 rounded-lg bg-slate-50 border">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{idx + 1}</Badge>
                              <Badge className={`
                                ${q.level.includes('★★★') ? 'bg-red-100 text-red-700' : 
                                  q.level.includes('★★') ? 'bg-amber-100 text-amber-700' : 
                                  'bg-slate-100 text-slate-700'}
                              `}>
                                {q.level}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{q.unit}</Badge>
                            </div>
                          </div>
                          <h3 className="font-medium mb-2">{q.topic}</h3>
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">真题来源：</span>{q.reason}
                          </p>
                          {q.year && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {q.province} {q.year}年 · {q.type}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">暂无高考考点数据</p>
                  )}
                </CardContent>
              </Card>

              {/* 辽宁卷真题 */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">辽宁卷真题速览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      ★★★ 必考大题：秦始皇统一、汉武帝大一统、选官制度
                    </p>
                    <p className="text-muted-foreground">
                      ★★☆ 高频选择：新石器文化、分封制、诸子百家、孝文帝改革
                    </p>
                    <p className="text-muted-foreground">
                      ★☆☆ 基础了解：宗法制、礼乐制、商周经济
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 答题练习 */}
            <TabsContent value="practice">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileQuestion className="h-5 w-5 text-blue-500" />
                    答题练习
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      第 {currentQuestion + 1} / {practiceQuestions.length} 题
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">得分: {score}</Badge>
                      <Button variant="outline" size="sm" onClick={resetQuiz}>
                        <Shuffle className="h-4 w-4 mr-1" />
                        重新开始
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {practiceQuestions.length > 0 && practiceQuestions[currentQuestion] ? (
                    <div className="space-y-4">
                      {/* 题目 */}
                      <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{practiceQuestions[currentQuestion].difficulty}</Badge>
                          <Badge variant="outline">{practiceQuestions[currentQuestion].points}分</Badge>
                          <Badge variant="outline">{practiceQuestions[currentQuestion].unit}</Badge>
                        </div>
                        <p className="font-medium">{practiceQuestions[currentQuestion].question}</p>
                      </div>

                      {/* 选项 */}
                      <div className="space-y-2">
                        {practiceQuestions[currentQuestion].options?.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAnswer(option)}
                            disabled={showAnswer}
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              showAnswer
                                ? option === practiceQuestions[currentQuestion].answer
                                  ? 'bg-green-100 border-green-500 text-green-700'
                                  : option === selectedAnswer
                                    ? 'bg-red-100 border-red-500 text-red-700'
                                    : 'bg-slate-50 border-slate-200'
                                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-blue-300'
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + idx).}</span>
                            {option}
                          </button>
                        ))}
                      </div>

                      {/* 答案解析 */}
                      {showAnswer && (
                        <div className={`p-4 rounded-lg border ${
                          selectedAnswer === practiceQuestions[currentQuestion].answer
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {selectedAnswer === practiceQuestions[currentQuestion].answer ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className="font-medium">
                              {selectedAnswer === practiceQuestions[currentQuestion].answer ? '回答正确！' : '回答错误'}
                            </span>
                          </div>
                          <p className="text-sm mb-2">
                            <span className="font-medium">正确答案：</span>
                            {practiceQuestions[currentQuestion].answer}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <Lightbulb className="h-4 w-4 inline mr-1" />
                            {practiceQuestions[currentQuestion].explanation}
                          </p>
                        </div>
                      )}

                      {/* 下一题 */}
                      {showAnswer && currentQuestion < practiceQuestions.length - 1 && (
                        <Button onClick={nextQuestion} className="w-full">
                          下一题
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}

                      {/* 完成 */}
                      {showAnswer && currentQuestion === practiceQuestions.length - 1 && (
                        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-center">
                          <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                          <p className="font-medium">练习完成！</p>
                          <p className="text-sm text-muted-foreground">
                            最终得分：{score} / {practiceQuestions.reduce((sum, q) => sum + q.points, 0)}
                          </p>
                          <Button className="mt-4" onClick={resetQuiz}>
                            再练一次
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">暂无练习题</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 记忆卡牌 */}
            <TabsContent value="memory">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    历史记忆卡牌
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    记忆卡牌功能可在单元学习页的"卡牌"标签中查看
                  </p>
                  <Button className="w-full" onClick={() => router.push(`/learn/history/unit/${unitId}?tab=cards`)}>
                    前往查看卡牌
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
