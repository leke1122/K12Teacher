// 历史事件提取工具 - 从教材文本中提取结构化历史事件

export interface HistoryEvent {
  id: string;
  chapterId: string;
  title: string;
  year: number;
  yearEnd?: number;
  month?: number;
  dynasty?: string;
  location?: string;
  figures: string[];
  causes: string;
  effects: string;
  significance?: string;
  summary: string;
  // 扩展字段
  category?: 'politics' | 'economy' | 'culture' | 'war' | 'technology' | 'society';
  importance?: 1 | 2 | 3;
  description?: string;
  color?: string;
  relatedIds?: string[];
}

const SYSTEM_PROMPT = `你是一位历史教材解析专家，擅长从教材文本中提取结构化的历史事件。
要求：
1. 按时间顺序提取事件
2. 每个事件必须包含：名称、年份、地点、人物、原因、影响、一句话概括
3. 如果年份不明确，使用"约XXX年"并尽量推断
4. 人物使用数组表示
5. 只返回 JSON 数组，不要返回其他内容`;

export async function extractHistoryEvents(
  chapterId: string,
  text: string,
): Promise<HistoryEvent[]> {
  const prompt = `请从以下历史教材内容中提取所有历史事件，严格返回 JSON 数组。

### 输出格式
[
  {
    "id": "event-1",
    "chapterId": "${chapterId}",
    "title": "鸦片战争",
    "year": 1840,
    "yearEnd": 1842,
    "dynasty": "清",
    "location": "中国东南沿海",
    "figures": ["林则徐", "道光皇帝"],
    "causes": "英国向中国走私鸦片，清政府开展禁烟运动，英国以保护通商为借口发动战争。",
    "effects": "签订《南京条约》，中国开始沦为半殖民地半封建社会。",
    "significance": "中国近代史的开端",
    "summary": "英国因鸦片贸易与中国爆发战争，导致中国近代史开端。",
    "category": "war",
    "importance": 3,
    "description": "英国为打开中国市场，以禁烟为借口发动侵略战争...",
    "relatedIds": ["event-2"]
  }
]

### 分类说明（category字段）
- politics: 政治制度、改革、革命
- economy: 经济政策、贸易、工业
- culture: 文化、教育、思想
- war: 战争、军事冲突
- technology: 科技发明、工程建设
- society: 社会变革、人口迁移

### 重要程度（importance字段）
- 1: 一般事件
- 2: 重要事件
- 3: 最重要事件（重大转折点、里程碑）

### 教材内容
${text.slice(0, 12000)}`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: SYSTEM_PROMPT,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI 请求失败：${response.status}`);
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
      const raw = item as Record<string, unknown>;
      return {
        id: String(raw.id || `event-${index + 1}`),
        chapterId: String(raw.chapterId || chapterId),
        title: String(raw.title || '未命名事件'),
        year: Number(raw.year) || 0,
        yearEnd: raw.yearEnd ? Number(raw.yearEnd) : undefined,
        month: raw.month ? Number(raw.month) : undefined,
        dynasty: raw.dynasty ? String(raw.dynasty) : undefined,
        location: raw.location ? String(raw.location) : undefined,
        figures: Array.isArray(raw.figures)
          ? (raw.figures as string[])
          : [],
        causes: String(raw.causes || ''),
        effects: String(raw.effects || ''),
        significance: raw.significance
          ? String(raw.significance)
          : undefined,
        summary: String(raw.summary || raw.title || ''),
        category: ['politics', 'economy', 'culture', 'war', 'technology', 'society'].includes(String(raw.category))
          ? String(raw.category) as HistoryEvent['category']
          : undefined,
        importance: [1, 2, 3].includes(Number(raw.importance))
          ? Number(raw.importance) as 1 | 2 | 3
          : undefined,
        description: raw.description ? String(raw.description) : undefined,
        color: raw.color ? String(raw.color) : undefined,
        relatedIds: Array.isArray(raw.relatedIds)
          ? (raw.relatedIds as string[])
          : undefined,
      };
    });
  } catch (error) {
    console.error('[historyExtractor] 提取失败:', error);
    return [];
  }
}
