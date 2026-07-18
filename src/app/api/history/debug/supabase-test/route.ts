import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      success: false,
      error: 'Supabase未配置',
      configured: false,
    });
  }

  try {
    // 测试1：不带user_id过滤
    const { data: allRecords, error: allError } = await supabase
      .from('docx_imports')
      .select('id, user_id, unit_id, unit_title, concepts_count, events_count')
      .order('imported_at', { ascending: false });

    // 测试2：带personal-user过滤
    const { data: personalRecords, error: personalError } = await supabase
      .from('docx_imports')
      .select('id, unit_id, unit_title')
      .eq('user_id', 'personal-user');

    // 测试3：直接查u1
    const { data: u1Record } = await supabase
      .from('docx_imports')
      .select('id, user_id, unit_id, data')
      .eq('unit_id', 'u1')
      .limit(1);

    return NextResponse.json({
      success: true,
      configured: true,
      allRecords: {
        count: allRecords?.length || 0,
        firstFew: allRecords?.slice(0, 3),
        error: allError?.message,
      },
      personalRecords: {
        count: personalRecords?.length || 0,
        error: personalError?.message,
      },
      u1Record: {
        found: !!u1Record?.[0],
        userId: u1Record?.[0]?.user_id,
        hasData: !!u1Record?.[0]?.data,
        dataKeys: u1Record?.[0]?.data ? Object.keys(u1Record[0].data) : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
