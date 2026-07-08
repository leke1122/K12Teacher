'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HandwritingPad } from '@/components/canvas/HandwritingPad';
import { ImageUploader } from './ImageUploader';

interface SimilarQuestionProps {
  question: {
    id: string;
    text: string;
    options?: string[];
    correctAnswer: string;
    knowledgePoint?: string;
    difficulty?: string;
    type?: string;
  };
  onComplete: (correct: boolean) => void;
  apiKey?: string;
  currentQuestionId?: string;
}

export function SimilarQuestion({
  question,
  onComplete,
  apiKey,
  currentQuestionId,
}: SimilarQuestionProps) {
  const [loading, setLoading] = useState(false);
  const [similarQuestion, setSimilarQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [calcInputMethod, setCalcInputMethod] = useState<'handwriting' | 'upload'>('handwriting');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<any>(null);
  const [localCalcAnswer, setLocalCalcAnswer] = useState('');

  const generateSimilar = async () => {
    setLoading(true);
    setSimilarQuestion(null);
    setSelectedAnswer('');
    setShowResult(false);
    setRecognitionResult(null);
    setLocalCalcAnswer('');
    try {
      const response = await fetch('/api/similar-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuestion: question.text,
          knowledgePoint: question.knowledgePoint,
          difficulty: question.difficulty || 'medium',
          questionType: question.type || (question.options?.length ? 'choice' : 'calculation'),
          apiKey,
        }),
      });
      const data = await response.json();
      if (data.success && data.question) {
        setSimilarQuestion(data.question);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleChoiceAnswer = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    const isCorrect = answer.toUpperCase() === similarQuestion?.correctAnswer?.toUpperCase();
    setTimeout(() => onComplete(isCorrect), 1500);
  };

  const handleCalcSubmit = async (imageData: string) => {
    if (!similarQuestion || !apiKey) return;
    setIsRecognizing(true);
    try {
      const response = await fetch('/api/recognize-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          question: similarQuestion.text,
          correctAnswer: similarQuestion.correctAnswer,
          knowledgePoint: similarQuestion.knowledgePoint,
          apiKey,
        }),
      });
      const data = await response.json();
      setRecognitionResult(data);
      if (data.success) {
        const isCorrect = data.isCorrect;
        setLocalCalcAnswer(data.recognizedText || '');
        setShowResult(true);
        if (isCorrect && currentQuestionId) {
          await fetch(`/api/wrong-questions/${currentQuestionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isMastered: true }),
          }).catch(() => {});
        }
        setTimeout(() => onComplete(isCorrect), 1500);
      }
    } catch {
      // ignore
    } finally {
      setIsRecognizing(false);
    }
  };

  const isCalc = similarQuestion?.type === 'calculation' ||
    (!similarQuestion?.options?.length && similarQuestion?.type !== 'choice');

  return (
    <div className="space-y-4">
      {!similarQuestion ? (
        <div className="text-center py-6">
          <Button
            onClick={generateSimilar}
            disabled={loading}
            size="lg"
            className="gap-2 bg-indigo-500 hover:bg-indigo-600"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />生成中...</>
            ) : (
              <><RefreshCw className="h-4 w-4" />生成同类型题</>
            )}
          </Button>
          <p className="text-sm text-slate-500 mt-2">基于当前题目生成一道变式题</p>
        </div>
      ) : (
        <Card className="border-2 border-indigo-100 dark:border-indigo-900/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
                同类型题 · {similarQuestion.knowledgePoint || '知识点练习'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={generateSimilar}
                disabled={loading}
                className="gap-1 text-indigo-500 hover:text-indigo-600"
              >
                <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
                再来一题
              </Button>
            </div>

            <p className="text-base font-medium text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {similarQuestion.text}
            </p>

            {/* 选择题 */}
            {!isCalc && similarQuestion.options?.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {similarQuestion.options.map((opt: string, i: number) => {
                  const optionKey = opt.charAt(0);
                  const isSelected = selectedAnswer === optionKey;
                  const optCorrect = optionKey === similarQuestion.correctAnswer;
                  return (
                    <button
                      key={i}
                      onClick={() => handleChoiceAnswer(optionKey)}
                      disabled={showResult}
                      className={cn(
                        'relative p-3 rounded-xl border-2 text-left transition-all duration-200',
                        'hover:scale-[1.01] active:scale-[0.99]',
                        !showResult && isSelected && 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
                        !showResult && !isSelected && 'border-slate-200 dark:border-slate-700 hover:border-indigo-300',
                        showResult && optCorrect && 'border-green-500 bg-green-50 dark:bg-green-950/40',
                        showResult && isSelected && !optCorrect && 'border-red-500 bg-red-50 dark:bg-red-950/40',
                        showResult && !isSelected && !optCorrect && 'border-slate-200 dark:border-slate-700 opacity-50',
                      )}
                    >
                      <span className={cn(
                        'inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold mr-2 text-sm',
                        !showResult && isSelected && 'bg-indigo-500 text-white',
                        !showResult && !isSelected && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                        showResult && optCorrect && 'bg-green-500 text-white',
                        showResult && isSelected && !optCorrect && 'bg-red-500 text-white',
                        showResult && !isSelected && !optCorrect && 'bg-slate-200 dark:bg-slate-700 text-slate-500',
                      )}>{optionKey}</span>
                      <span className="text-sm">{opt.substring(3).trim()}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 计算题作答 */}
            {isCalc && !showResult && (
              <>
                <div className="flex gap-2 mb-2">
                  <Button
                    variant={calcInputMethod === 'handwriting' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalcInputMethod('handwriting')}
                  >
                    ✏️ 手写
                  </Button>
                  <Button
                    variant={calcInputMethod === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalcInputMethod('upload')}
                  >
                    📷 上传
                  </Button>
                </div>
                <div style={{ height: '220px' }}>
                  {calcInputMethod === 'handwriting' ? (
                    <HandwritingPad
                      onSave={handleCalcSubmit}
                      onCancel={() => {}}
                      loading={isRecognizing}
                      className="h-full"
                    />
                  ) : (
                    <ImageUploader
                      onUpload={handleCalcSubmit}
                      onCancel={() => {}}
                      loading={isRecognizing}
                    />
                  )}
                </div>
              </>
            )}

            {/* 结果展示（计算题） */}
            {isCalc && showResult && (
              <div className={cn(
                'p-4 rounded-xl border-2 space-y-2',
                recognitionResult?.isCorrect
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
              )}>
                <p className={cn(
                  'font-bold text-lg',
                  recognitionResult?.isCorrect
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-amber-700 dark:text-amber-400',
                )}>
                  {recognitionResult?.isCorrect ? '✅ 回答正确！' : '❌ 回答错误'}
                </p>
                {localCalcAnswer && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">识别结果：{localCalcAnswer}</p>
                )}
                {similarQuestion.correctAnswer && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">正确答案：{similarQuestion.correctAnswer}</p>
                )}
                {recognitionResult?.feedback && !recognitionResult?.isCorrect && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">{recognitionResult.feedback}</p>
                )}
                {similarQuestion.explanation && (
                  <p className="text-sm text-slate-500 mt-1">{similarQuestion.explanation}</p>
                )}
              </div>
            )}

            {/* 结果展示（选择题） */}
            {!isCalc && showResult && (
              <div className={cn(
                'p-3 rounded-xl border-2',
                selectedAnswer.toUpperCase() === similarQuestion.correctAnswer?.toUpperCase()
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
              )}>
                <p className={cn(
                  'font-bold',
                  selectedAnswer.toUpperCase() === similarQuestion.correctAnswer?.toUpperCase()
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-amber-700 dark:text-amber-400',
                )}>
                  {selectedAnswer.toUpperCase() === similarQuestion.correctAnswer?.toUpperCase()
                    ? '✅ 回答正确！'
                    : `❌ 正确答案是 ${similarQuestion.correctAnswer}，${selectedAnswer} 不正确`}
                </p>
                {similarQuestion.explanation && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{similarQuestion.explanation}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
