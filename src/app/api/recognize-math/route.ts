import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

/**
 * 识别手写数学内容并批改解题步骤
 * 使用 Qwen-VL (通义千问视觉模型) 通过 OpenAI 兼容接口调用
 */
export async function POST(request: NextRequest) {
  try {
    const { imageData, question, correctAnswer, knowledgePoint, apiKey } = await request.json();

    if (!imageData) {
      return NextResponse.json({ error: '图片不能为空' }, { status: 400 });
    }

    // 如果没有提供 apiKey，返回默认结果
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        recognizedText: '（未配置API，无法识别）',
        isCorrect: false,
        stepAnalysis: [],
        wrongStep: '需要配置 API Key',
        wrongReason: '未配置视觉识别API',
        correctSolution: correctAnswer || '请参考教材',
        score: 0,
        feedback: '请在设置中配置 API Key 后重试',
      });
    }

    // 构建提示词
    const systemPrompt = `你是一位严谨的高中数学教师，擅长识别学生的手写数学解题过程并进行批改。

【批改原则】
1. 先识别图片中的手写内容，转换为文本
2. 严格按照题目和标准答案判断对错
3. 对解题步骤逐条分析，给出具体评价
4. 如果有错误，指出具体是哪一步、为什么错
5. 用鼓励性语言给出反馈

【返回格式】（严格JSON）
{
  "recognizedText": "识别出的完整解题过程（尽可能还原学生手写内容）",
  "isCorrect": true/false,
  "stepAnalysis": [
    { "step": 1, "content": "第一步写的什么", "isCorrect": true/false, "comment": "对或错的评价" },
    { "step": 2, "content": "第二步写的什么", "isCorrect": true/false, "comment": "对或错的评价" }
  ],
  "wrongStep": "错误步骤描述（如果有）",
  "wrongReason": "错误原因分析（如果有）",
  "correctSolution": "正确的完整解题过程",
  "score": 0-100,
  "feedback": "总体评价和鼓励性建议"
}`;

    const userPrompt = `【题目】
${question}

【标准答案】
${correctAnswer || '（未提供标准答案，请根据题目自行判断）'}

【相关知识点】
${knowledgePoint || '高中数学'}

请识别图片中的手写内容，并进行批改。

【返回格式】
严格返回JSON，不要包含任何其他内容。`;

    try {
      // 使用 OpenAI SDK 调用通义千问视觉模型
      // 通义千问的视觉模型通过 OpenAI 兼容接口提供
      const openai = createOpenAI({
        apiKey: apiKey,
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      });

      const result = await generateText({
        model: openai('qwen-vl-plus'),
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image',
                image: imageData,
              },
            ],
          },
        ],
        maxTokens: 2000,
        temperature: 0.3,
      });

      const content = result.text;
      const parsed = parseRecognitionResult(content);

      return NextResponse.json({
        success: true,
        ...parsed,
      });
    } catch (apiError) {
      console.error('[RecognizeMath] API调用失败:', apiError);
      // API失败时返回友好提示
      return NextResponse.json({
        success: true,
        recognizedText: '（API调用失败，请检查API配置）',
        isCorrect: false,
        stepAnalysis: [],
        wrongStep: '识别服务暂时不可用',
        wrongReason: '可能的原因：API Key配置错误、额度不足、网络问题',
        correctSolution: correctAnswer || '请参考教材答案',
        score: 0,
        feedback: 'AI识别服务暂时不可用，建议手动对照答案检查解题步骤。',
      });
    }
  } catch (error) {
    console.error('[RecognizeMath] 处理失败:', error);
    return NextResponse.json(
      { error: '处理失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

function parseRecognitionResult(content: string): any {
  // 尝试解析JSON
  let jsonStr = content.trim();

  // 移除代码块
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

  // 移除前后可能的多余字符
  jsonStr = jsonStr.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      recognizedText: parsed.recognizedText || parsed.recognized_text || '（未能识别出内容）',
      isCorrect: Boolean(parsed.isCorrect || parsed.is_correct),
      stepAnalysis: Array.isArray(parsed.stepAnalysis || parsed.step_analysis)
        ? parsed.stepAnalysis || parsed.step_analysis
        : [],
      wrongStep: parsed.wrongStep || parsed.wrong_step || '',
      wrongReason: parsed.wrongReason || parsed.wrong_reason || '',
      correctSolution: parsed.correctSolution || parsed.correct_solution || '',
      score: Number(parsed.score ?? parsed.score ?? 0),
      feedback: parsed.feedback || parsed.suggestion || '请继续加油！',
    };
  } catch {
    // JSON解析失败，尝试从文本提取信息
    const isCorrect = content.includes('"isCorrect": true') || content.includes('"is_correct": true');
    return {
      recognizedText: extractField(content, ['recognizedText', 'recognized_text', '识别内容']) || '（内容识别失败）',
      isCorrect,
      stepAnalysis: [],
      wrongStep: extractField(content, ['wrongStep', 'wrong_step', '错误步骤']) || '',
      wrongReason: extractField(content, ['wrongReason', 'wrong_reason', '错误原因']) || '',
      correctSolution: extractField(content, ['correctSolution', 'correct_solution', '正确答案']) || '',
      score: isCorrect ? 80 : 30,
      feedback: isCorrect ? '解题思路正确，继续保持！' : '请参考正确答案，检查解题步骤。',
    };
  }
}

function extractField(text: string, fieldNames: string[]): string {
  for (const name of fieldNames) {
    // 尝试各种可能的格式
    const patterns = [
      new RegExp(`"${name}"\\s*:\\s*"([^"\\n]+)"`),
      new RegExp(`"${name}"\\s*:\\s*'([^'\\n]+)'`),
      new RegExp(`${name}[：:]\\s*([^\\n]+)`),
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
  }
  return '';
}
