type GeographyStepKey =
  | 'textbook'
  | 'knowledge'
  | 'map'
  | 'compare'
  | 'cards'
  | 'location'
  | 'practice';

export type GeographyStepStatus = 'not_started' | 'in_progress' | 'completed';

export interface GeographyStepProgress {
  status: GeographyStepStatus;
  lastVisited?: string;
}

export interface GeographyProgress {
  subjectId: string;
  chapterId: string;
  steps: {
    textbook: GeographyStepProgress;
    knowledge: GeographyStepProgress;
    map: GeographyStepProgress;
    compare: GeographyStepProgress;
    cards: GeographyStepProgress;
    location: GeographyStepProgress;
    practice: GeographyStepProgress;
  };
  currentStep: number;
  completedAt?: string;
}

const STORAGE_KEY = 'geography_learning_progress';

export function getProgressKey(subjectId: string, chapterId: string): string {
  return `${STORAGE_KEY}_${subjectId}_${chapterId}`;
}

export function loadProgress(subjectId: string, chapterId: string): GeographyProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getProgressKey(subjectId, chapterId));
    if (!raw) return null;
    return JSON.parse(raw) as GeographyProgress;
  } catch {
    return null;
  }
}

export function saveProgress(progress: GeographyProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getProgressKey(progress.subjectId, progress.chapterId), JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function createDefaultProgress(
  subjectId: string = 'geography',
  chapterId: string = 'compulsory-1',
): GeographyProgress {
  return {
    subjectId,
    chapterId,
    steps: {
      textbook: { status: 'not_started' },
      knowledge: { status: 'not_started' },
      map: { status: 'not_started' },
      compare: { status: 'not_started' },
      cards: { status: 'not_started' },
      location: { status: 'not_started' },
      practice: { status: 'not_started' },
    },
    currentStep: 0,
  };
}

export function updateStepProgress(
  subjectId: string,
  chapterId: string,
  step: GeographyStepKey,
  status: GeographyStepStatus,
  currentStep?: number,
): GeographyProgress {
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

  if (updated.currentStep >= 6) {
    updated.completedAt = new Date().toISOString();
  } else {
    updated.completedAt = undefined;
  }

  saveProgress(updated);
  return updated;
}

export function computeCurrentStep(steps: GeographyProgress['steps']): number {
  const order: GeographyStepKey[] = [
    'textbook',
    'knowledge',
    'map',
    'compare',
    'cards',
    'location',
    'practice',
  ];

  for (let i = 0; i < order.length; i++) {
    const key = order[i];
    if (steps[key].status !== 'completed') {
      return i;
    }
  }

  return 6;
}

export function computeOverallProgress(steps: GeographyProgress['steps']): number {
  const order: GeographyStepKey[] = [
    'textbook',
    'knowledge',
    'map',
    'compare',
    'cards',
    'location',
    'practice',
  ];
  const completed = order.filter((key) => steps[key].status === 'completed').length;
  return Math.round((completed / order.length) * 100);
}

export function getStepLabel(step: GeographyStepKey): string {
  const map: Record<GeographyStepKey, string> = {
    textbook: '课本还原',
    knowledge: '知识点学习',
    map: '交互地图',
    compare: '区域对比',
    cards: '地理卡牌',
    location: '区位分析',
    practice: '综合题训练',
  };
  return map[step];
}

export function getNextStep(current: GeographyStepKey): GeographyStepKey | null {
  const order: GeographyStepKey[] = [
    'textbook',
    'knowledge',
    'map',
    'compare',
    'cards',
    'location',
    'practice',
  ];
  const idx = order.indexOf(current);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

export function getPrevStep(current: GeographyStepKey): GeographyStepKey | null {
  const order: GeographyStepKey[] = [
    'textbook',
    'knowledge',
    'map',
    'compare',
    'cards',
    'location',
    'practice',
  ];
  const idx = order.indexOf(current);
  if (idx <= 0) return null;
  return order[idx - 1];
}
