'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ExamFrequencyBadge } from '@/components/history/ExamFrequencyBadge';
import { DimensionBadge } from '@/components/history/DimensionBadge';
import { confusionPairs, getConfusionsByUnitId } from '@/data/history/confusions';
import { releasedUnits, getUnitById } from '@/data/history/units';
import type { ConfusionPair, ConfusionStatus } from '@/types/history';
import { 
  ArrowLeft, Search, AlertTriangle, CheckCircle2, Circle,
  RotateCcw, Brain, Eye
} from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<ConfusionStatus, { label: string; icon: string; color: string }> = {
  'new': { label: '未学', icon: '⚪', color: 'bg-slate-100' },
  'mastered': { label: '已掌握', icon: '✅', color: 'bg-emerald-100 text-emerald-700' },
  'still-confused': { label: '仍易错', icon: '🔴', color: 'bg-red-100 text-red-700' },
};

export default function ConfusionsPage() {
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterDimension, setFilterDimension] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [showFastReview, setShowFastReview] = useState(false);

  const filteredConfusions = useMemo(() => {
    let result = confusionPairs;
    
    if (filterUnit !== 'all') result = result.filter(c => c.unitId === filterUnit);
    if (filterDimension !== 'all') result = result.filter(c => c.curriculumDimension === filterDimension);
    if (filterStatus !== 'all') result = result.filter(c => c.userStatus === filterStatus);
    
    if (showFastReview) {
      result = result.filter(c => c.userStatus === 'still-confused');
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.termA.toLowerCase().includes(term) ||
        c.termB.toLowerCase().includes(term) ||
        c.distinction.toLowerCase().includes(term)
      );
    }
    
    return result;
  }, [filterUnit, filterDimension, filterStatus, searchTerm, showFastReview]);

  const toggleFlip = (id: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(id)) {
      newFlipped.delete(id);
    } else {
      newFlipped.add(id);
    }
    setFlippedCards(newFlipped);
  };

  const stillConfusedCount = confusionPairs.filter(c => c.userStatus === 'still-confused').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/subjects/history">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Brain className="h-6 w-6 text-orange-500" />
              易混辨析
            </h1>
            <p className="text-sm text-muted-foreground">
              {confusionPairs.length} 组易混辨析 · 点击卡片翻转查看详情
            </p>
          </div>
          {stillConfusedCount > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setShowFastReview(!showFastReview)}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              快速复习 ({stillConfusedCount})
            </Button>
          )}
        </div>

        {/* 筛选器 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="搜索易混词..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <select 
                className="border rounded-md px-3 py-2 text-sm"
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
              >
                <option value="all">全部单元</option>
                {releasedUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>

              <select 
                className="border rounded-md px-3 py-2 text-sm"
                value={filterDimension}
                onChange={(e) => setFilterDimension(e.target.value)}
              >
                <option value="all">全部维度</option>
                <option value="制度变化与创新">制度变化与创新</option>
                <option value="民族交融">民族交融</option>
                <option value="区域开发">区域开发</option>
                <option value="思想文化">思想文化</option>
              </select>

              <select 
                className="border rounded-md px-3 py-2 text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">全部状态</option>
                <option value="new">未学</option>
                <option value="mastered">已掌握</option>
                <option value="still-confused">仍易错</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <div className="flex gap-4 mb-4">
          <Card className="flex-1">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Circle className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{confusionPairs.filter(c => c.userStatus === 'new').length}</p>
                <p className="text-xs text-muted-foreground">未学</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{confusionPairs.filter(c => c.userStatus === 'mastered').length}</p>
                <p className="text-xs text-muted-foreground">已掌握</p>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stillConfusedCount}</p>
                <p className="text-xs text-muted-foreground">仍易错</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConfusions.map((pair) => {
            const unit = getUnitById(pair.unitId);
            const isFlipped = flippedCards.has(pair.id);
            const status = statusConfig[pair.userStatus];
            
            return (
              <Card 
                key={pair.id}
                className={`cursor-pointer transition-all duration-300 ${isFlipped ? 'ring-2 ring-orange-400' : ''}`}
                onClick={() => toggleFlip(pair.id)}
              >
                <CardContent className="p-4">
                  {/* 正面 */}
                  <div className={`space-y-3 ${isFlipped ? 'hidden' : ''}`}>
                    <div className="flex items-center justify-between">
                      <Badge className={status.color}>{status.label}</Badge>
                      <DimensionBadge dimension={pair.curriculumDimension} size="sm" />
                    </div>
                    
                    <div className="text-center py-2">
                      <div className="flex items-center justify-center gap-2 text-lg font-bold">
                        <span className="text-blue-700">{pair.termA}</span>
                        <span className="text-slate-400">≠</span>
                        <span className="text-red-700">{pair.termB}</span>
                      </div>
                      {'termB2' in pair && pair.termB2 && (
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-1">
                          <span className="text-slate-400">≠</span>
                          <span className="text-red-700">{pair.termB2}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{unit?.name}</span>
                      <Eye className="h-3 w-3" />
                      <span>点击翻转查看辨析</span>
                    </div>
                  </div>
                  
                  {/* 反面 */}
                  <div className={`space-y-3 ${isFlipped ? '' : 'hidden'}`}>
                    <div className="text-xs text-muted-foreground mb-2">辨析要点</div>
                    
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <h4 className="font-medium text-sm text-amber-800 mb-2">⚡ 核心区别</h4>
                      <p className="text-sm text-amber-700 leading-relaxed">{pair.distinction}</p>
                    </div>
                    
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <h4 className="font-medium text-sm text-red-800 mb-2">⚠️ 常见陷阱</h4>
                      <p className="text-sm text-red-700 leading-relaxed">{pair.commonTrap}</p>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFlip(pair.id);
                      }}
                    >
                      翻回正面
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredConfusions.length === 0 && (
          <Card className="p-12 text-center">
            <Brain className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <p className="text-muted-foreground">未找到匹配的易混辨析</p>
          </Card>
        )}
      </div>
    </div>
  );
}
