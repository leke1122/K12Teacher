'use client';

import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Map, Loader2 } from 'lucide-react';
import { InteractiveMap } from '@/components/geography/InteractiveMap';
import { updateStepProgress } from '@/lib/geographyProgress';
import { LIAONING_REGIONS, type MapRegion } from '@/lib/geographyData';

function MapPageContent() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
    updateStepProgress('geography', 'compulsory-1', 'map', 'in_progress');
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
              <Map className="h-5 w-5 text-emerald-500" />
              🗺️ 交互地图
            </h1>
            <p className="text-xs text-muted-foreground">
              可视化定位，掌握区域地理特征
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            辽宁本土
          </Badge>
        </div>

        <InteractiveMap regions={LIAONING_REGIONS} />
      </div>
    </div>
  );
}

export default function GeographyMapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
