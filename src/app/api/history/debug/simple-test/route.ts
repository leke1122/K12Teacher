import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      success: false,
      error: 'Supabase未配置',
      configured: false,
      envCheck: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    });
  }

  try {
    // 测试1: 查询所有记录
    const { data: allData, error: allError } = await supabase
      .from('docx_imports')
      .select('id, user_id, unit_id, unit_title, concepts_count')
      .order('imported_at', { ascending: false })
      .limit(10);

    // 测试2: 查询u1
    const { data: u1Data } = await supabase
      .from('docx_imports')
      .select('id, user_id, unit_id, unit_title, data')
      .eq('unit_id', 'u1')
      .limit(1);

    // 测试3: 查询personal-user
    const { data: personalData } = await supabase
      .from('docx_imports')
      .select('id, unit_id, unit_title')
      .eq('user_id', 'personal-user');

    // 测试4: 查询user_id为null的记录
    const { data: nullUserData } = await supabase
      .from('docx_imports')
      .select('id, user_id, unit_id, unit_title')
      .is('user_id', null);

    return NextResponse.json({
      success: true,
      configured: true,
      allRecordsCount: allData?.length || 0,
      allRecords: allData?.map(r => ({ id: r.id, userId: r.user_id, unitId: r.unit_id, title: r.unit_title?.substring(0, 30) })),
      allError: allError?.message,
      u1Found: !!u1Data?.[0],
      u1Data: u1Data?.[0] ? {
        id: u1Data[0].id,
        userId: u1Data[0].user_id,
        unitId: u1Data[0].unit_id,
        hasData: !!u1Data[0].data,
        dataKeys: u1Data[0].data ? Object.keys(u1Data[0].data) : null,
      } : null,
      personalUserCount: personalData?.length || 0,
      nullUserCount: nullUserData?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  }
}
