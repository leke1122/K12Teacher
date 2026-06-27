'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronLeft, RefreshCw, CheckCircle, Lightbulb, Send } from 'lucide-react';
import { TutorialStep } from '@/types/geometry';

export interface TutorialPanelProps {
  steps: TutorialStep[];
  onStepComplete?: (stepIndex: number, answer: string) => void;
  onAllComplete?: () => void;
  onHighlightObject?: (objectName: string) => void;
  className?: string;
}

export function TutorialPanel({
  steps,
  onStepComplete,
  onAllComplete,
  onHighlightObject,
  className = '',
}: TutorialPanelProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'hint' | null; message: string }>({
    type: null,
    message: '',
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;

  useEffect(() => {
    if (!isCompleted && currentStep) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentStepIndex, isCompleted]);

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim() || !currentStep) return;

    const isCorrect =
      userAnswer.trim().toLowerCase() === currentStep.expectedAnswer?.toLowerCase();

    if (isCorrect) {
      setFeedback({ type: 'correct', message: '✅ 回答正确！太棒了！' });
      onStepComplete?.(currentStepIndex, userAnswer);

      if (isLastStep) {
        setIsCompleted(true);
        onAllComplete?.();
      } else {
        setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
          setUserAnswer('');
          setFeedback({ type: null, message: '' });
          setShowAnswer(false);
        }, 1500);
      }
    } else {
      setFeedback({
        type: 'wrong',
        message: '❌ 不太对哦，再想想？提示：' + currentStep.hint,
      });
      setShowAnswer(true);
    }
  };

  const getHint = () => {
    if (!currentStep) return '';
    return currentStep.hint || '再仔细看看题目中的条件';
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setUserAnswer('');
    setFeedback({ type: null, message: '' });
    setIsCompleted(false);
    setShowAnswer(false);
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
      setUserAnswer('');
      setFeedback({ type: null, message: '' });
      setShowAnswer(false);
    }
  };

  const renderProgress = () => {
    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-600">
          第 {currentStepIndex + 1} / {totalSteps} 步
        </span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
        {isCompleted && (
          <Badge variant="default" className="ml-2 bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            已完成
          </Badge>
        )}
      </div>
    );
  };

  if (!steps || steps.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center h-64 text-gray-400">
          <Lightbulb className="h-12 w-12 mb-2" />
          <p>暂无解题步骤</p>
          <p className="text-sm">请上传题目图片，AI将为您生成引导</p>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className={`${className} border-green-200`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-green-700">🎉 恭喜完成所有步骤！</h3>
          <p className="text-gray-600 mt-2">您已经掌握了这道题的解题思路</p>
          <Button onClick={handleReset} variant="outline" className="mt-6">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新练习
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            引导式解题
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-gray-400 hover:text-gray-600"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        {renderProgress()}
      </CardHeader>

      <CardContent className="space-y-4">
        <ScrollArea className="max-h-48 pr-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="shrink-0 mt-0.5">
                步骤 {currentStepIndex + 1}
              </Badge>
              <div className="flex-1">
                <p className="text-gray-700 font-medium">{currentStep.question}</p>
                <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  💡 提示：{getHint()}
                </div>
                {showAnswer && currentStep.expectedAnswer && (
                  <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                    💬 参考答案：{currentStep.expectedAnswer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {feedback.type && (
          <div
            className={`
              p-3 rounded-lg text-sm
              ${feedback.type === 'correct' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
              ${feedback.type === 'wrong' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
              ${feedback.type === 'hint' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : ''}
            `}
          >
            {feedback.message}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="输入你的答案..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !feedback.type) {
                handleSubmitAnswer();
              }
            }}
            disabled={!!feedback.type}
          />
          <Button onClick={handleSubmitAnswer} disabled={!userAnswer.trim() || !!feedback.type}>
            <Send className="h-4 w-4 mr-2" />
            提交
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between pt-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToStep(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          上一步
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToStep(Math.min(totalSteps - 1, currentStepIndex + 1))}
          disabled={isLastStep}
        >
          下一步
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
