export interface GeographySection {
  id: string;
  title: string;
  content: string[];
  keywords?: string[];
}

export interface TableRecord {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface Concept {
  id: string;
  name: string;
  category: '宇宙' | '太阳' | '地球' | '大气' | '圈层' | '地质' | '区域';
  definition: string;
  keyPoints: string[];
  importance: number;
  gaokaoFocus?: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  summary: string;
  impact: string;
  category: string;
  importance: number;
}

export interface CausalLink {
  id: string;
  sourceId: string;
  targetId: string;
  logic: string;
  type: '导致' | '促进' | '推动';
}

export interface ExamFocus {
  conceptId: string;
  conceptName: string;
  frequency: '常考' | '必考';
  questionTypes: string[];
  difficulty: '易' | '中' | '难';
  typicalQuestions: string[];
}

export interface ImageRef {
  id: string;
  caption: string;
  context: string;
}

export interface GeographyParseResult {
  unitId: string;
  unitTitle: string;
  sections: GeographySection[];
  tables: TableRecord[];
  concepts: Concept[];
  timelineEvents: TimelineEvent[];
  causalLinks: CausalLink[];
  examFocus: ExamFocus[];
  imageRefs: ImageRef[];
  summary: string;
  rawImportDate: string;
  source: 'docx_import';
}

export function parseGeographyDocx(rawText: string, fileName?: string): GeographyParseResult {
  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const unitTitle = extractUnitTitle(text, fileName);
  const sections = extractSections(text);
  const tables = extractTables(text);
  const concepts = extractConcepts(text);
  const timelineEvents = extractTimelineEvents(text);
  const causalLinks = buildCausalLinks(concepts, timelineEvents);
  const examFocus = identifyExamFocus(concepts);
  const imageRefs = extractImageRefs(text);
  const summary = generateSummary(concepts, sections);

  return {
    unitId: `geography_unit_${Date.now()}`,
    unitTitle,
    sections,
    tables,
    concepts,
    timelineEvents,
    causalLinks,
    examFocus,
    imageRefs,
    summary,
    rawImportDate: new Date().toISOString(),
    source: 'docx_import',
  };
}

function extractUnitTitle(text: string, fileName?: string): string {
  if (fileName) {
    const match = fileName.match(/第[一二三四五六七八九十]+章[^\n]*/);
    if (match) return match[0].trim();
  }
  const match = text.match(/第[一二三四五六七八九十]+章[^\n]{0,60}/);
  if (match) return match[0].trim();
  return '第一章 宇宙中的地球';
}

function extractSections(text: string): GeographySection[] {
  const sectionRegex = /第[一二三四五六七八九十]+节[：:]?\s*([^\n]+)/g;
  const sections: GeographySection[] = [];
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  let idx = 0;

  const lines = text.split('\n');
  const headers: { title: string; index: number }[] = [];
  for (const line of lines) {
    const m = line.match(/第[一二三四五六七八九十]+节[：:]?\s*([^\n]+)/);
    if (m) headers.push({ title: m[1].trim(), index: idx });
    idx++;
  }

  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index;
    const end = i + 1 < headers.length ? headers[i + 1].index : lines.length;
    const content = lines.slice(start, end).map(l => l.trim()).filter(Boolean);
    sections.push({
      id: slugify(headers[i].title),
      title: headers[i].title,
      content,
    });
  }

  if (!sections.length) {
    sections.push({
      id: 'full',
      title: unitTitle(text),
      content: lines.map(l => l.trim()).filter(Boolean),
    });
  }
  return sections;
}

function extractTables(text: string): TableRecord[] {
  const tables: TableRecord[] = [];
  const lines = text.split('\n');
  const tableBlocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^[\s\-|+]+$/.test(trimmed) || trimmed.includes('---')) {
      if (current.length) {
        tableBlocks.push(current);
        current = [];
      }
      continue;
    }
    if (/[A-Za-z]/.test(trimmed) && /[0-9]/.test(trimmed) && trimmed.includes('.')) {
      current.push(trimmed);
    }
  }
  if (current.length) tableBlocks.push(current);

  for (const block of tableBlocks) {
    const headers = block[0].split(/\s{2,}|\t/).map(h => h.replace(/^[0-9]+\.\s*/, '').trim()).filter(Boolean);
    const rows: string[][] = [];
    for (let i = 1; i < block.length; i++) {
      const cells = block[i].split(/\s{2,}|\t/).map(c => c.trim()).filter(Boolean);
      if (cells.length) rows.push(cells);
    }
    if (headers.length && rows.length) {
      tables.push({
        title: headers[0],
        headers,
        rows,
      });
    }
  }
  return tables.slice(0, 10);
}

function extractConcepts(text: string): Concept[] {
  const keywords = [
    { name: '天体', category: '宇宙' as const, importance: 4 },
    { name: '天体系统', category: '宇宙' as const, importance: 5 },
    { name: '太阳辐射', category: '太阳' as const, importance: 5 },
    { name: '太阳活动', category: '太阳' as const, importance: 5 },
    { name: '地球生命', category: '地球' as const, importance: 5 },
    { name: '地球圈层', category: '圈层' as const, importance: 5 },
    { name: '地质年代', category: '地质' as const, importance: 4 },
    { name: '生物演化', category: '地质' as const, importance: 4 },
    { name: '八大行星', category: '宇宙' as const, importance: 5 },
  ];

  const seen = new Set<string>();
  const concepts: Concept[] = [];
  for (const item of keywords) {
    if (text.includes(item.name) && !seen.has(item.name)) {
      seen.add(item.name);
      concepts.push({
        id: item.name,
        name: item.name,
        category: item.category,
        definition: extractBlock(text, item.name, /[^。]{0,120}/),
        keyPoints: extractListItems(text, item.name).slice(0, 6),
        importance: item.importance,
        gaokaoFocus: '辽宁高考高频考点',
      });
    }
  }
  return concepts;
}

function extractTimelineEvents(text: string): TimelineEvent[] {
  const baseEvents: TimelineEvent[] = [
    { id: 'nebula', year: '约46亿年前', title: '地球形成', summary: '太阳星云坍缩形成原始地球。', impact: '奠定地球演化基础。', category: '地球历史', importance: 5 },
    { id: 'life-origin', year: '约38亿年前', title: '生命起源', summary: '原始海洋中出现原始生命。', impact: '开启生物演化历程。', category: '生物演化', importance: 5 },
    { id: 'photosynthesis', year: '约24亿年前', title: '光合作用出现', summary: '蓝藻进行光合作用释放氧气。', impact: '改变大气成分，为需氧生物提供条件。', category: '生物演化', importance: 4 },
    { id: 'dinosaur', year: '约2.5亿年前', title: '古生代末期', summary: '蕨类植物繁盛，爬行动物出现。', impact: '陆地生态系统趋于复杂。', category: '地质年代', importance: 4 },
  ];

  const events: TimelineEvent[] = [];
  for (const ev of baseEvents) {
    if (text.includes(ev.title) || text.includes(ev.year)) {
      events.push(ev);
    }
  }
  return events;
}

function buildCausalLinks(concepts: Concept[], events: TimelineEvent[]): CausalLink[] {
  const links: CausalLink[] = [];
  const conceptMap = Object.fromEntries(concepts.map(c => [c.name, c.id]));
  const eventMap = Object.fromEntries(events.map(e => [e.title, e.id]));

  if (conceptMap['太阳辐射'] && conceptMap['地球生命']) {
    links.push({ id: '太阳辐射_生命', sourceId: conceptMap['太阳辐射'], targetId: conceptMap['地球生命'], logic: '太阳辐射提供能量和光热条件，是地球生命存在的基础。', type: '导致' });
  }
  if (conceptMap['太阳活动'] && conceptMap['地球圈层']) {
    links.push({ id: '太阳活动_圈层', sourceId: conceptMap['太阳活动'], targetId: conceptMap['地球圈层'], logic: '太阳活动扰动电离层和磁场，影响地球外部圈层环境。', type: '促进' });
  }
  if (eventMap['生命起源'] && eventMap['光合作用出现']) {
    links.push({ id: '生命_光合', sourceId: eventMap['生命起源'], targetId: eventMap['光合作用出现'], logic: '生命演化推动光合作用出现，改变大气成分。', type: '推动' });
  }
  return links;
}

function identifyExamFocus(concepts: Concept[]): ExamFocus[] {
  const high = concepts.filter(c => ['天体系统', '太阳辐射', '太阳活动', '地球生命', '地球圈层', '八大行星'].includes(c.name));
  return high.map(c => ({
    conceptId: c.id,
    conceptName: c.name,
    frequency: c.importance >= 5 ? '必考' : '常考',
    questionTypes: ['选择题', '读图填空题', '综合题'],
    difficulty: c.importance >= 5 ? '中' : '易',
    typicalQuestions: [],
  }));
}

function extractImageRefs(text: string): ImageRef[] {
  const refs: ImageRef[] = [];
  const patterns = [/\[图表[：:]?\s*([^\]]+)]/g, /图\s*(\d+)[：:]?\s*([^\n]+)/g];
  for (const pattern of patterns) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text)) !== null) {
      refs.push({
        id: `img-${refs.length + 1}`,
        caption: m[1] || m[2] || '',
        context: '',
      });
    }
  }
  return refs.slice(0, 20);
}

function generateSummary(concepts: Concept[], sections: GeographySection[]): string {
  const topConcepts = concepts.slice(0, 5).map(c => c.name).join('、');
  const sectionTitles = sections.slice(0, 4).map(s => s.title).join('、');
  return `本章涵盖${sectionTitles}，核心概念包括${topConcepts}等。建议通过知识图谱掌握宇宙环境与地球圈层的因果联系，结合辽宁高考命题方向强化读图分析与综合应用。`;
}

function extractBlock(text: string, anchor: string, pattern: RegExp): string {
  const idx = text.indexOf(anchor);
  if (idx === -1) return '';
  const slice = text.slice(idx, idx + 400);
  const match = slice.match(pattern);
  if (!match) return '';
  return match[0].replace(/^[^：:]*[：:]/, '').trim();
}

function extractListItems(text: string, anchor: string): string[] {
  const items: string[] = [];
  const idx = text.indexOf(anchor);
  if (idx === -1) return items;
  const slice = text.slice(idx, idx + 800);
  const matches = slice.matchAll(/[①②③④⑤⑥⑦⑧⑨⑩]\s*([^\n]{3,80})/g);
  for (const m of matches) items.push(m[1].trim());
  return items.slice(0, 8);
}

function unitTitle(text: string): string {
  const match = text.match(/第[一二三四五六七八九十]+章[^\n]{0,60}/);
  if (match) return match[0].trim();
  return '第一章 宇宙中的地球';
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || text;
}
