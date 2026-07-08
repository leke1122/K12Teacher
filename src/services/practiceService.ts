/**
 * 章节练习服务
 * 独立服务，不影响已有功能
 * 支持 localStorage 和 Supabase 双存储
 */

import { supabase } from '@/lib/supabase';

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
const USER_ID = 'personal-user';

// ===== Supabase 错题表操作 =====

async function syncWrongQuestionsToSupabase(wq: WrongQuestion): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('wrong_questions').upsert({
      id: wq.id,
      user_id: USER_ID,
      subject_id: wq.subjectId,
      chapter_id: wq.chapterId,
      section_id: wq.sectionId,
      question: wq.question,
      options: wq.options || [],
      user_answer: wq.userAnswer,
      correct_answer: wq.correctAnswer,
      wrong_reason: wq.wrongReason,
      knowledge_point: wq.knowledgePoint,
      weak_point: wq.weakPoint,
      step_analysis: wq.stepAnalysis,
      solution_steps: wq.solutionSteps,
      difficulty: wq.difficulty,
      is_mastered: wq.isMastered,
      created_at: wq.createdAt,
    }, { onConflict: 'id' });
  } catch (err) {
    console.error('[PracticeService] Sync wrong question to Supabase failed:', err);
  }
}

async function deleteWrongQuestionFromSupabase(id: string): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('wrong_questions').delete().eq('id', id);
  } catch (err) {
    console.error('[PracticeService] Delete wrong question from Supabase failed:', err);
  }
}

async function loadWrongQuestionsFromSupabase(): Promise<WrongQuestion[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('wrong_questions')
      .select('*')
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false });
    
    if (error || !data) return [];
    
    return data.map(row => ({
      id: row.id,
      subjectId: row.subject_id,
      chapterId: row.chapter_id,
      sectionId: row.section_id,
      question: row.question,
      options: row.options || [],
      userAnswer: row.user_answer,
      correctAnswer: row.correct_answer,
      wrongReason: row.wrong_reason,
      knowledgePoint: row.knowledge_point,
      weakPoint: row.weak_point,
      stepAnalysis: row.step_analysis,
      solutionSteps: row.solution_steps,
      difficulty: row.difficulty,
      createdAt: row.created_at,
      isMastered: row.is_mastered,
    }));
  } catch (err) {
    console.error('[PracticeService] Load wrong questions from Supabase failed:', err);
    return [];
  }
}

// ===== 错题管理 =====

// 直接从 Supabase 读取，保证跨浏览器一致性
export async function getWrongQuestions(): Promise<WrongQuestion[]> {
  if (typeof window === 'undefined') return [];
  
  // 始终从 Supabase 获取最新数据
  const supabaseData = await loadWrongQuestionsFromSupabase();
  return supabaseData.length > 0 ? supabaseData : getWrongQuestionsFromLocal();
}

function getWrongQuestionsFromLocal(): WrongQuestion[] {
  try {
    const raw = localStorage.getItem(WRONG_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// 同步方法（保持向后兼容）
export function getWrongQuestionsSync(): WrongQuestion[] {
  if (typeof window === 'undefined') return [];
  return getWrongQuestionsFromLocal();
}

export async function addWrongQuestion(q: WrongQuestion): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // 直接写入 Supabase，跨浏览器同步
  await syncWrongQuestionsToSupabase(q);
}

// 同步版本（向后兼容）
export function addWrongQuestionSync(q: WrongQuestion): void {
  if (typeof window === 'undefined') return;
  syncWrongQuestionsToSupabase(q);
}

export async function updateWrongQuestion(id: string, updates: Partial<WrongQuestion>): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // 直接更新 Supabase
  if (supabase) {
    const updateData: Record<string, any> = {};
    if (updates.isMastered !== undefined) updateData.is_mastered = updates.isMastered;
    if (updates.wrongReason !== undefined) updateData.wrong_reason = updates.wrongReason;
    if (updates.stepAnalysis !== undefined) updateData.step_analysis = updates.stepAnalysis;
    if (updates.solutionSteps !== undefined) updateData.solution_steps = updates.solutionSteps;
    
    if (Object.keys(updateData).length > 0) {
      await supabase.from('wrong_questions').update(updateData).eq('id', id);
    }
  }
}

export async function deleteWrongQuestion(id: string): Promise<void> {
  if (typeof window === 'undefined') return;
  await deleteWrongQuestionFromSupabase(id);
}

// 同步版本（向后兼容）
export function deleteWrongQuestionSync(id: string): void {
  if (typeof window === 'undefined') return;
  deleteWrongQuestionFromSupabase(id);
}

export async function markWrongQuestionMastered(id: string): Promise<void> {
  await updateWrongQuestion(id, { isMastered: true });
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

export async function getWrongQuestionsBySubject(subjectId: string): Promise<WrongQuestion[]> {
  const list = await getWrongQuestions();
  return list.filter(w => w.subjectId === subjectId);
}

export async function getUnmasteredWrongQuestions(subjectId?: string): Promise<WrongQuestion[]> {
  const all = (await getWrongQuestions()).filter(w => !w.isMastered);
  if (subjectId) return all.filter(w => w.subjectId === subjectId);
  return all;
}
