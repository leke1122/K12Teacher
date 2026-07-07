import { NextResponse } from 'next/server';
import { clearAllTextbookCache } from '@/lib/supabase';
import { clearServerData } from '@/lib/serverStorage';

// DELETE /api/manage/textbook
// 清空教材数据（本地和服务端）
export async function DELETE(request: Request) {
  try {
    // 1. 清空 Supabase 中的教材数据
    const supabaseCleared = await clearAllTextbookCache();

    // 2. 清空服务端文件存储
    try {
      clearServerData();
    } catch {
      // 本地存储清空失败不影响
    }

    return NextResponse.json({
      success: true,
      message: '教材数据已清空',
      supabaseCleared,
    });
  } catch (error) {
    console.error('[API manage/textbook] 清空失败:', error);
    return NextResponse.json(
      { success: false, message: '清空失败' },
      { status: 500 }
    );
  }
}
