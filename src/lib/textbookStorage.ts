// 教材数据存储层 - 客户端版本
// 仅在客户端组件中使用，使用 localStorage
// 服务端/API 路由请改用 textbookStorage.server.ts 或直接用 serverStorage

import { localLoad, localSave, localDelete } from './localFallback';
import { Textbook, TextbookPDF, Chapter } from '@/types/chapter';

export type { Textbook, TextbookPDF };

// ==================== 教材元数据 ====================

export function getTextbooks(subjectId: string): Textbook[] {
  return localLoad<Textbook[]>(`textbooks_${subjectId}`) || [];
}

export function saveTextbooks(subjectId: string, textbooks: Textbook[]): void {
  localSave(`textbooks_${subjectId}`, textbooks);
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
  localDelete(`pdf_${textbookId}`);
  localDelete(`chapters_${textbookId}`);
}

export function getActiveTextbook(subjectId: string): Textbook | null {
  const textbooks = getTextbooks(subjectId);
  return textbooks.find((t) => t.isActive) || textbooks[0] || null;
}

// ==================== 教材 PDF 数据 ====================

export function getTextbookPDF(textbookId: string): TextbookPDF | null {
  return localLoad<TextbookPDF>(`pdf_${textbookId}`);
}

export function saveTextbookPDF(pdf: TextbookPDF): void {
  localSave(`pdf_${pdf.textbookId}`, pdf);
}

// ==================== 教材章节数据 ====================

export function getTextbookChapters(textbookId: string): Chapter[] | null {
  const raw = localLoad<unknown>(`chapters_${textbookId}`);
  if (!raw) return null;
  if (Array.isArray(raw)) return raw as unknown as Chapter[];
  const obj = raw as Record<string, unknown>;
  if (Array.isArray(obj.chapters)) return obj.chapters as unknown as Chapter[];
  return null;
}

export function saveTextbookChapters(textbookId: string, chapters: Chapter[]): void {
  localSave(`chapters_${textbookId}`, chapters);
}

// ==================== 迁移旧数据 ====================

export function migrateLegacyData(subjectId: string): boolean {
  return false;
}

// ==================== 清理所有教材 ====================

export function clearAllTextbooks(subjectId: string): void {
  const textbooks = getTextbooks(subjectId);
  for (const t of textbooks) {
    localDelete(`pdf_${t.id}`);
    localDelete(`chapters_${t.id}`);
  }
  localDelete(`textbooks_${subjectId}`);
}
