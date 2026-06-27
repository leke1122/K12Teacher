export type StepKey =
  | 'textbook'
  | 'knowledge'
  | 'timeline'
  | 'cards'
  | 'causalChain'
  | 'analysis';

export type StepStatus = 'not_started' | 'in_progress' | 'completed';

export interface StepProgress {
  status: StepStatus;
  lastVisited?: string;
}

export interface HistoryLearningProgress {
  subjectId: string;
  chapterId: string;
  steps: {
    textbook: StepProgress;
    knowledge: StepProgress;
    timeline: StepProgress;
    cards: StepProgress;
    causalChain: StepProgress;
    analysis: StepProgress;
  };
  currentStep: number;
  completedAt?: string;
}

const STORAGE_KEY = 'history_learning_progress';

export function getProgressKey(subjectId: string, chapterId: string): string {
  return `${STORAGE_KEY}_${subjectId}_${chapterId}`;
}

export function loadProgress(subjectId: string, chapterId: string): HistoryLearningProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getProgressKey(subjectId, chapterId));
    if (!raw) return null;
    return JSON.parse(raw) as HistoryLearningProgress;
  } catch {
    return null;
  }
}

export function saveProgress(progress: HistoryLearningProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getProgressKey(progress.subjectId, progress.chapterId), JSON.stringify(progress));
  } catch {
    // ignore storage errors
  }
}

export function createDefaultProgress(
  subjectId: string = 'history',
  chapterId: string = 'modern-china',
): HistoryLearningProgress {
  return {
    subjectId,
    chapterId,
    steps: {
      textbook: { status: 'not_started' },
      knowledge: { status: 'not_started' },
      timeline: { status: 'not_started' },
      cards: { status: 'not_started' },
      causalChain: { status: 'not_started' },
      analysis: { status: 'not_started' },
    },
    currentStep: 0,
  };
}

export function updateStepProgress(
  subjectId: string,
  chapterId: string,
  step: StepKey,
  status: StepStatus,
  currentStep?: number,
): HistoryLearningProgress {
  const existing = loadProgress(subjectId, chapterId) || createDefaultProgress(subjectId, chapterId);

  const updated = {
    ...existing,
    steps: {
      ...existing.steps,
      [step]: {
        status,
        lastVisited: new Date().toISOString(),
      },
    },
  };

  if (typeof currentStep === 'number') {
    updated.currentStep = currentStep;
  } else {
    updated.currentStep = computeCurrentStep(updated.steps);
  }

  if (updated.currentStep >= 5) {
    updated.completedAt = new Date().toISOString();
  } else {
    updated.completedAt = undefined;
  }

  saveProgress(updated);
  return updated;
}

export function computeCurrentStep(
  steps: HistoryLearningProgress['steps'],
): number {
  const order: StepKey[] = ['textbook', 'knowledge', 'timeline', 'cards', 'causalChain', 'analysis'];

  for (let i = 0; i < order.length; i++) {
    const key = order[i];
    if (steps[key].status !== 'completed') {
      return i;
    }
  }

  return 5;
}

export function computeOverallProgress(
  steps: HistoryLearningProgress['steps'],
): number {
  const order: StepKey[] = ['textbook', 'knowledge', 'timeline', 'cards', 'causalChain', 'analysis'];
  const completed = order.filter((key) => steps[key].status === 'completed').length;
  return Math.round((completed / order.length) * 100);
}

export function getStepLabel(step: StepKey): string {
  const map: Record<StepKey, string> = {
    textbook: '课本还原',
    knowledge: '知识点学习',
    timeline: '时间轴',
    cards: '历史卡牌',
    causalChain: '因果链',
    analysis: '材料分析',
  };
  return map[step];
}

export function getNextStep(current: StepKey): StepKey | null {
  const order: StepKey[] = ['textbook', 'knowledge', 'timeline', 'cards', 'causalChain', 'analysis'];
  const idx = order.indexOf(current);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

export function getPrevStep(current: StepKey): StepKey | null {
  const order: StepKey[] = ['textbook', 'knowledge', 'timeline', 'cards', 'causalChain', 'analysis'];
  const idx = order.indexOf(current);
  if (idx <= 0) return null;
  return order[idx - 1];
}
