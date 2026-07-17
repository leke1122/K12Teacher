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
// 历史教材 - 统编版中外历史纲要（上）
// 教材：普通高中教科书·历史·必修·中外历史纲要（上）
// 注：页码需要根据实际PDF文件调整
// ============================================================
const HISTORY_B1_SECTIONS: Record<string, PageRange2> = {
  // 第一单元 从中华文明起源到秦汉统一
  '第1课': { startPage: 1, endPage: 8 },
  '第2课': { startPage: 9, endPage: 16 },
  '第3课': { startPage: 17, endPage: 24 },
  '第4课': { startPage: 25, endPage: 32 },
  // 第二单元 三国至隋唐
  '第5课': { startPage: 33, endPage: 40 },
  '第6课': { startPage: 41, endPage: 48 },
  '第7课': { startPage: 49, endPage: 56 },
  '第8课': { startPage: 57, endPage: 64 },
};

// ============================================================
// 章节ID标准化（处理各种格式的章节ID）
// ============================================================

/**
 * 数学 B 版必修第一册的 chapterId → 小节顺序映射
 * 用于把“第X课”准确映射到当前章节下的小节编号
 */
const CHAPTER_SECTIONS: Record<string, string[]> = {
  '1': ['1.1.1', '1.1.2', '1.1.3', '1.2.1', '1.2.2', '1.2.3'],
  '2': ['2.1.1', '2.1.2', '2.1.3', '2.2.1', '2.2.2', '2.2.3', '2.2.4'],
  '3': ['3.1.1', '3.1.2', '3.1.3', '3.2', '3.3', '3.4'],
};

/**
 * 将各种格式的章节ID标准化为 "X.Y.Z" 格式
 * 例如：
 * - "第1课" + chapterId="2" → "2.1.1"
 * - "第1课" + chapterId="2" + lessonNum=2 → "2.1.2"
 * - "第1课" → "1.1.1"（无 chapterId 时的回退）
 * - "第1.1节" → "1.1"
 * - "1.1.1" → "1.1.1"
 * - "1.1" → "1.1"
 */
export function normalizeSectionId(sectionId: string, chapterId?: string): string {
  if (!sectionId) return '';

  const cleaned = sectionId.trim();
  console.log('[normalizeSectionId] 输入:', cleaned, 'chapterId:', chapterId);

  // 清理重复的"第X课_第X课 标题"格式（提取第一个课号）
  const dedupMatch = cleaned.match(/^第(\d+)课_/);
  if (dedupMatch) {
    const result = `第${dedupMatch[1]}课`; // 只保留 "第X课"
    console.log('[normalizeSectionId] 去除重复课号:', cleaned, '→', result);
    return result;
  }

  // 如果已经是 X.Y.Z 或 X.Y 格式，直接返回
  if (/^\d+\.\d+(\.\d+)?$/.test(cleaned)) {
    console.log('[normalizeSectionId] 已是标准格式:', cleaned);
    return cleaned;
  }

  // 第X课 → 优先结合 chapterId 映射到该章下第 X 个小节
  const lessonMatch = cleaned.match(/^第(\d+)课$/);
  if (lessonMatch) {
    const lessonNum = parseInt(lessonMatch[1], 10);

    if (chapterId && CHAPTER_SECTIONS[chapterId]) {
      const sections = CHAPTER_SECTIONS[chapterId];
      const idx = lessonNum - 1;
      if (idx >= 0 && idx < sections.length) {
        const result = sections[idx];
        console.log(`[normalizeSectionId] 第${lessonNum}课(章节感知): "${cleaned}" → "${result}"`);
        return result;
      }
      console.log(`[normalizeSectionId] 第${lessonNum}课超出当前章节小节数，使用最后一个小节`);
      return sections[sections.length - 1];
    }

    // 回退：基于全局 orderedSections 的顺序映射
    const mathOrderedSections = SUBJECT_MAPPINGS.math?.orderedSections || [];
    if (mathOrderedSections.length > 0 && lessonNum <= mathOrderedSections.length) {
      const mapped = mathOrderedSections[lessonNum - 1];
      console.log(`[normalizeSectionId] 第X课全局回退: "${cleaned}" → "${mapped}"`);
      return mapped;
    }

    const num = lessonMatch[1];
    console.log(`[normalizeSectionId] 第X课无映射，使用默认: "${cleaned}" → "${num}.1.1"`);
    return `${num}.1.1`;
  }
  
  // 第X.Y节 → X.Y
  const sectionMatch = cleaned.match(/^第([\d.]+)节?$/);
  if (sectionMatch) {
    console.log('[normalizeSectionId] 第X.Y节格式:', sectionMatch[1]);
    return sectionMatch[1];
  }
  
  // 第X章 → X
  const chapterMatch = cleaned.match(/^第(\d+)章$/);
  if (chapterMatch) {
    console.log('[normalizeSectionId] 第X章格式:', chapterMatch[1]);
    return chapterMatch[1];
  }
  
  // 如果都不匹配，返回原始值
  console.log('[normalizeSectionId] 无匹配，返回原始值:', cleaned);
  return cleaned;
}

// ============================================================
// 全局映射注册表
// ============================================================
export const SUBJECT_MAPPINGS: Record<string, SubjectMapping> = {
  // 高中数学 B 版必修第一册（兼容 'math' 和 'math_b1' 两个 key）
  math: {
    bookName: '普通高中教科书·数学（B版）必修 第一册',
    sections: MATH_B1_SECTIONS,
    orderedSections: [
      '1.1.1','1.1.2','1.1.3','1.2.1','1.2.2','1.2.3',
      '2.1.1','2.1.2','2.1.3','2.2.1','2.2.2','2.2.3','2.2.4',
      '3.1.1','3.1.2','3.1.3','3.2','3.3','3.4',
    ],
  },
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
  // 历史 - 统编版中外历史纲要（上）
  history_b1: {
    bookName: '普通高中教科书·历史·必修·中外历史纲要（上）',
    sections: HISTORY_B1_SECTIONS,
    orderedSections: Object.keys(HISTORY_B1_SECTIONS),
  },
  // 更多学科和教材可在此添加：
  // physics_b1: { bookName: '...', sections: {...}, orderedSections: [...] },
  // chemistry_b1: { bookName: '...', sections: {...}, orderedSections: [...] },

  // ============================================================
  // 高中思想政治 必修1 中国特色社会主义
  // 教材PDF对应页码（用户实测标注）
  // ============================================================
  politics_compulsory_1: {
    bookName: '普通高中教科书·思想政治（必修1） 中国特色社会主义',
    sections: {
      // 第一课 原始社会的解体和阶级社会的演进
      '1.1': { startPage: 28, endPage: 36 },
      '1.2': { startPage: 37, endPage: 44 },
      // 第二课 科学社会主义的理论与实践
      '2.1': { startPage: 45, endPage: 52 },
      '2.2': { startPage: 53, endPage: 60 },
      '2.3': { startPage: 61, endPage: 68 },
    },
    orderedSections: ['1.1', '1.2', '2.1', '2.2', '2.3'],
  },
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
 * @param subjectId 学科标识（如 "math", "math_b1", "physics_b1"）
 * @param sectionId 小节编号（如 "1.1.1"）
 */
export function getSectionPageRange(
  subjectId: string,
  sectionId: string
): PageRange2 | null {
  // 尝试直接匹配
  let mapping = SUBJECT_MAPPINGS[subjectId];
  
  // 如果没有匹配，尝试添加后缀
  if (!mapping && !subjectId.includes('_')) {
    mapping = SUBJECT_MAPPINGS[`${subjectId}_b1`];
  }
  
  // 如果还是没有匹配，遍历查找
  if (!mapping) {
    for (const key of Object.keys(SUBJECT_MAPPINGS)) {
      if (key.startsWith(subjectId)) {
        mapping = SUBJECT_MAPPINGS[key];
        break;
      }
    }
  }
  
  if (!mapping) {
    console.log(`[getSectionPageRange] 未找到学科映射: subjectId="${subjectId}", sectionId="${sectionId}"`);
    return null;
  }
  
  const result = mapping.sections[sectionId] ?? null;
  console.log(`[getSectionPageRange] 找到: subjectId="${subjectId}", sectionId="${sectionId}", range=`, result);
  return result;
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
