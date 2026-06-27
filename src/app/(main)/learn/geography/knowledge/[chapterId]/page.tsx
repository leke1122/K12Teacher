'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Brain, Loader2, ChevronRight, Lightbulb } from 'lucide-react';
import { updateStepProgress } from '@/lib/geographyProgress';
import { CHAPTER_TITLES } from '@/lib/geographyData';

function KnowledgePageContent() {
  const params = useParams();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : 'compulsory-1';

  const [loading, setLoading] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<{ id: string; title: string; type: string; definition: string; elements: string[]; analogy: string; liaoningExample: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<'definition' | 'question' | 'feedback'>('definition');
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setLoading(true);
    updateStepProgress('geography', chapterId, 'knowledge', 'in_progress');

    // 加载预置知识点
    const defaultItems = [
      {
        id: 'k001',
        type: 'concept',
        title: '热力环流',
        definition: '由于地面冷热不均而形成的空气环流。受热处空气膨胀上升，冷却处空气收缩下沉，近地面形成气压差，引起大气运动。',
        elements: ['冷热不均', '气压差', '空气垂直运动', '空气水平运动'],
        analogy: '就像烧水时，底部的水受热上升，顶部的水冷却下沉，形成对流循环。',
        liaoningExample: '大连滨海地区的海陆风：白天陆地升温快，海洋升温慢，风从海洋吹向陆地（海风）；夜晚相反（陆风）。',
      },
      {
        id: 'k002',
        type: 'concept',
        title: '农业区位因素',
        definition: '影响农业生产布局和发展的各种因素，包括自然因素（气候、地形、土壤、水源）和人文因素（市场、交通、政策、科技）。',
        elements: ['自然因素', '人文因素', '技术因素', '社会经济因素'],
        analogy: '就像开店选址，要考虑客流量（市场）、租金（成本）、交通便利度、竞争对手（产业基础）。',
        liaoningExample: '辽河平原发展水稻：温带季风气候（雨热同期）、黑土肥沃、辽河灌溉、人口密集（市场大）、交通便利。',
      },
      {
        id: 'k003',
        type: 'region',
        title: '辽中南工业基地',
        definition: '位于辽宁省中南部，以沈阳、大连、鞍山为中心的老工业基地，是中国重要的重工业基地。',
        elements: ['煤铁资源丰富', '交通便利', '工业基础好', '产业结构单一'],
        analogy: '就像一个家里有矿的"老大哥"，早年靠挖煤炼钢发家，现在需要转型升级。',
        liaoningExample: '依托丰富的煤、铁、石油资源发展起来，现在面临资源枯竭、环境污染等问题，需向高新技术产业转型。',
      },
    ];

    setKnowledgeItems(defaultItems);
    setLoading(false);
  }, [chapterId]);

  const currentItem = knowledgeItems[currentIndex] || knowledgeItems[0];
  const progress = knowledgeItems.length ? Math.round((currentIndex / knowledgeItems.length) * 100) : 0;

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    setFeedback('很好！你已经理解了这个知识点的核心内容。');
    setStage('feedback');
  };

  const handleNext = () => {
    if (currentIndex < knowledgeItems.length - 1) {
      setCurrentIndex((p) => p + 1);
      setStage('definition');
      setUserAnswer('');
      setShowHint(false);
    } else {
      updateStepProgress('geography', chapterId, 'knowledge', 'completed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="w-full px-4 py-4 space-y-4">
        {/* 顶部 */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Brain className="h-5 w-5 text-emerald-500" />
              🧠 知识点学习 · {CHAPTER_TITLES[chapterId] || chapterId}
            </h1>
            <p className="text-xs text-muted-foreground">
              提取核心概念，掌握必备知识
            </p>
          </div>
        </div>

        {knowledgeItems.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              暂无知识点，请先选择章节。
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 进度 */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    知识点 {currentIndex + 1} / {knowledgeItems.length}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {currentItem.type === 'concept' ? '概念' : currentItem.type === 'law' ? '规律' : currentItem.type === 'process' ? '过程' : '区域'}
                  </Badge>
                </div>
                <Progress value={progress} className="h-1.5" />
              </CardContent>
            </Card>

            {/* 知识点卡片 */}
            <Card>
              <CardHeader className="pb-3 pt-3">
                <CardTitle className="text-base">{currentItem.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">📖 定义</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{currentItem.definition}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">🔑 核心要素</p>
                  <div className="flex flex-wrap gap-1">
                    {currentItem.elements.map((el) => (
                      <Badge key={el} variant="secondary" className="text-xs">
                        {el}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">💡 生活化类比</p>
                  <p className="text-sm text-blue-600">{currentItem.analogy}</p>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs font-medium text-emerald-700 mb-1">📍 辽宁案例</p>
                  <p className="text-sm text-emerald-600">{currentItem.liaoningExample}</p>
                </div>

                {/* 思考题 */}
                {stage === 'definition' && (
                  <div className="space-y-3 pt-2">
                    <p className="text-sm font-medium text-slate-700">
                      🧠 思考：这个知识点的三个关键要素是什么？
                    </p>
                    <Textarea
                      placeholder="写下你的理解..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowHint(!showHint)}
                      >
                        <Lightbulb className="h-4 w-4" />
                        提示
                      </Button>
                      {showHint && (
                        <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                          提示：看看上面列出的核心要素。
                        </p>
                      )}
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!userAnswer.trim()}
                        className="gap-1"
                      >
                        提交 <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 反馈 */}
                {stage === 'feedback' && feedback && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm font-semibold text-emerald-800 mb-1">✅ 反馈</p>
                    <p className="text-sm text-emerald-700">{feedback}</p>
                    <Button size="sm" onClick={handleNext} className="mt-3 gap-1">
                      {currentIndex < knowledgeItems.length - 1 ? '下一个知识点' : '完成学习'} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function GeographyKnowledgePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <KnowledgePageContent />
    </Suspense>
  );
}
