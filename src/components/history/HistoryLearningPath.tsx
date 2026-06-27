'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Circle,
  Loader2,
  BookOpen,
  Brain,
  CalendarDays,
  CreditCard,
  GitBranch,
  FileText,
  ChevronRight,
  Lock,
} from 'lucide-react';
import type { StepKey, StepStatus, HistoryLearningProgress } from '@/lib/historyProgress';

interface HistoryLearningPathProps {
  progress: HistoryLearningProgress | null;
  onStepClick: (step: StepKey) => void;
}

const STEP_ORDER: { key: StepKey; label: string; description: string; href: string; icon: React.ReactNode }[] = [
  {
    key: 'textbook',
    label: '课本还原',
    description: '理解教材基础',
    href: '/learn/history/textbook',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    key: 'knowledge',
    label: '知识点学习',
    description: '提取核心概念',
    href: '/learn/history/knowledge',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    key: 'timeline',
    label: '时间轴',
    description: '梳理事件脉络',
    href: '/learn/history/timeline/modern-china',
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    key: 'cards',
    label: '历史卡牌',
    description: '巩固历史记忆',
    href: '/learn/history/cards',
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    key: 'causalChain',
    label: '因果链',
    description: '理解事件逻辑',
    href: '/learn/history/timeline/modern-china',
    icon: <GitBranch className="h-5 w-5" />,
  },
  {
    key: 'analysis',
    label: '材料分析',
    description: '实战大题训练',
    href: '/learn/history/analysis',
    icon: <FileText className="h-5 w-5" />,
  },
];

const STEP_KEYS = STEP_ORDER.map((s) => s.key);

function StepStatusIcon({ status }: { status: StepStatus }) {
  if (status === 'completed') {
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  }
  if (status === 'in_progress') {
    return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
  }
  return <Circle className="h-5 w-5 text-slate-300" />;
}

function HistoryLearningPath({ progress, onStepClick }: HistoryLearningPathProps) {
  const statuses = useMemo(() => {
    if (!progress) {
      return STEP_KEYS.reduce<Record<StepKey, StepStatus>>((acc, key) => {
        acc[key] = 'not_started';
        return acc;
      }, {} as Record<StepKey, StepStatus>);
    }
    return STEP_KEYS.reduce<Record<StepKey, StepStatus>>((acc, key) => {
      acc[key] = progress.steps[key]?.status || 'not_started';
      return acc;
    }, {} as Record<StepKey, StepStatus>);
  }, [progress]);

  const currentStepIndex = progress?.currentStep ?? 0;

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">你的学习路径</p>
          <Badge variant="outline" className="text-xs">
            共 {STEP_ORDER.length} 步
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {STEP_ORDER.map((step, idx) => {
            const status = statuses[step.key];
            const isCurrent = idx === currentStepIndex;
            const isLocked = !isCurrent && status === 'not_started' && idx > currentStepIndex;

            return (
              <div
                key={step.key}
                className={`rounded-xl border p-3 transition-all ${
                  isCurrent
                    ? 'border-blue-300 bg-blue-50/60'
                    : status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <StepStatusIcon status={status} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-slate-500">第{idx + 1}步</span>
                      {isCurrent && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">当前</Badge>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      {step.icon}
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {status === 'not_started' && !isLocked && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          onClick={() => onStepClick(step.key)}
                        >
                          开始学习
                        </Button>
                      )}
                      {status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs px-2"
                          onClick={() => onStepClick(step.key)}
                        >
                          继续学习
                        </Button>
                      )}
                      {status === 'completed' && (
                        <span className="text-xs text-emerald-700 flex items-center gap-1">
                          已完成 <CheckCircle2 className="h-3 w-3" />
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          未解锁 <Lock className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export { HistoryLearningPath };
export type { StepKey, StepStatus, HistoryLearningProgress };
