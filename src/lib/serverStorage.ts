// 服务端存储 - 仅在 API 路由等服务端代码中使用
// 此文件绝对不能在客户端组件中导入

import fs from 'fs';
import path from 'path';
import { Chapter, Section, SubSection, PageRange } from '@/types/chapter';

const STORAGE_PREFIX = 'edumind_';
let serverDataDir: string | null = null;

function getServerDataDir(): string {
  if (!serverDataDir) {
    serverDataDir = path.join(process.cwd(), '.data', 'server');
    if (!fs.existsSync(serverDataDir)) {
      fs.mkdirSync(serverDataDir, { recursive: true });
    }
  }
  return serverDataDir;
}

function getFilePath(key: string): string {
  const dir = getServerDataDir();
  return path.join(dir, `${STORAGE_PREFIX}${key}.json`);
}

export function getServerData<T>(key: string): T | null {
  try {
    const filePath = getFilePath(key);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch {
    return null;
  }
}

export function setServerData<T>(key: string, data: T): void {
  try {
    const filePath = getFilePath(key);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[serverStorage] 写入失败:', error);
  }
}

export function deleteServerData(key: string): void {
  try {
    const filePath = getFilePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('[serverStorage] 删除失败:', error);
  }
}

export function listServerKeys(prefix: string): string[] {
  try {
    const dir = getServerDataDir();
    const files = fs.readdirSync(dir);
    return files
      .filter((f) => f.startsWith(`${STORAGE_PREFIX}${prefix}`) && f.endsWith('.json'))
      .map((f) => f.replace(STORAGE_PREFIX, '').replace('.json', ''));
  } catch {
    return [];
  }
}

export function existsServerData(key: string): boolean {
  try {
    return fs.existsSync(getFilePath(key));
  } catch {
    return false;
  }
}

export function getServerStats(): { count: number; oldest: number | null; newest: number | null } {
  try {
    const dir = getServerDataDir();
    const files = fs.readdirSync(dir).filter((f) => f.startsWith(STORAGE_PREFIX) && f.endsWith('.json'));
    const timestamps = files.map((f) => {
      try {
        const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
        return (JSON.parse(raw) as { timestamp?: number }).timestamp ?? null;
      } catch { return null; }
    }).filter((t): t is number => t !== null);
    return {
      count: files.length,
      oldest: timestamps.length ? Math.min(...timestamps) : null,
      newest: timestamps.length ? Math.max(...timestamps) : null,
    };
  } catch {
    return { count: 0, oldest: null, newest: null };
  }
}

export function clearServerData(): void {
  try {
    const dir = getServerDataDir();
    const files = fs.readdirSync(dir).filter((f) => f.startsWith(STORAGE_PREFIX) && f.endsWith('.json'));
    files.forEach((f) => fs.unlinkSync(path.join(dir, f)));
  } catch {}
}

// ==================== 服务端降级辅助函数 ====================

export interface FallbackPDFData {
  subject_id: string;
  file_name: string;
  total_pages: number;
  full_text: string;
  pages?: { pageNumber: number; content: string }[];
  uploaded_at: string;
}

export function fallbackSavePDF(data: FallbackPDFData): void {
  setServerData(`pdf_${data.subject_id}`, data);
}

export function fallbackGetPDF(subjectId: string): FallbackPDFData | null {
  return getServerData<FallbackPDFData>(`pdf_${subjectId}`);
}

export function fallbackDeletePDF(subjectId: string): void {
  deleteServerData(`pdf_${subjectId}`);
}

export interface FallbackChapterData {
  chapterIndex: number;
  chapterTitle: string;
  startPage: number;
  endPage: number;
  sections?: {
    sectionIndex: string;
    sectionTitle: string;
    startPage: number;
    endPage: number;
  }[];
}

function normalizePageRange(input: unknown): PageRange {
  if (!input) return { type: 'file', start: 1, end: 999 };
  const raw = input as Record<string, unknown>;
  if (raw.type && (raw.type === 'printed' || raw.type === 'file')) {
    return {
      type: raw.type as 'printed' | 'file',
      start: Number(raw.start ?? raw.startPage ?? 1),
      end: Number(raw.end ?? raw.endPage ?? 999),
      ...(Number.isFinite(raw.fileStart as number) ? { fileStart: Number(raw.fileStart) } : {}),
      ...(Number.isFinite(raw.fileEnd as number) ? { fileEnd: Number(raw.fileEnd) } : {}),
    };
  }
  return {
    type: 'file',
    start: Number((raw as Record<string, unknown>).startPage ?? raw.start ?? 1),
    end: Number((raw as Record<string, unknown>).endPage ?? raw.end ?? 999),
  };
}

function normalizeChapter(input: unknown): Chapter {
  const raw = input as Record<string, unknown>;
  const pages = normalizePageRange(raw.pages);
  const sections = Array.isArray(raw.sections)
    ? (raw.sections as Record<string, unknown>[]).map((s) => {
        const pagesObj = normalizePageRange(s.pages);
        const subSections = Array.isArray(s.subSections)
          ? (s.subSections as Record<string, unknown>[]).map((sub) => {
              const subPages = normalizePageRange(sub.pages);
              return {
                title: String(sub.title || (sub as Record<string, unknown>).sectionTitle || '').trim(),
                pages: subPages,
              } as SubSection;
            }).filter((sub: SubSection) => sub.title)
          : [];
        return {
          sectionIndex: String(s.sectionIndex || s.sectionTitle || '').trim(),
          sectionTitle: String(s.sectionTitle || s.sectionIndex || '').trim(),
          pages: pagesObj,
          ...(subSections.length ? { subSections } : {}),
        } as Section;
      }).filter((s: Section) => s.sectionIndex || s.sectionTitle)
    : [];
  return {
    chapterIndex: Number(raw.chapterIndex) || 0,
    chapterTitle: String(raw.chapterTitle || raw.title || '').trim(),
    pages,
    ...(sections.length ? { sections } : {}),
  };
}

export function normalizeChapters(input: unknown): Chapter[] {
  const raw = input as Record<string, unknown>;
  const chapters = Array.isArray(raw.chapters)
    ? raw.chapters
    : Array.isArray(input)
    ? (input as unknown[])
    : [];
  return chapters.map(normalizeChapter);
}

export function fallbackSaveChapters(subjectId: string, chapters: FallbackChapterData[]): void {
  setServerData(`chapters_${subjectId}`, chapters);
}

export function fallbackGetChapters(subjectId: string): FallbackChapterData[] | null {
  return getServerData<FallbackChapterData[]>(`chapters_${subjectId}`);
}

export function fallbackSaveProgress(subjectId: string, progress: unknown): void {
  setServerData(`progress_${subjectId}`, progress);
}

export function fallbackGetProgress(subjectId: string): unknown | null {
  return getServerData(`progress_${subjectId}`);
}

// ==================== 统一存储接口 ====================

export type DataSource = 'supabase' | 'local';

export interface StorageResult<T> {
  success: boolean;
  data: T | null;
  source: DataSource;
  error?: string;
}

export class SmartStorage {
  private useLocal = false;
  private localOnly = false;

  setLocalOnly(value: boolean): void {
    this.localOnly = value;
    this.useLocal = value;
    console.log(`[SmartStorage] 本地模式: ${value}`);
  }

  setSupabaseAvailable(available: boolean): void {
    if (this.localOnly) return;
    this.useLocal = !available;
    console.log(`[SmartStorage] 数据源切换: ${this.useLocal ? '本地' : 'Supabase'}`);
  }

  isUsingLocal(): boolean {
    return this.useLocal;
  }

  getCurrentSource(): DataSource {
    return this.useLocal ? 'local' : 'supabase';
  }

  getStats(): { count: number; oldest: number | null; newest: number | null } {
    return getServerStats();
  }

  diagnose(): void {
    console.group('[SmartStorage] 诊断报告');
    console.log('模式:', this.localOnly ? '仅本地' : (this.useLocal ? '本地（云端不可用）' : '云端'));
    console.log('存储统计:', this.getStats());
    console.groupEnd();
  }
}

export const smartStorage = new SmartStorage();
