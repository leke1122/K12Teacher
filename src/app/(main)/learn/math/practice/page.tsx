'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, BookOpen, CheckCircle, XCircle, 
  ChevronDown, ChevronUp, Lightbulb, AlertCircle,
  Loader2, Sparkles, RotateCcw, Home
} from 'lucide-react';
import { ChapterSectionSelector } from '@/components/math/ChapterSectionSelector';

interface Question {
  id: string;
  type: 'choice' | 'fill' | 'solution';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  knowledgePoint: string;
}

interface SectionInfo {
  chapterId: string;
  sectionId: string;
  name: string;
  pageRange: string;
  description: string;
  allowedTopics: string[];
}

export default function MathPracticePage() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<{
    chapterId: string;
    sectionId: string;
    chapterName: string;
    sectionName: string;
  } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [warning, setWarning] = useState<string | null>(null);

  // 处理章节选择
  const handleSectionSelect = (
    chapterId: string,
    sectionId: string,
    chapterName: string,
    sectionName: string
  ) => {
    setSelectedSection({ chapterId, sectionId, chapterName, sectionName });
    setQuestions([]);
    setSectionInfo(null);
    setUserAnswers({});
    setShowAnswers(false);
    setExpandedQuestions(new Set());
  };

  // 生成练习题
  const generatePractice = async () => {
    if (!selectedSection) return;

    setLoading(true);
    setError(null);
    setWarning(null);

    try {
      const res = await fetch('/api/math/generate-section-practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedSection.chapterId,
          sectionId: selectedSection.sectionId,
          count: 5
        })
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.message || '生成失败');
        return;
      }

      setQuestions(json.data.questions || []);
      setSectionInfo(json.data.sectionInfo);
      if (json.data.warning) {
        setWarning(json.data.warning);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理答案输入
  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // 切换题目展开/折叠
  const toggleExpand = (questionId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // 检查答案
  const checkAnswer = (question: Question): boolean => {
    const userAnswer = userAnswers[question.id]?.trim().toUpperCase();
    const correctAnswer = question.answer.trim().toUpperCase();
    
    if (question.type === 'choice') {
      return userAnswer === correctAnswer;
    }
    
    // 填空题和解答题：包含正确答案即可
    return correctAnswer.includes(userAnswer) || userAnswer.includes(correctAnswer);
  };

  // 重置练习
  const resetPractice = () => {
    setUserAnswers({});
    setShowAnswers(false);
    setExpandedQuestions(new Set());
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/math')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
            <h1 className="font-bold text-lg">数学章节练习</h1>
          </div>
          {selectedSection && questions.length > 0 && (
            <Button variant="outline" size="sm" onClick={resetPractice}>
              <RotateCcw className="h-4 w-4 mr-1" />
              重新练习
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {!selectedSection ? (
          /* 章节选择器 */
          <ChapterSectionSelector onSelect={handleSectionSelect} />
        ) : (
          <>
            {/* 已选章节信息 */}
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-green-500 mb-2">已选章节</Badge>
                    <h2 className="text-xl font-bold text-slate-800">
                      {selectedSection.chapterName}
                    </h2>
                    <p className="text-slate-600 mt-1">
                      {selectedSection.sectionId} {selectedSection.sectionName}
                    </p>
                  </div>
                  {!questions.length && (
                    <Button
                      onClick={generatePractice}
                      disabled={loading}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          生成练习
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 小节知识信息 */}
            {sectionInfo && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                    本节知识点
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-3">{sectionInfo.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {sectionInfo.allowedTopics.map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="bg-blue-50">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 警告信息 */}
            {warning && (
              <Card className="border-2 border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700">注意</p>
                      <p className="text-sm text-amber-600 mt-1 whitespace-pre-wrap">{warning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 错误信息 */}
            {error && (
              <Card className="border-2 border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 加载状态 */}
            {loading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-500 mb-4" />
                  <p className="text-muted-foreground">正在生成练习题...</p>
                  <p className="text-xs text-slate-400 mt-2">请稍候，AI正在根据本节知识点生成题目</p>
                </CardContent>
              </Card>
            )}

            {/* 题目列表 */}
            {!loading && questions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    练习题 ({questions.length}题)
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnswers(!showAnswers)}
                  >
                    {showAnswers ? '隐藏答案' : '显示答案'}
                  </Button>
                </div>

                {questions.map((question, index) => {
                  const isCorrect = showAnswers ? checkAnswer(question) : null;
                  const isExpanded = expandedQuestions.has(question.id);
                  const userAnswer = userAnswers[question.id];

                  return (
                    <Card key={question.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-mono">
                                {index + 1}
                              </Badge>
                              <Badge className={
                                question.type === 'choice' ? 'bg-blue-100 text-blue-700' :
                                question.type === 'fill' ? 'bg-purple-100 text-purple-700' :
                                'bg-green-100 text-green-700'
                              }>
                                {question.type === 'choice' ? '选择题' : question.type === 'fill' ? '填空题' : '解答题'}
                              </Badge>
                              <Badge variant="outline" className={
                                question.difficulty === 'easy' ? 'text-green-600 border-green-300' :
                                question.difficulty === 'medium' ? 'text-amber-600 border-amber-300' :
                                'text-red-600 border-red-300'
                              }>
                                {question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难'}
                              </Badge>
                            </div>
                            <p className="text-slate-800 font-medium">{question.question}</p>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* 选择题选项 */}
                        {question.type === 'choice' && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optIdx) => {
                              const optionLetter = String.fromCharCode(65 + optIdx);
                              const isSelected = userAnswer === optionLetter;
                              const isCorrectOption = showAnswers && question.answer.toUpperCase() === optionLetter;
                              
                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => !showAnswers && handleAnswerChange(question.id, optionLetter)}
                                  disabled={showAnswers}
                                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                                    isCorrectOption ? 'border-green-500 bg-green-50' :
                                    isSelected && !showAnswers ? 'border-blue-500 bg-blue-50' :
                                    'border-slate-200 hover:border-blue-300 bg-white'
                                  }`}
                                >
                                  <span className={`font-medium mr-2 ${
                                    isCorrectOption ? 'text-green-600' : 'text-slate-600'
                                  }`}>
                                    {optionLetter}.
                                  </span>
                                  {option}
                                  {isCorrectOption && (
                                    <CheckCircle className="inline-block h-4 w-4 ml-2 text-green-500" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* 填空题输入 */}
                        {question.type === 'fill' && (
                          <div>
                            <input
                              type="text"
                              value={userAnswer || ''}
                              onChange={(e) => !showAnswers && handleAnswerChange(question.id, e.target.value)}
                              disabled={showAnswers}
                              placeholder="请输入答案..."
                              className={`w-full p-3 rounded-lg border-2 ${
                                showAnswers && userAnswer ? (
                                  checkAnswer(question) ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                                ) : 'border-slate-200 focus:border-blue-500'
                              } outline-none`}
                            />
                            {showAnswers && userAnswer && (
                              <p className={`mt-2 text-sm ${checkAnswer(question) ? 'text-green-600' : 'text-red-600'}`}>
                                {checkAnswer(question) ? (
                                  <><CheckCircle className="inline h-4 w-4 mr-1" />回答正确！</>
                                ) : (
                                  <><XCircle className="inline h-4 w-4 mr-1" />正确答案是：{question.answer}</>
                                )}
                              </p>
                            )}
                          </div>
                        )}

                        {/* 答案和解析 */}
                        {showAnswers && (
                          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                            <div>
                              <p className="text-sm font-medium text-slate-600 mb-1">正确答案</p>
                              <p className="text-lg font-bold text-green-600">{question.answer}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600 mb-1">详细解析</p>
                              <p className="text-slate-700">{question.explanation}</p>
                            </div>
                          </div>
                        )}

                        {/* 查看解析按钮 */}
                        {!showAnswers && (
                          <button
                            onClick={() => toggleExpand(question.id)}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            {isExpanded ? (
                              <><ChevronUp className="h-4 w-4" />收起解析</>
                            ) : (
                              <><Lightbulb className="h-4 w-4" />查看提示</>
                            )}
                          </button>
                        )}

                        {/* 展开的解析 */}
                        {!showAnswers && isExpanded && (
                          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-amber-700 mb-1">解题提示</p>
                                <p className="text-slate-700 text-sm">{question.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}

                {/* 操作按钮 */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <Button
                    onClick={() => setShowAnswers(!showAnswers)}
                    className="flex-1"
                  >
                    {showAnswers ? '隐藏答案' : '显示答案与解析'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetPractice}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重新练习
                  </Button>
                </div>

                {/* 统计信息 */}
                {showAnswers && (
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {Object.keys(userAnswers).length > 0 ? 
                          `${questions.filter(q => checkAnswer(q)).length}/${questions.length}` : 
                          questions.length}
                      </p>
                      <p className="text-sm text-slate-600">
                        {Object.keys(userAnswers).length > 0 ? 
                          `你答对了 ${questions.filter(q => checkAnswer(q)).length} 题` : 
                          '请核对答案'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* 空状态 */}
        {!selectedSection && !loading && questions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">开始章节练习</h3>
              <p className="text-sm text-slate-500 mb-6">选择一个章节和小节，AI将根据该节知识点生成精准练习题</p>
              <Button onClick={() => router.push('/subjects/math')}>
                <Home className="h-4 w-4 mr-2" />
                返回学科首页
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
