'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, FileText, AlertCircle, File, CheckCircle2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fixMathSymbols } from '@/lib/pdf-utils';
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [tocFile, setTocFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsingStatus, setParsingStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const pdfRef = useRef<HTMLInputElement>(null);
  const tocRef = useRef<HTMLInputElement>(null);

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
      setPdfFile(null);
      setTocFile(null);
      setError('');
      setSuccess(false);
      onOpenChange(val);
    }
  };

  const handleSubmit = async () => {
    if (!pdfFile) { setError('请选择 PDF 文件'); return; }

    setLoading(true);
    setError('');
    setParsingStatus('');

    try {
      // 1. 使用动态导入的 pdf.js 解析 PDF
      setParsingStatus('正在解析 PDF...');
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const pages: { pageNumber: number; content: string }[] = [];
      let fullText = '';

      for (let i = 1; i <= totalPages; i++) {
        setParsingStatus(`正在解析第 ${i}/${totalPages} 页...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const rawPageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join('');
        const dedupedPageText = rawPageText.replace(/(.+?)\1+/g, '$1');
        const fixedPageText = fixMathSymbols(dedupedPageText);
        pages.push({ pageNumber: i, content: fixedPageText });
        fullText += fixedPageText + '\n';
      }

      const textLength = fullText.trim().replace(/\s/g, '').length;
      if (textLength < 100) {
        setError('此PDF可能为扫描版（无文字层），无法直接解析。请上传文字版PDF。');
        setLoading(false);
        return;
      }

      // fullText 已由各页 fixedPageText 累积构建，无需再修复
      fullText = fullText.trim();

      // 2. 解析 TXT 目录（可选）
      let tocData: { title: string; subject: string; chapters: unknown[] } = { title: name.trim() || '未命名教材', subject: subjectId, chapters: [] };
      if (tocFile) {
        setParsingStatus('正在解析目录...');
        const tocContent = await tocFile.text();
        tocData = parseTxtTOC(tocContent);
      } else {
        // 无目录时生成默认章节
        tocData = {
          title: name.trim() || pdfFile.name.replace('.pdf', ''),
          subject: subjectId,
          chapters: Array.from({ length: totalPages }, (_, i) => ({
            id: `page_${i + 1}`,
            title: `第 ${i + 1} 页`,
            startPage: i + 1,
            endPage: i + 1,
            type: 'lesson',
            pages: {
              type: 'file' as const,
              start: i + 1,
              end: i + 1,
            },
            children: [],
          })),
        };
      }
      
      const textbookName = name.trim() || tocData.title;
      setParsingStatus('正在上传...');

      // 3. 保存教材到 Supabase
      const saveRes = await fetch('/api/textbook/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          name: textbookName,
          grade,
          fileName: pdfFile.name,
          totalPages,
          fullText: fullText.trim(),
          pages,
          chapters: tocData.chapters,
        }),
      });
      const saveJson = await saveRes.json();
      
      console.log('[上传] API响应:', saveJson);

      if (!saveJson.success) { 
        setError(saveJson.error || '保存失败'); 
        setLoading(false); 
        return; 
      }

      console.log('[上传] 教材上传成功:', textbookName, tocData.chapters.length, '个章节');
      setSuccess(true);
      setParsingStatus('');
      
      setTimeout(() => {
        setName('');
        setGrade('高一');
        setPdfFile(null);
        setTocFile(null);
        setSuccess(false);
        onOpenChange(false);
        onSuccess();
      }, 1500);

    } catch (err) {
      console.error('[上传] 错误:', err);
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
            上传教材
          </DialogTitle>
          <DialogDescription className="text-left">
            请上传 <strong>PDF教材</strong>（必选）。TXT目录文件为可选，上传后系统会自动解析章节结构。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 教材名称（可选） */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              教材名称 <span className="text-xs text-muted-foreground font-normal">（可选）</span>
            </label>
            <Input
              placeholder="如留空则自动从TXT读取"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* 年级选择 */}
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

          {/* PDF 文件上传 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">PDF 教材文件 <span className="text-destructive">*</span></label>
            <input
              ref={pdfRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => pdfRef.current?.click()}
              className={cn(
                "w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                pdfFile ? "border-green-400 bg-green-50 dark:bg-green-950/20" : "border-muted hover:border-primary/50"
              )}
              disabled={loading}
            >
              <div className="flex flex-col items-center gap-2">
                {pdfFile ? (
                  <>
                    <FileText className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">{pdfFile.name}</span>
                    <span className="text-xs text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">点击选择 PDF 文件</span>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* TXT 目录文件上传 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">TXT 目录文件 <span className="text-xs text-muted-foreground font-normal">（可选）</span></label>
            <input
              ref={tocRef}
              type="file"
              accept=".txt"
              className="hidden"
              onChange={(e) => setTocFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => tocRef.current?.click()}
              className={cn(
                "w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                tocFile ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20" : "border-muted hover:border-primary/50"
              )}
              disabled={loading}
            >
              <div className="flex flex-col items-center gap-2">
                {tocFile ? (
                  <>
                    <File className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">{tocFile.name}</span>
                    <span className="text-xs text-muted-foreground">目录文件</span>
                  </>
                ) : (
                  <>
                    <File className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">点击选择 TXT 目录文件（可选）</span>
                  </>
                )}
              </div>
            </button>
            <p className="text-xs text-muted-foreground">
              TXT格式：第一行 <code className="bg-muted px-1 rounded"># 教材名称</code>，第二行 <code className="bg-muted px-1 rounded"># 学科</code>，其余为章节
            </p>
          </div>

          {/* 解析状态 */}
          {parsingStatus && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              {parsingStatus}
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              上传成功！
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !pdfFile}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            {loading ? '上传中...' : '上传教材'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 解析 TXT 目录内容
 */
function parseTxtTOC(content: string): { title: string; subject: string; chapters: unknown[] } {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  let title = '';
  let subject = '';
  const chapters: unknown[] = [];
  let currentUnit: { id: string; title: string; startPage: number; endPage: number; type: string; children: unknown[] } | null = null;
  let unitCount = 0;
  let lessonCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 跳过纯数字行
    if (/^\d+$/.test(trimmed)) continue;

    // 解析元数据
    if (trimmed.startsWith('# ')) {
      const key = trimmed.substring(2).trim();
      if (!title) {
        title = key;
      } else if (!subject) {
        subject = key;
      }
      continue;
    }

    // 解析单元
    if (trimmed.startsWith('## ')) {
      const parts = trimmed.substring(3).split('|');
      unitCount++;
      currentUnit = {
        id: `unit_${unitCount}`,
        title: parts[0].trim(),
        startPage: parts.length > 1 ? parseInt(parts[1]) || 0 : 0,
        endPage: parts.length > 2 ? parseInt(parts[2]) || 0 : 0,
        type: 'unit',
        children: []
      };
      chapters.push(currentUnit);
      continue;
    }

    // 解析课/节
    if (!trimmed.startsWith('#') && trimmed.includes('|')) {
      const parts = trimmed.split('|');
      if (parts.length >= 3) {
        lessonCount++;
        const lesson = {
          id: `lesson_${unitCount}_${lessonCount}`,
          title: parts[0].trim(),
          startPage: parseInt(parts[1]) || 0,
          endPage: parseInt(parts[2]) || 0,
          type: 'lesson'
        };
        
        if (currentUnit) {
          currentUnit.children.push(lesson);
        } else {
          chapters.push(lesson);
        }
      }
    }
  }

  if (!subject) subject = 'history';
  if (!title) title = '未知教材';

  return { title, subject, chapters };
}
