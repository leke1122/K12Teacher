/**
 * GeoGebra 几何导师 API（苏格拉底式引导）
 * 接收学生回答，返回引导性反馈和下一个问题
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import {
  GEOMETRY_TUTOR_SYSTEM_PROMPT,
  INITIAL_TUTOR_PROMPT,
  ANSWER_PROMPT,
  parseTutorResponse,
} from '@/prompts/geometryTutor';
import type { SelectedObject } from '@/types/geogebra';

export interface TutorApiRequest {
  mode: 'initial' | 'answer';
  imageBase64: string;
  selectedObjects: SelectedObject[];
  question?: string;
  studentAnswer?: string;
  hintLevel: 0 | 1 | 2 | 3;
  history: Array<{ role: 'ai' | 'user'; content: string }>;
  quickAction?: string;
  /** 题目录播模式：无需选对象，直接根据题目图片引导 */
  topicMode?: boolean;
}

export interface TutorApiResponse {
  success: boolean;
  feedback?: string;
  nextQuestion?: string;
  hintLevel?: 0 | 1 | 2 | 3;
  isComplete?: boolean;
  geogebraCommands?: Array<{
    action: string;
    target: string;
    params: Record<string, unknown>;
    reason: string;
  }>;
  keyPoints?: string[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TutorApiResponse>> {
  try {
    const body = (await request.json()) as TutorApiRequest;
    const { mode, imageBase64, selectedObjects, question, studentAnswer, hintLevel, history, quickAction, topicMode } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ success: false, error: '截图数据不能为空' }, { status: 400 });
    }

    // 题目录播模式下不需要选对象
    if (!topicMode) {
      if (!selectedObjects || !Array.isArray(selectedObjects) || selectedObjects.length === 0) {
        return NextResponse.json({ success: false, error: '请先选中图形元素' }, { status: 400 });
      }
    }

    if (mode === 'answer') {
      if (!studentAnswer || typeof studentAnswer !== 'string' || studentAnswer.trim().length === 0) {
        return NextResponse.json({ success: false, error: '请输入你的思考' }, { status: 400 });
      }
      if (!question || typeof question !== 'string') {
        return NextResponse.json({ success: false, error: '缺少当前问题' }, { status: 400 });
      }
    }

    const apiKey =
      request.headers.get('x-qwen-api-key') ||
      request.headers.get('x-api-key') ||
      process.env.QWEN_API_KEY ||
      '';

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: '请先在设置页面配置 Qwen-VL 的 API Key' },
        { status: 401 }
      );
    }

    const openai = createOpenAI({
      apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let userPrompt: string;

    if (mode === 'initial' || !question) {
      userPrompt = INITIAL_TUTOR_PROMPT(selectedObjects, quickAction, topicMode);
    } else {
      userPrompt = ANSWER_PROMPT(selectedObjects, question, studentAnswer ?? '', hintLevel, history, topicMode);
    }

    let resultText = '';

    try {
      const result = await generateText({
        model: openai('qwen-vl-max'),
        messages: [
          { role: 'system', content: GEOMETRY_TUTOR_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image', image: imageBase64 },
            ],
          },
        ],
        maxTokens: 1200,
        temperature: 0.5,
        abortSignal: controller.signal,
      });

      resultText = result.text.trim();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json({ success: false, error: '请求超时，请检查网络后重试' }, { status: 408 });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    const parsed = parseTutorResponse(resultText);

    if (!parsed) {
      console.warn('[Geometry Tutor] 解析失败，原始文本:', resultText);
      return NextResponse.json(
        { success: false, error: 'AI 返回格式异常，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, ...parsed });
  } catch (error) {
    console.error('[Geometry Tutor] 调用失败:', error);

    const message =
      error instanceof Error
        ? error.message.includes('401')
          ? 'API Key 无效或已过期'
          : error.message.includes('rate')
            ? '请求过于频繁，请稍后重试'
            : error.message.includes('network') || error.message.includes('fetch')
              ? '网络连接失败，请检查网络后重试'
              : 'AI 服务暂时不可用'
        : '服务器内部错误';

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
