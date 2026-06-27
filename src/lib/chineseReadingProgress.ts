'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ReadingProgress {
  chapterId: string;
  chapterTitle: string;
  currentStep: number; // 1-5
  completedSteps: number[]; // 已完成的步骤
  firstImpression?: string; // 第1步的印象
  notes: WordNote[]; // 第2步的笔记
  mindmapData?: MindmapNode; // 第3步的思维导图
  writingContent?: string; // 第4步的写作内容
  writingFeedback?: string; // 第4步的AI反馈
  reflection?: string; // 第5步的反思
  startedAt: string;
  completedAt?: string;
}

export interface WordNote {
  word: string;
  explanation: string;
  paragraph: number;
  timestamp: string;
}

export interface MindmapNode {
  id: string;
  label: string;
  children?: MindmapNode[];
}

const STORAGE_KEY = 'chinese_reading_progress';

export function getReadingProgress(chapterId: string): ReadingProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${chapterId}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveReadingProgress(progress: ReadingProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY}_${progress.chapterId}`, JSON.stringify(progress));
  } catch (error) {
    console.error('保存阅读进度失败:', error);
  }
}

export function clearReadingProgress(chapterId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${STORAGE_KEY}_${chapterId}`);
}

export function getAllReadingProgress(): ReadingProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    const results: ReadingProgress[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY)) {
        const data = localStorage.getItem(key);
        if (data) results.push(JSON.parse(data));
      }
    }
    return results;
  } catch {
    return [];
  }
}

export function getChapterReadingStatus(
  chapterId: string
): { status: 'not_started' | 'in_progress' | 'completed'; progress: ReadingProgress | null } {
  const progress = getReadingProgress(chapterId);
  if (!progress) return { status: 'not_started', progress: null };
  if (progress.completedAt) return { status: 'completed', progress };
  return { status: 'in_progress', progress };
}

export function calculateOverallProgress(chapters: Array<{ chapterIndex: number }>): number {
  if (!chapters.length) return 0;
  const allProgress = getAllReadingProgress();
  if (!allProgress.length) return 0;
  
  const completedCount = allProgress.filter(p => p.completedAt).length;
  return Math.round((completedCount / chapters.length) * 100);
}

// Hook for managing reading progress
export function useReadingProgress(chapterId: string, chapterTitle: string) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getReadingProgress(chapterId);
    setProgress(stored);
    setLoading(false);
  }, [chapterId]);

  const startReading = useCallback(() => {
    const newProgress: ReadingProgress = {
      chapterId,
      chapterTitle,
      currentStep: 1,
      completedSteps: [],
      notes: [],
      startedAt: new Date().toISOString(),
    };
    saveReadingProgress(newProgress);
    setProgress(newProgress);
    return newProgress;
  }, [chapterId, chapterTitle]);

  const updateStep = useCallback((step: number, data: Partial<ReadingProgress>) => {
    if (!progress) return;
    const updated: ReadingProgress = {
      ...progress,
      ...data,
      currentStep: step,
    };
    if (!updated.completedSteps.includes(step)) {
      updated.completedSteps = [...updated.completedSteps, step];
    }
    saveReadingProgress(updated);
    setProgress(updated);
    return updated;
  }, [progress]);

  const addNote = useCallback((note: WordNote) => {
    if (!progress) return;
    const updated: ReadingProgress = {
      ...progress,
      notes: [...progress.notes, note],
    };
    saveReadingProgress(updated);
    setProgress(updated);
    return updated;
  }, [progress]);

  const completeReading = useCallback(() => {
    if (!progress) return;
    const updated: ReadingProgress = {
      ...progress,
      completedAt: new Date().toISOString(),
    };
    saveReadingProgress(updated);
    setProgress(updated);
    return updated;
  }, [progress]);

  const resetProgress = useCallback(() => {
    clearReadingProgress(chapterId);
    setProgress(null);
  }, [chapterId]);

  return {
    progress,
    loading,
    startReading,
    updateStep,
    addNote,
    completeReading,
    resetProgress,
  };
}
