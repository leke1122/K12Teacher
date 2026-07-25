import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiKey = String(body?.apiKey || '').trim();

    if (!apiKey) {
      return NextResponse.json({ success: false, message: '请先在设置中配置 DeepSeek API Key' }, { status: 400 });
    }

    const poem = body?.poem;
    if (!poem?.title || !poem?.original_text) {
      return NextResponse.json({ success: false, message: '缺少诗歌内容' }, { status: 400 });
    }

    const systemPrompt = `你是一位高中语文诗歌鉴赏教师，请根据诗歌内容生成3道高考风格选择题。
输出严格JSON，不要输出其他内容：
{
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "question": "题目",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": "A",
      "analysis": "解析"
    }
  ]
}`;

    const userPrompt = `【标题】${poem.title}
【作者】${poem.author}
【原文】
${poem.original_text}

【考点】
${(poem.exam_points || []).join('；') || '诗歌鉴赏、语言表达、手法分析'}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ success: false, message: 'DeepSeek 请求失败', detail: errorText }, { status: 502 });
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content || '';
    const parsed = parseQuestions(content);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('classical-exam-questions error', error);
    return NextResponse.json({ success: false, message: '生成失败' }, { status: 500 });
  }
}

function parseQuestions(text: string) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no json');
    const parsed = JSON.parse(match[0]);
    const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
    return questions.map((item: any, idx: number) => ({
      id: item.id || `q${idx}`,
      type: 'choice',
      question: String(item.question || '').trim(),
      options: Array.isArray(item.options) ? item.options : [],
      correct: String(item.correct || '').trim(),
      analysis: String(item.analysis || '').trim(),
    }));
  } catch {
    return [];
  }
}
