'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
  className?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value = [], defaultValue = [], min = 0, max = 100, step = 1, onValueChange, disabled, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value[0] ?? defaultValue[0] ?? 0);
    const currentValue = value.length > 0 ? value[0] : internalValue;
    const percentage = ((currentValue - min) / (max - min)) * 100;

    const handleChange = (clientX: number, rect: DOMRect) => {
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percent * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      const clampedValue = Math.max(min, Math.min(max, steppedValue));

      if (value.length === 0) {
        setInternalValue(clampedValue);
      }
      onValueChange?.([clampedValue]);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      const rect = e.currentTarget.getBoundingClientRect();
      handleChange(e.clientX, rect);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        handleChange(moveEvent.clientX, rect);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;
      let newValue = currentValue;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        newValue = Math.min(max, currentValue + step);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        newValue = Math.max(min, currentValue - step);
      } else if (e.key === 'Home') {
        newValue = min;
      } else if (e.key === 'End') {
        newValue = max;
      }
      if (newValue !== currentValue) {
        if (value.length === 0) {
          setInternalValue(newValue);
        }
        onValueChange?.([newValue]);
      }
    };

    return (
      <div
        ref={ref}
        className={cn('relative flex w-full touch-none select-none items-center', className)}
        {...props}
      >
        <div
          className={cn(
            'relative h-2 w-full grow cursor-pointer rounded-full bg-slate-200 dark:bg-slate-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute h-full rounded-full bg-primary"
            style={{ width: `${percentage}%` }}
          />
          <div
            className={cn(
              'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              disabled && 'cursor-not-allowed'
            )}
            style={{ left: `${percentage}%` }}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
