'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Download, FileText, FileJson, Check, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  className?: string;
}

export default function ExportButton({ className }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: string, format: string) => {
    setLoading(`${type}-${format}`);
    
    try {
      const response = await fetch(`/api/words/export?type=${type}&format=${format}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '导出失败');
      }

      // 获取文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `${type}_export.${format}`;

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setOpen(false);
    } catch (error) {
      console.error('导出失败:', error);
      alert(error instanceof Error ? error.message : '导出失败');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Download className="h-4 w-4 mr-1" />
        导出
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              导出学习数据
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">已掌握单词</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleExport('words', 'csv')}
                  disabled={!!loading}
                >
                  {loading === 'words-csv' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-1" />
                  )}
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleExport('words', 'json')}
                  disabled={!!loading}
                >
                  {loading === 'words-json' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileJson className="h-4 w-4 mr-1" />
                  )}
                  JSON
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">错词本</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleExport('wrong', 'csv')}
                  disabled={!!loading}
                >
                  {loading === 'wrong-csv' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-1" />
                  )}
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleExport('wrong', 'json')}
                  disabled={!!loading}
                >
                  {loading === 'wrong-json' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileJson className="h-4 w-4 mr-1" />
                  )}
                  JSON
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">学习记录</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleExport('records', 'csv')}
                  disabled={!!loading}
                >
                  {loading === 'records-csv' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-1" />
                  )}
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleExport('records', 'json')}
                  disabled={!!loading}
                >
                  {loading === 'records-json' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileJson className="h-4 w-4 mr-1" />
                  )}
                  JSON
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
