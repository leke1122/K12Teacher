import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, title, apiKey, sectionId } = await request.json();

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: '请配置 DeepSeek API Key' }, { status: 400 });
    }

    console.log(`[ExtractClassicalWords] 篇目: ${title || sectionId} | 内容长度: ${content.length}`);

    const systemPrompt = `你是一位专注辽宁高考（新高考Ⅱ卷）的语文文言文教学专家。任务：从给定的文言文内容中系统提取所有高考考点词汇和语法知识。

## 核心原则
1. **逐句扫描**，提取所有重点实词、虚词、句式和文化常识
2. **一个不遗漏**：每个有考查价值的词条都要列出
3. **结合辽宁高考要求**：重点关注高频考点和易错点
4. **分类清晰**：实词、虚词、句式、文化常识分开展示

## 提取规则

### 实词（重点）
- 通假字：标注"通XX，意为XX"
- 古今异义：列出古义和今义
- 词类活用：名作动、形作名、使动、意动等
- 一词多义：同一词在不同语境下的含义
- 重点词汇：动词、形容词中的关键字

### 虚词
-  eighteen个虚词：而、何、乎、乃、其、且、若、所、为、焉、也、以、因、于、与、则、者、之
- 每个虚词在本文中的具体含义和用法

### 特殊句式
- 判断句：……者……也、……也、……为……
- 被动句：为、见、于、被
- 省略句：省略主语、宾语、介词
- 倒装句：宾语前置、定语后置、状语后置、主谓倒装

### 文化常识
- 官职名、科举、年龄称谓、地理、礼仪等

## 输出格式
严格返回JSON对象：
{
  "title": "篇目名称",
  "realWords": [
    {
      "word": "词语",
      "meaning": "在本文中的含义",
      "category": "通假|古今异义|词类活用|一词多义|重点实词",
      "example": "文中例句（5-20字）",
      "note": "辽宁高考备注（可选）"
    }
  ],
  "functionWords": [
    {
      "word": "虚词",
      "meaning": "在本文中的含义",
      "usage": "用法说明（如：连词，表转折）",
      "example": "例句"
    }
  ],
  "sentencePatterns": [
    {
      "pattern": "句式名称",
      "original": "原句",
      "explanation": "句式解析",
      "translation": "现代汉语翻译"
    }
  ],
  "culturalKnowledge": [
    {
      "term": "文化术语",
      "explanation": "详细解释",
      "context": "在本文中的语境"
    }
  ]
}`;

    const userPrompt = `请从以下《${title || '文言文'}》中提取所有高考考点词汇和语法知识。

原文内容：
${content.slice(0, 8000)}

要求：
1. 实词提取：重点关注动词、形容词、通假字、古今异义、词类活用
2. 虚词提取：18个虚词（而、何、乎、乃、其、且、若、所、为、焉、也、以、因、于、与、则、者、之）
3. 句式提取：判断句、被动句、省略句、倒装句
4. 文化常识：官职、称谓、礼仪等
5. 辽宁高考考点：标注高频考查点和易错点
6. 按原文顺序排列
7. 每个条目都要有具体的文中例句`;

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
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ExtractClassicalWords] API error:', response.status, errorText);
      return NextResponse.json(
        { error: `AI API 请求失败 (${response.status})` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';

    console.log(`[ExtractClassicalWords] AI返回长度: ${rawContent.length}`);

    // 解析 JSON
    let parsed;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(rawContent);
      }
    } catch {
      console.error('[ExtractClassicalWords] JSON解析失败:', rawContent.slice(0, 500));
      return NextResponse.json(
        { error: 'AI返回格式错误', raw: rawContent.slice(0, 1000) },
        { status: 500 }
      );
    }

    // 数据规范化
    const result = {
      title: parsed.title || title || '文言文',
      realWords: Array.isArray(parsed.realWords) ? parsed.realWords : [],
      functionWords: Array.isArray(parsed.functionWords) ? parsed.functionWords : [],
      sentencePatterns: Array.isArray(parsed.sentencePatterns) ? parsed.sentencePatterns : [],
      culturalKnowledge: Array.isArray(parsed.culturalKnowledge) ? parsed.culturalKnowledge : [],
    };

    console.log(`[ExtractClassicalWords] 提取完成: 实词${result.realWords.length}个, 虚词${result.functionWords.length}个, 句式${result.sentencePatterns.length}个, 文化常识${result.culturalKnowledge.length}个`);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[ExtractClassicalWords] 处理失败:', error);
    return NextResponse.json(
      { error: '处理失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
