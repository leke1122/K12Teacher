'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Textbook, TextbookPDF,
  getTextbooks, addTextbook, setActiveTextbook, removeTextbook,
  getActiveTextbook, getTextbookPDF, saveTextbookPDF,
  getTextbookChapters, saveTextbookChapters, saveTextbooks,
} from '@/lib/textbookStorage';
import { Chapter } from '@/types/chapter';

interface UseTextbooksReturn {
  textbooks: Textbook[];
  activeTextbook: Textbook | null;
  loading: boolean;
  error: string;
  chapters: Chapter[];
  // 操作
  switchTextbook: (textbookId: string) => Promise<void>;
  deleteTextbook: (textbookId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTextbooks(subjectId: string): UseTextbooksReturn {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [activeTextbook, setActiveTextbookState] = useState<Textbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 加载教材列表
      const list = getTextbooks(subjectId);
      setTextbooks(list);
      // 获取当前激活的教材
      const active = getActiveTextbook(subjectId);
      setActiveTextbookState(active);
      // 加载章节
      if (active) {
        const chs = getTextbookChapters(active.id);
        setChapters(chs || []);
      } else {
        setChapters([]);
      }
    } catch (err) {
      setError('加载教材失败');
      console.error('[useTextbooks] refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const switchTextbook = useCallback(async (textbookId: string) => {
    try {
      setActiveTextbook(subjectId, textbookId);
      await refresh();
    } catch (err) {
      setError('切换教材失败');
    }
  }, [subjectId, refresh]);

  const deleteTextbook = useCallback(async (textbookId: string) => {
    try {
      removeTextbook(subjectId, textbookId);
      await refresh();
    } catch (err) {
      setError('删除教材失败');
    }
  }, [subjectId, refresh]);

  return {
    textbooks,
    activeTextbook,
    loading,
    error,
    chapters,
    switchTextbook,
    deleteTextbook,
    refresh,
  };
}

// ==================== 教材上传相关 ====================

export async function uploadTextbook(
  subjectId: string,
  name: string,
  grade: string,
  file: File
): Promise<{ success: boolean; textbook?: Textbook; error?: string }> {
  try {
    // 1. 解析 PDF
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
    const json = await res.json();
    if (json.error) return { success: false, error: json.error };

    // 2. 创建教材元数据
    const textbookId = `${subjectId}_${Date.now()}`;
    const textbook: Textbook = {
      id: textbookId,
      name,
      grade,
      fileName: file.name,
      totalPages: json.totalPages,
      uploadedAt: new Date().toISOString(),
      isActive: false,
      chaptersCount: 0,
    };

    // 3. 保存教材元数据
    addTextbook(subjectId, textbook);

    // 4. 保存 PDF 数据
    const pdfData: TextbookPDF = {
      textbookId,
      subjectId,
      fileName: file.name,
      totalPages: json.totalPages,
      fullText: json.fullText,
      pages: json.pages || [],
      uploadedAt: new Date().toISOString(),
    };
    saveTextbookPDF(pdfData);

    return { success: true, textbook };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '上传失败' };
  }
}

export function saveTextbookChaptersData(
  textbookId: string,
  chapters: Chapter[]
): void {
  saveTextbookChapters(textbookId, chapters);
  // 更新教材章节数
  const subjectId = textbookId.split('_')[0];
  const list = getTextbooks(subjectId);
  const target = list.find((t) => t.id === textbookId);
  if (target) {
    target.chaptersCount = chapters.length;
    saveTextbooks(subjectId, list);
  }
}
