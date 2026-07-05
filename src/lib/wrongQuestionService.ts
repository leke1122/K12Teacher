/**
 * 错词本服务 - Supabase 数据操作
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
  created_at: string;
}

// 获取错词列表（按学科筛选）
export async function getWrongQuestions(
  userId: string = 'personal-user',
  subjectId?: string
): Promise<WrongQuestion[]> {
  if (!supabase) return [];
  
  let query = supabase
    .from('wrong_questions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[WrongQuestionService] getWrongQuestions error:', error);
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
  userAnswer: string,
  analysis: string = '',
  difficulty: string = 'medium',
  knowledgePoint: string = ''
): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
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
    })
    .select('id')
    .single();

  if (error) {
    console.error('[WrongQuestionService] addWrongQuestion error:', error);
    return null;
  }

  return data?.id || null;
}

// 删除错词
export async function deleteWrongQuestion(
  id: string,
  userId: string = 'personal-user'
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
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
  if (!supabase) return false;

  let query = supabase
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
  if (!supabase) return 0;

  let query = supabase
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
