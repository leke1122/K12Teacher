'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, RotateCcw, Lightbulb, Sparkles } from 'lucide-react';
import { useRemediationStore } from '@/stores/remediationStore';

interface TutorChatProps {
  questionId: string;
  onComplete?: () => void;
  onGenerateSimilar?: () => void;
}

const QUICK_REPLIES = [
  { label: '我重新算了一遍', value: '我重新算了一遍，答案是...' },
  { label: '我不太确定', value: '我不太确定，应该从哪里入手？' },
  { label: '提示一下公式', value: '能提示一下应该用什么公式吗？' },
  { label: '我算出来了', value: '我算出来了，我的答案是...' },
];

export default function TutorChat({ questionId, onComplete, onGenerateSimilar }: TutorChatProps) {
  const {
    messages,
    addMessage,
    clearMessages,
    currentTurn,
    consecutiveErrors,
    setSimilarQuestion,
    currentQuestion,
  } = useRemediationStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 初始化导师开场白
  useEffect(() => {
    if (messages.length === 0 && questionId) {
      const initialMessage = `同学好！我是数学导师小明。\n\n我们来看一道关于 **${currentQuestion?.knowledgePoint || '数学'}** 的题目。\n\n请先告诉我：\n1. 你认为这道题考的是什么知识点？\n2. 你打算从哪里入手解决这个问题？`;
      
      addMessage('ai', initialMessage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setLoading(true);

    try {
      // 构建对话历史
      const turnHistory = messages.map(m => ({
        role: m.role as 'ai' | 'user',
        content: m.content,
      }));
      turnHistory.push({ role: 'user', content: userMessage });

      const response = await fetch('/api/math/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          student_message: userMessage,
          turn_history: turnHistory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage('ai', data.response);

        // 如果答对了，显示变式题按钮
        if (data.is_correct || data.next_action === 'generate_similar') {
          setShowSimilar(true);
          onComplete?.();
        }
      } else {
        addMessage('ai', '抱歉，服务出了点问题，请稍后再试。');
      }
    } catch (error) {
      console.error('[TutorChat] 发送失败:', error);
      addMessage('ai', '网络错误，请检查连接后重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (value: string) => {
    setInput(value);
  };

  const handleGenerateSimilar = async () => {
    if (!currentQuestion) return;

    setLoading(true);
    try {
      // 获取 API Key
      const settings = JSON.parse(localStorage.getItem('edumind-settings') || '{}');
      const apiKey = settings.deepseekApiKey || settings.deepseek_api_key || '';

      const response = await fetch('/api/similar-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuestion: currentQuestion.question,
          knowledgePoint: currentQuestion.knowledgePoint,
          difficulty: 'medium',
          apiKey,
        }),
      });

      const data = await response.json();

      if (data.success && data.question) {
        setSimilarQuestion(data.question);
        clearMessages();
        addMessage('ai', `太棒了！你已经掌握了原题的解法。现在来做一道变式题检验一下：\n\n**变式题：**\n${data.question.text}\n\n请认真作答，完成后告诉我你的答案。`);
        setShowSimilar(false);
        onGenerateSimilar?.();
      } else {
        addMessage('ai', '变式题生成失败，请稍后再试。');
      }
    } catch (error) {
      console.error('[TutorChat] 生成变式题失败:', error);
      addMessage('ai', '生成变式题时出错，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    clearMessages();
    addMessage('ai', `同学好！我们重新开始。\n\n请仔细读题，然后告诉我你的解题思路。\n\n记住：不要着急，一步一步来。`);
    setShowSimilar(false);
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-sm font-bold text-indigo-600">明</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">数学导师小明</h3>
            <p className="text-xs text-muted-foreground">
              第 {currentTurn} 轮 · 连续错误 {consecutiveErrors} 次
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            苏格拉底模式
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 消息区域 */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-indigo-500 text-white rounded-br-md'
                    : 'bg-slate-100 dark:bg-slate-800 rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-indigo-200' : 'text-muted-foreground'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
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

          {showSimilar && (
            <div className="flex justify-center pt-2">
              <Button
                onClick={handleGenerateSimilar}
                className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
              >
                <Sparkles className="h-4 w-4" />
                做一道变式题
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 快速回复 */}
      <div className="px-4 py-2 border-t bg-slate-50 dark:bg-slate-800/50">
        <div className="flex flex-wrap gap-2">
          {QUICK_REPLIES.map((reply) => (
            <Button
              key={reply.label}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleQuickReply(reply.value)}
            >
              {reply.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入你的解题思路或答案..."
            className="min-h-[60px] resize-none"
            disabled={loading}
          />
          <Button
            size="icon"
            className="h-[60px] w-12"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </Card>
  );
}
