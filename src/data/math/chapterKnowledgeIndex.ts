/**
 * 数学章节知识索引表
 * 用于精确控制练习出题范围，避免出现越界题目
 * 适用于人教B版必修第一册
 */

export interface SectionKnowledge {
  name: string;
  keywords: string[];
  allowedTopics: string[];
  forbiddenTopics: string[];
  pageRange: string;
  description: string;
}

export interface ChapterKnowledge {
  name: string;
  book: string;
  grade: string;
  sections: Record<string, SectionKnowledge>;
}

// 人教B版必修第一册 完整章节索引
export const mathChapterKnowledgeIndex: Record<string, ChapterKnowledge> = {
  'ch1': {
    name: '集合',
    book: '人教B版必修第一册',
    grade: '高一',
    sections: {
      '1.1': {
        name: '集合的概念',
        keywords: ['集合', '元素', '属于', '不属于', '列举法', '描述法', '花括号', '自然语言'],
        allowedTopics: ['集合的定义', '元素与集合的关系', '集合的表示方法', '集合的分类', '常用数集符号'],
        forbiddenTopics: ['函数', '定义域', '值域', '单调性', '奇偶性', '导数', '三角函数'],
        pageRange: '1-15',
        description: '理解集合的概念，掌握集合的表示方法，能用列举法和描述法表示集合'
      },
      '1.2': {
        name: '集合间的基本关系',
        keywords: ['子集', '真子集', '相等', '空集', '包含', '不包含', 'Venn图'],
        allowedTopics: ['子集的定义', '真子集的定义', '集合相等的条件', '空集的性质', '子集与真子集的区别'],
        forbiddenTopics: ['函数', '定义域', '值域', '单调性', '奇偶性', '导数', '三角函数'],
        pageRange: '16-28',
        description: '理解子集、真子集、集合相等的概念，掌握它们之间的关系'
      },
      '1.3': {
        name: '集合的运算',
        keywords: ['交集', '并集', '补集', '全集', '差集', '韦恩图', '运算律'],
        allowedTopics: ['交集的定义与性质', '并集的定义与性质', '补集的定义与性质', '德摩根定律', '集合运算律'],
        forbiddenTopics: ['函数', '定义域', '值域', '单调性', '奇偶性', '导数', '三角函数'],
        pageRange: '29-45',
        description: '掌握交集、并集、补集的定义和运算律，能用Venn图表示集合关系'
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
        allowedTopics: ['等式的基本性质', '不等式的基本性质', '比较大小方法', '不等式的传递性', '同向不等式可加性'],
        forbiddenTopics: ['集合', '子集', '交集', '并集', '函数', '导数', '三角函数'],
        pageRange: '46-57',
        description: '掌握等式和不等式的基本性质，能用性质比较大小'
      },
      '2.2': {
        name: '基本不等式',
        keywords: ['基本不等式', '均值不等式', '平方平均数', '算术平均数', '几何平均数', '调和平均数', '最值问题'],
        allowedTopics: ['基本不等式√(ab)≤(a+b)/2', '一正二定三相等', '求最值的方法', '配凑法', '换元法'],
        forbiddenTopics: ['集合', '子集', '交集', '函数', '导数', '三角函数'],
        pageRange: '58-70',
        description: '掌握基本不等式，能利用基本不等式求最值'
      },
      '2.3': {
        name: '二次函数与一元二次方程、不等式',
        keywords: ['二次函数', '一元二次方程', '一元二次不等式', '求根公式', '判别式', '根与系数的关系', '图像法'],
        allowedTopics: ['二次函数的图像与性质', '一元二次方程的解法', '一元二次不等式的解法', '二次函数与方程的联系', '三个二次的关系'],
        forbiddenTopics: ['集合', '子集', '交集', '并集', '导数', '单调性'],
        pageRange: '71-90',
        description: '掌握二次函数的图像，理解三个二次的关系，能解一元二次不等式'
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
        allowedTopics: ['函数的定义', '函数的表示方法', '定义域的求法', '值域的求法', '函数的三要素', '区间'],
        forbiddenTopics: ['集合的运算', '子集', '导数', '单调性', '奇偶性', '三角函数', '指数函数', '对数函数'],
        pageRange: '91-110',
        description: '理解函数的概念，掌握函数的三要素，会求定义域和值域'
      },
      '3.2': {
        name: '函数的表示法',
        keywords: ['解析法', '图像法', '列表法', '分段函数', '映射', '对应法则'],
        allowedTopics: ['函数的三种表示方法', '分段函数的定义与求值', '映射的概念', '函数表示法的选择'],
        forbiddenTopics: ['集合的运算', '子集', '导数', '单调性', '奇偶性', '三角函数', '指数函数'],
        pageRange: '111-125',
        description: '掌握函数的表示方法，理解分段函数和映射的概念'
      },
      '3.3': {
        name: '函数的单调性',
        keywords: ['单调递增', '单调递减', '增函数', '减函数', '单调区间', '最大值', '最小值', '函数图像'],
        allowedTopics: ['单调性的定义', '单调性的判断方法', '单调性的证明', '函数最值的求法', '单调性的应用'],
        forbiddenTopics: ['集合', '子集', '交集', '补集', '导数', '奇偶性', '三角函数'],
        pageRange: '126-145',
        description: '理解函数单调性的概念，掌握判断和证明函数单调性的方法'
      },
      '3.4': {
        name: '函数的奇偶性',
        keywords: ['奇函数', '偶函数', '对称性', '奇偶性判断', '奇偶性的性质', '定义域对称'],
        allowedTopics: ['奇偶性的定义', '奇偶性的判断方法', '奇偶性的性质', '奇偶性与单调性的关系', '函数图像的对称性'],
        forbiddenTopics: ['集合', '子集', '交集', '补集', '导数', '指数函数', '对数函数'],
        pageRange: '146-165',
        description: '理解函数奇偶性的概念，掌握判断函数奇偶性的方法'
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

// 获取指定小节的知识索引
export function getSectionKnowledge(chapterId: string, sectionId: string): SectionKnowledge | null {
  const chapter = mathChapterKnowledgeIndex[chapterId];
  if (!chapter) return null;
  
  return chapter.sections[sectionId] || null;
}

// 验证题目是否在允许范围内
export function validateTopic(topic: string, chapterId: string, sectionId: string): { valid: boolean; reason?: string } {
  const knowledge = getSectionKnowledge(chapterId, sectionId);
  if (!knowledge) {
    return { valid: false, reason: '未找到该小节的知识索引' };
  }
  
  // 检查是否包含禁止关键词
  for (const forbidden of knowledge.forbiddenTopics) {
    if (topic.toLowerCase().includes(forbidden.toLowerCase())) {
      return { valid: false, reason: `题目涉及禁止知识点：${forbidden}` };
    }
  }
  
  // 检查是否包含允许关键词（至少包含一个）
  const hasAllowedKeyword = knowledge.allowedTopics.some(allowed => 
    topic.toLowerCase().includes(allowed.toLowerCase())
  );
  
  if (!hasAllowedKeyword) {
    return { valid: false, reason: '题目未涉及本小节的知识点' };
  }
  
  return { valid: true };
}
