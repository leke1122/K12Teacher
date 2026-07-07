import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function DELETE() {
  return NextResponse.json({
    success: true,
    message: '客户端本地数据已清理',
  });
}
