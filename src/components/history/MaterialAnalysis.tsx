'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2,
  Lightbulb,
  Loader2,
  BookOpen,
  ArrowRight,
  Trophy,
} from 'lucide-react';
import type { AnalysisSource } from '@/types/history';

interface MaterialAnalysisProps {
  sourceId: string;
  source?: AnalysisSource | null;
  onComplete?: (score: number) => void;
}

type Stage = 'material' | 'answer' | 'completed';

function getDifficultyLabel(difficulty: AnalysisSource['difficulty']): string {
  switch (difficulty) {
    case '简单': return '入门';
    case '中等': return '进阶';
    case '困难': return '挑战';
    default: return '练习';
  }
}

export function MaterialAnalysis({ sourceId, source, onComplete }: MaterialAnalysisProps) {
  const [stage, setStage] = useState<Stage>('material');
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!source) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="text-muted-foreground">暂无材料分析内容</p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitted(true);
    setStage('completed');
    
    // 调用提交API
    try {
      await fetch('/api/history/analysis/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, answer }),
      });
    } catch (e) {
      // 静默处理
    }
    
    onComplete?.(85); // 模拟得分
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            {source.title || '历史材料分析'}
          </CardTitle>
          <Badge variant="outline">{getDifficultyLabel(source.difficulty)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 材料展示 */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-700 mb-2">材料</p>
          <p className="text-sm leading-relaxed">{source.material}</p>
        </div>

        <Tabs value={stage} onValueChange={(v) => setStage(v as Stage)} className="space-y-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="material">📜 材料</TabsTrigger>
            <TabsTrigger value="answer">✍️ 作答</TabsTrigger>
            {submitted && <TabsTrigger value="completed">✅ 完成</TabsTrigger>}
          </TabsList>

          <TabsContent value="material" className="space-y-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm leading-relaxed">{source.material}</p>
            </div>
            <Button onClick={() => setStage('answer')} className="w-full gap-2">
              开始作答
              <ArrowRight className="h-4 w-4" />
            </Button>
          </TabsContent>

          <TabsContent value="answer" className="space-y-3">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-xs font-medium text-blue-700 mb-1">问题</p>
              <p className="text-sm whitespace-pre-wrap">{source.question}</p>
            </div>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="请在此作答..."
              className="min-h-[200px]"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{answer.length} 字</span>
              <Button 
                onClick={handleSubmit} 
                disabled={!answer.trim()}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                提交答案
              </Button>
            </div>
          </TabsContent>

          {submitted && (
            <TabsContent value="completed" className="space-y-3">
              <div className="text-center py-6">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-amber-500" />
                <h3 className="text-lg font-bold mb-2">答案已提交</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  感谢您的作答！AI 评分结果将在稍后显示。
                </p>
                {source.answer && (
                  <div className="text-left rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">参考答案</p>
                    <pre className="text-sm whitespace-pre-wrap font-sans">{source.answer}</pre>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
