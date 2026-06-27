'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles, Loader2, BookOpen, Brain, Scale, Newspaper,
  Layers, PenTool, ChevronRight, Clock, BookText,
  Target, Lightbulb, ArrowRight, GraduationCap, AlertCircle
} from 'lucide-react';
import { POLITICS_CHAPTERS, CURRENT_AFFAIRS } from '@/lib/politicsData';
import {
  loadProgress,
  computeOverallProgress,
  getStepLabel,
  type PoliticsStepKey,
  type PoliticsProgress
} from '@/lib/politicsProgress';

export default function PoliticsHomePage() {
  const router = useRouter();
  const [selectedChapter, setSelectedChapter] = useState(POLITICS_CHAPTERS[0]);
  const [currentAffairIndex, setCurrentAffairIndex] = useState(0);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    POLITICS_CHAPTERS.forEach((ch) => {
      const p = loadProgress('politics', ch.id);
      if (p) {
        map[ch.id] = computeOverallProgress(p.steps);
      }
    });
    setProgressMap(map);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAffairIndex((prev) => (prev + 1) % CURRENT_AFFAIRS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      id: 'knowledge' as PoliticsStepKey,
      icon: Brain,
      name: '知识点学习',
      desc: '三步引导：问题→关系→应用',
      color: 'pink',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
      borderColor: 'hover:border-pink-300 dark:hover:border-pink-700',
      iconColor: 'text-pink-500',
      href: `/learn/politics/knowledge/${selectedChapter.id}`,
      badge: '核心概念',
    },
    {
      id: 'discrimination' as PoliticsStepKey,
      icon: Scale,
      name: '概念辨析',
      desc: '四步引导：判断→论证→辨析→完善',
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'hover:border-purple-300 dark:hover:border-purple-700',
      iconColor: 'text-purple-500',
      href: `/learn/politics/discrimination/${selectedChapter.id}`,
      badge: '易混概念',
    },
    {
      id: 'current-affairs' as PoliticsStepKey,
      icon: Newspaper,
      name: '时政链接',
      desc: '三步关联：事实→匹配→应用',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'hover:border-blue-300 dark:hover:border-blue-700',
      iconColor: 'text-blue-500',
      href: '/learn/politics/current-affairs',
      badge: '热点聚焦',
    },
    {
      id: 'textbook' as PoliticsStepKey,
      icon: BookText,
      name: '课本还原',
      desc: '基于教材原文，深度讲解',
      color: 'amber',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'hover:border-amber-300 dark:hover:border-amber-700',
      iconColor: 'text-amber-500',
      href: `/subjects/politics/chapters/${selectedChapter.id}`,
      badge: '基础巩固',
    },
    {
      id: 'synthesis' as PoliticsStepKey,
      icon: Layers,
      name: '综合应用',
      desc: '跨模块案例分析训练',
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      iconColor: 'text-emerald-500',
      href: `/learn/politics/synthesis/${selectedChapter.id}`,
      badge: '能力提升',
    },
    {
      id: 'essay' as PoliticsStepKey,
      icon: PenTool,
      name: '论述训练',
      desc: '高考风格论述题精练',
      color: 'rose',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      borderColor: 'hover:border-rose-300 dark:hover:border-rose-700',
      iconColor: 'text-rose-500',
      href: `/learn/politics/essay/${selectedChapter.id}`,
      badge: '冲刺高分',
    },
  ];

  const currentAffair = CURRENT_AFFAIRS[currentAffairIndex];
  const totalProgress = Object.values(progressMap).length > 0
    ? Math.round(Object.values(progressMap).reduce((a, b) => a + b, 0) / Object.values(progressMap).length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30">
      {/* 顶部状态栏 */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  思想政治
                </h1>
                <p className="text-xs text-slate-500">
                  引导式学习 · 6大能力模块
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {totalProgress > 0 && (
                <Badge variant="outline" className="bg-pink-50">
                  总进度：{totalProgress}%
                </Badge>
              )}
              <Badge variant="outline" className="bg-white dark:bg-slate-800">
                7册教材
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* 教材选择 + 时政轮播 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 教材选择卡片 */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-gradient-to-r from-pink-100/50 to-purple-100/50 dark:from-pink-950/20 dark:to-purple-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4 text-pink-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    选择学习章节
                  </span>
                  <Badge variant="outline" className="text-xs ml-auto bg-white/50 dark:bg-slate-800/50">
                    当前选择
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {POLITICS_CHAPTERS.map((ch) => {
                    const progress = progressMap[ch.id] || 0;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => setSelectedChapter(ch)}
                        className={`group flex items-start gap-2 p-3 rounded-lg border text-left transition-all ${
                          selectedChapter.id === ch.id
                            ? 'border-pink-400 bg-white dark:bg-slate-800 shadow-sm'
                            : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-pink-300 dark:hover:border-pink-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          ch.module === 'economics' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                          ch.module === 'politics' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
                          ch.module === 'philosophy' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' :
                          'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {ch.id.includes('compulsory') ? '必' : '选'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                            {ch.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {ch.moduleName} · {ch.topics.length}个主题
                          </p>
                          {progress > 0 && (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <Progress value={progress} className="h-1 flex-1" />
                              <span className="text-xs text-pink-500 font-medium">{progress}%</span>
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

          {/* 时政热点轮播 */}
          <div>
            <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-gradient-to-br from-blue-100/50 to-indigo-100/50 dark:from-blue-950/20 dark:to-indigo-950/20 h-full">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      时政热点
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs bg-white/50 dark:bg-slate-800/50">
                    {currentAffairIndex + 1}/{CURRENT_AFFAIRS.length}
                  </Badge>
                </div>
                <div className="flex-1">
                  <div className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-3 min-h-[120px]">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs">
                        {currentAffair.category}
                      </Badge>
                      <span className="text-xs text-slate-400">{currentAffair.date}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1.5">
                      {currentAffair.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-3">
                      {currentAffair.content}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {currentAffair.relatedKnowledge.slice(0, 3).map((k) => (
                        <span key={k} className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 justify-center mt-3">
                  {CURRENT_AFFAIRS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentAffairIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentAffairIndex ? 'bg-blue-500 w-4' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 gap-1.5 text-xs"
                  onClick={() => router.push('/learn/politics/current-affairs')}
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  进入时政学习
                  <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 6大能力模块入口 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-white dark:bg-slate-800/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-5">
              <Target className="h-5 w-5 text-pink-500" />
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                能力训练中心
              </h2>
              <Badge variant="outline" className="ml-auto text-xs bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400">
                {selectedChapter.title}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                const progress = progressMap[selectedChapter.id];
                const featureProgress = feature.id === 'current-affairs'
                  ? 0
                  : (progressMap[`${selectedChapter.id}_${feature.id}`] || 0);
                return (
                  <button
                    key={feature.id}
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
                    {(featureProgress > 0 || progress > 0) && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <Progress value={featureProgress || progress || 0} className="h-1" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 学习路径说明 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-pink-500" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                推荐学习路径
              </h2>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.id} className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => router.push(feature.href)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full ${feature.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 ${feature.iconColor}`} />
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {index + 1}. {feature.name.split(' ')[0]}
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
              从知识点学习开始，逐步深入到概念辨析、时政链接、综合应用和论述训练
            </p>
          </CardContent>
        </Card>

        {/* 章节知识点预览 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-pink-500" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {selectedChapter.title} · 核心主题
                </h2>
              </div>
              <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800">
                {selectedChapter.moduleName}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedChapter.topics.map((topic, index) => (
                <Badge
                  key={topic}
                  variant="outline"
                  className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-colors"
                  onClick={() => router.push(`/learn/politics/knowledge/${selectedChapter.id}?topic=${encodeURIComponent(topic)}`)}
                >
                  <span className="text-pink-400 mr-1.5">{index + 1}</span>
                  {topic}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="default"
                size="sm"
                className="gap-1.5 bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => router.push(`/learn/politics/knowledge/${selectedChapter.id}`)}
              >
                <Brain className="h-3.5 w-3.5" />
                开始学习
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => router.push(`/learn/politics/discrimination/${selectedChapter.id}`)}
              >
                <Scale className="h-3.5 w-3.5" />
                概念辨析
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => router.push(`/learn/politics/synthesis/${selectedChapter.id}`)}
              >
                <Layers className="h-3.5 w-3.5" />
                综合应用
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 辽宁本地关联提示 */}
        <Card className="rounded-xl shadow-sm border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  辽宁高考关联
                </h3>
                <p className="text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                  本章节内容与辽宁卷命题密切相关。答题时注意结合辽宁实际案例（如辽中南工业基地、东北全面振兴、新质生产力等），
                  体现地方特色。综合题常考辽宁产业转型、营商环境、生态文明建设等话题。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
