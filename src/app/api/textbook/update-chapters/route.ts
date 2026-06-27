import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// POST /api/textbook/update-chapters
// 更新教材的章节数据
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { textbookId, chapters, subjectId = 'history' } = body;

    if (!textbookId) {
      return NextResponse.json({ success: false, error: '缺少 textbookId' }, { status: 400 });
    }

    if (!Array.isArray(chapters)) {
      return NextResponse.json({ success: false, error: 'chapters 必须是数组' }, { status: 400 });
    }

    console.log('[API textbook/update-chapters] 更新章节:', textbookId, 'subject:', subjectId, '章节数:', chapters.length);

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: false, error: 'Supabase 未配置' }, { status: 500 });
    }

    // 直接使用 upsert 更新 chapters 字段
    const { error } = await supabase
      .from('textbook_cache')
      .upsert({
        user_id: 'personal-user',
        textbook_id: textbookId,
        subject_id: subjectId,
        chapters,
        uploaded_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,textbook_id',
      });

    if (error) {
      console.error('[API textbook/update-chapters] 更新失败:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('[API textbook/update-chapters] 更新成功');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API textbook/update-chapters] 错误:', error);
    return NextResponse.json(
      { success: false, error: '更新失败' },
      { status: 500 }
    );
  }
}
