/**
 * 题型分配与去重工具
 * 确保每次生成的题目不同、题型全覆盖
 */

export type QuestionType = 'choice' | 'fill' | 'calculation';
export type DifficultyLevel = 'simple' | 'medium' | 'hard';

/**
 * 题型分配策略
 * 根据难度确定选择题:填空题:计算题的数量
 */
export function getQuestionTypeDistribution(
  difficulty: DifficultyLevel,
  totalCount = 10
): { choice: number; fill: number; calc: number } {
  const distributions = {
    simple: { choice: 5, fill: 3, calc: 2 },
    medium: { choice: 4, fill: 3, calc: 3 },
    hard: { choice: 3, fill: 3, calc: 4 },
  };
  const dist = distributions[difficulty] || distributions.medium;

  // 调整数量以匹配总题数
  const total = dist.choice + dist.fill + dist.calc;
  const scale = totalCount / total;
  return {
    choice: Math.round(dist.choice * scale),
    fill: Math.round(dist.fill * scale),
    calc: Math.round(dist.calc * scale),
  };
}

/**
 * 生成题型列表（打乱顺序）
 */
export function generateQuestionTypeList(
  difficulty: DifficultyLevel,
  totalCount = 10
): QuestionType[] {
  const dist = getQuestionTypeDistribution(difficulty, totalCount);
  const types: QuestionType[] = [
    ...Array(dist.choice).fill('choice'),
    ...Array(dist.fill).fill('fill'),
    ...Array(dist.calc).fill('calculation'),
  ];
  // Fisher-Yates 洗牌
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [types[i], types[j]] = [types[j], types[i]];
  }
  return types;
}

/**
 * 生成随机种子
 * 每次请求使用不同种子，确保题目不同
 */
export function generateSeed(): number {
  return Date.now() + Math.floor(Math.random() * 9999);
}

/**
 * 题干去重哈希
 * 用于检测相似题目
 */
export function hashQuestion(text: string): string {
  // 归一化：去除数字、标点、空格，保留核心关键词
  const normalized = text
    .replace(/[0-9]+/g, 'N')          // 数字统一替换
    .replace(/[.,，、。:：;；!?！？""''【】()（）]/g, '') // 标点
    .replace(/\s+/g, '')              // 空格
    .toLowerCase();
  return normalized;
}

/**
 * 计算两道题的相似度
 * 返回 0-1 的相似度值，1 表示完全相同
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const h1 = hashQuestion(text1);
  const h2 = hashQuestion(text2);
  if (h1 === h2) return 1;
  if (h1.length === 0 || h2.length === 0) return 0;

  // 简单相似度：公共字符比例
  const set1 = new Set(h1.split(''));
  const set2 = new Set(h2.split(''));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

/**
 * 过滤相似题目
 * 从候选列表中移除与已有题目相似度超过阈值的题
 */
export function filterSimilarQuestions<T extends { text?: string; question?: string }>(
  candidates: T[],
  existing: T[] = [],
  threshold = 0.7
): T[] {
  const existingTexts = existing.map(e => hashQuestion(e.text || e.question || ''));

  return candidates.filter(candidate => {
    const candidateHash = hashQuestion(candidate.text || candidate.question || '');
    if (!candidateHash) return true; // 无法哈希的保留

    for (const existingHash of existingTexts) {
      const similarity = calculateSimilarity(candidateHash, existingHash);
      if (similarity >= threshold) return false;
    }
    return true;
  });
}

/**
 * 格式化题目用于API
 */
export function formatQuestionForAPI(q: {
  id: string | number;
  type: string;
  difficulty: string;
  knowledgePoint?: string;
  source?: string;
  text?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  answer?: string;
  explanation?: string;
  steps?: string[];
  commonMistakes?: string[];
}): {
  id: string;
  type: 'choice' | 'fill' | 'calculation';
  difficulty: 'simple' | 'medium' | 'hard';
  knowledgePoint: string;
  source: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  steps: string[];
  commonMistakes: string[];
} {
  const typeMap: Record<string, string> = {
    choice: 'choice', fill: 'fill', calculation: 'calculation', calc: 'calculation',
  };
  const diffMap: Record<string, string> = {
    simple: 'simple', 简单: 'simple', easy: 'simple',
    medium: 'medium', 中等: 'medium',
    hard: 'hard', 困难: 'hard', difficult: 'hard',
  };
  const difficulty = diffMap[q.difficulty] || 'medium';

  // 归一化选择题选项格式
  let options: string[] = [];
  if (Array.isArray(q.options)) {
    options = q.options.map((opt, i) => {
      const prefix = String.fromCharCode(65 + i);
      if (opt.startsWith(prefix + '.') || opt.startsWith(prefix + '、')) {
        return opt;
      }
      return `${prefix}. ${opt}`;
    });
  }

  const correctAnswer = q.correctAnswer || q.answer || 'A';

  return {
    id: String(q.id || `q_${Date.now()}`),
    type: (typeMap[q.type] || 'choice') as 'choice' | 'fill' | 'calculation',
    difficulty: difficulty as 'simple' | 'medium' | 'hard',
    knowledgePoint: q.knowledgePoint || '基础知识',
    source: q.source || 'current',
    text: q.text || q.question || '题目内容',
    options,
    correctAnswer,
    explanation: q.explanation || '请参考解析',
    steps: Array.isArray(q.steps) ? q.steps : [],
    commonMistakes: Array.isArray(q.commonMistakes) ? q.commonMistakes : [],
  };
}

/**
 * 为提示词构建题型说明
 */
export function buildTypeDescription(types: QuestionType[]): string {
  const counts = {
    choice: types.filter(t => t === 'choice').length,
    fill: types.filter(t => t === 'fill').length,
    calc: types.filter(t => t === 'calculation').length,
  };
  const parts: string[] = [];
  if (counts.choice > 0) parts.push(`选择题 ${counts.choice} 道`);
  if (counts.fill > 0) parts.push(`填空题 ${counts.fill} 道`);
  if (counts.calc > 0) parts.push(`计算题 ${counts.calc} 道`);
  return parts.join('、');
}

/**
 * 生成语文/英语等非数学科目的题目提示词片段
 */
export function buildLanguagePrompt(subjectId: string, questionType: string): string {
  const prompts: Record<string, Record<string, string>> = {
    chinese: {
      choice: '古诗词鉴赏/现代文阅读选择题，考察意象、修辞、情感、主旨',
      fill: '古诗词默写/文言文翻译填空',
      calc: '阅读理解简答题',
    },
    english: {
      choice: '语法/完形填空/阅读理解选择题',
      fill: '单词拼写/语法填空',
      calc: '阅读理解简答题/写作',
    },
  };

  const subjectPrompts = prompts[subjectId];
  if (!subjectPrompts) return '';
  return subjectPrompts[questionType] || '';
}

/**
 * 获取题型标签（中文）
 */
export function getQuestionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    choice: '选择题',
    fill: '填空题',
    calculation: '计算题',
    calc: '计算题',
  };
  return map[type] || type;
}

/**
 * 获取难度标签（中文）
 */
export function getDifficultyLabel(difficulty: string): string {
  const map: Record<string, string> = {
    simple: '简单',
    medium: '中等',
    hard: '困难',
  };
  return map[difficulty] || '中等';
}
