import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      success: false,
      error: 'Supabase未配置',
      configured: false,
    });
  }

  try {
    // 检查所有docx_imports记录
    const { data: allData, error: allError } = await supabase
      .from('docx_imports')
      .select('id, user_id, unit_id, unit_title, concepts_count, events_count, imported_at')
      .order('imported_at', { ascending: false })
      .limit(10);

    // 检查personal-user的记录
    const { data: personalData, error: personalError } = await supabase
      .from('docx_imports')
      .select('id, unit_id, unit_title, concepts_count, events_count')
      .eq('user_id', 'personal-user')
      .order('imported_at', { ascending: false });

    // 检查local-user的记录
    const { data: localData, error: localError } = await supabase
      .from('docx_imports')
      .select('id, unit_id, unit_title, concepts_count, events_count')
      .eq('user_id', 'local-user')
      .order('imported_at', { ascending: false });

    return NextResponse.json({
      success: true,
      configured: true,
      allRecords: {
        count: allData?.length || 0,
        records: allData,
        error: allError?.message,
      },
      personalUserRecords: {
        count: personalData?.length || 0,
        records: personalData,
        error: personalError?.message,
      },
      localUserRecords: {
        count: localData?.length || 0,
        records: localData,
        error: localError?.message,
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
