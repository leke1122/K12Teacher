'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadProgress,
  saveProgress,
  updateStepProgress,
  createInitialProgress,
  STEP_ORDER,
  type StepKey,
  type StepStatus,
  type EnglishProgress,
} from '@/lib/englishProgress';

export interface UseEnglishProgressReturn {
  progress: EnglishProgress | null;
  overallProgress: number;
  currentStepIndex: number;
  currentStepKey: StepKey;
  currentStepLabel: string;
  isStepCompleted: (step: StepKey) => boolean;
  getStepStatus: (step: StepKey) => StepStatus;
  updateStep: (step: StepKey, status: StepStatus) => EnglishProgress;
  markVisited: (step: StepKey) => EnglishProgress;
  getNextStep: (step?: StepKey) => StepKey | null;
  getPrevStep: (step?: StepKey) => StepKey | null;
  isAllCompleted: boolean;
  reset: () => void;
}

export function useEnglishProgress(
  subjectId: string = 'english',
): UseEnglishProgressReturn {
  const [progress, setProgress] = useState<EnglishProgress | null>(null);

  const load = useCallback(() => {
    const existing = loadProgress(subjectId) || createInitialProgress(subjectId);
    setProgress(existing);
  }, [subjectId]);

  useEffect(() => {
    load();
  }, [load]);

  const overallProgress = useMemo(() => {
    if (!progress) return 0;
    return progress.overallProgress;
  }, [progress]);

  const currentStepIndex = useMemo(() => {
    if (!progress) return 0;
    return progress.currentStepIndex;
  }, [progress]);

  const currentStepKey: StepKey = useMemo(() => {
    if (!progress) return STEP_ORDER[0];
    return STEP_ORDER[progress.currentStepIndex] || STEP_ORDER[0];
  }, [progress]);

  const currentStepLabel = useMemo(() => {
    const labels: Record<StepKey, string> = {
      textbook: '课本精读',
      words: '单词记忆',
      grammar: '语法体系',
      reading: '阅读理解',
      listening: '听力训练',
      writing: '写作训练',
      practice: '真题实战',
    };
    return labels[currentStepKey];
  }, [currentStepKey]);

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
      const updated = updateStepProgress(subjectId, step, status);
      setProgress(updated);
      return updated;
    },
    [subjectId],
  );

  const markVisited = useCallback(
    (step: StepKey) => {
      const existing = progress || createInitialProgress(subjectId);
      const currentStatus = existing.steps[step].status === 'not_started' 
        ? 'in_progress' 
        : existing.steps[step].status;
      const updated = updateStepProgress(subjectId, step, currentStatus);
      setProgress(updated);
      return updated;
    },
    [progress, subjectId],
  );

  const getNextStepFor = useCallback(
    (step?: StepKey) => {
      const key = step || currentStepKey;
      const idx = STEP_ORDER.indexOf(key);
      if (idx < 0 || idx >= STEP_ORDER.length - 1) return null;
      return STEP_ORDER[idx + 1];
    },
    [currentStepKey],
  );

  const getPrevStepFor = useCallback(
    (step?: StepKey) => {
      const key = step || currentStepKey;
      const idx = STEP_ORDER.indexOf(key);
      if (idx <= 0) return null;
      return STEP_ORDER[idx - 1];
    },
    [currentStepKey],
  );

  const isAllCompleted = useMemo(() => {
    if (!progress) return false;
    return STEP_ORDER.every((key) => progress.steps[key].status === 'completed');
  }, [progress]);

  const reset = useCallback(() => {
    const fresh = createInitialProgress(subjectId);
    setProgress(fresh);
    saveProgress(fresh);
  }, [subjectId]);

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
