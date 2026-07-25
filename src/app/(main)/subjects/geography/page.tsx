'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Globe2, Brain, MapPin, FileQuestion, Sparkles, ArrowRight, Trophy
} from 'lucide-react';

// 学习步骤定义
const LEARNING_STEPS = [
  { id: 'knowledge', icon: Brain, name: '知识点', desc: '核心概念理解', color: 'blue', href: '/learn/geography/knowledge-full/chapter1' },
  { id: 'practice', icon: FileQuestion, name: '练习', desc: '巩固与应用', color: 'emerald', href: '/learn/geography/practice/chapter1' },
];

// 辅助工具
const TOOLS = [
  { id: 'map', icon: MapPin, name: '交互地图', desc: '可视化空间定位', color: 'violet', href: '/learn/geography/map' },
  { id: 'visualize', icon: Globe2, name: '可视化中心', desc: '天体/圈层/运动', color: 'cyan', href: '/learn/geography/visualize' },
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

        {/* 高分知识框架入口 */}
        <Card 
          className="rounded-xl shadow-sm border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => router.push('/learn/geography/framework')}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800">🏆 高分知识框架</h2>
                  <Badge className="bg-red-100 text-red-700 text-xs">核心</Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  2026辽宁高考满分知识体系 · 4大模块 · 20+专题 · 引导式闭环学习
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        {/* 学习路径 */}
        <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-white dark:bg-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                学习路径
              </h2>
              <Badge className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-xs">
                循序渐进
              </Badge>
            </div>
            
            {/* 横向流程 */}
            <div className="flex items-center justify-center gap-2">
              {LEARNING_STEPS.map((step, index) => {
                const Icon = step.icon;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => router.push(step.href)}
                      className="relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 transition-all"
                    >
                      <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Icon className="h-7 w-7 text-blue-500" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{step.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{step.desc}</p>
                      </div>
                      <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                    </button>
                    
                    {index < LEARNING_STEPS.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-slate-300 mx-2 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
            
            <p className="text-xs text-slate-400 text-center mt-6">
              建议按顺序完成：知识点 → 练习
            </p>
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
