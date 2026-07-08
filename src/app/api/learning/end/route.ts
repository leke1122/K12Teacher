import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const USER_ID = 'personal-user';

export async function PUT(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { recordId, endTime } = body;

    if (!recordId) {
      return NextResponse.json({ success: false, error: 'Missing recordId' }, { status: 400 });
    }

    const end_time = endTime ? new Date(endTime) : new Date();

    const { data: existing } = await supabase
      .from('learning_sessions')
      .select('start_time')
      .eq('id', recordId)
      .eq('user_id', USER_ID)
      .single();

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    const startTime = new Date(existing.start_time);
    const durationSeconds = Math.round((end_time.getTime() - startTime.getTime()) / 1000);

    const { error } = await supabase
      .from('learning_sessions')
      .update({
        end_time: end_time.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq('id', recordId)
      .eq('user_id', USER_ID);

    if (error) {
      console.error('[Learning API] end error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, duration: durationSeconds });
  } catch (err) {
    console.error('[Learning API] end exception:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
