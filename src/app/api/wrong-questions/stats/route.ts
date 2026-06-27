import { NextRequest, NextResponse } from 'next/server';
import { getWrongQuestions, WrongQuestion } from '@/lib/dataSync';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subjectId = searchParams.get('subject') || undefined;

  try {
    const result = await getWrongQuestions(subjectId);
    const questions: WrongQuestion[] = result.data || [];

    const today = new Date().toDateString();
    const todayQuestions = questions.filter((q) => q.createdAt && new Date(q.createdAt).toDateString() === today);
    const unmastered = questions.filter((q) => !q.mastered);

    // 按学科统计
    const bySubject: Record<string, number> = {};
    questions.forEach((q) => {
      bySubject[q.subjectId] = (bySubject[q.subjectId] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      total: questions.length,
      today: todayQuestions.length,
      unmastered: unmastered.length,
      bySubject,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取错题统计失败', total: 0, today: 0, unmastered: 0, bySubject: {} },
      { status: 500 }
    );
  }
}
