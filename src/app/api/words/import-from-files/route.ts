/**
 * 从本地文件导入单词 API
 * POST /api/words/import-from-files
 * Body: { filePath: string }
 * 
 * 此 API 读取本地 Markdown 文件，解析单词数据，并导入到 Supabase
 */

import { NextRequest, NextResponse } from 'next/server';

// 强制使用 Node.js Runtime（因为需要访问本地文件系统）
export const runtime = 'nodejs';

import { parseAllWordFiles, countByLevel } from '@/lib/wordParser';
import { insertParsedWords } from '@/lib/wordService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath } = body;

    // 解析文件
    const words = parseAllWordFiles(filePath);

    if (words.length === 0) {
      return NextResponse.json(
        { success: false, error: '未找到任何单词数据' },
        { status: 400 }
      );
    }

    // 统计各频率
    const counts = countByLevel(words);
    console.log('[导入单词] 各频率分布:', counts);
    console.log('[导入单词] 总计:', words.length);

    // 导入到 Supabase
    const result = await insertParsedWords(words);

    return NextResponse.json({
      success: true,
      imported: result.success,
      failed: result.failed,
      total: words.length,
      breakdown: counts,
    });
  } catch (error) {
    console.error('[API/words/import-from-files] Error:', error);
    return NextResponse.json(
      { success: false, error: '导入失败: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
