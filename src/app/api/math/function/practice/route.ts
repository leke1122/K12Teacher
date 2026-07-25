/**
 * 函数知识点练习生成 API
 * 使用 AI 生成 + 严格知识点验证
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNodeById, functionGraphNodes } from '@/data/math/functionKnowledgeGraph';

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;

interface PracticeRequest {
  userId: string;
  nodeId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
  apiKey?: string;
}

// 每个知识点对应的禁止内容（超纲知识点）
const NODE_FORBIDDEN_TOPICS: Record<string, string[]> = {
  'func-basic': [
    '集合', '交集', '并集', '补集', '子集', '∈', '∩', '∪', '⊆', '⊇',
    'ℕ', 'ℤ', 'ℚ', 'ℝ', '数集', '元素与集合', '集合的关系',
    'A = {x |', 'B = {x |', 'A∩B', 'A∪B', 'A⊆B', 'A⊇B',
  ],
  'func-domain': [
    '集合', '交集', '并集', '补集', '子集',
  ],
  'func-monotonicity': [
    '集合', '交集', '并集', '补集', '子集', '奇偶性', '周期性',
  ],
  'func-parity': [
    '集合', '交集', '并集', '补集', '子集', '单调性', '周期性',
  ],
  'func-extreme': [
    '集合', '交集', '并集', '补集', '子集', '奇偶性',
  ],
  'func-range': [
    '集合', '交集', '并集', '补集', '子集',
  ],
  'linear-function': [
    '集合', '交集', '并集', '补集', '子集',
  ],
  'quadratic-function': [
    '集合', '交集', '并集', '补集', '子集',
  ],
  'power-function': [
    '集合', '交集', '并集', '补集', '子集',
  ],
  'exp-function': [
    '集合', '交集', '并集', '补集', '子集',
  ],
  'log-function': [
    '集合', '交集', '并集', '补集', '子集',
  ],
  'derivative-concept': [
    '集合', '交集', '并集', '补集', '子集',
  ],
};

// 验证题目是否包含禁止的知识点
function validateQuestion(questionText: string, nodeId: string): { valid: boolean; reason?: string } {
  const forbiddenTopics = NODE_FORBIDDEN_TOPICS[nodeId] || [];
  
  for (const topic of forbiddenTopics) {
    if (questionText.includes(topic)) {
      return { 
        valid: false, 
        reason: `包含超纲内容：${topic}` 
      };
    }
  }
  
  // 额外检查：函数基础概念不能出集合相关的题
  if (nodeId === 'func-basic') {
    // 检查是否包含集合表示法
    if (/\{[^}]*\|[^}]*\}/.test(questionText)) {
      return { valid: false, reason: '包含集合表示法 {x | ...}，这是集合章节的内容' };
    }
  }
  
  return { valid: true };
}

// 调用 DeepSeek API 生成题目
async function generateWithAI(nodeId: string, nodeLabel: string, count: number): Promise<Question[]> {
  if (!DEEPSEEK_API_KEY) {
    return [];
  }

  const forbiddenTopics = NODE_FORBIDDEN_TOPICS[nodeId] || [];
  const forbiddenStr = forbiddenTopics.length > 0 ? forbiddenTopics.join('、') : '无';

  const systemPrompt = `你是一位专业的高中数学教师。你需要根据指定的函数知识点生成练习题。

【核心原则】
1. 必须严格在指定知识点范围内出题
2. 禁止出任何超纲题目
3. 题目必须包含函数相关的关键词（f(x)、函数等）

【当前知识点】
${nodeLabel}

【禁止出现的关键词（出现即为超纲）】
${forbiddenStr}

【输出格式】
题1. [题目内容]
答案：[答案]
解析：[解析]

题2. [题目内容]
答案：[答案]
解析：[解析]`;

  const prompt = `请为知识点"${nodeLabel}"生成${count}道选择题和填空题。

【知识点名称】
${nodeLabel}

【禁止出现的关键词（出现即为超纲）】
${forbiddenStr}

【重要提示】
- 函数的概念（3.1）禁止出现集合相关题目
- 禁止出 "A = {x | ...}" 或 "B = {x | ...}" 格式的题
- 禁止出 "A∩B"、"A∪B"、"A⊆B" 等集合运算题
- 只能出纯函数相关的题目，如求 f(x) 的值、判断函数性质等

【示例题目（参考格式）】
✅ 已知 f(x) = x² + 1，求 f(2)
✅ 求函数 y = √(x-1) 的定义域
✅ 判断函数 f(x) = x² + 1 和 g(x) = x² + 1 是否相等
❌ 已知集合 A = {x | x² - 5x + 6 = 0}，求 A∩B（这是超纲题，禁止出）

【输出格式】
题1. [选择题，必须包含f(x)]
A. [选项]
B. [选项]
C. [选项]
D. [选项]
答案：[A/B/C/D]
解析：[解析]

题2. [填空题]
答案：[答案]
解析：[解析]`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      console.error('[FunctionPractice] AI API 错误:', response.status);
      return [];
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content || '';
    
    // 解析生成的题目
    return parseGeneratedQuestions(generatedText, nodeId);
  } catch (error) {
    console.error('[FunctionPractice] AI 生成失败:', error);
    return [];
  }
}

// 解析 AI 生成的题目
function parseGeneratedQuestions(text: string, nodeId: string): Question[] {
  const questions: Question[] = [];
  
  if (!text || text.trim().length < 10) {
    console.log('[FunctionPractice] AI 返回内容过短或为空');
    return [];
  }
  
  // 清理文本：移除可能的 markdown 代码块标记
  const cleanText = text
    .replace(/```(?:json)?/gi, '')
    .replace(/`/g, '')
    .trim();
  
  // 通用正则模式：匹配题号开头的内容
  const questionBlocks = cleanText.split(/(?:^|\n)(?:题|问题|练习)[\s\d]*/i)
    .filter(block => block.trim().length > 10)
    .map(block => block.trim());
  
  for (let i = 0; i < questionBlocks.length; i++) {
    const block = questionBlocks[i];
    const qNum = i + 1;
    
    // 尝试提取题目文本
    let questionText = '';
    let questionType: 'choice' | 'fill' = 'fill';
    let options: string[] | undefined = undefined;
    let answer = '';
    let explanation = '';
    
    // 检测是否为选择题（有 A B C D 选项）
    const hasOptions = /[A-D][.、)）]\s*[\u4e00-\u9fa5a-zA-Z0-9√()（）、。.]/.test(block);
    
    if (hasOptions) {
      questionType = 'choice';
      
      // 提取题目（选项之前的部分）
      const optionsMatch = block.match(/^([\s\S]+?)(?=[A-D][.、)）])/);
      if (optionsMatch) {
        questionText = optionsMatch[1].trim();
      }
      
      // 提取选项
      const optionMatches = block.match(/[A-D][.、)）]\s*([^\n]+)/g);
      if (optionMatches) {
        options = optionMatches.map(o => {
          const cleaned = o.replace(/^[A-D][.、)）]\s*/, '');
          return cleaned.trim();
        }).filter(o => o.length > 0);
      }
    } else {
      // 填空题
      questionText = block.split(/答案[：:]/)[0]?.trim() || block;
    }
    
    // 提取答案
    const answerMatch = block.match(/答案[：:]\s*([A-D]|[^\n]+?)(?=\n解析|$)/i);
    if (answerMatch) {
      answer = answerMatch[1].trim();
      // 如果是选择题，确保答案是单个字母
      if (questionType === 'choice' && /^[A-D]$/i.test(answer)) {
        answer = answer.toUpperCase();
      }
    }
    
    // 提取解析
    const explanationMatch = block.match(/解析[：:]\s*([\s\S]+?)$/i);
    if (explanationMatch) {
      explanation = explanationMatch[1].trim();
    }
    
    // 验证题目有效性
    if (questionText && answer) {
      // 验证是否包含超纲内容
      const validation = validateQuestion(questionText, nodeId);
      if (validation.valid) {
        questions.push({
          id: `${nodeId}_ai_${qNum}`,
          text: questionText.replace(/^\d+[.、)）]\s*/, ''), // 移除可能的题号
          type: questionType,
          options: questionType === 'choice' ? options : undefined,
          answer: questionType === 'choice' ? (answer.match(/[A-D]/i)?.[0]?.toUpperCase() || answer) : answer,
          explanation: explanation || '请参考相关知识点',
          difficulty: 'medium',
        });
      } else {
        console.log(`[FunctionPractice] 题目${qNum}验证失败:`, validation.reason);
      }
    }
  }
  
  // 如果解析出来的题目数量太少，尝试备用解析方法
  if (questions.length < 2) {
    console.log('[FunctionPractice] 主要解析方法提取题目不足，尝试备用解析');
    const fallbackQuestions = fallbackParse(text, nodeId);
    questions.push(...fallbackQuestions);
  }
  
  console.log(`[FunctionPractice] 共解析出 ${questions.length} 道有效题目`);
  return questions.slice(0, 5); // 最多返回5道题
}

// 备用解析方法：处理各种非标准格式
function fallbackParse(text: string, nodeId: string): Question[] {
  const questions: Question[] = [];
  
  // 移除 markdown 标记
  const cleanText = text.replace(/```/g, '').trim();
  
  // 按行分割，尝试找到题目-答案-解析模式
  const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l);
  
  let currentQuestion = '';
  let currentAnswer = '';
  let currentExplanation = '';
  let inQuestion = false;
  let qCount = 0;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('题') && /\d/.test(line)) {
      // 新题目开始，保存上一个题目
      if (currentQuestion) {
        qCount++;
        const validation = validateQuestion(currentQuestion, nodeId);
        if (validation.valid && currentAnswer) {
          questions.push({
            id: `${nodeId}_fb_${qCount}`,
            text: currentQuestion,
            type: 'fill',
            answer: currentAnswer,
            explanation: currentExplanation || '请参考相关知识点',
            difficulty: 'medium',
          });
        }
      }
      currentQuestion = line.replace(/题\s*\d+\s*[.、)）]/, '');
      currentAnswer = '';
      currentExplanation = '';
      inQuestion = true;
    } else if (lowerLine.includes('答案') || lowerLine.includes('回答')) {
      inQuestion = false;
      const match = line.match(/(?:答案|回答)[：:]\s*([^\n]+)/i);
      if (match) currentAnswer = match[1].trim();
    } else if (lowerLine.includes('解析') || lowerLine.includes('解释') || lowerLine.includes('说明')) {
      const match = line.match(/(?:解析|解释|说明)[：:]\s*([^\n]+)/i);
      if (match) currentExplanation = match[1].trim();
    } else if (inQuestion && currentQuestion) {
      // 继续累积题目文本
      currentQuestion += ' ' + line;
    }
  }
  
  // 保存最后一个题目
  if (currentQuestion && currentAnswer) {
    qCount++;
    const validation = validateQuestion(currentQuestion, nodeId);
    if (validation.valid) {
      questions.push({
        id: `${nodeId}_fb_${qCount}`,
        text: currentQuestion,
        type: 'fill',
        answer: currentAnswer,
        explanation: currentExplanation || '请参考相关知识点',
        difficulty: 'medium',
      });
    }
  }
  
  return questions;
}

export async function POST(request: NextRequest) {
  try {
    const body: PracticeRequest = await request.json();
    const { nodeId, difficulty = 'medium', count = 3, apiKey } = body;

    if (!nodeId) {
      return NextResponse.json({ success: false, error: '请指定知识点' }, { status: 400 });
    }

    const node = getNodeById(nodeId);
    if (!node) {
      return NextResponse.json({ success: false, error: '知识点不存在' }, { status: 404 });
    }

    // 优先使用 AI 生成题目
    const aiQuestions = await generateWithAI(nodeId, node.label, count);
    
    // 如果 AI 生成成功且题目通过验证，使用 AI 题目
    if (aiQuestions.length > 0) {
      // 再次验证每道题目
      const validQuestions = aiQuestions.filter(q => validateQuestion(q.text, nodeId).valid);
      if (validQuestions.length > 0) {
        return NextResponse.json({
          success: true,
          nodeId: node.id,
          nodeLabel: node.label,
          questions: validQuestions,
          source: 'ai',
        });
      }
    }

    // 回退到内置题库
    const questions = getBuiltinQuestions(nodeId, node.label, count);
    
    // 过滤验证
    const validQuestions = questions.filter(q => validateQuestion(q.text, nodeId).valid);
    
    return NextResponse.json({
      success: true,
      nodeId: node.id,
      nodeLabel: node.label,
      questions: validQuestions.length > 0 ? validQuestions : questions,
      source: 'builtin',
    });
  } catch (error) {
    console.error('[FunctionPractice] 错误:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

interface Question {
  id: string;
  text: string;
  type: 'choice' | 'fill' | 'solve';
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

function getBuiltinQuestions(nodeId: string, nodeLabel: string, count: number): Question[] {
  // 增强的内置题库，包含更精准的题目（无集合相关内容）
  const questionBank: Record<string, Question[]> = {
    'func-basic': [
      {
        id: `${nodeId}_1`,
        text: '已知函数 f(x) = 2x + 3，求 f(5) 的值',
        type: 'fill',
        answer: '13',
        explanation: 'f(5) = 2×5 + 3 = 13',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '已知函数 f(x) = x² - 1，求 f(-2) 的值',
        type: 'fill',
        answer: '3',
        explanation: 'f(-2) = (-2)² - 1 = 4 - 1 = 3',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_3`,
        text: '函数 f(x) = 3x + 2 的定义域是？',
        type: 'choice',
        options: ['A. x > 0', 'B. x ≥ 0', 'C. x ∈ R', 'D. x ≠ 0'],
        answer: 'C',
        explanation: '一次函数的定义域是全体实数 R',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_4`,
        text: '判断函数 f(x) = x³ 和 g(x) = x³ + 1 是否为同一函数',
        type: 'choice',
        options: ['A. 是', 'B. 否', 'C. 无法判断', 'D. 取决于 x 的值'],
        answer: 'B',
        explanation: '两函数的对应关系不同（g(x) = f(x) + 1），所以不是同一函数',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_5`,
        text: '已知 f(x) = √(x + 1)，则 f(3) = ?',
        type: 'fill',
        answer: '2',
        explanation: 'f(3) = √(3 + 1) = √4 = 2',
        difficulty: 'easy',
      },
    ],
    'func-domain': [
      {
        id: `${nodeId}_1`,
        text: '函数 f(x) = 1/(x - 2) 的定义域是？',
        type: 'choice',
        options: ['A. x ≠ 2', 'B. x > 2', 'C. x < 2', 'D. x ∈ R'],
        answer: 'A',
        explanation: '分母不能为零，所以 x ≠ 2',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '函数 f(x) = √(5 - x) 的定义域是？',
        type: 'choice',
        options: ['A. x ≥ 5', 'B. x > 5', 'C. x ≤ 5', 'D. x < 5'],
        answer: 'C',
        explanation: '偶次根号内需要 ≥ 0，即 5 - x ≥ 0，所以 x ≤ 5',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_3`,
        text: '函数 f(x) = √(x + 1) + 1/(x - 3) 的定义域是？',
        type: 'fill',
        answer: 'x ≥ -1 且 x ≠ 3',
        explanation: '需满足 x + 1 ≥ 0 且 x - 3 ≠ 0，即 x ≥ -1 且 x ≠ 3',
        difficulty: 'medium',
      },
    ],
    'func-monotonicity': [
      {
        id: `${nodeId}_1`,
        text: '函数 f(x) = 2x + 3 在 R 上的单调性是？',
        type: 'choice',
        options: ['A. 增函数', 'B. 减函数', 'C. 常数函数', 'D. 非单调'],
        answer: 'A',
        explanation: 'k = 2 > 0，所以是一次函数的增函数',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '函数 f(x) = -3x + 1 在 R 上的单调性是？',
        type: 'choice',
        options: ['A. 增函数', 'B. 减函数', 'C. 常数函数', 'D. 非单调'],
        answer: 'B',
        explanation: 'k = -3 < 0，所以是一次函数的减函数',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_3`,
        text: '已知 f(x) = x²，判断 f(x) 在 (0, +∞) 上的单调性',
        type: 'choice',
        options: ['A. 增函数', 'B. 减函数', 'C. 常数函数', 'D. 非单调'],
        answer: 'A',
        explanation: '在 (0, +∞) 上，x 越大 x² 越大，所以是增函数',
        difficulty: 'easy',
      },
    ],
    'func-parity': [
      {
        id: `${nodeId}_1`,
        text: '判断 f(x) = x² 的奇偶性',
        type: 'choice',
        options: ['A. 奇函数', 'B. 偶函数', 'C. 非奇非偶', 'D. 既奇又偶'],
        answer: 'B',
        explanation: 'f(-x) = (-x)² = x² = f(x)，满足偶函数定义',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '判断 f(x) = x³ 的奇偶性',
        type: 'choice',
        options: ['A. 奇函数', 'B. 偶函数', 'C. 非奇非偶', 'D. 既奇又偶'],
        answer: 'A',
        explanation: 'f(-x) = (-x)³ = -x³ = -f(x)，满足奇函数定义',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_3`,
        text: '判断 f(x) = x² + 1 的奇偶性',
        type: 'choice',
        options: ['A. 奇函数', 'B. 偶函数', 'C. 非奇非偶', 'D. 既奇又偶'],
        answer: 'B',
        explanation: 'f(-x) = (-x)² + 1 = x² + 1 = f(x)，所以是偶函数',
        difficulty: 'easy',
      },
    ],
    'func-extreme': [
      {
        id: `${nodeId}_1`,
        text: '函数 f(x) = x² - 4x + 3 的最小值是？',
        type: 'fill',
        answer: '-1',
        explanation: 'f(x) = (x-2)² - 1，最小值为 -1',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '函数 f(x) = -x² + 4x - 1 的最大值是？',
        type: 'fill',
        answer: '3',
        explanation: 'f(x) = -(x-2)² + 3，最大值为 3',
        difficulty: 'medium',
      },
    ],
    'linear-function': [
      {
        id: `${nodeId}_1`,
        text: '一次函数 y = 2x + 1 的图像经过第几象限？',
        type: 'choice',
        options: ['A. 一、二', 'B. 一、三', 'C. 二、四', 'D. 一、三、四'],
        answer: 'B',
        explanation: 'k = 2 > 0, b = 1 > 0，图像经过一、三象限，且与 y 轴交于正半轴',
        difficulty: 'easy',
      },
    ],
    'quadratic-function': [
      {
        id: `${nodeId}_1`,
        text: '二次函数 y = x² - 4x + 3 的顶点坐标是？',
        type: 'choice',
        options: ['A. (2, -1)', 'B. (2, 1)', 'C. (-2, -1)', 'D. (-2, 1)'],
        answer: 'A',
        explanation: '顶点 x = -b/(2a) = 4/2 = 2，y = 4 - 8 + 3 = -1',
        difficulty: 'medium',
      },
      {
        id: `${nodeId}_2`,
        text: '二次函数 y = -x² + 2x + 3 的开口方向是？',
        type: 'choice',
        options: ['A. 向上', 'B. 向下', 'C. 不确定', 'D. 平行于 x 轴'],
        answer: 'B',
        explanation: 'a = -1 < 0，所以开口向下',
        difficulty: 'easy',
      },
    ],
    'exp-function': [
      {
        id: `${nodeId}_1`,
        text: '指数函数 y = 2ˣ 的图像恒过哪个点？',
        type: 'choice',
        options: ['A. (0, 0)', 'B. (0, 1)', 'C. (1, 0)', 'D. (1, 1)'],
        answer: 'B',
        explanation: '任何指数函数都恒过点 (0, 1)，因为 a⁰ = 1',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '比较大小：2⁰·⁵ 和 2⁰·⁶',
        type: 'choice',
        options: ['A. 2⁰·⁵ > 2⁰·⁶', 'B. 2⁰·⁵ < 2⁰·⁶', 'C. 相等', 'D. 无法比较'],
        answer: 'B',
        explanation: '底数 2 > 1，指数越大函数值越大',
        difficulty: 'easy',
      },
    ],
    'log-function': [
      {
        id: `${nodeId}_1`,
        text: 'log₂8 = ?',
        type: 'fill',
        answer: '3',
        explanation: '2³ = 8，所以 log₂8 = 3',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: 'log₃9 = ?',
        type: 'fill',
        answer: '2',
        explanation: '3² = 9，所以 log₃9 = 2',
        difficulty: 'easy',
      },
    ],
    'derivative-concept': [
      {
        id: `${nodeId}_1`,
        text: '已知 f(x) = x²，求 f\'(x)',
        type: 'fill',
        answer: '2x',
        explanation: '(x²)\' = 2x',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '已知 f(x) = 3x + 1，求 f\'(x)',
        type: 'fill',
        answer: '3',
        explanation: '(3x + 1)\' = 3',
        difficulty: 'easy',
      },
    ],
  };

  const bankQuestions = questionBank[nodeId] || [];
  
  if (bankQuestions.length > 0) {
    return bankQuestions.slice(0, Math.min(count, bankQuestions.length));
  }

  // 通用的函数基础题（避免集合相关）
  return [
    {
      id: `${nodeId}_1`,
      text: `关于【${nodeLabel}】的练习题：已知 f(x) = x + 1，求 f(2)`,
      type: 'fill',
      answer: '3',
      explanation: 'f(2) = 2 + 1 = 3',
      difficulty: 'easy',
    },
  ];
}
