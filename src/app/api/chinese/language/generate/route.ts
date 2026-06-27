import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, difficulty, source } = body as {
      topic?: string;
      difficulty?: '简单' | '中等' | '困难';
      source?: 'AI生成' | '高考真题' | '模拟题';
    };

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: '缺少 DeepSeek API Key，请先在设置中配置' },
        { status: 400 },
      );
    }

    const systemPrompt = `你是一位经验丰富的高中语文教师，请根据以下要求生成一套语言文字运用训练题。输出为严格的 JSON。`;

    const userPrompt = `
### 生成要求
- 主题：${topic || '日常社会生活'}
- 难度：${difficulty || '中等'}
- 来源：${source || 'AI生成'}

请生成 1 个 300-500 字的完整语段，并围绕该语段设计 4-5 道题，至少覆盖 3 种题型（成语/病句/补写/修辞）。
成语题要求 4 个选项；补写题直接给出补写内容；修辞题可保留为简答或分析题。

### 返回JSON格式
{
  "passage": "完整语段",
  "questions": [
    {
      "id": 1,
      "type": "idiom",
      "question": "题目描述",
      "context": "题干对应的原文片段",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "A",
      "explanation": "详细解析"
    },
    {
      "id": 2,
      "type": "sentence",
      "question": "题目描述",
      "context": "题干对应的原文片段",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "B",
      "explanation": "详细解析"
    },
    {
      "id": 3,
      "type": "fill",
      "question": "请在横线处补写恰当语句",
      "context": "含横线的原文片段",
      "options": [],
      "correctAnswer": "补写答案",
      "explanation": "补写依据"
    },
    {
      "id": 4,
      "type": "rhetoric",
      "question": "题目描述",
      "context": "原文片段",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "A",
      "explanation": "手法识别依据与表达效果分析"
    }
  ]
}`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.7,
        max_tokens: 2400,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { success: false, message: `AI生成失败：${error}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let parsed: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('未找到JSON');
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { success: false, message: 'AI返回格式异常，请重试' },
        { status: 500 },
      );
    }

    if (!parsed.passage || !Array.isArray(parsed.questions)) {
      return NextResponse.json(
        { success: false, message: 'AI返回数据不完整' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: crypto.randomUUID?.() || String(Date.now()),
        passage: parsed.passage,
        source: source || 'AI生成',
        difficulty: difficulty || '中等',
        questions: (parsed.questions || []).map((q: any, index: number) => ({
          id: q.id ?? index + 1,
          type: q.type,
          question: q.question,
          context: q.context,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        })),
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '生成训练题失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 },
    );
  }
}
