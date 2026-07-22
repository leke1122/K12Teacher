'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Map, Loader2, Globe } from 'lucide-react';
import { updateStepProgress } from '@/lib/geographyProgress';
import { GeoInfoCard } from '@/components/geography/InfoCard';
import {
  chinaProvincesData,
  chinaTerrainMarks,
  worldClimateZones,
  worldOceanCurrents,
  worldGeoRegions,
  chinaMajorRivers,
  type ChinaProvinceData,
  type WorldClimateZone,
} from '@/data/geography/geoData';

type MapMode = 'china' | 'world';

function MapPageContent() {
  const [mode, setMode] = useState<MapMode>('china');
  const [selectedProvince, setSelectedProvince] = useState<ChinaProvinceData | null>(null);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('');
  const [selectedClimate, setSelectedClimate] = useState<WorldClimateZone | null>(null);
  const [chinaMapLoaded, setChinaMapLoaded] = useState(false);
  const [worldMapLoaded, setWorldMapLoaded] = useState(false);
  const [isEchartsReady, setIsEchartsReady] = useState(false);

  const chinaChartRef = useRef<HTMLDivElement>(null);
  const worldChartRef = useRef<HTMLDivElement>(null);
  const chinaChartInstance = useRef<any>(null);
  const worldChartInstance = useRef<any>(null);

  useEffect(() => {
    updateStepProgress('geography', 'compulsory-1', 'map', 'in_progress');
  }, []);

  // 动态导入 echarts
  useEffect(() => {
    import('echarts').then(() => {
      setIsEchartsReady(true);
    });
  }, []);

  // 初始化中国地图
  const initChinaMap = useCallback(async () => {
    if (!isEchartsReady || !chinaChartRef.current || !chinaMapLoaded) return;

    const echarts = await import('echarts');
    if (chinaChartInstance.current) {
      chinaChartInstance.current.dispose();
    }
    const chart = echarts.init(chinaChartRef.current);
    chinaChartInstance.current = chart;

    // 注册中国地图
    try {
      const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
      const chinaGeoJson = await response.json();
      echarts.registerMap('china', chinaGeoJson);

      // 按地形海拔分配颜色（简化版）
      const provinceElevationColors: Record<string, string> = {
        '内蒙古': '#C4A484', // 高原-棕色
        '新疆': '#DEB887', // 沙漠-沙色
        '西藏': '#8B7355', // 高原-深棕
        '青海': '#BDB76B', // 高原-黄绿
        '四川': '#228B22', // 山地-深绿
        '云南': '#32CD32', // 丘陵-绿
        '贵州': '#9ACD32', // 丘陵-黄绿
        '甘肃': '#F4A460', // 高原-沙色
        '陕西': '#DEB887', // 黄土-沙色
        '山西': '#D2B48C', // 黄土-沙色
        '宁夏': '#F5DEB3', // 沙漠边缘-浅黄
        '重庆': '#228B22', // 山地-深绿
        '广西': '#32CD32', // 丘陵-绿
        '湖南': '#228B22', // 山地-深绿
        '湖北': '#9ACD32', // 丘陵-黄绿
        '安徽': '#F5F5DC', // 平原-米色
        '江苏': '#F5F5DC', // 平原-米色
        '河南': '#F5DEB3', // 平原-浅黄
        '山东': '#F5DEB3', // 平原-浅黄
        '河北': '#F5DEB3', // 平原-浅黄
        '辽宁': '#4169E1', // 平原-蓝色（特别标注）
        '吉林': '#4169E1', // 平原-蓝色
        '黑龙江': '#4169E1', // 平原-蓝色
        '广东': '#20B2AA', // 沿海-青绿
        '福建': '#20B2AA', // 沿海-青绿
        '浙江': '#20B2AA', // 沿海-青绿
        '海南': '#20B2AA', // 沿海-青绿
        '台湾': '#20B2AA', // 沿海-青绿
        '江西': '#9ACD32', // 丘陵-黄绿
        '北京': '#F5DEB3', // 平原-浅黄
        '天津': '#F5DEB3', // 平原-浅黄
        '上海': '#F5DEB3', // 平原-浅黄
        '香港': '#20B2AA', // 沿海-青绿
        '澳门': '#20B2AA', // 沿海-青绿
      };

      // 构建省份配色 series
      const mapSeries: any = {
        name: '中国地形',
        type: 'map',
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: [105, 36],
        emphasis: {
          itemStyle: {
            areaColor: '#FFD700',
            borderColor: '#FF6B6B',
            borderWidth: 2,
          },
          label: {
            show: true,
            color: '#333',
            fontWeight: 'bold',
            fontSize: 14,
          },
        },
        select: {
          disabled: true,
        },
        itemStyle: {
          borderColor: '#888',
          borderWidth: 0.5,
        },
        data: Object.entries(chinaProvincesData).map(([name, data]) => ({
          name,
          value: 100,
          itemStyle: {
            areaColor: provinceElevationColors[name] || '#E8D5B7',
          },
        })),
      };

      // 辽宁高亮标注
      const liaoningMark: any = {
        name: '辽宁标注',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: [{ name: '辽宁省', value: [122.5, 41.8, 100] }],
        symbolSize: 18,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 4 },
        itemStyle: { color: '#FF4500', shadowBlur: 10, shadowColor: '#FF4500' },
        label: {
          show: true,
          formatter: '辽宁',
          position: 'right',
          color: '#FF4500',
          fontWeight: 'bold',
          fontSize: 13,
        },
      };

      // 地形标注点
      const terrainMarkData = chinaTerrainMarks.map((mark) => ({
        name: mark.name,
        value: [...mark.coord, 80],
        symbol: mark.type === 'river' ? 'path://M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' : 'circle',
        symbolSize: mark.type === 'river' ? 0 : 8,
        itemStyle: {
          color:
            mark.type === 'plain'
              ? '#4169E1'
              : mark.type === 'mountain'
              ? '#8B4513'
              : mark.type === 'plateau'
              ? '#D2691E'
              : mark.type === 'basin'
              ? '#DAA520'
              : mark.type === 'hills'
              ? '#6B8E23'
              : '#1E90FF',
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'right',
          fontSize: 10,
          color: '#333',
        },
      }));

      // 主要河流
      const riverSeries: any[] = chinaMajorRivers.map((river) => ({
        name: river.name,
        type: 'lines',
        coordinateSystem: 'geo',
        polyline: true,
        lineStyle: { color: river.color, width: 2.5, opacity: 0.8, curveness: 0.1 },
        effect: { show: true, period: 6, trailLength: 0.3, symbol: 'arrow', symbolSize: 4 },
        data: [{ coords: river.coords }],
      }));

      // 地形标注 series
      const terrainMarkSeries: any = {
        name: '地形标注',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: terrainMarkData,
        symbol: 'circle',
        symbolSize: 6,
        label: {
          show: true,
          position: 'right',
          fontSize: 9,
          color: '#555',
          formatter: '{b}',
        },
        itemStyle: { color: '#8B4513', opacity: 0.8 },
      };

      // 辽宁 effectScatter 标注
      const liaoningEffectSeries: any = {
        name: '辽宁闪烁',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: [{ name: '辽宁省', value: [122.5, 41.8, 100] }],
        symbolSize: 12,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 5 },
        itemStyle: { color: '#FF6347', shadowBlur: 15, shadowColor: '#FF6347' },
        label: {
          show: true,
          formatter: '{b}',
          position: 'top',
          fontSize: 12,
          fontWeight: 'bold',
          color: '#FF6347',
        },
      };

      const option = {
        backgroundColor: '#f8f9fa',
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            if (params.seriesType === 'scatter' && params.data?.symbol === 'circle') {
              return `${params.name}`;
            }
            if (params.seriesType === 'lines') {
              return params.name;
            }
            const data = chinaProvincesData[params.name];
            if (data) {
              return `<b>${data.name}</b><br/>温度带: ${data.temperatureZone}<br/>干湿区: ${data.humidityZone}<br/>地形: ${data.terrain}`;
            }
            return params.name || '';
          },
        },
        geo: {
          map: 'china',
          roam: true,
          zoom: 1.2,
          center: [105, 36],
          itemStyle: {
            borderColor: '#999',
            borderWidth: 0.8,
          },
          emphasis: {
            itemStyle: {
              areaColor: '#FFD700',
              borderColor: '#FF6B6B',
              borderWidth: 2,
            },
            label: { show: true, color: '#333', fontWeight: 'bold', fontSize: 14 },
          },
          select: { disabled: true },
        },
        series: [mapSeries, ...riverSeries, liaoningEffectSeries],
      };

      chart.setOption(option, true);

      // 点击事件
      chart.on('click', (params: any) => {
        if (params.name && chinaProvincesData[params.name]) {
          setSelectedProvince(chinaProvincesData[params.name]);
          setSelectedProvinceName(params.name);
          setSelectedClimate(null);
        }
      });
    } catch (err) {
      console.error('[ChinaMap] init failed:', err);
    }
  }, [isEchartsReady, chinaMapLoaded]);

  // 初始化世界地图
  const initWorldMap = useCallback(async () => {
    if (!isEchartsReady || !worldChartRef.current || !worldMapLoaded) return;

    const echarts = await import('echarts');
    if (worldChartInstance.current) {
      worldChartInstance.current.dispose();
    }
    const chart = echarts.init(worldChartRef.current);
    worldChartInstance.current = chart;

    try {
      const response = await fetch('https://cdn.jsdelivr.net/npm/echarts@5/map/json/world.json');
      const worldGeoJson = await response.json();
      echarts.registerMap('world', worldGeoJson);

      // 洋流 series
      const warmCurrents = worldOceanCurrents
        .filter((c) => c.type === 'warm')
        .map((c) => ({
          name: c.name,
          type: 'lines' as const,
          coordinateSystem: 'geo',
          polyline: true,
          lineStyle: { color: '#FF6347', width: 2.5, opacity: 0.85, curveness: 0.15 },
          effect: { show: true, period: 8, trailLength: 0.4, symbol: 'arrow', symbolSize: 5, color: '#FF6347' },
          data: [{ coords: [c.startCoord, c.endCoord] }],
        }));

      const coldCurrents = worldOceanCurrents
        .filter((c) => c.type === 'cold')
        .map((c) => ({
          name: c.name,
          type: 'lines' as const,
          coordinateSystem: 'geo',
          polyline: true,
          lineStyle: { color: '#4169E1', width: 2.5, opacity: 0.85, curveness: 0.15 },
          effect: { show: true, period: 8, trailLength: 0.4, symbol: 'arrow', symbolSize: 5, color: '#4169E1' },
          data: [{ coords: [c.startCoord, c.endCoord] }],
        }));

        // 洋流名称标注
      const currentLabelSeries: any = {
        name: '洋流标注',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: worldOceanCurrents.map((c) => ({
          name: c.name,
          value: [
            (c.startCoord[0] + c.endCoord[0]) / 2,
            (c.startCoord[1] + c.endCoord[1]) / 2,
          ],
        })),
        symbol: 'none',
        label: {
          show: true,
          formatter: '{b}',
          position: 'inside',
          fontSize: 8,
          color: '#fff',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: [2, 4],
          borderRadius: 3,
        },
        tooltip: {
          formatter: (params: any) => {
            const c = worldOceanCurrents.find((wc) => wc.name === params.name);
            if (!c) return '';
            return `<b>${c.name}</b>（${c.type === 'warm' ? '暖流' : '寒流'}）<br/>${c.description}`;
          },
        },
      };

      // 地理区域标注
      const regionMarkSeries: any = {
        name: '地理区域',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: worldGeoRegions.map((r) => ({
          name: r.name,
          value: r.coord,
        })),
        symbolSize: 12,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 4 },
        itemStyle: {
          color: '#FFD700',
          shadowBlur: 8,
          shadowColor: '#FFD700',
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'right',
          fontSize: 10,
          color: '#333',
        },
      };

      const option = {
        backgroundColor: '#f8f9fa',
        title: {
          text: '图例',
          top: 10,
          right: 10,
          textStyle: { fontSize: 11, color: '#666' },
        },
        legend: {
          data: ['暖流', '寒流'],
          top: 10,
          right: 60,
          textStyle: { fontSize: 11 },
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            if (params.seriesType === 'lines') {
              return `<b>${params.name}</b><br/>${params.seriesName === '暖流' ? '🔴' : '🔵'} ${params.seriesName}`;
            }
            if (params.seriesType === 'effectScatter') {
              return params.name;
            }
            return params.name || '';
          },
        },
        geo: {
          map: 'world',
          roam: true,
          zoom: 1.2,
          center: [10, 20],
          itemStyle: {
            borderColor: '#ccc',
            borderWidth: 0.5,
            areaColor: '#E8E8E8',
          },
          emphasis: {
            itemStyle: { areaColor: '#FFD700', borderColor: '#FF6B6B', borderWidth: 2 },
            label: { show: true, color: '#333' },
          },
          select: { disabled: true },
        },
        series: [
          ...warmCurrents,
          ...coldCurrents,
          currentLabelSeries,
          regionMarkSeries,
        ],
      };

      chart.setOption(option, true);

      // 点击洋流显示详情
      chart.on('click', (params: any) => {
        if (params.seriesType === 'lines' && params.name) {
          const current = worldOceanCurrents.find((c) => c.name === params.name);
          if (current) {
            // 查找对应的气候区
            const relatedClimate = worldClimateZones.find((z) =>
              z.countries.some((c) => current.description.includes(c))
            );
            setSelectedClimate(relatedClimate || null);
          }
        }
      });
    } catch (err) {
      console.error('[WorldMap] init failed:', err);
    }
  }, [isEchartsReady, worldMapLoaded]);

  // 加载中国地图 GeoJSON
  useEffect(() => {
    if (mode === 'china') {
      fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
        .then((r) => r.json())
        .then(() => setChinaMapLoaded(true))
        .catch(() => setChinaMapLoaded(true)); // 即使失败也标记，防止永不加载
    }
  }, [mode]);

  // 加载世界地图 GeoJSON
  useEffect(() => {
    if (mode === 'world') {
      fetch('https://cdn.jsdelivr.net/npm/echarts@5/map/json/world.json')
        .then((r) => r.json())
        .then(() => setWorldMapLoaded(true))
        .catch(() => setWorldMapLoaded(true));
    }
  }, [mode]);

  // 初始化地图
  useEffect(() => {
    if (mode === 'china' && isEchartsReady) {
      // 延迟一下确保 DOM 就绪
      const t = setTimeout(() => initChinaMap(), 100);
      return () => clearTimeout(t);
    }
    if (mode === 'world' && isEchartsReady) {
      const t = setTimeout(() => initWorldMap(), 100);
      return () => clearTimeout(t);
    }
  }, [mode, isEchartsReady, chinaMapLoaded, worldMapLoaded, initChinaMap, initWorldMap]);

  // 窗口 resize
  useEffect(() => {
    const handleResize = () => {
      if (mode === 'china' && chinaChartInstance.current) chinaChartInstance.current.resize();
      if (mode === 'world' && worldChartInstance.current) worldChartInstance.current.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode]);

  const selectedClimateZone = selectedClimate;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-500" />
              🌍 高中地理 · 交互地图实验室
            </h1>
            <p className="text-xs text-muted-foreground">可视化地形地貌 · 掌握气候洋流分布</p>
          </div>
          <Badge variant="outline" className="text-xs">
            辽宁高考
          </Badge>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === 'china' ? 'default' : 'outline'}
            onClick={() => setMode('china')}
            className="gap-1"
          >
            <Map className="h-4 w-4" />
            🗺️ 中国地形与区域
          </Button>
          <Button
            size="sm"
            variant={mode === 'world' ? 'default' : 'outline'}
            onClick={() => setMode('world')}
            className="gap-1"
          >
            <Globe className="h-4 w-4" />
            🌏 世界气候与洋流
          </Button>
        </div>

        {/* 主体区域：地图 + 知识点卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 地图区域 */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  {mode === 'china' ? (
                    <>
                      <span>中国地形图（海拔配色）</span>
                      <div className="flex items-center gap-1 ml-auto text-xs text-slate-400">
                        <span className="inline-block w-3 h-3 rounded bg-[#4169E1]" />平原
                        <span className="inline-block w-3 h-3 rounded bg-[#228B22] ml-1" />山地
                        <span className="inline-block w-3 h-3 rounded bg-[#C4A484] ml-1" />高原
                        <span className="inline-block w-3 h-3 rounded bg-[#20B2AA] ml-1" />沿海
                        <span className="inline-block w-3 h-3 rounded bg-[#DEB887] ml-1" />沙漠
                      </div>
                    </>
                  ) : (
                    <>
                      <span>世界气候与洋流图</span>
                      <div className="flex items-center gap-1 ml-auto text-xs text-slate-400">
                        <span className="inline-block w-3 h-3 rounded bg-[#FF6347]" />暖流
                        <span className="inline-block w-3 h-3 rounded bg-[#4169E1] ml-1" />寒流
                        <span className="inline-block w-3 h-3 rounded bg-[#FFD700] ml-1" />地理区
                      </div>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* 中国地图 */}
                <div
                  ref={chinaChartRef}
                  className={`w-full transition-all ${mode === 'china' ? 'h-[500px]' : 'h-0 overflow-hidden'}`}
                />
                {/* 世界地图 */}
                <div
                  ref={worldChartRef}
                  className={`w-full transition-all ${mode === 'world' ? 'h-[500px]' : 'h-0 overflow-hidden'}`}
                />
                {/* 加载中 */}
                {(!isEchartsReady || (mode === 'china' && !chinaMapLoaded) || (mode === 'world' && !worldMapLoaded)) && (
                  <div className="h-[500px] flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">加载地图中...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 世界地图图例说明 */}
            {mode === 'world' && (
              <Card className="mt-3">
                <CardContent className="p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="font-semibold text-slate-600 mb-1">🔴 重要暖流</p>
                      {worldOceanCurrents
                        .filter((c) => c.type === 'warm')
                        .slice(0, 5)
                        .map((c) => (
                          <p key={c.name} className="text-slate-500">
                            · {c.name}：{c.description.substring(0, 20)}...
                          </p>
                        ))}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600 mb-1">🔵 重要寒流</p>
                      {worldOceanCurrents
                        .filter((c) => c.type === 'cold')
                        .slice(0, 5)
                        .map((c) => (
                          <p key={c.name} className="text-slate-500">
                            · {c.name}：{c.description.substring(0, 20)}...
                          </p>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 中国地图图例说明 */}
            {mode === 'china' && (
              <Card className="mt-3">
                <CardContent className="p-3">
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>💡 <b>提示：</b>点击任意省份查看详情，辽宁省以 <span className="text-red-500 font-bold">红色闪烁</span> 标注。</p>
                    <p>🟦 河流（黄河、长江、辽河等）以流动箭头标注，拖动可缩放和平移地图。</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧知识点卡片 */}
          <div className="lg:col-span-1">
            {mode === 'china' ? (
              <div className="sticky top-4">
                <GeoInfoCard
                  mode="china"
                  provinceData={selectedProvince}
                  provinceName={selectedProvinceName}
                />
              </div>
            ) : (
              <div className="sticky top-4">
                <GeoInfoCard
                  mode="world"
                  climateZone={selectedClimateZone}
                />

                {/* 气候类型速查 */}
                <Card className="mt-3 bg-white/80 dark:bg-slate-900/80">
                  <CardHeader className="pb-1 pt-3 px-3">
                    <CardTitle className="text-xs text-slate-500">气候类型速查</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-1">
                      {worldClimateZones.map((zone) => (
                        <button
                          key={zone.name}
                          onClick={() => {
                            setSelectedClimate(zone);
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: zone.color }}
                          />
                          <span className="truncate">{zone.name}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeographyMapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
