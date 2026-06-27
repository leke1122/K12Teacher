/**
 * 语文语言文字运用训练进度管理
 */

import {
  ChineseLanguageProgress,
  LanguagePractice,
  LanguagePracticeRecord,
  DEFAULT_PROGRESS,
  QuestionType,
} from './chineseLanguage';

const PROGRESS_KEY = 'chinese_language_progress';
const RECORDS_KEY = 'chinese_language_records';

export function getProgress(): ChineseLanguageProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return { ...DEFAULT_PROGRESS, ...(JSON.parse(raw) as ChineseLanguageProgress) };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: ChineseLanguageProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function updateProgressAfterPractice(record: LanguagePracticeRecord): ChineseLanguageProgress {
  const current = getProgress();
  const next: ChineseLanguageProgress = {
    totalPractices: current.totalPractices + 1,
    totalQuestions: current.totalQuestions + record.answers.length,
    correctCount: current.correctCount + Math.round(record.score * record.answers.length),
    accuracy: 0,
    typeStats: { ...current.typeStats },
    lastPracticeAt: record.createdAt,
  };

  (Object.keys(next.typeStats) as QuestionType[]).forEach((type) => {
    next.typeStats[type] = { ...current.typeStats[type] };
  });

  record.answers.forEach((answer) => {
    const practice = {} as LanguagePractice;
    const question = practice.questions?.find((q) => q.id === answer.questionId);
    const type = question?.type as QuestionType | undefined;
    if (type && next.typeStats[type]) {
      next.typeStats[type].total += 1;
      if (answer.answer === question?.correctAnswer) {
        next.typeStats[type].correct += 1;
      }
    }
  });

  next.accuracy = next.totalQuestions > 0 ? next.correctCount / next.totalQuestions : 0;
  saveProgress(next);
  return next;
}

export function getRecords(): LanguagePracticeRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    return raw ? (JSON.parse(raw) as LanguagePracticeRecord[]) : [];
  } catch {
    return [];
  }
}

export function addRecord(record: LanguagePracticeRecord): void {
  const records = getRecords();
  records.unshift(record);
  if (records.length > 200) records.length = 200;
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}
