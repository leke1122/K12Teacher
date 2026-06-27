'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSettingsStore } from "@/stores/settingsStore";
import { useSubjectStore, SUBJECTS } from "@/stores/subjectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookMarked } from "lucide-react";

const DailyAccumulation = dynamic(
  () => import('@/components/dashboard/DailyAccumulation').then(mod => mod.DailyAccumulation),
  { ssr: false, loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded-xl" /> }
);

const FocusTimer = dynamic(
  () => import('@/components/ui/FocusTimer').then(mod => mod.FocusTimer),
  { ssr: false, loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded-xl" /> }
);

interface WrongStats {
  total: number;
  today: number;
  unmastered: number;
  bySubject: Record<string, number>;
}

export default function Home() {
  const { settings } = useSettingsStore();
  const { currentSubject } = useSubjectStore();
  const subject = SUBJECTS.find((s) => s.id === currentSubject);
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
    <div className="space-y-6 text-base">
      <h1 className="text-3xl font-bold">MyK12teacher 首页</h1>

      {/* 快捷入口行 */}
      <div className="grid grid-cols-3 gap-3">
        {SUBJECTS.map((s) => (
          <Card
            key={s.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/subjects/${s.id}`)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-4xl mb-1">{s.icon}</div>
              <div className="font-medium text-base">{s.name}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 每日积累 + 错题本 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DailyAccumulation />

        {/* 错题本卡片 */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-red-500" />
              错题本
              {stats && stats.today > 0 && (
                <span className="ml-auto text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                  今日 +{stats.today}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats ? (
              <>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xl font-bold text-red-500">{stats.total}</div>
                    <div className="text-xs text-muted-foreground">总错题</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-500">{stats.today}</div>
                    <div className="text-xs text-muted-foreground">今日新增</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-orange-500">{stats.unmastered}</div>
                    <div className="text-xs text-muted-foreground">未掌握</div>
                  </div>
                </div>

                {/* 按学科分类 */}
                {Object.keys(stats.bySubject).length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {Object.entries(stats.bySubject)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([sid, count]) => {
                        const s = SUBJECTS.find((s) => s.id === sid);
                        return (
                          <div key={sid} className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded px-2 py-0.5">
                            <span className="text-xs">{s?.icon || '📚'}</span>
                            <span className="text-xs font-medium">{count}题</span>
                          </div>
                        );
                      })}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1 text-xs"
                  onClick={() => router.push('/wrong-questions')}
                >
                  查看错题本 <ArrowRight className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-sm text-muted-foreground">暂无错题记录</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 text-xs"
                  onClick={() => router.push('/wrong-questions')}
                >
                  开始练习 →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 专注计时 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">⏱️ 专注学习</CardTitle>
          </CardHeader>
          <CardContent>
            <FocusTimer subjectId={currentSubject || undefined} />
          </CardContent>
        </Card>
      </div>

      {/* 当前学科 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-2xl">{subject?.icon}</span>
            当前学科：{subject?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground">
            选择左侧学科开始学习之旅
          </p>
        </CardContent>
      </Card>

      {!hasApiKey && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-base text-yellow-800 dark:text-yellow-200">
              ⚠️ 请前往设置页面配置 API Key
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
