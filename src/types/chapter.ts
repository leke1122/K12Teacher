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
 */
export function convertTOCChapters(tocChapters: TOCChapter[]): Chapter[] {
  return tocChapters.map((unit, unitIndex) => ({
    chapterIndex: unitIndex + 1,
    chapterTitle: unit.title,
    pages: { type: 'printed' as const, start: unit.startPage, end: unit.endPage },
    sections: (unit.children || []).map((lesson, lessonIndex) => ({
      sectionIndex: `第${lessonIndex + 1}课`,
      sectionTitle: lesson.title,
      pages: { type: 'printed' as const, start: lesson.startPage, end: lesson.endPage },
    })),
  }));
}
