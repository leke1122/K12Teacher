/**
 * 章节练习服务
 * 独立服务，不影响已有功能
 */

export interface PracticeQuestion {
  id: string;
  text: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  knowledgePoint: string;
  difficulty: 'simple' | 'medium' | 'hard';
  type: 'choice' | 'fill' | 'calculation';
}

export interface PracticeRecord {
  id: string;
  subjectId: string;
  chapterId: string;
  sectionId: string;
  difficulty: 'simple' | 'medium' | 'hard';
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  answers: PracticeAnswer[];
  timestamp: string;
  date: string;
}

export interface PracticeAnswer {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
  knowledgePoint: string;
  difficulty: string;
}

export interface WrongQuestion {
  id: string;
  subjectId: string;
  chapterId: string;
  sectionId: string;
  question: string;
  options?: string[];
  userAnswer: string;
  correctAnswer: string;
  wrongReason: string;
  knowledgePoint: string;
  weakPoint: string;
  stepAnalysis: string;
  solutionSteps: string;
  difficulty: 'simple' | 'medium' | 'hard';
  createdAt: string;
  isMastered: boolean;
}

export interface WeakPoint {
  id: string;
  subjectId: string;
  weakPoint: string;
  description: string;
  wrongCount: number;
  lastOccurred: string;
  createdAt: string;
}

// ===== 本地存储键名 =====
const WRONG_QUESTIONS_KEY = 'practice_wrong_questions';
const WEAK_POINTS_KEY = 'practice_weak_points';
const PRACTICE_RECORDS_KEY = 'practice_records';

// ===== 错题管理 =====

export function getWrongQuestions(): WrongQuestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WRONG_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addWrongQuestion(q: WrongQuestion): void {
  if (typeof window === 'undefined') return;
  const list = getWrongQuestions();
  // 去重（相同题目不再重复添加）
  if (!list.some(w => w.question === q.question && w.subjectId === q.subjectId)) {
    list.unshift(q);
    localStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify(list));
  }
}

export function updateWrongQuestion(id: string, updates: Partial<WrongQuestion>): void {
  if (typeof window === 'undefined') return;
  const list = getWrongQuestions().map(w => w.id === id ? { ...w, ...updates } : w);
  localStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify(list));
}

export function deleteWrongQuestion(id: string): void {
  if (typeof window === 'undefined') return;
  const list = getWrongQuestions().filter(w => w.id !== id);
  localStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify(list));
}

export function markWrongQuestionMastered(id: string): void {
  updateWrongQuestion(id, { isMastered: true });
}

// ===== 薄弱项管理 =====

export function getWeakPoints(): WeakPoint[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WEAK_POINTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addOrUpdateWeakPoint(subjectId: string, weakPoint: string, description: string): void {
  if (typeof window === 'undefined') return;
  const list = getWeakPoints();
  const existing = list.find(w => w.subjectId === subjectId && w.weakPoint === weakPoint);
  if (existing) {
    existing.wrongCount += 1;
    existing.lastOccurred = new Date().toISOString();
    existing.description = description;
  } else {
    list.push({
      id: `wp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      subjectId,
      weakPoint,
      description,
      wrongCount: 1,
      lastOccurred: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }
  localStorage.setItem(WEAK_POINTS_KEY, JSON.stringify(list));
}

// ===== 练习记录 =====

export function getPracticeRecords(): PracticeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PRACTICE_RECORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addPracticeRecord(record: PracticeRecord): void {
  if (typeof window === 'undefined') return;
  const list = getPracticeRecords();
  list.unshift(record);
  localStorage.setItem(PRACTICE_RECORDS_KEY, JSON.stringify(list));
}

export function deletePracticeRecord(id: string): void {
  if (typeof window === 'undefined') return;
  const list = getPracticeRecords().filter(r => r.id !== id);
  localStorage.setItem(PRACTICE_RECORDS_KEY, JSON.stringify(list));
}

// ===== 错题按学科筛选 =====

export function getWrongQuestionsBySubject(subjectId: string): WrongQuestion[] {
  return getWrongQuestions().filter(w => w.subjectId === subjectId);
}

export function getUnmasteredWrongQuestions(subjectId?: string): WrongQuestion[] {
  const all = getWrongQuestions().filter(w => !w.isMastered);
  if (subjectId) return all.filter(w => w.subjectId === subjectId);
  return all;
}
