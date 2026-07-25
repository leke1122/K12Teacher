'use client';

import { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, Loader2, Sparkles, GitFork, Brain, BookOpen, CheckCircle2, Star
} from 'lucide-react';
import Link from 'next/link';
import GeographyGuidedLearning from '@/components/geography/GuidedLearning';
import { GEOGRAPHY_CHAPTER1, GEOGRAPHY_CHAPTER1_MUST_KNOW } from '@/data/geography/chapter1_data';
import type { Concept, TimelineEvent, CausalLink, GeographySection, GeographyMustKnowItem } from '@/lib/geographyDocxParser';
import { useScrollHide } from '@/hooks/useScrollHide';

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

  const headerHidden = useScrollHide({ threshold: 50, sensitivity: 3, hideDelay: 100 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geography/knowledge/load?chapterId=${encodeURIComponent(chapterId)}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          setData(GEOGRAPHY_CHAPTER1 as unknown as KnowledgePayload);
        }
      } catch (e) {
        console.error(e);
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

  const mustKnowItems = GEOGRAPHY_CHAPTER1_MUST_KNOW;

  const filteredMustKnow = useMemo(() => {
    if (importanceFilter === null) return mustKnowItems;
    return mustKnowItems.filter(item => item.importance === importanceFilter);
  }, [importanceFilter]);

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

  const progress = Math.round((learnedItems.size / mustKnowItems.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      {/* Auto-hide Header */}
      <header
        className={`
          sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm
          transition-all duration-300 ease-out
          ${headerHidden ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
        `}
      >
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/subjects/geography">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> 返回
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {learnedItems.size}/{mustKnowItems.length} 已学习
            </span>
            <Progress value={progress} className="w-20 h-1.5" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-3 space-y-4">
        {/* 高考重点提示 */}
        {data?.examFocus && data.examFocus.length > 0 && (
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-800 text-sm">高考重点</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.examFocus.slice(0, 6).map((focus, idx) => (
                  <Badge
                    key={idx}
                    variant={focus.frequency === '必考' ? 'default' : 'outline'}
                    className={`text-xs ${focus.frequency === '必考' ? 'bg-red-500' : ''}`}
                  >
                    {focus.conceptName}
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
            </TabsList>

            {/* 必背清单 */}
            <TabsContent value="mustKnow">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      必背知识点清单
                    </CardTitle>
                    {/* 重要性筛选 */}
                    <div className="flex flex-wrap gap-1.5">
                      <Button
                        size="sm"
                        variant={importanceFilter === null ? 'default' : 'outline'}
                        className="h-6 text-xs px-2"
                        onClick={() => setImportanceFilter(null)}
                      >
                        全部
                      </Button>
                      <Button
                        size="sm"
                        variant={importanceFilter === 5 ? 'default' : 'outline'}
                        className={`h-6 text-xs px-2 ${importanceFilter === 5 ? 'bg-red-500' : ''}`}
                        onClick={() => setImportanceFilter(5)}
                      >
                        ⭐5
                      </Button>
                      <Button
                        size="sm"
                        variant={importanceFilter === 4 ? 'default' : 'outline'}
                        className={`h-6 text-xs px-2 ${importanceFilter === 4 ? 'bg-amber-500' : ''}`}
                        onClick={() => setImportanceFilter(4)}
                      >
                        ⭐4
                      </Button>
                      <Button
                        size="sm"
                        variant={importanceFilter === 3 ? 'default' : 'outline'}
                        className="h-6 text-xs px-2"
                        onClick={() => setImportanceFilter(3)}
                      >
                        ⭐3
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 知识点列表 */}
                  <div className="space-y-3">
                    {filteredMustKnow.map((item) => {
                      const color = importanceColors[item.importance] || importanceColors[3];
                      const stars = importanceStars[item.importance] || importanceStars[3];
                      const isLearned = learnedItems.has(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`rounded-lg border-l-4 p-3 transition-all ${color} ${isLearned ? 'opacity-60' : ''}`}
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
                                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                                    {item.year}
                                  </Badge>
                                )}
                                <span className="text-xs">{stars}</span>
                                {item.importance >= 4 && (
                                  <Badge className="text-[10px] px-1 py-0 bg-red-100 text-red-600">重要</Badge>
                                )}
                              </div>
                              <h3 className={`font-semibold text-sm text-slate-800 ${isLearned ? 'line-through' : ''}`}>
                                {item.title}
                              </h3>
                              <p className="mt-1.5 text-xs text-slate-600">{item.content}</p>
                              {item.gaokaoFocus && (
                                <p className="mt-1.5 text-[10px] text-indigo-600 font-medium">
                                  {item.gaokaoFocus}
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
                          <p className="mt-2 text-xs text-amber-600">{selectedConcept.gaokaoFocus}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
