'use client';

import { useState, useEffect, useRef } from 'react';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Map, Loader2, Globe, AlertCircle } from 'lucide-react';
import { updateStepProgress } from '@/lib/geographyProgress';
import { GeoInfoCard } from '@/components/geography/InfoCard';
import {
  chinaProvincesData,
  worldClimateZones,
  worldOceanCurrents,
  worldGeoRegions,
  chinaMajorRivers,
  type ChinaProvinceData,
  type WorldClimateZone,
} from '@/data/geography/geoData';

type MapMode = 'china' | 'world';

// 备用 GeoJSON 数据源列表
// 本地 GeoJSON 数据源（优先使用）
const CHINA_GEOJSON_SOURCES = [
  '/maps/china.json',
  'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
  'https://unpkg.com/china-atlas@1.0.0/json/china.json',
];

const WORLD_GEOJSON_SOURCES = [
  '/maps/world.json',
  'https://unpkg.com/world-atlas@1.0.0/countries-110m.json',
  'https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json',
];

async function loadGeoJson(urls: string[], fallbackName: string): Promise<any> {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        console.log(`[Map] Loaded from: ${url}`);
        return data;
      }
    } catch (e) {
      console.warn(`[Map] Failed: ${url}`, e);
    }
  }
  throw new Error(`所有 ${fallbackName} 数据源加载失败`);
}

function MapPageContent() {
  const [mode, setMode] = useState<MapMode>('china');
  const [selectedProvince, setSelectedProvince] = useState<ChinaProvinceData | null>(null);
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('');
  const [selectedClimate, setSelectedClimate] = useState<WorldClimateZone | null>(null);
  const [chinaGeoJson, setChinaGeoJson] = useState<any>(null);
  const [worldGeoJson, setWorldGeoJson] = useState<any>(null);
  const [chinaError, setChinaError] = useState<string | null>(null);
  const [worldError, setWorldError] = useState<string | null>(null);
  const [chinaLoading, setChinaLoading] = useState(true);
  const [worldLoading, setWorldLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const chinaChartRef = useRef<HTMLDivElement>(null);
  const worldChartRef = useRef<HTMLDivElement>(null);
  const chinaChartInstance = useRef<any>(null);
  const worldChartInstance = useRef<any>(null);

  useEffect(() => {
    updateStepProgress('geography', 'compulsory-1', 'map', 'in_progress');
  }, []);

  // 加载中国地图
  useEffect(() => {
    setChinaLoading(true);
    setChinaError(null);
    loadGeoJson(CHINA_GEOJSON_SOURCES, '中国地图')
      .then(setChinaGeoJson)
      .catch((e) => setChinaError(e.message))
      .finally(() => setChinaLoading(false));
  }, []);

  // 渲染中国地图
  useEffect(() => {
    if (!chinaGeoJson || !chinaChartRef.current || mode !== 'china') return;

    import('echarts').then((echarts) => {
      // 清理旧实例
      if (chinaChartInstance.current) {
        chinaChartInstance.current.dispose();
      }

      const chart = echarts.init(chinaChartRef.current);
      chinaChartInstance.current = chart;

      // 注册地图
      try {
        const result = echarts.registerMap('china', chinaGeoJson);
        console.log('[ECharts] China map registered:', result);
      } catch (e) {
        console.error('[ECharts] Register failed:', e);
      }

      // 省份名称映射（GeoJSON全称 -> 数据键名）
      const nameMap: Record<string, string> = {
        '北京市': '北京', '天津市': '天津', '河北省': '河北', '山西省': '山西',
        '内蒙古自治区': '内蒙古', '辽宁省': '辽宁', '吉林省': '吉林', '黑龙江省': '黑龙江',
        '上海市': '上海', '江苏省': '江苏', '浙江省': '浙江', '安徽省': '安徽',
        '福建省': '福建', '江西省': '江西', '山东省': '山东', '河南省': '河南',
        '湖北省': '湖北', '湖南省': '湖南', '广东省': '广东', '广西壮族自治区': '广西',
        '海南省': '海南', '重庆市': '重庆', '四川省': '四川', '贵州省': '贵州',
        '云南省': '云南', '西藏自治区': '西藏', '陕西省': '陕西', '甘肃省': '甘肃',
        '青海省': '青海', '宁夏回族自治区': '宁夏', '新疆维吾尔自治区': '新疆',
        '台湾省': '台湾', '香港特别行政区': '香港', '澳门特别行政区': '澳门',
      };

      // 省份地形配色
      const colors: Record<string, string> = {
        '内蒙古': '#C4A484', '新疆': '#DEB887', '西藏': '#8B7355', '青海': '#BDB76B',
        '四川': '#228B22', '云南': '#32CD32', '贵州': '#9ACD32', '甘肃': '#F4A460',
        '陕西': '#DEB887', '山西': '#D2B48C', '宁夏': '#F5DEB3', '重庆': '#228B22',
        '广西': '#32CD32', '湖南': '#228B22', '湖北': '#9ACD32', '安徽': '#F5F5DC',
        '江苏': '#F5F5DC', '河南': '#F5DEB3', '山东': '#F5DEB3', '河北': '#F5DEB3',
        '辽宁': '#6495ED', '吉林': '#6495ED', '黑龙江': '#6495ED',
        '广东': '#20B2AA', '福建': '#20B2AA', '浙江': '#20B2AA', '海南': '#20B2AA',
        '台湾': '#20B2AA', '江西': '#9ACD32', '北京': '#F5DEB3', '天津': '#F5DEB3',
        '上海': '#F5DEB3', '香港': '#20B2AA', '澳门': '#20B2AA',
      };

      // 获取所有省份名称
      const allProvinces = chinaGeoJson.features?.map((f: any) => f.properties?.name || '') || [];

      const mapData = allProvinces.map((name: string) => {
        const shortName = nameMap[name] || name;
        return {
          name,
          value: 100,
          itemStyle: { areaColor: colors[shortName] || '#E8D5B7' },
        };
      });

      // 辽宁闪烁标注
      const liaoningData = [{ name: '辽宁省', value: [122.5, 41.8, 100] }];

      // 河流
      const riverSeries = chinaMajorRivers.map((river) => ({
        name: river.name,
        type: 'lines',
        coordinateSystem: 'geo',
        polyline: true,
        lineStyle: { color: river.color, width: 2.5, opacity: 0.8, curveness: 0.1 },
        effect: { show: true, period: 6, trailLength: 0.3, symbol: 'arrow', symbolSize: 4 },
        data: [{ coords: river.coords }],
      }));

      const option = {
        backgroundColor: '#f0f4f8',
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            if (params.seriesType === 'lines') return `<b>${params.name}</b>`;
            const shortName = nameMap[params.name] || params.name;
            const data = chinaProvincesData[shortName];
            if (data) {
              return `<b>${data.name}</b><br/>温度带: ${data.temperatureZone}<br/>干湿区: ${data.humidityZone}<br/>地形: ${data.terrain}`;
            }
            return shortName || '';
          },
        },
        geo: {
          map: 'china',
          roam: true,
          zoom: 1.2,
          center: [105, 36],
          itemStyle: { borderColor: '#999', borderWidth: 0.8 },
          emphasis: {
            itemStyle: { areaColor: '#FFD700', borderColor: '#FF6B6B', borderWidth: 2 },
            label: { show: true, color: '#333', fontWeight: 'bold', fontSize: 14 },
          },
          select: { disabled: true },
        },
        series: [
          { name: '中国地图', type: 'map', map: 'china', data: mapData },
          ...riverSeries,
          {
            name: '辽宁标注',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: liaoningData,
            symbolSize: 14,
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
          },
        ],
      };

      chart.setOption(option as any);
      setMapReady(true);

      chart.on('click', (params: any) => {
        if (params.name) {
          const shortName = nameMap[params.name] || params.name;
          const data = chinaProvincesData[shortName];
          if (data) {
            setSelectedProvince(data);
            setSelectedProvinceName(shortName);
            setSelectedClimate(null);
          }
        }
      });

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });
  }, [chinaGeoJson, mode]);

  // 切换到世界地图时加载
  const handleSwitchToWorld = () => {
    if (worldGeoJson) {
      setMode('world');
      return;
    }
    setWorldLoading(true);
    loadGeoJson(WORLD_GEOJSON_SOURCES, '世界地图')
      .then((data) => {
        setWorldGeoJson(data);
        setMode('world');
      })
      .catch((e) => setWorldError(e.message))
      .finally(() => setWorldLoading(false));
  };

  // 渲染世界地图
  useEffect(() => {
    if (!worldGeoJson || !worldChartRef.current || mode !== 'world') return;

    import('echarts').then((echarts) => {
      if (worldChartInstance.current) {
        worldChartInstance.current.dispose();
      }

      const chart = echarts.init(worldChartRef.current);
      worldChartInstance.current = chart;

      try {
        echarts.registerMap('world', worldGeoJson);
      } catch (e) {
        console.error('[ECharts] World map register failed:', e);
      }

      // 暖流
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

      // 寒流
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

      // 洋流标注
      const currentLabelSeries: any = {
        name: '洋流标注',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: worldOceanCurrents.map((c) => ({
          name: c.name,
          value: [(c.startCoord[0] + c.endCoord[0]) / 2, (c.startCoord[1] + c.endCoord[1]) / 2],
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

      // 地理区域
      const regionMarkSeries = {
        name: '地理区域',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: worldGeoRegions.map((r) => ({ name: r.name, value: r.coord })),
        symbolSize: 10,
        showEffectOn: 'render',
        rippleEffect: { brushType: 'stroke', scale: 4 },
        itemStyle: { color: '#FFD700', shadowBlur: 8, shadowColor: '#FFD700' },
        label: { show: true, formatter: '{b}', position: 'right', fontSize: 10, color: '#333' },
      };

      const option = {
        backgroundColor: '#f0f4f8',
        legend: {
          data: ['暖流', '寒流'],
          top: 10,
          right: 60,
          textStyle: { fontSize: 11 },
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            if (params.seriesType === 'lines') return `<b>${params.name}</b><br/>${params.seriesName === '暖流' ? '🔴' : '🔵'} ${params.seriesName}`;
            return params.name || '';
          },
        },
        geo: {
          map: 'world',
          roam: true,
          zoom: 1.2,
          center: [10, 20],
          itemStyle: { borderColor: '#ccc', borderWidth: 0.5, areaColor: '#E8E8E8' },
          emphasis: {
            itemStyle: { areaColor: '#FFD700', borderColor: '#FF6B6B', borderWidth: 2 },
            label: { show: true, color: '#333' },
          },
          select: { disabled: true },
        },
        series: [...warmCurrents, ...coldCurrents, currentLabelSeries, regionMarkSeries],
      };

      chart.setOption(option as any);

      chart.on('click', (params: any) => {
        if (params.seriesType === 'lines' && params.name) {
          const current = worldOceanCurrents.find((c) => c.name === params.name);
          if (current) {
            const relatedClimate = worldClimateZones.find((z) =>
              z.countries.some((c) => current.description.includes(c))
            );
            setSelectedClimate(relatedClimate || null);
          }
        }
      });

      const handleResize = () => chart.resize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });
  }, [worldGeoJson, mode]);

  // 调试：检查页面状态
  useEffect(() => {
    console.log('[Map] State:', { chinaGeoJson: !!chinaGeoJson, chinaError, mode, mapReady });
  }, [chinaGeoJson, chinaError, mode, mapReady]);

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
          <Badge variant="outline" className="text-xs">辽宁高考</Badge>
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
            onClick={handleSwitchToWorld}
            disabled={worldLoading}
            className="gap-1"
          >
            {worldLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            🌏 世界气候与洋流
          </Button>
        </div>

        {/* 主体区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 地图区域 */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardHeader className="pb-1 pt-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  {mode === 'china' ? '中国地形图' : '世界气候与洋流图'}
                  {mapReady && <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-700">已加载</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative">
                {/* 加载中 */}
                {mode === 'china' && chinaLoading && (
                  <div className="h-[500px] flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">正在加载中国地图...</p>
                      <p className="text-xs text-slate-400 mt-1">尝试多个数据源中</p>
                    </div>
                  </div>
                )}

                {/* 加载失败 */}
                {mode === 'china' && chinaError && !chinaLoading && (
                  <div className="h-[500px] flex items-center justify-center bg-red-50 dark:bg-red-950/20">
                    <div className="text-center max-w-md px-4">
                      <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-red-600 mb-2">地图加载失败</p>
                      <p className="text-xs text-slate-500 mb-3">{chinaError}</p>
                      <div className="text-xs text-slate-400 bg-white p-3 rounded border text-left">
                        <p className="font-semibold mb-1">可能原因：</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>网络连接问题</li>
                          <li>防火墙拦截了外部资源</li>
                          <li>Vercel 部署环境无法访问外网</li>
                        </ul>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => {
                          setChinaError(null);
                          setChinaLoading(true);
                          loadGeoJson(CHINA_GEOJSON_SOURCES, '中国地图')
                            .then(setChinaGeoJson)
                            .catch((e) => setChinaError(e.message))
                            .finally(() => setChinaLoading(false));
                        }}
                      >
                        重试
                      </Button>
                    </div>
                  </div>
                )}

                {/* 世界地图加载中 */}
                {mode === 'world' && worldLoading && (
                  <div className="h-[500px] flex items-center justify-center bg-slate-100">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">正在加载世界地图...</p>
                    </div>
                  </div>
                )}

                {/* 世界地图加载失败 */}
                {mode === 'world' && worldError && !worldLoading && (
                  <div className="h-[500px] flex items-center justify-center bg-red-50">
                    <div className="text-center">
                      <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-red-600">世界地图加载失败</p>
                      <p className="text-xs text-slate-500 mt-1">{worldError}</p>
                    </div>
                  </div>
                )}

                {/* 地图容器 */}
                {((mode === 'china' && !chinaLoading && !chinaError) || (mode === 'world' && !worldLoading && !worldError)) && (
                  <>
                    <div
                      ref={chinaChartRef}
                      className={`w-full ${mode === 'china' ? 'h-[500px]' : 'h-0'}`}
                      style={{ display: mode === 'china' ? 'block' : 'none' }}
                    />
                    <div
                      ref={worldChartRef}
                      className={`w-full ${mode === 'world' ? 'h-[500px]' : 'h-0'}`}
                      style={{ display: mode === 'world' ? 'block' : 'none' }}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* 图例说明 */}
            {mode === 'china' && !chinaError && (
              <Card className="mt-3">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                    <span className="inline-block w-3 h-3 rounded bg-[#6495ED]" />平原
                    <span className="inline-block w-3 h-3 rounded bg-[#228B22] ml-2" />山地
                    <span className="inline-block w-3 h-3 rounded bg-[#C4A484] ml-2" />高原
                    <span className="inline-block w-3 h-3 rounded bg-[#20B2AA] ml-2" />沿海
                  </div>
                  <p className="text-xs text-slate-500">
                    💡 点击省份查看详情，<span className="text-red-500 font-bold">辽宁红色闪烁标注</span>，河流流动箭头，拖动缩放平移
                  </p>
                </CardContent>
              </Card>
            )}

            {mode === 'world' && !worldError && (
              <Card className="mt-3">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                    <span className="inline-block w-3 h-3 rounded bg-[#FF6347]" />暖流
                    <span className="inline-block w-3 h-3 rounded bg-[#4169E1] ml-2" />寒流
                    <span className="inline-block w-3 h-3 rounded bg-[#FFD700] ml-2" />地理区
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧知识点卡片 */}
          <div className="lg:col-span-1">
            {mode === 'china' ? (
              <div className="sticky top-4">
                <GeoInfoCard mode="china" provinceData={selectedProvince} provinceName={selectedProvinceName} />
              </div>
            ) : (
              <div className="sticky top-4 space-y-3">
                <GeoInfoCard mode="world" climateZone={selectedClimate} />
                <Card className="bg-white/80 dark:bg-slate-900/80">
                  <CardHeader className="pb-1 pt-3 px-3">
                    <CardTitle className="text-xs text-slate-500">气候类型速查</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="grid grid-cols-2 gap-1">
                      {worldClimateZones.map((zone) => (
                        <button
                          key={zone.name}
                          onClick={() => setSelectedClimate(zone)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: zone.color }} />
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
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    }>
      <MapPageContent />
    </Suspense>
  );
}
