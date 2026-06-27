import { create } from 'zustand';
import { LearningRecord, SubjectStats } from '@/services/supabaseService';

interface HistoryState {
  records: LearningRecord[];
  stats: Record<string, SubjectStats> | null;
  loading: boolean;
  setRecords: (records: LearningRecord[]) => void;
  addRecord: (record: LearningRecord) => void;
  updateRecord: (record: LearningRecord) => void;
  removeRecord: (id: string) => void;
  setStats: (stats: Record<string, SubjectStats> | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  records: [],
  stats: null,
  loading: false,
  setRecords: (records) => set({ records }),
  addRecord: (record) => set((state) => ({ records: [record, ...state.records] })),
  updateRecord: (record) => set((state) => ({
    records: state.records.map(r => r.id === record.id ? record : r),
  })),
  removeRecord: (id) => set((state) => ({ records: state.records.filter(r => r.id !== id) })),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ loading }),
}));
