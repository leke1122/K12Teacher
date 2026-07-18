// 高中历史学习平台 - 类型定义
// 支持多教材（纲要上/下、选必1-3）和多单元扩展

// ============ 教材相关 ============

export type BookStatus = 'released' | 'planned';

export interface HistoryBook {
  id: string;
  name: string;
  shortName: string;
  publisher: string;
  grade: string;
  unitCount: number;
  lessonCount: number;
  status: BookStatus;
  units: string[];
  color: string;
  order: number;
}

// ============ 事件分类配置 ============
export const EVENT_CATEGORY_CONFIG = {
  政治: { color: '#2563eb', label: '政治' },
  经济: { color: '#16a34a', label: '经济' },
  文化: { color: '#9333ea', label: '文化' },
  战争: { color: '#dc2626', label: '战争' },
  科技: { color: '#0891b2', label: '科技' },
  社会: { color: '#64748b', label: '社会' },
} as const;

export type EventCategory = keyof typeof EVENT_CATEGORY_CONFIG;

// 历史事件类型别名（兼容旧代码）
export type HistoryEvent = TimelineEvent;

// ============ 材料分析相关（保留旧功能）============
export interface AnalysisSource {
  id: string;
  title: string;
  material: string;
  question: string;
  difficulty: '简单' | '中等' | '困难';
  knowledgePoints: string[];
  hint?: string;
  answer?: string;
  analysis?: string;
}

// ============ 单元相关 ============

export type UnitStatus = 'released' | 'planned';

export interface LiaoningSummary {
  totalQuestions: number;
  totalScore: number;
  bigQuestions: number;
  highFrequencyTopics: string[];
}

// ============ 材料分析相关（保留旧功能）============
export type AnalysisQuestionType = '选择' | '填空' | '简答' | '论述';

export interface AnalysisQuestion {
  id: string;
  type: AnalysisQuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  analysis?: string;
}

export interface HistoryUnit {
  id: string;
  bookId: string;
  unitNo: number;
  name: string;
  title: string;
  period: string;
  startYear?: number;
  endYear?: number;
  coreTheme: string;
  curriculumDimensions: string[];
  lessons: string[];
  status: UnitStatus;
  liaoningSummary?: LiaoningSummary;
  previousUnitId?: string;
  nextUnitId?: string;
}

// ============ 课标四维度 ============

export type CurriculumDimension = 
  | '制度变化与创新' 
  | '民族交融' 
  | '区域开发' 
  | '思想文化';

export const CURRICULUM_DIMENSIONS: CurriculumDimension[] = [
  '制度变化与创新',
  '民族交融',
  '区域开发',
  '思想文化'
];

// ============ 考频分级 ============

export type ExamFrequency = '★★★' | '★★☆' | '★☆☆';

// ============ 时间轴事件（升级）============

export interface LiaoningExamRef {
  year: number;
  paperSet: '辽宁' | '辽吉黑' | '黑吉辽蒙';
  questionNo: string;
  questionType: '选择' | '论述' | '材料';
  score: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  year: string;
  dynasty: string;
  category: EventCategory;
  summary: string;
  // 以下字段全部可选，兼容旧数据
  importance?: 1 | 2 | 3 | 4 | 5;
  impact?: string;
  impactPositive?: string;
  impactNegative?: string;
  keyPeople?: string[];
  examFrequency?: ExamFrequency;
  unitId?: string;
  lessonId?: string;
  curriculumDimension?: CurriculumDimension;
  relatedExams?: LiaoningExamRef[];
  relatedComparisons?: string[];
  relatedConfusions?: string[];
  isLiaoningLocal?: boolean;
  liaoningNote?: string;
}

// ============ 历史卡牌（升级）============

export type CardType = 'event' | 'person' | 'system' | 'treaty' | 'concept' | 'culture';
export type CardMastery = 'new' | 'learning' | 'familiar' | 'mastered';

export interface HistoryCardItem {
  id: string;
  type: CardType;
  front: {
    title: string;
    subtitle: string;
    year: string;
    dynasty: string;
    examHint?: string;
  };
  back: {
    content: string;
    keyPoints: string[];
    commonMistake?: string;
    compareWith?: string[];
  };
  examFrequency: ExamFrequency;
  mastery: CardMastery;
  unitId: string;
  lessonId?: string;
  lastReview?: string;
  reviewCount: number;
  nextReview?: string;
}

// ============ 因果链（升级）============

export type CausalStage = 'remote-cause' | 'proximate-cause' | 'event' | 'direct-impact' | 'deep-impact';
export type ImpactType = 'positive' | 'negative' | 'mixed';
export type ChainType = 'event' | 'system-evolution' | 'decline';
export type VisualizationType = 'linear' | 'branch' | 'network';

export interface CausalChainNode {
  title: string;
  description: string;
  level?: number;
  stage: CausalStage;
  impactType?: ImpactType;
  relatedEvents?: string[];
  relatedExams?: string[];
}

export interface CausalChain {
  id: string;
  title: string;
  unitId: string;
  centralEvent: string;
  nodes: CausalChainNode[];
  chainType: ChainType;
  visualization: VisualizationType;
}

// ============ 对比表 ============

export type ComparisonType = 'system' | 'person' | 'event' | 'period';
export type UserStatus = 'new' | 'learned' | 'mastered';

export interface ComparisonEntity {
  name: string;
  dynasty: string;
  attributes: Record<string, string>;
}

export interface ComparisonTable {
  id: string;
  title: string;
  unitId: string;
  bookId?: string;
  type: ComparisonType;
  curriculumDimension: CurriculumDimension;
  leftEntity: ComparisonEntity;
  rightEntity: ComparisonEntity;
  dimensions: string[];
  similarities: string[];
  differences: string[];
  examFrequency: ExamFrequency;
  relatedExams?: string[];
  userStatus: UserStatus;
}

// ============ 易混辨析 ============

export type ConfusionStatus = 'new' | 'mastered' | 'still-confused';

export interface ConfusionPair {
  id: string;
  unitId: string;
  curriculumDimension: CurriculumDimension;
  termA: string;
  termB: string;
  termB2?: string; // 可选的第三个易混词
  distinction: string;
  commonTrap: string;
  relatedExams?: string[];
  userStatus: ConfusionStatus;
}

// ============ 辽宁真题 ============

export type PaperSet = '辽宁' | '辽吉黑' | '黑吉辽蒙';
export type QuestionType = '选择' | '论述' | '材料';
export type MaterialType = '墓志' | '诏令' | '方志' | '诗词' | '数据表';

export interface LiaoningExam {
  id: string;
  year: number;
  paperSet: PaperSet;
  questionNo: string;
  questionType: QuestionType;
  score: number;
  unitId: string;
  bookId?: string;
  lesson: string;
  knowledgePoint: string;
  examFrequency: ExamFrequency;
  question: string;
  options?: string[];
  answer: string;
  analysis: string;
  materialType?: MaterialType;
}

// ============ 阶段特征口诀 ============

export type MnemonicMastery = 'new' | 'read' | 'memorized';

export interface MnemonicFormula {
  id: string;
  unitId: string;
  period: string;
  formula: string;
  explanation: string;
  relatedEvents: string[];
  relatedKnowledgePoints: string[];
  userMastery: MnemonicMastery;
}

// ============ 论述大题 ============

export type SampleLevel = '基础' | '合格' | '优秀';

export interface ScoringDimension {
  dimension: string;
  points: number;
  requirements: string;
}

export interface SampleAnswer {
  level: SampleLevel;
  content: string;
  score: number;
  commentary: string;
}

export interface EssayQuestion {
  id: string;
  unitId: string;
  knowledgePoint: string;
  examFrequency: ExamFrequency;
  question: string;
  material?: string;
  scoringCriteria: ScoringDimension[];
  sampleAnswers: SampleAnswer[];
  template: string;
}

// ============ 制度演变 ============

export type SystemType = '选官制度' | '地方行政' | '赋税制度' | '中央官制';

export interface EvolutionNode {
  dynasty: string;
  systemName: string;
  background: string;
  content: string;
  impact: string;
  year?: string;
}

export interface EvolutionChain {
  id: string;
  systemType: SystemType;
  title: string;
  nodes: EvolutionNode[];
}

// ============ 单元衔接 ============

export interface ChronologicalBridge {
  fromPeriod: string;
  toPeriod: string;
  bridgeEvent: string;
  bridgeExplanation: string;
}

export interface ThematicBridge {
  fromTheme: string;
  toTheme: string;
  connection: string;
}

export interface EvolutionBridge {
  systemType: SystemType;
  fromState: string;
  toState: string;
  evolutionNote: string;
}

export interface ComparisonBridge {
  topic: string;
  comparisonId: string;
}

export interface ExamMigration {
  trend: string;
  note: string;
}

export interface UnitTransition {
  fromUnitId: string;
  toUnitId: string;
  chronologicalBridge: ChronologicalBridge;
  thematicBridge: ThematicBridge;
  evolutionBridges: EvolutionBridge[];
  comparisonBridges: ComparisonBridge[];
  examMigration: ExamMigration;
}

// ============ 学习路径 ============

export interface LearningRound {
  id: 'round-1' | 'round-2' | 'round-3' | 'round-4';
  name: string;
  goal: string;
  duration: string;
  steps: LearningStep[];
  output: string;
}

export interface LearningStep {
  id: string;
  roundId: string;
  order: number;
  title: string;
  route: string;
  tool: string;
  action: string;
  estimatedMinutes: number;
  prerequisite?: string;
  crossUnitPrerequisite?: string;
  completed: boolean;
}

// ============ 单元总览 ============

export interface UnitOverviewPeriod {
  period: string;
  coreTheme: string;
  keyConcepts: string[];
}

export interface UnitOverview {
  id: string;
  unitId: string;
  unitName: string;
  periods: UnitOverviewPeriod[];
  liaoningSummary?: LiaoningSummary;
}

// ============ 学习闭环 ============

export interface LearningLoopInput {
  steps: string[];
  route: string[];
}

export interface LearningLoopDigestion {
  steps: string[];
  route: string[];
}

export interface LearningLoopOutput {
  steps: string[];
  route: string[];
}

export interface LearningLoopFeedback {
  steps: string[];
  route: string[];
}

export interface LearningLoopReinforcement {
  steps: string[];
  route: string[];
}

export interface CompletionCriteria {
  requiredSteps: string[];
  minAccuracy?: number;
  minEssayScore?: number;
}

export interface LearningLoop {
  unitId: string;
  input: LearningLoopInput;
  digestion: LearningLoopDigestion;
  output: LearningLoopOutput;
  feedback: LearningLoopFeedback;
  reinforcement: LearningLoopReinforcement;
  completionCriteria: CompletionCriteria;
}

// ============ 跨单元复习计划 ============

export interface CrossUnitReviewStep {
  action: string;
  route: string;
}

export interface CrossUnitReviewPlan {
  id: string;
  name: string;
  involvedUnitIds: string[];
  systemType?: SystemType;
  reviewSteps: CrossUnitReviewStep[];
}

// ============ 命题趋势 ============

export interface ExamTrend {
  unitId: string;
  summary: string;
  carrierTypes: string[];
  highFrequencyTopics: string[];
}

// ============ 辽宁本土考点 ============

export interface LiaoningLocalKnowledge {
  id: string;
  name: string;
  location: string;
  description: string;
  relatedExams: string[];
  knowledgePoints: string[];
}
