import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const USER_ID = 'personal-user';

export async function GET(
  request: NextRequest,
  { params }: { params: { unitId: string } }
) {
  const unitId = params.unitId;

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ success: false, error: '数据库未配置' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('docx_imports')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('unit_id', unitId)
      .single();

    if (error) {
      console.error('查询失败:', error);
      return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: '未找到该单元' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.unit_id,
        unitTitle: data.unit_title,
        textbookId: data.textbook_id,
        data: data.data || {}
      }
    });
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
