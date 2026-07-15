'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Lightbulb, Sparkles, ChevronRight } from 'lucide-react';
import type { Concept } from '@/lib/geographyDocxParser';

type GuidedStep = 'question' | 'reveal' | 'reflect' | 'practice';

interface GeographyGuidedLearningProps {
  concepts: Concept[];
}

export default function GeographyGuidedLearning({ concepts }: GeographyGuidedLearningProps) {
  const [step, setStep] = useState<GuidedStep>('question');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(0);

  const concept = concepts.find(c => c.id === selectedId) || concepts[0];
  const progress = Math.round((completed / Math.max(concepts.length, 1)) * 100);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setStep('question');
    setShowHint(false);
  };

  const handleReveal = () => {
    setStep('reveal');
    setCompleted(prev => prev + 1);
  };

  const handleReflect = () => setStep('reflect');
  const handlePractice = () => setStep('practice');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          引导式学习
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {concepts.map(c => (
            <Button
              key={c.id}
              size="sm"
              variant={selectedId === c.id || (!selectedId && c.id === concepts[0]?.id) ? 'default' : 'outline'}
              onClick={() => handleSelect(c.id)}
              className="text-xs"
            >
              {c.name}
            </Button>
          ))}
        </div>

        <Progress value={progress} />

        <div className="rounded-lg border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">当前概念</p>
              <p className="text-lg font-semibold text-slate-800">{concept?.name}</p>
            </div>
            <Badge>{concept?.category}</Badge>
          </div>
        </div>

        {step === 'question' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Q：为什么 {concept?.name} 是本章的核心地理概念？</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowHint(true)} variant="outline" size="sm" className="gap-1">
                <Lightbulb className="h-4 w-4" /> 看提示
              </Button>
              <Button onClick={handleReveal} className="gap-1">
                揭示答案 <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {showHint && (
              <p className="text-xs text-amber-600">提示：从概念定义、图示特征、辽宁案例三个角度思考。</p>
            )}
          </div>
        )}

        {step === 'reveal' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">{concept?.definition}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleReflect} className="gap-1">
                对比思考 <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'reflect' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">对比思考：如果这个概念不成立，相关地理现象会如何变化？</p>
            <Textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="写下你的思考..." />
            <div className="flex gap-2">
              <Button onClick={handlePractice} className="gap-1">
                进入练习 <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'practice' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">快速自测</p>
            <p className="text-sm text-slate-600">辽宁高考中，{concept?.name} 最可能的考查形式是？</p>
            <RadioGroup value={answer} onValueChange={setAnswer}>
              {['选择题辨析', '读图填空题', '材料分析题'].map(opt => (
                <div key={opt} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                  <RadioGroupItem value={opt} id={opt} />
                  <Label htmlFor={opt}>{opt}</Label>
                </div>
              ))}
            </RadioGroup>
            <div className="flex gap-2">
              <Button onClick={() => { setStep('question'); setAnswer(''); }} variant="outline">重新学习</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
