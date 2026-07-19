/**
 * 历史单元数据 - 仅包含中国历史（用于Supabase fallback）
 * 当Supabase未配置时使用此数据
 */

export interface TimelineEvent {
  id: string;
  book: '上册' | '下册';
  unit: string;
  lesson?: string;
  year: number;
  yearEnd?: number;
  title: string;
  dynasty?: string;
  location?: string;
  figures?: string[];
  summary: string;
  causes?: string;
  effects?: string;
  significance?: string;
  examPoints?: string[];
  difficulty?: '高频' | '中频' | '低频';
}

// 中国古代史时间轴数据（仅中国历史）
export const historyTimelineData: TimelineEvent[] = [
  // 第一单元
  {
    id: 'stone-age',
    book: '上册',
    unit: '第一单元 从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    year: -10000,
    yearEnd: -2070,
    title: '旧石器时代与新石器时代',
    summary: '人类从打制石器进入磨制石器时代，原始农业和畜牧业产生，氏族公社逐渐形成。',
    effects: '人类开始定居生活，原始宗教和艺术出现。',
    examPoints: ['原始农业', '氏族公社', '仰韶文化', '龙山文化'],
    difficulty: '低频',
  },
  {
    id: 'xia-dynasty',
    book: '上册',
    unit: '第一单元 从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    year: -2070,
    yearEnd: -1600,
    title: '夏朝建立',
    dynasty: '夏',
    location: '黄河中下游地区',
    figures: ['大禹', '启'],
    summary: '中国历史上第一个王朝，建立了以王位世袭制为核心的奴隶制国家机器。',
    causes: '原始社会末期生产力发展，私有制和阶级产生。',
    effects: '开创了"家天下"的王位世袭制，中国进入奴隶社会。',
    significance: '早期国家形成的重要标志',
    examPoints: ['王位世袭制', '夏商周更替', '青铜文明'],
    difficulty: '高频',
  },
];

// 按单元分组
export const unitGroups = historyTimelineData.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
  if (!acc[event.unit]) {
    acc[event.unit] = [];
  }
  acc[event.unit].push(event);
  return acc;
}, {});

// 高频考点
export const highFrequencyEvents = historyTimelineData.filter(e => e.difficulty === '高频');

// 搜索
export function searchEvents(keyword: string): TimelineEvent[] {
  const lower = keyword.toLowerCase();
  return historyTimelineData.filter(e =>
    e.title.toLowerCase().includes(lower) ||
    e.summary.toLowerCase().includes(lower) ||
    e.unit.toLowerCase().includes(lower) ||
    e.examPoints?.some(p => p.toLowerCase().includes(lower)) ||
    e.figures?.some(f => f.toLowerCase().includes(lower))
  );
}

// 按年代范围
export function getEventsByYearRange(start: number, end: number): TimelineEvent[] {
  return historyTimelineData.filter(e =>
    (e.year >= start && e.year <= end) ||
    (e.yearEnd && e.yearEnd >= start && e.yearEnd <= end)
  );
}
