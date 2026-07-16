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
  }, [subjectId, setCurrentSubject]);

  const subject = SUBJECTS.find((s) => s.id === subjectId);
  const isHistory = subjectId === 'history';
  const isEnglish = subjectId === 'english';

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/30">
      {/* 顶部状态栏 */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{subject.icon}</span>
                <div>
                  <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {subject.name}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {activeTextbook ? activeTextbook.name : '请上传教材开始学习'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isHistory && (
                <Badge variant="outline" className="bg-amber-50">
                  进度：{overallProgress}%
                </Badge>
              )}
              <Badge variant="outline" className="bg-white dark:bg-slate-800">
                {activeTextbook ? '已上传' : '未上传教材'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

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
              <span className="text-amber-500">📜</span> 历史学习中心
            </h2>
            {/* 学习路径说明 */}
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">💡 推荐学习路径</p>
              <p className="text-amber-700 dark:text-amber-300 text-xs leading-relaxed">
                <strong>1. 按课学习：</strong>点击下方课节名称 → 完成课本还原、知识点精讲等7个模块<br/>
                <strong>2. 全局复习：</strong>使用时间轴、历史卡牌、因果链、综合练习进行跨单元复习
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {historyFeatures.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}
                      style={{ backgroundColor: `var(--${item.color}-50, #fef3c7)` }}>
                      <Icon className={`h-5 w-5 text-${item.color}-500`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{item.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 英语语法学习入口 - 仅英语学科显示 */}
        {isEnglish && (
          <Card className="rounded-xl shadow-sm border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl">
                    📖
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">语法学习</h3>
                    <p className="text-xs text-muted-foreground">8个阶段 · 43个知识点 · 高考全覆盖</p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={() => router.push('/learn/english/grammar')}
                >
                  开始学习
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs bg-white">词法基础</Badge>
                <Badge variant="outline" className="text-xs bg-white">时态语态</Badge>
                <Badge variant="outline" className="text-xs bg-white">非谓语动词</Badge>
                <Badge variant="outline" className="text-xs bg-white">三大从句</Badge>
                <Badge variant="outline" className="text-xs bg-white">特殊句式</Badge>
                <Badge variant="outline" className="text-xs bg-white">情态动词</Badge>
                <Badge variant="outline" className="text-xs bg-white">介词短语</Badge>
                <Badge variant="outline" className="text-xs bg-white">高考综合</Badge>
              </div>
            </CardContent>
          </Card>
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
            <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
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
