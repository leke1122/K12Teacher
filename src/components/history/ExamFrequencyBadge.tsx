'use client';

import { Badge } from '@/components/ui/badge';
import type { ExamFrequency } from '@/types/history';

interface ExamFrequencyBadgeProps {
  frequency: ExamFrequency;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const frequencyConfig = {
  '★★★': {
    label: '高频大题',
    className: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
  },
  '★★☆': {
    label: '高频选择',
    className: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
  },
  '★☆☆': {
    label: '一般了解',
    className: 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200',
  },
};

export function ExamFrequencyBadge({ frequency, showLabel = true, size = 'sm' }: ExamFrequencyBadgeProps) {
  const config = frequencyConfig[frequency];
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${size === 'sm' ? 'text-xs px-1.5' : 'text-sm px-2'}`}
    >
      {frequency}
      {showLabel && <span className="ml-1">{config.label}</span>}
    </Badge>
  );
}

export function ExamFrequencyBadgeSimple({ frequency }: { frequency: ExamFrequency }) {
  return <span className={`font-bold ${
    frequency === '★★★' ? 'text-red-600' : 
    frequency === '★★☆' ? 'text-orange-500' : 
    'text-slate-400'
  }`}>{frequency}</span>;
}
