/**
 * 英语单词解析器
 * 支持解析高频、中频、低频三个级别的单词文件
 */

import fs from 'fs';
import path from 'path';

export type FrequencyLevel = 'high' | 'medium' | 'low';

export interface ParsedWord {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaning: string;
  collocations: string[];
  example: string;
  translation: string;
  synonyms: string[];
  antonyms: string[];
  frequencyLevel: FrequencyLevel;
}

export interface WordWithAIFields extends ParsedWord {
  example: string;
  translation: string;
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
}

/**
 * 解析高频词或中频词的完整格式
 * 格式：**word** /phonetic/ pos.
 * - 释义：meaning
 * - 搭配：collocation1 | collocation2
 * - 例句：English sentence. 中文翻译。
 * - 同义：syn1, syn2
 * - 反义：ant1, ant2
 */
function parseFullFormat(content: string, level: FrequencyLevel): ParsedWord[] {
  const words: ParsedWord[] = [];

  // 匹配单词行： **word** /phonetic/ pos.
  const wordPattern = /\*\*([^*]+)\*\*\s*\/([^\/]+)\/\s*([^.\n]+)\./g;
  let match;

  // 用于存储当前正在解析的单词内容
  let currentWord: string | null = null;
  let currentPhonetic: string | null = null;
  let currentPOS: string | null = null;
  let contentStart = 0;

  // 先找到所有单词定义的位置
  const wordMatches: Array<{
    word: string;
    phonetic: string;
    pos: string;
    start: number;
    end: number;
  }> = [];

  const tempPattern = /\*\*([^*]+)\*\*\s*\/([^\/]+)\/\s*([^.\n]+)\./g;
  while ((match = tempPattern.exec(content)) !== null) {
    wordMatches.push({
      word: match[1].trim(),
      phonetic: match[2].trim(),
      pos: match[3].trim(),
      start: match.index,
      end: match.index + match[0].length,
    });
  }

  // 解析每个单词及其后续内容
  for (let i = 0; i < wordMatches.length; i++) {
    const current = wordMatches[i];
    const nextStart = i < wordMatches.length - 1 ? wordMatches[i + 1].start : content.length;

    const sectionContent = content.slice(current.end, nextStart);

    // 解析各字段（使用 [\s\S] 代替 . 来匹配换行符）
    const meaningMatch = sectionContent.match(/释义[：:]\s*([\s\S]+?)(?=\n-|\n\n|$)/);
    const collocationsMatch = sectionContent.match(/搭配[：:]\s*([\s\S]+?)(?=\n-|\n\n|$)/);
    const exampleMatch = sectionContent.match(/例句[：:]\s*([\s\S]+?)(?=\n-|\n\n|$)/);
    const synonymsMatch = sectionContent.match(/同义[：:]\s*([\s\S]+?)(?=\n-|\n\n|$)/);
    const antonymsMatch = sectionContent.match(/反义[：:]\s*([\s\S]+?)(?=\n-|\n\n|$)/);

    // 解析例句和翻译（格式：英文句子。中文翻译。）
    let example = '';
    let translation = '';
    if (exampleMatch) {
      const fullExample = exampleMatch[1].trim();
      // 查找最后一个中文句子作为翻译
      const transMatch = fullExample.match(/([^\.。]+[。\.])\s*([\u4e00-\u9fa5].*)$/);
      if (transMatch) {
        example = transMatch[1].trim();
        translation = transMatch[2].trim();
      } else {
        // 没有明确翻译，可能整个都是英文
        example = fullExample;
        translation = '';
      }
    }

    // 解析搭配（用 | 分隔）
    const collocations: string[] = [];
    if (collocationsMatch) {
      const collText = collocationsMatch[1].trim();
      collocations.push(...collText.split(/\s*\|\s*/).map(c => c.trim()).filter(c => c));
    }

    // 解析同义词
    const synonyms: string[] = [];
    if (synonymsMatch) {
      const synText = synonymsMatch[1].trim();
      synonyms.push(...synText.split(/[,，、]\s*/).map(s => s.trim()).filter(s => s));
    }

    // 解析反义词
    const antonyms: string[] = [];
    if (antonymsMatch) {
      const antText = antonymsMatch[1].trim();
      if (antText) { // 确保不是空字符串
        antonyms.push(...antText.split(/[,，、]\s*/).map(a => a.trim()).filter(a => a));
      }
    }

    words.push({
      word: current.word,
      phonetic: current.phonetic,
      partOfSpeech: current.pos,
      meaning: meaningMatch ? meaningMatch[1].trim() : '',
      collocations,
      example,
      translation,
      synonyms,
      antonyms,
      frequencyLevel: level,
    });
  }

  return words;
}

/**
 * 解析低频词的精简格式
 * 格式：**word** /phonetic/ pos. — meaning
 */
function parseSimpleFormat(content: string, level: FrequencyLevel): ParsedWord[] {
  const words: ParsedWord[] = [];

  // 低频词格式：**word** /phonetic/ pos. — meaning
  const pattern = /\*\*([^*]+)\*\*\s*\/([^\/]+)\/\s*([^—\n]+?)(?:—|-)\s*(.+?)(?:\n|$)/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    words.push({
      word: match[1].trim(),
      phonetic: match[2].trim(),
      partOfSpeech: match[3].trim(),
      meaning: match[4].trim(),
      collocations: [],
      example: '',
      translation: '',
      synonyms: [],
      antonyms: [],
      frequencyLevel: level,
    });
  }

  return words;
}

/**
 * 解析高频词文件
 */
export function parseHighFrequencyWords(filePath: string): ParsedWord[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseFullFormat(content, 'high');
}

/**
 * 解析中频词文件
 */
export function parseMediumFrequencyWords(filePath: string): ParsedWord[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseFullFormat(content, 'medium');
}

/**
 * 解析低频词文件
 */
export function parseLowFrequencyWords(filePath: string): ParsedWord[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseSimpleFormat(content, 'low');
}

/**
 * 解析所有三个文件
 */
export function parseAllWordFiles(basePath: string): ParsedWord[] {
  const allWords: ParsedWord[] = [];

  try {
    const highPath = path.join(basePath, '01-高频核心词.md');
    if (fs.existsSync(highPath)) {
      const highWords = parseHighFrequencyWords(highPath);
      console.log(`[单词解析] 高频词: ${highWords.length} 个`);
      allWords.push(...highWords);
    }
  } catch (e) {
    console.error('[单词解析] 高频词文件解析失败:', e);
  }

  try {
    const mediumPath = path.join(basePath, '02-中频词.md');
    if (fs.existsSync(mediumPath)) {
      const mediumWords = parseMediumFrequencyWords(mediumPath);
      console.log(`[单词解析] 中频词: ${mediumWords.length} 个`);
      allWords.push(...mediumWords);
    }
  } catch (e) {
    console.error('[单词解析] 中频词文件解析失败:', e);
  }

  try {
    const lowPath = path.join(basePath, '03-低频词.md');
    if (fs.existsSync(lowPath)) {
      const lowWords = parseLowFrequencyWords(lowPath);
      console.log(`[单词解析] 低频词: ${lowWords.length} 个`);
      allWords.push(...lowWords);
    }
  } catch (e) {
    console.error('[单词解析] 低频词文件解析失败:', e);
  }

  console.log(`[单词解析] 总计: ${allWords.length} 个单词`);

  // 去重（按单词小写）
  const seen = new Set<string>();
  const uniqueWords = allWords.filter(w => {
    const key = w.word.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`[单词解析] 去重后: ${uniqueWords.length} 个单词`);

  return uniqueWords;
}

/**
 * 生成用于AI补齐的prompt
 */
export function generateAIPrompt(word: ParsedWord): string {
  return `你是一位英语教学专家。请为单词"${word.word}"（词性：${word.partOfSpeech}，释义：${word.meaning}）生成以下内容：

1. 一个英文例句（体现该词用法）
2. 该例句的中文翻译
3. 3-5个常用搭配（用 | 分隔）
4. 3-5个同义词（用 , 分隔）
5. 3-5个反义词（用 , 分隔，如果没有合适的可以为空）

请严格按照以下JSON格式输出，不要包含任何其他内容：
{
  "example": "英文例句",
  "translation": "中文翻译",
  "collocations": ["搭配1", "搭配2", "搭配3"],
  "synonyms": ["同义词1", "同义词2"],
  "antonyms": ["反义词1"]
}`;
}

/**
 * 解析AI返回的JSON
 */
export function parseAIResponse(jsonStr: string): {
  example: string;
  translation: string;
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
} | null {
  try {
    // 尝试提取JSON（可能包含在代码块中）
    let cleanJson = jsonStr.trim();
    const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    }
    const parsed = JSON.parse(cleanJson);
    return {
      example: parsed.example || '',
      translation: parsed.translation || '',
      collocations: Array.isArray(parsed.collocations) ? parsed.collocations : [],
      synonyms: Array.isArray(parsed.synonyms) ? parsed.synonyms : [],
      antonyms: Array.isArray(parsed.antonyms) ? parsed.antonyms : [],
    };
  } catch {
    return null;
  }
}

/**
 * 合并AI补齐的内容到单词对象
 */
export function mergeAIFields(word: ParsedWord, aiFields: {
  example: string;
  translation: string;
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
}): ParsedWord {
  return {
    ...word,
    // 如果原单词没有这些字段，使用AI生成的
    example: word.example || aiFields.example,
    translation: word.translation || aiFields.translation,
    collocations: word.collocations.length > 0 ? word.collocations : aiFields.collocations,
    synonyms: word.synonyms.length > 0 ? word.synonyms : aiFields.synonyms,
    antonyms: word.antonyms.length > 0 ? word.antonyms : aiFields.antonyms,
  };
}

/**
 * 统计各频率级别的单词数量
 */
export function countByLevel(words: ParsedWord[]): Record<FrequencyLevel, number> {
  const counts: Record<FrequencyLevel, number> = {
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const w of words) {
    counts[w.frequencyLevel]++;
  }
  return counts;
}
