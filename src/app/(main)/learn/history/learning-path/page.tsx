'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, CheckCircle2, Circle, ArrowRight, Zap,
  BookOpen, Clock, Brain, Target, FileText, GitBranch
} from 'lucide-react';
import Link from 'next/link';
import { releasedUnits, getUnitById } from '@/data/history/units';

const learningSteps = [
  { id: 's1', round: 1, name: '知识结构总览', icon: BookOpen, time: '30分钟', route: '/learn/history/overview' },
  { id: 's2', round: 1, name: '时间轴', icon: Clock, time: '60分钟', route: '/learn/history/timeline' },
  { id: 's3', round: 1, name: '因果链', icon: GitBranch, time: '45分钟', route: '/learn/history/causal-chain' },
  { id: 's4', round: 1, name: '阶段口诀', icon: Brain, time: '30分钟', route: '/learn/history/formulas' },
  { id: 's5', round: 2, name: '知识点学习', icon: BookOpen, time: '90分钟', route: '/learn/history/knowledge' },
  { id: 's6', round: 2, name: '历史卡牌', icon: Brain, time: '每日20分钟', route: '/learn/history/cards' },
  { id: 's7', round: 2, name: '对比表', icon: Target, time: '60分钟', route: '/learn/history/compare' },
  { id: 's8', round: 2, name: '易混辨析', icon: Brain, time: '45分钟', route: '/learn/history/confusions' },
  { id: 's9', round: 3, name: '辽宁考情', icon: Target, time: '30分钟', route: '/learn/history/liaoning' },
  { id: 's10', round: 3, name: '综合练习', icon: FileText, time: '60分钟', route: '/learn/history/practice' },
  { id: 's11', round: 3, name: '材料分析', icon: Target, time: '45分钟', route: '/learn/history/material-analysis' },
  { id: 's12', round: 3, name: '易错本', icon: Brain, time: '30分钟', route: '/learn/history/confusions?filter=error' },
  { id: 's13', round: 4, name: '论述大题', icon: FileText, time: '90分钟', route: '/learn/history/essay' },
  { id: 's14', round: 4, name: '制度演变', icon: GitBranch, time: '45分钟', route: '/learn/history/evolution' },
  { id: 's15', round: 4, name: '单元衔接', icon: ArrowRight, time: '30分钟', route: '/learn/history/transition' },
];

const roundNames = ['通读建框架', '精背破细节', '应用对接题', '拔高拿大题'];

export default function LearningPathPage() {
  const [currentUnit, setCurrentUnit] = useState('u1');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showAllRounds, setShowAllRounds] = useState(false);

  const unit = getUnitById(currentUnit);
  // unitSteps 在当前实现中不需要按单元过滤，学习步骤是全局适用的

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const roundProgress = [1, 2, 3, 4].map(round => {
    const roundSteps = learningSteps.filter(s => s.round === round);
    const completed = roundSteps.filter(s => completedSteps.has(s.id)).length;
    return { round, total: roundSteps.length, completed, progress: (completed / roundSteps.length) * 100 };
  });

  const overallProgress = (completedSteps.size / learningSteps.length) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-purple-50/30">
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
              <Zap className="h-6 w-6 text-purple-500" />
              连贯闭环学习路径
            </h1>
            <p className="text-sm text-muted-foreground">
              四轮复习法 · 单元内闭环 → 单元间衔接 → 全书闭环
            </p>
          </div>
        </div>

        {/* 单元选择 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">当前单元：</span>
              <div className="flex flex-wrap gap-2">
                {releasedUnits.map((u) => (
                  <Button
                    key={u.id}
                    variant={currentUnit === u.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentUnit(u.id)}
                  >
                    {u.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 整体进度 */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">整体学习进度</span>
              <span className="text-lg font-bold text-purple-600">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>已完成 {completedSteps.size} / {learningSteps.length} 步骤</span>
              <span>加油！坚持就是胜利！</span>
            </div>
          </CardContent>
        </Card>

        {/* 四轮进度 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {roundProgress.map(({ round, total, completed, progress }) => (
            <Card 
              key={round}
              className={`${progress === 100 ? 'bg-emerald-50 border-emerald-200' : ''}`}
            >
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge className={`${round === 1 ? 'bg-blue-500' : round === 2 ? 'bg-purple-500' : round === 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                    第{round}轮
                  </Badge>
                </div>
                <p className="text-sm font-medium mb-1">{roundNames[round - 1]}</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-lg font-bold">{completed}</span>
                  <span className="text-muted-foreground">/{total}</span>
                </div>
                <Progress value={progress} className="h-1 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 学习步骤列表 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                {unit?.name} · 学习步骤
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAllRounds(!showAllRounds)}
              >
                {showAllRounds ? '收起全部' : '展开全部'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {[1, 2, 3, 4].map((round) => {
              const roundSteps = learningSteps.filter(s => s.round === round);
              const completed = roundSteps.filter(s => completedSteps.has(s.id)).length;
              
              if (!showAllRounds && round > 1) return null;
              
              return (
                <div key={round} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`${round === 1 ? 'bg-blue-500' : round === 2 ? 'bg-purple-500' : round === 3 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                      第{round}轮
                    </Badge>
                    <span className="font-medium">{roundNames[round - 1]}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {completed}/{roundSteps.length} 完成
                    </span>
                  </div>
                  <div className="space-y-2">
                    {roundSteps.map((step) => {
                      const Icon = step.icon;
                      const isCompleted = completedSteps.has(step.id);
                      return (
                        <div
                          key={step.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            isCompleted 
                              ? 'bg-emerald-50 border-emerald-200' 
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <button
                            onClick={() => toggleStep(step.id)}
                            className="flex-shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            ) : (
                              <Circle className="h-6 w-6 text-slate-300 hover:text-slate-400" />
                            )}
                          </button>
                          <Icon className={`h-5 w-5 flex-shrink-0 ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${isCompleted ? 'line-through text-emerald-600' : ''}`}>
                              {step.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{step.time}</p>
                          </div>
                          <Link href={step.route}>
                            <Button variant="ghost" size="sm">
                              前往 <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <p className="text-sm text-center text-purple-700">
            💡 <strong>学习提示：</strong>每个单元按四轮推进：通读建框架 → 精背破细节 → 应用对接题 → 拔高拿大题。
            学完一轮自动解锁下一轮，完成全部四轮即可进入下一单元！
          </p>
        </div>
      </div>
    </div>
  );
}
