/**
 * 学习记录服务 - 前端调用封装
 * 支持 Supabase + localStorage 双存储
 */

const BASE_URL = '/api/learning';
const LOCAL_RECORDS_KEY = 'edumind_learning_records';
const LOCAL_SESSIONS_KEY = 'edumind_learning_sessions';

export interface StartLearningParams {
  subjectId: string;
  subjectName: string;
  activityType: 'words' | 'knowledge' | 'textbook' | 'practice' | 'geogebra' | 'other';
  chapterId?: string | null;
  sectionId?: string | null;
  activityDetail?: Record<string, unknown>;
}

export interface LearningRecord {
  id: string;
  user_id: string;
  subject_id: string;
  subject_name: string;
  activity_type: string;
  chapter_id: string | null;
  section_id: string | null;
  activity_detail: Record<string, unknown>;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface LearningStats {
  totalMinutes: number;
  recordCount: number;
  subjects: Record<string, number>;
  dailyMinutes: { date: string; minutes: number }[];
}

// ===== localStorage helpers =====

function getLocalSessions(): LearningRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalSession(record: LearningRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const sessions = getLocalSessions();
    const idx = sessions.findIndex(s => s.id === record.id);
    if (idx >= 0) {
      sessions[idx] = record;
    } else {
      sessions.unshift(record);
    }
    localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 500)));
  } catch {}
}

function loadLocalStats(period: 'today' | 'week' | 'month' | 'all'): LearningStats {
  const sessions = getLocalSessions();
  const now = Date.now();
  const msMap: Record<string, number> = {
    today: 0,
    week: 7 * 86400000,
    month: 30 * 86400000,
    all: 0,
  };
  const cutoff = now - (msMap[period] || 0);

  const filtered = sessions.filter(s => new Date(s.start_time).getTime() >= cutoff);

  const subjects: Record<string, number> = {};
  const dailyMap: Record<string, number> = {};
  let totalSeconds = 0;

  for (const r of filtered) {
    const name = r.subject_name || r.subject_id || '其他';
    const secs = r.duration_seconds || 0;
    subjects[name] = (subjects[name] || 0) + secs;
    totalSeconds += secs;
    const date = r.start_time?.split('T')[0] || 'unknown';
    dailyMap[date] = (dailyMap[date] || 0) + secs;
  }

  return {
    totalMinutes: Math.round(totalSeconds / 60),
    recordCount: filtered.length,
    subjects,
    dailyMinutes: Object.entries(dailyMap)
      .map(([date, seconds]) => ({ date, minutes: Math.round(seconds / 60) }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

// ===== API methods =====

/**
 * 开始学习记录
 */
export async function startLearning(params: StartLearningParams): Promise<string | null> {
  const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const session: LearningRecord = {
    id: localId,
    user_id: 'personal-user',
    subject_id: params.subjectId,
    subject_name: params.subjectName,
    activity_type: params.activityType,
    chapter_id: params.chapterId || null,
    section_id: params.sectionId || null,
    activity_detail: params.activityDetail || {},
    start_time: new Date().toISOString(),
    end_time: null,
    duration_seconds: null,
    created_at: new Date().toISOString(),
  };

  // 先写入 localStorage，保证不丢失
  saveLocalSession(session);

  try {
    const res = await fetch(`${BASE_URL}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (data.success && data.recordId) {
      // Supabase 成功，更新本地记录的 id
      const sessions = getLocalSessions().map(s =>
        s.id === localId ? { ...s, id: data.recordId } : s
      );
      localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
      return data.recordId;
    }
    return localId;
  } catch (err) {
    console.error('[LearningService] startLearning error, using localId:', localId, err);
    return localId;
  }
}

/**
 * 结束学习记录
 */
export async function endLearning(recordId: string, endTime?: string): Promise<number | null> {
  const end_time = endTime ? new Date(endTime) : new Date();

  // 先更新 localStorage
  try {
    const sessions = getLocalSessions();
    const idx = sessions.findIndex(s => s.id === recordId);
    if (idx >= 0) {
      const startTime = new Date(sessions[idx].start_time);
      const durationSeconds = Math.round((end_time.getTime() - startTime.getTime()) / 1000);
      sessions[idx] = { ...sessions[idx], end_time: end_time.toISOString(), duration_seconds: durationSeconds };
      localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
    }
  } catch {}

  try {
    const res = await fetch(`${BASE_URL}/end`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, endTime }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.duration;
  } catch (err) {
    console.error('[LearningService] endLearning error, updated local only:', err);
    // 从 localStorage 获取时长
    const sessions = getLocalSessions();
    const s = sessions.find(s => s.id === recordId);
    return s?.duration_seconds || null;
  }
}

/**
 * 获取学习记录列表
 */
export async function getLearningRecords(params?: {
  startDate?: string;
  endDate?: string;
  subject?: string;
}): Promise<{ records: LearningRecord[]; total: number }> {
  // 先拿 Supabase 数据
  let supabaseRecords: LearningRecord[] = [];
  try {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.subject) searchParams.set('subject', params.subject);

    const res = await fetch(`${BASE_URL}/list?${searchParams.toString()}`);
    const data = await res.json();
    supabaseRecords = data.records || [];
  } catch (err) {
    console.warn('[LearningService] Supabase load failed, using localStorage:', err);
  }

  // 合并 localStorage 数据（防止 Supabase 写入失败但 localStorage 有记录的情况）
  const localRecords = getLocalSessions().filter(s => {
    if (params?.startDate && s.start_time < `${params.startDate}T00:00:00`) return false;
    if (params?.endDate && s.start_time > `${params.endDate}T23:59:59`) return false;
    if (params?.subject && params.subject !== 'all' && s.subject_id !== params.subject) return false;
    return true;
  });

  const merged = new Map<string, LearningRecord>();
  for (const r of supabaseRecords) merged.set(r.id, r);
  for (const r of localRecords) { if (!merged.has(r.id)) merged.set(r.id, r); }

  const records = Array.from(merged.values()).sort(
    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );

  return { records, total: records.length };
}

/**
 * 获取学习统计数据
 */
export async function getLearningStats(period: 'today' | 'week' | 'month' | 'all' = 'week'): Promise<LearningStats> {
  // 先拿 Supabase 数据
  let apiStats: LearningStats | null = null;
  try {
    const res = await fetch(`${BASE_URL}/stats?period=${period}`);
    const data = await res.json();
    apiStats = {
      totalMinutes: data.totalMinutes || 0,
      recordCount: data.recordCount || 0,
      subjects: data.subjects || {},
      dailyMinutes: data.dailyMinutes || [],
    };
  } catch (err) {
    console.warn('[LearningService] Supabase stats failed, using localStorage:', err);
  }

  // 拿 localStorage 数据
  const localStats = loadLocalStats(period);

  // 合并：Supabase 为主，localStorage 补充
  const subjects: Record<string, number> = {};
  for (const [k, v] of Object.entries(apiStats?.subjects || {})) subjects[k] = v;
  for (const [k, v] of Object.entries(localStats.subjects)) {
    subjects[k] = (subjects[k] || 0) + v;
  }

  const dailyMap: Record<string, number> = {};
  for (const d of (apiStats?.dailyMinutes || [])) dailyMap[d.date] = d.minutes;
  for (const d of localStats.dailyMinutes) {
    dailyMap[d.date] = (dailyMap[d.date] || 0) + d.minutes;
  }

  return {
    totalMinutes: (apiStats?.totalMinutes || 0) + localStats.totalMinutes,
    recordCount: (apiStats?.recordCount || 0) + localStats.recordCount,
    subjects,
    dailyMinutes: Object.entries(dailyMap)
      .map(([date, minutes]) => ({ date, minutes }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

/**
 * 统一 hook：自动管理开始/结束记录
 */
export function createLearningTracker() {
  const recordIdRef = { current: null as string | null };

  const start = async (params: StartLearningParams) => {
    recordIdRef.current = await startLearning(params);
  };

  const stop = async () => {
    if (recordIdRef.current) {
      await endLearning(recordIdRef.current);
      recordIdRef.current = null;
    }
  };

  return { recordIdRef, start, stop };
}
