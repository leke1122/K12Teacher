import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const unitId = searchParams.get('unitId');

  if (!unitId) {
    return NextResponse.json({
      success: false,
      error: '缺少unitId参数',
    });
  }

  try {
    // 先从Supabase查询
    if (isSupabaseConfigured && supabase) {
      const { data: docxImport } = await supabase
        .from('docx_imports')
        .select('*')
        .eq('unit_id', unitId)
        .limit(1)
        .single();

      if (docxImport?.data) {
        const data = docxImport.data as any;
        const tables = data.mustRememberTables || [];
        return NextResponse.json({
          success: true,
          data: {
            tables,
            total: tables.length,
            unitTitle: data.unitTitle,
            source: 'docx',
          },
        });
      }
    }

    return NextResponse.json({
      success: false,
      error: '未找到必背表数据',
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    });
  }
}
