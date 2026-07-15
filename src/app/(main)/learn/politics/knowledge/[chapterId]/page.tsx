'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Loader2, Sparkles, Layers, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import GuidedLearning from '@/components/politics/GuidedLearning';
import { POLITICS_UNIT1 } from '@/data/politics/unit1_data';

interface SocialForm {
  id: string;
  name: string;
  productivity: string;
  productionRelation: string;
  superstructure: string;
  mainContradiction: string;
  basicContradiction: string;
  evaluation: string;
}

interface Concept {
  id: string;
  name: string;
  category: '马克思主义' | '政治经济学' | '科学社会主义' | '哲学' | '党史';
  definition: string;
  keyPoints: string[];
  importance: 1 | 2 | 3 | 4 | 5;
  gaokaoFocus?: string;
}

interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  summary: string;
  impact: string;
  category: string;
  importance: number;
}

interface CausalLink {
  id: string;
  sourceId: string;
  targetId: string;
  logic: string;
  type: '导致' | '促进' | '推动';
}

interface KnowledgePayload {
  unitTitle: string;
  overview: string;
  socialForms: SocialForm[];
  concepts: Concept[];
  timelineEvents: TimelineEvent[];
  causalLinks: CausalLink[];
  examFocus: Array<{ conceptId: string; conceptName: string; frequency: string; questionTypes: string[] }>;
  keyQuotes: Array<{ id: string; source: string; quote: string; explanation: string }>;
  summary: string;
}

export default function PoliticsKnowledgePage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('knowledge');
  const [data, setData] = useState<KnowledgePayload | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [selectedSocialForm, setSelectedSocialForm] = useState<SocialForm | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/politics/knowledge/load?chapterId=${encodeURIComponent(chapterId)}`);
        const json = await res.json();
        if (json.success) setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chapterId]);

  const concepts = useMemo(() => data?.concepts || [], [data?.concepts]);
  const socialForms = useMemo(() => data?.socialForms || [], [data?.socialForms]);
  const events = useMemo(() => data?.timelineEvents || [], [data?.timelineEvents]);
  const causalLinks = useMemo(() => data?.causalLinks || [], [data?.causalLinks]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50/30">
      <div className="w-full px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/politics">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">政治 · {data?.unitTitle || '第一课'}</h1>
            <p className="text-xs text-slate-500">📝 您导入的知识点</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="knowledge" className="gap-1">
              <BookOpen className="h-4 w-4" /> 知识图谱
            </TabsTrigger>
            <TabsTrigger value="forms" className="gap-1">
              <Layers className="h-4 w-4" /> 社会形态
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1">
              <Clock className="h-4 w-4" /> 时间轴
            </TabsTrigger>
            <TabsTrigger value="guided" className="gap-1">
              <Sparkles className="h-4 w-4" /> 引导式学习
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在加载知识点...
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">核心逻辑图</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {causalLinks.map(link => {
                        const source = concepts.find(c => c.id === link.sourceId);
                        const target = concepts.find(c => c.id === link.targetId);
                        return (
                          <div key={link.id} className="flex items-center gap-2 rounded-lg border p-2 text-xs">
                            <Badge variant="outline">{source?.name || link.sourceId}</Badge>
                            <span className="text-slate-500">→ {link.type}</span>
                            <Badge variant="outline">{target?.name || link.targetId}</Badge>
                            <span className="text-slate-500">{link.logic}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">核心概念</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {concepts.map(concept => (
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
                        <p className="font-semibold text-slate-800">{selectedConcept.name}</p>
                        <p className="mt-2 text-sm text-slate-600">{selectedConcept.definition}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedConcept.keyPoints.map(point => (
                            <span key={point} className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-700">{point}</span>
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
            )}
          </TabsContent>

          <TabsContent value="forms">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在加载社会形态...
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {socialForms.map(form => (
                  <Card
                    key={form.id}
                    className={selectedSocialForm?.id === form.id ? 'border-pink-400 shadow-md' : ''}
                    onClick={() => setSelectedSocialForm(form)}
                  >
                    <CardContent className="p-4">
                      <p className="font-semibold text-slate-800">{form.name}</p>
                      {selectedSocialForm?.id === form.id && (
                        <div className="mt-3 space-y-2 text-xs text-slate-600">
                          <p><span className="font-semibold">生产力：</span>{form.productivity}</p>
                          <p><span className="font-semibold">生产关系：</span>{form.productionRelation}</p>
                          <p><span className="font-semibold">上层建筑：</span>{form.superstructure}</p>
                          <p><span className="font-semibold">主要矛盾：</span>{form.mainContradiction}</p>
                          <p><span className="font-semibold">基本矛盾：</span>{form.basicContradiction}</p>
                          <p><span className="font-semibold">评价：</span>{form.evaluation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在加载时间轴...
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(ev => (
                  <Card key={ev.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline">{ev.year}</Badge>
                        <div>
                          <p className="font-semibold text-slate-800">{ev.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{ev.summary}</p>
                          <p className="mt-1 text-xs text-slate-500">影响：{ev.impact}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="guided">
            <GuidedLearning concepts={concepts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
