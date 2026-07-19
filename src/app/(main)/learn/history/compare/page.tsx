'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExamFrequencyBadge } from '@/components/history/ExamFrequencyBadge';
import { DimensionBadge } from '@/components/history/DimensionBadge';
import { comparisonTables, getComparisonsByUnitId } from '@/data/history/comparisons';
import { releasedUnits, getUnitById } from '@/data/history/units';
import type { ComparisonTable, CurriculumDimension } from '@/types/history';
import { 
  ArrowLeft, Search, GitCompare, CheckCircle2, Circle, 
  ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterDimension, setFilterDimension] = useState<string>('all');
  const [filterFrequency, setFilterFrequency] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredComparisons = useMemo(() => {
    return comparisonTables.filter(table => {
      if (filterUnit !== 'all' && table.unitId !== filterUnit) return false;
      if (filterDimension !== 'all' && table.curriculumDimension !== filterDimension) return false;
      if (filterFrequency !== 'all' && table.examFrequency !== filterFrequency) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return table.title.toLowerCase().includes(term) ||
               table.leftEntity.name.toLowerCase().includes(term) ||
               table.rightEntity.name.toLowerCase().includes(term);
      }
      return true;
    });
  }, [filterUnit, filterDimension, filterFrequency, searchTerm]);

  const selectedComparison = useMemo(() => 
    comparisonTables.find(t => t.id === selectedId),
    [selectedId]
  );

  const toggleRow = (rowKey: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
    }
    setExpandedRows(newExpanded);
  };

  const dimensions: CurriculumDimension[] = [
    '制度变化与创新', '民族交融', '区域开发', '思想文化'
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-blue-50/30">
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
              <GitCompare className="h-6 w-6 text-blue-500" />
              表格对比
            </h1>
            <p className="text-sm text-muted-foreground">
              {comparisonTables.length} 个对比表 · 点击查看详情
            </p>
          </div>
        </div>

        {/* 筛选器 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="搜索对比表..."
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
                {dimensions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select 
                className="border rounded-md px-3 py-2 text-sm"
                value={filterFrequency}
                onChange={(e) => setFilterFrequency(e.target.value)}
              >
                <option value="all">全部考频</option>
                <option value="★★★">★★★ 高频大题</option>
                <option value="★★☆">★★☆ 高频选择</option>
                <option value="★☆☆">★☆☆ 一般了解</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 对比表列表和详情 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧列表 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>对比表列表</span>
                <Badge variant="outline">{filteredComparisons.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                {filteredComparisons.map((table) => {
                  const unit = getUnitById(table.unitId);
                  const isSelected = selectedId === table.id;
                  
                  return (
                    <button
                      key={table.id}
                      onClick={() => setSelectedId(table.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected 
                          ? 'border-blue-400 bg-blue-50 shadow-md' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm truncate">{table.title}</span>
                            <ExamFrequencyBadge frequency={table.examFrequency} showLabel={false} />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{unit?.name}</span>
                            <span>·</span>
                            <DimensionBadge dimension={table.curriculumDimension} size="sm" />
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                      </div>
                    </button>
                  );
                })}
                
                {filteredComparisons.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>未找到匹配的对比例表</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 右侧详情 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {selectedComparison ? selectedComparison.title : '选择对比表查看详情'}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {selectedComparison ? (
                <ComparisonDetail comparison={selectedComparison} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <GitCompare className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p>请从左侧选择一个对比表</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ComparisonDetail({ comparison }: { comparison: ComparisonTable }) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([0, 1, 2]));

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="space-y-4">
      {/* 顶部信息 */}
      <div className="flex flex-wrap gap-2">
        <ExamFrequencyBadge frequency={comparison.examFrequency} />
        <DimensionBadge dimension={comparison.curriculumDimension} />
      </div>

      {/* 对比表 */}
      <div className="border rounded-lg overflow-hidden">
        {/* 表头 */}
        <div className="grid grid-cols-3 bg-slate-100 border-b">
          <div className="p-3 font-medium text-sm">维度</div>
          <div className="p-3 font-medium text-sm bg-amber-50 text-amber-800 border-l">
            {comparison.leftEntity.name}
            <span className="block text-xs font-normal text-amber-600">{comparison.leftEntity.dynasty}</span>
          </div>
          <div className="p-3 font-medium text-sm bg-emerald-50 text-emerald-800 border-l">
            {comparison.rightEntity.name}
            <span className="block text-xs font-normal text-emerald-600">{comparison.rightEntity.dynasty}</span>
          </div>
        </div>

        {/* 维度行 */}
        {comparison.dimensions.map((dim, index) => {
          const isExpanded = expandedRows.has(index);
          const leftVal = comparison.leftEntity.attributes[dim] || '-';
          const rightVal = comparison.rightEntity.attributes[dim] || '-';
          
          return (
            <div key={dim} className="border-b last:border-b-0">
              <button
                onClick={() => toggleRow(index)}
                className="w-full grid grid-cols-3 hover:bg-slate-50 transition-colors"
              >
                <div className="p-3 text-sm font-medium flex items-center gap-1">
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {dim}
                </div>
                <div className="p-3 text-sm border-l bg-amber-50/50">{leftVal}</div>
                <div className="p-3 text-sm border-l bg-emerald-50/50">{rightVal}</div>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 grid grid-cols-3 text-xs">
                  <div></div>
                  <div className="border-l px-2 text-slate-600">{leftVal}</div>
                  <div className="border-l px-2 text-slate-600">{rightVal}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 相同点 */}
      {comparison.similarities.length > 0 && (
        <div className="p-3 rounded-lg bg-slate-100">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            相同点
          </h4>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            {comparison.similarities.map((sim, i) => (
              <li key={i}>{sim}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 不同点 */}
      {comparison.differences.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-1 text-amber-800">
            ⚡ 不同点
          </h4>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {comparison.differences.map((diff, i) => (
              <li key={i}>{diff}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 关联真题 */}
      {comparison.relatedExams && comparison.relatedExams.length > 0 && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <h4 className="font-medium text-sm mb-2 text-blue-800">📝 关联真题</h4>
          <div className="flex flex-wrap gap-1">
            {comparison.relatedExams.map((exam, i) => (
              <Badge key={i} variant="outline" className="bg-white">{exam}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
