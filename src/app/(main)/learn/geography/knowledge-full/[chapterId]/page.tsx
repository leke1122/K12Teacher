'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, CheckCircle, AlertTriangle, Lightbulb, Star, Loader2 } from 'lucide-react';
import { GEOGRAPHY_KNOWLEDGE_CHAPTERS, KnowledgeContent } from '@/data/geography/knowledgeFull';
import { GeographyGuidedLearning } from '@/components/geography/GeographyGuidedLearning';

function ContentRenderer({ content }: { content: KnowledgeContent }) {
  switch (content.type) {
    case 'key-point':
      return (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-slate-700">
          <div className="flex items-start gap-2">
            <Star className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="font-medium">{content.content}</span>
          </div>
        </div>
      );
    
    case 'note':
      return (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-slate-700">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <span className="whitespace-pre-wrap">{content.content}</span>
          </div>
        </div>
      );
    
    case 'quote':
      return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-slate-700">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="whitespace-pre-wrap">{content.content}</span>
          </div>
        </div>
      );
    
    case 'table':
      return (
        <div className="overflow-x-auto">
          {content.content && <p className="font-medium text-slate-700 mb-2">{content.content}</p>}
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                {content.headers?.map((header, idx) => (
                  <th key={idx} className="border border-slate-300 px-3 py-2 text-left font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.rows?.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="border border-slate-300 px-3 py-2 text-slate-600">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    
    case 'text':
    default:
      return (
        <div className="text-slate-600 whitespace-pre-wrap">
          {content.content.split('\n').map((line, idx) => {
            if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-2">
                  <span className="text-emerald-500 mt-0.5">•</span>
                  <span>{line.replace(/^[•\-\*]\s*/, '')}</span>
                </div>
              );
            }
            return <div key={idx}>{line}</div>;
          })}
        </div>
      );
  }
}

export default function GeographyKnowledgePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <GeographyKnowledgeContent />
    </Suspense>
  );
}

function GeographyKnowledgeContent() {
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapter') || 'chapter1';
  const mode = searchParams.get('mode') || 'guided';
  
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentChapter = GEOGRAPHY_KNOWLEDGE_CHAPTERS.find(ch => ch.id === chapterId) || GEOGRAPHY_KNOWLEDGE_CHAPTERS[0];

  const expandAll = () => {
    setExpandedSections(currentChapter.sections.map(s => s.id));
  };

  const collapseAll = () => {
    setExpandedSections([]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{currentChapter.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{currentChapter.subtitle}</p>
        </div>

        {/* 导学模式 - 使用导学组件 */}
        {mode === 'guided' && (
          <GeographyGuidedLearning chapterId={chapterId} />
        )}

        {/* 知识点模式 */}
        {mode === 'knowledge' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>展开全部</Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>收起全部</Button>
              <span className="text-xs text-muted-foreground ml-auto self-center">
                共{currentChapter.sections.length}节
              </span>
            </div>

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
                    <div className="px-4 pb-4 space-y-6">
                      {section.subsections.map((subsection) => (
                        <div key={subsection.id} className="space-y-3">
                          <h4 className="font-medium text-slate-800 text-base border-b pb-1">
                            {subsection.title}
                          </h4>
                          <div className="space-y-3">
                            {subsection.content.map((item, idx) => (
                              <ContentRenderer key={idx} content={item} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* 真题模式 */}
        {mode === 'exam' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentChapter.examAnalysis.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h4 className="font-medium mb-3">五年真题考点分布</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border px-3 py-2">年份</th>
                          <th className="border px-3 py-2">卷型</th>
                          <th className="border px-3 py-2">题号</th>
                          <th className="border px-3 py-2">考点</th>
                          <th className="border px-3 py-2">分值</th>
                          <th className="border px-3 py-2">题型</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentChapter.examAnalysis.years.map((year, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="border px-3 py-2">{year.year}</td>
                            <td className="border px-3 py-2">{year.paper}</td>
                            <td className="border px-3 py-2">{year.questionNumbers}</td>
                            <td className="border px-3 py-2">{year.topic}</td>
                            <td className="border px-3 py-2">{year.score}</td>
                            <td className="border px-3 py-2">{year.questionType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium mb-3">考频统计</h4>
                  <div className="space-y-2">
                    {currentChapter.examAnalysis.frequency.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                        <span className="font-medium">{item.topic}</span>
                        <Badge variant="outline">{item.times}次</Badge>
                        <span className="text-sm text-emerald-600">{item.level}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">命题特色</h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600">
                    {currentChapter.examAnalysis.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 易错模式 */}
        {mode === 'mistakes' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">易混易错辨析</h3>
            <div className="grid gap-3">
              {currentChapter.mistakeAnalysis.map((item, idx) => (
                <Card key={idx} className="border-l-4 border-l-amber-400">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-700">
                          {item.number}. {item.point}
                        </p>
                        <p className="mt-2 text-slate-600 whitespace-pre-wrap">
                          正确理解: {item.correct}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 必背模式 */}
        {mode === 'mustknow' && (
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">必背知识清单</h3>
            <div className="grid gap-3">
              {currentChapter.mustKnowList.map((item, idx) => (
                <Card key={idx} className="border-l-4 border-l-emerald-400">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-800">
                          {item.number}. {item.content}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          关键词: {item.keywords}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
