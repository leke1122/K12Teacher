/**
 * 地理知识数据库服务
 * 从 Supabase geography_knowledge 表加载数据
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface GeographyKnowledgeItem {
  id: string;
  chapter_id: string;
  section_id: string;
  content_type: 'framework' | 'detail';
  title: string;
  content: string;
  keywords: string[];
  exam_frequency: number;
  difficulty: number;
}

// 缓存
let cachedData: GeographyKnowledgeItem[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

/**
 * 从 Supabase 获取所有地理知识数据
 */
export async function getGeographyKnowledgeFromDB(): Promise<GeographyKnowledgeItem[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('[GeographyKnowledge] Supabase 未配置，使用空数据');
    return [];
  }

  // 检查缓存
  if (cachedData && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedData;
  }

  try {
    const { data, error } = await supabase
      .from('geography_knowledge')
      .select('*')
      .order('chapter_id', { ascending: true })
      .order('section_id', { ascending: true });

    if (error) {
      console.error('[GeographyKnowledge] 查询失败:', error);
      return cachedData || [];
    }

    cachedData = data || [];
    cacheTime = Date.now();
    console.log(`[GeographyKnowledge] 已加载 ${cachedData.length} 条记录`);
    
    return cachedData;
  } catch (err) {
    console.error('[GeographyKnowledge] 异常:', err);
    return cachedData || [];
  }
}

/**
 * 按章节获取知识数据
 */
export async function getKnowledgeByChapter(chapterId: string): Promise<GeographyKnowledgeItem[]> {
  const allData = await getGeographyKnowledgeFromDB();
  return allData.filter(item => item.chapter_id === chapterId);
}

/**
 * 按章节获取知识点列表
 */
export async function getKnowledgePoints(chapterId: string): Promise<{
  id: string;
  title: string;
  content: string;
  keywords: string[];
  exam_frequency: number;
  difficulty: number;
}[]> {
  const chapterData = await getKnowledgeByChapter(chapterId);
  return chapterData.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    keywords: item.keywords || [],
    exam_frequency: item.exam_frequency || 1,
    difficulty: item.difficulty || 2,
  }));
}

/**
 * 获取框架考点
 */
export async function getFrameworkPoints(): Promise<{
  id: string;
  title: string;
  content: string;
  keywords: string[];
  exam_frequency: number;
}[]> {
  const allData = await getGeographyKnowledgeFromDB();
  const frameworkData = allData.filter(item => item.chapter_id === 'framework');
  
  return frameworkData.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    keywords: item.keywords || [],
    exam_frequency: item.exam_frequency || 1,
  }));
}

/**
 * 获取单个知识点的详细信息
 */
export async function getKnowledgeDetail(id: string): Promise<GeographyKnowledgeItem | null> {
  const allData = await getGeographyKnowledgeFromDB();
  return allData.find(item => item.id === id) || null;
}

/**
 * 获取章节统计信息
 */
export async function getChapterStats(): Promise<Record<string, number>> {
  const allData = await getGeographyKnowledgeFromDB();
  const stats: Record<string, number> = {};
  
  allData.forEach(item => {
    stats[item.chapter_id] = (stats[item.chapter_id] || 0) + 1;
  });
  
  return stats;
}

/**
 * 清除缓存
 */
export function clearKnowledgeCache(): void {
  cachedData = null;
  cacheTime = 0;
}
