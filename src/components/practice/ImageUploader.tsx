'use client';

import { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Camera, ClipboardPaste } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onUpload: (imageData: string) => void;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

export function ImageUploader({ onUpload, onCancel, loading, className }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pasteActive, setPasteActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target?.result as string;
      setPreview(dataURL);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // 拖拽处理
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  }, [processFile]);

  // 粘贴处理
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) processFile(file);
        break;
      }
    }
  }, [processFile]);

  const handleConfirm = () => {
    if (preview) {
      onUpload(preview);
    }
  };

  const resetPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card className={cn('border-indigo-200 dark:border-indigo-800/50', className)}>
      <CardContent className="p-4 space-y-3">
        {/* 粘贴提示 */}
        {!preview && (
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
              dragOver
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
            )}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-2">
              <div className="flex justify-center gap-3 text-slate-400">
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">上传图片</span>
                </div>
                <div className="w-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex flex-col items-center gap-1">
                  <Camera className="h-8 w-8" />
                  <span className="text-xs">拍照上传</span>
                </div>
                <div className="w-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex flex-col items-center gap-1">
                  <ClipboardPaste className="h-8 w-8" />
                  <span className="text-xs">Ctrl+V粘贴</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                点击上传 · 拖拽文件 · 或粘贴截图
              </p>
              <p className="text-xs text-slate-300">支持 PNG、JPG、WebP 格式</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* 预览 */}
        {preview && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img
                src={preview}
                alt="上传的解题步骤"
                className="max-h-56 mx-auto object-contain"
              />
              <button
                onClick={resetPreview}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetPreview} className="flex-1 h-8 text-xs">
                重新选择
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 h-8 text-xs bg-indigo-500 hover:bg-indigo-600 gap-1"
              >
                {loading ? (
                  <span className="animate-spin inline-block">⟳</span>
                ) : (
                  <Upload className="h-3 w-3" />
                )}
                AI识别批改
              </Button>
            </div>
          </div>
        )}

        {/* 底部操作 */}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs text-slate-400">
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
