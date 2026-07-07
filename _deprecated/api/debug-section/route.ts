import { NextRequest, NextResponse } from 'next/server';
import { getSectionPageRange } from '@/lib/chapterPageMapping';

/**
 * 调试接口：查看指定章节的原始提取内容
 * 用于检查 PDF 内容是否正确提取，以及修复后的内容
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subjectId = searchParams.get('subjectId') || 'math';
  const sectionId = searchParams.get('sectionId') || '1.1.1';

  // 查找页码范围
  const range = getSectionPageRange(subjectId, sectionId);
  if (!range) {
    return NextResponse.json({ error: `未找到章节映射: ${sectionId}` }, { status: 404 });
  }

  // 注意：这个接口需要访问 PDF 数据
  // 由于 PDF 数据存储在客户端 localStorage 中，
  // 这里只能返回页码范围信息
  // 实际内容需要在前端调试

  return NextResponse.json({
    subjectId,
    sectionId,
    pageRange: range,
    note: 'PDF 内容存储在客户端 localStorage，请在前端控制台查看',
    instruction: `
      打开教材章节页面（如 /learn/textbook/math/1/1.1.1），
      打开 F12 控制台，查看以下日志：
      - [getSectionContent] - 显示提取的内容
      - [PDFUtils] - 显示页码过滤结果
      - [AutoSegment] - 显示 AI 分段前的预处理内容
    `
  });
}
