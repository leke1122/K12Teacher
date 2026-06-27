import { NextRequest, NextResponse } from 'next/server';
import { CONCEPT_PAIRS, type ConceptPair } from '@/lib/politicsData';

export async function GET(request: NextRequest) {
  try {
    const group = request.nextUrl.searchParams.get('group') || '';

    let pairs = CONCEPT_PAIRS;
    if (group) {
      pairs = CONCEPT_PAIRS.filter((p) => p.group === group);
    }

    return NextResponse.json({
      success: true,
      data: pairs.map((p) => ({
        id: p.id,
        group: p.group,
        concepts: p.concepts.map((c) => ({
          name: c.name,
          definition: c.definition,
          core: c.core,
          distinction: c.distinction,
          example: c.example,
        })),
        question: p.question,
        options: p.options,
        explanation: p.explanation,
        synthesisQuestion: p.synthesisQuestion,
        synthesisHint: p.synthesisHint,
      })),
    });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { pairId?: string; answer?: string };
    const { pairId, answer } = body;

    const pair = CONCEPT_PAIRS.find((p) => p.id === pairId);
    if (!pair) {
      return NextResponse.json(
        { success: false, message: '未找到该概念辨析组' },
        { status: 404 },
      );
    }

    const correctOption = pair.options.find((o) => o.correct);
    const isCorrect = answer === correctOption?.label;

    return NextResponse.json({
      success: true,
      data: {
        id: pair.id,
        group: pair.group,
        isCorrect,
        correctAnswer: correctOption?.label,
        explanation: pair.explanation,
        synthesisQuestion: pair.synthesisQuestion,
        synthesisHint: pair.synthesisHint,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: '判断失败' },
      { status: 500 },
    );
  }
}
