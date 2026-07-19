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
  Headphones,
  Sparkles,
  Zap,
  ShieldOff,
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-sky-50/40">
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

        {/* 核心功能入口卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 单词学习 - 突出显示 */}
          <Card
            className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 group"
            onClick={() => router.push('/words')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <span className="text-3xl">📚</span>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    单词学习
                  </span>
                </CardTitle>
                <Badge className="bg-blue-500 text-white group-hover:bg-blue-600 transition-colors">
                  <Zap className="h-3 w-3 mr-1" />
                  核心功能
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                涵盖高考必备3500词，智能记忆曲线，自动复习已掌握单词。支持拼写练习、错词本、学习统计。
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs bg-white">3500+词汇</Badge>
                <Badge variant="outline" className="text-xs bg-white">艾宾浩斯</Badge>
                <Badge variant="outline" className="text-xs bg-white">拼写练习</Badge>
                <Badge variant="outline" className="text-xs bg-white">离线可用</Badge>
              </div>
              <Button className="w-full mt-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 group-hover:shadow-lg transition-all">
                <Sparkles className="h-4 w-4 mr-2" />
                开始学习
              </Button>
            </CardContent>
          </Card>

          {/* 听力训练 - 灰化禁用 */}
          <Card className="opacity-50 cursor-not-allowed select-none border-dashed border-slate-300 bg-slate-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <span className="text-3xl">🎧</span>
                  <span className="text-slate-400">听力训练</span>
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  <ShieldOff className="h-3 w-3 mr-1" />
                  暂不可用
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-400 leading-relaxed">
                功能开发中，预计近期上线。涵盖日常对话、校园场景、学术讲座、新闻播报等听力材料。
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">日常对话</Badge>
                <Badge variant="outline" className="text-xs">校园场景</Badge>
                <Badge variant="outline" className="text-xs">学术讲座</Badge>
                <Badge variant="outline" className="text-xs">新闻播报</Badge>
              </div>
              <Button disabled className="w-full mt-2" variant="outline">
                敬请期待
              </Button>
            </CardContent>
          </Card>
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
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <EnglishHubContent />
    </Suspense>
  );
}
