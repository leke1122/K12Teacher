'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type TimelineItem = {
  id: string;
  era: string;
  period: string;
  event: string;
  life: string;
};

const TIMELINE: TimelineItem[] = [
  { id: 'had', era: '冥古宙', period: '约46-40亿年', event: '地球形成，表面熔融', life: '无生命' },
  { id: 'arch', era: '太古宙', period: '约40-25亿年', event: '地壳稳定，原始海洋形成', life: '原始生命出现' },
  { id: 'proto', era: '元古宙', period: '约25-5.41亿年', event: '蓝藻繁盛，大氧化事件', life: '真核生物出现' },
  { id: 'phano', era: '古生代', period: '约5.41-2.52亿年', event: '寒武纪生命大爆发', life: '鱼类、两栖类、蕨类繁盛' },
  { id: 'meso', era: '中生代', period: '约2.52-0.66亿年', event: '爬行动物称霸', life: '恐龙繁盛，裸子植物' },
  { id: 'ceno', era: '新生代', period: '约6600万年前至今', event: '哺乳动物繁盛', life: '被子植物、人类出现' },
];

export default function GeologyTimelinePage() {
  const [selected, setSelected] = useState<TimelineItem>(TIMELINE[0]);
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/knowledge/compulsory-1"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button></Link>
          <h1 className="text-xl font-bold text-slate-800">⏳ 地质年代时间轴</h1>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">点击时期查看详情</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {TIMELINE.map(item => (
                <Button key={item.id} variant={selected.id === item.id ? 'default' : 'outline'} size="sm" onClick={() => setSelected(item)}>{item.era}</Button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border bg-white p-4">
              <p className="font-semibold text-slate-800">{selected.era} · {selected.period}</p>
              <p className="mt-2 text-sm text-slate-600">地质事件：{selected.event}</p>
              <p className="text-sm text-slate-600">生物演化：{selected.life}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
