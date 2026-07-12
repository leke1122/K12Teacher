import { NextRequest, NextResponse } from 'next/server';
import { parseDocxText } from '@/lib/docxImportService';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const USER_ID = 'personal-user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const unitId = String(body.unitId || '').trim();
    const docxText = String(body.docxText || '').trim();

    if (!unitId) {
      return NextResponse.json({ success: false, message: '缺少 unitId' }, { status: 400 });
    }

    if (!docxText || docxText.length < 50) {
      return NextResponse.json({ success: false, message: 'docxText 内容过短，请提供完整文本' }, { status: 400 });
    }

    const parsed = await parseDocxText(docxText, unitId);
    const importId = `docx_import_${unitId}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('docx_imports')
          .upsert({
            id: importId,
            user_id: USER_ID,
            unit_id: unitId,
            unit_title: parsed.unitTitle,
            page_range: parsed.pageRange,
            file_name: `${parsed.unitTitle || unitId}.docx`,
            file_size: docxText.length,
            data: parsed as unknown as Record<string, unknown>,
            concepts_count: parsed.concepts.length,
            events_count: parsed.timelineEvents.length,
            links_count: parsed.causalLinks.length,
            exam_focus_count: parsed.examFocus.length,
            imported_at: new Date().toISOString(),
          }, {
            onConflict: 'unit_id',
          });

        if (error) {
          console.error('[import-docx-text] Supabase upsert error:', error);
          return NextResponse.json({ success: false, message: '写入 docx_imports 失败' }, { status: 500 });
        }
      } catch (err) {
        console.error('[import-docx-text] Supabase error:', err);
        return NextResponse.json({ success: false, message: '写入 docx_imports 异常' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: '导入成功',
      importId,
      unitId,
      unitTitle: parsed.unitTitle,
      pageRange: parsed.pageRange,
      stats: {
        concepts: parsed.concepts.length,
        events: parsed.timelineEvents.length,
        links: parsed.causalLinks.length,
        examFocus: parsed.examFocus.length,
      },
      preview: parsed.concepts.slice(0, 5).map(c => ({
        name: c.name,
        category: c.category,
        importance: c.importance,
      })),
    });
  } catch (error) {
    console.error('[import-docx-text] error:', error);
    return NextResponse.json(
      { success: false, message: '导入失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
