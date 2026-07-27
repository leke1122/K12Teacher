'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  Target,
  BookOpen,
  Trophy,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  GEOGRAPHY_KNOWLEDGE_CHAPTERS,
  type GeographyChapter,
  type KnowledgeContent,
} from '@/data/geography/knowledgeFull';
import { useSettingsStore } from '@/stores/settingsStore';

// 错题记录函数 - 通过API记录到Supabase
async function recordWrongQuestion(data: {
  subjectId: string;
  chapterId: string;
  sectionId: string;
  question: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  knowledgePoint: string;
  difficulty: string;
}) {
  try {
    const res = await fetch('/api/wrong-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: data.subjectId,
        question: data.question,
        correctAnswer: data.correctAnswer,
        userAnswer: data.userAnswer,
        analysis: data.explanation,
        difficulty: data.difficulty,
        knowledgePoint: data.knowledgePoint,
      }),
    });
    const result = await res.json();
    if (result.success) {
      console.log('[GeographyLearning] 错题已记录:', data.question.substring(0, 50));
    } else {
      console.warn('[GeographyLearning] 错题记录失败:', result.error);
    }
    return result;
  } catch (err) {
    console.error('[GeographyLearning] 错题记录异常:', err);
    return null;
  }
}

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
  explanation: string;
  knowledgePoint: string;
}

interface KnowledgeSubsection {
  sectionId: string;
  sectionTitle: string;
  subsectionId: string;
  subsectionTitle: string;
  content: KnowledgeContent[];
}

interface GeographyGuidedLearningProps {
  chapterId: string;
  onComplete?: () => void;
}

// 生成AI题目
async function generateQuizWithAI(
  title: string,
  content: string,
  difficulty: number,
  previousQuestions: string[] = []
): Promise<QuizQuestion[]> {
  const { settings } = useSettingsStore.getState();
  const deepseekKey = settings?.deepseekKey || '';

  const difficultyText = difficulty === 1 ? '简单' : difficulty === 2 ? '中等' : '困难';

  try {
    const res = await fetch('/api/geography/guided-learning/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        content, 
        difficulty: difficultyText,
        previousQuestions,
        count: 1,
        deepseekKey
      }),
    });
    const data = await res.json();
    if (data.success && data.questions) {
      return data.questions;
    }
  } catch (err) {
    console.error('生成题目失败:', err);
  }
  return [];
}

function extractKnowledgeSubsections(chapter: GeographyChapter): KnowledgeSubsection[] {
  const result: KnowledgeSubsection[] = [];
  
  chapter.sections.forEach(section => {
    section.subsections.forEach(subsection => {
      if (subsection.content && subsection.content.length > 0) {
        result.push({
          sectionId: section.id,
          sectionTitle: section.title,
          subsectionId: subsection.id,
          subsectionTitle: subsection.title,
          content: subsection.content,
        });
      }
    });
  });
  
  return result;
}

function convertContentToText(content: KnowledgeContent[]): string {
  return content.map(item => {
    if (item.type === 'key-point') return `[重点] ${item.content}`;
    if (item.type === 'note') return `[注意] ${item.content}`;
    if (item.type === 'quote') return `[易错] ${item.content}`;
    if (item.type === 'table' && item.headers && item.rows) {
      const tableContent = [item.headers?.join(' | '), ...(item.rows?.map(r => r.join(' | ')) || [])].join('\n');
      return `[表格]\n${tableContent}`;
    }
    if (item.type === 'text') return item.content;
    return '';
  }).filter(Boolean).join('\n\n');
}

export function GeographyGuidedLearning({ chapterId, onComplete }: GeographyGuidedLearningProps) {
  const [view, setView] = useState<'select' | 'study' | 'quiz'>('select');
  const [subsections, setSubsections] = useState<KnowledgeSubsection[]>([]);
  const [currentSubsection, setCurrentSubsection] = useState<KnowledgeSubsection | null>(null);
  const [currentSubsectionIndex, setCurrentSubsectionIndex] = useState(0);
  const [completedSubsections, setCompletedSubsections] = useState<Set<string>>(new Set());
  
  // 答题状态
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [isAiGeneration, setIsAiGeneration] = useState(false);

  const chapter = GEOGRAPHY_KNOWLEDGE_CHAPTERS.find(ch => ch.id === chapterId) || GEOGRAPHY_KNOWLEDGE_CHAPTERS[0];
  const contentTextRef = useRef('');

  useEffect(() => {
    const subs = extractKnowledgeSubsections(chapter);
    setSubsections(subs);
  }, [chapter]);

  // 开始学习某个知识点
  const startStudy = useCallback((sub: KnowledgeSubsection, index: number) => {
    setCurrentSubsection(sub);
    setCurrentSubsectionIndex(index);
    setView('study');
    setCorrectCount(0);
    setTotalQuestions(0);
    setDifficulty(1);
    setAnsweredQuestions([]);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    // 转换知识点内容为文本
    contentTextRef.current = convertContentToText(sub.content);
  }, []);

  // 开始答题
  const startQuiz = useCallback(async () => {
    if (!currentSubsection) return;
    
    setView('quiz');
    setLoading(true);
    setCorrectCount(0);
    setDifficulty(1);
    setAnsweredQuestions([]);
    setIsAiGeneration(true);
    setShowNextButton(false);
    setSelectedAnswer(null);
    setShowResult(false);
    
    try {
      const questions = await generateQuizWithAI(
        currentSubsection.subsectionTitle,
        contentTextRef.current,
        1,
        []
      );
      
      if (questions.length > 0) {
        setCurrentQuestion(questions[0]);
        setTotalQuestions(1);
        setAnsweredQuestions([questions[0].question]);
      }
    } catch (err) {
      console.error('生成题目失败:', err);
    }
    
    setLoading(false);
  }, [currentSubsection]);

  // 选择答案
  const handleSelectAnswer = useCallback(async (answerId: string) => {
    if (!currentQuestion || !currentSubsection || showResult) return;
    
    setSelectedAnswer(answerId);
    setShowResult(true);
    setShowNextButton(true);
    
    const selectedOpt = currentQuestion.options.find(o => o.id === answerId);
    const isCorrect = selectedOpt?.isCorrect || false;
    
    if (isCorrect) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      setTotalQuestions(prev => prev + 1);
      
      // 答对6题，标记完成（但不自动跳转，等用户点击按钮）
      if (newCorrectCount >= 6) {
        setCompletedSubsections(prev => new Set([...prev, currentSubsection.subsectionId]));
      }
    } else {
      // 答错
      setTotalQuestions(prev => prev + 1);
      
      // 记录错题
      recordWrongQuestion({
        subjectId: 'geography',
        chapterId: chapterId,
        sectionId: currentSubsection.sectionId,
        question: currentQuestion.question,
        options: currentQuestion.options.map(o => `${o.id}. ${o.text}`),
        userAnswer: `${answerId}. ${selectedOpt?.text || ''}`,
        correctAnswer: `${currentQuestion.options.find(o => o.isCorrect)?.id}. ${currentQuestion.options.find(o => o.isCorrect)?.text || ''}`,
        explanation: currentQuestion.explanation,
        knowledgePoint: currentSubsection.subsectionTitle,
        difficulty: difficulty === 1 ? 'easy' : difficulty === 2 ? 'medium' : 'hard',
      });
    }
  }, [currentQuestion, currentSubsection, showResult, correctCount, difficulty, chapterId]);

  // 进入下一题
  const goToNextQuestion = useCallback(async () => {
    if (!currentSubsection) return;
    
    setShowNextButton(false);
    setLoading(true);
    setIsAiGeneration(true);
    
    // 如果答对6题，跳转到下一个知识点
    if (correctCount >= 6) {
      const nextIndex = subsections.findIndex((s, idx) => 
        idx > currentSubsectionIndex && !completedSubsections.has(s.subsectionId)
      );
      
      if (nextIndex !== -1) {
        setLoading(false);
        startStudy(subsections[nextIndex], nextIndex);
        return;
      } else {
        setView('select');
        onComplete?.();
        setLoading(false);
        return;
      }
    }
    
    // 计算下一题难度
    const selectedOpt = currentQuestion?.options.find(o => o.id === selectedAnswer);
    const isCorrect = selectedOpt?.isCorrect || false;
    const newDifficulty = isCorrect 
      ? Math.min(3, difficulty + 1)  // 答对难度+1
      : Math.max(1, difficulty - 1); // 答错难度-1
    
    setDifficulty(newDifficulty);
    
    try {
      const questions = await generateQuizWithAI(
        currentSubsection.subsectionTitle,
        contentTextRef.current,
        newDifficulty,
        answeredQuestions
      );
      
      if (questions.length > 0) {
        setCurrentQuestion(questions[0]);
        setTotalQuestions(prev => prev + 1);
        setAnsweredQuestions(prev => [...prev, questions[0].question]);
      }
    } catch (err) {
      console.error('生成题目失败:', err);
    }
    
    setSelectedAnswer(null);
    setShowResult(false);
    setLoading(false);
  }, [currentSubsection, currentQuestion, selectedAnswer, correctCount, difficulty, currentSubsectionIndex, completedSubsections, subsections, answeredQuestions, startStudy, onComplete]);

  // 返回选择知识点
  const backToSelect = () => {
    setCurrentSubsection(null);
    setView('select');
    setCurrentQuestion(null);
  };

  // 返回学习
  const backToStudy = () => {
    setView('study');
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  // 知识点选择视图
  if (view === 'select') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">地理引导式学习</h3>
          <p className="text-sm text-slate-500">{chapter.subtitle} · 共 {subsections.length} 个知识点</p>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-700">学习方式：</p>
                  <ol className="text-amber-600 mt-1 space-y-0.5">
                  <li>1. 选择知识点开始学习</li>
                  <li>2. 阅读知识点讲解</li>
                  <li>3. 答对6题进入下一知识点</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {subsections.map((sub, idx) => {
              const isCompleted = completedSubsections.has(sub.subsectionId);
              const isNext = !isCompleted && subsections.slice(0, idx).every(s => completedSubsections.has(s.subsectionId));
              
              return (
                <Card 
                  key={sub.subsectionId}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isCompleted ? 'border-emerald-200 bg-emerald-50/50' : 
                    isNext ? 'border-amber-300 bg-amber-50/30' : ''
                  }`}
                  onClick={() => startStudy(sub, idx)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isCompleted ? 'bg-emerald-500 text-white' : 
                        isNext ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{sub.subsectionTitle}</p>
                        <p className="text-xs text-slate-500">
                          {sub.content.length} 个要点
                          {isCompleted && <span className="text-emerald-600 ml-2">✓</span>}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // 学习/答题视图 - 左右分栏
  return (
    <div className="h-full flex">
      {/* 左侧控制栏 - 对应截图二的红色区域 */}
      <div className="w-64 border-r bg-slate-50 flex flex-col flex-shrink-0">
        <div className="p-3 border-b bg-white">
          <Button variant="ghost" size="sm" onClick={backToSelect} className="gap-1 w-full justify-start h-8">
            <ChevronLeft className="h-4 w-4" />
            返回列表
          </Button>
        </div>
        
        <div className="p-3 border-b bg-white">
          <Badge variant="outline" className="bg-emerald-50 text-xs">
            {currentSubsection?.subsectionTitle}
          </Badge>
        </div>
        
        {/* 进度显示 */}
        <div className="p-3 border-b bg-white">
          <div className="text-xs text-slate-500 mb-1">答题进度</div>
          <Progress value={(correctCount / 6) * 100} className="h-2" />
          <div className="text-center text-sm font-medium text-emerald-600 mt-1">
            {correctCount} / 6
          </div>
        </div>
        
        {/* 难度和题号 */}
        <div className="p-3 border-b bg-white">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>难度: {difficulty === 1 ? '简单' : difficulty === 2 ? '中等' : '困难'}</span>
            <span>第 {totalQuestions} 题</span>
          </div>
          <Badge variant="outline" className={`text-xs ${
            isAiGeneration ? 'bg-purple-50 text-purple-600' : 'bg-slate-50'
          }`}>
            {isAiGeneration ? '🤖 AI出题' : '题库'}
          </Badge>
        </div>
        
        {/* 开始答题按钮 */}
        {view === 'study' && (
          <div className="p-3 mt-auto bg-white border-t">
            <Button 
              onClick={startQuiz}
              size="sm"
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Target className="h-4 w-4" />
              开始答题测试
            </Button>
          </div>
        )}
        
        {/* 返回学习按钮 */}
        {view === 'quiz' && !showResult && !loading && (
          <div className="p-3 mt-auto bg-white border-t">
            <Button 
              variant="outline"
              size="sm"
              onClick={backToStudy}
              className="w-full gap-2"
            >
              <BookOpen className="h-4 w-4" />
              返回学习
            </Button>
          </div>
        )}
      </div>
      
      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 知识点学习 */}
        {view === 'study' && currentSubsection && (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {currentSubsection.content.map((item, idx) => {
                if (item.type === 'key-point') {
                  return (
                    <div key={idx} className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="text-emerald-600 font-medium">⭐ 重点：</span>
                      <span className="text-slate-700">{item.content}</span>
                    </div>
                  );
                }
                if (item.type === 'note') {
                  return (
                    <div key={idx} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-blue-600 font-medium">💡 注意：</span>
                      <span className="text-slate-700 whitespace-pre-wrap">{item.content}</span>
                    </div>
                  );
                }
                if (item.type === 'quote') {
                  return (
                    <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-amber-600 font-medium">⚠️ 易错：</span>
                      <span className="text-slate-700 whitespace-pre-wrap">{item.content}</span>
                    </div>
                  );
                }
                if (item.type === 'table' && item.headers && item.rows) {
                  return (
                    <div key={idx} className="overflow-x-auto p-3 bg-white border rounded-lg">
                      {item.content && <p className="font-medium text-slate-700 mb-2">{item.content}</p>}
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            {item.headers.map((header, hIdx) => (
                              <th key={hIdx} className="border border-slate-300 px-3 py-2 text-left font-medium">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {item.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="border border-slate-300 px-3 py-2 text-slate-600">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                return (
                  <div key={idx} className="p-3 bg-white border rounded-lg text-slate-600 whitespace-pre-wrap">
                    {item.content}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        
        {/* 答题视图 */}
        {view === 'quiz' && currentQuestion && (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* 题目卡片 */}
              <Card className="border-emerald-200">
                <CardContent className="p-4">
                  <p className="text-base text-slate-800 leading-relaxed font-medium">
                    {currentQuestion.question}
                  </p>
                </CardContent>
              </Card>

              {/* 选项 */}
              <div className="space-y-2">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedAnswer === opt.id;
                  const isCorrect = opt.isCorrect;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;
                  
                  return (
                    <button
                      key={opt.id}
                      onClick={() => !showResult && handleSelectAnswer(opt.id)}
                      disabled={showResult}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                        showCorrect
                          ? 'bg-green-100 border-green-500'
                          : showWrong
                          ? 'bg-red-100 border-red-500'
                          : isSelected
                          ? 'bg-emerald-50 border-emerald-400'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        showCorrect
                          ? 'bg-green-500 text-white'
                          : showWrong
                          ? 'bg-red-500 text-white'
                          : isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {opt.id}
                      </span>
                      <span className="text-sm flex-1">{opt.text}</span>
                      {showCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {showWrong && <XCircle className="h-5 w-5 text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {/* 答案解析 */}
              {showResult && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-amber-800">答案解析</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {currentQuestion.explanation}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* 已学习，继续答题按钮 */}
              {showNextButton && !loading && (
                <div className="flex justify-center pt-2">
                  <Button
                    onClick={goToNextQuestion}
                    size="lg"
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 px-8"
                  >
                    <BookOpen className="h-5 w-5" />
                    {correctCount >= 6 ? '已完成，进入下一知识点' : '已学习，继续答题'}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* 加载状态 */}
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500 mr-2" />
                  <span className="text-slate-500">正在生成下一题...</span>
                </div>
              )}

              {/* 完成提示 */}
              {correctCount >= 6 && !loading && showNextButton && (
                <Card className="border-emerald-200 bg-emerald-50">
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                    <h3 className="text-lg font-bold text-emerald-700">太棒了！</h3>
                    <p className="text-emerald-600">
                      掌握了「{currentSubsection?.subsectionTitle}」！
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      点击上方按钮进入下一个知识点
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
