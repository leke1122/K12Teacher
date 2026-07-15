'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Sparkles,
  BookOpen, BookMarked, FileQuestion
} from 'lucide-react';
import Link from 'next/link';
import GuidedLearning from '@/components/politics/GuidedLearning';

export default function PoliticsKnowledgePage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  const [activeTab, setActiveTab] = useState('guided');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30">
      <div className="w-full px-4 py-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/politics">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">思想政治 · 知识点学习</h1>
            <p className="text-xs text-slate-500">必背内容 · 引导式学习 · AI问答</p>
          </div>
        </div>

        {/* 学习模式选择卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setActiveTab('guided')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              activeTab === 'guided'
                ? 'border-pink-400 bg-pink-50 dark:bg-pink-950/30 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-300'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-pink-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">引导式学习</p>
              <p className="text-xs text-slate-500 mt-0.5">学→思→问→练</p>
            </div>
            {activeTab === 'guided' && (
              <Badge className="bg-pink-500 text-white text-xs border-0">进行中</Badge>
            )}
          </button>

          <button
            onClick={() => setActiveTab('textbook')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              activeTab === 'textbook'
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
              <BookMarked className="h-6 w-6 text-amber-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">课本还原</p>
              <p className="text-xs text-slate-500 mt-0.5">逐段讲解 · 上传教材</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              activeTab === 'practice'
                ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-yellow-300'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
              <FileQuestion className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">章节练习</p>
              <p className="text-xs text-slate-500 mt-0.5">5题 · 选错讲解</p>
            </div>
          </button>
        </div>

        {/* 内容区 */}
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
    <div className="space-y-4">
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
    </div>
  );
}

// 章节练习预览入口
function PracticePreview({ chapterId }: { chapterId: string }) {
  return (
    <div className="space-y-4">
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
    </div>
  );
}
