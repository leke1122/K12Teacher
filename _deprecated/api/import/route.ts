/**
 * 导入单词到数据库 API
 * POST /api/words/import
 * Body: { words: ParsedWord[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { insertWords } from '@/lib/wordService';
import { ParsedWord } from '@/lib/wordParser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { words } = body as { words: ParsedWord[] };

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { success: false, error: '没有单词数据' },
        { status: 400 }
      );
    }

    const result = await insertWords(words);

    return NextResponse.json({
      success: true,
      imported: result.success,
      failed: result.failed,
      total: words.length,
    });
  } catch (error) {
    console.error('[API/words/import] Error:', error);
    return NextResponse.json(
      { success: false, error: '导入失败' },
      { status: 500 }
    );
  }
}
