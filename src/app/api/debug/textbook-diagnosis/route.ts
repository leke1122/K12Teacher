import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { existsServerData } from '@/lib/serverStorage';

/**
 * 诊断接口 - 帮助排查 Supabase 连接和数据问题
 */
export async function GET() {
  const diagnostics = {
    supabase: {
      configured: isSupabaseConfigured,
      hasUrl: !!(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasKey: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      clientCreated: !!supabase,
      urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' 
        : null,
    },
    serverStorage: {
      hasHistoryPdf: existsServerData('pdf_history'),
      hasHistoryChapters: existsServerData('chapters_history'),
      hasHistoryTextbooks: existsServerData('textbooks_history'),
    },
    textbookCache: null as any,
    textbookCacheNoUserId: null as any,
  };

  // 测试 Supabase 连接
  if (isSupabaseConfigured && supabase) {
    // 方法1: 带 user_id 过滤
    try {
      const { data, error, status } = await supabase
        .from('textbook_cache')
        .select('textbook_id, textbook_name, subject_id, user_id, uploaded_at')
        .eq('user_id', 'personal-user')
        .eq('subject_id', 'history')
        .limit(5);
      
      diagnostics.textbookCache = {
        success: !error,
        error: error ? { message: error.message, code: error.code } : null,
        count: data?.length || 0,
        data: data || [],
      };
    } catch (err: any) {
      diagnostics.textbookCache = {
        success: false,
        error: { message: err.message },
        count: 0,
        data: [],
      };
    }

    // 方法2: 不带 user_id 过滤
    try {
      const { data, error } = await supabase
        .from('textbook_cache')
        .select('textbook_id, textbook_name, subject_id, user_id, uploaded_at')
        .eq('subject_id', 'history')
        .limit(5);
      
      diagnostics.textbookCacheNoUserId = {
        success: !error,
        error: error ? { message: error.message, code: error.code } : null,
        count: data?.length || 0,
        data: data || [],
      };
    } catch (err: any) {
      diagnostics.textbookCacheNoUserId = {
        success: false,
        error: { message: err.message },
        count: 0,
        data: [],
      };
    }
  }

  return NextResponse.json(diagnostics);
}
