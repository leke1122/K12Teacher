import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const unitId = searchParams.get('unitId');
  const keyword = searchParams.get('keyword');
  const difficulty = searchParams.get('difficulty');

  // 必须提供unitId参数
  if (!unitId) {
    return NextResponse.json({
      success: false,
      message: '缺少unitId参数'
    }, { status: 400 });
  }

  // 如果Supabase未配置，返回空数据
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      success: true,
      data: {
        events: [],
        total: 0,
        title: '暂无数据',
        dataSource: 'empty',
        message: 'Supabase未配置，请先导入数据'
      }
    });
  }

  try {
    // 查询docx_imports表获取该单元的数据
    const { data: docxImport, error } = await supabase
      .from('docx_imports')
      .select('*')
      .eq('unit_id', unitId)
      .eq('user_id', 'personal-user')
      .single();

    if (error || !docxImport) {
      return NextResponse.json({
        success: true,
        data: {
          events: [],
          total: 0,
          title: '暂无数据',
          dataSource: 'none',
          message: `未找到单元 ${unitId} 的数据，请先导入`
        }
      });
    }

    const docxData = docxImport.data as any;
    
    // 提取events数据
    const sourceEvents = docxData.events || [];
    
    // 转换为TimelineEvent格式
    const events = sourceEvents.map((e: any) => ({
      id: e.id || `event-${Math.random().toString(36).substr(2, 9)}`,
      year: typeof e.year === 'number' ? e.year : parseYear(e.year),
      title: e.title || e.name || '',
      dynasty: e.category || '',
      summary: e.summary || e.description || e.definition || '',
      difficulty: (e.importance >= 4 ? '高频' : '中频') as '高频' | '中频',
      book: '上册' as const,
      unit: docxData.unitTitle || unitId,
      importance: e.importance || 3,
      category: e.category || '',
    }));

    // 关键词搜索
    let filteredEvents = events;
    if (keyword) {
      const lower = keyword.toLowerCase();
      filteredEvents = events.filter((e: any) => 
        e.title.toLowerCase().includes(lower) ||
        e.summary.toLowerCase().includes(lower) ||
        e.category.toLowerCase().includes(lower)
      );
    }

    // 按难度筛选
    if (difficulty === '高频' || difficulty === '中频' || difficulty === '低频') {
      filteredEvents = filteredEvents.filter((e: any) => e.difficulty === difficulty);
    }

    // 按年份排序
    filteredEvents.sort((a: any, b: any) => a.year - b.year);

    return NextResponse.json({
      success: true,
      data: {
        events: filteredEvents,
        total: filteredEvents.length,
        title: docxData.unitTitle || unitId,
        chapterId: 'ln-gaokao-history',
        dataSource: 'docx',
        importId: docxImport.id,
        importedAt: docxImport.imported_at,
      }
    });

  } catch (err) {
    console.error('[timeline-data] 查询失败:', err);
    return NextResponse.json({
      success: false,
      message: '查询失败',
      error: err instanceof Error ? err.message : '未知错误'
    }, { status: 500 });
  }
}

function parseYear(yearStr: string | number): number {
  if (typeof yearStr === 'number') return yearStr;
  if (!yearStr) return 0;
  if (yearStr.includes('前')) {
    const num = parseInt(yearStr.replace(/[^0-9]/g, ''), 10);
    return -num;
  }
  return parseInt(yearStr.replace(/[^0-9]/g, ''), 10) || 0;
}
