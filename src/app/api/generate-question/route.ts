import { NextRequest, NextResponse } from 'next/server';

/**
 * 通用知识点顺序依赖机制 - 强化版
 *
 * 核心原则：
 * - 第 N 个知识点只能使用前 N 个的内容
 * - 支持全量知识点上下文：currentKnowledge + allKnowledge
 * - 自动构建允许/禁止列表
 * - 检测未学内容 + 自动重试（最多 3 次）
 * - 适用于所有学科所有章节
 */

// ─── 类型 ────────────────────────────────────────────────────────────────────

interface KnowledgeItem {
  name: string;
  content?: string;
  index: number;
}

interface RequestBody {
  currentKnowledge?: KnowledgeItem;
  allKnowledge?: KnowledgeItem[];
  knowledge?: KnowledgeItem | string;
  description?: string;
  pdfContext?: string;
  knowledgeIndex?: number;
  allKnowledgeNames?: string[];
  attemptNumber?: number;
  apiKey?: string;
  previousKnowledgeList?: string[];
  previousKnowledge?: string;
}

// ─── 入口 ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;

    // 兼容旧版
    const legacyKnowledge =
      typeof body.knowledge === 'string' ? body.knowledge : body.knowledge?.name || '';

    const knowledgeName = body.currentKnowledge?.name || legacyKnowledge;
    const knowledgeContent = body.currentKnowledge?.content || '';
    const knowledgeIndex = typeof body.currentKnowledge?.index === 'number'
      ? body.currentKnowledge.index
      : (typeof body.knowledgeIndex === 'number' ? body.knowledgeIndex : 0);

    // 统一知识点列表（优先使用新版 allKnowledge）
    const allKnowledge: KnowledgeItem[] = Array.isArray(body.allKnowledge) && body.allKnowledge.length > 0
      ? body.allKnowledge
      : (Array.isArray(body.allKnowledgeNames) && body.allKnowledgeNames.length > 0
          ? body.allKnowledgeNames.map((name, idx) => ({ name, content: '', index: idx }))
          : []);
    const description = body.description || '';
    const pdfContext = body.pdfContext || '';
    const attemptNumber = body.attemptNumber || 1;
    const apiKey = body.apiKey;

    if (!knowledgeName) {
      return NextResponse.json({ error: '知识点不能为空' }, { status: 400 });
    }

    const total = allKnowledge.length || 1;
    const learned = allKnowledge.slice(0, knowledgeIndex + 1);
    const unlearned = allKnowledge.slice(knowledgeIndex + 1);

    console.log(
      `[GenerateQuestion] ${knowledgeName} | 第${knowledgeIndex + 1}/${total} | 已学:${learned.map(k => k.name).join(',') || '无'} | 未学:${unlearned.map(k => k.name).join(',') || '无'}`
    );

    // 提取禁止关键词（从知识点名称 + 内容）
    const forbiddenKeywords: string[] = [];
    unlearned.forEach(k => {
      if (k.name) forbiddenKeywords.push(k.name.trim());
      if (k.content) {
        const terms = k.content
          .replace(/[{}()\[\]<>]/g, ' ')
          .split(/[,，.。、；;\s]+/)
          .filter(t => t.length >= 2 && t.length <= 20);
        forbiddenKeywords.push(...terms);
      }
    });
    // 去重
    const uniqueForbidden = Array.from(new Set(forbiddenKeywords));

    const systemPrompt = '你是一位严谨的高中学科教师，擅长设计有明确教材依据的练习题。';

    let userPrompt = buildStrictPrompt({
      knowledgeName,
      knowledgeContent,
      knowledgeIndex,
      total,
      learned,
      unlearned,
      uniqueForbidden,
      description,
      pdfContext,
      attemptNumber
    });

    // 最多重试 3 次（第 1 次是正常生成，如果含未学内容则重试 2 次）
    let lastResult: Record<string, unknown> | null = null;
    const maxAttempts = Math.max(1, attemptNumber);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      if (attempt > 1) {
        userPrompt += `\n\n⚠️ 第 ${attempt} 次生成：之前生成的题目中检测到了未学内容，已自动过滤。请重新生成，严格遵守已学范围。`;
      }

      let aiResult: Record<string, unknown>;
      if (apiKey) {
        aiResult = await generateWithAI(knowledgeName, attemptNumber, apiKey, systemPrompt, userPrompt);
      } else {
        aiResult = await generateWithInternal(knowledgeName, attemptNumber, systemPrompt, userPrompt);
      }

      // 后置检测（覆盖题目+选项+解析）
      const questionText = typeof aiResult.question === 'string' ? aiResult.question : '';
      const options = Array.isArray(aiResult.options) ? aiResult.options.map(String) : [];
      const explanation = typeof aiResult.explanation === 'string' ? aiResult.explanation : '';
      const fullText = questionText + ' ' + options.join(' ') + ' ' + explanation;

      const check = containsUnlearnedContent(fullText, uniqueForbidden, knowledgeIndex);
      if (!check.hasUnlearned) {
        console.log(`[GenerateQuestion] 生成成功（第${attempt}次），无未学内容`);
        return NextResponse.json(aiResult);
      }

      console.warn(`[GenerateQuestion] 第${attempt}次生成检测到未学内容: ${check.found.join(', ')}，准备重试`);
      lastResult = aiResult;

      if (attempt >= 3) break;
    }

    // 3 次都失败，仍返回最后一次结果（前端可展示提示）
    console.warn('[GenerateQuestion] 3次生成均检测到未学内容，返回最后一次结果');
    return NextResponse.json({
      ...(lastResult || {}),
      warning: '题目可能包含超出当前进度的内容，请仔细核对',
    });

  } catch (error) {
    console.error('[GenerateQuestion] 处理失败:', error);
    return NextResponse.json({ error: '生成问题失败：' + (error instanceof Error ? error.message : '未知错误') }, { status: 500 });
  }
}

// ─── 严格提示词 ─────────────────────────────────────────────────────────────

function buildStrictPrompt(params: {
  knowledgeName: string;
  knowledgeContent: string;
  knowledgeIndex: number;
  total: number;
  learned: KnowledgeItem[];
  unlearned: KnowledgeItem[];
  uniqueForbidden: string[];
  description: string;
  pdfContext: string;
  attemptNumber: number;
}): string {
  const {
    knowledgeName,
    knowledgeContent,
    knowledgeIndex,
    total,
    learned,
    unlearned,
    uniqueForbidden,
    description,
    pdfContext,
    attemptNumber
  } = params;

  const learnedText = learned.length > 0 ? learned.map(k => k.name).join('、') : '无';
  const unlearnedText = unlearned.length > 0 ? unlearned.map(k => k.name).join('、') : '无（当前是最后一个知识点）';
  const currentIndex1based = knowledgeIndex + 1;

  // 针对第 1 个知识点的额外规则
  const firstKnowledgeRule = knowledgeIndex === 0
    ? `
## 当前是第 1 个知识点（极其严格）
- 只能使用**自然语言**描述
- 禁止使用任何数学符号、化学式、物理公式、文言虚词等
- 具体禁止：∈、∉、{ }、|、=、>、<、+、-、×、÷、N、Z、Q、R、∑、∫ 等
- 如果用数学：只能出现汉字表述，如"属于""不属于""大于""小于"`
    : '';

  return `你是一位极其严谨的高中学科教师。请严格按照要求出1道选择题。

## 当前学习位置
- 当前知识点：第 ${currentIndex1based} 个 / 共 ${total} 个
- 当前知识点名称：${knowledgeName}
${knowledgeContent ? `- 当前知识点内容：${knowledgeContent}` : ''}
${description ? `- 教材说明：${description}` : ''}

## 知识点边界（必须严格遵守）
- ✅ 已学知识点（题目可以使用）：${learnedText}
- 🚫 未学知识点（绝对禁止出现）：${unlearnedText}

## 绝对禁止的关键词
以下词汇和概念绝对不能出现在题目或选项中：
${uniqueForbidden.length > 0 ? uniqueForbidden.map(t => `- "${t}"`).join('\n') : '- 无'}

${firstKnowledgeRule}

## 出题要求
1. 题目只能考察当前知识点，最多辅助使用已学知识点
2. 绝对不能出现任何未学知识点的概念、术语、符号
3. 选项必须互斥，答案唯一
4. 题目通俗易懂，适合初学者
5. ${attemptNumber > 1 ? '第二次出题，用不同角度考察同一概念，更简单直接' : '考察核心概念理解'}

${pdfContext ? `## 教材内容\n${pdfContext.substring(0, 1500)}` : ''}

## 输出格式
直接返回JSON，不要有其他文字：
\`\`\`json
{
  "canGenerate": true,
  "question": "题目内容",
  "options": ["A. 选项内容", "B. 选项内容", "C. 选项内容", "D. 选项内容"],
  "correctAnswer": "A/B/C/D",
  "explanation": "答案解析"
}
\`\`\``;
}

// ─── AI 调用 ────────────────────────────────────────────────────────────────

async function generateWithAI(
  knowledgeName: string,
  attemptNumber: number,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<Record<string, unknown>> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API请求失败');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  return parseAIResponse(content, knowledgeName, attemptNumber);
}

async function generateWithInternal(
  knowledgeName: string,
  attemptNumber: number,
  systemPrompt: string,
  userPrompt: string
): Promise<Record<string, unknown>> {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const response = await fetch(`${origin}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: userPrompt }], systemPrompt })
  });
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || data.content || '';
  return parseAIResponse(content, knowledgeName, attemptNumber);
}

// ─── 解析 ────────────────────────────────────────────────────────────────────

function parseAIResponse(content: string, knowledgeName: string, attemptNumber: number): Record<string, unknown> {
  try {
    let jsonStr = content.trim();
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.canGenerate === false) {
        return {
          canGenerate: false,
          reason: parsed.reason || '教材无明确表述',
          question: '教材无明确表述，无法出题',
          options: ['A. 跳过', 'B. 继续', 'C. 查看讲解', 'D. 返回'],
          correctAnswer: 'A',
          explanation: parsed.reason || '原文中没有足够的信息来出一道严谨的题目'
        };
      }
      return {
        canGenerate: true,
        questionId: `q_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
        question: parsed.question || `关于"${knowledgeName}"的说法正确的是？`,
        type: 'choice',
        options: parseOptions(parsed.options),
        correctAnswer: parseAnswer(parsed.correctAnswer),
        explanation: parsed.explanation || '这道题考查了对知识点的理解',
        hint: attemptNumber > 1 ? '再想想，可以用排除法~' : '仔细看题目哦',
        knowledgeName
      };
    } catch { /* fall through */ }

    const canGenerateMatch = content.match(/"canGenerate"\s*:\s*(true|false)/);
    if (canGenerateMatch && canGenerateMatch[1] === 'false') {
      return {
        canGenerate: false,
        reason: '教材无明确表述',
        question: '这道题无法从教材中生成',
        options: ['A. 跳过', 'B. 继续', 'C. 查看讲解', 'D. 返回'],
        correctAnswer: 'A',
        explanation: '原文中没有足够的信息来出一道严谨的题目'
      };
    }

    const questionMatch = content.match(/"question"\s*:\s*"([^"]*)"/);
    const answerMatch = content.match(/"correctAnswer"\s*:\s*"([^"]*)"/);
    const optionsMatch = content.match(/"options"\s*:\s*\[(.*?)\]/);
    const explanationMatch = content.match(/"explanation"\s*:\s*"([^"]*)"/);

    return {
      canGenerate: true,
      questionId: `q_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      question: questionMatch?.[1] || `关于"${knowledgeName}"的说法正确的是？`,
      type: 'choice',
      options: optionsMatch ? parseOptionsFromText(optionsMatch[1]) : null,
      correctAnswer: answerMatch ? parseAnswer(answerMatch[1]) : 'A',
      explanation: explanationMatch?.[1] || '这道题考查了对知识点的理解',
      hint: attemptNumber > 1 ? '再想想，可以用排除法~' : '仔细看题目哦',
      knowledgeName
    };
  } catch (error) {
    console.error('[GenerateQuestion] 解析AI响应失败:', error);
    return {
      canGenerate: true,
      questionId: `q_fallback_${Date.now()}`,
      question: `关于"${knowledgeName}"，你理解了吗？`,
      type: 'choice',
      options: ['A. 完全理解了', 'B. 部分理解', 'C. 不太理解', 'D. 完全不懂'],
      correctAnswer: 'A',
      explanation: '理解是慢慢积累的',
      hint: '可以再看一遍讲解',
      knowledgeName
    };
  }
}

// ─── 工具函数 ────────────────────────────────────────────────────────────────

function parseOptions(options: unknown): string[] | null {
  if (Array.isArray(options)) return options.map(opt => String(opt));
  if (typeof options === 'string') return parseOptionsFromText(options);
  return null;
}

function parseOptionsFromText(text: string): string[] {
  const optionMatches = text.match(/[A-D]\.\s*[^"\]\\]*(?:\\.[^"\]\\]*)*/g);
  if (optionMatches) return optionMatches.map(opt => opt.trim());
  return text.split(',').map(s => s.trim().replace(/"/g, '')).filter(Boolean).slice(0, 4);
}

function parseAnswer(answer: string | undefined): string {
  if (!answer) return 'A';
  const letter = answer.toUpperCase().match(/[A-D]/);
  return letter ? letter[0] : 'A';
}

// ─── 未学内容检测 ────────────────────────────────────────────────────────────

// 知识点别名映射：同一个概念可能有多种表述
const KNOWLEDGE_ALIASES: Record<string, string[]> = {
  // 集合相关
  '空集': ['∅', '空集'],
  '列举法': ['列举法表示', '用列举法'],
  '描述法': ['描述法表示', '用描述法', '{x |', '{x∈'],
  '属于': ['∈', '元素属于'],
  '不属于': ['∉', '元素不属于'],
  // 数集相关
  '自然数集 N': ['自然数集', 'N', '非负整数'],
  '正整数集 N*': ['正整数集', 'N*', 'N⁺', 'N+', '自然数集N*'],
  '整数集 Z': ['整数集', 'Z'],
  '有理数集 Q': ['有理数集', 'Q'],
  '实数集 R': ['实数集', 'R'],
  '数集': ['N', 'Z', 'Q', 'R', 'N*', 'Z*', 'Q*', 'R*'],
  // 集合表示
  '集合相等': ['A=B', '集合相等'],
  '子集': ['⊆', '子集关系'],
  '真子集': ['⊂', '真子集关系'],
  'Venn图': ['venn图', '维恩图', 'Venn图'],
};

/**
 * 检测文本中是否包含未学知识点内容（增强版）
 * 返回 { hasUnlearned: boolean, found: string[] }
 */
function containsUnlearnedContent(
  text: string,
  forbiddenKeywords: string[],
  currentIndex: number
): { hasUnlearned: boolean; found: string[] } {
  const found: string[] = [];

  // 1. 基础关键词检测
  for (const keyword of forbiddenKeywords) {
    if (!keyword || keyword.length < 2) continue;
    if (text.includes(keyword)) {
      found.push(keyword);
    }
  }

  // 2. 别名映射检测
  for (const [baseName, aliases] of Object.entries(KNOWLEDGE_ALIASES)) {
    // 如果禁止列表中有"空集"，也检查"∅"
    const baseForbidden = forbiddenKeywords.some(k => k.includes(baseName));
    if (baseForbidden) {
      for (const alias of aliases) {
        if (text.includes(alias)) {
          found.push(`${baseName}的别名"${alias}"`);
        }
      }
    }
    // 如果禁止列表中有别名，也检查基础名称
    const aliasForbidden = aliases.some(a => forbiddenKeywords.some(k => k.includes(a)));
    if (aliasForbidden && text.includes(baseName)) {
      found.push(baseName);
    }
  }

  // 3. 第 1 个知识点的额外符号检测
  if (currentIndex === 0) {
    const extraForbidden = [
      { pattern: /\{[^}]*\}/, name: '花括号{}' },
      { pattern: /[∈∉]/, name: '∈或∉' },
      { pattern: /\b(N|Z|Q|R|N\*|Z\*|Q\*|R\*)\b/, name: '数集符号' },
      { pattern: /[∑∫∞√π]/, name: '数学符号' },
      { pattern: /x\s*[=<>≤≥]|y\s*[=<>≤≥]/, name: '代数变量' },
      { pattern: /[+\-×÷]/.test(text) && /[=≤≥<>]/.test(text) ? /[+\-×÷]/ : null, name: '运算符号' },
    ];
    for (const item of extraForbidden) {
      if (item && item.pattern && item.pattern.test(text)) {
        found.push(`第1个知识点的禁止符号: ${item.name}`);
      }
    }
  }

  return { hasUnlearned: found.length > 0, found };
}
