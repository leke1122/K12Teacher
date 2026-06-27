'use client';

import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, GitCompare, Loader2 } from 'lucide-react';
import { RegionCompare } from '@/components/geography/RegionCompare';
import { updateStepProgress } from '@/lib/geographyProgress';
import { LIAONING_REGIONS } from '@/lib/geographyData';

function ComparePageContent() {
  const [regions, setRegions] = useState<typeof LIAONING_REGIONS>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRegions(LIAONING_REGIONS);
    setLoading(false);
    updateStepProgress('geography', 'compulsory-2', 'compare', 'in_progress');
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
              <GitCompare className="h-5 w-5 text-emerald-500" />
              🌍 区域对比
            </h1>
            <p className="text-xs text-muted-foreground">
              区域特征比较，培养综合思维
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            辽宁本土案例
          </Badge>
        </div>

        <RegionCompare regions={regions} />
      </div>
    </div>
  );
}

export default function GeographyComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
