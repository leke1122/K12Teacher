'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, GitBranch, Clock, MapPin, Coins, Building,
  ChevronRight, Info
} from 'lucide-react';
import Link from 'next/link';

const evolutionChains = [
  {
    id: 'system-official',
    systemType: '选官制度',
    icon: BookIcon,
    color: 'blue',
    title: '选官制度演变',
    nodes: [
      { dynasty: '先秦', system: '世袭制', year: '前2070-前221', 
        background: '奴隶社会时期', 
        content: '以血缘关系为标准，贵族世代相传' ,
        impact: '维护奴隶主贵族特权' },
      { dynasty: '汉', system: '察举制', year: '前206-220',
        background: '大一统帝国建立',
        content: '以品行和才能为标准，察举孝廉' ,
        impact: '打破世袭，但仍有门第限制' },
      { dynasty: '魏晋', system: '九品中正制', year: '220-589',
        background: '士族势力膨胀',
        content: '分九品评定人才，以家世为主' ,
        impact: '形成门阀士族' },
      { dynasty: '隋唐', system: '科举制', year: '581-907',
        background: '打破士族垄断',
        content: '以考试成绩为标准，公开竞争' ,
        impact: '打破垄断，扩大统治基础' },
      { dynasty: '宋元', system: '科举完善', year: '960-1368',
        background: '印刷术普及',
        content: '糊名誊录，防止作弊' ,
        impact: '更加公平公正' },
      { dynasty: '明清', system: '八股取士', year: '1368-1905',
        background: '君主专制加强',
        content: '八股文格式，思想控制' ,
        impact: '思想僵化，但仍是主要选官方式' },
    ],
  },
  {
    id: 'system-local',
    systemType: '地方行政',
    icon: MapPin,
    color: 'green',
    title: '地方行政制度演变',
    nodes: [
      { dynasty: '西周', system: '分封制', year: '前1046-前771',
        background: '疆域广大，周天子统治',
        content: '层层分封，诸侯有自主权' ,
        impact: '易形成割据' },
      { dynasty: '秦', system: '郡县制', year: '前221-前206',
        background: '统一六国',
        content: '郡守县令由中央任免' ,
        impact: '加强中央集权' },
      { dynasty: '汉', system: '郡国并行', year: '前206-220',
        background: '吸取秦亡教训',
        content: '郡县与封国并存' ,
        impact: '七国之乱后削弱王国' },
      { dynasty: '唐', system: '道州县', year: '618-907',
        background: '疆域辽阔',
        content: '道-州-县三级' ,
        impact: '加强对地方控制' },
      { dynasty: '宋', system: '路州县', year: '960-1279',
        background: '吸取藩镇教训',
        content: '路-州-县，分化事权' ,
        impact: '强干弱枝' },
      { dynasty: '元', system: '行省制', year: '1271-1368',
        background: '疆域空前辽阔',
        content: '中书省派出机构' ,
        impact: '奠定省制基础' },
      { dynasty: '明清', system: '省府县', year: '1368-1912',
        background: '沿用并完善',
        content: '省-府/州-县' ,
        impact: '影响至今' },
    ],
  },
  {
    id: 'system-tax',
    systemType: '赋税制度',
    icon: Coins,
    color: 'amber',
    title: '赋税制度演变',
    nodes: [
      { dynasty: '先秦', system: '贡赋制', year: '前2070-前221',
        background: '奴隶社会',
        content: '诸侯向天子贡纳' ,
        impact: '维持统治秩序' },
      { dynasty: '春秋', system: '初税亩', year: '前685',
        background: '生产发展',
        content: '按亩收税' ,
        impact: '承认土地私有' },
      { dynasty: '汉', system: '编户齐民', year: '前206-220',
        background: '大一统',
        content: '人口登记，人头税为主' ,
        impact: '加强对农民控制' },
      { dynasty: '唐前期', system: '租庸调制', year: '618-780',
        background: '轻徭薄赋',
        content: '租（粟米）+ 庸（劳役）+ 调（绢布）' ,
        impact: '保障农业生产' },
      { dynasty: '唐后期', system: '两税法', year: '780',
        background: '土地兼并',
        content: '按资产分夏秋两季征收' ,
        impact: '简化税制，但负担转嫁' },
      { dynasty: '明', system: '一条鞭法', year: '1581',
        background: '商品经济发展',
        content: '赋税折银征收' ,
        impact: '适应商品经济发展' },
      { dynasty: '清', system: '摊丁入亩', year: '1720s',
        background: '人口增长',
        content: '废除人头税' ,
        impact: '促进人口增长' },
    ],
  },
  {
    id: 'system-central',
    systemType: '中央官制',
    icon: Building,
    color: 'purple',
    title: '中央官制演变',
    nodes: [
      { dynasty: '秦', system: '三公九卿制', year: '前221-前207',
        background: '统一六国',
        content: '丞相、太尉、御史大夫 + 九卿' ,
        impact: '开创中央官制' },
      { dynasty: '汉', system: '中外朝制', year: '前206-220',
        background: '加强皇权',
        content: '内朝（尚书台）分割外朝相权' ,
        impact: '削弱相权' },
      { dynasty: '隋唐', system: '三省六部制', year: '581-907',
        background: '制度完善',
        content: '中书（起草）- 门下（审议）- 尚书（执行）' ,
        impact: '分散相权，强化皇权' },
      { dynasty: '宋', system: '二府三司制', year: '960-1279',
        background: '分化事权',
        content: '中书门下 + 枢密院 + 三司' ,
        impact: '进一步削弱相权' },
      { dynasty: '元', system: '中书一省制', year: '1271-1368',
        background: '少数民族统治',
        content: '中书省总揽政务' ,
        impact: '相权再次集中' },
      { dynasty: '明', system: '废丞相设内阁', year: '1380',
        background: '加强皇权',
        content: '废除丞相，六部直属皇帝' ,
        impact: '皇权达到顶峰' },
      { dynasty: '清', system: '军机处', year: '1729',
        background: '西北军务',
        content: '军机大臣跪受笔录' ,
        impact: '君主专制顶峰' },
    ],
  },
];

function BookIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  );
}

export default function EvolutionPage() {
  const [selectedChain, setSelectedChain] = useState(evolutionChains[0]);
  const [selectedNode, setSelectedNode] = useState<typeof selectedChain.nodes[0] | null>(null);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-green-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
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
              <GitBranch className="h-6 w-6 text-green-500" />
              跨单元制度演变轴
            </h1>
            <p className="text-sm text-muted-foreground">
              4 条制度演变主线 · 点击查看详情
            </p>
          </div>
        </div>

        {/* 制度类型选择 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {evolutionChains.map((chain) => {
            const Icon = chain.icon;
            const isSelected = selectedChain.id === chain.id;
            return (
              <button
                key={chain.id}
                onClick={() => {
                  setSelectedChain(chain);
                  setSelectedNode(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? `border-${chain.color}-400 bg-${chain.color}-50` 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                style={{
                  borderColor: isSelected ? 
                    chain.color === 'blue' ? '#3b82f6' : 
                    chain.color === 'green' ? '#22c55e' :
                    chain.color === 'amber' ? '#f59e0b' : '#a855f7' : undefined,
                  backgroundColor: isSelected ? 
                    chain.color === 'blue' ? '#eff6ff' : 
                    chain.color === 'green' ? '#f0fdf4' :
                    chain.color === 'amber' ? '#fffbeb' : '#faf5ff' : undefined,
                }}
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                  chain.color === 'blue' ? 'text-blue-500' :
                  chain.color === 'green' ? 'text-green-500' :
                  chain.color === 'amber' ? 'text-amber-500' : 'text-purple-500'
                }`} />
                <p className="text-sm font-medium text-center">{chain.systemType}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 中间：演变时间轴 */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                {selectedChain.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              <div className="relative">
                {/* 时间轴线 */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400" />
                
                <div className="space-y-4 pl-4">
                  {selectedChain.nodes.map((node, index) => {
                    const isLast = index === selectedChain.nodes.length - 1;
                    return (
                      <div key={index} className="relative flex gap-4">
                        {/* 时间节点 */}
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg ${
                          selectedNode?.dynasty === node.dynasty 
                            ? 'ring-4 ring-green-400 bg-green-500' 
                            : 'bg-slate-300 hover:bg-slate-400'
                        }`}
                          style={{
                            backgroundColor: selectedNode?.dynasty === node.dynasty ? 
                              selectedChain.color === 'blue' ? '#3b82f6' :
                              selectedChain.color === 'green' ? '#22c55e' :
                              selectedChain.color === 'amber' ? '#f59e0b' : '#a855f7' : undefined
                          }}
                        >
                          {node.dynasty}
                        </div>
                        
                        {/* 内容 */}
                        <button
                          onClick={() => setSelectedNode(node)}
                          className={`flex-1 p-4 rounded-lg border text-left transition-all ${
                            selectedNode?.dynasty === node.dynasty
                              ? 'border-green-400 bg-green-50 shadow-md'
                              : 'border-slate-200 hover:border-green-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold">{node.system}</span>
                            <Badge variant="outline" className="text-xs">{node.year}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{node.content}</p>
                          
                          {!isLast && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <ChevronRight className="h-3 w-3" />
                              <span>→</span>
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 右侧：详情 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">制度详情</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg">
                    <p className="text-lg font-bold">{selectedNode.system}</p>
                    <p className="text-sm text-muted-foreground">{selectedNode.dynasty} · {selectedNode.year}</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                    <h4 className="font-medium text-sm mb-1 flex items-center gap-1">
                      <Info className="h-4 w-4 text-amber-500" />
                      背景
                    </h4>
                    <p className="text-sm">{selectedNode.background}</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <h4 className="font-medium text-sm mb-1">主要内容</h4>
                    <p className="text-sm">{selectedNode.content}</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                    <h4 className="font-medium text-sm mb-1">历史影响</h4>
                    <p className="text-sm">{selectedNode.impact}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <GitBranch className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p>点击左侧时间轴查看详情</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
