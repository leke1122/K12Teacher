'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowLeft, BookOpen, Sparkles, Languages, FileText, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';

const classicalTexts = [
  {
    id: '劝学',
    title: '劝学',
    author: '荀子',
    dynasty: '战国',
    pages: '20-25',
    difficulty: '中等',
    keyPoints: ['学习的意义', '学习的态度', '学习的方法', '实词：已、青、取、蓝', '虚词：而、则、乎'],
    description: '论述学习的意义、方法和态度，强调学习不可以已。',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: '师说',
    title: '师说',
    author: '韩愈',
    dynasty: '唐',
    pages: '26-31',
    difficulty: '中等',
    keyPoints: ['从师的重要性', '道之所存', '师者角色', '实词：师、道、惑', '句式：判断句'],
    description: '论述从师学习的必要性和择师标准，批判当时士大夫耻学于师的风气。',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: '屈原列传',
    title: '屈原列传',
    author: '司马迁',
    dynasty: '汉',
    pages: '120-128',
    difficulty: '困难',
    keyPoints: ['屈原生平', '政治遭遇', '创作《离骚》', '实词：疾、王、穷', '虚词：其、之'],
    description: '叙述屈原的生平事迹，评述其政治遭遇和文学成就。',
    color: 'from-red-500 to-orange-600',
  },
  {
    id: '苏武传',
    title: '苏武传',
    author: '班固',
    dynasty: '汉',
    pages: '129-138',
    difficulty: '困难',
    keyPoints: ['苏武牧羊', '民族气节', '实词：啮、杖、徙', '文化常识：匈奴、单于'],
    description: '记述苏武出使匈奴被扣留十九年，坚守汉节的故事。',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: '过秦论',
    title: '过秦论',
    author: '贾谊',
    dynasty: '汉',
    pages: '139-147',
    difficulty: '困难',
    keyPoints: ['秦统一原因', '秦亡原因', '实词：过、亡、却', '句式：被动句、判断句'],
    description: '分析秦王朝迅速灭亡的原因，论述"仁义不施"的观点。',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    id: '五代史伶官传序',
    title: '五代史伶官传序',
    author: '欧阳修',
    dynasty: '宋',
    pages: '148-153',
    difficulty: '困难',
    keyPoints: ['盛衰之理', '人事的作用', '实词：盛、衰、忽微', '论点：忧劳兴国'],
    description: '通过后唐庄宗盛衰史，阐明"忧劳可以兴国"的道理。',
    color: 'from-slate-500 to-gray-600',
  },
  {
    id: '种树郭橐驼传',
    title: '种树郭橐驼传',
    author: '柳宗元',
    dynasty: '唐',
    pages: '160-166',
    difficulty: '中等',
    keyPoints: ['种树之道', '养生之道', '实词：橐、驼、莳', '词类活用'],
    description: '借种树之道论述为政之道，讽刺官吏繁政扰民。',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: '登泰山记',
    title: '登泰山记',
    author: '姚鼐',
    dynasty: '清',
    pages: '167-172',
    difficulty: '简单',
    keyPoints: ['泰山日出', '登山线路', '实词：乘、限、采', '地理：泰山、日观峰'],
    description: '记述作者冬日登泰山观日出的经过，描写泰山壮丽景色。',
    color: 'from-cyan-500 to-blue-600',
  },
];

export default function ClassicalTextListPage() {
  const { settings } = useSettingsStore();
  const [filter, setFilter] = useState<string>('全部');

  const filteredTexts = filter === '全部'
    ? classicalTexts
    : classicalTexts.filter(t => t.difficulty === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/subjects/chinese">
                <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200">语文 · 文言文精读</h1>
                <p className="text-sm text-slate-500">统编版必修上册 · 新高考Ⅱ卷考点</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">8篇</Badge>
              <Badge variant="outline" className="text-xs">辽宁高考</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 筛选 */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {(['全部', '简单', '中等', '困难'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f}
            </Button>
          ))}
          <div className="flex-1" />
          {!settings?.deepseekKey && (
            <p className="text-xs text-amber-500">⚠️ 请先在设置中配置 API Key</p>
          )}
        </div>

        {/* 篇目列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTexts.map((text) => (
            <Link key={text.id} href={`/learn/chinese/classical/${encodeURIComponent(text.id)}`}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full cursor-pointer group">
                <div className={`h-2 bg-gradient-to-r ${text.color}`} />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        text.difficulty === '简单' ? 'border-green-300 text-green-600' :
                        text.difficulty === '困难' ? 'border-red-300 text-red-600' :
                        'border-amber-300 text-amber-600'
                      )}
                    >
                      {text.difficulty}
                    </Badge>
                    <span className="text-xs text-slate-400">第{text.pages}页</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-indigo-600 transition-colors">
                    {text.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">
                    {text.dynasty} · {text.author}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {text.description}
                  </p>

                  {/* 核心考点 */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {text.keyPoints.slice(0, 3).map((point, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {point}
                      </span>
                    ))}
                  </div>

                  {/* 底部功能入口 */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Languages className="h-3 w-3" />逐句翻译
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <FileText className="h-3 w-3" />字词精析
                    </span>
                    <ArrowLeft className="h-3 w-3 text-indigo-500 ml-auto rotate-180" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* 说明卡片 */}
        <Card className="border-0 shadow-lg mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">AI 文言文精读</p>
                <p className="text-xs text-slate-500">专为辽宁新高考Ⅱ卷设计</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <Languages className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">逐句翻译</p>
                  <p className="text-xs">AI逐句翻译，重点字词标注，句式分析</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">字词精析</p>
                  <p className="text-xs">系统提取实词、虚词、句式、文化常识</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">辽宁考点</p>
                  <p className="text-xs">紧扣新高考Ⅱ卷考纲，标注高频考点</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
