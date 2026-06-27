import { NextRequest, NextResponse } from 'next/server';
import { importWords, exportWords, resetProgress } from '@/data/words/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words, mode } = body;

    if (!Array.isArray(words)) {
      return NextResponse.json(
        { success: false, message: '词库必须是数组格式' },
        { status: 400 },
      );
    }

    const result = importWords(JSON.stringify(words), mode === 'overwrite');

    return NextResponse.json({
      success: true,
      data: {
        count: result.words.length,
        action: result.action,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '导入失败' },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const words = getWordsFromStorage();
    return NextResponse.json({ success: true, data: words });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

function getWordsFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('words_data');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
