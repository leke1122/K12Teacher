/**
 * 语文语言文字运用训练类型定义
 */

export type QuestionType = 'idiom' | 'sentence' | 'fill' | 'rhetoric';
export type Difficulty = '简单' | '中等' | '困难';
export type QuestionSource = 'AI生成' | '高考真题' | '模拟题';

export interface LanguageQuestion {
  id: number;
  type: QuestionType;
  question: string;
  context: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface LanguagePractice {
  id: string;
  passage: string;
  source: string;
  difficulty: Difficulty;
  questions: LanguageQuestion[];
  createdAt: string;
}

export interface LanguagePracticeRecord {
  id: string;
  practiceId: string;
  answers: { questionId: number; answer: string }[];
  score: number;
  wrongQuestions: number[];
  createdAt: string;
}

export interface ChineseLanguageProgress {
  totalPractices: number;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  typeStats: Record<QuestionType, { total: number; correct: number }>;
  lastPracticeAt?: string;
}

export const DEFAULT_PROGRESS: ChineseLanguageProgress = {
  totalPractices: 0,
  totalQuestions: 0,
  correctCount: 0,
  accuracy: 0,
  typeStats: {
    idiom: { total: 0, correct: 0 },
    sentence: { total: 0, correct: 0 },
    fill: { total: 0, correct: 0 },
    rhetoric: { total: 0, correct: 0 },
  },
  lastPracticeAt: undefined,
};
