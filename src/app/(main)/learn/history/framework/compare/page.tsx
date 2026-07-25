'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Search, GitCompare, MapPin
} from 'lucide-react';
import {
  SAME_YEAR_COMPARISONS
} from '@/data/history/framework/historyData';

export default function ComparePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showLiaoningOnly, setShowLiaoningOnly] = useState(false);

  const filteredComparisons = SAME_YEAR_COMPARISONS.filter(comp => {
    const matchesSearch = 
      comp.year.includes(searchTerm) ||
      comp.china.includes(searchTerm) ||
      comp.world.includes(searchTerm) ||
      comp.angle.includes(searchTerm);
    const matchesLiaoning = showLiaoningOnly ? comp.isLiaoning : true;
    return matchesSearch && matchesLiaoning;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/learn/history/framework')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <GitCompare className="h-6 w-6 text-purple-500" />
              中外同年对比
            </h1>
            <p className="text-sm text-muted-foreground">选择题"同年"题型必杀神器</p>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="搜索年份..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showLiaoningOnly ? 'default' : 'outline'}
            onClick={() => setShowLiaoningOnly(!showLiaoningOnly)}
            className={showLiaoningOnly ? '' : 'text-red-600 border-red-200'}
          >
            <MapPin className="h-4 w-4 mr-1" />
            辽宁
          </Button>
        </div>

        {/* 对比列表 */}
        <div className="space-y-3">
          {filteredComparisons.map((comp, index) => (
            <Card key={index} className={comp.isLiaoning ? 'border-red-200 bg-red-50/30' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {comp.year}
                  </Badge>
                  {comp.isLiaoning && (
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                      <MapPin className="h-3 w-3 mr-1" />
                      辽宁
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-1 text-sm">🇨🇳 中国</h4>
                    <p className="text-slate-700">{comp.china}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-700 mb-1 text-sm">🌍 世界</h4>
                    <p className="text-slate-700">{comp.world}</p>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-700 mb-1 text-sm">🎯 考查角度</h4>
                  <p className="text-slate-700">{comp.angle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredComparisons.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>没有找到匹配的对比</p>
          </div>
        )}

        {/* 提示 */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-purple-800 mb-2">💡 使用技巧</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• 选择题常考"某年中外同时发生了什么"</li>
              <li>• 先看材料年份，再定位到本表对应行</li>
              <li>• 注意区分"中外同时"和"中外不同"的事件</li>
              <li>• 辽宁标注的同年对比是辽宁卷高频考点</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
