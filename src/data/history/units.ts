// 历史单元列表 - 支持多教材多单元扩展
import type { HistoryUnit } from '@/types/history';

export const historyUnits: HistoryUnit[] = [
  // ============ 第一单元 ============
  {
    id: 'u1',
    bookId: 'outline-upper',
    unitNo: 1,
    name: '第一单元',
    title: '从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    period: '原始社会—东汉（约公元前2070—公元220年）',
    startYear: -2070,
    endYear: 220,
    coreTheme: '中华文明起源与大一统确立',
    curriculumDimensions: ['制度变化与创新', '民族交融', '区域开发', '思想文化'],
    lessons: ['u1-l1', 'u1-l2', 'u1-l3', 'u1-l4'],
    status: 'released',
    liaoningSummary: {
      totalQuestions: 11,
      totalScore: 48,
      bigQuestions: 2,
      highFrequencyTopics: ['秦始皇统一', '汉武帝大一统', '汉代政治理念'],
    },
    nextUnitId: 'u2',
  },
  // ============ 第二单元 ============
  {
    id: 'u2',
    bookId: 'outline-upper',
    unitNo: 2,
    name: '第二单元',
    title: '三国两晋南北朝的民族交融与隋唐统一多民族封建国家的发展',
    period: '三国—五代十国（220—979年）',
    startYear: 220,
    endYear: 979,
    coreTheme: '民族交融与制度创新',
    curriculumDimensions: ['制度变化与创新', '民族交融', '区域开发', '思想文化'],
    lessons: ['u2-l5', 'u2-l6', 'u2-l7', 'u2-l8'],
    status: 'released',
    liaoningSummary: {
      totalQuestions: 10,
      totalScore: 48,
      bigQuestions: 2,
      highFrequencyTopics: ['选官制度演变', '文化成就'],
    },
    previousUnitId: 'u1',
    nextUnitId: 'u3',
  },
  // ============ 第三单元 ============
  {
    id: 'u3',
    bookId: 'outline-upper',
    unitNo: 3,
    name: '第三单元',
    title: '辽宋夏金元多民族政权的并立与元朝统一',
    period: '辽宋夏金元（916—1368年）',
    startYear: 916,
    endYear: 1368,
    coreTheme: '民族政权并立与经济文化繁荣',
    curriculumDimensions: ['制度变化与创新', '民族交融', '区域开发', '思想文化'],
    lessons: ['u3-l9', 'u3-l10', 'u3-l11', 'u3-l12'],
    status: 'released',
    liaoningSummary: {
      totalQuestions: 6,
      totalScore: 18,
      bigQuestions: 0,
      highFrequencyTopics: ['经济与社会', '民族政权制度'],
    },
    previousUnitId: 'u2',
    nextUnitId: 'u4',
  },
  // ============ 第四单元（占位）============
  {
    id: 'u4',
    bookId: 'outline-upper',
    unitNo: 4,
    name: '第四单元',
    title: '明清中国版图的奠定与面临的挑战',
    period: '明清（1368—1840年）',
    startYear: 1368,
    endYear: 1840,
    coreTheme: '版图奠定与专制强化',
    curriculumDimensions: ['制度变化与创新', '民族交融', '区域开发', '思想文化'],
    lessons: ['u4-l13', 'u4-l14', 'u4-l15'],
    status: 'planned',
    previousUnitId: 'u3',
    nextUnitId: 'u5',
  },
  // ============ 第五单元（占位）============
  {
    id: 'u5',
    bookId: 'outline-upper',
    unitNo: 5,
    name: '第五单元',
    title: '晚清时期的内忧外患与救亡图存',
    period: '晚清（1840—1912年）',
    startYear: 1840,
    endYear: 1912,
    coreTheme: '民族危机与近代化探索',
    curriculumDimensions: ['制度变化与创新', '民族交融', '区域开发', '思想文化'],
    lessons: [],
    status: 'planned',
    previousUnitId: 'u4',
    nextUnitId: 'u6',
  },
  // ============ 第六单元（占位）============
  {
    id: 'u6',
    bookId: 'outline-upper',
    unitNo: 6,
    name: '第六单元',
    title: '中华民族的抗争与探索',
    period: '民国（1912—1949年）',
    startYear: 1912,
    endYear: 1949,
    coreTheme: '民主革命与社会变革',
    curriculumDimensions: ['制度变化与创新', '民族交融', '区域开发', '思想文化'],
    lessons: [],
    status: 'planned',
    previousUnitId: 'u5',
    nextUnitId: 'u7',
  },
  // ============ 第七单元（占位）============
  {
    id: 'u7',
    bookId: 'outline-upper',
    unitNo: 7,
    name: '第七单元',
    title: '中华人民共和国成立和社会主义革命与建设',
    period: '新中国（1949—1978年）',
    startYear: 1949,
    endYear: 1978,
    coreTheme: '社会主义建设与探索',
    curriculumDimensions: ['制度变化与创新', '民族交融', '区域开发', '思想文化'],
    lessons: [],
    status: 'planned',
    previousUnitId: 'u6',
    nextUnitId: 'u8',
  },
  // ============ 第八单元（占位）============
  {
    id: 'u8',
    bookId: 'outline-upper',
    unitNo: 8,
    name: '第八单元',
    title: '改革开放与社会主义现代化建设新时期',
    period: '改革开放（1978年至今）',
    startYear: 1978,
    endYear: 2026,
    coreTheme: '改革开放与民族复兴',
    curriculumDimensions: ['制度变化与创新', '民族交融', '区域开发', '思想文化'],
    lessons: [],
    status: 'planned',
    previousUnitId: 'u7',
    nextUnitId: 'u9',
  },
  // ============ 第九单元（占位）============
  {
    id: 'u9',
    bookId: 'outline-upper',
    unitNo: 9,
    name: '第九单元',
    title: '世界古代文明',
    period: '上古时期',
    startYear: -3500,
    endYear: 500,
    coreTheme: '世界古代文明',
    curriculumDimensions: ['制度变化与创新', '民族交融', '区域开发', '思想文化'],
    lessons: [],
    status: 'planned',
    previousUnitId: 'u8',
    nextUnitId: 'u10',
  },
  // ============ 第十单元（占位）============
  {
    id: 'u10',
    bookId: 'outline-upper',
    unitNo: 10,
    name: '第十单元',
    title: '世界近现代文明',
    period: '近代与现代',
    startYear: 1500,
    endYear: 2000,
    coreTheme: '世界近现代文明',
    curriculumDimensions: ['制度变化与创新', '民族交融', '区域开发', '思想文化'],
    lessons: [],
    status: 'planned',
    previousUnitId: 'u9',
  },
];

// 获取已发布的单元
export const releasedUnits = historyUnits.filter(unit => unit.status === 'released');

// 根据教材 ID 获取单元列表
export function getUnitsByBookId(bookId: string): HistoryUnit[] {
  return historyUnits.filter(unit => unit.bookId === bookId);
}

// 根据 ID 获取单元
export function getUnitById(unitId: string): HistoryUnit | undefined {
  return historyUnits.find(unit => unit.id === unitId);
}

// 获取相邻单元
export function getAdjacentUnits(unitId: string): { previous?: HistoryUnit; next?: HistoryUnit } {
  const unit = getUnitById(unitId);
  if (!unit) return {};
  
  return {
    previous: unit.previousUnitId ? getUnitById(unit.previousUnitId) : undefined,
    next: unit.nextUnitId ? getUnitById(unit.nextUnitId) : undefined,
  };
}
