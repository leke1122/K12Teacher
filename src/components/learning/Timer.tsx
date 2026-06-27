'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerProps {
  onSave?: (duration: number) => void;
  autoStart?: boolean;
}

export function Timer({ onSave, autoStart = true }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const toggle = () => setIsRunning((r) => !r);

  const save = () => {
    onSave?.(seconds);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-600 dark:text-slate-400">
        ⏱️ 学习时间：
      </span>
      <span className="font-mono text-lg font-semibold text-slate-800 dark:text-slate-200 min-w-[80px]">
        {formatTime(seconds)}
      </span>
      <Button
        size="sm"
        variant="ghost"
        onClick={toggle}
        className="h-8 w-8 p-0"
        title={isRunning ? '暂停' : '继续'}
      >
        {isRunning ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      {onSave && (
        <Button
          size="sm"
          variant="outline"
          onClick={save}
          className="h-8 gap-1 text-xs"
        >
          <Save className="h-3 w-3" />
          保存
        </Button>
      )}
    </div>
  );
}

// 格式化时长（秒转为可读字符串）
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  if (minutes > 0) {
    return `${minutes}分钟`;
  }
  return `${seconds}秒`;
}
