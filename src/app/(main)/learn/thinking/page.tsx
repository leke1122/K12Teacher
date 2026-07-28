'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain, 
  Map, 
  Lightbulb, 
  FileText, 
  ArrowRight,
  BookOpen,
  Target,
  Layers,
  Zap,
  CheckCircle2,
  Home
} from 'lucide-react';

type Subject = 'history' | 'politics' | 'geography';

interface SubjectInfo {
  id: Subject;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  features: {
    mindmap: string;
    thinking: string;
    template: string;
  };
  chapters: { id: string; title: string }[];
}

const SUBJECTS: SubjectInfo[] = [
  {
    id: 'history',
    name: '历史',
    icon: <BookOpen className="h-8 w-8" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: '时空定位 + 因果推理 + 史料实证',
    features: {
      mindmap: '时间轴 + 因果链 + 横向对比',
      thinking: '题眼识别 → 时空定位 → 因果匹配',
      template: '评析类、比较类、开放性试题',
    },
    chapters: [
      { id: 'unit1', title: '第一单元：古代到秦汉' },
      { id: 'unit2', title: '第二单元：辽宋夏金元' },
      { id: 'unit3', title: '第三单元：明清' },
    ],
  },
  {
    id: 'politics',
    name: '政治',
    icon: <Target className="h-8 w-8" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: '原理调用 + 时政结合 + 多维分析',
    features: {
      mindmap: '原理树 + 多层级逻辑推导',
      thinking: '题眼识别 → 原理匹配 → 多维分析',
      template: '原因意义类、措施启示类、评析探究类',
    },
    chapters: [
      { id: 'ch1', title: '第一课：社会主义从空想到科学' },
      { id: 'ch2', title: '第二课：社会主义从理论到现实' },
      { id: 'ch3', title: '第三课：中国特色社会主义' },
    ],
  },
  {
    id: 'geography',
    name: '地理',
    icon: <Layers className="h-8 w-8" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: '区域认知 + 综合思维 + 区位分析',
    features: {
      mindmap: '区域要素框架（气地水土生）+ 区位分析',
      thinking: '题眼识别 → 区域定位 → 要素匹配',
      template: '区位分析类、成因分析类、影响评价类',
    },
    chapters: [
      { id: 'ch1', title: '第一章：宇宙中的地球' },
      { id: 'ch2', title: '第二章：地球上的大气' },
      { id: 'ch3', title: '第三章：地球上的水' },
    ],
  },
];

const TRAINING_STEPS = [
  { key: 'mindmap', label: '思维导图', sublabel: '是什么', icon: <Map className="h-5 w-5" />, color: 'bg-blue-500' },
  { key: 'thinking', label: '解题思维', sublabel: '为什么', icon: <Brain className="h-5 w-5" />, color: 'bg-purple-500' },
  { key: 'template', label: '答题模板', sublabel: '怎么做', icon: <FileText className="h-5 w-5" />, color: 'bg-emerald-500' },
];

export default function ThinkingTrainingPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<Record<string, Record<string, boolean>>>({});

  const subject = SUBJECTS.find(s => s.id === selectedSubject);

  const handleStartTraining = (type: 'mindmap' | 'thinking' | 'template') => {
    if (!selectedSubject || !selectedChapter) return;
    
    const routes: Record<string, string> = {
      mindmap: `/learn/${selectedSubject}/mindmap?chapter=${selectedChapter}`,
      thinking: `/learn/${selectedSubject}/thinking?chapter=${selectedChapter}`,
      template: `/learn/${selectedSubject}/templates/practice?chapter=${selectedChapter}`,
    };
    
    // 标记完成
    setTrainingProgress(prev => ({
      ...prev,
      [`${selectedSubject}-${selectedChapter}`]: {
        ...prev[`${selectedSubject}-${selectedChapter}`],
        [type]: true,
      },
    }));

    router.push(routes[type]);
  };

  const getProgress = (subjectId: string, chapterId: string) => {
    const key = `${subjectId}-${chapterId}`;
    const progress = trainingProgress[key] || {};
    const completed = Object.values(progress).filter(Boolean).length;
    return {
      completed,
      total: 3,
      percentage: Math.round((completed / 3) * 100),
    };
  };

  // 步骤1：选择学科
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-pink-950">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm mb-4">
              <Zap className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium">核心训练</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              政史地思维训练
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              思维导图 → 解题思维 → 答题模板，三位一体提升解题能力
            </p>
          </div>

          {/* 返回主页 */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <Home className="h-4 w-4" />
                返回主页
              </Button>
            </Link>
          </div>

          {/* 三环节说明 */}
          <Card className="mb-8 border-purple-100 dark:border-purple-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {TRAINING_STEPS.map((step, idx) => (
                  <div key={step.key} className="flex items-center gap-2">
                    <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center text-white`}>
                      {step.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">{step.label}</p>
                      <p className="text-xs text-slate-500">{step.sublabel}</p>
                    </div>
                    {idx < TRAINING_STEPS.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-slate-300 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 学科选择 */}
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">
            选择学科开始训练
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUBJECTS.map((s) => (
              <Card
                key={s.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${s.borderColor} ${s.bgColor}`}
                onClick={() => setSelectedSubject(s.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`${s.color} mb-4 flex justify-center`}>
                    {s.icon}
                  </div>
                  <h3 className={`text-xl font-bold ${s.color} mb-2`}>{s.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{s.description}</p>
                  <Badge variant="outline" className="text-xs">点击选择</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 步骤2：选择章节
  if (!selectedChapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-pink-950">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* 返回学科选择 */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 mb-6"
            onClick={() => setSelectedSubject(null)}
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            返回学科选择
          </Button>

          {subject && (
            <>
              {/* 学科信息 */}
              <div className={`text-center mb-8 p-6 rounded-2xl ${subject.bgColor} border ${subject.borderColor}`}>
                <div className={`${subject.color} mb-4 flex justify-center`}>
                  {subject.icon}
                </div>
                <h1 className={`text-2xl font-bold ${subject.color} mb-2`}>
                  {subject.name}思维训练
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{subject.description}</p>
                
                {/* 三环节特征 */}
                <div className="grid grid-cols-3 gap-4 mt-6 text-left">
                  <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Map className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium">思维导图</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{subject.features.mindmap}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-medium">解题思维</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{subject.features.thinking}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs font-medium">答题模板</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{subject.features.template}</p>
                  </div>
                </div>
              </div>

              {/* 章节选择 */}
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                选择章节
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subject.chapters.map((chapter) => {
                  const progress = getProgress(subject.id, chapter.id);
                  return (
                    <Card
                      key={chapter.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${progress.completed > 0 ? 'border-emerald-200' : ''}`}
                      onClick={() => setSelectedChapter(chapter.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-sm">{chapter.title}</p>
                          {progress.completed > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                              {progress.percentage}%
                            </Badge>
                          )}
                        </div>
                        {progress.completed > 0 && (
                          <Progress value={progress.percentage} className="h-1" />
                        )}
                        <p className="text-xs text-slate-500 mt-2">点击开始训练</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // 步骤3：三环节训练
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-pink-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 返回章节选择 */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 mb-6"
          onClick={() => setSelectedChapter(null)}
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          返回章节选择
        </Button>

        {subject && (
          <>
            {/* 训练概览 */}
            <div className={`text-center mb-8 p-6 rounded-2xl ${subject.bgColor} border ${subject.borderColor}`}>
              <div className={`${subject.color} mb-4 flex justify-center`}>
                {subject.icon}
              </div>
              <h1 className={`text-2xl font-bold ${subject.color} mb-2`}>
                {subject.name}核心训练
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {subject.chapters.find(c => c.id === selectedChapter)?.title}
              </p>
            </div>

            {/* 三环节训练卡片 */}
            <div className="space-y-4">
              {TRAINING_STEPS.map((step, idx) => {
                const progress = getProgress(subject.id, selectedChapter);
                const isCompleted = progress.completed > idx;

                return (
                  <Card
                    key={step.key}
                    className={`transition-all ${
                      isCompleted
                        ? 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {/* 序号 */}
                        <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-white text-lg font-bold`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        {/* 内容 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                              {step.sublabel}
                            </span>
                            <h3 className="text-lg font-bold">{step.label}</h3>
                            {isCompleted && (
                              <Badge className="bg-emerald-100 text-emerald-700">已完成</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-1">
                            {subject.features[step.key as keyof typeof subject.features]}
                          </p>
                        </div>

                        {/* 操作 */}
                        <Button
                          onClick={() => handleStartTraining(step.key as 'mindmap' | 'thinking' | 'template')}
                          className={`gap-2 ${
                            isCompleted
                              ? 'bg-emerald-500 hover:bg-emerald-600'
                              : step.color.replace('bg-', 'hover:bg-')
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              再练一次
                              <ArrowRight className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              开始训练
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>

                      {/* 进度条（仅显示已完成的步骤） */}
                      {idx === 0 && progress.completed > 0 && (
                        <div className="mt-4 flex gap-2">
                          {TRAINING_STEPS.map((s, i) => (
                            <div
                              key={s.key}
                              className={`h-2 flex-1 rounded-full ${
                                i < progress.completed ? s.color : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 学习报告入口 */}
            {getProgress(subject.id, selectedChapter).completed === 3 && (
              <Card className="mt-6 border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                <CardContent className="p-6 text-center">
                  <Lightbulb className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <h3 className="font-bold text-lg mb-2">训练完成！</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    恭喜完成本章三环节训练，你的解题能力已得到全面提升！
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link href={`/learn/${subject.id}`}>
                      <Button variant="outline" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        返回{subject.name}学习
                      </Button>
                    </Link>
                    <Button
                      onClick={() => setSelectedChapter(null)}
                      className="gap-2"
                    >
                      选择其他章节
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
