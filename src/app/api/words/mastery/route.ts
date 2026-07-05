/**
 * 更新单词掌握度 API
 * POST /api/words/mastery
 * Body: { wordId: string, action: 'learned' | 'reviewed' | 'mastered' | 'forgotten' | 'skipped' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateMastery, recordLearningAction, getWordMastery } from '@/lib/wordService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wordId, action, duration } = body;

    if (!wordId || !action) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const validActions = ['learned', 'reviewed', 'mastered', 'forgotten', 'skipped'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: '无效的操作类型' },
        { status: 400 }
      );
    }

    let success = false;
    if (action === 'skipped') {
      // 跳过只记录行为，不更新掌握度
      await recordLearningAction(wordId, 'skipped', duration || 0);
      success = true;
    } else {
      success = await updateMastery(wordId, action);
    }

    // 获取更新后的掌握度
    const mastery = await getWordMastery(wordId);

    return NextResponse.json({
      success,
      mastery: mastery ? {
        level: mastery.mastery_level,
        reviewCount: mastery.review_count,
        nextReview: mastery.next_review,
      } : null,
    });
  } catch (error) {
    console.error('[API/words/mastery] Error:', error);
    return NextResponse.json(
      { success: false, error: '更新掌握度失败' },
      { status: 500 }
    );
  }
}
