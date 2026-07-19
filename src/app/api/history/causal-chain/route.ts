import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, findDocxImportByUnitId, findDocxImportByUnitTitle } from '@/lib/supabase';
import type { DocxParseResult } from '@/lib/docxParser';

export interface CausalChainNode {
  title: string;
  description: string;
  source?: string;
}

export interface CausalChain {
  eventName: string;
  chapterId: string;
  farCauses: CausalChainNode[];
  nearCauses: CausalChainNode[];
  event: string;
  directEffects: CausalChainNode[];
  deepEffects: CausalChainNode[];
}

// 内置因果链数据（用于 fallback）
const BUILT_IN_CAUSAL_LINKS = [
  { from: '商鞅变法', to: '秦国统一六国', description: '商鞅变法使秦国国富兵强，为统一奠定基础' },
  { from: '铁器牛耕使用', to: '井田制瓦解', description: '生产力提高推动土地私有制确立' },
  { from: '周王室衰微', to: '诸侯纷争', description: '分封制崩溃导致争霸战争' },
  { from: '百家争鸣', to: '儒学成为正统', description: '思想解放为后世文化奠基' },
  { from: '秦朝统一', to: '郡县制确立', description: '统一推动中央集权制度建立' },
  { from: '汉武帝大一统', to: '儒学独尊', description: '"罢黜百家，独尊儒术"确立正统思想' },
  { from: '小农经济形成', to: '封建制度巩固', description: '自给自足的经济模式稳定了封建统治' },
  { from: '分封制', to: '宗法制', description: '分封制与宗法制互为表里' },
];

// GET: 获取因果链列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const unitId = searchParams.get('unitId') || 'unit1';

  try {
    let links: { from: string; to: string; description: string }[] = [];

    // 尝试从 Supabase 获取
    if (isSupabaseConfigured) {
      const docxImport = await findDocxImportByUnitId(unitId);
      if (docxImport?.data) {
        const docxData = docxImport.data as any;
        if (docxData.causalLinks?.length > 0) {
          links = docxData.causalLinks.map((l: any) => ({
            from: l.sourceId || l.from,
            to: l.targetId || l.to,
            description: l.logic || l.description || '',
          }));
        }
      }
    }

    // Fallback: 使用内置数据
    if (links.length === 0) {
      links = BUILT_IN_CAUSAL_LINKS;
    }

    return NextResponse.json({
      success: true,
      data: { links },
    });
  } catch (error) {
    console.error('[history/causal-chain GET] error:', error);
    return NextResponse.json({ success: false, message: '获取因果链失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const eventName = String(body.eventName || '').trim();
    const chapterId = String(body.chapterId || 'unit1').trim();
    const sectionId = String(body.sectionId || '').trim();
    const unitId = String(body.unitId || chapterId).trim();

    if (!eventName) {
      return NextResponse.json({ success: false, message: '缺少事件名称' }, { status: 400 });
    }

    const cacheKey = sectionId
      ? `causal_chain_${encodeURIComponent(eventName)}_${encodeURIComponent(sectionId)}`
      : `causal_chain_${encodeURIComponent(eventName)}`;

    // 优先读取 docx 导入数据
    let docxImport: Awaited<ReturnType<typeof findDocxImportByUnitId>> = null;
    if (unitId) {
      docxImport = await findDocxImportByUnitId(unitId);
    }
    if (!docxImport) {
      const terms = [chapterId, sectionId, unitId, '第一单元', '中国古代史'].filter(Boolean);
      for (const term of terms) {
        docxImport = await findDocxImportByUnitTitle(term);
        if (docxImport?.data) break;
      }
    }

    if (docxImport?.data) {
      const docxData = docxImport.data as DocxParseResult;
      const chain = buildCausalChainFromDocx(eventName, chapterId, docxData);
      return NextResponse.json({
        success: true,
        source: 'docx_import',
        data: chain,
        importId: docxImport.id,
        unitTitle: docxData.unitTitle,
      });
    }

    const chain = await generateCausalChain(eventName, chapterId);
    return NextResponse.json({ success: true, source: 'generated', data: chain });
  } catch (error) {
    console.error('[history/causal-chain] error:', error);
    return NextResponse.json({ success: false, message: '生成因果链失败' }, { status: 500 });
  }
}

function buildCausalChainFromDocx(eventName: string, chapterId: string, docxData: DocxParseResult): CausalChain {
  const lower = eventName.toLowerCase();
  const matchedEvents = (docxData.timelineEvents || []).filter(e =>
    e.title.toLowerCase().includes(lower) ||
    e.summary.toLowerCase().includes(lower)
  );

  const target = matchedEvents[0];
  const farCauses: CausalChainNode[] = [];
  const nearCauses: CausalChainNode[] = [];
  const directEffects: CausalChainNode[] = [];
  const deepEffects: CausalChainNode[] = [];

  if (target) {
    const matchedLinks = (docxData.causalLinks || []).filter(l => l.targetId === target.id || l.sourceId === target.id);
    for (const link of matchedLinks.slice(0, 6)) {
      const node: CausalChainNode = {
        title: link.targetId === target.id ? link.sourceId : link.targetId,
        description: link.logic,
        source: 'docx_import',
      };
      if (link.targetId === target.id) {
        if (link.type === '导致' || link.type === '推动') directEffects.push(node);
        else nearCauses.push(node);
      } else {
        if (link.type === '导致' || link.type === '推动') farCauses.push(node);
        else nearCauses.push(node);
      }
    }
  }

  const relatedConcepts = (docxData.concepts || [])
    .filter(c => c.impact.toLowerCase().includes(lower) || c.name.toLowerCase().includes(lower))
    .slice(0, 3);

  for (const concept of relatedConcepts) {
    if (!farCauses.find(n => n.title === concept.name)) {
      farCauses.push({ title: concept.name, description: concept.definition, source: 'docx_import' });
    }
    if (!directEffects.find(n => n.title === concept.name)) {
      directEffects.push({ title: concept.name, description: concept.impact || concept.definition, source: 'docx_import' });
    }
  }

  if (!farCauses.length) farCauses.push({ title: `${eventName}的时代背景`, description: docxData.summary || '该事件发生于重要历史阶段。', source: 'docx_import' });
  if (!nearCauses.length) nearCauses.push({ title: '直接触发条件', description: target?.summary || '相关教材内容已整理。', source: 'docx_import' });
  if (!directEffects.length) directEffects.push({ title: '直接影响', description: target?.impact || '对当时政治、经济、社会产生了重要影响。', source: 'docx_import' });
  if (!deepEffects.length) deepEffects.push({ title: '历史意义', description: target?.impact || '对后世制度、民族关系或思想潮流产生深远影响。', source: 'docx_import' });

  return {
    eventName,
    chapterId,
    farCauses: farCauses.slice(0, 5),
    nearCauses: nearCauses.slice(0, 4),
    event: target?.summary || eventName,
    directEffects: directEffects.slice(0, 4),
    deepEffects: deepEffects.slice(0, 4),
  };
}

async function generateCausalChain(eventName: string, chapterId: string): Promise<CausalChain> {
  const prompt = `你是一位历史教学专家。请对"${eventName}"生成完整的因果链分析。

### 分析规则
1. 远因：事件发生的深层背景（1-3个，较宏观）
2. 近因：直接触发事件的原因（1-2个，直接诱因）
3. 事件：用一句话概括事件本身
4. 直接影响：事件带来的直接结果（1-2个）
5. 深远影响：事件的长期历史影响（1-2个）

### 输出格式（严格 JSON，不要有其他内容）
{
  "eventName": "${eventName}",
  "chapterId": "${chapterId}",
  "farCauses": [
    { "title": "标题", "description": "详细说明" }
  ],
  "nearCauses": [
    { "title": "标题", "description": "详细说明" }
  ],
  "event": "事件一句话概括",
  "directEffects": [
    { "title": "标题", "description": "详细说明" }
  ],
  "deepEffects": [
    { "title": "标题", "description": "详细说明" }
  ]
}`;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: '你是一位历史教学专家，擅长分析历史事件的因果关系，帮助学生理解历史逻辑。',
    }),
  });

  if (!response.ok) {
    throw new Error(`AI 请求失败: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || data.content || '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('未解析到 JSON');
  }

  const parsed = JSON.parse(jsonMatch[0]) as CausalChain;

  return {
    eventName: parsed.eventName || eventName,
    chapterId: parsed.chapterId || chapterId,
    farCauses: normalizeNodes(parsed.farCauses),
    nearCauses: normalizeNodes(parsed.nearCauses),
    event: parsed.event || eventName,
    directEffects: normalizeNodes(parsed.directEffects),
    deepEffects: normalizeNodes(parsed.deepEffects),
  };
}

function normalizeNodes(nodes: unknown): CausalChainNode[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((n) => {
    const record = n as Record<string, unknown>;
    return {
      title: String(record.title || ''),
      description: String(record.description || ''),
      source: record.source ? String(record.source) : undefined,
    };
  }).filter((n) => n.title);
}

export async function DELETE(request: NextRequest) {
  const eventName = request.nextUrl.searchParams.get('eventName') || '';
  if (!eventName) {
    return NextResponse.json({ success: false, message: '缺少事件名称' }, { status: 400 });
  }
  const cacheKey = `causal_chain_${encodeURIComponent(eventName)}`;
  try {
    deleteServerData(cacheKey);
  } catch {
    // ignore
  }
  return NextResponse.json({ success: true });
}

function deleteServerData(key: string) {
  try {
    if (global?.process?.env && Object.getOwnPropertyDescriptor(global.process.env, key)) {
      Object.defineProperty(global.process.env, key, {
        value: undefined,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
  } catch {
    // noop
  }
}
