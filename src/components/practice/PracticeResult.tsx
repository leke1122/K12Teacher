'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, RotateCcw, BookOpen, AlertTriangle, CheckCircle, XCircle, BarChart2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PracticeResultProps {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  wrongQuestions: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    knowledgePoint?: string;
    difficulty?: string;
  }>;
  onRestart: () => void;
  subjectId: string;
  chapterId: string;
  sectionId: string;
}

export function PracticeResult({
  totalQuestions,
  correctCount,
  wrongCount,
  wrongQuestions,
  onRestart,
  subjectId,
  chapterId,
  sectionId,
}: PracticeResultProps) {
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPass = score >= 60;

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = () => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 60) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-pink-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 py-8">
      <div className="container mx-auto px-4 max-w-2xl space-y-6">
        {/* 成绩单头部 */}
        <Card className="border-0 shadow-2xl overflow-hidden">
          <div className={cn('h-2 bg-gradient-to-r', getScoreBg())} />
          <CardContent className="pt-8 text-center">
            <div className={cn('w-28 h-28 rounded-full bg-gradient-to-br', getScoreBg(), 'flex items-center justify-center mx-auto mb-4 shadow-xl')}>
              <div>
                <p className={cn('text-4xl font-black', score >= 80 ? 'text-white' : score >= 60 ? 'text-white' : 'text-white')}>{score}</p>
                <p className="text-xs text-white/80">分</p>
              </div>
            </div>
            <h2 className={cn('text-2xl font-bold mb-1', getScoreColor())}>
              {score >= 80 ? '优秀！' : score >= 60 ? '及格，继续加油！' : '需要更多练习'}
            </h2>
            <p className="text-slate-500">第 {chapterId} 章 第 {sectionId} 节 · 章节练习</p>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 font-bold text-xl mb-1">
                  <CheckCircle className="h-5 w-5" /> {correctCount}
                </div>
                <p className="text-xs text-slate-500">答对</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-600 font-bold text-xl mb-1">
                  <XCircle className="h-5 w-5" /> {wrongCount}
                </div>
                <p className="text-xs text-slate-500">答错</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-indigo-600 font-bold text-xl mb-1">
                  <Target className="h-5 w-5" /> {totalQuestions}
                </div>
                <p className="text-xs text-slate-500">总题数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 薄弱项分析 */}
        {wrongQuestions.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">薄弱项分析</h3>
                <Badge variant="outline" className="ml-auto">{wrongQuestions.length}题</Badge>
              </div>
              <div className="space-y-2">
                {wrongQuestions.slice(0, 5).map((wq, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xs font-bold text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2">{wq.question}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        你的答案：<span className="text-red-500">{wq.userAnswer || '未作答'}</span>
                        {' → '}
                        正确答案：<span className="text-green-600">{wq.correctAnswer}</span>
                      </p>
                      {wq.knowledgePoint && (
                        <Badge variant="outline" className="text-xs mt-1">{wq.knowledgePoint}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 薄弱项统计 */}
        {wrongQuestions.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">知识点掌握情况</h3>
              </div>
              <div className="space-y-2">
                {getKnowledgeStats(wrongQuestions).map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-400 w-32 truncate">{stat.name}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full" style={{ width: `${100 - stat.rate}%` }} />
                    </div>
                    <span className="text-xs text-slate-500 w-10 text-right">{stat.wrong}错</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3">
          <Button onClick={onRestart} size="lg" className="gap-2 bg-indigo-500 hover:bg-indigo-600">
            <RotateCcw className="h-4 w-4" /> 重新练习
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/wrong-questions`}>
              <Button variant="outline" size="lg" className="w-full gap-2">
                <BookOpen className="h-4 w-4" /> 查看错题集
              </Button>
            </Link>
            <Link href={`/subjects/${subjectId}`}>
              <Button variant="outline" size="lg" className="w-full gap-2">
                返回学科
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getKnowledgeStats(wrongQuestions: Array<{ knowledgePoint?: string }>) {
  const map = new Map<string, number>();
  wrongQuestions.forEach(wq => {
    const name = wq.knowledgePoint || '其他';
    map.set(name, (map.get(name) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, wrong]) => ({ name, wrong, rate: Math.max(0, 100 - wrong * 20) }))
    .sort((a, b) => b.wrong - a.wrong);
}
