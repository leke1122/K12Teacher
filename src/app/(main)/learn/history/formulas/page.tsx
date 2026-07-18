'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Sparkles, Volume2, Eye, CheckCircle2, RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { releasedUnits, getUnitById } from '@/data/history/units';

const formulasData = {
  u1: [
    {
      id: 'f-u1-1',
      period: '中华文明起源',
      formula: '多元一体源流长，黄河长江两中心；仰韶彩陶种粟米，河姆渡水稻蚕丝',
      explanation: '中华文明起源多元一体，黄河和长江流域是两大中心。仰韶文化以彩陶和粟米种植为特色，河姆渡文化则以水稻种植和蚕丝著称。',
    },
    {
      id: 'f-u1-2',
      period: '早期国家',
      formula: '夏商西周奴隶制，分封宗法礼乐制；嫡长子继承宗法核，家国同宗血缘联',
      explanation: '夏商西周是奴隶制社会，核心制度是分封制、宗法制、礼乐制。宗法制的核心是嫡长子继承制，以血缘关系为纽带形成家国一体的结构。',
    },
    {
      id: 'f-u1-3',
      period: '春秋战国秦汉',
      formula: '春秋战国大变革，铁犁牛耕小农兴；商鞅变法秦统一，专制集权郡县行；汉承秦制大一统，罢黜百家尊儒术',
      explanation: '春秋战国时期铁犁牛耕出现，小农经济形成。商鞅变法使秦国强大并最终统一。实行专制主义中央集权和郡县制。汉朝继承秦制，汉武帝大一统，罢黜百家独尊儒术。',
    },
  ],
  u2: [
    {
      id: 'f-u2-1',
      period: '分裂交融期',
      formula: '三国两晋南北朝，北乱南移开发江南；孝文汉化促交融，民族同宗奠隋唐',
      explanation: '三国两晋南北朝时期战乱频繁，北方人口南迁开发江南。孝文帝改革推行汉化政策，促进了民族交融，为隋唐大一统奠定基础。',
    },
    {
      id: 'f-u2-2',
      period: '统一繁盛期',
      formula: '隋唐大一统，贞观开元盛；三省六部科举兴，租庸调后两税法',
      explanation: '隋唐实现大一统，贞观之治和开元盛世是唐朝最繁荣的时期。三省六部制完善，科举制创立。赋税制度从租庸调制发展到两税法。',
    },
    {
      id: 'f-u2-3',
      period: '制度创新',
      formula: '选官演变四阶段，世袭察举九品科；中央三省六部制，地方州县道州行；赋税租庸到两税，以财产为主夏秋征',
      explanation: '选官制度经历世袭制、察举制、九品中正制、科举制四个阶段。中央官制从三公九卿发展到三省六部。地方行政从郡县发展到道州县。赋税从按人丁征收的租庸调发展为按财产征收的两税法。',
    },
  ],
  u3: [
    {
      id: 'f-u3-1',
      period: '两宋政治',
      formula: '宋初集权分事权，重文轻武积贫弱；庆历新政王安石，变法失败北宋亡',
      explanation: '宋朝建立后，为防止割据而集权分事权，实行重文轻武政策，导致积贫积弱。庆历新政和王安石变法试图改革，但都失败了，北宋最终灭亡。',
    },
    {
      id: 'f-u3-2',
      period: '辽夏金元制度',
      formula: '辽朝南北面官制，西夏仿宋设官职；金朝猛安谋克兵，元朝行省辖边疆',
      explanation: '辽朝实行南北面官制，南面官管汉人，北面官管契丹人。西夏仿照宋朝设立官职。金朝实行猛安谋克兵制。元朝创立行省制度，有效管辖边疆。',
    },
    {
      id: 'f-u3-3',
      period: '经济社会',
      formula: '农业稻麦复种兴，手工业瓷丝造船强；交子出现商业繁，坊市打破夜市兴；经济重心南移成，南宋完成大转折',
      explanation: '宋代农业发达，稻麦复种技术推广。手工业以瓷器、丝绸、造船业最发达。交子是最早的纸币，商业繁荣，坊市制度被打破，经济重心南移在南宋完成。',
    },
    {
      id: 'f-u3-4',
      period: '文化',
      formula: '程朱理学宋代理，存天灭欲格物致知；宋词元曲文学兴，三大发明传四方',
      explanation: '宋代程朱理学成为官方哲学，主张"存天理灭人欲"，通过格物致知认识天理。文学上宋词元曲兴盛。四大发明在这一时期传播到世界各地。',
    },
  ],
};

export default function FormulasPage() {
  const [activeUnit, setActiveUnit] = useState('u1');
  const [selectedFormula, setSelectedFormula] = useState<typeof formulasData.u1[0] | null>(null);
  const [mode, setMode] = useState<'read' | 'memorize'>('read');
  const [showExplanation, setShowExplanation] = useState(false);
  const [masteredFormulas, setMasteredFormulas] = useState<Set<string>>(new Set());

  const unit = getUnitById(activeUnit);
  const currentFormulas = formulasData[activeUnit as keyof typeof formulasData] || [];

  const toggleMastered = (id: string) => {
    const newMastered = new Set(masteredFormulas);
    if (newMastered.has(id)) {
      newMastered.delete(id);
    } else {
      newMastered.add(id);
    }
    setMasteredFormulas(newMastered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
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
              <Sparkles className="h-6 w-6 text-violet-500" />
              阶段特征口诀
            </h1>
            <p className="text-sm text-muted-foreground">
              背诵口诀记忆历史特征 · {masteredFormulas.size}/{Object.values(formulasData).flat().length} 已掌握
            </p>
          </div>
        </div>

        {/* 单元选择 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {releasedUnits.map((u) => (
                <Button
                  key={u.id}
                  variant={activeUnit === u.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setActiveUnit(u.id);
                    setSelectedFormula(null);
                  }}
                >
                  {u.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧：口诀列表 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{unit?.name} · 口诀</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {currentFormulas.map((formula) => {
                  const isMastered = masteredFormulas.has(formula.id);
                  const isSelected = selectedFormula?.id === formula.id;
                  
                  return (
                    <button
                      key={formula.id}
                      onClick={() => setSelectedFormula(formula)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isSelected 
                          ? 'border-violet-400 bg-violet-50 shadow-md' 
                          : 'border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                      } ${isMastered ? 'bg-emerald-50' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">{formula.period}</Badge>
                        {isMastered && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-sm font-medium leading-relaxed">{formula.formula}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 右侧：口诀详情 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {selectedFormula ? selectedFormula.period : '选择口诀查看详情'}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto">
              {selectedFormula ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-violet-100 to-purple-100 rounded-lg">
                    <p className="text-base font-medium leading-relaxed">
                      {selectedFormula.formula}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMode('read')}
                      className={mode === 'read' ? 'bg-violet-100' : ''}
                    >
                      <Volume2 className="h-4 w-4 mr-1" />
                      朗读版
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMode('memorize')}
                      className={mode === 'memorize' ? 'bg-violet-100' : ''}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      跟读模式
                    </Button>
                  </div>

                  {mode === 'read' ? (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">📖 解释</h4>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {selectedFormula.explanation}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="font-medium text-sm mb-2 text-amber-800">🎯 跟读练习</h4>
                      <p className="text-sm text-amber-700 mb-3">
                        尝试背诵口诀，然后查看解释对照。
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setShowExplanation(!showExplanation)}
                      >
                        {showExplanation ? '隐藏解释' : '显示解释'}
                      </Button>
                      {showExplanation && (
                        <p className="text-sm leading-relaxed text-amber-700 mt-3">
                          {selectedFormula.explanation}
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    variant={masteredFormulas.has(selectedFormula.id) ? 'default' : 'outline'}
                    className="w-full gap-2"
                    onClick={() => toggleMastered(selectedFormula.id)}
                  >
                    {masteredFormulas.has(selectedFormula.id) ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        已掌握
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        标记为已掌握
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p>请从左侧选择一条口诀</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
