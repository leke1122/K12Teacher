'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, Globe, Star, Droplets, Wind, Leaf } from 'lucide-react';
import Link from 'next/link';

type Planet = {
  id: string;
  name: string;
  type: string;
  distance: string;
  mass: string;
  diameter: string;
  temperature: string;
  satellites: number;
  atmosphere: string;
  feature: string;
};

const PLANETS: Planet[] = [
  { id: 'mercury', name: '水星', type: '类地', distance: '0.39 AU', mass: '0.055 地球', diameter: '4878 km', temperature: '-173~427°C', satellites: 0, atmosphere: '极稀薄', feature: '距日最近，无大气调节，温差极大' },
  { id: 'venus', name: '金星', type: '类地', distance: '0.72 AU', mass: '0.82 地球', diameter: '12104 km', temperature: '465~485°C', satellites: 0, atmosphere: '浓密（CO₂ 96%）', feature: '温室效应极强，表面温度高于水星' },
  { id: 'earth', name: '地球', type: '类地', distance: '1.00 AU', mass: '1.0 地球', diameter: '12742 km', temperature: '-89~57°C', satellites: 1, atmosphere: '适宜（氮氧为主）', feature: '唯一存在生命的行星' },
  { id: 'mars', name: '火星', type: '类地', distance: '1.52 AU', mass: '0.11 地球', diameter: '6787 km', temperature: '-63°C（平均）', satellites: 2, atmosphere: '稀薄（CO₂ 95%）', feature: '红色行星，可能有地下水' },
  { id: 'jupiter', name: '木星', type: '巨行星', distance: '5.20 AU', mass: '318 地球', diameter: '139820 km', temperature: '-108°C（云顶）', satellites: 95, atmosphere: '氢氦为主', feature: '体积最大，大红斑风暴' },
  { id: 'saturn', name: '土星', type: '巨行星', distance: '9.58 AU', mass: '95 地球', diameter: '116460 km', temperature: '-139°C（云顶）', satellites: 146, atmosphere: '氢氦为主', feature: '有明显环系，密度最小' },
  { id: 'uranus', name: '天王星', type: '远日', distance: '19.2 AU', mass: '14.5 地球', diameter: '50724 km', temperature: '-197°C', satellites: 27, atmosphere: '氢氦甲烷', feature: '侧躺自转（自转轴倾斜98°）' },
  { id: 'neptune', name: '海王星', type: '远日', distance: '30.1 AU', mass: '17.1 地球', diameter: '49244 km', temperature: '-201°C', satellites: 14, atmosphere: '氢氦甲烷', feature: '风速最快，可达2100km/h' },
];

const LIFE_CONDITIONS = [
  { icon: Star, title: '光照条件', desc: '适中的日地距离（1 AU），获得适宜的光和热', status: '满足' },
  { icon: Droplets, title: '液态水', desc: '温度范围使水以液态存在，形成海洋', status: '满足' },
  { icon: Wind, title: '大气', desc: '适中的大气厚度，调节温度，阻挡有害辐射', status: '满足' },
  { icon: Leaf, title: '磁场保护', desc: '磁场保护生命免受太阳风和高能粒子侵害', status: '满足' },
  { icon: Globe, title: '岩石表面', desc: '固体表面提供稳定的生活基础', status: '满足' },
  { icon: Info, title: '稳定轨道', desc: '安全的宇宙环境，很少受到小行星撞击', status: '满足' },
];

const PLANET_TYPES = [
  { type: '类地行星', planets: ['水星', '金星', '地球', '火星'], features: '体积小、密度大、卫星少、有固体表面' },
  { type: '巨行星', planets: ['木星', '土星'], features: '体积大、密度小、卫星多、有环系、主要由气体构成' },
  { type: '远日行星', planets: ['天王星', '海王星'], features: '离太阳远、温度低、密度适中、卫星较多' },
];

export default function PlanetsPage() {
  const [selected, setSelected] = useState<Planet>(PLANETS[2]);
  const [showLifeConditions, setShowLifeConditions] = useState(false);

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
            <Globe className="h-5 w-5 text-emerald-500" />
            <h1 className="text-xl font-bold text-slate-800">行星地球特征</h1>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">第一章</Badge>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-emerald-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-800">太阳系八大行星</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  按离太阳由近及远：水星、金星、地球、火星、木星、土星、天王星、海王星。
                  按特征分为类地行星、巨行星、远日行星。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 行星分类 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">行星分类</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PLANET_TYPES.map(cat => (
                <div key={cat.type} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">{cat.type}</span>
                    <span className="text-xs text-slate-500">({cat.planets.join('、')})</span>
                  </div>
                  <p className="text-sm text-slate-600">{cat.features}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 行星选择 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">点击查看行星详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {PLANETS.map(planet => (
                <Button
                  key={planet.id}
                  variant={selected.id === planet.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelected(planet)}
                  className={selected.id === planet.id ? 'bg-emerald-500' : ''}
                >
                  {planet.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 选中行星详情 */}
        <Card className={`
          ${selected.type === '类地' ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200' : 
            selected.type === '巨行星' ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200' : 
            'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'}
        `}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white
                ${selected.type === '类地' ? 'bg-gradient-to-br from-orange-400 to-red-500' : 
                  selected.type === '巨行星' ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 
                  'bg-gradient-to-br from-blue-400 to-cyan-500'}`}>
                {selected.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-slate-800">{selected.name}</h3>
                  <Badge variant="outline">{selected.type}</Badge>
                </div>
                <p className="text-slate-600 mt-1">{selected.feature}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white/60 rounded-lg">
                <p className="text-xs text-slate-500">距日距离</p>
                <p className="font-semibold text-slate-800">{selected.distance}</p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <p className="text-xs text-slate-500">质量</p>
                <p className="font-semibold text-slate-800">{selected.mass}</p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <p className="text-xs text-slate-500">直径</p>
                <p className="font-semibold text-slate-800">{selected.diameter}</p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <p className="text-xs text-slate-500">表面温度</p>
                <p className="font-semibold text-slate-800">{selected.temperature}</p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <p className="text-xs text-slate-500">卫星数</p>
                <p className="font-semibold text-slate-800">{selected.satellites}个</p>
              </div>
              <div className="p-3 bg-white/60 rounded-lg">
                <p className="text-xs text-slate-500">大气成分</p>
                <p className="font-semibold text-slate-800">{selected.atmosphere}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 地球存在生命的条件 */}
        {selected.id === 'earth' && (
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-emerald-500" />
                地球存在生命的条件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LIFE_CONDITIONS.map((cond, i) => {
                  const Icon = cond.icon;
                  return (
                    <div key={i} className="p-3 bg-white rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium text-slate-800">{cond.title}</span>
                      </div>
                      <p className="text-xs text-slate-600">{cond.desc}</p>
                      <Badge className="mt-2 bg-emerald-100 text-emerald-700 text-xs">{cond.status}</Badge>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-emerald-100 rounded-lg">
                <p className="text-sm text-emerald-800">
                  <strong>内因：</strong>适宜的温度、液态水、适宜的大气、安全的轨道
                  <br />
                  <strong>外因：</strong>稳定的恒星（太阳）、安全的星际环境、适中的月球保护
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 高考考点 */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">📚 高考考点</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 太阳系八大行星：能按顺序说出八大行星名称</li>
              <li>• 行星分类：类地行星（特征）、巨行星、远日行星的区别</li>
              <li>• 地球特殊性：分析地球与其他类地行星的差异，理解生命存在的条件</li>
              <li>• 存在生命的条件：内因（温度、水、大气）+ 外因（太阳、木星保护）</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
