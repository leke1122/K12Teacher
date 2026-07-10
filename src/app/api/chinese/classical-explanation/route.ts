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

    const systemPrompt = `你是一位高中语文教师，请基于诗歌内容输出严格JSON，不要输出任何其他内容：
{
  "content": "讲解内容，可分段"
}`;

    const userPrompt = `【标题】${poem.title}
【作者】${poem.author}
【原文】
${poem.original_text}
【已有讲解】
${poem.content_analysis || '暂无'}
【考点】
${(poem.exam_points || []).join('；') || '诗歌鉴赏、语言表达、手法分析'}`;

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
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ success: false, message: 'DeepSeek 请求失败', detail: errorText }, { status: 502 });
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content || '';
    const parsed = parseExplanation(content);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('classical-explanation error', error);
    return NextResponse.json({ success: false, message: '生成失败' }, { status: 500 });
  }
}

function parseExplanation(text: string) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('no json');
    const parsed = JSON.parse(match[0]);
    return String(parsed?.content || '').trim();
  } catch {
    return String(text || '').trim();
  }
}
