/**
 * 错词本 API - 获取和添加错词
 * GET /api/wrong-questions - 获取错词列表
 * POST /api/wrong-questions - 添加错词
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWrongQuestions, addWrongQuestion } from '@/lib/wrongQuestionService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subject') || undefined;

    const questions = await getWrongQuestions('personal-user', subjectId);

    return NextResponse.json({
      success: true,
      questions,
      total: questions.length,
    });
  } catch (error) {
    console.error('[API/wrong-questions] GET Error:', error);
    return NextResponse.json(
      { success: false, error: '获取错词列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId, question, correctAnswer, userAnswer, analysis, difficulty, knowledgePoint } = body;

    if (!subjectId || !question || !correctAnswer) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const id = await addWrongQuestion(
      'personal-user',
      subjectId,
      question,
      correctAnswer,
      userAnswer || '',
      analysis || '',
      difficulty || 'medium',
      knowledgePoint || ''
    );

    return NextResponse.json({
      success: !!id,
      id,
    });
  } catch (error) {
    console.error('[API/wrong-questions] POST Error:', error);
    return NextResponse.json(
      { success: false, error: '添加错词失败' },
      { status: 500 }
    );
  }
}
