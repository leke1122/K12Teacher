import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { practiceId, passage, questions, answers, apiKey } = body as {
      practiceId: string;
      passage: string;
      questions: Array<{
        id: number;
        type: string;
        question: string;
        options?: string[];
        correctAnswer: string | string[];
        explanation: string;
      }>;
      answers: Array<{ questionId: number; answer: string }>;
      apiKey?: string;
    };

    const results = questions.map((q) => {
      const answerEntry = answers.find((a) => a.questionId === q.id);
      const userAnswer = answerEntry?.answer?.trim() || '';
      const correctAnswer = q.correctAnswer;

      let isCorrect = false;
      if (Array.isArray(correctAnswer)) {
        isCorrect = correctAnswer.some((ca) => userAnswer === ca.trim());
      } else if (Array.isArray(q.options)) {
        isCorrect = userAnswer === correctAnswer || userAnswer === correctAnswer;
      } else {
        isCorrect = userAnswer === correctAnswer;
      }

      return {
        questionId: q.id,
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        userAnswer,
        isCorrect,
      };
    });

    const correctCount = results.filter((r) => r.isCorrect).length;
    const score = results.length > 0 ? correctCount / results.length : 0;

    let feedback = null;
    const wrongResults = results.filter((r) => !r.isCorrect);

    if (wrongResults.length > 0 && apiKey) {
      const prompt = `你是高中语文教师，请对学生的答案给出简要点评。

题目：${wrongResults[0].question}
正确答案：${wrongResults[0].correctAnswer}
学生答案：${wrongResults[0].userAnswer}
题型：${wrongResults[0].type === 'idiom' ? '成语' : wrongResults[0].type === 'sentence' ? '病句' : wrongResults[0].type === 'fill' ? '补写' : '修辞'}
解析：${wrongResults[0].explanation}

请直接返回 JSON 格式：
{
  "feedback": "简短点评（50字以内）",
  "suggestion": "改进建议（50字以内）"
}`;

      try {
        const aiRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 400,
          }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const aiContent = aiData.choices?.[0]?.message?.content || '';
          const match = aiContent.match(/\{[\s\S]*\}/);
          if (match) feedback = JSON.parse(match[0]);
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: {
        practiceId,
        results,
        score,
        correctCount,
        totalCount: results.length,
        wrongQuestionIds: wrongResults.map((r) => r.questionId),
        feedback,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '批改失败' },
      { status: 500 },
    );
  }
}
