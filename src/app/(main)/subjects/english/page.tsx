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
  GraduationCap,
  Brain,
  MessageSquare,
  PenTool,
  Mic,
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
              🔤
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">英语</h1>
              <p className="text-xs text-muted-foreground">
                单词 · 语法 · 阅读 · 写作 · 听力 · 高考综合
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            高考英语学习
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
                <Badge className="bg-blue-100 text-blue-700">核心</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                科学记忆，循复习巩固，词汇量稳步增长
              </p>
              <div className="flex justify-end">
                <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
                  开始学习
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 语法学习 */}
          <Card
            className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 group"
            onClick={() => router.push('/learn/english/grammar')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <span className="text-3xl">📖</span>
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    语法学习
                  </span>
                </CardTitle>
                <Badge className="bg-violet-100 text-violet-700">8阶段43点</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                体系化语法，涵盖高考全部考点
              </p>
              <div className="flex justify-end">
                <Button size="sm" className="bg-violet-500 hover:bg-violet-600">
                  开始学习
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 其他功能入口 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 阅读理解 */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => router.push('/learn/english/reading')}
          >
            <CardContent className="p-4 text-center">
              <BookText className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
              <h3 className="font-semibold text-sm mb-1">阅读理解</h3>
              <p className="text-xs text-muted-foreground">文章精读与技巧</p>
            </CardContent>
          </Card>

          {/* 写作训练 */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => router.push('/learn/english/writing')}
          >
            <CardContent className="p-4 text-center">
              <PenLine className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <h3 className="font-semibold text-sm mb-1">写作训练</h3>
              <p className="text-xs text-muted-foreground">高分范文与练习</p>
            </CardContent>
          </Card>

          {/* 听力训练 */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => router.push('/learn/english/listening')}
          >
            <CardContent className="p-4 text-center">
              <Headphones className="h-8 w-8 mx-auto mb-2 text-rose-500" />
              <h3 className="font-semibold text-sm mb-1">听力训练</h3>
              <p className="text-xs text-muted-foreground">听说读写综合</p>
            </CardContent>
          </Card>

          {/* 高考综合 */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => router.push('/learn/english/practice')}
          >
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold text-sm mb-1">高考综合</h3>
              <p className="text-xs text-muted-foreground">真题模拟训练</p>
            </CardContent>
          </Card>
        </div>

        {/* 学习路径 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              学习路径
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EnglishLearningPath
              progress={progress}
              onStepClick={handleStepClick}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
}

export default function EnglishSubjectPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EnglishHubContent />
    </Suspense>
  );
}
