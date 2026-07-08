import { NextRequest, NextResponse } from 'next/server';
import { getTextbook as getSupabaseTextbook, isSupabaseConfigured } from '@/lib/supabase';
import { getTextbookPDF, getTextbooks } from '@/lib/textbookStorage.server';

export const dynamic = 'force-dynamic';

// GET /api/textbook/pdf?textbookId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const textbookId = searchParams.get('textbookId');

    if (!textbookId) {
      return NextResponse.json({ success: false, error: '缺少 textbookId' }, { status: 400 });
    }

    console.log('[API textbook/pdf] 查询 PDF:', textbookId, 'supabase:', isSupabaseConfigured);
    let textbook = await getSupabaseTextbook(textbookId);

    if (!textbook) {
      console.log('[API textbook/pdf] Supabase未找到，回退到本地存储');
      const localPdf = getTextbookPDF(textbookId);
      if (localPdf) {
        textbook = {
          id: localPdf.textbookId,
          textbook_id: localPdf.textbookId,
          subject_id: localPdf.subjectId || '',
          textbook_name: localPdf.fileName,
          file_name: localPdf.fileName,
          total_pages: localPdf.totalPages,
          full_text: localPdf.fullText,
          pages: localPdf.pages,
          uploaded_at: localPdf.uploadedAt,
        };
      } else {
        const subjectId = textbookId.includes('_') ? textbookId.slice(0, textbookId.lastIndexOf('_')) : '';
        const localTextbooks = subjectId ? getTextbooks(subjectId) : [];
        const localTb = localTextbooks.find(t => t.id === textbookId);
        if (localTb) {
          textbook = localTb;
        }
      }
    }

    if (!textbook) {
      console.log('[API textbook/pdf] 未找到教材:', textbookId);
      return NextResponse.json({ success: false, error: '未找到教材', textbookId }, { status: 404 });
    }

    const pdf = {
      full_text: textbook.full_text || textbook.fullText,
      pages: textbook.pages || [],
      fullText: textbook.full_text || textbook.fullText,
    };

    console.log('[API textbook/pdf] 返回 PDF:', {
      fullTextLength: pdf.full_text?.length || 0,
      pagesCount: pdf.pages?.length || 0,
    });

    return NextResponse.json({ success: true, pdf });
  } catch (error) {
    console.error('[API textbook/pdf] error:', error);
    return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 });
  }
}
