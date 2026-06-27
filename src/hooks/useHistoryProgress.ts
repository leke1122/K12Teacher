'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadProgress,
  saveProgress,
  updateStepProgress as updateStepProgressAction,
  createDefaultProgress,
  computeCurrentStep,
  computeOverallProgress,
  getStepLabel,
  getNextStep,
  getPrevStep,
  type StepKey,
  type StepStatus,
  type HistoryLearningProgress,
} from '@/lib/historyProgress';

export interface UseHistoryProgressReturn {
  progress: HistoryLearningProgress | null;
  overallProgress: number;
  currentStepIndex: number;
  currentStepKey: StepKey;
  currentStepLabel: string;
  isStepCompleted: (step: StepKey) => boolean;
  getStepStatus: (step: StepKey) => StepStatus;
  updateStep: (step: StepKey, status: StepStatus) => HistoryLearningProgress;
  markVisited: (step: StepKey) => HistoryLearningProgress;
  getNextStep: (step?: StepKey) => StepKey | null;
  getPrevStep: (step?: StepKey) => StepKey | null;
  isAllCompleted: boolean;
  reset: () => void;
}

export function useHistoryProgress(
  subjectId: string = 'history',
  chapterId: string = 'modern-china',
): UseHistoryProgressReturn {
  const [progress, setProgress] = useState<HistoryLearningProgress | null>(null);

  const load = useCallback(() => {
    const existing = loadProgress(subjectId, chapterId) || createDefaultProgress(subjectId, chapterId);
    setProgress(existing);
  }, [subjectId, chapterId]);

  useEffect(() => {
    load();
  }, [load]);

  const overallProgress = useMemo(() => {
    if (!progress) return 0;
    return computeOverallProgress(progress.steps);
  }, [progress]);

  const currentStepIndex = useMemo(() => {
    if (!progress) return 0;
    return progress.currentStep;
  }, [progress]);

  const stepOrder: StepKey[] = useMemo(
    () => ['textbook', 'knowledge', 'timeline', 'cards', 'causalChain', 'analysis'],
    [],
  );

  const currentStepKey: StepKey = useMemo(() => {
    if (!progress) return 'textbook';
    return stepOrder[progress.currentStep] || 'textbook';
  }, [progress, stepOrder]);

  const currentStepLabel = useMemo(() => getStepLabel(currentStepKey), [currentStepKey]);

  const isStepCompleted = useCallback(
    (step: StepKey) => {
      if (!progress) return false;
      return progress.steps[step].status === 'completed';
    },
    [progress],
  );

  const getStepStatus = useCallback(
    (step: StepKey): StepStatus => {
      if (!progress) return 'not_started';
      return progress.steps[step].status;
    },
    [progress],
  );

  const updateStep = useCallback(
    (step: StepKey, status: StepStatus) => {
      const updated = updateStepProgressAction(subjectId, chapterId, step, status);
      setProgress(updated);
      return updated;
    },
    [subjectId, chapterId],
  );

  const markVisited = useCallback(
    (step: StepKey) => {
      const existing = progress || createDefaultProgress(subjectId, chapterId);
      const current = existing.steps[step].status === 'not_started' ? 'in_progress' : existing.steps[step].status;
      const updated = updateStepProgressAction(subjectId, chapterId, step, current);
      setProgress(updated);
      return updated;
    },
    [progress, subjectId, chapterId],
  );

  const getNextStepFor = useCallback(
    (step?: StepKey) => {
      const key = step || currentStepKey;
      return getNextStep(key);
    },
    [currentStepKey],
  );

  const getPrevStepFor = useCallback(
    (step?: StepKey) => {
      const key = step || currentStepKey;
      return getPrevStep(key);
    },
    [currentStepKey],
  );

  const isAllCompleted = useMemo(() => {
    if (!progress) return false;
    return stepOrder.every((key) => progress.steps[key].status === 'completed');
  }, [progress, stepOrder]);

  const reset = useCallback(() => {
    const fresh = createDefaultProgress(subjectId, chapterId);
    setProgress(fresh);
    saveProgress(fresh);
  }, [subjectId, chapterId]);

  return {
    progress,
    overallProgress,
    currentStepIndex,
    currentStepKey,
    currentStepLabel,
    isStepCompleted,
    getStepStatus,
    updateStep,
    markVisited,
    getNextStep: getNextStepFor,
    getPrevStep: getPrevStepFor,
    isAllCompleted,
    reset,
  };
}
