'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3, Clock, BookOpen, GraduationCap, AlertCircle,
  Calendar, TrendingUp, Target, Loader2, Sparkles
} from 'lucide-react';
import { getLearningRecords, type LearningRecord } from '@/lib/learningService';

// 学习模式配置
const ACTIVITY_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  words: { label: '背单词', icon: '📖', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  knowledge: { label: '知识点', icon: '💡', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  textbook: { label: '课本还原', icon: '📚', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  practice: { label: '章节练习', icon: '✍️', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  geogebra: { label: 'GeoGebra', icon: '📐', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  timeline: { label: '时间轴', icon: '⏰', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  card: { label: '卡片学习', icon: '🃏', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
  causal: { label: '因果链', icon: '🔗', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  analysis: { label: '材料分析', icon: '📊', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  essay: { label: '作文', icon: '✏️', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  discrimination: { label: '辨析', icon: '⚖️', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  synthesis: { label: '综合', icon: '🎯', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  listening: { label: '听力', icon: '🎧', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  grammar: { label: '语法', icon: '📝', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400' },
  reading: { label: '阅读', icon: '📄', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
  writing: { label: '写作', icon: '📝', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-400' },
  other: { label: '其他', icon: '📋', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

// 学科颜色
const SUBJECT_COLORS: Record<string, string> = {
  '英语': '#3b82f6', '数学': '#8b5cf6', '物理': '#06b6d4',
  '化学': '#10b981', '语文': '#f59e0b', '生物': '#ef4444',
  '地理': '#84cc16', '政治': '#ec4899', '历史': '#a855f7',
};

interface DailyStats {
  date: string;
  dateLabel: string;
  totalMinutes: number;
  bySubject: Record<string, number>;
  byActivity: Record<string, number>;
}

interface OverallStats {
  totalMinutes: number;
  recordCount: number;
  subjectDistribution: Record<string, number>;
  activityDistribution: Record<string, number>;
  dailyStats: DailyStats[];
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}分钟`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = dateStr.split('T')[0];
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateOnly === todayStr) return '今天';
  if (dateOnly === yesterdayStr) return '昨天';
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });
}

export function LearningStatsCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [stats, setStats] = useState<OverallStats | null>(null);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const { records } = await getLearningRecords();

      if (!records || records.length === 0) {
        setStats({
          totalMinutes: 0,
          recordCount: 0,
          subjectDistribution: {},
          activityDistribution: {},
          dailyStats: [],
        });
        return;
      }

      // 计算时间范围
      const now = new Date();
      const cutoff = new Date();
      if (period === 'today') {
        cutoff.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        cutoff.setDate(cutoff.getDate() - 7);
      } else if (period === 'month') {
        cutoff.setDate(cutoff.getDate() - 30);
      }

      // 过滤记录
      const filtered = records.filter(r => {
        const recordDate = new Date(r.start_time);
        return recordDate >= cutoff;
      });

      // 计算统计数据
      const subjectDist: Record<string, number> = {};
      const activityDist: Record<string, number> = {};
      const dailyMap: Record<string, DailyStats> = {};
      let totalSeconds = 0;

      for (const r of filtered) {
        const subject = r.subject_name || r.subject_id || '其他';
        const activity = r.activity_type || 'other';
        const seconds = r.duration_seconds || 0;
        const dateStr = r.start_time?.split('T')[0] || 'unknown';

        // 学科分布
        subjectDist[subject] = (subjectDist[subject] || 0) + seconds;

        // 活动分布
        activityDist[activity] = (activityDist[activity] || 0) + seconds;

        // 每日统计
        if (!dailyMap[dateStr]) {
          dailyMap[dateStr] = {
            date: dateStr,
            dateLabel: getDateLabel(dateStr),
            totalMinutes: 0,
            bySubject: {},
            byActivity: {},
          };
        }
        dailyMap[dateStr].totalMinutes += Math.round(seconds / 60);
        dailyMap[dateStr].bySubject[subject] = (dailyMap[dateStr].bySubject[subject] || 0) + seconds;
        dailyMap[dateStr].byActivity[activity] = (dailyMap[dateStr].byActivity[activity] || 0) + seconds;

        totalSeconds += seconds;
      }

      // 排序每日统计
      const dailyStats = Object.values(dailyMap)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, period === 'today' ? 1 : period === 'week' ? 7 : 30);

      setStats({
        totalMinutes: Math.round(totalSeconds / 60),
        recordCount: filtered.length,
        subjectDistribution: subjectDist,
        activityDistribution: activityDist,
        dailyStats,
      });
    } catch (err) {
      console.error('加载学习统计失败:', err);
      setError('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 渲染学科分布
  const renderSubjectChart = () => {
    if (!stats || Object.keys(stats.subjectDistribution).length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">暂无数据</p>
        </div>
      );
    }

    const entries = Object.entries(stats.subjectDistribution)
      .sort((a, b) => b[1] - a[1]);

    const maxValue = Math.max(...entries.map(([, v]) => v));

    return (
      <div className="space-y-3">
        {entries.map(([subject, seconds]) => {
          const percentage = Math.round((seconds / maxValue) * 100);
          const color = SUBJECT_COLORS[subject] || '#94a3b8';

          return (
            <div key={subject} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{subject}</span>
                <span className="text-muted-foreground">{formatDuration(seconds)}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染活动模式分布
  const renderActivityChart = () => {
    if (!stats || Object.keys(stats.activityDistribution).length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">暂无数据</p>
        </div>
      );
    }

    const entries = Object.entries(stats.activityDistribution)
      .sort((a, b) => b[1] - a[1]);

    return (
      <div className="flex flex-wrap gap-2">
        {entries.map(([activity, seconds]) => {
          const config = ACTIVITY_CONFIG[activity] || ACTIVITY_CONFIG.other;
          return (
            <div
              key={activity}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${config.color}`}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              <span className="opacity-70">{formatDuration(seconds)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染每日趋势
  const renderDailyTrend = () => {
    if (!stats || stats.dailyStats.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">暂无数据</p>
        </div>
      );
    }

    const maxMinutes = Math.max(...stats.dailyStats.map(d => d.totalMinutes), 1);

    return (
      <div className="space-y-3">
        {stats.dailyStats.slice().reverse().map((day) => (
          <div key={day.date} className="flex items-center gap-3">
            <div className="w-12 text-xs text-muted-foreground text-right">
              {day.dateLabel}
            </div>
            <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                style={{ width: `${Math.max((day.totalMinutes / maxMinutes) * 100, day.totalMinutes > 0 ? 8 : 0)}%` }}
              >
                {day.totalMinutes > 0 && (
                  <span className="text-xs text-white font-medium whitespace-nowrap">
                    {formatDuration(day.totalMinutes * 60)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            学习时长统计
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            学习时长统计
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-500" />
            学习时长统计
          </CardTitle>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)} className="h-8">
            <TabsList className="h-7 text-xs">
              <TabsTrigger value="today" className="text-xs px-2 py-1">今天</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-2 py-1">本周</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2 py-1">本月</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 总览数据 */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg p-3">
              <div className="text-2xl font-bold">{formatDuration(stats.totalMinutes * 60)}</div>
              <div className="text-xs opacity-80">总学习时长</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-lg p-3">
              <div className="text-2xl font-bold">{stats.recordCount}</div>
              <div className="text-xs opacity-80">学习记录</div>
            </div>
          </div>
        )}

        {/* Tab 切换 */}
        <Tabs defaultValue="subject" className="text-sm">
          <TabsList className="w-full h-8">
            <TabsTrigger value="subject" className="text-xs gap-1">
              <GraduationCap className="h-3 w-3" />
              学科
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-xs gap-1">
              <Target className="h-3 w-3" />
              模式
            </TabsTrigger>
            <TabsTrigger value="trend" className="text-xs gap-1">
              <TrendingUp className="h-3 w-3" />
              趋势
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subject" className="mt-3">
            {renderSubjectChart()}
          </TabsContent>

          <TabsContent value="activity" className="mt-3">
            {renderActivityChart()}
          </TabsContent>

          <TabsContent value="trend" className="mt-3">
            {renderDailyTrend()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
