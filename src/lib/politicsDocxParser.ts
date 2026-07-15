export interface SocialForm {
  id: string;
  name: string;
  productivity: string;
  productionRelation: string;
  superstructure: string;
  mainContradiction: string;
  basicContradiction: string;
  evaluation: string;
}

export interface Concept {
  id: string;
  name: string;
  category: '马克思主义' | '政治经济学' | '科学社会主义' | '哲学' | '党史';
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

export interface KeyQuote {
  id: string;
  source: string;
  quote: string;
  explanation: string;
}

export interface PoliticsParseResult {
  unitId: string;
  unitTitle: string;
  overview: string;
  socialForms: SocialForm[];
  concepts: Concept[];
  timelineEvents: TimelineEvent[];
  causalLinks: CausalLink[];
  examFocus: ExamFocus[];
  keyQuotes: KeyQuote[];
  summary: string;
  rawImportDate: string;
  source: 'docx_import';
}

export function parsePoliticsDocx(rawText: string, fileName?: string): PoliticsParseResult {
  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const unitTitle = extractUnitTitle(text, fileName);
  const overview = extractOverview(text);
  const socialForms = extractSocialForms(text);
  const concepts = extractConcepts(text);
  const timelineEvents = extractTimelineEvents(text);
  const causalLinks = buildCausalLinks(concepts, timelineEvents);
  const examFocus = identifyExamFocus(concepts);
  const keyQuotes = extractKeyQuotes(text);
  const summary = generateSummary(concepts, timelineEvents);

  return {
    unitId: `politics_unit_${Date.now()}`,
    unitTitle,
    overview,
    socialForms,
    concepts,
    timelineEvents,
    causalLinks,
    examFocus,
    keyQuotes,
    summary,
    rawImportDate: new Date().toISOString(),
    source: 'docx_import',
  };
}

function extractUnitTitle(text: string, fileName?: string): string {
  if (fileName) {
    const match = fileName.match(/第[一二三四五六七八九十]+单元[^\n]*/);
    if (match) return match[0].trim();
  }
  const match = text.match(/第[一二三四五六七八九十]+单元[^\n]{0,60}/);
  if (match) return match[0].trim();
  return '第一单元：社会主义从空想到科学、从理论到实践的发展';
}

function extractOverview(text: string): string {
  const match = text.match(/全书整体感知[：:]\s*([\s\S]*?)(?=\n第[一二三四五六七八九十]|社会形态比较|$)/);
  if (match) return match[1].replace(/\n+/g, ' ').trim();
  return '本课从空想社会主义、科学社会主义到社会主义的实践，梳理人类社会形态演进与资本主义基本矛盾。';
}

function extractSocialForms(text: string): SocialForm[] {
  const forms: SocialForm[] = [];
  const names = ['原始社会', '奴隶社会', '封建社会', '资本主义社会', '社会主义社会'];
  for (const name of names) {
    if (text.includes(name)) {
      forms.push({
        id: name,
        name,
        productivity: extractBlock(text, name, /生产力[^。\n]{0,80}/),
        productionRelation: extractBlock(text, name, /生产关系[^。\n]{0,80}/),
        superstructure: extractBlock(text, name, /上层建筑[^。\n]{0,80}/),
        mainContradiction: extractBlock(text, name, /主要矛盾[^。\n]{0,80}/),
        basicContradiction: extractBlock(text, name, /基本矛盾[^。\n]{0,80}/),
        evaluation: extractBlock(text, name, /评价[^。\n]{0,80}/),
      });
    }
  }
  if (!forms.length) {
    return names.map(name => ({
      id: name,
      name,
      productivity: '',
      productionRelation: '',
      superstructure: '',
      mainContradiction: '',
      basicContradiction: '',
      evaluation: '',
    }));
  }
  return forms;
}

function extractConcepts(text: string): Concept[] {
  const keywords = [
    { name: '唯物史观', category: '哲学' as const, importance: 5 },
    { name: '剩余价值学说', category: '马克思主义' as const, importance: 5 },
    { name: '科学社会主义', category: '科学社会主义' as const, importance: 5 },
    { name: '空想社会主义', category: '科学社会主义' as const, importance: 4 },
    { name: '资本主义基本矛盾', category: '政治经济学' as const, importance: 5 },
    { name: '唯物史观', category: '哲学' as const, importance: 5 },
    { name: '共产党宣言', category: '科学社会主义' as const, importance: 5 },
    { name: '十月革命', category: '党史' as const, importance: 5 },
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
        keyPoints: extractListItems(text, item.name).slice(0, 5),
        importance: item.importance,
        gaokaoFocus: '辽宁高考常考点',
      });
    }
  }
  return concepts;
}

function extractTimelineEvents(text: string): TimelineEvent[] {
  const baseEvents: TimelineEvent[] = [
    { id: '1844', year: '1844', title: '《德意志意识形态》', summary: '马克思、恩格斯系统阐述唯物史观。', impact: '为科学社会主义奠定理论基础。', category: '理论', importance: 5 },
    { id: '1848', year: '1848', title: '《共产党宣言》发表', summary: '标志着马克思主义的诞生。', impact: '无产阶级斗争有了科学理论的指导。', category: '理论', importance: 5 },
    { id: '1871', year: '1871', title: '巴黎公社', summary: '建立第一个无产阶级政权。', impact: '丰富了科学社会主义学说。', category: '实践', importance: 4 },
    { id: '1917', year: '1917', title: '十月革命', summary: '建立第一个社会主义国家。', impact: '科学社会主义从理论到实践的飞跃。', category: '实践', importance: 5 },
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

  if (conceptMap['唯物史观'] && conceptMap['剩余价值学说']) {
    links.push({ id: '唯物史观_剩余价值', sourceId: conceptMap['唯物史观'], targetId: conceptMap['剩余价值学说'], logic: '唯物史观揭示人类社会发展规律，剩余价值学说揭示资本主义剥削秘密。', type: '导致' });
  }
  if (conceptMap['剩余价值学说'] && conceptMap['科学社会主义']) {
    links.push({ id: '剩余价值_科学社会主义', sourceId: conceptMap['剩余价值学说'], targetId: conceptMap['科学社会主义'], logic: '两大理论基石使社会主义从空想变为科学。', type: '导致' });
  }
  if (conceptMap['科学社会主义'] && eventMap['巴黎公社']) {
    links.push({ id: '科学社会主义_巴黎公社', sourceId: conceptMap['科学社会主义'], targetId: eventMap['巴黎公社'], logic: '科学社会主义指导下建立无产阶级政权尝试。', type: '推动' });
  }
  if (eventMap['巴黎公社'] && eventMap['十月革命']) {
    links.push({ id: '巴黎公社_十月革命', sourceId: eventMap['巴黎公社'], targetId: eventMap['十月革命'], logic: '巴黎公社为十月革命提供经验教训。', type: '促进' });
  }
  if (conceptMap['空想社会主义'] && conceptMap['科学社会主义']) {
    links.push({ id: '空想_科学', sourceId: conceptMap['空想社会主义'], targetId: conceptMap['科学社会主义'], logic: '批判吸收空想社会主义发展为科学社会主义。', type: '促进' });
  }
  return links;
}

function identifyExamFocus(concepts: Concept[]): ExamFocus[] {
  const high = concepts.filter(c => ['科学社会主义', '剩余价值学说', '唯物史观', '资本主义基本矛盾', '十月革命', '共产党宣言'].includes(c.name));
  return high.map(c => ({
    conceptId: c.id,
    conceptName: c.name,
    frequency: c.importance >= 5 ? '必考' : '常考',
    questionTypes: ['选择题', '材料分析题', '论述题'],
    difficulty: c.importance >= 5 ? '中' : '易',
    typicalQuestions: [],
  }));
}

function extractKeyQuotes(text: string): KeyQuote[] {
  const quotes: KeyQuote[] = [];
  if (text.includes('共产党宣言')) {
    quotes.push({
      id: 'manifesto-1',
      source: '《共产党宣言》',
      quote: '代替那存在着阶级和阶级对立的资产阶级旧社会的，将是这样一个联合体，在那里，每个人的自由发展是一切人的自由发展的条件。',
      explanation: '体现了马克思主义对共产主义社会的核心价值追求。',
    });
  }
  if (text.includes('十月革命')) {
    quotes.push({
      id: 'october-1',
      source: '列宁关于十月革命',
      quote: '国家是阶级矛盾不可调和的产物。',
      explanation: '马克思主义国家学说的重要论断。',
    });
  }
  return quotes;
}

function generateSummary(concepts: Concept[], events: TimelineEvent[]): string {
  const topConcepts = concepts.slice(0, 5).map(c => c.name).join('、');
  const topEvents = events.slice(0, 3).map(e => e.title).join('、');
  return `本课核心概念包括${topConcepts}等；关键历程包括${topEvents}。建议通过知识图谱掌握因果逻辑，结合辽宁高考命题方向强化概念辨析与时政应用。`;
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

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || text;
}
