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
    const { sessionId, detail } = body;

    if (!sessionId || typeof detail !== 'object') {
      return NextResponse.json({ success: false, error: 'Missing sessionId or detail' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('learning_sessions')
      .update({
        activity_detail: detail as Record<string, unknown>,
      })
      .eq('id', sessionId)
      .eq('user_id', USER_ID)
      .select('id')
      .single();

    if (error) {
      console.error('[Learning API] update error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[Learning API] update exception:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
