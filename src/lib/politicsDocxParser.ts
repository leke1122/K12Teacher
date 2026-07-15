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
  // 完整的表格数据（从HTML提取）
  socialFormsFull?: SocialFormFullRecord[];
  capitalistCrisis?: CapitalistCrisisRecord;
  capitalistWhyDoomed?: string[];
  utopianSocialism?: UtopianSocialismRecord;
  scientificSocialism?: ScientificSocialismRecord;
  communistManifesto?: CommunistManifestoRecord;
  // 原始HTML（包含表格）
  rawHtml?: string;
}

export interface SocialFormFullRecord {
  id: string;
  name: string;
  productivity: string;
  productionRelation: {
    ownership: string;
    distribution: string;
  };
  laborRelation: string;
  superstructure: {
    politics: string;
    culture: string;
  };
  mainContradiction: string;
  basicContradiction: string;
  evaluation: string;
  detail?: string;
}

export interface CapitalistCrisisRecord {
  basicFeature: string;
  mainManifestations: string;
  directCauses: string[];
  rootCause: string;
}

export interface UtopianSocialismRecord {
  progress: string[];
  limitation: string[];
}

export interface ScientificSocialismRecord {
  historicalConditions: {
    thoughtSource: string;
    historicalPremise: string;
  };
  founding: {
    theoreticalFoundation: {
      materialistHistory: string;
      surplusValue: string;
    };
    birthMark: string;
    marxismContent: string;
  };
  fromTheoryToPractice: string[];
  threeLeaps: string[];
  whyNotEnded: string[];
}

export interface CommunistManifestoRecord {
  mainContents: string[];
}

export function parsePoliticsDocx(rawText: string, fileName?: string, rawHtml?: string): PoliticsParseResult {
  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const unitTitle = extractUnitTitle(text, fileName);
  const overview = extractOverview(text);

  // 优先从HTML表格提取完整数据，降级到纯文本
  const socialFormsFull = rawHtml ? extractSocialFormsFromHtml(rawHtml) : extractSocialFormsFromText(text);
  const socialForms = socialFormsFull.map(f => ({
    id: f.id,
    name: f.name,
    productivity: f.productivity,
    productionRelation: f.productionRelation.ownership + '；' + f.productionRelation.distribution,
    superstructure: f.superstructure.politics + '；' + f.superstructure.culture,
    mainContradiction: f.mainContradiction,
    basicContradiction: f.basicContradiction,
    evaluation: f.evaluation,
  }));

  const concepts = extractConcepts(text, socialFormsFull);
  const timelineEvents = extractTimelineEvents(text);
  const causalLinks = buildCausalLinks(concepts, timelineEvents);
  const examFocus = identifyExamFocus(concepts);
  const keyQuotes = extractKeyQuotes(text);

  // 从HTML提取详细内容（经济危机、空想社会主义、科学社会主义）
  const capitalistCrisis = rawHtml ? extractCapitalistCrisisFromHtml(rawHtml) : extractCapitalistCrisisFromText(text);
  const capitalistWhyDoomed = extractCapitalistWhyDoomed(text);
  const utopianSocialism = rawHtml ? extractUtopianSocialismFromHtml(rawHtml) : extractUtopianSocialismFromText(text);
  const scientificSocialism = rawHtml ? extractScientificSocialismFromHtml(rawHtml) : extractScientificSocialismFromText(text);
  const communistManifesto = extractCommunistManifesto(text);

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
    // 完整数据
    socialFormsFull,
    capitalistCrisis,
    capitalistWhyDoomed,
    utopianSocialism,
    scientificSocialism,
    communistManifesto,
    rawHtml: rawHtml || undefined,
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

// ==================== HTML 表格解析（核心修复）====================

/**
 * 从HTML中提取表格单元格文本
 */
function extractTableCells(html: string): string[][] {
  const rows: string[][] = [];
  // 匹配每一行 tr
  const trMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  for (const trMatch of trMatches) {
    const row: string[] = [];
    // 提取每个单元格 td/th
    const cellMatches = trMatch[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi);
    for (const cellMatch of cellMatches) {
      const cellText = cellMatch[1]
        .replace(/<[^>]+>/g, ' ')  // 去掉HTML标签
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
      if (cellText) row.push(cellText);
    }
    if (row.length > 0) rows.push(row);
  }
  return rows;
}

/**
 * 查找包含关键词的表格
 */
function findTableWithKeyword(html: string, keyword: string): string[][] | null {
  const tableMatches = html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  for (const tableMatch of tableMatches) {
    if (tableMatch[1].includes(keyword)) {
      return extractTableCells(tableMatch[1]);
    }
  }
  return null;
}

/**
 * 从HTML表格提取社会形态完整数据
 */
function extractSocialFormsFromHtml(html: string): SocialFormFullRecord[] {
  const names = ['原始社会', '奴隶社会', '封建社会', '资本主义社会', '社会主义社会'];
  const result: SocialFormFullRecord[] = [];

  // 查找社会形态比较表格
  const table = findTableWithKeyword(html, '社会形态比较') ||
                findTableWithKeyword(html, '生产力') ||
                findTableWithKeyword(html, '生产关系');

  if (table && table.length >= 3) {
    // 表格结构：第一行是表头，之后每行是一个社会形态
    // 找到每列对应的字段名
    const headerRow = table[0] || [];
    const headerMap: Record<string, number> = {};
    headerRow.forEach((h, idx) => {
      if (h.includes('社会形态') || h.includes('名称')) headerMap.name = idx;
      if (h.includes('生产力')) headerMap.productivity = idx;
      if (h.includes('所有制') || h.includes('占有')) headerMap.ownership = idx;
      if (h.includes('分配')) headerMap.distribution = idx;
      if (h.includes('劳动关系') || h.includes('人身')) headerMap.labor = idx;
      if (h.includes('政治') || h.includes('国家')) headerMap.politics = idx;
      if (h.includes('文化') || h.includes('思想')) headerMap.culture = idx;
      if (h.includes('主要矛盾')) headerMap.mainContradiction = idx;
      if (h.includes('基本矛盾')) headerMap.basicContradiction = idx;
      if (h.includes('评价') || h.includes('总体')) headerMap.evaluation = idx;
    });

    for (let i = 1; i < table.length; i++) {
      const row = table[i];
      const name = row[headerMap.name ?? 0] || '';
      if (!names.some(n => name.includes(n))) continue;

      result.push({
        id: name,
        name,
        productivity: row[headerMap.productivity ?? 1] || '',
        productionRelation: {
          ownership: row[headerMap.ownership ?? 2] || '',
          distribution: row[headerMap.distribution ?? 3] || '',
        },
        laborRelation: row[headerMap.labor ?? 4] || '',
        superstructure: {
          politics: row[headerMap.politics ?? 5] || '',
          culture: row[headerMap.culture ?? 6] || '',
        },
        mainContradiction: row[headerMap.mainContradiction ?? 7] || '',
        basicContradiction: row[headerMap.basicContradiction ?? 8] || '',
        evaluation: row[headerMap.evaluation ?? 9] || '',
      });
    }
  }

  // 如果表格提取失败，尝试从文本提取
  if (result.length === 0) {
    return extractSocialFormsFromText(html);
  }

  return result;
}

/**
 * 从纯文本提取社会形态数据（降级方案）
 */
function extractSocialFormsFromText(text: string): SocialFormFullRecord[] {
  const names = ['原始社会', '奴隶社会', '封建社会', '资本主义社会', '社会主义社会'];
  const result: SocialFormFullRecord[] = [];

  for (const name of names) {
    const idx = text.indexOf(name);
    if (idx === -1) continue;

    const slice = text.slice(idx, idx + 1500);
    const record: SocialFormFullRecord = {
      id: name,
      name,
      productivity: '',
      productionRelation: { ownership: '', distribution: '' },
      laborRelation: '',
      superstructure: { politics: '', culture: '' },
      mainContradiction: '',
      basicContradiction: '',
      evaluation: '',
    };

    // 提取各字段（扩展搜索范围）
    const fieldPatterns: Array<{ key: keyof typeof record | 'ownership' | 'distribution' | 'politics' | 'culture'; pattern: RegExp }> = [
      { key: 'productivity', pattern: /生产力[:：][^。\n]{0,200}/ },
      { key: 'ownership', pattern: /(?:生产资料)?(?:所有|占有)[^。\n]{0,200}/ },
      { key: 'distribution', pattern: /分配[^。\n]{0,150}/ },
      { key: 'laborRelation', pattern: /(?:劳动关系|人身自由|奴隶|平等)[^。\n]{0,150}/ },
      { key: 'politics', pattern: /(?:国家|阶级|君主|等级|政治)[^。\n]{0,150}/ },
      { key: 'culture', pattern: /(?:文化|思想|教育|文字|脑力)[^。\n]{0,150}/ },
      { key: 'mainContradiction', pattern: /主要矛盾[^。\n]{0,150}/ },
      { key: 'basicContradiction', pattern: /基本矛盾[^。\n]{0,150}/ },
      { key: 'evaluation', pattern: /评价[^。\n]{0,150}/ },
    ];

    for (const { key, pattern } of fieldPatterns) {
      const match = slice.match(pattern);
      if (match) {
        const value = match[0].replace(/^[^：:]*[：:]/, '').trim();
        if (key === 'ownership' || key === 'distribution') {
          (record.productionRelation as Record<string, string>)[key] = value;
        } else if (key === 'politics' || key === 'culture') {
          (record.superstructure as Record<string, string>)[key] = value;
        } else {
          (record as Record<string, string>)[key] = value;
        }
      }
    }

    result.push(record);
  }

  return result;
}

/**
 * 从HTML提取资本主义经济危机详情
 */
function extractCapitalistCrisisFromHtml(html: string): CapitalistCrisisRecord {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  return extractCapitalistCrisisFromText(text);
}

/**
 * 从文本提取经济危机
 */
function extractCapitalistCrisisFromText(text: string): CapitalistCrisisRecord {
  const result: CapitalistCrisisRecord = {
    basicFeature: '',
    mainManifestations: '',
    directCauses: [],
    rootCause: '',
  };

  // 基本特征
  const featureMatch = text.match(/基本特征[：:]\s*([^。\n]{5,100})/);
  if (featureMatch) result.basicFeature = featureMatch[1].trim();

  // 主要表现
  const manifestMatch = text.match(/主要表现[：:]\s*([^。]{50,500})/);
  if (manifestMatch) result.mainManifestations = manifestMatch[1].replace(/\n/g, '').trim();

  // 直接原因
  const causeMatches = text.matchAll(/生产无限扩大|有支付能力|个别企业|有组织性|无政府状态|生产结构严重失调/g);
  if ([...causeMatches].length >= 2) {
    // 找到经济危机段落
    const crisisIdx = text.indexOf('经济危机');
    if (crisisIdx !== -1) {
      const slice = text.slice(crisisIdx, crisisIdx + 2000);
      const numberedMatches = slice.matchAll(/[①②③][^。\n]{10,200}/g);
      for (const m of numberedMatches) result.directCauses.push(m[0].trim());
      const plainMatches = slice.matchAll(/矛盾[：:]\s*([^。\n]{10,200})/g);
      for (const m of plainMatches) {
        if (result.directCauses.length < 3) {
          result.directCauses.push(m[1].trim());
        }
      }
    }
  }

  // 根本原因
  const rootMatch = text.match(/根本原因[：:]\s*([^。\n]{10,150})/);
  if (rootMatch) result.rootCause = rootMatch[1].trim();

  // 如果直接原因为空，填入标准答案
  if (result.directCauses.length === 0) {
    result.directCauses = [
      '生产无限扩大的趋势与劳动人民有支付能力的需求相对缩小之间的矛盾。',
      '个别企业内部生产的有组织性与整个社会生产的无政府状态之间的矛盾。',
      '当矛盾尖锐化时，社会生产结构会严重失调，从而造成生产严重过剩。',
    ];
  }

  return result;
}

/**
 * 从HTML提取空想社会主义详情
 */
function extractUtopianSocialismFromHtml(html: string): UtopianSocialismRecord {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  return extractUtopianSocialismFromText(text);
}

/**
 * 从文本提取空想社会主义
 */
function extractUtopianSocialismFromText(text: string): UtopianSocialismRecord {
  const result: UtopianSocialismRecord = { progress: [], limitation: [] };

  const utopianIdx = text.indexOf('空想社会主义');
  if (utopianIdx === -1) return result;

  const slice = text.slice(utopianIdx, utopianIdx + 2000);

  // 进步性
  const progressMatch = slice.match(/进步性[：:]\s*([^局限]{10,300})/);
  if (progressMatch) {
    const lines = progressMatch[1].split(/[①②③]/).filter(l => l.trim().length > 5);
    lines.forEach(l => result.progress.push(l.trim().replace(/^[:：]\s*/, '')));
  }

  // 局限性
  const limitMatch = slice.match(/局限性[：:]\s*([^。]{50,500})/);
  if (limitMatch) {
    const lines = limitMatch[1].split(/[①②③]/).filter(l => l.trim().length > 5);
    lines.forEach(l => result.limitation.push(l.trim().replace(/^[:：]\s*/, '')));
  }

  // 如果为空，填入标准内容
  if (result.progress.length === 0) {
    result.progress = [
      '一些先进分子看到了资本主义的弊端，纷纷对资本主义进行揭露和批判，同时表达对未来理想社会的诉求。',
      '空想社会主义是科学社会主义的思想来源。',
    ];
  }
  if (result.limitation.length === 0) {
    result.limitation = [
      '仅仅从理性正义的原则出发，揭露资本主义的弊端、设计美好蓝图（行动力不强）。',
      '他们主张阶级调和，反对阶级斗争，看不到广大人民群众，特别是无产阶级的力量（依靠的人不对）。',
      '也没有找到进行社会变革的正确途径（做事方法也不对）。',
    ];
  }

  return result;
}

/**
 * 从HTML提取科学社会主义详情
 */
function extractScientificSocialismFromHtml(html: string): ScientificSocialismRecord {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
  return extractScientificSocialismFromText(text);
}

/**
 * 从文本提取科学社会主义
 */
function extractScientificSocialismFromText(text: string): ScientificSocialismRecord {
  const result: ScientificSocialismRecord = {
    historicalConditions: { thoughtSource: '空想社会主义', historicalPremise: '资本主义的发展和工人运动的兴起' },
    founding: {
      theoreticalFoundation: {
        materialistHistory: '揭示了人类社会发展的一般规律',
        surplusValue: '揭示了资本主义运行的特殊规律',
      },
      birthMark: '1848年《共产党宣言》的发表',
      marxismContent: '马克思主义是科学的理论，揭示了人类社会发展的规律；是人民的理论，第一次创立了人民实现自身解放的思想体系；是实践的理论，指引着人民改造世界；是不断发展的、开放的理论，能够与时俱进、因地制宜。',
    },
    fromTheoryToPractice: [
      '①尝试：巴黎公社',
      '②建立：俄国十月革命',
      '③发展：二战后，一国到多国的发展',
      '④挫折：东欧剧变，苏联解体',
      '⑤新生：中国特色社会主义的伟大实践',
    ],
    threeLeaps: [
      '唯物史观和剩余价值学说，使社会主义实现了由空想到科学的伟大飞跃。',
      '十月革命实现了科学社会主义从理论到现实的历史性飞跃。',
      '二战后，社会主义在世界范围内获得大发展，实现了从一国实践到多国实践的历史性飞跃。',
    ],
    whyNotEnded: [
      '从人类社会发展的进程看，社会主义终将代替资本主义是不可逆转的。',
      '从人类社会发展的趋势看，共产主义一定要实现的信念是不可动摇的。',
      '中国特色社会主义是科学社会主义在中国的实践和发展，在21世纪焕发出了强大的生命力。',
    ],
  };

  // 尝试从文本提取五大过程
  const practiceIdx = text.indexOf('五个过程');
  if (practiceIdx !== -1) {
    const slice = text.slice(practiceIdx, practiceIdx + 500);
    const matches = slice.match(/[①②③④⑤][^。\n]{5,100}/g);
    if (matches && matches.length >= 3) {
      result.fromTheoryToPractice = matches.map(m => m.trim());
    }
  }

  // 三次飞跃
  const leapIdx = text.indexOf('三次飞跃');
  if (leapIdx !== -1) {
    const slice = text.slice(leapIdx, leapIdx + 500);
    const matches = slice.match(/[①②③][^。\n]{10,100}/g);
    if (matches && matches.length >= 3) {
      result.threeLeaps = matches.map(m => m.trim());
    }
  }

  return result;
}

/**
 * 从文本提取共产党宣言内容
 */
function extractCommunistManifesto(text: string): CommunistManifestoRecord {
  const result: CommunistManifestoRecord = { mainContents: [] };

  const manifestoIdx = text.indexOf('共产党宣言');
  if (manifestoIdx !== -1) {
    const slice = text.slice(manifestoIdx, manifestoIdx + 2000);
    // 尝试找三个主要内容
    const matches = slice.match(/[①②③][^。\n]{10,200}/g);
    if (matches && matches.length >= 2) {
      result.mainContents = matches.map(m => m.trim());
    }
  }

  if (result.mainContents.length === 0) {
    result.mainContents = [
      '《共产党宣言》分析了资本主义生产方式的内在矛盾与人类社会的发展规律。科学论证了资本主义必然灭亡和社会主义必然胜利。',
      '《共产党宣言》系统论述了无产阶级政党的性质、特点、任务和策略原则，阐明了建立无产阶级政党的必要性。',
      '《共产党宣言》阐述了未来共产主义社会的理想目标。',
    ];
  }

  return result;
}
