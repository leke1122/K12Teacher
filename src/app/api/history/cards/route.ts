import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, findDocxImportByUnitId, findDocxImportByUnitTitle } from '@/lib/supabase';
import { getServerData, setServerData } from '@/lib/serverStorage';
import type { DocxParseResult } from '@/lib/docxParser';

interface HistoryCardItem {
  id: string;
  type: 'event' | 'person' | 'system' | 'treaty';
  title: string;
  front: string;
  back: string;
  chapterId: string;
}

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get('chapterId') || 'unit1';
  const sectionId = request.nextUrl.searchParams.get('sectionId') || '';
  const unitId = request.nextUrl.searchParams.get('unitId') || '';

  const cacheKey = sectionId
    ? `history_cards_${chapterId}_${encodeURIComponent(sectionId)}`
    : `history_cards_${chapterId}`;

  try {
    const cached = getServerData<{ chapterId: string; cards: HistoryCardItem[] }>(cacheKey);
    if (cached?.cards?.length) {
      return NextResponse.json({ success: true, source: 'cache', data: cached });
    }
  } catch {
    // ignore cache errors
  }

  // 优先读取 docx 导入数据
  try {
    let docxImport: Awaited<ReturnType<typeof findDocxImportByUnitId>> = null;
    if (unitId) {
      docxImport = await findDocxImportByUnitId(unitId);
    }
    if (!docxImport) {
      const terms = [chapterId, sectionId, unitId, '第一单元', '中国古代史'].filter(Boolean) as string[];
      for (const term of terms) {
        docxImport = await findDocxImportByUnitTitle(term);
        if (docxImport?.data) break;
      }
    }

    if (docxImport?.data) {
      const docxData = docxImport.data as DocxParseResult;
      const cards = buildCardsFromDocx(chapterId, docxData);
      const payload = { chapterId, cards };
      try { setServerData(cacheKey, payload); } catch {}
      return NextResponse.json({ success: true, source: 'docx_import', data: payload, importId: docxImport.id, unitTitle: docxData.unitTitle });
    }
  } catch (err) {
    console.warn('[history/cards] docx 加载失败:', err);
  }

  return NextResponse.json({ success: true, source: 'empty', data: { chapterId, cards: [] } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const chapterId = String(body.chapterId || 'unit1');
  const sectionId = String(body.sectionId || '');
  const unitId = String(body.unitId || '');

  try {
    // 优先读取 docx 导入数据
    let docxImport: Awaited<ReturnType<typeof findDocxImportByUnitId>> = null;
    if (unitId) {
      docxImport = await findDocxImportByUnitId(unitId);
    }
    if (!docxImport) {
      const terms = [chapterId, sectionId, unitId, '第一单元', '中国古代史'].filter(Boolean) as string[];
      for (const term of terms) {
        docxImport = await findDocxImportByUnitTitle(term);
        if (docxImport?.data) break;
      }
    }

    if (docxImport?.data) {
      const docxData = docxImport.data as DocxParseResult;
      const cards = buildCardsFromDocx(chapterId, docxData);
      const cacheKey = sectionId
        ? `history_cards_${chapterId}_${encodeURIComponent(sectionId)}`
        : `history_cards_${chapterId}`;
      const payload = { chapterId, cards };
      setServerData(cacheKey, payload);
      return NextResponse.json({ success: true, source: 'docx_import', data: payload, importId: docxImport.id, unitTitle: docxData.unitTitle });
    }

    const textbook = await getHistoryTextbook();
    if (!textbook) {
      return NextResponse.json({ success: false, message: '未找到历史教材，请先上传教材' }, { status: 404 });
    }

    let text: string | null = null;
    let sectionTitle = textbook.textbookName;

    if (sectionId) {
      const title = await getHistoryLessonTitle(sectionId);
      sectionTitle = title || sectionTitle;
      text = await getHistoryLessonContent(sectionId);
    }

    if (!text) {
      const title = await getHistoryLessonTitle(chapterId);
      sectionTitle = title || sectionTitle;
      text = await getHistoryTextbookTextByPages(chapterId);
    }

    if (!text) {
      return NextResponse.json({ success: false, message: '教材内容为空' }, { status: 400 });
    }

    const cards = await generateHistoryCards(chapterId, sectionTitle, text);
    const cacheKey = sectionId
      ? `history_cards_${chapterId}_${encodeURIComponent(sectionId)}`
      : `history_cards_${chapterId}`;
    const payload = { chapterId, cards };
    setServerData(cacheKey, payload);

    return NextResponse.json({ success: true, source: 'generated', data: payload });
  } catch (error) {
    console.error('[history/cards] 生成失败:', error);
    return NextResponse.json({ success: false, message: '生成历史卡牌失败' }, { status: 500 });
  }
}

function buildCardsFromDocx(chapterId: string, docxData: DocxParseResult): HistoryCardItem[] {
  const cards: HistoryCardItem[] = [];
  const seen = new Set<string>();

  for (const event of docxData.timelineEvents || []) {
    const id = `event-${event.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    cards.push({
      id,
      type: 'event',
      title: event.title,
      front: event.title,
      back: `${event.year} · ${event.dynasty}\n\n${event.summary}\n\n历史影响：${event.impact || '详见知识点'}`,
      chapterId,
    });
  }

  for (const concept of docxData.concepts || []) {
    const id = `concept-${concept.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    cards.push({
      id,
      type: 'system',
      title: concept.name,
      front: concept.name,
      back: `类别：${concept.category}\n\n定义：${concept.definition}${concept.keyPeople?.length ? `\n\n关键人物：${concept.keyPeople.join('、')}` : ''}`,
      chapterId,
    });
  }

  if (!cards.length) {
    return generateFallbackCards(chapterId);
  }

  return cards;
}

async function generateHistoryCards(chapterId: string, chapterTitle: string, text: string): Promise<HistoryCardItem[]> {
  const prompt = `你是一位历史教学专家。请从以下历史教材内容中提取 6-10 个适合做记忆卡牌的知识点。

### 要求
1. 覆盖事件卡、人物卡、制度卡、条约卡等多种类型
2. 正面是问项/名称，反面是答案/解释
3. 答案简洁，适合记忆

### 输出格式（严格 JSON 数组）
[
  {
    "id": "card-1",
    "type": "event",
    "title": "鸦片战争",
    "front": "鸦片战争",
    "back": "1840-1842 年，英国因鸦片贸易与中国爆发战争，中国近代史开端",
    "chapterId": "${chapterId}"
  }
]

### 教材内容
${text.slice(0, 10000)}`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: '你是一位历史教学专家，擅长将历史知识点制作成记忆卡牌。',
      }),
    });

    if (!response.ok) {
      throw new Error(`AI 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content || '';

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('未提取到 JSON 数组');
    }

    const parsed = JSON.parse(jsonMatch[0]) as unknown[];
    if (!Array.isArray(parsed)) {
      throw new Error('解析结果不是数组');
    }

    return parsed.map((item, index) => {
      const record = item as Record<string, unknown>;
      return {
        id: String(record.id || `card-${chapterId}-${index + 1}`),
        type: (record.type as HistoryCardItem['type']) || 'event',
        title: String(record.title || record.front || `卡牌 ${index + 1}`),
        front: String(record.front || record.title || ''),
        back: String(record.back || ''),
        chapterId: String(record.chapterId || chapterId),
      };
    });
  } catch (error) {
    console.error('[history/cards] 生成卡牌失败:', error);
    return generateFallbackCards(chapterId);
  }
}

function generateFallbackCards(chapterId: string): HistoryCardItem[] {
  return [
    {
      id: `${chapterId}-fallback-1`,
      type: 'event',
      title: '本章核心事件',
      front: '本章最重要的历史事件是什么？',
      back: '请结合教材内容总结本章最重要的历史事件、人物和影响。',
      chapterId,
    },
    {
      id: `${chapterId}-fallback-2`,
      type: 'person',
      title: '关键人物',
      front: '本章涉及哪些关键历史人物？',
      back: '请记住主要人物的姓名、时代及其历史作用。',
      chapterId,
    },
    {
      id: `${chapterId}-fallback-3`,
      type: 'system',
      title: '制度与影响',
      front: '本章涉及哪些重要制度或条约？',
      back: '请结合历史背景理解制度或条约的来龙去脉。',
      chapterId,
    },
  ];
}

async function getHistoryTextbook() {
  try {
    const mod = await import('@/lib/historyData.server');
    return mod.getHistoryTextbook();
  } catch {
    return null;
  }
}

async function getHistoryLessonTitle(sectionId: string) {
  try {
    const mod = await import('@/lib/historyData.server');
    return mod.getHistoryLessonTitle(sectionId);
  } catch {
    return null;
  }
}

async function getHistoryLessonContent(sectionId: string) {
  try {
    const mod = await import('@/lib/historyData.server');
    return mod.getHistoryLessonContent(sectionId);
  } catch {
    return null;
  }
}

async function getHistoryTextbookTextByPages(chapterId: string, startPage?: number, endPage?: number) {
  try {
    const mod = await import('@/lib/historyData.server');
    return mod.getHistoryTextbookTextByPages(chapterId, startPage, endPage);
  } catch {
    return null;
  }
}
