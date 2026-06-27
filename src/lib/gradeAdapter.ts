// 年级适配工具
import type { Grade } from '@/stores/gradeStore';

// 各学科分析维度（按年级过滤）
export const SUBJECT_DIMENSIONS: Record<string, Record<Grade, string[]>> = {
  math: {
    grade1: ['集合', '函数', '三角函数', '数列'],
    grade2: ['函数', '立体几何', '解析几何', '概率'],
    grade3: ['函数', '导数', '解析几何', '概率统计', '数列'],
  },
  chinese: {
    grade1: ['文言实词', '文言虚词', '诗歌手法', '名句默写'],
    grade2: ['文言实词', '文言虚词', '诗歌鉴赏', '作文', '小说阅读'],
    grade3: ['文言实词', '文言虚词', '诗歌手法', '作文', '论述类文本', '文学类文本'],
  },
  english: {
    grade1: ['阅读理解', '完形填空', '语法填空', '写作'],
    grade2: ['阅读理解', '完形填空', '语法', '写作', '七选五'],
    grade3: ['阅读理解', '完形填空', '语法', '写作', '七选五', '读后续写'],
  },
  politics: {
    grade1: ['经济', '政治', '哲学'],
    grade2: ['经济', '政治', '哲学', '文化'],
    grade3: ['经济', '政治', '哲学', '文化', '时事政治'],
  },
  history: {
    grade1: ['古代史', '近代史'],
    grade2: ['古代史', '近代史', '世界史'],
    grade3: ['古代史', '近代史', '世界史', '选修'],
  },
  geography: {
    grade1: ['自然地理', '人文地理'],
    grade2: ['自然地理', '人文地理', '区域地理'],
    grade3: ['自然地理', '人文地理', '区域地理', '旅游地理', '环境保护'],
  },
  physics: {
    grade1: ['力学', '运动学'],
    grade2: ['力学', '电磁学', '实验'],
    grade3: ['力学', '电磁学', '光学', '原子物理', '实验'],
  },
  chemistry: {
    grade1: ['物质结构', '化学反应原理'],
    grade2: ['有机化学', '物质结构', '实验'],
    grade3: ['有机化学', '反应原理', '物质结构', '实验'],
  },
  biology: {
    grade1: ['分子与细胞', '遗传与进化'],
    grade2: ['分子与细胞', '遗传与进化', '稳态与环境'],
    grade3: ['分子与细胞', '遗传与进化', '稳态与环境', '生物技术', '现代生物科技'],
  },
};

// 年级对应的章节范围过滤
export interface ChapterFilter {
  required: string[];   // 必修
  elective: string[];    // 选择性必修
  exam: string[];        // 高考范围
}

export function getChapterFilter(grade: Grade): ChapterFilter {
  switch (grade) {
    case 'grade1':
      return { required: ['必修'], elective: [], exam: ['必修'] };
    case 'grade2':
      return { required: ['必修'], elective: ['选择性必修'], exam: ['必修', '选择性必修'] };
    case 'grade3':
      return { required: ['必修'], elective: ['选择性必修'], exam: ['必修', '选择性必修', '选修'] };
  }
}

// 根据年级过滤薄弱点数据
export function filterWeakPointsByGrade<T extends { chapter?: string; type?: string }>(
  points: T[],
  grade: Grade,
  subjectId: string
): T[] {
  const dimensions = SUBJECT_DIMENSIONS[subjectId]?.[grade] || [];
  return points.filter((p) => {
    if (!p.type) return true;
    return dimensions.some((d) => p.type?.includes(d));
  });
}

// 根据年级过滤推送内容
export function filterDailyContentByGrade<T extends { grade?: Grade }>(
  items: T[],
  grade: Grade
): T[] {
  return items.filter((item) => {
    if (!item.grade) return true;
    // 向上兼容：内容标记的年级 <= 当前年级都可以显示
    const gradeOrder: Record<Grade, number> = { grade1: 1, grade2: 2, grade3: 3 };
    return gradeOrder[item.grade] <= gradeOrder[grade];
  });
}

// AI讲解用通俗语言提示（供API使用）
export const HEURISTIC_PROMPTS = {
  thinking: '🧠 想一想：',
  guideStep: '📌 分步引导：',
  analogy: '🏠 类比理解：',
  checkPoint: '✅ 检查点：',
  summary: '📝 总结：',
  action: '💡 行动建议：',
  encouragement: '🌟 鼓励语：',

  wrongAnswerHeuristic: (question: string) =>
    `🧠 想一想：这道题问的是什么？\n你能找到题目中的关键词吗？\n如果把关键词换成你熟悉的说法，会是什么？\n现在看看选项，哪个最符合你的理解？`,

  weakPointAnalysis: (point: string) =>
    `📌 为什么这个知识点薄弱？\n1. 这个知识点有没有和生活中的例子联系起来？\n2. 你能用自己的话说一遍吗？\n3. 找一道最简单的题试试，从最简单的开始。`,

  actionSuggestion: (point: string, chapter?: string) =>
    `💡 该怎么做：\n1. 先把${point}的定义背熟\n2. 找2-3道基础题做一遍\n3. 如果有${chapter ? `第${chapter}章` : '相关章节'}的内容，先看那一节\n4. 每天复习5分钟，连续3天就能记住！`,
};
