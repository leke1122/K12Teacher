'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, FileText, AlertCircle } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TextbookUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  subjectId: string;
}

const GRADES = ['高一', '高二', '高三'];

export function TextbookUploadDialog({ open, onOpenChange, onSuccess, subjectId }: TextbookUploadDialogProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('高一');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [suppressClose, setSuppressClose] = useState(false);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setSuppressClose(true);
      if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
      suppressTimerRef.current = setTimeout(() => {
        setSuppressClose(false);
        suppressTimerRef.current = null;
      }, 120);
    }
  }, [open]);

  const handleClose = (val: boolean) => {
    if (suppressClose) return;
    if (!loading) {
      setName('');
      setGrade('高一');
      setFile(null);
      setError('');
      onOpenChange(val);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('请输入教材名称'); return; }
    if (!file) { setError('请选择 PDF 文件'); return; }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.error) { setError(json.error); setLoading(false); return; }

      const saveRes = await fetch('/api/textbook/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          name: name.trim(),
          grade,
          fileName: file.name,
          totalPages: json.totalPages,
          fullText: json.fullText,
          pages: json.pages || [],
        }),
      });
      const saveJson = await saveRes.json();

      if (!saveJson.success) { setError(saveJson.error || '保存失败'); setLoading(false); return; }

      const { saveTextbook, saveTextbookPDF, getTextbooks, setActiveTextbook } = await import('@/lib/textbookStorage');
      saveTextbook(subjectId, saveJson.textbook);

      const existing = getTextbooks(subjectId);
      if (existing.length >= 1) {
        setActiveTextbook(subjectId, saveJson.textbook.id);
      }

      if (saveJson.pdf?.fullText) {
        saveTextbookPDF(saveJson.pdf);
      }

      setName('');
      setGrade('高一');
      setFile(null);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上传新教材
          </DialogTitle>
          <DialogDescription>
            请输入教材信息并上传 PDF 文件，支持 50MB 以内
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">教材名称</label>
            <Input
              placeholder="如：人教B版必修一"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">年级</label>
            <Select value={grade} onValueChange={setGrade} disabled={loading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">PDF 文件</label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                file ? "border-green-400 bg-green-50 dark:bg-green-950/20" : "border-muted hover:border-primary/50"
              )}
              disabled={loading}
            >
              <div className="flex flex-col items-center gap-2">
                {file ? (
                  <>
                    <FileText className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">点击选择 PDF 文件</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {loading ? '上传中...' : '上传'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
