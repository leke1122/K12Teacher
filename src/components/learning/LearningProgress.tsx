'use client';

import { useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, Clock, Save, RotateCcw, Trophy, Target } from 'lucide-react';

interface LearningProgressProps {
  currentIndex: number;
  total: number;
  completedCount: number;
  weakCount: number;
  progressPercent: number;
  onSave?: () => void;
  onRestart?: () => void;
  onShowSummary?: () => void;
  isSaving?: boolean;
  className?: string;
}

export function LearningProgress({
  currentIndex,
  total,
  completedCount,
  weakCount,
  progressPercent,
  onSave,
  onRestart,
  onShowSummary,
  isSaving,
  className
}: LearningProgressProps) {
  return (
    <div className={cn('bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4', className)}>
      <div className="flex items-center justify-between gap-4">
        {/* 左侧：进度信息 */}
        <div className="flex items-center gap-6">
          {/* 当前进度 */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
              {currentIndex + 1}
            </div>
            <div>
              <p className="text-sm text-slate-500">当前 / 总数</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {currentIndex + 1} / {total}
              </p>
            </div>
          </div>

          {/* 已掌握 */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已掌握</p>
              <p className="text-lg font-bold text-green-600">
                {completedCount} 个
              </p>
            </div>
          </div>

          {/* 薄弱项 */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shadow-lg',
              weakCount > 0 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
            )}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">薄弱项</p>
              <p className={cn(
                'text-lg font-bold',
                weakCount > 0 ? 'text-amber-600' : 'text-slate-400'
              )}>
                {weakCount} 个
              </p>
            </div>
          </div>
        </div>

        {/* 中间：进度条 */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-slate-500">学习进度</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {progressPercent}%
            </span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-3 rounded-full"
          />
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-xl gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? '保存中...' : '保存进度'}
          </Button>
          
          {currentIndex >= total - 1 && (
            <Button
              variant="default"
              size="sm"
              onClick={onShowSummary}
              className="rounded-xl gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Trophy className="h-4 w-4" />
              查看总结
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// 学习总结组件
interface SummaryData {
  totalKnowledge: number;
  completedCount: number;
  weakCount: number;
  correctRate: number;
  weakItems: string[];
  duration?: string;
}

interface LearningSummaryProps {
  summary: SummaryData;
  onRestart: () => void;
  onReviewWeak: () => void;
  className?: string;
}

export function LearningSummary({
  summary,
  onRestart,
  onReviewWeak,
  className
}: LearningSummaryProps) {
  const { totalKnowledge, completedCount, weakCount, correctRate, weakItems } = summary;

  return (
    <div className={cn('bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden', className)}>
      {/* 顶部装饰 */}
      <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      <div className="p-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            学习完成！
          </h2>
          <p className="text-slate-500 mt-2">你真棒！来看看这次学习的成果吧~</p>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="知识点总数"
            value={totalKnowledge.toString()}
            color="indigo"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="已掌握"
            value={completedCount.toString()}
            color="green"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            label="薄弱项"
            value={weakCount.toString()}
            color="amber"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="正确率"
            value={`${correctRate}%`}
            color="blue"
          />
        </div>

        {/* 薄弱项列表 */}
        {weakItems.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-5 mb-8">
            <h3 className="font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              需要加强的知识点（建议复习）
            </h3>
            <div className="flex flex-wrap gap-2">
              {weakItems.map((item, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-3 py-1.5 text-amber-600 border-amber-300 dark:border-amber-700"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          {weakItems.length > 0 && (
            <Button
              onClick={onReviewWeak}
              variant="outline"
              className="flex-1 h-14 text-lg rounded-xl gap-2 border-2 border-amber-300 text-amber-600 hover:bg-amber-50"
            >
              <RotateCcw className="w-5 h-5" />
              复习薄弱项
            </Button>
          )}
          <Button
            onClick={onRestart}
            className="flex-1 h-14 text-lg rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg"
          >
            重新学习一遍
          </Button>
        </div>
      </div>
    </div>
  );
}

// 统计卡片组件
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'indigo' | 'green' | 'amber' | 'blue';
}

const statColors: Record<string, { bg: string; icon: string; text: string }> = {
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', icon: 'text-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' },
  green: { bg: 'bg-green-50 dark:bg-green-950/30', icon: 'text-green-500', text: 'text-green-600 dark:text-green-400' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', icon: 'text-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', icon: 'text-blue-500', text: 'text-blue-600 dark:text-blue-400' },
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colors = statColors[color];
  
  return (
    <div className={cn('rounded-2xl p-4 text-center', colors.bg)}>
      <div className={cn('flex justify-center mb-2', colors.icon)}>
        {icon}
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
