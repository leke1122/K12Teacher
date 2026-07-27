'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft, ArrowRight, BookOpen, Target, Sparkles, AlertTriangle,
  CheckCircle, ChevronRight, ChevronLeft, Copy, Bookmark, Play, Star, Tag, Check
} from 'lucide-react';
import {
  getKnowledgeByChapter,
  getFrameworkPoints,
  getChapterStats,
  type GeographyKnowledgeItem
} from '@/lib/geographyKnowledgeService';

// 考频星级组件
function ExamFrequencyStars({ frequency }: { frequency: number }) {
  if (!frequency || frequency < 1) return null;
  
  return (
    <span className="inline-flex items-center gap-0.5 ml-2">
      {Array.from({ length: Math.min(frequency, 5) }).map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
      ))}
    </span>
  );
}

// 关键词标签组件
function KeywordTags({ keywords }: { keywords: string[] }) {
  if (!keywords || keywords.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {keywords.slice(0, 8).map((kw, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
        >
          <Tag className="h-2.5 w-2.5" />
          {kw}
        </span>
      ))}
    </div>
  );
}

// 易错提醒组件
function TrapWarning({ content }: { content: string }) {
  return (
    <div className="my-4 p-4 bg-red-50/70 border-l-4 border-red-500 rounded-r-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-700 mb-1">易错提醒</h4>
          <div className="text-sm text-red-600/90 leading-relaxed prose-sm">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

// 自定义 Markdown 组件
function MarkdownContent({ content }: { content: string }) {
  // 分割易错提醒部分
  const trapPattern = /(?:^|\n)(?:>?\s*⚠️|## 易错提醒|### 易错提醒)([\s\S]*?)(?=\n#{1,3}\s|\n---|$)/gi;
  
  let trapMatch;
  let trapContent = '';
  let mainContent = content;
  
  trapPattern.lastIndex = 0;
  trapMatch = trapPattern.exec(content);
  if (trapMatch) {
    trapContent = trapMatch[0].replace(/^>?\s*⚠️|#+\s*易错提醒/, '').trim();
    mainContent = content.replace(trapMatch[0], '');
  }
  
  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
        <ReactMarkdown
          components={{
            table: ({ children }) => (
              <div className="overflow-x-auto my-3">
                <table className="w-full text-xs border-collapse">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-100">{children}</thead>
            ),
            th: ({ children }) => (
              <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-slate-200 px-3 py-2 text-slate-600">
                {children}
              </td>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-slate-50">{children}</tr>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold text-slate-700 mt-4 mb-2">{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-xs font-semibold text-slate-600 mt-3 mb-1">{children}</h4>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-sm">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-800">{children}</strong>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-emerald-300 pl-4 my-2 italic text-slate-600">
                {children}
              </blockquote>
            ),
          }}
        >
          {mainContent}
        </ReactMarkdown>
      </div>
      
      {trapContent && <TrapWarning content={trapContent} />}
    </div>
  );
}

// 知识卡片组件
function KnowledgeCard({ item, onPractice, onMarkLearned, isLearned }: { 
  item: GeographyKnowledgeItem;
  onPractice?: () => void;
  onMarkLearned?: () => void;
  isLearned?: boolean;
}) {
  return (
    <Card className="border-slate-200 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              {item.title}
              <ExamFrequencyStars frequency={item.exam_frequency} />
              {isLearned && (
                <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-600 text-xs">
                  <Check className="h-3 w-3 mr-1" /> 已学
                </Badge>
              )}
            </CardTitle>
            <KeywordTags keywords={item.keywords} />
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={isLearned ? "outline" : "default"}
              className={isLearned ? "border-emerald-300 text-emerald-600" : "bg-emerald-600 hover:bg-emerald-700"}
              onClick={onMarkLearned}
            >
              <Check className="h-3.5 w-3.5" /> {isLearned ? '已学' : '标记'}
            </Button>
            {onPractice && (
              <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={onPractice}>
                <Sparkles className="h-3.5 w-3.5" /> 出题
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <MarkdownContent content={item.content} />
      </CardContent>
    </Card>
  );
}

// 框架视图组件
function FrameworkView({ onSelectPoint }: { onSelectPoint?: (id: string) => void }) {
  const [points, setPoints] = useState<Awaited<ReturnType<typeof getFrameworkPoints>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFrameworkPoints().then(data => {
      setPoints(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">加载中...</div>;
  }

  // 按专题分组
  const grouped: Record<string, typeof points> = {};
  points.forEach(p => {
    const match = p.title.match(/考点(\d+)/);
    const topic = match ? `专题${match[1]}` : '其他';
    if (!grouped[topic]) grouped[topic] = [];
    grouped[topic].push(p);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(grouped).map(([topic, pts]) => (
        <Card key={topic} className="col-span-1">
          <CardHeader className="pb-2 bg-emerald-50/50">
            <CardTitle className="text-sm font-semibold text-emerald-700">
              {topic}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-2">
              {pts.map((pt) => (
                <button
                  key={pt.id}
                  onClick={() => onSelectPoint?.(pt.id)}
                  className="w-full text-left p-2 rounded border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 truncate flex-1">{pt.title}</span>
                    {pt.exam_frequency > 0 && (
                      <span className="text-amber-500 text-xs ml-2">
                        {'⭐'.repeat(Math.min(pt.exam_frequency, 5))}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// 章节信息
const CHAPTER_INFO: Record<string, { name: string; description: string }> = {
  ch1: {
    name: '第一章 宇宙中的地球',
    description: '天体系统、太阳系、地球的圈层结构、地质年代'
  },
  ch2: {
    name: '第二章 地球上的大气',
    description: '大气组成、垂直分层、大气受热过程、热力环流、天气系统'
  },
  framework: {
    name: '知识框架图谱',
    description: '完整知识体系与高频考点'
  }
};

function KnowledgePageContent() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.chapterId as string;
  
  const [items, setItems] = useState<GeographyKnowledgeItem[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('knowledge');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  
  const chapterInfo = CHAPTER_INFO[chapterId] || { name: '知识点', description: '' };

  // 加载数据
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      if (chapterId === 'framework') {
        const frameworkStats = await getChapterStats();
        setStats(frameworkStats);
      } else {
        const [knowledgeData, allStats] = await Promise.all([
          getKnowledgeByChapter(chapterId),
          getChapterStats()
        ]);
        setItems(knowledgeData);
        setStats(allStats);
        
        // 从 localStorage 读取已学记录
        const progressKey = `geography_learned_${chapterId}`;
        const saved = localStorage.getItem(progressKey);
        if (saved) {
          setLearnedIds(new Set(JSON.parse(saved)));
        }
      }
      
      setLoading(false);
    }
    
    loadData();
  }, [chapterId]);

  // 标记已学
  const handleMarkLearned = (itemId: string) => {
    const newLearned = new Set(learnedIds);
    if (newLearned.has(itemId)) {
      newLearned.delete(itemId);
    } else {
      newLearned.add(itemId);
    }
    setLearnedIds(newLearned);
    localStorage.setItem(`geography_learned_${chapterId}`, JSON.stringify([...newLearned]));
  };

  // 上一节/下一节
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePractice = (id: string) => {
    router.push(`/learn/geography/practice/${chapterId}?point=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">正在加载知识点...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-emerald-50/30">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/learn/geography">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> 返回
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-slate-800">
                  {chapterInfo.name}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {chapterInfo.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {Object.entries(stats).map(([id, count]) => (
                <Badge key={id} variant="outline" className="bg-emerald-50 text-xs">
                  {id}: {count}
                </Badge>
              ))}
              <Button
                size="sm"
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => router.push(`/learn/geography/practice/${chapterId}`)}
              >
                <Sparkles className="h-4 w-4" /> AI 出题
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="knowledge" className="gap-1.5">
              <BookOpen className="h-4 w-4" /> 知识点
            </TabsTrigger>
            <TabsTrigger value="framework" className="gap-1.5">
              <Target className="h-4 w-4" /> 框架图谱
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-1.5">
              <Copy className="h-4 w-4" /> 必背清单
            </TabsTrigger>
          </TabsList>

          {/* 知识点视图 */}
          <TabsContent value="knowledge">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              <div className="space-y-4 pr-4">
                {items.length === 0 ? (
                  <Card className="p-8 text-center">
                    <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-slate-800 mb-1">暂无数据</h3>
                    <p className="text-sm text-muted-foreground">
                      该章节暂无导入的知识点
                    </p>
                  </Card>
                ) : (
                  items.map((item, idx) => (
                    <div key={item.id} id={`item-${idx}`}>
                      <KnowledgeCard
                        item={item}
                        isLearned={learnedIds.has(item.id)}
                        onMarkLearned={() => handleMarkLearned(item.id)}
                        onPractice={() => handlePractice(item.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            
            {/* 底部导航 */}
            {items.length > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 mt-4 rounded-t-lg shadow-lg">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" /> 上一节
                  </Button>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {currentIndex + 1} / {items.length}
                    </span>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => router.push(`/learn/geography/practice/${chapterId}`)}
                    >
                      <Sparkles className="h-4 w-4 mr-1" /> 生成练习
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentIndex === items.length - 1}
                    className="gap-2"
                  >
                    下一节 <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* 框架图谱视图 */}
          <TabsContent value="framework">
            <Card className="min-h-[500px]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  知识框架图谱
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FrameworkView />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 必背清单视图 */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Copy className="h-5 w-5 text-amber-500" />
                  必背知识清单
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无数据</p>
                ) : (
                  <div className="space-y-4">
                    {items
                      .filter(item => item.exam_frequency >= 3)
                      .map((item) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-slate-800 flex items-center gap-2">
                              {item.title}
                              <ExamFrequencyStars frequency={item.exam_frequency} />
                            </div>
                            <KeywordTags keywords={item.keywords} />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function GeographyKnowledgePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <KnowledgePageContent />
    </Suspense>
  );
}
