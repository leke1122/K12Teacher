'use client';

import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle, BookOpen } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  name: string;
  type: '概念' | '符号' | '方法' | '注意';
  description: string;
}

interface KnowledgeListProps {
  items: KnowledgeItem[];
  currentIndex: number;
  completedList: string[];
  wrongList: string[];
  onSelect?: (item: KnowledgeItem, index: number) => void;
}

const typeColors = {
  '概念': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  '符号': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  '方法': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  '注意': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
};

const statusConfig = {
  'completed': {
    icon: Check,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    text: '已掌握'
  },
  'current': {
    icon: Clock,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-300 dark:border-indigo-700',
    text: '学习中'
  },
  'wrong': {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-300 dark:border-red-700',
    text: '待巩固'
  },
  'pending': {
    icon: BookOpen,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50 dark:bg-slate-800/30',
    borderColor: 'border-slate-200 dark:border-slate-700',
    text: '待学习'
  }
};

export function KnowledgeList({ 
  items, 
  currentIndex, 
  completedList, 
  wrongList,
  onSelect 
}: KnowledgeListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        暂无知识点
      </div>
    );
  }

  const getStatus = (item: KnowledgeItem, index: number) => {
    if (index === currentIndex) return 'current';
    if (completedList.includes(item.name)) {
      return wrongList.includes(item.name) ? 'wrong' : 'completed';
    }
    return 'pending';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
          📋 知识点清单（共{items.length}个）
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-slate-500">已掌握 {completedList.length}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-slate-500">待巩固 {wrongList.length}</span>
          </span>
        </div>
      </div>

      <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2">
        {items.map((item, index) => {
          const status = getStatus(item, index);
          const statusInfo = statusConfig[status];
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={item.id}
              onClick={() => onSelect?.(item, index)}
              className={cn(
                'flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer',
                statusInfo.bgColor,
                statusInfo.borderColor,
                status === 'current' && 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900'
              )}
            >
              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
                {index + 1}
              </span>

              <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {item.name}
              </span>

              <span className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                typeColors[item.type]
              )}>
                {item.type}
              </span>

              <div className={cn('flex items-center gap-1', statusInfo.color)}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{statusInfo.text}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
