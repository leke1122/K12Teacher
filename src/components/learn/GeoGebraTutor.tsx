'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, Lightbulb, RotateCcw, Sparkles, Eye, Ruler, Puzzle, GitBranch, ArrowRight } from 'lucide-react';
import type { SelectedObject } from '@/types/geogebra';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Role = 'ai' | 'user';

interface Message {
  id: string;
  role: Role;
  content: string;
  type?: 'question' | 'hint' | 'feedback' | 'system';
  timestamp: number;
}

type HintLevel = 0 | 1 | 2 | 3;

interface TutorState {
  conversation: Message[];
  currentQuestion: string;
  hintLevel: HintLevel;
  isThinking: boolean;
  isComplete: boolean;
  keyPoints: string[];
  error: string | null;
}

// ---------------------------------------------------------------------------
// Quick Actions
// ---------------------------------------------------------------------------

type TutorQuickActionId = 'topic_intro' | 'conditions' | 'formulas' | 'approach' | 'solution' | 'observe' | 'measure' | 'relate' | 'change';

interface QuickAction {
  id: TutorQuickActionId;
  label: string;
  icon: React.ReactNode;
  prompt: string;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  // 题目录播模式
  {
    id: 'topic_intro',
    label: '📖 题目概述',
    icon: <Sparkles className="h-4 w-4" />,
    prompt: '请介绍这道题的核心考点和解题方向',
    description: '了解题目考什么、难点在哪',
  },
  {
    id: 'conditions',
    label: '📋 已知条件',
    icon: <Eye className="h-4 w-4" />,
    prompt: '请从图中提取所有已知条件，包括数值、位置关系、特殊角等',
    description: '把题目中的条件逐一列出来',
  },
  {
    id: 'formulas',
    label: '📐 相关公式',
    icon: <Ruler className="h-4 w-4" />,
    prompt: '这道题需要用到哪些公式或定理？请列出并简要说明每个公式的意义',
    description: '解题需要用到的公式和定理',
  },
  {
    id: 'approach',
    label: '🧠 解题思路',
    icon: <GitBranch className="h-4 w-4" />,
    prompt: '请给出这道题的完整解题思路，用苏格拉底式提问引导学生一步步自己想出来',
    description: '先说思路，再引导你自己推导',
  },
  {
    id: 'solution',
    label: '✅ 逐步求解',
    icon: <ArrowRight className="h-4 w-4" />,
    prompt: '请逐步求解这道题，每一步都解释为什么这样做。完成后引导学生总结关键步骤。',
    description: '完整解答，附带每步解释',
  },
  // 几何对象模式（保持原有）
  {
    id: 'observe',
    label: '🔍 观察特征',
    icon: <Eye className="h-4 w-4" />,
    prompt: '它有什么特征？',
    description: '观察选中对象的属性',
  },
  {
    id: 'measure',
    label: '📐 能测量什么？',
    icon: <Ruler className="h-4 w-4" />,
    prompt: '这个对象可以测量哪些量？',
    description: '了解可测量的数据',
  },
  {
    id: 'relate',
    label: '🧩 相关部分',
    icon: <Puzzle className="h-4 w-4" />,
    prompt: '它和哪些部分相关？',
    description: '分析与其他对象的关系',
  },
  {
    id: 'change',
    label: '🤔 改变会怎样',
    icon: <GitBranch className="h-4 w-4" />,
    prompt: '如果改变参数会怎样？',
    description: '探索参数变化的影响',
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export interface GeoGebraTutorProps {
  selectedObjects: SelectedObject[];
  problemImage?: string; // base64 of uploaded problem image
  onExecuteCommand?: (command: { action: string; target: string; params: Record<string, unknown> }) => void;
  className?: string;
  apiKey?: string;
  /** 分析状态：idle | analyzing | rendering | ready */
  analysisStep?: 'idle' | 'uploading' | 'analyzing' | 'rendering' | 'ready';
}

export function GeoGebraTutor({
  selectedObjects,
  problemImage,
  onExecuteCommand,
  className = '',
  apiKey,
  analysisStep = 'idle',
}: GeoGebraTutorProps) {
  const [state, setState] = useState<TutorState>({
    conversation: [],
    currentQuestion: '',
    hintLevel: 0,
    isThinking: false,
    isComplete: false,
    keyPoints: [],
    error: null,
  });

  const [input, setInput] = useState('');
  const [lastUsedActionId, setLastUsedActionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initializedRef = useRef(false);
  const problemImageRef = useRef<string | undefined>(undefined);

  const selectedObjectNames = selectedObjects.map((o) => o.label || o.id).join('、') || '图形';

  // Keep problemImage ref in sync
  useEffect(() => {
    if (problemImage) {
      problemImageRef.current = problemImage;
    }
  }, [problemImage]);

  // ---------------------------------------------------------------------------
  // Scroll to bottom when conversation updates
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.conversation]);

  // ---------------------------------------------------------------------------
  // Auto-start when image is ready (analysis complete)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (analysisStep !== 'ready') return;
    if (initializedRef.current) return;
    if (!problemImageRef.current) return;

    initializedRef.current = true;
    // Auto-start with topic introduction
    startTutor('topic_intro');
  }, [analysisStep]);

  // ---------------------------------------------------------------------------
  // Cleanup
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Start / Continue Tutor
  // ---------------------------------------------------------------------------
  const startTutor = useCallback(
    async (quickActionId?: TutorQuickActionId, overridePrompt?: string) => {
      // 题目录播模式：必须要有题目光
      const topicActionIds: TutorQuickActionId[] = ['topic_intro', 'conditions', 'formulas', 'approach', 'solution'];
      const isTopicMode = quickActionId && topicActionIds.includes(quickActionId);
      if (isTopicMode && !problemImageRef.current) return;

      // 对象模式：选中了对象才能继续
      if (!isTopicMode && selectedObjects.length === 0) return;

      setState((prev) => ({
        ...prev,
        isThinking: true,
        error: null,
        isComplete: false,
        keyPoints: [],
      }));

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // 题目录播模式用题目光，对象模式从 viewer 截图
        const imageBase64 = problemImageRef.current || (await captureScreenshotFromViewer());

        const body: Record<string, unknown> = {
          mode: 'initial',
          imageBase64,
          history: [],
          hintLevel: 0,
        };

        if (isTopicMode) {
          body.topicMode = true;
          body.selectedObjects = selectedObjects.length > 0 ? selectedObjects : [];
          if (overridePrompt) {
            body.quickAction = overridePrompt;
          } else if (quickActionId) {
            const action = QUICK_ACTIONS.find((a) => a.id === quickActionId);
            if (action) body.quickAction = action.prompt;
          }
        } else {
          body.selectedObjects = selectedObjects;
          if (overridePrompt) {
            body.quickAction = overridePrompt;
          } else if (quickActionId) {
            const action = QUICK_ACTIONS.find((a) => a.id === quickActionId);
            if (action) body.quickAction = action.prompt;
          }
        }

        const response = await fetch('/api/ai/geometry-tutor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'x-qwen-api-key': apiKey } : {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `请求失败 (${response.status})`);
        }

        const result = (await response.json()) as {
          success: boolean;
          feedback?: string;
          nextQuestion?: string;
          hintLevel?: number;
          isComplete?: boolean;
          geogebraCommands?: Array<{ action: string; target: string; params: Record<string, unknown>; reason: string }>;
          keyPoints?: string[];
          error?: string;
        };

        if (!result.success) {
          throw new Error(result.error || 'AI 返回失败');
        }

        const selectedName = selectedObjects.map((o) => o.label || o.id).join('、') || '图形';
        const action = quickActionId ? QUICK_ACTIONS.find((a) => a.id === quickActionId) : null;

        let systemContent: string;
        if (isTopicMode && action) {
          systemContent = result.feedback || result.nextQuestion || '';
        } else if (isTopicMode) {
          systemContent = result.nextQuestion || '你想了解这道题的什么方面？';
        } else {
          systemContent = `你选中了【${selectedName}】，${result.nextQuestion || '你想了解它的什么？'}`;
        }

        const systemMessage: Message = {
          id: crypto.randomUUID(),
          role: 'ai',
          content: systemContent,
          type: result.nextQuestion ? 'question' : 'feedback',
          timestamp: Date.now(),
        };

        const nextQuestionMsg: Message | null = !isTopicMode && result.nextQuestion
          ? {
              id: crypto.randomUUID(),
              role: 'ai',
              content: result.nextQuestion,
              type: 'question',
              timestamp: Date.now(),
            }
          : null;

        setState((prev) => ({
          ...prev,
          conversation: [...prev.conversation, systemMessage, ...(nextQuestionMsg ? [nextQuestionMsg] : [])],
          currentQuestion: result.nextQuestion || prev.currentQuestion,
          hintLevel: (result.hintLevel ?? 0) as HintLevel,
          isThinking: false,
          isComplete: result.isComplete ?? false,
          keyPoints: result.keyPoints ?? [],
          error: null,
        }));

        setLastUsedActionId(quickActionId || null);

        if (result.geogebraCommands?.length) {
          for (const cmd of result.geogebraCommands) {
            onExecuteCommand?.(cmd);
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;

        const message = err instanceof Error ? err.message : '未知错误';
        setState((prev) => ({
          ...prev,
          isThinking: false,
          error: message,
        }));
      }
    },
    [selectedObjects, apiKey, onExecuteCommand],
  );

  // ---------------------------------------------------------------------------
  // Handle user answer
  // ---------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (text: string) => {
      if (!text.trim() || state.isThinking) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        conversation: [...prev.conversation, userMessage],
        isThinking: true,
        error: null,
      }));
      setInput('');

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        // 题目录播模式用题目光，对象模式从 viewer 截图
        const imageBase64 = problemImageRef.current || (await captureScreenshotFromViewer());

        const history = [...state.conversation, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/ai/geometry-tutor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'x-qwen-api-key': apiKey } : {}),
          },
          body: JSON.stringify({
            mode: 'answer',
            imageBase64,
            selectedObjects,
            question: state.currentQuestion,
            studentAnswer: text.trim(),
            hintLevel: state.hintLevel,
            history,
            topicMode: !!problemImageRef.current,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `请求失败 (${response.status})`);
        }

        const result = (await response.json()) as {
          success: boolean;
          feedback?: string;
          nextQuestion?: string;
          hintLevel?: number;
          isComplete?: boolean;
          geogebraCommands?: Array<{ action: string; target: string; params: Record<string, unknown>; reason: string }>;
          keyPoints?: string[];
          error?: string;
        };

        if (!result.success) {
          throw new Error(result.error || 'AI 返回失败');
        }

        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: 'ai',
          content: result.feedback || '',
          type: result.isComplete ? 'feedback' : (result.hintLevel ?? 0) > state.hintLevel ? 'hint' : 'feedback',
          timestamp: Date.now(),
        };

        const nextQuestionMsg: Message | null = result.nextQuestion
          ? {
              id: crypto.randomUUID(),
              role: 'ai',
              content: result.nextQuestion,
              type: 'question',
              timestamp: Date.now(),
            }
          : null;

        setState((prev) => ({
          ...prev,
          conversation: nextQuestionMsg
            ? [...prev.conversation, aiMessage, nextQuestionMsg]
            : [...prev.conversation, aiMessage],
          currentQuestion: result.nextQuestion || prev.currentQuestion,
          hintLevel: (result.hintLevel ?? prev.hintLevel) as HintLevel,
          isThinking: false,
          isComplete: result.isComplete ?? false,
          keyPoints: result.keyPoints ?? [],
          error: null,
        }));

        if (result.geogebraCommands?.length) {
          for (const cmd of result.geogebraCommands) {
            onExecuteCommand?.(cmd);
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;

        const message = err instanceof Error ? err.message : '未知错误';
        setState((prev) => ({
          ...prev,
          isThinking: false,
          error: message,
        }));
      }
    },
    [state, selectedObjects, apiKey, onExecuteCommand],
  );

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------
  const handleReset = useCallback(() => {
    abortControllerRef.current?.abort();
    initializedRef.current = false;

    setState({
      conversation: [],
      currentQuestion: '',
      hintLevel: 0,
      isThinking: false,
      isComplete: false,
      keyPoints: [],
      error: null,
    });
    setInput('');
    setLastUsedActionId(null);

    // 如果有题目光且已分析完成，重新开始
    if (problemImageRef.current && analysisStep === 'ready') {
      setTimeout(() => {
        initializedRef.current = false;
        startTutor('topic_intro');
      }, 100);
    }
  }, [analysisStep, startTutor]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const renderLatex = (text: string) => {
    // Simple LaTeX rendering using KaTeX via CDN-style approach
    // For full rendering, the app should have KaTeX CSS loaded globally
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]*?\$)/g);
    return parts.map((part, i) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const formula = part.slice(2, -2).trim();
        return (
          <div key={i} className="my-2 overflow-x-auto">
            <span className="block text-center font-serif text-lg">{formula}</span>
          </div>
        );
      }
      if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1).trim();
        return (
          <span key={i} className="font-serif italic">
            {formula}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderMessageContent = (content: string) => {
    return <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{renderLatex(content)}</div>;
  };

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  if (selectedObjects.length === 0 && state.conversation.length === 0) {
    // 题目录播模式：已上传图片
    if (problemImageRef.current) {
      const topicActions = QUICK_ACTIONS.filter((a) =>
        ['topic_intro', 'conditions', 'formulas', 'approach', 'solution'].includes(a.id)
      );
      return (
        <Card className={`flex flex-col h-full ${className}`}>
          <CardHeader className="pb-3 pt-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              AI 几何导师
            </CardTitle>
            <p className="text-xs text-muted-foreground">上传了题目图片，选择一个方向开始学习</p>
          </CardHeader>
          <Separator />
          <CardContent className="flex-1 overflow-y-auto pt-4">
            <div className="space-y-2">
              {topicActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-3"
                  onClick={() => startTutor(action.id)}
                  disabled={state.isThinking}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="shrink-0 mt-0.5">{action.icon}</div>
                    <div>
                      <div className="font-medium text-sm">{action.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{action.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={`flex flex-col h-full ${className}`}>
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            AI 几何导师
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          请先上传题目图片进入 AI 模式
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-3 pt-4 space-y-1">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          AI 几何导师
        </CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {problemImageRef.current ? (
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
              题目录播模式
            </span>
          ) : selectedObjects.length > 0 ? (
            <>
              <span>选中：</span>
              <span className="font-medium text-foreground">{selectedObjectNames}</span>
            </>
          ) : (
            <span>等待上传题目</span>
          )}
          {state.hintLevel > 0 && (
            <span className="ml-auto flex items-center gap-1 text-amber-600">
              <Lightbulb className="h-3.5 w-3.5" />
              提示级别 {state.hintLevel}
            </span>
          )}
        </div>
      </CardHeader>

      <Separator />

      {/* Conversation */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {state.conversation.length === 0 && !state.isThinking && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <p>你选中了【{selectedObjectNames}】</p>
              <p className="mt-1">你想了解它的什么？</p>
            </div>
          )}

          {state.conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md'
                }`}
              >
                {msg.type === 'hint' && msg.role === 'ai' && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs mb-1">
                    <Lightbulb className="h-3.5 w-3.5" />
                    提示
                  </div>
                )}
                {msg.type === 'question' && msg.role === 'ai' && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    引导问题
                  </div>
                )}
                {renderMessageContent(msg.content)}
              </div>
            </div>
          ))}

          {state.isThinking && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">思考中...</span>
                </div>
              </div>
            </div>
          )}

          {state.isComplete && state.keyPoints.length > 0 && (
            <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 p-4 space-y-2">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">🎉 知识点总结</p>
              {state.keyPoints.map((point, i) => (
                <p key={i} className="text-sm text-green-700 dark:text-green-400">
                  {i + 1}. {renderLatex(point)}
                </p>
              ))}
            </div>
          )}

          {state.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {state.error}
            </div>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Quick Actions */}
      {!state.isComplete && (
        <div className="px-4 pt-3 space-y-2">
          {(() => {
            const isTopicMode = !!problemImageRef.current;
            const topicActions = QUICK_ACTIONS.filter((a) =>
              ['topic_intro', 'conditions', 'formulas', 'approach', 'solution'].includes(a.id)
            );
            const objectActions = QUICK_ACTIONS.filter((a) =>
              ['observe', 'measure', 'relate', 'change'].includes(a.id)
            );

            const currentActions = isTopicMode ? topicActions : objectActions;

            // 题目录播模式：最多显示5个带描述的按钮
            if (isTopicMode) {
              return (
                <div className="space-y-1.5">
                  {currentActions.map((action) => (
                    <Button
                      key={action.id}
                      variant={lastUsedActionId === action.id ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2.5 px-3"
                      onClick={() => startTutor(action.id as TutorQuickActionId)}
                      disabled={state.isThinking}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="shrink-0">{action.icon}</span>
                        <div className="text-left">
                          <div className="text-sm">{action.label}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              );
            }

            // 对象模式：前1条消息时显示4个快捷按钮
            if (state.conversation.length <= 1) {
              return (
                <div className="flex flex-wrap gap-2">
                  {currentActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => startTutor(action.id as TutorQuickActionId)}
                      disabled={state.isThinking}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              );
            }

            return null;
          })()}
        </div>
      )}

      {/* Input Area */}
      {!state.isComplete && (
        <div className="p-4 space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(input);
                }
              }}
              placeholder="输入你的思考..."
              className="resize-none min-h-[60px] text-sm"
              disabled={state.isThinking}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleSubmit(input)}
                disabled={!input.trim() || state.isThinking}
                size="icon"
                className="h-[60px] w-10"
              >
                {state.isThinking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Complete / Reset */}
      {state.isComplete && (
        <div className="p-4">
          <Button variant="outline" className="w-full gap-2" onClick={handleReset} disabled={state.isThinking}>
            <RotateCcw className="h-4 w-4" />
            重新开始
          </Button>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helper: capture screenshot from the viewer
// ---------------------------------------------------------------------------

function captureScreenshotFromViewer(): Promise<string> {
  try {
    const viewerIframe = document.querySelector('iframe[src*="geogebra"]') as HTMLIFrameElement | null;
    if (!viewerIframe?.contentWindow) {
      return Promise.resolve('');
    }

    const win = viewerIframe.contentWindow as unknown as Record<string, unknown>;
    const capture = win.captureScreenshot;

    if (typeof capture === 'function') {
      const result = capture() as { base64?: string } | null;
      if (result?.base64) return Promise.resolve(result.base64);
    }
  } catch {
    // ignore
  }

  return Promise.resolve('');
}
