'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type SunActivity = {
  id: string;
  name: string;
  layer: string;
  feature: string;
  impact: string;
};

const ACTIVITIES: SunActivity[] = [
  { id: 'sunspot', name: '黑子', layer: '光球层', feature: '温度低于周围区域，形成暗斑。', impact: '太阳活动强弱的标志，约11年周期。' },
  { id: 'flare', name: '耀斑', layer: '色球层', feature: '最剧烈的能量爆发，释放强辐射。', impact: '干扰电离层，影响短波通信。' },
  { id: 'prom', name: '日珥', layer: '色球层', feature: '红色火焰状等离子体。', impact: '太阳活动活跃的表现之一。' },
  { id: 'wind', name: '太阳风', layer: '日冕层', feature: '持续向外喷射带电粒子流。', impact: '引发极光，扰动地球磁场。' },
];

export default function SunActivitiesPage() {
  const [selected, setSelected] = useState<SunActivity>(ACTIVITIES[0]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/knowledge/compulsory-1"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button></Link>
          <h1 className="text-xl font-bold text-slate-800">☀️ 太阳活动类型对比</h1>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">点击活动类型查看详情</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ACTIVITIES.map(item => (
                <Button key={item.id} variant={selected.id === item.id ? 'default' : 'outline'} size="sm" onClick={() => setSelected(item)}>{item.name}</Button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border bg-white p-4">
              <p className="font-semibold text-slate-800">{selected.name} · {selected.layer}</p>
              <p className="mt-2 text-sm text-slate-600">特征：{selected.feature}</p>
              <p className="text-sm text-slate-600">影响：{selected.impact}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
