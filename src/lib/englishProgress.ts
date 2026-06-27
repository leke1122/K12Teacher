export type StepKey = 
  | 'textbook'
  | 'words'
  | 'grammar'
  | 'reading'
  | 'writing'
  | 'listening'
  | 'practice';

export type StepStatus = 'not_started' | 'in_progress' | 'completed';

export interface StepProgress {
  status: StepStatus;
  visited: boolean;
  completedAt?: number;
}

export interface EnglishProgress {
  steps: Record<StepKey, StepProgress>;
  currentStepIndex: number;
  overallProgress: number;
  subjectId: string;
  lastUpdated: number;
}

export const STEP_ORDER: StepKey[] = [
  'textbook',
  'words',
  'grammar',
  'reading',
  'listening',
  'writing',
  'practice',
];

export const STEP_LABELS: Record<StepKey, string> = {
  textbook: '课本精读',
  words: '单词记忆',
  grammar: '语法体系',
  reading: '阅读理解',
  listening: '听力训练',
  writing: '写作训练',
  practice: '真题实战',
};

export const STEP_DESCRIPTIONS: Record<StepKey, string> = {
  textbook: '理解教材内容，掌握核心课文',
  words: '词汇量积累，3500词全覆盖',
  grammar: '构建语法框架，攻克重点难点',
  reading: '提升阅读能力，掌握解题技巧',
  listening: '听力专项训练，提高听力理解',
  writing: '规范写作表达，突破读后续写',
  practice: '综合提分冲刺，实战模拟演练',
};

export const STEP_HREFS: Record<StepKey, string> = {
  textbook: '/learn/english/textbook/unit-1',
  words: '/words',
  grammar: '/learn/english/grammar',
  reading: '/learn/english/reading',
  listening: '/learn/english/listening',
  writing: '/learn/english/writing',
  practice: '/learn/english/practice',
};

const STORAGE_KEY_PREFIX = 'english_progress_';

export function getStorageKey(subjectId: string): string {
  return `${STORAGE_KEY_PREFIX}${subjectId}`;
}

export function loadProgress(subjectId: string): EnglishProgress | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = localStorage.getItem(getStorageKey(subjectId));
    if (!raw) return null;
    return JSON.parse(raw) as EnglishProgress;
  } catch {
    return null;
  }
}

export function saveProgress(progress: EnglishProgress): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(getStorageKey(progress.subjectId), JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function createInitialProgress(subjectId: string): EnglishProgress {
  const steps: Record<StepKey, StepProgress> = {
    textbook: { status: 'not_started', visited: false },
    words: { status: 'not_started', visited: false },
    grammar: { status: 'not_started', visited: false },
    reading: { status: 'not_started', visited: false },
    writing: { status: 'not_started', visited: false },
    listening: { status: 'not_started', visited: false },
    practice: { status: 'not_started', visited: false },
  };

  return {
    steps,
    currentStepIndex: 0,
    overallProgress: 0,
    subjectId,
    lastUpdated: Date.now(),
  };
}

export function getStepStatus(
  progress: EnglishProgress,
  stepKey: StepKey,
): StepStatus {
  return progress.steps[stepKey]?.status || 'not_started';
}

export function isStepVisited(progress: EnglishProgress, stepKey: StepKey): boolean {
  return progress.steps[stepKey]?.visited || false;
}

export function updateStepProgress(
  subjectId: string,
  stepKey: StepKey,
  status: StepStatus,
): EnglishProgress {
  const existing = loadProgress(subjectId) || createInitialProgress(subjectId);
  
  existing.steps[stepKey] = {
    ...existing.steps[stepKey],
    status,
    visited: true,
    completedAt: status === 'completed' ? Date.now() : existing.steps[stepKey]?.completedAt,
  };

  // Update current step index
  const currentIdx = STEP_ORDER.indexOf(stepKey);
  if (currentIdx >= 0) {
    existing.currentStepIndex = currentIdx;
  }

  // Calculate overall progress
  const completedSteps = STEP_ORDER.filter(
    (key) => existing.steps[key].status === 'completed',
  ).length;
  existing.overallProgress = Math.round((completedSteps / STEP_ORDER.length) * 100);
  existing.lastUpdated = Date.now();

  saveProgress(existing);
  return existing;
}

export function markStepVisited(subjectId: string, stepKey: StepKey): EnglishProgress {
  const existing = loadProgress(subjectId) || createInitialProgress(subjectId);
  
  existing.steps[stepKey] = {
    ...existing.steps[stepKey],
    visited: true,
  };

  const currentIdx = STEP_ORDER.indexOf(stepKey);
  if (currentIdx >= 0) {
    existing.currentStepIndex = currentIdx;
  }

  existing.lastUpdated = Date.now();
  saveProgress(existing);
  return existing;
}

export function resetProgress(subjectId: string): EnglishProgress {
  const newProgress = createInitialProgress(subjectId);
  saveProgress(newProgress);
  return newProgress;
}

export function getCurrentStep(progress: EnglishProgress): StepKey {
  return STEP_ORDER[progress.currentStepIndex] || STEP_ORDER[0];
}

export function getNextStep(currentStep: StepKey): StepKey | null {
  const idx = STEP_ORDER.indexOf(currentStep);
  if (idx < 0 || idx >= STEP_ORDER.length - 1) return null;
  return STEP_ORDER[idx + 1];
}

export function getPrevStep(currentStep: StepKey): StepKey | null {
  const idx = STEP_ORDER.indexOf(currentStep);
  if (idx <= 0) return null;
  return STEP_ORDER[idx - 1];
}
