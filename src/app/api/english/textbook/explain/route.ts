import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, apiKey, apiProvider = 'deepseek' } = body;

    if (!text || !apiKey) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 },
      );
    }

    const baseUrl = apiProvider === 'deepseek' 
      ? 'https://api.deepseek.com/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const systemPrompt = `你是高中英语学习助手，专门帮助辽宁考生学习人教版高中英语教材。
请对给定的英文段落进行详细讲解，包含以下内容：
1. 中文翻译：准确流畅的翻译
2. 词汇讲解：标注课标词汇，给出音标、词性、中文释义、常用搭配和例句
3. 语法讲解：分析段落中的重点语法结构（时态、从句、非谓语等），说明其用法
4. 句型讲解：提取1-2个高级句型，说明如何用于写作
5. 语篇讲解：分析文章结构（总分总/时间顺序/因果关系等），说明阅读策略

请以JSON格式返回，格式如下：
{
  "translation": "中文翻译",
  "vocabulary": [{"word": "单词", "phonetic": "/音标/", "pos": "词性", "meaning": "释义", "collocation": "搭配", "example": "例句"}],
  "grammarPoints": ["语法点1", "语法点2"],
  "keySentences": ["句型1", "句型2"],
  "explanation": "综合讲解内容",
  "question": {
    "text": "这段的主旨是什么？",
    "options": ["选项1", "选项2", "选项3", "选项4"],
    "correct": "正确答案"
  }
}`;

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: apiProvider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请讲解以下英文段落：\n\n${text}` },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { success: false, message: `API调用失败: ${error}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // 尝试解析JSON
    let parsed;
    try {
      // 提取JSON部分（可能包含markdown代码块）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // 如果解析失败，返回原始内容
      parsed = {
        translation: content,
        vocabulary: [],
        grammarPoints: [],
        keySentences: [],
        explanation: content,
        question: {
          text: '这段话主要讲了什么？',
          options: ['描述过去经历', '讨论未来计划', '介绍学习方法', '说明科学原理'],
          correct: '描述过去经历',
        },
      };
    }

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '生成讲解失败' },
      { status: 500 },
    );
  }
}
