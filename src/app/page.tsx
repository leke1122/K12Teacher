'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSettingsStore } from "@/stores/settingsStore";
import { useSubjectStore, SUBJECTS } from "@/stores/subjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookMarked, BarChart3, ListChecks, Link2, Ruler, Sparkles } from "lucide-react";

const LearningStatsCard = dynamic(
  () => import('@/components/dashboard/LearningStatsCard').then(mod => mod.LearningStatsCard),
  { ssr: false, loading: () => <div className="h-64 animate-pulse bg-gray-100 rounded-xl" /> }
);

const FEATURE_SHORTCUTS = [
  { href: '/history', icon: ListChecks, label: '学习记录', color: 'blue' },
  { href: '/analysis', icon: BarChart3, label: '薄弱分析', color: 'amber' },
  { href: '/wrong-questions', icon: BookMarked, label: '错题本', color: 'red' },
  { href: '/connect', icon: Link2, label: '串联学习', color: 'purple' },
  { href: '/learn/math/geogebra', icon: Ruler, label: 'GeoGebra', color: 'emerald' },
];

const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', hover: 'hover:border-blue-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', hover: 'hover:border-amber-400' },
  red: { bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800', hover: 'hover:border-red-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', hover: 'hover:border-purple-400' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', hover: 'hover:border-emerald-400' },
};

interface WrongStats {
  total: number;
  today: number;
  unmastered: number;
  bySubject: Record<string, number>;
}

export default function Home() {
  const { settings } = useSettingsStore();
  const { currentSubject } = useSubjectStore();
  const router = useRouter();

  const [stats, setStats] = useState<WrongStats | null>(null);

  useEffect(() => {
    fetch('/api/wrong-questions/stats')
      .then((res) => res.json())
      .then((json) => { if (json.success) setStats(json); })
      .catch(() => {});
  }, []);

  const hasApiKey = settings?.deepseekKey && settings?.qwenKey;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MyK12teacher 高中学习助手
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          智能学习 · 高效备考 · 个性化提升
        </p>
      </div>

      {/* Feature Shortcuts */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
          <h2 className="text-base sm:text-lg font-semibold">快捷功能</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {FEATURE_SHORTCUTS.map((feature) => {
            const colors = colorMap[feature.color];
            const Icon = feature.icon;
            return (
              <Link key={feature.href} href={feature.href}>
                <Card className={`cursor-pointer transition-all duration-200 ${colors.bg} ${colors.border} ${colors.hover} hover:shadow-md hover:-translate-y-0.5`}>
                  <CardContent className="p-3 sm:p-4 text-center">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${colors.bg} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${colors.text}`} />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{feature.label}</span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Subjects */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>学科选择</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 sm:gap-3">
            {SUBJECTS.map((s) => (
              <Card
                key={s.id}
                className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                onClick={() => router.push(`/subjects/${s.id}`)}
              >
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className="text-3xl sm:text-4xl mb-1 group-hover:scale-110 transition-transform">{s.icon}</div>
                  <div className="font-medium text-xs sm:text-sm group-hover:text-primary transition-colors">{s.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Middle Column - Wrong Questions */}
        <div className="lg:col-span-1">
          <Card className="border-red-200 dark:border-red-900 h-full">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                <BookMarked className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                错题本
                {stats && stats.today > 0 && (
                  <span className="ml-auto text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                    今日 +{stats.today}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {stats ? (
                <>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                    <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-950/30 rounded-lg sm:rounded-xl">
                      <div className="text-xl sm:text-2xl font-bold text-red-500">{stats.total}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">总错题</div>
                    </div>
                    <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg sm:rounded-xl">
                      <div className="text-xl sm:text-2xl font-bold text-amber-500">{stats.today}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">今日新增</div>
                    </div>
                    <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg sm:rounded-xl">
                      <div className="text-xl sm:text-2xl font-bold text-orange-500">{stats.unmastered}</div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">未掌握</div>
                    </div>
                  </div>

                  {Object.keys(stats.bySubject).length > 0 && (
                    <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                      {Object.entries(stats.bySubject)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 4)
                        .map(([sid, count]) => {
                          const s = SUBJECTS.find((s) => s.id === sid);
                          return (
                            <div key={sid} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
                              <span className="text-xs">{s?.icon || '📚'}</span>
                              <span className="text-xs font-medium">{count}题</span>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full gap-2 text-xs sm:text-sm"
                    onClick={() => router.push('/wrong-questions')}
                  >
                    查看错题本 <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <div className="text-3xl sm:text-4xl mb-2">📝</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">暂无错题记录</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/wrong-questions')}
                  >
                    开始练习 <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Learning Stats */}
        <div className="lg:col-span-1">
          <LearningStatsCard />
        </div>
      </div>

      {/* API Key Warning */}
      {!hasApiKey && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="flex items-center gap-3 p-3 sm:p-4">
            <span className="text-xl">⚠️</span>
            <p className="text-sm sm:text-base text-yellow-800 dark:text-yellow-200">
              请前往设置页面配置 API Key
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
