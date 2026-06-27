'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, Send, GraduationCap, Lightbulb, MessageCircle,
  CheckCircle, Loader2, Save, BookOpen
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { storage, StorageKeys } from '@/lib/storage';

interface KnowledgePoint {
  title: string;
  description: string;
  keyPoints: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function LearnPageContent() {
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId') || '';
  const chapterIndex = searchParams.get('chapterIndex') || '';
  const sectionIndex = searchParams.get('sectionIndex') || '';
  const { settings } = useSettingsStore();
  
  const [generating, setGenerating] = useState(false);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const currentPoint = knowledgePoints[currentPointIndex];

  // 获取 PDF 内容
  const getPdfContent = () => {
    const stored = storage.get<{ fullText?: string; full_text?: string }>(StorageKeys.PDF(subjectId));
    if (stored) {
      return stored.fullText || stored.full_text || '';
    }
    return '';
  };

  // 生成知识点列表
  const handleGenerateKnowledgePoints = async () => {
    if (!settings?.deepseekKey) {
      alert('请先在设置中配置 DeepSeek API Key');
      return;
    }
    const content = getPdfContent();
    if (!content) {
      alert('请先上传教材 PDF');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/generate-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content,
          apiKey: settings.deepseekKey
        }),
      });
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        return;
      }

      setKnowledgePoints(data.knowledgePoints || []);
      setCurrentPointIndex(0);
      setMessages([]);
    } catch (err) {
      alert('生成失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setGenerating(false);
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
          context: currentPoint?.description || '',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
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
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                    知识点学习
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {chapterIndex && `第 ${chapterIndex} 章`} {sectionIndex && sectionIndex}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                {knowledgePoints.length > 0 
                  ? `${currentPointIndex + 1} / ${knowledgePoints.length}` 
                  : '未开始'
                }
              </Badge>
              <Button variant="outline" size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                保存进度
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* 左侧 - 知识点列表 */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Card className="sticky top-24 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  知识点列表
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {knowledgePoints.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                      <BookOpen className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      点击下方按钮生成知识点
                    </p>
                    <Button 
                      onClick={handleGenerateKnowledgePoints}
                      disabled={generating}
                      size="sm"
                      className="gap-2"
                    >
                      {generating && <Loader2 className="h-4 w-4 animate-spin" />}
                      {generating ? '生成中...' : '生成知识点'}
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {knowledgePoints.map((point, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPointIndex(index)}
                        className={`w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          index === currentPointIndex 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            index === currentPointIndex
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                            {point.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 中间 - 知识点内容 */}
          <div className="lg:col-span-8 xl:col-span-9">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="content" className="gap-2">
                  <GraduationCap className="h-4 w-4" />
                  知识讲解
                </TabsTrigger>
                <TabsTrigger value="qa" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  问答互动
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content">
                <Card className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {currentPoint ? (
                          <>
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                              {currentPointIndex + 1}
                            </div>
                            {currentPoint.title}
                          </>
                        ) : (
                          <span className="text-slate-500">选择或生成知识点</span>
                        )}
                      </CardTitle>
                      {knowledgePoints.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={currentPointIndex === 0}
                            onClick={() => setCurrentPointIndex(prev => prev - 1)}
                          >
                            上一个
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={currentPointIndex === knowledgePoints.length - 1}
                            onClick={() => setCurrentPointIndex(prev => prev + 1)}
                          >
                            下一个
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {currentPoint ? (
                      <>
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {currentPoint.description}
                          </p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            关键要点
                          </h4>
                          <ul className="space-y-2">
                            {currentPoint.keyPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                          <GraduationCap className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                          开始学习
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                          点击左侧「生成知识点」按钮开始学习
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="qa">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      问答互动
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4 mb-4">
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-8">
                            <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              发送消息开始问答
                            </p>
                          </div>
                        ) : (
                          messages.map((msg, idx) => (
                            <div 
                              key={idx}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                msg.role === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-[10px] mt-1 ${
                                  msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                                }`}>
                                  {msg.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                        {loading && (
                          <div className="flex justify-start">
                            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
                              <div className="flex items-center gap-2 text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm">AI 思考中...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="输入你的问题..."
                        className="min-h-[80px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={loading || !userInput.trim()}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <LearnPageContent />
    </Suspense>
  );
}
