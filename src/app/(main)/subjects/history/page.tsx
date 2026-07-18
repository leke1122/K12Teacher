'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, ArrowRight, Lock,
  Clock, Layers, Link2, GitCompare, Brain, FileText, MapPin,
  GitFork, BookMarked, Target, Zap, TrendingUp, FileQuestion,
  BarChart3, Brain as BrainIcon
} from 'lucide-react';
import Link from 'next/link';
import { historyBooks } from '@/data/history/books';
import { releasedUnits } from '@/data/history/units';
import { Suspense } from 'react';

function HistorySubjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeBookId, setActiveBookId] = useState(() => {
    const bookParam = searchParams.get('book');
    return bookParam || 'outline-upper';
  });
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const currentBook = historyBooks.find(b => b.id === activeBookId);
  const bookUnits = releasedUnits.filter(u => u.bookId === activeBookId);

  const textbookFeatures = [
    { icon: BookOpen, name: '教材还原学习', desc: '上传PDF教材，AI智能还原课本内容', href: '/learn/history/textbook', color: 'blue' },
  ];

  const lessonFeatures = [
    { icon: BookMarked, name: '单元总览', desc: '知识结构框架图', href: '/learn/history/overview', color: 'indigo' },
    { icon: Clock, name: '时间轴', desc: '纵向梳理历史脉络', href: '/learn/history/timeline/u1', color: 'amber' },
    { icon: Link2, name: '因果链', desc: '事件逻辑关系分析', href: '/learn/history/causal-chain', color: 'purple' },
    { icon: Brain, name: '知识点学习', desc: '精读细节掌握考点', href: '/learn/history/knowledge/u1', color: 'pink' },
    { icon: GitCompare, name: '对比表', desc: '18个必背对比表', href: '/learn/history/compare', color: 'orange' },
    { icon: Layers, name: '历史卡牌', desc: '间隔重复记忆', href: '/learn/history/cards', color: 'cyan' },
    { icon: SparklesIcon, name: '阶段口诀', desc: '特征口诀背诵', href: '/learn/history/formulas', color: 'violet' },
  ];

  const reviewFeatures = [
    { icon: Clock, name: '时间轴', desc: '全局时间脉络', href: '/learn/history/timeline/u1', color: 'amber' },
    { icon: GitFork, name: '因果链', desc: '因果关系图谱', href: '/learn/history/causal-chain', color: 'purple' },
    { icon: Layers, name: '历史卡牌', desc: '翻卡记忆', href: '/learn/history/cards', color: 'blue' },
    { icon: BrainIcon, name: '易混辨析', desc: '24组易混辨析', href: '/learn/history/confusions', color: 'red' },
    { icon: Zap, name: '制度演变', desc: '4条制度演变线', href: '/learn/history/evolution', color: 'green' },
    { icon: FileQuestion, name: '综合练习', desc: '选择题实战', href: '/learn/history/practice', color: 'emerald' },
  ];

  const examFeatures = [
    { icon: BarChart3, name: '辽宁考情', desc: '真题+趋势分析', href: '/learn/history/liaoning', color: 'red' },
    { icon: FileText, name: '论述大题', desc: '8道大题训练', href: '/learn/history/essay', color: 'indigo' },
    { icon: Target, name: '材料分析', desc: '新材料情境', href: '/learn/history/material-analysis', color: 'orange' },
    { icon: MapPin, name: '辽宁本土', desc: '红山文化等', href: '/learn/history/liaoning?tab=local', color: 'purple' },
    { icon: GitCompare, name: '易错本', desc: '个人易错归集', href: '/learn/history/confusions?filter=error', color: 'pink' },
    { icon: TrendingUp, name: '学习路径', desc: '连贯闭环学习', href: '/learn/history/learning-path', color: 'cyan' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📜 历史学习中心
          </h1>
          <p className="text-muted-foreground">辽宁省高考历史 · 中外历史纲要上册</p>
        </div>

        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">📖 教材切换</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {historyBooks.map((book) => {
                const isActive = book.id === activeBookId;
                const isReleased = book.status === 'released';
                return (
                  <Button
                    key={book.id}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    disabled={!isReleased}
                    onClick={() => {
                      setActiveBookId(book.id);
                      router.push(`/subjects/history?book=${book.id}`);
                    }}
                    className={`${isReleased ? '' : 'opacity-50 cursor-not-allowed'}`}
                    style={isActive ? { backgroundColor: book.color } : {}}
                  >
                    {book.shortName}
                    {!isReleased && <Lock className="h-3 w-3 ml-1" />}
                  </Button>
                );
              })}
            </div>
            {currentBook && (
              <p className="text-sm text-muted-foreground mt-2">
                {currentBook.name} · {currentBook.grade} · {currentBook.publisher}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FeatureSection
            title="📕 教材还原学习"
            subtitle="PDF教材智能学习"
            icon={BookOpen}
            color="blue"
            features={textbookFeatures}
            expanded={expandedSection === 'textbook'}
            onToggle={() => setExpandedSection(expandedSection === 'textbook' ? null : 'textbook')}
          />
          <FeatureSection
            title="📚 按课学习"
            subtitle="单元细粒度精读"
            icon={Target}
            color="indigo"
            features={lessonFeatures}
            expanded={expandedSection === 'lesson'}
            onToggle={() => setExpandedSection(expandedSection === 'lesson' ? null : 'lesson')}
            units={bookUnits}
          />
          <FeatureSection
            title="🔥 全局复习"
            subtitle="跨单元综合复习"
            icon={TrendingUp}
            color="amber"
            features={reviewFeatures}
            expanded={expandedSection === 'review'}
            onToggle={() => setExpandedSection(expandedSection === 'review' ? null : 'review')}
          />
          <FeatureSection
            title="🎯 辽宁高考专版"
            subtitle="针对性备考训练"
            icon={Target}
            color="red"
            features={examFeatures}
            expanded={expandedSection === 'exam'}
            onToggle={() => setExpandedSection(expandedSection === 'exam' ? null : 'exam')}
          />
        </div>

        <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-800">🚀 连贯闭环学习路径</h3>
                  <p className="text-sm text-purple-600">单元内闭环 → 单元间衔接 → 跨单元复习 → 全书闭环</p>
                </div>
              </div>
              <Button 
                className="bg-purple-500 hover:bg-purple-600"
                onClick={() => router.push('/learn/history/learning-path')}
              >
                开始学习 <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <span>📊 第一二三单元已发布</span>
          <span>📝 18个对比表</span>
          <span>🧠 24组易混辨析</span>
          <span>📖 27道辽宁真题</span>
          <span>✍️ 8道论述大题</span>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.66 5.66-5.66 1.912 5.66-5.66L12 3z"/>
      <path d="M19 13.913 16.34 16.34l-2.66 2.574-2.574-2.66L16.34 16.34z"/>
      <path d="M5 13.913 2 16.34l2.66 2.574 2.574-2.66L5 16.34z"/>
      <path d="m12 21-1.912 5.66 5.66-5.66 1.912 5.66-5.66L12 21z"/>
    </svg>
  );
}

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  features: { icon: any; name: string; desc: string; href: string; color: string }[];
  expanded: boolean;
  onToggle: () => void;
  units?: any[];
}

function FeatureSection({ title, subtitle, icon: Icon, color, features, expanded, onToggle, units }: FeatureSectionProps) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50',
    indigo: 'border-indigo-200 bg-indigo-50',
    amber: 'border-amber-200 bg-amber-50',
    red: 'border-red-200 bg-red-50',
    purple: 'border-purple-200 bg-purple-50',
    green: 'border-green-200 bg-green-50',
  };

  const iconColorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  };

  return (
    <Card className={`border-2 ${colorMap[color]} transition-all`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${iconColorMap[color]} flex items-center justify-center text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            {expanded ? '收起' : '展开'}
            <ArrowRight className={`h-4 w-4 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {expanded ? (
          <div className="space-y-3">
            {units && units.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">选择单元：</p>
                <div className="flex flex-wrap gap-1">
                  {units.map((unit) => (
                    <Badge key={unit.id} variant="outline" className="cursor-pointer hover:bg-white">
                      {unit.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {features.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white hover:bg-slate-100 transition-colors border border-slate-200"
                  >
                    <FeatureIcon className={`h-4 w-4 text-${feature.color}-500`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{feature.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{feature.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {features.slice(0, 4).map((feature) => {
              const FeatureIcon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <FeatureIcon className="h-3 w-3" />
                  <span className="text-xs">{feature.name}</span>
                </Link>
              );
            })}
            {features.length > 4 && (
              <Button variant="ghost" size="sm" onClick={onToggle} className="text-xs">
                +{features.length - 4} 更多
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function HistorySubjectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">加载中...</div>}>
      <HistorySubjectContent />
    </Suspense>
  );
}
