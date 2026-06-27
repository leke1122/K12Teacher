// 教材数据存储层 - 服务端版本
// 仅在 API 路由等服务端代码中使用，使用 fs 文件系统
// 绝对不能在客户端组件中导入此文件

import { getServerData, setServerData, deleteServerData } from './serverStorage';
import { Chapter, Textbook, TextbookPDF } from '@/types/chapter';

export type { Textbook, TextbookPDF };

// ==================== 教材元数据 ====================

export function getTextbooks(subjectId: string): Textbook[] {
  return getServerData<Textbook[]>(`textbooks_${subjectId}`) || [];
}

export function saveTextbooks(subjectId: string, textbooks: Textbook[]): void {
  setServerData(`textbooks_${subjectId}`, textbooks);
}

export function addTextbook(subjectId: string, textbook: Textbook): void {
  const textbooks = getTextbooks(subjectId);
  if (textbooks.length === 0) {
    textbook.isActive = true;
  }
  textbooks.push(textbook);
  saveTextbooks(subjectId, textbooks);
}

export function saveTextbook(subjectId: string, textbook: Textbook): void {
  const textbooks = getTextbooks(subjectId);
  if (textbooks.length === 0) {
    textbook.isActive = true;
  }
  textbooks.push(textbook);
  saveTextbooks(subjectId, textbooks);
}

export function setActiveTextbook(subjectId: string, textbookId: string): void {
  const textbooks = getTextbooks(subjectId);
  textbooks.forEach((t) => {
    t.isActive = t.id === textbookId;
  });
  saveTextbooks(subjectId, textbooks);
}

export function removeTextbook(subjectId: string, textbookId: string): void {
  const textbooks = getTextbooks(subjectId);
  const filtered = textbooks.filter((t) => t.id !== textbookId);
  const removed = textbooks.find((t) => t.id === textbookId);
  if (removed?.isActive && filtered.length > 0) {
    filtered[0].isActive = true;
  }
  saveTextbooks(subjectId, filtered);
  deleteServerData(`pdf_${textbookId}`);
  deleteServerData(`chapters_${textbookId}`);
}

export function getActiveTextbook(subjectId: string): Textbook | null {
  const textbooks = getTextbooks(subjectId);
  return textbooks.find((t) => t.isActive) || textbooks[0] || null;
}

// ==================== 教材 PDF 数据 ====================

export function getTextbookPDF(textbookId: string): TextbookPDF | null {
  return getServerData<TextbookPDF>(`pdf_${textbookId}`);
}

export function saveTextbookPDF(pdf: TextbookPDF): void {
  setServerData(`pdf_${pdf.textbookId}`, pdf);
}

// ==================== 教材章节数据 ====================

export function getTextbookChapters(textbookId: string): Chapter[] | null {
  const raw = getServerData<unknown>(`chapters_${textbookId}`);
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as unknown as Chapter[];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.chapters)) return obj.chapters as unknown as Chapter[];
  return null;
}

export function saveTextbookChapters(textbookId: string, chapters: Chapter[]): void {
  setServerData(`chapters_${textbookId}`, chapters);
}

// ==================== 迁移旧数据 ====================

export function migrateLegacyData(subjectId: string): boolean {
  const oldPdf = getServerData<{ subject_id: string; file_name: string; total_pages: number; full_text: string }>(`pdf_${subjectId}`);
  if (oldPdf && oldPdf.subject_id === subjectId) {
    const existing = getTextbooks(subjectId);
    if (existing.length === 0) {
      const textbook: Textbook = {
        id: `${subjectId}_default`,
        name: '教材',
        grade: '高一',
        fileName: oldPdf.file_name,
        totalPages: oldPdf.total_pages,
        uploadedAt: new Date().toISOString(),
        isActive: true,
        chaptersCount: 0,
      };
      addTextbook(subjectId, textbook);
      const pdfData: TextbookPDF = {
        textbookId: textbook.id,
        subjectId,
        fileName: oldPdf.file_name,
        totalPages: oldPdf.total_pages,
        fullText: oldPdf.full_text,
        uploadedAt: new Date().toISOString(),
      };
      setServerData(`pdf_${textbook.id}`, pdfData);
      console.log(`[TextbookStorage] 已迁移学科 ${subjectId} 的旧数据到新格式`);
      return true;
    }
  }
  return false;
}

// ==================== 清理所有教材 ====================

export function clearAllTextbooks(subjectId: string): void {
  const textbooks = getTextbooks(subjectId);
  for (const t of textbooks) {
    deleteServerData(`pdf_${t.id}`);
    deleteServerData(`chapters_${t.id}`);
  }
  deleteServerData(`textbooks_${subjectId}`);
}
