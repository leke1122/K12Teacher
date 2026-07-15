'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Loader2, Sparkles, Layers, Clock, BookOpen, Table2 } from 'lucide-react';
import Link from 'next/link';
import GuidedLearning from '@/components/politics/GuidedLearning';
import { SOCIAL_FORMS_FULL, CAPITALIST_CRISIS, CAPITALIST_WHY_DOOMED, UNIT1_FULL_DATA } from '@/data/politics/unit1_full_data';
import type { SocialFormFull } from '@/data/politics/unit1_full_data';

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
  socialForms: SocialFormFull[];
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
  const [selectedSocialForm, setSelectedSocialForm] = useState<SocialFormFull | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/politics/knowledge/load?chapterId=${encodeURIComponent(chapterId)}`);
        const json = await res.json();
        if (json.success) {
          // 优先使用 Word 完整数据
          const fullData = UNIT1_FULL_DATA;
          setData({
            unitTitle: json.unitTitle || fullData.scientificSocialism.founding.birthMark.replace('《', '').replace('》', ''),
            overview: fullData.bookOverview,
            socialForms: fullData.socialForms,
            concepts: json.concepts || [],
            timelineEvents: json.timelineEvents || [],
            causalLinks: json.causalLinks || [],
            examFocus: json.examFocus || [],
            keyQuotes: json.keyQuotes || [],
            summary: json.summary || '社会主义从空想到科学、从理论到实践的发展。',
          });
        }
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
              <div className="space-y-4">
                {/* 完整社会形态对比表 */}
                <Card className="overflow-hidden">
                  <CardHeader className="bg-pink-50 py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Table2 className="h-4 w-4 text-pink-500" />
                      社会形态对比总表（Word 原文完整版）
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="border border-slate-200 p-2 text-left font-semibold w-24 sticky left-0 bg-slate-50 z-10">社会形态</th>
                            <th className="border border-slate-200 p-2 text-left font-semibold">生产力</th>
                            <th className="border border-slate-200 p-2 text-left font-semibold">生产资料所有制</th>
                            <th className="border border-slate-200 p-2 text-left font-semibold">分配制度</th>
                            <th className="border border-slate-200 p-2 text-left font-semibold">人与人关系</th>
                            <th className="border border-slate-200 p-2 text-left font-semibold">政治上层建筑</th>
                            <th className="border border-slate-200 p-2 text-left font-semibold">主要矛盾</th>
                            <th className="border border-slate-200 p-2 text-left font-semibold">基本矛盾</th>
                            <th className="border border-slate-200 p-2 text-left font-semibold">总体评价</th>
                          </tr>
                        </thead>
                        <tbody>
                          {SOCIAL_FORMS_FULL.map((form, idx) => (
                            <tr
                              key={form.id}
                              className={`cursor-pointer transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${selectedSocialForm?.id === form.id ? 'bg-pink-50' : 'hover:bg-pink-50/30'}`}
                              onClick={() => setSelectedSocialForm(selectedSocialForm?.id === form.id ? null : form)}
                            >
                              <td className="border border-slate-200 p-2 font-semibold text-pink-700 sticky left-0 bg-inherit z-10">
                                {form.name}
                              </td>
                              <td className="border border-slate-200 p-2 text-slate-700">{form.productivity}</td>
                              <td className="border border-slate-200 p-2 text-slate-700">{form.productionRelation.ownership}</td>
                              <td className="border border-slate-200 p-2 text-slate-700">{form.productionRelation.distribution}</td>
                              <td className="border border-slate-200 p-2 text-slate-700">{form.laborRelation}</td>
                              <td className="border border-slate-200 p-2 text-slate-700">{form.superstructure.politics}</td>
                              <td className="border border-slate-200 p-2 text-slate-700">{form.mainContradiction}</td>
                              <td className="border border-slate-200 p-2 text-slate-700">{form.basicContradiction}</td>
                              <td className="border border-slate-200 p-2 text-slate-700">{form.evaluation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* 资本主义经济危机详情 */}
                <Card className="border-red-100">
                  <CardHeader className="bg-red-50 py-3">
                    <CardTitle className="text-base text-red-700">资本主义经济危机（详细内容）</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-sm">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="font-semibold text-red-700 mb-1">① 基本特征</p>
                        <p className="text-slate-700">{CAPITALIST_CRISIS.basicFeature}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="font-semibold text-red-700 mb-1">② 根本原因</p>
                        <p className="text-slate-700">{CAPITALIST_CRISIS.rootCause}</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="font-semibold text-red-700 mb-2">③ 主要表现</p>
                      <p className="text-slate-700">{CAPITALIST_CRISIS.mainManifestations}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                      <p className="font-semibold text-red-700 mb-2">④ 直接原因（三点）</p>
                      {CAPITALIST_CRISIS.directCauses.map((cause, idx) => (
                        <div key={idx} className="flex items-start gap-2 mb-1">
                          <span className="text-red-500 font-semibold">{String.fromCharCode(65 + idx)}.</span>
                          <span className="text-slate-700">{cause}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 资本主义为什么必然灭亡 */}
                <Card className="border-orange-100">
                  <CardHeader className="bg-orange-50 py-3">
                    <CardTitle className="text-base text-orange-700">为什么资本主义必然灭亡？</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {CAPITALIST_WHY_DOOMED.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center font-semibold">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-slate-700">{item}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 资本主义评价 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">资本主义社会评价</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <p className="font-semibold text-emerald-700 text-sm mb-1">进步性</p>
                      <p className="text-sm text-emerald-800">{UNIT1_FULL_DATA.capitalistEvaluation.progress}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="font-semibold text-red-700 text-sm mb-1">局限性</p>
                      <p className="text-sm text-red-800">{UNIT1_FULL_DATA.capitalistEvaluation.limitation}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 选中社会形态详细卡片 */}
                {selectedSocialForm && (
                  <Card className="border-pink-300 bg-gradient-to-br from-pink-50 to-purple-50">
                    <CardHeader>
                      <CardTitle className="text-lg text-pink-700">{selectedSocialForm.name} · 详细内容</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">生产力</p>
                        <p className="text-slate-600">{selectedSocialForm.productivity}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">生产资料所有制</p>
                        <p className="text-slate-600">{selectedSocialForm.productionRelation.ownership}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">分配制度</p>
                        <p className="text-slate-600">{selectedSocialForm.productionRelation.distribution}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">人与人关系</p>
                        <p className="text-slate-600">{selectedSocialForm.laborRelation}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">政治上层建筑</p>
                        <p className="text-slate-600">{selectedSocialForm.superstructure.politics}</p>
                      </div>
                      {selectedSocialForm.superstructure.culture && (
                        <div>
                          <p className="font-semibold text-slate-700 mb-1">文化上层建筑</p>
                          <p className="text-slate-600">{selectedSocialForm.superstructure.culture}</p>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">主要矛盾</p>
                        <p className="text-slate-600">{selectedSocialForm.mainContradiction}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 mb-1">基本矛盾</p>
                        <p className="text-slate-600">{selectedSocialForm.basicContradiction}</p>
                      </div>
                      <div className="bg-pink-50 rounded-lg p-3">
                        <p className="font-semibold text-pink-700 mb-1">总体评价</p>
                        <p className="text-pink-800">{selectedSocialForm.evaluation}</p>
                        {selectedSocialForm.detail && (
                          <p className="text-pink-700 mt-2">{selectedSocialForm.detail}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
            <GuidedLearning />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
