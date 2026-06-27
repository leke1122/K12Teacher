'use client';

import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, FileText, Loader2, ChevronRight, Lightbulb, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { MaterialAnalysis } from '@/components/history/MaterialAnalysis';
import { updateStepProgress } from '@/lib/geographyProgress';

function PracticePageContent() {
  const [sourceId, setSourceId] = useState('geography-practice-1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
    updateStepProgress('geography', 'compulsory-2', 'practice', 'in_progress');
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-500" />
              📊 综合题训练
            </h1>
            <p className="text-xs text-muted-foreground">
              辽宁卷综合题实战，成因-影响-措施逻辑链
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            52分必考
          </Badge>
        </div>

        {/* 复用历史材料分析组件 */}
        <MaterialAnalysis
          sourceId={sourceId}
          onComplete={() => {
            updateStepProgress('geography', 'compulsory-2', 'practice', 'completed');
          }}
        />
      </div>
    </div>
  );
}

export default function GeographyPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <PracticePageContent />
    </Suspense>
  );
}
