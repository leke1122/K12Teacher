import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task, content, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: '请先配置 DeepSeek API Key' }, { status: 400 });
    }

    if (!content || content.length < 10) {
      return NextResponse.json({ error: '写作内容不足' }, { status: 400 });
    }

    const wordCount = content.length;
    const charCount = content.replace(/\s/g, '').length;

    const prompt = `你是一位语文写作指导老师。请对学生根据以下任务完成的写作进行点评和反馈。

## 写作任务
${task || '基于课文的写作练习'}

## 学生的写作内容
${content}

## 点评要求
请从以下几个维度进行点评：
1. **结构**：文章结构是否清晰、层次是否分明
2. **内容**：是否扣题、内容是否充实
3. **语言**：表达是否流畅、用词是否准确
4. **亮点**：找出文章中写得好的地方
5. **建议**：提出2-3条具体的改进建议

## 输出格式（严格JSON）
{
  "wordCount": ${wordCount},
  "charCount": ${charCount},
  "structure": {
    "score": 0-100,
    "comment": "结构点评"
  },
  "content": {
    "score": 0-100,
    "comment": "内容点评"
  },
  "language": {
    "score": 0-100,
    "comment": "语言点评"
  },
  "highlights": ["亮点1", "亮点2"],
  "suggestions": ["建议1", "建议2", "建议3"],
  "overall": "综合评价"
}

请只输出JSON，不要其他文字。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位专业的语文写作指导老师，点评精准、有建设性。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content_text = data.choices?.[0]?.message?.content || '';

    const jsonMatch = content_text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('未能生成点评');
    }

    const feedback = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('[chinese/reading/writing-feedback] 点评失败:', error);
    return NextResponse.json(
      { error: '生成点评失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
