'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Search, Clock, Star, MapPin
} from 'lucide-react';
import {
  CHINA_ANCHORS,
  WORLD_ANCHORS
} from '@/data/history/framework/historyData';

export default function TimelinePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'china' | 'world'>('china');

  const anchors = activeTab === 'china' ? CHINA_ANCHORS : WORLD_ANCHORS;
  
  const filteredAnchors = anchors.filter(anchor => 
    anchor.event.includes(searchTerm) || 
    anchor.year.includes(searchTerm) ||
    anchor.significance.includes(searchTerm)
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/learn/history/framework')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              时间轴速查
            </h1>
            <p className="text-sm text-muted-foreground">必背锚点 · 选择题定位神器</p>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜索年份或事件..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 标签切换 */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'china' ? 'default' : 'outline'}
            onClick={() => setActiveTab('china')}
          >
            🇨🇳 中国史锚点
          </Button>
          <Button
            variant={activeTab === 'world' ? 'default' : 'outline'}
            onClick={() => setActiveTab('world')}
          >
            🌍 世界史锚点
          </Button>
        </div>

        {/* 锚点列表 */}
        <div className="space-y-2">
          {filteredAnchors.map((anchor, index) => (
            <Card key={index} className={anchor.isLiaoning ? 'border-red-200 bg-red-50/30' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Badge variant={anchor.isLiaoning ? 'default' : 'outline'} className={anchor.isLiaoning ? 'bg-red-100 text-red-700' : ''}>
                      {anchor.year}
                    </Badge>
                    {anchor.isLiaoning && (
                      <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border-red-200">
                        <MapPin className="h-3 w-3 mr-1" />
                        辽宁
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800">{anchor.event}</h3>
                    <p className="text-sm text-slate-600 mt-1">{anchor.significance}</p>
                  </div>
                  <Star className="h-4 w-4 text-amber-500 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAnchors.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>没有找到匹配的锚点</p>
          </div>
        )}

        {/* 提示 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-800 mb-2">💡 使用技巧</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• 时间轴是选择题定位的核心工具</li>
              <li>• 先看材料中的年份/朝代，再定位到对应时期</li>
              <li>• 辽宁标注的锚点是辽宁卷高频考点</li>
              <li>• 记忆时重点关注⭐标记的转折锚点</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
