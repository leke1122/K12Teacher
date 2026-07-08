/**
 * 获取单词列表 API
 * GET /api/words/list?page=1&limit=20&frequency=high&status=all&search=abc
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWords, getWordStats } from '@/lib/wordService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const frequency = searchParams.get('frequency') as 'high' | 'medium' | 'low' | 'all' || 'all';
    const status = searchParams.get('status') as 'all' | 'learned' | 'mastered' | 'unlearned' | 'unmastered' || 'all';
    const search = searchParams.get('search') || '';

    const [wordsResult, stats] = await Promise.all([
      getWords({ page, limit, frequency, status, search }),
      getWordStats(),
    ]);

    return NextResponse.json({
      success: true,
      words: wordsResult.words,
      total: wordsResult.total,
      stats,
      page,
      limit,
    });
  } catch (error) {
    console.error('[API/words/list] Error:', error);
    return NextResponse.json(
      { success: false, error: '获取单词列表失败' },
      { status: 500 }
    );
  }
}
