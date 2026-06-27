'use client';

import { MathContent } from '@/components/ui/MathContent';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getQuestionTypeLabel, getDifficultyLabel } from '@/lib/questionUtils';

interface PracticeQuestionProps {
  question: {
    id: string;
    text?: string;
    question?: string;
    type: 'choice' | 'fill' | 'calculation';
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    knowledgePoint?: string;
    difficulty?: string;
    source?: string;
  };
  index: number;
  selectedAnswer?: string;
  showFeedback?: boolean;
  onAnswer?: (answer: string) => void;
  disabled?: boolean;
}

export function PracticeQuestion({
  question,
  index,
  selectedAnswer,
  showFeedback,
  onAnswer,
  disabled,
}: PracticeQuestionProps) {
  const questionText = question.text || question.question || '';
  const qtype = question.type ?? '';
  const isCalcQuestion = qtype === 'calculation';
  const isFillQuestion = qtype === 'fill';
  const isChoiceQuestion = qtype === 'choice';

  const difficultyColor =
    question.difficulty === 'simple' ? 'border-green-300 text-green-600' :
    question.difficulty === 'hard' ? 'border-red-300 text-red-600' :
    'border-amber-300 text-amber-600';

  return (
    <div className="space-y-4">
      {/* 题目头部 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={cn('text-xs', difficultyColor)}>
          {getDifficultyLabel(question.difficulty || 'medium')}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {getQuestionTypeLabel(question.type)}
        </Badge>
        {question.knowledgePoint && (
          <Badge variant="outline" className="text-xs text-slate-500">
            {question.knowledgePoint}
          </Badge>
        )}
        {question.source === 'previous' && (
          <Badge className="text-xs bg-slate-100 text-slate-500 border-slate-200">
            复习
          </Badge>
        )}
      </div>

      {/* 题目文本 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5">
            {index + 1}
          </div>
          <MathContent
            content={questionText}
            className="text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed flex-1"
          />
        </div>
      </div>

      {/* 选择题选项 */}
      {isChoiceQuestion && question.options && question.options.length > 0 && (
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const optionKey = opt.charAt(0);
            const isSelected = selectedAnswer === optionKey;
            const isCorrectOpt = optionKey === question.correctAnswer;

            return (
              <button
                key={i}
                onClick={() => !disabled && !showFeedback && onAnswer?.(optionKey)}
                disabled={disabled || showFeedback}
                className={cn(
                  'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
                  'hover:scale-[1.01] active:scale-[0.99]',
                  !showFeedback && isSelected && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-lg',
                  !showFeedback && !isSelected && 'border-slate-200 dark:border-slate-700 hover:border-indigo-300',
                  showFeedback && isCorrectOpt && 'border-green-500 bg-green-50 dark:bg-green-950/40 shadow-lg',
                  showFeedback && isSelected && !isCorrectOpt && 'border-red-500 bg-red-50 dark:bg-red-950/40 shadow-lg',
                  showFeedback && !isSelected && !isCorrectOpt && 'border-slate-200 dark:border-slate-700 opacity-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm flex-shrink-0',
                    !showFeedback && isSelected && 'bg-indigo-500 text-white',
                    !showFeedback && !isSelected && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                    showFeedback && isCorrectOpt && 'bg-green-500 text-white',
                    showFeedback && isSelected && !isCorrectOpt && 'bg-red-500 text-white',
                    showFeedback && !isSelected && !isCorrectOpt && 'bg-slate-200 dark:bg-slate-700 text-slate-500',
                  )}>{optionKey}</span>
                  <MathContent
                    content={opt.substring(3).trim()}
                    className={cn(
                      'text-sm font-medium flex-1',
                      !showFeedback && 'text-slate-700 dark:text-slate-300',
                      showFeedback && isCorrectOpt && 'text-green-700 dark:text-green-400',
                      showFeedback && isSelected && !isCorrectOpt && 'text-red-700 dark:text-red-400',
                      showFeedback && !isSelected && !isCorrectOpt && 'text-slate-400',
                    )}
                  />
                  {showFeedback && isCorrectOpt && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                  {showFeedback && isSelected && !isCorrectOpt && <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 反馈区域 */}
      {showFeedback && (
        <Card className={cn(
          'border-2 overflow-hidden',
          selectedAnswer?.toUpperCase() === question.correctAnswer?.toUpperCase()
            ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
            : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
        )}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              {selectedAnswer?.toUpperCase() === question.correctAnswer?.toUpperCase() ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">✓</div>
                  <div>
                    <p className="font-bold text-green-700 dark:text-green-400">正确！</p>
                    <p className="text-sm text-slate-500">继续保持！</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">✗</div>
                  <div>
                    <p className="font-bold text-red-700 dark:text-red-400">答错了</p>
                    <p className="text-sm text-slate-500">
                      正确答案：<span className="font-bold text-green-600"><MathContent content={question.correctAnswer} /></span>
                    </p>
                  </div>
                </>
              )}
            </div>
            {question.explanation && (
              <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-3">
                <MathContent content={question.explanation} className="text-sm text-slate-600 dark:text-slate-400" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
