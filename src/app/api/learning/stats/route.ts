import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const USER_ID = 'personal-user';

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({
      success: true,
      totalMinutes: 0,
      recordCount: 0,
      subjects: {},
      dailyMinutes: [],
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'week';

    let startDate: string;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (period === 'today') {
      startDate = new Date().toISOString().split('T')[0];
    } else if (period === 'week') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().split('T')[0];
    } else if (period === 'month') {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      startDate = d.toISOString().split('T')[0];
    } else {
      startDate = '1970-01-01';
    }

    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('user_id', USER_ID)
      .gte('start_time', `${startDate}T00:00:00`)
      .lte('start_time', today.toISOString());

    if (error) {
      console.error('[Learning API] stats error:', error);
      return NextResponse.json({
        success: false,
        totalMinutes: 0,
        recordCount: 0,
        subjects: {},
        dailyMinutes: [],
      });
    }

    const records = data || [];

    // 按学科汇总
    const subjects: Record<string, number> = {};
    records.forEach(r => {
      const key = r.subject_name || r.subject_id || 'other';
      subjects[key] = (subjects[key] || 0) + (r.duration_seconds || 0);
    });

    // 按日期汇总（用于趋势图）
    const dailyMap: Record<string, number> = {};
    records.forEach(r => {
      const date = r.start_time?.split('T')[0] || 'unknown';
      dailyMap[date] = (dailyMap[date] || 0) + (r.duration_seconds || 0);
    });
    const dailyMinutes = Object.entries(dailyMap)
      .map(([date, seconds]) => ({ date, minutes: Math.round(seconds / 60) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const totalSeconds = records.reduce((sum, r) => sum + (r.duration_seconds || 0), 0);

    return NextResponse.json({
      success: true,
      totalMinutes: Math.round(totalSeconds / 60),
      recordCount: records.length,
      subjects,
      dailyMinutes,
    });
  } catch (err) {
    console.error('[Learning API] stats exception:', err);
    return NextResponse.json({
      success: true,
      totalMinutes: 0,
      recordCount: 0,
      subjects: {},
      dailyMinutes: [],
    });
  }
}
