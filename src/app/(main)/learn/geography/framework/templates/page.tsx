'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Search, Brain, ChevronDown, ChevronRight, 
  CheckCircle2, Lightbulb, Target, BookOpen, ArrowRight
} from 'lucide-react';
import { ANSWER_TEMPLATES, type AnswerTemplate } from '@/data/geography/framework/frameworkData';

const CATEGORY_COLORS: Record<string, string> = {
  '描述': 'bg-blue-100 text-blue-700 border-blue-200',
  '分析': 'bg-purple-100 text-purple-700 border-purple-200',
  '评价': 'bg-amber-100 text-amber-700 border-amber-200',
  '措施': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '判读': 'bg-red-100 text-red-700 border-red-200',
};

function TemplatesPageContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  const categories = Array.from(new Set(ANSWER_TEMPLATES.map(t => t.category)));

  const filteredTemplates = ANSWER_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/learn/geography/framework')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Brain className="h-7 w-7 text-blue-500" />
              📝 答题模板库
            </h1>
            <p className="text-sm text-muted-foreground">6大类模板 · 覆盖所有综合题题型</p>
          </div>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            <Target className="h-3 w-3 mr-1" />
            辽宁高考
          </Badge>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索模板..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* 分类筛选 */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
              >
                全部
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  size="sm"
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? CATEGORY_COLORS[cat] : ''}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 模板列表 */}
        <div className="space-y-4">
          {filteredTemplates.map(template => (
            <Card 
              key={template.id}
              className={`transition-all ${expandedTemplate === template.id ? 'ring-2 ring-blue-400' : ''}`}
            >
              <CardHeader className="pb-2">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={CATEGORY_COLORS[template.category]}>
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  {expandedTemplate === template.id ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>

              {expandedTemplate === template.id && (
                <CardContent className="space-y-4 pt-0">
                  {/* 模板结构 */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-sm">模板结构</span>
                    </div>
                    <p className="text-slate-700">{template.structure}</p>
                  </div>

                  {/* 应用步骤 */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">应用步骤</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                      {template.applicationSteps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* 示例 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium text-sm">典型例题</span>
                    </div>
                    {template.examples.map((example, idx) => (
                      <div key={idx} className="border rounded-lg overflow-hidden">
                        <div 
                          className="p-3 bg-slate-50 cursor-pointer hover:bg-slate-100"
                          onClick={() => setExpandedExample(expandedExample === `${template.id}-${idx}` ? null : `${template.id}-${idx}`)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">例题 {idx + 1}</span>
                            {expandedExample === `${template.id}-${idx}` ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{example.question}</p>
                        </div>
                        {expandedExample === `${template.id}-${idx}` && (
                          <div className="p-4 bg-white">
                            <p className="text-sm font-medium text-slate-700 mb-2">题目：</p>
                            <p className="text-sm text-slate-600 mb-4">{example.question}</p>
                            <p className="text-sm font-medium text-slate-700 mb-2">参考答案：</p>
                            <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap">{example.answer}</p>
                            <p className="text-sm font-medium text-slate-700 mb-2">得分关键词：</p>
                            <div className="flex flex-wrap gap-1">
                              {example.points.map((point, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-emerald-50">
                                  <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
                                  {point}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 考试提示 */}
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-sm text-amber-800">考试提示</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                      {template.examTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 练习按钮 */}
                  <Button 
                    className="w-full"
                    onClick={() => router.push('/learn/geography/practice')}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    开始练习
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">没有找到匹配的模板</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>
    }>
      <TemplatesPageContent />
    </Suspense>
  );
}
