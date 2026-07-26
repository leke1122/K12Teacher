/**
 * 单词学习服务 - 优先从 Supabase 读取，fallback 到本地 JSON
 */

import { createClient } from '@supabase/supabase-js';
import wordsDataRaw from '@/data/words/words_data.json';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface WordRecord {
  id?: string | number;
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
  mastery_level: number;
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
  duration: number;
  created_at?: string;
}

// 本地存储的单词学习进度
const MASTERY_STORAGE_KEY = 'word_mastery';

// 判断是否在浏览器环境
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// 获取本地存储的掌握进度
function getLocalMastery(): Record<string, WordMastery> {
  if (!isBrowser()) return {};
  try {
    const stored = localStorage.getItem(MASTERY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// 保存本地存储的掌握进度
function saveLocalMastery(mastery: Record<string, WordMastery>) {
  if (!isBrowser()) return;
  localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(mastery));
}

// 获取单词数据（支持服务端）
function getWordsData(): WordRecord[] {
  return wordsDataRaw as WordRecord[];
}

/**
 * 获取所有单词 - 优先从 Supabase 读取
 */
export async function getAllWords(): Promise<WordRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .order('word', { ascending: true });
      
      if (!error && data && data.length > 0) {
        console.log(`[WordService] 从 Supabase 获取 ${data.length} 条单词`);
        return data as WordRecord[];
      }
    } catch (err) {
      console.warn('[WordService] Supabase 查询失败，使用本地数据:', err);
    }
  }
  
  // Fallback 到本地 JSON
  console.log('[WordService] 使用本地 JSON 数据');
  return getWordsData();
}

/**
 * 获取单词列表（带分页和筛选）
 */
export async function getWords(params: {
  page?: number;
  limit?: number;
  frequency?: 'high' | 'medium' | 'low' | 'all';
  status?: 'all' | 'learned' | 'mastered' | 'unlearned' | 'unmastered';
  search?: string;
  userId?: string;
}): Promise<{ words: WordRecord[]; total: number }> {
  const { page = 1, limit = 20, frequency = 'all', status = 'all', search = '' } = params;
  
  let filtered: WordRecord[] = [];
  let total = 0;
  
  // 优先从 Supabase 读取
  if (supabase) {
    try {
      let query = supabase
        .from('words')
        .select('*', { count: 'exact' });
      
      // 频率筛选
      if (frequency !== 'all') {
        query = query.eq('frequency_level', frequency);
      }
      
      // 搜索 - 使用 ilike
      if (search) {
        query = query.ilike('word', `%${search}%`);
      }
      
      query = query.order('word', { ascending: true });
      
      // 获取分页数据
      const from = (page - 1) * limit;
      const { data, error, count } = await query.range(from, from + limit - 1);
      
      if (!error && data && data.length > 0) {
        console.log(`[WordService] 从 Supabase 获取 ${data.length} 条单词`);
        filtered = data as WordRecord[];
        total = count || data.length;
      } else {
        console.warn('[WordService] Supabase 查询失败或返回空:', error?.message);
        throw new Error('Supabase 返回空数据');
      }
    } catch (err) {
      console.warn('[WordService] Supabase 查询失败，使用本地数据:', err);
      // Fallback 到本地
      filtered = getLocalFiltered(frequency, search);
      total = filtered.length;
    }
  } else {
    // 无 Supabase，使用本地数据
    filtered = getLocalFiltered(frequency, search);
    total = filtered.length;
  }
  
  // 状态筛选（基于本地存储）
  if (status !== 'all') {
    const mastery = getLocalMastery();
    filtered = filtered.filter(w => {
      const m = mastery[String(w.id)];
      if (status === 'mastered') return m && m.mastery_level >= 5;
      if (status === 'learned') return m && m.mastery_level > 0;
      if (status === 'unlearned') return !m;
      if (status === 'unmastered') return !m || m.mastery_level < 5;
      return true;
    });
    total = filtered.length;
  }
  
  const from = (page - 1) * limit;
  const words = filtered.slice(from, from + limit);
  
  return { words, total };
}

/**
 * 本地数据筛选逻辑
 */
function getLocalFiltered(frequency: string, search: string): WordRecord[] {
  let filtered = [...getWordsData()];
  
  if (frequency !== 'all') {
    filtered = filtered.filter(w => w.frequency_level === frequency);
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(w => 
      w.word.toLowerCase().includes(searchLower) ||
      w.meaning.toLowerCase().includes(searchLower)
    );
  }
  
  return filtered;
}

/**
 * 获取单词统计数据
 */
export async function getWordStats(): Promise<{
  total: number;
  learned: number;
  mastered: number;
  toReview: number;
  todayLearned: number;
  streakDays: number;
}> {
  const words = getWordsData();
  const mastery = getLocalMastery();
  
  let learned = 0;
  let mastered = 0;
  
  for (const word of words) {
    const m = mastery[String(word.id)];
    if (m) {
      if (m.mastery_level >= 5) mastered++;
      else if (m.mastery_level > 0) learned++;
    }
  }
  
  return {
    total: words.length,
    learned,
    mastered,
    toReview: learned - mastered,
    todayLearned: learned,
    streakDays: learned > 0 ? 1 : 0
  };
}

/**
 * 更新单词掌握状态
 */
export async function updateMastery(
  wordId: string,
  action: 'learn' | 'review' | 'master' | 'forget' | 'skip',
  userId?: string
): Promise<{ mastery_level: number; review_count: number; next_review: string | null }> {
  const mastery = getLocalMastery();
  const existing = mastery[wordId] || {
    word_id: wordId,
    user_id: userId || 'local-user',
    mastery_level: 0,
    review_count: 0,
    last_review: null,
    next_review: null
  };
  
  switch (action) {
    case 'learn':
      existing.mastery_level = Math.min(5, existing.mastery_level + 1);
      break;
    case 'review':
      existing.review_count++;
      existing.last_review = new Date().toISOString();
      break;
    case 'master':
      existing.mastery_level = 5;
      break;
    case 'forget':
      existing.mastery_level = Math.max(0, existing.mastery_level - 1);
      break;
    case 'skip':
      break;
  }
  
  mastery[wordId] = existing;
  saveLocalMastery(mastery);
  
  return {
    mastery_level: existing.mastery_level,
    review_count: existing.review_count,
    next_review: existing.next_review,
  };
}

/**
 * 获取每日单词 - 优先从 Supabase 读取
 */
export async function getDailyWords(userId?: string, count: number = 10): Promise<{ newWords: WordRecord[]; reviewWords: WordRecord[] }> {
  let allWords: WordRecord[] = [];
  
  // 优先从 Supabase 读取
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .order('word', { ascending: true });
      
      if (!error && data && data.length > 0) {
        console.log(`[WordService] getDailyWords 从 Supabase 获取 ${data.length} 条单词`);
        allWords = data as WordRecord[];
      } else {
        throw new Error('Supabase 返回空数据');
      }
    } catch (err) {
      console.warn('[WordService] getDailyWords Supabase 失败，使用本地数据');
      allWords = getWordsData();
    }
  } else {
    allWords = getWordsData();
  }
  
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  const shuffled = [...allWords].sort((a, b) => {
    const hashA = String(a.id).charCodeAt(0) * seed;
    const hashB = String(b.id).charCodeAt(0) * seed;
    return (hashA % 1000) - (hashB % 1000);
  });
  
  return {
    newWords: shuffled.slice(0, count),
    reviewWords: shuffled.slice(count, count * 2),
  };
}

/**
 * 记录学习动作
 */
export async function recordLearningAction(
  wordId: string,
  action: 'learned' | 'reviewed' | 'mastered' | 'forgotten' | 'skipped',
  duration: number = 0
): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('word_learning_records')
        .insert({
          user_id: 'personal-user',
          word_id: wordId,
          action: action,
          duration: duration,
        });
      
      if (!error) {
        return true;
      }
    } catch (err) {
      console.warn('[WordService] recordLearningAction 失败:', err);
    }
  }
  
  // Fallback 到本地
  const records = getLocalLearningRecords();
  records.push({
    word_id: wordId,
    user_id: 'local-user',
    action: action,
    duration: duration,
    created_at: new Date().toISOString(),
  });
  saveLocalLearningRecords(records);
  return true;
}

// 本地学习记录
const LEARNING_RECORDS_KEY = 'word_learning_records';

function getLocalLearningRecords(): WordLearningRecord[] {
  if (!isBrowser()) return [];
  try {
    const stored = localStorage.getItem(LEARNING_RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalLearningRecords(records: WordLearningRecord[]) {
  if (!isBrowser()) return;
  localStorage.setItem(LEARNING_RECORDS_KEY, JSON.stringify(records));
}

/**
 * 获取单词统计数据（包含已掌握单词）
 */
export async function getWordStatsWithMastered(
  userId?: string,
  masteredLimit: number = 999,
  learnedLimit: number = 0
): Promise<{
  stats: {
    total: number;
    learned: number;
    mastered: number;
    unlearned: number;
  };
  masteredWords: WordRecord[];
  learnedWords: WordRecord[];
}> {
  let allWords: WordRecord[] = [];
  const masteryMap = new Map<string, WordMastery>();
  
  // 从 Supabase 获取数据
  if (supabase) {
    try {
      const [wordsResult, masteryResult] = await Promise.all([
        supabase.from('words').select('*'),
        supabase.from('word_mastery').select('*').eq('user_id', 'personal-user'),
      ]);
      
      if (!wordsResult.error && wordsResult.data) {
        allWords = wordsResult.data as WordRecord[];
      }
      
      if (!masteryResult.error && masteryResult.data) {
        masteryResult.data.forEach(m => {
          masteryMap.set(m.word_id, m as WordMastery);
        });
      }
    } catch (err) {
      console.warn('[WordService] getWordStatsWithMastered Supabase 失败');
      allWords = getWordsData();
    }
  } else {
    allWords = getWordsData();
    Object.entries(getLocalMastery()).forEach(([wordId, m]) => {
      masteryMap.set(wordId, m);
    });
  }
  
  const masteredWords: WordRecord[] = [];
  const learnedWords: WordRecord[] = [];
  
  for (const word of allWords) {
    const wordId = String(word.id);
    const mastery = masteryMap.get(wordId);
    
    if (mastery) {
      if (mastery.mastery_level >= 5) {
        masteredWords.push(word);
      } else if (mastery.mastery_level > 0) {
        learnedWords.push(word);
      }
    }
  }
  
  return {
    stats: {
      total: allWords.length,
      learned: learnedWords.length,
      mastered: masteredWords.length,
      unlearned: allWords.length - learnedWords.length - masteredWords.length,
    },
    masteredWords: masteredWords.slice(0, masteredLimit),
    learnedWords: learnedWords.slice(0, learnedLimit),
  };
}

/**
 * 批量插入单词到 Supabase
 */
export async function insertWords(words: WordRecord[]): Promise<{ success: number; failed: number }> {
  if (!supabase) {
    console.warn('[WordService] insertWords: supabase 未配置');
    return { success: 0, failed: words.length };
  }
  
  let success = 0;
  let failed = 0;
  
  for (const word of words) {
    try {
      const { error } = await supabase
        .from('words')
        .upsert({
          word: word.word,
          phonetic: word.phonetic || '',
          part_of_speech: word.part_of_speech || '',
          meaning: word.meaning,
          example: word.example || '',
          translation: word.translation || '',
          collocations: word.collocations || [],
          synonyms: word.synonyms || [],
          antonyms: word.antonyms || [],
          frequency_level: word.frequency_level || 'medium',
        }, {
          onConflict: 'word',
        });
      
      if (!error) {
        success++;
      } else {
        failed++;
      }
    } catch (err) {
      failed++;
    }
  }
  
  return { success, failed };
}

/**
 * 批量插入单词到 Supabase (支持 ParsedWord 格式)
 */
export async function insertParsedWords(words: { word: string; phonetic?: string; partOfSpeech?: string; meaning: string; frequencyLevel?: string; example?: string; translation?: string; collocations?: string[]; synonyms?: string[]; antonyms?: string[] }[]): Promise<{ success: number; failed: number }> {
  if (!supabase) {
    return { success: 0, failed: words.length };
  }
  
  let success = 0;
  let failed = 0;
  
  for (const word of words) {
    try {
      const { error } = await supabase
        .from('words')
        .upsert({
          word: word.word,
          phonetic: word.phonetic || '',
          part_of_speech: word.partOfSpeech || '',
          meaning: word.meaning,
          example: word.example || '',
          translation: word.translation || '',
          collocations: word.collocations || [],
          synonyms: word.synonyms || [],
          antonyms: word.antonyms || [],
          frequency_level: word.frequencyLevel as 'high' | 'medium' | 'low' || 'medium',
        }, {
          onConflict: 'word',
        });
      
      if (!error) {
        success++;
      } else {
        failed++;
      }
    } catch (err) {
      failed++;
    }
  }
  
  return { success, failed };
}

/**
 * 批量获取单词掌握度
 */
export async function getBatchMastery(wordIds: string[]): Promise<Map<string, WordMastery>> {
  const result = new Map<string, WordMastery>();
  
  if (!supabase) {
    const localMastery = getLocalMastery();
    wordIds.forEach(id => {
      if (localMastery[id]) {
        result.set(id, localMastery[id]);
      }
    });
    return result;
  }
  
  try {
    const { data, error } = await supabase
      .from('word_mastery')
      .select('*')
      .eq('user_id', 'personal-user')
      .in('word_id', wordIds);
    
    if (!error && data) {
      data.forEach(m => {
        result.set(m.word_id, m as WordMastery);
      });
    }
  } catch (err) {
    console.warn('[WordService] getBatchMastery 失败:', err);
  }
  
  return result;
}

// 不需要重复导出 supabase（已在上面定义）
