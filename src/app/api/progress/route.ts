import { NextRequest, NextResponse } from 'next/server';

// In-memory store for dev mode (persists across API calls in same process)
// Key: `${subjectId}_${chapterId}_${sectionId}_${timestamp}`
const progressStore: Record<string, object> = {};

function getMockProgressData() {
  return [
    {
      id: 'mock-1',
      subject_id: 'math',
      chapter_id: '1.1.1',
      section_id: '1.1',
      mode: 'KNOWLEDGE',
      progress: {
        total: 19,
        completed: 5,
        currentIndex: 2,
        currentKnowledge: '集合的互异性',
        completedList: ['集合的定义', '元素', '集合的确定性', '集合的互异性', '空集'],
        wrongList: ['集合概念'],
        history: [
          { knowledge: '集合的定义', correct: true, attempts: 1 },
          { knowledge: '元素', correct: true, attempts: 1 },
          { knowledge: '集合的确定性', correct: false, attempts: 2 },
          { knowledge: '集合的确定性', correct: true, attempts: 1 },
          { knowledge: '集合的互异性', correct: true, attempts: 1 }
        ],
        startTime: '2024-01-15T06:30:00Z',
        duration: 2100,
        summary: '本次学习了集合的定义、元素、确定性等5个概念'
      },
      created_at: '2024-01-15T07:05:00Z'
    },
    {
      id: 'mock-2',
      subject_id: 'math',
      chapter_id: '1.1.2',
      section_id: '1.1',
      mode: 'KNOWLEDGE',
      progress: {
        total: 12,
        completed: 12,
        currentIndex: 11,
        currentKnowledge: '子集',
        completedList: ['子集的定义', '真子集', '空集是任何集合的子集', '集合相等'],
        wrongList: [],
        history: [
          { knowledge: '子集的定义', correct: true, attempts: 1 },
          { knowledge: '真子集', correct: true, attempts: 1 },
          { knowledge: '空集是任何集合的子集', correct: true, attempts: 1 },
          { knowledge: '集合相等', correct: true, attempts: 1 }
        ],
        startTime: '2024-01-14T14:00:00Z',
        duration: 1800,
        summary: '完成了子集章节的全部知识点'
      },
      created_at: '2024-01-14T14:30:00Z'
    }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Collect saved records from in-memory store
    const storeRecords = Object.values(progressStore).filter((r) => {
      const record = r as { subject_id?: string };
      return !subjectId || record.subject_id === subjectId;
    }) as LearningRecord[];

    // Also collect from localStorage for records saved client-side
    let localRecords: LearningRecord[] = [];
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('edumind_learning_records');
        if (raw) {
          const parsed = JSON.parse(raw) as LearningRecord[];
          localRecords = subjectId ? parsed.filter(r => r.subject_id === subjectId) : parsed;
        }
      } catch (_) { /* ignore */ }
    }

    // Merge: API store first, then localStorage, dedupe by id
    const allRecords = [...storeRecords, ...localRecords];
    const seen = new Set<string>();
    const deduped = allRecords.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    // Sort by created_at descending
    deduped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const data = deduped.slice(0, limit);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取学习进度失败:', error);
    return NextResponse.json({ error: '获取学习进度失败' }, { status: 500 });
  }
}

interface LearningRecord {
  id: string;
  subject_id: string;
  chapter_id: string;
  section_id: string;
  mode: string;
  progress: {
    total: number;
    completed: number;
    currentIndex: number;
    currentKnowledge: string;
    completedList: string[];
    wrongList: string[];
    history: Array<{ knowledge: string; correct: boolean; attempts: number }>;
    startTime: string;
    duration: number;
    summary: string;
  };
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const progressData = await request.json();

    const id = 'dev-' + Date.now();
    const record = {
      id,
      subject_id: progressData.subjectId || progressData.chapterId?.split('.')[0] || '',
      chapter_id: progressData.chapterId || '',
      section_id: progressData.sectionId || '',
      mode: progressData.mode || 'KNOWLEDGE',
      progress: {
        total: progressData.progress?.total || progressData.knowledgePoints?.length || 0,
        completed: progressData.progress?.completed || (Object.values(progressData.pointStates || {}) as Array<{ correct: boolean }>).filter(s => s.correct).length,
        currentIndex: progressData.progress?.currentIndex || progressData.currentPointIndex || 0,
        currentKnowledge: progressData.progress?.currentKnowledge || progressData.currentPointName || '',
        completedList: progressData.progress?.completedList || Object.entries(progressData.pointStates || {}).filter(([, s]) => (s as { correct: boolean }).correct).map(([name]) => name),
        wrongList: progressData.progress?.wrongList || Object.entries(progressData.pointStates || {}).filter(([, s]) => (s as { isWeak: boolean }).isWeak).map(([name]) => name),
        history: progressData.progress?.history || buildHistoryFromPointStates(progressData.pointStates, progressData.knowledgePoints),
        startTime: progressData.progress?.startTime || progressData.startTime || new Date(Date.now() - (progressData.progress?.duration || 0) * 1000).toISOString(),
        duration: progressData.progress?.duration || progressData.duration || 0,
        summary: progressData.progress?.summary || buildSummary(progressData.pointStates, progressData.knowledgePoints)
      },
      created_at: new Date().toISOString()
    };

    const storeKey = `${record.subject_id}_${record.chapter_id}_${record.section_id}_${Date.now()}`;
    progressStore[storeKey] = record;

    // Also try to persist to localStorage key pattern used by history page fallback
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('edumind_learning_records') || '[]');
        existing.unshift(record);
        localStorage.setItem('edumind_learning_records', JSON.stringify(existing.slice(0, 100)));
      } catch (_) { /* localStorage may not be available server-side */ }
    }

    console.log('[Progress API] Saved record:', record.id, record.chapter_id, record.section_id);
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('保存学习进度失败:', error);
    return NextResponse.json({ error: '保存学习进度失败' }, { status: 500 });
  }
}

function buildHistoryFromPointStates(pointStates: Record<string, PointState> = {}, knowledgePoints: string[] = []) {
  const history: Array<{ knowledge: string; correct: boolean; attempts: number }> = [];
  if (!pointStates) return history;
  for (const name of knowledgePoints) {
    const state = pointStates[name];
    if (state && (state.answered || state.attemptCount > 0)) {
      history.push({ knowledge: name, correct: state.correct, attempts: state.attemptCount });
    }
  }
  return history;
}

function buildSummary(pointStates: Record<string, PointState> = {}, knowledgePoints: string[] = []) {
  const total = Object.values(pointStates || {}).filter((s: PointState) => s.answered).length;
  const completed = Object.values(pointStates || {}).filter((s: PointState) => s.correct).length;
  const weak = Object.values(pointStates || {}).filter((s: PointState) => s.isWeak).length;
  if (total === 0) return '开始学习';
  return `共${knowledgePoints?.length || 0}个知识点，完成${completed}个，薄弱项${weak}个`;
}

interface PointState {
  answered: boolean;
  correct: boolean;
  attemptCount: number;
  isWeak: boolean;
  explanation?: unknown;
}
