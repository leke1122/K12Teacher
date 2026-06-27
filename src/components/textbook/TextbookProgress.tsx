'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Save, ChevronLeft, ChevronRight, Trophy, RotateCcw } from 'lucide-react';

interface TextbookProgressProps {
  currentSection: number;
  totalSections: number;
  currentPage: number;
  completedSections: number[];
  isSaving?: boolean;
  onSave?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  isCompleted?: boolean;
  onRestart?: () => void;
  className?: string;
}

export function TextbookProgress({
  currentSection,
  totalSections,
  currentPage,
  completedSections,
  isSaving,
  onSave,
  onPrevious,
  onNext,
  canGoPrevious = true,
  canGoNext = true,
  isCompleted = false,
  onRestart,
  className
}: TextbookProgressProps) {

  const progressPercent = totalSections > 0 
    ? Math.round((currentSection / totalSections) * 100) 
    : 0;

  const isWeakSection = !completedSections.includes(currentSection);

  return (
    <Card className={cn('border-0 shadow-lg', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* 进度信息 */}
          <div className="flex items-center gap-6">
            {/* 当前进度 */}
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg',
                isCompleted 
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' 
                  : isWeakSection
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
              )}>
                {isCompleted ? <Trophy className="h-6 w-6" /> : currentSection}
              </div>
              <div>
                <p className="text-sm text-slate-500">当前 / 总数</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  第 {currentSection} 段 / 共 {totalSections} 段
                </p>
              </div>
            </div>

            {/* 页码 */}
            <div className="hidden sm:flex items-center gap-2 text-slate-500">
              <span className="text-sm">📖</span>
              <span className="text-sm">第 {currentPage} 页</span>
            </div>

            {/* 完成数 */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {completedSections.length}
                </span>
              </div>
              <span className="text-sm text-slate-500">已掌握</span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="flex-1 max-w-xs hidden lg:block">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-500">学习进度</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5 rounded-full" />
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 ml-auto">
            {/* 保存按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="rounded-xl gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">{isSaving ? '保存中...' : '保存'}</span>
            </Button>

            {/* 学习完成时的按钮 */}
            {isCompleted && onRestart && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRestart}
                className="rounded-xl gap-2 text-amber-600 hover:text-amber-700"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">重新学习</span>
              </Button>
            )}
          </div>
        </div>

        {/* 底部进度条（移动端） */}
        <div className="mt-3 lg:hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-slate-500">学习进度</span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
