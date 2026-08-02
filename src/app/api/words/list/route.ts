/**
 * 获取单词列表 API (简化版)
 * GET /api/words/list?page=1&limit=20
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcflszvrefjpfziehvfe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZmxzenZyZWZqcGZ6aWVodmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwODcwMDAsImV4cCI6MjA1MDY2MzAwMH0.LmBPETUH8mVbN9NVVvxJNC-Dq83LRjfZc5vBzD3Q0S4';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const frequency = searchParams.get('frequency') || '';
    const status = searchParams.get('status') || '';
    
    let query = supabase
      .from('words')
      .select('*', { count: 'exact', head: true });
    
    if (search) {
      query = query.ilike('word', `%${search}%`);
    }
    
    // 支持按频率筛选
    if (frequency && frequency !== 'all') {
      query = query.eq('frequency_level', frequency);
    }
    
    // 筛选未掌握的单词
    if (status === 'unmastered') {
      // 需要通过子查询排除已掌握的
      const { data: masteredIds } = await supabase
        .from('word_mastery')
        .select('word_id')
        .eq('user_id', 'personal-user')
        .eq('mastery_level', 5);
      
      const masteredIdList = (masteredIds || []).map((m: any) => m.word_id);
      if (masteredIdList.length > 0) {
        query = query.not('id', 'in', `(${masteredIdList.join(',')})`);
      }
    }
    
    const { count, error: countError } = await query;
    
    if (countError) {
      return NextResponse.json({ success: false, error: countError.message }, { status: 500 });
    }
    
    let dataQuery = supabase
      .from('words')
      .select('*')
      .order('id', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);
    
    if (search) {
      dataQuery = dataQuery.ilike('word', `%${search}%`);
    }
    
    // 支持按频率筛选
    if (frequency && frequency !== 'all') {
      dataQuery = dataQuery.eq('frequency_level', frequency);
    }
    
    // 筛选未掌握的单词
    if (status === 'unmastered') {
      const { data: masteredIds } = await supabase
        .from('word_mastery')
        .select('word_id')
        .eq('user_id', 'personal-user')
        .eq('mastery_level', 5);
      
      const masteredIdList = (masteredIds || []).map((m: any) => m.word_id);
      if (masteredIdList.length > 0) {
        dataQuery = dataQuery.not('id', 'in', `(${masteredIdList.join(',')})`);
      }
    }
    
    const { data: words, error: dataError } = await dataQuery;
    
    if (dataError) {
      return NextResponse.json({ success: false, error: dataError.message }, { status: 500 });
    }
    
    // 获取 mastery 数据
    const wordIds = (words || []).map((w: any) => w.id);
    let masteryMap: Record<string, number> = {};
    
    if (wordIds.length > 0) {
      const { data: masteryData } = await supabase
        .from('word_mastery')
        .select('word_id, mastery_level')
        .eq('user_id', 'personal-user')
        .in('word_id', wordIds);
      
      (masteryData || []).forEach((m: any) => {
        masteryMap[m.word_id.toString()] = m.mastery_level;
      });
    }
    
    // 附加 mastery_level
    const wordsWithMastery = (words || []).map((w: any) => ({
      ...w,
      mastery_level: masteryMap[w.id.toString()] || 0
    }));
    
    // 统计 - 简化
    const { count: totalWords } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true });
    
    return NextResponse.json({
      success: true,
      words: wordsWithMastery,
      total: count || 0,
      stats: {
        total: totalWords || 0,
        learned: 0,
        mastered: 0,
        toReview: 0,
        todayLearned: 0,
        streakDays: 0
      },
      page,
      limit,
    });
  } catch (error: any) {
    console.error('[API/words/list] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '获取单词列表失败' },
      { status: 500 }
    );
  }
}
