/**
 * 错词本服务 - Supabase 数据操作
 */

import { supabase as supabaseClient } from './supabase';

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

// 批量题目输入类型
export interface BatchQuestionInput {
  question_number: number;
  question: string;
  correct_answer: string;
  user_answer: string;
  knowledge_point: string;
  is_correct: boolean;
}

// 获取错词列表（按学科筛选）
export async function getWrongQuestions(
  userId: string = 'personal-user',
  subjectId?: string,
  id?: string
): Promise<WrongQuestion[]> {
  if (!supabaseClient) return [];
  
  let query = supabaseClient
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

  if (error) {
    console.error('[WrongQuestionService] getWrongQuestions error:', error);
    return [];
  }

  return data || [];
}

// 获取批次内的所有题目
export async function getBatchQuestions(
  batchId: string,
  userId: string = 'personal-user'
): Promise<WrongQuestion[]> {
  if (!supabaseClient) return [];

  const { data, error } = await supabaseClient
    .from('wrong_questions')
    .select('*')
    .eq('user_id', userId)
    .eq('batch_id', batchId)
    .order('question_number', { ascending: true });

  if (error) {
    console.error('[WrongQuestionService] getBatchQuestions error:', error);
    return [];
  }

  return data || [];
}

// 添加错词
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
  if (!supabaseClient) return null;

  const { data, error } = await supabaseClient
    .from('wrong_questions')
    .insert({
      user_id: userId,
      subject_id: subjectId,
      question,
      correct_answer: correctAnswer,
      user_answer: userAnswer,
      analysis,
      difficulty,
      knowledge_point: knowledgePoint,
      image_url: imageUrl,
      remediation_status: isMastered ? 'mastered' : 'pending',
      wrong_reason: wrongReason,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[WrongQuestionService] addWrongQuestion error:', error);
    return null;
  }

  return data?.id || null;
}

// 批量添加错题
export async function addBatchQuestions(
  userId: string,
  subjectId: string,
  batchId: string,
  questions: BatchQuestionInput[],
  imageUrl: string = ''
): Promise<boolean> {
  if (!supabaseClient) return false;

  const records = questions.map((q) => ({
    user_id: userId,
    subject_id: subjectId,
    batch_id: batchId,
    question_number: q.question_number,
    question: q.question,
    correct_answer: q.correct_answer,
    user_answer: q.user_answer,
    knowledge_point: q.knowledge_point,
    is_correct: q.is_correct,
    image_url: imageUrl,
    remediation_status: q.is_correct ? 'mastered' : 'pending',
    difficulty: 'medium',
    analysis: '',
  }));

  const { error } = await supabaseClient
    .from('wrong_questions')
    .insert(records);

  if (error) {
    console.error('[WrongQuestionService] addBatchQuestions error:', error);
    return false;
  }

  return true;
}

// 更新错题纠正状态
export async function updateRemediationStatus(
  id: string,
  status: 'pending' | 'tutoring' | 'mastered',
  userId: string = 'personal-user'
): Promise<boolean> {
  if (!supabaseClient) return false;

  const { error } = await supabaseClient
    .from('wrong_questions')
    .update({ remediation_status: status })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('[WrongQuestionService] updateRemediationStatus error:', error);
    return false;
  }

  return true;
}

// 删除错词
export async function deleteWrongQuestion(
  id: string,
  userId: string = 'personal-user'
): Promise<boolean> {
  if (!supabaseClient) return false;

  const { error } = await supabaseClient
    .from('wrong_questions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('[WrongQuestionService] deleteWrongQuestion error:', error);
    return false;
  }

  return true;
}

// 清空错词（按学科）
export async function clearWrongQuestions(
  userId: string = 'personal-user',
  subjectId?: string
): Promise<boolean> {
  if (!supabaseClient) return false;

  let query = supabaseClient
    .from('wrong_questions')
    .delete()
    .eq('user_id', userId);

  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }

  const { error } = await query;

  if (error) {
    console.error('[WrongQuestionService] clearWrongQuestions error:', error);
    return false;
  }

  return true;
}

// 获取错词数量
export async function getWrongQuestionCount(
  userId: string = 'personal-user',
  subjectId?: string
): Promise<number> {
  if (!supabaseClient) return 0;

  let query = supabaseClient
    .from('wrong_questions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }

  const { count, error } = await query;

  if (error) {
    console.error('[WrongQuestionService] getWrongQuestionCount error:', error);
    return 0;
  }

  return count || 0;
}

// 获取待纠正的错题
export async function getPendingRemediationQuestions(
  userId: string = 'personal-user'
): Promise<WrongQuestion[]> {
  if (!supabaseClient) return [];

  const { data, error } = await supabaseClient
    .from('wrong_questions')
    .select('*')
    .eq('user_id', userId)
    .neq('remediation_status', 'mastered')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[WrongQuestionService] getPendingRemediationQuestions error:', error);
    return [];
  }

  return data || [];
}

// 获取批次统计信息
export async function getBatchStats(
  batchId: string,
  userId: string = 'personal-user'
): Promise<{ total: number; correct: number; wrong: number; accuracy: number }> {
  const questions = await getBatchQuestions(batchId, userId);
  
  const total = questions.length;
  const correct = questions.filter(q => q.is_correct).length;
  const wrong = total - correct;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { total, correct, wrong, accuracy };
}
