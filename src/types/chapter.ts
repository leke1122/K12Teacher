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
