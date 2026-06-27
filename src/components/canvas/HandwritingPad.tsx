'use client';

import { useRef, useState, useCallback } from 'react';
import SignatureCanvas, { SignatureCanvasRef } from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Undo2, RotateCcw, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HandwritingPadProps {
  onSave: (imageData: string) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

export function HandwritingPad({ onSave, onCancel, loading, className }: HandwritingPadProps) {
  const sigCanvas = useRef<SignatureCanvasRef>(null);
  const [penColor, setPenColor] = useState('#1e293b');
  const [penSize, setPenSize] = useState(3);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = useCallback(() => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setUndoStack([]);
      setIsEmpty(true);
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (sigCanvas.current && undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      sigCanvas.current.fromDataURL(lastState);
      setUndoStack(prev => prev.slice(0, -1));
      setIsEmpty(sigCanvas.current.isEmpty());
    }
  }, [undoStack]);

  const saveState = useCallback(() => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL('image/png');
      setUndoStack(prev => [...prev, dataURL]);
      setIsEmpty(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataURL = sigCanvas.current.toDataURL('image/png');
      onSave(dataURL);
    }
  }, [onSave]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 工具栏（紧凑） */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0 flex-wrap">
        <input
          type="color"
          value={penColor}
          onChange={(e) => setPenColor(e.target.value)}
          className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 cursor-pointer"
        />
        <input
          type="range"
          min={1}
          max={8}
          value={penSize}
          onChange={(e) => setPenSize(Number(e.target.value))}
          className="w-14 accent-indigo-500"
        />
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleUndo} disabled={undoStack.length === 0} className="gap-1 text-xs h-7 px-2">
          <Undo2 className="h-3 w-3" />撤销
        </Button>
        <Button variant="outline" size="sm" onClick={handleClear} className="gap-1 text-xs h-7 px-2">
          <RotateCcw className="h-3 w-3" />清空
        </Button>
      </div>

      {/* 画布（占满剩余空间） */}
      <div className="flex-1 border-2 border-indigo-100 dark:border-indigo-800/50 rounded-lg overflow-hidden bg-white relative min-h-0">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-full touch-none',
            style: { touchAction: 'none', display: 'block' },
          }}
          penColor={penColor}
          minWidth={penSize * 0.6}
          maxWidth={penSize * 1.4}
          onEnd={saveState}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-300 text-sm">请在此处书写解题步骤</p>
          </div>
        )}
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mt-2 flex-shrink-0">
        <p className="text-xs text-slate-400">💡 书写解题过程，点击提交由AI识别</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="h-7 text-xs gap-1">
            取消
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={loading || isEmpty}
            className="h-7 text-xs bg-indigo-500 hover:bg-indigo-600 gap-1"
          >
            {loading ? (
              <span className="animate-spin inline-block">⟳</span>
            ) : (
              <Upload className="h-3 w-3" />
            )}
            提交
          </Button>
        </div>
      </div>
    </div>
  );
}
