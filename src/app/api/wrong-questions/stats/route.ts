import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const USER_ID = 'personal-user';

// 获取今日 00:00:00 UTC 时间
function getTodayStart(): string {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return today.toISOString();
}

export async function GET() {
  try {
    // Supabase 未配置时返回空数据（前端会显示"暂无错题"）
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({
        success: true,
        total: 0,
        today: 0,
        unmastered: 0,
        bySubject: {},
        source: 'local',
      });
    }

    // 查询所有错题（按 user_id 过滤）
    const { data: questions, error } = await supabase
      .from('wrong_questions')
      .select('subject_id, is_mastered, created_at')
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[stats API] 查询错题失败:', error);
      return NextResponse.json(
        { success: false, total: 0, today: 0, unmastered: 0, bySubject: {}, source: 'supabase' },
        { status: 500 }
      );
    }

    // 统计数据
    const total = questions?.length || 0;
    const todayStart = getTodayStart();
    const today = questions?.filter(q => q.created_at >= todayStart).length || 0;
    const unmastered = questions?.filter(q => !q.is_mastered).length || 0;

    // 按学科分组
    const bySubject: Record<string, number> = {};
    questions?.forEach(q => {
      if (q.subject_id) {
        bySubject[q.subject_id] = (bySubject[q.subject_id] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      total,
      today,
      unmastered,
      bySubject,
      source: 'supabase',
    });
  } catch (error) {
    console.error('[stats API] 异常:', error);
    return NextResponse.json(
      { success: false, total: 0, today: 0, unmastered: 0, bySubject: {} },
      { status: 500 }
    );
  }
}
