// 浏览器端存储 - 仅在客户端组件中使用
// API 路由请改用 @/lib/serverStorage

const STORAGE_PREFIX = 'edumind_';

// ==================== 类型定义 ====================

export interface FallbackPDFData {
  subject_id: string;
  file_name: string;
  total_pages: number;
  full_text: string;
  pages?: { pageNumber: number; content: string }[];
  uploaded_at: string;
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

function getKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

export function localSave<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = { data, timestamp: Date.now() };
    localStorage.setItem(getKey(key), JSON.stringify(payload));
  } catch (error) {
    console.warn('[localFallback] 保存失败:', error);
  }
}

export function localLoad<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getKey(key));
    if (!raw) return null;
    const payload = JSON.parse(raw) as { data: T; timestamp: number };
    return payload.data;
  } catch {
    return null;
  }
}

export function localDelete(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getKey(key));
  } catch {}
}

export function localExists(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(getKey(key)) !== null;
  } catch {
    return false;
  }
}

export function localClear(): void {
  if (typeof window === 'undefined') return;
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}

export function localList(prefix: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(`${STORAGE_PREFIX}${prefix}`))
      .map((k) => k.replace(STORAGE_PREFIX, ''));
  } catch {
    return [];
  }
}

export function localGetStats(): { count: number; oldest: number | null; newest: number | null } {
  if (typeof window === 'undefined') return { count: 0, oldest: null, newest: null };
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(STORAGE_PREFIX));
    const timestamps = keys.map((k) => {
      try {
        const raw = localStorage.getItem(k);
        if (raw) return (JSON.parse(raw) as { timestamp: number }).timestamp;
      } catch {}
      return null;
    }).filter((t): t is number => t !== null);
    return {
      count: keys.length,
      oldest: timestamps.length ? Math.min(...timestamps) : null,
      newest: timestamps.length ? Math.max(...timestamps) : null,
    };
  } catch {
    return { count: 0, oldest: null, newest: null };
  }
}

// ==================== 向后兼容：导出类实例 ====================

class LocalFallback {
  async save<T>(key: string, data: T): Promise<void> {
    localSave(key, data);
  }

  async load<T>(key: string): Promise<T | null> {
    return localLoad<T>(key);
  }

  async delete(key: string): Promise<void> {
    localDelete(key);
  }

  async clear(): Promise<void> {
    localClear();
  }

  async exists(key: string): Promise<boolean> {
    return localExists(key);
  }

  getStats(): { count: number; oldest: number | null; newest: number | null } {
    return localGetStats();
  }
}

export const localFallback = new LocalFallback();

// ==================== 兼容函数 ====================

// 获取 PDF 数据的兼容函数
export async function fallbackGetPDF(subjectId: string): Promise<FallbackPDFData | null> {
  const key = `pdf_${subjectId}`;
  return localLoad<FallbackPDFData>(key);
}

// 保存 PDF 数据的兼容函数
export async function fallbackSavePDF(subjectId: string, data: FallbackPDFData): Promise<void> {
  const key = `pdf_${subjectId}`;
  localSave(key, data);
}

// 获取章节数据的兼容函数
export async function fallbackGetChapters(subjectId: string): Promise<FallbackChapterData[] | null> {
  const key = `chapters_${subjectId}`;
  return localLoad<FallbackChapterData[]>(key);
}

// 保存章节数据的兼容函数
export async function fallbackSaveChapters(subjectId: string, data: FallbackChapterData[]): Promise<void> {
  const key = `chapters_${subjectId}`;
  localSave(key, data);
}
