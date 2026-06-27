// 历史学科数据工具 - 服务端版本
// 提供章节配置和教材内容获取，使用 serverStorage

import { getActiveTextbook, getTextbookPDF, getTextbookChapters } from './textbookStorage.server';

// 历史章节配置
export const HISTORY_CHAPTERS = {
  'modern-china': { title: '近代中国', subtitle: '1840-1949' },
  'modern-world': { title: '世界近现代史', subtitle: '1500-1945' },
  'ancient-china': { title: '中国古代史', subtitle: '上古-1840' },
  'contemporary': { title: '当代世界', subtitle: '1945至今' },
  '古代': { title: '中国古代史', subtitle: '上古-1840' },
  '近代': { title: '中国近代史', subtitle: '1840-1949' },
  '现代': { title: '中国现代史', subtitle: '1949至今' },
  '世界史': { title: '世界历史', subtitle: '1500至今' },
} as const;

export type HistoryChapterId = keyof typeof HISTORY_CHAPTERS;

// 获取章节标题
export function getChapterTitle(chapterId: string): string {
  return HISTORY_CHAPTERS[chapterId as HistoryChapterId]?.title || chapterId;
}

// 获取教材文本内容
export function getChapterText(chapterId: string): string | null {
  const textbook = getActiveTextbook('history');
  if (!textbook) return null;

  const pdf = getTextbookPDF(textbook.id);
  if (!pdf?.fullText) return null;

  const chapters = getTextbookChapters(textbook.id);

  // 尝试匹配章节
  if (chapters) {
    const matched = chapters.find(
      (c) =>
        String(c.chapterIndex) === chapterId ||
        c.chapterTitle === chapterId ||
        c.chapterTitle.includes(chapterId)
    );

    if (matched && pdf.pages?.length) {
      const startPage = matched.pages?.start ?? 0;
      const endPage = matched.pages?.end ?? 9999;
      const chapterPages = pdf.pages.filter((p) => {
        const num = Number(p.pageNumber);
        return num >= startPage && num <= endPage;
      });

      if (chapterPages.length > 0) {
        return chapterPages.map((p) => p.content).join('\n\n');
      }
    }
  }

  // 如果没有匹配章节但有教材内容，返回前几段
  if (pdf.pages?.length) {
    const samplePages = pdf.pages.slice(0, 5);
    return samplePages.map((p) => p.content).join('\n\n');
  }

  return pdf.fullText || null;
}

// 获取教材文本（按页数范围）
export function getChapterTextByPages(
  chapterId: string,
  startPage?: number,
  endPage?: number
): string | null {
  const textbook = getActiveTextbook('history');
  if (!textbook) return null;

  const pdf = getTextbookPDF(textbook.id);
  if (!pdf?.pages?.length) return null;

  const chapters = getTextbookChapters(textbook.id);

  // 优先使用指定页数范围
  if (startPage !== undefined && endPage !== undefined) {
    const pages = pdf.pages.filter((p) => {
      const num = Number(p.pageNumber);
      return num >= startPage && num <= endPage;
    });
    return pages.map((p) => p.content).join('\n\n');
  }

  // 其次匹配章节（支持单元ID或课ID）
  if (chapters) {
    // 尝试匹配单元
    const matched = chapters.find(
      (c) =>
        String(c.chapterIndex) === chapterId ||
        c.chapterTitle === chapterId ||
        c.chapterTitle.includes(chapterId)
    );

    if (matched) {
      const startPage = matched.pages?.start ?? 0;
      const endPage = matched.pages?.end ?? 9999;
      const pages = pdf.pages.filter((p) => {
        const num = Number(p.pageNumber);
        return num >= startPage && num <= endPage;
      });
      return pages.map((p) => p.content).join('\n\n');
    }

    // 尝试匹配课（在sections中查找）
    for (const chapter of chapters) {
      if (chapter.sections) {
        const section = chapter.sections.find(
          (s) =>
            s.sectionIndex === chapterId ||
            s.sectionIndex.includes(chapterId) ||
            s.sectionTitle === chapterId ||
            s.sectionTitle.includes(chapterId)
        );

        if (section) {
          const startPage = section.pages?.start ?? 0;
          const endPage = section.pages?.end ?? 9999;
          const pages = pdf.pages.filter((p) => {
            const num = Number(p.pageNumber);
            return num >= startPage && num <= endPage;
          });
          return pages.map((p) => p.content).join('\n\n');
        }
      }
    }
  }

  // 返回全部文本（限制长度）
  const allText = pdf.pages.map((p) => p.content).join('\n\n');
  return allText.length > 5000 ? allText.slice(0, 5000) + '...' : allText;
}

// 获取单课内容（支持多种ID格式）
export function getLessonContent(lessonId: string): string | null {
  const textbook = getActiveTextbook('history');
  if (!textbook) return null;

  const pdf = getTextbookPDF(textbook.id);
  if (!pdf?.pages?.length) return null;

  const chapters = getTextbookChapters(textbook.id);
  if (!chapters) return null;

  // 标准化lessonId（去掉"第"和"课"字，提取数字）
  const normalizedId = lessonId.replace(/第/g, '').replace(/课/g, '').trim();

  // 在所有章节的sections中查找
  for (const chapter of chapters) {
    if (chapter.sections) {
      const section = chapter.sections.find((s) => {
        const sIndex = s.sectionIndex.replace(/第/g, '').replace(/课/g, '').trim();
        return sIndex === normalizedId ||
               s.sectionIndex === lessonId ||
               s.sectionIndex.includes(lessonId) ||
               s.sectionTitle.includes(lessonId) ||
               s.sectionTitle === lessonId;
      });

      if (section) {
        const startPage = section.pages?.start ?? 0;
        const endPage = section.pages?.end ?? 9999;
        const pages = pdf.pages.filter((p) => {
          const num = Number(p.pageNumber);
          return num >= startPage && num <= endPage;
        });
        return pages.map((p) => p.content).join('\n\n');
      }
    }
  }

  return null;
}

// 获取课标题
export function getLessonTitle(lessonId: string): string | null {
  const textbook = getActiveTextbook('history');
  if (!textbook) return null;

  const chapters = getTextbookChapters(textbook.id);
  if (!chapters) return null;

  const normalizedId = lessonId.replace(/第/g, '').replace(/课/g, '').trim();

  for (const chapter of chapters) {
    if (chapter.sections) {
      const section = chapter.sections.find((s) => {
        const sIndex = s.sectionIndex.replace(/第/g, '').replace(/课/g, '').trim();
        return sIndex === normalizedId ||
               s.sectionIndex === lessonId ||
               s.sectionIndex.includes(lessonId);
      });

      if (section) {
        return section.sectionIndex + ' ' + section.sectionTitle;
      }
    }
  }

  return null;
}
