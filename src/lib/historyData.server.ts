// 历史学科统一教材读取
// 优先从 Supabase textbook_cache 读取，回退到本地 serverStorage
// 修复“未找到本课内容”问题：统一 subject_id='history' 的数据源

import { supabase as supabaseClient, isSupabaseConfigured } from './supabase';
import {
  getActiveTextbook as getLocalActiveTextbook,
  getTextbookPDF as getLocalTextbookPDF,
  getTextbookChapters as getLocalTextbookChapters,
} from './textbookStorage.server';
import type { TextbookCacheItem } from './supabase';

export interface HistoryTextbookSource {
  textbookId: string;
  textbookName: string;
  fullText?: string;
  pages?: { pageNumber: number; content: string }[];
  chapters?: unknown[];
  source: 'supabase' | 'local';
}

export async function getHistoryTextbook(): Promise<HistoryTextbookSource | null> {
  // 1. 优先从 Supabase 读取
  if (isSupabaseConfigured && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('textbook_cache')
        .select('textbook_id, textbook_name, full_text, pages, chapters')
        .eq('user_id', 'personal-user')
        .eq('subject_id', 'history')
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        return {
          textbookId: data.textbook_id,
          textbookName: data.textbook_name,
          fullText: data.full_text || undefined,
          pages: (data.pages as { pageNumber: number; content: string }[] | null) || undefined,
          chapters: (data.chapters as unknown[] | null) || undefined,
          source: 'supabase',
        };
      }
    } catch (err) {
      console.warn('[historyData.server] Supabase读取失败，回退本地:', err);
    }
  }

  // 2. 回退到本地 serverStorage
  const localTextbook = getLocalActiveTextbook('history');
  if (!localTextbook) {
    return null;
  }

  const localPdf = getLocalTextbookPDF(localTextbook.id);
  const localChapters = getLocalTextbookChapters(localTextbook.id);

  return {
    textbookId: localTextbook.id,
    textbookName: localTextbook.name,
    fullText: localPdf?.fullText,
    pages: localPdf?.pages,
    chapters: localChapters as unknown[] | undefined,
    source: 'local',
  };
}

export async function getHistoryTextbookTextByPages(
  chapterId: string,
  startPage?: number,
  endPage?: number,
): Promise<string | null> {
  const textbook = await getHistoryTextbook();
  if (!textbook) {
    console.warn('[historyData.server] 未找到历史教材');
    return null;
  }

  const pages = textbook.pages;
  if (!pages?.length) {
    // 回退到 fullText
    if (textbook.fullText) {
      return textbook.fullText.length > 5000
        ? textbook.fullText.slice(0, 5000) + '...'
        : textbook.fullText;
    }
    return null;
  }

  const chapters = textbook.chapters;

  // 优先使用指定页数范围
  if (startPage !== undefined && endPage !== undefined) {
    const pageRange = pages.filter((p) => {
      const num = Number(p.pageNumber);
      return num >= startPage && num <= endPage;
    });
    if (pageRange.length > 0) {
      return pageRange.map((p) => p.content).join('\n\n');
    }
  }

  // 尝试匹配章节（支持单元ID或课ID）
  if (chapters) {
    // 尝试匹配单元
    const matched = chapters.find((c: unknown) => {
      const chapter = c as Record<string, unknown>;
      return (
        String(chapter.chapterIndex) === chapterId ||
        chapter.chapterTitle === chapterId ||
        String(chapter.chapterTitle).includes(chapterId)
      );
    });

    if (matched) {
      const chapter = matched as Record<string, unknown>;
      const start = Number((chapter.pages as Record<string, unknown>)?.start ?? 0);
      const end = Number((chapter.pages as Record<string, unknown>)?.end ?? 9999);
      const chapterPages = pages.filter((p) => {
        const num = Number(p.pageNumber);
        return num >= start && num <= end;
      });
      if (chapterPages.length > 0) {
        return chapterPages.map((p) => p.content).join('\n\n');
      }
    }

    // 尝试匹配课（在sections中查找）
    for (const chapter of chapters) {
      const chapterRecord = chapter as Record<string, unknown>;
      const sections = chapterRecord.sections as Record<string, unknown>[] | undefined;
      if (sections) {
        const section = sections.find((s) => {
          return (
            s.sectionIndex === chapterId ||
            String(s.sectionIndex).includes(chapterId) ||
            s.sectionTitle === chapterId ||
            String(s.sectionTitle).includes(chapterId)
          );
        });

        if (section) {
          const sectionRecord = section as Record<string, unknown>;
          const pagesRecord = sectionRecord.pages as Record<string, unknown> | undefined;
          const start = Number(pagesRecord?.start ?? 0);
          const end = Number(pagesRecord?.end ?? 9999);
          const sectionPages = pages.filter((p) => {
            const num = Number(p.pageNumber);
            return num >= start && num <= end;
          });
          if (sectionPages.length > 0) {
            return sectionPages.map((p) => p.content).join('\n\n');
          }
        }
      }
    }
  }

  // 返回全部文本（限制长度）
  const allText = pages.map((p) => p.content).join('\n\n');
  return allText.length > 5000 ? allText.slice(0, 5000) + '...' : allText;
}

export async function getHistoryLessonContent(lessonId: string): Promise<string | null> {
  const textbook = await getHistoryTextbook();
  if (!textbook) {
    console.warn('[historyData.server] 未找到历史教材');
    return null;
  }

  const pages = textbook.pages;
  if (!pages?.length) {
    return textbook.fullText || null;
  }

  const chapters = textbook.chapters;
  if (!chapters) return null;

  // 标准化lessonId（去掉"第"和"课"字，提取数字）
  const normalizedId = lessonId.replace(/第/g, '').replace(/课/g, '').trim();

  // 在所有章节的sections中查找
  for (const chapter of chapters) {
    const chapterRecord = chapter as Record<string, unknown>;
    const sections = chapterRecord.sections as Record<string, unknown>[] | undefined;
    if (sections) {
      const section = sections.find((s) => {
        const sIndex = String(s.sectionIndex).replace(/第/g, '').replace(/课/g, '').trim();
        return (
          sIndex === normalizedId ||
          s.sectionIndex === lessonId ||
          String(s.sectionIndex).includes(lessonId) ||
          s.sectionTitle === lessonId ||
          String(s.sectionTitle).includes(lessonId)
        );
      });

      if (section) {
        const sectionRecord = section as Record<string, unknown>;
        const pagesRecord = sectionRecord.pages as Record<string, unknown> | undefined;
        const startPage = Number(pagesRecord?.start ?? 0);
        const endPage = Number(pagesRecord?.end ?? 9999);
        const sectionPages = pages.filter((p) => {
          const num = Number(p.pageNumber);
          return num >= startPage && num <= endPage;
        });
        if (sectionPages.length > 0) {
          return sectionPages.map((p) => p.content).join('\n\n');
        }
      }
    }
  }

  return null;
}

export async function getHistoryLessonTitle(lessonId: string): Promise<string | null> {
  const textbook = await getHistoryTextbook();
  if (!textbook) return null;

  const chapters = textbook.chapters;
  if (!chapters) return null;

  const normalizedId = lessonId.replace(/第/g, '').replace(/课/g, '').trim();

  for (const chapter of chapters) {
    const chapterRecord = chapter as Record<string, unknown>;
    const sections = chapterRecord.sections as Record<string, unknown>[] | undefined;
    if (sections) {
      const section = sections.find((s) => {
        const sIndex = String(s.sectionIndex).replace(/第/g, '').replace(/课/g, '').trim();
        return (
          sIndex === normalizedId ||
          s.sectionIndex === lessonId ||
          String(s.sectionIndex).includes(lessonId)
        );
      });

      if (section) {
        return `${section.sectionIndex} ${section.sectionTitle}`;
      }
    }
  }

  return null;
}
