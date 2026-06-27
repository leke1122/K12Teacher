'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Sparkles, BookOpen, BarChart3, ChevronRight, History } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProgress, getRecords } from '@/lib/chineseLanguageProgress';
import { ChineseLanguageProgress, LanguagePracticeRecord } from '@/lib/chineseLanguage';

const TYPE_NAMES: Record<string, string> = {
  idiom: '成语',
  sentence: '病句',
  fill: '补写',
  rhetoric: '修辞',
};

export default function ChineseLanguagePage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ChineseLanguageProgress | null>(null);
  const [records, setRecords] = useState<LanguagePracticeRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(getProgress());
    setRecords(getRecords().slice(0, 10));
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/30">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/subjects/chinese">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                📝 语言文字运用
              </h1>
              <p className="text-xs text-muted-foreground">高考语文专项训练 · 语段阅读 + 混合题型</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {/* 统计卡片 */}
        {progress && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{progress.totalPractices}</p>
                <p className="text-xs text-muted-foreground">训练次数</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{progress.totalQuestions}</p>
                <p className="text-xs text-muted-foreground">总题数</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{Math.round(progress.accuracy * 100)}%</p>
                <p className="text-xs text-muted-foreground">总正确率</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{progress.correctCount}</p>
                <p className="text-xs text-muted-foreground">正确题数</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 主入口卡片 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/learn/chinese/language/practice')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-base">综合训练</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mb-4">语段阅读 + 混合题型，AI出题并自动批改</p>
              <Button className="w-full">开始训练</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push('/learn/chinese/language/knowledge')}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-base">知识卡片</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mb-4">成语、病句、补写、修辞四大题型知识点</p>
              <Button variant="outline" className="w-full">查看详情</Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-base">薄弱题型</CardTitle>
              </div>
              <div className="space-y-2 mb-4">
                {progress && Object.entries(progress.typeStats).map(([type, stat]) => {
                  const acc = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                  const isWeak = stat.total > 0 && acc < 60;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-xs">{TYPE_NAMES[type]}</span>
                      <span className={isWeak ? 'text-xs text-destructive font-medium' : 'text-xs text-muted-foreground'}>
                        {stat.total > 0 ? `${acc}% (${stat.correct}/${stat.total})` : '暂无数据'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 各题型准确率 */}
        {progress && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">各题型正确率</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(progress.typeStats).map(([type, stat]) => {
                const acc = stat.total > 0 ? stat.correct / stat.total : 0;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{TYPE_NAMES[type]}</span>
                      <span className="text-muted-foreground">{stat.correct}/{stat.total}</span>
                    </div>
                    <Progress value={acc * 100} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* 训练历史 */}
        {records.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                训练历史
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {records.map((record) => {
                const types = [...new Set(record.answers.map(() => ''))];
                return (
                  <div key={record.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{new Date(record.createdAt).toLocaleDateString()}</span>
                      <Badge variant="outline" className="text-xs">{Math.round(record.score * 100)}%</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{record.answers.length} 题</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
