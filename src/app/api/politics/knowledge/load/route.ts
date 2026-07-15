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

    // 1. 优先从 Supabase 加载 docx 导入数据
    const lookupId = unitId || chapterId;
    if (lookupId) {
      const docxImport = await findDocxImportByUnitId(lookupId);
      if (docxImport?.data) {
        docxData = docxImport.data as PoliticsParseResult;
        importId = docxImport.id;
        source = 'docx_import';
      }
    }

    // 2. 按单元标题查找
    if (!docxData) {
      const found = await findDocxImportByUnitTitle('社会主义从空想到科学');
      if (found?.data) {
        docxData = found.data as PoliticsParseResult;
        importId = found.id;
        source = 'docx_import';
      }
    }

    // 3. 如果 Supabase 有完整数据（包含 socialFormsFull 等），直接返回
    if (docxData) {
      return NextResponse.json({
        success: true,
        source,
        importId: importId || undefined,
        unitId: docxData.unitId,
        unitTitle: docxData.unitTitle,
        overview: docxData.overview,
        socialForms: docxData.socialForms,
        concepts: docxData.concepts,
        timelineEvents: docxData.timelineEvents,
        causalLinks: docxData.causalLinks,
        examFocus: docxData.examFocus,
        keyQuotes: docxData.keyQuotes,
        summary: docxData.summary,
        // 完整数据
        socialFormsFull: docxData.socialFormsFull,
        capitalistCrisis: docxData.capitalistCrisis,
        capitalistWhyDoomed: docxData.capitalistWhyDoomed,
        utopianSocialism: docxData.utopianSocialism,
        scientificSocialism: docxData.scientificSocialism,
        communistManifesto: docxData.communistManifesto,
      });
    }

    // 4. 降级到本地数据
    const data = POLITICS_UNIT1;
    return NextResponse.json({
      success: true,
      source: 'local',
      importId: undefined,
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
      socialFormsFull: data.socialFormsFull,
      capitalistCrisis: data.capitalistCrisis,
      capitalistWhyDoomed: data.capitalistWhyDoomed,
      utopianSocialism: data.utopianSocialism,
      scientificSocialism: data.scientificSocialism,
      communistManifesto: data.communistManifesto,
    });
  } catch (error) {
    console.error('[politics/knowledge/load] error:', error);
    return NextResponse.json({ success: false, message: '加载失败' }, { status: 500 });
  }
}
