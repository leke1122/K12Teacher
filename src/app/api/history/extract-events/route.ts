import { NextRequest, NextResponse } from 'next/server';
import { getTextbookPDF, getTextbookChapters, getActiveTextbook } from '@/lib/textbookStorage.server';
import { extractHistoryEvents } from '@/lib/historyExtractor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const subjectId = String(body.subjectId || 'history');
    const chapterId = String(body.chapterId || '');

    if (!chapterId) {
      return NextResponse.json({ success: false, message: '缺少 chapterId' }, { status: 400 });
    }

    const textbook = await getActiveTextbook(subjectId);
    if (!textbook) {
      return NextResponse.json({ success: false, message: '未找到历史教材' }, { status: 404 });
    }

    const chapters = await getTextbookChapters(textbook.id);
    const chapter = chapters?.find((c) => String(c.chapterIndex) === chapterId || c.chapterTitle === chapterId);
    if (!chapter) {
      return NextResponse.json({ success: false, message: '章节不存在' }, { status: 404 });
    }

    const pdf = await getTextbookPDF(textbook.id);
    const chapterText = pdf?.fullText?.slice(0, 12000) || '';

    if (!chapterText) {
      return NextResponse.json({ success: false, message: '教材内容为空' }, { status: 400 });
    }

    const events = await extractHistoryEvents(chapterId, chapterText);

    return NextResponse.json({
      success: true,
      data: {
        chapterId,
        title: chapter.chapterTitle,
        events,
      },
    });
  } catch (error) {
    console.error('[history/extract-events] 错误:', error);
    return NextResponse.json(
      { success: false, message: '提取历史事件失败' },
      { status: 500 },
    );
  }
}
