'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Globe2, BookOpen, Brain, Map, GitCompare,
  CreditCard, GitBranch, FileQuestion, Sparkles,
  ChevronRight, Lightbulb
} from 'lucide-react';
import { GEOGRAPHY_CHAPTERS, GEOGRAPHY_CARDS, LOCATION_ANALYSIS_CASES } from '@/lib/geographyData';
import {
  loadProgress,
  computeOverallProgress
} from '@/lib/geographyProgress';

export default function GeographyHomePage() {
  const router = useRouter();
  const [selectedChapter, setSelectedChapter] = useState(GEOGRAPHY_CHAPTERS[0]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    GEOGRAPHY_CHAPTERS.forEach((ch) => {
      const p = loadProgress('geography', ch.id);
      if (p) {
        map[ch.id] = computeOverallProgress(p.steps);
      }
    });
    setProgressMap(map);
  }, []);

  const features = [
    {
      key: 'textbook',
      icon: BookOpen,
      name: '课本还原',
      desc: '基于教材原文深度讲解',
      href: `/learn/geography/textbook/${selectedChapter.id}`,
      color: 'amber',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      iconColor: 'text-amber-500',
      borderColor: 'hover:border-amber-300 dark:hover:border-amber-700',
      badge: '基础巩固',
    },
    {
      key: 'knowledge',
      icon: Brain,
      name: '知识点学习',
      desc: '核心概念与原理梳理',
      href: `/learn/geography/knowledge/${selectedChapter.id}`,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-500',
      borderColor: 'hover:border-blue-300 dark:hover:border-blue-700',
      badge: '核心概念',
    },
    {
      key: 'map',
      icon: Map,
      name: '交互地图',
      desc: '可视化定位与空间分析',
      href: '/learn/geography/map',
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-500',
      borderColor: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      badge: '空间思维',
    },
    {
      key: 'compare',
      icon: GitCompare,
      name: '区域对比',
      desc: '区域特征比较分析',
      href: '/learn/geography/compare',
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-500',
      borderColor: 'hover:border-purple-300 dark:hover:border-purple-700',
      badge: '综合比较',
    },
    {
      key: 'cards',
      icon: CreditCard,
      name: '地理卡牌',
      desc: '间隔记忆高频考点',
      href: '/learn/geography/cards',
      color: 'indigo',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      iconColor: 'text-indigo-500',
      borderColor: 'hover:border-indigo-300 dark:hover:border-indigo-700',
      badge: '记忆强化',
    },
    {
      key: 'location',
      icon: GitBranch,
      name: '区位分析',
      desc: '多因素综合分析',
      href: '/learn/geography/location',
      color: 'teal',
      bgColor: 'bg-teal-50 dark:bg-teal-950/30',
      iconColor: 'text-teal-500',
      borderColor: 'hover:border-teal-300 dark:hover:border-teal-700',
      badge: '综合应用',
    },
    {
      key: 'practice',
      icon: FileQuestion,
      name: '综合题训练',
      desc: '高考实战应用',
      href: '/learn/geography/practice',
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-500',
      borderColor: 'hover:border-orange-300 dark:hover:border-orange-700',
      badge: '高考实战',
    },
  ];

  const totalProgress = Object.values(progressMap).length > 0
    ? Math.round(Object.values(progressMap).reduce((a, b) => a + b, 0) / Object.values(progressMap).length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/30">
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  高中地理
                </h1>
                <p className="text-xs text-slate-500">
                  人教版（2019版）· 辽宁卷 · 七步学习闭环
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {totalProgress > 0 && (
                <Badge variant="outline" className="bg-emerald-50">
                  总进度：{totalProgress}%
                </Badge>
              )}
              <Badge variant="outline" className="bg-white dark:bg-slate-800">
                {GEOGRAPHY_CHAPTERS.length} 册教材
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-gradient-to-r from-emerald-100/50 to-teal-100/50 dark:from-emerald-950/20 dark:to-teal-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    选择学习章节
                  </span>
                  <Badge variant="outline" className="text-xs ml-auto bg-white/50 dark:bg-slate-800/50">
                    当前选择
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GEOGRAPHY_CHAPTERS.map((ch) => {
                    const progress = progressMap[ch.id] || 0;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setSelectedChapter(ch)}
                        className={`group flex items-start gap-2 p-3 rounded-lg border text-left transition-all ${
                          selectedChapter.id === ch.id
                            ? 'border-emerald-400 bg-white dark:bg-slate-800 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          ch.category === 'natural' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300' :
                          ch.category === 'human' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                          ch.category === 'regional' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {ch.id.includes('compulsory') ? '必' : '选'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                            {ch.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {ch.categoryName}
                          </p>
                          {progress > 0 && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Progress value={progress} className="h-1 flex-1" />
                              <span className="text-xs text-emerald-500 font-medium">{progress}%</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-gradient-to-br from-teal-100/50 to-cyan-100/50 dark:from-teal-950/20 dark:to-cyan-950/20 h-full">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      核心能力
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white/50 dark:bg-slate-800/50">
                    高考地理
                  </Badge>
                </div>
                <div className="flex-1 space-y-2">
                  {[
                    { title: '区域认知', desc: '区域特征、差异与联系' },
                    { title: '综合思维', desc: '自然与人文要素综合分析' },
                    { title: '地理实践力', desc: '地图、实验与调查应用' },
                    { title: '人地协调观', desc: '资源、环境与可持续发展' },
                  ].map((item) => (
                    <div key={item.title} className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full mt-3 gap-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => router.push('/learn/geography')}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  进入地理学习中心
                  <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 七大学习模块入口 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-white dark:bg-slate-800/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                学习模块
              </h2>
              <Badge variant="outline" className="ml-auto text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                {selectedChapter.title}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                const featureProgress = progressMap[`${selectedChapter.id}_${feature.key}`] || 0;
                const chapterProgress = progressMap[selectedChapter.id] || 0;
                const showProgress = featureProgress > 0 || chapterProgress > 0;
                return (
                  <button
                    key={feature.key}
                    onClick={() => router.push(feature.href)}
                    className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 bg-white dark:bg-slate-800 ${feature.borderColor} hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer text-center`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {feature.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {feature.desc}
                      </p>
                    </div>
                    <Badge className={`absolute top-2 right-2 text-xs ${feature.bgColor} ${feature.iconColor.replace('text-', 'text-')}`}>
                      {feature.badge}
                    </Badge>
                    {showProgress && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <Progress value={featureProgress || chapterProgress || 0} className="h-1" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 可视化学习入口 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xl">
                  🔬
                </div>
                <div>
                  <h3 className="font-bold text-sm">可视化学习</h3>
                  <p className="text-xs text-muted-foreground">通过互动图形和类比理解抽象概念</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => router.push('/learn/geography/visualize/solar-system')}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  天体系统
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => router.push('/learn/geography/visualize/spheres')}
                >
                  圈层结构
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 推荐学习路径 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                推荐学习路径
              </h2>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.key} className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => router.push(feature.href)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full ${feature.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${feature.iconColor}`} />
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {index + 1}. {feature.name}
                      </span>
                    </button>
                    {index < features.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-slate-300 mx-1 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              建议按顺序完成：课本还原 → 知识点学习 → 交互地图 → 区域对比 → 地理卡牌 → 区位分析 → 综合题训练
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
