// Supabase 客户端配置
// 用于 Vercel 部署环境

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 验证配置
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] 环境变量未配置，将使用本地存储');
}

// 创建客户端（配置不完整时返回 null）
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

// ==================== Supabase 表操作函数 ====================

const USER_ID = 'personal-user';

/**
 * 获取学习进度
 */
export async function getLearningProgress(subjectId: string, chapterId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('learning_progress')
    .select('*')
    .eq('user_id', USER_ID)
    .eq('subject_id', subjectId)
    .eq('chapter_id', chapterId)
    .single();
  if (error) return null;
  return data;
}

/**
 * 保存学习进度
 */
export async function saveLearningProgress(
  subjectId: string,
  chapterId: string,
  step: string,
  status: string,
  data?: Record<string, unknown>
) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('learning_progress')
    .upsert({
      user_id: USER_ID,
      subject_id: subjectId,
      chapter_id: chapterId,
      step,
      status,
      data,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,subject_id,chapter_id,step',
    });
  return !error;
}

/**
 * 获取学习记录
 */
export async function getLearningRecords(subjectId: string, limit = 10) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('learning_records')
    .select('*')
    .eq('user_id', USER_ID)
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return null;
  return data;
}

/**
 * 添加学习记录
 */
export async function addLearningRecord(
  subjectId: string,
  chapterId: string,
  mode: string,
  duration: number,
  progress?: Record<string, unknown>
) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('learning_records')
    .insert({
      user_id: USER_ID,
      subject_id: subjectId,
      chapter_id: chapterId,
      mode,
      duration,
      progress,
      date: new Date().toISOString().split('T')[0],
    });
  return !error;
}

/**
 * 获取单词掌握状态
 */
export async function getWordMastery() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('word_mastery')
    .select('*')
    .eq('user_id', USER_ID)
    .order('word_id');
  if (error) return null;
  return data;
}

/**
 * 更新单词掌握状态
 */
export async function updateWordMastery(wordId: string, wordText: string, level: number) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('word_mastery')
    .upsert({
      user_id: USER_ID,
      word_id: wordId,
      word_text: wordText,
      mastery_level: level,
      review_count: 1,
      next_review_date: new Date(Date.now() + level * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }, {
      onConflict: 'user_id,word_id',
    });
  return !error;
}

/**
 * 获取错题
 */
export async function getWrongQuestions(subjectId?: string) {
  if (!supabase) return null;
  let query = supabase
    .from('wrong_questions')
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false });
  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }
  const { data, error } = await query;
  if (error) return null;
  return data;
}

/**
 * 添加错题
 */
export async function addWrongQuestion(
  subjectId: string,
  question: string,
  correctAnswer: string,
  userAnswer: string,
  analysis?: string,
  difficulty?: string,
  knowledgePoint?: string
) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('wrong_questions')
    .insert({
      user_id: USER_ID,
      subject_id: subjectId,
      question,
      correct_answer: correctAnswer,
      user_answer: userAnswer,
      analysis,
      difficulty,
      knowledge_point: knowledgePoint,
    });
  return !error;
}

/**
 * 获取用户设置
 */
export async function getUserSettings() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('user_settings')
    .select('settings')
    .eq('user_id', USER_ID)
    .single();
  if (error) return null;
  return data?.settings || null;
}

/**
 * 保存用户设置
 */
export async function saveUserSettings(settings: Record<string, unknown>) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: USER_ID,
      settings,
    }, {
      onConflict: 'user_id',
    });
  return !error;
}
