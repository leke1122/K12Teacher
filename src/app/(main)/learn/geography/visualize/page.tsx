'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Globe2, Wind, Droplets, Mountain, Sun,
  Compass, Layers, Atom, Flame, CloudRain, TreePine,
  MapPin, ArrowRight, Sparkles
} from 'lucide-react';

const VISUALIZE_TOPICS = [
  {
    id: 'solar-system',
    icon: Sun,
    title: '天体系统层级图',
    desc: '可观测宇宙→银河系→太阳系→地月系，层级关系一目了然',
    color: 'amber',
    bgColor: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    href: '/learn/geography/visualize/solar-system',
    tags: ['宇宙', '天体', '第一章'],
    status: 'ready'
  },
  {
    id: 'spheres',
    icon: Layers,
    title: '地球圈层结构',
    desc: '内部圈层（地核/地幔/地壳）与外部圈层（大气的组成与垂直分层）',
    color: 'blue',
    bgColor: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    href: '/learn/geography/visualize/spheres',
    tags: ['地球', '圈层', '第一章'],
    status: 'ready'
  },
  {
    id: 'planets',
    icon: Globe2,
    title: '行星地球特征',
    desc: '普通而特殊的行星，存在生命的条件分析，八大行星分类',
    color: 'emerald',
    bgColor: 'from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200',
    href: '/learn/geography/visualize/planets',
    tags: ['地球', '生命', '第一章'],
    status: 'ready'
  },
  {
    id: 'sun-activities',
    icon: Flame,
    title: '太阳活动',
    desc: '太阳大气层结构、太阳活动类型及其对地球的影响',
    color: 'orange',
    bgColor: 'from-orange-50 to-red-50',
    borderColor: 'border-orange-200',
    href: '/learn/geography/visualize/sun-activities',
    tags: ['太阳', '活动', '第一章'],
    status: 'ready'
  },
  {
    id: 'atmosphere',
    icon: Wind,
    title: '大气受热过程',
    desc: '大气的垂直分层、热力作用、保温效应动态演示',
    color: 'sky',
    bgColor: 'from-sky-50 to-blue-50',
    borderColor: 'border-sky-200',
    href: '/learn/geography/visualize/atmosphere',
    tags: ['大气', '热力', '第二章'],
    status: 'ready'
  },
  {
    id: 'water-cycle',
    icon: Droplets,
    title: '水循环示意图',
    desc: '海陆间循环/海上内循环/陆地内循环，过程与意义',
    color: 'cyan',
    bgColor: 'from-cyan-50 to-blue-50',
    borderColor: 'border-cyan-200',
    href: '/learn/geography/visualize/water-cycle',
    tags: ['水', '循环', '第三章'],
    status: 'ready'
  },
  {
    id: 'landforms',
    icon: Mountain,
    title: '地貌类型图鉴',
    desc: '喀斯特/海岸/冰川/黄土地貌的形成与分布',
    color: 'stone',
    bgColor: 'from-stone-50 to-amber-50',
    borderColor: 'border-stone-200',
    href: '/learn/geography/visualize/landforms',
    tags: ['地貌', '地形', '第三章'],
    status: 'ready'
  },
  {
    id: 'timeline',
    icon: Compass,
    title: '地球演化历程',
    desc: '地质年代顺序、生物进化、五次大灭绝详尽解析',
    color: 'purple',
    bgColor: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200',
    href: '/learn/geography/visualize/timeline',
    tags: ['地质', '演化', '第一章'],
    status: 'ready'
  },
];

export default function VisualizeHubPage() {
  const router = useRouter();
  const readyTopics = VISUALIZE_TOPICS.filter(t => t.status === 'ready');
  const comingTopics = VISUALIZE_TOPICS.filter(t => t.status === 'coming');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/geography')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-cyan-500" />
              地理可视化中心
            </h1>
            <p className="text-sm text-muted-foreground">图文并茂，动态演示地理原理</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {readyTopics.length}个专题已上线
          </Badge>
        </div>

        {/* 已上线专题 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-slate-700">已上线专题</h2>
            <Badge className="bg-emerald-100 text-emerald-700">{readyTopics.length}个</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Card
                  key={topic.id}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${topic.bgColor} border ${topic.borderColor}`}
                  onClick={() => router.push(topic.href)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-${topic.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-7 w-7 text-${topic.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-800">{topic.title}</h3>
                          {topic.status === 'coming' && (
                            <Badge variant="outline" className="text-xs bg-white">即将上线</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{topic.desc}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {topic.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs bg-white/50">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <ArrowRight className={`h-5 w-5 text-${topic.color}-500`} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 即将上线 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold text-slate-700">即将上线</h2>
            <Badge variant="outline">{comingTopics.length}个专题</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {comingTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <Card
                  key={topic.id}
                  className={`opacity-60 bg-gradient-to-br ${topic.bgColor} border ${topic.borderColor}`}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-xl bg-${topic.color}-100 mx-auto mb-3 flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 text-${topic.color}-400`} />
                    </div>
                    <h3 className="font-medium text-sm text-slate-600">{topic.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{topic.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 学习提示 */}
        <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Atom className="h-6 w-6 text-cyan-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-cyan-800 mb-1">💡 学习建议</h3>
                <div className="text-sm text-cyan-700 space-y-1">
                  <p>1. 可视化内容帮助理解抽象的地理原理，建议先看知识点再来看图</p>
                  <p>2. 地球运动、大气环流等难点，配合动态演示学习效果更好</p>
                  <p>3. 看图时注意图中的标注和箭头，这些往往是解题的关键</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
