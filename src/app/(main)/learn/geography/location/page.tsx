'use client';

import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, GitBranch, Loader2, Target } from 'lucide-react';
import { LocationAnalysis } from '@/components/geography/LocationAnalysis';
import { updateStepProgress } from '@/lib/geographyProgress';
import { LOCATION_ANALYSIS_CASES } from '@/lib/geographyData';

function LocationAnalysisPageContent() {
  const [cases, setCases] = useState<typeof LOCATION_ANALYSIS_CASES>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    setCases(LOCATION_ANALYSIS_CASES);
    updateStepProgress('geography', 'compulsory-2', 'location', 'in_progress');
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
              <GitBranch className="h-5 w-5 text-emerald-500" />
              🔗 区位分析
            </h1>
            <p className="text-xs text-muted-foreground">
              多因素综合分析，掌握成因-影响-措施逻辑链
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            辽宁卷必考
          </Badge>
        </div>

        <LocationAnalysis cases={cases} />
      </div>
    </div>
  );
}

export default function LocationAnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <LocationAnalysisPageContent />
    </Suspense>
  );
}
