export interface PageRange {
  type: 'printed' | 'file';
  start: number;
  end: number;
  fileStart?: number;
  fileEnd?: number;
}

export interface SubSection {
  title: string;
  pages: PageRange;
}

export interface Section {
  sectionIndex: string;
  sectionTitle: string;
  pages: PageRange;
  subSections?: SubSection[];
}

export interface Chapter {
  chapterIndex: number;
  chapterTitle: string;
  pages: PageRange;
  sections?: Section[];
}

// ==================== 教材相关类型 ====================

export interface Textbook {
  id: string;
  name: string;
  grade: string;
  fileName: string;
  totalPages: number;
  uploadedAt: string;
  isActive: boolean;
  chaptersCount: number;
}

export interface TextbookPDF {
  textbookId: string;
  subjectId: string;
  fileName: string;
  totalPages: number;
  fullText: string;
  pages?: { pageNumber: number; content: string }[];
  uploadedAt: string;
}

// ==================== TXT目录解析的章节类型 ====================

export interface TOCChapter {
  id: string;
  title: string;
  startPage: number;
  endPage: number;
  type: 'unit' | 'lesson' | 'appendix';
  children?: TOCChapter[];
}

/**
 * 将 TXT 目录格式的章节转换为页面期望的格式
 * lesson.title 格式如 "3.1.1 函数及其表示方法"，提取前半部分作为 sectionIndex
 */
export function convertTOCChapters(tocChapters: TOCChapter[]): Chapter[] {
  return tocChapters.map((unit, unitIndex) => {
    // 从单元标题提取章号，如 "第一章 集合与常用逻辑用语" → 1
    const chapterNumMatch = unit.title.match(/第([一二三四五六七八九十百千万\d]+)[章节]/);
    const chapterNum = chapterNumMatch ? chapterNumMatch[1] : String(unitIndex + 1);
    
    // 将中文数字转换为阿拉伯数字
    const chineseToNumber = (cn: string): string => {
      const cnMap: Record<string, string> = {
        '一': '1', '二': '2', '三': '3', '四': '4', '五': '5',
        '六': '6', '七': '7', '八': '8', '九': '9', '十': '10',
      };
      // 处理十一、十二等
      if (cn === '十') return '10';
      if (cn.endsWith('十')) {
        const tens = cnMap[cn[0]] || cn[0];
        const ones = cnMap[cn[1]] || cn[1] || '';
        return tens + ones;
      }
      return cnMap[cn] || cn;
    };
    
    const normalizedChapterNum = /^\d+$/.test(chapterNum) ? chapterNum : chineseToNumber(chapterNum);
    
    return {
      chapterIndex: unitIndex + 1,
      chapterTitle: unit.title.replace(/^第[一二三四五六七八九十百千万\d]+[章节]\s*/, '').replace(/第[一二三四五六七八九十百千万\d]+单元\s*/, ''),
      pages: { type: 'printed' as const, start: unit.startPage, end: unit.endPage },
      sections: (unit.children || []).map((lesson) => {
        // 从 lesson.title 提取编号，如 "3.1.1 函数及其表示方法" → "3.1.1"
        const sectionMatch = lesson.title.match(/^([\d.]+)\s+/);
        const sectionIndex = sectionMatch ? sectionMatch[1] : lesson.title.split(' ')[0];
        
        // 提取标题部分，去掉编号
        const sectionTitle = lesson.title.replace(/^[\d.]+\s*/, '').trim();
        
        return {
          sectionIndex,
          sectionTitle,
          pages: { type: 'printed' as const, start: lesson.startPage, end: lesson.endPage },
        };
      }),
    };
  });
}
