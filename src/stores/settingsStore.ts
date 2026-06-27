import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Settings } from '@/types/settings';

const defaultSettings: Settings = {
  deepseekKey: '',
  qwenKey: '',
  apiProvider: 'deepseek',
  defaultModel: 'deepseek',
  temperature: 0.7,
  maxTokens: 2048,
  streaming: true,
};

interface SettingsStore {
  settings: Settings;
  setSettings: (settings: Settings) => void;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  clearSettings: () => void;
}

// 自定义 storage，只在客户端有效
const storage = typeof window !== 'undefined' 
  ? createJSONStorage(() => localStorage)
  : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      setSettings: (settings) => set({ settings: { ...defaultSettings, ...settings } }),
      updateSetting: (key, value) =>
        set((state) => ({
          settings: state.settings ? { ...state.settings, [key]: value } : { ...defaultSettings, [key]: value }
        })),
      clearSettings: () => set({ settings: defaultSettings })
    }),
    { 
      name: 'edumind-settings',
      storage
    }
  )
);
