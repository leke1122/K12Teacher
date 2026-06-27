import { NextRequest, NextResponse } from 'next/server';
import { ESSAY_QUESTIONS, type EssayQuestion } from '@/lib/politicsData';

export async function GET(request: NextRequest) {
  try {
    const difficulty = request.nextUrl.searchParams.get('difficulty') || '';

    let items = ESSAY_QUESTIONS;
    if (difficulty) {
      items = items.filter((item) => item.difficulty === difficulty);
    }

    return NextResponse.json({
      success: true,
      data: items.map((item) => ({
        id: item.id,
        title: item.title,
        scenario: item.scenario,
        requirements: item.requirements,
        scoringCriteria: item.scoringCriteria,
        referenceAnswer: item.referenceAnswer,
        improvementTips: item.improvementTips,
        difficulty: item.difficulty,
      })),
    });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      questionId?: string;
      answer?: string;
    };
    const { questionId, answer } = body;

    const question = ESSAY_QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { success: false, message: '未找到该论述题' },
        { status: 404 },
      );
    }

    const score = evaluateEssay(answer || '', question);

    return NextResponse.json({
      success: true,
      data: {
        id: question.id,
        title: question.title,
        score,
        referenceAnswer: question.referenceAnswer,
        improvementTips: question.improvementTips,
        userAnswer: answer || '',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: '评分失败' },
      { status: 500 },
    );
  }
}

function evaluateEssay(answer: string, question: EssayQuestion): number {
  if (!answer.trim()) return 0;

  const text = answer.toLowerCase();
  let score = 0;
  const maxScore = 20;

  const criteria = question.scoringCriteria;

  if (text.length > 50) score += 4;
  if (criteria.viewpoint.split('、').some((kw) => text.includes(kw))) score += 4;
  if (criteria.theory.split('、').some((kw) => text.includes(kw))) score += 4;
  if (criteria.material.split('、').some((kw) => text.includes(kw))) score += 4;
  if (criteria.conclusion && text.includes(criteria.conclusion.split('、')[0])) score += 2;
  if (criteria.terminology && text.includes(criteria.terminology.split('、')[0])) score += 2;

  return Math.min(score, maxScore);
}
