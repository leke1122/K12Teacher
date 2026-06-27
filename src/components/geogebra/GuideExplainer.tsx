'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRight, CheckCircle2, Lightbulb } from 'lucide-react';

export interface GuideExplainerProps {
  modelName: string;
  intro: string;
  guideQuestions: string[];
  onComplete?: (answers: string[]) => void;
}

type StepState = 'idle' | 'running' | 'feedback' | 'finished';

export function GuideExplainer({ modelName, intro, guideQuestions, onComplete }: GuideExplainerProps) {
  const [stepState, setStepState] = useState<StepState>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');

  const start = () => {
    setStepState('running');
    setCurrentIndex(0);
    setAnswers([]);
    setInput('');
    setFeedback('');
  };

  const submitAnswer = () => {
    if (!input.trim()) return;
    const next = [...answers, input.trim()];
    setAnswers(next);
    setFeedback('已记录你的思考，继续下一步吧。');
    setInput('');
    if (currentIndex + 1 >= guideQuestions.length) {
      setStepState('finished');
      onComplete?.(next);
      return;
    }
    setCurrentIndex(currentIndex + 1);
  };

  const reset = () => {
    setStepState('idle');
    setCurrentIndex(0);
    setAnswers([]);
    setInput('');
    setFeedback('');
  };

  return (
    <Card className="rounded-xl border">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-amber-500" />
          引导式讲解 · {modelName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stepState === 'idle' && (
          <div className="rounded-lg border bg-amber-50 p-4 text-sm leading-relaxed">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              为什么要分步思考？
            </div>
            <p className="text-muted-foreground">
              直接看答案容易遗忘；通过观察、猜想、验证，你才能真正理解公式和图形的联系。
            </p>
            <Button className="mt-4" onClick={start}>开始引导讲解</Button>
          </div>
        )}

        {stepState !== 'idle' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {guideQuestions.map((_, idx) => (
                <Badge key={idx} variant={idx <= currentIndex ? 'default' : 'outline'}>
                  第 {idx + 1} 步
                </Badge>
              ))}
            </div>

            <div className="rounded-lg border bg-white p-4">
              <p className="text-sm font-medium">🧠 第 {currentIndex + 1} 步</p>
              <p className="mt-1 text-sm text-muted-foreground">{guideQuestions[currentIndex]}</p>
            </div>

            {stepState !== 'finished' && (
              <div className="space-y-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="写下你的观察、猜想或答案..."
                  className="h-24"
                />
                <div className="flex items-center gap-2">
                  <Button onClick={submitAnswer} className="gap-1">
                    提交思考
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" onClick={reset}>重置</Button>
                </div>
                {feedback && <p className="text-xs text-muted-foreground">{feedback}</p>}
              </div>
            )}

            {stepState === 'finished' && (
              <div className="rounded-lg border bg-emerald-50 p-4">
                <div className="flex items-center gap-2 font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  本次引导完成
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  你已经完成了 {guideQuestions.length} 个思考步骤，继续回到图形上验证吧。
                </p>
                <Button variant="outline" className="mt-3" onClick={reset}>再练一次</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
