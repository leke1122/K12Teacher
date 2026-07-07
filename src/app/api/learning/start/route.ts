import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const USER_ID = 'personal-user';

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      subjectId,
      subjectName,
      activityType,
      chapterId = null,
      sectionId = null,
      activityDetail = {},
    } = body;

    if (!subjectId || !activityType) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('learning_records')
      .insert({
        user_id: USER_ID,
        subject_id: subjectId,
        subject_name: subjectName || subjectId,
        activity_type: activityType,
        chapter_id: chapterId,
        section_id: sectionId,
        activity_detail: activityDetail,
        start_time: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Learning API] start error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, recordId: data.id });
  } catch (err) {
    console.error('[Learning API] start exception:', err);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
