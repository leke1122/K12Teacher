import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const USER_ID = 'personal-user';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const grammarId = searchParams.get('grammarId');

    if (!grammarId) {
      return NextResponse.json({ success: false, message: '缺少grammarId' }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: false, message: 'Supabase未配置' }, { status: 500 });
    }

    // 从docx_imports获取该语法点的例句高频词
    const { data, error } = await supabase
      .from('docx_imports')
      .select('content')
      .eq('user_id', USER_ID)
      .eq('subject', 'english')
      .eq('type', 'grammar')
      .single();

    if (error && (error as any)?.code !== 'PGRST116') {
      throw error;
    }

    // 返回固定的高频词列表（基于grammarData中的keyWords）
    const { ALL_GRAMMAR_POINTS } = await import('@/data/grammarData');
    const point = ALL_GRAMMAR_POINTS.find(p => p.id === grammarId);

    if (!point) {
      return NextResponse.json({ success: false, message: '未找到该语法点' }, { status: 404 });
    }

    const words = point.examples.flatMap(e => e.keyWords).slice(0, 10);

    return NextResponse.json({
      success: true,
      data: words.map(w => ({
        word: w,
        source: `语法·${point.name}`,
        example: point.examples.find(e => e.keyWords.includes(w))?.sentence || '',
      })),
    });
  } catch (error) {
    console.error('[API english/grammar/words GET]', error);
    return NextResponse.json({ success: false, message: '查询失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words, grammarSource } = body;

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ success: false, message: '缺少单词数据' }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: false, message: 'Supabase未配置' }, { status: 500 });
    }

    const records = words.map((w: any) => ({
      user_id: USER_ID,
      word: typeof w === 'string' ? w : w.word,
      meaning: typeof w === 'string' ? '' : (w.meaning || ''),
      source: grammarSource ? `语法·${grammarSource}` : '语法学习',
      added_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('word_mastery')
      .upsert(records, {
        onConflict: 'user_id,word',
      });

    if (error) {
      console.error('[API english/grammar/words POST]', error);
      return NextResponse.json({ success: false, message: '保存失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `已加入 ${records.length} 个单词`,
    });
  } catch (error) {
    console.error('[API english/grammar/words POST]', error);
    return NextResponse.json({ success: false, message: '保存失败' }, { status: 500 });
  }
}
