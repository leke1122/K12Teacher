import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, title, apiKey } = await request.json();

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: '请配置 API Key' }, { status: 400 });
    }

    console.log(`[TranslateClassical] 篇目: ${title} | 内容长度: ${content.length}`);

    const systemPrompt = `你是一位专注辽宁高考（新高考Ⅱ卷）的语文文言文翻译专家。任务：将文言文逐句翻译为现代汉语，并标注重点字词。

## 核心原则
1. **逐句翻译**：保持与原文相同的段落结构
2. **信、达、雅**：准确传达原意，语言通顺，适当文采
3. **重点标注**：对高考考点词汇（实词、虚词、句式）进行加粗或标注
4. **保留原文**：每句先给出原文，再给出翻译

## 标注格式
- 实词重点：用【】标注，如"【学】不可以已"
- 虚词：用（）标注作用，如"君子博学而（表递进）日参省乎己"
- 通假字：标注"通XX"
- 词类活用：标注"名作动"等
- 古今异义：标注"古义：XX"

## 输出格式
严格返回JSON数组，每个元素是一句：
[
  {
    "original": "君子曰：学不可以已。",
    "translation": "君子说：学习是不可以停止的。",
    "keyWords": [
      {
        "word": "已",
        "meaning": "停止",
        "category": "重点实词",
        "note": "古今异义：今义为"已经""
      }
    ],
    "grammar": "判断句"
  }
]

## 要求
1. 每句都要翻译，不要遗漏
2. 重点字词要标注
3. 直译为主，意译为辅
4. 符合现代汉语表达习惯`;

    const userPrompt = `请将以下《${title || '文言文'}》逐句翻译为现代汉语。

原文：
${content.slice(0, 6000)}

要求：
1. 逐句对应，保持原文结构
2. 标注所有高考考点字词（实词、虚词、通假字、古今异义、词类活用）
3. 标注特殊句式
4. 翻译准确、通顺`;

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
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TranslateClassical] API error:', response.status, errorText);
      return NextResponse.json(
        { error: `AI API 请求失败 (${response.status})` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '[]';

    console.log(`[TranslateClassical] AI返回长度: ${rawContent.length}`);

    // 解析 JSON
    let parsed;
    try {
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(rawContent);
      }
    } catch {
      console.error('[TranslateClassical] JSON解析失败:', rawContent.slice(0, 500));
      return NextResponse.json(
        { error: 'AI返回格式错误', raw: rawContent.slice(0, 1000) },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { error: '返回结果不是数组' },
        { status: 500 }
      );
    }

    console.log(`[TranslateClassical] 翻译完成: ${parsed.length}句`);

    return NextResponse.json({
      success: true,
      title: title || '文言文',
      sentences: parsed,
    });
  } catch (error) {
    console.error('[TranslateClassical] 处理失败:', error);
    return NextResponse.json(
      { error: '处理失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
