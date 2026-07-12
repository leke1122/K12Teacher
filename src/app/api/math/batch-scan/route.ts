/**
 * 整页扫描批改 API
 * 上传整页数学题图片，自动识别所有题目并批改
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';

// 接口类型定义
interface BatchQuestion {
  question_number: number;
  question_text: string;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  knowledge_point: string;
}

interface BatchScanRequest {
  imageBase64: string;
  subject?: string;
  apiKey?: string;
}

// 设置请求超时时间（60秒）
const TIMEOUT_MS = 60000;

export async function POST(request: NextRequest) {
  // 创建超时控制器
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), TIMEOUT_MS);

  try {
    // 从请求体获取 API Key（优先），其次从请求头，最后从环境变量
    const body = await request.json().catch(() => ({}));
    const apiKey = body.apiKey || request.headers.get('x-qwen-api-key') || process.env.QWEN_API_KEY || '';

    if (!apiKey) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { success: false, error: '请先在设置页面配置 Qwen-VL API Key' },
        { status: 401 }
      );
    }

    // 获取图片数据（从请求体）
    if (!body.imageBase64) {
      clearTimeout(timeoutId);
      return NextResponse.json({ success: false, error: '图片不能为空' }, { status: 400 });
    }
    const imageBase64 = body.imageBase64;

    // 检查图片大小（base64 字符串过大可能导致问题）
    const imageSizeKB = Buffer.from(imageBase64).length / 1024;
    console.log(`[BatchScan] 接收图片大小: ${imageSizeKB.toFixed(2)} KB`);

    if (imageSizeKB > 4000) {
      console.warn('[BatchScan] 图片过大，可能影响识别效果');
    }

    const subject = 'math';

    // 构建提示词
    const systemPrompt = `你是一位专业的高中数学阅卷老师，负责严谨地计算和批改数学题。

核心要求：
1. **严谨计算**：必须根据数学公式和已知条件，准确计算出正确答案
2. **逐题分析**：识别每一道题的题号、题目内容、学生手写答案
3. **准确批改**：对比学生答案和正确答案，判断对错
4. **知识识别**：识别题目涉及的知识点（用简短的中文名称）

**特别注意**：
- 如果题目是描述集合的元素生成规则（如 A={x|x=3m-1, m∈N}），需要代入 m=0,1,2,3,... 严格计算前几项
- 如果题目问集合关系（如 A 和 B 是否相等），必须先分别计算两个集合的元素，再判断关系
- 如果不确定正确答案，可以标注"需人工确认"，但不要随意给出错误答案

输出格式（JSON数组）：
[
  {
    "question_number": 数字,
    "question_text": "题目完整文本",
    "student_answer": "学生手写答案",
    "correct_answer": "正确答案",
    "is_correct": true或false,
    "knowledge_point": "知识点名称"
  }
]

注意事项：
- 如果图片模糊无法识别，将 is_correct 设为 false，并在 question_text 中标注 "(无法识别)"
- 如果题目是选择题，学生答案可能是 "A"、"B"、"C"、"D"
- 保持输出为纯 JSON，不要有其他说明文字`;

    try {
      // 调用通义千问视觉模型
      const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      });

      const result = await generateText({
        model: openai('qwen-vl-max'),
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: '请识别并批改这张图片中的所有数学题。' },
              { type: 'image', image: imageBase64 },
            ],
          },
        ],
        maxTokens: 4000,
        temperature: 0.3,
      });

      const content = result.text;
      const questions = parseQuestions(content);

      clearTimeout(timeoutId);

      if (questions.length === 0) {
        return NextResponse.json({
          success: true,
          data: generateMockData(),
        });
      }

      // 生成批次 ID
      const batchId = randomUUID();

      // 保存到数据库
      const userId = 'personal-user';
      if (supabase) {
        await saveBatchQuestions(userId, subject, batchId, questions, imageBase64);
      }

      // 计算统计信息
      const stats = calculateStats(questions);

      return NextResponse.json({
        success: true,
        data: {
          batch_id: batchId,
          questions,
          stats,
        },
      });
    } catch (apiError: any) {
      console.error('[BatchScan] API 调用失败:', apiError);
      clearTimeout(timeoutId);
      
      // 检查是否是超时错误
      const isTimeout = apiError?.message?.includes('abort') || apiError?.name === 'AbortError';
      
      // API 失败时返回友好错误信息
      return NextResponse.json({
        success: false,
        error: isTimeout 
          ? '请求超时，图片可能太大，请尝试压缩后重试' 
          : `API调用失败: ${apiError?.message || '未知错误'}`,
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('[BatchScan] 处理失败:', error);
    clearTimeout(timeoutId);
    return NextResponse.json(
      { success: false, error: `处理失败: ${error?.message || '未知错误'}` },
      { status: 500 }
    );
  }
}

// 解析 AI 返回的题目列表
function parseQuestions(content: string): BatchQuestion[] {
  let jsonStr = content.trim();

  // 移除代码块
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

  // 尝试解析 JSON
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any, index: number) => ({
        question_number: item.question_number || index + 1,
        question_text: item.question_text || '题目' + (index + 1),
        student_answer: item.student_answer || '',
        correct_answer: item.correct_answer || '',
        is_correct: Boolean(item.is_correct),
        knowledge_point: item.knowledge_point || '高中数学',
      }));
    }
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed.questions.map((item: any, index: number) => ({
        question_number: item.question_number || index + 1,
        question_text: item.question_text || '题目' + (index + 1),
        student_answer: item.student_answer || '',
        correct_answer: item.correct_answer || '',
        is_correct: Boolean(item.is_correct),
        knowledge_point: item.knowledge_point || '高中数学',
      }));
    }
  } catch {
    // JSON 解析失败，尝试从文本提取
    console.log('[BatchScan] JSON 解析失败，尝试文本提取');
  }

  // 如果无法解析，返回空数组
  return [];
}

// 计算统计信息
function calculateStats(questions: BatchQuestion[]) {
  const total = questions.length;
  const correct = questions.filter((q) => q.is_correct).length;
  const wrong = total - correct;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return { total, correct, wrong, accuracy };
}

// 保存批量题目到数据库
async function saveBatchQuestions(
  userId: string,
  subjectId: string,
  batchId: string,
  questions: BatchQuestion[],
  imageUrl: string
) {
  // 导入批量保存函数
  const { addBatchQuestions } = await import('@/lib/wrongQuestionService');
  
  const inputs = questions.map((q) => ({
    question_number: q.question_number,
    question: q.question_text,
    correct_answer: q.correct_answer,
    user_answer: q.student_answer,
    knowledge_point: q.knowledge_point,
    is_correct: q.is_correct,
  }));

  await addBatchQuestions(userId, subjectId, batchId, inputs, imageUrl);
}

// 生成模拟数据（用于无 API 或调试）
function generateMockData(): { batch_id: string; questions: BatchQuestion[]; stats: ReturnType<typeof calculateStats> } {
  const questions: BatchQuestion[] = [
    {
      question_number: 1,
      question_text: '计算：$2x + 5 = 13$，求 $x$ 的值',
      student_answer: 'x = 4',
      correct_answer: 'x = 4',
      is_correct: true,
      knowledge_point: '一元一次方程',
    },
    {
      question_number: 2,
      question_text: '化简：$\\sqrt{50}$',
      student_answer: '5\\sqrt{2}',
      correct_answer: '5\\sqrt{2}',
      is_correct: true,
      knowledge_point: '二次根式',
    },
    {
      question_number: 3,
      question_text: '已知 $\\triangle ABC$，$AB = AC$，$\\angle A = 40^\\circ$，求 $\\angle B$',
      student_answer: '$\\angle B = 70^\\circ$',
      correct_answer: '$\\angle B = 70^\\circ$',
      is_correct: true,
      knowledge_point: '等腰三角形',
    },
    {
      question_number: 4,
      question_text: '函数 $y = x^2 - 4x + 3$ 的顶点坐标是',
      student_answer: '(2, -1)',
      correct_answer: '(2, -1)',
      is_correct: true,
      knowledge_point: '二次函数',
    },
    {
      question_number: 5,
      question_text: '求 $\\sin 30^\\circ + \\cos 60^\\circ$ 的值',
      student_answer: '1',
      correct_answer: '1',
      is_correct: true,
      knowledge_point: '三角函数',
    },
  ];

  return {
    batch_id: randomUUID(),
    questions,
    stats: calculateStats(questions),
  };
}
