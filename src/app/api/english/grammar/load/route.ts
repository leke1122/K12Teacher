import { NextRequest, NextResponse } from 'next/server';
import { GRAMMAR_STAGES, ALL_GRAMMAR_POINTS } from '@/data/grammarData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const category = searchParams.get('category');

    let data = ALL_GRAMMAR_POINTS;

    // 按阶段过滤
    if (stage) {
      const stageNum = parseInt(stage);
      data = data.filter(p => p.stage === stageNum);
    }

    // 按分类过滤
    if (category && category !== '全部') {
      data = data.filter(p => p.category === category);
    }

    // 按阶段分组（如果没指定阶段）
    let grouped = null;
    if (!stage) {
      grouped = GRAMMAR_STAGES.map(s => ({
        ...s,
        points: data.filter(p => p.stage === s.stage),
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        points: data,
        grouped,
        total: data.length,
      },
    });
  } catch (error) {
    console.error('[API english/grammar/load]', error);
    return NextResponse.json(
      { success: false, message: '加载失败' },
      { status: 500 }
    );
  }
}
