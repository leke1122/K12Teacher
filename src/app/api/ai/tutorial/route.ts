/**
 * GeoGebra 引导式解题步骤生成 API
 * 根据几何数据生成逐步引导的问题和提示
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { GeometryData } from '@/types/geometry';

const TUTORIAL_SYSTEM_PROMPT = `你是一位高中数学金牌教练，擅长用苏格拉底式提问引导学生自主思考。

你将收到一个几何题目的结构化数据（可能是立体几何、空间向量或函数图像）。
你的任务是生成 5-7 个引导步骤，每一步包含：
- hint：对该步骤的提示（不是答案）
- question：引导学生思考的具体问题
- geogebraHighlight：GeoGebra 中应高亮的对象名称（如 "AB"、"面ABC"）
- expectedAnswer：期望学生回答的方向（不是标准答案）

要求：
1. 问题要层层递进，从简单观察到深入分析
2. 每次只问一个问题，让学生有独立思考空间
3. hint 要简短（不超过20字），只点拨方向
4. 问题用第二人称（"你"、"请思考"）`;

const TUTORIAL_USER_PROMPT = (data: GeometryData) => `
请为以下几何题目生成引导式解题步骤：

题目类型：${data.type}
几何数据：${JSON.stringify({
  points: data.points,
  edges: data.edges,
  faces: data.faces,
  functionExpression: data.functionExpression,
  domain: data.domain,
})}
核心问题：${data.question}
目标答案：${data.targetAnswer}

请以 JSON 格式返回步骤列表：
{
  "steps": [
    {
      "step": 1,
      "hint": "观察几何体的形状特征",
      "question": "这个几何体有哪些顶点？它们之间有什么关系？",
      "geogebraHighlight": "A,B,C",
      "expectedAnswer": "识别出顶点及其位置"
    }
  ]
}
`;

export interface TutorialApiRequest {
  geometryData: GeometryData;
}

export interface TutorialApiResponse {
  success: boolean;
  data?: Array<{
    step: number;
    hint: string;
    question: string;
    geogebraHighlight?: string;
    expectedAnswer?: string;
  }>;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TutorialApiResponse>> {
  try {
    const body = (await request.json()) as TutorialApiRequest;
    const { geometryData } = body;

    if (!geometryData || !geometryData.type) {
      return NextResponse.json({ success: false, error: '几何数据不能为空' }, { status: 400 });
    }

    const apiKey =
      request.headers.get('x-qwen-api-key') ||
      request.headers.get('x-api-key') ||
      process.env.QWEN_API_KEY ||
      '';

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: '请先配置 Qwen API Key' },
        { status: 401 }
      );
    }

    const openai = createOpenAI({
      apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let resultText = '';

    try {
      const result = await generateText({
        model: openai('qwen-max'),
        messages: [
          { role: 'system', content: TUTORIAL_SYSTEM_PROMPT },
          { role: 'user', content: TUTORIAL_USER_PROMPT(geometryData) },
        ],
        maxTokens: 1500,
        temperature: 0.6,
        abortSignal: controller.signal,
      });

      resultText = result.text.trim();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json({ success: false, error: '请求超时，请稍后重试' }, { status: 408 });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    // Parse JSON from response
    let parsed: { steps: TutorialApiResponse['data'] } | null = null;
    try {
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // ignore parse error
    }

    if (!parsed || !parsed.steps || parsed.steps.length === 0) {
      // Fallback: generate basic steps without AI
      const basicSteps: TutorialApiResponse['data'] = [
        { step: 1, hint: '观察几何体的基本形状', question: '这个几何体有哪些顶点？', expectedAnswer: '识别顶点' },
        { step: 2, hint: '分析顶点间的连接关系', question: '哪些顶点之间有边相连？', expectedAnswer: '识别棱' },
        { step: 3, hint: '识别几何体的面', question: '这个几何体有哪些面？每个面由哪些顶点构成？', expectedAnswer: '识别面' },
        { step: 4, hint: '找出关键几何关系', question: '图中哪些线是垂直或平行的？', expectedAnswer: '识别关系' },
        { step: 5, hint: '建立数学模型', question: '如何用坐标或向量表示这些几何元素？', expectedAnswer: '建立模型' },
      ];
      return NextResponse.json({ success: true, data: basicSteps });
    }

    return NextResponse.json({ success: true, data: parsed.steps });
  } catch (error) {
    console.error('[Tutorial API] 调用失败:', error);

    const message =
      error instanceof Error
        ? error.message.includes('401') || error.message.includes('api-key')
          ? 'API Key 无效或已过期'
          : error.message.includes('rate')
            ? '请求过于频繁，请稍后重试'
            : 'AI 服务暂时不可用'
        : '服务器内部错误';

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
