export type PoliticsStepKey =
  | 'textbook'
  | 'knowledge'
  | 'discrimination'
  | 'current-affairs'
  | 'synthesis'
  | 'essay';

export type PoliticsStepStatus = 'not_started' | 'in_progress' | 'completed';

export interface PoliticsStepProgress {
  status: PoliticsStepStatus;
  lastVisited?: string;
}

export interface PoliticsProgress {
  subjectId: string;
  chapterId: string;
  steps: {
    textbook: PoliticsStepProgress;
    knowledge: PoliticsStepProgress;
    discrimination: PoliticsStepProgress;
    'current-affairs': PoliticsStepProgress;
    synthesis: PoliticsStepProgress;
    essay: PoliticsStepProgress;
  };
  currentStep: number;
  completedAt?: string;
}

const STORAGE_KEY = 'politics_learning_progress';

export function getProgressKey(subjectId: string, chapterId: string): string {
  return `${STORAGE_KEY}_${subjectId}_${chapterId}`;
}

export function loadProgress(subjectId: string, chapterId: string): PoliticsProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getProgressKey(subjectId, chapterId));
    if (!raw) return null;
    return JSON.parse(raw) as PoliticsProgress;
  } catch {
    return null;
  }
}

export function saveProgress(progress: PoliticsProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getProgressKey(progress.subjectId, progress.chapterId), JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function createDefaultProgress(
  subjectId: string = 'politics',
  chapterId: string = 'compulsory-1',
): PoliticsProgress {
  return {
    subjectId,
    chapterId,
    steps: {
      textbook: { status: 'not_started' },
      knowledge: { status: 'not_started' },
      discrimination: { status: 'not_started' },
      'current-affairs': { status: 'not_started' },
      synthesis: { status: 'not_started' },
      essay: { status: 'not_started' },
    },
    currentStep: 0,
  };
}

export function updateStepProgress(
  subjectId: string,
  chapterId: string,
  step: PoliticsStepKey,
  status: PoliticsStepStatus,
  currentStep?: number,
): PoliticsProgress {
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

export function computeCurrentStep(steps: PoliticsProgress['steps']): number {
  const order: PoliticsStepKey[] = [
    'textbook',
    'knowledge',
    'discrimination',
    'current-affairs',
    'synthesis',
    'essay',
  ];

  for (let i = 0; i < order.length; i++) {
    const key = order[i];
    if (steps[key].status !== 'completed') {
      return i;
    }
  }

  return 5;
}

export function computeOverallProgress(steps: PoliticsProgress['steps']): number {
  const order: PoliticsStepKey[] = [
    'textbook',
    'knowledge',
    'discrimination',
    'current-affairs',
    'synthesis',
    'essay',
  ];
  const completed = order.filter((key) => steps[key].status === 'completed').length;
  return Math.round((completed / order.length) * 100);
}

export function getStepLabel(step: PoliticsStepKey): string {
  const map: Record<PoliticsStepKey, string> = {
    textbook: '课本还原',
    knowledge: '知识点学习',
    discrimination: '概念辨析',
    'current-affairs': '时政链接',
    synthesis: '综合应用',
    essay: '论述训练',
  };
  return map[step];
}

export function getNextStep(current: PoliticsStepKey): PoliticsStepKey | null {
  const order: PoliticsStepKey[] = [
    'textbook',
    'knowledge',
    'discrimination',
    'current-affairs',
    'synthesis',
    'essay',
  ];
  const idx = order.indexOf(current);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

export function getPrevStep(current: PoliticsStepKey): PoliticsStepKey | null {
  const order: PoliticsStepKey[] = [
    'textbook',
    'knowledge',
    'discrimination',
    'current-affairs',
    'synthesis',
    'essay',
  ];
  const idx = order.indexOf(current);
  if (idx <= 0) return null;
  return order[idx - 1];
}
