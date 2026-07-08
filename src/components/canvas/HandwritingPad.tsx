'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, RotateCcw, Upload, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HandwritingPadProps {
  onSave: (imageData: string) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
  debugMode?: boolean;
  writingMode?: boolean;
  onWritingModeChange?: (value: boolean) => void;
  onPointerMove?: (data: { rawX: number; rawY: number; mappedX: number; mappedY: number }) => void;
}

interface Point {
  x: number;
  y: number;
  time: number;
  width: number;
}

export function HandwritingPad({
  onSave,
  onCancel,
  loading,
  className,
  debugMode = false,
  writingMode = false,
  onWritingModeChange,
  onPointerMove,
}: HandwritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [penColor, setPenColor] = useState('#1e293b');
  const [penSize, setPenSize] = useState(3);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);

  const drawingRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const lastStateTimeRef = useRef(0);
  const lastSaveTimeRef = useRef(0);

  /**
   * 将笔/鼠标坐标映射到 canvas 像素坐标
   * 直接使用鼠标相对于 canvas 的位置（由高漫软件控制映射区域）
   */
  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0, width: 0 };

      const rect = canvas.getBoundingClientRect();
      const normalizedX = (clientX - rect.left) / rect.width;
      const normalizedY = (clientY - rect.top) / rect.height;

      return {
        x: Math.max(0, Math.min(canvas.width, normalizedX * canvas.width)),
        y: Math.max(0, Math.min(canvas.height, normalizedY * canvas.height)),
        width: penSize * 1.0,
      };
    },
    [penSize],
  );

  const getStrokeWidth = useCallback((points: Point[]) => {
    if (points.length < 2) return penSize * 0.6;
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = last.time - prev.time;
    const velocity = duration > 0 ? distance / duration : 0;
    const minWidth = penSize * 0.6;
    const maxWidth = penSize * 1.4;
    const velocityWeight = Math.max(0, Math.min(1, 1 - velocity / 2.5));
    return Math.max(minWidth, Math.min(maxWidth, minWidth + (maxWidth - minWidth) * velocityWeight));
  }, [penSize]);

  const redrawFromPoints = useCallback((points: Point[], context: CanvasRenderingContext2D | null) => {
    if (!context || points.length === 0) return;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.strokeStyle = penColor;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const current = points[i];
      context.lineWidth = current.width;
      context.beginPath();
      context.moveTo(prev.x, prev.y);
      context.lineTo(current.x, current.y);
      context.stroke();
    }
  }, [penColor]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const now = Date.now();
    if (now - lastStateTimeRef.current < 200) return;
    lastStateTimeRef.current = now;
    const dataURL = canvas.toDataURL('image/png');
    setUndoStack(prev => [...prev.slice(-24), dataURL]);
    setIsEmpty(false);
  }, []);

  const pushPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const { x, y, width } = getCanvasPoint(clientX, clientY);
    const now = Date.now();

    pointsRef.current.push({ x, y, time: now, width });

    if (pointsRef.current.length > 1) {
      const prev = pointsRef.current[pointsRef.current.length - 2];
      context.strokeStyle = penColor;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = width;

      context.beginPath();
      context.moveTo(prev.x, prev.y);
      context.lineTo(x, y);
      context.stroke();
    }

    if (now - lastSaveTimeRef.current > 600) {
      lastSaveTimeRef.current = now;
      saveState();
    }
  }, [getCanvasPoint, penColor, saveState]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    pointsRef.current = [];

    const { x, y, width } = getCanvasPoint(event.clientX, event.clientY);
    const context = canvas.getContext('2d');
    if (context) {
      context.strokeStyle = penColor;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.lineWidth = width || penSize * 0.6;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + 0.01, y + 0.01);
      context.stroke();
    }
    setIsEmpty(false);
  }, [getCanvasPoint, penColor, penSize]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    onPointerMove?.({ rawX: event.clientX, rawY: event.clientY, mappedX: 0, mappedY: 0 });
    pushPoint(event.clientX, event.clientY);
  }, [onPointerMove, pushPoint]);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
    saveState();
  }, [saveState]);

  const handlePointerCancel = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
    saveState();
  }, [saveState]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const imageData = canvas.toDataURL('image/png');
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => { context.drawImage(img, 0, 0, canvas.width, canvas.height); };
    img.src = imageData;
  }, []);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(() => resizeCanvas());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    redrawFromPoints(pointsRef.current, context);
  }, [penColor, penSize, redrawFromPoints]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setUndoStack([]);
    setIsEmpty(true);
    pointsRef.current = [];
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = previous;
    setUndoStack(prev => prev.slice(0, -1));
    setIsEmpty(undoStack.length <= 1);
  }, [undoStack]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    const dataURL = canvas.toDataURL('image/png');
    onSave(dataURL);
  }, [isEmpty, onSave]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 工具栏 */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0 flex-wrap">
        <input
          type="color"
          value={penColor}
          onChange={(e) => setPenColor(e.target.value)}
          className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
          title="笔迹颜色"
        />
        <input
          type="range"
          min={1}
          max={8}
          value={penSize}
          onChange={(e) => setPenSize(Number(e.target.value))}
          className="w-14 accent-indigo-500"
          title="笔迹粗细"
        />
        <Button
          variant={writingMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => onWritingModeChange?.(!writingMode)}
          className="gap-1 text-xs h-7 px-2"
          title="写字模式：笔迹更稳定，适合写公式和汉字"
        >
          <Type className="h-3 w-3" />
          {writingMode ? '写字模式' : '普通模式'}
        </Button>
        <div className="flex-1" />
        {debugMode && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            <span>16:10 书写区</span>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={handleUndo} disabled={undoStack.length === 0} className="gap-1 text-xs h-7 px-2">
          <Undo2 className="h-3 w-3" />撤销
        </Button>
        <Button variant="outline" size="sm" onClick={handleClear} className="gap-1 text-xs h-7 px-2">
          <RotateCcw className="h-3 w-3" />清空
        </Button>
      </div>

      {/* 画布（16:10 比例） */}
      <div
        ref={containerRef}
        className="flex-1 border-2 border-indigo-100 dark:border-indigo-800/50 rounded-lg overflow-hidden bg-white relative min-h-0"
        style={{ aspectRatio: '16 / 10' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          style={{ touchAction: 'none', display: 'block' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handlePointerCancel}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-slate-300 text-sm">请在手写区域作答</p>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      <div className="flex items-center justify-end mt-2 flex-shrink-0">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="h-7 text-xs gap-1">取消</Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={loading || isEmpty}
            className="h-7 text-xs bg-indigo-500 hover:bg-indigo-600 gap-1"
          >
            {loading ? <span className="animate-pulse">⏳</span> : <Upload className="h-3 w-3" />}
            提交
          </Button>
        </div>
      </div>
    </div>
  );
}
