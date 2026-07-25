'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, Wind, Thermometer, Sun, CloudRain, ArrowDown } from 'lucide-react';
import Link from 'next/link';

type AtmosphereLayer = {
  id: string;
  name: string;
  height: string;
  temperature: string;
  features: string[];
  importance: string;
};

const LAYERS: AtmosphereLayer[] = [
  { id: 'troposphere', name: '对流层', height: '0~8/18km', temperature: '随高度降低', features: ['天气现象集中区', '气温随高度递减', '云雨雪等主要发生层', '与人类关系最密切'], importance: '直接影响人类生活，是大气科学研究的重点' },
  { id: 'stratosphere', name: '平流层', height: '8/18~55km', temperature: '随高度升高', features: ['臭氧层所在', '大气平稳', '适宜飞机飞行', '气温随高度增加'], importance: '臭氧层吸收紫外线，保护地球生物' },
  { id: 'mesosphere', name: '中间层', height: '55~85km', temperature: '随高度降低', features: ['气温随高度递减', '大气极其稀薄', '流星燃烧区', '氮氧为主'], importance: '流星燃烧销毁，保护地面安全' },
  { id: 'thermosphere', name: '热层', height: '85~600km', temperature: '随高度升高', features: ['气温很高', '电离层所在', '极光出现区', '卫星运行轨道'], importance: '电离层反射无线电波，极光发生区' },
  { id: 'exosphere', name: '外逸层', height: '>600km', temperature: '向外降低', features: ['大气极度稀薄', '大气向太空逃逸', '卫星轨道下限', '氢氦为主'], importance: '地球大气与星际空间的过渡区' },
];

type HeatProcess = {
  id: string;
  name: string;
  step: number;
  description: string;
  proportion: string;
  effect: string;
};

const HEAT_PROCESSES: HeatProcess[] = [
  { id: 'sunlight', name: '太阳辐射到达大气上界', step: 1, description: '太阳以短波辐射形式向宇宙空间释放能量，其中约22亿分之一到达地球大气上界。', proportion: '100%', effect: '大气受热的根本能量来源' },
  { id: 'absorb', name: '大气吸收', step: 2, description: '大气中的臭氧吸收紫外线，水汽和二氧化碳吸收红外线。但大气主要直接吸收的太阳辐射很少（约19%）。', proportion: '19%', effect: '大气获得热量，但直接吸收较少' },
  { id: 'scatter', name: '大气散射和反射', step: 3, description: '云层、尘埃等反射和散射太阳辐射，使约31%的太阳辐射返回宇宙空间。', proportion: '约31%', effect: '削弱到达地面的太阳辐射' },
  { id: 'ground', name: '到达地面', step: 4, description: '约50%的太阳辐射穿过大气到达地面，被地面吸收，使地面升温。', proportion: '约50%', effect: '地面获得热量，是大气热量的间接来源' },
  { id: 'terrestrial', name: '地面辐射', step: 5, description: '地面吸收太阳辐射后升温，以长波红外辐射形式向大气和宇宙空间辐射能量。', proportion: '100%', effect: '大气受热的主要热源' },
  { id: 'infrared', name: '大气吸收地面辐射', step: 6, description: '大气中的水汽、二氧化碳等吸收地面长波辐射，使大气升温。同时大气也向外辐射红外线。', proportion: '~84%', effect: '大气获得热量，产生大气逆辐射' },
  { id: 'counter', name: '大气逆辐射', step: 7, description: '大气吸收地面辐射后，向地面释放大气逆辐射，将部分热量返还地面。', proportion: '~66%', effect: '保温作用，减小地面温差' },
];

export default function AtmospherePage() {
  const [step, setStep] = useState(0);
  const current = HEAT_PROCESSES[step];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-sky-50/40">
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/visualize">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />返回
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-sky-500" />
            <h1 className="text-xl font-bold text-slate-800">大气受热过程</h1>
          </div>
          <Badge className="bg-sky-100 text-sky-700">第二章</Badge>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-sky-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sky-800">大气受热过程</h3>
                <p className="text-sm text-sky-700 mt-1">
                  大气受热主要来自两个方面：大气直接吸收太阳辐射（较少）和地面吸收太阳辐射后放出的地面辐射（主要）。
                  点击下方按钮逐步了解大气受热过程。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 大气垂直分层 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              大气垂直分层（从低到高）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {LAYERS.map((layer, i) => (
                <div key={layer.id} className="p-3 bg-gradient-to-r from-sky-100 to-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{layer.name}</span>
                        <span className="text-xs text-slate-500">高度: {layer.height}</span>
                        <span className="text-xs text-slate-500">温度: {layer.temperature}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {layer.features.map((f, j) => (
                          <span key={j} className="px-2 py-0.5 bg-white/60 rounded-full text-xs text-slate-600">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-sky-600 mt-1 ml-8">{layer.importance}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 大气受热过程 */}
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              大气受热过程
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 步骤指示器 */}
            <div className="flex items-center justify-center gap-1 mb-4">
              {HEAT_PROCESSES.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setStep(i)}
                  className={`w-8 h-8 rounded-full text-xs font-bold transition-all
                    ${step === i ? 'bg-orange-500 text-white scale-110' : 
                      i < step ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* 当前步骤详情 */}
            <div className="p-4 bg-white rounded-xl border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                  第{current.step}步
                </span>
                <h3 className="font-bold text-slate-800">{current.name}</h3>
                <Badge className="bg-orange-100 text-orange-700 ml-auto">{current.proportion}</Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{current.description}</p>
              <div className="mt-3 p-2 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-700">
                  <strong>作用：</strong>{current.effect}
                </p>
              </div>
            </div>

            {/* 上一步/下一步 */}
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                上一步
              </Button>
              <Button
                onClick={() => setStep(Math.min(HEAT_PROCESSES.length - 1, step + 1))}
                disabled={step === HEAT_PROCESSES.length - 1}
                className="bg-orange-500"
              >
                下一步
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 大气保温作用 */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-green-500" />
              大气保温作用
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg">
                <h4 className="font-medium text-slate-800">白天（晴朗天气）</h4>
                <p className="text-sm text-slate-600 mt-1">
                  白天地面被太阳辐射加热，温度升高。地面辐射被大气吸收，大气逆辐射将部分热量返还地面，减小地面热量散失。
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <h4 className="font-medium text-slate-800">夜晚（晴朗天气）</h4>
                <p className="text-sm text-slate-600 mt-1">
                  夜晚没有太阳辐射，地面通过辐射散热。浓密大气层的大气逆辐射较强，保温效果明显，减小昼夜温差。
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <h4 className="font-medium text-slate-800">阴天 vs 晴天</h4>
                <p className="text-sm text-slate-600 mt-1">
                  <strong>阴天：</strong>云层反射太阳辐射，到达地面的太阳辐射少，气温较低；夜晚云层强的大气逆辐射保温强，温差小。
                  <br/>
                  <strong>晴天：</strong>白天太阳辐射强，夜晚大气逆辐射弱，保温差，温差大。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 高考考点 */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">📚 高考考点</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 大气分层：对流层特点（气温随高度递减、与人类关系密切），平流层特点（臭氧层、气温随高度递增）</li>
              <li>• 大气受热过程：太阳辐射（短波）→ 地面吸收 → 地面辐射（长波）→ 大气吸收 → 大气逆辐射</li>
              <li>• 大气保温作用：大气逆辐射将部分热量返还地面，减小昼夜温差</li>
              <li>• 影响大气逆辐射的因素：大气中水汽、二氧化碳含量越高，保温作用越强</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
