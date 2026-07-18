/**
 * 函数知识点练习生成 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getNodeById, functionGraphNodes } from '@/data/math/functionKnowledgeGraph';

interface PracticeRequest {
  userId: string;
  nodeId?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  count?: number;
  apiKey?: string;
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

    // 生成练习题
    const questions = await generateQuestions(node.id, node.label, difficulty, count, apiKey);

    return NextResponse.json({
      success: true,
      nodeId: node.id,
      nodeLabel: node.label,
      questions,
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

async function generateQuestions(
  nodeId: string,
  nodeLabel: string,
  difficulty: string,
  count: number,
  apiKey?: string
): Promise<Question[]> {
  // 内置练习题库
  const questionBank: Record<string, Question[]> = {
    'func-basic': [
      {
        id: `${nodeId}_1`,
        text: '函数 f(x) = √(x-1) 的定义域是？',
        type: 'choice',
        options: ['A. x≥0', 'B. x>1', 'C. x≥1', 'D. x≠1'],
        answer: 'C',
        explanation: '根号内需要≥0，即x-1≥0，所以x≥1',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '已知 f(x) = 2x+1，求 f(3) = ?',
        type: 'fill',
        answer: '7',
        explanation: 'f(3) = 2×3+1 = 7',
        difficulty: 'easy',
      },
    ],
    'func-domain': [
      {
        id: `${nodeId}_1`,
        text: '函数 f(x) = 1/(x-2) 的定义域是？',
        type: 'choice',
        options: ['A. x≠2', 'B. x>2', 'C. x<2', 'D. x≥2'],
        answer: 'A',
        explanation: '分母不能为零，所以x≠2',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '函数 f(x) = √(3-x) + 1/(x-1) 的定义域是？',
        type: 'solve',
        answer: 'x<3 且 x≠1',
        explanation: '需满足 3-x≥0 且 x-1≠0，即 x≤3 且 x≠1',
        difficulty: 'medium',
      },
    ],
    'func-monotonicity': [
      {
        id: `${nodeId}_1`,
        text: '函数 f(x) = 2x+3 在 R 上是什么单调性？',
        type: 'choice',
        options: ['A. 增函数', 'B. 减函数', 'C. 常数函数', 'D. 非单调'],
        answer: 'A',
        explanation: 'k=2>0，所以是增函数',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '判断 f(x) = -x²+1 在 (-∞,0] 上的单调性',
        type: 'choice',
        options: ['A. 增函数', 'B. 减函数', 'C. 先增后减', 'D. 常数'],
        answer: 'A',
        explanation: '对称轴x=0，在(-∞,0]上y随x增大而增大',
        difficulty: 'medium',
      },
    ],
    'func-parity': [
      {
        id: `${nodeId}_1`,
        text: '判断 f(x) = x² 的奇偶性',
        type: 'choice',
        options: ['A. 奇函数', 'B. 偶函数', 'C. 非奇非偶', 'D. 既奇又偶'],
        answer: 'B',
        explanation: 'f(-x) = (-x)² = x² = f(x)，所以是偶函数',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '判断 f(x) = x³ + x 的奇偶性',
        type: 'choice',
        options: ['A. 奇函数', 'B. 偶函数', 'C. 非奇非偶', 'D. 既奇又偶'],
        answer: 'A',
        explanation: 'f(-x) = (-x)³ + (-x) = -x³ - x = -(x³+x) = -f(x)',
        difficulty: 'medium',
      },
    ],
    'exp-function': [
      {
        id: `${nodeId}_1`,
        text: '指数函数 y = 2ˣ 的图像恒过哪个点？',
        type: 'choice',
        options: ['A. (0,0)', 'B. (0,1)', 'C. (1,0)', 'D. (1,1)'],
        answer: 'B',
        explanation: '任何指数函数都恒过点(0,1)，因为a⁰=1',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '比较大小：0.5² ___ 0.5³（填 >, <, 或 =）',
        type: 'fill',
        answer: '>',
        explanation: '底数0<a<1时，指数越大值越小',
        difficulty: 'easy',
      },
    ],
    'log-function': [
      {
        id: `${nodeId}_1`,
        text: 'log₂8 = ?',
        type: 'fill',
        answer: '3',
        explanation: '2³=8，所以 log₂8 = 3',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '对数函数 y = logₐx (a>1) 的单调性是？',
        type: 'choice',
        options: ['A. 增函数', 'B. 减函数', 'C. 常数函数', 'D. 不确定'],
        answer: 'A',
        explanation: '当底数a>1时，对数函数是增函数',
        difficulty: 'easy',
      },
    ],
    'quadratic-function': [
      {
        id: `${nodeId}_1`,
        text: '二次函数 y = x²-4x+3 的顶点坐标是？',
        type: 'choice',
        options: ['A. (2,-1)', 'B. (2,1)', 'C. (-2,-1)', 'D. (-2,1)'],
        answer: 'A',
        explanation: '顶点 x = -b/2a = 4/2 = 2，y = 4-8+3 = -1',
        difficulty: 'medium',
      },
      {
        id: `${nodeId}_2`,
        text: '二次函数 y = -x²+2x+3 的最大值是？',
        type: 'fill',
        answer: '4',
        explanation: '顶点y值最大，y = -(1)²+2×1+3 = 4',
        difficulty: 'medium',
      },
    ],
    'derivative-concept': [
      {
        id: `${nodeId}_1`,
        text: '已知 f(x) = x²，求 f\'(x) = ?',
        type: 'fill',
        answer: '2x',
        explanation: '(x²)\' = 2x',
        difficulty: 'easy',
      },
      {
        id: `${nodeId}_2`,
        text: '导数的几何意义是？',
        type: 'choice',
        options: ['A. 切线长度', 'B. 切线斜率', 'C. 割线斜率', 'D. 函数值'],
        answer: 'B',
        explanation: '导数表示函数在该点的切线斜率',
        difficulty: 'easy',
      },
    ],
  };

  // 获取题库中的题，或使用默认题
  const bankQuestions = questionBank[nodeId] || [];
  
  if (bankQuestions.length > 0) {
    return bankQuestions.slice(0, Math.min(count, bankQuestions.length));
  }

  // 生成通用练习
  return [
    {
      id: `${nodeId}_1`,
      text: `关于【${nodeLabel}】，以下说法正确的是？`,
      type: 'choice',
      options: [
        'A. 这是基础知识点的考察',
        'B. 需要理解概念才能解答',
        'C. 需要多做练习巩固',
        'D. 以上都对',
      ],
      answer: 'D',
      explanation: nodeLabel + '是函数学习的基础内容，需要扎实掌握',
      difficulty: 'easy',
    },
  ];
}
