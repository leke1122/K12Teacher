/**
 * 历史知识点 docx 导入 API
 * 接收用户上传的 docx 文件，解析并存储到 Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { parseDocxTextToKnowledge, type DocxParseResult } from '@/lib/docxParser';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { setServerData } from '@/lib/serverStorage';

const USER_ID = 'personal-user';

export async function POST(request: NextRequest) {
  try {
    // 1. 接收文件
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const textbookId = formData.get('textbookId') as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: '未接收到文件' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      return NextResponse.json(
        { success: false, message: '仅支持 .docx 或 .doc 格式的文件' },
        { status: 400 }
      );
    }

    console.log('[import-docx] 开始导入:', file.name, '大小:', file.size, '字节');

    // 2. 读取文件为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. 用 mammoth 提取纯文本
    const extractResult = await mammoth.extractRawText({ buffer });
    const rawText = extractResult.value;

    if (!rawText || rawText.trim().length < 100) {
      return NextResponse.json(
        { success: false, message: '文档内容过少或无法读取，请检查文件是否损坏' },
        { status: 400 }
      );
    }

    console.log('[import-docx] 提取文本长度:', rawText.length, '字符');

    // 4. 解析为结构化数据
    const parsedData = parseDocxTextToKnowledge(rawText, file.name);

    // 5. 生成存储 ID
    const unitId = `docx_unit_${Date.now()}`;
    const importId = `docx_import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 6. 存储到 Supabase（优先）或 serverStorage
    if (isSupabaseConfigured && supabase) {
      try {
        // 写入 docx_imports 表（新建专用表存储导入的知识点）
        const { error: insertError } = await supabase
          .from('docx_imports')
          .upsert({
            id: importId,
            user_id: USER_ID,
            file_name: file.name,
            file_size: file.size,
            unit_id: unitId,
            textbook_id: textbookId || 'history-docx',
            unit_title: parsedData.unitTitle,
            page_range: parsedData.pageRange,
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
          console.error('[import-docx] Supabase insert error:', insertError);
          // 降级到 serverStorage
          setServerData(importId, parsedData);
        } else {
          console.log('[import-docx] 已保存到 Supabase, id:', importId);
        }
      } catch (supabaseError) {
        console.error('[import-docx] Supabase error:', supabaseError);
        setServerData(importId, parsedData);
      }
    } else {
      // 降级到 serverStorage
      setServerData(importId, parsedData);
      console.log('[import-docx] 已保存到 serverStorage, key:', importId);
    }

    // 7. 返回导入结果
    return NextResponse.json({
      success: true,
      message: '导入成功',
      importId,
      unitId,
      stats: {
        concepts: parsedData.concepts.length,
        events: parsedData.timelineEvents.length,
        links: parsedData.causalLinks.length,
        examFocus: parsedData.examFocus.length,
      },
      unitTitle: parsedData.unitTitle,
      pageRange: parsedData.pageRange,
      summary: parsedData.summary,
      // 返回前几个概念供预览
      preview: parsedData.concepts.slice(0, 5).map(c => ({
        name: c.name,
        category: c.category,
        importance: c.importance,
      })),
    });

  } catch (error) {
    console.error('[import-docx] 导入失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '导入失败：' + (error instanceof Error ? error.message : '未知错误'),
      },
      { status: 500 }
    );
  }
}

// 获取已导入的列表
export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      success: true,
      imports: [],
      source: 'local',
    });
  }

  try {
    const { data, error } = await supabase
      .from('docx_imports')
      .select('id, file_name, unit_title, page_range, concepts_count, events_count, imported_at')
      .eq('user_id', USER_ID)
      .order('imported_at', { ascending: false });

    if (error) {
      console.error('[import-docx] 查询失败:', error);
      return NextResponse.json({ success: false, message: '查询失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imports: data || [],
      source: 'supabase',
    });
  } catch (error) {
    console.error('[import-docx] GET error:', error);
    return NextResponse.json({ success: false, message: '查询失败' }, { status: 500 });
  }
}

// 删除导入
export async function DELETE(request: NextRequest) {
  const importId = request.nextUrl.searchParams.get('id');

  if (!importId) {
    return NextResponse.json({ success: false, message: '缺少导入记录 ID' }, { status: 400 });
  }

  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ success: true, message: '本地模式，无需删除' });
  }

  try {
    const { error } = await supabase
      .from('docx_imports')
      .delete()
      .eq('id', importId)
      .eq('user_id', USER_ID);

    if (error) {
      console.error('[import-docx] 删除失败:', error);
      return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[import-docx] DELETE error:', error);
    return NextResponse.json({ success: false, message: '删除失败' }, { status: 500 });
  }
}
