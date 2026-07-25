'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, Circle, ArrowRight, BookOpen, Clock, Brain, Target, FileText, GitBranch } from 'lucide-react';
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
  const [currentUnit] = useState('u1');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/history">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">历史学习步骤</h1>
        </div>

        {/* 简单文本列表 */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((round) => {
            const roundSteps = learningSteps.filter(s => s.round === round);
            const completed = roundSteps.filter(s => completedSteps.has(s.id)).length;
            
            return (
              <div key={round} className="space-y-1">
                {/* 轮次标题 */}
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">第{round}轮</Badge>
                  <span className="text-muted-foreground">{roundNames[round - 1]}</span>
                  <span className="text-muted-foreground ml-auto text-xs">
                    {completed}/{roundSteps.length}
                  </span>
                </div>
                
                {/* 步骤列表 */}
                <div className="space-y-1 pl-2">
                  {roundSteps.map((step, index) => {
                    const isCompleted = completedSteps.has(step.id);
                    const stepNum = `${round}.${index + 1}`;
                    
                    return (
                      <div
                        key={step.id}
                        className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="flex-shrink-0"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-slate-300" />
                          )}
                        </button>
                        <span className={`text-xs w-6 ${isCompleted ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {stepNum}
                        </span>
                        <span className={`flex-1 text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {step.name}
                        </span>
                        <Link href={step.route}>
                          <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                            进入
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部提示 */}
        <p className="mt-6 text-xs text-center text-muted-foreground">
          点击圆圈标记完成 · 依次完成四轮学习
        </p>
      </div>
    </div>
  );
}
