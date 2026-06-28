import { NextRequest, NextResponse } from 'next/server';
import { deleteTextbookCache } from '@/lib/supabase';

// POST /api/textbook/delete
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { textbookId } = body;

    if (!textbookId) {
      return NextResponse.json({ success: false, error: '缺少 textbookId' }, { status: 400 });
    }

    console.log('[API textbook/delete] 删除教材:', textbookId);
    const success = await deleteTextbookCache(textbookId);

    if (!success) {
      console.warn('[API textbook/delete] Supabase删除失败或未配置');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API textbook/delete] error:', error);
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
  }
}
