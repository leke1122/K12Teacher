/**
 * 更新单词掌握度 API
 * POST /api/words/mastery
 * Body: { wordId: string, action: 'learned' | 'reviewed' | 'mastered' | 'forgotten' | 'skipped' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateMastery, recordLearningAction } from '@/lib/wordService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('[API/words/mastery] Request received');
  console.log('[API/words/mastery] Supabase configured:', isSupabaseConfigured);
  
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
    let errorMessage = '';
    let mastery: { mastery_level: number; review_count: number; next_review: string } | null = null;
    
    if (action === 'skipped') {
      await recordLearningAction(wordId, 'skipped', duration || 0);
      success = true;
    } else {
      console.log('[API/words/mastery] Calling updateMastery...');
      try {
        const result = await updateMastery(wordId, action);
        if (result) {
          success = true;
          mastery = result;
        }
        console.log('[API/words/mastery] updateMastery result:', result);
      } catch (err) {
        errorMessage = err instanceof Error ? err.message : '未知错误';
        console.error('[API/words/mastery] updateMastery error:', err);
      }
    }

    console.log('[API/words/mastery] Final mastery:', mastery);

    return NextResponse.json({
      success,
      error: errorMessage || undefined,
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

/**
 * 测试 Supabase 连接和 RLS
 * GET /api/words/mastery?test=true
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const testMode = url.searchParams.get('test');
  
  if (testMode === 'true' && supabase) {
    console.log('[API/words/mastery] Test mode - checking RLS...');
    
    // 测试插入
    const testWordId = 'test_' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('word_mastery')
      .insert({
        user_id: 'personal-user',
        word_id: testWordId,
        word_text: 'test_word',
        mastery_level: 1,
        review_count: 1,
      })
      .select()
      .single();
    
    console.log('[API/words/mastery] Insert test result:', { data: insertData, error: insertError });
    
    // 清理测试数据
    if (insertData) {
      await supabase
        .from('word_mastery')
        .delete()
        .eq('id', insertData.id);
    }
    
    return NextResponse.json({
      supabaseConfigured: isSupabaseConfigured,
      supabaseHasClient: supabase !== null,
      insertTest: { success: !insertError, error: insertError?.message || null },
    });
  }
  
  return NextResponse.json({ message: 'Use POST to update mastery' });
}
