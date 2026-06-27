'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnglishLearningPath } from '@/components/english/EnglishLearningPath';
import {
  BookOpen,
  BookText,
  Languages,
  FileText,
  PenLine,
  Target,
  Loader2,
} from 'lucide-react';
import {
  STEP_ORDER,
  STEP_LABELS,
  STEP_DESCRIPTIONS,
  STEP_HREFS,
  type StepKey,
} from '@/lib/englishProgress';
import { useEnglishProgress } from '@/hooks/useEnglishProgress';

function EnglishHubContent() {
  const router = useRouter();
  const progress = useEnglishProgress('english');

  const handleStepClick = (step: StepKey) => {
    const href = STEP_HREFS[step];
    if (href) {
      router.push(href);
    }
  };

  const handleGuideAction = (step: StepKey) => {
    handleStepClick(step);
  };

  const currentStepLabel = STEP_LABELS[progress.currentStepKey];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50/40">
      <div className="w-full px-4 py-6 space-y-5">
        {/* 顶部标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-xl">
              🏴󠁧󠁢󠁥󠁮󠁧󠁿
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">英语学习中心</h1>
              <p className="text-xs text-muted-foreground">
                六步学习闭环，循序渐进攻克高考英语
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            全国新课标II卷 · 辽宁
          </Badge>
        </div>

        {/* 学习引导 */}
        <Card className="bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  {progress.isAllCompleted
                    ? '恭喜！你已完成所有学习步骤！'
                    : `当前建议：${currentStepLabel || '课本精读'}`}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {progress.isAllCompleted
                    ? '继续保持，多做练习巩固所学'
                    : '按顺序完成学习，逐步提升英语能力'}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleStepClick(progress.currentStepKey)}
              >
                {progress.isAllCompleted ? '复习' : '开始学习'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 学习路径 */}
        <EnglishLearningPath progress={progress.progress} onStepClick={handleStepClick} />

        {/* 进度报告 */}
        <Card>
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-amber-500">📊</span>
              学习进度报告
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>整体进度</span>
                <span>{progress.overallProgress}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-sky-500 transition-all duration-500"
                  style={{ width: `${progress.overallProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {STEP_ORDER.map((step) => {
                const status = progress.getStepStatus(step);
                const stepProgress = status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0;
                const stepLabel = STEP_LABELS[step];
                const stepIcon = getStepIcon(step);

                return (
                  <div key={step} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{stepIcon}</span>
                        <span className="text-sm font-medium text-slate-700">{stepLabel}</span>
                      </div>
                      {status === 'completed' && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">已完成</Badge>
                      )}
                      {status === 'in_progress' && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">进行中</Badge>
                      )}
                      {status === 'not_started' && (
                        <Badge variant="outline" className="text-xs">未开始</Badge>
                      )}
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          status === 'completed'
                            ? 'bg-emerald-500'
                            : status === 'in_progress'
                              ? 'bg-blue-500'
                              : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                        style={{ width: `${stepProgress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {progress.isAllCompleted && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs text-amber-800 font-medium">🎉 恭喜！你已完成英语学习的所有步骤</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 底部说明 */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              本路径适配全国新课标II卷（辽宁卷）高考英语要求。建议按顺序完成六步学习：
              课本精读 → 单词记忆 → 语法体系 → 阅读理解 → 写作训练 → 真题实战。
              每完成一步会自动解锁下一步。词汇要求3500词，听说读写全面覆盖。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getStepIcon(key: StepKey) {
  switch (key) {
    case 'textbook':
      return <BookOpen className="h-4 w-4" />;
    case 'words':
      return <BookText className="h-4 w-4" />;
    case 'grammar':
      return <Languages className="h-4 w-4" />;
    case 'reading':
      return <FileText className="h-4 w-4" />;
    case 'writing':
      return <PenLine className="h-4 w-4" />;
    case 'practice':
      return <Target className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

export default function EnglishPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <EnglishHubContent />
    </Suspense>
  );
}
