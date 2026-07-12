/**
 * 数学错题纠正状态管理
 * 管理拍照 -> 识别 -> 导师引导 -> 变式巩固的完整流程
 */

import { create } from 'zustand';

export type RemediationStatus = 'idle' | 'scanning' | 'tutoring' | 'mastered';

export interface TutorMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
}

export interface WrongQuestionData {
  id: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  knowledgePoint: string;
  imageUrl?: string;
  recognizedText?: string;
  stepAnalysis?: Array<{
    step: number;
    content: string;
    isCorrect: boolean;
    comment: string;
  }>;
}

export interface RemediationState {
  // 当前状态
  status: RemediationStatus;
  
  // 错题数据
  currentQuestion: WrongQuestionData | null;
  
  // 对话历史
  messages: TutorMessage[];
  
  // 当前轮次（用于苏格拉底引导）
  currentTurn: number;
  consecutiveErrors: number;
  
  // 变式题
  similarQuestion: {
    id: string;
    text: string;
    type: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  } | null;
  
  // 进度
  progress: {
    current: number;
    total: number;
  };

  // Actions
  setStatus: (status: RemediationStatus) => void;
  setCurrentQuestion: (question: WrongQuestionData | null) => void;
  addMessage: (role: 'ai' | 'user', content: string) => void;
  clearMessages: () => void;
  incrementTurn: () => void;
  incrementError: () => void;
  resetErrors: () => void;
  setSimilarQuestion: (question: RemediationState['similarQuestion']) => void;
  setProgress: (current: number, total: number) => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as RemediationStatus,
  currentQuestion: null,
  messages: [],
  currentTurn: 0,
  consecutiveErrors: 0,
  similarQuestion: null,
  progress: { current: 1, total: 4 },
};

export const useRemediationStore = create<RemediationState>((set) => ({
  ...initialState,

  setStatus: (status) => set({ status }),

  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  addMessage: (role, content) => set((state) => ({
    messages: [
      ...state.messages,
      {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role,
        content,
        timestamp: Date.now(),
      },
    ],
  })),

  clearMessages: () => set({ messages: [] }),

  incrementTurn: () => set((state) => ({ currentTurn: state.currentTurn + 1 })),

  incrementError: () => set((state) => ({ 
    consecutiveErrors: state.consecutiveErrors + 1,
    currentTurn: state.consecutiveErrors >= 2 ? state.currentTurn : state.currentTurn,
  })),

  resetErrors: () => set({ consecutiveErrors: 0 }),

  setSimilarQuestion: (question) => set({ similarQuestion: question }),

  setProgress: (current, total) => set({ progress: { current, total } }),

  reset: () => set(initialState),
}));
