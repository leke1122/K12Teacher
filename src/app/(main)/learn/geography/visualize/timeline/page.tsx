'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Info, Clock, Fish, Bug, TreePine, Bird, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

type Era = {
  id: string;
  name: string;
  start: string;
  end: string;
  duration: string;
  color: string;
  bgColor: string;
  mainEvents: string[];
  climate: string;
  life: {
    title: string;
    stages: string[];
  };
  geological: string[];
};

const ERAS: Era[] = [
  {
    id: 'hadean',
    name: '冥古宙',
    start: '46亿年前',
    end: '40亿年前',
    duration: '约6亿年',
    color: 'from-gray-700 to-gray-900',
    bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
    mainEvents: [
      '地球形成（46亿年前）',
      '原始月球形成（45亿年前）',
      '地球表面熔融状态',
      '原始大气形成（氢、氦）',
      '大量陨石撞击'
    ],
    climate: '表面温度极高，火山活动剧烈，原始大气层形成',
    life: {
      title: '无生命时期',
      stages: ['地球形成初期，星球表面完全熔融', '铁镍分异形成地核', '挥发性物质形成原始大气', '约40亿年前，地球表面开始冷却凝固']
    },
    geological: ['原始地壳形成', '原始海洋出现（40亿年前）', '最古老岩石年龄约41亿年']
  },
  {
    id: 'archean',
    name: '太古宙',
    start: '40亿年前',
    end: '25亿年前',
    duration: '约15亿年',
    color: 'from-green-600 to-green-800',
    bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
    mainEvents: [
      '蓝藻（蓝细菌）出现',
      '光合作用开始',
      '大气中开始积累氧气',
      '稳定大陆地壳形成',
      '原始海洋中出现生命'
    ],
    climate: '大气以二氧化碳、甲烷为主，温室效应强，温度适宜生命出现',
    life: {
      title: '原核生命出现',
      stages: ['约38亿年前，最早生命出现（古细菌）', '约35亿年前，蓝藻出现，开始光合作用', '约27亿年前，大氧化事件开始', '生命主要在海洋中，无脊椎动物出现']
    },
    geological: ['全球性花岗岩基底形成', '绿岩带发育', '第一次大氧化事件', '太古代末期可能出现大陆冰川']
  },
  {
    id: 'proterozoic',
    name: '元古宙',
    start: '25亿年前',
    end: '5.41亿年前',
    duration: '约19.6亿年',
    color: 'from-blue-600 to-blue-800',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    mainEvents: [
      '真核生物出现',
      '多细胞动物出现',
      '大氧化事件完成',
      '成冰纪出现雪球地球',
      '埃迪卡拉纪生命大爆发'
    ],
    climate: '经历多次冰期，成冰纪（约7亿年前）为雪球地球时期，后期气候温暖',
    life: {
      title: '真核与多细胞生物',
      stages: ['约21亿年前，真核生物出现（有细胞核）', '约15亿年前，多细胞生物出现', '约10亿年前，有性繁殖出现', '约6亿年前，埃迪卡拉纪软体动物大爆发']
    },
    geological: ['超大陆Rodinia形成与分裂', '大氧化事件完成', '雪球地球事件', '氧气水平接近现代']
  },
  {
    id: 'paleozoic',
    name: '古生代',
    start: '5.41亿年前',
    end: '2.52亿年前',
    duration: '约2.89亿年',
    color: 'from-emerald-600 to-emerald-800',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    mainEvents: [
      '寒武纪生命大爆发',
      '奥陶纪大灭绝（第一次）',
      '志留纪陆地植物出现',
      '泥盆纪鱼类繁盛',
      '二叠纪末大灭绝（最大）'
    ],
    climate: '石炭-二叠纪为冰期，泥盆纪温暖，奥陶纪末期冰期导致大灭绝',
    life: {
      title: '海洋生物大发展',
      stages: [
        '寒武纪（5.41-4.85亿）：三叶虫繁盛，硬壳动物出现',
        '奥陶纪（4.85-4.44亿）：珊瑚礁发育，笔石繁盛，末期大灭绝',
        '志留纪（4.44-4.19亿）：鱼类出现，陆地植物出现',
        '泥盆纪（4.19-3.59亿）：鱼类时代，两栖动物出现，森林出现',
        '石炭纪（3.59-2.99亿）：巨虫时代，裸子植物繁盛',
        '二叠纪（2.99-2.52亿）：裸子植物繁盛，末期大灭绝（96%物种消失）'
      ]
    },
    geological: ['泛大陆Pangaea雏形形成', '联合古陆出现', '海西运动形成山脉', '二叠纪末超级大火山喷发']
  },
  {
    id: 'mesozoic',
    name: '中生代',
    start: '2.52亿年前',
    end: '6600万年前',
    duration: '约1.86亿年',
    color: 'from-amber-600 to-amber-800',
    bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
    mainEvents: [
      '三叠纪生命复苏',
      '侏罗纪恐龙繁盛',
      '白垩纪被子植物出现',
      '恐龙统治地球',
      '小行星撞击恐龙灭绝'
    ],
    climate: '整体温暖湿润，两极无冰盖，中期海平面高，恐龙在全大陆分布',
    life: {
      title: '恐龙时代',
      stages: [
        '三叠纪（2.52-2.01亿）：恐龙出现，初期哺乳动物出现，末期大灭绝',
        '侏罗纪（2.01-1.45亿）：恐龙繁盛，翼龙飞行，鸟类出现，裸子植物繁盛',
        '白垩纪（1.45-0.66亿）：恐龙巅峰，被子植物出现，末期小行星撞击恐龙灭绝'
      ]
    },
    geological: ['泛大陆开始分裂', '大西洋形成', '喜马拉雅山脉雏形', '白垩纪末期小行星撞击']
  },
  {
    id: 'cenozoic',
    name: '新生代',
    start: '6600万年前',
    end: '至今',
    duration: '6600万年',
    color: 'from-red-600 to-red-800',
    bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
    mainEvents: [
      '哺乳动物大发展',
      '被子植物繁盛',
      '人类出现',
      '第四纪冰期',
      '人类文明发展'
    ],
    climate: '古新世-始新世高温期，后渐冷，第四纪多次冰期，现处于间冰期',
    life: {
      title: '哺乳动物与人类',
      stages: [
        '古新世-始新世（6600-3400万）：哺乳动物辐射发展，鸟类繁盛',
        '渐新世-中新世（3400-530万）：草原扩展，马、象等现代哺乳动物出现',
        '上新世-更新世（530-1.1万）：人类祖先出现，第四纪冰期，猛犸象等大型哺乳动物',
        '全新世（1.1万至今）：人类文明发展，农业革命，工业革命'
      ]
    },
    geological: ['印度板块撞上亚欧板块，喜马拉雅山隆起', '青藏高原形成', '现代大陆格局形成', '第四纪冰川作用']
  }
];

const MASS_EXTINCTIONS = [
  { name: '奥陶纪末期大灭绝', time: '4.44亿年前', cause: '全球冰期导致海平面下降', effect: '约85%物种消失，腕足动物、三叶虫受重创' },
  { name: '泥盆纪末期大灭绝', time: '3.59亿年前', cause: '海洋缺氧事件', effect: '约75%物种消失，珊瑚礁消失' },
  { name: '二叠纪末期大灭绝', time: '2.52亿年前', cause: '西伯利亚超级火山', effect: '约96%物种消失，历史上最严重灭绝' },
  { name: '三叠纪末期大灭绝', time: '2.01亿年前', cause: '中大西洋岩浆省', effect: '约80%物种消失，恐龙得以繁盛' },
  { name: '白垩纪末期大灭绝', time: '6600万年前', cause: '小行星撞击墨西哥尤卡坦', effect: '约75%物种消失，恐龙（非鸟）灭绝' }
];

export default function GeologyTimelinePage() {
  const [selectedEra, setSelectedEra] = useState<Era>(ERAS[5]);
  const [showExtinctions, setShowExtinctions] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-purple-50/40">
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/visualize">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />返回
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-bold text-slate-800">地球演化历程</h1>
          </div>
          <Badge className="bg-purple-100 text-purple-700">第一章</Badge>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-800">地质年代时间轴</h3>
                <p className="text-sm text-purple-700 mt-1">
                  地球约46亿年历史分为四个宙：冥古宙、太古宙、元古宙、显生宙。
                  显生宙又分为古生代、中生代、新生代。点击下方时期查看详细知识点。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 地质年代层级 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">地质年代层级</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 rounded-lg p-3 space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 w-16">宙</span>
                <span className="text-slate-600">冥古宙 → 太古宙 → 元古宙 → 显生宙</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 w-16">代</span>
                <span className="text-slate-600">（显生宙）古生代 → 中生代 → 新生代</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 w-16">纪</span>
                <span className="text-slate-600">寒武纪、奥陶纪、志留纪...（共12纪）</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 时期选择 */}
        <div className="flex flex-wrap gap-2">
          {ERAS.map((era, i) => (
            <Button
              key={era.id}
              variant={selectedEra.id === era.id ? 'default' : 'outline'}
              onClick={() => setSelectedEra(era)}
              className={`
                relative px-4 py-2
                ${selectedEra.id === era.id ? 'bg-gradient-to-br ' + era.color + ' text-white border-0' : ''}
              `}
            >
              <span className="text-sm font-medium">{era.name}</span>
              <span className="block text-xs opacity-70">{era.start.split('亿')[0]}亿</span>
              {selectedEra.id === era.id && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-slate-800 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* 选中时期详情 */}
        <Card className={`${selectedEra.bgColor} border-2`}>
          <CardContent className="p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${selectedEra.color} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                {selectedEra.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-slate-800">{selectedEra.name}</h3>
                  <Badge variant="outline">{selectedEra.duration}</Badge>
                </div>
                <p className="text-slate-600 mt-1">
                  {selectedEra.start} → {selectedEra.end}
                </p>
              </div>
            </div>

            {/* 气候 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-1">🌡️ 气候特征</h4>
              <p className="text-sm text-slate-600 bg-white/60 rounded-lg p-3">{selectedEra.climate}</p>
            </div>

            {/* 地质事件 */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-1">🏔️ 主要地质事件</h4>
              <div className="flex flex-wrap gap-1">
                {selectedEra.geological.map((g, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-white/60">{g}</Badge>
                ))}
              </div>
            </div>

            {/* 生命演化 */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                {selectedEra.life.title}
              </h4>
              <div className="space-y-2">
                {selectedEra.life.stages.map((stage, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-white/60 rounded-lg">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-600">{stage}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 生物图标 */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">生物演化总览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Fish className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">海洋无脊椎动物时代</div>
                  <div className="text-xs text-slate-500">寒武纪生命大爆发（约5.4亿年前）</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bug className="h-8 w-8 text-green-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">鱼类与两栖动物时代</div>
                  <div className="text-xs text-slate-500">泥盆纪（约4亿年前）</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TreePine className="h-8 w-8 text-emerald-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">裸子植物与爬行动物时代</div>
                  <div className="text-xs text-slate-500">石炭纪-侏罗纪（约3.5-1.4亿年前）</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bird className="h-8 w-8 text-amber-500" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">恐龙时代</div>
                  <div className="text-xs text-slate-500">侏罗纪-白垩纪（约2-0.66亿年前）</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🧬</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">哺乳动物与被子植物时代</div>
                  <div className="text-xs text-slate-500">白垩纪至今（约0.66亿年前至今）</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 生物大灭绝 */}
        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                五次生物大灭绝
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowExtinctions(!showExtinctions)}>
                {showExtinctions ? '收起' : '展开'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showExtinctions && (
            <CardContent>
              <div className="space-y-3">
                {MASS_EXTINCTIONS.map((ext, i) => (
                  <div key={i} className="p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-red-100 text-red-700 text-xs">第{i + 1}次</Badge>
                      <span className="font-semibold text-slate-800">{ext.name}</span>
                      <span className="text-xs text-slate-500 ml-auto">{ext.time}</span>
                    </div>
                    <p className="text-sm text-slate-600"><strong>原因：</strong>{ext.cause}</p>
                    <p className="text-sm text-slate-600"><strong>影响：</strong>{ext.effect}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-red-100 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>启示：</strong>地球历史上已发生5次大灭绝，每次都导致大部分物种消失，但生命总会找到出路。
                  第六次大灭绝正在发生——人类活动是主要驱动力。
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 高考考点 */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">📚 高考考点</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 地质年代顺序：能按顺序说出宙→代→纪（冥古宙→太古宙→元古宙→显生宙）</li>
              <li>• 各时代特征：太古宙出现蓝藻、元古宙真核生物、古生代寒武纪生命大爆发</li>
              <li>• 中生代：恐龙繁盛，被子植物出现，小行星撞击导致恐龙灭绝</li>
              <li>• 新生代：哺乳动物大发展，人类出现，喜马拉雅山隆起</li>
              <li>• 生物大灭绝：五次大灭绝的原因和影响，二叠纪末最严重</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
