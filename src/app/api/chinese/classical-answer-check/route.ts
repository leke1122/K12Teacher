import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = String(body?.apiKey || '').trim();

    if (!apiKey) {
      return NextResponse.json({ success: false, message: '请先在设置中配置 DeepSeek API Key' }, { status: 400 });
    }

    const question = body?.question;
    const userAnswer = String(body?.userAnswer || '').trim();

    if (!question?.question || !question?.correct) {
      return NextResponse.json({ success: false, message: '缺少题目信息' }, { status: 400 });
    }

    const systemPrompt = `你是一位高中语文教师。请根据学生答案给出简短批改反馈，输出严格JSON，不要输出任何其他内容：
{
  "correct": true,
  "feedback": "反馈内容"
}`;

    const userPrompt = `【题目】
${question.question}
【选项】
${(question.options || []).join('\n')}
【正确答案】
${question.correct}
【学生答案】
${userAnswer || '未作答'}
【解析】
${question.analysis || ''}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ success: false, message: 'DeepSeek 请求失败', detail: errorText }, { status: 502 });
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content || '';
    const parsed = parseFeedback(content);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('classical-answer-check error', error);
    return NextResponse.json({ success: false, message: '生成失败' }, { status: 500 });
  }
}

function parseFeedback(text: string) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no json');
    const parsed = JSON.parse(match[0]);
    return {
      correct: Boolean(parsed?.correct),
      feedback: String(parsed?.feedback || '已收到你的作答').trim(),
    };
  } catch {
    return {
      correct: false,
      feedback: String(text || '已收到你的作答').trim(),
    };
  }
}
