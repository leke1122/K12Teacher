/**
 * 单词练习数据 API
 * GET /api/words/practice-data
 */

import { NextResponse } from 'next/server';
import { getWordStatsWithMastered } from '@/lib/wordService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await getWordStatsWithMastered('personal-user', 999, 0);

    return NextResponse.json({
      success: true,
      stats: result.stats,
      words: result.masteredWords,
      total: result.masteredWords.length,
    });
  } catch (error) {
    console.error('[API/words/practice-data] Error:', error);
    return NextResponse.json(
      { success: false, error: '获取练习数据失败', words: [], total: 0 },
      { status: 500 }
    );
  }
}
