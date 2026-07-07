'use client';

import { Word } from '@/data/words/types';
import { Button } from '@/components/ui/button';
import { Volume2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface WordCardProps {
  word: Word;
  currentIndex: number;
  totalWords: number;
  onPrevious: () => void;
  onNext: () => void;
  onMastered: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}

export function WordCard({
  word,
  currentIndex,
  totalWords,
  onPrevious,
  onNext,
  onMastered,
  hasPrevious,
  hasNext,
}: WordCardProps) {
  const speak = () => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const memoryTip = generateMemoryTip(word.word);

  return (
    <div className="space-y-4">
      {/* 单词卡片 */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        {/* 单词和音标 */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">
              {word.word}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={speak}
              className="h-10 w-10 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </Button>
          </div>
          {word.phonetic && (
            <p className="text-lg text-slate-600 dark:text-slate-300 font-mono">
              {word.phonetic}
            </p>
          )}
        </div>

        {/* 记忆小贴士 */}
        {memoryTip && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              💡 {memoryTip}
            </p>
          </div>
        )}

        {/* 释义 */}
        {word.meaning && (
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              释义
            </h3>
            <p className="text-base text-slate-600 dark:text-slate-400">
              {word.meaning}
            </p>
          </div>
        )}

        {/* 搭配 */}
        {word.collocations && (
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              常用搭配
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {word.collocations}
            </p>
          </div>
        )}

        {/* 例句 */}
        {word.example && (
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              例句
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
              {word.example}
            </p>
          </div>
        )}

        {/* 同义词和反义词 */}
        <div className="grid grid-cols-2 gap-3">
          {word.synonyms && (
            <div>
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
                同义词
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                {word.synonyms}
              </p>
            </div>
          )}
          {word.antonyms && (
            <div>
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                反义词
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {word.antonyms}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 进度条 */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>学习进度</span>
          <span>{currentIndex + 1} / {totalWords}</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalWords) * 100}%` }}
          />
        </div>
      </div>

      {/* 按钮组 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!hasPrevious}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          上一个
        </Button>
        <Button
          variant="default"
          onClick={onMastered}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Check className="h-4 w-4 mr-1" />
          已掌握
        </Button>
        <Button
          variant="outline"
          onClick={onNext}
          disabled={!hasNext}
          className="flex-1"
        >
          下一个
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function generateMemoryTip(word: string): string {
  const lower = word.toLowerCase().trim();
  
  // 常见词根/前缀/后缀检测
  const affixRules: [RegExp, string][] = [
    [/^(un|dis|re|pre|mis|over|under|out|sub|inter|trans|super|anti|semi|multi|auto|bio|geo|micro|macro|tele|photo|hydro|thermo)/i, '前缀'],
    [/(tion|sion|ment|ness|ity|ty|er|or|ist|ism|ship|age|ance|ence|dom|hood|ure|al|ial|ical|ous|ive|able|ible|ful|less|ly|ize|ise|fy|en|ed|ing|s|es|ies|est)$/i, '后缀'],
  ];

  for (const [regex, type] of affixRules) {
    const match = lower.match(regex);
    if (match) {
      const matched = match[0];
      const rest = lower.slice(matched.length);
      if (rest.length >= 2) {
        return `提示：${type} "${matched}"，剩余部分 "${rest}" 可联想记忆`;
      }
    }
  }

  // 音节拆分（简单启发式）
  const syllables = splitSyllables(lower);
  if (syllables.length >= 2) {
    return `音节拆分：${syllables.join(' · ')}，可分段记忆`;
  }

  // 谐音联想（简化版）
  const homophoneHints: Record<string, string> = {
    abandon: '啊，板凳！',
    ambitious: '俺必胜',
    appreciate: '俺普瑞溪ate（珍惜）',
    candidate: '看弟date（候选人）',
    decade: '弟克（十年）',
    deliberate: '低波瑞特（故意的）',
    eliminate: '伊莉咪呢特（消除）',
    guarantee: '瓜兰梯（保证）',
    harass: '哈瑞斯（骚扰）',
    immediate: '伊媒迪ate（立即）',
    jealous: '捷而乐斯（嫉妒）',
    knowledge: '诺利基（知识）',
    leisure: '雷泽尔（休闲）',
    miserable: '密岁波（痛苦的）',
    numerous: '弄缪拉斯（许多的）',
    occasion: '哦开申（场合）',
    peculiar: '配丘利尔（独特的）',
    quarantine: '宽特润（隔离）',
    resume: '瑞zu（简历）',
    schedule: '斯凯德朱（时间表）',
    tremendous: '川门德丝（巨大的）',
    vegetable: 'vedz台波（蔬菜）',
  };

  if (homophoneHints[lower]) {
    return `谐音联想：${homophoneHints[lower]}`;
  }

  return '尝试用词根或联想记忆';
}

function splitSyllables(word: string): string[] {
  if (word.length <= 3) return [word];
  
  const result: string[] = [];
  let current = '';
  
  for (let i = 0; i < word.length; i++) {
    current += word[i];
    const remaining = word.length - i - 1;
    
    // 元音后分割
    if (remaining > 2 && /[aeiouy]/.test(word[i]) && !/[aeiouy]/.test(word[i + 1] || '')) {
      if (current.length >= 2) {
        result.push(current);
        current = '';
      }
    }
  }
  
  if (current) {
    result.push(current);
  }
  
  if (result.length === 0) {
    return [word];
  }
  
  return result;
}
