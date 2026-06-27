/**
 * 各学科知识点范围映射
 * 用于确定出题范围，确保不超纲
 * 结构：subjectId -> chapterIndex -> sectionIndex -> knowledgePoints[]
 */

export interface PracticeKnowledgePoint {
  id: string;
  name: string;
  description: string;
  symbols?: string[]; // 该知识点会涉及的特殊符号
}

export interface PracticeSectionKnowledge {
  sectionId: string;
  sectionTitle: string;
  knowledge: PracticeKnowledgePoint[];
}

// ===== 数学（高中）=====
const MATH_KNOWLEDGE: Record<string, PracticeSectionKnowledge[]> = {
  // 必修一
  '1': [
    {
      sectionId: '1.1',
      sectionTitle: '集合',
      knowledge: [
        { id: 'k_1_1_1', name: '集合的概念', description: '集合的定义、元素特性' },
        { id: 'k_1_1_2', name: '集合的表示', description: '列举法、描述法' },
        { id: 'k_1_1_3', name: '子集', description: '子集、真子集、相等', symbols: ['⊆', '⊂', '=', '∈', '∉'] },
      ],
    },
    {
      sectionId: '1.2',
      sectionTitle: '集合间的基本关系',
      knowledge: [
        { id: 'k_1_2_1', name: '子集与真子集', description: '子集、真子集定义与性质', symbols: ['⊆', '⊂', '⊇', '⊃'] },
        { id: 'k_1_2_2', name: '集合相等', description: '两个集合相等的条件' },
      ],
    },
    {
      sectionId: '1.3',
      sectionTitle: '集合的基本运算',
      knowledge: [
        { id: 'k_1_3_1', name: '交集', description: '交集的定义与运算律', symbols: ['∩', '∅'] },
        { id: 'k_1_3_2', name: '并集', description: '并集的定义与运算律', symbols: ['∪'] },
        { id: 'k_1_3_3', name: '补集', description: '补集、全集的概念', symbols: ['∁', '∅'] },
      ],
    },
    {
      sectionId: '2.1',
      sectionTitle: '相等关系与函数概念',
      knowledge: [
        { id: 'k_2_1_1', name: '函数概念', description: '函数的定义、定义域、值域' },
        { id: 'k_2_1_2', name: '函数表示', description: '列表法、图像法、解析法' },
      ],
    },
    {
      sectionId: '2.2',
      sectionTitle: '函数的基本性质',
      knowledge: [
        { id: 'k_2_2_1', name: '单调性', description: '增函数、减函数定义' },
        { id: 'k_2_2_2', name: '最大值与最小值', description: '函数最值的概念与求法' },
        { id: 'k_2_2_3', name: '奇偶性', description: '奇函数、偶函数定义', symbols: ['f(-x)'] },
      ],
    },
  ],
};

// ===== 物理（高中）=====
const PHYSICS_KNOWLEDGE: Record<string, PracticeSectionKnowledge[]> = {
  '1': [
    {
      sectionId: '1.1',
      sectionTitle: '质点 参考系',
      knowledge: [
        { id: 'k_p_1_1_1', name: '机械运动', description: '机械运动的概念' },
        { id: 'k_p_1_1_2', name: '质点', description: '质点的定义与条件' },
        { id: 'k_p_1_1_3', name: '参考系', description: '参考系的概念与选择' },
      ],
    },
    {
      sectionId: '1.2',
      sectionTitle: '时间 位移',
      knowledge: [
        { id: 'k_p_1_2_1', name: '时刻与时间', description: '时刻、时间间隔的概念' },
        { id: 'k_p_1_2_2', name: '位移', description: '位移的定义与路程的区别', symbols: ['Δx', '→'] },
      ],
    },
    {
      sectionId: '1.3',
      sectionTitle: '位置变化快慢的描述——速度',
      knowledge: [
        { id: 'k_p_1_3_1', name: '速度', description: '速度的定义与物理意义', symbols: ['v', 'm/s'] },
        { id: 'k_p_1_3_2', name: '平均速度', description: '平均速度的计算', symbols: ['Δx/Δt'] },
      ],
    },
  ],
};

// ===== 化学（高中）=====
const CHEMISTRY_KNOWLEDGE: Record<string, PracticeSectionKnowledge[]> = {
  '1': [
    {
      sectionId: '1.1',
      sectionTitle: '物质的分类',
      knowledge: [
        { id: 'k_c_1_1_1', name: '简单分类法', description: '交叉分类法、树状分类法' },
        { id: 'k_c_1_1_2', name: '分散系', description: '溶液、胶体、浊液的概念' },
      ],
    },
    {
      sectionId: '1.2',
      sectionTitle: '离子反应',
      knowledge: [
        { id: 'k_c_1_2_1', name: '电解质', description: '电解质与非电解质的概念' },
        { id: 'k_c_1_2_2', name: '电离', description: '电离方程式的书写' },
        { id: 'k_c_1_2_3', name: '离子反应', description: '离子反应发生的条件' },
      ],
    },
  ],
};

// ===== 语文（高中）=====
const CHINESE_KNOWLEDGE: Record<string, PracticeSectionKnowledge[]> = {
  '1': [
    {
      sectionId: '1.1',
      sectionTitle: '沁园春·长沙',
      knowledge: [
        { id: 'k_ch_1_1_1', name: '意象', description: '诗歌意象的识别与分析' },
        { id: 'k_ch_1_1_2', name: '抒情方式', description: '直接抒情与间接抒情' },
        { id: 'k_ch_1_1_3', name: '炼字', description: '诗歌用词的精妙分析' },
      ],
    },
    {
      sectionId: '1.2',
      sectionTitle: '立在地球边上放号',
      knowledge: [
        { id: 'k_ch_1_2_1', name: '诗歌意象', description: '诗歌意象的象征意义' },
        { id: 'k_ch_1_2_2', name: '浪漫主义', description: '浪漫主义诗歌特点' },
      ],
    },
  ],
};

// ===== 英语（高中）=====
const ENGLISH_KNOWLEDGE: Record<string, PracticeSectionKnowledge[]> = {
  '1': [
    {
      sectionId: '1.1',
      sectionTitle: 'Unit 1 Teenage Life',
      knowledge: [
        { id: 'k_e_1_1_1', name: '词汇运用', description: '重点词汇的语境运用' },
        { id: 'k_e_1_1_2', name: '语法：现在进行时表将来', description: '现在进行时表将来的用法' },
      ],
    },
  ],
};

// ===== 生物（高中）=====
const BIOLOGY_KNOWLEDGE: Record<string, PracticeSectionKnowledge[]> = {
  '1': [
    {
      sectionId: '1.1',
      sectionTitle: '细胞是生命活动的基本单位',
      knowledge: [
        { id: 'k_b_1_1_1', name: '细胞学说的建立', description: '细胞学说的主要内容' },
        { id: 'k_b_1_1_2', name: '细胞的多样性与统一性', description: '原核细胞与真核细胞的区别' },
      ],
    },
  ],
};

// ===== 地理（高中）=====
const GEOGRAPHY_KNOWLEDGE: Record<string, PracticeSectionKnowledge[]> = {
  '1': [
    {
      sectionId: '1.1',
      sectionTitle: '地球的宇宙环境',
      knowledge: [
        { id: 'k_g_1_1_1', name: '天体', description: '天体与天体系统' },
        { id: 'k_g_1_1_2', name: '太阳系', description: '太阳系的组成与位置' },
      ],
    },
  ],
};

// ===== 政治（高中）=====
const POLITICS_KNOWLEDGE: Record<string, PracticeSectionKnowledge[]> = {
  '1': [
    {
      sectionId: '1.1',
      sectionTitle: '揭开货币的神秘面纱',
      knowledge: [
        { id: 'k_pl_1_1_1', name: '货币的本质', description: '货币的产生与本质' },
        { id: 'k_pl_1_1_2', name: '货币的基本职能', description: '价值尺度与流通手段' },
      ],
    },
  ],
};

// ===== 历史（高中）=====
const HISTORY_KNOWLEDGE: Record<string, PracticeSectionKnowledge[]> = {
  '1': [
    {
      sectionId: '1.1',
      sectionTitle: '中国古代政治制度',
      knowledge: [
        { id: 'k_h_1_1_1', name: '夏商政治制度', description: '世袭制与分封制萌芽' },
        { id: 'k_h_1_1_2', name: '西周分封制', description: '分封制的内容与特点' },
      ],
    },
  ],
};

// ===== 统一导出 =====

const ALL_SUBJECT_KNOWLEDGE: Record<string, Record<string, PracticeSectionKnowledge[]>> = {
  math: MATH_KNOWLEDGE,
  physics: PHYSICS_KNOWLEDGE,
  chemistry: CHEMISTRY_KNOWLEDGE,
  chinese: CHINESE_KNOWLEDGE,
  english: ENGLISH_KNOWLEDGE,
  biology: BIOLOGY_KNOWLEDGE,
  geography: GEOGRAPHY_KNOWLEDGE,
  politics: POLITICS_KNOWLEDGE,
  history: HISTORY_KNOWLEDGE,
};

/**
 * 根据学科和章节ID获取该章节及之前所有章节的知识点
 * @param subjectId 学科ID
 * @param chapterId 章节编号（如 "1"）
 * @param sectionId 小节编号（如 "1.1"，"all"表示整章）
 */
export function getKnowledgeRange(
  subjectId: string,
  chapterId: string,
  sectionId: string
): { currentKnowledge: PracticeSectionKnowledge[]; previousKnowledge: PracticeSectionKnowledge[] } {
  const subjectKnowledge = ALL_SUBJECT_KNOWLEDGE[subjectId] || {};
  const chapterData = subjectKnowledge[chapterId] || [];
  const currentSectionId = sectionId === 'all' ? null : sectionId;

  // 找出当前小节及之前的小节
  const allSections: PracticeSectionKnowledge[] = [];
  for (const chapter of Object.values(subjectKnowledge)) {
    allSections.push(...chapter);
  }

  const currentIdx = allSections.findIndex(s =>
    s.sectionId === currentSectionId ||
    (sectionId === 'all' && s.sectionId.startsWith(chapterId + '.'))
  );

  const previousKnowledge = currentIdx >= 0 ? allSections.slice(0, currentIdx) : allSections;
  const currentKnowledge = currentIdx >= 0 ? [allSections[currentIdx]] : [];

  return { currentKnowledge, previousKnowledge };
}

/**
 * 获取指定章节的所有知识点（扁平化）
 */
export function flattenKnowledgePoints(sections: PracticeSectionKnowledge[]): PracticeKnowledgePoint[] {
  return sections.flatMap(s => s.knowledge);
}

/**
 * 格式化知识点为提示词字符串
 */
export function formatKnowledgeForPrompt(
  current: PracticeSectionKnowledge[],
  previous: PracticeSectionKnowledge[],
  currentRatio = 0.6
): { currentStr: string; previousStr: string; allKnowledge: string[] } {
  const currentFlat = flattenKnowledgePoints(current);
  const previousFlat = flattenKnowledgePoints(previous);
  const currentNames = currentFlat.map(k => k.name);
  const previousNames = previousFlat.map(k => k.name);
  const allNames = [...currentNames, ...previousNames];

  return {
    currentStr: currentNames.length > 0 ? currentNames.join('、') : '（当前小节无预设知识点，请根据教材内容出题）',
    previousStr: previousNames.length > 0 ? previousNames.join('、') : '（无之前小节）',
    allKnowledge: allNames,
  };
}

/**
 * 获取学科名称
 */
export function getSubjectName(subjectId: string): string {
  const map: Record<string, string> = {
    math: '数学', physics: '物理', chemistry: '化学', english: '英语',
    chinese: '语文', biology: '生物', geography: '地理', politics: '政治', history: '历史',
  };
  return map[subjectId] || subjectId;
}

/**
 * 检查某知识点是否在允许范围内
 */
export function isKnowledgeInScope(
  subjectId: string,
  chapterId: string,
  sectionId: string,
  knowledgeName: string
): boolean {
  const { currentKnowledge, previousKnowledge } = getKnowledgeRange(subjectId, chapterId, sectionId);
  const allKnowledge = flattenKnowledgePoints([...currentKnowledge, ...previousKnowledge]);
  return allKnowledge.some(k =>
    k.name.includes(knowledgeName) || knowledgeName.includes(k.name)
  );
}
