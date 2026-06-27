import { NextRequest, NextResponse } from 'next/server';
import { CURRENT_AFFAIRS, type CurrentAffair } from '@/lib/politicsData';
import { setServerData } from '@/lib/serverStorage';

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category') || '';
    const knowledge = request.nextUrl.searchParams.get('knowledge') || '';

    let items: CurrentAffair[] = CURRENT_AFFAIRS;
    if (category) {
      items = items.filter((item) => item.category === category);
    }
    if (knowledge) {
      items = items.filter((item) =>
        item.relatedKnowledge.some((k) => k.includes(knowledge)),
      );
    }

    return NextResponse.json({
      success: true,
      data: items.map((item) => ({
        id: item.id,
        title: item.title,
        date: item.date,
        category: item.category,
        content: item.content,
        relatedKnowledge: item.relatedKnowledge,
        examAngles: item.examAngles,
        questions: item.questions,
      })),
    });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { knowledgePoint?: string };
    const { knowledgePoint } = body;

    const matched = CURRENT_AFFAIRS.filter((item) =>
      item.relatedKnowledge.some((k) =>
        !knowledgePoint || k.includes(knowledgePoint),
      ),
    );

    if (matched.length === 0) {
      return NextResponse.json({
        success: true,
        data: CURRENT_AFFAIRS.slice(0, 2),
        message: '已为你推荐通用时政热点',
      });
    }

    return NextResponse.json({
      success: true,
      data: matched.slice(0, 3),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: '获取时政链接失败' },
      { status: 500 },
    );
  }
}
