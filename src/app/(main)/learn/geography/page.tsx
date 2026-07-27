'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Brain, Map, GitCompare, CreditCard, GitBranch,
  FileText, Loader2, Sparkles, ChevronRight, CheckCircle,
  BookMarked, Target, BarChart3
} from 'lucide-react';
import { getAvailableChapters, getChapterById, type Chapter } from '@/lib/geographyDataService';
import { updateStepProgress } from '@/lib/geographyProgress';

// 学习路径步骤
const LEARNING_PATH_STEPS = [
  { key: 'knowledge', label: '章节知识点', description: '核心概念精讲', href: '/learn/geography/knowledge', icon: <BookOpen className="h-5 w-5" /> },
  { key: 'framework', label: '框架考点', description: '满分知识体系', href: '/learn/geography/framework', icon: <Target className="h-5 w-5" /> },
  { key: 'map', label: '交互地图', description: '可视化定位', href: '/learn/geography/map', icon: <Map className="h-5 w-5" /> },
  { key: 'cards', label: '地理卡牌', description: '巩固记忆', href: '/learn/geography/cards', icon: <CreditCard className="h-5 w-5" /> },
  { key: 'compare', label: '区域对比', description: '区域特征比较', href: '/learn/geography/compare', icon: <GitCompare className="h-5 w-5" /> },
  { key: 'practice', label: '综合练习', description: 'AI生成题目', href: '/learn/geography/practice', icon: <Sparkles className="h-5 w-5" /> },
];

function GeographyHubContent() {
  const router = useRouter();
  const availableChapters = getAvailableChapters();
  
  const [selectedChapter, setSelectedChapter] = useState<string>('ch1');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const currentChapter = getChapterById(selectedChapter);

  const handleStartLearn = (step: typeof LEARNING_PATH_STEPS[0], chapterId: string) => {
    const href = step.href === '/learn/geography/knowledge' 
      ? `${step.href}/${chapterId}` 
      : `${step.href}`;
    updateStepProgress('geography', chapterId, step.key as any, 'in_progress');
    router.push(href);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/20">
      <div className="w-full px-4 py-6 space-y-5 max-w-7xl mx-auto">
        
        {/* 顶部标题区 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xl shadow-lg">
              🌍
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">地理学习中心</h1>
              <p className="text-sm text-muted-foreground">人教版（2019版）· 辽宁高考专版</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-emerald-50 border-emerald-200 text-emerald-700">
            已上线 {availableChapters.length} 章
          </Badge>
        </div>

        {/* 章节选择器 */}
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-teal-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-emerald-600" />
              选择学习章节
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableChapters.map((chapter) => (
                <Button
                  key={chapter.id}
                  variant={selectedChapter === chapter.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChapter(chapter.id)}
                  className={`gap-2 ${
                    selectedChapter === chapter.id 
                      ? 'bg-emerald-600 hover:bg-emerald-700' 
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {chapter.id === 'ch1' && '🌌'}
                  {chapter.id === 'ch2' && '🌫️'}
                  {chapter.name}
                </Button>
              ))}
              {/* 占位符 - 后续章节 */}
              <Button variant="outline" size="sm" disabled className="opacity-50">
                第三章（待补充）...
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 主内容区 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="overview" className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> 概述
            </TabsTrigger>
            <TabsTrigger value="path" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> 学习路径
            </TabsTrigger>
            <TabsTrigger value="chapters" className="gap-1.5">
              <BookMarked className="h-3.5 w-3.5" /> 章节内容
            </TabsTrigger>
            <TabsTrigger value="quick" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> 快捷入口
            </TabsTrigger>
          </TabsList>

          {/* 概述标签页 */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">📚</span>
                  {currentChapter?.name || '选择章节'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentChapter?.description}
                </p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-emerald-50">
                    <div className="text-2xl font-bold text-emerald-600">
                      {currentChapter?.topicCount || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">核心专题</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">24+</div>
                    <div className="text-xs text-muted-foreground">高频考点</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-amber-50">
                    <div className="text-2xl font-bold text-amber-600">5年</div>
                    <div className="text-xs text-muted-foreground">真题覆盖</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700">学习目标</h4>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      掌握核心概念和原理
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      理解知识点间的逻辑关系
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      能够应用知识解决实际问题
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 学习路径标签页 */}
          <TabsContent value="path">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">六步学习闭环</CardTitle>
                <p className="text-sm text-muted-foreground">循序渐进，从学到练，形成完整知识体系</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {LEARNING_PATH_STEPS.map((step, idx) => (
                    <div
                      key={step.key}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        idx === 0 
                          ? 'border-emerald-300 bg-emerald-50/60' 
                          : 'border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        idx === 0 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">第{idx + 1}步</span>
                          <h4 className="font-semibold text-slate-800">{step.label}</h4>
                          {idx === 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">开始</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={idx === 0 ? 'default' : 'outline'}
                        onClick={() => handleStartLearn(step, selectedChapter)}
                        className={idx === 0 ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      >
                        {idx === 0 ? '开始学习' : '查看'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 章节内容标签页 */}
          <TabsContent value="chapters">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">章节知识点</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedChapter === 'ch1' && (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      {[
                        { name: '第一节 地球的宇宙环境', points: ['天体系统层次', '太阳系八大行星', '地球的普通性与特殊性'], icon: '🌌' },
                        { name: '第二节 太阳对地球的影响', points: ['太阳辐射', '太阳活动', '太阳活动对地球的影响'], icon: '☀️' },
                        { name: '第三节 地球的历史', points: ['地质年代', '地球的演化历程', '生物演化'], icon: '⏳' },
                        { name: '第四节 地球的圈层结构', points: ['内部圈层', '外部圈层', '岩石圈'], icon: '🌍' },
                      ].map((section, idx) => (
                        <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
                          onClick={() => router.push(`/learn/geography/knowledge/${selectedChapter}#${idx}`)}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{section.icon}</span>
                            <h4 className="font-semibold text-slate-800">{section.name}</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {section.points.map((p, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedChapter === 'ch2' && (
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      {[
                        { name: '第一节 大气的组成和垂直分层', points: ['大气组成', '垂直分层', '逆温现象'], icon: '🌫️' },
                        { name: '第二节 大气受热过程和大气热力环流', points: ['大气受热过程', '热力环流', '大气的水平运动'], icon: '💨' },
                      ].map((section, idx) => (
                        <div key={idx} className="p-4 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer"
                          onClick={() => router.push(`/learn/geography/knowledge/${selectedChapter}#${idx}`)}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{section.icon}</span>
                            <h4 className="font-semibold text-slate-800">{section.name}</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {section.points.map((p, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{p}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 快捷入口标签页 */}
          <TabsContent value="quick">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 border-emerald-200 hover:bg-emerald-50"
                onClick={() => router.push(`/learn/geography/practice/${selectedChapter}`)}
              >
                <Sparkles className="h-8 w-8 text-emerald-600" />
                <div className="text-center">
                  <div className="font-semibold text-slate-800">AI 生成练习</div>
                  <div className="text-xs text-muted-foreground">基于本章内容</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 border-blue-200 hover:bg-blue-50"
                onClick={() => router.push('/learn/geography/cards')}
              >
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div className="text-center">
                  <div className="font-semibold text-slate-800">记忆卡牌</div>
                  <div className="text-xs text-muted-foreground">巩固核心概念</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 border-amber-200 hover:bg-amber-50"
                onClick={() => router.push('/learn/geography/framework')}
              >
                <Target className="h-8 w-8 text-amber-600" />
                <div className="text-center">
                  <div className="font-semibold text-slate-800">满分框架</div>
                  <div className="text-xs text-muted-foreground">知识体系图谱</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 border-purple-200 hover:bg-purple-50"
                onClick={() => router.push('/learn/geography/map')}
              >
                <Map className="h-8 w-8 text-purple-600" />
                <div className="text-center">
                  <div className="font-semibold text-slate-800">交互地图</div>
                  <div className="text-xs text-muted-foreground">区域定位练习</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 border-rose-200 hover:bg-rose-50"
                onClick={() => router.push('/wrong-questions')}
              >
                <GitBranch className="h-8 w-8 text-rose-600" />
                <div className="text-center">
                  <div className="font-semibold text-slate-800">错题本</div>
                  <div className="text-xs text-muted-foreground">查漏补缺</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto py-6 flex flex-col gap-3 border-cyan-200 hover:bg-cyan-50"
                onClick={() => router.push('/learn/geography/compare')}
              >
                <GitCompare className="h-8 w-8 text-cyan-600" />
                <div className="text-center">
                  <div className="font-semibold text-slate-800">区域对比</div>
                  <div className="text-xs text-muted-foreground">特征比较分析</div>
                </div>
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* 底部提示 */}
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <strong className="text-slate-700">学习建议：</strong>
                建议按顺序完成六步学习：先看章节知识点打牢基础，再通过满分框架梳理知识体系，
                然后用记忆卡牌巩固核心概念，最后通过AI生成的练习题检验学习效果。
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function GeographyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <GeographyHubContent />
    </Suspense>
  );
}
