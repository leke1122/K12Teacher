'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, ArrowRight, Lock,
  Clock, Layers, Link2, GitCompare, Brain, FileText, 
  MapPin, GitFork, Target, Zap, FileQuestion,
  BarChart3, Brain as BrainIcon, GraduationCap, BookMarked,
  CheckCircle, ArrowDown, Sparkles
} from 'lucide-react';
import { historyBooks } from '@/data/history/books';
import { releasedUnits } from '@/data/history/units';
import { Suspense } from 'react';

// 学习路径步骤配置
const LEARNING_PATH_STEPS = [
  { step: 1, icon: BookOpen, label: '课本还原', desc: 'AI还原教材原文', color: 'blue', key: 'textbook' },
  { step: 2, icon: Clock, label: '时间轴', desc: '梳理事件脉络', color: 'amber', key: 'timeline' },
  { step: 3, icon: Brain, label: '知识点精讲', desc: '核心考点详解', color: 'purple', key: 'knowledge' },
  { step: 4, icon: Layers, label: '历史卡牌', desc: '关键内容记忆', color: 'cyan', key: 'cards' },
  { step: 5, icon: Link2, label: '因果链', desc: '因果逻辑分析', color: 'rose', key: 'causal' },
  { step: 6, icon: GitCompare, label: '分类对比', desc: '横向纵向对比', color: 'green', key: 'category' },
  { step: 7, icon: FileQuestion, label: '综合练习', desc: '学习成果检验', color: 'indigo', key: 'practice' },
];

function HistorySubjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeBookId] = useState(() => {
    const bookParam = searchParams.get('book');
    return bookParam || 'outline-upper';
  });

  const currentBook = historyBooks.find(b => b.id === activeBookId);
  const bookUnits = releasedUnits.filter(u => u.bookId === activeBookId);

  // 辽宁高考入口（单独卡片，不在主路径）
  const examFeatures = [
    { icon: BarChart3, name: '辽宁考情', desc: '真题+趋势分析', href: '/learn/history/liaoning', color: 'red' },
    { icon: FileText, name: '论述大题', desc: '8道大题训练', href: '/learn/history/essay', color: 'indigo' },
    { icon: Target, name: '材料分析', desc: '新材料情境', href: '/learn/history/material-analysis', color: 'orange' },
    { icon: MapPin, name: '辽宁本土', desc: '红山文化等', href: '/learn/history/liaoning?tab=local', color: 'purple' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* 标题区 */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📜 历史
          </h1>
          <p className="text-muted-foreground">辽宁省高考历史 · 中外历史纲要上册</p>
        </div>

        {/* ====== 学习路径步骤 ====== */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              七步学习法
            </CardTitle>
            <p className="text-sm text-muted-foreground">按步骤学习，循序渐进，全面掌握历史知识</p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* 连接线 */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 hidden md:block" />
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {LEARNING_PATH_STEPS.map((item, idx) => {
                  const Icon = item.icon;
                  const colorMap: Record<string, string> = {
                    blue: 'bg-blue-500',
                    amber: 'bg-amber-500',
                    purple: 'bg-purple-500',
                    cyan: 'bg-cyan-500',
                    rose: 'bg-rose-500',
                    green: 'bg-green-500',
                    indigo: 'bg-indigo-500',
                  };
                  const borderMap: Record<string, string> = {
                    blue: 'border-blue-200 hover:border-blue-400',
                    amber: 'border-amber-200 hover:border-amber-400',
                    purple: 'border-purple-200 hover:border-purple-400',
                    cyan: 'border-cyan-200 hover:border-cyan-400',
                    rose: 'border-rose-200 hover:border-rose-400',
                    green: 'border-green-200 hover:border-green-400',
                    indigo: 'border-indigo-200 hover:border-indigo-400',
                  };
                  const textMap: Record<string, string> = {
                    blue: 'text-blue-600',
                    amber: 'text-amber-600',
                    purple: 'text-purple-600',
                    cyan: 'text-cyan-600',
                    rose: 'text-rose-600',
                    green: 'text-green-600',
                    indigo: 'text-indigo-600',
                  };
                  
                  return (
                    <div
                      key={item.key}
                      className={`relative flex flex-col items-center text-center p-3 rounded-xl bg-white border-2 ${borderMap[item.color]} hover:shadow-lg transition-all cursor-pointer group`}
                      onClick={() => router.push(`/learn/history/unit/unit1`)}
                    >
                      {/* 步骤编号 */}
                      <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full ${colorMap[item.color]} flex items-center justify-center text-white text-xs font-bold shadow-md group-hover:scale-110 transition-transform`}>
                        {item.step}
                      </div>
                      
                      {/* 图标 */}
                      <div className={`w-10 h-10 rounded-lg ${colorMap[item.color]} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      
                      {/* 标签 */}
                      <span className={`text-xs font-semibold ${textMap[item.color]}`}>{item.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                      
                      {/* 箭头指示（桌面端） */}
                      {idx < LEARNING_PATH_STEPS.length - 1 && (
                        <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                          <ArrowRight className="h-4 w-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* 移动端箭头 */}
              <div className="flex md:hidden justify-center items-center py-2">
                <ArrowDown className="h-4 w-4 text-slate-400 animate-bounce" />
                <span className="text-xs text-slate-400 ml-2">向下滚动查看全部步骤</span>
              </div>
            </div>
            
            {/* 学习提示 */}
            <div className="mt-4 p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-purple-700">
                  <p className="font-medium">学习建议</p>
                  <p className="text-purple-600 mt-1">先选择单元进入学习，按①②③④⑤⑥⑦顺序完成各模块学习，最后做综合练习检验成果</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 教材切换 */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">📖 教材</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {historyBooks.map((book) => {
                const isActive = book.id === activeBookId;
                const isReleased = book.status === 'released';
                return (
                  <Button
                    key={book.id}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    disabled={!isReleased}
                    onClick={() => router.push(`/subjects/history?book=${book.id}`)}
                    className={isReleased ? '' : 'opacity-50 cursor-not-allowed'}
                    style={isActive ? { backgroundColor: book.color } : {}}
                  >
                    {book.shortName}
                    {!isReleased && <Lock className="h-3 w-3 ml-1" />}
                  </Button>
                );
              })}
            </div>
            {currentBook && (
              <p className="text-sm text-muted-foreground mt-2">
                {currentBook.name} · {currentBook.grade}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ====== 主学习路径：单元列表 ====== */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <GraduationCap className="h-5 w-5" />
              选择单元开始学习
            </CardTitle>
            <p className="text-sm text-muted-foreground">点击单元进入学习页，包含时间轴、知识点、因果链、历史卡牌、综合练习</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookUnits.map((unit) => {
              const lessonCount = unit.lessons?.length || 4;
              return (
                <div
                  key={unit.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white border-2 border-green-100 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/learn/history/unit/${unit.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                      {unit.unitNo}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{unit.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-1">{unit.title}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{lessonCount}课</Badge>
                        {unit.liaoningSummary && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
                            {unit.liaoningSummary.totalQuestions}题·{unit.liaoningSummary.totalScore}分
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" className="text-green-600">
                    开始学习 <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ====== 教材还原（独立入口）====== */}
        <Card 
          className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 cursor-pointer hover:shadow-md transition-all"
          onClick={() => router.push('/learn/history/textbook')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800">📖 教材还原学习</h3>
                  <p className="text-sm text-blue-600">上传PDF教材，AI智能还原课本内容</p>
                </div>
              </div>
              <Button variant="outline" className="border-blue-300 text-blue-600">
                进入 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ====== 辽宁高考专题（独立入口）====== */}
        <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Target className="h-5 w-5" />
              辽宁高考专版
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {examFeatures.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div
                    key={feature.href}
                    className="flex items-center gap-2 p-3 rounded-lg bg-white border border-red-100 hover:border-red-300 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => router.push(feature.href)}
                  >
                    <FeatureIcon className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium">{feature.name}</p>
                      <p className="text-xs text-slate-500">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 底部统计 */}
        <div className="flex justify-center gap-6 text-sm text-muted-foreground flex-wrap">
          <span>📊 {bookUnits.length}个单元已发布</span>
          <span>📝 18个对比表</span>
          <span>🧠 24组易混辨析</span>
          <span>📖 27道辽宁真题</span>
        </div>
      </div>
    </div>
  );
}

export default function HistorySubjectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">加载中...</div>}>
      <HistorySubjectContent />
    </Suspense>
  );
}
