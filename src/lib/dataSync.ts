/**
 * 统一数据同步层 - 本地存储
 */

import { localFallback, FallbackPDFData, FallbackChapterData } from './localFallback';

export interface PDFData {
  subject_id: string;
  file_name: string;
  total_pages: number;
  full_text: string;
  pages?: { pageNumber: number; content: string }[];
  uploaded_at?: string;
}

export type DataSource = 'cloud' | 'local';
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult<T = void> {
  success: boolean;
  source: DataSource;
  cloudSynced: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface SyncLog {
  timestamp: number;
  action: string;
  source: DataSource;
  status: SyncStatus;
  message: string;
}

class SyncState {
  private _isOnline: boolean = true;
  private _isSyncing: boolean = false;
  private _lastSource: DataSource = 'local';
  private _syncLogs: SyncLog[] = [];
  private _listeners: Set<(logs: SyncLog[]) => void> = new Set();
  private _statusListeners: Set<(status: { online: boolean; syncing: boolean }) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnline(true));
      window.addEventListener('offline', () => this.setOnline(false));
      this._isOnline = navigator.onLine;
    }
  }

  setOnline(value: boolean) {
    this._isOnline = value;
    this.notifyStatusListeners();
    if (value) {
      this.addLog('system', 'local', 'success', '网络已恢复');
    } else {
      this.addLog('system', 'local', 'error', '网络已断开');
    }
  }

  setSyncing(value: boolean) {
    this._isSyncing = value;
    this.notifyStatusListeners();
  }

  setLastSource(source: DataSource) {
    this._lastSource = source;
  }

  getLastSource(): DataSource {
    return this._lastSource;
  }

  isOnline(): boolean {
    return this._isOnline;
  }

  isSyncing(): boolean {
    return this._isSyncing;
  }

  getLogs(): SyncLog[] {
    return [...this._syncLogs];
  }

  addLog(action: string, source: DataSource, status: SyncStatus, message: string) {
    this._syncLogs.unshift({
      timestamp: Date.now(),
      action,
      source,
      status,
      message,
    });
    if (this._syncLogs.length > 50) {
      this._syncLogs = this._syncLogs.slice(0, 50);
    }
    this._notifyListeners();
  }

  subscribe(listener: (logs: SyncLog[]) => void) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  subscribeStatus(listener: (status: { online: boolean; syncing: boolean }) => void) {
    this._statusListeners.add(listener);
    return () => this._statusListeners.delete(listener);
  }

  private _notifyListeners() {
    const logs = this.getLogs();
    this._listeners.forEach((l) => l(logs));
  }

  private notifyStatusListeners() {
    this._statusListeners.forEach((l) =>
      l({ online: this._isOnline, syncing: this._isSyncing })
    );
  }

  clearLogs() {
    this._syncLogs = [];
    this._notifyListeners();
  }
}

export const syncState = new SyncState();

export async function savePDF(data: PDFData): Promise<SyncResult> {
  try {
    await localFallback.save(`pdf_${data.subject_id}`, {
      ...data,
      uploaded_at: data.uploaded_at || new Date().toISOString(),
    });
    syncState.setLastSource('local');
    syncState.addLog('savePDF', 'local', 'success', `PDF已保存到本地: ${data.file_name}`);
    return {
      success: true,
      source: 'local',
      cloudSynced: false,
      message: '已保存到本地',
    };
  } catch (error) {
    return {
      success: false,
      source: 'local',
      cloudSynced: false,
      message: '本地保存失败',
      error: String(error),
    };
  }
}

export async function getPDF(subjectId: string): Promise<SyncResult<FallbackPDFData>> {
  const localData = await localFallback.load<FallbackPDFData>(`pdf_${subjectId}`);
  if (localData) {
    syncState.setLastSource('local');
    syncState.addLog('getPDF', 'local', 'success', '从本地读取PDF数据');
    return {
      success: true,
      source: 'local',
      cloudSynced: false,
      data: localData,
      message: '数据来自本地',
    };
  }

  return {
    success: false,
    source: 'local',
    cloudSynced: false,
    message: '未找到数据',
  };
}

export async function deletePDF(subjectId: string): Promise<SyncResult> {
  await localFallback.delete(`pdf_${subjectId}`);
  syncState.addLog('deletePDF', 'local', 'success', '本地PDF已删除');

  return {
    success: true,
    source: 'local',
    cloudSynced: false,
    message: 'PDF已删除',
  };
}

export async function saveChapters(
  subjectId: string,
  chapters: FallbackChapterData[]
): Promise<SyncResult> {
  try {
    await localFallback.save(`chapters_${subjectId}`, chapters);
    syncState.setLastSource('local');
    syncState.addLog('saveChapters', 'local', 'success', `已保存${chapters.length}个章节到本地`);
    return {
      success: true,
      source: 'local',
      cloudSynced: false,
      message: '已保存到本地',
    };
  } catch (error) {
    return {
      success: false,
      source: 'local',
      cloudSynced: false,
      message: '保存失败',
      error: String(error),
    };
  }
}

export async function getChapters(
  subjectId: string
): Promise<SyncResult<FallbackChapterData[]>> {
  const localData = await localFallback.load<FallbackChapterData[]>(`chapters_${subjectId}`);
  if (localData) {
    syncState.setLastSource('local');
    return {
      success: true,
      source: 'local',
      cloudSynced: false,
      data: localData,
      message: '数据来自本地',
    };
  }

  return {
    success: false,
    source: 'local',
    cloudSynced: false,
    message: '未找到章节数据',
  };
}

export async function saveProgress(
  subjectId: string,
  progress: unknown
): Promise<SyncResult> {
  try {
    await localFallback.save(`progress_${subjectId}`, progress);
    syncState.setLastSource('local');
    return {
      success: true,
      source: 'local',
      cloudSynced: false,
      message: '进度已保存',
    };
  } catch (error) {
    return {
      success: false,
      source: 'local',
      cloudSynced: false,
      message: '保存失败',
      error: String(error),
    };
  }
}

export async function getProgress(subjectId: string): Promise<SyncResult<unknown>> {
  const localData = await localFallback.load<unknown>(`progress_${subjectId}`);

  return {
    success: true,
    source: 'local',
    cloudSynced: false,
    data: localData,
    message: localData ? '数据来自本地' : '无进度数据',
  };
}

export interface WrongQuestion {
  id?: string;
  subjectId: string;
  question: string;
  correctAnswer?: string;
  userAnswer?: string;
  analysis?: string;
  difficulty?: '简单' | '中等' | '困难';
  mastered?: boolean;
  createdAt?: string;
}

export async function saveWrongQuestion(data: WrongQuestion): Promise<SyncResult> {
  const questions = await localFallback.load<WrongQuestion[]>('wrong_questions') || [];
  const newQuestion = {
    ...data,
    id: data.id || `wq_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  questions.push(newQuestion);
  await localFallback.save('wrong_questions', questions);

  return {
    success: true,
    source: 'local',
    cloudSynced: false,
    message: '错题已保存到本地',
  };
}

export async function getWrongQuestions(subjectId?: string): Promise<SyncResult<WrongQuestion[]>> {
  const all = await localFallback.load<WrongQuestion[]>('wrong_questions') || [];
  const filtered = subjectId ? all.filter((q) => q.subjectId === subjectId) : all;

  return {
    success: true,
    source: 'local',
    cloudSynced: false,
    data: filtered,
    message: `找到${filtered.length}条错题`,
  };
}

export async function clearWrongQuestions(subjectId?: string): Promise<SyncResult> {
  if (subjectId) {
    const all = await localFallback.load<WrongQuestion[]>('wrong_questions') || [];
    const filtered = all.filter((q) => q.subjectId !== subjectId);
    await localFallback.save('wrong_questions', filtered);
  } else {
    await localFallback.delete('wrong_questions');
  }

  return {
    success: true,
    source: 'local',
    cloudSynced: false,
    message: '错题已清空',
  };
}

export interface StudyStats {
  subjectId: string;
  date: string;
  minutes: number;
}

export async function saveStudyDuration(subjectId: string, minutes: number): Promise<SyncResult> {
  const stats = await localFallback.load<StudyStats[]>('study_stats') || [];
  const today = new Date().toISOString().split('T')[0];
  const existing = stats.find((s) => s.subjectId === subjectId && s.date === today);

  if (existing) {
    existing.minutes += minutes;
  } else {
    stats.push({ subjectId, date: today, minutes });
  }

  await localFallback.save('study_stats', stats);

  return {
    success: true,
    source: 'local',
    cloudSynced: false,
    message: `学习时长+${minutes}分钟`,
  };
}

export async function getStudyStats(days = 7): Promise<SyncResult<StudyStats[]>> {
  const all = await localFallback.load<StudyStats[]>('study_stats') || [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const filtered = all.filter((s) => new Date(s.date) >= cutoff);

  return {
    success: true,
    source: 'local',
    cloudSynced: false,
    data: filtered,
    message: `获取${filtered.length}天学习统计`,
  };
}

export interface WordMastery {
  word: string;
  level: number;
  lastPracticed?: string;
}

export async function saveWordMastery(word: string, level: number): Promise<SyncResult> {
  const mastery = await localFallback.load<WordMastery[]>('word_mastery') || [];
  const existing = mastery.find((m) => m.word === word);

  if (existing) {
    existing.level = level;
    existing.lastPracticed = new Date().toISOString();
  } else {
    mastery.push({ word, level, lastPracticed: new Date().toISOString() });
  }

  await localFallback.save('word_mastery', mastery);

  return {
    success: true,
    source: 'local',
    cloudSynced: false,
    message: `单词"${word}"掌握度已更新`,
  };
}

export async function getWordMastery(): Promise<SyncResult<WordMastery[]>> {
  const data = await localFallback.load<WordMastery[]>('word_mastery') || [];

  return {
    success: true,
    source: 'local',
    cloudSynced: false,
    data,
    message: `获取${data.length}个单词掌握状态`,
  };
}

export async function syncAllToCloud(): Promise<SyncResult> {
  return {
    success: false,
    source: 'local',
    cloudSynced: false,
    message: '云端不可用',
  };
}

export async function clearAllData(): Promise<SyncResult> {
  await localFallback.clear();
  syncState.clearLogs();
  syncState.addLog('clearAll', 'local', 'success', '本地数据已清空');

  return {
    success: true,
    source: 'local',
    cloudSynced: false,
    message: '本地数据已清空',
  };
}

export function getStatusMessage(result: SyncResult): string {
  if (result.cloudSynced) {
    return '✅ ' + result.message;
  } else if (result.success) {
    return '💾 ' + result.message;
  } else {
    return '❌ ' + result.message;
  }
}
