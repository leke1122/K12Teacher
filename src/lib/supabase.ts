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

// ==================== 教材数据 (textbook_cache) ====================

export interface TextbookCacheItem {
  id?: string;
  subject_id: string;
  textbook_id: string;
  textbook_name: string;
  file_name?: string;
  file_size?: number;
  total_pages?: number;
  chapters?: unknown[];
  full_text?: string;
  pages?: { pageNumber: number; content: string }[];
  uploaded_at?: string;
}

/**
 * 获取教材列表
 */
export async function getTextbooks(subjectId?: string) {
  if (!supabase) return null;
  let query = supabase
    .from('textbook_cache')
    .select('*')
    .eq('user_id', USER_ID)
    .order('uploaded_at', { ascending: false });

  if (subjectId) {
    query = query.eq('subject_id', subjectId);
  }

  const { data, error } = await query;
  if (error) return null;
  return data;
}

/**
 * 获取单个教材详情
 */
export async function getTextbook(textbookId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('textbook_cache')
    .select('*')
    .eq('user_id', USER_ID)
    .eq('textbook_id', textbookId)
    .single();
  if (error) return null;
  return data;
}

/**
 * 按学科获取最新教材（用于前端没有传 textbookId 的情况）
 */
export async function getTextbookBySubject(subjectId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('textbook_cache')
    .select('*')
    .eq('user_id', USER_ID)
    .eq('subject_id', subjectId)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

/**
 * 保存教材数据到Supabase
 */
export async function saveTextbookCache(data: TextbookCacheItem) {
  console.log('[Supabase] saveTextbookCache 开始:', {
    user_id: USER_ID,
    subject_id: data.subject_id,
    textbook_name: data.textbook_name,
    chapters_count: data.chapters?.length || 0
  });

  if (!supabase) {
    console.error('[Supabase] supabase 未初始化');
    return { success: false, error: 'Supabase未配置' };
  }

  const { error } = await supabase
    .from('textbook_cache')
    .upsert({
      user_id: USER_ID,
      subject_id: data.subject_id,
      textbook_id: data.textbook_id,
      textbook_name: data.textbook_name,
      file_name: data.file_name,
      file_size: data.file_size,
      total_pages: data.total_pages,
      chapters: data.chapters || [],
      full_text: data.full_text || '',
      pages: data.pages || [],
      uploaded_at: data.uploaded_at || new Date().toISOString(),
    }, {
      onConflict: 'user_id,textbook_id',
    });

  if (error) {
    console.error('[Supabase] saveTextbookCache error:', error);
    return { success: false, error: error.message };
  }

  console.log('[Supabase] saveTextbookCache 成功');
  return { success: true };
}

/**
 * 删除教材
 */
export async function deleteTextbookCache(textbookId: string) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('textbook_cache')
    .delete()
    .eq('user_id', USER_ID)
    .eq('textbook_id', textbookId);
  return !error;
}

/**
 * 清空所有教材数据
 */
export async function clearAllTextbookCache() {
  if (!supabase) return false;
  const { error } = await supabase
    .from('textbook_cache')
    .delete()
    .eq('user_id', USER_ID);
  return !error;
}

// ==================== 教材章节 (textbook_chapters) ====================

export interface TextbookChapter {
  id: string;
  textbook_id: string;
  parent_id?: string;
  chapter_title: string;
  chapter_type: 'unit' | 'lesson' | 'section';
  page_start: number;
  page_end: number;
  order_index: number;
  children?: TextbookChapter[];
}

/**
 * 获取教材的所有章节（单元/课/节）
 */
export async function getTextbookChapters(textbookId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('textbook_chapters')
    .select('*')
    .eq('user_id', USER_ID)
    .eq('textbook_id', textbookId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('[Supabase] getTextbookChapters error:', error);
    return null;
  }

  return data;
}

/**
 * 获取指定章节详情
 */
export async function getChapterDetail(chapterId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('textbook_chapters')
    .select('*')
    .eq('id', chapterId)
    .single();

  if (error) {
    console.error('[Supabase] getChapterDetail error:', error);
    return null;
  }

  return data;
}

/**
 * 保存教材章节
 */
export async function saveTextbookChapters(textbookId: string, chapters: Omit<TextbookChapter, 'textbook_id'>[]) {
  if (!supabase) return false;

  const records = chapters.map((ch, idx) => ({
    user_id: USER_ID,
    textbook_id: textbookId,
    parent_id: ch.parent_id || null,
    chapter_title: ch.chapter_title,
    chapter_type: ch.chapter_type,
    page_start: ch.page_start,
    page_end: ch.page_end,
    order_index: ch.order_index ?? idx,
  }));

  const { error } = await supabase
    .from('textbook_chapters')
    .upsert(records, {
      onConflict: 'user_id,textbook_id,id',
    });

  if (error) {
    console.error('[Supabase] saveTextbookChapters error:', error);
    return false;
  }

  return true;
}

/**
 * 删除教材的所有章节
 */
export async function deleteTextbookChapters(textbookId: string) {
  if (!supabase) return false;
  const { error } = await supabase
    .from('textbook_chapters')
    .delete()
    .eq('user_id', USER_ID)
    .eq('textbook_id', textbookId);
  return !error;
}

// ==================== Docx 导入记录 ====================

export interface DocxImportRecord {
  id: string;
  user_id: string;
  file_name: string;
  file_size?: number;
  unit_id: string;
  textbook_id: string;
  unit_title: string;
  page_range?: string;
  data?: Record<string, unknown>;
  concepts_count?: number;
  events_count?: number;
  links_count?: number;
  exam_focus_count?: number;
  imported_at?: string;
}

/**
 * 获取 docx 导入列表
 */
export async function getDocxImports() {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('docx_imports')
    .select('*')
    .eq('user_id', USER_ID)
    .order('imported_at', { ascending: false });

  if (error) {
    console.error('[Supabase] getDocxImports error:', error);
    return null;
  }
  return data;
}

/**
 * 获取单个 docx 导入的完整数据
 */
export async function getDocxImportData(importId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('docx_imports')
    .select('data')
    .eq('id', importId)
    .eq('user_id', USER_ID)
    .single();

  if (error) {
    console.error('[Supabase] getDocxImportData error:', error);
    return null;
  }
  return data?.data || null;
}

/**
 * 按单元标题查找 docx 导入
 */
export async function findDocxImportByUnitTitle(unitTitle: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('docx_imports')
    .select('*')
    .eq('user_id', USER_ID)
    .ilike('unit_title', `%${unitTitle}%`)
    .order('imported_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // 没有找到是正常的，不要打印错误
    return null;
  }
  return data;
}

/**
 * 按 unit_id 精确查找 docx 导入
 */
export async function findDocxImportByUnitId(unitId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('docx_imports')
    .select('*')
    .eq('user_id', USER_ID)
    .eq('unit_id', unitId)
    .order('imported_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }
  return data;
}

