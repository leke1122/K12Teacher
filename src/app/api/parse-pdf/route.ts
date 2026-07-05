import { NextRequest, NextResponse } from 'next/server';

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

// 简化版服务端 PDF 验证接口
// 实际解析工作由客户端 pdf.js 完成
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

    // 仅验证文件格式，不做实际解析
    // 解析工作由客户端使用 pdf.js 完成
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 验证 PDF 文件头
    const header = buffer.slice(0, 5).toString('ascii');
    if (!header.startsWith('%PDF-')) {
      return NextResponse.json({ error: '文件格式无效' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'PDF 验证通过，请在客户端完成解析',
      fileName: file.name,
      fileSize: file.size,
      clientSideParsing: true
    });
  } catch (error) {
    console.error('[PDF验证] 错误:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '验证失败' 
    }, { status: 500 });
  }
}
