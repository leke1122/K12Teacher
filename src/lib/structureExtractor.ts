export interface PageRange {
  type: 'printed' | 'file';
  start: number;
  end: number;
  fileStart?: number;
  fileEnd?: number;
}

export interface SubSection {
  title: string;
  pages: PageRange;
}

export interface Section {
  sectionIndex: string;
  sectionTitle: string;
  pages: PageRange;
  subSections?: SubSection[];
}

export interface Chapter {
  chapterIndex: number;
  chapterTitle: string;
  pages: PageRange;
  sections?: Section[];
}

export interface ExtractedStructure {
  chapters: Chapter[];
  source: 'complex-two-stage' | 'linear';
}

const COMPLEX_SUBJECT_KEYWORDS = ['语文', '中文', '汉语', '古文', '文言文', '诗歌', '现代文'];
const LINEAR_SUBJECT_KEYWORDS = ['数学', '物理', '化学', '生物', '英语'];
const UNIT_KEYWORDS = ['单元', '章'];
const LESSON_KEYWORDS = ['课', '第'];

export function detectTextbookType(text: string, subjectId?: string): 'complex' | 'linear' | 'unknown' {
  const lowerText = text.toLowerCase();

  if (subjectId && LINEAR_SUBJECT_KEYWORDS.some((kw) => subjectId.toLowerCase().includes(kw))) {
    return 'linear';
  }

  const isComplexBySubject = COMPLEX_SUBJECT_KEYWORDS.some((kw) => lowerText.includes(kw));
  const hasUnitStructure = UNIT_KEYWORDS.some((kw) => lowerText.includes(kw));
  const hasLessonStructure = LESSON_KEYWORDS.some((kw) => lowerText.includes(kw));
  const hasComplexStructure = hasUnitStructure && hasLessonStructure;

  if (isComplexBySubject && hasComplexStructure) {
    return 'complex';
  }

  if (isComplexBySubject) {
    return 'complex';
  }

  if (hasComplexStructure && LINEAR_SUBJECT_KEYWORDS.every((kw) => !lowerText.includes(kw))) {
    return 'complex';
  }

  return 'unknown';
}

export async function callDeepSeek(apiKey: string, prompt: string, temperature: number = 0, maxTokens: number = 20000): Promise<string> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个严格输出 JSON 的教材目录解析助手，必须只返回 JSON 对象，不要包含任何其他文字。' },
        { role: 'user', content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'AI 请求失败');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

function buildTocHint(text: string): string {
  const tocKeywords = ['目录', 'CONTENTS', '目次', 'TABLE OF CONTENTS'];
  for (const keyword of tocKeywords) {
    const idx = text.indexOf(keyword);
    if (idx !== -1) {
      const start = Math.max(0, idx - 200);
      const end = Math.min(text.length, idx + 6000);
      return `\n\n【目录片段】\n${text.slice(start, end)}\n`;
    }
  }
  return '\n\n【提示】未找到明显目录关键词，请从全文自行识别章节结构。\n';
}

export async function extractComplexStructure(text: string, apiKey: string): Promise<ExtractedStructure> {
  const tocHint = buildTocHint(text);

  const stage1Prompt = `你是一位专业的教材结构解析专家。请从以下教材文本中提取完整的层级结构，不需要关注具体页码，只需要识别标题层级关系。

## 任务
识别教材的层级结构，包括单元、课/节、小节等层级。

## 提取规则
1. 提取所有"单元"及其完整标题（如"第一单元"、"第二单元"等）
2. 在每个单元下，提取所有"课"或"节"（如"第1课"、"第2课"等）
3. 如果有更细的小节层级，也一并提取
4. 严格按教材原文提取标题，不要修改或概括
5. 如果教材没有明确的单元结构，则直接以章/课为层级

## 输出格式（严格JSON）
{
  "meta": {
    "structureType": "complex",
    "unitPattern": "第X单元",
    "lessonPattern": "第X课",
    "totalUnits": 0,
    "totalLessons": 0
  },
  "hierarchy": [
    {
      "unitIndex": 1,
      "unitTitle": "第一单元 完整标题",
      "lessons": [
        {
          "lessonIndex": "第1课",
          "lessonTitle": "课标题",
          "subItems": [
            {"title": "小节标题1"},
            {"title": "小节标题2"}
          ]
        }
      ]
    }
  ]
}

${tocHint}

## 教材文本（前40000字符）
${text.slice(0, 40000)}

## 最终要求
1. 只输出 JSON，不要任何其他文字。
2. JSON 必须可被 JSON.parse 解析。
3. 必须提取所有单元和课，不能遗漏。`;

  const stage1Result = await callDeepSeek(apiKey, stage1Prompt, 0.2, 8000);

  let stage1Parsed: Record<string, unknown> | null = null;
  const jsonMatch = stage1Result.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      stage1Parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    } catch {
      const cleanedJson = jsonMatch[0]
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/'/g, '"');
      try {
        stage1Parsed = JSON.parse(cleanedJson) as Record<string, unknown>;
      } catch {
        throw new Error('第一阶段结构提取 JSON 解析失败');
      }
    }
  }

  if (!stage1Parsed || !Array.isArray(stage1Parsed.hierarchy)) {
    throw new Error('第一阶段未返回有效的层级结构');
  }

  const stage2Prompt = `你是一位页码定位专家。请根据以下教材目录内容，为每个已识别的标题找到对应的页码。

## 已知的层级结构（从第一阶段提取）
${JSON.stringify(stage1Parsed.hierarchy, null, 2)}

## 任务
为上述每个标题（单元、课、小节）找到其在教材中的起始页码。

## 页码规则
1. 页码必须是数字
2. 如果教材使用"第X页"格式，提取数字X
3. 如果教材使用"- X -"格式，提取数字X
4. 如果找不到明确页码，根据上下文推断
5. 单元页码 = 该单元第一课的起始页
6. 课的结束页 = 下一课的起始页 - 1，最后一课 = 教材总页数

## 输出格式（严格JSON）
{
  "pageMapping": [
    {
      "title": "完整标题",
      "type": "unit" | "lesson" | "subItem",
      "parentTitle": "父级标题",
      "startPage": 1,
      "endPage": 10,
      "confidence": "high" | "medium" | "low"
    }
  ],
  "totalPages": 100,
  "pageType": "printed" | "file",
  "offset": 0
}

${tocHint}

## 教材文本（前40000字符）
${text.slice(0, 40000)}

## 最终要求
1. 只输出 JSON，不要任何其他文字。
2. JSON 必须可被 JSON.parse 解析。
3. 页码必须是数字。`;

  const stage2Result = await callDeepSeek(apiKey, stage2Prompt, 0, 8000);

  let stage2Parsed: Record<string, unknown> | null = null;
  const stage2JsonMatch = stage2Result.match(/\{[\s\S]*\}/);
  if (stage2JsonMatch) {
    try {
      stage2Parsed = JSON.parse(stage2JsonMatch[0]) as Record<string, unknown>;
    } catch {
      const cleanedJson = stage2JsonMatch[0]
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/'/g, '"');
      try {
        stage2Parsed = JSON.parse(cleanedJson) as Record<string, unknown>;
      } catch {
        throw new Error('第二阶段页码定位 JSON 解析失败');
      }
    }
  }

  if (!stage2Parsed || !Array.isArray(stage2Parsed.pageMapping)) {
    throw new Error('第二阶段未返回有效的页码映射');
  }

  const pageMapping = stage2Parsed.pageMapping as Array<Record<string, unknown>>;
  const totalPages = Number(stage2Parsed.totalPages) || 999;
  const pageType = stage2Parsed.pageType === 'printed' ? 'printed' : 'file';

  const unitMap = new Map<string, Chapter>();
  const lessonMap = new Map<string, { chapter: Chapter; section: Section }>();

  for (const item of pageMapping) {
    const title = String(item.title || '').trim();
    const type = String(item.type || '').trim();
    const parentTitle = String(item.parentTitle || '').trim();
    const startPage = Number(item.startPage) || 1;
    const endPage = Number(item.endPage) || totalPages;

    if (type === 'unit' || (type === 'lesson' && !parentTitle)) {
      const chapter: Chapter = {
        chapterIndex: unitMap.size + 1,
        chapterTitle: title,
        pages: {
          type: pageType,
          start: startPage,
          end: endPage,
          ...(pageType === 'printed' ? { fileStart: startPage, fileEnd: endPage } : {}),
        },
        sections: [],
      };
      unitMap.set(title, chapter);
    } else if (type === 'lesson') {
      const parentChapter = unitMap.get(parentTitle);
      if (parentChapter) {
        const section: Section = {
          sectionIndex: `第${parentChapter.sections!.length + 1}课`,
          sectionTitle: title,
          pages: {
            type: pageType,
            start: startPage,
            end: endPage,
            ...(pageType === 'printed' ? { fileStart: startPage, fileEnd: endPage } : {}),
          },
          subSections: [],
        };
        parentChapter.sections!.push(section);
        lessonMap.set(title, { chapter: parentChapter, section });
      }
    } else if (type === 'subItem') {
      const lessonEntry = lessonMap.get(parentTitle);
      if (lessonEntry) {
        lessonEntry.section.subSections!.push({
          title,
          pages: {
            type: pageType,
            start: startPage,
            end: endPage,
            ...(pageType === 'printed' ? { fileStart: startPage, fileEnd: endPage } : {}),
          },
        });
      }
    }
  }

  const chapters = Array.from(unitMap.values()).map((ch, idx) => ({
    ...ch,
    chapterIndex: idx + 1,
    pages: {
      ...ch.pages,
      start: ch.sections && ch.sections.length > 0 ? Math.min(ch.pages.start, ch.sections[0].pages.start) : ch.pages.start,
      end: ch.sections && ch.sections.length > 0 ? Math.max(ch.pages.end, ch.sections[ch.sections.length - 1].pages.end) : ch.pages.end,
    },
  }));

  return {
    chapters,
    source: 'complex-two-stage',
  };
}
