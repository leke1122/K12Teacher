/**
 * 错词本 API - 删除错词
 * DELETE /api/wrong-questions/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteWrongQuestion } from '@/lib/wrongQuestionService';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少错词ID' },
        { status: 400 }
      );
    }

    const success = await deleteWrongQuestion(id, 'personal-user');

    return NextResponse.json({
      success,
    });
  } catch (error) {
    console.error('[API/wrong-questions/[id]] DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: '删除错词失败' },
      { status: 500 }
    );
  }
}
