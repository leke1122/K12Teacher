import { NextRequest, NextResponse } from 'next/server';
import { getServerData, setServerData, deleteServerData, listServerKeys } from '@/lib/serverStorage';

export interface PoliticsKnowledgeItem {
  id: string;
  type: 'concept' | 'theory' | 'assertion' | 'principle';
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
    const chapterId = String(body.chapterId || 'politics-compulsory-2');
    const content = body.text ? String(body.text) : '';

    const cacheKey = `politics_knowledge_${chapterId}_${Date.now()}`;
    const knowledge = await generateKnowledge(chapterId, content);

    setServerData(cacheKey, knowledge);

    return NextResponse.json({
      success: true,
      data: knowledge,
      source: 'generated',
    });
  } catch (error) {
    console.error('[politics/knowledge] 生成失败:', error);
    return NextResponse.json(
      { success: false, message: '生成知识点失败' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get('chapterId') || 'politics-compulsory-2';

  try {
    const keys = listServerKeys(`politics_knowledge_${chapterId}_`);
    const items: PoliticsKnowledgeItem[] = [];

    for (const key of keys.slice(0, 20)) {
      try {
        const item = getServerData<PoliticsKnowledgeItem[]>(key);
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

async function generateKnowledge(chapterId: string, content: string): Promise<PoliticsKnowledgeItem[]> {
  const moduleHint: Record<string, string> = {
    'politics-compulsory-1': '经济（中国特色社会主义）',
    'politics-compulsory-2': '经济（经济与社会）',
    'politics-compulsory-3': '政治（政治与法治）',
    'politics-compulsory-4': '哲学与文化',
    'politics-selective-1': '政治（当代国际政治与经济）',
    'politics-selective-2': '政治（法律与生活）',
    'politics-selective-3': '逻辑（逻辑与思维）',
  };

  const prompt = `你是辽宁省高中政治教学专家，熟悉统编版教材和辽宁卷命题特点。请从以下教材内容中提取核心知识点。

### 章节
${chapterId}：${moduleHint[chapterId] || '思想政治'}

### 教材内容
${content || '人教版高中思想政治教材内容'}

### 要求
1. 提取4-6个核心知识点
2. 按类型分类：concept（核心概念）、theory（理论体系）、assertion（重要论断）、principle（原理规律）
3. 每个知识点包含：
   - 定义/理论表述
   - 核心要素列表
   - 生活化类比
   - 辽宁本地案例或辽宁卷命题关联
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
    "liaoningExample": "辽宁案例或命题关联",
    "chapterId": "${chapterId}"
  }
]`;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      systemPrompt: '你是政治教学专家，擅长提取思想政治核心知识点，输出必须严格符合 JSON 格式。',
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
    return JSON.parse(jsonMatch[0]) as PoliticsKnowledgeItem[];
  } catch {
    return getDefaultKnowledge(chapterId);
  }
}

function getDefaultKnowledge(chapterId: string): PoliticsKnowledgeItem[] {
  if (chapterId === 'politics-compulsory-2') {
    return [
      {
        id: `${chapterId}-1`,
        type: 'concept',
        title: '公有制为主体、多种所有制经济共同发展',
        definition: '是我国社会主义初级阶段的基本经济制度之一。公有制经济包括国有经济、集体经济以及混合所有制经济中的国有成分和集体成分。',
        elements: ['公有制主体地位', '多种所有制共同发展', '两个毫不动摇'],
        analogy: '就像一个大班级，既有班干部（公有制）发挥主导作用，也有普通同学（非公有制）共同参与，形成良好的班级氛围。',
        liaoningExample: '辽中南工业基地的国有企业改革，同时鼓励民营经济发展，形成多种所有制共同发展格局。',
        chapterId,
      },
      {
        id: `${chapterId}-2`,
        type: 'principle',
        title: '市场在资源配置中起决定性作用，更好发挥政府作用',
        definition: '市场决定资源配置是市场经济的一般规律，政府要进行科学的宏观调控、有效的政府治理。',
        elements: ['市场决定性作用', '政府科学调控', '有效市场+有为政府'],
        analogy: '就像菜市场，价格由供需决定（市场），但政府要管食品安全、公平交易（政府）。',
        liaoningExample: '辽宁优化营商环境，深化"放管服"改革，既发挥市场在资源配置中的决定性作用，又更好发挥政府作用。',
        chapterId,
      },
    ];
  }

  if (chapterId === 'politics-compulsory-3') {
    return [
      {
        id: `${chapterId}-1`,
        type: 'assertion',
        title: '党的领导是中国特色社会主义最本质的特征',
        definition: '中国共产党领导是中国特色社会主义最本质的特征，是中国特色社会主义制度的最大优势。',
        elements: ['本质特征', '最大优势', '政治保证', '最高政治领导力量'],
        analogy: '就像一艘巨轮的船长和方向盘，决定了航行的方向和速度。',
        liaoningExample: '辽宁实施全面振兴新突破三年行动，正是党领导辽宁振兴发展的生动体现。',
        chapterId,
      },
    ];
  }

  if (chapterId === 'politics-compulsory-4') {
    return [
      {
        id: `${chapterId}-1`,
        type: 'principle',
        title: '矛盾具有普遍性',
        definition: '矛盾存在于一切事物的发展过程中，每一事物的发展过程中都存在着自始至终的矛盾运动。',
        elements: ['矛盾普遍性', '承认矛盾', '分析矛盾', '解决矛盾'],
        analogy: '就像手机有优点也有缺点，任何事物都有两面性，我们要正视矛盾、分析矛盾、解决矛盾。',
        liaoningExample: '辽宁振兴面临机遇与挑战并存的局面，要用矛盾分析法看待问题，在解决矛盾中推动发展。',
        chapterId,
      },
      {
        id: `${chapterId}-2`,
        type: 'principle',
        title: '矛盾的同一性与斗争性',
        definition: '同一性是矛盾双方相互吸引、相互联结的属性和趋势；斗争性是矛盾双方相互排斥、相互对立的属性。',
        elements: ['同一性', '斗争性', '对立统一', '相互转化'],
        analogy: '就像学习中的压力与动力，压力可以转化为动力，二者在一定条件下相互转化。',
        liaoningExample: '辽宁传统产业转型升级中，传统产业与新兴产业既存在竞争（斗争性），又可以在创新中融合发展（同一性）。',
        chapterId,
      },
    ];
  }

  return [
    {
      id: `${chapterId}-default`,
      type: 'concept',
      title: '该章节核心概念',
      definition: '请结合教材内容学习该章节的核心概念和理论体系。',
      elements: ['核心概念', '理论要点', '实际应用'],
      analogy: '通过生活实例理解抽象概念，建立知识与生活的联系。',
      liaoningExample: '结合辽宁实际案例，理解知识的现实意义。',
      chapterId,
    },
  ];
}
