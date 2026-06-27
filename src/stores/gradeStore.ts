// 用户年级管理
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Grade = 'grade1' | 'grade2' | 'grade3';

export const GRADE_LABELS: Record<Grade, string> = {
  grade1: '高一',
  grade2: '高二',
  grade3: '高三',
};

export const GRADE_TIMER_PRESETS: Record<Grade, { work: number; break: number }> = {
  grade1: { work: 25, break: 5 },
  grade2: { work: 30, break: 5 },
  grade3: { work: 45, break: 10 },
};

interface UserGradeStore {
  grade: Grade;
  setGrade: (grade: Grade) => void;
}

const clientStorage = typeof window !== 'undefined'
  ? createJSONStorage(() => localStorage)
  : { getItem: () => null, setItem: () => {}, removeItem: () => {} };

export const useUserGradeStore = create<UserGradeStore>()(
  persist(
    (set) => ({
      grade: 'grade1',
      setGrade: (grade) => set({ grade }),
    }),
    { name: 'edumind-user-grade', storage: clientStorage }
  )
);

// 便捷的年级标签获取
export function getGradeLabel(grade: Grade): string {
  return GRADE_LABELS[grade];
}

// 便捷的计时器预设获取
export function getTimerPreset(grade: Grade) {
  return GRADE_TIMER_PRESETS[grade];
}
