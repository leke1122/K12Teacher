'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, BookOpen, CheckCircle2, Circle
} from 'lucide-react';
import Link from 'next/link';
import { releasedUnits, getUnitById } from '@/data/history/units';

const unitOverviews = {
  u1: {
    id: 'u1',
    unitName: '第一单元：从中华文明起源到秦汉统一',
    periods: [
      { period: '中华文明起源', coreTheme: '文明起源与原始社会', concepts: ['仰韶/河姆渡/龙山/红山/良渚', '母系父系社会', '禅让制', '旧石器/新石器'] },
      { period: '夏商西周', coreTheme: '早期国家', concepts: ['分封制', '宗法制', '礼乐制', '井田制', '工商食官'] },
      { period: '春秋战国', coreTheme: '社会大变革', concepts: ['铁犁牛耕', '小农经济', '商鞅变法', '百家争鸣', '华夏认同'] },
      { period: '秦汉', coreTheme: '大一统确立', concepts: ['专制主义中央集权', '三公九卿', '郡县制', '汉武帝大一统', '光武中兴'] },
    ],
    liaoningSummary: { totalQuestions: 11, totalScore: 48, bigQuestions: 2, highFrequencyTopics: ['秦始皇统一', '汉武帝大一统', '汉代政治理念'] },
  },
  u2: {
    id: 'u2',
    unitName: '第二单元：三国两晋南北朝的民族交融与隋唐统一',
    periods: [
      { period: '三国两晋', coreTheme: '政权更迭', concepts: ['三国鼎立', '西晋统一', '东晋南朝', '十六国北朝'] },
      { period: '南北朝', coreTheme: '民族交融', concepts: ['孝文帝改革', '江南开发', '门阀士族'] },
      { period: '隋唐盛世', coreTheme: '统一繁盛', concepts: ['贞观之治', '武周', '开元盛世', '大运河', '民族关系'] },
      { period: '唐中后期', coreTheme: '由盛转衰', concepts: ['安史之乱', '藩镇割据', '宦官专权', '黄巢起义'] },
      { period: '五代十国', coreTheme: '分裂割据', concepts: ['后周世宗改革', '五代更迭'] },
    ],
    liaoningSummary: { totalQuestions: 10, totalScore: 48, bigQuestions: 2, highFrequencyTopics: ['选官制度演变', '文化成就'] },
  },
  u3: {
    id: 'u3',
    unitName: '第三单元：辽宋夏金元多民族政权的并立与元朝统一',
    periods: [
      { period: '北宋', coreTheme: '中央集权', concepts: ['杯酒释兵权', '重文轻武', '积贫积弱', '王安石变法'] },
      { period: '辽夏金', coreTheme: '民族政权并立', concepts: ['澶渊之盟', '庆历和议', '南北面官', '猛安谋克'] },
      { period: '南宋', coreTheme: '偏安江南', concepts: ['绍兴和议', '经济重心南移完成'] },
      { period: '元朝', coreTheme: '大一统', concepts: ['行省制', '宣政院', '澎湖巡检司', '四等人制'] },
      { period: '经济社会', coreTheme: '繁荣与变革', concepts: ['交子', '坊市打破', '稻麦复种', '社会阶层变化'] },
      { period: '文化', coreTheme: '理学与文艺', concepts: ['程朱理学', '宋词元曲', '三大发明', '少数民族文字'] },
    ],
    liaoningSummary: { totalQuestions: 6, totalScore: 18, bigQuestions: 0, highFrequencyTopics: ['经济与社会', '民族政权制度'] },
  },
};

export default function OverviewPage() {
  const [currentUnitId, setCurrentUnitId] = useState('u1');
  const [learnedConcepts, setLearnedConcepts] = useState<Set<string>>(new Set());

  const currentUnit = getUnitById(currentUnitId);
  const overview = unitOverviews[currentUnitId as keyof typeof unitOverviews];

  const toggleConcept = (concept: string) => {
    const key = `${currentUnitId}-${concept}`;
    const newLearned = new Set(learnedConcepts);
    if (newLearned.has(key)) {
      newLearned.delete(key);
    } else {
      newLearned.add(key);
    }
    setLearnedConcepts(newLearned);
  };

  const totalConcepts = overview.periods.reduce((sum, p) => sum + p.concepts.length, 0);
  const learnedCount = overview.periods.reduce((sum, p) => {
    return sum + p.concepts.filter(c => learnedConcepts.has(`${currentUnitId}-${c}`)).length;
  }, 0);
  const progress = (learnedCount / totalConcepts) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/subjects/history">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-indigo-500" />
              单元知识结构总览
            </h1>
            <p className="text-sm text-muted-foreground">
              把握框架 · 理解脉络
            </p>
          </div>
        </div>

        {/* 单元选择 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {releasedUnits.map((u) => (
            <Button
              key={u.id}
              variant={currentUnitId === u.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentUnitId(u.id)}
            >
              {u.name}
            </Button>
          ))}
        </div>

        {/* 辽宁考情 */}
        {overview.liaoningSummary && (
          <Card className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                📊 辽宁卷考情摘要
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">真题数量</p>
                  <p className="text-2xl font-bold text-red-600">{overview.liaoningSummary.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">总分</p>
                  <p className="text-2xl font-bold">{overview.liaoningSummary.totalScore}分</p>
                </div>
                <div>
                  <p className="text-muted-foreground">大题</p>
                  <p className="text-2xl font-bold">{overview.liaoningSummary.bigQuestions}道</p>
                </div>
                <div>
                  <p className="text-muted-foreground">★★★考点</p>
                  <p className="text-xs">{overview.liaoningSummary.highFrequencyTopics.join(' / ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 学习进度 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">学习进度</span>
              <span className="text-lg font-bold text-indigo-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              已掌握 {learnedCount} / {totalConcepts} 个概念
            </p>
          </CardContent>
        </Card>

        {/* 知识结构总览表 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              {overview.unitName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-3 text-left text-sm font-medium w-32">时期</th>
                    <th className="p-3 text-left text-sm font-medium w-40">核心主题</th>
                    <th className="p-3 text-left text-sm font-medium">关键概念</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {overview.periods.map((period) => (
                    <tr key={period.period} className="hover:bg-slate-50">
                      <td className="p-3">
                        <Badge variant="outline" className="whitespace-nowrap">{period.period}</Badge>
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-sm">{period.coreTheme}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {period.concepts.map((concept) => {
                            const key = `${currentUnitId}-${concept}`;
                            const isLearned = learnedConcepts.has(key);
                            return (
                              <button
                                key={concept}
                                onClick={() => toggleConcept(concept)}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                                  isLearned 
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {isLearned ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <Circle className="h-3 w-3" />
                                )}
                                {concept}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 快捷链接 */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Link href={`/learn/history/timeline/${currentUnitId}`}>
            <Button variant="outline" size="sm">查看时间轴</Button>
          </Link>
          <Link href={`/learn/history/knowledge/${currentUnitId}`}>
            <Button variant="outline" size="sm">知识点学习</Button>
          </Link>
          <Link href={`/learn/history/compare?unit=${currentUnitId}`}>
            <Button variant="outline" size="sm">对比表</Button>
          </Link>
          <Link href={`/learn/history/liaoning?unit=${currentUnitId}`}>
            <Button variant="outline" size="sm">辽宁考情</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
