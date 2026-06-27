'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import { ReadingProgress } from '@/lib/chineseReadingProgress';
import { useSettingsStore } from '@/stores/settingsStore';

interface DialogueMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Step5Props {
  text: string;
  chapterTitle: string;
  chapterId: string;
  progress: ReadingProgress | null;
  onComplete: (data: { reflection: string }) => void;
}

export function ReadingStep5({ text, chapterTitle, chapterId, progress, onComplete }: Step5Props) {
  const { settings } = useSettingsStore();
  const [messages, setMessages] = useState<DialogueMessage[]>(() => {
    const initial: DialogueMessage[] = [];
    if (progress?.reflection) {
      initial.push({ role: 'assistant', content: '让我们回顾一下你的反思：' });
      initial.push({ role: 'user', content: progress.reflection });
    }
    return initial;
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !settings?.deepseekKey) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chinese/reading/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterTitle,
          chapterContent: text.slice(0, 2000),
          firstImpression: progress?.firstImpression,
          conversationHistory: messages,
          userMessage,
          apiKey: settings.deepseekKey,
        }),
      });

      const data = await response.json();

      if (data.success && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，发生了错误。请稍后重试。' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，发生了错误。请稍后重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const allContent = messages.filter(m => m.role === 'user').map(m => m.content).join('\n\n');
    onComplete({ reflection: allContent });
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">💬 {chapterTitle} - 反思与对话</h3>

      {/* 回顾第一印象 */}
      {progress?.firstImpression && (
        <Card className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-amber-100">初读印象</Badge>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {progress.firstImpression}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 对话区域 */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="p-4 flex flex-col h-full">
          {/* 对话历史 */}
          <div className="flex-1 overflow-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-5xl mb-4">🤔</div>
                <p className="text-lg font-medium mb-2">准备好反思了吗？</p>
                <p className="text-sm text-muted-foreground max-w-md">
                  现在你已经完成了初读、探索、结构梳理和写作练习。<br />
                  让我们一起回顾和反思，加深对这篇课文的理解。
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {msg.role === 'assistant' ? (
                        <MessageCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs opacity-70">你</span>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* 输入区域 */}
          <div className="flex gap-2 pt-4 border-t">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的想法或问题..."
              className="min-h-[60px] flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 完成按钮 */}
      <div className="flex justify-end mt-4">
        <Button
          onClick={handleComplete}
          className="gap-2 bg-emerald-500 hover:bg-emerald-600"
        >
          <CheckCircle2 className="h-4 w-4" />
          完成学习
        </Button>
      </div>
    </div>
  );
}
