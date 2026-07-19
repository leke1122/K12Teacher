'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Sparkles,
  BookOpen, BookMarked, FileQuestion, Star
} from 'lucide-react';
import Link from 'next/link';
import GuidedLearning from '@/components/politics/GuidedLearning';
import { PoliticsMustKnowList } from '@/components/politics/PoliticsMustKnowList';

export default function PoliticsKnowledgePage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  const [activeTab, setActiveTab] = useState('guided');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30">
      {/* 固定页头 */}
      <header className="sticky top-16 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          {/* 顶部导航 */}
          <div className="flex items-center gap-3 mb-3">
            <Link href="/subjects/politics">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">思想政治 · 知识点学习</h1>
              <p className="text-xs text-slate-500">必背内容 · 引导式学习 · AI问答</p>
            </div>
          </div>

          {/* 学习模式选择卡片 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveTab('mustKnow')}
              className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-xs ${
                activeTab === 'mustKnow'
                  ? 'border-red-400 bg-red-50 dark:bg-red-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-red-300'
              }`}
            >
              <Star className="h-4 w-4 text-red-500" />
              <span className="font-medium">必背清单</span>
            </button>

            <button
              onClick={() => setActiveTab('guided')}
              className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-xs ${
                activeTab === 'guided'
                  ? 'border-pink-400 bg-pink-50 dark:bg-pink-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-300'
              }`}
            >
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span className="font-medium">引导学习</span>
            </button>

            <button
              onClick={() => setActiveTab('textbook')}
              className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-xs ${
                activeTab === 'textbook'
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300'
              }`}
            >
              <BookMarked className="h-4 w-4 text-amber-500" />
              <span className="font-medium">课本还原</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-xs ${
                activeTab === 'practice'
                  ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-yellow-300'
              }`}
            >
              <FileQuestion className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">章节练习</span>
            </button>
          </div>
        </div>
      </header>

      {/* 内容区 */}
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {activeTab === 'mustKnow' && <PoliticsMustKnowList chapterId={chapterId} />}
        {activeTab === 'guided' && <GuidedLearning />}
        {activeTab === 'textbook' && <TextbookPreview />}
        {activeTab === 'practice' && <PracticePreview chapterId={chapterId} />}
      </div>
    </div>
  );
}

// 课本还原预览入口
function TextbookPreview() {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <BookMarked className="h-12 w-12 mx-auto mb-3 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">课本还原</h2>
        <p className="text-sm text-slate-500 mb-4">
          逐段讲解课本内容，选择教材和单元章节，引导对话思考回答。
        </p>
        <Link href="/learn/politics/textbook">
          <Button className="gap-1 bg-amber-500 hover:bg-amber-600 text-white">
            <BookOpen className="h-4 w-4" />
            进入课本还原
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// 章节练习预览入口
function PracticePreview({ chapterId }: { chapterId: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <FileQuestion className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">章节练习</h2>
        <p className="text-sm text-slate-500 mb-4">
          基于章节内容生成练习题，一次5道，选错后显示详细讲解。
        </p>
        <Link href={`/learn/politics/practice/${chapterId}`}>
          <Button className="gap-1 bg-yellow-500 hover:bg-yellow-600 text-white">
            <FileQuestion className="h-4 w-4" />
            开始练习
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
