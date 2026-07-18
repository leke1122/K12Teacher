import { NextRequest, NextResponse } from 'next/server';
import { getServerData, setServerData, listServerKeys } from '@/lib/serverStorage';
import type { AnalysisSource, AnalysisQuestion, AnalysisQuestionType } from '@/types/history';

export interface GenerateAnalysisResponse {
  success: boolean;
  source: 'cache' | 'generated' | 'empty';
  data: AnalysisSource | null;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: {
      chapterId?: string;
      sectionId?: string;
      difficulty?: string;
      text?: string;
      apiKey?: string;
    } = await request.json().catch(() => ({}));
    const chapterId = String(body.chapterId || 'modern-china');
    const sectionId = String(body.sectionId || '');
    const difficulty = String(body.difficulty || '中等') as '简单' | '中等' | '困难';
    const sourceText = body.text ? String(body.text) : '';

    const cacheKey = sectionId
      ? `analysis_source_${chapterId}_${difficulty}_${encodeURIComponent(sectionId)}_${Date.now()}`
      : `analysis_source_${chapterId}_${difficulty}_${Date.now()}`;

    const source = await generateAnalysisSource(chapterId, sectionId, difficulty, sourceText);
    if (!source || !source.question) {
      return NextResponse.json(
        { success: false, message: '生成材料分析题失败，请重试' },
        { status: 500 },
      );
    }

    setServerData(cacheKey, source);

    return NextResponse.json<GenerateAnalysisResponse>({
      success: true,
      source: 'generated',
      data: source,
    });
  } catch (error) {
    console.error('[analysis/generate] 生成失败:', error);
    return NextResponse.json(
      { success: false, message: '生成材料分析题失败' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get('chapterId') || 'modern-china';
  const difficulty = request.nextUrl.searchParams.get('difficulty') || '中等';
  const limit = Number(request.nextUrl.searchParams.get('limit') || '10');

  try {
    const keys = listServerKeys(`analysis_source_${chapterId}_${difficulty}_`);
    if (!keys.length) {
      return NextResponse.json<GenerateAnalysisResponse>({
        success: true,
        source: 'empty',
        data: null as unknown as AnalysisSource,
      });
    }

    const items: AnalysisSource[] = [];
    for (const key of keys.slice(0, limit)) {
      try {
        const item = getServerData<AnalysisSource>(key);
        if (item) items.push(item);
      } catch {
        // ignore single item error
      }
    }

    if (!items.length) {
      return NextResponse.json<GenerateAnalysisResponse>({
        success: true,
        source: 'empty',
        data: null as unknown as AnalysisSource,
      });
    }

    // items 可能来自缓存，不需要按 year 排序，直接取第一个
    const latest = items[0];

    return NextResponse.json<GenerateAnalysisResponse>({
      success: true,
      source: 'cache',
      data: latest,
    });
  } catch {
    return NextResponse.json<GenerateAnalysisResponse>({
      success: true,
      source: 'empty',
      data: null as unknown as AnalysisSource,
    });
  }
}

async function generateAnalysisSource(
  chapterId: string,
  sectionId: string,
  difficulty: '简单' | '中等' | '困难',
  contextText: string,
): Promise<AnalysisSource> {
  const contextHint = contextText
    ? `\n\n### 教材内容（请从中取材）\n${contextText.slice(0, 4000)}`
    : '';

  const sectionHint = sectionId
    ? `\n### 课次\n${decodeURIComponent(sectionId).replace(/_/g, ' ')}`
    : '';

  const prompt = `你是一位历史教学专家，也是高考材料分析题命题专家。请根据当前学习章节生成一道材料分析训练题。

### 章节
${chapterId}
### 难度
${difficulty}
${sectionHint}
${contextHint}

### 要求
1. 选取一段有分析价值的历史材料（100-200字）
2. 标注出处（来源、作者、时间）
3. 生成4个递进式问题，覆盖以下类型：
   - event：事件识别
   - view：观点提炼
   - argument：论证分析
   - conclusion：结论提炼
4. 每个问题提供期望关键词列表、参考答案及3条分步提示
5. 材料与问题要适合高中历史学习

### 输出格式（严格 JSON）
{
  "title": "材料分析题标题",
  "chapterId": "${chapterId}",
  "difficulty": "${difficulty}",
  "material": "材料原文",
  "source": "出处",
  "questions": [
    {
      "id": 1,
      "type": "event",
      "question": "材料反映了什么历史事件？",
      "expectedKeywords": ["关键词1", "关键词2"],
      "modelAnswer": "参考答案",
      "hints": ["提示1", "提示2", "提示3"]
    }
  ]
}`;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt:
        '你是历史教学专家，擅长生成高考风格的历史材料分析训练题，输出必须严格符合 JSON 格式。',
    }),
  });

  if (!response.ok) {
    throw new Error(`AI 请求失败: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || data.content || '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('未解析到材料分析题 JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    title?: string;
    difficulty?: string;
    material?: string;
    source?: string;
    questions?: unknown[];
  };

  const questions = normalizeQuestions(parsed.questions);
  if (!questions.length) {
    throw new Error('材料分析题问题为空');
  }

  // 合并questions为一个问题字符串以符合AnalysisSource格式
  const questionText = questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n');
  
  return {
    id: `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: parsed.title || '历史材料分析',
    difficulty: (parsed.difficulty || difficulty) as '简单' | '中等' | '困难',
    material: parsed.material || '',
    question: questionText,
    knowledgePoints: questions.map(q => q.type),
  };
}

function normalizeQuestions(input: unknown): AnalysisQuestion[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item, idx) => {
      const record = item as Record<string, unknown>;
      const typeRaw = String(record.type || '简答');
      const type = normalizeQuestionType(typeRaw);
      const expectedKeywords = record.expectedKeywords;
      const keywordsStr = Array.isArray(expectedKeywords) ? expectedKeywords.join('、') : '';
      return {
        id: String(record.id || idx + 1),
        type,
        question: String(record.question || ''),
        correctAnswer: String(record.modelAnswer || keywordsStr || ''),
        analysis: Array.isArray(record.hints) ? record.hints.join('；') : String(record.hints || ''),
      } as AnalysisQuestion;
    })
    .filter((q) => q.question.trim().length > 0);
}

function normalizeQuestionType(value: string): '选择' | '填空' | '简答' | '论述' {
  const v = value.toLowerCase();
  if (v === '选择' || v === 'choice') return '选择';
  if (v === '填空' || v === 'fill') return '填空';
  if (v === '简答' || v === 'short') return '简答';
  if (v === '论述' || v === 'essay') return '论述';
  return '简答';
}
