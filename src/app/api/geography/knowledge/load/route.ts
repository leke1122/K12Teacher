import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, findDocxImportByUnitId, findDocxImportByUnitTitle } from '@/lib/supabase';
import type { GeographyParseResult } from '@/lib/geographyDocxParser';
import { GEOGRAPHY_CHAPTER1 } from '@/data/geography/chapter1_data';

export async function GET(request: NextRequest) {
  try {
    const unitId = request.nextUrl.searchParams.get('unitId') || '';
    const chapterId = request.nextUrl.searchParams.get('chapterId') || '';

    let docxData: GeographyParseResult | null = null;
    let importId: string | null = null;
    let source: 'docx_import' | 'local' = 'local';

    const lookupId = unitId || chapterId;
    if (lookupId) {
      const docxImport = await findDocxImportByUnitId(lookupId);
      if (docxImport?.data) {
        docxData = docxImport.data as GeographyParseResult;
        importId = docxImport.id;
        source = 'docx_import';
      }
    }

    if (!docxData) {
      const found = await findDocxImportByUnitTitle('宇宙中的地球');
      if (found?.data) {
        docxData = found.data as GeographyParseResult;
        importId = found.id;
        source = 'docx_import';
      }
    }

    const data = docxData || GEOGRAPHY_CHAPTER1;

    return NextResponse.json({
      success: true,
      source,
      importId: importId || undefined,
      unitId: data.unitId,
      unitTitle: data.unitTitle,
      sections: data.sections,
      tables: data.tables,
      concepts: data.concepts,
      timelineEvents: data.timelineEvents,
      causalLinks: data.causalLinks,
      examFocus: data.examFocus,
      imageRefs: data.imageRefs,
      summary: data.summary,
    });
  } catch (error) {
    console.error('[geography/knowledge/load] error:', error);
    return NextResponse.json({ success: false, message: '加载失败' }, { status: 500 });
  }
}
