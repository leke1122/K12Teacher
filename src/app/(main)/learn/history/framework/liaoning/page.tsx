'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, MapPin, Star, Calendar, Target, BookOpen, FileText, Lightbulb,
  Flag, Shield, Wrench, Heart, ArrowDown, ChevronRight
} from 'lucide-react';
import { LIAONING_SIX_PLACES } from '@/data/history/framework/historyData';

// 六地图标配置
const PLACE_ICONS = [
  { icon: Flag, color: 'from-red-500 to-orange-500', bg: 'bg-red-100', text: 'text-red-600' },
  { icon: Shield, color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-100', text: 'text-amber-600' },
  { icon: Calendar, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-100', text: 'text-blue-600' },
  { icon: Shield, color: 'from-green-500 to-emerald-500', bg: 'bg-green-100', text: 'text-green-600' },
  { icon: Wrench, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-100', text: 'text-purple-600' },
  { icon: Heart, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-100', text: 'text-pink-600' },
];

// 六地时间线
const TIMELINE = [
  { year: '1931', event: '九一八事变', place: '抗日战争起始地' },
  { year: '1948', event: '辽沈战役', place: '解放战争转折地' },
  { year: '1950', event: '抗美援朝', place: '抗美援朝出征地' },
];

export default function LiaoningPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'timeline' | 'detail'>('timeline');

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/learn/history/framework')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              辽宁"六地"红色文化
            </h1>
            <p className="text-white/60 text-sm mt-1">辽宁省委宣传部红色文化标识 · 辽宁卷第18题高频素材</p>
          </div>
        </div>

        {/* 时间轴预览 */}
        <Card className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-slate-700/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="h-5 w-5 text-red-400" />
                <span className="font-medium">历史时间轴</span>
              </div>
              <div className="flex items-center gap-4">
                {TIMELINE.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="text-center">
                      <div className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm font-bold">
                        {item.year}
                      </div>
                      <div className="text-xs text-white/50 mt-1">{item.event}</div>
                    </div>
                    {idx < TIMELINE.length - 1 && (
                      <div className="w-8 h-0.5 bg-gradient-to-r from-red-500/50 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 标签切换 */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('timeline')}
            className={activeTab === 'timeline' 
              ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700' 
              : 'bg-slate-800/50 border-slate-700 text-white/70 hover:bg-slate-700/50'}
          >
            <Target className="h-4 w-4 mr-1" />
            概览
          </Button>
          <Button
            variant={activeTab === 'detail' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('detail')}
            className={activeTab === 'detail' 
              ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700' 
              : 'bg-slate-800/50 border-slate-700 text-white/70 hover:bg-slate-700/50'}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            详解
          </Button>
        </div>

        {activeTab === 'timeline' ? (
          /* 概览模式 - 卡片网格 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LIAONING_SIX_PLACES.map((place, index) => {
              const config = PLACE_ICONS[index];
              const Icon = config.icon;
              
              return (
                <Card 
                  key={place.id} 
                  className="bg-slate-800/60 border-slate-700/50 backdrop-blur hover:bg-slate-800/80 hover:border-slate-600 transition-all cursor-pointer group"
                  onClick={() => setActiveTab('detail')}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs mb-1">
                          {String(index + 1).padStart(2, '0')}
                        </Badge>
                        <CardTitle className="text-base text-white leading-tight">
                          {place.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/50 text-xs line-clamp-2">
                      {place.examAngle}
                    </p>
                    <div className="flex items-center gap-1 mt-3 text-red-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                      <span>查看详情</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* 详解模式 - 垂直时间轴 */
          <div className="space-y-6">
            {LIAONING_SIX_PLACES.map((place, index) => {
              const config = PLACE_ICONS[index];
              const Icon = config.icon;
              const [isExpanded, setIsExpanded] = useState(false);
              
              return (
                <Card 
                  key={place.id} 
                  className="bg-slate-800/60 border-slate-700/50 backdrop-blur overflow-hidden"
                >
                  {/* 卡片头部 */}
                  <div 
                    className="p-5 cursor-pointer hover:bg-slate-700/30 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <div className="flex items-center gap-4">
                      {/* 时间线节点 */}
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-red-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-red-400">{index + 1}</span>
                        </div>
                        {/* 连接线 */}
                        {index < LIAONING_SIX_PLACES.length - 1 && (
                          <div className="absolute left-1/2 top-full w-0.5 h-6 bg-gradient-to-b from-red-500/50 to-transparent -translate-x-1/2" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{place.name}</h3>
                        <p className="text-white/50 text-sm mt-1 line-clamp-2">{place.examAngle}</p>
                      </div>
                      
                      <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <ArrowDown className="h-5 w-5 text-white/50" />
                      </div>
                    </div>
                  </div>
                  
                  {/* 展开内容 */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4">
                      {/* 核心史实 */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="h-4 w-4 text-red-400" />
                          <h4 className="font-semibold text-red-400">核心史实</h4>
                        </div>
                        <p className="text-white/90 leading-relaxed">{place.coreFact}</p>
                      </div>
                      
                      {/* 考查角度 */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="h-4 w-4 text-amber-400" />
                          <h4 className="font-semibold text-amber-400">核心考查角度</h4>
                        </div>
                        <p className="text-white/90">{place.examAngle}</p>
                      </div>
                      
                      {/* 相关知识点 */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <h4 className="font-semibold text-blue-400">关联教材知识点</h4>
                        </div>
                        <p className="text-white/90">{place.relatedKnowledge}</p>
                      </div>
                      
                      {/* 高考考查方式 */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="h-4 w-4 text-purple-400" />
                          <h4 className="font-semibold text-purple-400">高考考查方式</h4>
                        </div>
                        <p className="text-white/90">{place.examMethod}</p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* 六地内在逻辑 */}
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              六地之间的内在逻辑
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 革命时期 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  革命时期 (1931-1949)
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded-lg bg-slate-700/50 border-l-4 border-red-500">
                    <div className="text-white font-medium">九一八事变</div>
                    <div className="text-white/50">十四年抗战起点</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-700/50 border-l-4 border-red-500">
                    <div className="text-white font-medium">《义勇军进行曲》</div>
                    <div className="text-white/50">从战场到民族精神</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-700/50 border-l-4 border-red-500">
                    <div className="text-white font-medium">辽沈战役</div>
                    <div className="text-white/50">解放战争转折点</div>
                  </div>
                </div>
              </div>
              
              {/* 建设时期 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400 font-semibold">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  建设时期 (1950-至今)
                </div>
                <div className="space-y-2 text-sm">
                  <div className="p-3 rounded-lg bg-slate-700/50 border-l-4 border-green-500">
                    <div className="text-white font-medium">抗美援朝出征地</div>
                    <div className="text-white/50">丹东·保家卫国</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-700/50 border-l-4 border-green-500">
                    <div className="text-white font-medium">共和国工业奠基地</div>
                    <div className="text-white/50">鞍山·共和国长子</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-700/50 border-l-4 border-green-500">
                    <div className="text-white font-medium">雷锋精神发祥地</div>
                    <div className="text-white/50">抚顺·精神丰碑</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 底部总结 */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30">
              <p className="text-white text-center font-medium">
                从<span className="text-red-400">抗日战争起始地</span>到<span className="text-green-400">雷锋精神发祥地</span>，
                <br />
                辽宁在中国革命→建设→改革各个时期都发挥着不可替代的作用
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
