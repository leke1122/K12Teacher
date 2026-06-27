// localStorage 封装工具 - 带版本管理
const STORAGE_PREFIX = 'edumind_';
const STORAGE_VERSION = '1.0.0';

interface StorageData<T> {
  version: string;
  data: T;
  updatedAt: string;
}

interface StorageMetadata {
  version: string;
  lastUpdated: string;
}

class VersionedStorage {
  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  // 保存数据（带版本）
  set<T>(key: string, value: T): void {
    try {
      const payload: StorageData<T> = {
        version: STORAGE_VERSION,
        data: value,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(payload));
    } catch (e) {
      console.warn(`[Storage] 保存失败 ${key}:`, e);
    }
  }

  // 读取数据（自动迁移旧版本）
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;

      // 尝试解析为带版本的数据
      try {
        const payload = JSON.parse(raw) as StorageData<T>;
        if (payload.version && payload.data) {
          return payload.data;
        }
      } catch {
        // 旧版本格式，直接返回原始数据
        return JSON.parse(raw);
      }
    } catch {
      return null;
    }
    return null;
  }

  // 获取带元数据的信息
  getWithMetadata<T>(key: string): { data: T | null; metadata: StorageMetadata | null } {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return { data: null, metadata: null };

      const payload = JSON.parse(raw) as StorageData<T>;
      return {
        data: payload.data,
        metadata: {
          version: payload.version || 'unknown',
          lastUpdated: payload.updatedAt || 'unknown',
        },
      };
    } catch {
      return { data: null, metadata: null };
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch {}
  }

  // 检查 key 是否存在
  exists(key: string): boolean {
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  // 获取所有 key
  keys(): string[] {
    return Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .map((k) => k.replace(STORAGE_PREFIX, ''));
  }

  // 清空所有数据
  clear(): void {
    const keys = this.keys();
    keys.forEach((k) => this.remove(k));
    console.log(`[Storage] 已清空 ${keys.length} 条数据`);
  }

  // 获取存储统计
  getStats(): { count: number; size: number; oldest: string | null; newest: string | null } {
    const keys = this.keys();
    let totalSize = 0;
    const timestamps: string[] = [];

    keys.forEach((k) => {
      const raw = localStorage.getItem(this.getKey(k)) || '';
      totalSize += raw.length;

      const meta = this.getWithMetadata(k);
      if (meta.metadata?.lastUpdated) {
        timestamps.push(meta.metadata.lastUpdated);
      }
    });

    return {
      count: keys.length,
      size: totalSize,
      oldest: timestamps.length ? timestamps.sort()[0] : null,
      newest: timestamps.length ? timestamps.sort()[timestamps.length - 1] : null,
    };
  }

  // 迁移旧数据到新版本
  migrate<T>(key: string, transformer: (oldData: unknown) => T): boolean {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return false;

      // 检查是否已经是新版本
      try {
        const payload = JSON.parse(raw);
        if (payload.version === STORAGE_VERSION) return false;
      } catch {}

      // 旧版本数据，进行迁移
      const oldData = JSON.parse(raw);
      const newData = transformer(oldData);
      this.set(key, newData);
      console.log(`[Storage] 已迁移 ${key} 到新版本`);
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new VersionedStorage();

// ==================== 便捷的数据类型 Key ====================

export const StorageKeys = {
  // PDF 相关
  PDF: (subjectId: string) => `pdf_${subjectId}`,
  CHAPTERS: (subjectId: string) => `chapters_${subjectId}`,
  
  // 学习相关
  PROGRESS: (subjectId: string) => `progress_${subjectId}`,
  PRACTICE: (subjectId: string) => `practice_${subjectId}`,
  WRONG_QUESTIONS: (subjectId: string) => `wrong_${subjectId}`,
  STUDY_STATS: (subjectId: string) => `stats_${subjectId}`,
  
  // 单词
  WORD_MASTERY: 'word_mastery',
  
  // 系统
  SYNC_STATUS: 'sync_status',
  SETTINGS: 'settings',
  LAST_SUBJECT: 'last_subject',
} as const;

// ==================== 旧 API 兼容 ====================

// 导出兼容方法，防止现有代码报错
export const legacyStorage = {
  get: <T>(key: string): T | null => storage.get<T>(key),
  set: <T>(key: string, value: T): void => storage.set(key, value),
  remove: (key: string): void => storage.remove(key),
  exists: (key: string): boolean => storage.exists(key),
};
