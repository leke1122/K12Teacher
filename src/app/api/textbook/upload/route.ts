import { NextRequest, NextResponse } from 'next/server';
import { saveTextbook, saveTextbookPDF } from '@/lib/textbookStorage.server';
import { saveTextbookCache, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/textbook/upload - 检查配置状态
export async function GET() {
  return NextResponse.json({
    supabaseConfigured: isSupabaseConfigured,
    envUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    envKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

// POST /api/textbook/upload
// 保存教材元数据到服务端存储和Supabase
// 服务端存储用于 API 路由读取，客户端仍需保存到 localStorage

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId, name, grade, fileName, totalPages, fullText, pages, chapters } = body;

    if (!subjectId || !name || !fileName) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    const textbookId = `${subjectId}_${Date.now()}`;

    const textbook = {
      id: textbookId,
      name,
      grade: grade || '高一',
      fileName,
      totalPages: totalPages || 0,
      uploadedAt: new Date().toISOString(),
      isActive: false,
      chaptersCount: chapters?.length || 0,
    };

    const pdf = {
      textbookId,
      subjectId,
      fileName,
      totalPages: totalPages || 0,
      fullText,
      pages: pages || [],
      uploadedAt: new Date().toISOString(),
    };

    // 1. 保存到服务端存储（供本地 API 路由使用）
    saveTextbook(subjectId, textbook);
    if (pdf?.fullText) {
      saveTextbookPDF(pdf);
    }

    // 2. 同时保存到 Supabase（供 Vercel 部署使用）
    const supabaseResult = await saveTextbookCache({
      subject_id: subjectId,
      textbook_id: textbookId,
      textbook_name: name,
      file_name: fileName,
      total_pages: totalPages,
      full_text: fullText,
      pages: pages,
      chapters: chapters || [], // 从TXT目录解析的章节数据
      uploaded_at: new Date().toISOString(),
    });

    if (!supabaseResult.success) {
      console.warn('[API textbook/upload] Supabase存储失败:', supabaseResult.error);
    } else {
      console.log('[API textbook/upload] Supabase存储成功:', textbookId, chapters?.length, '个章节');
    }

    // 返回教材元数据给客户端
    return NextResponse.json({
      success: true,
      textbook,
      pdf,
      chapters,
      supabase: supabaseResult.success,
      supabaseConfigured: isSupabaseConfigured,
      supabaseError: supabaseResult.error,
    });
  } catch (error) {
    console.error('[API textbook/upload] error:', error);
    return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 });
  }
}
