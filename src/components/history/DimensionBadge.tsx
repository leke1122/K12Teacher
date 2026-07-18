'use client';

import { Badge } from '@/components/ui/badge';
import type { CurriculumDimension } from '@/types/history';

interface DimensionBadgeProps {
  dimension: CurriculumDimension;
  size?: 'sm' | 'md';
}

const dimensionConfig: Record<CurriculumDimension, { color: string; icon: string }> = {
  '制度变化与创新': { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: '⚙️' },
  '民族交融': { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: '🤝' },
  '区域开发': { color: 'bg-green-100 text-green-700 border-green-300', icon: '🗺️' },
  '思想文化': { color: 'bg-amber-100 text-amber-700 border-amber-300', icon: '📚' },
};

export function DimensionBadge({ dimension, size = 'sm' }: DimensionBadgeProps) {
  const config = dimensionConfig[dimension];
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${size === 'sm' ? 'text-xs px-1.5' : 'text-sm px-2'}`}
    >
      {config.icon} {dimension}
    </Badge>
  );
}

export function getDimensionColor(dimension: CurriculumDimension): string {
  return dimensionConfig[dimension]?.color || 'bg-slate-100';
}
