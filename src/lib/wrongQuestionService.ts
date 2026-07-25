/**
 * 错词本服务 - Supabase + 本地存储双保险
 * 优先使用 Supabase，如果未配置则使用本地存储
 */

import { supabase } from './supabase';

export interface WrongQuestion {
  id: string;
  user_id: string;
  subject_id: string;
  question: string;
  correct_answer: string;
  user_answer: string;
  analysis: string;
  difficulty: string;
  knowledge_point: string;
  image_url?: string;
  remediation_status?: 'pending' | 'tutoring' | 'mastered';
  batch_id?: string;
  question_number?: number;
  is_correct?: boolean;
  wrong_reason?: string;
  created_at: string;
}

// 本地存储键名
const LOCAL_STORAGE_KEY = 'gaozhong_wrong_questions';

// 本地存储操作
function getLocalQuestions(): WrongQuestion[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function setLocalQuestions(questions: WrongQuestion[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(questions));
}

function addLocalQuestion(question: Omit<WrongQuestion, 'id' | 'created_at'>): string {
  const questions = getLocalQuestions();
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newQuestion: WrongQuestion = {
    ...question,
    id,
    created_at: new Date().toISOString(),
  };
  questions.unshift(newQuestion);
  setLocalQuestions(questions);
  return id;
}

// 获取错词列表（按学科筛选）
export async function getWrongQuestions(
  userId: string = 'personal-user',
  subjectId?: string,
  id?: string
): Promise<WrongQuestion[]> {
  // 优先使用 Supabase
  if (supabase) {
    let query = supabase
      .from('wrong_questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    if (id) {
      query = query.eq('id', id);
    }

    const { data, error } = await query;

    if (!error && data) {
      return data;
    }
    console.error('[WrongQuestionService] Supabase error, falling back to local:', error);
  }

  // 降级到本地存储
  console.log('[WrongQuestionService] Using local storage for wrong questions');
  let questions = getLocalQuestions();
  
  if (subjectId) {
    questions = questions.filter(q => q.subject_id === subjectId);
  }
  
  if (id) {
    questions = questions.filter(q => q.id === id);
  }
  
  return questions;
}

// 添加错词（支持 Supabase + 本地双写）
export async function addWrongQuestion(
  userId: string,
  subjectId: string,
  question: string,
  correctAnswer: string,
  userAnswer: string = '',
  analysis: string = '',
  difficulty: string = 'medium',
  knowledgePoint: string = '',
  imageUrl: string = '',
  isMastered: boolean = false,
  wrongReason: string = ''
): Promise<string | null> {
  const record = {
    user_id: userId,
    subject_id: subjectId,
    question,
    correct_answer: correctAnswer,
    user_answer: userAnswer,
    analysis,
    difficulty,
    knowledge_point: knowledgePoint,
    wrong_reason: wrongReason,
    is_mastered: isMastered,
  };

  // 优先写入 Supabase
  if (supabase) {
    const { data, error } = await supabase
      .from('wrong_questions')
      .insert(record)
      .select('id')
      .single();

    if (!error && data?.id) {
      console.log('[WrongQuestionService] Added to Supabase:', data.id);
      return data.id;
    }
    console.error('[WrongQuestionService] Supabase add failed:', error);
  }

  // 降级到本地存储
  console.log('[WrongQuestionService] Saving to local storage');
  const localId = addLocalQuestion(record);
  return localId;
}

// 批量添加错题
export async function addBatchQuestions(
  userId: string,
  subjectId: string,
  batchId: string,
  questions: Array<{
    question_number: number;
    question: string;
    correct_answer: string;
    user_answer: string;
    knowledge_point: string;
    is_correct: boolean;
  }>,
  imageUrl: string = ''
): Promise<boolean> {
  const records = questions.map((q): Omit<WrongQuestion, 'id' | 'created_at'> => ({
    user_id: userId,
    subject_id: subjectId,
    batch_id: batchId,
    question_number: q.question_number,
    question: q.question,
    correct_answer: q.correct_answer,
    user_answer: q.user_answer,
    knowledge_point: q.knowledge_point,
    is_correct: q.is_correct,
    remediation_status: q.is_correct ? 'mastered' : 'pending',
    difficulty: 'medium',
    analysis: '',
  }));

  // 优先使用 Supabase
  if (supabase) {
    const { error } = await supabase
      .from('wrong_questions')
      .insert(records);

    if (!error) {
      return true;
    }
    console.error('[WrongQuestionService] Supabase batch add failed:', error);
  }

  // 降级到本地存储
  const localQuestions = getLocalQuestions();
  const newQuestions: WrongQuestion[] = records.map((r, i) => ({
    ...r,
    id: `local_${Date.now()}_${i}`,
    created_at: new Date().toISOString(),
  }));
  setLocalQuestions([...newQuestions, ...localQuestions]);
  return true;
}

// 更新错题纠正状态
export async function updateRemediationStatus(
  id: string,
  status: 'pending' | 'tutoring' | 'mastered',
  userId: string = 'personal-user'
): Promise<boolean> {
  // 优先使用 Supabase
  if (supabase) {
    const { error } = await supabase
      .from('wrong_questions')
      .update({ remediation_status: status })
      .eq('id', id)
      .eq('user_id', userId);

    if (!error) {
      return true;
    }
    console.error('[WrongQuestionService] Supabase update failed:', error);
  }

  // 降级到本地存储
  const questions = getLocalQuestions();
  const updated = questions.map(q => 
    q.id === id ? { ...q, remediation_status: status } : q
  );
  setLocalQuestions(updated);
  return true;
}

// 删除错词
export async function deleteWrongQuestion(
  id: string,
  userId: string = 'personal-user'
): Promise<boolean> {
  // 优先使用 Supabase
  if (supabase) {
    const { error } = await supabase
      .from('wrong_questions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (!error) {
      return true;
    }
    console.error('[WrongQuestionService] Supabase delete failed:', error);
  }

  // 降级到本地存储
  const questions = getLocalQuestions();
  setLocalQuestions(questions.filter(q => q.id !== id));
  return true;
}

// 清空错词（按学科）
export async function clearWrongQuestions(
  userId: string = 'personal-user',
  subjectId?: string
): Promise<boolean> {
  // 优先使用 Supabase
  if (supabase) {
    let query = supabase
      .from('wrong_questions')
      .delete()
      .eq('user_id', userId);

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { error } = await query;

    if (!error) {
      return true;
    }
    console.error('[WrongQuestionService] Supabase clear failed:', error);
  }

  // 降级到本地存储
  if (subjectId) {
    const questions = getLocalQuestions();
    setLocalQuestions(questions.filter(q => q.subject_id !== subjectId));
  } else {
    setLocalQuestions([]);
  }
  return true;
}

// 获取错词数量
export async function getWrongQuestionCount(
  userId: string = 'personal-user',
  subjectId?: string
): Promise<number> {
  const questions = await getWrongQuestions(userId, subjectId);
  return questions.length;
}

// 获取待纠正的错题
export async function getPendingRemediationQuestions(
  userId: string = 'personal-user'
): Promise<WrongQuestion[]> {
  const questions = await getWrongQuestions(userId);
  return questions.filter(q => q.remediation_status !== 'mastered');
}
