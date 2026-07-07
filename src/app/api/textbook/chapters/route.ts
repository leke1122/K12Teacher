import { NextRequest, NextResponse } from 'next/server';
import { getTextbook } from '@/lib/supabase';

// GET /api/textbook/chapters?textbookId=history_1234567890
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const textbookId = searchParams.get('textbookId');

    if (!textbookId) {
      return NextResponse.json({ success: false, error: '缺少 textbookId' }, { status: 400 });
    }

    console.log('[API textbook/chapters] 查询章节:', textbookId);
    const textbook = await getTextbook(textbookId);

    if (!textbook) {
      console.log('[API textbook/chapters] 未找到教材');
      return NextResponse.json({ success: false, error: '未找到教材' }, { status: 404 });
    }

    console.log('[API textbook/chapters] 章节数量:', textbook.chapters?.length || 0);
    return NextResponse.json({ success: true, chapters: textbook.chapters || [] });
  } catch (error) {
    console.error('[API textbook/chapters] error:', error);
    return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 });
  }
}
