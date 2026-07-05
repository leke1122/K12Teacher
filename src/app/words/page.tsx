'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  BookOpen, Volume2, Shuffle, ChevronLeft, ChevronRight,
  CheckCircle, RotateCcw, SkipForward, Sparkles, Target,
  Flame, Award, Trophy, AlertCircle, Clock, Zap, Bell
} from 'lucide-react';
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

interface Stats {
  total: number;
  learned: number;
  mastered: number;
  toReview: number;
  todayLearned: number;
  streakDays: number;
  weeklyLearned: number;
  totalAccuracy: number;
}

interface PracticeResult {
  word: WordRecord;
  correct: boolean;
  userAnswer: string;
}

const DAILY_GOALS = [10, 20, 30, 50, 100];

// 发音函数
function speakWord(text: string, lang: string = 'en-US') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith('en'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}

// 发音按钮组件
function SpeakButton({ text, className }: { text: string; className?: string }) {
  const [speaking, setSpeaking] = useState(false);
  
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      speakWord(text);
      // 使用 onend 事件
      const handleEnd = () => setSpeaking(false);
      window.speechSynthesis.addEventListener('end', handleEnd, { once: true });
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8 rounded-full flex-shrink-0', className)}
      onClick={handleSpeak}
    >
      {speaking ? (
        <Volume2 className="h-4 w-4 text-indigo-500 animate-pulse" />
      ) : (
        <Volume2 className="h-4 w-4 text-slate-400 hover:text-indigo-500" />
      )}
    </Button>
  );
}

// 横向双栏单词卡片组件
function WordCard({
  word,
  onMaster,
  onSkip,
}: {
  word: WordRecord;
  onMaster: () => void;
  onSkip: () => void;
}) {
  const levelStyles = {
    high: {
      border: 'border-red-300',
      header: 'bg-gradient-to-r from-red-50 to-orange-50',
      badge: 'bg-red-100 text-red-700 border-red-200',
    },
    medium: {
      border: 'border-amber-300',
      header: 'bg-gradient-to-r from-amber-50 to-yellow-50',
      badge: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    low: {
      border: 'border-green-300',
      header: 'bg-gradient-to-r from-green-50 to-emerald-50',
      badge: 'bg-green-100 text-green-700 border-green-200',
    },
  };

  const style = levelStyles[word.frequency_level];

  return (
    <Card className={cn('border-2 shadow-lg overflow-hidden', style.border)}>
      <CardContent className="p-0">
        {/* 卡片头部 - 单词信息 */}
        <div className={cn('px-5 py-4 border-b', style.header)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-800">
                {word.word}
              </h2>
              <SpeakButton text={word.word} />
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn('text-xs', style.badge)}>
                {word.frequency_level === 'high' ? '高频核心词' : word.frequency_level === 'medium' ? '中频词' : '低频词'}
              </Badge>
              {word.part_of_speech && (
                <Badge variant="outline" className="text-xs bg-white/60">
                  {word.part_of_speech}
                </Badge>
              )}
            </div>
          </div>
          {word.phonetic && (
            <p className="text-base text-slate-500 mt-1">{word.phonetic}</p>
          )}
        </div>

        {/* 双栏内容区域 */}
        <div className="flex min-h-[320px]">
          {/* 左侧 - 英文内容 */}
          <div className="flex-1 p-5 border-r border-slate-100">
            {word.example && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1">
                  <span className="text-indigo-500">📝</span> 例句
                </p>
                <p className="text-slate-700 italic leading-relaxed">
                  {word.example}
                </p>
                {word.translation && (
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    {word.translation}
                  </p>
                )}
              </div>
            )}

            {word.collocations.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1">
                  <span className="text-indigo-500">🔗</span> 常用搭配
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {word.collocations.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2.5 py-1 bg-slate-100 rounded-md text-sm text-slate-600"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧 - 中文内容 */}
          <div className="flex-1 p-5 bg-slate-50/50">
            <div className="mb-4">
              <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1">
                <span className="text-indigo-500">📖</span> 释义
              </p>
              <p className="text-xl font-semibold text-slate-800 leading-relaxed">
                {word.meaning}
              </p>
              {word.translation && (
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  {word.translation}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {word.synonyms.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1">
                    <span className="text-green-500">同</span> 同义词
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {word.synonyms.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {word.antonyms.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-1">
                    <span className="text-red-500">反</span> 反义词
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {word.antonyms.map((a, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-red-200 text-red-600 bg-red-50/50">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="px-5 py-3 bg-slate-50 border-t flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
            className="flex items-center gap-1"
          >
            <SkipForward className="h-4 w-4" />
            跳过
          </Button>
          <Button
            size="sm"
            onClick={onMaster}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-6"
          >
            <CheckCircle className="h-4 w-4" />
            已掌握
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 复习拼写练习组件
function PracticeMode({
  words,
  onComplete,
}: {
  words: WordRecord[];
  onComplete: (results: PracticeResult[]) => void;
}) {
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [results, setResults] = useState<PracticeResult[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const word = words[practiceIndex];
  
  useEffect(() => {
    setInput('');
    setResult(null);
    setIsTransitioning(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [practiceIndex, word?.id]);
  
  const handleCheck = useCallback(() => {
    if (!input.trim() || result === 'correct' || !word) return;
    
    const normalizedInput = input.trim().toLowerCase();
    const normalizedWord = word.word.toLowerCase();
    
    if (normalizedInput === normalizedWord) {
      setResult('correct');
      setIsTransitioning(true);
      
      setResults(prev => [...prev, {
        word,
        correct: true,
        userAnswer: input.trim()
      }]);
      
      setTimeout(() => {
        if (practiceIndex < words.length - 1) {
          setPracticeIndex(prev => prev + 1);
        } else {
          onComplete([...results, { word, correct: true, userAnswer: input.trim() }]);
        }
      }, 1200);
    } else {
      setResult('wrong');
      
      setResults(prev => [...prev, {
        word,
        correct: false,
        userAnswer: input.trim()
      }]);
      
      // 记录错词
      fetch('/api/wrong-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: 'english',
          question: word.meaning,
          correctAnswer: word.word,
          userAnswer: input.trim(),
        }),
      });
    }
  }, [input, result, word, practiceIndex, words.length, results, onComplete]);
  
  const handleNextAfterWrong = () => {
    setIsTransitioning(true);
    if (practiceIndex < words.length - 1) {
      setPracticeIndex(prev => prev + 1);
    } else {
      onComplete(results);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (result === 'wrong') {
        handleNextAfterWrong();
      } else if (!result) {
        handleCheck();
      }
    }
  };
  
  const correctCount = results.filter(r => r.correct).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
  
  if (!word) return null;
  
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">
            进度：{practiceIndex + 1} / {words.length}
          </span>
          <span className={cn(
            'font-medium',
            accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-amber-600' : 'text-red-600'
          )}>
            正确率：{accuracy}%
          </span>
        </div>
        <Progress value={((practiceIndex + 1) / words.length) * 100} className="h-2" />
      </div>
      
      <Card className={cn(
        'border-2 transition-all duration-300',
        result === 'correct' && 'border-green-400 bg-green-50',
        result === 'wrong' && 'border-red-400 bg-red-50',
        !result && 'border-indigo-200'
      )}>
        <CardContent className="p-6">
          <p className="text-xs text-slate-500 mb-3 text-center">请拼写出这个单词</p>
          <div className="flex items-center justify-center gap-3 mb-4">
            <p className="text-xl font-bold text-indigo-700">
              {word.meaning}
            </p>
            <SpeakButton text={word.word} />
          </div>
          
          {result === 'correct' && (
            <div className="text-center animate-bounce">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-700 font-medium">回答正确！</span>
              </div>
            </div>
          )}
          
          {result === 'wrong' && (
            <div className="p-3 bg-white/80 rounded-lg text-center">
              <p className="text-sm text-slate-600 mb-1">
                正确拼写：<span className="font-bold text-green-600 text-lg">{word.word}</span>
              </p>
              {input.trim().toLowerCase() !== word.word.toLowerCase() && (
                <p className="text-xs text-red-500">
                  你的答案：{input.trim()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (result === 'wrong') setResult(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="输入英文拼写..."
          disabled={result === 'correct' || isTransitioning}
          className={cn(
            'w-full h-14 px-4 text-center text-xl border-2 rounded-xl transition-all duration-300 outline-none',
            result === 'correct' && 'border-green-500 bg-green-50 ring-2 ring-green-200',
            result === 'wrong' && 'border-red-500 bg-red-50 ring-2 ring-red-200',
            !result && 'border-slate-200 focus:border-indigo-400'
          )}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {result === 'correct' && (
          <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-green-500 animate-pulse" />
        )}
        {result === 'wrong' && (
          <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-red-500" />
        )}
      </div>
      
      <div className="flex justify-center gap-3">
        {result === 'wrong' ? (
          <Button onClick={handleNextAfterWrong} className="min-w-[120px]">
            下一题
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleCheck}
            disabled={!input.trim() || result === 'correct' || isTransitioning}
            className="min-w-[120px]"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            检查
          </Button>
        )}
      </div>
      
      <p className="text-center text-xs text-slate-400">
        按 Enter 键提交答案
      </p>
    </div>
  );
}

// 练习完成页面
function PracticeComplete({
  results,
  onRestart,
  onBack,
}: {
  results: PracticeResult[];
  onRestart: () => void;
  onBack: () => void;
}) {
  const correctCount = results.filter(r => r.correct).length;
  const wrongResults = results.filter(r => !r.correct);
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
  
  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <div className={cn(
        'w-20 h-20 mx-auto rounded-full flex items-center justify-center',
        accuracy >= 80 ? 'bg-green-100' : accuracy >= 60 ? 'bg-amber-100' : 'bg-red-100'
      )}>
        {accuracy >= 80 ? (
          <Trophy className="h-10 w-10 text-green-600" />
        ) : accuracy >= 60 ? (
          <Target className="h-10 w-10 text-amber-600" />
        ) : (
          <RotateCcw className="h-10 w-10 text-red-600" />
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {accuracy >= 80 ? '太棒了！' : accuracy >= 60 ? '不错的表现！' : '继续加油！'}
        </h2>
        <p className="text-slate-500">练习完成</p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-3xl font-bold text-slate-800">{results.length}</p>
              <p className="text-sm text-slate-500">总题数</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{correctCount}</p>
              <p className="text-sm text-slate-500">正确</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">{wrongResults.length}</p>
              <p className="text-sm text-slate-500">错误</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {wrongResults.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-700 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              已记录到错词本（{wrongResults.length}个）
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {wrongResults.map((r, i) => (
                <Badge key={i} variant="outline" className="bg-white border-red-200 text-red-600">
                  {r.word.word}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-center gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-1">
          返回学习
        </Button>
        <Button onClick={onRestart} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700">
          <RotateCcw className="h-4 w-4 mr-1" />
          重新练习
        </Button>
      </div>
    </div>
  );
}

// 激励语
function getMotivationalMessage(streakDays: number) {
  if (streakDays === 0) return { emoji: '🚀', text: '开始你的学习之旅吧！', color: 'text-indigo-600' };
  if (streakDays === 1) return { emoji: '🌱', text: '好的开始！继续加油！', color: 'text-green-600' };
  if (streakDays < 7) return { emoji: '🔥', text: '保持势头！', color: 'text-amber-600' };
  if (streakDays < 30) return { emoji: '⭐', text: '太棒了！坚持一周以上！', color: 'text-yellow-600' };
  if (streakDays < 100) return { emoji: '🏆', text: '学习达人！', color: 'text-orange-600' };
  return { emoji: '👑', text: '王者归来！', color: 'text-purple-600' };
}

// 通知权限按钮
function NotificationButton({ onGranted }: { onGranted: () => void }) {
  const [granting, setGranting] = useState(false);
  
  const requestPermission = async () => {
    setGranting(true);
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') onGranted();
      }
    } finally {
      setGranting(false);
    }
  };
  
  return (
    <Button variant="outline" size="sm" onClick={requestPermission} disabled={granting} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
      <Bell className="h-4 w-4 mr-1" />
      开启提醒
    </Button>
  );
}

// 统计仪表盘
function StatsDashboard({ 
  stats, 
  dailyGoal, 
  onGoalChange,
  wrongCount,
  onWrongReview,
  onStatsClick,
  notificationsEnabled,
  onEnableNotifications,
}: { 
  stats: Stats; 
  dailyGoal: number;
  onGoalChange: (goal: number) => void;
  wrongCount: number;
  onWrongReview: () => void;
  onStatsClick: () => void;
  notificationsEnabled: boolean;
  onEnableNotifications: () => void;
}) {
  const goalProgress = Math.min((stats.todayLearned / dailyGoal) * 100, 100);
  const goalReached = stats.todayLearned >= dailyGoal;
  const motivation = getMotivationalMessage(stats.streakDays);
  
  return (
    <div className="space-y-3">
      {/* 目标进度 */}
      <Card className={cn(goalReached && 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200')}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium">今日目标</span>
            </div>
            <div className="flex items-center gap-2">
              {goalReached && (
                <Badge className="bg-green-100 text-green-700 text-xs animate-pulse">
                  <Sparkles className="h-3 w-3 mr-0.5" />
                  已完成
                </Badge>
              )}
              <Select value={dailyGoal.toString()} onValueChange={v => onGoalChange(parseInt(v))}>
                <SelectTrigger className="w-20 h-7 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAILY_GOALS.map(goal => (
                    <SelectItem key={goal} value={goal.toString()}>{goal}词</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={goalProgress} className="h-2 flex-1" />
            <span className="text-sm font-medium w-14 text-right">{stats.todayLearned}/{dailyGoal}</span>
          </div>
          <p className={cn('text-xs mt-1 text-center', motivation.color)}>
            {motivation.emoji} {motivation.text}
          </p>
        </CardContent>
      </Card>
      
      {/* 统计网格 */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={onStatsClick} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-2.5 text-center hover:opacity-80 transition-opacity">
          <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-500" />
          <p className="text-lg font-bold text-slate-800">{stats.total}</p>
          <p className="text-xs text-slate-500">总词数</p>
        </button>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-2.5 text-center">
          <Award className="h-4 w-4 mx-auto mb-1 text-green-500" />
          <p className="text-lg font-bold text-slate-800">{stats.mastered}</p>
          <p className="text-xs text-slate-500">已掌握</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-2.5 text-center">
          <Zap className="h-4 w-4 mx-auto mb-1 text-amber-500" />
          <p className="text-lg font-bold text-slate-800">{stats.weeklyLearned}</p>
          <p className="text-xs text-slate-500">本周</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 rounded-xl p-2.5 text-center">
          <Flame className="h-4 w-4 mx-auto mb-1 text-red-500" />
          <p className="text-lg font-bold text-slate-800">{stats.streakDays}</p>
          <p className="text-xs text-slate-500">连续天</p>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-2">
        {wrongCount > 0 && (
          <Button variant="outline" className="flex-1 justify-start text-red-600 border-red-200 hover:bg-red-50" onClick={onWrongReview}>
            <AlertCircle className="h-4 w-4 mr-2" />
            错词复习 ({wrongCount})
          </Button>
        )}
        {!notificationsEnabled && <NotificationButton onGranted={onEnableNotifications} />}
      </div>
    </div>
  );
}

// 主页面
export default function WordsPage() {
  const [words, setWords] = useState<WordRecord[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0, learned: 0, mastered: 0, toReview: 0, todayLearned: 0, streakDays: 0, weeklyLearned: 0, totalAccuracy: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [frequency, setFrequency] = useState<'high' | 'medium' | 'low' | 'all'>('high');
  const [mode, setMode] = useState<'learn' | 'practice'>('learn');
  const [reviewWords, setReviewWords] = useState<WordRecord[]>([]);
  const [dailyGoal, setDailyGoal] = useState(20);
  const [wrongCount, setWrongCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const [practiceResults, setPracticeResults] = useState<PracticeResult[]>([]);
  const [practiceMode, setPracticeMode] = useState<'practice' | 'complete'>('practice');
  
  const [studyTime, setStudyTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentWord = words[currentIndex] || null;
  
  // 加载设置
  useEffect(() => {
    const savedGoal = localStorage.getItem('dailyGoal');
    if (savedGoal) setDailyGoal(parseInt(savedGoal));
    
    const savedNotif = localStorage.getItem('notificationsEnabled');
    if (savedNotif === 'true' && 'Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);
  
  const handleGoalChange = (goal: number) => {
    setDailyGoal(goal);
    localStorage.setItem('dailyGoal', goal.toString());
  };
  
  // 计时器
  useEffect(() => {
    if (mode === 'learn' && !loading) {
      timerRef.current = setInterval(() => {
        setStudyTime(prev => prev + 1);
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode, loading]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 加载数据
  const fetchWords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ frequency, status: 'unlearned', limit: '100' });
      const res = await fetch(`/api/words/list?${params}`);
      const data = await res.json();
      if (data.success) {
        setWords(data.words || []);
        setStats(prev => ({ ...prev, ...data.stats }));
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Failed to fetch words:', err);
    } finally {
      setLoading(false);
    }
  }, [frequency]);
  
  const fetchReviewWords = useCallback(async () => {
    try {
      const params = new URLSearchParams({ status: 'mastered', limit: '50' });
      const res = await fetch(`/api/words/list?${params}`);
      const data = await res.json();
      if (data.success) setReviewWords(data.words || []);
    } catch (err) {
      console.error('Failed to fetch review words:', err);
    }
  }, []);
  
  const fetchWrongCount = useCallback(async () => {
    try {
      const res = await fetch('/api/wrong-questions?subject=english');
      const data = await res.json();
      if (data.success) setWrongCount(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch wrong count:', err);
    }
  }, []);
  
  useEffect(() => {
    fetchWords();
    fetchReviewWords();
    fetchWrongCount();
  }, [fetchWords, fetchReviewWords, fetchWrongCount]);
  
  const refreshStats = async () => {
    try {
      const res = await fetch('/api/words/stats');
      const data = await res.json();
      if (data.success) setStats(prev => ({ ...prev, ...data.stats }));
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };
  
  const handleMaster = async () => {
    console.log('[Words] handleMaster called, currentWord:', currentWord?.id);
    if (!currentWord) return;
    
    try {
      console.log('[Words] Calling mastery API...');
      const res = await fetch('/api/words/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wordId: currentWord.id, action: 'mastered' }),
      });
      
      const data = await res.json();
      console.log('[Words] Mastery API response:', data);
      
      if (!data.success) {
        console.error('[Words] Mastery API failed:', data.error);
      }
      
      const newWords = words.filter((_, i) => i !== currentIndex);
      setWords(newWords);
      
      if (newWords.length === 0) {
        setCurrentIndex(0);
      } else if (currentIndex >= newWords.length) {
        setCurrentIndex(newWords.length - 1);
      }
      
      await refreshStats();
    } catch (err) {
      console.error('[Words] Failed to mark as mastered:', err);
    }
  };
  
  const handleSkip = () => {
    if (words.length > 0) setCurrentIndex((prev) => (prev + 1) % words.length);
  };
  
  const handleRandom = () => {
    if (words.length > 0) setCurrentIndex(Math.floor(Math.random() * words.length));
  };
  
  const handlePrev = () => {
    if (words.length > 0) setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
  };
  
  const startPractice = () => {
    setPracticeResults([]);
    setPracticeMode('practice');
    setMode('practice');
    setStudyTime(0);
  };
  
  const startWrongReview = async () => {
    try {
      const res = await fetch('/api/wrong-questions?subject=english');
      const data = await res.json();
      if (data.success && data.questions.length > 0) {
        const wrongWords = data.questions.map((q: any) => ({
          id: q.id,
          word: q.correct_answer,
          phonetic: '',
          part_of_speech: '',
          meaning: q.question,
          example: '',
          translation: '',
          collocations: [],
          synonyms: [],
          antonyms: [],
          frequency_level: 'medium' as const,
        }));
        setReviewWords(wrongWords);
        setPracticeResults([]);
        setPracticeMode('practice');
        setMode('practice');
      }
    } catch (err) {
      console.error('Failed to start wrong review:', err);
    }
  };
  
  const handlePracticeComplete = (results: PracticeResult[]) => {
    setPracticeResults(results);
    setPracticeMode('complete');
    fetchWrongCount();
  };
  
  const handleRestartPractice = () => {
    setPracticeResults([]);
    setPracticeMode('practice');
    setStudyTime(0);
  };
  
  const handleBackToLearn = () => {
    setMode('learn');
    setPracticeMode('practice');
    fetchReviewWords();
    fetchWrongCount();
    setStudyTime(0);
  };
  
  const handleEnableNotifications = () => {
    setNotificationsEnabled(true);
    localStorage.setItem('notificationsEnabled', 'true');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* 顶部导航 */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-indigo-500" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">单词学习</h1>
            {mode === 'learn' && !loading && studyTime > 0 && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(studyTime)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={frequency} onValueChange={(v: typeof frequency) => { setFrequency(v); setCurrentIndex(0); }}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">高频核心词</SelectItem>
                <SelectItem value="medium">中频词</SelectItem>
                <SelectItem value="low">低频词</SelectItem>
                <SelectItem value="all">全部级别</SelectItem>
              </SelectContent>
            </Select>
            
            <p className="text-sm text-slate-500 hidden sm:block">
              {currentIndex + 1}/{words.length}
            </p>
            
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-full px-3 py-1">
              <Sparkles className={cn('h-4 w-4', mode === 'learn' ? 'text-indigo-500' : 'text-slate-400')} />
              <Switch checked={mode === 'practice'} onCheckedChange={(checked) => { if (checked) startPractice(); else setMode('learn'); }} />
              <RotateCcw className={cn('h-4 w-4', mode === 'practice' ? 'text-indigo-500' : 'text-slate-400')} />
            </div>
          </div>
        </div>
      </div>
      
      {/* 主内容 */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
          {/* 统计仪表盘 */}
          <StatsDashboard 
            stats={stats} 
            dailyGoal={dailyGoal}
            onGoalChange={handleGoalChange}
            wrongCount={wrongCount}
            onWrongReview={startWrongReview}
            onStatsClick={() => window.location.href = '/words/stats'}
            notificationsEnabled={notificationsEnabled}
            onEnableNotifications={handleEnableNotifications}
          />
          
          {/* 主内容区域 */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500">加载中...</p>
              </div>
            </div>
          ) : mode === 'learn' ? (
            words.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-600 mb-2">
                  🎉 太棒了！今日学习目标已完成！
                </h3>
                <p className="text-slate-400 mb-4">学习时长：{formatTime(studyTime)}</p>
                {reviewWords.length > 0 && (
                  <Button onClick={startPractice}>快速复习 ({reviewWords.length}词)</Button>
                )}
              </div>
            ) : currentWord ? (
              <div className="space-y-4">
                <WordCard
                  word={currentWord}
                  onMaster={handleMaster}
                  onSkip={handleSkip}
                />
                
                {/* 底部导航 */}
                <div className="flex justify-center items-center gap-3">
                  <Button variant="outline" size="icon" onClick={handlePrev} className="rounded-full h-10 w-10">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleRandom} className="rounded-full h-10 w-10">
                    <Shuffle className="h-5 w-5" />
                  </Button>
                  <Button variant="default" size="icon" onClick={() => setCurrentIndex((prev) => (prev + 1) % words.length)} className="rounded-full h-12 w-12 bg-indigo-500 hover:bg-indigo-600">
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            ) : null
          ) : mode === 'practice' && practiceMode === 'practice' ? (
            reviewWords.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-slate-600 mb-2">暂无需要练习的单词</h3>
                <p className="text-slate-400 mb-4">先学习一些新单词，掌握后再来练习吧</p>
                <Button onClick={() => setMode('learn')}>进入学习模式</Button>
              </div>
            ) : (
              <PracticeMode words={reviewWords} onComplete={handlePracticeComplete} />
            )
          ) : (
            <PracticeComplete
              results={practiceResults}
              onRestart={handleRestartPractice}
              onBack={handleBackToLearn}
            />
          )}
        </div>
      </div>
    </div>
  );
}
