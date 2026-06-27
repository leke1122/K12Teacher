'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, CalendarDays, CreditCard, GitBranch, FileText, Trophy } from 'lucide-react';
import type { HistoryLearningProgress, StepKey, StepStatus } from '@/lib/historyProgress';

interface HistoryProgressBarProps {
  progress: HistoryLearningProgress | null;
}

const STEPS: { key: StepKey; label: string; icon: React.ReactNode }[] = [
  { key: 'textbook', label: '课本还原', icon: <BookOpen className="h-4 w-4" /> },
  { key: 'knowledge', label: '知识点学习', icon: <Brain className="h-4 w-4" /> },
  { key: 'timeline', label: '时间轴', icon: <CalendarDays className="h-4 w-4" /> },
  { key: 'cards', label: '历史卡牌', icon: <CreditCard className="h-4 w-4" /> },
  { key: 'causalChain', label: '因果链', icon: <GitBranch className="h-4 w-4" /> },
  { key: 'analysis', label: '材料分析', icon: <FileText className="h-4 w-4" /> },
];

function StepStatusBadge({ status }: { status: StepStatus }) {
  if (status === 'completed') {
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">已完成</Badge>;
  }
  if (status === 'in_progress') {
    return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">进行中</Badge>;
  }
  return <Badge variant="outline" className="text-xs">未开始</Badge>;
}

function HistoryProgressBar({ progress }: HistoryProgressBarProps) {
  const steps = progress?.steps;

  const overallProgress = steps
    ? Math.round(
        (Object.values(steps).filter((s) => s.status === 'completed').length / STEPS.length) * 100,
      )
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3 pt-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          学习进度报告
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>整体进度</span>
            <span>{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="space-y-3">
          {STEPS.map((step) => {
            const status = steps?.[step.key]?.status || 'not_started';
            const stepProgress = status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0;

            return (
              <div key={step.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{step.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{step.label}</span>
                  </div>
                  <StepStatusBadge status={status} />
                </div>
                <Progress value={stepProgress} className="h-1.5" />
              </div>
            );
          })}
        </div>

        {progress?.completedAt && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-800 font-medium">🎉 恭喜！你已完成本章所有学习步骤</p>
            <p className="text-xs text-amber-700 mt-1">
              完成时间：{new Date(progress.completedAt).toLocaleString('zh-CN')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { HistoryProgressBar };
