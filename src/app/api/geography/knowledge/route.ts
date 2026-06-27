import { NextRequest, NextResponse } from 'next/server';
import { getServerData, setServerData, listServerKeys } from '@/lib/serverStorage';

export interface GeographyKnowledgeItem {
  id: string;
  type: 'concept' | 'law' | 'process' | 'region';
  title: string;
  definition: string;
  elements: string[];
  analogy: string;
  liaoningExample: string;
  chapterId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const chapterId = String(body.chapterId || 'compulsory-1');
    const content = body.text ? String(body.text) : '';

    const cacheKey = `geography_knowledge_${chapterId}_${Date.now()}`;
    const knowledge = await generateKnowledge(chapterId, content);

    setServerData(cacheKey, knowledge);

    return NextResponse.json({
      success: true,
      data: knowledge,
      source: 'generated',
    });
  } catch (error) {
    console.error('[geography/knowledge] 生成失败:', error);
    return NextResponse.json(
      { success: false, message: '生成知识点失败' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get('chapterId') || 'compulsory-1';

  try {
    const keys = listServerKeys(`geography_knowledge_${chapterId}_`);
    const items: GeographyKnowledgeItem[] = [];

    for (const key of keys.slice(0, 20)) {
      try {
        const item = getServerData<GeographyKnowledgeItem[]>(key);
        if (Array.isArray(item)) {
          items.push(...item);
        }
      } catch {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

async function generateKnowledge(chapterId: string, content: string): Promise<GeographyKnowledgeItem[]> {
  const prompt = `你是辽宁省高中地理教学专家，熟悉人教版（2019版）教材和辽宁卷命题特点。请从以下教材内容中提取核心知识点。

### 章节
${chapterId}

### 教材内容
${content || '人教版高中地理教材内容'}

### 要求
1. 提取4-6个核心知识点
2. 按类型分类：concept（概念）、law（规律）、process（过程）、region（区域特征）
3. 每个知识点包含：
   - 定义/规律表述
   - 核心要素列表
   - 生活化类比
   - 辽宁本地案例
4. 优先提取辽宁卷高频考点

### 输出格式（严格 JSON 数组）
[
  {
    "id": "k001",
    "type": "concept",
    "title": "知识点名称",
    "definition": "定义",
    "elements": ["要素1", "要素2", "要素3"],
    "analogy": "生活化类比",
    "liaoningExample": "辽宁案例",
    "chapterId": "${chapterId}"
  }
]`;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: '你是地理教学专家，擅长提取地理核心知识点，输出必须严格符合 JSON 格式。',
    }),
  });

  if (!response.ok) {
    throw new Error(`AI 请求失败: ${response.status}`);
  }

  const data = await response.json();
  const contentText = data.choices?.[0]?.message?.content || data.content || '';

  const jsonMatch = contentText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return getDefaultKnowledge(chapterId);
  }

  try {
    return JSON.parse(jsonMatch[0]) as GeographyKnowledgeItem[];
  } catch {
    return getDefaultKnowledge(chapterId);
  }
}

function getDefaultKnowledge(chapterId: string): GeographyKnowledgeItem[] {
  return [
    {
      id: `default-${chapterId}-1`,
      type: 'concept',
      title: chapterId === 'compulsory-1' ? '热力环流' : '农业区位因素',
      definition: chapterId === 'compulsory-1'
        ? '由于地面冷热不均而形成的空气环流'
        : '影响农业生产布局和发展的各种因素',
      elements: chapterId === 'compulsory-1'
        ? ['受热上升', '冷却下沉', '水平运动']
        : ['自然因素', '人文因素', '技术因素'],
      analogy: chapterId === 'compulsory-1'
        ? '就像烧水时水的对流运动'
        : '就像开店选址要考虑客流量、租金、竞争对手等',
      liaoningExample: chapterId === 'compulsory-1'
        ? '大连滨海地区的海陆风'
        : '辽河平原水稻种植的区位优势',
      chapterId,
    },
  ];
}
