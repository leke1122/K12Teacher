import { NextRequest, NextResponse } from 'next/server';

// 动态检查答案的 API - 使用大模型判断答案正确性
export async function POST(request: NextRequest) {
  try {
    const { 
      question,           // 问题内容
      userAnswer,         // 用户答案
      correctAnswer,      // 正确答案（用于简单比对）
      knowledgeName,      // 知识点名称
      attemptCount = 1,  // 当前尝试次数
      pdfContext,        // 章节上下文
      explanation,       // 原题解析
      apiKey             // API密钥（可选）
    } = await request.json();

    if (!userAnswer) {
      return NextResponse.json({ error: '答案不能为空' }, { status: 400 });
    }

    console.log('[CheckAnswer] 检查答案:', { knowledgeName, userAnswer, correctAnswer, attemptCount });

    // 首先进行精确比对（用于快速判断）
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    const isDirectMatch = normalizedUser === normalizedCorrect;

    // 如果直接匹配，说明答案正确
    if (isDirectMatch) {
      return NextResponse.json({
        correct: true,
        message: attemptCount === 1 
          ? '🎉 回答正确！太棒了~' 
          : '✨ 回答正确！坚持就是胜利！',
        nextAction: 'next',
        explanation: explanation || '这道题做对了，继续加油！'
      });
    }

    // 答案不正确，调用大模型进行智能判断
    try {
      const feedback = await getAIAnalysis(
        question,
        userAnswer,
        correctAnswer,
        knowledgeName,
        attemptCount,
        pdfContext,
        apiKey
      );

      return NextResponse.json(feedback);
    } catch (aiError) {
      console.error('[CheckAnswer] AI分析失败:', aiError);
      // AI 不可用时使用简单逻辑
      return NextResponse.json(getSimpleFeedback(attemptCount, knowledgeName));
    }

  } catch (error) {
    console.error('[CheckAnswer] 处理失败:', error);
    return NextResponse.json(
      { error: '检查答案失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

// 标准化答案（忽略大小写、空格等）
function normalizeAnswer(answer: string): string {
  return answer.toString().trim().toUpperCase();
}

// 使用大模型进行智能分析
async function getAIAnalysis(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  knowledgeName?: string,
  attemptCount: number = 1,
  pdfContext?: string,
  apiKey?: string
): Promise<Record<string, unknown>> {
  // 构建分析提示词
  const prompt = `你是一个耐心的高中数学老师。请分析学生对这道题的回答。

题目：${question}
正确答案：${correctAnswer}
学生回答：${userAnswer}
知识点：${knowledgeName || '未指定'}
${pdfContext ? `相关上下文：${pdfContext.substring(0, 500)}` : ''}

## 分析要求
1. 判断学生回答是否正确（注意：可能是等价表述）
2. 如果不正确，分析错误原因
3. 根据尝试次数决定反馈：
   - 第一次错误：温和鼓励，给提示，让再试一次
   - 第二次错误：标记为薄弱项，但也要鼓励

## 输出格式
必须返回严格的JSON格式：
{
  "correct": true 或 false,
  "message": "反馈信息（温和鼓励的语气）",
  "nextAction": "next" 或 "retry" 或 "mark-weak",
  "explanation": "答案解析或错误原因分析",
  "hint": "给学生的温和提示（只针对错误时）"
}`;

  // 如果有 API Key，直接调用 DeepSeek
  if (apiKey) {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个耐心、温和的高中数学老师，善于鼓励学生。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API请求失败');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return parseAIResponse(content, attemptCount, knowledgeName);
  }

  // 如果没有 API Key，调用内部 chat API
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: '你是一个耐心、温和的高中数学老师，善于鼓励学生。'
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content;

    return parseAIResponse(content, attemptCount, knowledgeName);
  } catch {
    throw new Error('AI服务不可用');
  }
}

// 解析 AI 返回的反馈
function parseAIResponse(content: string, attemptCount: number, knowledgeName?: string): Record<string, unknown> {
  try {
    // 尝试提取 JSON
    let jsonStr = content.trim();
    
    // 移除 markdown 代码块
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    // 尝试直接解析
    try {
      const parsed = JSON.parse(jsonStr);
      
      // 验证字段
      if (typeof parsed.correct !== 'boolean') {
        throw new Error('缺少 correct 字段');
      }

      return {
        correct: parsed.correct,
        message: parsed.message || getDefaultMessage(parsed.correct, attemptCount),
        nextAction: parsed.nextAction || (parsed.correct ? 'next' : (attemptCount >= 2 ? 'mark-weak' : 'retry')),
        explanation: parsed.explanation || '',
        hint: parsed.hint || ''
      };
    } catch {
      // 解析失败，使用文本分析
    }

    // 从文本中提取信息
    const isCorrect = content.toLowerCase().includes('正确') || content.includes('✓');
    const hasRetry = content.includes('再试') || content.includes('retry');
    const hasMarkWeak = content.includes('薄弱') || content.includes('mark-weak');

    return {
      correct: isCorrect,
      message: isCorrect 
        ? '🎉 回答正确！太棒了~' 
        : (attemptCount === 1 ? '🤔 差一点点，再想想看~' : '📚 这个知识点需要多复习几次哦'),
      nextAction: isCorrect ? 'next' : (hasMarkWeak || attemptCount >= 2 ? 'mark-weak' : 'retry'),
      explanation: extractExplanation(content),
      hint: isCorrect ? '' : (attemptCount === 1 ? '再想想，答案就在知识点里~' : '后续复习时还会再遇到')
    };
  } catch (error) {
    console.error('[CheckAnswer] 解析AI响应失败:', error);
    return getSimpleFeedback(attemptCount, knowledgeName);
  }
}

// 提取解释文本
function extractExplanation(content: string): string {
  // 尝试找到解释部分
  const explanationMatch = content.match(/(?:解释|分析|原因)[:：]\s*(.+?)(?=\n|$)/i);
  if (explanationMatch) {
    return explanationMatch[1].trim();
  }
  
  // 如果找不到，返回前100字
  return content.substring(0, 100).trim();
}

// 获取默认消息
function getDefaultMessage(correct: boolean, attemptCount: number): string {
  if (correct) {
    return attemptCount === 1 
      ? '🎉 回答正确！太棒了~' 
      : '✨ 回答正确！坚持就是胜利！';
  }
  
  if (attemptCount >= 2) {
    return '📚 这个知识点需要多复习几次哦，先标记为薄弱项吧~';
  }
  
  return '🤔 差一点点，再想想看~';
}

// 简单反馈（当AI不可用时）
function getSimpleFeedback(attemptCount: number, knowledgeName?: string): Record<string, unknown> {
  if (attemptCount === 1) {
    return {
      correct: false,
      message: '🤔 差一点点，再想想看~',
      nextAction: 'retry',
      explanation: '答案可能不正确，再仔细看看知识点讲解吧',
      hint: '想想老师举的例子'
    };
  }
  
  return {
    correct: false,
    message: `📚 "${knowledgeName || '这个知识点'}"需要多复习几次哦，先标记为薄弱项吧~`,
    nextAction: 'mark-weak',
    explanation: '没关系，后续复习时还会再遇到这个知识点',
    hint: '可以在学习总结里查看薄弱项'
  };
}
