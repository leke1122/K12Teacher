/**
 * 获取单词错误次数 API
 * GET /api/words/wrong-count?words=word1,word2,...
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWrongQuestions } from '@/lib/wrongQuestionService';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wordsParam = searchParams.get('words') || '';

    if (!wordsParam) {
      return NextResponse.json({ success: true, counts: {} });
    }

    const words = wordsParam.split(',').map(w => w.trim()).filter(Boolean);

    // 获取所有英语错题
    const questions = await getWrongQuestions('personal-user', 'english');

    // 统计每个单词的错误次数
    const counts: Record<string, number> = {};
    words.forEach(word => {
      counts[word.toLowerCase()] = 0;
    });

    if (Array.isArray(questions)) {
      questions.forEach(q => {
        const correctAnswer = q.correct_answer?.toLowerCase() || '';
        if (counts.hasOwnProperty(correctAnswer)) {
          counts[correctAnswer]++;
        }
      });
    }

    return NextResponse.json({
      success: true,
      counts,
    });
  } catch (error) {
    console.error('[API/words/wrong-count] Error:', error);
    return NextResponse.json(
      { success: false, error: '获取单词错误次数失败' },
      { status: 500 }
    );
  }
}
