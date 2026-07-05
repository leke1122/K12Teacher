/**
 * 单词学习服务 - Supabase 数据操作
 */

import { supabase } from './supabase';
import { ParsedWord } from './wordParser';

export interface WordRecord {
  id?: string;
  word: string;
  phonetic: string;
  part_of_speech: string;
  meaning: string;
  example: string;
  translation: string;
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  frequency_level: 'high' | 'medium' | 'low';
  created_at?: string;
}

export interface WordMastery {
  id?: string;
  user_id: string;
  word_id: string;
  mastery_level: number; // 0-5，5为完全掌握
  review_count: number;
  last_review: string | null;
  next_review: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WordLearningRecord {
  id?: string;
  user_id: string;
  word_id: string;
  action: 'learned' | 'reviewed' | 'mastered' | 'forgotten' | 'skipped';
  duration: number; // 学习时长（秒）
  created_at?: string;
}

// 艾宾浩斯复习间隔（天数）
const REVIEW_INTERVALS = [1, 3, 7, 15, 30];

/**
 * 获取所有单词
 */
export async function getAllWords(): Promise<WordRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .order('word');

  if (error) {
    console.error('[WordService] getAllWords error:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取单词列表（带分页和筛选）
 */
export async function getWords(params: {
  page?: number;
  limit?: number;
  frequency?: 'high' | 'medium' | 'low' | 'all';
  status?: 'all' | 'learned' | 'mastered' | 'unlearned';
  search?: string;
  userId?: string;
}): Promise<{ words: WordRecord[]; total: number }> {
  if (!supabase) return { words: [], total: 0 };
  const { page = 1, limit = 20, frequency = 'all', status = 'all', search = '', userId = 'personal-user' } = params;

  let query = supabase
    .from('words')
    .select('*', { count: 'exact' });

  // 频率筛选
  if (frequency !== 'all') {
    query = query.eq('frequency_level', frequency);
  }

  // 搜索
  if (search) {
    query = query.or(`word.ilike.%${search}%,meaning.ilike.%${search}%`);
  }

  // 分页
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to).order('word');

  const { data, error, count } = await query;

  if (error) {
    console.error('[WordService] getWords error:', error);
    return { words: [], total: 0 };
  }

  // 如果需要状态筛选，需要关联 mastery 表
  if (status !== 'all' && data && data.length > 0) {
    const wordIds = data.map(w => w.id);
    const { data: masteries } = await supabase
      .from('word_mastery')
      .select('word_id, mastery_level')
      .eq('user_id', userId)
      .in('word_id', wordIds);

    const masteryMap = new Map();
    masteries?.forEach(m => masteryMap.set(m.word_id, m.mastery_level));

    const filteredWords = data.filter(w => {
      const level = masteryMap.get(w.id) || 0;
      if (status === 'unlearned') return level === 0;
      if (status === 'learned') return level > 0 && level < 5;
      if (status === 'mastered') return level >= 5;
      return true;
    });

    // 状态筛选时重新计算总数
    let countQuery = supabase
      .from('words')
      .select('*', { count: 'exact', head: true });

    if (frequency !== 'all') {
      countQuery = countQuery.eq('frequency_level', frequency);
    }
    if (search) {
      countQuery = countQuery.or(`word.ilike.%${search}%,meaning.ilike.%${search}%`);
    }

    const { count: totalCount } = await countQuery;
    return { words: filteredWords, total: totalCount || filteredWords.length };
  }

  return { words: data || [], total: count || 0 };
}

/**
 * 获取今日待学单词
 */
export async function getDailyWords(userId: string = 'personal-user', limit: number = 20): Promise<{
  newWords: WordRecord[];
  reviewWords: WordRecord[];
}> {
  if (!supabase) return { newWords: [], reviewWords: [] };
  const today = new Date().toISOString().split('T')[0];

  // 获取从未学过的单词（新词）
  const { data: allWords } = await supabase
    .from('words')
    .select('*')
    .order('RANDOM()')
    .limit(limit * 2);

  if (!allWords) return { newWords: [], reviewWords: [] };

  const wordIds = allWords.map(w => w.id);

  // 获取已学习的单词ID
  const { data: masteries } = await supabase
    .from('word_mastery')
    .select('word_id, next_review, mastery_level')
    .eq('user_id', userId)
    .in('word_id', wordIds)
    .lt('mastery_level', 5);

  const learnedWordIds = new Set(masteries?.map(m => m.word_id) || []);
  const reviewWordIds = new Set(
    masteries
      ?.filter(m => m.next_review && m.next_review.split('T')[0] <= today)
      .map(m => m.word_id) || []
  );

  const newWords: WordRecord[] = [];
  const reviewWords: WordRecord[] = [];

  for (const word of allWords) {
    if (reviewWordIds.has(word.id)) {
      reviewWords.push(word);
      if (reviewWords.length >= limit) break;
    } else if (!learnedWordIds.has(word.id)) {
      newWords.push(word);
      if (newWords.length >= limit) break;
    }
  }

  return { newWords, reviewWords };
}

/**
 * 批量插入单词（分批插入，避免限制）
 */
export async function insertWords(words: ParsedWord[]): Promise<{ success: number; failed: number }> {
  if (!supabase) return { success: 0, failed: words.length };

  const BATCH_SIZE = 100;
  let totalSuccess = 0;
  let totalFailed = 0;

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    
    const records: Omit<WordRecord, 'id' | 'created_at'>[] = batch.map(w => ({
      word: w.word,
      phonetic: w.phonetic || '',
      part_of_speech: w.partOfSpeech || '',
      meaning: w.meaning || '',
      example: w.example || '',
      translation: w.translation || '',
      collocations: w.collocations || [],
      synonyms: w.synonyms || [],
      antonyms: w.antonyms || [],
      frequency_level: w.frequencyLevel,
    }));

    const { error } = await supabase
      .from('words')
      .upsert(records, { onConflict: 'word' });

    if (error) {
      console.error(`[WordService] 批次 ${i}-${i + batch.length} 插入失败:`, error.message);
      totalFailed += batch.length;
    } else {
      totalSuccess += batch.length;
      console.log(`[WordService] 批次 ${i}-${i + batch.length} 插入成功`);
    }
  }

  return { success: totalSuccess, failed: totalFailed };
}

/**
 * 更新单词掌握度
 */
export async function updateMastery(
  wordId: string,
  action: 'learned' | 'reviewed' | 'mastered' | 'forgotten',
  userId: string = 'personal-user'
): Promise<boolean> {
  if (!supabase) return false;
  
  // 获取当前掌握度
  const { data: existing } = await supabase
    .from('word_mastery')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .single();

  let newLevel = existing?.mastery_level || 0;
  let reviewCount = existing?.review_count || 0;

  switch (action) {
    case 'learned':
    case 'reviewed':
      // 答对/复习：增加掌握度
      newLevel = Math.min(5, newLevel + 1);
      reviewCount += 1;
      break;
    case 'mastered':
      // 完全掌握
      newLevel = 5;
      reviewCount += 1;
      break;
    case 'forgotten':
      // 遗忘：降低掌握度
      newLevel = Math.max(0, newLevel - 1);
      break;
  }

  // 计算下次复习时间
  const days = REVIEW_INTERVALS[newLevel - 1] || 1;
  const nextReview = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const masteryData: WordMastery = {
    user_id: userId,
    word_id: wordId,
    mastery_level: newLevel,
    review_count: reviewCount,
    last_review: new Date().toISOString(),
    next_review: nextReview,
  };

  const { error } = await supabase
    .from('word_mastery')
    .upsert(masteryData, { onConflict: 'user_id,word_id' });

  if (error) {
    console.error('[WordService] updateMastery error:', error);
    return false;
  }

  // 记录学习行为
  await recordLearningAction(wordId, action);

  return true;
}

/**
 * 记录学习行为
 */
export async function recordLearningAction(
  wordId: string,
  action: 'learned' | 'reviewed' | 'mastered' | 'forgotten' | 'skipped',
  duration: number = 0,
  userId: string = 'personal-user'
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('word_learning_records')
    .insert({
      user_id: userId,
      word_id: wordId,
      action,
      duration,
    });

  if (error) {
    console.error('[WordService] recordLearningAction error:', error);
  }
}

/**
 * 获取单词掌握度
 */
export async function getWordMastery(
  wordId: string,
  userId: string = 'personal-user'
): Promise<WordMastery | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('word_mastery')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .single();

  if (error) return null;
  return data;
}

/**
 * 获取单词学习统计
 */
export async function getWordStats(userId: string = 'personal-user'): Promise<{
  total: number;
  learned: number;
  mastered: number;
  toReview: number;
  todayLearned: number;
  streakDays: number;
}> {
  if (!supabase) return { total: 0, learned: 0, mastered: 0, toReview: 0, todayLearned: 0, streakDays: 0 };
  
  const today = new Date().toISOString().split('T')[0];

  // 总词数
  const { count: total } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true });

  // 已学习（mastery_level > 0）
  const { count: learned } = await supabase
    .from('word_mastery')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gt('mastery_level', 0);

  // 已掌握（mastery_level >= 5）
  const { count: mastered } = await supabase
    .from('word_mastery')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('mastery_level', 5);

  // 待复习（next_review <= 今天）
  const { count: toReview } = await supabase
    .from('word_mastery')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lt('mastery_level', 5)
    .lte('next_review', today);

  // 今日学习
  const { count: todayLearned } = await supabase
    .from('word_learning_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`);

  // 计算连续学习天数
  const { data: records } = await supabase
    .from('word_learning_records')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  let streakDays = 0;
  if (records && records.length > 0) {
    const dates = new Set(
      records.map(r => r.created_at?.split('T')[0]).filter(Boolean) as string[]
    );
    
    let checkDate = new Date();
    while (dates.has(checkDate.toISOString().split('T')[0])) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  return {
    total: total || 0,
    learned: learned || 0,
    mastered: mastered || 0,
    toReview: toReview || 0,
    todayLearned: todayLearned || 0,
    streakDays,
  };
}

/**
 * 获取批量单词的掌握度
 */
export async function getBatchMastery(
  wordIds: string[],
  userId: string = 'personal-user'
): Promise<Map<string, WordMastery>> {
  if (!supabase) return new Map();
  const { data, error } = await supabase
    .from('word_mastery')
    .select('*')
    .eq('user_id', userId)
    .in('word_id', wordIds);

  const map = new Map<string, WordMastery>();
  data?.forEach(m => map.set(m.word_id, m));
  return map;
}
