import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { parsePoliticsDocx, type PoliticsParseResult } from '@/lib/politicsDocxParser';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { setServerData } from '@/lib/serverStorage';

const USER_ID = 'personal-user';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const unitId = formData.get('unitId') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: '未接收到文件' }, { status: 400 });
    }

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      return NextResponse.json({ success: false, message: '仅支持 .docx 或 .doc 格式的文件' }, { status: 400 });
    }

    console.log('[politics/import-docx] 开始导入:', file.name);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extractResult = await mammoth.extractRawText({ buffer });
    const rawText = extractResult.value;

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json({ success: false, message: '文档内容过少或无法读取' }, { status: 400 });
    }

    const parsedData = parsePoliticsDocx(rawText, file.name);
    if (unitId) parsedData.unitId = unitId;

    const importId = `politics_docx_import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: insertError } = await supabase
          .from('docx_imports')
          .upsert({
            id: importId,
            user_id: USER_ID,
            file_name: file.name,
            file_size: file.size,
            unit_id: parsedData.unitId,
            textbook_id: 'politics-docx',
            unit_title: parsedData.unitTitle,
            page_range: '',
            data: parsedData as unknown as Record<string, unknown>,
            concepts_count: parsedData.concepts.length,
            events_count: parsedData.timelineEvents.length,
            links_count: parsedData.causalLinks.length,
            exam_focus_count: parsedData.examFocus.length,
            imported_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
          });

        if (insertError) {
          console.error('[politics/import-docx] Supabase insert error:', insertError);
          setServerData(importId, parsedData);
        } else {
          console.log('[politics/import-docx] 已保存到 Supabase, id:', importId);
        }
      } catch (supabaseError) {
        console.error('[politics/import-docx] Supabase error:', supabaseError);
        setServerData(importId, parsedData);
      }
    } else {
      setServerData(importId, parsedData);
      console.log('[politics/import-docx] 已保存到 serverStorage, key:', importId);
    }

    return NextResponse.json({
      success: true,
      message: '导入成功',
      importId,
      unitId: parsedData.unitId,
      stats: {
        concepts: parsedData.concepts.length,
        events: parsedData.timelineEvents.length,
        links: parsedData.causalLinks.length,
        examFocus: parsedData.examFocus.length,
      },
      unitTitle: parsedData.unitTitle,
      summary: parsedData.summary,
      preview: parsedData.concepts.slice(0, 5).map(c => ({
        name: c.name,
        category: c.category,
        importance: c.importance,
      })),
    });
  } catch (error) {
    console.error('[politics/import-docx] 导入失败:', error);
    return NextResponse.json({
      success: false,
      message: '导入失败：' + (error instanceof Error ? error.message : '未知错误'),
    }, { status: 500 });
  }
}

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ success: true, imports: [], source: 'local' });
  }

  try {
    const { data, error } = await supabase
      .from('docx_imports')
      .select('id, file_name, unit_title, page_range, concepts_count, events_count, imported_at')
      .eq('user_id', USER_ID)
      .eq('textbook_id', 'politics-docx')
      .order('imported_at', { ascending: false });

    if (error) {
      console.error('[politics/import-docx] 查询失败:', error);
      return NextResponse.json({ success: false, message: '查询失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, imports: data || [], source: 'supabase' });
  } catch (error) {
    console.error('[politics/import-docx] GET error:', error);
    return NextResponse.json({ success: false, message: '查询失败' }, { status: 500 });
  }
}
