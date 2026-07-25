'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExamFrequencyBadge } from '@/components/history/ExamFrequencyBadge';
import { 
  liaoningExams, examTrends, liaoningLocalKnowledge,
  getExamsByUnitId, getExamsByYear 
} from '@/data/history/liaoning';
import { releasedUnits, getUnitById } from '@/data/history/units';
import { 
  ArrowLeft, FileText, TrendingUp, MapPin, Calendar,
  BarChart3, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import type { LiaoningExam, ExamTrend } from '@/types/history';
import { AutoHideHeader } from '@/components/ui/AutoHideHeader';

export default function LiaoningPage() {
  const [activeTab, setActiveTab] = useState('exams');
  const [selectedExam, setSelectedExam] = useState<LiaoningExam | null>(null);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-red-50/30">
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
              <FileText className="h-6 w-6 text-red-500" />
              辽宁高考专版
            </h1>
            <p className="text-sm text-muted-foreground">
              辽宁卷真题 · 考情分析 · 本土考点
            </p>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700">
            {liaoningExams.length} 道真题
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="exams" className="gap-1">
              <FileText className="h-4 w-4" />
              真题明细
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-1">
              <TrendingUp className="h-4 w-4" />
              命题趋势
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="gap-1">
              <BarChart3 className="h-4 w-4" />
              考频热力图
            </TabsTrigger>
            <TabsTrigger value="local" className="gap-1">
              <MapPin className="h-4 w-4" />
              辽宁本土考点
            </TabsTrigger>
          </TabsList>

          {/* 真题明细 */}
          <TabsContent value="exams">
            <ExamTable exams={liaoningExams} onSelect={setSelectedExam} />
          </TabsContent>

          {/* 命题趋势 */}
          <TabsContent value="trends">
            <TrendsPanel />
          </TabsContent>

          {/* 考频热力图 */}
          <TabsContent value="heatmap">
            <HeatmapPanel />
          </TabsContent>

          {/* 辽宁本土考点 */}
          <TabsContent value="local">
            <LocalKnowledgePanel />
          </TabsContent>
        </Tabs>

        {/* 真题详情弹窗 */}
        {selectedExam && (
          <ExamDetailDialog exam={selectedExam} onClose={() => setSelectedExam(null)} />
        )}
      </div>
    </div>
  );
}

function ExamTable({ exams, onSelect }: { exams: LiaoningExam[]; onSelect: (e: LiaoningExam) => void }) {
  const [filterUnit, setFilterUnit] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      if (filterUnit !== 'all' && exam.unitId !== filterUnit) return false;
      if (filterYear !== 'all' && exam.year !== parseInt(filterYear)) return false;
      if (filterType !== 'all' && exam.questionType !== filterType) return false;
      return true;
    });
  }, [exams, filterUnit, filterYear, filterType]);

  const years = [...new Set(exams.map(e => e.year))].sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      {/* 筛选器 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
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
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="all">全部年份</option>
              {years.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>

            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">全部题型</option>
              <option value="选择">选择题</option>
              <option value="论述">论述题</option>
              <option value="材料">材料题</option>
            </select>

            <Badge variant="outline" className="self-center ml-auto">
              {filteredExams.length} 题
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 表格 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">年份</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">题号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">题型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">分值</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">单元</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">考点</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">考频</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredExams.map((exam) => {
                  const unit = getUnitById(exam.unitId);
                  return (
                    <tr 
                      key={exam.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => onSelect(exam)}
                    >
                      <td className="px-4 py-3 text-sm">
                        {exam.year} {exam.paperSet}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{exam.questionNo}</td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant="outline">{exam.questionType}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{exam.score}分</td>
                      <td className="px-4 py-3 text-sm">{unit?.name}</td>
                      <td className="px-4 py-3 text-sm max-w-[200px] truncate">
                        {exam.knowledgePoint}
                      </td>
                      <td className="px-4 py-3">
                        <ExamFrequencyBadge frequency={exam.examFrequency} showLabel={false} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExamDetailDialog({ exam, onClose }: { exam: LiaoningExam; onClose: () => void }) {
  const unit = getUnitById(exam.unitId);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800" onClick={e => e.stopPropagation()}>
        <CardHeader className="sticky top-0 bg-white dark:bg-slate-800 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-500" />
              {exam.year}年 {exam.paperSet}卷 第{exam.questionNo}题
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{exam.questionType}</Badge>
            <Badge variant="outline">{exam.score}分</Badge>
            <Badge variant="outline">{unit?.name}</Badge>
            <ExamFrequencyBadge frequency={exam.examFrequency} />
            {exam.materialType && <Badge className="bg-purple-100 text-purple-700">{exam.materialType}</Badge>}
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium mb-2">📝 知识点</h4>
            <p className="text-sm">{exam.knowledgePoint}</p>
          </div>

          {exam.question && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium mb-2 text-blue-800">📖 真题</h4>
              <p className="text-sm leading-relaxed">{exam.question}</p>
            </div>
          )}

          {exam.options && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium mb-2">选项</h4>
              {exam.options.map((opt, i) => (
                <div key={i} className="text-sm mb-1">{String.fromCharCode(65 + i)}. {opt}</div>
              ))}
            </div>
          )}

          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="font-medium mb-2 text-emerald-800">✅ 答案</h4>
            <p className="text-lg font-bold text-emerald-700">{exam.answer}</p>
          </div>

          {exam.analysis && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium mb-2 text-amber-800">💡 解析</h4>
              <p className="text-sm leading-relaxed text-amber-700">{exam.analysis}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TrendsPanel() {
  return (
    <div className="space-y-4">
      {examTrends.map((trend) => {
        const unit = getUnitById(trend.unitId);
        return (
          <Card key={trend.unitId}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-red-500" />
                {unit?.name} 命题趋势
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed bg-slate-50 p-3 rounded-lg">
                {trend.summary}
              </p>
              
              <div>
                <h4 className="font-medium text-sm mb-2">📌 高频考点</h4>
                <div className="flex flex-wrap gap-2">
                  {trend.highFrequencyTopics.map((topic, i) => (
                    <Badge key={i} variant="outline" className="bg-red-50">{topic}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">📄 命题载体</h4>
                <div className="flex flex-wrap gap-2">
                  {trend.carrierTypes.map((type, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-50">{type}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function HeatmapPanel() {
  // 简单热力图展示
  const units = releasedUnits;
  const years = [2021, 2022, 2023, 2024, 2025];
  
  const getCount = (unitId: string, year: number) => {
    return liaoningExams.filter(e => e.unitId === unitId && e.year === year).length;
  };

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-slate-100';
    if (count === 1) return 'bg-yellow-200';
    if (count === 2) return 'bg-orange-300';
    return 'bg-red-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-red-500" />
          考频热力图
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-medium">单元</th>
                {years.map(year => (
                  <th key={year} className="p-2 text-center text-xs font-medium">{year}</th>
                ))}
                <th className="p-2 text-center text-xs font-medium">总计</th>
              </tr>
            </thead>
            <tbody>
              {units.map(unit => {
                const total = liaoningExams.filter(e => e.unitId === unit.id).length;
                return (
                  <tr key={unit.id} className="border-t">
                    <td className="p-2 text-sm font-medium">{unit.name}</td>
                    {years.map(year => {
                      const count = getCount(unit.id, year);
                      return (
                        <td key={year} className="p-2 text-center">
                          <span className={`inline-block w-8 h-8 rounded ${getHeatColor(count)} flex items-center justify-center text-sm font-medium`}>
                            {count || '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-2 text-center font-bold">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span>图例：</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-slate-100"></span> 0题</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-yellow-200"></span> 1题</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-orange-300"></span> 2题</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-400"></span> 3+题</span>
        </div>
      </CardContent>
    </Card>
  );
}

function LocalKnowledgePanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {liaoningLocalKnowledge.map((item) => (
        <Card key={item.id} className="border-l-4 border-l-red-400">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-500" />
              {item.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{item.location}</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed mb-3">{item.description}</p>
            <div className="flex flex-wrap gap-1">
              {item.knowledgePoints.map((kp, i) => (
                <Badge key={i} variant="outline" className="text-xs">{kp}</Badge>
              ))}
            </div>
            {item.relatedExams.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground">关联真题：{item.relatedExams.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
