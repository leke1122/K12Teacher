export interface Word {
  word: string;
  phonetic: string;
  meaning: string;
  collocations: string;
  example: string;
  synonyms: string;
  antonyms: string;
  mastered: boolean;
}

export type PracticeMode = 'chinese-to-english' | 'pronunciation-to-english';
export type PracticeScope = 'unmastered' | 'all';
export type TabType = 'home' | 'learn' | 'practice' | 'settings';

export interface PracticeStats {
  correct: number;
  wrong: number;
  remaining: number;
}
