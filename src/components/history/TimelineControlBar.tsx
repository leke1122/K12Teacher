'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Filter,
  RotateCcw,
  Target,
  Check,
} from 'lucide-react';
import type { EventCategory, HistoryEvent } from '@/types/history';
import { EVENT_CATEGORY_CONFIG } from '@/types/history';

interface TimelineControlBarProps {
  events: HistoryEvent[];
  filteredEvents: HistoryEvent[];
  onFilterChange: (filtered: HistoryEvent[]) => void;
  onZoomChange: (range: number) => void;
  currentZoom: number;
  onYearSelect: (year: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  currentYear: number;
}

export function TimelineControlBar({
  events,
  filteredEvents,
  onFilterChange,
  onZoomChange,
  currentZoom,
  onYearSelect,
  isPlaying,
  onPlayToggle,
  currentYear,
}: TimelineControlBarProps) {
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // 分类筛选
  const handleCategoryToggle = (category: EventCategory) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    setSelectedCategories(newCategories);
  };

  // 应用筛选
  useEffect(() => {
    if (selectedCategories.length === 0) {
      onFilterChange(events);
    } else {
      const filtered = events.filter(
        (e) => !e.category || selectedCategories.includes(e.category)
      );
      onFilterChange(filtered);
    }
  }, [selectedCategories, events, onFilterChange]);

  // 播放逻辑
  const handlePlay = useCallback(() => {
    onPlayToggle();
  }, [onPlayToggle]);

  // 定位当前
  const handleLocateCurrent = () => {
    const currentYear = new Date().getFullYear();
    const sortedEvents = [...events].sort((a, b) => a.year - b.year);
    const nearestEvent = sortedEvents.reduce((prev, curr) =>
      Math.abs(curr.year - currentYear) < Math.abs(prev.year - currentYear)
        ? curr
        : prev
    );
    if (nearestEvent) {
      onYearSelect(nearestEvent.year);
    }
  };

  // 重置筛选
  const handleReset = () => {
    setSelectedCategories([]);
    onFilterChange(events);
    onZoomChange(50);
  };

  const hasActiveFilters = selectedCategories.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
      {/* 播放/暂停 */}
      <Button
        variant={isPlaying ? 'default' : 'outline'}
        size="sm"
        onClick={handlePlay}
        className="gap-1"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {isPlaying ? '暂停' : '播放'}
      </Button>

      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

      {/* 缩放控制 */}
      <div className="flex items-center gap-2">
        <ZoomOut
          className="h-4 w-4 text-slate-500 cursor-pointer"
          onClick={() => onZoomChange(Math.max(10, currentZoom - 10))}
        />
        <div className="w-24">
          <Slider
            value={[currentZoom]}
            min={10}
            max={100}
            step={10}
            onValueChange={(value) => onZoomChange(value[0])}
            className="w-full"
          />
        </div>
        <ZoomIn
          className="h-4 w-4 text-slate-500 cursor-pointer"
          onClick={() => onZoomChange(Math.min(100, currentZoom + 10))}
        />
        <Badge variant="outline" className="text-xs">
          {currentZoom}%
        </Badge>
      </div>

      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

      {/* 筛选器 */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActiveFilters ? 'default' : 'outline'}
            size="sm"
            className="gap-1"
          >
            <Filter className="h-4 w-4" />
            筛选
            {hasActiveFilters && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {selectedCategories.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              按类型筛选
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(EVENT_CATEGORY_CONFIG).map(([key, config]) => {
                const isSelected = selectedCategories.includes(key as EventCategory);
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryToggle(key as EventCategory)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                    {isSelected && <Check className="h-3 w-3 ml-auto" />}
                  </button>
                );
              })}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={handleReset}
              >
                清除筛选
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

      {/* 定位当前 */}
      <Button variant="outline" size="sm" className="gap-1" onClick={handleLocateCurrent}>
        <Target className="h-4 w-4" />
        定位
      </Button>

      {/* 重置 */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" className="gap-1" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          重置
        </Button>
      )}

      {/* 统计信息 */}
      <div className="ml-auto text-xs text-slate-500">
        显示 {filteredEvents.length}/{events.length} 个事件
        {currentYear > 0 && (
          <span className="ml-2">
            当前: <span className="font-medium text-amber-600">{currentYear}年</span>
          </span>
        )}
      </div>
    </div>
  );
}
