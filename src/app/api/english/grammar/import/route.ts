import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const USER_ID = 'personal-user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { docxText, apiKey } = body;

    if (!docxText || typeof docxText !== 'string') {
      return NextResponse.json({ success: false, message: '缺少文档内容' }, { status: 400 });
    }

    // TODO: 调用 grammarDocxParser 解析文档
    // 目前先返回成功，实际解析逻辑可后续扩展
    console.log('[API english/grammar/import] 接收文档长度:', docxText.length);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('docx_imports')
        .upsert({
          user_id: USER_ID,
          subject: 'english',
          type: 'grammar',
          unit_id: 'grammar',
          content: docxText,
          imported_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,subject,type,unit_id',
        });

      if (error) {
        console.error('[API english/grammar/import] 保存失败:', error);
        return NextResponse.json({ success: false, message: '保存失败' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: '文档导入成功',
      stats: {
        textLength: docxText.length,
        importedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API english/grammar/import]', error);
    return NextResponse.json({ success: false, message: '导入失败' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: false, message: 'Supabase未配置' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('docx_imports')
      .select('content, imported_at')
      .eq('user_id', USER_ID)
      .eq('subject', 'english')
      .eq('type', 'grammar')
      .eq('unit_id', 'grammar')
      .single();

    if (error && (error as any)?.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data ? { content: data.content, importedAt: data.imported_at } : null,
    });
  } catch (error) {
    console.error('[API english/grammar/import GET]', error);
    return NextResponse.json({ success: false, message: '查询失败' }, { status: 500 });
  }
}
