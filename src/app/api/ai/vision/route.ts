import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { GEOMETRY_EXTRACTION_PROMPT } from '@/prompts/geometryUnderstanding';
import type { GeometryData } from '@/types/geometry';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let base64Image: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const image = formData.get('image');
      if (!image || typeof image === 'string') {
        return NextResponse.json({ success: false, error: '图片不能为空' }, { status: 400 });
      }
      base64Image = await blobToBase64(image as Blob);
    } else {
      const body = (await request.json()) as { image?: string };
      if (!body.image || typeof body.image !== 'string') {
        return NextResponse.json({ success: false, error: '缺少图片数据' }, { status: 400 });
      }
      base64Image = body.image.trim() || null;
    }

    if (!base64Image) {
      return NextResponse.json({ success: false, error: '图片数据为空' }, { status: 400 });
    }

    const apiKey = request.headers.get('x-qwen-api-key') || process.env.QWEN_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: '请先在设置页面配置Qwen-VL的API Key' },
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
        model: openai('qwen-vl-max'),
        messages: [
          { role: 'system', content: '你是一位高中几何识别助手，严格返回 JSON。' },
          {
            role: 'user',
            content: [
              { type: 'text', text: GEOMETRY_EXTRACTION_PROMPT },
              { type: 'image', image: base64Image },
            ],
          },
        ],
        maxTokens: 1200,
        temperature: 0.2,
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

    const parsed = parseGeometryJson(resultText);
    return NextResponse.json({ success: true, data: parsed satisfies GeometryData });
  } catch (error) {
    console.error('[AI Vision]', error);
    const message = error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function parseGeometryJson(content: string): GeometryData {
  try {
    const cleaned = content.replace(/```(?:json)?/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1)) as GeometryData;
    }
  } catch {}

  return {
    type: 'coordinate_geometry',
    question: '未能解析题目内容',
    targetAnswer: '',
  };
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = (blob as Blob & { type?: string }).type || 'image/png';
  return `data:${mimeType};base64,${base64}`;
}
