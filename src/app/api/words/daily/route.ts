/**
 * 获取今日待学单词和学习记录 API
 * GET /api/words/daily
 */

import { NextResponse } from 'next/server';
import { getDailyWords, getWordStats } from '@/lib/wordService';

export async function GET() {
  try {
    const [dailyWords, stats] = await Promise.all([
      getDailyWords('personal-user', 20),
      getWordStats(),
    ]);

    // 获取最近30天的学习记录
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // TODO: 从 wordService 获取学习记录
    // 暂时返回空记录
    const dailyRecords: { date: string; learned: number; reviewed: number }[] = [];

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
