'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen, Clock, CheckCircle, AlertCircle,
  Play, Eye, GraduationCap, Calendar, ArrowLeft,
  X, Trash2, AlertTriangle, BarChart3, BookMarked,
  Filter, Sparkles, GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSubjectStore } from '@/stores/subjectStore';
import { useHistoryStore } from '@/stores/historyStore';
import { LearningRecord, deleteLearningRecord } from '@/services/supabaseService';
import { formatDuration } from '@/components/learning/Timer';
import { getLearningStats, getLearningRecords, type LearningRecord as SessionRecord } from '@/lib/learningService';
import ReactECharts from 'echarts-for-react';

interface LocalLearningRecord extends LearningRecord {}

const SUBJECT_COLORS: Record<string, string> = {
  '英语': '#3b82f6', '数学': '#8b5cf6', '物理': '#06b6d4',
  '化学': '#10b981', '语文': '#f59e0b', '生物': '#ef4444',
  '地理': '#84cc16', '政治': '#ec4899', '历史': '#a855f7',
};

const ACTIVITY_CONFIG: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  words: { label: '单词学习', icon: BookOpen, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  knowledge: { label: '知识点学习', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  textbook: { label: '课本还原', icon: BookOpen, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  practice: { label: '章节练习', icon: AlertCircle, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  geogebra: { label: 'GeoGebra 探索', icon: Sparkles, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  timeline: { label: '时间轴', icon: Clock, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  card: { label: '卡片学习', icon: BookOpen, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  causal: { label: '因果链', icon: GitBranch, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  analysis: { label: '材料分析', icon: AlertCircle, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  essay: { label: '作文', icon: BookOpen, color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  discrimination: { label: '辨析', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  synthesis: { label: '综合', icon: GraduationCap, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  'current-affairs': { label: '时政', icon: Clock, color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  other: { label: '其他学习', icon: BookOpen, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
};

const SUBJECT_OPTIONS = [
  { id: 'all', name: '全部学科' },
  { id: 'chinese', name: '语文' },
  { id: 'math', name: '数学' },
  { id: 'english', name: '英语' },
  { id: 'physics', name: '物理' },
  { id: 'chemistry', name: '化学' },
  { id: 'biology', name: '生物' },
  { id: 'politics', name: '政治' },
  { id: 'history', name: '历史' },
  { id: 'geography', name: '地理' },
];

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
      <HistoryPageContent />
    </Suspense>
  );
}

function HistoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentSubject } = useSubjectStore();
  const { records, loading, setRecords, setLoading, addRecord, removeRecord, setStats, setLoading: setHistoryLoading } = useHistoryStore();
  const [view, setView] = useState<'detail' | 'stats'>('detail');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<SessionRecord | null>(null);
  const [stats, setStatsState] = useState<{
    totalMinutes: number;
    recordCount: number;
    subjects: Record<string, number>;
    dailyMinutes: { date: string; minutes: number }[];
  }>({ totalMinutes: 0, recordCount: 0, subjects: {}, dailyMinutes: [] });

  const loadSessions = async () => {
    setListLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        getLearningRecords(subjectFilter === 'all' ? undefined : { subject: subjectFilter }),
        getLearningStats('week'),
      ]);
      setSessions(listRes.records);
      setStatsState({
        totalMinutes: statsRes.totalMinutes,
        recordCount: statsRes.recordCount,
        subjects: statsRes.subjects,
        dailyMinutes: statsRes.dailyMinutes,
      });
    } catch (err) {
      console.error('获取学习记录失败:', err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectFilter]);

  useEffect(() => {
    const resumeId = searchParams.get('recordId');
    if (resumeId && !sessions.length && !listLoading) {
      loadSessions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const groupedSessions = useMemo(() => {
    const groups: Record<string, SessionRecord[]> = {};
    sessions.forEach((session) => {
      const dateKey = session.start_time ? new Date(session.start_time).toISOString().split('T')[0] : '未知日期';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(session);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, recs]) => ({
        date,
        dateLabel: formatDateLabel(date),
        records: recs.sort((a, b) => new Date(b.start_time || 0).getTime() - new Date(a.start_time || 0).getTime()),
      }));
  }, [sessions]);

  const formatDateLabel = (dateKey: string) => {
    if (dateKey === '未知日期') return dateKey;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateKey === today) return '今天';
    if (dateKey === yesterday) return '昨天';
    const date = new Date(dateKey);
    return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '--';
    const date = new Date(iso);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderActivityDescription = (record: SessionRecord) => {
    const detail = (record.activity_detail || {}) as Record<string, unknown>;
    const subject = record.subject_name || record.subject_id || '未知学科';
    const chapter = record.chapter_id ? `第${record.chapter_id}章` : '';
    const section = record.section_id ? `第${record.section_id}节` : '';
    const position = [chapter, section].filter(Boolean).join(' › ') || '未指定位置';

    switch (record.activity_type) {
      case 'words': {
        const wordCount = typeof detail.wordCount === 'number' ? detail.wordCount : undefined;
        const masteredCount = typeof detail.masteredCount === 'number' ? detail.masteredCount : undefined;
        const modeText = detail.mode === 'practice' ? '复习' : '学习';
        const parts = [`${subject} ${modeText}单词`];
        if (wordCount !== undefined) parts.push(`共 ${wordCount} 词`);
        if (masteredCount !== undefined) parts.push(`掌握 ${masteredCount} 词`);
        return parts.join('，');
      }
      case 'knowledge':
        return `${subject} 知识点学习 · ${position}`;
      case 'textbook':
        return `${subject} 课本还原 · ${position}`;
      case 'practice': {
        const questionCount = typeof detail.questionCount === 'number' ? detail.questionCount : undefined;
        const parts = [`${subject} 练习 · ${position}`];
        if (questionCount !== undefined) parts.push(`共 ${questionCount} 题`);
        return parts.join('，');
      }
      case 'geogebra':
        return `${subject} 使用 GeoGebra 探索 · ${position || '互动模型'}`;
      case 'timeline':
        return `${subject} 时间轴学习 · ${position}`;
      case 'card':
        return `${subject} 卡片学习 · ${position}`;
      case 'causal':
        return `${subject} 因果链学习 · ${position}`;
      case 'analysis':
        return `${subject} 材料分析 · ${position}`;
      case 'essay':
        return `${subject} 作文学习`;
      case 'discrimination':
        return `${subject} 辨析学习 · ${position}`;
      case 'synthesis':
        return `${subject} 综合学习 · ${position}`;
      case 'current-affairs':
        return `${subject} 时政学习`;
      default:
        return `${subject} 学习 · ${position}`;
    }
  };

  const handleDelete = async (record: SessionRecord) => {
    if (!confirm('确定要删除这条学习记录吗？')) return;
    try {
      await deleteLearningRecord(record.id);
    } catch {}
    try {
      const raw = localStorage.getItem('edumind_learning_records');
      if (raw) {
        const all = JSON.parse(raw) as LocalLearningRecord[];
        const filtered = all.filter(r => r.id !== record.id);
        localStorage.setItem('edumind_learning_records', JSON.stringify(filtered));
      }
    } catch {}
    removeRecord(record.id);
    setSelectedRecord(null);
    loadSessions();
  };

  const renderDetailSections = (record: SessionRecord) => {
    const detail = (record.activity_detail || {}) as Record<string, unknown>;
    const sectionTitle = typeof detail.sectionTitle === 'string' ? detail.sectionTitle : null;

    return (
      <div className="space-y-3">
        <Card className="p-4">
          <p className="text-xs text-slate-500 mb-1">学习内容</p>
          <p className="text-sm text-slate-700 dark:text-slate-300">{renderActivityDescription(record)}</p>
        </Card>
        {sectionTitle && (
          <Card className="p-4">
            <p className="text-xs text-slate-500 mb-1">章节标题</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{sectionTitle}</p>
          </Card>
        )}
        <Card className="p-4">
          <p className="text-xs text-slate-500 mb-1">学习时长</p>
          <p className="text-sm font-medium flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {formatDuration(record.duration_seconds || 0)}
          </p>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                📋 学习记录
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="bg-transparent text-sm text-slate-700 dark:text-slate-200 outline-none"
                >
                  {SUBJECT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id} className="text-slate-700">
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                variant={view === 'detail' ? 'default' : 'outline'}
                onClick={() => setView('detail')}
                className="gap-1"
              >
                <BookMarked className="h-4 w-4" />详情
              </Button>
              <Button
                size="sm"
                variant={view === 'stats' ? 'default' : 'outline'}
                onClick={() => setView('stats')}
                className="gap-1"
              >
                <BarChart3 className="h-4 w-4" />统计
              </Button>
              <Link href="/wrong-questions">
                <Button variant="outline" size="sm" className="gap-1 text-amber-600 border-amber-200 hover:bg-amber-50">
                  <AlertTriangle className="h-4 w-4" />错题集
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {view === 'stats' ? (
          <StatsView stats={stats} />
        ) : (
          <>
            {listLoading ? (
              <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>
            ) : groupedSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="h-8 w-8 text-slate-400" /></div>
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">暂无学习记录</h3>
                <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">开始学习后，记录会显示在这里</p>
                <Button onClick={() => router.push('/')}>去学习</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedSessions.map((group) => (
                  <div key={group.date} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <h2 className="text-base font-semibold text-slate-700 dark:text-slate-300">{group.dateLabel}</h2>
                      <span className="text-xs text-slate-400">{group.records.length} 条记录</span>
                    </div>
                    <div className="space-y-3 pl-5 border-l border-slate-200 dark:border-slate-700">
                      {group.records.map((record) => {
                        const config = ACTIVITY_CONFIG[record.activity_type] || ACTIVITY_CONFIG.other;
                        const Icon = config.icon;
                        const durationText = formatDuration(record.duration_seconds || 0);
                        const startLabel = formatDateTime(record.start_time);
                        const endLabel = record.end_time ? formatDateTime(record.end_time) : '进行中';

                        return (
                          <Card key={record.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                              <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium', config.color)}>
                                <Icon className="h-4 w-4" />
                                <span>{config.label}</span>
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  {renderActivityDescription(record)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {startLabel} - {endLabel} · 时长 {durationText}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => setSelectedRecord(record)} className="gap-1">
                                  <Eye className="h-3.5 w-3.5" />查看
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDelete(record)} className="gap-1 text-red-600 hover:text-red-700">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  学习详情
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">学科</p>
                    <p className="text-sm font-medium">{selectedRecord.subject_name || selectedRecord.subject_id}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">活动类型</p>
                    <p className="text-sm font-medium">{ACTIVITY_CONFIG[selectedRecord.activity_type]?.label || selectedRecord.activity_type}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">开始时间</p>
                    <p className="text-sm font-medium">{formatDateTime(selectedRecord.start_time)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">结束时间</p>
                    <p className="text-sm font-medium">{formatDateTime(selectedRecord.end_time)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">学习时长</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {formatDuration(selectedRecord.duration_seconds || 0)}
                    </p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">章节</p>
                    <p className="text-sm font-medium">
                      {selectedRecord.chapter_id ? `第${selectedRecord.chapter_id}章` : '--'} › {selectedRecord.section_id ? `第${selectedRecord.section_id}节` : '--'}
                    </p>
                  </Card>
                </div>
                {renderDetailSections(selectedRecord)}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => handleDelete(selectedRecord)} className="gap-1">
                    <Trash2 className="h-4 w-4" />删除
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedRecord(null)}>
                    <X className="h-4 w-4 mr-1" />关闭
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

function formatDurationNew(seconds: number | null): string {
  if (!seconds) return '--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}小时${m}分`;
  if (m > 0) return `${m}分`;
  return `${seconds}秒`;
}

function StatsView({
  stats,
}: {
  stats: {
    totalMinutes: number;
    recordCount: number;
    subjects: Record<string, number>;
    dailyMinutes: { date: string; minutes: number }[];
  };
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{stats.totalMinutes}</p>
            <p className="text-xs opacity-80 mt-1">总学习(分钟)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{stats.recordCount}</p>
            <p className="text-xs opacity-80 mt-1">学习记录(条)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-teal-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{Object.keys(stats.subjects).length}</p>
            <p className="text-xs opacity-80 mt-1">已学学科</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{Math.round(stats.totalMinutes / Math.max(stats.recordCount, 1))}</p>
            <p className="text-xs opacity-80 mt-1">平均时长(分钟)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">学科分布</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(stats.subjects).length > 0 ? (
              <ReactECharts
                option={{
                  tooltip: { trigger: 'item', formatter: '{b}: {c}分钟 ({d}%)' },
                  legend: { bottom: 0, type: 'scroll' as const },
                  series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    data: Object.entries(stats.subjects).map(([name, seconds]) => ({
                      name,
                      value: Math.round(seconds / 60),
                      itemStyle: { color: SUBJECT_COLORS[name] || '#94a3b8' },
                    })),
                  }],
                }}
                style={{ height: 220 }}
              />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-400">暂无数据</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">每日学习时长趋势</CardTitle></CardHeader>
          <CardContent>
            {stats.dailyMinutes.length > 0 ? (
              <ReactECharts
                option={{
                  tooltip: { trigger: 'axis' as const },
                  xAxis: {
                    type: 'category' as const,
                    data: stats.dailyMinutes.map((d) => d.date.slice(5)),
                    axisLabel: { fontSize: 10 },
                  },
                  yAxis: { type: 'value' as const, name: '分钟', axisLabel: { fontSize: 10 } },
                  series: [{
                    type: 'bar',
                    data: stats.dailyMinutes.map((d) => ({
                      value: d.minutes,
                      itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
                    })),
                  }],
                  grid: { left: 50, right: 20, top: 20, bottom: 40 },
                }}
                style={{ height: 220 }}
              />
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-400">暂无数据</div>
            )}
          </CardContent>
        </Card>
      </div>

      {Object.keys(stats.subjects).length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">各学科学习时长</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.subjects)
              .sort(([, a], [, b]) => b - a)
              .map(([name, seconds]) => {
                const minutes = Math.round(seconds / 60);
                const pct = Math.min(100, Math.round((minutes / Math.max(stats.totalMinutes, 1)) * 100));
                return (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: SUBJECT_COLORS[name] || '#94a3b8' }} />
                        {name}
                      </span>
                      <span className="text-slate-500">{formatDurationNew(minutes * 60)}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
