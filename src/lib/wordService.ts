/**
 * 单词学习服务 - Supabase 数据操作
 */

// 重新导出 supabase（为了兼容旧代码）
export { supabase } from './supabase';

import { supabase as supabaseClient } from './supabase';
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
  if (!supabaseClient) return [];
  const { data, error } = await supabaseClient
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
  if (!supabaseClient) return { words: [], total: 0 };
  const { page = 1, limit = 20, frequency = 'all', status = 'all', search = '', userId = 'personal-user' } = params;

  let query = supabaseClient
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

  // 关联 mastery 表获取每个单词的掌握状态
  let masteryMap: Map<string, number> = new Map();
  let masteries: { word_id: string; mastery_level: number }[] = [];

  // 特殊处理 mastered：用 RPC 执行 JOIN 查询，一次获取所有数据
  if (status === 'mastered' && supabaseClient) {
    const { data, error } = await supabaseClient
      .from('word_mastery')
      .select(`
        mastery_level,
        updated_at,
        words:word_id (
          id,
          word,
          phonetic,
          part_of_speech,
          meaning,
          example,
          translation,
          collocations,
          synonyms,
          antonyms,
          frequency_level,
          created_at
        )
      `)
      .eq('user_id', userId)
      .gte('mastery_level', 5)
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[WordService] mastered query error:', error);
      return { words: [], total: 0 };
    }

    if (data && data.length > 0) {
      const wordsWithMastery = data.map((row: any) => ({
        ...row.words,
        mastery_level: row.mastery_level,
      })).filter((w: any) => w && w.id != null);
      return { words: wordsWithMastery, total: data.length };
    }
    return { words: [], total: 0 };
  }

  query = query.range(from, to).order('word');

  const { data, error, count } = await query;

  if (error) {
    console.error('[WordService] getWords error:', error);
    return { words: [], total: 0 };
  }

  // 关联 mastery 表获取每个单词的掌握状态
  if (data && data.length > 0) {
    const wordIds = data.map(w => w.id);
    const { data: masteryData } = await supabaseClient
      .from('word_mastery')
      .select('word_id, mastery_level')
      .eq('user_id', userId)
      .in('word_id', wordIds);

    masteries = masteryData || [];
    masteryMap = new Map(masteries.map(m => [m.word_id, m.mastery_level]));

    // 为每个单词附加 mastery_level 字段
    const wordsWithMastery = data.map(w => ({
      ...w,
      mastery_level: masteryMap.get(w.id) || 0,
    }));

    // 如果需要状态筛选
    if (status !== 'all') {
      const filteredWords = wordsWithMastery.filter(w => {
        const level = w.mastery_level;
        if (status === 'unlearned') return level === 0;
        if (status === 'learned') return level > 0 && level < 5;
        if (status === 'mastered') return level >= 5;
        return true;
      });

      // 状态筛选时重新计算总数
      let countQuery = supabaseClient
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

    return { words: wordsWithMastery, total: count || 0 };
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
  if (!supabaseClient) return { newWords: [], reviewWords: [] };
  const today = new Date().toISOString().split('T')[0];

  // 获取从未学过的单词（新词）
  const { data: allWords } = await supabaseClient
    .from('words')
    .select('*')
    .order('RANDOM()')
    .limit(limit * 2);

  if (!allWords) return { newWords: [], reviewWords: [] };

  const wordIds = allWords.map(w => w.id);

  // 获取已学习的单词ID
  const { data: masteries } = await supabaseClient
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
  if (!supabaseClient) return { success: 0, failed: words.length };

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

    const { error } = await supabaseClient
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
): Promise<{ mastery_level: number; review_count: number; next_review: string } | null> {
  console.log('[WordService] updateMastery called:', { wordId, action, userId });
  
  // 获取当前掌握度
  let newLevel = 0;
  let reviewCount = 0;

  if (supabaseClient) {
    try {
      const { data: existing, error: fetchError } = await supabaseClient
        .from('word_mastery')
        .select('*')
        .eq('user_id', userId)
        .eq('word_id', wordId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[WordService] fetch existing error:', fetchError);
      }
      
      console.log('[WordService] existing record:', existing);
      
      if (existing) {
        newLevel = existing.mastery_level || 0;
        reviewCount = existing.review_count || 0;
      }

      // 获取单词文本（用于 word_text 字段）
      let wordText = wordId;
      try {
        const { data: wordData } = await supabaseClient
          .from('words')
          .select('word')
          .eq('id', wordId)
          .single();
        if (wordData) {
          wordText = wordData.word;
        }
      } catch (e) {
        console.log('[WordService] Could not fetch word text, using wordId');
      }

      // 计算新掌握度
      switch (action) {
        case 'learned':
        case 'reviewed':
          newLevel = Math.min(5, newLevel + 1);
          reviewCount += 1;
          break;
        case 'mastered':
          newLevel = 5;
          reviewCount += 1;
          break;
        case 'forgotten':
          newLevel = Math.max(0, newLevel - 1);
          break;
      }

      // 计算下次复习时间
      const days = REVIEW_INTERVALS[newLevel - 1] || 1;
      const nextReview = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

      const masteryData = {
        user_id: userId,
        word_id: wordId,
        word_text: wordText,
        mastery_level: newLevel,
        review_count: reviewCount,
        updated_at: new Date().toISOString(),
        next_review_date: nextReview.split('T')[0], // DATE type needs YYYY-MM-DD format
      };

      console.log('[WordService] upserting:', masteryData);

      const { error: upsertError } = await supabaseClient
        .from('word_mastery')
        .upsert(masteryData, { onConflict: 'user_id,word_id' });

      if (upsertError) {
        console.error('[WordService] upsert error:', upsertError);
        saveMasteryToLocal(wordId, newLevel, reviewCount);
        return { mastery_level: newLevel, review_count: reviewCount, next_review: nextReview } as any;
      }

      console.log('[WordService] upsert success!');
      
      // 记录学习行为
      await recordLearningAction(wordId, action);
      
      // 返回新数据而不是再查一次
      return { mastery_level: newLevel, review_count: reviewCount, next_review: nextReview } as any;
    } catch (err) {
      console.error('[WordService] supabase error, using localStorage:', err);
      // Fallback to localStorage
      switch (action) {
        case 'learned':
        case 'reviewed':
          newLevel = Math.min(5, newLevel + 1);
          break;
        case 'mastered':
          newLevel = 5;
          break;
        case 'forgotten':
          newLevel = Math.max(0, newLevel - 1);
          break;
      }
      saveMasteryToLocal(wordId, newLevel, reviewCount + 1);
      return { mastery_level: newLevel, review_count: reviewCount, next_review: '' } as any;
    }
  } else {
    console.log('[WordService] supabaseClient is null, using localStorage');
    // 完全使用 localStorage
    switch (action) {
      case 'learned':
      case 'reviewed':
        newLevel = Math.min(5, newLevel + 1);
        break;
      case 'mastered':
        newLevel = 5;
        break;
      case 'forgotten':
        newLevel = Math.max(0, newLevel - 1);
        break;
    }
    saveMasteryToLocal(wordId, newLevel, reviewCount + 1);
    return { mastery_level: newLevel, review_count: reviewCount, next_review: '' } as any;
  }
}

/**
 * 保存到 localStorage (fallback)
 */
function saveMasteryToLocal(wordId: string, level: number, reviewCount: number) {
  try {
    const key = `word_mastery_${wordId}`;
    const days = REVIEW_INTERVALS[level - 1] || 1;
    const nextReview = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    
    localStorage.setItem(key, JSON.stringify({
      word_id: wordId,
      mastery_level: level,
      review_count: reviewCount,
      last_review: new Date().toISOString(),
      next_review: nextReview,
    }));
    console.log('[WordService] Saved to localStorage:', key);
  } catch (err) {
    console.error('[WordService] localStorage save failed:', err);
  }
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
  if (!supabaseClient) return;
  const { error } = await supabaseClient
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
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
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
  if (!supabaseClient) return { total: 0, learned: 0, mastered: 0, toReview: 0, todayLearned: 0, streakDays: 0 };
  
  const today = new Date().toISOString().split('T')[0];

  // 总词数
  const { count: totalWords } = await supabaseClient
    .from('words')
    .select('*', { count: 'exact', head: true });

  // 已学习（mastery_level > 0）
  const { count: learned } = await supabaseClient
    .from('word_mastery')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gt('mastery_level', 0);

  // 已掌握（mastery_level >= 5）
  const { count: mastered } = await supabaseClient
    .from('word_mastery')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('mastery_level', 5);

  // 未学习 = 总词数 - 已学习
  const total = (totalWords || 0) - (learned || 0);

  // 待复习（next_review <= 今天）
  const { count: toReview } = await supabaseClient
    .from('word_mastery')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lt('mastery_level', 5)
    .lte('next_review', today);

  // 今日学习
  const { count: todayLearned } = await supabaseClient
    .from('word_learning_records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`);

  // 计算连续学习天数
  const { data: records } = await supabaseClient
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
    total,
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
  if (!supabaseClient) return new Map();
  const { data, error } = await supabaseClient
    .from('word_mastery')
    .select('*')
    .eq('user_id', userId)
    .in('word_id', wordIds);

  const map = new Map<string, WordMastery>();
  data?.forEach(m => map.set(m.word_id, m));
  return map;
}

/**
 * 使用 RPC 一次性获取统计和已掌握单词
 * 解决多次独立查询导致的并发超时问题
 * 如果 RPC 不存在，自动降级到旧方法
 */
export async function getWordStatsWithMastered(
  userId: string = 'personal-user',
  limit: number = 999,
  offset: number = 0
): Promise<{
  stats: {
    total: number;
    totalWords: number;
    learned: number;
    mastered: number;
    toReview: number;
    todayLearned: number;
    streakDays: number;
  };
  masteredWords: WordRecord[];
}> {
  if (!supabaseClient) {
    return {
      stats: { total: 0, totalWords: 0, learned: 0, mastered: 0, toReview: 0, todayLearned: 0, streakDays: 0 },
      masteredWords: [],
    };
  }

  // 优先使用 RPC（一次请求搞定）
  const { data, error } = await supabaseClient.rpc('get_word_stats_and_mastered', {
    p_user_id: userId,
    p_limit: limit,
    p_offset: offset,
  });

  // 如果 RPC 失败（函数未创建），使用降级方案
  if (error || !data) {
    console.warn('[WordService] RPC not available, using fallback. Error:', error?.message);
    return await getWordStatsWithMasteredFallback(userId, limit, offset);
  }

  const masteredWords = (data.mastered_words || []).map((w: any) => ({
    id: w.id,
    word: w.word,
    phonetic: w.phonetic || '',
    part_of_speech: w.part_of_speech || '',
    meaning: w.meaning,
    example: w.example || '',
    translation: w.translation || '',
    collocations: w.collocations || [],
    synonyms: w.synonyms || [],
    antonyms: w.antonyms || [],
    frequency_level: w.frequency_level || 'medium',
    created_at: w.created_at,
    mastery_level: w.mastery_level,
  }));

  return {
    stats: {
      total: data.total || 0,
      totalWords: data.total_words || 0,
      learned: data.learned || 0,
      mastered: data.mastered || 0,
      toReview: data.to_review || 0,
      todayLearned: data.today_learned || 0,
      streakDays: data.streak_days || 0,
    },
    masteredWords,
  };
}

/**
 * 降级方案：使用关联查询获取已掌握单词（替代两次独立查询）
 * 比 RPC 方案多一次请求，但比原来的 6 次少得多
 */
async function getWordStatsWithMasteredFallback(
  userId: string = 'personal-user',
  limit: number = 999,
  offset: number = 0
): Promise<{
  stats: {
    total: number;
    totalWords: number;
    learned: number;
    mastered: number;
    toReview: number;
    todayLearned: number;
    streakDays: number;
  };
  masteredWords: WordRecord[];
}> {
  const today = new Date().toISOString().split('T')[0];

  // 一次性获取所有数据（使用并发 Promise.all，但只有 2 个请求）
  const [statsResult, masteredResult] = await Promise.all([
    // 统计查询 - 全部并发执行
    Promise.all([
      supabaseClient!.from('words').select('*', { count: 'exact', head: true }),
      supabaseClient!.from('word_mastery').select('*', { count: 'exact', head: true }).eq('user_id', userId).gt('mastery_level', 0),
      supabaseClient!.from('word_mastery').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('mastery_level', 5),
      supabaseClient!.from('word_mastery').select('*', { count: 'exact', head: true }).eq('user_id', userId).lt('mastery_level', 5).lte('next_review', today),
      supabaseClient!.from('word_learning_records').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', `${today}T00:00:00`),
      supabaseClient!.from('word_learning_records').select('created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(365),
    ]),
    // 已掌握单词查询 - 使用 JOIN 一次性获取（避免 IN 查询）
    supabaseClient!.from('word_mastery')
      .select(`
        mastery_level,
        words:word_id (
          id, word, phonetic, part_of_speech, meaning, example, translation,
          collocations, synonyms, antonyms, frequency_level, created_at
        )
      `)
      .eq('user_id', userId)
      .gte('mastery_level', 5)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1),
  ]);

  // 解析统计数据
  const [totalResult, learnedResult, masteredCountResult, reviewResult, todayResult, streakResult] = statsResult;

  const totalWords = totalResult.count || 0;
  const learned = learnedResult.count || 0;
  const mastered = masteredCountResult.count || 0;
  const toReview = reviewResult.count || 0;
  const todayLearned = todayResult.count || 0;

  // 计算连续天数
  let streakDays = 0;
  if (streakResult.data && streakResult.data.length > 0) {
    const dates = new Set(
      (streakResult.data as any[])
        .map(r => r.created_at?.split('T')[0])
        .filter(Boolean) as string[]
    );
    let checkDate = new Date();
    while (dates.has(checkDate.toISOString().split('T')[0])) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // 解析已掌握单词
  const masteredWords: WordRecord[] = [];
  if (masteredResult.data && masteredResult.data.length > 0) {
    for (const row of masteredResult.data as any[]) {
      if (row.words && row.words.id != null) {
        masteredWords.push({
          ...row.words,
          mastery_level: row.mastery_level,
        });
      }
    }
  }

  return {
    stats: {
      total: totalWords - learned,
      totalWords,
      learned,
      mastered,
      toReview,
      todayLearned,
      streakDays,
    },
    masteredWords,
  };
}
