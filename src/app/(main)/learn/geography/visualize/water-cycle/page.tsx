'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, Droplets, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type CycleType = {
  id: string;
  name: string;
  location: string;
  description: string;
  processes: string[];
  significance: string;
  example: string;
};

const CYCLES: CycleType[] = [
  { 
    id: 'ocean', 
    name: '海陆间循环', 
    location: '海洋与陆地之间',
    description: '海洋水蒸发→水汽随气流输送至陆地上空→凝结降水→地表径流/地下径流返回海洋。',
    processes: ['蒸发', '水汽输送', '降水', '地表径流', '地下径流'],
    significance: '使陆地淡水不断得到补充，水资源得以再生，是自然界最重的水循环类型。',
    example: '夏季风把太平洋水汽输送到我国陆地，形成降水后流入大海。'
  },
  { 
    id: 'sea', 
    name: '海上内循环', 
    location: '海洋上空',
    description: '海洋表面水蒸发→水汽在海洋上空凝结形成降水。',
    processes: ['蒸发', '降水'],
    significance: '水量最大，约占水循环总量的87%，是全球水汽的主要来源。',
    example: '热带海洋上频繁的对流雨，如台风带来的降水。'
  },
  { 
    id: 'land', 
    name: '陆地内循环', 
    location: '陆地上空',
    description: '陆地上植物蒸腾、地表蒸发→水汽凝结形成降水（地形雨/对流雨/锋面雨）。',
    processes: ['蒸腾', '蒸发', '降水'],
    significance: '影响局部地区降水，对内陆干旱地区尤为重要。',
    example: '夏季午后对流雨、天山地形雨、准静止锋形成的梅雨。'
  },
];

type Significance = {
  icon: string;
  title: string;
  description: string;
};

const SIGNIFICANCES: Significance[] = [
  { icon: '💧', title: '水资源的再生', description: '水循环使水资源不断更新，陆地淡水得到补充，维持全球水量的动态平衡。' },
  { icon: '🏔️', title: '塑造地表形态', description: '流水侵蚀、搬运、堆积作用形成各种地貌，如峡谷、冲积平原、三角洲等。' },
  { icon: '🌡️', title: '调节气候', description: '水循环过程伴随着能量交换，高纬度向低纬度输送热量，调节全球热量分布。' },
  { icon: '🌱', title: '促进生命活动', description: '为生物提供水分和生存环境，是地球生命系统运转的基础。' },
  { icon: '🏭', title: '提供清洁能源', description: '水循环产生的水能是重要的可再生能源，可用于发电。' },
];

export default function WaterCyclePage() {
  const [selectedCycle, setSelectedCycle] = useState<CycleType>(CYCLES[0]);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-cyan-50/40">
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/visualize">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />返回
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-500" />
            <h1 className="text-xl font-bold text-slate-800">水循环示意图</h1>
          </div>
          <Badge className="bg-cyan-100 text-cyan-700">第三章</Badge>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-cyan-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-cyan-800">水循环</h3>
                <p className="text-sm text-cyan-700 mt-1">
                  水循环是指自然界的水在水圈、大气圈、岩石圈、生物圈中通过蒸发、植物蒸腾、水汽输送、降水、地表径流、地下径流等环节，在各种水体之间连续运动的过程。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 水循环示意图 */}
        <Card className="bg-gradient-to-b from-sky-100 to-cyan-50">
          <CardContent className="p-4">
            <div className="relative">
              {/* 海洋 */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg flex items-center justify-center">
                <span className="text-white font-medium">🌊 海洋</span>
              </div>
              
              {/* 蒸发箭头 */}
              <div className="absolute bottom-16 left-1/4 flex flex-col items-center animate-bounce" style={{ animationDuration: '2s' }}>
                <ArrowRight className="h-4 w-4 text-orange-500 rotate-[-45deg]" />
                <span className="text-xs text-orange-600 font-medium">蒸发</span>
              </div>
              
              {/* 水汽输送 */}
              <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">→</span>
                  <span className="text-xs text-slate-500">→</span>
                  <span className="text-xs text-slate-500 bg-white/50 px-2 py-0.5 rounded">水汽输送</span>
                  <span className="text-xs text-slate-500">→</span>
                  <span className="text-xs text-slate-500">→</span>
                </div>
              </div>
              
              {/* 陆地 */}
              <div className="absolute bottom-16 right-0 w-1/4 h-8 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg flex items-center justify-center">
                <span className="text-white font-medium">🏔️ 陆地</span>
              </div>
              
              {/* 降水 */}
              <div className="absolute top-8 right-1/4 flex flex-col items-center">
                <span className="text-xs text-blue-600 font-medium">降水</span>
                <div className="flex gap-0.5">
                  <Droplets className="h-3 w-3 text-blue-500" />
                  <Droplets className="h-3 w-3 text-blue-500" />
                  <Droplets className="h-3 w-3 text-blue-500" />
                </div>
                <ArrowRight className="h-4 w-4 text-blue-500 rotate-[45deg]" />
              </div>
              
              {/* 地表径流 */}
              <div className="absolute bottom-8 right-1/4">
                <ArrowRight className="h-4 w-4 text-blue-400 rotate-90" />
                <span className="text-xs text-blue-600">地表径流</span>
              </div>
              
              {/* 地下径流 */}
              <div className="absolute bottom-4 right-1/3">
                <span className="text-xs text-blue-500">地下径流</span>
              </div>

              {/* 高度提示 */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-slate-400">
                <span>高空</span>
                <span>低空</span>
                <span>地面</span>
              </div>
            </div>
            <p className="text-center text-sm text-slate-600 mt-24">水循环示意图</p>
          </CardContent>
        </Card>

        {/* 三种水循环类型 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              水循环类型
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {CYCLES.map(cycle => (
                <Button
                  key={cycle.id}
                  variant={selectedCycle.id === cycle.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCycle(cycle)}
                  size="sm"
                  className={selectedCycle.id === cycle.id ? 'bg-cyan-500' : ''}
                >
                  {cycle.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 选中循环详情 */}
        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {selectedCycle.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">{selectedCycle.name}</h3>
                  <Badge variant="outline">{selectedCycle.location}</Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-white/60 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700">循环过程</h4>
                <p className="text-sm text-slate-600 mt-1">{selectedCycle.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedCycle.processes.map((p, i) => (
                  <Badge key={i} className="bg-cyan-100 text-cyan-700">
                    {i > 0 && <ArrowRight className="h-3 w-3 mx-1" />}
                    {p}
                  </Badge>
                ))}
              </div>

              <div className="p-3 bg-white/60 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-700">重要意义</h4>
                <p className="text-sm text-slate-600 mt-1">{selectedCycle.significance}</p>
              </div>

              <div className="p-3 bg-cyan-100 rounded-lg">
                <h4 className="text-sm font-semibold text-cyan-800">举例说明</h4>
                <p className="text-sm text-cyan-700 mt-1">{selectedCycle.example}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 水循环的意义 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">水循环的意义</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SIGNIFICANCES.map((sig, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{sig.icon}</span>
                    <span className="font-medium text-slate-800">{sig.title}</span>
                  </div>
                  <p className="text-sm text-slate-600">{sig.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 高考考点 */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">📚 高考考点</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 水循环类型：海陆间循环（最重要）、海上内循环（水量最大）、陆地内循环</li>
              <li>• 水循环环节：蒸发、降水、水汽输送、地表径流、地下径流、植物蒸腾</li>
              <li>• 水循环意义：使陆地淡水资源得到更新，塑造地表形态，调节全球热量分布</li>
              <li>• 人类活动影响：植树造林（增加蒸腾）、跨流域调水（改变地表径流）、修建水库（调节径流）</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
