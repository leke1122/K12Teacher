'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Search, BookOpen, ChevronDown, ChevronRight, Globe
} from 'lucide-react';
import { GLOSSARY_CATEGORIES } from '@/data/geography/framework/frameworkData';

function GlossaryPageContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('natural-terms');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  // 搜索过滤
  const filteredCategories = GLOSSARY_CATEGORIES.map(category => ({
    ...category,
    terms: category.terms.filter(term => 
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.terms.length > 0);

  const totalTerms = GLOSSARY_CATEGORIES.reduce((acc, cat) => acc + cat.terms.length, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-amber-50/30 to-yellow-50/20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/learn/geography/framework')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-amber-500" />
              📖 术语速查
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalTerms}个地理术语 · 分类检索 · 即查即用
            </p>
          </div>
        </div>

        {/* 搜索 */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索术语名称或解释..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                找到 {filteredCategories.reduce((acc, c) => acc + c.terms.length, 0)} 个相关术语
              </p>
            )}
          </CardContent>
        </Card>

        {/* 分类列表 */}
        <div className="space-y-4">
          {filteredCategories.map(category => (
            <Card key={category.id}>
              <CardHeader className="pb-2">
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.terms.length}个术语</p>
                  </div>
                  {expandedCategory === category.id ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>

              {expandedCategory === category.id && (
                <CardContent className="pt-0 space-y-2">
                  {category.terms.map((term, idx) => (
                    <div 
                      key={idx}
                      className={`border rounded-lg overflow-hidden transition-all ${
                        expandedTerm === `${category.id}-${idx}` 
                          ? 'border-amber-300 bg-amber-50' 
                          : 'hover:border-amber-200'
                      }`}
                    >
                      <div 
                        className="p-3 cursor-pointer"
                        onClick={() => setExpandedTerm(
                          expandedTerm === `${category.id}-${idx}` ? null : `${category.id}-${idx}`
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">{term.term}</span>
                          {expandedTerm === `${category.id}-${idx}` ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        {expandedTerm === `${category.id}-${idx}` && (
                          <div className="mt-3 space-y-2">
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-1">解释</p>
                              <p className="text-sm text-slate-700">{term.description}</p>
                            </div>
                            {term.usage && (
                              <div>
                                <p className="text-xs font-medium text-slate-500 mb-1">使用示例</p>
                                <p className="text-sm text-slate-600 italic">{term.usage}</p>
                              </div>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                // 跳转到相关专题
                                router.push('/learn/geography/framework');
                              }}
                            >
                              在框架中学习
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}

          {filteredCategories.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">没有找到相关术语</p>
                <p className="text-sm text-muted-foreground mt-1">试试其他关键词</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 快速链接 */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">💡 快速学习建议</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push('/learn/geography/framework')}
              >
                知识框架
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push('/learn/geography/framework/templates')}
              >
                答题模板
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => router.push('/learn/geography/map')}
              >
                交互地图
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function GlossaryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <GlossaryPageContent />
    </Suspense>
  );
}
