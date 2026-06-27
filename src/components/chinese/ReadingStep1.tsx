'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { ReadingProgress } from '@/lib/chineseReadingProgress';

interface Step1Props {
  text: string; // 课文原文，按段落分割
  chapterTitle: string;
  chapterId: string;
  progress: ReadingProgress | null;
  onComplete: (data: { firstImpression: string }) => void;
}

export function ReadingStep1({ text, chapterTitle, progress, onComplete }: Step1Props) {
  // 将文本按段落分割
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
  const [currentPage, setCurrentPage] = useState(0);
  const [firstImpression, setFirstImpression] = useState(progress?.firstImpression || '');

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < paragraphs.length - 1;
  const isLastParagraph = currentPage === paragraphs.length - 1;

  const handleNext = () => {
    if (isLastParagraph) return;
    setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (!canGoPrev) return;
    setCurrentPage(prev => prev - 1);
  };

  const handleComplete = () => {
    if (!firstImpression.trim()) {
      alert('请先写下你的第一印象');
      return;
    }
    onComplete({ firstImpression: firstImpression.trim() });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 课文内容区域 */}
      <div className="flex-1 overflow-auto">
        <Card className="min-h-[500px]">
          <CardContent className="p-8">
            {/* 课文标题 */}
            <h2 className="text-center text-2xl font-bold mb-8 text-slate-800 dark:text-slate-100">
              {chapterTitle}
            </h2>

            {/* 沉浸式阅读区域 */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-serif">
                {paragraphs[currentPage] || text}
              </div>
            </div>

            {/* 页码导航 */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                上一段
              </Button>

              <div className="flex items-center gap-2">
                {paragraphs.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentPage
                        ? 'bg-indigo-500'
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={!canGoNext}
                className="gap-1"
              >
                下一段
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center text-sm text-slate-500 mt-2">
              第 {currentPage + 1} / {paragraphs.length} 段
            </div>
          </CardContent>
        </Card>

        {/* 第一印象输入 */}
        <Card className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🧠</span>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                你的第一印象
              </h3>
            </div>
            <p className="text-sm text-amber-700/70 dark:text-amber-300/70 mb-3">
              读完这篇课文后，你有什么感受或疑问？写下你的第一印象。
            </p>
            <Textarea
              value={firstImpression}
              onChange={(e) => setFirstImpression(e.target.value)}
              placeholder="例如：这篇文章主要讲了什么？作者想表达什么情感？有什么不理解的地方吗？"
              className="min-h-[100px] bg-white/80 dark:bg-slate-800/80"
            />
          </CardContent>
        </Card>
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50">
        <div className="text-sm text-slate-500">
          完成初读后，点击下方按钮进入下一步
        </div>
        <Button
          onClick={handleComplete}
          className="gap-2 bg-indigo-500 hover:bg-indigo-600"
          disabled={!firstImpression.trim()}
        >
          <Sparkles className="h-4 w-4" />
          进入主动探索
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
