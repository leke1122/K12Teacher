'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Volume2, Copy, Check, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WordRecord {
  id: string;
  word: string;
  phonetic: string;
  part_of_speech: string;
  meaning: string;
  example: string;
  translation: string;
  collocations: string[];
  synonyms: string[];
  antonyms: string[];
  frequency_level: 'high' | 'medium' | 'low';
}

// 发音函数
function speakWord(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}

// 助记技巧生成（简单的基于词缀的记忆方法）
function generateMemoryTips(word: string, meaning: string): string[] {
  const tips: string[] = [];
  
  // 简单的词缀记忆
  const prefixes: Record<string, string> = {
    'un': '表示"不、非"',
    're': '表示"再次、重新"',
    'pre': '表示"在...之前"',
    'dis': '表示"相反、否定"',
    'mis': '表示"错误、坏"',
    'over': '表示"过度、超过"',
    'under': '表示"在...下面"',
  };
  
  const suffixes: Record<string, string> = {
    'tion': '表示名词',
    'ment': '表示名词、行为',
    'ness': '表示名词、状态',
    'able': '表示"能...的"',
    'ful': '表示"充满...的"',
    'less': '表示"无、没有"',
    'ly': '表示副词',
    'er': '表示"...的人"',
  };
  
  for (const [prefix, meaning] of Object.entries(prefixes)) {
    if (word.startsWith(prefix)) {
      tips.push(`"${prefix}"是常见前缀，${meaning}`);
      break;
    }
  }
  
  for (const [suffix, meaning] of Object.entries(suffixes)) {
    if (word.endsWith(suffix)) {
      tips.push(`"${suffix}"是常见后缀，${meaning}`);
      break;
    }
  }
  
  // 基于意思的联想记忆
  if (meaning.includes('重要的')) {
    tips.push('联想：important → 重要的东西才需要记住');
  }
  if (meaning.includes('困难')) {
    tips.push('联想：difficult → 谐音"弟父哭的"→ 遇到困难想哭');
  }
  if (meaning.includes('快速')) {
    tips.push('联想：quick → 谐音"快来"→ 快来!');
  }
  
  return tips;
}

// 复制到剪贴板
function useCopy() {
  const [copied, setCopied] = useState(false);
  
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };
  
  return { copied, copy };
}

export default function WordDetailDialog({
  word,
  open,
  onOpenChange,
}: {
  word: WordRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { copied, copy } = useCopy();
  const memoryTips = word ? generateMemoryTips(word.word, word.meaning) : [];
  
  if (!word) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="text-2xl font-bold text-slate-800">{word.word}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 mt-2">
          {/* 单词信息 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg text-slate-500">{word.phonetic}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => speakWord(word.word)}
              >
                <Volume2 className="h-4 w-4 text-slate-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => copy(word.word)}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-500" />
                )}
              </Button>
            </div>
            <Badge variant="outline">{word.part_of_speech}</Badge>
            <Badge className={cn(
              word.frequency_level === 'high' && 'bg-red-100 text-red-700',
              word.frequency_level === 'medium' && 'bg-amber-100 text-amber-700',
              word.frequency_level === 'low' && 'bg-green-100 text-green-700',
            )}>
              {word.frequency_level === 'high' ? '高频' : word.frequency_level === 'medium' ? '中频' : '低频'}
            </Badge>
          </div>
          
          {/* 释义 */}
          <div className="p-4 bg-indigo-50 rounded-xl">
            <p className="text-lg font-medium text-indigo-900">{word.meaning}</p>
          </div>
          
          {/* 例句 */}
          {word.example && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase">例句</p>
              <p className="text-slate-700 italic">{word.example}</p>
              {word.translation && (
                <p className="text-sm text-slate-500 mt-2">{word.translation}</p>
              )}
            </div>
          )}
          
          {/* 常用搭配 */}
          {word.collocations.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase">常用搭配</p>
              <div className="flex flex-wrap gap-2">
                {word.collocations.map((c, i) => (
                  <Badge key={i} variant="outline" className="bg-white">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* 同义词 */}
          {word.synonyms.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase">同义词</p>
              <div className="flex flex-wrap gap-2">
                {word.synonyms.map((s, i) => (
                  <Badge key={i} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* 反义词 */}
          {word.antonyms.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase">反义词</p>
              <div className="flex flex-wrap gap-2">
                {word.antonyms.map((a, i) => (
                  <Badge key={i} variant="outline" className="border-red-200 text-red-600">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* 记忆技巧 */}
          {memoryTips.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-600 mb-2 font-medium flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                记忆技巧
              </p>
              <ul className="space-y-1">
                {memoryTips.map((tip, i) => (
                  <li key={i} className="text-sm text-amber-800">
                    • {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
