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
  Clock, Layers, Link2, BarChart3, BookText, Brain, FileQuestion, Ruler,
  Camera, FileImage
} from 'lucide-react';
import { useTextbooks, uploadTextbook, saveTextbookChaptersData } from '@/hooks/useTextbooks';
import { TextbookManager } from '@/components/pdf/TextbookManager';
import { ChapterTree } from '@/components/pdf/ChapterTree';
import { Chapter } from '@/types/chapter';
import { useSettingsStore } from '@/stores/settingsStore';

export default function MathPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = 'math';
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

  useEffect(() => {
    if (!subjectId) return;
    setCurrentSubject(subjectId);
  }, [subjectId, setCurrentSubject]);

  const subject = SUBJECTS.find((s) => s.id === subjectId);

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

  const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
    completed: { label: '已学', className: 'bg-emerald-100 text-emerald-700', icon: '✅' },
    in_progress: { label: '进行中', className: 'bg-amber-100 text-amber-700', icon: '🔄' },
    not_started: { label: '未开始', className: 'bg-slate-100 text-slate-500', icon: '⬜' },
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-100 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/30">
      {/* 顶部状态栏 */}
      <header className="sticky top-16 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
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

        {/* 数学学习功能入口 */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-700/60">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="text-indigo-500">📐</span> 数学
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 拍照纠错 */}
            <button
              onClick={() => router.push('/learn/math/remediation')}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-indigo-50 dark:bg-indigo-900 group-hover:scale-110 transition-transform">
                📸
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">拍照纠错</p>
                <p className="text-xs text-slate-400 mt-0.5">单题引导</p>
              </div>
            </button>

            {/* 整页扫描 */}
            <button
              onClick={() => router.push('/learn/math/batch-scan')}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-purple-50 dark:bg-purple-900 group-hover:scale-110 transition-transform">
                📄
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">整页扫描</p>
                <p className="text-xs text-slate-400 mt-0.5">批量批改</p>
              </div>
            </button>

            {/* GeoGebra */}
            <button
              onClick={() => router.push('/learn/math/geogebra')}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-cyan-300 dark:hover:border-cyan-600 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-cyan-50 dark:bg-cyan-900 group-hover:scale-110 transition-transform">
                📐
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">GeoGebra</p>
                <p className="text-xs text-slate-400 mt-0.5">动态图形</p>
              </div>
            </button>

            {/* 可视化学习 */}
            <button
              onClick={() => router.push('/learn/math/visualize/function')}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-amber-50 dark:bg-amber-900 group-hover:scale-110 transition-transform">
                🔬
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">可视化</p>
                <p className="text-xs text-slate-400 mt-0.5">概念探索</p>
              </div>
            </button>

            {/* 函数智能学习 */}
            <button
              onClick={() => router.push('/learn/math/function')}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform">
                🧠
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">函数智能学习</p>
                <p className="text-xs text-slate-400 mt-0.5">知识图谱</p>
              </div>
            </button>

            {/* 章节课后练习 */}
            <button
              onClick={() => router.push('/learn/math/practice')}
              className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30 hover:border-green-400 dark:hover:border-green-600 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-green-100 dark:bg-green-900 group-hover:scale-110 transition-transform">
                📝
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">章节练习</p>
                <p className="text-xs text-slate-400 mt-0.5">精准出题</p>
              </div>
            </button>
          </div>
        </div>

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
          <ChapterTree
            chapters={chapters}
            subjectId={subjectId}
            textbookId={activeTextbook?.id}
          />
        )}
      </main>
    </div>
  );
}
