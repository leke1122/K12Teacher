import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase 未初始化' });
    }
    
    // 查询所有教材
    const { data: textbooks, error } = await supabase
      .from('textbook_cache')
      .select('textbook_id, textbook_name, total_pages, uploaded_at')
      .order('uploaded_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message });
    }

    // 检查每个教材的 PDF 内容质量
    const results = [];
    for (const tb of textbooks || []) {
      if (!supabase) break;
      const { data: pdfData } = await supabase
        .from('textbook_cache')
        .select('pages, full_text')
        .eq('textbook_id', tb.textbook_id)
        .single();

      if (pdfData && Array.isArray(pdfData.pages) && pdfData.pages.length > 0) {
        // 检查第10页（或第一页）
        const page10 = pdfData.pages.find((p: any) => p.pageNumber === 10) || pdfData.pages[0];
        const rawContent = page10?.content || '';
        
        // 统计乱码情况
        const garbledChars = (rawContent.match(/[\uE000-\uEFFF]/g) || []).length;
        const hasChinese = /[\u4e00-\u9fa5]/.test(rawContent);
        const garbledRatio = rawContent.length > 0 ? (garbledChars / rawContent.length * 100).toFixed(1) : '0';
        
        results.push({
          textbookId: tb.textbook_id,
          name: tb.textbook_name,
          totalPages: tb.total_pages,
          uploadedAt: tb.uploaded_at,
          firstPagePreview: rawContent.substring(0, 200),
          garbledChars,
          garbledRatio: garbledRatio + '%',
          hasChinese,
          quality: garbledRatio === '0.0' && hasChinese ? '良好' : garbledChars > 50 ? '严重乱码' : '轻微乱码'
        });
      } else {
        results.push({
          textbookId: tb.textbook_id,
          name: tb.textbook_name,
          totalPages: tb.total_pages,
          uploadedAt: tb.uploaded_at,
          quality: '无PDF数据'
        });
      }
    }

    return NextResponse.json({
      total: textbooks?.length || 0,
      textbooks: results
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}
