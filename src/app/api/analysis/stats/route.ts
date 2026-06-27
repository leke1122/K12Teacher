import { NextRequest, NextResponse } from 'next/server';
import { getWrongQuestions } from '@/lib/dataSync';

interface WeakPoint {
  id: string;
  knowledge: string;
  type: string;       // 题型/知识点类型
  subjectId: string;
  chapterId?: string;
  sectionId?: string;
  errorCount: number;
  lastWrong: string;
  accuracy: number;
  suggestion?: string;
}

interface SubjectLossRate {
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  wrongCount: number;
  lossRate: number;  // 0-100
}

interface TypeLossStat {
  type: string;
  count: number;
  percentage: number;
}

// 从本地数据计算失分统计
async function computeLocalStats(grade: string): Promise<{
  weakPoints: WeakPoint[];
  subjectLossRates: SubjectLossRate[];
  typeLossStats: TypeLossStat[];
  weeklyProgress: { date: string; improvedCount: number; totalWeak: number }[];
}> {
  const result = await getWrongQuestions();
  const questions = result.data || [];

  // 按知识点聚合
  const pointMap = new Map<string, WeakPoint>();
  questions.forEach((q: any) => {
    const key = q.knowledge || q.question?.slice(0, 20) || '未知';
    const existing = pointMap.get(key);
    if (existing) {
      existing.errorCount += 1;
      if (q.createdAt && q.createdAt > existing.lastWrong) {
        existing.lastWrong = q.createdAt;
      }
    } else {
      pointMap.set(key, {
        id: `wp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        knowledge: key,
        type: q.type || '综合',
        subjectId: q.subjectId || 'unknown',
        chapterId: q.chapterId,
        sectionId: q.sectionId,
        errorCount: 1,
        lastWrong: q.createdAt || new Date().toISOString(),
        accuracy: 0,
      });
    }
  });

  const weakPoints = Array.from(pointMap.values())
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, 10);

  // 计算各学科失分率
  const subjectStats = new Map<string, { total: number; wrong: number }>();
  questions.forEach((q: any) => {
    const sid = q.subjectId || 'unknown';
    const current = subjectStats.get(sid) || { total: 0, wrong: 0 };
    current.total += 1;
    current.wrong += q.isWrong ? 1 : 0;
    subjectStats.set(sid, current);
  });

  const subjectNames: Record<string, string> = {
    math: '数学', chinese: '语文', english: '英语', politics: '政治',
    history: '历史', geography: '地理', physics: '物理',
    chemistry: '化学', biology: '生物',
  };

  const subjectLossRates: SubjectLossRate[] = Array.from(subjectStats.entries()).map(([sid, s]) => ({
    subjectId: sid,
    subjectName: subjectNames[sid] || sid,
    totalQuestions: s.total,
    wrongCount: s.wrong,
    lossRate: s.total > 0 ? Math.round((s.wrong / s.total) * 100) : 0,
  }));

  // 按题型统计
  const typeStats = new Map<string, number>();
  questions.forEach((q: any) => {
    const type = q.type || '综合';
    typeStats.set(type, (typeStats.get(type) || 0) + 1);
  });

  const totalQuestions = questions.length;
  const typeLossStats: TypeLossStat[] = Array.from(typeStats.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // 模拟每周进步数据
  const weeklyProgress = [
    { date: '本周', improvedCount: 0, totalWeak: weakPoints.length },
    { date: '上周', improvedCount: Math.floor(weakPoints.length * 0.3), totalWeak: weakPoints.length + 2 },
    { date: '两周前', improvedCount: Math.floor(weakPoints.length * 0.2), totalWeak: weakPoints.length + 5 },
  ];

  return { weakPoints, subjectLossRates, typeLossStats, weeklyProgress };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const grade = searchParams.get('grade') || 'grade1';

  try {
    const stats = await computeLocalStats(grade);
    return NextResponse.json({
      success: true,
      grade,
      ...stats,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取失分统计失败' },
      { status: 500 }
    );
  }
}
