/**
 * GeoGebra 几何导师 API
 * 处理题目录播模式和几何对象分析
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const SYSTEM_PROMPT = `你是一位严格的高中数学金牌教练，擅长用苏格拉底式提问引导学生自主思考。

【核心原则】你必须严格验证学生的数学计算！

当学生提交答案时，你必须：
1. 理解学生提交的数学计算结果
2. **独立验证这些计算是否正确**
3. 如果计算正确 → 表扬并引导下一步
4. 如果计算错误 → 温和地指出错误，并引导重新计算
   - 不能简单地说"没错"就过去
   - 必须明确告诉学生哪里算错了

【错误示例（禁止这样做）】
❌ 学生算错了，AI却说"没错！"
❌ 学生答案：m=0时, x=3×0-1=0，AI说"正确"

【正确示例（必须这样做）】
✅ 学生算错了：m=0时, x=3×0-1=0
   AI说："等等，我帮你验算一下...当m=0时，3×0-1应该是-1，而不是0哦。再检查一下？"

【回答风格】
- 每次只问一个小问题
- 用亲切的语气，像朋友一样引导学生
- hint 要简短（不超过20字），只点拨方向
- 问题用第二人称（"你"、"请思考"）`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mode = 'initial',
      imageBase64,
      selectedObjects = [],
      history = [],
      hintLevel = 0,
      topicMode = false,
      quickAction,
      question,
      studentAnswer,
      // 额外传入题目条件，用于验证答案
      problemContext,
    } = body;

    const apiKey =
      request.headers.get('x-qwen-api-key') ||
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

    const selectedNames = selectedObjects.map((o: any) => o.label || o.id).join('、') || '图形';

    let userPrompt = '';

    if (topicMode && quickAction) {
      userPrompt = `【模式】题目录播 - ${quickAction}
      
【题目】请分析这张图片中的数学题目。

请给出你的分析（${quickAction}）。`;
    } else if (topicMode) {
      userPrompt = `【模式】题目录播模式

请分析这张图片中的数学题目，提取已知条件，生成第一个引导问题。`;
    } else {
      userPrompt = `【模式】几何对象分析

你选中了【${selectedNames}】。

${quickAction || '请分析这个几何对象的特征。'}`;
    }

    if (studentAnswer) {
      userPrompt = `【重要】你必须验证学生的数学计算是否正确，不能简单地说"没错"！

【当前题目条件】${problemContext || '请从历史对话中理解题目'}

【学生回答/计算结果】${studentAnswer}

请执行以下步骤：
1. 理解学生提交的内容
2. 根据【当前题目条件】，独立验证计算是否正确
3. 如果正确 → 表扬并引导下一步
4. 如果错误 → 温和指出错误，重新引导计算
5. 最后生成下一个引导问题`;

      // 如果有题目上下文，添加到 prompt 中
      if (problemContext) {
        userPrompt = userPrompt.replace('【当前题目条件】请从历史对话中理解题目', `【当前题目条件】${problemContext}`);
      }
    }

    if (history.length > 0) {
      userPrompt += `\n\n【对话历史】\n${history.map((m: any) => `${m.role === 'user' ? '学生' : 'AI'}: ${m.content}`).join('\n')}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const result = await generateText({
        model: openai('qwen-max'),
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        maxTokens: 800,
        temperature: 0.7,
        abortSignal: controller.signal,
      });

      clearTimeout(timeoutId);

      const text = result.text?.trim() || '';

      // 判断是否完成（包含"总结"、"完成"等关键词）
      const isComplete = text.includes('总结') || text.includes('完成') || text.includes('掌握');

      return NextResponse.json({
        success: true,
        feedback: text,
        nextQuestion: text,
        hintLevel: hintLevel,
        isComplete,
        keyPoints: isComplete ? ['核心概念已掌握'] : [],
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: '请求超时，请稍后重试' },
          { status: 408 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('[GeometryTutor API] 调用失败:', error);
    return NextResponse.json(
      { success: false, error: 'AI 服务暂时不可用' },
      { status: 500 }
    );
  }
}
