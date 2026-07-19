'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SUBJECTS, useSubjectStore } from '@/stores/subjectStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle, Sparkles, Loader2, BookOpen, ChevronRight,
  Clock, Layers, Link2, BarChart3, BookText, Brain, FileQuestion, Ruler
} from 'lucide-react';
import { useTextbooks, uploadTextbook, saveTextbookChaptersData } from '@/hooks/useTextbooks';
import { TextbookManager } from '@/components/pdf/TextbookManager';
import { ChapterTree } from '@/components/pdf/ChapterTree';
import { Chapter } from '@/types/chapter';
import { useSettingsStore } from '@/stores/settingsStore';
import { useHistoryProgress } from '@/hooks/useHistoryProgress';

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.subjectId as string;
  const { setCurrentSubject } = useSubjectStore();
  const { settings } = useSettingsStore();

  const [cloudStatus] = useState<'connected' | 'disconnected' | 'syncing' | 'error'>('disconnected');
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');

  const {
    textbooks,
    activeTextbook,
    loading: textbooksLoading,
    chapters,
    switchTextbook,
    deleteTextbook,
    refresh,
  } = useTextbooks(subjectId);

  const { overallProgress } = useHistoryProgress('history', 'modern-china');

  useEffect(() => {
    if (!subjectId) return;
    setCurrentSubject(subjectId);
    
    // 英语跳转到英语学习中心
    if (subjectId === 'english') {
      router.push('/subjects/english');
      return;
    }
    
    // 语文跳转到语文学习中心
    if (subjectId === 'chinese') {
      router.push('/subjects/chinese');
      return;
    }
    
    // 历史使用独立的历史首页
    if (subjectId === 'history') {
      router.push('/subjects/history');
      return;
    }
  }, [subjectId, setCurrentSubject, router]);

  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const isHistory = subjectId === 'history';

  const handleExtractChapters = async () => {
    if (!settings?.deepseekKey) {
      setExtractError('请先在设置页面配置 DeepSeek API Key');
      return;
    }
    if (!activeTextbook) return;

    setExtracting(true);
    setExtractError('');

    try {
      const { getTextbookPDF } = await import('@/lib/textbookStorage');
      const pdf = getTextbookPDF(activeTextbook.id);
      if (!pdf) { setExtractError('未找到教材内容'); setExtracting(false); return; }

      const response = await fetch('/api/extract-chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pdf.fullText,
          apiKey: settings.deepseekKey,
          subjectId,
          textbookId: activeTextbook.id,
        }),
      });
      const data = await response.json();

      if (data.error) { setExtractError(data.error); setExtracting(false); return; }

      const extractedChapters: Chapter[] = (data.chapters || []) as Chapter[];
      await saveTextbookChaptersData(activeTextbook.id, extractedChapters);
      await refresh();
    } catch (err) {
      setExtractError('章节提取失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setExtracting(false);
    }
  };

  if (!subject) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Card className="max-w-lg mx-auto rounded-xl">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p>未找到该学科</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 历史学科特有功能入口 - 用于全学科复习
  const historyFeatures = [
    { icon: Clock, name: '时间轴', desc: '纵向梳理历史脉络', href: '/learn/history/timeline/ln-gaokao', color: 'amber' },
    { icon: Layers, name: '历史卡牌', desc: '间隔重复记忆', href: '/learn/history/cards', color: 'blue' },
    { icon: Link2, name: '因果链', desc: '事件逻辑关系', href: '/learn/history/causal-chain', color: 'purple' },
    { icon: BarChart3, name: '综合练习', desc: '全学科实战训练', href: '/learn/history/practice', color: 'emerald' },
  ];

  // 章节学习状态
  const getChapterStatus = (chapterIndex: number) => {
    const progress = Math.random(); // TODO: 根据实际进度计算
    if (progress === 1) return 'completed';
    if (progress > 0) return 'in_progress';
    return 'not_started';
  };

  const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
    completed: { label: '已学', className: 'bg-emerald-100 text-emerald-700', icon: '✅' },
    in_progress: { label: '进行中', className: 'bg-amber-100 text-amber-700', icon: '🔄' },
    not_started: { label: '未开始', className: 'bg-slate-100 text-slate-500', icon: '⬜' },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-100 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/30">
      {/* 去掉学科页头，内容直接显示在主导航栏下方 */}

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* 教材管理 */}
        <TextbookManager
          textbooks={textbooks}
          activeTextbook={activeTextbook}
          onSwitch={switchTextbook}
          onDelete={deleteTextbook}
          onRefresh={refresh}
          subjectId={subjectId}
        />

        {/* 历史学习进度 */}
        {isHistory && (
          <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookText className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">学习进度</span>
                </div>
                <span className="text-xs text-muted-foreground">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>已学：{Math.round(overallProgress / 100 * chapters.length)} 章</span>
                <span>共 {chapters.length} 章</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 历史学习功能入口 - 仅历史学科显示 */}
        {isHistory && (
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/60">
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
              <span className="text-amber-500">📜</span> 历史学习
            </h2>
            {/* 学习路径说明 */}
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">💡 学习路径</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-amber-700 whitespace-nowrap">📚 按课学习：</span>
                  <span className="text-amber-700">点击下方课节 → 课本还原+7个学习模块</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-purple-700 whitespace-nowrap">🔥 全局复习：</span>
                  <span className="text-purple-700">时间轴·因果链·卡牌·AI助教·练习</span>
                </div>
              </div>
            </div>
            
            {/* 两大学习模式 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 按课学习 */}
              <div className="p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/50 dark:to-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-sm">
                    📚
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">按课学习</h3>
                    <p className="text-xs text-indigo-500">教材章节内容精讲</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  点击下方课节名称，进入完整学习页面，包含：课本还原、知识点精讲、引导学习、AI问答、练习巩固、高考链接
                </p>
                <Button 
                  size="sm" 
                  className="w-full bg-indigo-500 hover:bg-indigo-600"
                  onClick={() => {
                    const el = document.getElementById('chapters-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  选择课节开始学习 ↓
                </Button>
              </div>
              
              {/* 全局复习 */}
              <div className="p-4 rounded-xl border-2 border-amber-200 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white text-sm">
                    🔥
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-300">全局复习</h3>
                    <p className="text-xs text-amber-500">跨单元综合复习</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {historyFeatures.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        onClick={() => router.push(item.href)}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:border-amber-300 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all cursor-pointer text-left"
                      >
                        <Icon className={`h-4 w-4 text-${item.color}-500 flex-shrink-0`} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 可视化学习入口 - 非历史学科 */}
        {!isHistory && subjectId !== 'math' && (
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
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => router.push('/learn/math/visualize/function')}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  开始学习
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 数学拍照纠错入口 */}
        {subjectId === 'math' && (
          <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xl">
                    📸
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">拍照纠错</h3>
                    <p className="text-xs text-muted-foreground">拍下错题，AI 导师引导你一步步自主思考解题</p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white"
                  onClick={() => router.push('/learn/math/remediation')}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  开始纠错
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* GeoGebra 动态图形入口 - 数学学科 */}
        {!isHistory && (
          <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center text-xl">
                    📐
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">GeoGebra 动态图形</h3>
                    <p className="text-xs text-muted-foreground">交互式几何探索与引导讲解</p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-white"
                  onClick={() => router.push('/learn/math/geogebra')}
                >
                  <Ruler className="h-3.5 w-3.5" />
                  开始学习
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 章节区 */}
        {textbooksLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">加载中...</span>
            </CardContent>
          </Card>
        ) : !activeTextbook ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-muted-foreground">上传教材后即可查看章节</p>
            </CardContent>
          </Card>
        ) : chapters.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-muted-foreground mb-1">章节尚未提取</p>
                <p className="text-xs text-muted-foreground">AI 将从教材内容中分析章节结构</p>
                {extractError && (
                  <p className="text-sm text-destructive mt-2">{extractError}</p>
                )}
                <Button
                  className="mt-4 gap-2"
                  onClick={handleExtractChapters}
                  disabled={extracting}
                >
                  {extracting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {extracting ? '分析中...' : 'AI 提取章节'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          isHistory ? (
            // 历史学科使用简化列表
            <Card id="chapters-section" className="rounded-xl shadow-sm border-0 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {activeTextbook.name} · {chapters.length} 单元
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {chapters.map((chapter, index) => {
                    const status = getChapterStatus(index);
                    const cfg = statusConfig[status];
                    const chapterId = String(chapter.chapterIndex || index + 1);

                    return (
                      <div
                        key={chapter.chapterIndex || index}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-500">第{chapter.chapterIndex}单元</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              {chapter.chapterTitle}
                            </span>
                            {chapter.sections && chapter.sections.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {chapter.sections.length}课
                              </Badge>
                            )}
                          </div>
                          <Badge className={cfg.className} variant="secondary">
                            {cfg.icon} {cfg.label}
                          </Badge>
                        </div>
                        {/* 显示该单元下的所有课 */}
                        {chapter.sections && chapter.sections.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            {chapter.sections.map((section, sIdx) => {
                              const sectionId = encodeURIComponent(section.sectionIndex + '_' + section.sectionTitle);
                              return (
                                <Button
                                  key={sIdx}
                                  size="sm"
                                  variant="outline"
                                  className="justify-start text-xs h-auto py-2 px-3 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700"
                                  onClick={() => router.push(`/learn/history/${chapterId}/${sectionId}`)}
                                >
                                  <span className="font-medium mr-1">{section.sectionIndex}</span>
                                  <span className="truncate">{section.sectionTitle}</span>
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            // 其他学科使用 ChapterTree 组件（支持展开小节）
            <ChapterTree
              chapters={chapters}
              subjectId={subjectId}
              textbookId={activeTextbook?.id}
            />
          )
        )}
      </main>
    </div>
  );
}
