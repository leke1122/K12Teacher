'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, Loader2, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChapterTree } from './ChapterTree';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { savePDF as dataSyncSavePDF, getPDF as dataSyncGetPDF, saveChapters as dataSyncSaveChapters, getChapters as dataSyncGetChapters } from '@/lib/dataSync';
import { useDataSync, formatSyncStatus } from '@/hooks/useDataSync';
import { Chapter } from '@/types/chapter';
import { resolvePageRange } from '@/lib/pdf-utils';

interface PDFUploaderProps {
  subjectId: string;
  activeTextbookId?: string;
  onParsed: (text: string, pages: number, fileName?: string) => void;
  onChaptersExtracted: (chapters: Chapter[]) => void;
  onCloudStatusChange?: (status: 'connected' | 'disconnected' | 'syncing' | 'error') => void;
}

export function PDFUploader({ subjectId, activeTextbookId, onParsed, onChaptersExtracted, onCloudStatusChange }: PDFUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfText, setPdfText] = useState('');
  const [fileName, setFileName] = useState('');
  const [pages, setPages] = useState(0);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [parsed, setParsed] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [showChapters, setShowChapters] = useState(false);
  const { settings } = useSettingsStore();

  const { isSyncing } = useDataSync();

  const loadFromCloud = useCallback(async () => {
    const result = await dataSyncGetPDF(subjectId);

    if (result.success && result.data) {
      setFileName(result.data.file_name);
      setPages(result.data.total_pages);
      setPdfText(result.data.full_text);
      setPreview((result.data.full_text || '').slice(0, 300) + '...');
      setParsed(true);
      onParsed(result.data.full_text || '', result.data.total_pages, result.data.file_name);
      setSuccessMsg(result.message);
    }

    // 同时加载已保存的章节
    const chaptersResult = await dataSyncGetChapters(subjectId);
    if (chaptersResult.success && chaptersResult.data && chaptersResult.data.length > 0) {
      const loadedChapters = chaptersResult.data as unknown as Chapter[];
      console.log('[PDFUploader] 从本地加载章节，数量:', loadedChapters.length);
      setChapters(loadedChapters);
      setShowChapters(true);
      onChaptersExtracted(loadedChapters);
    }

    return result.data ?? null;
  }, [subjectId, onParsed, onChaptersExtracted]);

  useEffect(() => {
    loadFromCloud();
  }, [loadFromCloud]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setError('文件大小超过 50MB 限制');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setParsed(false);
    setPdfText('');
    setChapters([]);
    setShowChapters(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('[上传] 开始上传，学科:', subjectId, '文件:', file.name);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setPdfText(data.fullText);
      setFileName(file.name);
      setPages(data.totalPages);
      setPreview(data.fullText?.slice(0, 300) + '...');
      setParsed(true);
      onParsed(data.fullText, data.totalPages, file.name);

      console.log('[上传] 解析完成，学科:', subjectId, '页数:', data.totalPages, '文本长度:', data.fullText?.length);

      setSaving(true);
      onCloudStatusChange?.('syncing');

      const saveResult = await dataSyncSavePDF({
        subject_id: subjectId,
        file_name: file.name,
        total_pages: data.totalPages,
        full_text: data.fullText,
        pages: data.pages || [],
        uploaded_at: new Date().toISOString(),
      });

      setSaving(false);

      const statusInfo = formatSyncStatus(saveResult);
      if (statusInfo.icon === 'success') {
        setSuccessMsg('✅ ' + statusInfo.text);
        onCloudStatusChange?.('connected');
      } else if (statusInfo.icon === 'local') {
        setSuccessMsg('💾 ' + statusInfo.text);
        onCloudStatusChange?.(saveResult.cloudSynced ? 'syncing' : 'disconnected');
      } else {
        setSuccessMsg('❌ ' + statusInfo.text);
        onCloudStatusChange?.('error');
      }
    } catch (err) {
      setError('上传失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleExtractChapters = async (forceRefresh: boolean = false) => {
    if (!settings?.deepseekKey) {
      setError('请先在设置页面配置 DeepSeek API Key');
      return;
    }

    setExtracting(true);
    setError('');

    try {
      console.log('[提取章节] 开始提取，forceRefresh:', forceRefresh);
      const response = await fetch('/api/extract-chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pdfText,
          apiKey: settings.deepseekKey,
          subjectId,
          textbookId: activeTextbookId,
          refresh: forceRefresh,
        }),
      });
      const data = await response.json();

      console.log('[提取章节] 学科:', subjectId, '接口返回 error:', data.error, '章节数:', data.chapters?.length, 'source:', data.source);
      if (data.chapters?.length) {
        console.log('[提取章节] 第1章:', data.chapters[0]?.chapterTitle);
        console.log('[提取章节] 第1章是否有sections:', !!data.chapters[0]?.sections, 'sections数量:', data.chapters[0]?.sections?.length);
        if (data.chapters[0]?.sections?.[0]) {
          console.log('[提取章节] 第1课:', data.chapters[0]?.sections[0]?.sectionIndex, data.chapters[0]?.sections[0]?.sectionTitle);
        }
      }

      if (data.error) {
        setError(data.error);
        if (data.rawResponse) {
          console.log('AI Raw Response:', data.rawResponse);
        }
        return;
      }

      const extractedChapters: Chapter[] = (data.chapters || []) as Chapter[];
      console.log('[提取章节] 保存章节，学科:', subjectId, '数量:', extractedChapters.length, '第1章:', extractedChapters[0]?.chapterTitle);

      setChapters(extractedChapters);
      setShowChapters(true);
      onChaptersExtracted(extractedChapters);

      const saveResult = await dataSyncSaveChapters(subjectId, extractedChapters as any);
      const statusInfo = formatSyncStatus(saveResult);

      if (statusInfo.icon === 'success') {
        setSuccessMsg(prev => prev ? prev + '，' + statusInfo.text : '章节已保存（云端已备份）');
      } else {
        setSuccessMsg(prev => prev ? prev + '，' + statusInfo.text : '章节已保存到本地');
      }
    } catch (err) {
      setError('章节提取失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setExtracting(false);
    }
  };

  const handleChapterClick = (chapter: Chapter, section?: unknown, subSection?: unknown) => {
    const pagesObj = (subSection as any)?.pages || (section as any)?.pages || chapter.pages;
    const range = resolvePageRange(pagesObj);
    console.log(`跳转到第 ${range.start}-${range.end} 页`, { chapter, section, subSection });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上传教材 PDF
            {isSyncing && (
              <span className="ml-2 text-xs flex items-center gap-1 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                同步中
              </span>
            )}
          </CardTitle>
          <CardDescription>
            支持 PDF 格式，最大 50MB {parsed && '(已加载)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              disabled={loading || saving}
              className="hidden"
              id={`pdf-upload-${subjectId}`}
            />
            <label htmlFor={`pdf-upload-${subjectId}`} className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  "p-3 rounded-full",
                  parsed && "bg-green-100 dark:bg-green-900/30",
                  (loading || saving || isSyncing) && "bg-muted animate-pulse",
                  !parsed && !loading && !saving && !isSyncing && "bg-muted"
                )}>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : saving || isSyncing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : parsed ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {loading ? '解析中...' : saving || isSyncing ? '保存中...' : parsed ? `${fileName} (${pages} 页)` : '点击选择 PDF 文件'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {loading ? '正在提取文本...' : '支持拖拽上传'}
                  </p>
                </div>
              </div>
            </label>
          </div>

          {parsed && !extracting && (
            <div className="flex gap-2">
              <Button
                onClick={() => handleExtractChapters(false)}
                className="flex-1"
                variant="default"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI 提取章节
              </Button>
              {chapters.length > 0 && (
                <Button
                  onClick={() => handleExtractChapters(true)}
                  variant="outline"
                  title="强制重新提取章节"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {extracting && (
            <Button disabled className="w-full">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              AI 正在分析章节结构...
            </Button>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {successMsg && !error && (
            <div className={cn(
              "flex items-center gap-2 p-3 text-sm rounded-lg",
              successMsg.includes('✅') ? "text-green-600 bg-green-50 dark:bg-green-900/20" :
              successMsg.includes('💾') ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" :
              "text-muted-foreground bg-muted"
            )}>
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <p>{successMsg}</p>
            </div>
          )}

          {preview && !showChapters && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">文本预览：</p>
              <p className="text-sm whitespace-pre-wrap">{preview}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chapter Tree */}
      {showChapters && chapters.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <ChapterTree
              chapters={chapters}
              onChapterClick={handleChapterClick}
              subjectId={subjectId}
            />
          </CardContent>
        </Card>
      )}

      {showChapters && chapters.length === 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>未能提取到章节结构，请尝试重新上传或检查 PDF 内容</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
