'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import type { HistoryLearningProgress, StepKey, StepStatus } from '@/lib/historyProgress';

interface HistoryGuideProps {
  progress: HistoryLearningProgress | null;
  onAction: (step: StepKey) => void;
}

const STEP_ORDER: StepKey[] = [
  'textbook',
  'knowledge',
  'timeline',
  'cards',
  'causalChain',
  'analysis',
];

const HINTS: Record<StepKey, { notStarted: string; inProgress: string; completed: string; next?: string }> = {
  textbook: {
    notStarted: '从📖课本还原开始，理解教材基础知识',
    inProgress: '继续阅读课本，尝试完成当前章节的学习',
    completed: '很好！课本还原已完成，建议进行🧠知识点学习',
    next: 'knowledge',
  },
  knowledge: {
    notStarted: '课本还原已完成，开始🧠知识点学习，提取核心概念',
    inProgress: '正在学习知识点，建议结合课本内容加深理解',
    completed: '知识点已掌握，继续📜时间轴梳理历史事件脉络',
    next: 'timeline',
  },
  timeline: {
    notStarted: '知识点已梳理，开始📜时间轴了解历史发展脉络',
    inProgress: '时间轴学习进行中，可以点击事件查看详情',
    completed: '时间轴已掌握，用📝历史卡牌巩固记忆',
    next: 'cards',
  },
  cards: {
    notStarted: '时间轴已完成，用📝历史卡牌巩固记忆',
    inProgress: '卡牌记忆训练中，定期复习效果更好',
    completed: '记忆已巩固，通过🔗因果链深化理解',
    next: 'causalChain',
  },
  causalChain: {
    notStarted: '历史脉络已清晰，通过🔗因果链理解事件逻辑',
    inProgress: '正在分析因果链，思考事件之间的逻辑关系',
    completed: '逻辑分析完成，开始📊材料分析实战训练',
    next: 'analysis',
  },
  analysis: {
    notStarted: '基础已打牢，开始📊材料分析实战训练',
    inProgress: '正在练习材料分析，尝试独立完成思考',
    completed: '🎉 你已完成本章所有学习！可以继续训练或复习薄弱环节',
  },
};

function getCurrentStepStatus(progress: HistoryLearningProgress | null): { step: StepKey; status: StepStatus } | null {
  if (!progress) return null;
  const idx = progress.currentStep;
  const step = STEP_ORDER[idx] || 'textbook';
  return { step, status: progress.steps[step]?.status || 'not_started' };
}

function HistoryGuide({ progress, onAction }: HistoryGuideProps) {
  const current = useMemo(() => getCurrentStepStatus(progress), [progress]);

  if (!current) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          正在加载学习进度...
        </CardContent>
      </Card>
    );
  }

  const { step, status } = current;
  const hint = HINTS[step] || HINTS.textbook;
  const message = status === 'not_started' ? hint.notStarted : status === 'in_progress' ? hint.inProgress : hint.completed;
  const nextStep = hint.next ? STEP_ORDER.find((s) => s === hint.next) : null;

  return (
    <Card className="bg-blue-50/60 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Lightbulb className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800 mb-1">📚 学习引导</p>
            <p className="text-sm text-blue-700 leading-relaxed">{message}</p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {status !== 'completed' && (
                <Button size="sm" onClick={() => onAction(step)} className="gap-1">
                  开始学习
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {status === 'completed' && nextStep && (
                <Button size="sm" onClick={() => onAction(nextStep)} className="gap-1">
                  继续下一步
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              {status === 'completed' && !nextStep && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  全部完成
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { HistoryGuide };
