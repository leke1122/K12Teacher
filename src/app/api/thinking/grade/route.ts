/**
 * AI 评分 API
 * POST /api/thinking/grade
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      subject,
      type,
      userAnswer,
      referenceAnswer,
      prompt 
    } = body;

    if (!prompt && (!userAnswer || !referenceAnswer)) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY || 
                   request.headers.get('authorization')?.replace('Bearer ', '') || '';

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: '请配置 DeepSeek API Key' },
        { status: 500 }
      );
    }

    // 构建评分 prompt
    let gradingPrompt = prompt;
    if (!gradingPrompt && userAnswer && referenceAnswer) {
      gradingPrompt = `请评价学生以下答题表现：

学生作答：
${typeof userAnswer === 'object' ? JSON.stringify(userAnswer, null, 2) : userAnswer}

参考答案：
${typeof referenceAnswer === 'object' ? JSON.stringify(referenceAnswer, null, 2) : referenceAnswer}

评分维度：
- 完整性
- 准确性
- 逻辑性

请返回 JSON 格式：
{
  "score": 分数(0-100),
  "feedback": "整体评价",
  "improvements": ["改进建议1", "改进建议2"]
}`;
    }

    const systemPrompt = `你是一位专业的${subject === 'history' ? '历史' : subject === 'politics' ? '政治' : '地理'}教师，擅长评价学生的答题表现。请给出客观、具体的评价和改进建议。`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: gradingPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: 'AI 服务暂时不可用' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || '';

    // 解析 JSON
    let result = {
      score: 80,
      feedback: '表现良好！',
      improvements: [] as string[]
    };

    const match = answer.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        result = { ...result, ...JSON.parse(match[0]) };
      } catch {
        // 使用默认结果
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('[Thinking/Grade] Error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
