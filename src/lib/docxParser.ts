/**
 * 历史知识点 docx 解析器
 * 专门针对高中历史统编版知识点清单格式
 *
 * 文档格式特征：
 * - 无 markdown 标题，纯文本
 * - "数字、" 开头 → 主知识点（如 "2、分封制"）
 * - "**文字**" → 加粗标签（如 "**目的：**"）
 * - "① ② ③" 或 "a. b. c." → 子条目（影响/意义）
 * - "【政治】【经济】【思想】【教育】" → 分类段落
 * - "商鞅变法主要内容：" → 命名章节
 */

export interface DocxParseResult {
  unitTitle: string;
  pageRange: string;
  lessons: Lesson[];
  concepts: Concept[];
  timelineEvents: TimelineEvent[];
  causalLinks: CausalLink[];
  examFocus: ExamFocus[];
  summary: string;
  rawImportDate: string;
  source: 'docx_import';
}

export interface Lesson {
  index: number;
  title: string;
  pageRange?: string;
  concepts: string[];
  content: string;
}

export interface Concept {
  id: string;
  name: string;
  category: '政治' | '经济' | '思想' | '文化' | '军事' | '社会';
  definition: string;
  keyPoints: string[];
  impact: string;
  keyPeople: string[];
  importance: 1 | 2 | 3 | 4 | 5;
  gaokaoFocus?: string;
  relatedEvents: string[];
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  dynasty: string;
  summary: string;
  impact: string;
  category: string;
  importance: number;
  keyPeople: string[];
}

export interface CausalLink {
  id: string;
  sourceId: string;
  targetId: string;
  logic: string;
  type: '导致' | '促进' | '制约' | '推动';
}

export interface ExamFocus {
  conceptId: string;
  conceptName: string;
  frequency: '常考' | '必考' | '偶尔考';
  questionTypes: string[];
  difficulty: '易' | '中' | '难';
  typicalQuestions: string[];
}

// ==================== 核心解析函数 ====================

/**
 * 从 docx 提取的原始文本中解析出结构化数据
 */
export function parseDocxTextToKnowledge(rawText: string, fileName?: string): DocxParseResult {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // 1. 解析单元标题（从文件名提取或使用默认）
  const unitTitle = extractUnitTitle(rawText, fileName);
  const pageRange = extractPageRange(rawText);

  // 2. 按主知识点分割内容块
  const conceptBlocks = splitIntoConceptBlocks(lines);

  // 3. 逐块解析
  const concepts: Concept[] = [];
  const timelineEvents: TimelineEvent[] = [];
  const causalLinks: CausalLink[] = [];

  for (const block of conceptBlocks) {
    const concept = parseConceptBlock(block);
    if (concept) {
      concepts.push(concept);

      // 从概念中提取时间轴事件
      const event = conceptToTimelineEvent(concept);
      if (event) timelineEvents.push(event);
    }
  }

  // 4. 建立因果链
  const causalMap = buildCausalLinks(concepts);
  causalLinks.push(...causalMap);

  // 5. 识别高考重点
  const examFocus = identifyExamFocus(concepts);

  // 6. 生成摘要
  const summary = generateSummary(concepts);

  return {
    unitTitle,
    pageRange,
    lessons: [],
    concepts,
    timelineEvents,
    causalLinks,
    examFocus,
    summary,
    rawImportDate: new Date().toISOString(),
    source: 'docx_import',
  };
}

// ==================== 辅助解析函数 ====================

function extractUnitTitle(text: string, fileName?: string): string {
  // 优先从文件名提取
  if (fileName) {
    const match = fileName.match(/第一单元[^\s-]*(.*?)知识点清单/);
    if (match) return '第一单元 ' + match[1].trim();
    const simpleMatch = fileName.match(/(第[一二三四五六七八九十]+单元[^\s-]*)/);
    if (simpleMatch) return simpleMatch[1];
  }

  // 从正文第一行提取
  const lines = text.split('\n').filter(l => l.trim());
  if (lines[0]) {
    const titleMatch = lines[0].match(/(第[一二三四五六七八九十]+单元[^\n]{0,50})/);
    if (titleMatch) return titleMatch[1];
  }

  return '中国古代史（第一单元）';
}

function extractPageRange(text: string): string {
  const match = text.match(/P?(\d+)[-~]?P?(\d+)/);
  if (match) return `第 ${match[1]} - ${match[2]} 页`;
  return '第 1 - 50 页';
}

/**
 * 按主知识点将文本分割成块
 * 主知识点以 "数字、" 开头
 */
function splitIntoConceptBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    // 主知识点标题行
    const isConceptHeader = /^([一二三四五六七八九十\d]+[、.．][^:：\n]{2,30})/.test(line) &&
      !line.includes('重要') && !line.includes('特点');

    // 跳过导航类行
    if (line.includes('纲要') && line.includes('复习提纲')) continue;
    if (line.match(/^[新旧]?石器时代|代表性文化遗存$/)) continue;

    if (isConceptHeader && currentBlock.length > 0) {
      blocks.push(currentBlock);
      currentBlock = [];
    }

    currentBlock.push(line);
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  return blocks;
}

/**
 * 解析单个知识点块
 */
function parseConceptBlock(lines: string[]): Concept | null {
  if (lines.length < 2) return null;

  const firstLine = lines[0];

  // 提取概念名称（去掉序号）
  const nameMatch = firstLine.match(/^([一二三四五六七八九十\d]+[、.．])([^\n:：?？]+)/);
  if (!nameMatch) return null;

  const name = nameMatch[2].replace(/[?？!！.,，。、：:]$/, '').trim();
  if (name.length < 2) return null;

  // 判断类别
  const category = detectCategory(lines.join(' '), name);

  // 提取各字段
  const fullText = lines.join('\n');
  const definition = extractField(lines, '含义', '定义', '内容') || extractCoreDescription(lines);
  const keyPoints = extractKeyPoints(lines);
  const impact = extractField(lines, '影响', '意义', '评价', '作用', '评价商鞅变法') || extractImpactSection(lines);
  const keyPeople = extractKeyPeople(fullText);
  const importance = calculateImportance(name, fullText);

  return {
    id: slugify(name),
    name,
    category,
    definition: definition || `${name}是这一时期的重要制度/事件。`,
    keyPoints,
    impact: impact || '',
    keyPeople,
    importance,
    gaokaoFocus: detectGaokaoFocus(name, fullText),
    relatedEvents: extractRelatedEvents(fullText),
  };
}

function extractField(lines: string[], ...keywords: string[]): string | null {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const kw of keywords) {
      if (line.includes(kw) || line.startsWith(kw + '：') || line.startsWith(kw + ':')) {
        // 提取冒号/冒号后的内容，并合并后续行直到下一个字段
        const colonIdx = line.indexOf('：');
        const colonIdx2 = line.indexOf(':');
        const idx = colonIdx >= 0 ? colonIdx : colonIdx2;
        let content = idx >= 0 ? line.substring(idx + 1).trim() : line.substring(kw.length).trim();

        // 合并后续没有字段标题的行
        const rest: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          const isFieldHeader = keywords.some(k => nextLine.includes(k + '：') || nextLine.includes(k + ':'));
          if (isFieldHeader) break;
          rest.push(nextLine);
        }

        if (rest.length > 0) {
          content += '\n' + rest.join('\n');
        }

        return content.replace(/^[:：]\s*/, '').trim();
      }
    }
  }
  return null;
}

function extractCoreDescription(lines: string[]): string | null {
  // 尝试从第2-3行提取核心描述
  for (let i = 1; i < Math.min(3, lines.length); i++) {
    const line = lines[i];
    if (line.length > 10 && !line.match(/^[①②③④⑤]|^[a-z][.．]/)) {
      return line.replace(/^[:：]\s*/, '').trim();
    }
  }
  return null;
}

function extractKeyPoints(lines: string[]): string[] {
  const points: string[] = [];

  for (const line of lines) {
    // 匹配编号列表
    const numberedMatch = line.match(/^[①②③④⑤⑥⑦⑧⑨⑩]?\s*(.+)/);
    if (numberedMatch) {
      const content = numberedMatch[1].replace(/^[a-z][.．]\s*/, '').trim();
      if (content.length > 5) points.push(content);
      continue;
    }

    // 匹配 "a. b. c." 列表
    const letterMatch = line.match(/^[a-z][.．]\s*(.+)/);
    if (letterMatch) {
      const content = letterMatch[1].trim();
      if (content.length > 5) points.push(content);
    }
  }

  return [...new Set(points)].slice(0, 8);
}

function extractImpactSection(lines: string[]): string | null {
  let foundImpact = false;
  const impacts: string[] = [];

  for (const line of lines) {
    if (line.includes('影响') || line.includes('意义') || line.includes('评价')) {
      foundImpact = true;
      const colonIdx = line.indexOf('：');
      const colonIdx2 = line.indexOf(':');
      const idx = colonIdx >= 0 ? colonIdx : colonIdx2;
      if (idx >= 0) {
        impacts.push(line.substring(idx + 1).trim());
      }
    } else if (foundImpact) {
      if (line.match(/^[①②③④⑤]/) || line.match(/^\d+[、.．]/)) {
        const clean = line.replace(/^[①②③④⑤]\s*/, '').replace(/^\d+[、.．]\s*/, '').trim();
        if (clean.length > 3) impacts.push(clean);
      } else if (!line.match(/^[a-z][.．]/)) {
        foundImpact = false;
      }
    }
  }

  return impacts.length > 0 ? impacts.join('\n') : null;
}

function extractKeyPeople(text: string): string[] {
  const people: string[] = [];
  const knownPeople = [
    '周武王', '周公', '周成王', '商鞅', '秦孝公', '秦王嬴政', '秦始皇',
    '孔子', '老子', '孟子', '荀子', '墨子', '韩非子', '庄子', '孙武',
    '汉高祖', '汉武帝', '汉高祖', '汉文帝', '汉景帝',
    '刘邦', '嬴政', '嬴政', '义帝', '光武帝',
  ];

  for (const person of knownPeople) {
    if (text.includes(person) && !people.includes(person)) {
      people.push(person);
    }
  }

  return people;
}

function detectGaokaoFocus(name: string, text: string): string | undefined {
  const highPriority = ['分封制', '宗法制', '商鞅变法', '百家争鸣', '秦统一', '专制主义', '郡县制', '汉武帝'];
  if (highPriority.includes(name)) {
    return '辽宁高考常考点，需重点掌握';
  }
  return undefined;
}

function extractRelatedEvents(text: string): string[] {
  const events: string[] = [];
  const knownEvents = [
    '分封制', '宗法制', '礼乐制度', '井田制', '商鞅变法', '百家争鸣',
    '秦统一', '郡县制', '皇帝制度', '三公九卿', '汉武帝', '大一统',
  ];

  for (const event of knownEvents) {
    if (text.includes(event)) {
      events.push(event);
    }
  }

  return [...new Set(events)];
}

function detectCategory(text: string, name: string): Concept['category'] {
  const textLower = text + name;

  // 政治类关键词
  const politicalKeywords = [
    '分封', '宗法', '礼乐', '变法', '郡县', '皇帝', '三公', '九卿',
    '中央集权', '大一统', '官僚', '贵族', '特权', '削藩', '推恩',
  ];

  // 经济类关键词
  const economicKeywords = [
    '农业', '手工业', '土地', '井田', '小农', '重农', '抑商', '铁器',
    '牛耕', '赋税', '铸钱', '盐铁', '经济', '生产', '庄园',
  ];

  // 思想类关键词
  const thoughtKeywords = [
    '百家争鸣', '儒家', '法家', '道家', '墨家', '孔子', '老子', '仁',
    '礼', '民本', '无为', '法治', '思想', '教育', '私学', '礼乐',
  ];

  // 文化类关键词
  const culturalKeywords = [
    '文化', '文字', '统一', '书法', '文学', '艺术',
  ];

  // 军事类关键词
  const militaryKeywords = [
    '战争', '军事', '争霸', '统一', '征服', '防御',
  ];

  const counts: Record<string, number> = {
    政治: politicalKeywords.filter(k => textLower.includes(k)).length,
    经济: economicKeywords.filter(k => textLower.includes(k)).length,
    思想: thoughtKeywords.filter(k => textLower.includes(k)).length,
    文化: culturalKeywords.filter(k => textLower.includes(k)).length,
    军事: militaryKeywords.filter(k => textLower.includes(k)).length,
  };

  let maxCategory = '政治';
  let maxCount = 0;
  for (const [cat, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxCategory = cat;
    }
  }

  return maxCategory as Concept['category'];
}

function calculateImportance(name: string, text: string): 1 | 2 | 3 | 4 | 5 {
  const superHigh = ['分封制', '宗法制', '商鞅变法', '百家争鸣', '专制主义中央集权', '郡县制'];
  const high = ['秦统一', '汉武帝', '礼乐制度', '皇帝制度', '三公九卿', '井田制', '小农经济'];
  const medium = ['宗法制', '变法运动', '秦朝', '汉初', '诸子百家'];

  if (superHigh.some(k => name.includes(k))) return 5;
  if (high.some(k => name.includes(k))) return 4;
  if (medium.some(k => name.includes(k))) return 3;
  if (text.includes('辽宁高考') || text.includes('常考')) return 4;
  return 2;
}

function conceptToTimelineEvent(concept: Concept): TimelineEvent | null {
  // 从概念名称和内容中提取年代信息
  const fullText = [concept.name, concept.definition, concept.keyPoints.join(' ')].join(' ');

  let year = '';
  let dynasty = '';

  // 匹配朝代/时期
  const eraPatterns: [RegExp, string][] = [
    [/西周|周朝|周代/, '西周'],
    [/春秋战国|春秋|战国/, '春秋战国'],
    [/商朝|商代/, '商朝'],
    [/秦朝|秦代/, '秦朝'],
    [/汉初|西汉|东汉/, '汉代'],
    [/先秦/, '先秦'],
    [/秦汉/, '秦汉'],
  ];

  for (const [regex, era] of eraPatterns) {
    if (regex.test(fullText)) {
      dynasty = era;
      break;
    }
  }

  // 匹配具体年份
  const yearMatch = fullText.match(/(前?\d+)年/);
  if (yearMatch) {
    year = yearMatch[0];
  } else if (dynasty) {
    year = dynasty;
  }

  if (!year && !dynasty) return null;

  return {
    id: concept.id,
    year: year || dynasty,
    title: concept.name,
    dynasty,
    summary: concept.definition,
    impact: concept.impact,
    category: concept.category,
    importance: concept.importance,
    keyPeople: concept.keyPeople,
  };
}

function buildCausalLinks(concepts: Concept[]): CausalLink[] {
  const links: CausalLink[] = [];
  const conceptNames = concepts.map(c => c.name);

  // 预定义的因果关系（基于历史知识）
  const causalRules: Array<[string[], string[], string, '导致' | '促进' | '制约' | '推动']> = [
    [['铁器', '牛耕', '生产力'], ['井田制瓦解'], '生产工具改进推动土地制度变革', '导致'],
    [['井田制瓦解', '土地私有'], ['商鞅变法'], '井田制瓦解为变法创造条件', '推动'],
    [['商鞅变法'], ['秦统一'], '商鞅变法使秦国富强，为统一奠定基础', '导致'],
    [['分封制', '宗法制'], ['周朝统治'], '分封制和宗法制维护了周朝统治', '促进'],
    [['周王室衰微', '诸侯纷争'], ['百家争鸣'], '乱世催生思想解放', '导致'],
    [['礼乐制度崩溃'], ['百家争鸣'], '礼崩乐坏为百家争鸣创造条件', '导致'],
    [['秦统一'], ['郡县制'], '统一后推广郡县制', '导致'],
    [['小农经济'], ['封建制度'], '小农经济是封建制度的基础', '导致'],
    [['汉初无为'], ['文景之治'], '无为而治恢复经济', '推动'],
  ];

  for (const [causes, effects, logic, type] of causalRules) {
    for (const cause of causes) {
      for (const effect of effects) {
        const causeConcept = concepts.find(c => c.name.includes(cause) || cause.includes(c.name));
        const effectConcept = concepts.find(c => c.name.includes(effect) || effect.includes(c.name));

        if (causeConcept && effectConcept) {
          links.push({
            id: `causal_${slugify(causeConcept.name)}_${slugify(effectConcept.name)}`,
            sourceId: causeConcept.id,
            targetId: effectConcept.id,
            logic,
            type,
          });
        }
      }
    }
  }

  return links;
}

function identifyExamFocus(concepts: Concept[]): ExamFocus[] {
  const highPriority = ['分封制', '宗法制', '商鞅变法', '百家争鸣', '专制主义', '郡县制', '秦统一', '汉武帝'];

  return concepts
    .filter(c => highPriority.some(h => c.name.includes(h)) || c.importance >= 4)
    .map(c => ({
      conceptId: c.id,
      conceptName: c.name,
      frequency: c.importance >= 5 ? '必考' as const : '常考' as const,
      questionTypes: ['选择题', '材料分析题'] as string[],
      difficulty: c.importance >= 5 ? '中' as const : '易' as const,
      typicalQuestions: [],
    }));
}

function generateSummary(concepts: Concept[]): string {
  const topConcepts = concepts
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5);

  return `本单元涵盖 ${topConcepts.map(c => c.name).join('、')} 等核心知识点。` +
    `重点理解分封制与宗法制的关系、商鞅变法的历史意义、百家争鸣的思想成果，以及秦汉专制主义中央集权制度的建立。` +
    `建议结合时间轴记忆重大事件，通过因果链理解历史发展的内在逻辑。`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    || text;
}
