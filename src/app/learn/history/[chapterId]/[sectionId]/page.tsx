'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoryKnowledgeList } from '@/components/history/HistoryKnowledgeList';
import { HistoryTimelineChart } from '@/components/history/HistoryTimelineChart';
import { HistoryCausalChainView } from '@/components/history/HistoryCausalChainView';
import { HistoryCardDeck } from '@/components/history/HistoryCardDeck';
import { HistoryMaterialAnalysis } from '@/components/history/HistoryMaterialAnalysis';
import { HistoryPracticeQuiz } from '@/components/history/HistoryPracticeQuiz';
import {
  ArrowLeft, BookOpen, Brain, Clock, Layers, Link2,
  FileText, BarChart3, Loader2, Sparkles, ChevronRight
} from 'lucide-react';
import { useTextbooks } from '@/hooks/useTextbooks';

// 7个功能模块定义
const MODULES = [
  { id: 'textbook',  label: '课本还原',    icon: BookOpen,  desc: '逐段阅读教材原文',           color: 'blue' },
  { id: 'knowledge', label: '知识点精讲',  icon: Brain,     desc: '核心知识点卡片式讲解',        color: 'purple' },
  { id: 'timeline',  label: '时间轴',      icon: Clock,     desc: '事件脉络按时间排列',          color: 'amber' },
  { id: 'cards',     label: '历史卡牌',    icon: Layers,    desc: '翻转卡片记忆关键内容',        color: 'cyan' },
  { id: 'causal',    label: '因果链',      icon: Link2,     desc: '分析事件远因→近因→后果',     color: 'rose' },
  { id: 'analysis',  label: '史料分析',    icon: FileText,  desc: '解读史料并回答问题',         color: 'green' },
  { id: 'practice',  label: '综合练习',    icon: BarChart3, desc: '本课相关选择题与材料题',     color: 'indigo' },
];

function ModuleCard({
  module,
  onClick,
}: {
  module: (typeof MODULES)[number];
  onClick: () => void;
}) {
  const Icon = module.icon;
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 hover:border-amber-400',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:border-cyan-400',
    rose: 'bg-rose-50 text-rose-600 border-rose-200 hover:border-rose-400',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:border-emerald-400',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:border-indigo-400',
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 bg-white transition-all hover:shadow-lg hover:-translate-y-1 text-center ${colorMap[module.color]}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-current/10`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-semibold text-slate-800">{module.label}</p>
        <p className="text-xs text-slate-500 mt-1">{module.desc}</p>
      </div>
    </button>
  );
}

function HistoryLessonPageContent() {
  const params = useParams();
  const router = useRouter();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : 'modern-china';
  const rawSectionId = typeof params.sectionId === 'string' ? params.sectionId : '';

  // 解析 sectionId（格式：第1课_鸦片战争）
  const decodedSectionId = decodeURIComponent(rawSectionId);
  const [sectionIndex, ...rest] = decodedSectionId.split('_');
  const sectionTitle = rest.join('_');

  const { textbooks, activeTextbook, chapters } = useTextbooks('history');
  const [activeTab, setActiveTab] = useState('textbook');
  const [loading, setLoading] = useState(false);

  // 兼容不同章节格式：优先精确匹配，其次按第X课序号匹配，最后按标题模糊匹配
  const matchedSection = useMemo(() => {
    const byExact = () => {
      for (const chapter of chapters) {
        if (!chapter.sections) continue;
        const found = chapter.sections.find(
          (s) =>
            s.sectionIndex === sectionIndex ||
            s.sectionIndex + '_' + s.sectionTitle === decodedSectionId ||
            encodeURIComponent(s.sectionIndex + '_' + s.sectionTitle) === rawSectionId
        );
        if (found) return { chapter, section: found };
      }
      return null;
    };

    const byLessonNumber = () => {
      const lessonNum = parseInt(sectionIndex.replace(/[^\d]/g, ''), 10);
      if (!Number.isFinite(lessonNum) || lessonNum <= 0) return null;
      for (const chapter of chapters) {
        if (!chapter.sections || chapter.sections.length === 0) continue;
        const target = chapter.sections[lessonNum - 1];
        if (target) return { chapter, section: target };
      }
      return null;
    };

    const fallbackByTitle = () => {
      if (!sectionTitle) return null;
      const keyword = sectionTitle.trim();
      if (!keyword) return null;
      for (const chapter of chapters) {
        if (!chapter.sections) continue;
        const found = chapter.sections.find((s) => s.sectionTitle.includes(keyword));
        if (found) return { chapter, section: found };
      }
      return null;
    };

    return byExact() || byLessonNumber() || fallbackByTitle();
  }, [chapters, sectionIndex, decodedSectionId, rawSectionId, sectionTitle]);

  const displayTitle = sectionTitle
    ? `${sectionIndex} ${sectionTitle}`
    : sectionIndex || decodedSectionId || '本课';

  console.log('[历史课页] 路由参数:', { chapterId, sectionIndex, sectionTitle, rawSectionId, decodedSectionId, displayTitle });
  console.log('[历史课页] matchedSection:', matchedSection);

  const handleModuleClick = (moduleId: string) => {
    setActiveTab(moduleId);
  };

  const handleJumpToModule = (moduleId: string) => {
    setActiveTab(moduleId);
    setTimeout(() => {
      document.getElementById(`tab-${moduleId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <div className="w-full px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="text-amber-500">📜</span>
              {displayTitle}
            </h1>
            <p className="text-xs text-muted-foreground">
              历史学科 · {matchedSection?.chapter.chapterTitle || chapterId}
            </p>
          </div>
          {matchedSection && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 text-xs">
              第{Math.ceil((chapters.indexOf(matchedSection.chapter) + 1))}单元 · 第{Math.ceil((matchedSection.chapter.sections?.indexOf(matchedSection.section) ?? 0) + 1)}课
            </Badge>
          )}
        </div>

        {/* 模块网格入口 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MODULES.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              onClick={() => handleModuleClick(module.id)}
            />
          ))}
        </div>

        {/* 功能模块内容 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-white/80">
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <TabsTrigger
                  key={m.id}
                  id={`tab-${m.id}`}
                  value={m.id}
                  className="gap-1.5 text-xs data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {m.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* 课本还原 */}
          <TabsContent value="textbook">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>课本还原 · {displayTitle}</span>
                </div>
                {!activeTextbook ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">请先在历史学科页面上传教材</p>
                    <Button size="sm" className="mt-3" onClick={() => router.push('/subjects/history')}>
                      去上传
                    </Button>
                  </div>
                ) : !matchedSection ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">未找到该课内容，请确认教材已正确提取章节</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                      <p className="text-amber-800 font-medium mb-1">📖 本课内容预览</p>
                      <p className="text-amber-700">
                        页码范围：P{matchedSection.section.pages.start} - P{matchedSection.section.pages.end}
                      </p>
                      <p className="text-amber-600 text-xs mt-1">
                        完整课本还原功能正在加载，请稍后...
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        const textbookIdParam = activeTextbook?.id ? `&textbookId=${encodeURIComponent(activeTextbook.id)}` : '';
                        router.push(`/learn/textbook/history/${chapterId}/${encodeURIComponent(sectionIndex + '_' + sectionTitle)}?startPage=${matchedSection.section.pages.start}&endPage=${matchedSection.section.pages.end}&pageType=${matchedSection.section.pages.type}${textbookIdParam}`);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                      开始逐段学习
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 知识点精讲 */}
          <TabsContent value="knowledge">
            <HistoryKnowledgeList
              chapterId={chapterId}
              sectionId={decodedSectionId}
              sectionTitle={displayTitle}
              onModuleJump={handleJumpToModule}
            />
          </TabsContent>

          {/* 时间轴 */}
          <TabsContent value="timeline">
            <HistoryTimelineChart
              chapterId={chapterId}
              sectionId={decodedSectionId}
              sectionTitle={displayTitle}
            />
          </TabsContent>

          {/* 历史卡牌 */}
          <TabsContent value="cards">
            <HistoryCardDeck
              chapterId={chapterId}
              sectionId={decodedSectionId}
            />
          </TabsContent>

          {/* 因果链 */}
          <TabsContent value="causal">
            <HistoryCausalChainView
              chapterId={chapterId}
              sectionId={decodedSectionId}
            />
          </TabsContent>

          {/* 史料分析 */}
          <TabsContent value="analysis">
            <HistoryMaterialAnalysis
              chapterId={chapterId}
              sectionId={decodedSectionId}
            />
          </TabsContent>

          {/* 综合练习 */}
          <TabsContent value="practice">
            <HistoryPracticeQuiz
              chapterId={chapterId}
              sectionId={decodedSectionId}
              sectionTitle={displayTitle}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function HistoryLessonPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <HistoryLessonPageContent />
    </Suspense>
  );
}
