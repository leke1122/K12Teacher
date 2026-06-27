import { NextRequest, NextResponse } from 'next/server';
import { getServerData, setServerData } from '@/lib/serverStorage';
import type { AnalysisSource, AnalysisQuestion, AnalysisFeedback, AnalysisAttempt } from '@/types/history';

export interface SubmitAnalysisRequest {
  sourceId: string;
  questionId: number;
  answer: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as SubmitAnalysisRequest;
    const { sourceId, questionId, answer, userId = 'guest' } = body;

    if (!sourceId || !questionId || !answer?.trim()) {
      return NextResponse.json(
        { success: false, message: '参数不完整' },
        { status: 400 },
      );
    }

    const source = getServerData<AnalysisSource>(sourceId);
    if (!source) {
      return NextResponse.json(
        { success: false, message: '材料不存在' },
        { status: 404 },
      );
    }

    const question = source.questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { success: false, message: '问题不存在' },
        { status: 404 },
      );
    }

    const feedback = await generateFeedback(question, answer.trim());
    const attempt: AnalysisAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sourceId,
      userId,
      questionId,
      answers: [answer.trim()],
      correct: feedback.isCorrect,
      score: feedback.score,
      feedbacks: [feedback.guidance],
      attempts: 1,
      completedAt: new Date().toISOString(),
    };

    setServerData(
      `analysis_attempt_${userId}_${sourceId}_${questionId}`,
      attempt,
    );

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        attempt,
        modelAnswer: question.modelAnswer,
      },
    });
  } catch (error) {
    console.error('[analysis/submit] 提交失败:', error);
    return NextResponse.json(
      { success: false, message: '提交失败，请重试' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const sourceId = request.nextUrl.searchParams.get('sourceId') || '';
  const questionId = Number(request.nextUrl.searchParams.get('questionId') || '0');
  const userId = request.nextUrl.searchParams.get('userId') || 'guest';

  if (!sourceId || !questionId) {
    return NextResponse.json(
      { success: false, message: '缺少参数' },
      { status: 400 },
    );
  }

  try {
    const attempt = getServerData<AnalysisAttempt>(
      `analysis_attempt_${userId}_${sourceId}_${questionId}`,
    );
    return NextResponse.json({
      success: true,
      data: attempt || null,
    });
  } catch {
    return NextResponse.json({ success: true, data: null });
  }
}

async function generateFeedback(
  question: AnalysisQuestion,
  answer: string,
): Promise<AnalysisFeedback> {
  const prompt = `你是一位高考历史阅卷专家。请对学生的回答进行启发式反馈，不要直接给出标准答案。

### 问题
${question.question}

### 参考答案
${question.modelAnswer}

### 期望关键词
${question.expectedKeywords.join('、') || '无'}

### 学生回答
${answer}

### 反馈要求
1. 判断回答是否正确或部分正确
2. 指出回答中正确的部分（逐项列举）
3. 指出缺失或需要改进的部分（逐项列举）
4. 给出思考方向提示，引导学生自己发现答案
5. 不要直接给出标准答案
6. 评分 0-100 分

### 输出格式（严格 JSON）
{
  "isCorrect": true/false,
  "isPartial": true/false,
  "score": 85,
  "correctParts": ["提到了时间", "提到了人物"],
  "missingParts": ["缺少事件名称", "没有说明影响"],
  "guidance": "再想想，材料中提到的条约名称是什么？",
  "encouragement": "很好，已经找到了关键时间点，继续加油！"
}`;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt:
        '你是历史教学专家，擅长启发式反馈，引导学生主动思考，不直接给出答案。',
    }),
  });

  if (!response.ok) {
    throw new Error(`AI 反馈请求失败: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || data.content || '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      isCorrect: false,
      isPartial: false,
      score: 0,
      correctParts: [],
      missingParts: ['无法解析反馈，请重试'],
      guidance: '请重新组织语言，注意材料中的关键词。',
      encouragement: '不要灰心，再试一次！',
    };
  }

  const parsed = JSON.parse(jsonMatch[0]) as AnalysisFeedback;

  return {
    isCorrect: Boolean(parsed.isCorrect),
    isPartial: Boolean(parsed.isPartial),
    score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
    correctParts: Array.isArray(parsed.correctParts) ? parsed.correctParts : [],
    missingParts: Array.isArray(parsed.missingParts) ? parsed.missingParts : [],
    guidance: String(parsed.guidance || '请再思考一下。'),
    encouragement: String(parsed.encouragement || '继续加油！'),
  };
}
