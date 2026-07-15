'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  MessageCircle,
  Lightbulb,
  CheckCircle,
  ChevronRight,
  Loader2,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Target,
  Zap,
  AlertCircle,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'explanation' | 'question' | 'answer' | 'summary' | 'practice';
}

interface HistoryGuidedLearningProps {
  unitId?: string;
  unitTitle?: string;
}

export function HistoryGuidedLearning({ unitId = 'unit1', unitTitle }: HistoryGuidedLearningProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stepComplete, setStepComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 学习步骤
  const steps = [
    {
      id: 'intro',
      title: '背景导入',
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      prompt: `请介绍"${unitTitle || '本单元'}"的历史背景，包括：1）这一时期的社会状况；2）主要矛盾和问题；3）历史发展趋势。请用通俗易懂的语言讲解，让学生能够理解为什么要学习这段历史。`,
    },
    {
      id: 'core_event',
      title: '核心事件',
      icon: Target,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100',
      prompt: `请详细讲解本单元最重要的历史事件，包括：1）事件的直接原因（是什么导致了这件事？）；2）事件的主要经过；3）事件的重要结果（这件事导致了什么？）。重点说明因果关系。`,
    },
    {
      id: 'key_concepts',
      title: '关键概念',
      icon: Lightbulb,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      prompt: `请讲解本单元需要掌握的关键历史概念/制度，包括：1）每个概念的含义；2）为什么重要；3）与哪些其他概念有联系（因果关系）。`,
    },
    {
      id: 'causal_chain',
      title: '因果链条',
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      prompt: `请梳理本单元历史事件的因果链条：1）这件事导致了什么结果？2）这个结果又导致了什么？3）请详细说明 A → B → C 的发展过程。讲解时要明确说明"因为...所以..."的逻辑。`,
    },
    {
      id: 'gaokao',
      title: '高考考点',
      icon: GraduationCap,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      prompt: `请结合辽宁高考的特点，讲解本单元的常考知识点：1）哪些内容是高频考点；2）常见的题型有哪些；3）答题时需要注意什么。`,
    },
    {
      id: 'practice',
      title: '练习巩固',
      icon: Brain,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100',
      prompt: `请根据本单元内容，生成一道高考风格的练习题，包括题目、选项（选择题）或材料分析要求，以及答案和解析。题目难度：${difficulty}。`,
    },
  ];

  // 获取 API Key
  const getApiKey = () => {
    try {
      const stored = localStorage.getItem('edumind-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.settings?.deepseekKey || parsed?.deepseekKey || '';
      }
    } catch {}
    return '';
  };

  // 发送消息到 AI
  const sendToAI = async (question: string) => {
    setLoading(true);
    try {
      const apiKey = getApiKey();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch('/api/history/qa', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question,
          context: `高中历史学习：${unitTitle || '历史单元'}。这是引导式学习模式，需要详细、易懂的讲解，特别要说明因果关系。`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        return data.data.answer;
      }
      return '抱歉，AI 服务暂时不可用。请检查是否已配置 DeepSeek API Key。';
    } catch (error) {
      console.error('AI 请求失败:', error);
      return '网络错误，请稍后重试。';
    } finally {
      setLoading(false);
    }
  };

  // 开始学习步骤
  const startStep = async (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setShowAnswer(false);
    setUserAnswer('');
    setStepComplete(false);

    const step = steps[stepIndex];

    // 添加系统消息
    setMessages((prev) => [
      ...prev,
      {
        role: 'system',
        content: `【${step.title}】开始学习`,
        type: 'summary',
      },
    ]);

    // 获取 AI 讲解
    const explanation = await sendToAI(step.prompt);

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: explanation,
        type: 'explanation',
      },
    ]);

    // 如果是练习步骤，等待用户作答
    if (step.id === 'practice') {
      // 练习题已经在上面的讲解中生成了
    }
  };

  // 回答练习题
  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userAnswer,
        type: 'answer',
      },
    ]);

    // 生成反馈
    const feedback = await sendToAI(`学生回答：${userAnswer}。请评价这个回答，指出对错，并给出正确答案和解析。`);

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: feedback,
        type: 'explanation',
      },
    ]);

    setStepComplete(true);
    setUserAnswer('');
  };

  // 进入下一步
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      startStep(currentStep + 1);
    }
  };

  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 初始化
  const startLearning = () => {
    setMessages([]);
    startStep(0);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-4">
      {/* 步骤选择器 */}
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <button
              key={step.id}
              onClick={() => startStep(index)}
              disabled={loading && isActive}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                isActive
                  ? `${step.bgColor} border-${step.color.replace('text-', '')}`
                  : isCompleted
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : loading && isActive ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <Icon className={`h-4 w-4 ${step.color}`} />
              )}
              <span className={`text-sm font-medium ${isActive ? step.color : 'text-slate-600'}`}>
                {index + 1}. {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* 难度选择（仅练习步骤显示） */}
      {currentStepData?.id === 'practice' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">题目难度：</span>
          <div className="flex gap-1">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <Button
                key={d}
                size="sm"
                variant={difficulty === d ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => setDifficulty(d)}
              >
                {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 消息区域 */}
      {messages.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-amber-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            历史引导式学习
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {unitTitle || '本单元'} · {steps.length} 个学习环节
          </p>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            通过引导式对话学习，深入理解历史事件的背景、过程、因果关系和高考考点。
            点击下方按钮开始学习。
          </p>
          <Button onClick={startLearning} className="gap-2 bg-amber-500 hover:bg-amber-600">
            <Brain className="h-4 w-4" />
            开始学习
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <>
          <ScrollArea ref={scrollRef} className="h-[500px] border rounded-lg bg-slate-50 p-4">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-white'
                        : msg.role === 'system'
                        ? 'bg-slate-200 text-slate-700 text-sm'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.role === 'assistant' && (
                        <GraduationCap className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI 思考中...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 操作区域 */}
          <div className="flex justify-between items-center">
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={goToNextStep}
                disabled={loading}
                className="gap-2 bg-amber-500 hover:bg-amber-600"
              >
                {steps[currentStep].title}
                <ChevronRight className="h-4 w-4" />
                下一步：{steps[currentStep + 1]?.title}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={startLearning}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                重新开始学习
              </Button>
            )}

            {currentStepData?.id === 'practice' && !stepComplete && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                  placeholder="输入你的答案..."
                  className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
                />
                <Button
                  onClick={submitAnswer}
                  disabled={!userAnswer.trim() || loading}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  提交答案
                </Button>
              </div>
            )}

            {stepComplete && (
              <Badge className="bg-green-100 text-green-700 gap-1">
                <CheckCircle className="h-4 w-4" />
                本步骤已完成
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
}
