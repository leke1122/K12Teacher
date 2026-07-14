import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word, context, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: '请先配置 DeepSeek API Key' }, { status: 400 });
    }

    if (!word || word.length === 0) {
      return NextResponse.json({ error: '请提供要查询的字词' }, { status: 400 });
    }

    const prompt = `你是一位古汉语词典专家。请解释以下字词在古文语境中的含义。

## 查询的字词
${word}

## 上下文（可选）
${context || '无特定上下文'}

## 解释要求
请提供：
1. **读音**：拼音或古音
2. **词性**：名词、动词、形容词等
3. **古义**：在古文中的含义
4. **今义**：现代汉语中的含义（如果有变化）
5. **例句**：1-2个古文例句
6. **特殊用法**：是否有通假字、词类活用等特殊情况

## 输出格式（严格JSON）
{
  "word": "${word}",
  "pinyin": "拼音",
  "partOfSpeech": "词性",
  "ancientMeaning": "古义解释",
  "modernMeaning": "今义解释",
  "examples": [
    {"text": "例句1", "source": "出处1"},
    {"text": "例句2", "source": "出处2"}
  ],
  "specialUsage": "特殊用法说明（如果没有则写'无'）"
}

请只输出JSON，不要其他文字。如果不确定，请返回null而不是编造。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位专业的古汉语词典专家，解释准确、详尽。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 尝试解析JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        success: false,
        error: '未能解析字词解释',
      });
    }

    try {
      const explanation = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        success: true,
        explanation,
      });
    } catch {
      return NextResponse.json({
        success: false,
        error: '解释格式有误',
      });
    }
  } catch (error) {
    console.error('[chinese/reading/word-explain] 解释失败:', error);
    return NextResponse.json(
      { error: '查询失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
