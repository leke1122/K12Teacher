'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, TrendingUp, Star, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GRAMMAR_EXAM_FOCUS, ALL_GRAMMAR_POINTS } from '@/data/grammarData';

export default function GrammarExamFocusPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const categories = ['全部', ...Array.from(new Set(GRAMMAR_EXAM_FOCUS.map(g => g.category)))];
  const filtered = selectedCategory === '全部'
    ? GRAMMAR_EXAM_FOCUS
    : GRAMMAR_EXAM_FOCUS.filter(g => g.category === selectedCategory);

  const getPoint = (id: string) => ALL_GRAMMAR_POINTS.find(p => p.id === id);

  const topPoints = filtered.slice(0, 15);
  const otherPoints = filtered.slice(15);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-red-50/30">
      <div className="w-full px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* 顶部 */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-red-500" />
              高考语法考点速查
            </h1>
            <p className="text-xs text-muted-foreground">
              按高考权重排序 · 优先掌握高频考点
            </p>
          </div>
        </div>

        {/* 说明 */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">权重说明</p>
                <p className="text-xs text-red-600 mt-1">
                  权重值越高表示高考考查频率越高。高频考点（权重≥20）需优先掌握，中频考点（15-20）需熟练，低频考点（&lt;15）需了解。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 分类筛选 */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat)}
              className="text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* 排名列表 */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            高频考点 TOP {topPoints.length}
          </h3>

          {topPoints.map((item, index) => {
            const point = getPoint(item.id);
            const weightPercent = Math.min((item.weight / 30) * 100, 100);
            return (
              <Card
                key={item.id}
                className="cursor-pointer hover:border-red-200 hover:shadow-sm transition-all"
                onClick={() => router.push(`/learn/english/grammar?highlight=${item.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* 排名 */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index < 3 ? 'bg-red-100 text-red-700' :
                      index < 10 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {index + 1}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            item.weight >= 20 ? 'bg-red-50 text-red-600' :
                            item.weight >= 15 ? 'bg-orange-50 text-orange-600' :
                            'bg-slate-50 text-slate-500'
                          }`}
                        >
                          权重 #{item.weight}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                      </div>

                      {/* 权重条 */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.weight >= 20 ? 'bg-red-500' :
                              item.weight >= 15 ? 'bg-orange-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${weightPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {item.weight}
                        </span>
                      </div>

                      {/* 高考考查形式 */}
                      {point?.examType && (
                        <div className="flex gap-1 mt-2">
                          {point.examType.map((t, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-white">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 跳转按钮 */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/learn/english/grammar?highlight=${item.id}`);
                      }}
                    >
                      <BookOpen className="h-4 w-4" />
                      学习
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {otherPoints.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-slate-600 flex items-center gap-2 mt-6">
                <BookOpen className="h-4 w-4" />
                其他考点
              </h3>
              {otherPoints.map((item, index) => {
                const point = getPoint(item.id);
                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:border-slate-200 transition-all"
                    onClick={() => router.push(`/learn/english/grammar?highlight=${item.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">#{filtered.indexOf(item) + 1}</span>
                        <span className="text-sm font-medium text-slate-700 flex-1">{item.name}</span>
                        <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                        <Badge variant="outline" className="text-xs">权重 {item.weight}</Badge>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">
                          学习 →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
