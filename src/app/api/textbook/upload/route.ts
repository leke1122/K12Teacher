import { NextRequest, NextResponse } from 'next/server';
import { saveTextbook, saveTextbookPDF } from '@/lib/textbookStorage.server';

// POST /api/textbook/upload
// 保存教材元数据到服务端存储
// 服务端存储用于 API 路由读取，客户端仍需保存到 localStorage

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subjectId, name, grade, fileName, totalPages, fullText, pages } = body;

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
      chaptersCount: 0,
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

    // 保存到服务端存储（供 API 路由使用）
    saveTextbook(subjectId, textbook);
    if (pdf?.fullText) {
      saveTextbookPDF(pdf);
    }

    // 返回教材元数据给客户端，客户端也保存到 localStorage
    return NextResponse.json({
      success: true,
      textbook,
      pdf,
    });
  } catch (error) {
    console.error('[API textbook/upload] error:', error);
    return NextResponse.json({ success: false, error: '保存失败' }, { status: 500 });
  }
}
