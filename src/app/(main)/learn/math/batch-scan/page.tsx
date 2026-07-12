'use client';

import { useState, useCallback, useRef, Suspense } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileImage, Upload, Loader2, CheckCircle, XCircle,
  BookOpen, Sparkles, ArrowLeft, Play, ChevronRight,
  GraduationCap, Target, TrendingUp, RotateCcw, PenLine,
  Lightbulb, RefreshCw, Check, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { StepInputPad } from '@/components/practice/StepInputPad';
import { cn } from '@/lib/utils';

// 题目类型
interface BatchQuestion {
  id?: string;
  question_number: number;
  question_text: string;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  knowledge_point: string;
  remediation_status?: string;
}

// 批次数据
interface BatchData {
  batch_id: string;
  questions: BatchQuestion[];
  stats: {
    total: number;
    correct: number;
    wrong: number;
    accuracy: number;
  };
}

// 引导对话消息
interface GuidedMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
  stepHint?: string; // 步骤提示
  stepType?: 'choice' | 'calculation'; // 题目类型
  choices?: string[]; // 选项
}

// 引导状态
type GuidedPhase = 'intro' | 'understanding' | 'thinking' | 'solution' | 'summary' | 'practice' | 'complete';

// ============================
// GuidedExplanation 组件 - 核心引导讲解
// ============================
interface GuidedExplanationProps {
  question: BatchQuestion;
  onComplete: (mastered: boolean) => void;
  onExit: () => void;
}

function GuidedExplanation({ question, onComplete, onExit }: GuidedExplanationProps) {
  const [phase, setPhase] = useState<GuidedPhase>('intro');
  const [messages, setMessages] = useState<GuidedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [inputMode, setInputMode] = useState<'choice' | 'handwriting' | 'text'>('text');
  const [showInput, setShowInput] = useState(false);
  const [inputLoading, setInputLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<string[]>([]);
  const [summary, setSummary] = useState('');
  const [practiceResult, setPracticeResult] = useState<'correct' | 'wrong' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 获取 API Key
  const getApiKey = () => {
    try {
      const stored = localStorage.getItem('edumind-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Zustand persist 格式：{ state: { settings: { qwenKey: '...' } } }
        // 直接存储格式（无 persist）：{ settings: { qwenKey: '...' } }
        return parsed?.state?.settings?.qwenKey
          || parsed?.settings?.qwenKey
          || parsed?.qwenKey
          || '';
      }
    } catch {}
    return '';
  };

  // 添加消息
  const addMessage = (msg: Omit<GuidedMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }]);
  };

  // 滚动到底部
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // 清理并格式化识别文本
  const formatRecognizedText = (text: string): string => {
    if (!text) return '(未能识别)';

    // 移除 LaTeX 格式
    let cleaned = text
      .replace(/\$\$?/g, '') // 移除 $ 或 $$
      .replace(/\\begin\{array\}[^{]*\{([^{}]*)\}/g, '') // 移除 \begin{array}
      .replace(/\\end\{array\}/g, '') // 移除 \end{array}
      .replace(/\\hline/g, '') // 移除 \hline
      .replace(/\\\\/g, '\n') // \\ 转换为换行
      .replace(/\\+/g, '') // 移除反斜杠
      .replace(/\{|\}/g, ''); // 移除花括号

    // 清理多余的空白
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

    return cleaned || '(未能识别)';
  };

  // 阶段1: 理解题目
  const startUnderstanding = async () => {
    setPhase('understanding');
    setLoading(true);

    const apiKey = getApiKey();
    if (!apiKey) {
      addMessage({
        role: 'ai',
        content: `好的，让我们一起来理解这道题！

**题目：** ${question.question_text}

**这道题考的是：${question.knowledge_point}**

正确答案：**${question.correct_answer}**

请仔细读题，我来帮你分析一下这道题要做什么...`,
      });
      setLoading(false);
      setTimeout(() => scrollToBottom(), 100);
      return;
    }

    try {
      const response = await fetch('/api/math/batch-explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,  // 同时在请求体中传递
          question: question.question_text,
          knowledgePoint: question.knowledge_point,
          phase: 'understanding',
          studentAnswer: question.student_answer,
          correctAnswer: question.correct_answer,
        }),
      });

      const data = await response.json();
      if (data.success && data.content) {
        // 显示引导问题
        addMessage({
          role: 'ai',
          content: `**题目：** ${question.question_text}

**正确答案：** ${question.correct_answer}

---

${data.content}`,
        });
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        addMessage({
          role: 'ai',
          content: `好的，让我帮你理解这道题：

**题目：** ${question.question_text}

这道题考查的是 **${question.knowledge_point}**，是一道需要仔细分析的题目。

你的答案是：${question.student_answer || '（未作答）'}
正确答案应该是：${question.correct_answer}

现在我们一起来逐步分析解题思路...`,
        });
      }
    } catch {
      addMessage({
        role: 'ai',
        content: `好的，让我们来分析这道题：

**题目：** ${question.question_text}

这道题考查 **${question.knowledge_point}**。
正确答案：**${question.correct_answer}**`,
      });
    }

    setLoading(false);
    setTimeout(() => scrollToBottom(), 100);
  };

  // 阶段2: 引导思考
  const startThinking = async () => {
    setPhase('thinking');
    setShowInput(true);
    setLoading(true);

    const apiKey = getApiKey();
    if (!apiKey) {
      // 根据题目类型决定输入方式
      const isChoice = /^[A-Dabcd]$/.test(question.correct_answer.trim());
      setInputMode(isChoice ? 'choice' : 'text');
      addMessage({
        role: 'ai',
        content: getThinkingPrompt(question, 0, steps),
      });
      setLoading(false);
      setTimeout(() => scrollToBottom(), 100);
      return;
    }

    try {
      const response = await fetch('/api/math/batch-explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,  // 同时在请求体中传递
          question: question.question_text,
          knowledgePoint: question.knowledge_point,
          phase: 'thinking',
          step: currentStep,
          steps: steps,
          studentAnswer: question.student_answer,
          correctAnswer: question.correct_answer,
        }),
      });

      const data = await response.json();
      if (data.success && data.content) {
        addMessage({ role: 'ai', content: data.content });
        if (data.steps) setSteps(data.steps);
        if (data.nextStep !== undefined) setCurrentStep(data.nextStep);
        const isChoice = data.stepType === 'choice';
        setInputMode(isChoice ? 'choice' : 'text');
      } else {
        addMessage({
          role: 'ai',
          content: getThinkingPrompt(question, currentStep, steps),
        });
        const isChoice = /^[A-Dabcd]$/.test(question.correct_answer.trim());
        setInputMode(isChoice ? 'choice' : 'text');
      }
    } catch {
      addMessage({
        role: 'ai',
        content: getThinkingPrompt(question, currentStep, steps),
      });
      const isChoice = /^[A-Dabcd]$/.test(question.correct_answer.trim());
      setInputMode(isChoice ? 'choice' : 'text');
    }

    setLoading(false);
    setTimeout(() => scrollToBottom(), 100);
  };

  // 处理学生回答
  const handleStudentAnswer = async (answer: string) => {
    setInputLoading(true);
    setShowInput(false);

    // 显示用户消息
    const isHandwriting = answer.startsWith('data:image');
    const userMsg = isHandwriting ? '【我用手写方式作答】' : answer;
    addMessage({ role: 'user', content: userMsg });

    const apiKey = getApiKey();

    if (!apiKey) {
      addMessage({ role: 'ai', content: '❌ 请先在设置页面配置 Qwen API Key' });
      setShowInput(true);
      setInputLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 120秒超时

      const response = await fetch('/api/math/batch-explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          question: question.question_text,
          knowledgePoint: question.knowledge_point,
          phase: 'thinking',
          step: currentStep,
          steps: steps,
          studentAnswer: question.student_answer,
          correctAnswer: question.correct_answer,
          userResponse: answer,
          isHandwriting,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`服务器错误: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // 如果是手写且有识别结果，先显示识别内容
        if (isHandwriting && data.recognizedText) {
          // 清理 LaTeX 格式，让显示更友好
          const displayText = formatRecognizedText(data.recognizedText);
          addMessage({
            role: 'ai',
            content: `📝 我识别到你写的是：\n${displayText}`,
          });
        }

        addMessage({ role: 'ai', content: data.content });

        if (data.isStepCorrect) {
          // 步骤正确
          if (data.isComplete) {
            // 全部完成
            setPhase('solution');
            setSummary(data.summary || getDefaultSummary(question));
            setTimeout(() => scrollToBottom(), 100);
          } else {
            // 继续下一题
            if (data.steps) setSteps(data.steps);
            if (data.nextStep !== undefined) setCurrentStep(data.nextStep);
            setShowInput(true);
          }
        } else {
          // 需要继续引导
          if (data.nextStep !== undefined) setCurrentStep(data.nextStep);
          setShowInput(true);
        }
      } else {
        addMessage({ role: 'ai', content: `⚠️ ${data.error || '出了点问题，请重试。'}` });
        setShowInput(true);
      }
    } catch (err) {
      console.error('回答处理失败:', err);
      const errMsg = err instanceof Error ? err.message : '';
      if (errMsg.includes('abort') || errMsg.includes('timeout')) {
        addMessage({ role: 'ai', content: '⏱️ 请求超时了，可能是网络问题或图片太大。请稍后重试。' });
      } else {
        addMessage({ role: 'ai', content: '🌐 网络有点问题，请检查网络后重试。' });
      }
      setShowInput(true);
    }

    setInputLoading(false);
    setTimeout(() => scrollToBottom(), 100);
  };

  // 完成学习，进入练习
  const startPractice = () => {
    setPhase('practice');
    setPracticeResult(null);
    addMessage({
      role: 'ai',
      content: `好的，现在你已经理解了解题思路。让我们来做一道同类型的练习题检验一下！

点击下方按钮生成练习题。`,
    });
  };

  // 生成并练习
  const handlePractice = async () => {
    setLoading(true);
    addMessage({
      role: 'ai',
      content: '正在为你生成一道同类型题，请稍候...',
    });

    const apiKey = getApiKey();

    try {
      const response = await fetch('/api/similar-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuestion: question.question_text,
          knowledgePoint: question.knowledge_point,
          difficulty: 'medium',
          apiKey,
        }),
      });

      const data = await response.json();

      if (data.success && data.question) {
        const q = data.question;
        const questionText = q.text || q.question || '';
        const correctAns = q.correctAnswer || q.correct_answer || '';

        addMessage({
          role: 'ai',
          content: `**练习题：**\n\n${questionText}\n\n请作答！`,
        });

        setStudentAnswer('');
        setShowInput(true);
        // 存储正确答案用于评判
        setSteps([correctAns]);
      } else {
        addMessage({
          role: 'ai',
          content: '生成练习题失败，请重试。',
        });
      }
    } catch {
      addMessage({
        role: 'ai',
        content: '生成练习题失败，请重试。',
      });
    }

    setLoading(false);
    setTimeout(() => scrollToBottom(), 100);
  };

  // 评判练习答案
  const judgePracticeAnswer = async (answer: string) => {
    setInputLoading(true);
    setShowInput(false);

    const userMsg = answer.startsWith('data:image')
      ? '【我用手写方式作答】'
      : answer;
    addMessage({ role: 'user', content: userMsg });

    const apiKey = getApiKey();

    try {
      const response = await fetch('/api/math/batch-explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          question: question.question_text,
          knowledgePoint: question.knowledge_point,
          phase: 'judge',
          practiceAnswer: answer,
          correctAnswer: steps[0] || question.correct_answer,
          isHandwriting: answer.startsWith('data:image'),
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage({ role: 'ai', content: data.content });
        setPracticeResult(data.isCorrect ? 'correct' : 'wrong');

        if (data.isCorrect) {
          setPhase('complete');
          // 保存到错题本（标记为已掌握）
          await saveToWrongQuestions(true);
        }
      } else {
        addMessage({
          role: 'ai',
          content: '无法判断答案，请重试。',
        });
        setShowInput(true);
      }
    } catch {
      // 简单判断
      const isCorrect = answer.toLowerCase().trim() === steps[0]?.toLowerCase().trim() ||
                       normalizeMathAnswer(answer) === normalizeMathAnswer(steps[0]);

      addMessage({
        role: 'ai',
        content: isCorrect
          ? '✅ 回答正确！太棒了！'
          : `❌ 回答错误，正确答案是：${steps[0] || question.correct_answer}`,
      });
      setPracticeResult(isCorrect ? 'correct' : 'wrong');

      if (isCorrect) {
        setPhase('complete');
        await saveToWrongQuestions(true);
      }
    }

    setInputLoading(false);
    setTimeout(() => scrollToBottom(), 100);
  };

  // 保存到错题本
  const saveToWrongQuestions = async (mastered: boolean) => {
    try {
      await fetch('/api/wrong-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: 'math',
          question: question.question_text,
          correctAnswer: question.correct_answer,
          userAnswer: question.student_answer,
          analysis: summary,
          knowledgePoint: question.knowledge_point,
          difficulty: 'medium',
          isMastered: mastered,
          wrongReason: mastered ? '' : '引导学习后仍未掌握',
        }),
      });
    } catch (e) {
      console.error('保存错题失败:', e);
    }
  };

  // 完成学习
  const handleComplete = () => {
    saveToWrongQuestions(practiceResult === 'correct');
    onComplete(practiceResult === 'correct');
  };

  // 选择题选项
  const choiceOptions = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onExit}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            退出
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">第 {question.question_number} 题</span>
              <Badge variant="outline" className="text-xs">
                {question.knowledge_point}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {phase === 'intro' && '开始学习'}
              {phase === 'understanding' && '理解题意'}
              {phase === 'thinking' && '引导思考'}
              {phase === 'solution' && '解题思路'}
              {phase === 'practice' && '练习巩固'}
              {phase === 'complete' && '学习完成'}
            </p>
          </div>
        </div>

        {/* 进度指示 */}
        <div className="flex items-center gap-1">
          {['intro', 'understanding', 'thinking', 'solution', 'practice'].map((p, i) => (
            <div
              key={p}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                phase === p ? 'bg-indigo-500' :
                ['intro', 'understanding', 'thinking', 'solution', 'practice'].indexOf(phase) > i
                  ? 'bg-green-400' : 'bg-slate-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* 题目信息栏 */}
      <div className="px-4 py-3 bg-white border-b">
        <p className="text-sm font-medium text-slate-700 mb-1">题目内容</p>
        <p className="text-sm text-slate-600">{question.question_text}</p>
        <div className="flex gap-6 mt-2 text-sm">
          <span className="text-slate-500">
            你的答案：<span className={cn(
              'font-medium',
              question.is_correct ? 'text-green-600' : 'text-red-600'
            )}>{question.student_answer || '（未作答）'}</span>
          </span>
          <span className="text-slate-500">
            正确答案：<span className="font-medium text-green-600">{question.correct_answer}</span>
          </span>
        </div>
      </div>

      {/* 主内容区：左侧对话（1/3）+ 右侧作答（2/3） */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：对话引导区域（1/3） */}
        <div className="w-1/3 border-r bg-white flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-3">
              {/* 引导阶段选择 */}
              {phase === 'intro' && (
                <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
                  <CardContent className="p-4 text-center space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 mb-1">
                        导师引导学习
                      </h3>
                      <p className="text-xs text-slate-600">
                        带你一步步理解题目，找到解题思路
                      </p>
                    </div>
                    <div className="text-left text-xs text-slate-500 bg-white/60 rounded-lg p-2 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Lightbulb className="h-3 w-3 text-amber-500" />
                        <span>理解题意</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <PenLine className="h-3 w-3 text-blue-500" />
                        <span>引导思考</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3 w-3 text-green-500" />
                        <span>巩固练习</span>
                      </div>
                    </div>
                    <Button
                      onClick={startUnderstanding}
                      className="w-full gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-sm"
                    >
                      <Play className="h-3 w-3" />
                      开始学习
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* 消息列表 */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[90%] rounded-2xl px-3 py-2',
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white rounded-br-md'
                        : 'bg-slate-100 rounded-bl-md'
                    )}
                  >
                    <p className="text-xs whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl px-3 py-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      思考中...
                    </div>
                  </div>
                </div>
              )}

              {/* 阶段按钮 */}
              {phase === 'understanding' && messages.length > 0 && !loading && (
                <div className="flex justify-center pt-1">
                  <Button
                    onClick={startThinking}
                    className="gap-1.5 bg-blue-500 hover:bg-blue-600 text-xs"
                    size="sm"
                  >
                    <Lightbulb className="h-3 w-3" />
                    好的，现在来思考
                  </Button>
                </div>
              )}

              {/* 解题思路总结 */}
              {phase === 'solution' && (
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-bold text-xs">解题思路</span>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-xs text-slate-700 whitespace-pre-wrap">
                      {summary || getDefaultSummary(question)}
                    </div>
                    <Button
                      onClick={startPractice}
                      className="w-full gap-1.5 bg-green-500 hover:bg-green-600 text-xs"
                      size="sm"
                    >
                      <Target className="h-3 w-3" />
                      练习同类型题
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* 练习阶段生成按钮 */}
              {phase === 'practice' && !showInput && (
                <div className="flex flex-col items-center gap-2 pt-1">
                  <Button
                    onClick={handlePractice}
                    disabled={loading}
                    className="gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-xs"
                    size="sm"
                  >
                    {loading ? (
                      <><Loader2 className="h-3 w-3 animate-spin" />生成中...</>
                    ) : (
                      <><RefreshCw className="h-3 w-3" />生成练习题</>
                    )}
                  </Button>
                </div>
              )}

              {/* 完成阶段 */}
              {phase === 'complete' && (
                <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-4 text-center space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-green-700">
                        恭喜掌握了这道题！
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        这类题目再也难不倒你了
                      </p>
                    </div>
                    <div className="flex gap-1.5 pt-1">
                      <Button
                        variant="outline"
                        onClick={onExit}
                        className="flex-1 text-xs h-8"
                      >
                        返回
                      </Button>
                      <Button
                        onClick={handleComplete}
                        className="flex-1 gap-1 bg-green-500 hover:bg-green-600 text-xs h-8"
                      >
                        <Check className="h-3 w-3" />
                        完成
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>

          {/* 左侧底部：选择题快速作答 */}
          {(showInput || inputLoading) && (phase === 'thinking' || phase === 'practice') && inputMode === 'choice' && (
            <div className="border-t p-3 bg-slate-50">
              <p className="text-xs text-slate-500 mb-2">请选择答案：</p>
              <div className="grid grid-cols-2 gap-1.5">
                {choiceOptions.map(opt => (
                  <Button
                    key={opt}
                    variant="outline"
                    onClick={() => handleStudentAnswer(opt)}
                    disabled={inputLoading}
                    className="h-10 font-bold text-sm"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 右侧：作答区域（2/3） */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {(phase === 'thinking' || phase === 'practice') && (
            <>
              {/* 顶部提示 */}
              <div className="px-4 py-2 bg-white border-b">
                <div className="flex items-center gap-2 text-sm">
                  <PenLine className="h-4 w-4 text-indigo-500" />
                  <span className="text-slate-600">
                    {phase === 'practice' ? '请在下方作答练习题：' : '请在下方作答：'}
                  </span>
                </div>
              </div>

              {/* 作答区 */}
              <div className="flex-1 p-4 overflow-auto">
                {inputLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
                      <p className="text-sm text-slate-500 mt-2">AI 正在分析你的答案...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    <StepInputPad
                      onSubmit={phase === 'practice' ? judgePracticeAnswer : handleStudentAnswer}
                      placeholder={phase === 'practice' ? '输入练习题答案...' : '输入你的解题思路或答案...'}
                      className="h-full bg-white rounded-xl border-2 border-indigo-100"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* 非思考/练习阶段显示说明 */}
          {(phase === 'intro' || phase === 'understanding' || phase === 'solution') && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <PenLine className="h-10 w-10 text-indigo-300" />
                </div>
                <p className="text-sm text-slate-400">
                  {phase === 'intro' && '点击左侧"开始学习"进入引导'}
                  {phase === 'understanding' && '正在理解题意中...'}
                  {phase === 'solution' && '解题思路已生成，点击练习巩固'}
                </p>
              </div>
            </div>
          )}

          {/* 完成阶段 */}
          {phase === 'complete' && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <p className="text-base font-medium text-green-700 mb-1">学习完成！</p>
                <p className="text-sm text-slate-500">
                  你已经掌握了这道题的解法
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 生成引导思考提示（默认逻辑）
function getThinkingPrompt(question: BatchQuestion, step: number, steps: string[]): string {
  const knowledge = question.knowledge_point;

  // 第一步：分析已知条件
  if (step === 0) {
    return `很好！现在让我们来逐步分析这道题。

**第一步：找出已知条件**

请告诉我，这道题给了我们哪些已知信息？
（你可以用手写、拍照或打字的方式回答）`;
  }

  // 第二步：确定解题方法
  if (step === 1) {
    return `很好，你找到了已知条件！

**第二步：确定解题思路**

根据这些已知条件，解决这道题需要用到什么方法或公式？
（比如：代入公式、因式分解、求根公式...）

提示：这道题和 **${knowledge}** 有关。`;
  }

  // 第三步：开始计算
  return `很好！现在让我们来实际计算。

**第三步：动手计算**

请按照你的思路写出计算过程，我来看你做得对不对。
（可以手写计算步骤，也可以拍照上传）`;
}

// 生成默认总结
function getDefaultSummary(question: BatchQuestion): string {
  return `这道题考查的是 **${question.knowledge_point}**。

解题关键步骤：
1. 仔细审题，找出所有已知条件
2. 确定适用的公式或方法
3. 按正确顺序进行计算
4. 仔细检查结果

记住这个解题思路，以后遇到同类型的题目就能举一反三了！`;
}

// 数学答案标准化
function normalizeMathAnswer(answer: string): string {
  return answer
    .replace(/\s+/g, '')
    .replace(/[（）()]/g, '')
    .replace(/[，。.，,]/g, '')
    .toLowerCase();
}

// ============================
// BatchScanContent 主组件
// ============================
function BatchScanContent() {
  // 状态
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [batchData, setBatchData] = useState<BatchData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<BatchQuestion | null>(null);
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const [tutoringMode, setTutoringMode] = useState(false);

  // 图片压缩函数
  const compressImage = (dataUrl: string, maxSizeKB: number = 2000): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // 如果图片太大，等比缩放
        const maxDimension = 2000;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // 逐步降低质量直到符合大小要求
        let quality = 0.9;
        let result = canvas.toDataURL('image/jpeg', quality);

        while (result.length > maxSizeKB * 1024 && quality > 0.3) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(result);
      };
      img.src = dataUrl;
    });
  };

  // 处理图片拖放
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalPreview = e.target?.result as string;
      // 压缩图片
      const compressed = await compressImage(originalPreview, 2000);
      setImagePreview(compressed);
      setBatchData(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  // 上传并识别
  const handleScan = async () => {
    if (!imagePreview) return;

    setUploading(true);
    setError(null);

    try {
      // 获取 API Key（兼容 Zustand persist 和直接存储格式）
      const stored = localStorage.getItem('edumind-settings');
      let apiKey = '';

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Zustand persist 格式：{ state: { settings: { qwenKey: '...' } } }
          // 直接存储格式：{ settings: { qwenKey: '...' } }
          apiKey = parsed?.state?.settings?.qwenKey
            || parsed?.settings?.qwenKey
            || parsed?.qwenKey
            || '';
        } catch {
          apiKey = '';
        }
      }

      if (!apiKey) {
        setError('请先在设置页面配置 Qwen API Key');
        setUploading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch('/api/math/batch-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-qwen-api-key': apiKey,
        },
        body: JSON.stringify({
          imageBase64: imagePreview,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`服务器错误: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setBatchData(result.data);
      } else {
        throw new Error(result.error || '扫描失败');
      }
    } catch (err) {
      console.error('扫描失败:', err);
      const message = err instanceof Error ? err.message : '扫描失败，请重试';
      
      // 区分错误类型
      if (message.includes('abort') || message.includes('timeout')) {
        setError('请求超时，请重试或使用更小的图片');
      } else if (message.includes('SSL') || message.includes('CORS') || message.includes('ERR_')) {
        setError('网络连接问题，请刷新页面后重试');
      } else if (message.includes('配置')) {
        setError(message);
      } else {
        setError(`扫描失败: ${message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  // 重置
  const handleReset = () => {
    setImagePreview(null);
    setBatchData(null);
    setError(null);
    setSelectedQuestion(null);
  };

  // 开始逐题攻克
  const startSequentialMode = () => {
    const wrongQuestions = batchData?.questions.filter(q => !q.is_correct) || [];
    if (wrongQuestions.length > 0) {
      setSelectedQuestion(wrongQuestions[0]);
      setTutoringMode(true);
    }
  };

  // 下一题
  const nextWrongQuestion = () => {
    if (!batchData || !selectedQuestion) return;

    const wrongQuestions = batchData.questions.filter(q => !q.is_correct);
    const currentIndex = wrongQuestions.findIndex(q => q.question_number === selectedQuestion.question_number);

    if (currentIndex < wrongQuestions.length - 1) {
      setSelectedQuestion(wrongQuestions[currentIndex + 1]);
    } else {
      setTutoringMode(false);
      setSelectedQuestion(null);
    }
  };

  // 筛选题目
  const filteredQuestions = batchData?.questions.filter(q => {
    if (filter === 'correct') return q.is_correct;
    if (filter === 'wrong') return !q.is_correct;
    return true;
  }) || [];

  // 导师引导完成回调
  const handleTutorComplete = (mastered: boolean) => {
    if (batchData && selectedQuestion) {
      setBatchData({
        ...batchData,
        questions: batchData.questions.map(q =>
          q.question_number === selectedQuestion.question_number
            ? { ...q, is_correct: mastered }
            : q
        ),
        stats: {
          ...batchData.stats,
          correct: batchData.stats.correct + (mastered ? 1 : 0),
          wrong: batchData.stats.wrong - (mastered ? 1 : 0),
          accuracy: Math.round(((batchData.stats.correct + (mastered ? 1 : 0)) / batchData.stats.total) * 100),
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="w-full px-4 py-4 max-w-7xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/math">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileImage className="h-5 w-5 text-indigo-500" />
              整页扫描批改
            </h1>
            <p className="text-xs text-muted-foreground">
              上传作业或试卷照片，AI 自动识别所有题目并批改
            </p>
          </div>
          <Badge variant="outline" className="bg-indigo-50">
            <Sparkles className="h-3 w-3 mr-1" />
            智能批改
          </Badge>
        </div>

        {/* 导师模式全屏覆盖 */}
        {tutoringMode && selectedQuestion && (
          <div className="fixed inset-0 z-50 bg-white">
            <GuidedExplanation
              question={selectedQuestion}
              onComplete={handleTutorComplete}
              onExit={() => {
                setTutoringMode(false);
                setSelectedQuestion(null);
              }}
            />
          </div>
        )}

        {/* 主内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 左侧：图片上传/预览 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4 text-indigo-500" />
                  上传作业照片
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!imagePreview ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {isDragActive ? '释放以上传' : '拖拽图片到这里'}
                    </p>
                    <p className="text-xs text-slate-400">
                      或点击选择文件（支持 JPG、PNG，最大 10MB）
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* 图片预览 */}
                    <div className="relative rounded-xl overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="预览"
                        className="w-full max-h-[400px] object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleReset}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* 扫描按钮 */}
                    <Button
                      className="w-full gap-2"
                      onClick={handleScan}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          扫描中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          开始扫描批改
                        </>
                      )}
                    </Button>

                    {uploading && (
                      <Progress value={undefined} className="animate-pulse" />
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 统计卡片 */}
            {batchData && (
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">批改结果</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-slate-700">{batchData.stats.total}</p>
                      <p className="text-xs text-slate-500">总题数</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{batchData.stats.correct}</p>
                      <p className="text-xs text-green-600">正确</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-red-600">{batchData.stats.wrong}</p>
                      <p className="text-xs text-red-600">错误</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-indigo-600">{batchData.stats.accuracy}%</p>
                      <p className="text-xs text-indigo-600">正确率</p>
                    </div>
                  </div>

                  {/* 逐题攻克按钮 */}
                  {batchData.stats.wrong > 0 && (
                    <Button
                      className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                      onClick={startSequentialMode}
                    >
                      <Target className="h-4 w-4" />
                      逐题攻克 ({batchData.stats.wrong} 道错题)
                    </Button>
                  )}

                  {batchData.stats.wrong === 0 && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-1" />
                      <p className="text-sm font-medium text-green-700">全部正确！太棒了！</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧：题目列表 */}
          <div className="lg:col-span-2">
            {batchData ? (
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      题目列表
                    </CardTitle>
                    <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                      <TabsList className="h-8">
                        <TabsTrigger value="all" className="text-xs px-2 py-1">全部</TabsTrigger>
                        <TabsTrigger value="correct" className="text-xs px-2 py-1">正确</TabsTrigger>
                        <TabsTrigger value="wrong" className="text-xs px-2 py-1">错误</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-320px)]">
                    <div className="space-y-3">
                      {filteredQuestions.map((question) => (
                        <div
                          key={question.question_number}
                          className={cn(
                            'rounded-xl border p-4 transition-colors',
                            question.is_correct
                              ? 'bg-green-50/50 border-green-200 hover:border-green-300'
                              : 'bg-red-50/50 border-red-200 hover:border-red-300'
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-medium">
                                第 {question.question_number} 题
                              </Badge>
                              <Badge
                                variant={question.is_correct ? 'default' : 'destructive'}
                                className="text-xs"
                              >
                                {question.is_correct ? (
                                  <><CheckCircle className="h-3 w-3 mr-1" />正确</>
                                ) : (
                                  <><XCircle className="h-3 w-3 mr-1" />错误</>
                                )}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-xs bg-slate-100">
                              {question.knowledge_point}
                            </Badge>
                          </div>

                          <p className="text-sm text-slate-700 mb-3">
                            {question.question_text}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-slate-500">你的答案：</span>
                              <span className={cn(
                                'font-medium',
                                question.is_correct ? 'text-green-600' : 'text-red-600'
                              )}>
                                {question.student_answer || '（未作答）'}
                              </span>
                            </div>
                            {!question.is_correct && (
                              <div>
                                <span className="text-slate-500">正确答案：</span>
                                <span className="font-medium text-green-600">
                                  {question.correct_answer}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* 讲解按钮 */}
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <Button
                              size="sm"
                              className="gap-1.5 bg-indigo-500 hover:bg-indigo-600"
                              onClick={() => {
                                setSelectedQuestion(question);
                                setTutoringMode(true);
                              }}
                            >
                              <GraduationCap className="h-3.5 w-3.5" />
                              讲解
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-lg font-medium text-slate-500 mb-2">
                    上传图片开始扫描
                  </p>
                  <p className="text-sm text-slate-400">
                    拍下作业或试卷，AI 将自动识别所有题目并批改
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* 功能说明 */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              整页扫描批改流程
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">拍照上传</p>
                  <p className="text-xs text-slate-500">拍摄作业或试卷页面</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">AI 识别</p>
                  <p className="text-xs text-slate-500">自动识别所有题目内容</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">智能批改</p>
                  <p className="text-xs text-slate-500">自动计算对错和正确率</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">4</span>
                </div>
                <div>
                  <p className="font-medium text-sm">导师讲解</p>
                  <p className="text-xs text-slate-500">错题可进入引导式学习</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BatchScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <BatchScanContent />
    </Suspense>
  );
}
