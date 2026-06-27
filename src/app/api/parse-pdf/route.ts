import { NextRequest, NextResponse } from 'next/server';
import { fixMathSymbols } from '@/lib/pdf-utils';

interface PageContent {
  pageNumber: number;
  content: string;
}

interface ParseResult {
  fileName: string;
  totalPages: number;
  pages: PageContent[];
  fullText: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '未上传文件' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: '请上传PDF文件' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: '文件过大，请上传小于50MB的PDF' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: '文件为空' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);

    const textLength = data.text.trim().replace(/\s/g, '').length;
    if (textLength < 100) {
      return NextResponse.json({
        error: '此PDF可能为扫描版（无文字层），无法直接解析。请上传文字版PDF。',
        isScanned: true,
      }, { status: 422 });
    }

    const numPages = data.numpages;
    const totalChars = data.text.length;
    const avgCharsPerPage = Math.max(1, Math.floor(totalChars / numPages));

    const pages: PageContent[] = [];
    for (let i = 0; i < numPages; i++) {
      const start = i * avgCharsPerPage;
      const end = i === numPages - 1 ? totalChars : (i + 1) * avgCharsPerPage;
      const rawContent = data.text.substring(start, end).trim();
      pages.push({
        pageNumber: i + 1,
        content: fixMathSymbols(rawContent),
      });
    }

    const fullText = pages
      .map((page) => `===== Page ${page.pageNumber} =====\n${page.content}`)
      .join('\n\n');

    const result: ParseResult = {
      fileName: file.name,
      totalPages: numPages,
      pages,
      fullText,
    };

    console.log(`[PDF解析] 成功: ${file.name}, ${numPages}页, 文本长度: ${fullText.length}`);
    console.log(`[PDF解析] 第1页预览: ${pages[0]?.content.slice(0, 100)}`);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[PDF解析] 错误:', error);

    const errorMessage = error instanceof Error ? error.message : '未知错误';

    if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
      return NextResponse.json({ error: 'PDF文件已加密，请解密后重试' }, { status: 400 });
    }

    if (errorMessage.includes('Invalid PDF') || errorMessage.includes('Could not parse')) {
      return NextResponse.json({ error: '文件格式无效或已损坏，请确认是有效的PDF文件' }, { status: 400 });
    }

    return NextResponse.json({ error: `PDF解析失败: ${errorMessage}` }, { status: 500 });
  }
}
