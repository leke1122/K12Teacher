// 英语语法知识点类型定义

export interface GrammarPoint {
  id: string;                     // "stage4-03"
  stage: number;                  // 1-8
  stageName: string;               // "阶段一：词法基础"
  category: string;                // "时态" | "非谓语" | "从句" | "特殊句式" | "语态" | "词汇辨析"
  name: string;                    // "现在完成时"
  structure: {
    formula: string;               // "S + have/has + 过去分词"
    components: string[];          // ["S = 主语", "have/has = 助动词"]
  };
  explanation: {
    simple: string;                // 一句话通俗解释
    detailed: string;              // 详细讲解
    analogy: string;                // 生活类比
  };
  examPoints: {
    point: string;                 // 考点名称
    example: string;               // 典型例句
    frequency: 1 | 2 | 3 | 4 | 5; // 高考频次
  }[];
  fixedCombinations: {
    pattern: string;               // 固定搭配
    meaning: string;              // 中文含义
    example: string;               // 例句
  }[];
  examples: {
    sentence: string;              // 例句原文
    translation: string;            // 中文翻译
    keyWords: string[];            // 高考高频词
    grammarHighlight: string;       // 语法高亮标注
  }[];
  commonMistakes: {
    mistake: string;               // 常见错误
    correct: string;                // 正确表达
    reason: string;                // 错误原因
  }[];
  textbookRef: string;             // 教材出处
  difficulty: 1 | 2 | 3 | 4 | 5;   // 难度等级
  examType: string[];              // 高考考查形式: ["阅读", "写作", "完形"]
  examWeight?: number;             // 高考权重排名 (1=最高)
}

export interface GrammarStage {
  stage: number;
  name: string;
  description: string;
  points: GrammarPoint[];
}

export interface GrammarProgress {
  grammarId: string;
  status: 'not_started' | 'learning' | 'mastered';
  lastStudied?: string;            // ISO date
  practiceCount: number;
  correctRate?: number;            // 0-100
}

export interface GrammarStats {
  totalPoints: number;
  learnedCount: number;
  masteredCount: number;
  byStage: {
    stage: number;
    stageName: string;
    total: number;
    learned: number;
    mastered: number;
  }[];
}

export interface GrammarPracticeQuestion {
  id: string;
  grammarId: string;
  type: 'fill' | 'correct' | 'translate' | 'choice';
  question: string;
  answer: string;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface GrammarErrorAnalysis {
  questionId: string;
  grammarId: string;
  grammarName: string;
  errorType: 'structure' | 'tense' | 'word-choice' | 'preposition' | 'article' | 'other';
  unknownWords: string[];
  hint: string;
}
