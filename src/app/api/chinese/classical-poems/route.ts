import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: true, data: [] });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    let query = supabase.from('classical_poems').select('*').order('created_at', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed to load poems', error);
      return NextResponse.json({ success: false, message: '加载失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('classical-poems list error', error);
    return NextResponse.json({ success: false, message: '加载失败' }, { status: 500 });
  }
}
