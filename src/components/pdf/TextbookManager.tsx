'use client';

import { useState, useRef } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Trash2, Upload, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Textbook } from '@/types/chapter';
import { TextbookUploadDialog } from './TextbookUploadDialog';

interface TextbookManagerProps {
  textbooks: Textbook[];
  activeTextbook: Textbook | null;
  onSwitch: (textbookId: string) => Promise<void>;
  onDelete: (textbookId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  subjectId: string;
}

export function TextbookManager({
  textbooks,
  activeTextbook,
  onSwitch,
  onDelete,
  onRefresh,
  subjectId,
}: TextbookManagerProps) {
  const [expanded, setExpanded] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSwitch = async (id: string) => {
    if (id === activeTextbook?.id) return;
    setSwitching(id);
    try {
      await onSwitch(id);
    } finally {
      setSwitching(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这本教材吗？相关章节数据也会被删除。')) return;
    setDeleting(id);
    try {
      await onDelete(id);
    } finally {
      setDeleting(null);
    }
  };

  const handleUploadClick = () => {
    if (uploadOpen) return;
    setUploadOpen(true);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <>
      <Card className="border-indigo-200 dark:border-indigo-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              教材管理
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                {textbooks.length} 本教材
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleUploadClick}
              >
                <Upload className="h-3 w-3" />
                上传教材
              </Button>
            </div>
          </div>

          {/* 当前教材 */}
          {activeTextbook && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Badge variant="default" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-300">
                当前教材
              </Badge>
              <span className="font-medium">{activeTextbook.name}</span>
              <span className="text-muted-foreground">（{activeTextbook.grade} · {activeTextbook.totalPages}页）</span>
            </div>
          )}
        </CardHeader>

        {/* 教材列表 */}
        {expanded && (
          <CardContent className="space-y-2 pt-0">
            {textbooks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无教材，上传第一本教材开始学习</p>
              </div>
            ) : (
              textbooks.map((tb) => (
                <div
                  key={tb.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                    tb.id === activeTextbook?.id
                      ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  {/* 选中指示器 */}
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    tb.id === activeTextbook?.id
                      ? "border-indigo-500 bg-indigo-500"
                      : "border-slate-300 dark:border-slate-600"
                  )}>
                    {tb.id === activeTextbook?.id && (
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    )}
                  </div>

                  {/* 教材信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{tb.name}</span>
                      <Badge variant="outline" className="text-xs px-1.5 py-0">{tb.grade}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>{tb.totalPages} 页</span>
                      {tb.chaptersCount > 0 && <span>{tb.chaptersCount} 章</span>}
                      <span>{formatDate(tb.uploadedAt)}</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {tb.id !== activeTextbook?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleSwitch(tb.id)}
                        disabled={switching === tb.id}
                      >
                        {switching === tb.id ? '切换中...' : '使用'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive"
                      onClick={() => handleDelete(tb.id)}
                      disabled={deleting === tb.id}
                      title="删除教材"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        )}
      </Card>

      {/* 上传对话框 */}
      <TextbookUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={async () => {
          setExpanded(true);
          await onRefresh();
        }}
        subjectId={subjectId}
      />
    </>
  );
}
