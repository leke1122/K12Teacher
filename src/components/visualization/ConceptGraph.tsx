'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, ZoomIn, MousePointer } from 'lucide-react';

interface FunctionCurveData {
  equation: string;
  points?: [number, number][];
  domain?: [number, number];
  range?: [number, number];
  animationSequence?: { x: number; y: number }[];
  variants?: Array<{ equation: string; a: number; b: number; c: number }>;
  current?: number;
  increasing?: { equation: string; points: [number, number][] };
  decreasing?: { equation: string; points: [number, number][] };
  limit_example?: { equation: string; limit_at: number; limit_value: number };
}

interface VennData {
  circles: Array<{ cx: number; cy: number; rx: number; ry: number; label: string; color: string }>;
  regions: Array<{ name: string; label: string; color: string; highlight?: boolean }>;
  setA?: { name: string; elements: string[]; color: string };
  setB?: { name: string; elements: string[]; color: string };
}

interface ArrowData {
  setA: { name: string; elements: string[]; cx: number; cy: number };
  setB: { name: string; elements: string[]; cx: number; cy: number };
  arrows: Array<{ from: string; to: string; label: string }>;
}

interface SymmetryData {
  even?: { equation: string; label: string; symmetry: string };
  odd?: { equation: string; label: string; symmetry: string };
}

type VizData = FunctionCurveData | VennData | ArrowData | SymmetryData;

interface ConceptGraphProps {
  type: string;
  data: VizData;
  onPointClick?: (point: [number, number]) => void;
}

export function ConceptGraph({ type, data, onPointClick }: ConceptGraphProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const [inputX, setInputX] = useState('');
  const [plottedPoints, setPlottedPoints] = useState<[number, number][]>([]);
  const [currentVariant, setCurrentVariant] = useState(0);

  // 生成二次函数点
  const generateQuadraticPoints = useCallback((a: number, b: number, c: number, range = [-5, 5]) => {
    const points: [number, number][] = [];
    const step = (range[1] - range[0]) / 100;
    for (let x = range[0]; x <= range[1]; x += step) {
      const y = a * x * x + b * x + c;
      if (Math.abs(y) < 100) points.push([parseFloat(x.toFixed(3)), parseFloat(y.toFixed(3))]);
    }
    return points;
  }, []);

  // 生成线性函数点
  const generateLinearPoints = useCallback((a: number, b: number, range = [-5, 5]) => {
    const points: [number, number][] = [];
    for (let x = range[0]; x <= range[1]; x += 0.1) {
      points.push([parseFloat(x.toFixed(3)), parseFloat((a * x + b).toFixed(3))]);
    }
    return points;
  }, []);

  // 渲染坐标系
  const renderCoordinateChart = useCallback((plotData: [number, number][]) => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.dispose();

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const allX = plotData.map(p => p[0]);
    const allY = plotData.map(p => p[1]);
    const minX = Math.min(...allX, -5);
    const maxX = Math.max(...allX, 5);
    const minY = Math.min(...allY, -5);
    const maxY = Math.max(...allY, 5);

    const option = {
      animation: true,
      grid: { left: 55, right: 35, top: 35, bottom: 55 },
      xAxis: {
        type: 'value', min: minX - 1, max: maxX + 1,
        splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } },
        axisLine: { lineStyle: { color: '#64748b', width: 2 } },
        axisLabel: { color: '#64748b', fontSize: 14 },
      },
      yAxis: {
        type: 'value', min: minY - 1, max: maxY + 1,
        splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } },
        axisLine: { lineStyle: { color: '#64748b', width: 2 } },
        axisLabel: { color: '#64748b', fontSize: 14 },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.seriesType === 'scatter') {
            return `(${params.value[0]}, ${params.value[1]})`;
          }
          return '';
        },
      },
      series: [
        // 函数曲线
        {
          type: 'line',
          data: plotData,
          smooth: true,
          lineStyle: { color: '#6366f1', width: 3 },
          symbol: 'none',
          areaStyle: { color: 'rgba(99,102,241,0.1)' },
        },
        // 坐标轴（x轴和y轴）
        {
          type: 'line',
          data: [[minX - 1, 0], [maxX + 1, 0]],
          lineStyle: { color: '#64748b', width: 2 },
          symbol: 'none',
          markArea: { silent: true, data: [] },
        },
        {
          type: 'line',
          data: [[0, minY - 1], [0, maxY + 1]],
          lineStyle: { color: '#64748b', width: 2 },
          symbol: 'none',
        },
        // 用户描的点
        ...(plottedPoints.length > 0 ? [{
          type: 'scatter' as const,
          data: plottedPoints,
          symbolSize: 16,
          itemStyle: { color: '#f59e0b', borderColor: '#fff', borderWidth: 2 },
          label: {
            show: true,
            formatter: (p: any) => `(${p.value[0]}, ${p.value[1]})`,
            fontSize: 13,
            color: '#f59e0b',
          },
        }] : []),
      ],
    };

    chart.setOption(option);

    // 点击事件
    chart.on('click', (params: any) => {
      if (params.dataType === 'data' && Array.isArray(params.value)) {
        onPointClick?.(params.value);
      }
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [plottedPoints, onPointClick]);

  // 渲染维恩图
  const renderVennChart = useCallback(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.dispose();

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const d = data as VennData;
    const width = 400, height = 300;

    const circles = d.circles.map(c => ({
      type: 'circle',
      cx: c.cx,
      cy: c.cy,
      r: c.rx,
      shape: { cx: c.cx, cy: c.cy, r: c.rx },
      style: {
        fill: c.color + '30',
        stroke: c.color,
        lineWidth: 3,
        lineDash: null,
      },
      label: {
        show: true,
        position: 'inside',
        formatter: c.label,
        fontSize: 16,
        fontWeight: 'bold' as const,
        color: c.color,
      },
    }));

    const option = {
      animation: true,
      graphic: [
        ...circles,
        // 坐标轴
        {
          type: 'line',
          shape: { x1: 0, y1: height / 2, x2: width, y2: height / 2 },
          style: { stroke: '#94a3b8', lineWidth: 1 },
        },
        {
          type: 'line',
          shape: { x1: width / 2, y1: 0, x2: width / 2, y2: height },
          style: { stroke: '#94a3b8', lineWidth: 1 },
        },
      ],
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.name) return params.name;
          return '';
        },
      },
    };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.dispose(); };
  }, [data]);

  // 渲染映射图
  const renderArrowChart = useCallback(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.dispose();

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const d = data as ArrowData;
    const setAPoints = d.setA.elements.map((el, i) => [d.setA.cx, 50 + i * 50]);
    const setBPoints = d.setB.elements.map((el, i) => [d.setB.cx, 50 + i * 50]);

    const option = {
      animation: true,
      graphic: [
        // A 集标签
        {
          type: 'text',
          style: { text: d.setA.name, x: d.setA.cx, y: 20, textAlign: 'center', fontSize: 14, fontWeight: 'bold', fill: '#6366f1' },
        },
        // B 集标签
        {
          type: 'text',
          style: { text: d.setB.name, x: d.setB.cx, y: 20, textAlign: 'center', fontSize: 14, fontWeight: 'bold', fill: '#f59e0b' },
        },
        // 绘制A的竖线
        ...d.setA.elements.map((el, i) => ({
          type: 'rect' as const,
          shape: { x: d.setA.cx - 20, y: 40 + i * 50, width: 40, height: 40, r: 4 },
          style: { fill: '#6366f130', stroke: '#6366f1', lineWidth: 2 },
        })),
        ...d.setA.elements.map((el, i) => ({
          type: 'text' as const,
          style: { text: el, x: d.setA.cx, y: 65 + i * 50, textAlign: 'center', fontSize: 13, fill: '#6366f1', fontWeight: 'bold' },
        })),
        ...d.setB.elements.map((el, i) => ({
          type: 'rect' as const,
          shape: { x: d.setB.cx - 20, y: 40 + i * 50, width: 40, height: 40, r: 4 },
          style: { fill: '#f59e0b30', stroke: '#f59e0b', lineWidth: 2 },
        })),
        ...d.setB.elements.map((el, i) => ({
          type: 'text' as const,
          style: { text: el, x: d.setB.cx, y: 65 + i * 50, textAlign: 'center', fontSize: 13, fill: '#f59e0b', fontWeight: 'bold' },
        })),
      ],
      series: [
        {
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          data: d.arrows.map(a => ({
            coords: [
              [d.setA.cx, 50 + d.setA.elements.indexOf(a.from) * 50],
              [d.setB.cx, 50 + d.setB.elements.indexOf(a.to) * 50],
            ],
            lineStyle: { color: '#8b5cf6', width: 2, curveness: 0.3 },
          })),
          label: {
            show: true,
            formatter: (p: any) => p.data.lineStyle?.label || '',
            fontSize: 11,
            color: '#8b5cf6',
          },
        },
      ],
      xAxis: { show: false, min: 0, max: 400 },
      yAxis: { show: false, min: 0, max: 300 },
      tooltip: { trigger: 'item' },
    };

    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.dispose(); };
  }, [data]);

  // 根据类型渲染
  useEffect(() => {
    if (!chartRef.current) return;

    let cleanup: (() => void) | undefined;

    if (type === 'function_curve' || type === 'symmetry') {
      const fData = data as FunctionCurveData;
      if (fData.variants && fData.variants.length > 0) {
        const variant = fData.variants[currentVariant];
        const pts = generateQuadraticPoints(variant.a, variant.b, variant.c);
        cleanup = renderCoordinateChart(pts);
      } else if (fData.points && fData.points.length > 0) {
        const pts = fData.points;
        cleanup = renderCoordinateChart(pts);
      } else if (fData.animationSequence) {
        const pts = fData.animationSequence.map(p => [p.x, p.y] as [number, number]);
        cleanup = renderCoordinateChart(pts);
      } else if (fData.increasing && fData.decreasing) {
        cleanup = renderCoordinateChart(fData.increasing.points);
      } else if (fData.limit_example) {
        const pts = generateLinearPoints(1, -fData.limit_example.limit_at + fData.limit_example.limit_value, [-2, 4]);
        cleanup = renderCoordinateChart(pts);
      } else {
        cleanup = renderCoordinateChart([[0, 0]]);
      }
    } else if (type === 'venn_diagram') {
      cleanup = renderVennChart();
    } else if (type === 'arrow_mapping') {
      cleanup = renderArrowChart();
    }

    return cleanup;
  }, [type, data, currentVariant, plottedPoints, renderCoordinateChart, renderVennChart, renderArrowChart, generateQuadraticPoints]);

  // 描点
  const handlePlotPoint = () => {
    const x = parseFloat(inputX);
    if (isNaN(x)) return;

    const fData = data as FunctionCurveData;
    let y: number;

    if (fData.variants && fData.variants.length > 0) {
      const v = fData.variants[currentVariant];
      y = v.a * x * x + v.b * x + v.c;
    } else if (fData.equation?.includes('x²') || fData.equation?.includes('x^2')) {
      y = x * x;
    } else if (fData.equation?.includes('2x+1') || fData.equation?.includes('2x + 1')) {
      y = 2 * x + 1;
    } else if (fData.equation?.includes('-x+3') || fData.equation?.includes('-x + 3')) {
      y = -x + 3;
    } else if (fData.equation?.includes('-x²') || fData.equation?.includes('-x^2')) {
      y = -x * x;
    } else if (fData.equation?.includes('2x²') || fData.equation?.includes('2x^2')) {
      y = 2 * x * x;
    } else if (fData.equation?.includes('x³') || fData.equation?.includes('x^3')) {
      y = x * x * x;
    } else if (fData.equation?.includes('(x-1)²') || fData.equation?.includes('(x-1)^2')) {
      y = (x - 1) * (x - 1);
    } else if (fData.equation?.includes('x²+2') || fData.equation?.includes('x^2+2')) {
      y = x * x + 2;
    } else {
      y = x * x;
    }

    const point: [number, number] = [parseFloat(x.toFixed(3)), parseFloat(y.toFixed(3))];
    setPlottedPoints(prev => [...prev, point]);
    setInputX('');
  };

  const handleClearPoints = () => setPlottedPoints([]);

  const fData = data as FunctionCurveData;
  const showControls = type === 'function_curve';
  const showVariants = showControls && fData.variants && fData.variants.length > 1;

  return (
    <div className="space-y-3">
      {/* 控制栏 */}
      {showControls && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* 描点 */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground whitespace-nowrap">输入 x =</span>
            <Input
              type="number"
              value={inputX}
              onChange={(e) => setInputX(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePlotPoint()}
              placeholder="0"
              className="w-16 h-8 text-sm"
            />
            <Button size="sm" className="h-8 text-xs gap-1" onClick={handlePlotPoint}>
              <MousePointer className="h-3 w-3" />
              描点
            </Button>
          </div>

          {/* 变体切换 */}
          {showVariants && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">公式：</span>
              {fData.variants!.map((v, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={currentVariant === i ? 'default' : 'outline'}
                  className="h-7 text-xs"
                  onClick={() => setCurrentVariant(i)}
                >
                  {v.equation}
                </Button>
              ))}
            </div>
          )}

          {plottedPoints.length > 0 && (
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={handleClearPoints}>
              <RotateCcw className="h-3 w-3" />
              清空
            </Button>
          )}

          <Badge variant="outline" className="text-xs ml-auto">
            <ZoomIn className="h-3 w-3 mr-1" />
            滚轮缩放 · 拖拽平移
          </Badge>
        </div>
      )}

      {/* 图表区域 */}
      <div ref={chartRef} className="w-full rounded-lg border bg-white dark:bg-slate-900" style={{ height: 480 }} />

      {/* 已描点列表 */}
      {plottedPoints.length > 0 && (
        <div className="text-xs text-muted-foreground flex gap-2 flex-wrap">
          <span>已描点：</span>
          {plottedPoints.map((p, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              ({p[0]}, {p[1]})
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
