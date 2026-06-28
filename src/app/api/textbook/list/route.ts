import { NextRequest, NextResponse } from 'next/server';
import { getTextbooks, getTextbook } from '@/lib/supabase';

// GET /api/textbook/list?subjectId=history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ success: false, error: '缺少 subjectId' }, { status: 400 });
    }

    console.log('[API textbook/list] 查询教材:', subjectId);
    const textbooks = await getTextbooks(subjectId);

    if (!textbooks) {
      console.log('[API textbook/list] Supabase未配置或查询失败');
      return NextResponse.json({ success: true, textbooks: [] });
    }

    console.log('[API textbook/list] 查询结果:', textbooks.length, '本教材');
    return NextResponse.json({ success: true, textbooks });
  } catch (error) {
    console.error('[API textbook/list] error:', error);
    return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 });
  }
}
