'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';

interface GuidedStep {
  step: number;
  prompt: string;
  type: 'observe' | 'calculate' | 'describe' | 'choose';
}

interface Question {
  question: string;
  options: string[];
  correct: string;
  hint: string;
  explanation: string;
}

interface GuidedThinkingProps {
  steps: GuidedStep[];
  questions: Question[];
}

export function GuidedThinking({ steps, questions }: GuidedThinkingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const step = steps[currentStep];
  const currentQuestion = questions[currentStep % questions.length];
  const showResult = selectedAnswer !== null;

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserAnswer('');
      setSelectedAnswer(null);
      setShowHint(false);
    } else {
      setCompleted(true);
    }
  };

  const handleShowHint = () => setShowHint(true);

  const handleSelectAnswer = (opt: string) => {
    if (selectedAnswer) return; // already answered
    setSelectedAnswer(opt);
    const isCorrect = opt === currentQuestion?.correct;
    if (!isCorrect) {
      setShowExplanation(null); // wrong: show explanation only after correct
    } else {
      // correct: show explanation immediately
      setShowExplanation('correct');
    }
  };

  if (completed) {
    return (
      <Card className="border-green-300 bg-green-50 dark:bg-green-950/30">
        <CardContent className="p-4 text-center space-y-3">
          <div className="text-4xl">🎉</div>
          <h3 className="font-bold text-lg text-green-700 dark:text-green-400">
            太棒了！你已完成所有思考步骤！
          </h3>
          <p className="text-sm text-green-600 dark:text-green-500">
            🌟 鼓励语：你已经深入理解了这个概念！坚持这样思考，你的逻辑能力会越来越强！
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setCurrentStep(0);
              setCompleted(false);
              setUserAnswer('');
              setSelectedAnswer(null);
              setShowHint(false);
            }}
          >
            再来一次
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 dark:border-purple-900">
      <CardContent className="p-4 space-y-4">
        {/* 步骤进度 */}
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <span className="text-sm font-medium">🧠 思考引导</span>
          <div className="ml-auto flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < currentStep ? 'bg-green-500' :
                  i === currentStep ? 'bg-purple-500' :
                  'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 步骤描述 */}
        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="flex-shrink-0 mt-0.5">
              第{step.step}步
            </Badge>
            <p className="text-sm font-medium leading-relaxed">{step.prompt}</p>
          </div>
        </div>

        {/* 互动问答 */}
        {currentQuestion && (
          <div className="space-y-3">
            <p className="text-sm font-medium">{currentQuestion.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === currentQuestion.correct;

                let bgClass = 'hover:bg-slate-50 dark:hover:bg-slate-800';
                if (showResult) {
                  if (isCorrect) bgClass = 'bg-green-100 border-green-500 dark:bg-green-900/50';
                  else if (isSelected && !isCorrect) bgClass = 'bg-red-100 border-red-500 dark:bg-red-900/50';
                  else bgClass = 'opacity-50';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(opt)}
                    disabled={showResult}
                    className={`p-2 rounded-lg border-2 text-sm text-left transition-all ${bgClass}`}
                  >
                    <span className="font-medium">{opt}</span>
                    {showResult && isCorrect && <CheckCircle2 className="inline h-4 w-4 ml-2 text-green-600" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="inline h-4 w-4 ml-2 text-red-600" />}
                  </button>
                );
              })}
            </div>

            {/* 提示 */}
            {!showResult && showHint && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded text-sm">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-amber-700 dark:text-amber-400">{currentQuestion.hint}</p>
              </div>
            )}

            {/* 结果 */}
            {showResult && (
              <div className="space-y-2">
                {showResult && selectedAnswer === currentQuestion.correct && (
                  <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded text-sm text-green-700 dark:text-green-400">
                    ✅ 回答正确！
                    {currentQuestion.explanation && (
                      <p className="mt-1 text-xs opacity-80">{currentQuestion.explanation}</p>
                    )}
                  </div>
                )}
                {showResult && selectedAnswer !== currentQuestion.correct && (
                  <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded text-sm text-red-700 dark:text-red-400 space-y-1">
                    <p>❌ 不对哦，再想想！</p>
                    {currentQuestion.explanation && (
                      <p className="text-xs opacity-80">{currentQuestion.explanation}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  {!showResult && !showHint && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={handleShowHint}>
                      💡 提示
                    </Button>
                  )}
                  {showResult && (
                    <Button size="sm" className="text-xs gap-1" onClick={handleNextStep}>
                      继续 <MessageSquare className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
