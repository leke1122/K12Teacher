'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Sparkles, Layers, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import GeographyGuidedLearning from '@/components/geography/GuidedLearning';
import { GEOGRAPHY_CHAPTER1 } from '@/data/geography/chapter1_data';
import type { Concept, TimelineEvent, CausalLink, GeographySection } from '@/lib/geographyDocxParser';

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

export default function GeographyKnowledgePage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('knowledge');
  const [data, setData] = useState<KnowledgePayload | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geography/knowledge/load?chapterId=${encodeURIComponent(chapterId)}`);
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
  const events = useMemo(() => data?.timelineEvents || [], [data?.timelineEvents]);
  const causalLinks = useMemo(() => data?.causalLinks || [], [data?.causalLinks]);
  const sections = useMemo(() => data?.sections || [], [data?.sections]);
  const tables = useMemo(() => data?.tables || [], [data?.tables]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/learn/geography">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">地理 · {data?.unitTitle || '第一章'}</h1>
            <p className="text-xs text-slate-500">📝 知识图谱与结构化知识点</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="knowledge" className="gap-1"><BookOpen className="h-4 w-4" /> 知识图谱</TabsTrigger>
            <TabsTrigger value="sections" className="gap-1"><Layers className="h-4 w-4" /> 章节结构</TabsTrigger>
            <TabsTrigger value="visual" className="gap-1"><Sparkles className="h-4 w-4" /> 可视化</TabsTrigger>
            <TabsTrigger value="guided" className="gap-1"><Clock className="h-4 w-4" /> 引导式学习</TabsTrigger>
          </TabsList>

          <TabsContent value="knowledge">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />正在加载知识点...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-base">核心逻辑图</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {causalLinks.map(link => (
                        <div key={link.id} className="flex items-center gap-2 rounded-lg border p-2 text-xs">
                          <Badge variant="outline">{link.sourceId}</Badge>
                          <span className="text-slate-500">→ {link.type}</span>
                          <Badge variant="outline">{link.targetId}</Badge>
                          <span className="text-slate-500">{link.logic}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">核心概念</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {concepts.map(concept => (
                        <Button key={concept.id} variant={selectedConcept?.id === concept.id ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setSelectedConcept(concept)}>
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
                            <span key={point} className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{point}</span>
                          ))}
                        </div>
                        {selectedConcept.gaokaoFocus && <p className="mt-2 text-xs text-amber-600">📌 {selectedConcept.gaokaoFocus}</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sections">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />正在加载章节结构...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {sections.map(section => (
                  <Card key={section.id}>
                    <CardHeader><CardTitle className="text-base">{section.title}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {section.content.map(item => (
                          <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {tables.map((table, idx) => (
                  <Card key={`table-${idx}`}>
                    <CardHeader><CardTitle className="text-base">{table.title}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              {table.headers.map(h => <th key={h} className="text-left py-1 px-2">{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row, i) => (
                              <tr key={i} className="border-b last:border-b-0">
                                {row.map((cell, j) => <td key={j} className="py-1 px-2 text-slate-600">{cell}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="visual">
            <Card>
              <CardHeader><CardTitle className="text-base">可视化导航</CardTitle></CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <Link href="/learn/geography/visualize/solar-system">
                  <Button variant="outline" className="w-full">🌌 天体系统层级图</Button>
                </Link>
                <Link href="/learn/geography/visualize/planets">
                  <Button variant="outline" className="w-full">🪐 太阳系行星轨道图</Button>
                </Link>
                <Link href="/learn/geography/visualize/spheres">
                  <Button variant="outline" className="w-full">🧩 圈层结构剖面图</Button>
                </Link>
                <Link href="/learn/geography/visualize/timeline">
                  <Button variant="outline" className="w-full">⏳ 地质年代时间轴</Button>
                </Link>
                <Link href="/learn/geography/visualize/sun-activities">
                  <Button variant="outline" className="w-full">☀️ 太阳活动类型对比</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guided">
            <GeographyGuidedLearning concepts={concepts} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
