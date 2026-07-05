/**
 * 获取单词学习统计 API
 * GET /api/words/stats
 */

import { NextResponse } from 'next/server';
import { getWordStats } from '@/lib/wordService';

export async function GET() {
  try {
    const stats = await getWordStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[API/words/stats] Error:', error);
    return NextResponse.json(
      { success: false, error: '获取统计失败' },
      { status: 500 }
    );
  }
}
