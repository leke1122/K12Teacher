'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, Target, CreditCard, Sparkles, CheckCircle, Circle, Loader2,
  ChevronRight, ArrowRight, RotateCcw
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getChapterStats } from '@/lib/geographyKnowledgeService';

// 学习步骤
const LEARNING_STEPS = [
  { 
    step: 1, 
    id: 'knowledge', 
    name: '章节知识点', 
    desc: '核心概念精讲', 
    icon: BookOpen, 
    href: '/learn/geography/knowledge',
    statusText: '通读章节内容'
  },
  { 
    step: 2, 
    id: 'framework', 
    name: '满分框架', 
    desc: '知识体系图谱', 
    icon: Target, 
    href: '/learn/geography/framework',
    statusText: '梳理知识脉络'
  },
  { 
    step: 3, 
    id: 'cards', 
    name: '记忆卡牌', 
    desc: '巩固核心概念', 
    icon: CreditCard, 
    href: '/learn/geography/cards',
    statusText: '强化记忆效果'
  },
  { 
    step: 4, 
    id: 'practice', 
    name: 'AI练习', 
    desc: '检验学习效果', 
    icon: Sparkles, 
    href: '/learn/geography/practice',
    statusText: '巩固与应用'
  },
];

interface LearningPathProps {
  chapterId: string;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

export function LearningPath({ chapterId, currentStep = 0, onStepChange }: LearningPathProps) {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [learnedCount, setLearnedCount] = useState(0);
  const [progressKey] = useState(`geography_progress_${chapterId}`);
  
  // 加载进度
  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getChapterStats();
        setStats(data);
        
        // 从 localStorage 读取已学记录
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          setLearnedCount(parsed.learnedCount || 0);
        }
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [chapterId, progressKey]);
  
  // 计算总知识点数
  const totalPoints = stats[chapterId] || 39; // 默认第一章 39 条
  const progressPercent = totalPoints > 0 ? Math.round((learnedCount / totalPoints) * 100) : 0;
  
  // 标记已学
  const handleMarkLearned = (stepIndex: number) => {
    const newCount = Math.min(learnedCount + 1, totalPoints);
    setLearnedCount(newCount);
    localStorage.setItem(progressKey, JSON.stringify({
      learnedCount: newCount,
      lastUpdated: new Date().toISOString()
    }));
    onStepChange?.(stepIndex);
  };
  
  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500 mr-2" />
          <span className="text-sm text-muted-foreground">加载进度...</span>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
      <CardContent className="p-4">
        {/* 标题和进度 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">
              🌍
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">地理学习路径</h3>
              <p className="text-xs text-muted-foreground">
                当前章节：{chapterId === 'ch1' ? '第一章 宇宙中的地球' : '第二章 地球上的大气'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
            {learnedCount}/{totalPoints} 已学
          </Badge>
        </div>
        
        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>学习进度</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-emerald-100" />
        </div>
        
        {/* 步骤流程 */}
        <div className="flex items-center justify-between gap-2">
          {LEARNING_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => router.push(`${step.href}/${chapterId}`)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-white shadow-lg scale-105' 
                      : isCompleted 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                        : 'bg-white text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-xs font-medium whitespace-nowrap">{step.name}</span>
                </button>
                
                {idx < LEARNING_STEPS.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-slate-300 mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// 快捷功能入口
const QUICK_ACTIONS = [
  { name: '知识点', icon: BookOpen, href: '/learn/geography/knowledge', color: 'blue' },
  { name: '框架图谱', icon: Target, href: '/learn/geography/framework', color: 'amber' },
  { name: '记忆卡牌', icon: CreditCard, href: '/learn/geography/cards', color: 'purple' },
  { name: 'AI练习', icon: Sparkles, href: '/learn/geography/practice', color: 'emerald' },
];

interface QuickActionsProps {
  chapterId: string;
}

export function QuickActions({ chapterId }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        const colorMap: Record<string, string> = {
          blue: 'bg-blue-100 text-blue-600 border-blue-200',
          amber: 'bg-amber-100 text-amber-600 border-amber-200',
          purple: 'bg-purple-100 text-purple-600 border-purple-200',
          emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
        };
        
        return (
          <Link key={action.name} href={`${action.href}/${chapterId}`}>
            <button className={`w-full flex flex-col items-center gap-1.5 p-3 rounded-lg border ${colorMap[action.color]} hover:opacity-80 transition-opacity`}>
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.name}</span>
            </button>
          </Link>
        );
      })}
    </div>
  );
}

// 章节导航
interface ChapterNavProps {
  currentChapter: string;
  chapters: { id: string; name: string }[];
  onChapterChange?: (id: string) => void;
}

export function ChapterNav({ currentChapter, chapters, onChapterChange }: ChapterNavProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
      <span className="text-sm text-muted-foreground shrink-0">切换章节：</span>
      <div className="flex gap-2">
        {chapters.map((ch) => (
          <Button
            key={ch.id}
            variant={currentChapter === ch.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChapterChange?.(ch.id)}
            className={currentChapter === ch.id ? 'bg-emerald-600' : ''}
          >
            {ch.id === 'ch1' ? '🌌' : '🌫️'} {ch.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
