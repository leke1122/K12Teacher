'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Target, CheckCircle2, XCircle, Loader2,
  Brain, BookOpen, TrendingUp, Zap, RefreshCw
} from 'lucide-react';
import { functionGraphNodes, FunctionGraphNode } from '@/data/math/functionKnowledgeGraph';

interface Question {
  id: string;
  text: string;
  type: 'choice' | 'fill';
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: string;
}

interface PracticeResult {
  nodeId: string;
  nodeLabel: string;
  questions: Question[];
  results: Record<string, { correct: boolean; userAnswer: string }>;
  score: number;
}

export default function FunctionPracticePage() {
  const router = useRouter();
  const userId = 'personal-user';

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);

  // 按难度分类的节点
  const nodesByDifficulty = {
    easy: functionGraphNodes.filter(n => n.difficulty === 1),
    medium: functionGraphNodes.filter(n => n.difficulty === 2),
    hard: functionGraphNodes.filter(n => n.difficulty === 3),
  };

  const handleNodeSelect = async (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setQuestions([]);
    setUserAnswers({});
    setShowResult(false);
    setPracticeComplete(false);
    setCurrentIndex(0);

    // 加载练习题
    setLoading(true);
    try {
      const res = await fetch('/api/math/function/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          nodeId,
          difficulty: 'medium',
          count: 5,
        }),
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setQuestions(data.questions);
      } else {
        // 使用内置题库
        setQuestions(getBuiltinQuestions(nodeId));
      }
    } catch (err) {
      console.error('[FunctionPractice] 加载失败:', err);
      setQuestions(getBuiltinQuestions(nodeId));
    } finally {
      setLoading(false);
    }
  };

  const getBuiltinQuestions = (nodeId: string): Question[] => {
    const bank: Record<string, Question[]> = {
      'func-basic': [
        { id: '1', text: '函数 f(x) = √(x-1) 的定义域是？', type: 'choice', options: ['A. x≥0', 'B. x>1', 'C. x≥1', 'D. x≠1'], answer: 'C', explanation: '根号内需要≥0', difficulty: 'easy' },
        { id: '2', text: '已知 f(x) = 2x+1，求 f(3) = ?', type: 'fill', answer: '7', explanation: 'f(3) = 2×3+1 = 7', difficulty: 'easy' },
      ],
      'func-domain': [
        { id: '1', text: '函数 f(x) = 1/(x-2) 的定义域是？', type: 'choice', options: ['A. x≠2', 'B. x>2', 'C. x<2', 'D. x≥2'], answer: 'A', explanation: '分母不能为零', difficulty: 'easy' },
        { id: '2', text: '函数 f(x) = √(3-x) + 1/(x-1) 的定义域是？', type: 'fill', answer: 'x<3 且 x≠1', explanation: '需满足 3-x≥0 且 x-1≠0', difficulty: 'medium' },
      ],
      'func-monotonicity': [
        { id: '1', text: '函数 f(x) = 2x+3 在 R 上是什么单调性？', type: 'choice', options: ['A. 增函数', 'B. 减函数', 'C. 常数函数', 'D. 非单调'], answer: 'A', explanation: 'k=2>0，所以是增函数', difficulty: 'easy' },
      ],
      'func-parity': [
        { id: '1', text: '判断 f(x) = x² 的奇偶性', type: 'choice', options: ['A. 奇函数', 'B. 偶函数', 'C. 非奇非偶', 'D. 既奇又偶'], answer: 'B', explanation: 'f(-x) = x² = f(x)', difficulty: 'easy' },
      ],
      'exp-function': [
        { id: '1', text: '指数函数 y = 2ˣ 的图像恒过哪个点？', type: 'choice', options: ['A. (0,0)', 'B. (0,1)', 'C. (1,0)', 'D. (1,1)'], answer: 'B', explanation: 'a⁰=1', difficulty: 'easy' },
      ],
      'log-function': [
        { id: '1', text: 'log₂8 = ?', type: 'fill', answer: '3', explanation: '2³=8', difficulty: 'easy' },
      ],
      'quadratic-function': [
        { id: '1', text: '二次函数 y = x²-4x+3 的顶点坐标是？', type: 'choice', options: ['A. (2,-1)', 'B. (2,1)', 'C. (-2,-1)', 'D. (-2,1)'], answer: 'A', explanation: '顶点 x = -b/2a = 2', difficulty: 'medium' },
      ],
      'derivative-concept': [
        { id: '1', text: '已知 f(x) = x²，求 f\'(x) = ?', type: 'fill', answer: '2x', explanation: '(x²)\' = 2x', difficulty: 'easy' },
      ],
    };
    return bank[nodeId] || [
      { id: '1', text: `关于本知识点的练习题（1）`, type: 'choice', options: ['A. 正确', 'B. 错误'], answer: 'A', explanation: '请认真学习知识点', difficulty: 'easy' },
    ];
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    // 计算得分
    const results: Record<string, { correct: boolean; userAnswer: string }> = {};
    let correctCount = 0;

    for (const q of questions) {
      const userAnswer = userAnswers[q.id] || '';
      const isCorrect = q.type === 'fill' 
        ? userAnswer.trim().toLowerCase() === q.answer.toLowerCase()
        : userAnswer === q.answer;
      
      results[q.id] = { correct: isCorrect, userAnswer };
      if (isCorrect) correctCount++;
    }

    const score = Math.round((correctCount / questions.length) * 100);

    const node = functionGraphNodes.find(n => n.id === selectedNodeId);
    setResult({
      nodeId: selectedNodeId!,
      nodeLabel: node?.label || '',
      questions,
      results,
      score,
    });
    setPracticeComplete(true);
    setShowResult(true);

    // 更新掌握度
    fetch('/api/math/function/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        action: 'answer',
        nodeId: selectedNodeId,
        userInput: `练习得分${score}分`,
        apiKey: '', // 将在服务端处理
      }),
    });
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
      {/* 顶部导航 */}
      <header className="sticky top-16 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/learn/math/function')} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" />
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">函数专项练习</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {!selectedNodeId ? (
          // 节点选择
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  选择知识点进行练习
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="easy">基础</TabsTrigger>
                    <TabsTrigger value="medium">中等</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {functionGraphNodes.map(node => (
                        <Button
                          key={node.id}
                          variant="outline"
                          className="justify-start h-auto py-2 px-3 text-left"
                          onClick={() => handleNodeSelect(node.id)}
                        >
                          <span className="text-sm">{node.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="easy">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {nodesByDifficulty.easy.map(node => (
                        <Button
                          key={node.id}
                          variant="outline"
                          className="justify-start h-auto py-2 px-3 text-left"
                          onClick={() => handleNodeSelect(node.id)}
                        >
                          <span className="text-sm">{node.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="medium">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {nodesByDifficulty.medium.map(node => (
                        <Button
                          key={node.id}
                          variant="outline"
                          className="justify-start h-auto py-2 px-3 text-left"
                          onClick={() => handleNodeSelect(node.id)}
                        >
                          <span className="text-sm">{node.label}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        ) : showResult ? (
          // 练习结果
          <div className="space-y-4">
            <Card className={result!.score >= 80 ? 'border-emerald-500' : result!.score >= 60 ? 'border-amber-500' : 'border-red-500'}>
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  result!.score >= 80 ? 'bg-emerald-100' : result!.score >= 60 ? 'bg-amber-100' : 'bg-red-100'
                }`}>
                  {result!.score >= 80 ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  ) : result!.score >= 60 ? (
                    <TrendingUp className="h-8 w-8 text-amber-600" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600" />
                  )}
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {result!.score >= 80 ? '优秀！' : result!.score >= 60 ? '及格，继续加油！' : '需要加强'}
                </h2>
                <p className="text-muted-foreground mb-4">{result!.nodeLabel} 得分：{result!.score}分</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => { setShowResult(false); setSelectedNodeId(null); }}>
                    选择其他知识点
                  </Button>
                  {result!.score < 80 && (
                    <Button onClick={() => { setShowResult(false); handleNodeSelect(selectedNodeId!); }}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      再练一次
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 答案详情 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">答题详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result!.questions.map((q, idx) => {
                  const r = result!.results[q.id];
                  return (
                    <div key={q.id} className={`p-4 rounded-lg border ${
                      r.correct ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30' : 'border-red-200 bg-red-50 dark:bg-red-950/30'
                    }`}>
                      <div className="flex items-start gap-3">
                        {r.correct ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium mb-2">
                            <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                            {q.text}
                          </p>
                          {q.options && (
                            <div className="ml-4 text-sm">
                              {q.options.map(opt => (
                                <div key={opt} className={
                                  opt.startsWith(r.userAnswer.split('.')[0]) ? 
                                    (r.correct ? 'text-emerald-600 font-medium' : 'text-red-600') : ''
                                }>
                                  {opt}
                                </div>
                              ))}
                            </div>
                          )}
                          {!r.correct && (
                            <p className="text-sm text-muted-foreground mt-2">
                              你的答案：{r.userAnswer || '(未作答)'} | 正确答案：{q.answer}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            💡 {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ) : (
          // 答题界面
          <div className="space-y-4">
            {/* 进度 */}
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                第 {currentIndex + 1} / {questions.length} 题
              </Badge>
              <Progress value={(currentIndex / questions.length) * 100} className="w-32" />
            </div>

            {/* 当前题目 */}
            {loading ? (
              <Card className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">加载题目中...</p>
              </Card>
            ) : currentQuestion ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{currentQuestion.text}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion.difficulty === 'easy' ? '基础' : '中等'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentQuestion.type === 'choice' ? (
                    <RadioGroup
                      value={userAnswers[currentQuestion.id] || ''}
                      onValueChange={(v) => handleAnswerSelect(currentQuestion.id, v)}
                      className="space-y-2"
                    >
                      {currentQuestion.options?.map((opt) => (
                        <div key={opt} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                          <RadioGroupItem value={opt.split('.')[0]} id={opt} />
                          <Label htmlFor={opt} className="flex-1 cursor-pointer">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="answer">你的答案</Label>
                      <Input
                        id="answer"
                        value={userAnswers[currentQuestion.id] || ''}
                        onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                        placeholder="输入答案..."
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">该知识点暂无练习题</p>
                <Button variant="outline" onClick={() => setSelectedNodeId(null)}>
                  选择其他知识点
                </Button>
              </Card>
            )}

            {/* 导航按钮 */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                上一题
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentIndex(i => i + 1)}
                  disabled={!userAnswers[currentQuestion?.id]}
                >
                  下一题
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(userAnswers).length < questions.length}
                  className="gap-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  提交答案
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
