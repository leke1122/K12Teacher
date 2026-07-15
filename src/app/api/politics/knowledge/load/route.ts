import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, findDocxImportByUnitId, findDocxImportByUnitTitle } from '@/lib/supabase';
import type { PoliticsParseResult } from '@/lib/politicsDocxParser';
import { POLITICS_UNIT1 } from '@/data/politics/unit1_data';

export async function GET(request: NextRequest) {
  try {
    const unitId = request.nextUrl.searchParams.get('unitId') || '';
    const chapterId = request.nextUrl.searchParams.get('chapterId') || '';

    let docxData: PoliticsParseResult | null = null;
    let importId: string | null = null;
    let source: 'docx_import' | 'local' = 'local';

    const lookupId = unitId || chapterId;
    if (lookupId) {
      const docxImport = await findDocxImportByUnitId(lookupId);
      if (docxImport?.data) {
        docxData = docxImport.data as PoliticsParseResult;
        importId = docxImport.id;
        source = 'docx_import';
      }
    }

    if (!docxData) {
      const found = await findDocxImportByUnitTitle('社会主义从空想到科学');
      if (found?.data) {
        docxData = found.data as PoliticsParseResult;
        importId = found.id;
        source = 'docx_import';
      }
    }

    const data = docxData || POLITICS_UNIT1;

    return NextResponse.json({
      success: true,
      source,
      importId: importId || undefined,
      unitId: data.unitId,
      unitTitle: data.unitTitle,
      overview: data.overview,
      socialForms: data.socialForms,
      concepts: data.concepts,
      timelineEvents: data.timelineEvents,
      causalLinks: data.causalLinks,
      examFocus: data.examFocus,
      keyQuotes: data.keyQuotes,
      summary: data.summary,
    });
  } catch (error) {
    console.error('[politics/knowledge/load] error:', error);
    return NextResponse.json({ success: false, message: '加载失败' }, { status: 500 });
  }
}
