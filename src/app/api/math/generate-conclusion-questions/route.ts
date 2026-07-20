import { NextRequest, NextResponse } from 'next/server';
import { SecondLevelConclusion } from '@/data/math/secondLevelConclusions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conclusion, apiKey } = body as {
      conclusion: SecondLevelConclusion;
      apiKey: string;
    };

    if (!conclusion || !apiKey) {
      return NextResponse.json({ success: false, error: '缺少必要参数' });
    }

    // 构建prompt
    const prompt = `你是高中数学教师，请根据以下二级结论生成3道选择题试题。

## 二级结论信息
- 标题：${conclusion.title}
- 结论：${conclusion.conclusion}
- 适用条件：${conclusion.applicableConditions}
- 典型应用：${conclusion.typicalApplications}
- 易错提醒：${conclusion.commonMistakes}

## 要求
1. 生成3道选择题，每道题有4个选项（A、B、C、D）
2. 题目要有一定难度，能检验学生对该二级结论的理解和应用能力
3. 答案要有解析，说明解题思路
4. 返回JSON格式：
{
  "questions": [
    {
      "question": "题目内容",
      "options": ["A选项内容", "B选项内容", "C选项内容", "D选项内容"],
      "answer": "正确答案（如B）",
      "explanation": "解析内容"
    }
  ]
}`;

    // 调用DeepSeek API
    console.log('[generate-conclusion-questions] 正在调用DeepSeek API...');
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位专业的高中数学教师，擅长根据二级结论出题。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    console.log('[generate-conclusion-questions] API响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json({ success: false, error: `AI服务请求失败 (${response.status}): ${errorText}` });
    }

      const data = await response.json();
      console.log('[generate-conclusion-questions] API返回数据:', JSON.stringify(data).substring(0, 500));
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error('[generate-conclusion-questions] AI返回内容为空');
        return NextResponse.json({ success: false, error: 'AI返回内容为空，请重试' });
      }

    // 解析JSON
    let questions = [];
    try {
      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        questions = parsed.questions || [];
      }
    } catch (e) {
      console.error('JSON parse error:', e);
      // 如果解析失败，返回默认题目
      questions = [
        {
          question: `根据"${conclusion.title.replace(/^\d+\.\d+\s*/, '')}"，下列说法正确的是？`,
          options: ['A. 符合结论的条件', 'B. 不符合结论的条件', 'C. 无法判断', 'D. 以上都不对'],
          answer: 'A',
          explanation: '请参考结论内容和适用条件进行判断。',
        },
      ];
    }

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ success: false, error: '服务器错误' });
  }
}
