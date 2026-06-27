import { Word } from './types';

const STORAGE_KEY = 'words_data';

export function loadWords(): Word[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Word[];
  } catch {
    return [];
  }
}

export function saveWords(words: Word[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch {
    // ignore
  }
}

export function resetProgress(words: Word[]): Word[] {
  return words.map(w => ({ ...w, mastered: false }));
}

export function importWords(jsonStr: string, overwrite: boolean = false): { words: Word[]; action: 'imported' | 'appended' } {
  let imported: Word[];
  try {
    imported = JSON.parse(jsonStr) as Word[];
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format');
    }
    // Validate structure
    imported = imported.filter(w => 
      w.word && typeof w.word === 'string' &&
      typeof w.phonetic === 'string' &&
      typeof w.meaning === 'string'
    );
    // Ensure all required fields
    imported = imported.map(w => ({
      word: w.word,
      phonetic: w.phonetic || '',
      meaning: w.meaning || '',
      collocations: w.collocations || '',
      example: w.example || '',
      synonyms: w.synonyms || '',
      antonyms: w.antonyms || '',
      mastered: w.mastered || false,
    }));
  } catch {
    throw new Error('JSON 解析失败，请检查格式');
  }

  if (overwrite) {
    return { words: imported, action: 'imported' };
  } else {
    const existing = loadWords();
    const existingWords = new Set(existing.map(w => w.word.toLowerCase()));
    const newWords = imported.filter(w => !existingWords.has(w.word.toLowerCase()));
    const merged = [...existing, ...newWords];
    saveWords(merged);
    return { words: merged, action: 'appended' };
  }
}

export function exportWords(words: Word[]): void {
  const blob = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `words_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
