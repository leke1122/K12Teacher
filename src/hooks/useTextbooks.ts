'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Textbook, TextbookPDF,
  getTextbooks, addTextbook, setActiveTextbook, removeTextbook,
  getActiveTextbook, getTextbookPDF, saveTextbookPDF,
  getTextbookChapters, saveTextbookChapters, saveTextbooks,
} from '@/lib/textbookStorage';
import { Chapter } from '@/types/chapter';
import { convertTOCChapters } from '@/types/chapter';

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

/**
 * 从 Supabase 获取教材数据
 */
async function fetchTextbooksFromSupabase(subjectId: string): Promise<Textbook[]> {
  try {
    console.log('[useTextbooks] 开始从 Supabase 加载教材, subjectId:', subjectId);
    
    const response = await fetch(`/api/textbook/list?subjectId=${subjectId}`);
    const data = await response.json();
    
    console.log('[useTextbooks] API 返回:', data);
    
    if (data.success && data.textbooks && data.textbooks.length > 0) {
      const textbooks = data.textbooks.map((t: { textbook_id: string; textbook_name: string; total_pages: number; uploaded_at: string; chapters?: unknown[] }) => ({
        id: t.textbook_id,
        name: t.textbook_name,
        grade: '高一',
        fileName: t.textbook_id + '.pdf',
        totalPages: t.total_pages || 0,
        uploadedAt: t.uploaded_at,
        isActive: false,
        chaptersCount: t.chapters?.length || 0,
      }));
      console.log('[useTextbooks] 转换后的教材:', textbooks);
      return textbooks;
    }
    console.log('[useTextbooks] Supabase 没有数据');
    return [];
  } catch (err) {
    console.error('[useTextbooks] fetchTextbooksFromSupabase error:', err);
    return [];
  }
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
    console.log('[useTextbooks] refresh 开始, subjectId:', subjectId);
    try {
      // 1. 优先从 Supabase 获取教材列表
      let textbookList = await fetchTextbooksFromSupabase(subjectId);
      console.log('[useTextbooks] fetchTextbooksFromSupabase 返回:', textbookList.length);
      
      // 2. 如果 Supabase 没有，尝试本地存储
      if (textbookList.length === 0) {
        textbookList = getTextbooks(subjectId);
        console.log('[useTextbooks] 从本地存储加载教材:', textbookList.length);
      } else {
        console.log('[useTextbooks] 从Supabase加载教材:', textbookList.length);
      }
      
      setTextbooks(textbookList);
      
      // 3. 获取当前激活的教材
      let active = getActiveTextbook(subjectId);
      
      // 如果本地没有激活的，尝试从 Supabase 取第一个
      if (!active && textbookList.length > 0) {
        active = textbookList[0];
        setActiveTextbook(subjectId, active.id);
      }
      
      setActiveTextbookState(active);
      
      // 4. 加载章节
      if (active) {
        // 尝试从 Supabase 获取章节
        const chs = await fetchChaptersFromSupabase(active.id);
        if (chs && chs.length > 0) {
          setChapters(chs);
        } else {
          // 降级到本地存储
          const localChs = getTextbookChapters(active.id);
          setChapters(localChs || []);
        }
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
      // 同时从 Supabase 删除
      try {
        await fetch(`/api/textbook/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textbookId }),
        });
      } catch {}
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

/**
 * 从 Supabase 获取章节数据
 */
async function fetchChaptersFromSupabase(textbookId: string): Promise<Chapter[]> {
  try {
    const response = await fetch(`/api/textbook/chapters?textbookId=${textbookId}`);
    const data = await response.json();
    
    if (data.success && data.chapters) {
      const chapters = data.chapters;
      
      // 检查是否是新的 TOC 格式 (带有 type 和 children)
      if (chapters.length > 0 && 'type' in chapters[0] && 'children' in chapters[0]) {
        console.log('[useTextbooks] 检测到TOC格式章节，转换为页面格式');
        return convertTOCChapters(chapters as import('@/types/chapter').TOCChapter[]);
      }
      
      return chapters as Chapter[];
    }
    return [];
  } catch (err) {
    console.error('[useTextbooks] fetchChaptersFromSupabase error:', err);
    return [];
  }
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
