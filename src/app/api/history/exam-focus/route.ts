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
    let examFocus: any[] = [];

    // 从Supabase查询
    if (isSupabaseConfigured && supabase) {
      const { data: docxImport } = await supabase
        .from('docx_imports')
        .select('*')
        .eq('unit_id', unitId)
        .limit(1)
        .single();

      if (docxImport?.data) {
        const data = docxImport.data as any;
        examFocus = data.examFocus || [];
        // 按重要性排序
        examFocus.sort((a, b) => {
          const levelA = a.level.includes('★★★') ? 3 : a.level.includes('★★') ? 2 : 1;
          const levelB = b.level.includes('★★★') ? 3 : b.level.includes('★★') ? 2 : 1;
          return levelB - levelA;
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        examFocus,
        total: examFocus.length,
        source: 'docx',
      },
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    });
  }
}
