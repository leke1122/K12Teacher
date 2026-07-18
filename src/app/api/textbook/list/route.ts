import { NextRequest, NextResponse } from 'next/server';
import { getTextbooks as getSupabaseTextbooks, isSupabaseConfigured } from '@/lib/supabase';
import { getTextbooks as getLocalTextbooks } from '@/lib/textbookStorage.server';
import { Textbook } from '@/types/chapter';

export const dynamic = 'force-dynamic';

// GET /api/textbook/list?subjectId=history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ success: false, error: '缺少 subjectId' }, { status: 400 });
    }

    console.log('[API textbook/list] 查询教材:', subjectId, 'supabase:', isSupabaseConfigured);
    let textbooks: Textbook[] = [];

    const supabaseTextbooks = await getSupabaseTextbooks(subjectId);
    if (supabaseTextbooks && supabaseTextbooks.length > 0) {
      // 将 Supabase 数据转换为前端需要的格式
      textbooks = supabaseTextbooks.map((t: any) => ({
        id: t.textbook_id,
        name: t.textbook_name,
        grade: '高一',
        fileName: t.file_name || t.textbook_id + '.pdf',
        totalPages: t.total_pages || 0,
        uploadedAt: t.uploaded_at,
        isActive: false,
        chaptersCount: Array.isArray(t.chapters) ? t.chapters.length : 0,
      }));
    }

    if (textbooks.length === 0) {
      console.log('[API textbook/list] Supabase无数据，回退到本地存储');
      textbooks = getLocalTextbooks(subjectId);
    }

    console.log('[API textbook/list] 查询结果:', textbooks.length, '本教材');
    return NextResponse.json({ success: true, textbooks });
  } catch (error) {
    console.error('[API textbook/list] error:', error);
    return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 });
  }
}
