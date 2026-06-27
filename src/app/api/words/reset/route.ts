import { NextRequest, NextResponse } from 'next/server';
import { resetProgress } from '@/data/words/storage';

export async function POST() {
  try {
    const raw = typeof localStorage !== 'undefined'
      ? localStorage.getItem('words_data')
      : null;

    if (!raw) {
      return NextResponse.json(
        { success: false, message: '暂无词库数据' },
        { status: 404 },
      );
    }

    const words = JSON.parse(raw);
    const reset = resetProgress(words);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('words_data', JSON.stringify(reset));
    }

    return NextResponse.json({
      success: true,
      data: { count: reset.length },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: '重置失败' },
      { status: 500 },
    );
  }
}
