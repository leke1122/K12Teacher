'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-react';

interface ImportResult {
  importId: string;
  unitTitle: string;
  pageRange: string;
  summary?: string;
  stats: {
    concepts: number;
    events: number;
    links: number;
    examFocus: number;
  };
  preview: Array<{
    name: string;
    category: string;
    importance: number;
  }>;
}

interface DocxImportItem {
  id: string;
  file_name: string;
  unit_title: string;
  page_range?: string;
  concepts_count?: number;
  events_count?: number;
  imported_at?: string;
}

interface DocxImportButtonProps {
  onImportSuccess?: (result: ImportResult) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function DocxImportButton({
  onImportSuccess,
  className,
  variant = 'outline',
  size = 'sm',
}: DocxImportButtonProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [imports, setImports] = useState<DocxImportItem[]>([]);
  const [loadingImports, setLoadingImports] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImports = async () => {
    setLoadingImports(true);
    try {
      const res = await fetch('/api/history/knowledge/import-docx');
      const json = await res.json();
      if (json.success) {
        setImports(json.imports || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingImports(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(10);
    setError(null);
    setResult(null);

    try {
      setProgress(30);
      const formData = new FormData();
      formData.append('file', file);

      setProgress(50);

      const res = await fetch('/api/history/knowledge/import-docx', {
        method: 'POST',
        body: formData,
      });

      setProgress(80);

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || '导入失败');
      }

      setProgress(100);
      setResult(json as ImportResult);
      onImportSuccess?.(json as ImportResult);
      await loadImports();
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    } finally {
      setUploading(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条导入记录吗？')) return;
    try {
      await fetch(`/api/history/knowledge/import-docx?id=${id}`, { method: 'DELETE' });
      setImports(prev => prev.filter(i => i.id !== id));
    } catch {
      // ignore
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadImports();
      setResult(null);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Upload className="h-4 w-4 mr-1" />
          导入知识点
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            导入历史知识点清单
          </DialogTitle>
        </DialogHeader>

        {/* 上传区域 */}
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              uploading
                ? 'border-blue-300 bg-blue-50'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 cursor-pointer'
            }`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {uploading ? (
              <div className="space-y-3">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500" />
                <p className="text-sm text-blue-600">正在解析文档...</p>
                <Progress value={progress} className="w-full max-w-xs mx-auto" />
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-slate-400" />
                <div>
                  <p className="text-sm font-medium">点击上传 .docx 文件</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持高中历史知识点清单格式的 Word 文档
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto hover:opacity-70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* 导入结果 */}
          {result && (
            <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  导入成功
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">{result.unitTitle}</p>
                  <p className="text-muted-foreground text-xs">{result.pageRange}</p>
                </div>

                {/* 统计 */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white dark:bg-slate-900 rounded p-2">
                    <div className="text-lg font-bold text-blue-600">{result.stats.concepts}</div>
                    <div className="text-xs text-muted-foreground">知识点</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded p-2">
                    <div className="text-lg font-bold text-amber-600">{result.stats.events}</div>
                    <div className="text-xs text-muted-foreground">时间轴</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded p-2">
                    <div className="text-lg font-bold text-purple-600">{result.stats.links}</div>
                    <div className="text-xs text-muted-foreground">因果链</div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded p-2">
                    <div className="text-lg font-bold text-red-600">{result.stats.examFocus}</div>
                    <div className="text-xs text-muted-foreground">高考重点</div>
                  </div>
                </div>

                {/* 预览前几个概念 */}
                {result.preview.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">概念预览：</p>
                    <div className="flex flex-wrap gap-1">
                      {result.preview.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {item.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 历史导入记录 */}
          <div className="space-y-2">
            <p className="text-sm font-medium">已导入的知识点清单</p>
            {loadingImports ? (
              <div className="text-center py-4">
                <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
              </div>
            ) : imports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-3">
                暂无导入记录
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {imports.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg border bg-white dark:bg-slate-900"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.unit_title || item.file_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {item.concepts_count != null && (
                          <span>{item.concepts_count} 个知识点</span>
                        )}
                        {item.page_range && <span>· {item.page_range}</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 格式说明 */}
          <div className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded p-3 space-y-1">
            <p className="font-medium text-foreground">支持格式说明：</p>
            <p>• 文档应为 Word .docx 格式</p>
            <p>• 内容格式：以"数字+"开头的主知识点（如"2、分封制"）</p>
            <p>• 包含**目的**、**影响**等加粗字段标题</p>
            <p>• 包含① ② ③等列表项（影响/意义）</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
