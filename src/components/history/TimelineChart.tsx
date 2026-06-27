'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import type { HistoryEvent, EventCategory } from '@/types/history';
import { EVENT_CATEGORY_CONFIG } from '@/types/history';

export interface RawHistoryEvent {
  id: string;
  title: string;
  year: number;
  yearEnd?: number;
  month?: number;
  dynasty?: string;
  location?: string;
  figures?: string[];
  cause?: string;
  impact?: string;
  causes?: string;
  effects?: string;
  significance?: string;
  summary?: string;
  relatedIds?: string[];
  chapterId?: string;
  category?: EventCategory;
  importance?: 1 | 2 | 3;
  description?: string;
  color?: string;
}

export interface HistoryEventData extends RawHistoryEvent {
  causes: string;
  effects: string;
  summary: string;
  figures: string[];
}

interface TimelineChartProps {
  events: HistoryEventData[];
  selectedId?: string | null;
  onSelect?: (event: HistoryEventData) => void;
  // 新增控制参数
  zoom?: number;
  currentYear?: number;
  isPlaying?: boolean;
  onYearChange?: (year: number) => void;
}

function normalizeEvent(event: RawHistoryEvent): HistoryEventData {
  return {
    ...event,
    causes: event.causes || event.cause || '',
    effects: event.effects || event.impact || '',
    summary: event.summary || '',
    figures: event.figures || [],
  };
}

// 获取事件颜色
function getEventColor(event: HistoryEventData): string {
  if (event.color) return event.color;
  if (event.category && EVENT_CATEGORY_CONFIG[event.category]) {
    return EVENT_CATEGORY_CONFIG[event.category].color;
  }
  return '#6366f1'; // 默认颜色
}

// 获取事件大小
function getEventSize(importance?: 1 | 2 | 3): number {
  switch (importance) {
    case 1: return 12;
    case 2: return 18;
    case 3: return 24;
    default: return 14;
  }
}

export function TimelineChart({
  events,
  selectedId,
  onSelect,
  zoom = 50,
  currentYear = 0,
  isPlaying = false,
  onYearChange,
}: TimelineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sorted = useMemo(
    () => [...events].map(normalizeEvent).sort((a, b) => a.year - b.year),
    [events],
  );

  // 计算时间范围
  const yearRange = useMemo(() => {
    if (sorted.length === 0) return { min: 1800, max: 2000 };
    const years = sorted.flatMap((e) =>
      e.yearEnd ? [e.year, e.yearEnd] : [e.year]
    );
    const min = Math.min(...years);
    const max = Math.max(...years);
    const padding = Math.ceil((max - min) * 0.1);
    return { min: min - padding, max: max + padding };
  }, [sorted]);

  // 清理播放定时器
  const clearPlayInterval = useCallback(() => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
      playIntervalRef.current = null;
    }
  }, []);

  // 播放逻辑
  useEffect(() => {
    if (isPlaying && sorted.length > 0) {
      let currentIndex = 0;
      clearPlayInterval();
      playIntervalRef.current = setInterval(() => {
        if (currentIndex < sorted.length) {
          const year = sorted[currentIndex].year;
          onYearChange?.(year);
          currentIndex++;
        } else {
          clearPlayInterval();
        }
      }, 2000);
    } else {
      clearPlayInterval();
    }
    return clearPlayInterval;
  }, [isPlaying, sorted, onYearChange, clearPlayInterval]);

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.dispose();

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    // 构建图表数据
    const categoryData = sorted.map((e) => e.title);
    const baseInterval = Math.max(10, Math.ceil((yearRange.max - yearRange.min) / 20));

    const option: echarts.EChartsOption = {
      animation: true,
      animationDuration: 800,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: [12, 16],
        textStyle: { color: '#334155' },
        formatter: (params: any) => {
          const data = params.data as HistoryEventData & { categoryColor: string };
          const yearText = data.yearEnd
            ? `${data.year} - ${data.yearEnd}`
            : `${data.year}`;
          return `
            <div style="font-family: system-ui, sans-serif;">
              <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">
                ${data.title}
              </div>
              <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">
                📅 ${yearText}
              </div>
              ${data.location ? `<div style="color: #64748b; font-size: 12px;">📍 ${data.location}</div>` : ''}
              ${data.causes ? `<div style="color: #64748b; font-size: 12px; margin-top: 4px; max-width: 200px;">${data.causes.substring(0, 60)}${data.causes.length > 60 ? '...' : ''}</div>` : ''}
            </div>
          `;
        },
      },
      grid: {
        left: Math.max(80, 120 - zoom / 2),
        right: 60,
        top: 60,
        bottom: 60,
      },
      xAxis: {
        type: 'value',
        min: yearRange.min,
        max: yearRange.max,
        interval: baseInterval,
        axisLabel: {
          fontSize: 12 + zoom / 25,
          color: '#64748b',
          formatter: (value: number) => `${value}`,
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      },
      yAxis: {
        type: 'category',
        data: categoryData,
        axisLabel: {
          fontSize: Math.max(10, 12 + zoom / 50),
          color: '#334155',
          width: Math.max(60, 100 - zoom / 3),
          overflow: 'truncate',
        },
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { alignWithLabel: true },
      },
      series: [
        // 主时间轴线条
        {
          type: 'line',
          data: sorted.map((e) => [e.year, e.title]),
          lineStyle: {
            color: '#cbd5e1',
            width: 2,
          },
          symbol: 'none',
          z: 1,
        },
        // 事件节点
        {
          type: 'scatter',
          symbolSize: (val: any, params: any) => {
            const event = sorted[params.dataIndex];
            return getEventSize(event.importance) * (zoom / 50);
          },
          data: sorted.map((e) => ({
            value: [e.year, e.title],
            itemStyle: {
              color: getEventColor(e),
              borderColor: selectedId === e.id ? '#f59e0b' : '#fff',
              borderWidth: selectedId === e.id ? 3 : 2,
              shadowColor: selectedId === e.id ? 'rgba(245, 158, 11, 0.4)' : 'rgba(0,0,0,0.1)',
              shadowBlur: selectedId === e.id ? 8 : 4,
            },
          })),
          label: {
            show: zoom > 30,
            position: 'right',
            formatter: (params: any) => {
              const event = sorted[params.dataIndex];
              return `${event.year}`;
            },
            fontSize: Math.max(10, 11 + zoom / 50),
            color: '#64748b',
          },
          z: 2,
        },
      ],
    };

    chart.setOption(option);

    // 点击事件
    chart.on('click', (params: any) => {
      if (params.componentType === 'series' && params.seriesIndex === 1) {
        const event = sorted[params.dataIndex];
        onSelect?.(event);
      }
    });

    // 响应式调整
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearPlayInterval();
      chart.dispose();
    };
  }, [sorted, selectedId, zoom, yearRange, onSelect, clearPlayInterval]);

  // 高亮当前年份
  useEffect(() => {
    if (!chartInstance.current || currentYear === 0) return;
    chartInstance.current.setOption({
      series: [
        {},
        {
          data: sorted.map((e) => ({
            value: [e.year, e.title],
            itemStyle: {
              color: getEventColor(e),
              borderColor: selectedId === e.id || e.year === currentYear ? '#f59e0b' : '#fff',
              borderWidth: selectedId === e.id || e.year === currentYear ? 3 : 2,
              shadowColor: selectedId === e.id || e.year === currentYear ? 'rgba(245, 158, 11, 0.5)' : 'rgba(0,0,0,0.1)',
              shadowBlur: selectedId === e.id || e.year === currentYear ? 12 : 4,
            },
          })),
        },
      ],
    });
  }, [currentYear, selectedId, sorted]);

  return (
    <div className="relative">
      <div
        ref={chartRef}
        className="w-full rounded-lg border bg-white dark:bg-slate-900"
        style={{ height: `${Math.max(300, sorted.length * 40 + 100)}px` }}
      />
      {sorted.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 rounded-lg">
          <p className="text-muted-foreground">暂无事件数据</p>
        </div>
      )}
    </div>
  );
}
