'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, BookOpen, Loader2, Upload, FileText, ChevronRight,
  Brain, MessageCircle, Send, Sparkles, Lightbulb, Star,
  CheckCircle2, AlertCircle, BookMarked, Menu, X, ChevronDown
} from 'lucide-react';
import { useTextbooks } from '@/hooks/useTextbooks';

interface MustRememberItem {
  text: string;
  level: '核心' | '重要' | '基础';
}

interface Section {
  id: string;
  title: string;
  content: string;
  mustRemember: MustRememberItem[];
  thinkQuestion: string;
  referenceAnswer: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 历史教材演示数据
const DEMO_SECTIONS: Section[] = [
  {
    id: 'intro',
    title: '本课导入',
    content: '历史学习的关键是理解事件之间的因果关系，把握历史发展的脉络。通过本课学习，我们将了解重要的历史事件、人物及其历史意义。',
    mustRemember: [
      { text: '历史学习要把握时间脉络', level: '核心' },
      { text: '理解历史事件的因果关系', level: '重要' },
    ],
    thinkQuestion: '本课内容与之前学过的历史有什么联系？',
    referenceAnswer: '历史是连续发展的，每个时期都有其特定的社会背景和历史特征。理解这种连续性有助于我们更好地把握历史发展的规律。',
  },
];

export default function HistoryTextbookPage() {
  const router = useRouter();
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [showThinking, setShowThinking] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('learn');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { textbooks, activeTextbook, chapters, loading: textbooksLoading } = useTextbooks('history');

  // 当前使用的章节列表
  const [pdfSections, setPdfSections] = useState<Section[]>([]);
  const sections = pdfSections.length > 0 ? pdfSections : DEMO_SECTIONS;

  useEffect(() => {
    if (!textbooksLoading) {
      setLoading(false);
    }
  }, [textbooksLoading]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 当选择单元变化时，加载对应内容
  useEffect(() => {
    if (selectedUnit && activeTextbook) {
      loadPdfSections(selectedUnit);
    }
  }, [selectedUnit, activeTextbook]);

  const loadPdfSections = async (unitId: string) => {
    setPdfLoading(true);
    setPdfSections([]);
    setActiveSectionIndex(0);
    
    try {
      // 构建页码范围（使用 sectionIndex 作为唯一标识）
      let startPage = 1;
      let endPage = 50;
      
      // 遍历所有章节找到匹配的课时
      for (const chapter of chapters) {
        if (chapter.sections) {
          const matchedSection = chapter.sections.find(s => 
            `${s.sectionIndex}_${s.sectionTitle}` === unitId ||
            s.sectionIndex === unitId ||
            s.sectionTitle === unitId
          );
          if (matchedSection) {
            startPage = matchedSection.pages?.start || matchedSection.pages?.fileStart || 1;
            endPage = matchedSection.pages?.end || matchedSection.pages?.fileEnd || 50;
            break;
          }
        }
      }

      // 调用 API 获取教材内容
      const res = await fetch('/api/history/textbook/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: unitId,
          startPage,
          endPage,
        }),
      });
      
      const json = await res.json();
      
      if (!json.success || !json.text) {
        console.log('[历史课本还原] 未获取到内容');
        setPdfLoading(false);
        return;
      }

      // 拆分段落
      const paragraphs = splitParagraphsSmart(json.text);
      const extracted: Section[] = paragraphs.map((para, idx) => ({
        id: `pdf-${idx}`,
        title: `第 ${idx + 1} 段`,
        content: para,
        mustRemember: extractKeyPoints(para),
        thinkQuestion: generateThinkQuestion(para),
        referenceAnswer: '',
      }));

      if (extracted.length > 0) {
        console.log(`[历史课本还原] 加载 ${extracted.length} 个段落`);
        setPdfSections(extracted);
      }
    } catch (e) {
      console.error('[历史课本还原] 加载失败:', e);
    } finally {
      setPdfLoading(false);
    }
  };

  function splitParagraphsSmart(text: string): string[] {
    if (!text) return [];
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    let paragraphs = normalized
      .split(/\n\s*\n/)
      .map(p => p.replace(/\n/g, ' ').trim())
      .filter(p => p.length > 5);

    if (paragraphs.length >= 3) return paragraphs;

    paragraphs = normalized
      .split(/\n/)
      .map(p => p.trim())
      .filter(p => p.length > 5);

    return paragraphs.length > 0 ? paragraphs : [text.trim()];
  }

  function extractKeyPoints(para: string): MustRememberItem[] {
    const keyPoints: MustRememberItem[] = [];
    const concepts = ['建立', '统一', '改革', '战争', '革命', '条约', '法令', '制度'];
    
    for (const concept of concepts) {
      if (para.includes(concept) && keyPoints.length < 3) {
        const idx = para.indexOf(concept);
        const start = Math.max(0, idx - 5);
        const end = Math.min(para.length, idx + concept.length + 15);
        const snippet = para.slice(start, end).replace(/\n/g, ' ');
        if (!keyPoints.find(k => k.text === snippet)) {
          keyPoints.push({ text: snippet, level: '重要' });
        }
      }
    }
    
    if (keyPoints.length === 0 && para.length > 20) {
      keyPoints.push({ text: para.substring(0, 50) + '...', level: '基础' });
    }
    
    return keyPoints;
  }

  function generateThinkQuestion(para: string): string {
    if (para.includes('建立')) return '这一历史事件的建立有什么重要意义？';
    if (para.includes('统一')) return '统一对当时的社会产生了什么影响？';
    if (para.includes('战争')) return '这场战争的起因和结果是什么？';
    return '请仔细阅读上文，思考这些措施的历史意义是什么？';
  }

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user' as const, content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/history/guided-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          sectionId: sections[activeSectionIndex]?.id || 'intro',
          message: currentInput,
          history: chatMessages,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: json.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我暂时无法回答，请稍后再试。' }]);
      }
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '网络错误，请检查连接后重试。' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const currentSection = sections[activeSectionIndex];
  const progress = sections.length > 0
    ? Math.round(((activeSectionIndex + 1) / sections.length) * 100)
    : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-amber-50 via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30">
      {/* 顶部导航 */}
      <header className="z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/subjects/history">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-50 text-amber-600 text-xs">
                逐段讲解
              </Badge>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push('/subjects/history')}>
                <Upload className="h-4 w-4" />
                上传教材
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 章节选择器 */}
        <Card className="border-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">选择单元与课时</span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> 加载中...
              </div>
            ) : !activeTextbook ? (
              <div className="text-center py-4">
                <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">请先在历史学科页面上传教材</p>
                <Button size="sm" onClick={() => router.push('/subjects/history')}>
                  去上传
                </Button>
              </div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-4">
                <AlertCircle className="h-10 w-10 text-amber-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">教材未提取章节，请先提取章节</p>
                <Button size="sm" onClick={() => router.push('/subjects/history')}>
                  去提取章节
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {chapters.map((chapter) => (
                  <div key={chapter.chapterIndex} className="space-y-2">
                    <div className="font-medium text-sm text-slate-700 dark:text-slate-200 flex items-center gap-2">
                      <span className="text-amber-500">📖</span>
                      第{chapter.chapterIndex}单元：{chapter.chapterTitle}
                    </div>
                    {chapter.sections && chapter.sections.length > 0 && (
                      <div className="flex flex-wrap gap-2 ml-6">
                        {chapter.sections.map((section) => (
                          <button
                            key={section.sectionIndex}
                            onClick={() => {
                              setSelectedUnit(section.sectionIndex + '_' + section.sectionTitle);
                              setActiveSectionIndex(0);
                              setShowThinking(false);
                              setShowAnswer(false);
                              setUserAnswer('');
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                              selectedUnit === section.sectionIndex + '_' + section.sectionTitle
                                ? 'border-amber-400 bg-amber-50 text-amber-700 font-medium'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:border-amber-200'
                            }`}
                          >
                            {section.sectionIndex} {section.sectionTitle}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 章节导航（当已选择单元时显示） */}
        {selectedUnit && sections.length > 0 && (
          <>
            <Card className="border-amber-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">章节内容</span>
                    {pdfLoading && <Loader2 className="h-4 w-4 animate-spin text-amber-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{activeSectionIndex + 1}/{sections.length}</span>
                    <Progress value={progress} className="w-20 h-1.5" />
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {sections.map((sec, idx) => (
                    <button
                      key={sec.id}
                      onClick={() => { setActiveSectionIndex(idx); setShowThinking(false); setShowAnswer(false); setUserAnswer(''); }}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        idx === activeSectionIndex
                          ? 'border-amber-400 bg-amber-50 text-amber-700 font-medium'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 hover:border-amber-200'
                      }`}
                    >
                      {idx + 1}. {sec.title}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 学习主区域 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="learn" className="gap-1 text-xs">
                  <BookOpen className="h-3 w-3" /> 原文
                </TabsTrigger>
                <TabsTrigger value="think" className="gap-1 text-xs">
                  <Brain className="h-3 w-3" /> 思考
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-1 text-xs">
                  <MessageCircle className="h-3 w-3" /> 问答
                </TabsTrigger>
              </TabsList>

              {/* 原文页 */}
              <TabsContent value="learn" className="space-y-4">
                <Card className="border-amber-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-amber-700 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {currentSection?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 原文内容 */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {currentSection?.content}
                      </p>
                    </div>

                    {/* 必背内容 */}
                    {currentSection?.mustRemember && currentSection.mustRemember.length > 0 && (
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="h-4 w-4 text-pink-500" />
                          <span className="text-sm font-semibold text-pink-700 dark:text-pink-300">📝 必背内容</span>
                        </div>
                        <div className="space-y-2">
                          {currentSection.mustRemember.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                item.level === '核心' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
                                item.level === '重要' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' :
                                'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                              }`}>
                                {item.level === '核心' ? '核' : item.level === '重要' ? '重' : '基'}
                              </span>
                              <p className={`text-sm ${
                                item.level === '核心' ? 'text-red-700 dark:text-red-300 font-medium' :
                                'text-slate-700 dark:text-slate-300'
                              }`}>{item.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => { setActiveTab('think'); setShowThinking(true); }}
                      >
                        <Brain className="h-4 w-4" /> 开始思考
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={() => {
                          if (activeSectionIndex < sections.length - 1) {
                            setActiveSectionIndex(i => i + 1);
                            setShowThinking(false);
                            setShowAnswer(false);
                            setUserAnswer('');
                          }
                        }}
                      >
                        下一段 <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 思考页 */}
              <TabsContent value="think" className="space-y-4">
                <Card className="border-purple-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-purple-700 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      引导思考
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                      请先思考以下问题，写下你的答案，然后点击查看参考答案进行对比。
                    </p>

                    <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-bold">
                          Q
                        </span>
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          {currentSection?.thinkQuestion}
                        </p>
                      </div>

                      <Textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="写下你的思考答案..."
                        className="min-h-[100px] text-sm"
                      />

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => setShowAnswer(!showAnswer)}
                        >
                          <Lightbulb className="h-4 w-4" />
                          {showAnswer ? '收起答案' : '查看参考答案'}
                        </Button>
                      </div>

                      {showAnswer && (
                        <div className="mt-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">参考答案</span>
                          </div>
                          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                            {currentSection?.referenceAnswer}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (activeSectionIndex > 0) {
                            setActiveSectionIndex(i => i - 1);
                            setShowThinking(false);
                            setShowAnswer(false);
                            setUserAnswer('');
                          }
                        }}
                        disabled={activeSectionIndex === 0}
                      >
                        <ChevronRight className="h-4 w-4 rotate-180" /> 上一段
                      </Button>
                      <Button
                        size="sm"
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        onClick={() => {
                          if (activeSectionIndex < sections.length - 1) {
                            setActiveSectionIndex(i => i + 1);
                            setShowThinking(false);
                            setShowAnswer(false);
                            setUserAnswer('');
                          }
                        }}
                        disabled={activeSectionIndex === sections.length - 1}
                      >
                        下一段 <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 问答页 */}
              <TabsContent value="chat">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle className="h-5 w-5 text-blue-500" />
                      <h3 className="text-sm font-semibold">AI 导师问答</h3>
                      <Badge variant="outline" className="text-xs ml-auto bg-blue-50">
                        当前章节：{currentSection?.title}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                      {chatMessages.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>你可以问我关于"{currentSection?.title}"的任何问题</p>
                          <p className="mt-1">比如："这个知识点高考怎么考？"、"能举个生活例子吗？"</p>
                        </div>
                      )}
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                            msg.role === 'user'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-500 flex items-center gap-1">
                            <Loader2 className="h-4 w-4 animate-spin" /> 思考中...
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="flex gap-2">
                      <Textarea
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder={`问关于"${currentSection?.title}"的问题...`}
                        className="min-h-[60px] text-sm resize-none"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendChat();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white h-auto"
                        onClick={handleSendChat}
                        disabled={chatLoading || !chatInput.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 底部导航 */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => {
                  if (activeSectionIndex > 0) {
                    setActiveSectionIndex(i => i - 1);
                    setShowThinking(false);
                    setShowAnswer(false);
                    setUserAnswer('');
                  }
                }}
                disabled={activeSectionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4" /> 上一段
              </Button>
              <span className="text-xs text-slate-500">
                {activeSectionIndex + 1} / {sections.length}
              </span>
              <Button
                size="sm"
                className="gap-1 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => {
                  if (activeSectionIndex < sections.length - 1) {
                    setActiveSectionIndex(i => i + 1);
                    setShowThinking(false);
                    setShowAnswer(false);
                    setUserAnswer('');
                  }
                }}
                disabled={activeSectionIndex === sections.length - 1}
              >
                下一段 <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {/* 未选择单元时的提示 */}
        {!selectedUnit && activeTextbook && chapters.length > 0 && (
          <Card className="border-amber-100">
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-amber-300 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                请选择要学习的课时
              </h2>
              <p className="text-sm text-slate-500">
                从上方选择一个课时，即可开始逐段学习课本内容
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
