'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft, Scroll, FileText, Lightbulb, AlertTriangle, CheckCircle2
} from 'lucide-react';
import {
  ANSWER_TEMPLATES
} from '@/data/history/framework/historyData';

export default function TemplatesPage() {
  const router = useRouter();
  const [expandedDirection, setExpandedDirection] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const copyTemplate = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

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
              <Scroll className="h-6 w-6 text-amber-500" />
              答题模板库
            </h1>
            <p className="text-sm text-muted-foreground">大题金句 · 阶段特征 · 开放性论述训练</p>
          </div>
        </div>

        <Tabs defaultValue="stage" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stage">阶段特征模板</TabsTrigger>
            <TabsTrigger value="open">开放性论述</TabsTrigger>
          </TabsList>

          {/* 阶段特征模板 */}
          <TabsContent value="stage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  阶段特征答题模板
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-100 rounded-lg font-mono text-sm whitespace-pre-wrap">
                  {ANSWER_TEMPLATES.stageFeature.template}
                </div>
                <Button
                  variant="outline"
                  onClick={() => copyTemplate(ANSWER_TEMPLATES.stageFeature.template, 'stage')}
                >
                  {copiedTemplate === 'stage' ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> 已复制</>
                  ) : (
                    <>复制模板</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 高频考查时期 */}
            <Card>
              <CardHeader>
                <CardTitle>高频考查的阶段特征</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { period: '14-16世纪', china: '封建社会走向衰落，君主专制强化，八股取士', world: '封建社会解体，资本主义兴起，文艺复兴', conclusion: '中国内卷式发展，西方突破性发展，中国落伍开端' },
                    { period: '17-18世纪', china: '专制集权达顶峰（军机处），闭关锁国，盛世隐忧', world: '资产阶级革命，资本主义制度确立，工业革命前夜', conclusion: '中国封建顶峰=落日余晖，西方制度+技术双重超越' },
                    { period: '1840-1895', china: '沦为半殖民地半封建社会，农民/地主阶级救亡失败', world: '工业革命完成，自由资本主义扩张', conclusion: '中国被动卷入世界体系，落后挨打' },
                    { period: '1895-1919', china: '民族危机深化，资产阶级改良/革命道路尝试，新民主主义革命开端', world: '第二次工业革命，帝国主义形成，一战', conclusion: '中国救亡道路从资产阶级转向无产阶级' },
                    { period: '1919-1949', china: '新民主主义革命，农村包围城市道路，抗战胜利', world: '一战后危机→大危机→二战→冷战', conclusion: '中国抗战具有世界意义，1949改变世界格局' },
                    { period: '1949-1978', china: '社会主义建设探索，曲折发展', world: '冷战对峙，第三次科技革命', conclusion: '中国在探索中走了弯路，但坚持独立自主' },
                    { period: '1978-至今', china: '改革开放，社会主义市场经济，走近世界舞台中央', world: '冷战结束，多极化，全球化，信息革命', conclusion: '中国从融入世界到贡献中国智慧' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg border">
                      <h4 className="font-medium text-slate-800 mb-2">{item.period}</h4>
                      <div className="grid md:grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-blue-600">中国：</span>
                          <span className="text-slate-600">{item.china}</span>
                        </div>
                        <div>
                          <span className="text-purple-600">世界：</span>
                          <span className="text-slate-600">{item.world}</span>
                        </div>
                        <div>
                          <span className="text-amber-600">结论：</span>
                          <span className="text-slate-600">{item.conclusion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 开放性论述 */}
          <TabsContent value="open" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  三步答题范式
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ANSWER_TEMPLATES.openDiscussion.steps.map((step, i) => (
                  <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{step.step}</Badge>
                      <h4 className="font-medium text-blue-800">{step.name}</h4>
                      <Badge variant="outline" className="ml-auto">{step.requirement}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-green-600">✅ 正确格式：</span>
                        <p className="text-slate-600">{step.correctFormat}</p>
                      </div>
                      {step.wrongFormat && (
                        <div>
                          <span className="text-red-600">❌ 错误格式：</span>
                          <p className="text-slate-600">{step.wrongFormat}</p>
                        </div>
                      )}
                      {step.angles && (
                        <div>
                          <span className="text-blue-600">📐 常用角度：</span>
                          <p className="text-slate-600">{step.angles}</p>
                        </div>
                      )}
                      {step.format && (
                        <div>
                          <span className="text-amber-600">📝 格式范例：</span>
                          <p className="text-slate-600">{step.format}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 8大方向 */}
            <Card>
              <CardHeader>
                <CardTitle>8大高频论述方向</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ANSWER_TEMPLATES.eightDirections.map((dir, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedDirection(expandedDirection === dir.direction ? null : dir.direction)}
                      className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{i + 1}</Badge>
                        <span className="font-medium">{dir.direction}</span>
                      </div>
                      <span className="text-sm text-slate-500">
                        {expandedDirection === dir.direction ? '收起' : '展开'}
                      </span>
                    </button>
                    
                    {expandedDirection === dir.direction && (
                      <div className="p-4 space-y-3 bg-white">
                        <div className="p-3 bg-amber-50 rounded-lg">
                          <h4 className="font-medium text-amber-700 mb-2">示例论题</h4>
                          <p className="text-slate-700 italic">{dir.thesis}</p>
                        </div>
                        <div className="space-y-2">
                          {dir.angles.map((angle, j) => (
                            <div key={j} className="p-3 bg-slate-50 rounded-lg">
                              <h5 className="font-medium text-slate-700 mb-1">角度{j + 1}</h5>
                              <p className="text-sm text-slate-600 whitespace-pre-wrap">{angle}</p>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyTemplate(dir.thesis + '\n\n' + dir.angles.join('\n\n'), `dir-${i}`)}
                        >
                          {copiedTemplate === `dir-${i}` ? (
                            <><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> 已复制</>
                          ) : (
                            <>复制金句</>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 失分陷阱 */}
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  常见失分陷阱
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: '论题模糊', performance: '"论科举制""浅谈洋务运动"——没有判断句', solution: '必须以"……体现了/证明了/根源于/导致/反映/标志了……"表达明确的判断' },
                    { type: '角度单一', performance: '全篇只从"政治方面"或"经济方面"论述', solution: '强制使用"三线法"或"双维法"，至少2个以上不同角度' },
                    { type: '史实空洞', performance: '只有结论没有具体史实支撑，"假大空"', solution: '每个角度至少配1-2个具体史实（精确到时间/事件名称/关键人物）' },
                    { type: '偏离材料', performance: '脱离题目所给材料自说自话，论题与材料无关', solution: '论题必须紧扣材料的核心信息（"根据材料并结合所学知识"）' },
                    { type: '虎头蛇尾', performance: '论证完毕即结束，没有总结升华', solution: '最后一段必须回扣论题（"综上所述……"）+给出历史启示' },
                    { type: '时空错乱', performance: '用A时代的材料论证B时代的问题', solution: '写完每个角度后快速自检：史实是否落在题目限定的时空范围内？' },
                  ].map((trap, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-red-100">
                      <h4 className="font-medium text-red-700 mb-1">{trap.type}</h4>
                      <p className="text-sm text-slate-600 mb-1">典型表现：{trap.performance}</p>
                      <p className="text-sm text-green-600">应对策略：{trap.solution}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
