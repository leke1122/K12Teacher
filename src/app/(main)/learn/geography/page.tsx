'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HistoryLearningPath } from '@/components/history/HistoryLearningPath';
import { HistoryProgressBar } from '@/components/history/HistoryProgressBar';
import { HistoryGuide } from '@/components/history/HistoryGuide';
import { BookOpen, Brain, Map, GitCompare, CreditCard, GitBranch, FileText, Loader2 } from 'lucide-react';
import { useHistoryProgress } from '@/hooks/useHistoryProgress';
import type { StepKey } from '@/lib/historyProgress';
import { updateStepProgress } from '@/lib/geographyProgress';

function GeographyHubContent() {
  const router = useRouter();
  const historyProgress = useHistoryProgress('history', 'modern-china');

  const steps = [
    { key: 'textbook' as StepKey, label: '课本还原', description: '理解教材内容', href: '/learn/geography/textbook/compulsory-1', icon: <BookOpen className="h-5 w-5" /> },
    { key: 'knowledge' as StepKey, label: '知识点学习', description: '提取核心概念', href: '/learn/geography/knowledge/compulsory-1', icon: <Brain className="h-5 w-5" /> },
    { key: 'map' as StepKey, label: '交互地图', description: '可视化定位', href: '/learn/geography/map', icon: <Map className="h-5 w-5" /> },
    { key: 'compare' as StepKey, label: '区域对比', description: '区域特征比较', href: '/learn/geography/compare', icon: <GitCompare className="h-5 w-5" /> },
    { key: 'cards' as StepKey, label: '地理卡牌', description: '巩固记忆', href: '/learn/geography/cards', icon: <CreditCard className="h-5 w-5" /> },
    { key: 'location' as StepKey, label: '区位分析', description: '多因素综合分析', href: '/learn/geography/location', icon: <GitBranch className="h-5 w-5" /> },
    { key: 'practice' as StepKey, label: '综合题训练', description: '高考实战应用', href: '/learn/geography/practice', icon: <FileText className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-6 space-y-5">
        {/* 顶部标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">
              🌍
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">地理学习中心</h1>
              <p className="text-xs text-muted-foreground">七步学习闭环，循序渐进掌握地理</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            人教版（2019版）· 辽宁卷
          </Badge>
        </div>

        {/* 引导提示 */}
        <HistoryGuide
          progress={historyProgress.progress}
          onAction={(step: StepKey) => {
            const href = steps.find((s) => s.key === step)?.href;
            if (href) router.push(href);
          }}
        />

        {/* 学习路径 */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">你的学习路径</p>
              <Badge variant="outline" className="text-xs">
                共 {steps.length} 步
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {steps.map((step, idx) => (
                <div
                  key={step.key}
                  className={`rounded-xl border p-3 transition-all ${
                    idx === historyProgress.currentStepIndex
                      ? 'border-blue-300 bg-blue-50/60'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{step.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500">第{idx + 1}步</span>
                        {idx === historyProgress.currentStepIndex && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">当前</Badge>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{step.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant={idx === historyProgress.currentStepIndex ? 'default' : 'outline'}
                          className="h-7 text-xs px-2"
                          onClick={() => {
                            updateStepProgress('geography', 'compulsory-1', step.key as any, 'in_progress');
                            router.push(step.href);
                          }}
                        >
                          开始学习
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 进度报告 */}
        <HistoryProgressBar progress={historyProgress.progress} />

        {/* 底部说明 */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              本路径适配人教版（2019版）高中地理教材和辽宁省自主命题高考地理。建议按顺序完成七步学习：
              课本还原 → 知识点学习 → 交互地图 → 区域对比 → 地理卡牌 → 区位分析 → 综合题训练。
              每完成一步会自动解锁下一步。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function GeographyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <GeographyHubContent />
    </Suspense>
  );
}
