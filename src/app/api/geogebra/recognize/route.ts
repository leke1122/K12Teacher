import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!image || typeof image === 'string') {
      return NextResponse.json({ success: false, error: '图片不能为空' }, { status: 400 });
    }

    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        data: {
          shapeType: 'triangle',
          conditions: ['AB = 6', 'AC = 8', 'BC = 10'],
          question: '求三角形 ABC 的面积',
          message: '当前为本地模拟识别结果，请在环境中配置 QWEN_API_KEY 后使用真实识别。',
        },
      });
    }

    const base64 = await blobToBase64(image as Blob);

    const openai = createOpenAI({
      apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });

    const prompt = `请识别图片中的几何图形，返回 JSON：
{
  "shapeType": "三角形/四边形/圆/立体图形",
  "conditions": ["已知条件字符串"],
  "question": "待求问题",
  "message": "对图形的描述"
}
只返回 JSON，不要额外说明。`;

    const result = await generateText({
      model: openai('qwen-vl-plus'),
      messages: [
        { role: 'system', content: '你是一位高中几何识别助手，严格返回 JSON。' },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image', image: base64 },
          ],
        },
      ],
      maxTokens: 1200,
      temperature: 0.2,
    });

    const text = result.text.trim();
    const parsed = parseJson(text);
    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('[GeoGebra Recognize]', error);
    return NextResponse.json(
      { success: false, error: '识别失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

function parseJson(content: string) {
  try {
    const cleaned = content.replace(/```(?:json)?/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end >= 0) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
  } catch {}
  return {
    shapeType: '未知图形',
    conditions: ['请上传清晰的几何题图片'],
    question: '请描述题目要求',
    message: '未能从返回内容中解析出结构，请稍后再试。',
  };
}

async function blobToBase64(blob: Blob) {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = (blob as Blob & { type?: string }).type || 'image/png';
  return `data:${mimeType};base64,${base64}`;
}
