import { NextRequest, NextResponse } from 'next/server';

/**
 * AI讲解单个段落 + 生成核心概念问题
 * 讲解用通俗语言，出题紧密围绕核心概念和章节学习目标
 */

// 章节上下文映射：辅助AI理解当前段落与核心概念的关联
const CHAPTER_CONTEXT: Record<string, { coreConcept: string; learningGoal: string; sectionPurpose: string }> = {
  // 高中数学必修一
  '1.1.1': {
    coreConcept: '集合',
    learningGoal: '理解集合的概念，学会用集合的语言描述数学对象',
    sectionPurpose: '通过分类引入集合思想——分类是为了让研究对象更有条理'
  },
  '1.1.2': {
    coreConcept: '集合的表示方法',
    learningGoal: '掌握列举法和描述法表示集合',
    sectionPurpose: '学习如何用数学语言精确描述集合'
  },
  '1.2.1': {
    coreConcept: '集合的基本关系',
    learningGoal: '理解子集、真子集、相等概念',
    sectionPurpose: '比较不同集合之间的关系'
  },
  default: {
    coreConcept: '本章核心概念',
    learningGoal: '理解本节内容，与已学知识建立联系',
    sectionPurpose: '通过具体例子理解抽象概念'
  }
};

export async function POST(request: NextRequest) {
  try {
    const {
      content,           // 原文内容
      context,           // 前面已学内容
      previousExplanation, // 上一次的讲解（答错后重新讲解时使用）
      attemptCount = 1,  // 尝试次数
      sectionId = '',    // 章节ID（如"1.1.1"）
      chapterContext,    // 可选：传入的章节上下文
      apiKey             // API密钥
    } = await request.json();

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    console.log(`[TextbookExplain] 讲解段落，长度: ${content.length}，尝试次数: ${attemptCount}，章节: ${sectionId}`);

    // 检测内容是否为有效正文
    const validation = validateTextbookContent(content);
    if (!validation.valid) {
      console.log(`[TextbookExplain] 内容验证失败: ${validation.reason}`);
      return NextResponse.json({
        success: true,
        explanation: `⚠️ 当前提取的内容可能是：${validation.reason}\n\n请检查页码设置是否正确，确保选择的是正文章节。`,
        keyPoints: ['请选择正确的章节页码'],
        isWarning: true
      });
    }

    // 获取章节上下文
    const ctx = chapterContext || CHAPTER_CONTEXT[sectionId] || CHAPTER_CONTEXT.default;

    // 构建提示词
    const isRetry = attemptCount > 1;

    const systemPrompt = `你是一位温和耐心的数学老师，擅长用最通俗的语言解释教材内容。
你的风格：
- 讲解生动有趣，像朋友聊天一样
- 善于用生活化类比解释抽象概念
- 语言简单，基础薄弱的学生也能听懂
- 不讲废话，直击核心

重要：你必须严格按照【原文内容】进行讲解，不要添加原文没有的知识点。`;

    const userPrompt = isRetry
      ? `学生没能理解下面的内容，请换一种更简单、更直观的方式重新讲解。

【原文内容】（必须严格依据此内容讲解，不要偏离）：
${content}
${previousExplanation ? `\n之前的讲解：\n${previousExplanation}\n` : ''}

要求：
1. 用完全不同的角度和比喻来解释
2. 从最简单的例子开始
3. 把复杂概念拆解成最简单的步骤
4. 特别强调容易出错的地方
5. 只讲解原文涉及的内容，不要延伸`
      : `请用最通俗的语言讲解下面的【原文内容】：

【原文内容】（必须严格依据此内容讲解）：
${content}

【前面已学内容】（可作为参考）：
${context || '无'}

要求：
1. 只讲解上面这段原文的内容，不要添加原文没有的知识点
2. 用生活化的类比帮助学生理解
3. 解释关键术语的含义
4. 语言简单，基础弱的学生也能听懂
5. 直击核心，不要废话
6. 讲解长度150-200字左右

【重要】如果上面这段内容是封面、目录、索引等非正文内容，请直接说明"这是封面/目录内容，请选择正文章节进行学习"，不要强行讲解。`;

    // 调用 DeepSeek API
    if (apiKey) {
      try {
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
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          throw new Error('API请求失败');
        }

        const data = await response.json();
        const { explanation, keyPoints } = parseExplanation(data.choices?.[0]?.message?.content || '', content);

        console.log(`[TextbookExplain] 讲解成功`);

        // 生成核心概念问题
        const questionResult = await generateCoreConceptQuestion({
          content,
          explanation,
          keyPoints,
          ctx,
          apiKey,
          attemptCount
        });

        return NextResponse.json({
          success: true,
          explanation,
          keyPoints,
          ...questionResult
        });
      } catch {
        // API失败，返回默认内容
        return NextResponse.json({
          success: true,
          ...getDefaultResult(content, ctx)
        });
      }
    }

    // 没有API Key，返回默认内容
    return NextResponse.json({
      success: true,
      ...getDefaultResult(content, ctx)
    });

  } catch (error) {
    console.error('[TextbookExplain] 处理失败:', error);
    return NextResponse.json({
      success: true,
      explanation: '处理失败，请重试',
      keyPoints: [],
      question: null
    });
  }
}

// ============ 核心概念问题生成 ============

interface QuestionContext {
  coreConcept: string;
  learningGoal: string;
  sectionPurpose: string;
}

async function generateCoreConceptQuestion(params: {
  content: string;
  explanation: string;
  keyPoints: string[];
  ctx: QuestionContext;
  apiKey: string;
  attemptCount: number;
}) {
  const { content, explanation, keyPoints, ctx, apiKey } = params;

  const systemPrompt = `你是一位严谨的高中数学教师，擅长设计考察"核心概念理解"的选择题。

你的出题理念：
- 问题服务于帮助学生理解"是什么"和"为什么"，而不是考查记忆
- 每个问题都要引导学生思考：这段内容如何帮助我理解核心概念？
- 避免问表面细节（原文里具体提到了什么对象），要问深层含义（这段内容的目的是什么、说明了什么道理）

出题规则：
1. 问题必须基于教材原文和AI讲解，不能凭空编造
2. 正确答案在教材中有明确依据或符合逻辑推导
3. 错误选项要"彻底错误"，有明显矛盾点
4. 选项之间互斥，不能有两个都正确
5. 禁止将原文关键词替换为相近词作为错误选项

【核心原则】问题类型优先级：
✅ 最高优先：考察段落目的/深层含义
  - "这段文字的主要目的是什么？"
  - "通过这段内容，作者想说明什么？"
  - "这段内容与【核心概念】有什么关系？"
  - "这段文字想引导我们思考什么？"

✅ 次高优先：考察方法/思想理解
  - "为什么要这样分类/比较/定义？"
  - "这种方法在数学中有什么作用？"
  - "这种思想的核心是什么？"

❌ 最低优先（尽量避免）：表面信息记忆
  - "原文提到了哪些具体例子？"（仅当这些例子对理解核心概念很关键时才问）

【禁止】
- 不要问"整数可以分成哪几类"这种只考表面细节的问题
- 不要问"图书馆的书按什么分类"这种纯粹记忆原文内容的问题
- 不要出"通常""一般""可能"这类模糊题
- 不要出多个选项都可能正确的问题`;

  const userPrompt = `请根据以下【教材原文】和【AI讲解】，生成1道选择题。

【教材原文】
"""
${content}
"""

【AI讲解】
${explanation}

【本章核心概念】${ctx.coreConcept}
【本节学习目标】${ctx.learningGoal}
【本段学习目的】${ctx.sectionPurpose}

出题要求：
1. 问题要考察学生对"这段内容想说明什么"的理解，而不是记住原文写了什么
2. 正确答案应该是：对理解【核心概念】有帮助的方向
3. 错误选项：可以是偏离核心的表面细节，或者是与核心思想矛盾的说法
4. 如果原文是引入性段落（举例子、类比），问题应该问"这些例子的目的是什么"，而不是问"例子具体是什么"
5. 难度：基础题，考察核心概念理解

返回格式（严格JSON）：
{
  "question": "题目内容",
  "options": ["A. 选项内容", "B. 选项内容", "C. 选项内容", "D. 选项内容"],
  "correct": "A/B/C/D",
  "explanation": "答案解析，说明为什么选这个"
}`;

  try {
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
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error('Question API request failed');
    }

    const data = await response.json();
    const questionResult = parseQuestionResult(data.choices?.[0]?.message?.content || '', content, ctx);

    console.log(`[TextbookQuestion] 问题生成成功: ${questionResult.question?.question || '解析失败'}`);
    return questionResult;
  } catch (err) {
    console.error('[TextbookQuestion] 生成失败:', err);
    return getDefaultQuestion(content, ctx);
  }
}

// ============ 解析函数 ============

function parseQuestionResult(content: string, contentForFallback: string, ctx: QuestionContext): {
  question: { question: string; options: string[]; correctAnswer: string; explanation: string } | null;
} {
  try {
    let jsonStr = content.trim();

    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    try {
      const parsed = JSON.parse(jsonStr);
      return {
        question: {
          question: parsed.question || '',
          options: parseOptions(parsed.options),
          correctAnswer: parseAnswer(parsed.correct),
          explanation: parsed.explanation || ''
        }
      };
    } catch {
      // continue
    }

    // Fallback
    return getDefaultQuestion(contentForFallback, ctx);
  } catch {
    return getDefaultQuestion(contentForFallback, ctx);
  }
}

function parseOptions(options: unknown): string[] {
  if (Array.isArray(options)) {
    return options.map(opt => String(opt)).slice(0, 4);
  }
  if (typeof options === 'string') {
    const matches = options.match(/[A-D][.、]\s*[^\[\]]{5,100}/g);
    if (matches) return matches.map(m => m.trim()).slice(0, 4);
  }
  return [];
}

function parseAnswer(answer: string | undefined): string {
  if (!answer) return 'B';
  const letter = answer.toUpperCase().match(/[A-D]/);
  return letter ? letter[0] : 'B';
}

// ============ 默认内容 ============

function getDefaultResult(content: string, ctx: QuestionContext) {
  return {
    explanation: getDefaultExplanation(content, ctx.coreConcept),
    keyPoints: getDefaultKeyPoints(content, ctx.coreConcept),
    question: getDefaultQuestion(content, ctx).question
  };
}

function getDefaultExplanation(content: string, coreConcept: string): string {
  const lowerContent = content.toLowerCase();

  if (coreConcept === '集合') {
    if (lowerContent.includes('集合') && lowerContent.includes('确定性')) {
      return `这段内容讲的是集合。简单理解，集合就是把一些具有共同特点的东西放在一起。比如"我们班的同学"就是一个集合，每个同学就是其中的一个元素。集合就像一个收纳盒，里面装的都是有共同点的东西。`;
    }
    if (lowerContent.includes('元素')) {
      return `这段内容讲的是"元素"。元素就是集合中的每一个对象。就像一个班级里每个同学都是"班级"这个集合的元素一样。`;
    }
    if (lowerContent.includes('确定性') || lowerContent.includes('互异性') || lowerContent.includes('无序性')) {
      return `这段内容讲的是集合的三大特点。第一是"确定性"：一个东西在不在集合里，必须能明确判断。第二是"互异性"：集合里的元素不能重复。第三是"无序性"：集合里的元素排不排顺序无所谓。`;
    }
  }

  return `这段教材内容比较重要，需要认真理解。建议结合老师讲解和例子来学习。`;
}

function getDefaultKeyPoints(content: string, coreConcept: string): string[] {
  const lowerContent = content.toLowerCase();

  if (coreConcept === '集合') {
    if (lowerContent.includes('确定性')) return ['确定性：能明确判断', '互异性：不能重复', '无序性：不考虑顺序'];
    if (lowerContent.includes('元素')) return ['元素是集合中的成员', '用∈表示属于', '元素必须能明确判定'];
    if (lowerContent.includes('集合')) return ['集合是一组对象的整体', '元素是集合中的个体', '共同特点是集合的关键'];
  }

  return ['认真阅读理解', '结合例子学习', '不理解的地方做标记'];
}

function getDefaultQuestion(content: string, ctx: QuestionContext): {
  question: { question: string; options: string[]; correctAnswer: string; explanation: string } | null
} {
  const lowerContent = content.toLowerCase();

  // 集合章节的引入段落（分类相关）
  if (ctx.coreConcept === '集合' && (lowerContent.includes('分类') || lowerContent.includes('图书馆') || lowerContent.includes('整数'))) {
    return {
      question: {
        question: '这段文字的主要目的是什么？',
        options: [
          'A. 介绍分类的标准和方法',
          `B. 通过具体例子引入"分类"思想，为学习集合做准备 ✓`,
          'C. 讲解整数和图书馆的分类规则',
          'D. 说明作文和图书管理的具体方法'
        ],
        correctAnswer: 'B',
        explanation: '这段文字通过图书馆、作文、整数分类等例子，引出"分类"思想，其目的是为后续学习"集合"概念做铺垫。'
      }
    };
  }

  // 确定性/互异性/无序性段落
  if (ctx.coreConcept === '集合' && (lowerContent.includes('确定性') || lowerContent.includes('互异性') || lowerContent.includes('无序性'))) {
    return {
      question: {
        question: '集合的"确定性"是指什么？',
        options: [
          'A. 集合中的元素互不相同',
          'B. 集合中的元素没有顺序',
          'C. 对象是否属于集合是明确的',
          'D. 集合可以用列举法表示'
        ],
        correctAnswer: 'C',
        explanation: '确定性是指：给定一个对象和一个集合，能明确判断这个对象是否属于这个集合，没有模棱两可的情况。'
      }
    };
  }

  // 元素段落
  if (ctx.coreConcept === '集合' && lowerContent.includes('元素')) {
    return {
      question: {
        question: '下列关于"元素"的说法，正确的是？',
        options: [
          'A. 元素是组成集合的对象',
          'B. 一个元素可以同时属于多个集合',
          'C. 集合中的元素必须有先后顺序',
          'D. 元素不能是抽象的概念'
        ],
        correctAnswer: 'A',
        explanation: '根据教材：集合是指具有某种特定性质的对象的总和，这些对象称为集合的元素。一个元素可以同时属于多个集合（如"高一学生"和"数学爱好者"）。'
      }
    };
  }

  // 通用理解性问题
  return {
    question: {
      question: '这段内容主要想说明什么？',
      options: [
        'A. 完全理解了',
        'B. 部分理解',
        'C. 不太理解',
        'D. 完全不懂'
      ],
      correctAnswer: 'A',
      explanation: '请认真阅读原文，确保理解核心内容。'
    }
  };
}

// ============ 辅助函数 ============

function validateTextbookContent(text: string): { valid: boolean; reason: string } {
  if (!text || text.length < 50) {
    return { valid: false, reason: '内容太短' };
  }

  const coverPatterns = [
    '普通高中教科书', 'SHUXUE', '定价', 'ISBN', '人民教育出版社',
    '目录', 'CONTENTS', ' Preface', '前言', '编写说明', '主编', '副主编',
  ];

  const validPatterns = [
    '集合', '元素', '函数', '方程', '不等式', '定义', '性质',
    '定理', '证明', '例题', '练习', '思考', '符号', '∈', '⊂',
    '列举法', '描述法', '数集', '自然数', '整数', '有理数', '实数',
    '确定性', '互异性', '无序性', '空集', '子集', '真子集',
  ];

  let coverCount = 0;
  let validCount = 0;

  for (const pattern of coverPatterns) {
    if (text.includes(pattern)) coverCount++;
  }
  for (const pattern of validPatterns) {
    if (text.includes(pattern)) validCount++;
  }

  if (coverCount >= 2 && validCount < 2) {
    return { valid: false, reason: '封面或目录内容' };
  }

  return { valid: true, reason: '' };
}

function parseExplanation(content: string, originalContent: string): { explanation: string; keyPoints: string[] } {
  try {
    let jsonStr = content.trim();

    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    try {
      const parsed = JSON.parse(jsonStr);
      return {
        explanation: parsed.explanation || parsed.讲解 || `这是关于"${originalContent.slice(0, 20)}..."的内容`,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : []
      };
    } catch {
      // 继续
    }

    if (content.includes('封面') || content.includes('目录') || content.includes('请选择')) {
      return {
        explanation: content,
        keyPoints: ['请检查页码设置']
      };
    }

    return {
      explanation: content,
      keyPoints: []
    };
  } catch {
    return { explanation: originalContent.slice(0, 100), keyPoints: [] };
  }
}
