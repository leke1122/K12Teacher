'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MaterialAnalysis } from '@/components/history/MaterialAnalysis';
import type { AnalysisSource } from '@/types/history';

function AnalysisDetailPageContent() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [source, setSource] = useState<AnalysisSource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/history/analysis/generate?chapterId=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setSource(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!source) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-sm text-muted-foreground">未找到材料分析题</p>
      </div>
    );
  }

  return <MaterialAnalysis sourceId={id} source={source} />;
}

export default function HistoryAnalysisDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      }
    >
      <AnalysisDetailPageContent />
    </Suspense>
  );
}
