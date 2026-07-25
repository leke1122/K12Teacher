'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, ArrowRight, ChevronRight, CheckCircle2, Circle, Brain,
  Lightbulb, AlertTriangle, BookOpen, Sparkles, Map, Search,
  ChevronDown, ChevronUp, MessageCircle, Star, Target, Loader2
} from 'lucide-react';
import {
  KNOWLEDGE_FRAMEWORK,
  type Topic,
  type KnowledgePoint,
  type Module
} from '@/data/geography/framework/frameworkData';

interface TopicLearningPageProps {
  params: { topicId: string };
}

const FREQUENCY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200'
};

const FREQUENCY_LABELS = {
  high: '⭐ 高频考点',
  medium: '⭐⭐ 中频考点',
  low: '⭐ 低频考点'
};

// 找到专题和所属模块
function findTopicAndModule(topicId: string): { topic: Topic; module: Module } | null {
  for (const module of KNOWLEDGE_FRAMEWORK.modules) {
    const topic = module.topics.find(t => t.id === topicId);
    if (topic) {
      return { topic, module };
    }
  }
  return null;
}

function TopicLearningContent({ topicId }: { topicId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPointId = searchParams.get('point');
  
  const topicData = useMemo(() => findTopicAndModule(topicId), [topicId]);
  
  const [activePoint, setActivePoint] = useState<string>(
    initialPointId || (topicData?.topic.points[0]?.id || '')
  );
  const [activeTab, setActiveTab] = useState('concept');
  const [completedPoints, setCompletedPoints] = useState<Set<string>>(new Set());
  const [expandedTraps, setExpandedTraps] = useState<Set<string>>(new Set());
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

  if (!topicData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">专题未找到</h2>
            <p className="text-muted-foreground mb-4">您要学习的专题不存在，请返回重新选择。</p>
            <Button onClick={() => router.push('/learn/geography/framework')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回框架
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { topic, module } = topicData;
  const currentPoint = topic.points.find(p => p.id === activePoint);
  
  const progressPercent = Math.round((completedPoints.size / topic.points.length) * 100);

  const markPointComplete = (pointId: string) => {
    setCompletedPoints(prev => new Set([...prev, pointId]));
  };

  const toggleTrap = (trapId: string) => {
    setExpandedTraps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(trapId)) {
        newSet.delete(trapId);
      } else {
        newSet.add(trapId);
      }
      return newSet;
    });
  };

  // AI问答功能（模拟，实际可通过API调用LLM）
  const handleAiQuestion = async () => {
    if (!aiQuestion.trim() || !currentPoint) return;
    
    setIsAiThinking(true);
    setAiAnswer('');
    
    // 模拟AI思考过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 根据问题类型生成回答
    let answer = '';
    const q = aiQuestion.toLowerCase();
    
    if (q.includes('概念') || q.includes('是什么') || q.includes('定义')) {
      answer = `【${currentPoint.name}的概念】

${currentPoint.concept}

💡 记忆要点：可以用一个简短的句子概括这个概念的核心。`;
    } else if (q.includes('原因') || q.includes('为什么') || q.includes('因果')) {
      answer = `【${currentPoint.name}的成因分析】

${currentPoint.causality}

🔗 记忆技巧：用"因为...所以..."的句式串联因果关系。`;
    } else if (q.includes('考') || q.includes('题型') || q.includes('怎么考')) {
      answer = `【${currentPoint.name}的考试要点】

${currentPoint.examPatterns}

📝 得分关键词：${currentPoint.terms.slice(0, 5).join('、')}等`;
    } else if (q.includes('易错') || q.includes('陷阱') || q.includes('注意')) {
      answer = `【${currentPoint.name}的易错提醒】

${currentPoint.traps.map((t, i) => `${i + 1}. ${t}`).join('\n')}

⚠️ 重要提示：考试时遇到这类题目一定要仔细审题！`;
    } else if (q.includes('例子') || q.includes('示例') || q.includes('例子')) {
      answer = `【${currentPoint.name}的典型示例】

${currentPoint.examPatterns.includes('辽宁') ? '辽宁卷典型情境：' + currentPoint.examPatterns.split('辽宁卷')[1]?.split('。')[0] : '结合知识点理解实际应用场景。'}

📍 建议：把知识点与日常生活联系起来理解。`;
    } else {
      answer = `【关于${currentPoint.name}】

这是一个重要的考点，建议您：
1. 先理解核心概念
2. 掌握因果关系
3. 记住考试要点
4. 注意易错陷阱

💡 您可以这样问我：
- "这个考点考什么？"
- "为什么会出现这种现象？"
- "有哪些易错点？"
- "举个例题"`;
    }
    
    setAiAnswer(answer);
    setIsAiThinking(false);
  };

  const renderDataTable = (data: any) => {
    if (!data || !data.headers || !data.rows) return null;
    
    return (
      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              {data.headers.map((header: string, i: number) => (
                <th key={i} className="border border-slate-300 dark:border-slate-600 px-3 py-2 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row: string[], i: number) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                {row.map((cell: string, j: number) => (
                  <td key={j} className="border border-slate-200 dark:border-slate-700 px-3 py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/geography')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {module.name}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <h1 className="text-xl font-bold text-slate-800">{topic.name}</h1>
              <Badge className={FREQUENCY_COLORS[topic.frequency]}>
                {FREQUENCY_LABELS[topic.frequency]}
              </Badge>
              {topic.isLiaoningFeature && (
                <Badge className="bg-red-100 text-red-700">辽宁常考</Badge>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/learn/geography/map')}
            className="gap-1"
          >
            <Map className="h-4 w-4" />
            地图
          </Button>
        </div>

        {/* 学习进度条 */}
        <Card className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">专题学习进度</span>
              <span className="text-sm">{completedPoints.size}/{topic.points.length} 考点完成</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-white/20 [&>div]:bg-white" />
          </CardContent>
        </Card>

        {/* 主体布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* 左侧：考点导航 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  考点列表
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topic.points.map((point, idx) => (
                  <button
                    key={point.id}
                    onClick={() => setActivePoint(point.id)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      activePoint === point.id
                        ? 'border-emerald-400 bg-emerald-50'
                        : completedPoints.has(point.id)
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        completedPoints.has(point.id)
                          ? 'bg-emerald-500 text-white'
                          : activePoint === point.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {completedPoints.has(point.id) ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span className={`text-sm font-medium flex-1 ${
                        activePoint === point.id ? 'text-emerald-700' : ''
                      }`}>
                        {point.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 ml-8">
                      <Badge className={`text-xs ${FREQUENCY_COLORS[point.frequency]}`}>
                        {FREQUENCY_LABELS[point.frequency].replace('考点', '')}
                      </Badge>
                      {point.isLiaoningFeature && (
                        <Badge className="text-xs bg-red-100 text-red-700">辽宁</Badge>
                      )}
                    </div>
                  </button>
                ))}

                {/* 专题术语快捷查看 */}
                <div className="pt-4 border-t">
                  <p className="text-xs font-medium text-slate-600 mb-2">📝 专题术语</p>
                  <div className="flex flex-wrap gap-1">
                    {topic.terms.slice(0, 12).map((term, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-white">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：考点学习内容 */}
          <div className="lg:col-span-3 space-y-4">
            {currentPoint && (
              <>
                {/* 考点标题 */}
                <Card className="border-emerald-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-6 w-6 text-emerald-500" />
                        {currentPoint.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={FREQUENCY_COLORS[currentPoint.frequency]}>
                          {FREQUENCY_LABELS[currentPoint.frequency]}
                        </Badge>
                        {!completedPoints.has(currentPoint.id) && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markPointComplete(currentPoint.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            标记已学
                          </Button>
                        )}
                        {completedPoints.has(currentPoint.id) && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            已完成
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* 学习内容Tab */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="concept" className="text-xs gap-1">
                      <BookOpen className="h-4 w-4" />
                      概念
                    </TabsTrigger>
                    <TabsTrigger value="data" className="text-xs gap-1">
                      <Target className="h-4 w-4" />
                      数据
                    </TabsTrigger>
                    <TabsTrigger value="causality" className="text-xs gap-1">
                      <Lightbulb className="h-4 w-4" />
                      因果
                    </TabsTrigger>
                    <TabsTrigger value="exam" className="text-xs gap-1">
                      <Star className="h-4 w-4" />
                      考点
                    </TabsTrigger>
                    <TabsTrigger value="traps" className="text-xs gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      易错
                    </TabsTrigger>
                  </TabsList>

                  {/* 概念 */}
                  <TabsContent value="concept" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-amber-500" />
                          是什么（核心概念）
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {currentPoint.concept}
                          </p>
                        </div>
                        
                        {currentPoint.additionalNotes && (
                          <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-emerald-800 font-medium">💡 记忆要点</p>
                            <p className="text-slate-700 mt-1">{currentPoint.additionalNotes}</p>
                          </div>
                        )}

                        {/* 术语黑话 */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-700 mb-2">📝 关联术语</p>
                          <div className="flex flex-wrap gap-2">
                            {currentPoint.terms.map((term, i) => (
                              <Badge key={i} variant="outline" className="bg-white">
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {!completedPoints.has(currentPoint.id) && (
                            <Button 
                              onClick={() => markPointComplete(currentPoint.id)}
                              className="flex-1"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              已掌握概念
                            </Button>
                          )}
                          <Button 
                            variant="outline"
                            onClick={() => setActiveTab('data')}
                          >
                            下一步：看数据
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 数据 */}
                  <TabsContent value="data" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-500" />
                          关键数据（必记图表）
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {currentPoint.data ? (
                          <>
                            {renderDataTable(currentPoint.data)}
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-blue-800 font-medium">💡 数据记忆技巧</p>
                              <p className="text-slate-700 mt-1">
                                建议先理解数据的逻辑关系，再进行记忆。可以尝试用自己的话复述表格内容。
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            <p>该考点暂无需要记忆的数据表格</p>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          {!completedPoints.has(currentPoint.id) && (
                            <Button 
                              onClick={() => markPointComplete(currentPoint.id)}
                              className="flex-1"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              已掌握数据
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => setActiveTab('causality')}>
                            下一步：学因果
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 因果 */}
                  <TabsContent value="causality" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-purple-500" />
                          为什么（核心因果链）
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {currentPoint.causality}
                          </p>
                        </div>

                        {/* 因果链可视化 */}
                        {currentPoint.causality && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700 mb-2">🔗 因果链分解</p>
                            <div className="flex items-center gap-1 flex-wrap">
                              {currentPoint.causality.split('→').map((step, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <span className="px-2 py-1 bg-white border border-slate-300 rounded text-sm">
                                    {step.trim()}
                                  </span>
                                  {i < currentPoint.causality!.split('→').length - 1 && (
                                    <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex gap-2">
                          {!completedPoints.has(currentPoint.id) && (
                            <Button 
                              onClick={() => markPointComplete(currentPoint.id)}
                              className="flex-1"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              已掌握因果
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => setActiveTab('exam')}>
                            下一步：看考点
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 考点 */}
                  <TabsContent value="exam" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Star className="h-5 w-5 text-amber-500" />
                          怎么考（高频题型）
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                            {currentPoint.examPatterns}
                          </p>
                        </div>

                        {/* 得分关键词 */}
                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-700 mb-2">🎯 得分关键词</p>
                          <div className="flex flex-wrap gap-2">
                            {currentPoint.terms.map((term, i) => (
                              <Badge key={i} className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                {term}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          {!completedPoints.has(currentPoint.id) && (
                            <Button 
                              onClick={() => markPointComplete(currentPoint.id)}
                              className="flex-1"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              已掌握考点
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => setActiveTab('traps')}>
                            下一步：避陷阱
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 易错 */}
                  <TabsContent value="traps" className="mt-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          易错提醒（辽宁卷常见陷阱）
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentPoint.traps.map((trap, idx) => (
                          <div 
                            key={idx}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              expandedTraps.has(`${currentPoint.id}-${idx}`)
                                ? 'bg-red-50 border-red-300'
                                : 'bg-white border-slate-200 hover:border-red-300'
                            }`}
                            onClick={() => toggleTrap(`${currentPoint.id}-${idx}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <span className="font-medium text-slate-800">
                                  {trap.split('：')[0]}
                                </span>
                              </div>
                              {expandedTraps.has(`${currentPoint.id}-${idx}`) ? (
                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            {expandedTraps.has(`${currentPoint.id}-${idx}`) && (
                              <div className="mt-3 ml-7">
                                <p className="text-slate-700">
                                  {trap.split('：').slice(1).join('：')}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="mt-4 flex gap-2">
                          {!completedPoints.has(currentPoint.id) ? (
                            <Button 
                              onClick={() => markPointComplete(currentPoint.id)}
                              className="flex-1"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              我已记住所有陷阱！
                            </Button>
                          ) : (
                            <Button 
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                const nextPoint = topic.points.find((p, i) => 
                                  p.id === currentPoint.id && i < topic.points.length - 1
                                );
                                if (nextPoint) {
                                  setActivePoint(nextPoint.id);
                                  setActiveTab('concept');
                                }
                              }}
                            >
                              {topic.points.indexOf(currentPoint) < topic.points.length - 1 ? (
                                <>
                                  下一个考点
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                              ) : (
                                <>
                                  完成学习
                                  <CheckCircle2 className="h-4 w-4 ml-2" />
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* AI问答助手 */}
                <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-blue-500" />
                        AI学习助手
                      </CardTitle>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowAiChat(!showAiChat)}
                      >
                        {showAiChat ? '收起' : '展开'}
                      </Button>
                    </div>
                  </CardHeader>
                  {showAiChat && (
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="问我任何关于这个考点的问题..."
                          value={aiQuestion}
                          onChange={(e) => setAiQuestion(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiQuestion()}
                          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button 
                          onClick={handleAiQuestion}
                          disabled={!aiQuestion.trim() || isAiThinking}
                        >
                          {isAiThinking ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {isAiThinking && (
                        <div className="p-4 bg-white rounded-lg border">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="animate-pulse">🤖</div>
                            <span>正在思考...</span>
                          </div>
                        </div>
                      )}
                      
                      {aiAnswer && (
                        <div className="p-4 bg-white rounded-lg border whitespace-pre-wrap">
                          {aiAnswer}
                        </div>
                      )}

                      {/* 快捷问题 */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setAiQuestion('这个考点考什么？');
                            handleAiQuestion();
                          }}
                        >
                          考什么？
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setAiQuestion('为什么会出现这种现象？');
                            handleAiQuestion();
                          }}
                        >
                          为什么？
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setAiQuestion('有哪些易错点？');
                            handleAiQuestion();
                          }}
                        >
                          易错点
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setAiQuestion('举个例子帮助我理解');
                            handleAiQuestion();
                          }}
                        >
                          举例
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </>
            )}

            {/* 导航按钮 */}
            <div className="flex gap-2">
              {topic.points.findIndex(p => p.id === activePoint) > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    const idx = topic.points.findIndex(p => p.id === activePoint);
                    setActivePoint(topic.points[idx - 1].id);
                    setActiveTab('concept');
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  上一个考点
                </Button>
              )}
              {topic.points.findIndex(p => p.id === activePoint) < topic.points.length - 1 && (
                <Button 
                  className="flex-1"
                  onClick={() => {
                    const idx = topic.points.findIndex(p => p.id === activePoint);
                    setActivePoint(topic.points[idx + 1].id);
                    setActiveTab('concept');
                  }}
                >
                  下一个考点
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TopicLearningPage({ params }: TopicLearningPageProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载考点内容...</p>
        </div>
      </div>
    }>
      <TopicLearningContent topicId={params.topicId} />
    </Suspense>
  );
}
