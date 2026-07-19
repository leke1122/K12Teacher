import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, question, correctAnswer, apiKey } = body as {
      image: string;
      question: string;
      correctAnswer: string;
      apiKey: string;
    };

    if (!image || !apiKey) {
      return NextResponse.json({ success: false, error: '缺少必要参数' });
    }

    // 构建prompt，让AI分析图片中的解题过程
    const prompt = `你是高中数学教师，请分析学生的手写作业图片并给出反馈。

## 题目
${question || '数学解答题'}

## 正确答案
${correctAnswer || '请根据题目判断对错'}

## 要求
1. 分析图片中学生写的解题过程
2. 判断答案是否正确
3. 如果有错误，给出具体的错误原因和改进建议
4. 如果正确，肯定学生的优点
5. 以JSON格式返回：
{
  "correct": true或false,
  "feedback": "总体评价",
  "suggestions": ["建议1", "建议2", "建议3"]
}`;

    // 调用DeepSeek API（使用视觉模型）
    // 注意：DeepSeek目前不支持视觉，需要使用支持视觉的模型
    // 这里先用文字方式模拟，实际使用时可以换成Qwen-vl或其他视觉模型
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: '你是一位专业的高中数学教师，擅长批改学生作业并给出建设性反馈。' 
          },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: image, // Base64编码的图片
                },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json({ success: false, error: 'AI服务请求失败' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ success: false, error: 'AI返回内容为空' });
    }

    // 解析JSON
    let feedback = {
      correct: false,
      feedback: 'AI分析完成，请查看反馈',
      suggestions: ['请仔细核对解题步骤'],
    };

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        feedback = {
          correct: parsed.correct ?? false,
          feedback: parsed.feedback ?? content,
          suggestions: parsed.suggestions ?? [],
        };
      }
    } catch (e) {
      console.error('JSON parse error:', e);
      feedback.feedback = content;
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Error checking work:', error);
    return NextResponse.json({ success: false, error: '服务器错误' });
  }
}
