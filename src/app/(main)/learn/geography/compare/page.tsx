'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type CompareItem = {
  id: string;
  title: string;
  rows: { label: string; values: string[] }[];
};

const COMPARES: CompareItem[] = [
  {
    id: 'planets',
    title: '八大行星对比',
    rows: [
      { label: '类别', values: ['类地行星', '类地行星', '类地行星', '类地行星', '巨行星', '巨行星', '远日行星', '远日行星'] },
      { label: '距日特征', values: ['最近', '逆向自转', '存在生命', '红色行星', '最大', '有环', '侧躺公转', '风速最快'] },
      { label: '大气', values: ['极稀薄', '浓厚', '适宜', '稀薄', '氢氦', '氢氦', '氢氦甲烷', '氢氦甲烷'] },
    ],
  },
  {
    id: 'waves',
    title: '横波与纵波对比',
    rows: [
      { label: '传播速度', values: ['较慢', '较快'] },
      { label: '介质', values: ['固体', '固液气'] },
      { label: '振动方向', values: ['垂直传播', '平行传播'] },
    ],
  },
  {
    id: 'spheres',
    title: '圈层对比',
    rows: [
      { label: '圈层', values: ['大气圈', '水圈', '生物圈'] },
      { label: '特征', values: ['连续但不规则', '气体为主', '渗透各圈层'] },
      { label: '作用', values: ['提供气体与热量', '参与物质循环', '改造地表环境'] },
    ],
  },
  {
    id: 'sun',
    title: '太阳活动对比',
    rows: [
      { label: '类型', values: ['黑子', '耀斑', '日珥', '太阳风'] },
      { label: '位置', values: ['光球层', '色球层', '色球层', '日冕层'] },
      { label: '影响', values: ['活动标志', '通信干扰', '活动表现', '磁场扰动'] },
    ],
  },
];

export default function GeographyComparePage() {
  const [selected, setSelected] = useState(COMPARES[0]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/learn/geography"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button></Link>
          <h1 className="text-xl font-bold text-slate-800">📊 对比学习</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {COMPARES.map(item => (
            <Button key={item.id} variant={selected.id === item.id ? 'default' : 'outline'} size="sm" onClick={() => setSelected(item)}>{item.title}</Button>
          ))}
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">{selected.title}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">维度</th>
                    {selected.rows[0]?.values.map((v, i) => <th key={i} className="text-left py-2 px-3">{v}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {selected.rows.slice(1).map((row, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="py-2 px-3 font-medium text-slate-700">{row.label}</td>
                      {row.values.map((v, j) => <td key={j} className="py-2 px-3 text-slate-600">{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
