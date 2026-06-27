'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Lightbulb } from 'lucide-react';

interface Analogy {
  title: string;
  description: string;
  steps: string[];
}

interface AnalogyCardProps {
  analogies: Analogy[];
}

export function AnalogyCard({ analogies }: AnalogyCardProps) {
  const [current, setCurrent] = useState(0);
  const [showSteps, setShowSteps] = useState(false);

  if (!analogies || analogies.length === 0) return null;

  const analogy = analogies[current];

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <span className="text-base font-medium">生活化类比</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setCurrent((prev) => Math.max(0, prev - 1))}
              disabled={current === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {current + 1} / {analogies.length}
            </span>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setCurrent((prev) => Math.min(analogies.length - 1, prev + 1))}
              disabled={current === analogies.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-lg">{analogy.title}</h4>
          <p className="text-base text-muted-foreground leading-relaxed">
            {analogy.description}
          </p>
        </div>

        {analogy.steps && analogy.steps.length > 0 && (
          <div className="space-y-2">
            <Button
              size="sm"
              variant="link"
              className="h-auto p-0 text-sm text-blue-600"
              onClick={() => setShowSteps(!showSteps)}
            >
              {showSteps ? '收起步骤' : '查看分步图示 →'}
            </Button>

            {showSteps && (
              <div className="flex items-center gap-2 flex-wrap">
                {analogy.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <Badge variant="outline" className="text-sm font-normal">
                      {idx + 1}. {step}
                    </Badge>
                    {idx < analogy.steps.length - 1 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 切换提示 */}
        <div className="text-sm text-muted-foreground">
          💡 换一个类比试试，找到最适合你的理解方式
        </div>
      </CardContent>
    </Card>
  );
}
