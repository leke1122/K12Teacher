'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, Flame, Circle, ArrowDown, Zap, Radio } from 'lucide-react';
import Link from 'next/link';

type SunLayer = {
  id: string;
  name: string;
  height: string;
  temperature: string;
  color: string;
  features: string[];
};

const SUN_LAYERS = [
  { id: 'core', name: '核心', height: '0~0.25R☉', temperature: '15,000,000°C', color: 'from-yellow-500 to-orange-500', features: ['核聚变反应区', '氢聚变为氦', '产生绝大部分能量'] },
  { id: 'radiative', name: '辐射区', height: '0.25~0.7R☉', temperature: '7,000,000°C → 2,000,000°C', color: 'from-orange-400 to-orange-500', features: ['能量以辐射方式传递', '光子需要上万年才能传出', '温度逐渐降低'] },
  { id: 'convective', name: '对流层', height: '0.7~1.0R☉', temperature: '2,000,000°C → 5,800°C', color: 'from-orange-500 to-yellow-400', features: ['能量以对流方式传递', '气体上下流动', '产生太阳米粒组织'] },
  { id: 'photosphere', name: '光球层', height: '0 (可见表面)', temperature: '5,800°C (~5800K)', color: 'from-yellow-400 to-yellow-300', features: ['太阳可见表面', '太阳光主要来源', '黑子出现在此层'] },
  { id: 'chromosphere', name: '色球层', height: '~2,000km', temperature: '5,800°C → ~20,000°C', color: 'from-red-400 to-red-500', features: ['日全食时可见红色边缘', '耀斑和日珥出现', '温度反而升高'] },
  { id: 'corona', name: '日冕层', height: '>2,000km', temperature: '1,000,000°C+', color: 'from-blue-300 to-transparent', features: ['太阳大气最外层', '日全食时可见白光', '太阳风由此发出'] },
];

type SunActivity = {
  id: string;
  name: string;
  layer: string;
  layerId: string;
  type: string;
  feature: string;
  mechanism: string;
  impact: string[];
  cycle: string;
};

const ACTIVITIES: SunActivity[] = [
  { id: 'sunspot', name: '黑子', layer: '光球层', layerId: 'photosphere', type: '太阳活动标志', feature: '光球层温度较低的暗斑区域，温度约4500°C，比周围低1000多度。', mechanism: '太阳磁场活动导致对流受到抑制，局部区域温度降低。', impact: ['太阳活动强弱的标志', '黑子多时其他活动也频繁', '约11年周期', '可预测太阳活动'], cycle: '约11年（太阳活动周期）' },
  { id: 'solar-flare', name: '耀斑', layer: '色球层', layerId: 'chromosphere', type: '剧烈太阳活动', feature: '色球层中局部突然增亮的现象，是最剧烈的太阳活动，能在短时间内释放巨大能量。', mechanism: '太阳磁场能量快速释放，通常伴随日冕物质抛射。', impact: ['释放高能电磁辐射', '影响短波无线电通信', '引发电离层扰动', '威胁卫星和航天器', '到达地球引发磁暴'], cycle: '与黑子周期同步' },
  { id: 'prominence', name: '日珥', layer: '色球层', layerId: 'chromosphere', type: '太阳活动现象', feature: '从太阳表面向外延伸的红色火焰状等离子体结构，可达数十万公里高度。', mechanism: '受太阳磁场支撑的等离子体弧柱，爆发时可能形成日冕物质抛射。', impact: ['太阳活动活跃表现', '爆发时可能影响地球', '日全食时肉眼可见', '高度可达数十万公里'], cycle: '与黑子周期相关' },
  { id: 'solar-wind', name: '太阳风', layer: '日冕层', layerId: 'corona', type: '持续性活动', feature: '日冕层高温膨胀，持续向外喷射高速带电粒子流，速度可达300-800km/s。', mechanism: '日冕层温度极高，高温使带电粒子挣脱太阳引力，向宇宙空间喷射。', impact: ['形成行星际空间环境', '引发地球极光', '扰动地球磁场（地磁暴）', '影响卫星通讯', '威胁宇航员安全'], cycle: '持续存在，周期变化' },
];

export default function SunActivitiesPage() {
  const [selected, setSelected] = useState<SunActivity>(ACTIVITIES[0]);
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-orange-50/40">
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/visualize">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />返回
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-800">太阳活动</h1>
          </div>
          <Badge className="bg-orange-100 text-orange-700">第一章</Badge>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-800">太阳大气结构</h3>
                <p className="text-sm text-orange-700 mt-1">
                  太阳大气从内到外分为：光球层（可见表面）→ 色球层 → 日冕层。
                  太阳活动主要发生在色球层和日冕层，周期约11年。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 太阳大气结构 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Circle className="h-4 w-4" />
                太阳大气结构（从内到外）
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowLayers(!showLayers)}>
                {showLayers ? '收起' : '展开'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showLayers && (
            <CardContent>
              <div className="space-y-2">
                {SUN_LAYERS.map((layer, i) => (
                  <div key={layer.id} className={`p-3 rounded-lg bg-gradient-to-r ${layer.color} text-white`}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{layer.name}</span>
                          <span className="text-xs opacity-80">高度: {layer.height}</span>
                        </div>
                        <p className="text-xs mt-1 opacity-90">温度: {layer.temperature}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {layer.features.map((f, j) => (
                        <span key={j} className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* 太阳活动类型 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">太阳活动类型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ACTIVITIES.map(item => (
                <Button
                  key={item.id}
                  variant={selected.id === item.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelected(item)}
                  className={selected.id === item.id ? 'bg-orange-500' : ''}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 选中活动详情 */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {selected.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-800">{selected.name}</h3>
                  <Badge variant="outline">{selected.layer}</Badge>
                  <Badge className="bg-orange-100 text-orange-700">{selected.type}</Badge>
                </div>
                <p className="text-sm text-orange-600 mt-1">周期: {selected.cycle}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-white/60 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <Circle className="h-3 w-3" /> 基本特征
                </h4>
                <p className="text-sm text-slate-600 mt-1">{selected.feature}</p>
              </div>

              <div className="p-3 bg-white/60 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <ArrowDown className="h-3 w-3" /> 形成机制
                </h4>
                <p className="text-sm text-slate-600 mt-1">{selected.mechanism}</p>
              </div>

              <div className="p-3 bg-white/60 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> 对地球的影响
                </h4>
                <ul className="mt-1 space-y-1">
                  {selected.impact.map((impact, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      {impact}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 太阳活动对地球的影响 */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Radio className="h-4 w-4 text-blue-500" />
              太阳活动对地球的影响
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg">
                <h4 className="font-medium text-slate-800">极光</h4>
                <p className="text-sm text-slate-600 mt-1">太阳风带电粒子进入两极大气层，激发大气原子产生绚丽光芒。</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <h4 className="font-medium text-slate-800">磁暴</h4>
                <p className="text-sm text-slate-600 mt-1">太阳活动引发地球磁场剧烈扰动，影响导航和通讯。</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <h4 className="font-medium text-slate-800">短波通讯中断</h4>
                <p className="text-sm text-slate-600 mt-1">耀斑产生的高能辐射影响电离层，使短波信号衰减或中断。</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <h4 className="font-medium text-slate-800">卫星故障</h4>
                <p className="text-sm text-slate-600 mt-1">高能粒子和辐射威胁卫星电子设备，可能导致卫星失灵。</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 高考考点 */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">📚 高考考点</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 太阳大气结构：从内到外（光球层→色球层→日冕层）</li>
              <li>• 黑子：出现在光球层，是太阳活动强弱的标志，周期约11年</li>
              <li>• 耀斑：最剧烈的太阳活动，影响无线电通讯、引发磁暴</li>
              <li>• 太阳风：日冕层高温膨胀形成，带电粒子流引发极光和磁暴</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
