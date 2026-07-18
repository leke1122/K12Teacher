/**
 * 函数学习进度 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserMastery } from '@/lib/math/knowledgeGraph';
import { functionGraphNodes } from '@/data/math/functionKnowledgeGraph';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'personal-user';

    const mastery = await getUserMastery(userId);

    const masteredCount = Object.values(mastery).filter(m => m.level === 'mastered').length;
    const learningCount = Object.values(mastery).filter(m => m.level === 'learning').length;
    const totalPractice = Object.values(mastery).reduce((sum, m) => sum + m.practiceCount, 0);

    // 按分类统计
    const categoryStats: Record<string, { total: number; mastered: number }> = {};
    for (const node of functionGraphNodes) {
      if (!categoryStats[node.category]) {
        categoryStats[node.category] = { total: 0, mastered: 0 };
      }
      categoryStats[node.category].total++;
      if (mastery[node.id]?.level === 'mastered') {
        categoryStats[node.category].mastered++;
      }
    }

    // 薄弱点（得分低于60的已掌握知识点）
    const weakNodes = Object.entries(mastery)
      .filter(([, m]) => m.level === 'mastered' && m.score < 60)
      .map(([id]) => {
        const node = functionGraphNodes.find(n => n.id === id);
        return node ? { id: node.id, label: node.label, score: mastery[id].score } : null;
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      stats: {
        totalNodes: functionGraphNodes.length,
        masteredCount,
        learningCount,
        notStartedCount: functionGraphNodes.length - masteredCount - learningCount,
        totalPractice,
        averageScore: masteredCount > 0 
          ? Math.round(Object.values(mastery).filter(m => m.score > 0).reduce((sum, m) => sum + m.score, 0) / masteredCount)
          : 0,
      },
      categoryStats,
      weakNodes,
      recentActivity: Object.entries(mastery)
        .sort(([, a], [, b]) => new Date(b.lastPracticed).getTime() - new Date(a.lastPracticed).getTime())
        .slice(0, 5)
        .map(([id, m]) => ({
          nodeId: id,
          level: m.level,
          score: m.score,
          lastPracticed: m.lastPracticed,
        })),
    });
  } catch (error) {
    console.error('[FunctionProgress] 错误:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
