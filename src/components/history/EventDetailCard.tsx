'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MapPin,
  Users,
  Lightbulb,
  Link2,
  PenTool,
  Brain,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import type { HistoryEvent, EventCategory } from '@/types/history';
import type { HistoryEventData } from '@/components/history/TimelineChart';
import { EVENT_CATEGORY_CONFIG } from '@/types/history';

interface EventDetailCardProps {
  event: HistoryEventData;
  isOpen: boolean;
  onClose: () => void;
  onViewCausalChain: () => void;
  onPractice: () => void;
  relatedEvents?: HistoryEventData[];
}

export function EventDetailCard({
  event,
  isOpen,
  onClose,
  onViewCausalChain,
  onPractice,
  relatedEvents = [],
}: EventDetailCardProps) {
  const [studentThought, setStudentThought] = useState('');
  const [showHint, setShowHint] = useState(false);

  // 根据分类获取样式
  const categoryConfig = event.category
    ? EVENT_CATEGORY_CONFIG[event.category]
    : EVENT_CATEGORY_CONFIG.politics;

  // 获取重要程度标签
  const importanceLabels = { 1: '一般', 2: '重要', 3: '最重要' };

  // 生成引导性问题
  const generateReflectionQuestion = (title: string): string => {
    const questions = [
      `如果没有 ${title}，中国历史会怎样发展？`,
      ` ${title} 对你有什么启示？`,
      `${title} 与当今社会有什么联系？`,
      `${title} 反映了中国近代史的哪些特点？`,
    ];
    // 基于事件标题生成确定性随机问题
    const index = title.length % questions.length;
    return questions[index];
  };

  const reflectionQuestion = generateReflectionQuestion(event.title);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-start justify-between pr-8">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: event.color || categoryConfig.color }}
              />
              <DialogTitle className="text-xl">{event.title}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 时间、地点、分类标签 */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="text-sm font-normal">
              {event.year}
              {event.yearEnd ? ` - ${event.yearEnd}` : ''}
              {event.month && `年${event.month}月`}
            </Badge>
            {event.location && (
              <Badge variant="outline" className="text-sm font-normal gap-1">
                <MapPin className="h-3 w-3" />
                {event.location}
              </Badge>
            )}
            {event.category && (
              <Badge
                variant="secondary"
                className="text-sm font-normal gap-1"
                style={{
                  backgroundColor: `${categoryConfig.color}20`,
                  color: categoryConfig.color,
                }}
              >
                {categoryConfig.icon} {categoryConfig.label}
              </Badge>
            )}
            {event.importance && (
              <Badge
                variant={event.importance === 3 ? 'default' : 'outline'}
                className="text-sm font-normal"
              >
                {importanceLabels[event.importance]}
              </Badge>
            )}
            {event.dynasty && (
              <Badge variant="outline" className="text-sm font-normal">
                {event.dynasty}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <Card className="border-0 bg-slate-50/50 dark:bg-slate-800/50">
          <CardContent className="p-4 space-y-4">
            {/* 概述 */}
            {event.summary && (
              <div>
                <p className="text-sm font-medium mb-1">📋 概述</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.summary}
                </p>
              </div>
            )}

            {/* 详细描述 */}
            {event.description && (
              <div>
                <p className="text-sm font-medium mb-1">📖 详细描述</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {/* 人物 */}
            {event.figures && event.figures.length > 0 && (
              <div>
                <p className="text-sm font-medium flex items-center gap-1 mb-1">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  主要人物
                </p>
                <div className="flex flex-wrap gap-1">
                  {event.figures.map((figure, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {figure}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 原因 */}
            {event.causes && (
              <div>
                <p className="text-sm font-medium mb-1">📝 背景原因</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.causes}
                </p>
              </div>
            )}

            {/* 影响 */}
            {event.effects && (
              <div>
                <p className="text-sm font-medium mb-1">📊 历史影响</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.effects}
                </p>
              </div>
            )}

            {/* 历史意义 */}
            {event.significance && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
                  ⭐ 历史意义
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-500 leading-relaxed">
                  {event.significance}
                </p>
              </div>
            )}

            {/* 关联事件 */}
            {relatedEvents.length > 0 && (
              <div>
                <p className="text-sm font-medium flex items-center gap-1 mb-2">
                  <Link2 className="h-3.5 w-3.5 text-purple-500" />
                  关联事件
                </p>
                <div className="flex flex-wrap gap-2">
                  {relatedEvents.map((related) => (
                    <Badge
                      key={related.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      {related.title} ({related.year})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 引导式思考 */}
        <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader className="pb-2 pt-3 px-4">
            <button
              className="flex items-center justify-between w-full text-left"
              onClick={() => setShowHint(!showHint)}
            >
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Brain className="h-4 w-4" />
                🧠 想一想
              </CardTitle>
              {showHint ? (
                <ChevronUp className="h-4 w-4 text-blue-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-blue-500" />
              )}
            </button>
          </CardHeader>
          {showHint && (
            <CardContent className="pt-0 px-4 pb-4">
              <p className="text-sm text-blue-600 dark:text-blue-300 mb-3">
                {reflectionQuestion}
              </p>
              <Textarea
                placeholder="写下你的思考..."
                value={studentThought}
                onChange={(e) => setStudentThought(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              {studentThought && (
                <p className="text-xs text-blue-500 mt-2">
                  💡 思考是学习的开始！可以在笔记本中记录下来。
                </p>
              )}
            </CardContent>
          )}
        </Card>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={onViewCausalChain}
          >
            <Link2 className="h-4 w-4" />
            查看因果链
          </Button>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={onPractice}
          >
            <PenTool className="h-4 w-4" />
            做练习
          </Button>
          <Button
            variant="ghost"
            className="gap-1.5 ml-auto"
            onClick={onClose}
          >
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
