// 历史学科统一教材读取
// 优先从 Supabase textbook_cache 读取，回退到本地 serverStorage
// 修复"未找到本课内容"问题：统一 subject_id='history' 的数据源

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

/**
 * 带重试的 Supabase 查询（解决冷启动/RLS 延迟问题）
 */
async function queryWithRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  retries = 2,
  delayMs = 500
): Promise<{ data: T | null; error: unknown; attempts: number }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await queryFn();
      return { ...result, attempts: attempt };
    } catch (err) {
      lastError = err;
      if (attempt <= retries) {
        console.log(`[historyData.server] 查询失败，${delayMs}ms后重试 (${attempt}/${retries}):`, err);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  return { data: null, error: lastError, attempts: retries + 1 };
}

/**
 * 获取历史教材数据（统一入口）
 * 优先从 Supabase textbook_cache 读取，回退到本地 serverStorage
 */
export async function getHistoryTextbook(): Promise<HistoryTextbookSource | null> {
  const isSupa = isSupabaseConfigured;
  const client = supabaseClient;
  
  console.log('[historyData.server] === 开始获取历史教材 ===');
  console.log('[historyData.server] Supabase 配置状态:', {
    isConfigured: isSupa,
    hasUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasKey: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    clientExists: !!client,
  });

  // 1. 优先从 Supabase 读取（带重试 + RLS 兜底策略）
  if (isSupa && client) {
    // 诊断性查询：先检查表结构和数据情况
    console.log('[historyData.server] 正在查询 Supabase textbook_cache 表...');
    
    // 方法A：精确按 user_id + subject_id 查询
    const { data: supabaseData, error: supabaseError, attempts } = await queryWithRetry(
      async () => {
        const result = await client
          .from('textbook_cache')
          .select('textbook_id, textbook_name, full_text, pages, chapters, user_id, subject_id, uploaded_at')
          .eq('user_id', 'personal-user')
          .eq('subject_id', 'history')
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .single();
        return { data: result.data as TextbookCacheItem | null, error: result.error };
      }
    );

    console.log('[historyData.server] Supabase 查询结果 (user_id 过滤):', {
      hasData: !!supabaseData,
      error: supabaseError ? String(supabaseError) : null,
      attempts,
      dataKeys: supabaseData ? Object.keys(supabaseData) : [],
      hasFullText: !!(supabaseData as any)?.full_text,
      hasPages: !!((supabaseData as any)?.pages?.length),
      userId: (supabaseData as any)?.user_id,
      subjectId: (supabaseData as any)?.subject_id,
    });

    // 检查是否为 RLS 策略过滤导致的空结果
    const isRlsEmpty =
      (!supabaseData || !((supabaseData as any)?.textbook_id)) &&
      (supabaseError === null || (supabaseError as any)?.code === 'PGRST116');

    if (!isRlsEmpty && supabaseData && (supabaseData as any)?.textbook_id) {
      return {
        textbookId: (supabaseData as any).textbook_id,
        textbookName: (supabaseData as any).textbook_name,
        fullText: (supabaseData as any).full_text || undefined,
        pages: ((supabaseData as any).pages as { pageNumber: number; content: string }[] | null) || undefined,
        chapters: ((supabaseData as any).chapters as unknown[] | null) || undefined,
        source: 'supabase',
      };
    }

    // 方法B：RLS 过滤导致空结果 → 不带 user_id 过滤查询所有历史教材
    console.log('[historyData.server] 带 user_id 过滤无结果，尝试不带 user_id 查询...');
    const { data: noUserIdData, error: noUserIdError } = await queryWithRetry(async () => {
      const result = await client
        .from('textbook_cache')
        .select('textbook_id, textbook_name, full_text, pages, chapters, user_id, subject_id, uploaded_at')
        .eq('subject_id', 'history')
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();
      return { data: result.data as TextbookCacheItem | null, error: result.error };
    });

    console.log('[historyData.server] 无 user_id 过滤查询结果:', {
      hasData: !!noUserIdData,
      error: noUserIdError ? String(noUserIdError) : null,
      userId: (noUserIdData as any)?.user_id,
      hasFullText: !!(noUserIdData as any)?.full_text,
    });

    if (noUserIdData && (noUserIdData as any)?.textbook_id) {
      return {
        textbookId: (noUserIdData as any).textbook_id,
        textbookName: (noUserIdData as any).textbook_name,
        fullText: (noUserIdData as any).full_text || undefined,
        pages: ((noUserIdData as any).pages as { pageNumber: number; content: string }[] | null) || undefined,
        chapters: ((noUserIdData as any).chapters as unknown[] | null) || undefined,
        source: 'supabase',
      };
    }
  }

  // 2. 回退到本地 serverStorage
  console.log('[historyData.server] 回退到本地 serverStorage...');
  const localTextbook = getLocalActiveTextbook('history');
  if (!localTextbook) {
    console.warn('[historyData.server] 本地也无历史教材');
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

  console.log('[historyData.server] getHistoryTextbookTextByPages:', {
    chapterId,
    textbookId: textbook.textbookId,
    source: textbook.source,
    hasFullText: !!textbook.fullText,
    pagesCount: textbook.pages?.length || 0,
    chaptersCount: textbook.chapters?.length || 0,
  });

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
  // 支持两种格式：1) 旧格式 {chapterIndex, chapterTitle, sections} 2) 新格式 {id, title, children}
  if (chapters) {
    // 尝试匹配单元或课（优先精确匹配）
    let matched: Record<string, unknown> | null = null;
    let matchType: 'unit' | 'lesson' | null = null;
    
    // 第一步：遍历所有单元
    for (const c of chapters) {
      const chapter = c as Record<string, unknown>;
      const chapterIdStr = String(chapterId).toLowerCase();
      
      // 检查是否是单元匹配
      const idMatch = String(chapter.id || '').toLowerCase() === chapterIdStr;
      const titleMatch = String(chapter.title || '').includes(String(chapterId));
      const indexMatch = String(chapter.chapterIndex || '').toLowerCase() === chapterIdStr;
      
      if (idMatch || titleMatch || indexMatch) {
        matched = chapter;
        matchType = 'unit';
        break;
      }
      
      // 检查是否是课时匹配（在 children 中查找）
      const children = chapter.children as Record<string, unknown>[] | undefined;
      if (children && Array.isArray(children)) {
        const section = children.find((s) => {
          const sId = String(s.id || '').toLowerCase();
          const sTitle = String(s.title || '').includes(String(chapterId));
          const sIndex = String(s.sectionIndex || '').toLowerCase() === chapterIdStr;
          return sId === chapterIdStr || sTitle || sIndex;
        });
        
        if (section) {
          matched = section as Record<string, unknown>;
          matchType = 'lesson';
          break;
        }
      }
    }

    if (matched && matchType) {
      let start = 0;
      let end = 9999;
      
      if (matchType === 'unit') {
        // 单元：使用 startPage/endPage
        start = Number((matched as Record<string, unknown>).startPage ?? 0);
        end = Number((matched as Record<string, unknown>).endPage ?? 9999);
      } else {
        // 课时：直接用 startPage/endPage
        start = Number((matched as Record<string, unknown>).startPage ?? 0);
        end = Number((matched as Record<string, unknown>).endPage ?? 9999);
      }
      
      const matchedPages = pages.filter((p) => {
        const num = Number(p.pageNumber);
        return num >= start && num <= end;
      });
      if (matchedPages.length > 0) {
        return matchedPages.map((p) => p.content).join('\n\n');
      }
    }

    // 旧格式兼容：尝试匹配 sections
    for (const chapter of chapters) {
      const chapterRecord = chapter as Record<string, unknown>;
      const sections = chapterRecord.sections as Record<string, unknown>[] | undefined;
      if (sections) {
        const section = sections.find((s) => {
          return (
            s.sectionIndex === chapterId ||
            String(s.sectionIndex).includes(String(chapterId)) ||
            s.sectionTitle === chapterId ||
            String(s.sectionTitle).includes(String(chapterId))
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

  const lessonIdStr = String(lessonId).toLowerCase();
  const normalizedId = lessonId.replace(/第/g, '').replace(/课/g, '').trim();

  // 支持两种格式：1) 旧格式 {chapterIndex, chapterTitle, sections} 2) 新格式 {id, title, children}
  // 在所有章节中查找课时
  for (const chapter of chapters) {
    const chapterRecord = chapter as Record<string, unknown>;
    
    // 新格式：在 children 中查找课时
    const children = chapterRecord.children as Record<string, unknown>[] | undefined;
    if (children && Array.isArray(children)) {
      const section = children.find((s) => {
        const sId = String(s.id || '').toLowerCase();
        const sTitle = String(s.title || '').toLowerCase();
        return sId === lessonIdStr || sTitle.includes(lessonIdStr);
      });
      
      if (section) {
        const start = Number(section.startPage ?? 0);
        const end = Number(section.endPage ?? 9999);
        const filteredPages = pages.filter((p) => {
          const num = Number(p.pageNumber);
          return num >= start && num <= end;
        });
        if (filteredPages.length > 0) {
          return filteredPages.map((p) => p.content).join('\n\n');
        }
      }
    }
    
    // 旧格式：在 sections 中查找
    const sections = chapterRecord.sections as Record<string, unknown>[] | undefined;
    if (sections) {
      const section = sections.find((s) => {
        return (
          s.sectionIndex === lessonId ||
          String(s.sectionIndex).includes(normalizedId) ||
          s.sectionTitle === lessonId ||
          String(s.sectionTitle).includes(lessonId)
        );
      });

      if (section) {
        const sectionRecord = section as Record<string, unknown>;
        const pagesRecord = sectionRecord.pages as Record<string, unknown> | undefined;
        const start = Number(pagesRecord?.start ?? 0);
        const end = Number(pagesRecord?.end ?? 9999);
        const filteredPages = pages.filter((p) => {
          const num = Number(p.pageNumber);
          return num >= start && num <= end;
        });
        if (filteredPages.length > 0) {
          return filteredPages.map((p) => p.content).join('\n\n');
        }
      }
    }
  }

  return null;
}

export async function getHistoryLessonTitle(lessonId: string): Promise<string | null> {
  const textbook = await getHistoryTextbook();
  if (!textbook?.chapters) return null;

  const chapters = textbook.chapters;
  const lessonIdStr = String(lessonId).toLowerCase();

  // 支持两种格式：1) 旧格式 {chapterIndex, chapterTitle, sections} 2) 新格式 {id, title, children}
  for (const chapter of chapters) {
    const chapterRecord = chapter as Record<string, unknown>;
    
    // 新格式：在 children 中查找课时
    const children = chapterRecord.children as Record<string, unknown>[] | undefined;
    if (children && Array.isArray(children)) {
      const section = children.find((s) => {
        const sId = String(s.id || '').toLowerCase();
        const sTitle = String(s.title || '').toLowerCase();
        return sId === lessonIdStr || sTitle.includes(lessonIdStr);
      });
      if (section) {
        return section.title as string || null;
      }
    }
    
    // 旧格式：在 sections 中查找
    const sections = chapterRecord.sections as Record<string, unknown>[] | undefined;
    if (sections) {
      const normalizedId = lessonId.replace(/第/g, '').replace(/课/g, '').trim();
      const section = sections.find((s) => {
        return (
          s.sectionIndex === lessonId ||
          String(s.sectionIndex).includes(normalizedId) ||
          s.sectionTitle === lessonId ||
          String(s.sectionTitle).includes(lessonId)
        );
      });
      if (section) {
        return (section as Record<string, unknown>).sectionTitle as string || null;
      }
    }
  }

  return null;
}
