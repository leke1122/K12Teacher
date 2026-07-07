import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

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

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);

    const numPages = data.numpages;
    const totalChars = data.text.length;
    const avgCharsPerPage = Math.max(1, Math.floor(totalChars / numPages));

    console.log('[PDF分析] 文件:', file.name);
    console.log('[PDF分析] 总页数:', numPages);
    console.log('[PDF分析] 总字符数:', totalChars);
    console.log('[PDF分析] 每页平均字符:', avgCharsPerPage);

    // 分析每页内容
    const pageAnalysis: { page: number; charCount: number; preview: string; hasContent: boolean }[] = [];
    for (let i = 0; i < Math.min(numPages, 20); i++) {
      const start = i * avgCharsPerPage;
      const end = i === numPages - 1 ? totalChars : (i + 1) * avgCharsPerPage;
      const content = data.text.substring(start, end).trim();
      const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
      const hasChinese = chineseChars > 50;

      pageAnalysis.push({
        page: i + 1,
        charCount: content.length,
        preview: content.substring(0, 100),
        hasContent: hasChinese
      });
    }

    // 特别检查第10-13页
    const keyPages = [10, 11, 12, 13];
    const keyPageContent: Record<number, string> = {};
    for (const p of keyPages) {
      const idx = p - 1;
      const start = idx * avgCharsPerPage;
      const end = idx === numPages - 1 ? totalChars : (idx + 1) * avgCharsPerPage;
      const content = data.text.substring(start, end);
      keyPageContent[p] = content.substring(0, 500);
    }

    return NextResponse.json({
      fileName: file.name,
      totalPages: numPages,
      totalChars,
      avgCharsPerPage,
      pagesWithContent: pageAnalysis.filter(p => p.hasContent).length,
      pageAnalysis,
      keyPageContent,
      // 检查关键字
      keyTermsCheck: {
        page10HasJiehe: keyPageContent[10]?.includes('集合') || keyPageContent[10]?.includes('集 合'),
        page11HasDingxing: keyPageContent[11]?.includes('确定性'),
        page11HasHuxing: keyPageContent[11]?.includes('互异性'),
        page11HasWuxu: keyPageContent[11]?.includes('无序性'),
        page11HasN: keyPageContent[11]?.includes('自然数集') || keyPageContent[11]?.includes('N'),
      }
    });
  } catch (error) {
    console.error('[PDF分析] 错误:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}
