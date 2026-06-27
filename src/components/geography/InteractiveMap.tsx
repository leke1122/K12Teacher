'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Lightbulb, Loader2, BookOpen, ChevronRight } from 'lucide-react';
import type { MapRegion } from '@/lib/geographyData';

interface InteractiveMapProps {
  regions: MapRegion[];
  onRegionSelect?: (region: MapRegion) => void;
}

type MapTab = 'liaoning' | 'china' | 'world';

function RegionFeatureCard({ region }: { region: MapRegion }) {
  return (
    <Card className="bg-slate-50/80">
      <CardHeader className="pb-3 pt-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-red-500" />
          {region.name}
          <Badge variant="outline" className="text-xs">
            {region.type === 'landform' ? '地形区' : region.type === 'climate_zone' ? '气候区' : '区域'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">📍 位置</p>
            <p className="text-sm text-slate-700">{region.location}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">🏔️ 地形</p>
            <p className="text-sm text-slate-700">{region.terrain}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">🌡️ 气候</p>
            <p className="text-sm text-slate-700">{region.climate}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">💧 水文</p>
            <p className="text-sm text-slate-700">{region.hydrology}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">⛏️ 主要资源</p>
          <div className="flex flex-wrap gap-1">
            {region.resources.map((r) => (
              <Badge key={r} variant="secondary" className="text-xs">
                {r}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">🏭 经济特征</p>
          <p className="text-sm text-slate-700">{region.economy}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InteractiveMap({ regions, onRegionSelect }: InteractiveMapProps) {
  const [activeTab, setActiveTab] = useState<MapTab>('liaoning');
  const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(null);
  const [thinkingAnswer, setThinkingAnswer] = useState('');
  const [showThinking, setShowThinking] = useState(false);

  const filteredRegions = useMemo(() => {
    if (activeTab === 'liaoning') {
      return regions.filter((r) => r.parentId === 'liaoning' || r.id === 'liaoning');
    }
    return regions;
  }, [activeTab, regions]);

  const handleRegionClick = (region: MapRegion) => {
    setSelectedRegion(region);
    setShowThinking(false);
    setThinkingAnswer('');
    onRegionSelect?.(region);
  };

  const handleThinkingSubmit = () => {
    if (!thinkingAnswer.trim() || !selectedRegion) return;
    setShowThinking(true);
  };

  return (
    <div className="space-y-4">
      {/* 地图类型选择 */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={activeTab === 'liaoning' ? 'default' : 'outline'}
              onClick={() => setActiveTab('liaoning')}
              className="gap-1"
            >
              <MapPin className="h-4 w-4" />
              辽宁地图
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'china' ? 'default' : 'outline'}
              onClick={() => setActiveTab('china')}
              className="gap-1"
            >
              中国地图
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'world' ? 'default' : 'outline'}
              onClick={() => setActiveTab('world')}
              className="gap-1"
            >
              世界地图
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 区域列表 */}
        <Card>
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              {activeTab === 'liaoning' ? '辽宁省区域' : activeTab === 'china' ? '中国区域' : '世界区域'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredRegions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    该地图类型暂无数据
                  </p>
                ) : (
                  filteredRegions.map((region) => (
                    <div
                      key={region.id}
                      className={`rounded-lg border p-3 cursor-pointer transition-all hover:shadow-sm ${
                        selectedRegion?.id === region.id
                          ? 'border-blue-300 bg-blue-50/60'
                          : 'border-slate-200 bg-white'
                      }`}
                      onClick={() => handleRegionClick(region)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-red-500" />
                            {region.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {region.location}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {region.type === 'landform' ? '地形区' : region.type === 'climate_zone' ? '气候区' : '区域'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 特征展示 + 思考题 */}
        <div className="space-y-4">
          {selectedRegion ? (
            <>
              <RegionFeatureCard region={selectedRegion} />

              {/* 思考题 */}
              <Card className="bg-amber-50/60 border-amber-200">
                <CardHeader className="pb-3 pt-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    🧠 想一想
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-700">
                    这个区域为什么有这样的{activeTab === 'liaoning' ? '地理' : ''}特征？
                  </p>

                  {!showThinking ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="写下你的思考..."
                        value={thinkingAnswer}
                        onChange={(e) => setThinkingAnswer(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <Button
                        size="sm"
                        onClick={handleThinkingSubmit}
                        disabled={!thinkingAnswer.trim()}
                        className="gap-1"
                      >
                        提交思考 <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-sm text-amber-800">
                        💡 思考方向：这个区域的{selectedRegion.terrain.includes('平原') ? '平原地形' : selectedRegion.terrain.includes('丘陵') ? '丘陵地形' : '特殊地貌'}和{selectedRegion.climate.includes('季风') ? '季风气候' : '大陆性气候'}是影响其地理特征的主要因素。
                      </p>
                      <p className="text-xs text-amber-700 mt-2">
                        {selectedRegion.economy}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                请点击左侧区域查看详细信息
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export { InteractiveMap };
export type { MapTab };
