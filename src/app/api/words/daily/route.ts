/**
 * 获取今日待学单词和学习记录 API
 * GET /api/words/daily
 */

import { NextResponse } from 'next/server';
import { getDailyWords, getWordStats, supabase } from '@/lib/wordService';

export async function GET() {
  try {
    const [dailyWords, stats] = await Promise.all([
      getDailyWords('personal-user', 20),
      getWordStats(),
    ]);

    // 获取最近30天的学习记录
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: records } = await supabase
      .from('word_learning_records')
      .select('*')
      .eq('user_id', 'personal-user')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    // 按日期聚合
    const dateMap = new Map<string, { learned: number; reviewed: number }>();

    (records || []).forEach(r => {
      const date = r.created_at?.split('T')[0] || '';
      if (!dateMap.has(date)) {
        dateMap.set(date, { learned: 0, reviewed: 0 });
      }
      const day = dateMap.get(date)!;
      if (r.action === 'mastered' || r.action === 'learned') {
        day.learned++;
      } else if (r.action === 'reviewed') {
        day.reviewed++;
      }
    });

    // 转换为数组并排序
    const dailyRecords = Array.from(dateMap.entries())
      .map(([date, stats]) => ({
        date,
        learned: stats.learned,
        reviewed: stats.reviewed,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      newWords: dailyWords.newWords,
      reviewWords: dailyWords.reviewWords,
      newCount: dailyWords.newWords.length,
      reviewCount: dailyWords.reviewWords.length,
      stats,
      records: dailyRecords,
    });
  } catch (error) {
    console.error('[API/words/daily] Error:', error);
    return NextResponse.json(
      { success: false, error: '获取今日单词失败' },
      { status: 500 }
    );
  }
}
