import { NextRequest, NextResponse } from 'next/server';

/**
 * 生成段落相关问题（严谨版本）
 * 根据原文内容生成严谨、无歧义、符合教材规范的选择题
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      content,       // 原文内容
      explanation,   // AI讲解内容
      keyPoints,    // 核心要点
      sectionId,    // 段落ID
      apiKey        // API密钥
    } = await request.json();

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    console.log(`[TextbookQuestion] 生成问题，段落ID: ${sectionId}`);

    // 检测内容是否为有效正文
    const validation = validateTextbookContent(content);
    if (!validation.valid) {
      return NextResponse.json({
        success: true,
        questionId: `q_${sectionId}_${Date.now()}`,
        question: '内容验证失败',
        options: [
          'A. 内容非正文',
          'B. 请重新选择章节',
          'C. 可能是封面或目录',
          'D. 请检查页码设置'
        ],
        correctAnswer: 'A',
        explanation: `当前内容可能无效：${validation.reason}`
      });
    }

    // 构建严谨的提示词
    const systemPrompt = `你是一位严谨的高中数学教师，擅长设计有明确教材依据的练习题。

出题原则：
1. 题目必须基于教材原文，不能凭空编造
2. 正确答案在教材中有明确表述
3. 错误选项必须是"明显、彻底错误"的，不能似是而非
4. 所有选项互斥，不能有两个都正确的情况
5. 题目表述精确，不使用"通常""一般""可能"等模糊词汇
6. 选项之间要有明确的区分度

【核心规则】错误选项设计指南：
- ❌ 禁止：将原文关键词换成相近词（如"按学科"→"按作者"）
- ❌ 禁止：将原文数量/条件稍作改动（如"正、负、零"→"正、负"）
- ❌ 禁止：两个选项都部分正确、让人难以判断
- ✅ 必须：错误选项与原文有明显的、容易发现的矛盾
- ✅ 正确示范：
  原文："整数分成正、负、零"
  正确选项：A. 整数分成正、负、零
  错误选项：B. 整数只分成正数和负数（明显遗漏了"零"）
             C. 整数分成奇数和偶数（完全不同的分类标准）
             D. 整数分成正、负、一（"一"不是整数分类）

【重要】如果教材原文没有明确表述某个知识点，不要强行出题。`;

    const userPrompt = `请根据以下【教材原文】生成1道选择题。

【教材原文】（必须严格依据此内容出题）：
"""
${content}
"""

${explanation ? `【AI讲解】（参考）：\n${explanation}\n` : ''}
${keyPoints?.length ? `【核心要点】：\n${keyPoints.join('、')}\n` : ''}

出题要求（必须严格遵守）：
1. 题目必须基于教材原文，不能超出原文范围
2. 正确答案在原文中必须有明确的文字依据
3. 错误选项必须是"明显彻底错误"的，设计时先写出每个选项与原文的矛盾点
4. 选项之间互斥，不能有两个选项都是正确的
5. 题目表述精确，用词严谨
6. 难度：基础题，考察核心概念理解
7. 如果原文没有明确表述该知识点，请返回 canGenerate: false
8. 为每个选项写出判断理由（用于生成解释）：
   - 正确选项：说明原文哪句话支持
   - 错误选项：说明为什么与原文矛盾

【禁止】
- 不要出"通常""一般""可能"这类模糊题
- 不要出多个选项都可能正确的问题
- 不要出超出原文范围的问题
- 不要出有明显争议的问题
- 禁止将原文关键词替换为相近词作为错误选项

返回格式（严格JSON）：
{
  "canGenerate": true/false,
  "reason": "如果canGenerate为false，说明原因",
  "question": "题目内容（精确表述）",
  "options": ["A. 选项内容", "B. 选项内容", "C. 选项内容", "D. 选项内容"],
  "correct": "A/B/C/D",
  "explanation": "答案解析，必须说明教材依据",
  "optionReasoning": {
    "A": "判断理由（为什么对或错，与原文哪里矛盾）",
    "B": "判断理由",
    "C": "判断理由",
    "D": "判断理由"
  }
}`;

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
            temperature: 0.2,
            max_tokens: 2000
          })
        });

        if (!response.ok) {
          throw new Error('API请求失败');
        }

        const data = await response.json();
        const result = parseQuestion(data.choices?.[0]?.message?.content || '', sectionId);
        
        console.log(`[TextbookQuestion] 问题生成成功`);
        
        return NextResponse.json({
          success: true,
          ...result
        });
      } catch {
        return NextResponse.json({
          success: true,
          ...getDefaultQuestion(content, sectionId)
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...getDefaultQuestion(content, sectionId)
    });

  } catch (error) {
    console.error('[TextbookQuestion] 处理失败:', error);
    return NextResponse.json({
      success: true,
      ...getDefaultQuestion('处理失败，请重试', 0)
    });
  }
}

/**
 * 检测内容是否为有效正文
 */
function validateTextbookContent(text: string): { valid: boolean; reason: string } {
  if (!text || text.length < 50) {
    return { valid: false, reason: '内容太短' };
  }

  const coverPatterns = ['普通高中教科书', 'SHUXUE', '定价', 'ISBN', '人民教育出版社', '目录'];
  const validPatterns = ['集合', '元素', '函数', '方程', '不等式', '定义', '性质', '定理', '证明', '例题'];

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

/**
 * 解析AI返回的问题
 */
function parseQuestion(content: string, sectionId: number): {
  canGenerate: boolean;
  reason?: string;
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
} {
  try {
    let jsonStr = content.trim();
    
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    try {
      const parsed = JSON.parse(jsonStr);
      
      if (parsed.canGenerate === false) {
        return {
          canGenerate: false,
          reason: parsed.reason || '教材无明确表述',
          questionId: `q_${sectionId}_${Date.now()}`,
          question: '教材无明确表述，无法出题',
          options: ['A. 跳过此段', 'B. 继续学习', 'C. 查看讲解', 'D. 返回目录'],
          correctAnswer: 'A',
          explanation: parsed.reason || '原文中没有足够的信息来出一道严谨的题目'
        };
      }

      return {
        canGenerate: true,
        questionId: `q_${sectionId}_${Date.now()}`,
        question: parsed.question || '请选择正确答案',
        options: parseOptions(parsed.options),
        correctAnswer: parseAnswer(parsed.correct),
        explanation: parsed.explanation || ''
      };
    } catch {
      // 尝试从文本提取
    }

    // 尝试正则提取
    const canGenerateMatch = content.match(/"canGenerate"\s*:\s*(true|false)/);
    if (canGenerateMatch && canGenerateMatch[1] === 'false') {
      return {
        canGenerate: false,
        reason: '教材无明确表述',
        questionId: `q_${sectionId}_${Date.now()}`,
        question: '这道题无法从教材中生成',
        options: ['A. 跳过', 'B. 继续', 'C. 查看讲解', 'D. 返回'],
        correctAnswer: 'A',
        explanation: '原文中没有足够的信息来出一道严谨的题目'
      };
    }

    return getDefaultQuestion('', sectionId);
  } catch {
    return getDefaultQuestion('', sectionId);
  }
}

/**
 * 解析选项数组
 */
function parseOptions(options: unknown): string[] {
  if (Array.isArray(options)) {
    return options.map(opt => String(opt));
  }
  if (typeof options === 'string') {
    const optionMatches = options.match(/[A-D]\.\s*[^"\]\\]*(?:\\.[^"\]\\]*)*/g);
    if (optionMatches) {
      return optionMatches.map(opt => opt.trim());
    }
    return options.split(',').map(s => s.trim().replace(/"/g, '')).slice(0, 4);
  }
  return [];
}

/**
 * 解析答案（统一为大写字母）
 */
function parseAnswer(answer: string | undefined): string {
  if (!answer) return 'B';
  const letter = answer.toUpperCase().match(/[A-D]/);
  return letter ? letter[0] : 'B';
}

/**
 * 获取默认问题（当API不可用时）
 */
function getDefaultQuestion(content: string, sectionId: number): {
  canGenerate: boolean;
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
} {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('集合') && lowerContent.includes('元素')) {
    return {
      canGenerate: true,
      questionId: `q_${sectionId}_${Date.now()}`,
      question: '根据教材，组成集合的对象称为？',
      options: [
        'A. 元素',
        'B. 集合',
        'C. 数集',
        'D. 子集'
      ],
      correctAnswer: 'A',
      explanation: '教材原文明确指出：组成集合的对象叫做集合的元素。'
    };
  }
  
  if (lowerContent.includes('确定性') || lowerContent.includes('互异性') || lowerContent.includes('无序性')) {
    return {
      canGenerate: true,
      questionId: `q_${sectionId}_${Date.now()}`,
      question: '集合具有确定性，其含义是？',
      options: [
        'A. 集合中的元素互不相同',
        'B. 集合中的元素无顺序之分',
        'C. 对象是否属于集合是明确的',
        'D. 集合可以用列举法表示'
      ],
      correctAnswer: 'C',
      explanation: '教材规定：确定性是指一个对象是否属于这个集合是可以明确判断的。'
    };
  }

  return {
    canGenerate: true,
    questionId: `q_${sectionId}_${Date.now()}`,
    question: '这段内容主要讲述了哪个概念？',
    options: [
      'A. 完全理解了',
      'B. 部分理解',
      'C. 不太理解',
      'D. 完全不懂'
    ],
    correctAnswer: 'A',
    explanation: '请认真阅读原文，确保理解核心内容。'
  };
}
