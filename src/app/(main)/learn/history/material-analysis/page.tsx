'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, FileText, Loader2, Send, Sparkles, Target,
  Lightbulb, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const materialTypes = ['墓志', '诏令', '方志', '诗词', '数据表', '综合'];

const sampleMaterials = [
  {
    id: 'm1',
    type: '墓志',
    title: '北魏元氏墓志',
    content: '公讳某，字某，北魏宗室也。曾祖太武皇帝，祖文成皇帝。公幼而聪颖，好学不倦。孝文皇帝深器之，引为近臣。及迁都洛阳，公力赞其事，以为国家万世之基也。',
    question: '阅读以上材料，结合所学知识，回答：\n（1）材料中的"孝文皇帝"指谁？他推行了什么改革？\n（2）墓志中"迁都洛阳"有何历史意义？\n（3）从材料中可以看出元氏家族在北魏的地位如何？',
    answer: `【答案】

（1）孝文皇帝指北魏孝文帝拓跋宏（元宏）。他推行了汉化改革，包括：
- 迁都洛阳
- 改汉姓
- 着汉服
- 与汉族通婚
- 学习汉族语言文字

（2）迁都洛阳的历史意义：
- 摆脱保守势力干扰
- 接受汉族先进文化
- 促进民族交融
- 推动封建化进程
- 为隋唐大一统奠定基础

（3）元氏家族地位：
- 北魏宗室
- 与皇室关系密切
- 在汉化改革中起积极作用
- 代表了鲜卑族贵族接受汉文化的主流`,
  },
  {
    id: 'm2',
    type: '诏令',
    title: '汉武帝推恩令',
    content: '主父偃偃说上曰："古者诸侯地不过百里，强弱之形易制。今诸侯或连城数十，地方千里，缓则骄奢易为淫乱，急则阻其强而合从以逆京师。今以法割削之，则逆节萌起，前日晁错是也。今诸侯子弟或十数，而适嗣代立，余虽骨肉，无尺寸之地，则仁孝之道不宣。愿陛下令诸侯得推恩分子弟，以地侯之。彼人人喜得所愿，上以德施，实分其国，必稍自削弱不能为患。"',
    question: '阅读材料，结合所学知识，回答：\n（1）材料反映的是什么制度？由谁提出？\n（2）这一制度的目的是什么？\n（3）这一制度有何历史作用？',
    answer: `【答案】

（1）材料反映的是"推恩令"，由主父偃提出。

（2）推恩令的目的：
- 削弱诸侯王势力
- 加强中央集权
- 巩固大一统

（3）历史作用：
- 巧妙地将诸侯王的封地分割给其子弟
- 使诸侯国越分越小，无力对抗中央
- 巩固了西汉的中央集权统治
- 为后世解决地方割据提供了范例`,
  },
  {
    id: 'm3',
    type: '诗词',
    title: '宋代诗词中的商业繁荣',
    content: '《望海潮》柳永\n东南形胜，三吴都会，钱塘自古繁华。烟柳画桥，风帘翠幕，参差十万人家。云树绕堤沙，怒涛卷霜雪，天堑无涯。市列珠玑，户盈罗绮，竟豪奢。\n\n重湖叠巘清嘉，有三秋桂子，十里荷花。羌管弄晴，菱歌泛夜，嬉嬉钓叟莲娃。千骑拥高牙，乘醉听箫鼓，吟赏烟霞。异日图将好景，归去凤池夸。',
    question: '阅读以上材料，回答：\n（1）词中描绘的是哪座城市？有哪些繁华景象？\n（2）这些描写反映了宋代经济发展的什么特点？\n（3）结合所学，分析宋代城市经济繁荣的原因。',
    answer: `【答案】

（1）词中描绘的是杭州（钱塘）。繁华景象包括：
- 人口众多："参差十万人家"
- 建筑繁华："烟柳画桥，风帘翠幕"
- 市场繁荣："市列珠玑，户盈罗绮"
- 娱乐丰富："羌管弄晴，菱歌泛夜"

（2）反映的特点：
- 商业高度繁荣
- 城市规模扩大
- 市民文化兴起
- 商品经济活跃

（3）繁荣原因：
- 农业发展，粮食产量提高
- 手工业进步，特别是丝织业
- 纸币出现（交子），商业便利
- 坊市制度打破，商业活动不受限制
- 政策宽松，商业环境改善`,
  },
];

export default function MaterialAnalysisPage() {
  const [selectedMaterial, setSelectedMaterial] = useState<typeof sampleMaterials[0] | null>(null);
  const [answer, setAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [filterType, setFilterType] = useState('all');

  const filteredMaterials = filterType === 'all' 
    ? sampleMaterials 
    : sampleMaterials.filter(m => m.type === filterType);

  const handleGrade = () => {
    if (!answer.trim()) return;
    setIsGrading(true);
    // 模拟AI评分
    setTimeout(() => {
      setGradeResult({
        score: 28,
        maxScore: 30,
        feedback: '答案完整，能准确分析材料并结合所学知识。建议：\n1. 答题时注意分点明确\n2. 结合材料的分析可以更充分\n3. 注意答案的条理性',
        suggestions: ['加强材料分析能力', '注意答题规范'],
      });
      setIsGrading(false);
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-orange-50/30">
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
              <Target className="h-6 w-6 text-orange-500" />
              材料分析专项
            </h1>
            <p className="text-sm text-muted-foreground">
              辽宁高考风格材料题训练 · AI 智能评分
            </p>
          </div>
          <Badge variant="outline" className="bg-orange-50">
            {sampleMaterials.length} 道练习
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧：材料列表 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">材料列表</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {/* 类型筛选 */}
              <div className="flex flex-wrap gap-1 mb-4">
                <Button
                  size="sm"
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                >
                  全部
                </Button>
                {materialTypes.map(type => (
                  <Button
                    key={type}
                    size="sm"
                    variant={filterType === type ? 'default' : 'outline'}
                    onClick={() => setFilterType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredMaterials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => {
                      setSelectedMaterial(material);
                      setAnswer('');
                      setGradeResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedMaterial?.id === material.id
                        ? 'border-orange-400 bg-orange-50 shadow-md'
                        : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">{material.type}</Badge>
                      {selectedMaterial?.id === material.id && (
                        <CheckCircle2 className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium">{material.title}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 右侧：作答区 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {selectedMaterial ? selectedMaterial.title : '选择材料开始练习'}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {selectedMaterial ? (
                <div className="space-y-4">
                  {/* 材料 */}
                  <div className="p-4 bg-slate-100 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm">📜 材料</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedMaterial.content}
                    </p>
                  </div>

                  {/* 问题 */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium mb-2 text-sm text-blue-800">❓ 问题</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedMaterial.question}
                    </p>
                  </div>

                  {/* 作答区 */}
                  <div>
                    <h4 className="font-medium mb-2 text-sm">✍️ 作答</h4>
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="请在此作答..."
                      className="min-h-[150px]"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {answer.length} 字
                      </span>
                      <Button
                        size="sm"
                        disabled={!answer.trim() || isGrading}
                        onClick={handleGrade}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {isGrading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            评分中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-1" />
                            AI 评分
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 评分结果 */}
                  {gradeResult && (
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-emerald-600" />
                        <h4 className="font-medium text-emerald-800">评分结果</h4>
                      </div>
                      <div className="text-center mb-3">
                        <span className="text-4xl font-bold text-emerald-600">{gradeResult.score}</span>
                        <span className="text-lg text-emerald-500">/{gradeResult.maxScore}</span>
                      </div>
                      <p className="text-sm text-emerald-700 whitespace-pre-wrap mb-3">
                        {gradeResult.feedback}
                      </p>
                      {gradeResult.suggestions && (
                        <div className="pt-3 border-t border-emerald-200">
                          <p className="text-xs text-emerald-600 font-medium mb-1">改进建议：</p>
                          <ul className="text-xs text-emerald-700 list-disc list-inside">
                            {gradeResult.suggestions.map((s: string, i: number) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 参考答案 */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-primary">
                      查看参考答案
                    </summary>
                    <div className="mt-2 p-4 bg-slate-100 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-sans">
                        {selectedMaterial.answer}
                      </pre>
                    </div>
                  </details>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p>请从左侧选择一道材料题</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
