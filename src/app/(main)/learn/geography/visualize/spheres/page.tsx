'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, Layers, Circle, ArrowDown } from 'lucide-react';
import Link from 'next/link';

type Sphere = {
  id: string;
  name: string;
  layerType: 'inner' | 'outer';
  depth?: string;
  composition: string;
  temperature?: string;
  features: string[];
  importance: string;
};

const INNER_SPHERES: Sphere[] = [
  {
    id: 'crust',
    name: '地壳',
    layerType: 'inner',
    depth: '陆地33km / 海洋6km',
    composition: '硅酸盐矿物（硅铝层+硅镁层）',
    temperature: '20°C ~ 1000°C',
    features: ['硅铝层（花岗岩层）', '硅镁层（玄武岩层）', '厚度不均，大陆地壳厚'],
    importance: '人类生存空间，地质作用主要发生地'
  },
  {
    id: 'mantle',
    name: '地幔',
    layerType: 'inner',
    depth: '33km ~ 2900km',
    composition: '硅酸盐矿物，富含铁镁',
    temperature: '1000°C ~ 3500°C',
    features: ['上地幔：软流层（岩浆发源地）', '下地幔：固态但可缓慢流动', '地幔对流驱动板块运动'],
    importance: '板块构造运动的动力来源'
  },
  {
    id: 'outer-core',
    name: '外核',
    layerType: 'inner',
    depth: '2900km ~ 5150km',
    composition: '铁镍合金（液态）',
    temperature: '3500°C ~ 5000°C',
    features: ['液态金属，流动形成磁场', '地球磁场的发电机', '阻止太阳风直接侵袭'],
    importance: '产生地球磁场，保护生命'
  },
  {
    id: 'inner-core',
    name: '内核',
    layerType: 'inner',
    depth: '5150km ~ 6371km',
    composition: '铁镍合金（固态）',
    temperature: '5000°C ~ 6000°C',
    features: ['固态高温高压', '直径约1220km', '随地球自转缓慢转动'],
    importance: '维持地球稳定结构'
  },
];

const OUTER_SPHERES: Sphere[] = [
  {
    id: 'atmosphere',
    name: '大气圈',
    layerType: 'outer',
    composition: '氮气78%、氧气21%、其他1%',
    features: ['对流层：天气现象，与人类关系最密切', '平流层：臭氧层，航空飞行', '高层大气：电离层，无线通讯'],
    importance: '保护地球，调节温度，提供呼吸'
  },
  {
    id: 'hydrosphere',
    name: '水圈',
    layerType: 'outer',
    composition: '海洋（96.5%）、冰川、陆地水、大气水',
    features: ['连续但不规则分布', '参与物质循环', '塑造地表形态'],
    importance: '生命之源，调节气候'
  },
  {
    id: 'biosphere',
    name: '生物圈',
    layerType: 'outer',
    composition: '所有生物及其生存环境',
    features: ['渗透于大气圈底部', '水圈全部', '岩石圈上部（土壤）'],
    importance: '地球独特的生命圈层'
  },
  {
    id: 'lithosphere',
    name: '岩石圈',
    layerType: 'outer',
    composition: '地壳 + 上地幔顶部（软流层以上）',
    features: ['刚性的岩石层', '板块划分的依据', '包括大陆地壳和海洋地壳'],
    importance: '承载人类活动，矿产资源来源'
  },
];

export default function SpheresPage() {
  const [activeTab, setActiveTab] = useState<'inner' | 'outer'>('inner');
  const [selected, setSelected] = useState<Sphere>(INNER_SPHERES[0]);
  
  const spheres = activeTab === 'inner' ? INNER_SPHERES : OUTER_SPHERES;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-blue-50/40">
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/visualize">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />返回
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-500" />
            <h1 className="text-xl font-bold text-slate-800">地球圈层结构</h1>
          </div>
          <Badge className="bg-blue-100 text-blue-700">第一章</Badge>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800">地球圈层结构</h3>
                <p className="text-sm text-blue-700 mt-1">
                  地球圈层分为内部圈层（地壳、地幔、外核、内核）和外部圈层（大气圈、水圈、生物圈、岩石圈）。
                  点击左侧按钮切换查看内部/外部圈层，点击卡片查看详细知识点。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 切换按钮 */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'inner' ? 'default' : 'outline'}
            onClick={() => { setActiveTab('inner'); setSelected(INNER_SPHERES[0]); }}
            className="flex-1"
          >
            <Circle className="h-4 w-4 mr-2" />
            内部圈层
          </Button>
          <Button
            variant={activeTab === 'outer' ? 'default' : 'outline'}
            onClick={() => { setActiveTab('outer'); setSelected(OUTER_SPHERES[0]); }}
            className="flex-1"
          >
            <Layers className="h-4 w-4 mr-2" />
            外部圈层
          </Button>
        </div>

        {/* 剖面示意图 */}
        {activeTab === 'inner' && (
          <Card className="bg-gradient-to-b from-blue-100 via-blue-50 to-amber-50">
            <CardContent className="p-4">
              <div className="relative h-40 rounded-xl overflow-hidden">
                {/* 简化的地球圈层示意 */}
                <div className="absolute inset-0 flex flex-col justify-end">
                  <div className="h-6 bg-amber-600 flex items-center justify-center text-xs text-white font-medium">
                    <span className="text-center">地壳<br/><span className="text-[10px] font-normal">陆地33km/海洋6km</span></span>
                  </div>
                  <div className="h-14 bg-orange-500 flex items-center justify-center text-xs text-white font-medium">
                    <span className="text-center">地幔<br/><span className="text-[10px] font-normal">软流层在顶部</span></span>
                  </div>
                  <div className="h-10 bg-red-400 flex items-center justify-center text-xs text-white font-medium">
                    <span className="text-center">外核（液态）<br/><span className="text-[10px] font-normal">产生磁场</span></span>
                  </div>
                  <div className="h-8 bg-yellow-500 flex items-center justify-center text-xs text-white font-medium rounded-b-lg">
                    <span className="text-center">内核（固态）<br/><span className="text-[10px] font-normal">高温高压</span></span>
                  </div>
                </div>
                <ArrowDown className="absolute right-4 top-1/2 h-6 w-6 text-slate-400 animate-bounce" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 圈层选择列表 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {activeTab === 'inner' ? <Circle className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
              {activeTab === 'inner' ? '内部圈层（从外向内）' : '外部圈层（相互渗透）'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {spheres.map(sphere => (
                <Button
                  key={sphere.id}
                  variant={selected.id === sphere.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelected(sphere)}
                  className="h-auto py-2 text-center"
                >
                  <span className="text-sm">{sphere.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 选中圈层详情 */}
        <Card className={`${selected.layerType === 'inner' ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200' : 'bg-gradient-to-br from-blue-50 to-green-50 border-blue-200'}`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-xl ${selected.layerType === 'inner' ? 'bg-orange-500' : 'bg-blue-500'} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                {selected.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800">{selected.name}</h3>
                {selected.depth && <p className="text-sm text-orange-600">深度：{selected.depth}</p>}
                {selected.temperature && <p className="text-sm text-red-600">温度：{selected.temperature}</p>}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-700">物质组成</h4>
                <p className="text-sm text-slate-600">{selected.composition}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-slate-700">主要特征</h4>
                <ul className="mt-1 space-y-1">
                  {selected.features.map((f, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white/60 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700">重要意义</h4>
                <p className="text-sm text-slate-600">{selected.importance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 外部圈层关系图 */}
        {activeTab === 'outer' && (
          <Card className="bg-gradient-to-r from-blue-50 via-green-50 to-yellow-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">外部圈层关系</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="text-center p-3 bg-blue-100 rounded-lg">
                  <div className="text-2xl mb-1">🌫️</div>
                  <div className="text-sm font-medium">大气圈</div>
                </div>
                <div className="text-slate-400">↔</div>
                <div className="text-center p-3 bg-cyan-100 rounded-lg">
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-sm font-medium">水圈</div>
                </div>
                <div className="text-slate-400">↔</div>
                <div className="text-center p-3 bg-green-100 rounded-lg">
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="text-sm font-medium">生物圈</div>
                </div>
                <div className="text-slate-400">↔</div>
                <div className="text-center p-3 bg-stone-200 rounded-lg">
                  <div className="text-2xl mb-1">🪨</div>
                  <div className="text-sm font-medium">岩石圈</div>
                </div>
              </div>
              <p className="text-center text-sm text-slate-600 mt-4">
                四大外部圈层相互渗透、相互影响，共同构成人类生存环境
              </p>
            </CardContent>
          </Card>
        )}

        {/* 高考考点 */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">📚 高考考点</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 地球内部圈层结构：能说出地壳、地幔、外核、内核的位置和特征</li>
              <li>• 软流层位置：上地幔顶部，是岩浆的主要发源地</li>
              <li>• 地球磁场成因：外核液态金属流动产生电流，形成磁场</li>
              <li>• 外部圈层关系：四大圈层相互渗透，共同影响人类生存环境</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
