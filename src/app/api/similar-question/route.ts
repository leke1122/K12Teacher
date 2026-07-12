import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

/**
 * 生成同类型题
 * 基于原题生成一道相似但不同的练习题
 */
export async function POST(request: NextRequest) {
  try {
    const {
      originalQuestion,
      knowledgePoint,
      difficulty = 'medium',
      pdfContext = '',
      apiKey,
    } = await request.json();

    if (!originalQuestion) {
      return NextResponse.json({ error: '原题不能为空' }, { status: 400 });
    }

    // 使用通义千问 API（优先从请求体获取key，其次环境变量）
    const qwenApiKey = apiKey || process.env.QWEN_API_KEY || '';
    const openai = createOpenAI({ apiKey: qwenApiKey, baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' });

    const prompt = `你是一位高中数学教师，擅长设计变式练习题。

【核心能力】
基于已有题目，设计一道"同类型"的新题，要求：
1. 考察同一知识点（知识点保持一致）
2. 题型相同但数据/情境不同
3. 难度相近
4. 选项设计保持一致风格

【出题原则】
- 新题必须是原创的，不能复制原题
- 保持核心考察点不变，但表现形式可以变化
- 数据可以改变，但必须合理
- 题目要具体明确，有实际数值，不要泛泛而谈

【返回格式】（严格JSON）
{
  "question": {
    "id": "q_similar_1",
    "text": "变式题目内容（数学公式用LaTeX，如 $2^3=8$）",
    "type": "choice|fill|calculation",
    "options": ["A. 选项", "B. 选项", "C. 选项", "D. 选项"],
    "correctAnswer": "A",
    "explanation": "详细解题思路",
    "knowledgePoint": "知识点",
    "difficulty": "medium",
    "commonMistakes": ["常错1", "常错2"]
  },
  "similarity": "与原题的相似点说明"
}

直接输出JSON，不要加任何格式标记。`;

    try {
      const result = await generateText({
        model: openai('qwen-plus'),
        messages: [{ role: 'user', content: `${prompt}\n\n【原题】\n${originalQuestion}\n\n【知识点】\n${knowledgePoint || '集合与子集'}\n\n【出题要求】\n请生成一道与上述题目"同类型"的变式练习题，考察相同的知识点，题型相同（选择/填空/计算），难度中等。` }],
        maxTokens: 2000,
      });

      const content = result.text || '';
      const parsed = parseSimilarQuestion(content);

      return NextResponse.json({ success: true, ...parsed });
    } catch (err) {
      console.error('[SimilarQuestion] API失败:', err);
      return NextResponse.json({
        success: true,
        question: generateDefaultSimilar(originalQuestion, knowledgePoint, difficulty)
      });
    }
  } catch (error) {
    console.error('[SimilarQuestion] 处理失败:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}

function parseSimilarQuestion(content: string): any {
  let jsonStr = content.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

  try {
    const parsed = JSON.parse(jsonStr);
    const q = parsed.question || parsed;
    return {
      question: {
        id: 'q_similar_' + Date.now(),
        text: q.text || q.question || '变式题',
        type: ['choice', 'fill', 'calculation'].includes(q.type) ? q.type : 'choice',
        options: Array.isArray(q.options) ? q.options.map((opt: string, i: number) =>
          opt.startsWith(String.fromCharCode(65 + i) + '.') ? opt : `${String.fromCharCode(65 + i)}. ${opt}`
        ) : [],
        correctAnswer: String(q.correctAnswer || 'A').toUpperCase().match(/[A-D]/) ? String(q.correctAnswer).toUpperCase().match(/[A-D]/)?.[0] || 'A' : 'A',
        explanation: q.explanation || '请参考解析',
        knowledgePoint: q.knowledgePoint || '',
        difficulty: q.difficulty || 'medium',
        commonMistakes: Array.isArray(q.commonMistakes) ? q.commonMistakes : [],
      },
      similarity: parsed.similarity || '基于原题改编',
    };
  } catch {
    return {
      question: generateDefaultSimilar('', '', 'medium'),
      similarity: '生成失败，使用默认题',
    };
  }
}

function generateDefaultSimilar(original: string, knowledgePoint: string, difficulty: string): any {
  return {
    id: 'q_similar_default',
    text: `变式练习：${knowledgePoint || '知识点'}相关练习题（请参考教材内容作答）`,
    type: 'choice',
    options: ['A. 正确', 'B. 错误', 'C. 不确定', 'D. 无法判断'],
    correctAnswer: 'A',
    explanation: '请结合教材内容分析判断',
    knowledgePoint: knowledgePoint || '',
    difficulty,
    commonMistakes: ['审题不清'],
  };
}
