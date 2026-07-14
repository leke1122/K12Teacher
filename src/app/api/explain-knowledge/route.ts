import { NextRequest, NextResponse } from 'next/server';

/**
 * 通用知识点顺序依赖机制
 *
 * 核心原则：
 * - 知识点按顺序学习，第 N 个只能使用前 N 个的内容
 * - 自动根据 knowledgeIndex + allKnowledgeNames 计算已学/未学边界
 * - 适用于所有学科（数学、物理、化学、语文等）
 * - 全局生效，无需手动配置
 */

// ─── 通用提示词构建 ───────────────────────────────────────────────────────────

function buildUniversalPrompt(params: {
  knowledgeName: string;
  knowledgeType: string;
  description: string;
  pdfContext: string;
  knowledgeIndex: number;
  allKnowledgeNames: string[];
  attemptCount: number;
}): string {
  const { knowledgeName, knowledgeType, description, pdfContext, knowledgeIndex, allKnowledgeNames, attemptCount } = params;

  const total = allKnowledgeNames.length;
  // 已学：知识点 1 ~ 当前（含当前）
  const learned = allKnowledgeNames.slice(0, knowledgeIndex + 1);
  // 未学：知识点 N+1 ~ 总数
  const unlearned = allKnowledgeNames.slice(knowledgeIndex + 1);

  const learnedText = learned.join('、');
  const unlearnedText = unlearned.length > 0 ? unlearned.join('、') : '无（当前是最后一个知识点）';

  return `你是耐心、严谨的高中学科老师。请为学生讲解以下知识点。

## 当前学习位置
- 当前知识点：第 ${knowledgeIndex + 1} 个 / 共 ${total} 个
- 已学知识点（可以使用）：${learnedText}
- 未学知识点（禁止出现）：${unlearnedText}

## 当前知识点
- 名称：${knowledgeName}
- 类型：${knowledgeType}
${description ? `- 教材说明：${description}` : ''}
${pdfContext ? `\n## 教材内容\n${pdfContext.substring(0, 1500)}` : ''}
${attemptCount > 1 ? '\n⚠️ 学生之前答错了，请用更简单、更详细的例子重新讲解\n' : ''}

## 严格要求（必须严格遵守，违者回答错误）

1. **只讲当前**：讲解只围绕"${knowledgeName}"，不引入任何新的概念定义
2. **辅助复习**：可以用已学知识点辅助类比和举例
3. **绝对禁止**：严禁出现任何未学知识点中的概念、符号、术语——哪怕是常见常识
4. **例子纯净**：所有例子只能基于当前知识点和已学知识点，不能提前引入后续符号
5. **通俗易懂**：适合基础薄弱的学生，语言平实

## 讲解结构

**📖 讲什么**
- 简洁准确地解释当前知识点的核心定义
- 关键术语用 **加粗** 标记
- 不超过80字

**💡 怎么理解**
- 用一个生活化类比（只能涉及已学知识点）
- 贴近学生生活，容易理解
- 30-50字

**📝 举个例子**
- 一个具体的数学例子
- 只能基于当前知识点和已学知识点
- 50-80字

## 输出格式

直接返回JSON，不要有其他文字：
\`\`\`json
{
  "what": "讲什么的内容",
  "analogy": "生活化类比",
  "example": "具体的数学例子"
}
\`\`\``;
}

// ─── API 入口 ────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      knowledge,
      pdfContext,
      knowledgeIndex = 0,
      allKnowledgeNames = [],
      attemptCount = 1,
      apiKey,
      // 兼容旧版参数
      previousKnowledgeList = [],
      previousKnowledge
    } = body;

    if (!knowledge) {
      return NextResponse.json({ error: '知识点不能为空' }, { status: 400 });
    }

    const knowledgeName = typeof knowledge === 'string' ? knowledge : (knowledge.name || '');
    const description = typeof knowledge === 'string' ? '' : (knowledge.description || '');
    const knowledgeType = typeof knowledge === 'string' ? '概念' : (knowledge.type || '概念');

    // 统一构建 allKnowledgeNames（优先使用新版参数）
    const unifiedNames: string[] = Array.isArray(allKnowledgeNames) && allKnowledgeNames.length > 0
      ? allKnowledgeNames
      : (Array.isArray(previousKnowledgeList) && previousKnowledgeList.length > 0
          ? previousKnowledgeList
          : (previousKnowledge ? [previousKnowledge] : []));

    const unifiedIndex = (typeof knowledgeIndex === 'number' && knowledgeIndex >= 0)
      ? knowledgeIndex
      : 0;

    console.log('[ExplainKnowledge]', knowledgeName, `| 位置: ${unifiedIndex + 1}/${unifiedNames.length || '?'} | 已学: ${unifiedNames.slice(0, unifiedIndex).join(',') || '无'}`);

    const systemPrompt = '你是一位耐心、严谨的高中学科老师。请严格按照JSON格式输出。';
    const userPrompt = buildUniversalPrompt({
      knowledgeName,
      knowledgeType,
      description,
      pdfContext: pdfContext || '',
      knowledgeIndex: unifiedIndex,
      allKnowledgeNames: unifiedNames,
      attemptCount
    });

    let explanation: Record<string, string>;

    if (apiKey) {
      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500
          })
        });

        if (!response.ok) throw new Error('API请求失败');
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        explanation = parseExplanation(content, knowledgeName);
      } catch {
        explanation = getDefaultExplanation(knowledgeName, attemptCount);
      }
    } else {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'user', content: userPrompt }], systemPrompt })
        });
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || data.content || '';
        explanation = parseExplanation(content, knowledgeName);
      } catch {
        explanation = getDefaultExplanation(knowledgeName, attemptCount);
      }
    }

    console.log('[ExplainKnowledge] 生成成功:', explanation.what?.substring(0, 30));
    return NextResponse.json({ success: true, data: explanation });

  } catch (error) {
    console.error('[ExplainKnowledge] 处理失败:', error);
    return NextResponse.json({
      success: true,
      data: getDefaultExplanation('未知知识点', 1)
    });
  }
}

// ─── 解析 ────────────────────────────────────────────────────────────────────

function parseExplanation(content: string, knowledgeName: string): Record<string, string> {
  try {
    let jsonStr = content.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

    try {
      const parsed = JSON.parse(jsonStr);
      return {
        what: parsed.what || parsed['讲什么'] || `这是关于${knowledgeName}的核心概念`,
        analogy: parsed.analogy || parsed['怎么理解'] || getDefaultAnalogy(knowledgeName),
        example: parsed.example || parsed['举个例子'] || getDefaultExample(knowledgeName)
      };
    } catch { /* fall through */ }

    const whatMatch = jsonStr.match(/"what"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    const analogyMatch = jsonStr.match(/"analogy"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    const exampleMatch = jsonStr.match(/"example"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);

    if (whatMatch || analogyMatch || exampleMatch) {
      const unescape = (s: string | undefined) =>
        s?.replace(/\\n/g, '\n').replace(/\\"/g, '"') || '';
      return {
        what: unescape(whatMatch?.[1]) || `这是关于${knowledgeName}的核心概念`,
        analogy: unescape(analogyMatch?.[1]) || getDefaultAnalogy(knowledgeName),
        example: unescape(exampleMatch?.[1]) || getDefaultExample(knowledgeName)
      };
    }

    return getDefaultExplanation(knowledgeName, 1);
  } catch {
    return getDefaultExplanation(knowledgeName, 1);
  }
}

// ─── 默认内容 ────────────────────────────────────────────────────────────────

function getDefaultExplanation(knowledgeName: string, attemptCount: number): Record<string, string> {
  return {
    what: `**${knowledgeName}**是本章的重要概念。${attemptCount > 1 ? '让我们用更简单的方式重新理解~' : ''}`,
    analogy: getDefaultAnalogy(knowledgeName),
    example: getDefaultExample(knowledgeName)
  };
}

function getDefaultAnalogy(knowledgeName: string): string {
  const name = knowledgeName.toLowerCase();
  if (name.includes('集合')) return '想象一个"收纳盒"，里面装的是具有某种共同特点的东西，就像你的笔袋。';
  if (name.includes('元素')) return '就像班级里的每个同学，"小明"是"高一(1)班"这个集合里的一个元素。';
  if (name.includes('确定性')) return '就像一把尺子量的结果是确定的——每个人量出来是多少就是多少。';
  if (name.includes('互异性')) return '就像你的身份证号全国独一无二，集合里的元素不能重复。';
  if (name.includes('无序性')) return '就像穿衣服的顺序不重要——先穿袜子还是先穿鞋，最后都是穿戴整齐出门。';
  if (name.includes('子集')) return '就像俄罗斯套娃——小盒子里的东西，大盒子里肯定都有。';
  if (name.includes('空集')) return '就是一个空的收纳盒，什么都没装。就像"没有参加运动会的同学"。';
  if (name.includes('函数')) return '函数就像一台"加工机器"：投入原料(x)，按规则加工，产出产品(y)。';
  if (name.includes('数列')) return '数列就像一排多米诺骨牌，每个骨牌都有编号(1号、2号...)，每个编号对应一个数。';
  return `可以把"${knowledgeName}"想象成一个生活中的常见场景，这样更容易理解。`;
}

function getDefaultExample(knowledgeName: string): string {
  const name = knowledgeName.toLowerCase();
  if (name.includes('集合')) return '比如"我们班的同学"就是一个集合，{小明, 小红, 小刚}表示包含这三个同学的集合。';
  if (name.includes('元素')) return '设A={1,2,3}，则1、2、3都是A的元素。';
  if (name.includes('确定性')) return '"身高超过1米8"能组成集合吗？能！因为对每个人我们都能明确判断。';
  if (name.includes('子集')) return '设A={1,2}，B={1,2,3}，因为1∈A且1∈B，2∈A且2∈B，所以A⊆B。';
  if (name.includes('空集')) return '"比10大的个位数"是空集！因为个位数最大是9，空集用∅表示。';
  if (name.includes('函数')) return 'f(x)=2x+1是一个函数，当x=3时，f(3)=2×3+1=7。';
  if (name.includes('数列')) return '比如1,3,5,7...就是等差数列，第5项是9。';
  return `学习"${knowledgeName}"时，可以多做练习来加深理解。`;
}
