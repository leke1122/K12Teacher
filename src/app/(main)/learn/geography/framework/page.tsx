'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, ArrowRight, Trophy, Target, BookOpen, Map, Brain,
  CheckCircle2, Circle, ChevronDown, ChevronRight, Star, Zap,
  GraduationCap, Lightbulb, AlertTriangle, Globe, Compass, Sparkles
} from 'lucide-react';
import {
  KNOWLEDGE_FRAMEWORK,
  MODULE_1_NATURAL_GEOGRAPHY,
  MODULE_2_HUMAN_GEOGRAPHY,
  MODULE_3_REGIONAL_GEOGRAPHY,
  MODULE_4_ENVIRONMENTAL_SECURITY,
  LIAONING_SPECIAL_CONTENT,
  type Module,
  type Topic,
  type KnowledgePoint
} from '@/data/geography/framework/frameworkData';

const MODULES = [MODULE_1_NATURAL_GEOGRAPHY, MODULE_2_HUMAN_GEOGRAPHY, MODULE_3_REGIONAL_GEOGRAPHY, MODULE_4_ENVIRONMENTAL_SECURITY];

const FREQUENCY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200'
};

const FREQUENCY_LABELS = {
  high: '⭐ 高频',
  medium: '⭐⭐ 中频',
  low: '⭐ 低频'
};

function FrameworkOverviewContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [learningProgress, setLearningProgress] = useState<Record<string, boolean>>({});

  const totalTopics = MODULES.reduce((acc, m) => acc + m.topics.length, 0);
  const completedTopics = Object.keys(learningProgress).length;
  const progressPercent = Math.round((completedTopics / totalTopics) * 100);

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const markAsLearned = (topicId: string) => {
    setLearningProgress(prev => ({ ...prev, [topicId]: true }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/geography')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="h-7 w-7 text-amber-500" />
              🏆 高分知识框架
            </h1>
            <p className="text-sm text-muted-foreground">2026辽宁高考 · 满分知识体系 · 完整闭环学习</p>
          </div>
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
            <Star className="h-3 w-3 mr-1" />
            完整版
          </Badge>
        </div>

        {/* 学习进度 */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <span className="font-semibold">学习进度</span>
              </div>
              <span className="text-sm">{completedTopics}/{totalTopics} 个专题</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-white/20 [&>div]:bg-white" />
            <p className="text-xs mt-2 text-white/80">
              {progressPercent === 100 ? '🎉 恭喜完成全部学习！' : 
               progressPercent >= 50 ? '💪 已完成一半，继续加油！' : 
               '📚 开始你的满分之路吧！'}
            </p>
          </CardContent>
        </Card>

        {/* Tab切换 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview" className="text-xs gap-1">
              <Target className="h-4 w-4" />
              框架总览
            </TabsTrigger>
            <TabsTrigger value="modules" className="text-xs gap-1">
              <BookOpen className="h-4 w-4" />
              专题学习
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs gap-1" onClick={() => router.push('/learn/geography/framework/templates')}>
              <Brain className="h-4 w-4" />
              答题模板
            </TabsTrigger>
            <TabsTrigger value="liaoning" className="text-xs gap-1">
              <Map className="h-4 w-4" />
              辽宁专项
            </TabsTrigger>
          </TabsList>

          {/* 框架总览 Tab */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* 模块总览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULES.map((module, idx) => (
                <Card 
                  key={module.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    expandedModule === module.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                  onClick={() => toggleModule(module.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          idx === 0 ? 'bg-blue-500' : 
                          idx === 1 ? 'bg-emerald-500' : 
                          idx === 2 ? 'bg-amber-500' : 'bg-purple-500'
                        }`}>
                          {idx + 1}
                        </span>
                        {module.name}
                      </CardTitle>
                      {expandedModule === module.id ? 
                        <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      }
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {module.score}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {module.topics.length}个专题
                      </Badge>
                      {module.topics.some(t => t.isLiaoningFeature) && (
                        <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
                          辽宁常考
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>
                    
                    {/* 展开显示专题列表 */}
                    {expandedModule === module.id && (
                      <div className="mt-4 space-y-2">
                        {module.topics.map(topic => (
                          <div 
                            key={topic.id}
                            className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/learn/geography/framework/${topic.id}`);
                            }}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              topic.frequency === 'high' ? 'bg-red-500' :
                              topic.frequency === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                            <span className="flex-1 text-sm">{topic.name}</span>
                            <Badge className={`text-xs ${FREQUENCY_COLORS[topic.frequency]}`}>
                              {FREQUENCY_LABELS[topic.frequency]}
                            </Badge>
                            {topic.isLiaoningFeature && (
                              <Badge className="text-xs bg-red-100 text-red-700">辽宁</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 学习路径提示 */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">💡 学习建议</h3>
                    <div className="text-sm text-amber-700 space-y-1">
                      <p>1. <strong>先模块一（自然地理）</strong>：这是高考重点，约占48分，优先掌握</p>
                      <p>2. <strong>再模块二（人文地理）</strong>：约52分，与自然地理同等重要</p>
                      <p>3. <strong>模块三（区域地理）</strong>：综合应用，结合地图学习效果更好</p>
                      <p>4. <strong>模块四（资源环境）</strong>：辽宁卷特色内容，需要专门记忆</p>
                      <p className="mt-2 text-amber-800">
                        ⭐ 建议配合 <Button variant="link" className="h-auto p-0 text-amber-700 underline" onClick={() => router.push('/learn/geography/map')}>
                          交互地图
                        </Button> 一起学习，空间认知更深刻！
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 专题学习 Tab */}
          <TabsContent value="modules" className="space-y-4 mt-4">
            {MODULES.map((module, mIdx) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        mIdx === 0 ? 'bg-blue-500' : 
                        mIdx === 1 ? 'bg-emerald-500' : 
                        mIdx === 2 ? 'bg-amber-500' : 'bg-purple-500'
                      }`}>
                        {mIdx + 1}
                      </span>
                      {module.name}
                    </CardTitle>
                    <Badge variant="outline">{module.score}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {module.topics.map((topic, tIdx) => (
                    <div 
                      key={topic.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        expandedTopic === topic.id 
                          ? 'border-emerald-400 bg-emerald-50' 
                          : 'border-slate-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => toggleTopic(topic.id)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          learningProgress[topic.id] 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {learningProgress[topic.id] ? <CheckCircle2 className="h-5 w-5" /> : tIdx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{topic.name}</span>
                            <Badge className={`text-xs ${FREQUENCY_COLORS[topic.frequency]}`}>
                              {FREQUENCY_LABELS[topic.frequency]}
                            </Badge>
                            {topic.isLiaoningFeature && (
                              <Badge className="text-xs bg-red-100 text-red-700 border-red-200">辽宁</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {topic.points.length}个考点 · {topic.terms.length}个术语
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!learningProgress[topic.id] && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsLearned(topic.id);
                              }}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              标记已学
                            </Button>
                          )}
                          {expandedTopic === topic.id ? 
                            <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          }
                        </div>
                      </div>

                      {/* 展开的考点列表 */}
                      {expandedTopic === topic.id && (
                        <div className="mt-4 pl-11 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {topic.points.map(point => (
                              <button
                                key={point.id}
                                onClick={() => router.push(`/learn/geography/framework/${topic.id}`)}
                                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-left transition-all"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Circle className="h-3 w-3 text-emerald-500" />
                                  <span className="text-sm font-medium">{point.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {point.concept.slice(0, 60)}...
                                </p>
                              </button>
                            ))}
                          </div>
                          
                          {/* 专题术语 */}
                          <div className="p-3 rounded-lg bg-slate-50">
                            <p className="text-xs font-medium text-slate-600 mb-2">📝 专题术语</p>
                            <div className="flex flex-wrap gap-1">
                              {topic.terms.slice(0, 10).map((term, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-white">
                                  {term}
                                </Badge>
                              ))}
                              {topic.terms.length > 10 && (
                                <Badge variant="outline" className="text-xs bg-slate-100">
                                  +{topic.terms.length - 10}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* 开始学习按钮 */}
                          <Button 
                            className="w-full mt-2"
                            onClick={() => router.push(`/learn/geography/framework/${topic.id}`)}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            开始学习 {topic.name}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 辽宁专项 Tab */}
          <TabsContent value="liaoning" className="space-y-4 mt-4">
            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Map className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">🇨🇳 辽宁本土特色地理</h3>
                    <p className="text-sm text-red-700">
                      辽宁是高考必考区域！以下内容是辽宁卷特色考点，需要专门记忆和理解。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LIAONING_SPECIAL_CONTENT.map(item => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {item.category === 'natural' && <Globe className="h-5 w-5 text-blue-500" />}
                      {item.category === 'human' && <Compass className="h-5 w-5 text-emerald-500" />}
                      {item.category === 'ecology' && <Sparkles className="h-5 w-5 text-amber-500" />}
                      {item.category === 'energy' && <Zap className="h-5 w-5 text-purple-500" />}
                      {item.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {item.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => {
                        // 跳转到相关专题
                        const relatedTopic = MODULES.flatMap(m => m.topics).find(t => 
                          item.relatedTopics.includes(t.id)
                        );
                        if (relatedTopic) {
                          router.push(`/learn/geography/framework/${relatedTopic.id}`);
                        }
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      关联学习
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 辽宁高考提示 */}
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">⚠️ 辽宁卷备考提示</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700">
                      <li>辽宁卷试题情境多以东北地区或辽宁省为背景</li>
                      <li>要熟悉辽宁的地形、气候、资源、产业等特征</li>
                      <li>辽中南工业基地、资源枯竭型城市转型是高频考点</li>
                      <li>辽西北荒漠化、辽河治理等生态议题经常出现</li>
                      <li>建议结合地图学习，空间定位要准确</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 底部快捷入口 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => router.push('/learn/geography/map')}
          >
            <Map className="h-6 w-6 text-emerald-500" />
            <span className="text-sm">交互地图</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => router.push('/learn/geography/framework/templates')}
          >
            <Brain className="h-6 w-6 text-blue-500" />
            <span className="text-sm">答题模板</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => router.push('/learn/geography/framework/glossary')}
          >
            <BookOpen className="h-6 w-6 text-amber-500" />
            <span className="text-sm">术语速查</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4 flex-col gap-2"
            onClick={() => router.push('/learn/geography/practice')}
          >
            <Target className="h-6 w-6 text-red-500" />
            <span className="text-sm">综合练习</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FrameworkOverviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载知识框架...</p>
        </div>
      </div>
    }>
      <FrameworkOverviewContent />
    </Suspense>
  );
}
