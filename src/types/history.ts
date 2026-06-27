// 历史学习中心类型定义

// ==================== 时间轴 ====================

export type EventCategory = 'politics' | 'economy' | 'culture' | 'war' | 'technology' | 'society';

export interface HistoryEvent {
  id: string;
  chapterId: string;
  title: string;
  year: number;
  yearEnd?: number;
  month?: number;
  dynasty?: string;
  location?: string;
  figures: string[];
  causes: string;
  effects: string;
  significance?: string;
  summary: string;
  relatedIds?: string[];
  // 扩展字段
  category?: EventCategory;
  importance?: 1 | 2 | 3;
  description?: string;
  color?: string;
  // 中外对比
  isWorldEvent?: boolean;
}

// 分类配置
export const EVENT_CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string; icon: string }> = {
  politics: { label: '政治', color: '#ef4444', icon: '🏛️' },
  economy: { label: '经济', color: '#22c55e', icon: '💰' },
  culture: { label: '文化', color: '#8b5cf6', icon: '📚' },
  war: { label: '战争', color: '#f97316', icon: '⚔️' },
  technology: { label: '科技', color: '#06b6d4', icon: '🔬' },
  society: { label: '社会', color: '#ec4899', icon: '👥' },
};

// 重要程度配置
export const IMPORTANCE_CONFIG: Record<1 | 2 | 3, { label: string; size: number }> = {
  1: { label: '一般', size: 16 },
  2: { label: '重要', size: 24 },
  3: { label: '最重要', size: 32 },
};

// ==================== 因果链 ====================

export interface CausalChainNode {
  title: string;
  description: string;
  source?: string;
}

export interface CausalChain {
  eventName: string;
  chapterId: string;
  farCauses: CausalChainNode[];
  nearCauses: CausalChainNode[];
  event: string;
  directEffects: CausalChainNode[];
  deepEffects: CausalChainNode[];
}

// ==================== 历史卡牌 ====================

export type HistoryCardType = 'event' | 'person' | 'system' | 'treaty';

export interface HistoryCardItem {
  id: string;
  type: HistoryCardType;
  title: string;
  front: string;
  back: string;
  chapterId: string;
}

// ==================== 历史材料分析 ====================

export type AnalysisQuestionType = 'event' | 'view' | 'argument' | 'conclusion';

export interface AnalysisQuestion {
  id: number;
  type: AnalysisQuestionType;
  question: string;
  expectedKeywords: string[];
  modelAnswer: string;
  hints: string[];
}

export interface AnalysisSource {
  id: string;
  title: string;
  material: string;
  source: string;
  questions: AnalysisQuestion[];
  difficulty: '简单' | '中等' | '困难';
  chapterId: string;
  year?: string;
}

export interface AnalysisFeedback {
  isCorrect: boolean;
  isPartial: boolean;
  score: number;
  correctParts: string[];
  missingParts: string[];
  guidance: string;
  encouragement: string;
}

export interface AnalysisAttempt {
  id: string;
  sourceId: string;
  userId: string;
  questionId: number;
  answers: string[];
  correct: boolean;
  score: number;
  feedbacks: string[];
  attempts: number;
  completedAt: string;
}
