import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content, apiKey, chapterTitle, startPage, endPage, sectionId: explicitSectionId, subjectId } = await request.json();

    type NormalizedPoint = { id: number; name: string; type: string; description: string; keyPoints?: unknown[]; page?: number | null };
    let knowledgePoints: NormalizedPoint[] = [];

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: '请配置 DeepSeek API Key' }, { status: 400 });
    }

    console.log(`[GenerateKnowledge] 学科=${subjectId || '未知'} | 章节=${chapterTitle || '未知'} | 页码=${startPage || '?'}-${endPage || '?'} | 内容长度=${content.length}`);

    // 优先使用前端传入的显式 sectionId
    const resolvedSectionId = resolveExplicitSectionId(explicitSectionId, chapterTitle);
    const sectionId = resolvedSectionId || explicitSectionId || '';

    console.log(`[GenerateKnowledge] 使用章节标识: "${resolvedSectionId}"`);

    // 构建通用知识点提取提示词（适用于所有数学章节）
    const systemPrompt = `你是"数学M老师"，正在为学生备课。你拿到教材第 ${startPage} 到 ${endPage} 页的内容。

## 核心原则：必须按页码顺序提取！

**提取顺序规则**：
1. 先看第 ${startPage} 页：从上到下读取，每遇到新概念/符号/规则就提取一个知识点
2. 再看第 ${startPage + 1} 页：依此类推
3. 直到第 ${endPage} 页

**每个知识点必须标注它实际出现在哪一页**

## 必须提取的内容（不遗漏！）

### 第 ${startPage} 页必含：
- 基本概念定义（如"集合的定义"、"元素的定义"）
- 基本符号（如"属于"、"不属于"）
- 符号格式说明

### 第 ${startPage + 1} 页必含（如果有）：
- 性质/规则（如"确定性"、"互异性"、"无序性"）
- 数集符号（如"N自然数集"、"Z整数集"、"Q有理数集"、"R实数集"）

### 任何页都可能有：
- 新方法名称（如"列举法"、"描述法"）
- 方法格式（如"大括号内用逗号分隔"、"竖线左边写元素符号"）
- 新概念名词
- 新符号含义

### 不要提取：
- 具体数字举例（如"如1,2,3"）
- 引导性提问（"想一想"、"思考"）
- 具体例题内容

## 提取示例

教材第10页内容：
"在数学中，我们经常用'集合'来对所研究的对象进行分类..."
"集合通常用英文大写字母A，B，C，...表示..."
"如果a是集合A的元素，就说a属于A，记作a∈A..."

教材第11页内容：
"集合中的元素具有以下性质：确定性：给定一个集合..."
"互异性：同一个集合中的元素都是互不相同的。"
"我们通常用N表示自然数集，用Z表示整数集..."

**正确提取结果**：
第10页知识点（按顺序）：
1. "集合的定义" - 第10页
2. "集合的元素" - 第10页
3. "集合的表示符号" - 第10页
4. "属于符号" - 第10页
5. "不属于符号" - 第10页

第11页知识点（按顺序）：
6. "确定性" - 第11页
7. "互异性" - 第11页
8. "无序性" - 第11页
9. "自然数集N" - 第11页
10. "正整数集N*或N+" - 第11页
11. "整数集Z" - 第11页
12. "有理数集Q" - 第11页
13. "实数集R" - 第11页

## 输出格式
JSON数组格式：
[
  {"name": "知识点名称", "page": 页码, "description": "简要说明"}
]

## 强制检查清单（输出前必须核对）：
- [ ] 第一个知识点来自第 ${startPage} 页
- [ ] 知识点按页码顺序排列（10→11→12...）
- [ ] "集合的定义"类概念在"描述法"之前
- [ ] "确定性、互异性、无序性"都已提取
- [ ] "N、Z、Q、R"等数集符号都已提取
- [ ] 总数 >= 20 个`;

    const userPrompt = `教材范围：第 ${startPage} 到 ${endPage} 页

请严格按以下步骤提取：

**第一步**：读取第 ${startPage} 页的所有内容，提取每个新概念/符号/规则作为单独知识点

**第二步**：读取第 ${startPage + 1} 页的所有内容，继续提取

**第三步**：依此类推直到第 ${endPage} 页

**必须包含**：
- 基本概念（集合、元素等）
- 基本符号（属于、不属于）
- 性质规则（确定性、互异性、无序性）
- 数集符号（N、Z、Q、R）
- 方法格式（列举法、描述法）

**教材内容**：
${content.slice(0, 12000)}

请返回JSON数组，每个元素包含 name、page、description。`;

    console.log('[GenerateKnowledge] 发送请求到 DeepSeek API');

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 8000
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
        tip: '建议分小节提取'
      }, { status: 500 });
    }

    if (!response.ok) {
      const error = data as { error?: { message?: string } };
      console.error('[GenerateKnowledge] API错误:', error);
      return NextResponse.json({ error: error.error?.message || 'API 请求失败' }, { status: 500 });
    }

    const rawContent = (data.choices as Array<{ message?: { content?: string } }>)?.at(0)?.message?.content || '[]';

    console.log('[GenerateKnowledge] AI返回原始内容长度:', rawContent.length);
    console.log('[GenerateKnowledge] AI返回原始内容预览:', rawContent.substring(0, 500));

    // 解析JSON
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

    console.log('[GenerateKnowledge] 解析后的知识点原始顺序:');
    (rawParsed as Record<string, unknown>[]).slice(0, 5).forEach((kp, i) => {
      console.log(`  ${i + 1}. [${kp.page}页] ${kp.name || kp.title || '未知'}`);
    });

    // 标准化知识点
    knowledgePoints = (rawParsed as Record<string, unknown>[]).map((kp, index) => {
      const page = typeof kp.page === 'number' ? kp.page 
        : typeof kp.pageNumber === 'number' ? kp.pageNumber 
        : null;
      
      const name = String(kp.name || kp.title || `知识点${index + 1}`);
      
      return {
        id: (kp.id as number) || (index + 1),
        name,
        type: normalizeType(kp.type as string || (kp.category as string) || '概念'),
        description: String(kp.description || kp.desc || (kp.content as string) || ''),
        keyPoints: Array.isArray(kp.keyPoints) ? kp.keyPoints : [],
        page,
      };
    });

    // 后端强制按页码排序
    knowledgePoints.sort((a, b) => (a.page || 999) - (b.page || 999));

    console.log('[GenerateKnowledge] 排序后的知识点顺序:');
    knowledgePoints.slice(0, 5).forEach((kp, i) => {
      console.log(`  ${i + 1}. [${kp.page}页] ${kp.name}`);
    });

    // 第一个知识点校验 - 检查是否从起始页开始
    if (knowledgePoints.length > 0) {
      const first = knowledgePoints[0];
      const firstPage = first.page;
      
      if (firstPage && firstPage !== startPage) {
        console.warn(`[GenerateKnowledge] 警告: 第一个知识点页码不正确: 第${firstPage}页，预期第${startPage}页`);
        console.warn(`[GenerateKnowledge] 知识点名: "${first.name}"`);
      } else {
        console.log(`[GenerateKnowledge] 第一个知识点页码正确: 第${startPage}页 "${first.name}"`);
      }
    }

    console.log('[GenerateKnowledge] 最终共提取 ' + knowledgePoints.length + ' 个知识点');
    console.log('[GenerateKnowledge] 页码范围验证:', {
      expectedRange: `${startPage}-${endPage}`,
      actualPages: knowledgePoints.map(kp => kp.page).filter(Boolean).slice(0, 5)
    });

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

function resolveExplicitSectionId(explicitId: unknown, chapterTitle: string): string {
  const raw = String(explicitId || '').trim();
  if (raw) return raw;
  return extractSectionId(chapterTitle) || chapterTitle;
}

function extractSectionId(title: string): string | null {
  const match = title.match(/(?:第\s*)?(\d+(?:\.\d+)+)(?:\s*节?)?/);
  return match ? match[1] : null;
}

function normalizeType(type: string): string {
  const typeMap: Record<string, string> = {
    '概念': '概念', '定义': '定义', '符号': '符号', '性质': '性质',
    '方法': '方法', '注意': '注意', '注意点': '注意', '注意事项': '注意',
    '关系': '关系', '关系与区别': '关系', '公式': '公式', '公式与定律': '公式',
    '定理': '性质', '规律': '性质', '法则': '性质', '技巧': '方法', '步骤': '方法',
  };
  return typeMap[type] || '概念';
}
