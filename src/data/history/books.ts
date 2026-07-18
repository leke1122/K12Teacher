// 历史教材列表 - 支持多教材扩展
import type { HistoryBook } from '@/types/history';

export const historyBooks: HistoryBook[] = [
  {
    id: 'outline-upper',
    name: '中外历史纲要上册',
    shortName: '纲要上',
    publisher: '人民教育出版社统编版（2019）',
    grade: '高一',
    unitCount: 10,
    lessonCount: 33,
    status: 'released',
    units: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10'],
    color: '#2563eb',
    order: 1,
  },
  {
    id: 'outline-lower',
    name: '中外历史纲要下册',
    shortName: '纲要下',
    publisher: '人民教育出版社统编版（2019）',
    grade: '高一',
    unitCount: 10,
    lessonCount: 23,
    status: 'planned',
    units: [],
    color: '#0891b2',
    order: 2,
  },
  {
    id: 'elective-1',
    name: '选择性必修1 国家制度与社会治理',
    shortName: '选必1',
    publisher: '人民教育出版社统编版（2019）',
    grade: '高二',
    unitCount: 4,
    lessonCount: 18,
    status: 'planned',
    units: [],
    color: '#7c3aed',
    order: 3,
  },
  {
    id: 'elective-2',
    name: '选择性必修2 经济与社会生活',
    shortName: '选必2',
    publisher: '人民教育出版社统编版（2019）',
    grade: '高二',
    unitCount: 4,
    lessonCount: 16,
    status: 'planned',
    units: [],
    color: '#059669',
    order: 4,
  },
  {
    id: 'elective-3',
    name: '选择性必修3 文化交流与传播',
    shortName: '选必3',
    publisher: '人民教育出版社统编版（2019）',
    grade: '高二',
    unitCount: 4,
    lessonCount: 16,
    status: 'planned',
    units: [],
    color: '#dc2626',
    order: 5,
  },
];

// 获取已发布的教材
export const releasedBooks = historyBooks.filter(book => book.status === 'released');

// 根据 ID 获取教材
export function getBookById(bookId: string): HistoryBook | undefined {
  return historyBooks.find(book => book.id === bookId);
}
