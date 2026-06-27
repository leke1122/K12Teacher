'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GeometryDemoRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/learn/math/geogebra?mode=ai');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">正在跳转到 GeoGebra 学习页...</p>
    </div>
  );
}
