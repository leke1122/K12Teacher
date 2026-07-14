import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ success: false, message: '缺少篇目 ID' }, { status: 400 });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: true, data: null });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from('classical_poems')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Failed to load poem', error);
      return NextResponse.json({ success: false, message: '加载失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || null });
  } catch (error) {
    console.error('classical-poems detail error', error);
    return NextResponse.json({ success: false, message: '加载失败' }, { status: 500 });
  }
}
