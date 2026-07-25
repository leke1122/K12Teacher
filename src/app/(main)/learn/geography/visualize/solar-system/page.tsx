'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, ZoomIn, Info, Layers } from 'lucide-react';
import Link from 'next/link';

type Level = {
  id: string;
  name: string;
  scale: string;
  description: string;
  features: string[];
  children?: Level[];
};

const LEVELS: Level[] = [
  {
    id: 'universe',
    name: '可观测宇宙',
    scale: '约930亿光年',
    description: '人类目前所能观测到的宇宙范围，包含所有星系、星云、黑洞等天体。宇宙诞生于约138亿年前的大爆炸。',
    features: ['数千亿个星系', '暗物质与暗能量', '宇宙微波背景辐射'],
    children: [
      {
        id: 'milkyway',
        name: '银河系',
        scale: '直径约10万光年',
        description: '太阳系所在的棒旋星系，呈银盘结构，拥有多条旋臂。银河系年龄约136亿年。',
        features: ['约2000-4000亿颗恒星', '中心有超大质量黑洞', '四条主要旋臂'],
        children: [
          {
            id: 'solar-system',
            name: '太阳系',
            scale: '直径约300亿公里',
            description: '由太阳、八大行星、矮行星、小行星带、彗星等组成。太阳质量占太阳系总质量的99.86%。',
            features: ['太阳占99.86%质量', '八大行星', '一个小行星带', '柯伊伯带、奥尔特云'],
            children: [
              {
                id: 'earth-moon',
                name: '地月系',
                scale: '地月距离38万公里',
                description: '地球与月球组成的天体系统，是距离太阳最近的行星-卫星系统。月球是地球唯一的天然卫星。',
                features: ['月球距地球38.4万公里', '月球公转周期27.3天', '潮汐锁定'],
              },
            ],
          },
        ],
      },
    ],
  },
];

const LEVEL_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
];

function LevelCard({ 
  level, 
  depth, 
  isSelected,
  onSelect,
  onExpand 
}: { 
  level: Level; 
  depth: number;
  isSelected: boolean;
  onSelect: () => void;
  onExpand: () => void;
}) {
  const colorClass = LEVEL_COLORS[Math.min(depth, LEVEL_COLORS.length - 1)];
  const hasChildren = level.children && level.children.length > 0;

  return (
    <div className="relative">
      {depth > 0 && (
        <div className="absolute -left-6 top-1/2 w-6 h-px bg-slate-300" />
      )}
      <div
        className={`
          relative p-4 rounded-xl border-2 transition-all cursor-pointer
          ${isSelected 
            ? `bg-gradient-to-r ${colorClass} text-white border-transparent shadow-lg scale-[1.02]` 
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
          }
        `}
        onClick={onSelect}
      >
        {hasChildren && (
          <button
            onClick={(e) => { e.stopPropagation(); onExpand(); }}
            className={`
              absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md
              ${isSelected ? 'bg-white text-purple-600' : 'bg-purple-500 text-white'}
            `}
          >
            {depth + 1}
          </button>
        )}
        
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className={`font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
              {level.name}
            </h3>
            <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
              {level.scale}
            </p>
            {isSelected && (
              <p className="text-sm mt-2 text-white/90 leading-relaxed">
                {level.description}
              </p>
            )}
            {isSelected && level.features && (
              <div className="flex flex-wrap gap-1 mt-3">
                {level.features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-white/20 text-white border-0">
                    {f}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {hasChildren && !isSelected && (
            <ArrowRight className="h-4 w-4 text-slate-400 mt-1" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SolarSystemPage() {
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set(['universe', 'milkyway', 'solar-system']));
  const [selectedId, setSelectedId] = useState<string>('solar-system');

  const toggleExpand = (id: string) => {
    setExpandedLevels(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const findSelected = (levels: Level[]): Level | null => {
    for (const level of levels) {
      if (level.id === selectedId) return level;
      if (level.children) {
        const found = findSelected(level.children);
        if (found) return found;
      }
    }
    return null;
  };

  const selected = findSelected(LEVELS);

  const renderLevels = (levels: Level[], depth: number): React.ReactNode => {
    return levels
      .filter(l => depth === 0 || expandedLevels.has(levels[0]?.id || ''))
      .map(level => (
        <div key={level.id} className="space-y-2">
          <LevelCard
            level={level}
            depth={depth}
            isSelected={selectedId === level.id}
            onSelect={() => setSelectedId(level.id)}
            onExpand={() => toggleExpand(level.id)}
          />
          {expandedLevels.has(level.id) && level.children && (
            <div className="ml-6 border-l-2 border-dashed border-slate-200 pl-4 space-y-3">
              {renderLevels(level.children, depth + 1)}
            </div>
          )}
        </div>
      ));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3">
          <Link href="/learn/geography/visualize">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />返回
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-bold text-slate-800">天体系统层级图</h1>
          </div>
          <Badge className="bg-purple-100 text-purple-700">第一章</Badge>
        </div>

        {/* 说明卡片 */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-800">天体系统层级关系</h3>
                <p className="text-sm text-purple-700 mt-1">
                  宇宙中天体按引力作用形成多级系统：可观测宇宙 → 银河系 → 太阳系 → 地月系。点击每个层级查看详情，展开查看下级系统。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 层级导航图 */}
        <div className="flex items-center justify-center gap-2 py-2 overflow-x-auto">
          {['可观测宇宙', '银河系', '太阳系', '地月系'].map((name, i) => (
            <div key={name} className="flex items-center gap-2">
              <button
                onClick={() => {
                  const ids = ['universe', 'milkyway', 'solar-system', 'earth-moon'];
                  setSelectedId(ids[i]);
                  setExpandedLevels(new Set(ids.slice(0, i + 1)));
                }}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium transition-all
                  ${selectedId === ['universe', 'milkyway', 'solar-system', 'earth-moon'][i]
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {name}
              </button>
              {i < 3 && <ArrowRight className="h-4 w-4 text-slate-400" />}
            </div>
          ))}
        </div>

        {/* 层级树状图 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ZoomIn className="h-4 w-4" />
              点击查看详情 · 数字按钮展开子级
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderLevels(LEVELS, 0)}
          </CardContent>
        </Card>

        {/* 选中详情面板 */}
        {selected && (
          <Card className={`bg-gradient-to-br ${LEVEL_COLORS[Math.min(LEVELS[0] ? 0 : 0, LEVEL_COLORS.length - 1)]} border-0`}>
            <CardContent className="p-5 text-white">
              <h3 className="text-xl font-bold mb-2">{selected.name}</h3>
              <p className="text-sm text-white/80 mb-3">{selected.scale}</p>
              <p className="leading-relaxed">{selected.description}</p>
              {selected.features && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selected.features.map((f, i) => (
                    <span key={i} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 高考考点 */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-800 mb-2">📚 高考考点</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 天体系统的层级关系：能按从大到小排列各层级</li>
              <li>• 太阳系八大行星分类：类地、巨气、远日行星</li>
              <li>• 地球存在生命的条件：内因+外因分析</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
