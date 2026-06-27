import { create } from 'zustand';

type LearningMode = 'KNOWLEDGE' | 'TEXTBOOK' | null;

interface ProgressData {
  currentPoint?: number;
  step?: number;
  page?: number;
  sentenceIndex?: number;
  [key: string]: number | string | undefined;
}

interface LearningStore {
  currentChapter: string | null;
  mode: LearningMode;
  progress: ProgressData | null;
  setChapter: (id: string) => void;
  setMode: (mode: LearningMode) => void;
  updateProgress: (data: ProgressData) => void;
}

export const useLearningStore = create<LearningStore>((set) => ({
  currentChapter: null,
  mode: null,
  progress: null,
  setChapter: (id) => set({ currentChapter: id }),
  setMode: (mode) => set({ mode }),
  updateProgress: (data) => set({ progress: data })
}));
