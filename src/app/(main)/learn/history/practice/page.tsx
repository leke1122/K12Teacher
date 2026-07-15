'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, CheckCircle, XCircle, FileQuestion, Lightbulb, ChevronRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  type: 'choice';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  { id: 'q1', type: 'choice', category: '政治', difficulty: 'easy', question: '中国历史上第一个奴隶制王朝是？', options: ['夏朝', '商朝', '周朝', '秦朝'], correctAnswer: 0, explanation: '夏朝是中国历史上第一个奴隶制王朝。' },
  { id: 'q2', type: 'choice', category: '政治', difficulty: 'medium', question: '西周分封制的主要目的是？', options: ['发展经济', '巩固统治', '传播文化', '对外扩张'], correctAnswer: 1, explanation: '分封制的主要目的是巩固周天子的统治。' },
  { id: 'q3', type: 'choice', category: '政治', difficulty: 'medium', question: '春秋战国时期，诸侯争霸的实质是？', options: ['争夺土地和人口', '传播先进文化', '消灭奴隶制度', '统一文字'], correctAnswer: 0, explanation: '诸侯争霸的实质是争夺土地和人口。' },
  { id: 'q4', type: 'choice', category: '思想', difficulty: 'hard', question: '百家争鸣中，主张"兼爱""非攻"的是？', options: ['儒家', '道家', '墨家', '法家'], correctAnswer: 2, explanation: '墨家主张"兼爱"和"非攻"。' },
  { id: 'q5', type: 'choice', category: '政治', difficulty: 'medium', question: '商鞅变法的主要内容不包括？', options: ['废井田', '奖励军功', '推行分封制', '建立县制'], correctAnswer: 2, explanation: '商鞅变法废除了分封制，推行郡县制。' },
  { id: 'q6', type: 'choice', category: '文化', difficulty: 'easy', question: '汉字形体演变的正确顺序是？', options: ['甲骨文→金文→小篆→隶书→楷书', '金文→甲骨文→小篆→隶书→楷书', '甲骨文→小篆→金文→隶书→楷书', '金文→小篆→甲骨文→隶书→楷书'], correctAnswer: 0, explanation: '汉字演变顺序为：甲骨文→金文→小篆→隶书→楷书。' },
  { id: 'q7', type: 'choice', category: '政治', difficulty: 'hard', question: '秦朝统一六国后在地方实行什么制度？', options: ['分封制', '郡县制', '科举制', '行省制'], correctAnswer: 1, explanation: '秦朝在地方实行郡县制。' },
  { id: 'q8', type: 'choice', category: '思想', difficulty: 'medium', question: '"罢黜百家，独尊儒术"是谁提出的？', options: ['秦始皇', '汉武帝', '汉高祖', '董仲舒'], correctAnswer: 3, explanation: '董仲舒建议汉武帝实行"罢黜百家，独尊儒术"。' },
];

const CAT_COLORS: Record<string, string> = {
  政治: 'bg-amber-100 text-amber-700',
  思想: 'bg-violet-100 text-violet-700',
  文化: 'bg-pink-100 text-pink-700',
};

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

const DIFF_LABELS: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export default function HistoryPractice() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExp, setShowExp] = useState(false);
  const [catFilter, setCatFilter] = useState<string>('all');
  const [diffFilter, setDiffFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return QUESTIONS.filter(q => {
      if (catFilter !== 'all' && q.category !== catFilter) return false;
      if (diffFilter !== 'all' && q.difficulty !== diffFilter) return false;
      return true;
    });
  }, [catFilter, diffFilter]);

  const current = filtered[currentIndex];
  const progress = Math.round((Object.keys(answers).length / filtered.length) * 100);
  const correctCount = useMemo(() => {
    let count = 0;
    for (const q of QUESTIONS) {
      if (answers[q.id] === q.correctAnswer) count++;
    }
    return count;
  }, [answers]);

  const cats = [...new Set(QUESTIONS.map(q => q.category))];

  if (showResult) {
    const score = Math.round((correctCount / QUESTIONS.length) * 100);
    const grade = score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/subjects/history"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> 返回</Button></Link>
            <h1 className="text-xl font-bold">练习结果</h1>
          </div>
          <Card className="text-center p-8">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold ${
              grade === 'S' ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
              grade === 'A' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white' :
              grade === 'B' ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white' :
              grade === 'C' ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' :
              'bg-gradient-to-br from-red-400 to-red-500 text-white'
            }`}>{grade}</div>
            <h2 className="text-2xl font-bold mb-2">{score >= 90 ? '太棒了！' : score >= 70 ? '不错！' : score >= 60 ? '继续加油！' : '需要多复习！'}</h2>
            <p className="text-muted-foreground mb-6">答对 {correctCount}/{QUESTIONS.length} 题，正确率 {score}%</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setAnswers({}); setCurrentIndex(0); setShowResult(false); setShowExp(false); }}>
                <RotateCcw className="h-4 w-4" /> 重新练习
              </Button>
              <Link href="/subjects/history"><Button><BookOpen className="h-4 w-4" /> 返回学习</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/subjects/history"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> 返回</Button></Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2"><FileQuestion className="h-5 w-5 text-emerald-500" /> 历史综合练习</h1>
            <p className="text-xs text-muted-foreground">高中历史 · {QUESTIONS.length} 道练习题</p>
          </div>
        </div>

        <Card><CardContent className="p-3">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">进度：{Object.keys(answers).length}/{filtered.length} 题</span>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent></Card>

        <Card><CardContent className="p-3 flex flex-wrap gap-4">
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">类别：</span>
            <Button size="sm" variant={catFilter === 'all' ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setCatFilter('all')}>全部</Button>
            {cats.map(cat => (
              <Button key={cat} size="sm" variant={catFilter === cat ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setCatFilter(cat)}>{cat}</Button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">难度：</span>
            {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
              <Button key={d} size="sm" variant={diffFilter === d ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setDiffFilter(d)}>
                {d === 'all' ? '全部' : DIFF_LABELS[d]}
              </Button>
            ))}
          </div>
        </CardContent></Card>

        {current && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">第 {currentIndex + 1}/{filtered.length} 题</Badge>
                <Badge className={CAT_COLORS[current.category]}>{current.category}</Badge>
                <Badge className={DIFF_COLORS[current.difficulty]}>{DIFF_LABELS[current.difficulty]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">{current.question}</h3>
              <RadioGroup value={answers[current.id]?.toString() || ''} onValueChange={v => { setAnswers(prev => ({ ...prev, [current.id]: parseInt(v) })); }} className="space-y-2">
                {current.options.map((opt, idx) => {
                  const isSel = answers[current.id] === idx;
                  const isCorr = idx === current.correctAnswer;
                  const showCorr = showExp && isCorr;
                  const showWrong = showExp && isSel && !isCorr;
                  return (
                    <div key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSel && !showExp ? 'border-indigo-500 bg-indigo-50' :
                        showCorr ? 'border-green-500 bg-green-50' :
                        showWrong ? 'border-red-500 bg-red-50' :
                        'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => { if (!showExp) setAnswers(prev => ({ ...prev, [current.id]: idx })); }}>
                      <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
                      <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer">{opt}</Label>
                      {showCorr && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {showWrong && <XCircle className="h-5 w-5 text-red-600" />}
                    </div>
                  );
                })}
              </RadioGroup>

              {showExp && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-800">答案解析</span>
                  </div>
                  <p className="text-sm text-amber-900">{current.explanation}</p>
                </div>
              )}

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>上一题</Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentIndex(Math.min(filtered.length - 1, currentIndex + 1))} disabled={currentIndex === filtered.length - 1}>下一题</Button>
                </div>
                {answers[current.id] !== undefined && !showExp && (
                  <Button onClick={() => setShowExp(true)}><Lightbulb className="h-4 w-4" /> 查看解析</Button>
                )}
                {(showExp || answers[current.id] !== undefined) && (
                  <Button onClick={() => { if (currentIndex < filtered.length - 1) { setCurrentIndex(currentIndex + 1); setShowExp(false); } else { setShowResult(true); } }}>
                    {currentIndex === filtered.length - 1 ? '查看结果' : '下一题'} <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">题目导航</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filtered.map((q, idx) => (
                <Button key={q.id} size="sm" variant={idx === currentIndex ? 'default' : answers[q.id] !== undefined ? 'secondary' : 'outline'}
                  className="w-10 h-10" onClick={() => setCurrentIndex(idx)}>{idx + 1}</Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
