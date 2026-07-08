/**
 * 批量获取单词掌握度 API
 * GET /api/words/mastery/batch?ids=xxx&ids=yyy
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBatchMastery } from '@/lib/wordService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.getAll('ids');

    if (ids.length === 0) {
      return NextResponse.json({ success: true, masteries: [] });
    }

    const masteryMap = await getBatchMastery(ids);
    const masteries = Array.from(masteryMap.entries()).map(([word_id, m]) => ({
      word_id,
      level: m.mastery_level,
      reviewCount: m.review_count,
      nextReview: m.next_review,
    }));

    return NextResponse.json({ success: true, masteries });
  } catch (error) {
    console.error('[API/words/mastery/batch] Error:', error);
    return NextResponse.json(
      { success: false, error: '获取掌握度失败' },
      { status: 500 }
    );
  }
}
