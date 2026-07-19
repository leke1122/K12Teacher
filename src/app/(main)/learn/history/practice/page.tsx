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
  // 中华文明起源
  { id: 'q1', type: 'choice', category: '文化', difficulty: 'easy', question: '中国境内已知最早的人类是？', options: ['北京人', '元谋人', '山顶洞人', '河姆渡人'], correctAnswer: 1, explanation: '元谋人距今约170万年，是中国境内已知最早的人类。' },
  { id: 'q2', type: 'choice', category: '文化', difficulty: 'medium', question: '以彩陶文化著称的新石器时代文化是？', options: ['龙山文化', '仰韶文化', '河姆渡文化', '良渚文化'], correctAnswer: 1, explanation: '仰韶文化以彩绘陶器著称，主要分布于黄河中游地区。' },
  { id: 'q3', type: 'choice', category: '文化', difficulty: 'medium', question: '种植水稻的文化遗存是？', options: ['仰韶文化', '龙山文化', '河姆渡文化', '红山文化'], correctAnswer: 2, explanation: '河姆渡文化位于长江下游，是种植水稻的文化代表。' },

  // 早期国家制度
  { id: 'q4', type: 'choice', category: '政治', difficulty: 'easy', question: '西周分封制的主要目的是？', options: ['发展经济', '巩固统治', '传播文化', '对外扩张'], correctAnswer: 1, explanation: '分封制的主要目的是"封建亲戚，以藩屏周"，巩固周天子的统治。' },
  { id: 'q5', type: 'choice', category: '政治', difficulty: 'easy', question: '宗法制的核心是？', options: ['分封制', '嫡长子继承制', '礼乐制', '井田制'], correctAnswer: 1, explanation: '宗法制以嫡长子继承制为核心，解决贵族权力和财产继承问题。' },
  { id: 'q6', type: 'choice', category: '政治', difficulty: 'medium', question: '西周礼乐制度的作用是？', options: ['发展经济', '维护等级秩序', '对外战争', '文化传播'], correctAnswer: 1, explanation: '礼乐制度是维护宗法制和分封制的工具，用礼区分等级，用乐协调秩序。' },
  { id: 'q7', type: 'choice', category: '经济', difficulty: 'medium', question: '井田制的本质是？', options: ['土地私有制', '土地国有制', '土地租赁制', '集体耕作制'], correctAnswer: 1, explanation: '井田制是奴隶主土地国有制，土地属于周王所有，不得随意买卖。' },

  // 春秋战国
  { id: 'q8', type: 'choice', category: '政治', difficulty: 'medium', question: '春秋战国时期最本质的特征是？', options: ['统一多民族国家形成', '奴隶制向封建制转变', '中央集权确立', '儒学成为正统'], correctAnswer: 1, explanation: '春秋战国是大变革时期，最本质的特征是从奴隶社会向封建社会的转变。' },
  { id: 'q9', type: 'choice', category: '经济', difficulty: 'easy', question: '推动春秋战国社会变革的根本原因是？', options: ['分封制崩溃', '铁器牛耕使用', '百家争鸣', '诸侯争霸'], correctAnswer: 1, explanation: '铁器牛耕的使用提高了生产力，是推动社会变革的根本原因。' },
  { id: 'q10', type: 'choice', category: '经济', difficulty: 'easy', question: '小农经济的本质属性是？', options: ['商品经济', '家庭经营', '规模经营', '官府经营'], correctAnswer: 1, explanation: '小农经济最本质的属性是家庭经营，经营规模较小。' },
  { id: 'q11', type: 'choice', category: '政治', difficulty: 'medium', question: '商鞅变法中承认土地私有的措施是？', options: ['重农抑商', '奖励军功', '废井田开阡陌', '推行县制'], correctAnswer: 2, explanation: '"废井田，开阡陌"从法律上确立了封建土地私有制。' },
  { id: 'q12', type: 'choice', category: '政治', difficulty: 'hard', question: '商鞅变法成功的根本原因是？', options: ['秦孝公支持', '商鞅个人才能', '顺应历史潮流', '措施行之有效'], correctAnswer: 2, explanation: '根本原因是变法顺应了从奴隶社会向封建社会转变的历史潮流。' },

  // 百家争鸣
  { id: 'q13', type: 'choice', category: '思想', difficulty: 'hard', question: '百家争鸣中，主张"兼爱""非攻"的是？', options: ['儒家', '道家', '墨家', '法家'], correctAnswer: 2, explanation: '墨家主张"兼爱"（无差别的爱所有人）和"非攻"（反对战争）。' },
  { id: 'q14', type: 'choice', category: '思想', difficulty: 'easy', question: '孔子"仁"的核心含义是？', options: ['克己复礼', '爱人', '为政以德', '有教无类'], correctAnswer: 1, explanation: '"仁"的核心含义是"爱人"，是孔子思想的核心。' },
  { id: 'q15', type: 'choice', category: '思想', difficulty: 'medium', question: '百家争鸣的历史意义是？', options: ['统一文字', '奠定中国传统文化基础', '建立郡县制', '确立儒学正统'], correctAnswer: 1, explanation: '百家争鸣奠定了中国传统文化体系的基础，是中国历史上第一次思想解放运动。' },
  { id: 'q16', type: 'choice', category: '思想', difficulty: 'medium', question: '法家思想的集大成者是？', options: ['商鞅', '韩非子', '申不害', '慎到'], correctAnswer: 1, explanation: '韩非子将法家思想系统化，提出"法、术、势"结合的理论。' },

  // 秦朝
  { id: 'q17', type: 'choice', category: '政治', difficulty: 'easy', question: '秦朝统一六国是在哪一年？', options: ['公元前230年', '公元前221年', '公元前206年', '公元前202年'], correctAnswer: 1, explanation: '公元前221年，秦王嬴政灭六国，建立秦朝。' },
  { id: 'q18', type: 'choice', category: '政治', difficulty: 'medium', question: '秦朝在地方实行的制度是？', options: ['分封制', '郡县制', '郡国并行制', '行省制'], correctAnswer: 1, explanation: '秦朝废除分封制，全面推行郡县制。' },
  { id: 'q19', type: 'choice', category: '政治', difficulty: 'medium', question: '郡县制与分封制最本质的区别是？', options: ['划分标准不同', '官吏任用方式不同', '历史作用不同', '与中央关系不同'], correctAnswer: 1, explanation: '最本质区别是官吏任用方式：分封制下诸侯世袭，郡县制下官吏由皇帝任免。' },
  { id: 'q20', type: 'choice', category: '政治', difficulty: 'easy', question: '专制主义中央集权制度的核心是？', options: ['地方分权', '丞相专权', '皇权至上', '贵族政治'], correctAnswer: 2, explanation: '专制主义中央集权制度的核心是皇权至上。' },
  { id: 'q21', type: 'choice', category: '政治', difficulty: 'medium', question: '三公中负责监察百官的是？', options: ['丞相', '太尉', '御史大夫', '九卿'], correctAnswer: 2, explanation: '御史大夫是副丞相，负责监察百官和下达诏令。' },

  // 两汉
  { id: 'q22', type: 'choice', category: '思想', difficulty: 'medium', question: '汉初实行"无为而治"的主要原因是？', options: ['道家思想占统治地位', '汉初民生凋敝', '皇帝崇尚黄老', '儒家思想不被接受'], correctAnswer: 1, explanation: '汉初实行"无为而治"是因为楚汉战争后民生凋敝、百废待兴，需要休养生息。' },
  { id: 'q23', type: 'choice', category: '政治', difficulty: 'medium', question: '汉武帝削弱诸侯王势力的主要措施是？', options: ['削藩策', '推恩令', '刺史制度', '察举制'], correctAnswer: 1, explanation: '推恩令是汉武帝推行的重要措施，巧妙地削弱了诸侯国的实力。' },
  { id: 'q24', type: 'choice', category: '思想', difficulty: 'easy', question: '"罢黜百家，独尊儒术"是谁建议汉武帝实行的？', options: ['汉高祖', '董仲舒', '司马迁', '张骞'], correctAnswer: 1, explanation: '董仲舒向汉武帝建议"罢黜百家，独尊儒术"。' },
  { id: 'q25', type: 'choice', category: '经济', difficulty: 'medium', question: '汉武帝时期，将铸币权收归中央的货币是？', options: ['半两钱', '五铢钱', '开元通宝', '交子'], correctAnswer: 1, explanation: '汉武帝统一发行五铢钱，将铸币权收归中央。' },
  { id: 'q26', type: 'choice', category: '文化', difficulty: 'easy', question: '《史记》的作者是？', options: ['司马光', '司马迁', '班固', '陈寿'], correctAnswer: 1, explanation: '司马迁的《史记》是我国第一部纪传体通史。' },
  { id: 'q27', type: 'choice', category: '文化', difficulty: 'easy', question: '发明世界上最早地震仪的科学家是？', options: ['张仲景', '华佗', '张衡', '蔡伦'], correctAnswer: 2, explanation: '张衡发明的候风地动仪是世界上最早的地震仪。' },
  { id: 'q28', type: 'choice', category: '经济', difficulty: 'medium', question: '东汉庄园经济的特点是？', options: ['国家经营', '自给自足', '商品交换', '小农经营'], correctAnswer: 1, explanation: '庄园经济是豪强地主经营土地的方式，内部自给自足，形成独立经济实体。' },
  { id: 'q29', type: 'choice', category: '政治', difficulty: 'medium', question: '"光武中兴"发生在哪个朝代？', options: ['西汉', '东汉', '西晋', '隋朝'], correctAnswer: 1, explanation: '"光武中兴"是东汉刘秀（汉光武帝）建立东汉后的恢复时期。' },
  { id: 'q30', type: 'choice', category: '文化', difficulty: 'medium', question: '被誉为"医圣"的是？', options: ['华佗', '张仲景', '扁鹊', '李时珍'], correctAnswer: 1, explanation: '张仲景的《伤寒杂病论》奠定中医临床学基础，被尊为"医圣"。' },
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-amber-50/30 p-4">
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-amber-50/30 p-4">
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
