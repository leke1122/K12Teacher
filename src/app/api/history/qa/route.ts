import { NextRequest, NextResponse } from 'next/server';
import { generateAIContext, concepts, timelineEvents } from '@/data/history/unit1_data';
import { supabase, isSupabaseConfigured, findDocxImportByUnitId } from '@/lib/supabase';

export const runtime = 'edge';

function normalizeUnitId(rawUnitId: string | null | undefined): string {
  if (!rawUnitId) {
    return 'unit1';
  }

  const normalized = rawUnitId.trim().toLowerCase();
  if (!normalized) {
    return 'unit1';
  }

  if (normalized === 'unit1' || normalized.startsWith('unit1_')) {
    return 'unit1';
  }

  return rawUnitId.trim();
}

function serializeDocxContext(docxData: unknown): string {
  if (!docxData || typeof docxData !== 'object') {
    return '';
  }

  const record = docxData as {
    summary?: unknown;
    concepts?: unknown[];
    timelineEvents?: unknown[];
    causalLinks?: unknown[];
    unitTitle?: string;
  };

  const lines: string[] = [];

  if (typeof record.unitTitle === 'string' && record.unitTitle.trim()) {
    lines.push(`# ${record.unitTitle.trim()}`);
  }

  if (typeof record.summary === 'string' && record.summary.trim()) {
    lines.push('## 概要');
    lines.push(record.summary.trim());
  }

  if (Array.isArray(record.concepts) && record.concepts.length > 0) {
    lines.push('## 核心概念');
    for (const concept of record.concepts) {
      if (!concept || typeof concept !== 'object') continue;
      const item = concept as {
        name?: unknown;
        category?: unknown;
        definition?: unknown;
        keyPeople?: unknown[];
        relatedEvents?: unknown[];
      };
      const name = typeof item.name === 'string' ? item.name.trim() : '';
      const category = typeof item.category === 'string' ? item.category.trim() : '';
      const definition = typeof item.definition === 'string' ? item.definition.trim() : '';

      if (!name) continue;

      lines.push(`【${name}】${category ? `（${category}类）` : ''}`);
      if (definition) {
        lines.push(`  定义：${definition}`);
      }
      if (Array.isArray(item.keyPeople) && item.keyPeople.length > 0) {
        const people = item.keyPeople.filter((person): person is string => typeof person === 'string');
        if (people.length) {
          lines.push(`  关键人物：${people.join('、')}`);
        }
      }
      if (Array.isArray(item.relatedEvents) && item.relatedEvents.length > 0) {
        const related = item.relatedEvents.filter((event): event is string => typeof event === 'string');
        if (related.length) {
          lines.push(`  相关事件：${related.join('、')}`);
        }
      }
      lines.push('');
    }
  }

  if (Array.isArray(record.timelineEvents) && record.timelineEvents.length > 0) {
    lines.push('## 时间轴事件');
    for (const event of record.timelineEvents) {
      if (!event || typeof event !== 'object') continue;
      const item = event as {
        year?: unknown;
        title?: unknown;
        dynasty?: unknown;
        summary?: unknown;
        impact?: unknown;
        keyPeople?: unknown[];
      };
      const year = typeof item.year === 'string' ? item.year.trim() : '';
      const title = typeof item.title === 'string' ? item.title.trim() : '';
      const dynasty = typeof item.dynasty === 'string' ? item.dynasty.trim() : '';
      const summary = typeof item.summary === 'string' ? item.summary.trim() : '';
      const impact = typeof item.impact === 'string' ? item.impact.trim() : '';

      if (!year && !title) continue;

      lines.push(`【${year}】${title}${dynasty ? `（${dynasty}）` : ''}`);
      if (summary) {
        lines.push(`  摘要：${summary}`);
      }
      if (impact) {
        lines.push(`  影响：${impact}`);
      }
      if (Array.isArray(item.keyPeople) && item.keyPeople.length > 0) {
        const people = item.keyPeople.filter((person): person is string => typeof person === 'string');
        if (people.length) {
          lines.push(`  关键人物：${people.join('、')}`);
        }
      }
      lines.push('');
    }
  }

  if (Array.isArray(record.causalLinks) && record.causalLinks.length > 0) {
    lines.push('## 因果逻辑链');
    for (const link of record.causalLinks) {
      if (!link || typeof link !== 'object') continue;
      const item = link as { sourceId?: unknown; targetId?: unknown; logic?: unknown; type?: unknown };
      const logic = typeof item.logic === 'string' ? item.logic.trim() : '';

      if (!logic) continue;

      const sourceId = typeof item.sourceId === 'string' ? item.sourceId.trim() : '';
      const targetId = typeof item.targetId === 'string' ? item.targetId.trim() : '';
      const sourceLabel = sourceId || '起始事件';
      const targetLabel = targetId || '结果事件';

      lines.push(`${sourceLabel} → ${targetLabel}`);
      lines.push(`  逻辑：${logic}`);
      lines.push('');
    }
  }

  return lines.join('\n').trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    const unitId = normalizeUnitId(typeof body?.unitId === 'string' ? body.unitId : null);

    if (!question) {
      return NextResponse.json(
        { success: false, message: '请提供有效的问题' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    let apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey) {
      apiKey = process.env.DEEPSEEK_API_KEY;
    }

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: '请先在设置页面配置 DeepSeek API Key' },
        { status: 401 }
      );
    }

    let context = generateAIContext();
    let dataSource: 'docx' | 'builtin' = 'builtin';
    let usedUnitTitle: string | null = null;

    if (isSupabaseConfigured && supabase) {
      const docxImport = await findDocxImportByUnitId(unitId);
      const rawDocxData = docxImport?.data ?? null;

      if (rawDocxData) {
        const docxContext = serializeDocxContext(rawDocxData);

        if (docxContext) {
          context = docxContext;
          dataSource = 'docx';

          if (typeof rawDocxData === 'object' && rawDocxData !== null) {
            const maybeTitle = (rawDocxData as { unitTitle?: unknown }).unitTitle;

            if (typeof maybeTitle === 'string' && maybeTitle.trim()) {
              usedUnitTitle = maybeTitle.trim();
            }
          }
        }
      }
    }

    const sourceLabel =
      dataSource === 'docx'
        ? `📝 基于您导入的知识点${usedUnitTitle ? `：《${usedUnitTitle}》` : ''}`
        : '📚 基于教材知识';

    const systemPrompt = `你是高中历史第一单元的专属学习助手。你必须严格根据提供的数据回答问题。

【当前数据来源】
${sourceLabel}

【核心原则】
1. 回答时必须引用提供的知识点数据，格式为"根据第一单元知识点：..."
2. 如果问题超出第一单元范围，请明确说明"这个问题超出了第一单元的知识点范围"
3. 严禁胡编乱造，只回答数据中明确包含的内容
4. 可以综合多个知识点来回答综合性问题
5. 可以解释历史概念、制度、事件的背景和影响
6. 回答结束时，根据数据来源标注使用来源：若为 docx，回答末尾增加"来源：导入的 docx 知识点"；若为内置数据，回答末尾增加"来源：教材知识"

【第一单元知识点数据】
${context}

【回答格式】
请先用简短的总结回答问题，然后根据需要展开详细说明。可以引用相关的时间轴事件和核心概念。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', response.status, errorData);
      return NextResponse.json(
        { success: false, message: 'AI 服务暂时不可用，请稍后重试' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || '抱歉，我无法回答这个问题';

    return NextResponse.json({
      success: true,
      data: {
        answer,
        relatedEvents: findRelatedEvents(question),
        relatedConcepts: findRelatedConcepts(question),
        dataSource,
        unitId,
      },
    });
  } catch (error) {
    console.error('History QA error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

// 简单关键词匹配，查找相关事件
function findRelatedEvents(question: string): Array<{ id: string; title: string; year: string }> {
  const keywords = extractKeywords(question);
  const related: Array<{ id: string; title: string; year: string }> = [];

  for (const event of timelineEvents) {
    let score = 0;
    const eventText = `${event.title} ${event.summary}`.toLowerCase();
    for (const keyword of keywords) {
      if (eventText.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    if (score > 0) {
      related.push({ id: event.id, title: event.title, year: event.year });
    }
  }

  return related.slice(0, 5);
}

// 简单关键词匹配，查找相关概念
function findRelatedConcepts(question: string): Array<{ id: string; name: string; category: string }> {
  const keywords = extractKeywords(question);
  const related: Array<{ id: string; name: string; category: string }> = [];

  for (const concept of concepts) {
    let score = 0;
    const conceptText = `${concept.name} ${concept.definition}`.toLowerCase();
    for (const keyword of keywords) {
      if (conceptText.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    if (score > 0) {
      related.push({ id: concept.id, name: concept.name, category: concept.category });
    }
  }

  return related.slice(0, 5);
}

// 提取关键词
function extractKeywords(text: string): string[] {
  const stopWords = ['的', '是', '了', '在', '和', '与', '对', '有', '什么', '怎么', '如何', '为什么', '哪个', '哪些', '历史', '单元', '第一', '高中'];
  const words = text
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !stopWords.includes(w));

  // 去重并限制数量
  return [...new Set(words)].slice(0, 10);
}
