import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, difficulty, apiKey } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: '请配置 DeepSeek API Key' }, { status: 400 });
    }

    const difficultyText = {
      easy: '简单基础的概念题',
      medium: '中等难度的综合应用题',
      hard: '困难的理解拓展题'
    };

    const systemPrompt = `你是一位专业的高中教师，擅长出题。请根据教材内容生成练习题。
请以 JSON 数组格式返回题目列表，每个题目包含：
- type: 题目类型 ("choice" 选择题, "fill" 填空题, "judge" 判断题)
- question: 题目内容
- options: 选项列表（选择题用，最多4个选项）
- correctAnswer: 正确答案
- analysis: 答案解析

生成 5-10 道题目，难度为：${difficultyText[difficulty as keyof typeof difficultyText] || '中等'}

只返回 JSON，不要有其他文字。`;

    const userPrompt = `根据以下教材内容生成练习题：\n\n${content.slice(0, 4000)}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'API 请求失败' }, { status: 500 });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '[]';

    // 尝试解析 JSON
    let questions = [];
    try {
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // 解析失败，返回空数组
      questions = [];
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Generate questions error:', error);
    return NextResponse.json(
      { error: '处理失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
