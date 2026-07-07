import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const USER_ID = 'personal-user';

export async function GET(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ success: false, records: [], total: 0 }, { status: 200 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const subject = searchParams.get('subject');

    let query = supabase
      .from('learning_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', USER_ID)
      .order('start_time', { ascending: false });

    if (startDate) {
      query = query.gte('start_time', `${startDate}T00:00:00`);
    }
    if (endDate) {
      query = query.lte('start_time', `${endDate}T23:59:59`);
    }
    if (subject && subject !== 'all') {
      query = query.eq('subject_id', subject);
    }

    const { data, error, count } = await query.limit(200);

    if (error) {
      console.error('[Learning API] list error:', error);
      return NextResponse.json({ success: false, records: [], total: 0 }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      records: data || [],
      total: count || 0,
    });
  } catch (err) {
    console.error('[Learning API] list exception:', err);
    return NextResponse.json({ success: false, records: [], total: 0 }, { status: 500 });
  }
}
