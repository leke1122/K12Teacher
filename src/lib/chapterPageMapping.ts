/**
 * 全局章节页码映射注册表
 * 适用所有学科、所有教材、所有章节
 * 结构：subjectId → chapterId → sectionId → { startPage, endPage }
 */

/** 页码范围 */
export interface PageRange2 {
  startPage: number;
  endPage: number;
}

/** 学科映射表 */
export interface SubjectMapping {
  /** 教材名称 */
  bookName: string;
  /** 章节映射：sectionId → 页码范围 */
  sections: Record<string, PageRange2>;
  /** 章节顺序列表（用于 findNextSectionId） */
  orderedSections: string[];
}

// ============================================================
// 高中数学 B 版必修第一册
// ============================================================
const MATH_B1_SECTIONS: Record<string, PageRange2> = {
  '1.1.1': { startPage: 10, endPage: 16 },
  '1.1.2': { startPage: 17, endPage: 21 },
  '1.1.3': { startPage: 22, endPage: 29 },
  '1.2.1': { startPage: 30, endPage: 35 },
  '1.2.2': { startPage: 36, endPage: 38 },
  '1.2.3': { startPage: 39, endPage: 45 },
  '2.1.1': { startPage: 52, endPage: 56 },
  '2.1.2': { startPage: 57, endPage: 60 },
  '2.1.3': { startPage: 61, endPage: 66 },
  '2.2.1': { startPage: 68, endPage: 73 },
  '2.2.2': { startPage: 74, endPage: 77 },
  '2.2.3': { startPage: 78, endPage: 83 },
  '2.2.4': { startPage: 84, endPage: 88 },
  '3.1.1': { startPage: 96, endPage: 105 },
  '3.1.2': { startPage: 106, endPage: 115 },
  '3.1.3': { startPage: 116, endPage: 124 },
  '3.2':    { startPage: 125, endPage: 134 },
  '3.3':    { startPage: 135, endPage: 138 },
  '3.4':    { startPage: 139, endPage: 144 },
};

// ============================================================
// 高中语文统编版必修上册（文言文重点篇目）
// 辽宁高考考点：实词、虚词、句式、翻译、文化常识
// ============================================================
const CHINESE_B1_CLASSICAL: Record<string, PageRange2> = {
  // 第一单元 中华文明之光
  '劝学':            { startPage: 20, endPage: 25 },
  '师说':            { startPage: 26, endPage: 31 },
  // 第六单元 英雄悲歌
  '屈原列传':        { startPage: 120, endPage: 128 },
  '苏武传':          { startPage: 129, endPage: 138 },
  '过秦论':          { startPage: 139, endPage: 147 },
  '五代史伶官传序':  { startPage: 148, endPage: 153 },
  // 第七单元 自然与审美
  '种树郭橐驼传':    { startPage: 160, endPage: 166 },
  '登泰山记':        { startPage: 167, endPage: 172 },
};

const CHINESE_B1_ORDERED_CLASSICAL: string[] = [
  '劝学', '师说', '屈原列传', '苏武传', '过秦论', '五代史伶官传序', '种树郭橐驼传', '登泰山记',
];

// ============================================================
// 全局映射注册表
// ============================================================
export const SUBJECT_MAPPINGS: Record<string, SubjectMapping> = {
  // 高中数学 B 版必修第一册
  math_b1: {
    bookName: '普通高中教科书·数学（B版）必修 第一册',
    sections: MATH_B1_SECTIONS,
    orderedSections: [
      '1.1.1','1.1.2','1.1.3','1.2.1','1.2.2','1.2.3',
      '2.1.1','2.1.2','2.1.3','2.2.1','2.2.2','2.2.3','2.2.4',
      '3.1.1','3.1.2','3.1.3','3.2','3.3','3.4',
    ],
  },
  // 高中语文统编版必修上册（文言文重点篇目）
  chinese_b1: {
    bookName: '普通高中教科书·语文（必修上册）',
    sections: CHINESE_B1_CLASSICAL,
    orderedSections: CHINESE_B1_ORDERED_CLASSICAL,
  },
  // 更多学科和教材可在此添加：
  // physics_b1: { bookName: '...', sections: {...}, orderedSections: [...] },
  // chemistry_b1: { bookName: '...', sections: {...}, orderedSections: [...] },
};

// ============================================================
// 兼容旧版：保留 BANTU_MATH_B1 以便存量代码不报错
// ============================================================
export const BANTU_MATH_B1 = MATH_B1_SECTIONS;

export const BANTU_MATH_B1_ORDERED: string[] = SUBJECT_MAPPINGS.math_b1.orderedSections;

/** 兼容旧接口 */
export function getBantuMathB1Range(sectionId: string): PageRange2 | null {
  return MATH_B1_SECTIONS[sectionId] ?? null;
}

// ============================================================
// 统一查询接口（核心）
// ============================================================

/**
 * 根据 subjectId + sectionId 查找页码范围
 * @param subjectId 学科标识（如 "math_b1", "physics_b1"）
 * @param sectionId 小节编号（如 "1.1.1"）
 */
export function getSectionPageRange(
  subjectId: string,
  sectionId: string
): PageRange2 | null {
  const mapping = SUBJECT_MAPPINGS[subjectId];
  if (!mapping) return null;
  return mapping.sections[sectionId] ?? null;
}

/**
 * 根据 subjectId + sectionId 获取下一个 sectionId
 */
export function getNextSectionId(subjectId: string, sectionId: string): string | null {
  const mapping = SUBJECT_MAPPINGS[subjectId];
  if (!mapping) return null;
  const idx = mapping.orderedSections.indexOf(sectionId);
  return idx >= 0 && idx < mapping.orderedSections.length - 1
    ? mapping.orderedSections[idx + 1]
    : null;
}

/**
 * 获取指定学科的章节顺序列表
 */
export function getOrderedSections(subjectId: string): string[] {
  return SUBJECT_MAPPINGS[subjectId]?.orderedSections ?? [];
}

// ============================================================
// 旧版 normalizeChapters 保留（内部使用）
// ============================================================

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

export function normalizeChapters(input: unknown): Chapter[] {
  if (!input) return [];
  const raw = input as Record<string, unknown>;
  const chapters: unknown[] = Array.isArray(raw.chapters) ? raw.chapters
    : Array.isArray(input) ? input : [];

  const chapterTitles: Record<string, string> = {
    '1': '集合与常用逻辑用语',
    '2': '相等关系与不等关系',
    '3': '函数',
  };

  return (chapters as Record<string, unknown>[]).map((ch: Record<string, unknown>) => {
    const rawPages = ch.pages as Record<string, unknown> | undefined;
    return {
      chapterIndex: Number(ch.chapterIndex) || 0,
      chapterTitle: String(ch.chapterTitle || chapterTitles[String(ch.chapterIndex)] || ''),
      pages: {
        type: (rawPages?.type as 'printed' | 'file') || 'file',
        start: Number(rawPages?.start ?? rawPages?.startPage ?? ch.startPage ?? 1),
        end: Number(rawPages?.end ?? rawPages?.endPage ?? ch.endPage ?? 999),
        ...(rawPages?.fileStart != null ? { fileStart: Number(rawPages.fileStart) } : {}),
        ...(rawPages?.fileEnd != null ? { fileEnd: Number(rawPages.fileEnd) } : {}),
      },
      sections: ((ch.sections as Record<string, unknown>[]) || []).map((s: Record<string, unknown>) => {
        const sPages = s.pages as Record<string, unknown> | undefined;
        return {
          sectionIndex: String(s.sectionIndex || '').trim(),
          sectionTitle: String(s.sectionTitle || s.sectionIndex || '').trim(),
          pages: {
            type: (sPages?.type as 'printed' | 'file') || 'file',
            start: Number(sPages?.start ?? sPages?.startPage ?? s.startPage ?? 1),
            end: Number(sPages?.end ?? sPages?.endPage ?? s.endPage ?? 999),
            ...(sPages?.fileStart != null ? { fileStart: Number(sPages.fileStart) } : {}),
            ...(sPages?.fileEnd != null ? { fileEnd: Number(sPages.fileEnd) } : {}),
          },
          subSections: ((s.subSections as Record<string, unknown>[]) || []).map((sub: Record<string, unknown>) => {
            const subPages = sub.pages as Record<string, unknown> | undefined;
            return {
              title: String(sub.title || '').trim(),
              pages: {
                type: (subPages?.type as 'printed' | 'file') || 'file',
                start: Number(subPages?.start ?? subPages?.startPage ?? sub.startPage ?? 1),
                end: Number(subPages?.end ?? subPages?.endPage ?? sub.endPage ?? 999),
              },
            };
          }),
        };
      }),
    } as Chapter;
  });
}
