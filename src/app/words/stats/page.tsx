'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactECharts from 'echarts-for-react';
import {
  ArrowLeft, BookOpen, Award, Target, Flame, Calendar,
  TrendingUp, AlertCircle, Clock, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ExportButton from '@/components/words/ExportButton';

interface Stats {
  total: number;
  learned: number;
  mastered: number;
  toReview: number;
  todayLearned: number;
  streakDays: number;
  weeklyLearned: number;
}

interface DailyRecord {
  date: string;
  learned: number;
  reviewed: number;
}

interface WordRecord {
  id: string;
  word: string;
  phonetic: string;
  part_of_speech: string;
  meaning: string;
  example: string;
  translation: string;
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  frequency_level: 'high' | 'medium' | 'low';
}

// 获取本周的日期范围
function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

// 生成过去30天的日期数组
function getLast30Days(): string[] {
  const dates: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats>({
    total: 0, learned: 0, mastered: 0, toReview: 0, todayLearned: 0, streakDays: 0, weeklyLearned: 0
  });
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [masteredByLevel, setMasteredByLevel] = useState<{ high: number; medium: number; low: number }>({ high: 0, medium: 0, low: 0 });

  // 加载统计数据
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, recordsRes, masteredRes] = await Promise.all([
        fetch('/api/words/stats'),
        fetch('/api/words/daily'),
        fetch('/api/words/list?status=mastered&limit=1000'),
      ]);

      const [statsData, recordsData, masteredData] = await Promise.all([
        statsRes.json(),
        recordsRes.json(),
        masteredRes.json(),
      ]);

      if (statsData.success) {
        setStats(statsData.stats);
      }

      if (recordsData.success) {
        setDailyRecords(recordsData.records || []);
      }

      if (masteredData.success && masteredData.words) {
        const levelCount = { high: 0, medium: 0, low: 0 };
        masteredData.words.forEach((w: WordRecord) => {
          levelCount[w.frequency_level]++;
        });
        setMasteredByLevel(levelCount);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 学习趋势图配置
  const trendOption = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>学习: {c} 词',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dailyRecords.map(r => r.date.slice(5)),
      axisLabel: {
        fontSize: 10,
        color: '#94a3b8',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: '#94a3b8',
      },
    },
    series: [
      {
        name: '学习词数',
        type: 'line',
        smooth: true,
        data: dailyRecords.map(r => r.learned),
        lineStyle: {
          color: '#6366f1',
          width: 2,
        },
        itemStyle: {
          color: '#6366f1',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.05)' },
            ],
          },
        },
      },
    ],
  };

  // 词频分布饼图配置
  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        fontSize: 12,
        color: '#64748b',
      },
    },
    series: [
      {
        name: '掌握分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: [
          { value: masteredByLevel.high, name: '高频词', itemStyle: { color: '#ef4444' } },
          { value: masteredByLevel.medium, name: '中频词', itemStyle: { color: '#f59e0b' } },
          { value: masteredByLevel.low, name: '低频词', itemStyle: { color: '#22c55e' } },
        ],
      },
    ],
  };

  // 学习日历热力图数据（过去30天）
  const last30Days = getLast30Days();
  const calendarData = last30Days.map(date => {
    const record = dailyRecords.find(r => r.date === date);
    return {
      date,
      value: record?.learned || 0,
    };
  });

  // 热力图配置
  const calendarOption = {
    tooltip: {
      formatter: (params: any) => `${params.value[1]} 词`,
    },
    visualMap: {
      min: 0,
      max: 50,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 20,
      inRange: {
        color: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5'],
      },
      textStyle: {
        color: '#64748b',
        fontSize: 10,
      },
    },
    calendar: {
      top: 30,
      left: 30,
      right: 30,
      cellSize: ['auto', 15],
      range: [last30Days[0], last30Days[last30Days.length - 1]],
      itemStyle: {
        borderWidth: 2,
        borderColor: '#f1f5f9',
        borderRadius: 3,
      },
      yearLabel: { show: false },
      monthLabel: { show: false },
      dayLabel: { 
        firstDay: 1,
        nameMap: 'cn',
        fontSize: 10,
        color: '#94a3b8',
      },
    },
    series: [{
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: calendarData.map(d => [d.date, d.value]),
    }],
  };

  // 计算本周数据
  const weekRange = getWeekRange();
  const weekRecords = dailyRecords.filter(r => r.date >= weekRange.start && r.date <= weekRange.end);
  const weekTotal = weekRecords.reduce((sum, r) => sum + r.learned, 0);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 pb-8">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-indigo-500" />
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  学习统计
                </h1>
              </div>
            </div>
            <ExportButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 总览卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-indigo-100 to-indigo-50 border-indigo-200">
            <CardContent className="p-4 text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-indigo-500" />
              <p className="text-2xl font-bold text-indigo-700">{stats.streakDays}</p>
              <p className="text-xs text-indigo-600">连续学习天数</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-green-700">{stats.mastered}</p>
              <p className="text-xs text-green-600">已掌握单词</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-100 to-amber-50 border-amber-200">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold text-amber-700">{weekTotal}</p>
              <p className="text-xs text-amber-600">本周学习</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-100 to-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <Flame className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <p className="text-2xl font-bold text-red-700">{stats.todayLearned}</p>
              <p className="text-xs text-red-600">今日学习</p>
            </CardContent>
          </Card>
        </div>

        {/* 学习日历 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" />
              学习日历
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calendarData.some(d => d.value > 0) ? (
              <ReactECharts option={calendarOption} style={{ height: 200 }} />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>暂无学习记录</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 趋势图和分布图 */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 学习趋势 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                学习趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyRecords.length > 0 ? (
                <ReactECharts option={trendOption} style={{ height: 250 }} />
              ) : (
                <div className="h-[250px] flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>暂无数据</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 词频分布 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                掌握分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-indigo-600">{stats.mastered}</p>
                  <p className="text-sm text-slate-500">已掌握</p>
                </div>
              </div>
              {stats.mastered > 0 ? (
                <ReactECharts option={pieOption} style={{ height: 200 }} />
              ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>暂无数据</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 详细数据 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              数据详情
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.total}</p>
                <p className="text-sm text-slate-500">单词总数</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.learned}</p>
                <p className="text-sm text-slate-500">正在学习</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.toReview}</p>
                <p className="text-sm text-slate-500">待复习</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}%
                </p>
                <p className="text-sm text-slate-500">掌握率</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最近学习记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              最近学习记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyRecords.length > 0 ? (
              <div className="space-y-2">
                {dailyRecords.slice(0, 7).map((record) => (
                  <div
                    key={record.date}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {new Date(record.date).toLocaleDateString('zh-CN', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'long',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="text-xs">
                        学习 {record.learned} 词
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        复习 {record.reviewed} 次
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>暂无学习记录</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
