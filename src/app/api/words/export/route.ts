import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
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
    
    return new NextResponse(JSON.stringify(words, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="words_${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: '导出失败' },
      { status: 500 },
    );
  }
}
