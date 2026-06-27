import { NextRequest, NextResponse } from 'next/server';
import { getServerData, setServerData, listServerKeys } from '@/lib/serverStorage';
import type { PracticeSource, PracticeQuestion } from '@/lib/geographyData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const chapterId = String(body.chapterId || 'compulsory-2');
    const difficulty = String(body.difficulty || '中等');

    const cacheKey = `geography_practice_${chapterId}_${difficulty}_${Date.now()}`;
    const source = await generatePracticeSource(chapterId, difficulty);

    setServerData(cacheKey, source);

    return NextResponse.json({
      success: true,
      data: source,
      source: 'generated',
    });
  } catch (error) {
    console.error('[geography/practice] 生成失败:', error);
    return NextResponse.json(
      { success: false, message: '生成综合题失败' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get('chapterId') || 'compulsory-2';
  const limit = Number(request.nextUrl.searchParams.get('limit') || '10');

  try {
    const keys = listServerKeys(`geography_practice_${chapterId}_`);
    const items: PracticeSource[] = [];

    for (const key of keys.slice(0, limit)) {
      try {
        const item = getServerData<PracticeSource>(key);
        if (item) items.push(item);
      } catch {
        // ignore
      }
    }

    items.sort((a, b) => (b.id || '').localeCompare(a.id || ''));

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

async function generatePracticeSource(
  chapterId: string,
  difficulty: string,
): Promise<PracticeSource> {
  const prompt = `你是辽宁省高考地理命题专家，熟悉辽宁卷命题风格（16道选择+3道综合大题，聚焦东北/辽宁本土）。请生成一道地理综合题训练。

### 章节
${chapterId}
### 难度
${difficulty}

### 要求
1. 提供一段地理材料（区域描述+图表数据），长度150-250字
2. 标注材料来源
3. 生成4个递进式问题，覆盖：
   - phenomenon：材料反映了什么地理现象或问题？
   - cause：该现象的成因是什么？（自然/人为）
   - effect：带来了什么影响或危害？
   - measure：提出合理的治理/发展措施
4. 每个问题提供：期望关键词列表、参考答案及3条分步提示
5. 材料聚焦辽宁本土或东北区域

### 输出格式（严格 JSON）
{
  "id": "practice_001",
  "title": "辽河流域水环境问题分析",
  "chapterId": "${chapterId}",
  "difficulty": "${difficulty}",
  "material": "材料原文...",
  "source": "辽宁省高中地理教材·模拟",
  "questions": [
    {
      "id": 1,
      "type": "phenomenon",
      "question": "材料反映了什么地理问题？",
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
      systemPrompt: '你是高考地理命题专家，擅长生成辽宁风格的地理综合题，输出必须严格符合 JSON 格式。',
    }),
  });

  if (!response.ok) {
    throw new Error(`AI 请求失败: ${response.status}`);
  }

  const data = await response.json();
  const contentText = data.choices?.[0]?.message?.content || data.content || '';

  const jsonMatch = contentText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('未解析到综合题 JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    id?: string;
    title?: string;
    chapterId?: string;
    difficulty?: string;
    material?: string;
    source?: string;
    questions?: unknown[];
  };

  const questions = normalizeQuestions(parsed.questions);
  if (!questions.length) {
    throw new Error('综合题问题为空');
  }

  return {
    id: parsed.id || `practice_${Date.now()}`,
    title: parsed.title || '地理综合题',
    chapterId: parsed.chapterId || chapterId,
    difficulty: (parsed.difficulty || difficulty) as '简单' | '中等' | '困难',
    material: parsed.material || '',
    source: parsed.source || '',
    questions,
  };
}

function normalizeQuestions(input: unknown): PracticeQuestion[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item, idx) => {
      const record = item as Record<string, unknown>;
      return {
        id: Number(record.id) || idx + 1,
        type: String(record.type || 'phenomenon') as PracticeQuestion['type'],
        question: String(record.question || ''),
        expectedKeywords: Array.isArray(record.expectedKeywords)
          ? (record.expectedKeywords as string[])
          : [],
        modelAnswer: String(record.modelAnswer || ''),
        hints: Array.isArray(record.hints)
          ? (record.hints as string[])
          : [],
      };
    })
    .filter((q) => q.question.trim().length > 0);
}
