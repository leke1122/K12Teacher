import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PDFState {
  pdfText: string | null;
  pdfData: Record<string, unknown> | null;
  chapters: Record<string, unknown>[] | null;
  setPdfText: (text: string | null) => void;
  setPdfData: (data: Record<string, unknown> | null) => void;
  setChapters: (chapters: Record<string, unknown>[] | null) => void;
  clearPdfData: () => void;
}

// 自定义 storage，只在客户端有效
const storage = typeof window !== 'undefined' 
  ? createJSONStorage(() => localStorage)
  : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };

export const usePdfStore = create<PDFState>()(
  persist(
    (set) => ({
      pdfText: null,
      pdfData: null,
      chapters: null,
      setPdfText: (text) => set({ pdfText: text }),
      setPdfData: (data) => set({ pdfData: data }),
      setChapters: (chapters) => set({ chapters }),
      clearPdfData: () => set({ pdfText: null, pdfData: null, chapters: null }),
    }),
    { 
      name: 'edumind-pdf-data',
      storage
    }
  )
);

// 导出 getPdfStore 以兼容旧代码
export const getPdfStore = () => usePdfStore;
