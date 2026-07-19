/**
 * 数学章节知识索引表
 * 用于精确控制练习出题范围，避免出现越界题目
 * 适用于人教B版必修第一册
 */

// 题型特征模式
export interface PatternRule {
  regex: string;
  reason: string;
}

export interface SectionKnowledge {
  name: string;
  keywords: string[];
  allowedTopics: string[];
  forbiddenTopics: string[];
  // 前置小节的知识（可以包含，但必须以本节知识点为主）
  prerequisiteTopics: string[];
  pageRange: string;
  description: string;
  // 题型黑名单：识别并禁止特定题型模式
  forbiddenPatterns?: PatternRule[];
  // 必须包含的题型特征（用于验证题目是否属于本节）
  requiredPatterns?: PatternRule[];
}

export interface ChapterKnowledge {
  name: string;
  book: string;
  grade: string;
  sections: Record<string, SectionKnowledge>;
}

// 人教B版必修第一册 完整章节索引
// 关键原则：每个小节只能出本小节及前置小节的知识点，禁止后续章节的知识点
export const mathChapterKnowledgeIndex: Record<string, ChapterKnowledge> = {
  'ch1': {
    name: '集合',
    book: '人教B版必修第一册',
    grade: '高一',
    sections: {
      '1.1': {
        name: '集合的概念',
        keywords: ['集合', '元素', '属于', '不属于', '列举法', '描述法', '花括号', '自然语言'],
        // 本节知识点
        allowedTopics: ['集合的定义', '元素与集合的关系', '集合的表示方法', '集合的分类', '常用数集符号'],
        // 禁止的知识点（后续章节）
        forbiddenTopics: ['函数', '定义域', '值域', '单调性', '奇偶性', '导数', '三角函数', '二次函数', '不等式'],
        // 前置知识点（无）
        prerequisiteTopics: [],
        pageRange: '1-15',
        description: '理解集合的概念，掌握集合的表示方法，能用列举法和描述法表示集合',
        // 集合章节必须包含的特征
        requiredPatterns: [
          { regex: '(集合|元素|属于|列举法|描述法)', reason: '集合关键词' }
        ],
        // 函数章节禁止的特征
        forbiddenPatterns: [
          { regex: 'f\\(x\\)', reason: '函数符号 f(x)' },
          { regex: '定义域|值域', reason: '函数定义域/值域' }
        ]
      },
      '1.2': {
        name: '集合间的基本关系',
        keywords: ['子集', '真子集', '相等', '空集', '包含', '不包含', 'Venn图'],
        // 本节知识点
        allowedTopics: ['子集的定义', '真子集的定义', '集合相等的条件', '空集的性质', '子集与真子集的区别'],
        // 禁止的知识点（后续章节）
        forbiddenTopics: ['函数', '定义域', '值域', '单调性', '奇偶性', '导数', '三角函数', '二次函数', '不等式', '交集', '并集', '补集'],
        // 前置知识点（1.1集合的概念）
        prerequisiteTopics: ['集合的定义', '元素与集合的关系', '集合的表示方法'],
        pageRange: '16-28',
        description: '理解子集、真子集、集合相等的概念，掌握它们之间的关系',
        // 子集章节必须包含的特征
        requiredPatterns: [
          { regex: '(子集|真子集|⊆|⊂|包含于)', reason: '子集关系关键词' }
        ],
        forbiddenPatterns: [
          { regex: 'f\\(x\\)', reason: '函数符号 f(x)' },
          { regex: '定义域|值域|单调|奇偶', reason: '函数相关概念' },
          { regex: '∩|∪|补集', reason: '集合运算（交集、并集、补集）' }
        ]
      },
      '1.3': {
        name: '集合的运算',
        keywords: ['交集', '并集', '补集', '全集', '差集', '韦恩图', '运算律'],
        // 本节知识点
        allowedTopics: ['交集的定义与性质', '并集的定义与性质', '补集的定义与性质', '德摩根定律', '集合运算律'],
        // 禁止的知识点（后续章节）
        forbiddenTopics: ['函数', '定义域', '值域', '单调性', '奇偶性', '导数', '三角函数', '二次函数', '不等式'],
        // 前置知识点（1.1集合概念 + 1.2子集关系）
        prerequisiteTopics: ['集合的定义', '元素与集合的关系', '子集的定义', '真子集的定义', '空集的性质'],
        pageRange: '29-45',
        description: '掌握交集、并集、补集的定义和运算律，能用Venn图表示集合关系',
        // 集合运算章节必须包含的特征
        requiredPatterns: [
          { regex: '(∩|∪|补集|交集|并集)', reason: '集合运算符号' }
        ],
        forbiddenPatterns: [
          { regex: 'f\\(x\\)', reason: '函数符号 f(x)' },
          { regex: '定义域|值域|单调|奇偶', reason: '函数相关概念' }
        ]
      }
    }
  },
  
  'ch2': {
    name: '一元二次函数、方程和不等式',
    book: '人教B版必修第一册',
    grade: '高一',
    sections: {
      '2.1': {
        name: '等式性质与不等式性质',
        keywords: ['等式', '不等式', '传递性', '同向不等式', '加法法则', '乘法法则', '作差法', '作商法'],
        // 本节知识点
        allowedTopics: ['等式的基本性质', '不等式的基本性质', '比较大小方法', '不等式的传递性', '同向不等式可加性'],
        // 禁止的知识点（后续章节）
        forbiddenTopics: ['函数', '定义域', '值域', '单调性', '奇偶性', '导数', '三角函数', '二次函数', '根与系数', '韦达定理', '均值不等式'],
        // 前置知识点（无，不需要用到集合）
        prerequisiteTopics: [],
        pageRange: '46-57',
        description: '掌握等式和不等式的基本性质，能用性质比较大小',
        // 不等式章节必须包含的特征
        requiredPatterns: [
          { regex: '(不等式|>|≥|<|≤|比较大小)', reason: '不等式关键词' }
        ],
        forbiddenPatterns: [
          { regex: 'f\\(x\\)', reason: '函数符号 f(x)' },
          { regex: '定义域|值域|单调|奇偶', reason: '函数相关概念' },
          { regex: '∩|∪|集合|元素|属于', reason: '集合相关概念' }
        ]
      },
      '2.2': {
        name: '基本不等式',
        keywords: ['基本不等式', '均值不等式', '平方平均数', '算术平均数', '几何平均数', '调和平均数', '最值问题'],
        // 本节知识点
        allowedTopics: ['基本不等式√(ab)≤(a+b)/2', '一正二定三相等', '求最值的方法', '配凑法', '换元法'],
        // 禁止的知识点（后续章节）
        forbiddenTopics: ['函数', '定义域', '值域', '单调性', '奇偶性', '导数', '三角函数', '二次函数', '根与系数', '韦达定理'],
        // 前置知识点（2.1不等式性质）
        prerequisiteTopics: ['不等式的基本性质', '比较大小方法'],
        pageRange: '58-70',
        description: '掌握基本不等式，能利用基本不等式求最值',
        // 基本不等式章节必须包含的特征
        requiredPatterns: [
          { regex: '(基本不等式|√|均值|算术平均|几何平均)', reason: '基本不等式关键词' }
        ],
        forbiddenPatterns: [
          { regex: 'f\\(x\\)', reason: '函数符号 f(x)' },
          { regex: '定义域|值域|单调|奇偶', reason: '函数相关概念' },
          { regex: '∩|∪|集合', reason: '集合相关概念' }
        ]
      },
      '2.3': {
        name: '二次函数与一元二次方程、不等式',
        keywords: ['二次函数', '一元二次方程', '一元二次不等式', '求根公式', '判别式', '根与系数的关系', '图像法'],
        // 本节知识点
        allowedTopics: ['二次函数的图像与性质', '一元二次方程的解法', '一元二次不等式的解法', '二次函数与方程的联系', '三个二次的关系'],
        // 禁止的知识点（后续章节 - 函数）
        forbiddenTopics: ['函数的概念', '函数的表示法', '单调性', '奇偶性', '导数', '三角函数', '指数函数', '对数函数', '分段函数'],
        // 前置知识点（2.1不等式性质 + 2.2基本不等式）
        prerequisiteTopics: ['不等式的基本性质', '基本不等式', '求最值的方法'],
        pageRange: '71-90',
        description: '掌握二次函数的图像，理解三个二次的关系，能解一元二次不等式',
        // 二次函数章节必须包含的特征
        requiredPatterns: [
          { regex: '(二次函数|一元二次|ax²|bx\\+c|判别式|求根公式|韦达)', reason: '二次函数/方程关键词' }
        ],
        forbiddenPatterns: [
          { regex: '单调性|单调递增|单调递减|增函数|减函数', reason: '函数单调性' },
          { regex: '奇偶性|奇函数|偶函数', reason: '函数奇偶性' },
          { regex: '指数函数|对数函数|幂函数', reason: '超越函数' }
        ]
      }
    }
  },
  
  'ch3': {
    name: '函数',
    book: '人教B版必修第一册',
    grade: '高一',
    sections: {
      '3.1': {
        name: '函数的概念',
        keywords: ['函数', '定义域', '值域', '对应关系', '自变量', '因变量', '函数值', '函数相等'],
        // 本节知识点
        allowedTopics: ['函数的定义', '函数的表示方法', '定义域的求法', '值域的求法', '函数的三要素', '区间'],
        // 禁止的知识点（后续章节 - 本章其他小节和后续章节）
        forbiddenTopics: [
          '集合', '子集', '真子集', '交集', '并集', '补集', '韦恩图', '德摩根定律',
          '单调性', '单调递增', '单调递减', '增函数', '减函数',
          '奇偶性', '奇函数', '偶函数', '对称性',
          '导数', '三角函数', '指数函数', '对数函数', '幂函数',
          '分段函数', '映射'
        ],
        // 前置知识点（无 - 这是函数的起始章节）
        prerequisiteTopics: [],
        pageRange: '91-110',
        description: '理解函数的概念，掌握函数的三要素，会求定义域和值域',
        // 函数概念章节必须包含的特征（至少一个）
        requiredPatterns: [
          { regex: 'f\\(x\\)', reason: '函数符号 f(x)（必须有）' },
          { regex: '(定义域|值域|对应关系)', reason: '函数概念关键词' }
        ],
        // 函数章节严格禁止集合相关的所有特征
        forbiddenPatterns: [
          // 集合描述法 {x | ...} 或 {x : ...}
          { regex: '\\{[^{}]*[|:][^{}]*\\}', reason: '集合描述法 {x | ...} 或 {x : ...}' },
          // 元素属于符号
          { regex: '∈|∉', reason: '元素属于符号 ∈ ∉' },
          // 集合交并运算
          { regex: '∩|∪', reason: '集合交并运算符号 ∩ ∪' },
          // 数集符号
          { regex: 'ℤ|ℕ|ℚ|ℝ', reason: '数集符号 ℤ ℕ ℚ ℝ' },
          // 集合关系词
          { regex: '(集合|子集|真子集|包含于|包含关系)', reason: '集合关系词' },
          // 集合运算词
          { regex: '(交集|并集|补集|韦恩图|德摩根)', reason: '集合运算词' },
          // 集合运算表达式 A ∪ B, A ∩ B
          { regex: '[A-Z]\\s*[∩∪]\\s*[A-Z]', reason: '集合运算表达式' },
          // 单调性（后续章节）
          { regex: '(单调性|增函数|减函数|单调递增|单调递减)', reason: '函数单调性（后续章节）' },
          // 奇偶性（后续章节）
          { regex: '(奇偶性|奇函数|偶函数|对称性)', reason: '函数奇偶性（后续章节）' }
        ]
      },
      '3.2': {
        name: '函数的表示法',
        keywords: ['解析法', '图像法', '列表法', '分段函数', '映射', '对应法则'],
        // 本节知识点
        allowedTopics: ['函数的三种表示方法', '分段函数的定义与求值', '映射的概念', '函数表示法的选择'],
        // 禁止的知识点（后续章节）
        forbiddenTopics: [
          '集合', '子集', '交集', '并集', '补集',
          '单调性', '单调递增', '单调递减', '增函数', '减函数',
          '奇偶性', '奇函数', '偶函数',
          '导数', '三角函数', '指数函数', '对数函数', '幂函数'
        ],
        // 前置知识点（3.1函数的概念）
        prerequisiteTopics: ['函数的定义', '函数的表示方法', '定义域的求法', '值域的求法', '函数的三要素', '区间'],
        pageRange: '111-125',
        description: '掌握函数的表示方法，理解分段函数和映射的概念',
        // 函数表示法章节必须包含的特征
        requiredPatterns: [
          { regex: '(解析法|图像法|列表法|分段函数|映射)', reason: '函数表示法关键词' },
          { regex: 'f\\(x\\)', reason: '函数符号 f(x)' }
        ],
        forbiddenPatterns: [
          { regex: '\\{[^}]*\\|[^}]*\\}', reason: '集合描述法' },
          { regex: '∈|∉', reason: '元素属于符号' },
          { regex: '∩|∪', reason: '集合运算' },
          { regex: '(单调性|增函数|减函数)', reason: '函数单调性' },
          { regex: '(奇偶性|奇函数|偶函数)', reason: '函数奇偶性' }
        ]
      },
      '3.3': {
        name: '函数的单调性',
        keywords: ['单调递增', '单调递减', '增函数', '减函数', '单调区间', '最大值', '最小值', '函数图像'],
        // 本节知识点
        allowedTopics: ['单调性的定义', '单调性的判断方法', '单调性的证明', '函数最值的求法', '单调性的应用'],
        // 禁止的知识点（后续章节）
        forbiddenTopics: [
          '集合', '子集', '交集', '并集', '补集',
          '奇偶性', '奇函数', '偶函数', '对称性',
          '导数', '三角函数', '指数函数', '对数函数', '幂函数',
          '分段函数'
        ],
        // 前置知识点（3.1函数概念 + 3.2函数表示法）
        prerequisiteTopics: ['函数的定义', '函数的表示方法', '定义域的求法', '值域的求法', '函数的三要素'],
        pageRange: '126-145',
        description: '理解函数单调性的概念，掌握判断和证明函数单调性的方法',
        // 函数单调性章节必须包含的特征
        requiredPatterns: [
          { regex: '(单调|增函数|减函数|递增|递减|单调区间)', reason: '单调性关键词' }
        ],
        forbiddenPatterns: [
          { regex: '\\{[^}]*\\|[^}]*\\}', reason: '集合描述法' },
          { regex: '∈|∉', reason: '元素属于符号' },
          { regex: '∩|∪', reason: '集合运算' },
          { regex: '(奇偶性|奇函数|偶函数)', reason: '函数奇偶性（后续章节）' }
        ]
      },
      '3.4': {
        name: '函数的奇偶性',
        keywords: ['奇函数', '偶函数', '对称性', '奇偶性判断', '奇偶性的性质', '定义域对称'],
        // 本节知识点
        allowedTopics: ['奇偶性的定义', '奇偶性的判断方法', '奇偶性的性质', '奇偶性与单调性的关系', '函数图像的对称性'],
        // 禁止的知识点（后续章节）
        forbiddenTopics: [
          '集合', '子集', '交集', '并集', '补集',
          '导数', '三角函数', '指数函数', '对数函数', '幂函数',
          '分段函数'
        ],
        // 前置知识点（3.1函数概念 + 3.2函数表示法 + 3.3单调性）
        prerequisiteTopics: ['函数的定义', '函数的表示方法', '定义域的求法', '值域的求法', '单调性的定义', '单调性的判断方法'],
        pageRange: '146-165',
        description: '理解函数奇偶性的概念，掌握判断函数奇偶性的方法',
        // 函数奇偶性章节必须包含的特征
        requiredPatterns: [
          { regex: '(奇偶性|奇函数|偶函数|对称性|f\\(-x\\))', reason: '奇偶性关键词' }
        ],
        forbiddenPatterns: [
          { regex: '\\{[^}]*\\|[^}]*\\}', reason: '集合描述法' },
          { regex: '∈|∉', reason: '元素属于符号' },
          { regex: '∩|∪', reason: '集合运算' }
        ]
      }
    }
  }
};

// 获取所有章节列表
export function getAllChapters(): Array<{ id: string; name: string; sectionCount: number }> {
  return Object.entries(mathChapterKnowledgeIndex).map(([id, chapter]) => ({
    id,
    name: chapter.name,
    sectionCount: Object.keys(chapter.sections).length
  }));
}

// 获取指定章节的所有小节
export function getSectionsByChapter(chapterId: string): Array<{ id: string; name: string; pageRange: string }> {
  const chapter = mathChapterKnowledgeIndex[chapterId];
  if (!chapter) return [];
  
  return Object.entries(chapter.sections).map(([id, section]) => ({
    id,
    name: section.name,
    pageRange: section.pageRange
  }));
}

// 获取指定小节的知识索引（支持模糊匹配）
export function getSectionKnowledge(chapterId: string, sectionId: string): SectionKnowledge | null {
  const chapter = mathChapterKnowledgeIndex[chapterId];
  if (!chapter) return null;
  
  // 先精确匹配
  const exact = chapter.sections[sectionId];
  if (exact) return exact;
  
  // 尝试前缀匹配：如 "3.1.1" 匹配 "3.1"
  const parts = sectionId.split('.');
  for (let len = parts.length - 1; len >= 1; len--) {
    const prefix = parts.slice(0, len).join('.');
    const match = chapter.sections[prefix];
    if (match) return match;
  }
  
  return null;
}

// 验证题目是否在允许范围内（严格模式）
export function validateTopic(topic: string, chapterId: string, sectionId: string): { valid: boolean; reason?: string } {
  const knowledge = getSectionKnowledge(chapterId, sectionId);
  if (!knowledge) {
    return { valid: false, reason: '未找到该小节的知识索引' };
  }
  
  const topicLower = topic.toLowerCase();
  
  // 检查是否包含禁止关键词（后续章节的知识点）
  for (const forbidden of knowledge.forbiddenTopics) {
    if (topicLower.includes(forbidden.toLowerCase())) {
      return { valid: false, reason: `题目涉及后续章节知识点【${forbidden}】，超出本节范围` };
    }
  }
  
  // 检查是否包含本节允许的知识点（必须有至少一个）
  const hasAllowedKeyword = knowledge.allowedTopics.some(allowed => 
    topicLower.includes(allowed.toLowerCase())
  );
  
  // 检查是否包含前置知识点（可以作为辅助）
  const hasPrerequisiteKeyword = knowledge.prerequisiteTopics.some(prereq => 
    topicLower.includes(prereq.toLowerCase())
  );
  
  // 必须包含本节知识点，或者只包含前置知识点（允许题目综合前后知识点）
  // 但如果题目既不包含本节知识点也不包含前置知识点，则无效
  if (!hasAllowedKeyword && !hasPrerequisiteKeyword) {
    return { valid: false, reason: '题目未涉及本小节的知识点' };
  }
  
  return { valid: true };
}

// 验证题目是否严格只包含指定章节的知识点（宽松模式 - 允许前置知识点）
export function validateTopicLenient(topic: string, chapterId: string, sectionId: string): { valid: boolean; reason?: string } {
  const knowledge = getSectionKnowledge(chapterId, sectionId);
  if (!knowledge) {
    return { valid: false, reason: '未找到该小节的知识索引' };
  }
  
  const topicLower = topic.toLowerCase();
  
  // 宽松模式：只检查禁止关键词
  for (const forbidden of knowledge.forbiddenTopics) {
    if (topicLower.includes(forbidden.toLowerCase())) {
      return { valid: false, reason: `题目涉及后续章节知识点【${forbidden}】` };
    }
  }
  
  return { valid: true };
}

// 验证题型特征（使用正则表达式模式）
export function validatePatterns(
  questionText: string,
  knowledge: SectionKnowledge,
  debug: boolean = false
): { valid: boolean; reason?: string; matchedPatterns?: string[] } {
  // 如果没有定义模式规则，跳过验证
  if (!knowledge.forbiddenPatterns && !knowledge.requiredPatterns) {
    return { valid: true };
  }

  const fullText = questionText + ' ' + (knowledge.keywords || []).join(' ');
  const matchedPatterns: string[] = [];

  // 检查禁止的模式
  if (knowledge.forbiddenPatterns) {
    for (const pattern of knowledge.forbiddenPatterns) {
      try {
        const regex = new RegExp(pattern.regex, 'i');
        if (regex.test(fullText)) {
          matchedPatterns.push(`禁止: ${pattern.reason}`);
          if (debug) {
            console.log(`[validatePatterns] 匹配到禁止模式: ${pattern.reason}, 正则: ${pattern.regex}`);
          }
          return { 
            valid: false, 
            reason: `题目包含禁止特征【${pattern.reason}】`,
            matchedPatterns
          };
        }
      } catch (e) {
        // 正则表达式可能无效，忽略该模式
        console.warn(`无效的正则表达式: ${pattern.regex}`);
      }
    }
  }

  // 检查必须的模式
  if (knowledge.requiredPatterns) {
    const hasRequired = knowledge.requiredPatterns.some(pattern => {
      try {
        const regex = new RegExp(pattern.regex, 'i');
        return regex.test(fullText);
      } catch (e) {
        return false;
      }
    });
    
    if (!hasRequired) {
      const requiredReasons = knowledge.requiredPatterns.map(p => p.reason).join('、');
      if (debug) {
        console.log(`[validatePatterns] 缺少必需模式，应包含: ${requiredReasons}`);
      }
      return { 
        valid: false, 
        reason: `题目未包含本节必需特征（应包含：${requiredReasons}）`,
        matchedPatterns
      };
    }
  }

  return { valid: true, matchedPatterns };
}

// 综合验证函数（严格模式）
export function validateQuestion(
  question: string,
  chapterId: string,
  sectionId: string,
  strictMode: boolean = true,
  debug: boolean = false
): { valid: boolean; reason?: string } {
  const knowledge = getSectionKnowledge(chapterId, sectionId);
  if (!knowledge) {
    return { valid: false, reason: '未找到该小节的知识索引' };
  }

  if (debug) {
    console.log(`[validateQuestion] 开始验证: ${question.substring(0, 50)}...`);
  }

  // 0. 特殊检查：如果题目包含"集合"关键词但没有函数符号，视为无效
  if (chapterId === 'ch3' && sectionId === '3.1') {
    const hasSetKeyword = /集合|子集|交集|并集|补集|属于|元素/.test(question);
    const hasFunctionSymbol = /f\(x\)/.test(question);
    const hasFunctionKeyword = /函数|定义域|值域/.test(question);
    
    if (hasSetKeyword && !hasFunctionSymbol && !hasFunctionKeyword) {
      if (debug) {
        console.log(`[validateQuestion] ❌ 拒绝：题目包含集合关键词但没有函数特征`);
      }
      return { valid: false, reason: '这是集合题，不是函数题！题目包含集合关键词但没有函数特征。' };
    }
  }

  // 1. 验证禁止关键词
  const keywordValidation = validateTopic(question, chapterId, sectionId);
  if (!keywordValidation.valid) {
    if (debug) {
      console.log(`[validateQuestion] ❌ 拒绝（关键词）: ${keywordValidation.reason}`);
    }
    return keywordValidation;
  }

  // 2. 验证题型模式
  if (strictMode) {
    const patternValidation = validatePatterns(question, knowledge, debug);
    if (!patternValidation.valid) {
      if (debug) {
        console.log(`[validateQuestion] ❌ 拒绝（模式）: ${patternValidation.reason}`);
      }
      return patternValidation;
    }
  }

  if (debug) {
    console.log(`[validateQuestion] ✅ 通过验证`);
  }
  return { valid: true };
}

// 过滤超纲题目
export function filterQuestions<T extends { question: string }>(
  questions: T[],
  chapterId: string,
  sectionId: string,
  strictMode: boolean = true
): { valid: T[]; invalid: Array<{ question: T; reason: string }> } {
  const valid: T[] = [];
  const invalid: Array<{ question: T; reason: string }> = [];

  for (const q of questions) {
    const validation = validateQuestion(q.question, chapterId, sectionId, strictMode);
    if (validation.valid) {
      valid.push(q);
    } else {
      invalid.push({ question: q, reason: validation.reason || '未知原因' });
    }
  }

  return { valid, invalid };
}
