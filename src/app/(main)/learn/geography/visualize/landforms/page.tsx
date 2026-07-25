'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, Mountain, Waves, Snowflake, Sun } from 'lucide-react';
import Link from 'next/link';

type Landform = {
  id: string;
  name: string;
  icon: string;
  category: string;
  formation: string;
  features: string[];
  distribution: string;
  examples: string[];
};

const LANDFORMS: Landform[] = [
  {
    id: 'karst',
    name: '喀斯特地貌',
    icon: '🪨',
    category: '流水地貌',
    formation: '可溶性岩石（石灰岩）遇到含有CO₂的流水溶蚀形成。',
    features: ['地表：石芽、溶沟、峰林、峰丛、洼地', '地下：溶洞、暗河、石钟乳、石笋、石柱', '形成需要：岩石可溶性+流水+CO₂'],
    distribution: '主要分布在中国西南地区（云南、贵州、广西）、世界地中海沿岸等喀斯特地貌区。',
    examples: ['桂林山水、云南石林、贵州黄果树瀑布']
  },
  {
    id: 'dune',
    name: '风力地貌（风沙地貌）',
    icon: '🏜️',
    category: '风力地貌',
    formation: '干旱半干旱地区，风力吹蚀、搬运、堆积形成。',
    features: ['风蚀地貌：风蚀柱、风蚀洼地、风蚀蘑菇、雅丹地貌', '风积地貌：沙丘、新月形沙丘、沙漠', '风蚀城堡、风蚀谷'],
    distribution: '中国西北地区（塔克拉玛干沙漠、巴丹吉林沙漠）、非洲撒哈拉沙漠、澳大利亚中部沙漠。',
    examples: ['新疆魔鬼城、甘肃鸣沙山、内蒙古响沙湾']
  },
  {
    id: 'coast',
    name: '海岸地貌',
    icon: '🌊',
    category: '海浪地貌',
    formation: '海浪、潮汐、海风等海水动力对海岸的侵蚀、搬运、堆积作用形成。',
    features: ['海蚀地貌：海蚀崖、海蚀平台、海蚀穴、海蚀拱桥、海蚀柱', '海积地貌：海滩、沙堤、离岸堤、潮滩', '海蚀作用强则海岸后退，海积作用强则海岸前进'],
    distribution: '中国东部沿海地区，如山东半岛、辽东半岛、浙江、福建、广东海岸。',
    examples: ['青岛金沙滩、福建霞浦滩涂、浙江钱塘江潮']
  },
  {
    id: 'glacier',
    name: '冰川地貌',
    icon: '🧊',
    category: '冰川地貌',
    formation: '在高纬度或高海拔地区，积雪在压力下形成冰川，冰川运动对地表进行侵蚀、搬运、堆积形成。',
    features: ['冰蚀地貌：冰斗、角峰、U型谷、峡湾', '冰积地貌：冰碛丘陵、鼓丘、蛇形丘', '冰川擦痕、冰斗湖'],
    distribution: '中国西部高原高山（珠穆朗玛峰、贡嘎山、天山）、欧洲阿尔卑斯山、北欧、北美洛基山脉。',
    examples: ['四川海螺沟冰川、青海可可西里、西藏米堆冰川']
  },
  {
    id: 'yellow',
    name: '黄土地貌',
    icon: '🏜️',
    category: '流水地貌（特殊）',
    formation: '第四纪以来风力搬运堆积的黄色粉土沉积物，在流水侵蚀作用下形成。',
    features: ['黄土塬（平坦顶面）', '黄土梁（长条状高地）', '黄土峁（孤立的圆顶小山）', '沟谷发育，水土流失严重'],
    distribution: '中国黄土高原最集中（陕西、甘肃、宁夏、山西），面积约64万平方公里。',
    examples: ['陕西延安黄土梁、甘肃定西黄土峁']
  },
];

type CategoryInfo = {
  name: string;
  icon: string;
  color: string;
  description: string;
};

const CATEGORIES: CategoryInfo[] = [
  { name: '流水地貌', icon: '💧', color: 'from-blue-500 to-cyan-500', description: '流水侵蚀、搬运、堆积形成，如喀斯特、黄土、河流地貌' },
  { name: '风力地貌', icon: '💨', color: 'from-amber-500 to-orange-500', description: '干旱地区风力作用形成，如沙漠、雅丹、风蚀地貌' },
  { name: '海岸地貌', icon: '🌊', color: 'from-cyan-500 to-blue-500', description: '海浪、潮汐作用形成，如海蚀崖、海滩、潮滩' },
  { name: '冰川地貌', icon: '❄️', color: 'from-slate-400 to-blue-400', description: '冰川运动形成，如U型谷、冰斗、峡湾' },
];

export default function LandformsPage() {
  const [selected, setSelected] = useState<Landform>(LANDFORMS[0]);
  const [showCategories, setShowCategories] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-stone-50/40">
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/visualize">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />返回
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-stone-500" />
            <h1 className="text-xl font-bold text-slate-800">地貌类型图鉴</h1>
          </div>
          <Badge className="bg-stone-100 text-stone-700">第三章</Badge>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-gradient-to-r from-stone-50 to-amber-50 border-stone-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-stone-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-stone-800">地貌类型</h3>
                <p className="text-sm text-stone-700 mt-1">
                  地貌是地球表面在内外力作用下形成的各种形态。按成因分为流水地貌、风力地貌、海岸地貌、冰川地貌等。
                  点击下方卡片查看各类地貌详情。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 地貌分类 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mountain className="h-4 w-4" />
                地貌分类
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowCategories(!showCategories)}>
                {showCategories ? '收起' : '展开'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showCategories && (
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <div key={cat.name} className={`p-3 rounded-lg bg-gradient-to-br ${cat.color} text-white`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-semibold">{cat.name}</span>
                    </div>
                    <p className="text-xs opacity-90">{cat.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* 地貌列表 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {LANDFORMS.map(landform => (
            <Button
              key={landform.id}
              variant={selected.id === landform.id ? 'default' : 'outline'}
              onClick={() => setSelected(landform)}
              className={`h-auto py-3 flex flex-col items-center gap-1
                ${selected.id === landform.id ? 'bg-stone-500' : ''}`}
            >
              <span className="text-2xl">{landform.icon}</span>
              <span className="text-sm">{landform.name}</span>
              <span className="text-xs opacity-70">{landform.category}</span>
            </Button>
          ))}
        </div>

        {/* 选中地貌详情 */}
        <Card className="bg-gradient-to-br from-stone-50 to-amber-50 border-stone-200">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-stone-400 to-amber-500 flex items-center justify-center text-3xl flex-shrink-0">
                {selected.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-800">{selected.name}</h3>
                  <Badge variant="outline">{selected.category}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-white/60 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700">形成原因</h4>
                <p className="text-sm text-slate-600 mt-1">{selected.formation}</p>
              </div>

              <div className="p-3 bg-white/60 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700">主要特征</h4>
                <ul className="mt-1 space-y-1">
                  {selected.features.map((f, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-stone-500 mt-1">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white/60 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700">分布地区</h4>
                <p className="text-sm text-slate-600 mt-1">{selected.distribution}</p>
              </div>

              <div className="p-3 bg-stone-100 rounded-lg">
                <h4 className="text-sm font-semibold text-stone-800">典型实例</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selected.examples.map((ex, i) => (
                    <Badge key={i} className="bg-stone-200 text-stone-700">
                      {ex}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 外力作用对比 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">常见地貌形成作用对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">地貌类型</th>
                    <th className="text-left p-2 font-medium">主要外力</th>
                    <th className="text-left p-2 font-medium">典型地区</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-blue-50">
                    <td className="p-2">喀斯特地貌</td>
                    <td className="p-2">流水溶蚀</td>
                    <td className="p-2">西南地区</td>
                  </tr>
                  <tr className="border-b bg-amber-50">
                    <td className="p-2">风沙地貌</td>
                    <td className="p-2">风力侵蚀/堆积</td>
                    <td className="p-2">西北干旱区</td>
                  </tr>
                  <tr className="border-b bg-cyan-50">
                    <td className="p-2">海岸地貌</td>
                    <td className="p-2">海浪作用</td>
                    <td className="p-2">沿海地区</td>
                  </tr>
                  <tr className="border-b bg-slate-50">
                    <td className="p-2">冰川地貌</td>
                    <td className="p-2">冰川侵蚀/堆积</td>
                    <td className="p-2">高原高山</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="p-2">黄土地貌</td>
                    <td className="p-2">流水侵蚀</td>
                    <td className="p-2">黄土高原</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 高考考点 */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">📚 高考考点</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 喀斯特地貌：形成条件（可溶性岩石+流水+CO₂），地表和地下特征，分布地区</li>
              <li>• 风沙地貌：干旱半干旱地区，风蚀地貌（雅丹、风蚀蘑菇）和风积地貌（沙丘）的区别</li>
              <li>• 海岸地貌：海蚀地貌（海蚀崖、海蚀柱）与海积地貌（海滩、潮滩）的形成</li>
              <li>• 冰川地貌：冰斗、U型谷、峡湾等特征及其形成过程</li>
              <li>• 黄土地貌：塬、梁、峁的区别，水土流失问题</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
