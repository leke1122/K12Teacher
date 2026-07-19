'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, ArrowRight, Clock, GitBranch, BookOpen, 
  Link2, Target, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { releasedUnits, getUnitById, getAdjacentUnits } from '@/data/history/units';

const transitions = {
  'u1-to-u2': {
    fromUnitId: 'u1',
    toUnitId: 'u2',
    chronologicalBridge: {
      fromPeriod: '秦汉（前221—220）',
      toPeriod: '三国两晋南北朝（220—589）',
      bridgeEvent: '东汉末年黄巾起义→军阀割据→三国鼎立→西晋短暂统一→东晋南朝/十六国北朝',
      bridgeExplanation: '秦汉大一统崩溃后，经历近400年分裂，最终由隋重新统一。分裂中孕育民族交融与制度创新，为隋唐繁盛奠基。',
    },
    thematicBridge: {
      fromTheme: '大一统确立（专制主义中央集权）',
      toTheme: '民族交融与制度创新',
      connection: '秦汉确立的大一统框架（郡县制、中央集权、儒家正统）在魏晋遭遇挑战，但经民族交融与制度调适后，在隋唐以更成熟的形态复兴。',
    },
    evolutionBridges: [
      { systemType: '选官制度', fromState: '察举制（汉）', toState: '九品中正制（魏晋）→科举制（隋唐）', note: '从"品行→门第→考试"' },
      { systemType: '中央官制', fromState: '三公九卿制（秦汉）', toState: '三省六部制（隋唐）', note: '相权三分，皇权强化' },
    ],
    comparisonBridges: [
      { topic: '商鞅变法（一单元）vs 孝文帝改革（二单元）', href: '/learn/history/compare' },
      { topic: '秦朝郡县制（一单元）vs 唐道州县（二单元）', href: '/learn/history/compare' },
    ],
    examMigration: {
      trend: '第一单元★★★（秦始皇统一/汉武帝大一统）→ 第二单元★★★（选官制度/文化成就）',
      note: '命题从"大一统确立"转向"制度创新与民族交融"',
    },
  },
  'u2-to-u3': {
    fromUnitId: 'u2',
    toUnitId: 'u3',
    chronologicalBridge: {
      fromPeriod: '隋唐五代（581—979）',
      toPeriod: '辽宋夏金元（916—1368）',
      bridgeEvent: '唐末藩镇割据→五代十国→北宋结束分裂但未统一全国→辽宋夏金并立→元朝统一',
      bridgeExplanation: '唐朝灭亡后，中国再次进入多民族政权并立时代，最终由元朝完成大一统。民族关系从交融走向更深度的一体化。',
    },
    thematicBridge: {
      fromTheme: '民族交融与制度创新',
      toTheme: '民族政权并立与经济文化繁荣',
      connection: '隋唐的制度创新（三省六部、科举、两税法）为宋元所继承发展；唐末藩镇之乱促使宋初强化中央集权；经济重心在南宋完成南移。',
    },
    evolutionBridges: [
      { systemType: '中央官制', fromState: '三省六部制（隋唐）', toState: '二府三司制（宋）→ 中书一省制（元）', note: '宋分化相权至极，元回归集中' },
      { systemType: '地方行政', fromState: '道州县（唐）', toState: '路州县（宋）→ 行省制（元）', note: '行省制奠定中国省制基础' },
    ],
    comparisonBridges: [
      { topic: '孝文帝改革（二单元）vs 王安石变法（三单元）', href: '/learn/history/compare' },
    ],
    examMigration: {
      trend: '第二单元★★★（选官制度/文化）→ 第三单元★★☆（经济社会/民族政权制度）',
      note: '第三单元辽宁卷无大题，重心在选择题',
    },
  },
};

export default function TransitionPage() {
  const [currentUnitId, setCurrentUnitId] = useState('u1');
  const [understood, setUnderstood] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['chronological']));

  const currentUnit = getUnitById(currentUnitId);
  const { previous, next } = getAdjacentUnits(currentUnitId);
  const transitionKey = `${currentUnitId}-to-${next?.id}`;
  const transition = transitions[transitionKey as keyof typeof transitions];

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  if (!transition) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-purple-50/30 p-6">
        <Card className="max-w-4xl mx-auto p-12 text-center">
          <h1 className="text-2xl font-bold mb-4">衔接页开发中</h1>
          <p className="text-muted-foreground mb-6">下一单元的衔接数据正在整理中...</p>
          <Link href="/subjects/history">
            <Button>返回历史学习中心</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-purple-50/30">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/subjects/history">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Link2 className="h-6 w-6 text-purple-500" />
              单元衔接
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentUnit?.name} → {next?.name}
            </p>
          </div>
        </div>

        {/* 单元导航 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {previous && (
            <Button variant="outline" onClick={() => { setCurrentUnitId(previous.id); setUnderstood(false); }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {previous.name}
            </Button>
          )}
          <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500">
            {currentUnit?.name} → {next?.name}
          </Badge>
          {next && (
            <Button 
              variant="outline" 
              disabled={!understood}
              onClick={() => {
                if (understood) {
                  setCurrentUnitId(next.id);
                  setUnderstood(false);
                }
              }}
            >
              {next.name}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* 五类衔接 */}
        <div className="space-y-4">
          {/* 时序衔接 */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('chronological')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  ⏳ 时序衔接
                </CardTitle>
                {expandedSections.has('chronological') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
            {expandedSections.has('chronological') && (
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">{currentUnit?.name}</p>
                    <p className="font-medium">{transition.chronologicalBridge.fromPeriod}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">{next?.name}</p>
                    <p className="font-medium">{transition.chronologicalBridge.toPeriod}</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-slate-400">
                  <p className="text-xs text-muted-foreground mb-1">衔接事件</p>
                  <p className="text-sm">{transition.chronologicalBridge.bridgeEvent}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm">{transition.chronologicalBridge.bridgeExplanation}</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 主题衔接 */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('thematic')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  🧩 主题衔接
                </CardTitle>
                {expandedSections.has('thematic') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
            {expandedSections.has('thematic') && (
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">{currentUnit?.name}主题</p>
                  <p className="font-medium">{transition.thematicBridge.fromTheme}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg text-center">
                  <p className="text-sm">↓</p>
                  <p className="text-sm">{transition.thematicBridge.connection}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 mb-1">{next?.name}主题</p>
                  <p className="font-medium">{transition.thematicBridge.toTheme}</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 制度演变衔接 */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('evolution')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-green-500" />
                  ⚙️ 制度演变衔接
                </CardTitle>
                {expandedSections.has('evolution') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
            {expandedSections.has('evolution') && (
              <CardContent className="space-y-3">
                {transition.evolutionBridges.map((bridge, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{bridge.systemType}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-600">{bridge.fromState}</span>
                      <span>→</span>
                      <span className="text-purple-600">{bridge.toState}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{bridge.note}</p>
                  </div>
                ))}
                <Link href="/learn/history/evolution">
                  <Button variant="outline" size="sm" className="w-full">
                    <GitBranch className="h-4 w-4 mr-2" />
                    查看完整制度演变轴
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>

          {/* 对比衔接 */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('comparison')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  📊 对比衔接
                </CardTitle>
                {expandedSections.has('comparison') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
            {expandedSections.has('comparison') && (
              <CardContent className="space-y-2">
                {transition.comparisonBridges.map((bridge, i) => (
                  <Link key={i} href={bridge.href}>
                    <div className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                      <p className="text-sm font-medium">{bridge.topic}</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            )}
          </Card>

          {/* 考频迁移 */}
          <Card>
            <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleSection('exam')}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-500" />
                  🎯 考频迁移
                </CardTitle>
                {expandedSections.has('exam') ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>
            {expandedSections.has('exam') && (
              <CardContent className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm">{transition.examMigration.trend}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{transition.examMigration.note}</p>
                </div>
                <Link href="/learn/history/liaoning">
                  <Button variant="outline" size="sm" className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    查看辽宁考情中心
                  </Button>
                </Link>
              </CardContent>
            )}
          </Card>
        </div>

        {/* 底部按钮 */}
        <div className="mt-6 flex flex-col gap-3">
          <Button 
            variant={understood ? 'default' : 'outline'}
            className={`w-full ${understood ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
            onClick={() => setUnderstood(!understood)}
          >
            {understood ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                已理解衔接内容
              </>
            ) : (
              '标记为已理解'
            )}
          </Button>
          {next && (
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={!understood}
              onClick={() => {
                setCurrentUnitId(next.id);
                setUnderstood(false);
              }}
            >
              进入 {next.name}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
