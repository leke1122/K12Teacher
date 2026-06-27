'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  BookText, MessageCircle, Loader2, Save, 
  Edit3, CheckCircle, Lightbulb
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { storage, StorageKeys } from '@/lib/storage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function TextbookPageContent() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId') || '';
  const chapterIndex = searchParams.get('chapterIndex') || '';
  const sectionIndex = searchParams.get('sectionIndex') || '';
  const { settings } = useSettingsStore();
  
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pages, setPages] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [guidedQuestion, setGuidedQuestion] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [completedPages, setCompletedPages] = useState<number[]>([]);

  // 获取 PDF 内容
  const getPdfContent = () => {
    const stored = storage.get<{ fullText?: string; full_text?: string }>(StorageKeys.PDF(subjectId));
    if (stored) {
      return stored.fullText || stored.full_text || '';
    }
    return '';
  };

  // 从本地存储加载 PDF 内容
  useEffect(() => {
    const content = getPdfContent();
    if (content) {
      // 按页分割内容
      const pageMatches = content.match(/\n--- 第 (\d+) 页 ---\n/g);
      if (pageMatches) {
        const pageContents: string[] = [];
        const parts = content.split(/\n--- 第 \d+ 页 ---\n/);
        parts.forEach((part: string, index: number) => {
          if (index > 0 && part.trim()) {
            pageContents.push(part.trim());
          }
        });
        setPages(pageContents);
        setTotalPages(pageContents.length);
      } else {
        // 如果没有页码标记，按固定字符数分割
        const chunkSize = 2000;
        const chunks: string[] = [];
        for (let i = 0; i < content.length; i += chunkSize) {
          chunks.push(content.slice(i, i + chunkSize));
        }
        setPages(chunks);
        setTotalPages(chunks.length);
      }
    }
  }, [subjectId]);

  // 更新当前页内容
  useEffect(() => {
    if (pages.length > 0 && currentPage <= pages.length) {
      setCurrentContent(pages[currentPage - 1] || '');
      // 生成引导问题
      generateGuidedQuestion(pages[currentPage - 1] || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pages]);

  // 生成引导问题
  const generateGuidedQuestion = async (content: string) => {
    if (!settings?.deepseekKey) {
      setGuidedQuestion('请先在设置中配置 DeepSeek API Key');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          apiKey: settings.deepseekKey
        }),
      });
      const data = await response.json();
      
      if (data.error) {
        setGuidedQuestion(null);
        return;
      }

      setGuidedQuestion(data.question);
      setShowHint(false);
    } catch (err) {
      console.error('生成问题失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!userInput.trim() || !settings?.deepseekKey) return;

    const userMessage: Message = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userInput,
          context: currentContent,
          apiKey: settings.deepseekKey
        }),
      });
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      alert('发送失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 标记页面完成
  const handleMarkComplete = () => {
    if (!completedPages.includes(currentPage)) {
      setCompletedPages(prev => [...prev, currentPage]);
    }
  };

  const progressPercent = totalPages > 0 ? Math.round((completedPages.length / totalPages) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={`/subjects/${subjectId}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  返回
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <BookText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    还原课本
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {chapterIndex && `第 ${chapterIndex} 章`} {sectionIndex && sectionIndex}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Progress value={progressPercent} className="w-32 h-2" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {completedPages.length}/{totalPages}
                </span>
              </div>
              <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20">
                第 {currentPage} 页
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                保存
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* 左侧 - 课本内容 */}
          <div className="lg:col-span-8 xl:col-span-8">
            <Card className="shadow-sm overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
              <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookText className="h-4 w-4 text-emerald-600" />
                    课本原文
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-500 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading && !currentContent ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-base">
                      {currentContent}
                    </p>
                  </div>
                )}

                {/* 引导问答区域 */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="h-5 w-5 text-amber-600" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        思考问题
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                      {guidedQuestion || '点击「生成问题」获取思考问题'}
                    </p>
                    {guidedQuestion && !showHint && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowHint(true)}
                        className="text-amber-600"
                      >
                        显示提示
                      </Button>
                    )}
                    {showHint && (
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                        提示：请结合上下文思考这段内容的核心含义
                      </div>
                    )}
                  </div>
                </div>

                {/* 底部操作 */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    上一页
                  </Button>
                  <Button
                    variant={completedPages.includes(currentPage) ? "default" : "outline"}
                    onClick={handleMarkComplete}
                    className={`gap-2 ${completedPages.includes(currentPage) ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                  >
                    <CheckCircle className="h-4 w-4" />
                    {completedPages.includes(currentPage) ? '已完成' : '标记完成'}
                  </Button>
                  <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="gap-2"
                  >
                    下一页
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧 - 问答互动 */}
          <div className="lg:col-span-4 xl:col-span-4">
            <Card className="sticky top-24 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  问答互动
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[500px]">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        输入问题开始互动学习
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                          msg.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">AI 思考中...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="输入问题..."
                    className="min-h-[60px] text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={loading || !userInput.trim()}
                  className="mt-2 w-full gap-2"
                  size="sm"
                >
                  <Edit3 className="h-4 w-4" />
                  发送
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TextbookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <TextbookPageContent />
    </Suspense>
  );
}
