'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BookOpen, Lightbulb, Target, CheckCircle, XCircle } from 'lucide-react';

interface Section {
  id: number;
  page: number;
  content: string;
  keywords?: string[];
  charCount: number;
}

interface Explanation {
  explanation: string;
  keyPoints: string[];
}

interface Question {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface TextbookViewerProps {
  section: Section;
  explanation?: Explanation | null;
  isLoadingExplanation?: boolean;
  question?: Question | null;
  isLoadingQuestion?: boolean;
  selectedAnswer?: string;
  onSelectAnswer?: (answer: string) => void;
  showFeedback?: boolean;
  feedback?: {
    correct: boolean;
    message: string;
    hint?: string;
    nextAction: string;
    explanation?: string;
  } | null;
  className?: string;
}

export function TextbookViewer({
  section,
  explanation,
  isLoadingExplanation,
  question,
  isLoadingQuestion,
  selectedAnswer,
  onSelectAnswer,
  showFeedback,
  feedback,
  className
}: TextbookViewerProps) {

  return (
    <div className={cn('space-y-6', className)}>
      {/* 原文展示 */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span>原文</span>
            </CardTitle>
            <Badge variant="outline" className="text-slate-500">
              第 {section.page} 页
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              "{section.content}"
            </p>
          </div>
          {section.keywords && section.keywords.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {section.keywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI讲解 */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500" />
        <CardHeader className="bg-gradient-to-r from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <span>AI讲解</span>
            {isLoadingExplanation && (
              <Badge variant="secondary" className="ml-2 animate-pulse">
                加载中...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {isLoadingExplanation ? (
            <div className="space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-11/12" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
            </div>
          ) : explanation ? (
            <>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {explanation.explanation}
              </p>
              
              {/* 核心要点 */}
              {explanation.keyPoints && explanation.keyPoints.length > 0 && (
                <div className="mt-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-4 w-4 text-indigo-500" />
                    <span className="font-semibold text-indigo-700 dark:text-indigo-400">核心要点</span>
                  </div>
                  <ul className="space-y-2">
                    {explanation.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="text-indigo-500 font-bold">{i + 1}.</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 italic">暂无讲解内容</p>
          )}
        </CardContent>
      </Card>

      {/* 练习题 */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <div className={cn('h-1.5', 
          showFeedback && feedback?.correct ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
          showFeedback ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
          'bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500'
        )} />
        <CardHeader className="bg-gradient-to-r from-pink-50/50 to-purple-50/30 dark:from-pink-950/20 dark:to-purple-950/10">
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <span>趁热打铁</span>
            {isLoadingQuestion && (
              <Badge variant="secondary" className="ml-2 animate-pulse">
                生成中...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {isLoadingQuestion ? (
            <div className="space-y-3">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
              <div className="space-y-2">
                <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              </div>
            </div>
          ) : question ? (
            <>
              {/* 问题 */}
              <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                {question.question}
              </p>

              {/* 选项 */}
              <div className="grid grid-cols-1 gap-3">
                {question.options.map((option, index) => {
                  const optionKey = option.charAt(0);
                  const isSelected = selectedAnswer === optionKey;
                  const isCorrectOption = optionKey === question.correctAnswer;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => !showFeedback && onSelectAnswer?.(optionKey)}
                      disabled={showFeedback}
                      className={cn(
                        'relative p-4 rounded-xl border-2 transition-all duration-200 text-left',
                        'hover:scale-[1.01] active:scale-[0.99]',
                        !showFeedback && isSelected && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-lg',
                        !showFeedback && !isSelected && 'border-slate-200 dark:border-slate-700 hover:border-indigo-300',
                        showFeedback && isCorrectOption && 'border-green-500 bg-green-50 dark:bg-green-950/40 shadow-lg',
                        showFeedback && isSelected && !isCorrectOption && 'border-red-500 bg-red-50 dark:bg-red-950/40 shadow-lg',
                        showFeedback && !isSelected && !isCorrectOption && 'border-slate-200 dark:border-slate-700 opacity-50'
                      )}
                    >
                      <span className={cn(
                        'inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold mr-3',
                        !showFeedback && isSelected && 'bg-indigo-500 text-white',
                        !showFeedback && !isSelected && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                        showFeedback && isCorrectOption && 'bg-green-500 text-white',
                        showFeedback && isSelected && !isCorrectOption && 'bg-red-500 text-white',
                        showFeedback && !isSelected && !isCorrectOption && 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      )}>
                        {optionKey}
                      </span>
                      <span className={cn(
                        'font-medium',
                        !showFeedback && 'text-slate-700 dark:text-slate-300',
                        showFeedback && isCorrectOption && 'text-green-700 dark:text-green-400',
                        showFeedback && isSelected && !isCorrectOption && 'text-red-700 dark:text-red-400',
                        showFeedback && !isSelected && !isCorrectOption && 'text-slate-400'
                      )}>
                        {option.substring(3).trim()}
                      </span>
                      {showFeedback && isCorrectOption && (
                        <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-green-500" />
                      )}
                      {showFeedback && isSelected && !isCorrectOption && (
                        <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-red-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 反馈信息 */}
              {showFeedback && feedback && (
                <div className={cn(
                  'p-4 rounded-xl border-2 animate-fadeIn',
                  feedback.correct 
                    ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' 
                    : 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold',
                      feedback.correct ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-amber-400 to-orange-500'
                    )}>
                      {feedback.correct ? '✓' : '🤔'}
                    </div>
                    <div>
                      <p className={cn('font-bold text-lg',
                        feedback.correct ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'
                      )}>
                        {feedback.message}
                      </p>
                      {feedback.hint && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          💡 {feedback.hint}
                        </p>
                      )}
                    </div>
                  </div>
                  {feedback.explanation && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        📖 {feedback.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-400 italic">正在生成问题...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
