'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Loader2, Sparkles, Layers, Clock, BookOpen, 
  Star, GitFork, CalendarDays, Brain, BookMarked, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import GeographyGuidedLearning from '@/components/geography/GuidedLearning';
import { GEOGRAPHY_CHAPTER1, GEOGRAPHY_CHAPTER1_MUST_KNOW } from '@/data/geography/chapter1_data';
import type { Concept, TimelineEvent, CausalLink, GeographySection, GeographyMustKnowItem } from '@/lib/geographyDocxParser';

type KnowledgePayload = {
  unitTitle: string;
  sections: GeographySection[];
  tables: Array<{ title: string; headers: string[]; rows: string[][] }>;
  concepts: Concept[];
  timelineEvents: TimelineEvent[];
  causalLinks: CausalLink[];
  examFocus: Array<{ conceptId: string; conceptName: string; frequency: string; questionTypes: string[] }>;
  imageRefs: Array<{ id: string; caption: string; context: string }>;
  summary: string;
};

// 重要性星星
const importanceStars: Record<number, string> = {
  5: '⭐⭐⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  3: '⭐⭐⭐',
  2: '⭐⭐',
  1: '⭐',
};

const importanceColors: Record<number, string> = {
  5: 'border-red-400 bg-red-50',
  4: 'border-amber-400 bg-amber-50',
  3: 'border-emerald-400 bg-emerald-50',
  2: 'border-blue-400 bg-blue-50',
  1: 'border-slate-400 bg-slate-50',
};

export default function GeographyKnowledgePage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mustKnow');
  const [data, setData] = useState<KnowledgePayload | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [importanceFilter, setImportanceFilter] = useState<number | null>(null);
  const [learnedItems, setLearnedItems] = useState<Set<string>>(new Set());

  // 加载数据
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geography/knowledge/load?chapterId=${encodeURIComponent(chapterId)}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          // 使用内置数据
          setData(GEOGRAPHY_CHAPTER1 as unknown as KnowledgePayload);
        }
      } catch (e) {
        console.error(e);
        // 使用内置数据
        setData(GEOGRAPHY_CHAPTER1 as unknown as KnowledgePayload);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chapterId]);

  const concepts = useMemo(() => data?.concepts || GEOGRAPHY_CHAPTER1.concepts, [data?.concepts]);
  const events = useMemo(() => data?.timelineEvents || [], [data?.timelineEvents]);
  const causalLinks = useMemo(() => data?.causalLinks || [], [data?.causalLinks]);
  const sections = useMemo(() => data?.sections || [], [data?.sections]);
  const tables = useMemo(() => data?.tables || [], [data?.tables]);

  // 使用内置的必背清单
  const mustKnowItems = GEOGRAPHY_CHAPTER1_MUST_KNOW;

  // 筛选必背清单
  const filteredMustKnow = useMemo(() => {
    if (importanceFilter === null) return mustKnowItems;
    return mustKnowItems.filter(item => item.importance === importanceFilter);
  }, [importanceFilter]);

  // 切换已学习状态
  const toggleLearned = useCallback((id: string) => {
    setLearnedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // 学习进度
  const progress = Math.round((learnedItems.size / mustKnowItems.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      {/* 固定页头 */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/learn/geography">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">地理 · {data?.unitTitle || '第一章 宇宙中的地球'}</h1>
              <p className="text-xs text-slate-500">高考地理核心知识点</p>
            </div>
            <Badge variant="outline" className="bg-emerald-50">
              {learnedItems.size}/{mustKnowItems.length} 已学习
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">

        {/* 高考重点提示 */}
        {data?.examFocus && data.examFocus.length > 0 && (
          <Card className="mb-4 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800">高考重点</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.examFocus.slice(0, 6).map((focus, idx) => (
                  <Badge
                    key={idx}
                    variant={focus.frequency === '必考' ? 'default' : 'outline'}
                    className={focus.frequency === '必考' ? 'bg-red-500' : ''}
                  >
                    {focus.conceptName} · {focus.frequency}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在加载知识点...
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="mustKnow" className="gap-1">
                <Star className="h-4 w-4" />
                必背清单
              </TabsTrigger>
              <TabsTrigger value="guided" className="gap-1">
                <Brain className="h-4 w-4" />
                引导学习
              </TabsTrigger>
              <TabsTrigger value="knowledge" className="gap-1">
                <BookOpen className="h-4 w-4" />
                知识图谱
              </TabsTrigger>
              <TabsTrigger value="sections" className="gap-1">
                <Layers className="h-4 w-4" />
                章节结构
              </TabsTrigger>
              <TabsTrigger value="concepts" className="gap-1">
                <BookMarked className="h-4 w-4" />
                概念词典
              </TabsTrigger>
            </TabsList>

            {/* 必背清单 */}
            <TabsContent value="mustKnow">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      必背知识点清单
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">学习进度</span>
                      <Progress value={progress} className="w-24 h-2" />
                      <span className="text-xs font-medium">{progress}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 重要性筛选 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      size="sm"
                      variant={importanceFilter === null ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={() => setImportanceFilter(null)}
                    >
                      全部 ({mustKnowItems.length})
                    </Button>
                    <Button
                      size="sm"
                      variant={importanceFilter === 5 ? 'default' : 'outline'}
                      className={`h-7 text-xs ${importanceFilter === 5 ? 'bg-red-500' : ''}`}
                      onClick={() => setImportanceFilter(5)}
                    >
                      ⭐⭐⭐⭐⭐ ({mustKnowItems.filter(i => i.importance === 5).length})
                    </Button>
                    <Button
                      size="sm"
                      variant={importanceFilter === 4 ? 'default' : 'outline'}
                      className={`h-7 text-xs ${importanceFilter === 4 ? 'bg-amber-500' : ''}`}
                      onClick={() => setImportanceFilter(4)}
                    >
                      ⭐⭐⭐⭐ ({mustKnowItems.filter(i => i.importance === 4).length})
                    </Button>
                    <Button
                      size="sm"
                      variant={importanceFilter === 3 ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={() => setImportanceFilter(3)}
                    >
                      ⭐⭐⭐ ({mustKnowItems.filter(i => i.importance === 3).length})
                    </Button>
                  </div>

                  {/* 知识点列表 */}
                  <div className="space-y-3">
                    {filteredMustKnow.map((item) => {
                      const color = importanceColors[item.importance] || importanceColors[3];
                      const stars = importanceStars[item.importance] || importanceStars[3];
                      const isLearned = learnedItems.has(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`rounded-lg border-l-4 p-4 transition-all ${color} ${isLearned ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="mt-0.5 h-6 w-6 p-0"
                              onClick={() => toggleLearned(item.id)}
                            >
                              {isLearned ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                              )}
                            </Button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                {item.year && (
                                  <Badge variant="outline" className="text-xs">
                                    {item.year}
                                  </Badge>
                                )}
                                <span className="text-xs">{stars}</span>
                                {item.importance >= 4 && (
                                  <Badge className="text-xs bg-red-100 text-red-600">重要考点</Badge>
                                )}
                              </div>
                              <h3 className={`font-semibold text-slate-800 ${isLearned ? 'line-through' : ''}`}>
                                {item.title}
                              </h3>
                              <p className="mt-2 text-sm text-slate-600">{item.content}</p>
                              {item.gaokaoFocus && (
                                <p className="mt-2 text-xs text-indigo-600 font-medium">
                                  🎯 {item.gaokaoFocus}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 引导式学习 */}
            <TabsContent value="guided">
              <GeographyGuidedLearning concepts={concepts} />
            </TabsContent>

            {/* 知识图谱 */}
            <TabsContent value="knowledge">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <GitFork className="h-5 w-5 text-emerald-500" />
                      核心因果链
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {causalLinks.slice(0, 10).map(link => (
                        <div key={link.id} className="flex items-center gap-2 rounded-lg border p-2 text-xs">
                          <Badge variant="outline" className="text-xs">{link.sourceId}</Badge>
                          <span className="text-slate-500">→ {link.type}</span>
                          <Badge variant="outline" className="text-xs">{link.targetId}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">核心概念速览</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {concepts.slice(0, 15).map(concept => (
                        <Button
                          key={concept.id}
                          variant={selectedConcept?.id === concept.id ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs"
                          onClick={() => setSelectedConcept(concept)}
                        >
                          {concept.name}
                        </Button>
                      ))}
                    </div>
                    {selectedConcept && (
                      <div className="mt-4 rounded-lg border bg-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-slate-800">{selectedConcept.name}</p>
                          <Badge>{selectedConcept.category}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{selectedConcept.definition}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedConcept.keyPoints?.map(point => (
                            <span key={point} className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                              {point}
                            </span>
                          ))}
                        </div>
                        {selectedConcept.gaokaoFocus && (
                          <p className="mt-2 text-xs text-amber-600">📌 {selectedConcept.gaokaoFocus}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 章节结构 */}
            <TabsContent value="sections">
              <div className="grid gap-4 md:grid-cols-2">
                {sections.map(section => (
                  <Card key={section.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {section.content.map(item => (
                          <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 重要表格 */}
              {tables.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-3">核心知识表格</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {tables.slice(0, 6).map((table, idx) => (
                      <Card key={`table-${idx}`}>
                        <CardHeader>
                          <CardTitle className="text-base">{table.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b bg-slate-50">
                                  {table.headers.map(h => (
                                    <th key={h} className="text-left py-2 px-2 font-medium">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows.map((row, i) => (
                                  <tr key={i} className="border-b last:border-b-0 hover:bg-slate-50">
                                    {row.map((cell, j) => (
                                      <td key={j} className="py-2 px-2 text-slate-600">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* 概念词典 */}
            <TabsContent value="concepts">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {concepts.map(concept => (
                  <Card key={concept.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{concept.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {importanceStars[concept.importance]}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-2">{concept.name}</h3>
                      <p className="text-xs text-slate-600 line-clamp-3">{concept.definition}</p>
                      {concept.gaokaoFocus && (
                        <p className="mt-2 text-xs text-amber-600">{concept.gaokaoFocus}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
