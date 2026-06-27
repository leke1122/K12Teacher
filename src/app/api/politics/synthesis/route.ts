import { NextRequest, NextResponse } from 'next/server';
import { SYNTHESIS_CASES, type SynthesisCase } from '@/lib/politicsData';

export async function GET(request: NextRequest) {
  try {
    const module = request.nextUrl.searchParams.get('module') || '';
    const difficulty = request.nextUrl.searchParams.get('difficulty') || '';

    let cases = SYNTHESIS_CASES;
    if (module) {
      cases = cases.filter((c) => c.modules.includes(module as SynthesisCase['modules'][number]));
    }

    return NextResponse.json({
      success: true,
      data: cases.map((c) => ({
        id: c.id,
        title: c.title,
        scenario: c.scenario,
        modules: c.modules,
        questions: c.questions,
        referenceFramework: c.referenceFramework,
        referenceAnswer: c.referenceAnswer,
      })),
    });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { caseId?: string; answer?: string };
    const { caseId, answer } = body;

    const caseItem = SYNTHESIS_CASES.find((c) => c.id === caseId);
    if (!caseItem) {
      return NextResponse.json(
        { success: false, message: '未找到该综合应用案例' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: caseItem.id,
        title: caseItem.title,
        modules: caseItem.modules,
        referenceFramework: caseItem.referenceFramework,
        referenceAnswer: caseItem.referenceAnswer,
        userAnswer: answer || '',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: '提交失败' },
      { status: 500 },
    );
  }
}
