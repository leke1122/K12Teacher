'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, Loader2, Lightbulb, CheckCircle2, XCircle, ArrowRight,
  Sparkles, BookOpen, Brain
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FunctionTutorChatProps {
  userId?: string;
  nodeId: string;
  nodeLabel: string;
  nodeDescription?: string;
  keyPoints?: string[];
  formula?: string;
  onComplete?: (nodeId: string, score: number) => void;
  onNext?: () => void;
}

export function FunctionTutorChat({
  userId = 'personal-user',
  nodeId,
  nodeLabel,
  nodeDescription,
  keyPoints = [],
  formula,
  onComplete,
  onNext,
}: FunctionTutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 初始化开场白
  useEffect(() => {
    if (nodeId) {
      const intro = `📚 欢迎学习【${nodeLabel}】！

${nodeDescription || ''}

${keyPoints.length > 0 ? `🎯 本节重点：
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}

${formula ? `📐 核心公式：
${formula}` : ''}

请告诉我：你对这个知识点有什么理解？或者有什么疑问？`;

      setMessages([{
        id: `intro_${Date.now()}`,
        role: 'assistant',
        content: intro,
        timestamp: new Date(),
      }]);
      setIsComplete(false);
      setShowHint(false);
      setHintLevel(0);
    }
  }, [nodeId, nodeLabel, nodeDescription, keyPoints, formula]);

  // 自动滚动
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // 添加用户消息
    setMessages(prev => [...prev, {
      id: `user_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    setLoading(true);

    try {
      // 调用引导 API
      const res = await fetch('/api/math/function/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'answer',
          nodeId,
          userInput: userMessage,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // 添加 AI 回应
        setMessages(prev => [...prev, {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: data.feedback || '好的，继续加油！',
          timestamp: new Date(),
        }]);

        // 如果回答正确
        if (data.isCorrect) {
          setIsComplete(true);
          onComplete?.(nodeId, data.masteryUpdate?.newScore || 100);
        }
      } else {
        setMessages(prev => [...prev, {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: '抱歉，服务出了点问题，请稍后再试。',
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      console.error('[FunctionTutor] 发送失败:', err);
      setMessages(prev => [...prev, {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: '网络错误，请检查连接后重试。',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleHint = () => {
    const hints = [
      keyPoints[0] || '请仔细阅读知识点描述',
      keyPoints[1] || '注意公式的使用条件',
      keyPoints[2] || '尝试从定义出发思考',
    ];
    
    if (hintLevel < hints.length) {
      setMessages(prev => [...prev, {
        id: `hint_${Date.now()}`,
        role: 'assistant',
        content: `💡 提示 ${hintLevel + 1}：${hints[hintLevel]}`,
        timestamp: new Date(),
      }]);
      setHintLevel(prev => prev + 1);
      setShowHint(true);
    }
  };

  const handleNext = () => {
    onNext?.();
  };

  return (
    <Card className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Brain className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI 导师</h3>
            <p className="text-xs text-muted-foreground">正在学习: {nodeLabel}</p>
          </div>
        </div>
        <Badge variant={isComplete ? 'default' : 'outline'} className="gap-1">
          {isComplete ? (
            <>
              <CheckCircle2 className="h-3 w-3" />
              已掌握
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              引导中
            </>
          )}
        </Badge>
      </div>

      {/* 消息区域 */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-br-md'
                    : 'bg-slate-100 dark:bg-slate-800 rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-indigo-200' : 'text-muted-foreground'
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  思考中...
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 完成状态 */}
      {isComplete && (
        <div className="px-4 py-3 border-t bg-emerald-50 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">太棒了！你已掌握这个知识点！</span>
            </div>
            <Button size="sm" onClick={handleNext} className="gap-1">
              下一节 <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 底部操作 */}
      <div className="p-4 border-t space-y-2">
        {!isComplete && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleHint}
              className="gap-1"
              disabled={hintLevel >= 3}
            >
              <Lightbulb className="h-4 w-4" />
              提示 ({hintLevel}/3)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setInput('我觉得我理解了这个知识点，因为...');
                inputRef.current?.focus();
              }}
              className="gap-1"
            >
              <BookOpen className="h-4 w-4" />
              我会了
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入你的问题或回答..."
            className="min-h-[60px] resize-none"
            disabled={loading || isComplete}
          />
          <Button
            size="icon"
            className="h-[60px] w-12"
            onClick={handleSend}
            disabled={!input.trim() || loading || isComplete}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </Card>
  );
}
