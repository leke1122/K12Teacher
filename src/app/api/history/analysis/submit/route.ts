import { NextRequest, NextResponse } from 'next/server';
import { setServerData } from '@/lib/serverStorage';

export interface SubmitAnalysisRequest {
  sourceId: string;
  answer: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as SubmitAnalysisRequest;
    const { sourceId, answer, userId = 'guest' } = body;

    if (!sourceId || !answer?.trim()) {
      return NextResponse.json(
        { success: false, message: '参数不完整' },
        { status: 400 },
      );
    }

    // 简化的提交逻辑：保存用户答案
    const submission = {
      id: `submission_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sourceId,
      userId,
      answer: answer.trim(),
      submittedAt: new Date().toISOString(),
    };

    setServerData(
      `analysis_submission_${userId}_${sourceId}`,
      submission,
    );

    return NextResponse.json({
      success: true,
      message: '答案已提交',
      data: {
        submissionId: submission.id,
      },
    });
  } catch (error) {
    console.error('提交历史分析答案失败:', error);
    return NextResponse.json(
      { success: false, message: '提交失败' },
      { status: 500 },
    );
  }
}
