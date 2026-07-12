'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { HandwritingPad } from '@/components/canvas/HandwritingPad';
import { ImageUploader } from '@/components/practice/ImageUploader';
import { PenLine, Image as ImageIcon, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepInputPadProps {
  onSubmit: (stepAnswer: string) => void;
  onCancel?: () => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

type InputMode = 'handwriting' | 'upload' | 'text';

export function StepInputPad({
  onSubmit,
  onCancel,
  loading = false,
  placeholder = '在这里输入答案...',
  className,
}: StepInputPadProps) {
  const [mode, setMode] = useState<InputMode>('handwriting');
  const [text, setText] = useState('');

  const handleHandwritingSubmit = (imageData: string) => {
    onSubmit(imageData);
  };

  const handleUploadSubmit = (imageData: string) => {
    onSubmit(imageData);
  };

  const handleTextSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
  };

  const reset = () => {
    setText('');
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 模式切换标签 */}
      <div className="flex gap-1 p-2 bg-slate-100 rounded-t-lg border-b">
        <Button
          variant={mode === 'handwriting' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('handwriting')}
          className={cn(
            'gap-1.5 text-xs h-8',
            mode === 'handwriting' && 'bg-indigo-500 hover:bg-indigo-600'
          )}
        >
          <PenLine className="h-3 w-3" />
          手写
        </Button>
        <Button
          variant={mode === 'upload' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('upload')}
          className={cn(
            'gap-1.5 text-xs h-8',
            mode === 'upload' && 'bg-indigo-500 hover:bg-indigo-600'
          )}
        >
          <ImageIcon className="h-3 w-3" />
          上传
        </Button>
        <Button
          variant={mode === 'text' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('text')}
          className={cn(
            'gap-1.5 text-xs h-8',
            mode === 'text' && 'bg-indigo-500 hover:bg-indigo-600'
          )}
        >
          <Type className="h-3 w-3" />
          打字
        </Button>
      </div>

      {/* 手写模式 */}
      {mode === 'handwriting' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0">
            <HandwritingPad
              onSave={handleHandwritingSubmit}
              onCancel={onCancel || (() => {})}
              loading={loading}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* 上传模式 */}
      {mode === 'upload' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <ImageUploader
              onUpload={handleUploadSubmit}
              onCancel={onCancel || (() => {})}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* 打字模式 */}
      {mode === 'text' && (
        <div className="flex-1 flex flex-col p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="flex-1 w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex gap-2 mt-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
              className="text-xs h-8"
            >
              清空
            </Button>
            <Button
              size="sm"
              onClick={handleTextSubmit}
              disabled={loading || !text.trim()}
              className="bg-indigo-500 hover:bg-indigo-600 text-xs h-8 gap-1"
            >
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                '提交'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
