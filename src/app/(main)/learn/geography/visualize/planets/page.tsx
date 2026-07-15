'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Planet = {
  id: string;
  name: string;
  distance: string;
  mass: string;
  volume: string;
  satellites: string;
  feature: string;
};

const PLANETS: Planet[] = [
  { id: 'mercury', name: '水星', distance: '0.39 AU', mass: '0.055 Earth', volume: '0.056 Earth', satellites: '0', feature: '距日最近，温差极大' },
  { id: 'venus', name: '金星', distance: '0.72 AU', mass: '0.815 Earth', volume: '0.857 Earth', satellites: '0', feature: '大气逆温，表面温度最高' },
  { id: 'earth', name: '地球', distance: '1.00 AU', mass: '1.0 Earth', volume: '1.0 Earth', satellites: '1', feature: '存在生命，液态水丰富' },
  { id: 'mars', name: '火星', distance: '1.52 AU', mass: '0.107 Earth', volume: '0.151 Earth', satellites: '2', feature: '红色行星，有稀薄大气' },
  { id: 'jupiter', name: '木星', distance: '5.20 AU', mass: '317.8 Earth', volume: '1321 Earth', satellites: '95', feature: '体积最大，大红斑风暴' },
  { id: 'saturn', name: '土星', distance: '9.58 AU', mass: '95.2 Earth', volume: '764 Earth', satellites: '146', feature: '有明显环系' },
  { id: 'uranus', name: '天王星', distance: '19.2 AU', mass: '14.5 Earth', volume: '63.1 Earth', satellites: '27', feature: '侧躺公转' },
  { id: 'neptune', name: '海王星', distance: '30.1 AU', mass: '17.1 Earth', volume: '57.7 Earth', satellites: '14', feature: '风暴强，风速最快' },
];

export default function PlanetsPage() {
  const [selected, setSelected] = useState<Planet>(PLANETS[2]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/knowledge/compulsory-1"><Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button></Link>
          <h1 className="text-xl font-bold text-slate-800">🪐 太阳系行星轨道图</h1>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">点击行星查看详情</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {PLANETS.map(planet => (
                <Button key={planet.id} variant={selected.id === planet.id ? 'default' : 'outline'} size="sm" onClick={() => setSelected(planet)}>{planet.name}</Button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border bg-white p-4">
              <p className="font-semibold text-slate-800">{selected.name}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <p>距日距离：{selected.distance}</p>
                <p>质量：{selected.mass}</p>
                <p>体积：{selected.volume}</p>
                <p>卫星数：{selected.satellites}</p>
                <p className="col-span-2">特征：{selected.feature}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
