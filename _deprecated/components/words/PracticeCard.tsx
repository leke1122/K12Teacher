'use client';

import { useState, useEffect, useCallback } from 'react';
import { Word, PracticeMode, PracticeScope, PracticeStats } from '@/data/words/types';
import { Button } from '@/components/ui/button';
import { Volume2, Check, X, ArrowRight, RefreshCw } from 'lucide-react';

interface PracticeCardProps {
  words: Word[];
  mode: PracticeMode;
  scope: PracticeScope;
  onComplete: (stats: PracticeStats) => void;
}

export function PracticeCard({ words, mode, scope, onComplete }: PracticeCardProps) {
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [stats, setStats] = useState<PracticeStats>({ correct: 0, wrong: 0, remaining: 0 });
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  const getPool = useCallback(() => {
    if (scope === 'unmastered') {
      return words.filter(w => !w.mastered);
    }
    return words;
  }, [words, scope]);

  const loadQuestion = useCallback((pool: Word[], index: number) => {
    if (pool.length === 0) {
      setFinished(true);
      return;
    }
    const word = pool[index];
    setCurrentWord(word);
    setUserAnswer('');
    setIsCorrect(null);
    setShowResult(false);
  }, []);

  useEffect(() => {
    const pool = getPool();
    setStats({ correct: 0, wrong: 0, remaining: pool.length });
    setQuestionIndex(0);
    setFinished(false);
    if (pool.length > 0) {
      loadQuestion(pool, 0);
    }
  }, [words, mode, scope, getPool, loadQuestion]);

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const checkAnswer = () => {
    if (!currentWord || !userAnswer.trim()) return;
    
    const correct = userAnswer.trim().toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
    
    setStats(prev => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
      remaining: prev.remaining - 1,
    }));
  };

  const nextQuestion = () => {
    const pool = getPool();
    if (questionIndex + 1 >= pool.length) {
      setFinished(true);
      onComplete({ ...stats, remaining: 0 });
      return;
    }
    setQuestionIndex(prev => prev + 1);
    loadQuestion(pool, questionIndex + 1);
  };

  const restart = () => {
    const pool = getPool();
    setStats({ correct: 0, wrong: 0, remaining: pool.length });
    setQuestionIndex(0);
    setFinished(false);
    if (pool.length > 0) {
      loadQuestion(pool, 0);
    }
  };

  if (finished || getPool().length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
            练习完成！
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-green-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-xs text-muted-foreground">正确</div>
            </div>
            <div className="bg-white dark:bg-red-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">{stats.wrong}</div>
              <div className="text-xs text-muted-foreground">错误</div>
            </div>
            <div className="bg-white dark:bg-blue-900/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">
                {stats.correct + stats.wrong > 0 
                  ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) 
                  : 0}%
              </div>
              <div className="text-xs text-muted-foreground">正确率</div>
            </div>
          </div>
          <Button onClick={restart} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            再练一次
          </Button>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        正在加载题目...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 题目 */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            第 {questionIndex + 1} / {getPool().length} 题
          </span>
          {mode === 'pronunciation-to-english' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speak(currentWord.word)}
              className="gap-1"
            >
              <Volume2 className="h-4 w-4" />
              播放发音
            </Button>
          )}
        </div>

        {/* 提示 */}
        <div className="text-center mb-4">
          {mode === 'chinese-to-english' ? (
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200">
              {currentWord.meaning}
            </p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">听发音，拼写单词</p>
              {currentWord.phonetic && (
                <p className="text-base font-mono text-blue-600 dark:text-blue-400">
                  {currentWord.phonetic}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 输入框 */}
        <div className="space-y-3">
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !showResult) {
                checkAnswer();
              } else if (e.key === 'Enter' && showResult) {
                nextQuestion();
              }
            }}
            placeholder="请输入单词拼写"
            disabled={showResult}
            className={`w-full px-4 py-3 text-lg text-center rounded-lg border-2 transition-colors ${
              showResult
                ? isCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                  : 'border-red-500 bg-red-50 dark:bg-red-950/30'
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
            }`}
          />

          {showResult && (
            <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <div className="flex items-center gap-2 mb-1">
                {isCorrect ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <X className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '正确！' : '错误'}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  正确答案：<span className="font-bold">{currentWord.word}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {!showResult ? (
              <Button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="flex-1"
              >
                检查
              </Button>
            ) : (
              <Button onClick={nextQuestion} className="flex-1">
                下一题
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 统计 */}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>✅ 正确：{stats.correct}</span>
        <span>❌ 错误：{stats.wrong}</span>
        <span>剩余：{stats.remaining}</span>
      </div>
    </div>
  );
}
