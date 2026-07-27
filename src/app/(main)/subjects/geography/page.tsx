'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe2, Brain, MapPin, FileQuestion, Sparkles, ArrowRight, Trophy, ChevronRight,
  BookOpen, Target, CreditCard, GitCompare
} from 'lucide-react';

// 高分知识框架入口
const HIGHSCORE_FRAMEWORK = {
  id: 'framework',
  icon: Trophy,
  name: '🏆 高分知识框架',
  desc: '2026辽宁高考满分知识体系',
  href: '/learn/geography/framework',
  color: 'amber',
  badge: '核心'
};

// 学习路径定义
const LEARNING_PATH_STEPS = [
  { step: 1, id: 'knowledge', name: '章节知识点', desc: '核心概念精讲', icon: BookOpen, href: '/learn/geography/knowledge/ch1' },
  { step: 2, id: 'framework', name: '满分框架', desc: '知识体系图谱', icon: Target, href: '/learn/geography/framework' },
  { step: 3, id: 'cards', name: '记忆卡牌', desc: '巩固核心概念', icon: CreditCard, href: '/learn/geography/cards' },
  { step: 4, id: 'practice', name: 'AI练习', desc: '检验学习效果', icon: Sparkles, href: '/learn/geography/practice' },
];

// 辅助工具
const TOOLS = [
  { id: 'map', icon: MapPin, name: '交互地图', desc: '可视化空间定位', href: '/learn/geography/map', color: 'violet' },
  { id: 'compare', icon: GitCompare, name: '区域对比', desc: '特征比较分析', href: '/learn/geography/compare', color: 'cyan' },
];

export default function GeographyHomePage() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/30">
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* 标题区 */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
            <Globe2 className="h-7 w-7 text-emerald-500" />
            地理学习
          </h1>
          <p className="text-sm text-slate-500">按步骤学习，循序渐进</p>
        </div>

        {/* 🌟 主入口：进入学习中心 */}
        <Link href="/learn/geography">
          <Card className="rounded-xl shadow-lg border-2 border-emerald-300 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Globe2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">进入地理学习中心</h2>
                    <p className="text-emerald-100 text-sm mt-1">系统化学习路径 · 从知识点到满分框架</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-sm">开始学习</span>
                  <ChevronRight className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 四步学习路径 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-white dark:bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                四步学习闭环
              </h2>
              <Badge className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                建议按顺序完成
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {LEARNING_PATH_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.id}
                    onClick={() => router.push(step.href)}
                    className="relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{step.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                    </div>
                    <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                      {step.step}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 辅助工具 */}
        <div className="grid grid-cols-2 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => router.push(tool.href)}
                className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-cyan-300 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-cyan-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{tool.name}</p>
                  <p className="text-xs text-slate-400">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 高分框架入口 */}
        <Link href={HIGHSCORE_FRAMEWORK.href}>
          <Card className="rounded-xl shadow-sm border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 hover:shadow-lg transition-all cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">{HIGHSCORE_FRAMEWORK.name}</h2>
                    <Badge className="bg-red-100 text-red-700 text-xs">{HIGHSCORE_FRAMEWORK.badge}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {HIGHSCORE_FRAMEWORK.desc} · 4大模块 · 20+专题
                  </p>
                </div>
                <ArrowRight className="h-6 w-6 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 核心能力卡片 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">地理核心能力</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: '区域认知', desc: '特征与差异' },
                { name: '综合思维', desc: '要素综合' },
                { name: '地理实践力', desc: '实践应用' },
                { name: '人地协调观', desc: '可持续发展' },
              ].map((item) => (
                <div key={item.name} className="bg-white/70 dark:bg-slate-800/70 rounded-lg p-2 text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
