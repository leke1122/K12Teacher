'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Loader2, BookOpen, ChevronRight, ChevronDown,
  BookText, GraduationCap, PenTool, Play, RotateCcw, ScrollText,
  Eye, Search, Brain, MessageCircle, CheckCircle2, FileText, Languages
} from 'lucide-react';
import { useTextbooks, saveTextbookChaptersData } from '@/hooks/useTextbooks';
import { TextbookManager } from '@/components/pdf/TextbookManager';
import { Chapter } from '@/types/chapter';
import { useSettingsStore } from '@/stores/settingsStore';
import { 
  getChapterReadingStatus, 
  calculateOverallProgress
} from '@/lib/chineseReadingProgress';

// 五步阅读流程
const READING_STEPS = [
  { id: 1, icon: Eye, label: '沉浸式初读', color: 'indigo' },
  { id: 2, icon: Search, label: '主动探索', color: 'blue' },
  { id: 3, icon: Brain, label: '结构梳理', color: 'purple' },
  { id: 4, icon: PenTool, label: '迁移输出', color: 'amber' },
  { id: 5, icon: MessageCircle, label: '反思对话', color: 'emerald' },
];

// 专题学习卡片
const SPECIAL_TOPICS = [
  {
    id: 'classical',
    icon: ScrollText,
    title: '文言文精读',
    description: '逐字逐句理解古文，掌握重点字词和句式',
    color: 'amber',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    href: '/learn/chinese/classical',
    stats: '系统学习',
  },
  {
    id: 'poetry',
    icon: FileText,
    title: '诗歌鉴赏',
    description: '品味诗词意境，把握意象与情感表达',
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    href: '/learn/chinese/poetry',
    stats: '意境品读',
  },
  {
    id: 'recitation',
    icon: BookOpen,
    title: '名句默写',
    description: '精选高考必背篇目，巩固记忆与书写',
    color: 'emerald',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    href: '/learn/chinese/classical',
    stats: '重点篇目',
  },
  {
    id: 'language',
    icon: Languages,
    title: '语言文字运用',
    description: '标点、病句、成语、修辞等语言基础训练',
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    href: '/learn/chinese/language',
    stats: '语基专项',
  },
];

export default function ChineseSubjectPage() {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [toolsExpanded, setToolsExpanded] = useState(false);

  const {
    textbooks,
    activeTextbook,
    loading: textbooksLoading,
    chapters,
    switchTextbook,
    deleteTextbook,
    refresh,
  } = useTextbooks('chinese');

  // 计算整体学习进度
  const overallProgress = calculateOverallProgress(chapters);

  // 章节学习状态
  const getChapterStatus = (chapterId: string) => {
    return getChapterReadingStatus(chapterId);
  };

  // AI提取章节
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
          subjectId: 'chinese',
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

  // 开始阅读
  const handleStartReading = (chapterId: string) => {
    router.push(`/learn/chinese/reading/${chapterId}?textbookId=${activeTextbook?.id || ''}`);
  };

  // 获取章节状态图标
  const getStatusBadge = (status: 'not_started' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 gap-1"><CheckCircle2 className="h-3 w-3" /> 已完成</Badge>;
      case 'in_progress':
        return <Badge className="bg-amber-100 text-amber-700 gap-1"><RotateCcw className="h-3 w-3" /> 进行中</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-500">未开始</Badge>;
    }
  };

  // 当前推荐章节
  const currentChapter = chapters[0];
  const currentChapterId = currentChapter ? String(currentChapter.chapterIndex || 1) : '1';
  const currentStatus = getChapterStatus(currentChapterId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/30">
      {/* 顶部状态栏 */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📖</span>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">语文</h1>
                <p className="text-xs text-slate-500">
                  {activeTextbook ? activeTextbook.name : '请上传教材开始学习'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-indigo-50">
                进度：{overallProgress}%
              </Badge>
              <Badge variant="outline" className="bg-white dark:bg-slate-800">
                {activeTextbook ? '已上传' : '未上传教材'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-5">
        {/* 教材管理 */}
        <TextbookManager
          textbooks={textbooks}
          activeTextbook={activeTextbook}
          onSwitch={switchTextbook}
          onDelete={deleteTextbook}
          onRefresh={refresh}
          subjectId="chinese"
        />

        {/* 核心路径：五步深度阅读 */}
        {activeTextbook && chapters.length > 0 && (
          <Card className="rounded-xl shadow-sm border-0 overflow-hidden bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
            <CardContent className="p-5">
              <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="text-indigo-500">📚</span> 核心路径：深度阅读（五步法）
              </h2>
              
              {/* 步骤流程 */}
              <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto pb-2">
                {READING_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="flex items-center">
                      {idx > 0 && (
                        <ChevronRight className="h-4 w-4 text-slate-300 mx-1 flex-shrink-0" />
                      )}
                      <div className={`flex flex-col items-center px-3 py-2 rounded-lg bg-${step.color}-50 dark:bg-${step.color}-950/30 min-w-[80px]`}>
                        <Icon className={`h-5 w-5 text-${step.color}-500 mb-1`} />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {step.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
                从初读感受 → 主动探索 → 结构梳理 → 迁移输出 → 反思对话，深度理解课文
              </p>

              {/* 当前学习课文 */}
              {currentChapter && (
                <div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-indigo-50">当前学习</Badge>
                      <h3 className="font-semibold text-lg">
                        {currentChapter.chapterTitle}
                      </h3>
                      <p className="text-sm text-slate-500">
                        进度：第 {currentStatus.progress?.currentStep || 1}/5 步
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(currentStatus.status)}
                      <Button
                        onClick={() => handleStartReading(currentChapterId)}
                        className="gap-2 bg-indigo-500 hover:bg-indigo-600"
                      >
                        {currentStatus.status === 'in_progress' ? (
                          <>
                            <Play className="h-4 w-4" />
                            继续学习
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            开始学习
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 专题学习 */}
        {activeTextbook && chapters.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span className="text-indigo-500">🎯</span> 专题学习
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SPECIAL_TOPICS.map((topic) => {
                const Icon = topic.icon;
                return (
                  <Card
                    key={topic.id}
                    className={`cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all border ${topic.borderColor} ${topic.bgColor}`}
                    onClick={() => router.push(topic.href)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${topic.color}-100 dark:bg-${topic.color}-900`}>
                          <Icon className={`h-5 w-5 text-${topic.color}-600 dark:text-${topic.color}-400`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{topic.title}</h3>
                          <p className="text-xs text-slate-500">{topic.stats}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {topic.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">点击进入</Badge>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* 辅助工具（可折叠） */}
        {activeTextbook && chapters.length > 0 && (
          <Card className="rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <CardContent className="p-0">
              {/* 折叠头部 */}
              <button
                onClick={() => setToolsExpanded(!toolsExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">🛠️ 辅助工具</span>
                  <Badge variant="outline" className="text-xs">功能保持不变</Badge>
                </div>
                {toolsExpanded ? (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {/* 折叠内容 */}
              {toolsExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => router.push(`/learn/textbook/chinese/${currentChapterId}`)}
                    >
                      <BookText className="h-4 w-4" />
                      课本还原
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => router.push(`/learn/knowledge/chinese/${currentChapterId}/all`)}
                    >
                      <GraduationCap className="h-4 w-4" />
                      知识点列表
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => router.push(`/learn/practice/chinese/${currentChapterId}/all`)}
                    >
                      <PenTool className="h-4 w-4" />
                      章节练习
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 章节列表 */}
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
              <p className="text-muted-foreground">上传教材后即可开始深度阅读</p>
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
          <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {activeTextbook.name} · {chapters.length} 课
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {chapters.map((chapter, index) => {
                  const chapterId = String(chapter.chapterIndex || index + 1);
                  const status = getChapterStatus(chapterId);
                  const readingProgress = status.progress;

                  return (
                    <div
                      key={chapter.chapterIndex || index}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-500">
                            第{chapter.chapterIndex}课
                          </span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {chapter.chapterTitle}
                          </span>
                        </div>
                        {getStatusBadge(status.status)}
                      </div>

                      {/* 步骤进度 */}
                      {status.status !== 'not_started' && readingProgress && (
                        <div className="flex items-center gap-1 mb-3">
                          {READING_STEPS.map(step => (
                            <div
                              key={step.id}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                readingProgress.completedSteps?.includes(step.id)
                                  ? 'bg-emerald-500 text-white'
                                  : readingProgress.currentStep === step.id
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                              }`}
                              title={step.label}
                            >
                              {readingProgress.completedSteps?.includes(step.id) ? (
                                <CheckCircle2 className="h-3 w-3" />
                              ) : (
                                step.id
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                          onClick={() => handleStartReading(chapterId)}
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {status.status === 'in_progress' ? '继续' : status.status === 'completed' ? '复习' : '开始'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
