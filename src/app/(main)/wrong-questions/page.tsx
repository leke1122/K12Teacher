'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Trash2, BookOpen, Search, CheckCircle,
  AlertTriangle, X, Filter, RotateCcw, Sparkles
} from 'lucide-react';
import { getWrongQuestions, deleteWrongQuestion, markWrongQuestionMastered, getWeakPoints, updateWrongQuestion } from '@/services/practiceService';
import type { WrongQuestion, WeakPoint } from '@/services/practiceService';
import { cn } from '@/lib/utils';

function WrongQuestionsContent() {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [filter, setFilter] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<WrongQuestion | null>(null);

  useEffect(() => {
    setWrongQuestions(getWrongQuestions());
    setWeakPoints(getWeakPoints());
  }, []);

  const filtered = wrongQuestions
    .filter(wq => {
      if (filter === 'mastered') return wq.isMastered;
      if (filter === 'unmastered') return !wq.isMastered;
      return true;
    })
    .filter(wq =>
      !search ||
      wq.question.includes(search) ||
      wq.knowledgePoint?.includes(search) ||
      wq.weakPoint?.includes(search)
    );

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这条错题吗？')) return;
    deleteWrongQuestion(id);
    setWrongQuestions(getWrongQuestions());
    if (selected?.id === id) setSelected(null);
  };

  const handleMaster = (id: string) => {
    markWrongQuestionMastered(id);
    setWrongQuestions(getWrongQuestions());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/subjects/math">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />返回
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">📝 错题集</h1>
            </div>
            <Badge variant="outline" className="text-sm">{filtered.length}题</Badge>
          </div>

          {/* 搜索 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索错题、知识点..."
              className="pl-9 rounded-xl"
            />
          </div>

          {/* 筛选 */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: '全部' },
              { key: 'unmastered', label: '未掌握' },
              { key: 'mastered', label: '已掌握' },
            ].map(f => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? 'default' : 'outline'}
                onClick={() => setFilter(f.key as any)}
                className="rounded-lg text-xs"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-2xl space-y-4">
        {/* 薄弱项统计 */}
        {weakPoints.length > 0 && (
          <Card className="border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">薄弱项分布</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {weakPoints.sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 8).map(wp => (
                  <Badge key={wp.id} variant="outline" className="text-xs">
                    {wp.weakPoint} <span className="text-red-500 ml-1">×{wp.wrongCount}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 错题列表 */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-500 mb-2">
              {search ? '没有找到相关错题' : '暂无错题记录'}
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              {search ? '换个关键词试试' : '完成章节练习后，错题会自动收录到这里'}
            </p>
            <Link href="/subjects/math">
              <Button size="sm">去练习</Button>
            </Link>
          </div>
        ) : (
          filtered.map(wq => (
            <Card key={wq.id} className={cn(
              'border-0 shadow-md transition-all hover:shadow-lg cursor-pointer',
              wq.isMastered ? 'opacity-70' : ''
            )}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0" onClick={() => setSelected(wq)}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          wq.difficulty === 'simple' ? 'border-green-300 text-green-600' :
                          wq.difficulty === 'hard' ? 'border-red-300 text-red-600' :
                          'border-amber-300 text-amber-600'
                        )}
                      >
                        {wq.difficulty === 'simple' ? '简单' : wq.difficulty === 'hard' ? '困难' : '中等'}
                      </Badge>
                      {wq.knowledgePoint && (
                        <Badge variant="outline" className="text-xs">{wq.knowledgePoint}</Badge>
                      )}
                      {wq.isMastered && (
                        <Badge className="text-xs bg-green-100 text-green-700 border-green-200">已掌握</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                      {wq.question}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>
                        你的答案：<span className="text-red-500 font-medium">{wq.userAnswer || '未作答'}</span>
                      </span>
                      <span>
                        正确答案：<span className="text-green-600 font-medium">{wq.correctAnswer}</span>
                      </span>
                    </div>
                    {wq.weakPoint && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        薄弱项：{wq.weakPoint}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!wq.isMastered && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleMaster(wq.id); }}
                        title="标记为已掌握"
                        className="text-green-500 hover:text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleDelete(wq.id); }}
                      title="删除"
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 错题详情弹窗 */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              错题详情
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 mt-2">
              <Card className="bg-slate-50 dark:bg-slate-800/50">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {selected.question}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">你的答案</p>
                  <p className="font-bold text-red-600">{selected.userAnswer || '未作答'}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">正确答案</p>
                  <p className="font-bold text-green-600">{selected.correctAnswer}</p>
                </div>
              </div>

              {selected.wrongReason && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">错题原因</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selected.wrongReason}</p>
                </div>
              )}
              {selected.weakPoint && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">薄弱项</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">{selected.weakPoint}</p>
                </div>
              )}
              {selected.stepAnalysis && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">步骤分析</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selected.stepAnalysis}</p>
                </div>
              )}
              {selected.solutionSteps && (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">解题思路</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{selected.solutionSteps}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                {!selected.isMastered && (
                  <Button size="sm" onClick={() => { handleMaster(selected.id); setSelected(null); }} className="gap-1">
                    <CheckCircle className="h-4 w-4" />标记已掌握
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelected(null)}>关闭</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WrongQuestionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    }>
      <WrongQuestionsContent />
    </Suspense>
  );
}
