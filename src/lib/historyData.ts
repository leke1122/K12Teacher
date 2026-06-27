// 历史学科数据工具 - 客户端版本
// 仅包含章节配置常量，不依赖 fs/serverStorage

// 历史章节配置
export const HISTORY_CHAPTERS = {
  'modern-china': { title: '近代中国', subtitle: '1840-1949' },
  'modern-world': { title: '世界近现代史', subtitle: '1500-1945' },
  'ancient-china': { title: '中国古代史', subtitle: '上古-1840' },
  'contemporary': { title: '当代世界', subtitle: '1945至今' },
  '古代': { title: '中国古代史', subtitle: '上古-1840' },
  '近代': { title: '中国近代史', subtitle: '1840-1949' },
  '现代': { title: '中国现代史', subtitle: '1949至今' },
  '世界史': { title: '世界历史', subtitle: '1500至今' },
} as const;

export type HistoryChapterId = keyof typeof HISTORY_CHAPTERS;

// 获取章节标题
export function getChapterTitle(chapterId: string): string {
  return HISTORY_CHAPTERS[chapterId as HistoryChapterId]?.title || chapterId;
}
