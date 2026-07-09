/**
 * 学习记录服务 - 前端调用封装
 */

const BASE_URL = '/api/learning';

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

/**
 * 开始学习记录
 */
export async function startLearning(params: StartLearningParams): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data.success ? data.recordId : null;
  } catch (err) {
    console.error('[LearningService] startLearning error:', err);
    return null;
  }
}

/**
 * 结束学习记录
 */
export async function endLearning(recordId: string, endTime?: string): Promise<number | null> {
  try {
    const res = await fetch(`${BASE_URL}/end`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, endTime }),
    });
    const data = await res.json();
    return data.success ? data.duration : null;
  } catch (err) {
    console.error('[LearningService] endLearning error:', err);
    return null;
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
  try {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.subject) searchParams.set('subject', params.subject);

    const res = await fetch(`${BASE_URL}/list?${searchParams.toString()}`);
    const data = await res.json();
    return {
      records: data.records || [],
      total: data.total || 0,
    };
  } catch (err) {
    console.error('[LearningService] getLearningRecords error:', err);
    return { records: [], total: 0 };
  }
}

/**
 * 获取学习统计数据
 */
export async function getLearningStats(period: 'today' | 'week' | 'month' | 'all' = 'week'): Promise<LearningStats> {
  try {
    const res = await fetch(`${BASE_URL}/stats?period=${period}`);
    const data = await res.json();
    return {
      totalMinutes: data.totalMinutes || 0,
      recordCount: data.recordCount || 0,
      subjects: data.subjects || {},
      dailyMinutes: data.dailyMinutes || [],
    };
  } catch (err) {
    console.error('[LearningService] getLearningStats error:', err);
    return { totalMinutes: 0, recordCount: 0, subjects: {}, dailyMinutes: [] };
  }
}

/**
 * 统一 hook：自动管理开始/结束记录
 * 返回 recordId ref 和 cleanup 函数
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
