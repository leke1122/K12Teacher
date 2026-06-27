import { NextRequest, NextResponse } from 'next/server';

/**
 * 检查答案
 * 验证用户答案并返回反馈
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      sectionId,        // 段落ID
      userAnswer,       // 用户答案（A/B/C/D）
      correctAnswer,    // 正确答案
      attemptCount = 1  // 当前尝试次数
    } = await request.json();

    if (!userAnswer || !correctAnswer) {
      return NextResponse.json({ error: '答案不能为空' }, { status: 400 });
    }

    const isCorrect = userAnswer.toUpperCase() === correctAnswer.toUpperCase();

    console.log(`[TextbookCheck] 段落${sectionId}，用户答案:${userAnswer}，正确答案:${correctAnswer}，正确:${isCorrect}`);

    // 根据是否正确和尝试次数决定下一步
    if (isCorrect) {
      return NextResponse.json({
        correct: true,
        message: '太棒了！回答正确！',
        hint: '继续保持，马上进入下一段~',
        nextAction: 'next',
        explanation: ''
      });
    }

    // 回答错误
    if (attemptCount === 1) {
      // 第一次错误，给提示
      return NextResponse.json({
        correct: false,
        message: '再想想呢~',
        hint: '注意题目中的关键词，再仔细看看讲解内容',
        nextAction: 'reexplain',
        explanation: ''
      });
    }

    // 第二次错误，标记薄弱项并允许继续
    return NextResponse.json({
      correct: false,
      message: '没关系，继续加油！',
      hint: '这个概念需要多加复习，已经记录为薄弱项',
      nextAction: 'next',
      explanation: '虽然这次没答对，但没关系。继续学习后面的内容，回头再复习这个知识点。',
      isWeak: true
    });

  } catch (error) {
    console.error('[TextbookCheck] 处理失败:', error);
    return NextResponse.json({
      correct: false,
      message: '检查答案时出错',
      hint: '请重试',
      nextAction: 'retry',
      explanation: ''
    }, { status: 500 });
  }
}
