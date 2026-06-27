'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { ReadingProgress, MindmapNode } from '@/lib/chineseReadingProgress';
import { useSettingsStore } from '@/stores/settingsStore';

interface Step3Props {
  text: string;
  chapterTitle: string;
  chapterId: string;
  progress: ReadingProgress | null;
  onComplete: (data: { mindmapData: MindmapNode }) => void;
}

export function ReadingStep3({ text, chapterTitle, chapterId, progress, onComplete }: Step3Props) {
  const { settings } = useSettingsStore();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const [loading, setLoading] = useState(!progress?.mindmapData);
  const [error, setError] = useState('');
  const [mindmapData, setMindmapData] = useState<MindmapNode | null>(progress?.mindmapData || null);

  // 生成思维导图
  const generateMindmap = async () => {
    if (!settings?.deepseekKey) {
      setError('请先配置 DeepSeek API Key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chinese/reading/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          text,
          apiKey: settings.deepseekKey,
        }),
      });

      const data = await response.json();

      if (data.success && data.mindmap) {
        setMindmapData(data.mindmap);
      } else {
        setError(data.error || '生成失败');
      }
    } catch {
      setError('生成思维导图失败');
    } finally {
      setLoading(false);
    }
  };

  // 渲染思维导图
  const renderChart = useCallback(() => {
    if (!chartRef.current || !mindmapData) return;

    // 销毁旧实例
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const option = {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      series: [
        {
          type: 'tree',
          data: [mindmapData],
          symbol: 'circle',
          symbolSize: (value: number, params: { data?: { children?: unknown[] } }) => {
            const depth = params.data?.children?.length ? 30 : 20;
            return Math.max(depth, 15);
          },
          roam: true,
          edgeShape: 'polyline',
          layout: 'orthogonal',
          orient: 'LR',
          lineStyle: {
            color: '#6366f1',
            width: 2,
          },
          label: {
            show: true,
            position: 'left',
            formatter: '{b}',
            fontSize: 14,
          },
          itemStyle: {
            color: '#818cf8',
            borderColor: '#6366f1',
            borderWidth: 2,
          },
          emphasis: {
            focus: 'ancestor',
            itemStyle: {
              color: '#4f46e5',
              borderColor: '#4338ca',
              borderWidth: 3,
            },
          },
        },
      ],
    };

    chart.setOption(option);
  }, [mindmapData]);

  useEffect(() => {
    if (mindmapData) {
      renderChart();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [mindmapData, renderChart]);

  // 缩放控制
  const handleZoom = (factor: number) => {
    if (chartInstance.current) {
      chartInstance.current.setOption({
        series: [{ zoom: factor }],
      });
    }
  };

  const handleReset = () => {
    if (chartInstance.current) {
      chartInstance.current.setOption({
        series: [{ zoom: 1 }],
      });
    }
  };

  const handleComplete = () => {
    if (mindmapData) {
      onComplete({ mindmapData });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">📊 {chapterTitle} - 结构梳理</h3>
          {mindmapData && (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600">
              已生成
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mindmapData && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleZoom(0.8)}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleZoom(1.2)}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="flex-1">
        <CardContent className="p-4 h-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
              <p className="text-muted-foreground">正在生成思维导图...</p>
              <p className="text-xs text-slate-400 mt-2">请稍候，这可能需要几秒钟</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={generateMindmap} className="gap-2">
                <Sparkles className="h-4 w-4" />
                重试
              </Button>
            </div>
          ) : !mindmapData ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-6xl mb-4">🧠</div>
              <p className="text-lg font-medium mb-2">生成结构梳理思维导图</p>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                AI 将分析课文结构，生成可视化的思维导图，<br />
                帮助理清文章脉络、层次和关键要素
              </p>
              <Button onClick={generateMindmap} className="gap-2 bg-indigo-500 hover:bg-indigo-600">
                <Sparkles className="h-4 w-4" />
                开始生成
              </Button>
            </div>
          ) : (
            <div ref={chartRef} className="w-full h-full min-h-[400px]" />
          )}
        </CardContent>
      </Card>

      {mindmapData && (
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleComplete}
            className="gap-2 bg-indigo-500 hover:bg-indigo-600"
          >
            <Sparkles className="h-4 w-4" />
            完成结构梳理，进入迁移输出
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
