import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const poemId = String(body?.poemId || '').trim();

    if (!poemId) {
      return NextResponse.json({ success: false, message: 'poemId 不能为空' }, { status: 400 });
    }

    const poem = await getPoemById(poemId);
    if (!poem) {
      return NextResponse.json({ success: false, message: '未找到该诗歌' }, { status: 404 });
    }

    const apiKey = String(body?.apiKey || '').trim();
    if (!apiKey) {
      return NextResponse.json({ success: false, message: '请先在设置中配置 DeepSeek API Key' }, { status: 400 });
    }

    const analysis = await analyzeWithAI({ poem, apiKey });
    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error('analyze-poetry error', error);
    const message = error instanceof Error ? error.message : '诗歌分析失败';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

async function getPoemById(id: string) {
  const { POETRY_LIST } = await import('@/lib/poetry');
  return POETRY_LIST.find((p: any) => p.id === id);
}

async function analyzeWithAI({ poem, apiKey }: { poem: any; apiKey: string }) {
  const systemPrompt = `你是一位高中语文诗歌鉴赏专家，专攻辽宁新高考Ⅱ卷命题风格。

请分析以下诗歌，输出严格JSON，不要输出任何其他内容：
{
  "background": "作者简介+写作背景，100字内",
  "translation": "逐句翻译，保留原诗意韵",
  "imagery": "意象分析（每个意象+象征意义）",
  "technique": "艺术手法（比喻、象征、用典、借景抒情等，列出2-3种）",
  "emotion": "思想情感总结",
  "examQuestions": [
    {
      "type": "choice",
      "question": "选择题",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct": "A",
      "analysis": "解析"
    }
  ]
}

examQuestions 生成 3 道题。`;

  const userPrompt = `【诗歌原文】
${poem.text}

【写作背景】
${poem.background}`;

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
      max_tokens: 4000,
    }),
  });

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('诗歌分析请求超时')), 60000);
  });

  let data: any;
  try {
    data = await Promise.race([response.json(), timeoutPromise]);
  } catch (timeoutError) {
    console.error('[analyze-poetry] 请求超时:', timeoutError);
    throw new Error('请求超时，请稍后重试');
  }

  if (!response.ok) {
    const error = data?.error || {};
    console.error('[analyze-poetry] API错误:', error);
    throw new Error(error?.message || 'API 请求失败');
  }

  const rawContent = data?.choices?.at(0)?.message?.content || '';
  const parsed = parseJson(rawContent);
  if (!parsed) {
    throw new Error('解析诗歌分析结果失败，请重试');
  }

  return {
    background: parsed.background || poem.background,
    translation: parsed.translation || '',
    imagery: parsed.imagery || '',
    technique: parsed.technique || '',
    emotion: parsed.emotion || '',
    examQuestions: Array.isArray(parsed.examQuestions) ? parsed.examQuestions : [],
  };
}

function parseJson(rawContent: string) {
  const trimmed = rawContent.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/```json\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {
        // ignore
      }
    }
    const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        // ignore
      }
    }
  }
  return null;
}
