import { NextRequest, NextResponse } from 'next/server';
import {
  loadProgress,
  saveProgress,
  updateStepProgress as updateStepProgressAction,
  createDefaultProgress,
  computeOverallProgress,
  type StepKey,
  type StepStatus,
  type HistoryLearningProgress,
} from '@/lib/historyProgress';

export interface ProgressResponse {
  success: boolean;
  data?: HistoryLearningProgress;
  message?: string;
}

export async function GET(request: NextRequest) {
  const subjectId = request.nextUrl.searchParams.get('subjectId') || 'history';
  const chapterId = request.nextUrl.searchParams.get('chapterId') || 'modern-china';

  try {
    const progress = loadProgress(subjectId, chapterId) || createDefaultProgress(subjectId, chapterId);
    return NextResponse.json<ProgressResponse>({ success: true, data: progress });
  } catch {
    return NextResponse.json<ProgressResponse>({ success: false, message: '读取进度失败' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      subjectId?: string;
      chapterId?: string;
      step?: StepKey;
      status?: StepStatus;
    };

    const { subjectId, chapterId, step, status } = body;

    if (!subjectId || !chapterId || !step || !status) {
      return NextResponse.json<ProgressResponse>(
        { success: false, message: '参数不完整' },
        { status: 400 },
      );
    }

    const updated = updateStepProgressAction(subjectId, chapterId, step, status);

    return NextResponse.json<ProgressResponse>({ success: true, data: updated });
  } catch {
    return NextResponse.json<ProgressResponse>(
      { success: false, message: '更新进度失败' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const subjectId = request.nextUrl.searchParams.get('subjectId') || 'history';
  const chapterId = request.nextUrl.searchParams.get('chapterId') || 'modern-china';

  try {
    const fresh = createDefaultProgress(subjectId, chapterId);
    saveProgress(fresh);
    return NextResponse.json<ProgressResponse>({ success: true, data: fresh });
  } catch {
    return NextResponse.json<ProgressResponse>(
      { success: false, message: '重置进度失败' },
      { status: 500 },
    );
  }
}
