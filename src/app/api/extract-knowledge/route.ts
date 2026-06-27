import { NextRequest, NextResponse } from 'next/server';
import { extractKnowledgeFromText } from '@/services/aiService';

export async function POST(request: NextRequest) {
  try {
    const { pdfText, chapterId, sectionId, subjectId } = await request.json();

    if (!pdfText) {
      return NextResponse.json({ error: 'PDF文本内容不能为空' }, { status: 400 });
    }

    // 使用AI服务提取知识点
    const knowledgeList = await extractKnowledgeFromText(pdfText, chapterId, sectionId);

    return NextResponse.json({
      success: true,
      data: knowledgeList
    });
  } catch (error) {
    console.error('提取知识点失败:', error);
    return NextResponse.json(
      { error: '提取知识点失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    );
  }
}
