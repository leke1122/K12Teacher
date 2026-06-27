import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { modelName, question, answer, step, stepPrompt, allAnswers } = body;

    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        guidance: `（未配置 API，当前为本地引导反馈）\n${stepPrompt}`,
        nextPrompt: '',
        isCorrect: false,
      });
    }

    const openai = createOpenAI({
      apiKey,
      baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });

    const prompt = `你是高中数学引导式讲解助手，请严格返回 JSON：
{
  "isCorrect": true/false,
  "guidance": "给学生的反馈",
  "nextPrompt": "下一步引导提示"
}

当前模型：${modelName}
当前步骤：${step}
引导问题：${stepPrompt}
学生答案：${answer}
历史思考：${JSON.stringify(allAnswers || [])}
不要直接给最终答案，只给提示或判断。`;

    const result = await generateText({
      model: openai('qwen-turbo'),
      messages: [
        { role: 'system', content: '你是一位善于引导的高中数学老师，不直接给答案，只给出判断和思考方向。' },
        { role: 'user', content: prompt },
      ],
      maxTokens: 1200,
      temperature: 0.3,
    });

    const text = result.text.trim();
    const parsed = parseJson(text);

    return NextResponse.json({ success: true, ...parsed });
  } catch (error) {
    console.error('[GeoGebra Guide]', error);
    return NextResponse.json({
      success: false,
      guidance: '引导服务暂时不可用，请先结合图形自行思考。',
      nextPrompt: '',
      isCorrect: false,
    });
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
    isCorrect: false,
    guidance: '已收到你的回答，继续观察图形并思考吧。',
    nextPrompt: '',
  };
}
