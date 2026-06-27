/**
 * 学习记录服务
 * - 当前实现基于 localStorage，保证可离线运行
 * - 接口设计对齐 Supabase 常见返回值，后续接入云端只需替换底层
 */

export interface LearningRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  textbookId?: string;  // 关联的教材ID
  textbookName?: string; // 关联的教材名称
  chapterId: string;
  sectionId: string;
  sectionTitle: string;
  mode: 'KNOWLEDGE' | 'TEXTBOOK';
  duration: number;
  progress: {
    currentIndex: number;
    total: number;
    completed: number;
    knowledgePoints?: KnowledgePoint[];
    masteredList: string[];
    wrongList: string[];
    answers: AnswerRecord[];
    completedParagraphs?: number[];
    currentParagraphIndex?: number;
    totalParagraphs?: number;
    summary?: string;
    history?: Array<{ knowledge: string; correct: boolean; attempts: number }>;
    totalAttempts?: number;
    correctAttempts?: number;
    correctRate?: number;
  };
  timestamp: string;
  date: string;
}

export interface KnowledgePoint {
  id: string;
  name: string;
  type: string;
  description?: string;
  content?: string;
}

export interface AnswerRecord {
  knowledgeName: string;
  correct: boolean;
  attempts: number;
  isWeak: boolean;
  timestamp: string;
}

export interface SubjectStats {
  subjectId: string;
  totalDuration: number;
  totalKnowledge: number;
  totalCorrect: number;
  totalWrong: number;
  weakPoints: WeakPoint[];
  masteredPoints: string[];
  dailyData: Array<{
    date: string;
    duration: number;
    knowledge: number;
  }>;
}

export interface WeakPoint {
  knowledge: string;
  errorCount: number;
  chapterId: string;
  sectionId: string;
  sectionTitle: string;
  lastWrong: string;
}

const STORAGE_KEY = 'edumind_learning_records';

function loadAll(): LearningRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(records: LearningRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export async function saveLearningRecord(record: LearningRecord) {
  const records = loadAll();
  const existIndex = records.findIndex(r => r.id === record.id);
  if (existIndex >= 0) {
    records[existIndex] = record;
  } else {
    records.unshift(record);
  }
  saveAll(records);
  return { success: true, data: record };
}

export async function getLearningRecord(id: string): Promise<LearningRecord | null> {
  const records = loadAll();
  return records.find(r => r.id === id) || null;
}

export async function getAllLearningRecords(): Promise<LearningRecord[]> {
  return loadAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function deleteLearningRecord(id: string) {
  const records = loadAll().filter(r => r.id !== id);
  saveAll(records);
  return { success: true };
}

export async function updateWeakPoints(
  subjectId: string,
  wrongList: string[],
  extra?: { chapterId?: string; sectionId?: string; sectionTitle?: string }
) {
  const records = loadAll();
  const now = new Date().toISOString();
  const dateStr = new Date().toLocaleString('zh-CN');

  records.forEach(r => {
    if (r.subjectId !== subjectId) return;
    const sectionKey = `${r.chapterId}-${r.sectionId}`;
    const extraKey = extra ? `${extra.chapterId}-${extra.sectionId}` : null;
    if (extraKey && sectionKey !== extraKey) return;
    r.progress.wrongList = Array.from(new Set([...r.progress.wrongList, ...wrongList]));
    r.timestamp = now;
    r.date = dateStr;
  });

  saveAll(records);
  return { success: true };
}

export async function computeSubjectStats(): Promise<SubjectStats[]> {
  const records = await getAllLearningRecords();

  const grouped: Record<string, LearningRecord[]> = {};
  records.forEach(r => {
    grouped[r.subjectId] = grouped[r.subjectId] || [];
    grouped[r.subjectId].push(r);
  });

  return Object.entries(grouped).map(([subjectId, items]) => {
    const weakMap = new Map<string, WeakPoint & { count: number }>();
    const mastered = new Set<string>();
    let correct = 0;
    let wrong = 0;
    const dailyMap = new Map<string, { duration: number; knowledge: number }>();

    items.forEach(r => {
      (r.progress.masteredList || []).forEach(name => mastered.add(name));
      (r.progress.answers || []).forEach(a => {
        if (a.correct) correct += 1; else wrong += 1;
      });

      (r.progress.wrongList || []).forEach(name => {
        const key = `${r.chapterId}-${r.sectionId}-${name}`;
        const prev = weakMap.get(key);
        if (prev) {
          prev.count += 1;
          prev.errorCount = prev.count;
        } else {
          weakMap.set(key, {
            knowledge: name,
            errorCount: 1,
            chapterId: r.chapterId,
            sectionId: r.sectionId,
            sectionTitle: r.sectionTitle,
            lastWrong: r.date,
            count: 1,
          });
        }
      });

      const dateKey = new Date(r.timestamp).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
      const day = dailyMap.get(dateKey) || { duration: 0, knowledge: 0 };
      day.duration += r.duration || 0;
      day.knowledge += r.progress.completed || 0;
      dailyMap.set(dateKey, day);
    });

    const weakPoints = Array.from(weakMap.values())
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 20)
      .map(({ count, ...rest }) => rest);

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, value]) => ({ date, ...value }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    return {
      subjectId,
      totalDuration: items.reduce((sum, r) => sum + (r.duration || 0), 0),
      totalKnowledge: mastered.size,
      totalCorrect: correct,
      totalWrong: wrong,
      weakPoints,
      masteredPoints: Array.from(mastered),
      dailyData,
    };
  });
}
