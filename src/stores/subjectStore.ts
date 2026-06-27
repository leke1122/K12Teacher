import { create } from 'zustand';

export const SUBJECTS = [
  { id: 'math', name: '数学', icon: '📐', color: '#4F46E5' },
  { id: 'physics', name: '物理', icon: '⚛️', color: '#10B981' },
  { id: 'chemistry', name: '化学', icon: '🧪', color: '#F59E0B' },
  { id: 'english', name: '英语', icon: '🔤', color: '#EF4444' },
  { id: 'chinese', name: '语文', icon: '📖', color: '#8B5CF6' },
  { id: 'biology', name: '生物', icon: '🧬', color: '#22D3EE' },
  { id: 'geography', name: '地理', icon: '🌍', color: '#34D399' },
  { id: 'politics', name: '政治', icon: '📜', color: '#F472B6' },
  { id: 'history', name: '历史', icon: '🏛️', color: '#FBBF24' },
] as const;

interface SubjectStore {
  currentSubject: string;
  setCurrentSubject: (id: string) => void;
}

export const useSubjectStore = create<SubjectStore>((set) => ({
  currentSubject: 'math',
  setCurrentSubject: (id) => set({ currentSubject: id })
}));
