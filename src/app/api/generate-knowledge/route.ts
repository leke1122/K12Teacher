import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, apiKey, chapterTitle, startPage, endPage, sectionId: explicitSectionId, subjectId } = await request.json();

    type NormalizedPoint = { id: number; name: string; type: string; description: string; keyPoints?: unknown[] };
    let knowledgePoints: NormalizedPoint[] = [];

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: '请配置 DeepSeek API Key' }, { status: 400 });
    }

    console.log(`[GenerateKnowledge] 学科=${subjectId || '未知'} | 章节=${chapterTitle || '未知'} | 页码=${startPage || '?'}-${endPage || '?'} | 内容长度=${content.length}`);

    // 优先使用前端传入的显式 sectionId（精确到小节），避免从 chapterTitle 提取时截断成 1.2 造成误匹配
    const resolvedSectionId = resolveExplicitSectionId(explicitSectionId, chapterTitle);

    console.log(`[GenerateKnowledge] 使用章节标识: "${resolvedSectionId}"`);

    // 内容截断策略
    const MAX_CONTENT_LENGTH = 15000;
    let processedContent = content;

    if (content.length > MAX_CONTENT_LENGTH) {
      const exercisePatterns = [/练习[一二三四五六七八九十\d]/i, /习题[一二三四五六七八九十\d]/i, /思考与练习/i];
      let exerciseIndex = -1;

      for (const pattern of exercisePatterns) {
        const match = content.search(pattern);
        if (match > 1000 && (exerciseIndex === -1 || match < exerciseIndex)) {
          exerciseIndex = match;
        }
      }

      if (exerciseIndex > 1000 && exerciseIndex < content.length - 500) {
        processedContent = content.slice(0, Math.min(exerciseIndex, MAX_CONTENT_LENGTH));
        console.log(`[GenerateKnowledge] 内容过长，截取至练习前: ${processedContent.length} 字符`);
      } else {
        processedContent = content.slice(0, MAX_CONTENT_LENGTH);
        console.log(`[GenerateKnowledge] 内容过长，直接截取前${MAX_CONTENT_LENGTH}字符`);
      }
    }

    // 构建通用提示词
    const systemPrompt = `你是一个精确的知识提取工具，任务是将教材内容逐项拆解为所有独立的知识点，**一个都不能遗漏**。

## 核心原则
- 你不是在写摘要，而是在做"逐条盘点"
- 每个定义、每个符号、每个性质、每个方法都必须单独列为一个知识点
- 即使是很简短的句子，只要引入了一个新概念，就要提取
- 不要合并多个概念为一条

## 必须提取的内容类型
1. **定义**：所有新概念的准确解释（如"集合的定义"、"元素的定义"）
2. **符号**：所有符号及其含义（如"∈ 表示属于"、"∉ 表示不属于"）
3. **性质**：所有特性、规律、定理（如"确定性"、"互异性"、"无序性"）
4. **方法**：所有表示方法、操作步骤（如"列举法"、"描述法"）
5. **概念**：所有数学对象名称（如"空集"、"有限集"、"无限集"、"区间"）
6. **数集符号**：所有数集字母（如"N"、"N*"、"Z"、"Q"、"R"）
7. **重要结论**：每个"即..."、"也就是说..."后面跟着的都是独立知识点
8. **注意**：所有补充说明、限定条件、特殊情况

## 类型分类标准
- 定义：新概念的准确解释
- 符号：符号表示及其含义
- 性质：定理、规律、法则、特性
- 方法：解题方法、操作步骤、表示方法
- 注意：易错点、特殊情况、限定条件
- 关系：概念之间的关联、区别
- 公式：数学公式
- 概念：基本数学概念

## 提取步骤（严格遵守）
1. **逐句扫描**：一句话一句话地读，遇到新概念就提取
2. **遇到定义词（"叫作"、"称为"、"是"）→ 提取定义类知识点
3. **遇到符号（"∈、∉、⊂、∪、∩"）→ 提取符号类知识点
4. **遇到特性词（"确定性"、"互异性"、"无序性"）→ 提取性质类知识点
5. **遇到"用...表示" → 提取方法类知识点
6. **遇到"注意："、"特别要注意" → 提取注意类知识点

## 输出格式
必须返回严格的JSON数组，每个元素包含：
{
  "id": 序号（数字，按教材出现顺序编号）,
  "name": "知识点名称（简洁，5-20字，如"集合的定义"）",
  "type": "定义/符号/性质/方法/注意/关系/公式/概念",
  "description": "简要说明（20-50字），一句话概括核心内容"
}

## 格式要求
- 只返回JSON数组，不要有任何其他文字
- 确保JSON格式正确，可以被JSON.parse()解析
- **按教材顺序返回**
- **数量要求：每个小节提取 15-35 个知识点，宁多勿少**`;

    const userPrompt = `请从以下教材内容中提取所有知识点。

⚠️ 重要提醒：
1. **逐句扫描**，不要跳读，每句话都要分析
2. 只提取当前小节（${explicitSectionId || chapterTitle || '本节'}）的知识点，不要提取其他小节的内容
3. 如果教材内容跨越了多个小节，只提取当前小节的内容
4. **按教材原文中的出现顺序**提取，保持先后顺序不变
5. **不要合并**：每个独立概念单独一条（如"集合的概念"和"元素"是两个知识点）
6. **不要遗漏**：即使是很简短的句子，只要引入了新概念就要提取
7. **宁多勿少**：宁可多提取几个，也不要漏掉

教材内容：
${processedContent}

提取完成后，请自检：
- [ ] 是否包含了所有定义？
- [ ] 是否包含了所有符号及其含义？
- [ ] 是否包含了所有性质（确定性、互异性、无序性等）？
- [ ] 是否包含了所有方法（列举法、描述法等）？
- [ ] 是否包含了所有数集符号（N、Z、Q、R）？
- [ ] 是否包含了所有概念（空集、有限集、无限集等）？
- [ ] 提取数量是否在 15-35 之间？`;

    console.log('[GenerateKnowledge] 发送请求到 DeepSeek API，截断后内容长度:', processedContent.length);

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
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('API 请求超时，请稍后重试')), 60000);
    });

    const responsePromise = response.json();

    let data: Record<string, unknown>;
    try {
      data = await Promise.race([responsePromise, timeoutPromise]) as Record<string, unknown>;
    } catch (timeoutError) {
      console.error('[GenerateKnowledge] 请求超时:', timeoutError);
      return NextResponse.json({
        error: '请求超时，内容可能过长。请尝试提取更小的章节。',
        tip: '建议分小节提取，如只提取 1.1.1 而非整个 1.1'
      }, { status: 500 });
    }

    if (!response.ok) {
      const error = data as { error?: { message?: string } };
      console.error('[GenerateKnowledge] API错误:', error);
      return NextResponse.json({ error: error.error?.message || 'API 请求失败' }, { status: 500 });
    }

    const rawContent = (data.choices as Array<{ message?: { content?: string } }>)?.at(0)?.message?.content || '[]';

    console.log('[GenerateKnowledge] AI返回原始内容长度:', rawContent.length);

    try {
      let rawParsed: unknown[] = [];

      try {
        rawParsed = JSON.parse(rawContent);
      } catch {
        const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try { rawParsed = JSON.parse(jsonMatch[0]); }
          catch { /* keep empty */ }
        }
      }

      if (!Array.isArray(rawParsed) || rawParsed.length === 0) {
        throw new Error('解析结果不是有效的数组');
      }

      let normalized: NormalizedPoint[] = (rawParsed as Record<string, unknown>[]).map((kp, index) => ({
        id: (kp.id as number) || (index + 1),
        name: String(kp.name || kp.title || `知识点${index + 1}`),
        type: normalizeType(kp.type as string || (kp.category as string) || '概念'),
        description: String(kp.description || kp.desc || (kp.content as string) || ''),
        keyPoints: Array.isArray(kp.keyPoints) ? kp.keyPoints : []
      }));

      knowledgePoints = normalized;
      console.log('[GenerateKnowledge] ✅ 最终共提取 ' + knowledgePoints.length + ' 个知识点');

    } catch (parseError) {
      console.error('[GenerateKnowledge] JSON解析失败:', parseError);
      console.log('[GenerateKnowledge] 原始内容预览:', rawContent.slice(0, 500));

      try {
        const fixedContent = rawContent
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const parsed = JSON.parse(fixedContent) as Record<string, unknown>[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          knowledgePoints = parsed.map((kp, index) => ({
            id: (kp.id as number) || (index + 1),
            name: String(kp.name || kp.title || `知识点${index + 1}`),
            type: normalizeType(kp.type as string || '概念'),
            description: String(kp.description || kp.desc || ''),
            keyPoints: Array.isArray(kp.keyPoints) ? kp.keyPoints : []
          }));
          console.log('[GenerateKnowledge] 修复后成功解析，共', knowledgePoints.length, '个知识点');
        } else {
          throw new Error('修复后仍不是有效数组');
        }
      } catch {
        return NextResponse.json({
          error: '知识点解析失败',
          rawContent: rawContent.slice(0, 1000),
          parseError: parseError instanceof Error ? parseError.message : '未知错误'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      knowledgePoints,
      count: knowledgePoints.length,
      message: `共提取 ${knowledgePoints.length} 个知识点`
    });
  } catch (error) {
    console.error('[GenerateKnowledge] 处理失败:', error);
    return NextResponse.json(
      { error: '处理失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

/** 优先使用前端传入的显式 sectionId，避免 chapterTitle 中的 "1.2" 被错误扩展为 "1.1" */
function resolveExplicitSectionId(explicitId: unknown, chapterTitle: string): string {
  const raw = String(explicitId || '').trim();
  if (raw) return raw;
  return extractSectionId(chapterTitle) || chapterTitle;
}

function extractSectionId(title: string): string | null {
  const match = title.match(/(?:第\s*)?(\d+(?:\.\d+)+)(?:\s*节?)?/);
  return match ? match[1] : null;
}

/** 类型标准化函数 */
function normalizeType(type: string): string {
  const typeMap: Record<string, string> = {
    '概念': '概念', '定义': '定义', '符号': '符号', '性质': '性质',
    '方法': '方法', '注意': '注意', '注意点': '注意', '注意事项': '注意',
    '关系': '关系', '关系与区别': '关系', '公式': '公式', '公式与定律': '公式',
    '定理': '性质', '规律': '性质', '法则': '性质', '技巧': '方法', '步骤': '方法',
  };
  return typeMap[type] || '概念';
}
