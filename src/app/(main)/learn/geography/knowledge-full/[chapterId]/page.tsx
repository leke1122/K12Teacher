'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Star,
  Sparkles,
  Map,
} from 'lucide-react';
import {
  GEOGRAPHY_CHAPTER_OPTIONS,
  GEOGRAPHY_KNOWLEDGE_CHAPTERS,
  type GeographyChapter,
  type Section,
  type Subsection,
  type KnowledgeContent,
} from '@/data/geography/knowledgeFull';

export default function GeographyKnowledgePage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = (params.chapterId as string) || 'chapter1';
  
  const [activeTab, setActiveTab] = useState('knowledge');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  
  const currentChapter = GEOGRAPHY_KNOWLEDGE_CHAPTERS.find(ch => ch.id === chapterId) || GEOGRAPHY_KNOWLEDGE_CHAPTERS[0];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const expandAll = () => {
    setExpandedSections(currentChapter.sections.map(s => s.id));
  };

  const collapseAll = () => {
    setExpandedSections([]);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-emerald-50/40">
      {/* 固定页头 */}
      <header className="z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/subjects/geography">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </Link>
            
            {/* 章节切换 */}
            <div className="flex items-center gap-1 ml-4">
              {GEOGRAPHY_CHAPTER_OPTIONS.map((ch) => (
                <Button
                  key={ch.id}
                  variant={ch.id === currentChapter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => router.push(`/learn/geography/knowledge/${ch.id}`)}
                  className="text-xs"
                >
                  {ch.title}
                </Button>
              ))}
            </div>
            
            <Badge variant="outline" className="ml-auto bg-emerald-50">
              {currentChapter.subtitle}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* 考情分析 */}
        <Card className="mb-4 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              {currentChapter.examAnalysis.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="knowledge" className="text-xs">
                  <BookOpen className="h-3 w-3 mr-1" />
                  知识点
                </TabsTrigger>
                <TabsTrigger value="exam" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  考情分析
                </TabsTrigger>
                <TabsTrigger value="mistakes" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  易混辨析
                </TabsTrigger>
                <TabsTrigger value="mustknow" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  必背清单
                </TabsTrigger>
              </TabsList>

              {/* 知识点Tab */}
              <TabsContent value="knowledge" className="space-y-4">
                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={expandAll} className="text-xs">
                    展开全部
                  </Button>
                  <Button variant="outline" size="sm" onClick={collapseAll} className="text-xs">
                    收起全部
                  </Button>
                  <span className="text-xs text-muted-foreground ml-auto">
                    共{currentChapter.sections.length}节
                  </span>
                </div>

                {/* 章节内容 */}
                <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections} className="space-y-3">
                  {currentChapter.sections.map((section) => (
                    <AccordionItem key={section.id} value={section.id} className="border rounded-lg bg-white">
                      <AccordionTrigger className="px-4 hover:no-underline hover:bg-slate-50">
                        <div className="flex items-center gap-2 text-left">
                          <BookOpen className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium">{section.title}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {section.subsections.length}节
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="px-4 pb-4 space-y-4">
                          {section.subsections.map((subsection) => (
                            <div key={subsection.id} className="border-l-2 border-emerald-200 pl-4">
                              <h3 className="font-semibold text-slate-800 mb-3">{subsection.title}</h3>
                              <div className="space-y-4">
                                {subsection.content.map((item, idx) => (
                                  <KnowledgeItem key={idx} item={item} />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              {/* 考情分析Tab */}
              <TabsContent value="exam" className="space-y-4">
                {/* 五年真题分布 */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">五年真题考点分布</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border px-2 py-1 text-left">年份</th>
                          <th className="border px-2 py-1 text-left">卷型</th>
                          <th className="border px-2 py-1 text-left">题号</th>
                          <th className="border px-2 py-1 text-left">考点</th>
                          <th className="border px-2 py-1 text-left">分值</th>
                          <th className="border px-2 py-1 text-left">题型</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentChapter.examAnalysis.years.map((year, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="border px-2 py-1">{year.year}</td>
                            <td className="border px-2 py-1">{year.paper}</td>
                            <td className="border px-2 py-1">{year.questionNumbers}</td>
                            <td className="border px-2 py-1">{year.topic}</td>
                            <td className="border px-2 py-1">{year.score}</td>
                            <td className="border px-2 py-1">{year.questionType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 考频统计 */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">考频统计</h3>
                  <div className="grid gap-2">
                    {currentChapter.examAnalysis.frequency.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border">
                        <Badge variant="outline" className="text-xs">{item.times}次</Badge>
                        <span className="text-sm flex-1">{item.topic}</span>
                        <Badge className={item.level.includes('★★★') ? 'bg-red-500' : 'bg-amber-500'}>
                          {item.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 命题特色 */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">命题特色</h3>
                  <div className="space-y-2">
                    {currentChapter.examAnalysis.features.map((feature, idx) => (
                      <div key={idx} className="p-3 bg-white rounded border text-sm text-slate-700">
                        {idx + 1}. {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 解题思路 */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">解题思路</h3>
                  <div className="space-y-3">
                    {currentChapter.solutionGuides.map((guide, idx) => (
                      <Card key={idx} className="border-l-4 border-l-blue-400">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{guide.examPoint}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs space-y-2">
                          <p><strong>考什么：</strong>{guide.whatToTest}</p>
                          <p><strong>怎么考：</strong>{guide.howToTest}</p>
                          <p><strong>怎么想：</strong></p>
                          <ul className="list-disc list-inside pl-2">
                            {guide.howToThink.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                          {guide.example && (
                            <div className="mt-2 p-2 bg-amber-50 rounded">
                              <p><strong>【真题示例】</strong>{guide.example.year}</p>
                              <p>题目：{guide.example.question}</p>
                              <p>解题：{guide.example.solution}</p>
                              <p>答案：{guide.example.answer}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* 易混辨析Tab */}
              <TabsContent value="mistakes" className="space-y-2">
                <h3 className="font-semibold text-slate-800 mb-2">易混易错辨析</h3>
                <div className="grid gap-2">
                  {currentChapter.mistakeAnalysis.map((item) => (
                    <div key={item.number} className="flex items-start gap-3 p-3 bg-white rounded border">
                      <Badge variant="outline" className="flex-shrink-0 mt-0.5">{item.number}</Badge>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.point}</p>
                        <p className="text-sm text-emerald-600 mt-1">{item.correct}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* 必背清单Tab */}
              <TabsContent value="mustknow" className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800">必背知识清单</h3>
                  <Badge variant="outline">{currentChapter.mustKnowList.length}条</Badge>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {currentChapter.mustKnowList.map((item) => (
                    <div key={item.number} className="flex items-start gap-3 p-3 bg-white rounded border hover:border-emerald-300 transition-colors">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-medium flex items-center justify-center">
                        {item.number}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{item.content}</p>
                        <p className="text-xs text-emerald-600 mt-1">{item.keywords}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 使用建议 */}
                <Card className="bg-emerald-50 border-emerald-200 mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-emerald-700">
                        <p className="font-medium">使用建议</p>
                        <p className="mt-1">{currentChapter.usageTips}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 知识点内容渲染组件
function KnowledgeItem({ item }: { item: KnowledgeContent }) {
  switch (item.type) {
    case 'key-point':
      return (
        <div className="flex items-start gap-2 p-3 bg-emerald-50 rounded border border-emerald-200">
          <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-slate-700 font-medium">{item.content}</span>
        </div>
      );
    
    case 'note':
      return (
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded border border-amber-200">
          <Star className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-slate-700 whitespace-pre-line">{item.content}</span>
        </div>
      );
    
    case 'quote':
      return (
        <div className="p-3 bg-red-50 rounded border border-red-200">
          <span className="text-sm text-slate-700 whitespace-pre-line">{item.content}</span>
        </div>
      );
    
    case 'text':
      return (
        <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
          {item.content}
        </div>
      );
    
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse my-2">
            {item.title && (
              <caption className="text-left font-medium text-slate-800 mb-2">{item.title}</caption>
            )}
            <thead>
              <tr className="bg-slate-100">
                {item.headers?.map((header, idx) => (
                  <th key={idx} className="border px-2 py-1.5 text-left font-medium">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {item.rows?.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="border px-2 py-1.5 text-slate-700 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    
    case 'list':
      return (
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {item.content.split('\n').map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      );
    
    default:
      return null;
  }
}
