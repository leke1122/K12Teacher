import { NextRequest, NextResponse } from 'next/server';

// 历史知识点题目类型
export interface HistoryQuestion {
  question: string;
  options: string[];
  correct: number; // 正确答案索引 0-3
  explanation: string;
}

interface GenerateRequest {
  knowledge: {
    name: string;
    time: string;
    location: string;
    figures: string[];
    effects: string;
    significance: string;
  };
  apiKey?: string;
}

// 生成历史知识点练习题
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json().catch(() => null);

    if (!body?.knowledge) {
      return NextResponse.json({ success: false, message: '缺少知识点信息' }, { status: 400 });
    }

    const { knowledge, apiKey: requestApiKey } = body;

    // 优先使用请求中的 Key，其次使用环境变量
    const apiKey = requestApiKey || process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: '请先在设置页面配置 DeepSeek API Key' },
        { status: 400 }
      );
    }

    // 生成题目的提示词
    const prompt = `请根据以下历史知识点生成1道选择题，用于检验学习效果。

## 知识点信息
- 名称：${knowledge.name}
- 时间：${knowledge.time}
- 地点：${knowledge.location}
- 人物：${knowledge.figures?.join('、') || '教材未明确提及'}
- 影响：${knowledge.effects}
- 意义：${knowledge.significance}

## 出题要求
1. 考察核心内容（时间、地点、人物或影响）
2. 选项设计合理，干扰项有迷惑性但不能是明显错误
3. 正确答案唯一
4. 严格基于知识点信息，不编造

## 返回格式（严格JSON）
{
  "question": "题目内容",
  "options": ["A. 选项内容", "B. 选项内容", "C. 选项内容", "D. 选项内容"],
  "correct": 0,
  "explanation": "解析说明"
}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个严格输出 JSON 的历史练习题生成助手，必须只返回 JSON 对象，不要包含任何其他文字。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'AI 请求失败');
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    // 解析 JSON
    let question: HistoryQuestion | null = null;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        question = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('[API history/knowledge/question] parse error:', parseError);
      return NextResponse.json(
        { success: false, message: '题目解析失败' },
        { status: 500 }
      );
    }

    if (!question) {
      return NextResponse.json(
        { success: false, message: '未生成题目' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    console.error('[API history/knowledge/question] error:', error);
    return NextResponse.json(
      { success: false, message: '生成题目失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
