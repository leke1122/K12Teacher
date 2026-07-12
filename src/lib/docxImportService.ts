/**
 * 历史 docx 导入服务
 *
 * 职责：
 * - 接收 docx 纯文本
 * - 复用并增强 docxParser 的解析能力
 * - 输出结构化知识点，供 API / 前端统一消费
 */

import { parseDocxTextToKnowledge, type DocxParseResult } from '@/lib/docxParser';

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

export interface Lesson {
  index: number;
  title: string;
  pageRange?: string;
  concepts: string[];
  content: string;
}

export interface ImportResult {
  unitId: string;
  unitTitle: string;
  pageRange: string;
  concepts: Concept[];
  timelineEvents: TimelineEvent[];
  causalLinks: CausalLink[];
  examFocus: ExamFocus[];
  lessons: Lesson[];
  summary: string;
  rawImportDate: string;
  source: 'docx_import';
}

export async function parseDocxText(docxText: string, unitId: string): Promise<ImportResult> {
  const parsed = parseDocxTextToKnowledge(docxText);

  return {
    unitId,
    unitTitle: parsed.unitTitle,
    pageRange: parsed.pageRange,
    concepts: parsed.concepts as Concept[],
    timelineEvents: parsed.timelineEvents as TimelineEvent[],
    causalLinks: parsed.causalLinks as CausalLink[],
    examFocus: parsed.examFocus as ExamFocus[],
    lessons: parsed.lessons as Lesson[],
    summary: parsed.summary,
    rawImportDate: new Date().toISOString(),
    source: 'docx_import',
  };
}
