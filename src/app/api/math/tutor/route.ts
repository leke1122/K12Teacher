/**
 * 数学导师 API - 苏格拉底式引导
 * 通过分步提问引导学生自主思考解题
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 接口输入/输出类型
interface TutorRequest {
  question_id: string;
  student_message: string;
  turn_history?: Array<{ role: 'ai' | 'user'; content: string }>;
  apiKey?: string;
}

interface TutorResponse {
  success: boolean;
  response: string;
  is_correct?: boolean;
  next_action?: 'continue' | 'generate_similar' | 'hint';
  turn: number;
  hint_level?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: TutorRequest = await request.json();
    const { question_id, student_message, turn_history = [] } = body;

    if (!question_id) {
      return NextResponse.json({ success: false, error: 'question_id 不能为空' }, { status: 400 });
    }

    // 优先从请求头，其次从 body，其次从环境变量
    const apiKey = request.headers.get('x-qwen-api-key')
      || request.headers.get('x-api-key')
      || body.apiKey
      || process.env.QWEN_API_KEY
      || process.env.DEEPSEEK_API_KEY
      || '';

    // 从 Supabase 获取题目信息
    let questionData = {
      question: '',
      correct_answer: '',
      knowledge_point: '',
      user_answer: '',
    };

    if (supabase) {
      const { data, error } = await supabase
        .from('wrong_questions')
        .select('question, correct_answer, knowledge_point, user_answer')
        .eq('id', question_id)
        .single();

      if (!error && data) {
        questionData = {
          question: data.question || '',
          correct_answer: data.correct_answer || '',
          knowledge_point: data.knowledge_point || '',
          user_answer: data.user_answer || '',
        };
      }
    }

    // 计算当前轮次
    const currentTurn = Math.floor(turn_history.length / 2) + 1;

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(questionData, currentTurn, turn_history);

    // 调用 DeepSeek API
    const deepseekApiKey = apiKey || process.env.DEEPSEEK_API_KEY || '';
    
    if (!deepseekApiKey) {
      // 无 API Key 时的模拟响应
      const response = generateSimulatedResponse(questionData, student_message, currentTurn);
      return NextResponse.json(response);
    }

    try {
      const result = await callDeepSeek(systemPrompt, student_message, deepseekApiKey);
      const parsed = JSON.parse(result);
      
      // 如果判断正确，更新数据库状态
      if (parsed.is_correct && supabase) {
        await supabase
          .from('wrong_questions')
          .update({ remediation_status: 'mastered' })
          .eq('id', question_id);
      }

      return NextResponse.json({
        success: true,
        response: parsed.response || parsed.content || '继续加油！',
        is_correct: parsed.is_correct || false,
        next_action: parsed.is_correct ? 'generate_similar' : 'continue',
        turn: currentTurn,
        hint_level: parsed.hint_level,
      });
    } catch (apiError) {
      console.error('[MathTutor] API 调用失败:', apiError);
      // API 失败时返回模拟响应
      const response = generateSimulatedResponse(questionData, student_message, currentTurn);
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('[MathTutor] 处理失败:', error);
    return NextResponse.json(
      { success: false, error: '处理失败' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  questionData: { question: string; correct_answer: string; knowledge_point: string; user_answer: string },
  turn: number,
  history: Array<{ role: string; content: string }>
): string {
  const { question, correct_answer, knowledge_point, user_answer } = questionData;

  // 根据轮次构建不同的引导策略
  const baseInstructions = `你是"数学导师小明"，一位严厉但耐心的数学教师。你的任务是引导学生自主思考解题，而不是直接给出答案。

【核心原则】
1. 禁止直接告诉学生最终答案或完整解题步骤
2. 只指出一步的错误或给出一个引导性问题
3. 每次回复控制在 50-100 字
4. 使用鼓励性语言，但严格要求思考过程`;

  const questionContext = `
【题目信息】
题目：${question || '（未获取到题目）'}
正确答案：${correct_answer || '（未获取到答案）'}
知识点：${knowledge_point || '高中数学'}
学生错误答案：${user_answer || '（无）'}`;

  const historyContext = history.length > 0 
    ? `\n【对话历史】\n${history.map(m => `${m.role === 'ai' ? '导师' : '学生'}：${m.content}`).join('\n')}`
    : '';

  // 根据轮次给出不同的引导
  if (turn === 1) {
    return `${baseInstructions}
${questionContext}
${historyContext}

【第一轮引导】
请分析题目的已知条件和求解目标，然后问学生："你打算从哪里入手解决这个问题？"
用苏格拉底式提问引导学生分析题意。`;
  }

  if (turn === 2) {
    return `${baseInstructions}
${questionContext}
${historyContext}

【第二轮引导】
学生已经给出了初步思路。现在请：
1. 指出学生思路中的关键问题（如果有）
2. 给出一个小提示（但不是最终答案）
3. 再次提问引导学生深入思考

注意：不要直接计算最终结果。`;
  }

  if (turn === 3) {
    return `${baseInstructions}
${questionContext}
${historyContext}

【第三轮引导 - 深度提示】
如果学生连续答错，这是最后一步的详细拆解。请：
1. 给出更具体的解题步骤提示
2. 可以展示公式或方法的正确使用方式
3. 但仍不要直接写出最终计算过程
4. 引导学生完成最后一步`;
  }

  // 后续轮次
  return `${baseInstructions}
${questionContext}
${historyContext}

【继续引导】
学生仍在思考中。请继续用提问的方式引导，必要时可以给出更多提示，但保持苏格拉底式风格。`;
}

async function callDeepSeek(systemPrompt: string, userMessage: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API 失败: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function generateSimulatedResponse(
  questionData: { question: string; correct_answer: string; knowledge_point: string },
  studentMessage: string,
  turn: number
): TutorResponse {
  const { knowledge_point } = questionData;
  
  // 简单的答案检测
  const studentAnswer = studentMessage.trim();
  const correctAnswer = questionData.correct_answer.trim();
  
  // 简单匹配（考虑数值答案）
  const isCorrect = correctAnswer && 
    (studentAnswer.includes(correctAnswer) || 
     normalizeMathAnswer(studentAnswer) === normalizeMathAnswer(correctAnswer));

  if (isCorrect) {
    return {
      success: true,
      response: '很好！你的解题思路完全正确。能够独立完成这道题说明你已经掌握了这个知识点。',
      is_correct: true,
      next_action: 'generate_similar',
      turn,
    };
  }

  // 根据轮次返回不同的引导
  if (turn === 1) {
    return {
      success: true,
      response: `关于${knowledge_point || '这个知识点'}，请先仔细读题。\n\n请问：你认为解决这道题需要用到哪个公式或定理？\n\n提示：可以回想一下这类题目的常见解法。`,
      is_correct: false,
      next_action: 'continue',
      turn,
    };
  }

  if (turn === 2) {
    return {
      success: true,
      response: `我注意到你的思路中有一点需要注意。\n\n请检查一下公式的代入是否正确：看看已知条件中的数值有没有用对。\n\n再想想：应该先算什么，后算什么？`,
      is_correct: false,
      next_action: 'continue',
      turn,
      hint_level: 1,
    };
  }

  // 第三轮及以后
  return {
    success: true,
    response: `好的，让我给你一个更具体的提示：\n\n**解题步骤参考：**\n1. 先找出题目给出的所有已知条件\n2. 确定需要使用的公式或定理\n3. 按照正确的顺序代入计算\n\n现在请重新计算，把每一步写清楚，看看结果是多少？`,
    is_correct: false,
    next_action: 'hint',
    turn,
    hint_level: 2,
  };
}

// 标准化数学答案用于比较
function normalizeMathAnswer(answer: string): string {
  return answer
    .replace(/\s+/g, '')
    .replace(/[（）()]/g, '')
    .replace(/[，。.]/g, '')
    .toLowerCase();
}
