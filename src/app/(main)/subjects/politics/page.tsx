'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain, BookMarked, FileQuestion, PenTool,
  ArrowRight, Sparkles, Star, BookOpen, ChevronRight
} from 'lucide-react';
import { POLITICS_CHAPTERS } from '@/lib/politicsData';
import {
  loadProgress,
  computeOverallProgress,
  type PoliticsProgress
} from '@/lib/politicsProgress';

export default function PoliticsHomePage() {
  const router = useRouter();
  const [selectedChapter, setSelectedChapter] = useState(POLITICS_CHAPTERS[0]);
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

  const totalProgress = Object.values(progressMap).length > 0
    ? Math.round(Object.values(progressMap).reduce((a, b) => a + b, 0) / Object.values(progressMap).length)
    : 0;

  const features = [
    {
      id: 'knowledge',
      icon: Sparkles,
      name: '知识点学习',
      desc: '必背内容 · 引导式学习 · 问答练习',
      color: 'pink',
      bgColor: 'bg-pink-50 dark:bg-pink-950/30',
      borderColor: 'hover:border-pink-300 dark:hover:border-pink-700',
      iconColor: 'text-pink-500',
      href: `/learn/politics/knowledge/${selectedChapter.id}`,
      badge: '核心入口',
      badgeBg: 'bg-pink-100 text-pink-700',
    },
    {
      id: 'textbook',
      icon: BookMarked,
      name: '课本还原',
      desc: '上传PDF教材 · 逐段讲解 · 引导思考',
      color: 'amber',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'hover:border-amber-300 dark:hover:border-amber-700',
      iconColor: 'text-amber-500',
      href: '/learn/politics/textbook',
      badge: '教材学习',
      badgeBg: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'essay',
      icon: PenTool,
      name: '论述训练',
      desc: '高考风格论述题 · AI 评分 · 辽宁关联',
      color: 'rose',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      borderColor: 'hover:border-rose-300 dark:hover:border-rose-700',
      iconColor: 'text-rose-500',
      href: `/learn/politics/essay/${selectedChapter.id}`,
      badge: '能力提升',
      badgeBg: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'practice',
      icon: FileQuestion,
      name: '章节练习',
      desc: '一次5题 · 选错有讲解 · 巩固记忆',
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'hover:border-yellow-300 dark:hover:border-yellow-700',
      iconColor: 'text-yellow-500',
      href: `/learn/politics/practice/${selectedChapter.id}`,
      badge: '即时巩固',
      badgeBg: 'bg-yellow-100 text-yellow-700',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30">
      {/* 顶部状态栏 */}
      <header className="sticky top-16 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📜</span>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  思想政治
                </h1>
                <p className="text-xs text-slate-500">
                  必背内容 · 引导式学习 · AI问答 · 论述训练
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
                {selectedChapter.title.split(' ')[0]}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* 教材选择 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-gradient-to-r from-pink-100/50 to-purple-100/50 dark:from-pink-950/20 dark:to-purple-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                选择学习章节
              </span>
              <Badge variant="outline" className="text-xs ml-auto bg-white/50 dark:bg-slate-800/50">
                当前选择
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate leading-tight">
                        {ch.title.replace('必修', '').replace('选择性必修', '')}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {ch.moduleName} · {ch.topics.length}个主题
                      </p>
                      {progress > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
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

        {/* 四大功能入口 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => router.push(feature.href)}
                className={`group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 bg-white dark:bg-slate-800 ${feature.borderColor} hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer text-center`}
              >
                {/* 顶部角标 */}
                <div className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium ${feature.badgeBg}`}>
                  {feature.badge}
                </div>

                {/* 图标 */}
                <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                </div>

                {/* 文字 */}
                <div>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
                    {feature.name}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                {/* 箭头 */}
                <div className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-pink-500 transition-colors">
                  <span>进入学习</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* 核心主题预览 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-pink-500" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  {selectedChapter.title} · 核心主题
                </h2>
              </div>
              <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800">
                {selectedChapter.moduleName}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
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
            <div className="flex gap-2">
              <Button
                className="gap-1.5 bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => router.push(`/learn/politics/knowledge/${selectedChapter.id}`)}
              >
                <Sparkles className="h-3.5 w-3.5" />
                引导式学习
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => router.push(`/learn/politics/essay/${selectedChapter.id}`)}
              >
                <PenTool className="h-3.5 w-3.5" />
                论述训练
              </Button>
              <Button
                variant="outline"
                className="gap-1.5"
                onClick={() => router.push(`/learn/politics/practice/${selectedChapter.id}`)}
              >
                <FileQuestion className="h-3.5 w-3.5" />
                章节练习
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 学习路径 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-500" />
              推荐学习路径
            </h2>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {[
                { name: '课本还原', desc: '读懂原文', icon: BookMarked },
                { name: '引导学习', desc: '必背+思考', icon: Brain },
                { name: '章节练习', desc: '5题巩固', icon: FileQuestion },
                { name: '论述训练', desc: '高考冲刺', icon: PenTool },
              ].map((step, index) => (
                <div key={step.name} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 min-w-[100px]">
                    <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                      <step.icon className="h-4 w-4 text-pink-500" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{step.name}</span>
                    <span className="text-xs text-slate-400">{step.desc}</span>
                  </div>
                  {index < 3 && (
                    <ChevronRight className="h-4 w-4 text-slate-300 mx-1 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              从课本还原开始读懂原文，然后通过引导式学习掌握必背内容，最后通过练习和论述巩固提高
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
