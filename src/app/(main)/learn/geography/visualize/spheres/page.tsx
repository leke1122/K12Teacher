'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Sphere = {
  id: string;
  name: string;
  layerType: 'inner' | 'outer';
  description: string;
};

const INNER: Sphere[] = [
  { id: 'crust', name: '地壳', layerType: 'inner', description: '最外层，硅铝层和硅镁层组成，厚度不均。' },
  { id: 'mantle', name: '地幔', layerType: 'inner', description: '中间层，上地幔存在软流层，岩浆发源地。' },
  { id: 'outer-core', name: '外核', layerType: 'inner', description: '液态，可流动，产生地球磁场。' },
  { id: 'inner-core', name: '内核', layerType: 'inner', description: '固态，高温高压，以铁镍为主。' },
];

const OUTER: Sphere[] = [
  { id: 'atmo', name: '大气圈', layerType: 'outer', description: '多层结构，对流层与人类活动关系最密切。' },
  { id: 'hydro', name: '水圈', layerType: 'outer', description: '连续但不规则的水体，包括海洋、湖泊、地下水。' },
  { id: 'bio', name: '生物圈', layerType: 'outer', description: '渗透于大气圈底部、水圈全部和岩石圈上部。' },
];

export default function SpheresPage() {
  const [selected, setSelected] = useState<Sphere>(INNER[0]);
  const items = [...INNER, ...OUTER];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/knowledge/compulsory-1"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button></Link>
          <h1 className="text-xl font-bold text-slate-800">🧩 圈层结构剖面图</h1>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">点击圈层查看特征</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {items.map(item => (
                <Button key={item.id} variant={selected.id === item.id ? 'default' : 'outline'} size="sm" onClick={() => setSelected(item)}>{item.name}</Button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border bg-white p-4">
              <p className="font-semibold text-slate-800">{selected.name}</p>
              <p className="mt-2 text-sm text-slate-600">{selected.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
