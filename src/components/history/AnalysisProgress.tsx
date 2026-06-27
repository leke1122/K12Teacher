'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Trophy, Loader2 } from 'lucide-react';
import type { AnalysisSource, AnalysisFeedback } from '@/types/history';

interface AnalysisProgressProps {
  sources: AnalysisSource[];
  loading: boolean;
  onStart: (sourceId: string) => void;
}

function AnalysisProgress({ sources, loading, onStart }: AnalysisProgressProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          加载练习记录...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sources.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            暂无材料分析题，请先创建新练习。
          </CardContent>
        </Card>
      ) : (
        sources.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.difficulty}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.questions.length} 题
                    </span>
                  </div>
                </div>
                <Button size="sm" onClick={() => onStart(item.id)} className="gap-1">
                  <BookOpen className="h-4 w-4" />
                  继续练习
                </Button>
              </div>
              <Progress value={0} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                还未开始，完成练习后将显示得分和进度。
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export { AnalysisProgress };
