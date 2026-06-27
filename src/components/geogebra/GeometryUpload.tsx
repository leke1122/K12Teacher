'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Image as ImageIcon } from 'lucide-react';

export interface GeometryUploadProps {
  onRecognized: (result: {
    shapeType: string;
    conditions: string[];
    question: string;
    message: string;
  }) => void;
}

export function GeometryUpload({ onRecognized }: GeometryUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setLoading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/geogebra/recognize', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.success) {
        onRecognized(json.data);
      } else {
        setError(json.error || '识别失败');
        setPreview(null);
      }
    } catch (e) {
      setError('请求失败，请稍后重试');
      setPreview(null);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-base flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          上传几何题图片
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            选择图片
          </Button>
          <span className="text-xs text-muted-foreground">支持截图或拍照上传</span>
        </div>

        {preview && (
          <div className="overflow-hidden rounded-lg border bg-slate-50">
            <img src={preview} alt="preview" className="h-48 w-full object-contain" />
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            AI 正在识别图形结构...
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </CardContent>
    </Card>
  );
}
