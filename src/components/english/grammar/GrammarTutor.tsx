'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Sparkles, X } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import type { GrammarPoint } from '@/types/grammar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface GrammarTutorProps {
  grammarPoint: GrammarPoint;
  onClose?: () => void;
}

const TUTOR_SYSTEM = `你是一位严谨且善于启发的高中英语语法老师，擅长用简单易懂的方式讲解语法，擅长生活类比。

## 讲解步骤（请严格遵循）：
1. **一句话通俗解释** — 用最通俗易懂的一句话解释这个语法（生活化类比）
2. **展示结构公式** — 用中文拆解公式的每个部分
3. **典型例句** — 给出3个典型例句，并分析每个例句的语法结构
4. **提问检查理解** — 根据这个语法点，提出1-2个问题检查学生是否理解
5. **常见考点** — 指出高考中最常考的方向
6. **固定搭配** — 列出与该语法相关的固定搭配
7. **练习引导** — 给出3道练习题（填空/改错/翻译），先让学生思考，不要直接给答案

## 格式要求：
- 使用清晰的分层标题（### 标题名）
- 例句用 **例句** 和 *翻译* 标注
- 练习题编号列出，不给答案，引导学生思考
- 语气亲切，鼓励学生思考
- 如果学生有问题，耐心解答`;

export function GrammarTutor({ grammarPoint, onClose }: GrammarTutorProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { settings } = useSettingsStore();

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始欢迎语
  useEffect(() => {
    const initMessage = `👋 你好！今天我们来学习 **${grammarPoint.name}**。

让我先为你系统讲解这个知识点，请仔细阅读下面的讲解内容，然后回答我最后提出的问题。

${grammarPoint.explanation.simple}

### 📐 结构公式

\`\`\`
${grammarPoint.structure.formula}
\`\`\`

**公式拆解：**
${pointComponents(grammarPoint)}

${grammarPoint.explanation.detailed}

### 🏠 生活类比
${grammarPoint.explanation.analogy}

### 💬 提问
在学习例句之前，请先思考：${grammarPoint.examPoints[0]?.point || '这个语法点的核心规则是什么？'}

你可以随时向我提问，我会耐心解答！`;
    setMessages([{ role: 'assistant', content: initMessage }]);
  }, [grammarPoint.id]);

  const pointComponents = (gp: GrammarPoint) => {
    return gp.structure.components.map((c, i) => `${i + 1}. ${c}`).join('\n');
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    setError(null);

    try {
      const apiKey = settings?.deepseekKey;
      if (!apiKey) {
        setError('请先在设置页面配置 DeepSeek API Key');
        setLoading(false);
        return;
      }

      // 构建上下文
      const contextMsgs = messages.slice(-10); // 保留最近10条
      const fullMessages = [
        { role: 'system', content: `${TUTOR_SYSTEM}\n\n## 当前语法点\n- 名称：${grammarPoint.name}\n- 公式：${grammarPoint.structure.formula}\n- 考点：${grammarPoint.examPoints.map(e => e.point).join('；')}\n- 固定搭配：${grammarPoint.fixedCombinations.map(c => c.pattern).join('；')}` },
        ...contextMsgs.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMsg },
      ];

      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: fullMessages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || '请求失败');
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      setMessages(prev => [...prev, { role: 'assistant', content }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送失败');
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, settings, grammarPoint]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-base">AI 语法讲解 · {grammarPoint.name}</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1" style={{ maxHeight: '60vh' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg p-3 text-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-slate-500">正在思考...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                {error}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 输入框 */}
        <div className="flex-shrink-0">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题，按 Enter 发送..."
            className="min-h-[60px] resize-none mb-2"
            disabled={loading}
          />
          <Button
            className="w-full gap-2"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? '思考中...' : '发送'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
