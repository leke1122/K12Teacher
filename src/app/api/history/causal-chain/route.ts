import { NextRequest, NextResponse } from 'next/server';
import { getServerData, setServerData, deleteServerData } from '@/lib/serverStorage';

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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const eventName = String(body.eventName || '');
  const chapterId = String(body.chapterId || 'modern-china');

  if (!eventName) {
    return NextResponse.json({ success: false, message: '缺少事件名称' }, { status: 400 });
  }

  try {
    const cacheKey = `causal_chain_${encodeURIComponent(eventName)}`;
    const cached = getServerData<CausalChain>(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, source: 'cache', data: cached });
    }

    const chain = await generateCausalChain(eventName, chapterId);
    setServerData(cacheKey, chain);

    return NextResponse.json({ success: true, source: 'generated', data: chain });
  } catch (error) {
    console.error('[causal-chain] 生成失败:', error);
    return NextResponse.json({ success: false, message: '生成因果链失败' }, { status: 500 });
  }
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
  deleteServerData(cacheKey);
  return NextResponse.json({ success: true });
}
