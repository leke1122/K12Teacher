'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, ArrowRight, Trophy, Star, Clock, BookOpen,
  Target, Zap, CheckCircle2, MapPin, Lightbulb, BarChart3,
  GitCompare, Scroll, Brain, FileText, Eye
} from 'lucide-react';
import {
  HISTORY_ERAS,
  LIAONING_SIX_PLACES
} from '@/data/history/framework/historyData';

export default function HistoryFrameworkPage() {
  const router = useRouter();
  const [expandedEra, setExpandedEra] = useState<string | null>(null);
  const [completedEras, setCompletedEras] = useState<Set<string>>(new Set());

  const totalEras = HISTORY_ERAS.length;
  const completedCount = completedEras.size;
  const progressPercent = Math.round((completedCount / totalEras) * 100);

  const markAsComplete = (eraId: string) => {
    setCompletedEras(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eraId)) {
        newSet.delete(eraId);
      } else {
        newSet.add(eraId);
      }
      return newSet;
    });
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/history')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="h-7 w-7 text-amber-500" />
              🏆 高分知识框架
            </h1>
            <p className="text-sm text-muted-foreground">2026辽宁高考 · 中外历史纲要通史时间轴 · 满分知识体系</p>
          </div>
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
            <Star className="h-3 w-3 mr-1" />
            完整版
          </Badge>
        </div>

        {/* 学习进度 */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="font-semibold">学习进度</span>
              </div>
              <span className="text-sm">{completedCount}/{totalEras} 个时期</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-white/20 [&>div]:bg-white" />
            <p className="text-xs mt-2 text-white/80">
              {progressPercent === 100 ? '🎉 恭喜完成全部学习！' : 
               progressPercent >= 50 ? '💪 已完成一半，继续加油！' : 
               '📚 开始你的满分之路吧！'}
            </p>
          </CardContent>
        </Card>

        {/* 快捷工具 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-3 flex-col gap-1"
            onClick={() => router.push('/learn/history/framework/timeline')}
          >
            <Clock className="h-5 w-5 text-blue-500" />
            <span className="text-xs">时间轴速查</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-3 flex-col gap-1"
            onClick={() => router.push('/learn/history/framework/compare')}
          >
            <GitCompare className="h-5 w-5 text-purple-500" />
            <span className="text-xs">同年对比</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-3 flex-col gap-1"
            onClick={() => router.push('/learn/history/framework/templates')}
          >
            <Scroll className="h-5 w-5 text-amber-500" />
            <span className="text-xs">答题模板</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-3 flex-col gap-1"
            onClick={() => router.push('/learn/history/framework/liaoning')}
          >
            <MapPin className="h-5 w-5 text-red-500" />
            <span className="text-xs">辽宁专题</span>
          </Button>
        </div>

        {/* 时期列表 */}
        <div className="space-y-4">
          {HISTORY_ERAS.map((era, index) => {
            const isExpanded = expandedEra === era.id;
            const isCompleted = completedEras.has(era.id);
            
            return (
              <Card key={era.id} className={isCompleted ? 'border-green-300 bg-green-50/30' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          第{index + 1}编
                        </Badge>
                        <Badge className={`text-xs ${getFrequencyColor(era.frequency)}`}>
                          {era.frequency === 'high' ? '高频' : era.frequency === 'medium' ? '中频' : '低频'}
                        </Badge>
                        {era.isLiaoningFeature && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                            辽宁
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">
                        {era.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{era.period}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsComplete(era.id)}
                      className={isCompleted ? 'text-green-500' : ''}
                    >
                      <CheckCircle2 className={`h-5 w-5 ${isCompleted ? 'fill-green-500' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* 时代特征总括 */}
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">时代特征总括</span>
                      <Badge variant="outline" className="text-xs ml-auto">🔑必背</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium text-slate-700">中国：</span>{era.summary.china}</p>
                      <p><span className="font-medium text-slate-700">世界：</span>{era.summary.world}</p>
                      <p><span className="font-medium text-slate-700">中外关系：</span>{era.summary.relation}</p>
                    </div>
                  </div>

                  {/* 展开/收起详情 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setExpandedEra(isExpanded ? null : era.id)}
                  >
                    {isExpanded ? (
                      <>收起详情 <ArrowLeft className="h-4 w-4 ml-1 rotate-90" /></>
                    ) : (
                      <>展开详情 <ArrowRight className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>

                  {/* 详细内容 */}
                  {isExpanded && (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {/* 三线对比预览 */}
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-700">中外三线对比</span>
                          <Badge variant="outline" className="text-xs ml-auto">📊大题素材</Badge>
                        </div>
                        <div className="space-y-2">
                          {era.comparison.slice(0, 3).map((item, i) => (
                            <div key={i} className="text-sm p-2 bg-white rounded">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-slate-700">{item.time}</span>
                                {item.isAnchor && (
                                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">⭐转折</Badge>
                                )}
                              </div>
                              <p className="text-slate-600 line-clamp-2">{item.conclusion}</p>
                            </div>
                          ))}
                          {era.comparison.length > 3 && (
                            <p className="text-xs text-amber-600">+ 还有 {era.comparison.length - 3} 条对比...</p>
                          )}
                        </div>
                      </div>

                      {/* 核心结论预览 */}
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">核心对比结论</span>
                          <Badge variant="outline" className="text-xs ml-auto">💡大题金句</Badge>
                        </div>
                        <div className="space-y-1">
                          {era.coreConclusions.slice(0, 2).map((conclusion, i) => (
                            <p key={i} className="text-sm text-slate-600">• {conclusion.slice(0, 80)}...</p>
                          ))}
                        </div>
                      </div>

                      {/* 开始学习按钮 */}
                      <Button
                        className="w-full"
                        onClick={() => router.push(`/learn/history/framework/${era.id}`)}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        开始学习 {era.name}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 辽宁六地专题 */}
        <Card className="border-red-200 bg-gradient-to-br from-red-50 via-orange-50/30 to-slate-50 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-red-500 via-red-600 to-orange-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">辽宁"六地"红色文化</h3>
                  <p className="text-white/80 text-sm">辽宁卷第18题高频素材</p>
                </div>
              </div>
              <Badge className="bg-white/20 backdrop-blur text-white border-0">
                🏠必背
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {LIAONING_SIX_PLACES.map((place, i) => {
                const colors = [
                  'from-red-100 to-red-50 border-red-300 hover:border-red-500 hover:shadow-red-100',
                  'from-amber-100 to-amber-50 border-amber-300 hover:border-amber-500 hover:shadow-amber-100',
                  'from-blue-100 to-blue-50 border-blue-300 hover:border-blue-500 hover:shadow-blue-100',
                  'from-green-100 to-green-50 border-green-300 hover:border-green-500 hover:shadow-green-100',
                  'from-purple-100 to-purple-50 border-purple-300 hover:border-purple-500 hover:shadow-purple-100',
                  'from-pink-100 to-pink-50 border-pink-300 hover:border-pink-500 hover:shadow-pink-100',
                ];
                const textColors = [
                  'text-red-700',
                  'text-amber-700',
                  'text-blue-700',
                  'text-green-700',
                  'text-purple-700',
                  'text-pink-700',
                ];
                return (
                  <button
                    key={place.id}
                    className={`p-3 rounded-xl bg-gradient-to-br ${colors[i]} border-2 transition-all text-left group hover:shadow-lg`}
                    onClick={() => router.push('/learn/history/framework/liaoning')}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`w-6 h-6 rounded-full ${textColors[i].replace('text-', 'bg-')} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className={`font-semibold text-sm leading-tight ${textColors[i]}`}>{place.name}</h4>
                        <p className="text-slate-600 text-xs mt-1 line-clamp-2">{place.examAngle}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <Button
              className="w-full mt-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-md"
              onClick={() => router.push('/learn/history/framework/liaoning')}
            >
              <Eye className="h-4 w-4 mr-2" />
              查看完整辽宁六地专题
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
