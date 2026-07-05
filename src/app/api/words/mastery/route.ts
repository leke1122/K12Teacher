/**
 * 更新单词掌握度 API
 * POST /api/words/mastery
 * Body: { wordId: string, action: 'learned' | 'reviewed' | 'mastered' | 'forgotten' | 'skipped' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateMastery, recordLearningAction, getWordMastery } from '@/lib/wordService';

export async function POST(request: NextRequest) {
  console.log('[API/words/mastery] Request received');
  
  try {
    const body = await request.json();
    const { wordId, action, duration } = body;
    
    console.log('[API/words/mastery] Body:', { wordId, action, duration });

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
      await recordLearningAction(wordId, 'skipped', duration || 0);
      success = true;
    } else {
      console.log('[API/words/mastery] Calling updateMastery...');
      success = await updateMastery(wordId, action);
      console.log('[API/words/mastery] updateMastery result:', success);
    }

    const mastery = await getWordMastery(wordId);
    console.log('[API/words/mastery] Final mastery:', mastery);

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
