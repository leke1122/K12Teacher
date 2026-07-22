'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Thermometer, Droplets, Mountain, Factory, BookOpen, AlertCircle } from 'lucide-react';
import type { ChinaProvinceData, WorldClimateZone } from '@/data/geography/geoData';

interface InfoCardProps {
  mode: 'china' | 'world';
  // 中国模式数据
  provinceData?: ChinaProvinceData | null;
  provinceName?: string;
  // 世界模式数据
  climateZone?: WorldClimateZone | null;
  countryName?: string;
}

export function GeoInfoCard({ mode, provinceData, provinceName, climateZone, countryName }: InfoCardProps) {
  if (mode === 'china') {
    return <ChinaInfoCard provinceData={provinceData} provinceName={provinceName} />;
  }
  return <WorldInfoCard climateZone={climateZone} countryName={countryName} />;
}

// ===== 中国省份信息卡片 =====
function ChinaInfoCard({ provinceData, provinceName }: { provinceData: ChinaProvinceData | null | undefined; provinceName?: string }) {
  if (!provinceData) {
    return (
      <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
        <CardContent className="py-8 text-center text-slate-400">
          <MapPin className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">点击地图上的省份</p>
          <p className="text-xs mt-1">查看该省份的详细信息</p>
        </CardContent>
      </Card>
    );
  }

  const isLiaoning = provinceName === '辽宁';

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-1">
        {/* 标题 */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">{provinceData.shortName}</span>
              <span className="text-base font-semibold text-slate-800 dark:text-slate-200">{provinceData.name}</span>
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              行政中心：{provinceData.capital}
            </p>
          </CardHeader>
        </Card>

        {/* 气候分区 */}
        <Card className="bg-white dark:bg-slate-800/50">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Thermometer className="h-3.5 w-3.5" />
              气候分区
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-xs">
                {provinceData.temperatureZone}
              </Badge>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs">
                {provinceData.humidityZone}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 地形特征 */}
        <Card className="bg-white dark:bg-slate-800/50">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Mountain className="h-3.5 w-3.5" />
              地形特征
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
              {provinceData.terrain}
            </p>
            <div className="flex flex-wrap gap-1 mt-1">
              {provinceData.features.map((f, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {f}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 资源与经济 */}
        <Card className="bg-white dark:bg-slate-800/50">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Factory className="h-3.5 w-3.5" />
              资源与经济
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {provinceData.resources.map((r, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">
                  {r}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {provinceData.economy}
            </p>
          </CardContent>
        </Card>

        {/* 主要山河（如果有） */}
        {(provinceData.rivers?.length || provinceData.mountains?.length) && (
          <Card className="bg-white dark:bg-slate-800/50">
            <CardContent className="p-3 space-y-2">
              <div className="text-xs text-slate-500 mb-1">主要山河</div>
              {provinceData.mountains?.length && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-slate-400 mr-1">山：</span>
                  {provinceData.mountains.map((m, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                      {m}
                    </Badge>
                  ))}
                </div>
              )}
              {provinceData.rivers?.length && (
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-xs text-slate-400 mr-1">河：</span>
                  {provinceData.rivers.map((r, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800">
                      {r}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 辽宁专属高考考点 */}
        {isLiaoning && provinceData.gaokaoPoints && (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-300 dark:border-amber-800">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                🎯 辽宁高考高频考点
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-2">
                {provinceData.gaokaoPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-900 dark:text-amber-300">{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}

// ===== 世界气候信息卡片 =====
function WorldInfoCard({ climateZone, countryName }: { climateZone: WorldClimateZone | null | undefined; countryName?: string }) {
  if (!climateZone) {
    return (
      <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
        <CardContent className="py-8 text-center text-slate-400">
          <MapPin className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">点击地图上的区域</p>
          <p className="text-xs mt-1">查看气候类型和地理特征</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-1">
        {/* 标题 */}
        <Card
          className="border-2"
          style={{ borderColor: climateZone.color + '60', backgroundColor: climateZone.color + '15' }}
        >
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-base flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: climateZone.color }}
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {climateZone.name}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* 分布国家 */}
        <Card className="bg-white dark:bg-slate-800/50">
          <CardContent className="p-3 space-y-2">
            <div className="text-xs text-slate-500 mb-1">📍 主要分布地区</div>
            <div className="flex flex-wrap gap-1">
              {climateZone.countries.map((c, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-900">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 气候特征 */}
        <Card className="bg-white dark:bg-slate-800/50">
          <CardContent className="p-3 space-y-2">
            <div className="text-xs text-slate-500 mb-1">🌡️ 气候特征</div>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {climateZone.features}
            </p>
          </CardContent>
        </Card>

        {/* 成因 */}
        <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-3 space-y-2">
            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">🌀 成因分析</div>
            <p className="text-sm text-blue-900 dark:text-blue-300">
              {climateZone.cause}
            </p>
          </CardContent>
        </Card>

        {/* 高考考点 */}
        {climateZone.gaokaoPoints && (
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-300 dark:border-amber-800">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                🎯 高考常考方向
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-sm text-amber-900 dark:text-amber-300">
                {climateZone.gaokaoPoints}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}
