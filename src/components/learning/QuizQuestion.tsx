'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Lightbulb, RefreshCw, ArrowRight, Loader2, Heart, Volume2 } from 'lucide-react';

export interface QuizQuestion {
  questionId: string;
  question: string;
  type: 'choice' | 'truefalse';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  hint?: string;
  knowledgeName?: string;
}

interface QuizQuestionProps {
  knowledgeName: string;
  question: QuizQuestion | null;
  isLoading: boolean;
  onAnswer: (answer: string) => void;
  onRetry: () => void;
  onNext?: () => void;
  attemptCount: number;
  feedback?: {
    correct: boolean;
    message: string;
    nextAction: 'next' | 'retry' | 'mark-weak';
    explanation?: string;
    hint?: string;
  } | null;
  isLast?: boolean;
  className?: string;
}

export function QuizQuestion({
  knowledgeName,
  question,
  isLoading,
  onAnswer,
  onRetry,
  onNext,
  attemptCount,
  feedback,
  isLast = false,
  className
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  // 重置状态当问题变化时
  useEffect(() => {
    setSelectedAnswer('');
    setShowFeedback(false);
  }, [question?.questionId]);

  const handleSubmit = () => {
    if (!selectedAnswer || !question) return;
    setShowFeedback(true);
    onAnswer(selectedAnswer);
  };

  const handleRetry = () => {
    setSelectedAnswer('');
    setShowFeedback(false);
    onRetry();
  };

  // 加载状态
  if (isLoading) {
    return (
      <Card className={cn('border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20', className)}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center animate-pulse">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white text-sm font-bold animate-bounce">
              ?
            </div>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">正在为你准备思考题...</p>
          <div className="flex gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 没有问题
  if (!question) {
    return (
      <Card className={cn('border-0 shadow-lg', className)}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-6">
            <Heart className="h-10 w-10 text-slate-400" />
          </div>
          <p className="text-lg text-slate-500">准备好做练习题了吗~</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-0 shadow-lg overflow-hidden', className)}>
      {/* 顶部渐变 */}
      <div className={cn('h-1.5 bg-gradient-to-r',
        feedback?.correct ? 'from-green-400 to-emerald-500' :
        showFeedback ? 'from-amber-400 to-orange-500' :
        'from-pink-400 via-purple-500 to-indigo-500'
      )} />
      
      <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">💭</span>
            <span>趁热打铁</span>
          </CardTitle>
          {attemptCount > 1 && (
            <Badge variant="outline" className="text-amber-500 border-amber-300 bg-amber-50">
              第 {attemptCount} 次尝试
            </Badge>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-2">
          知识点：<span className="font-medium text-purple-600">{knowledgeName}</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* 问题内容 */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6">
          <p className="text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed text-center">
            {question.question}
          </p>
        </div>

        {/* 选择题大按钮 */}
        {question.type === 'choice' && question.options && (
          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option, index) => {
              const optionKey = String.fromCharCode(65 + index);
              const isSelected = selectedAnswer === optionKey;
              const isCorrectOption = optionKey === question.correctAnswer;
              
              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && setSelectedAnswer(optionKey)}
                  disabled={showFeedback}
                  className={cn(
                    'relative p-5 rounded-2xl border-2 transition-all duration-200 text-left',
                    'hover:scale-[1.02] active:scale-[0.98]',
                    !showFeedback && isSelected && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-lg shadow-indigo-500/20',
                    !showFeedback && !isSelected && 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50',
                    showFeedback && isCorrectOption && 'border-green-500 bg-green-50 dark:bg-green-950/40 shadow-lg shadow-green-500/20',
                    showFeedback && isSelected && !isCorrectOption && 'border-red-500 bg-red-50 dark:bg-red-950/40 shadow-lg shadow-red-500/20',
                    showFeedback && !isSelected && !isCorrectOption && 'border-slate-200 dark:border-slate-700 opacity-50'
                  )}
                >
                  {/* 选项字母 */}
                  <div className={cn(
                    'absolute -top-3 -left-3 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg',
                    !showFeedback && isSelected && 'bg-indigo-500 text-white',
                    !showFeedback && !isSelected && 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
                    showFeedback && isCorrectOption && 'bg-green-500 text-white',
                    showFeedback && isSelected && !isCorrectOption && 'bg-red-500 text-white',
                    showFeedback && !isSelected && !isCorrectOption && 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  )}>
                    {optionKey}
                  </div>
                  
                  {/* 选项内容 */}
                  <div className="pl-8">
                    <span className={cn(
                      'text-base font-medium',
                      !showFeedback && 'text-slate-700 dark:text-slate-300',
                      showFeedback && isCorrectOption && 'text-green-700 dark:text-green-400 font-semibold',
                      showFeedback && isSelected && !isCorrectOption && 'text-red-700 dark:text-red-400',
                      showFeedback && !isSelected && !isCorrectOption && 'text-slate-400'
                    )}>
                      {option.replace(/^[A-D]\.\s*/, '')}
                    </span>
                  </div>

                  {/* 正确/错误图标 */}
                  {showFeedback && isCorrectOption && (
                    <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {showFeedback && isSelected && !isCorrectOption && (
                    <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 判断题 */}
        {question.type === 'truefalse' && (
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'true', label: '✓ 正确', emoji: '👍' },
              { value: 'false', label: '✗ 错误', emoji: '👎' }
            ].map(({ value, label, emoji }) => {
              const isSelected = selectedAnswer === value;
              const isCorrectOption = value === question.correctAnswer;
              
              return (
                <button
                  key={value}
                  onClick={() => !showFeedback && setSelectedAnswer(value)}
                  disabled={showFeedback}
                  className={cn(
                    'p-8 rounded-2xl border-2 transition-all duration-200',
                    'hover:scale-[1.02] active:scale-[0.98]',
                    !showFeedback && isSelected && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-lg',
                    !showFeedback && !isSelected && 'border-slate-200 dark:border-slate-700 hover:border-indigo-300',
                    showFeedback && isCorrectOption && 'border-green-500 bg-green-50 dark:bg-green-950/40 shadow-lg',
                    showFeedback && isSelected && !isCorrectOption && 'border-red-500 bg-red-50 dark:bg-red-950/40 shadow-lg',
                    showFeedback && 'cursor-default'
                  )}
                >
                  <div className="text-center">
                    <span className="text-4xl mb-2 block">{emoji}</span>
                    <span className="text-xl font-bold">{label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 反馈信息 */}
        {showFeedback && feedback && (
          <div className={cn(
            'p-6 rounded-2xl border-2 space-y-4 animate-fadeIn',
            feedback.correct 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200' 
              : 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200'
          )}>
            <div className="flex items-center gap-4">
              {feedback.correct ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl shadow-lg">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-green-700 dark:text-green-400 text-xl">
                      {feedback.message}
                    </p>
                    {feedback.hint && !isLast && (
                      <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                        💡 {feedback.hint}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl shadow-lg">
                    🤔
                  </div>
                  <div>
                    <p className="font-bold text-amber-700 dark:text-amber-400 text-xl">
                      {feedback.message}
                    </p>
                    {feedback.hint && (
                      <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                        💡 {feedback.hint}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {feedback.explanation && (
              <div className="pl-18 bg-white/50 dark:bg-slate-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  📖 解析：
                </p>
                <p className="text-slate-700 dark:text-slate-300">
                  {feedback.explanation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          {!showFeedback ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className={cn(
                'flex-1 h-14 text-lg rounded-2xl transition-all',
                'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600',
                'text-white shadow-xl shadow-indigo-500/30',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
              )}
            >
              提交答案
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <>
              {feedback?.nextAction === 'retry' ? (
                <Button
                  onClick={handleRetry}
                  className={cn(
                    'flex-1 h-14 text-lg rounded-2xl transition-all',
                    'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
                    'text-white shadow-xl shadow-amber-500/30'
                  )}
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  再试一次
                </Button>
              ) : (
                <Button
                  onClick={() => onNext?.()}
                  className={cn(
                    'flex-1 h-14 text-lg rounded-2xl transition-all',
                    feedback?.nextAction === 'mark-weak'
                      ? 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
                    'text-white shadow-xl'
                  )}
                >
                  {feedback?.nextAction === 'mark-weak' 
                    ? '继续学习' 
                    : isLast 
                      ? '🎉 完成学习' 
                      : '下一个知识点 →'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
