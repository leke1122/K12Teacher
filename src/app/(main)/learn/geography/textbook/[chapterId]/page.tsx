'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Loader2, ChevronRight, Lightbulb } from 'lucide-react';
import { updateStepProgress } from '@/lib/geographyProgress';
import { CHAPTER_TITLES } from '@/lib/geographyData';

function TextbookPageContent() {
  const params = useParams();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : 'compulsory-1';

  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<'reading' | 'question' | 'feedback'>('reading');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setLoading(false);
    updateStepProgress('geography', chapterId, 'textbook', 'in_progress');
  }, [chapterId]);

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    setFeedback('很好！你已经理解了这段内容的核心观点。');
    setStage('feedback');
  };

  const handleNext = () => {
    setStage('reading');
    setUserAnswer('');
    setFeedback(null);
    setShowHint(false);
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
              <BookOpen className="h-5 w-5 text-emerald-500" />
              📖 课本还原 · {CHAPTER_TITLES[chapterId] || chapterId}
            </h1>
            <p className="text-xs text-muted-foreground">
              理解教材内容，掌握核心概念
            </p>
          </div>
        </div>

        {/* 材料展示 */}
        <Card className="bg-white">
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base">📄 教材原文</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-4">
              <p className="text-sm leading-relaxed text-slate-700">
                热力环流是大气运动最简单的形式。由于地面冷热不均而形成的空气环流，称为热力环流。
                当两地之间存在气温差异，造成两地之间气压差，引起大气运动。
                例如，白天陆地升温快，气温高，空气膨胀上升，近地面形成低气压；海洋升温慢，气温低，空气收缩下沉，近地面形成高气压。
                近地面空气从海洋流向陆地，形成海风。
              </p>
            </div>

            {stage === 'reading' && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-800 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  💡 地理小贴士：这段内容属于自然地理中的大气运动部分，是理解全球大气环流的基础。
                </p>
              </div>
            )}

            {/* 思考题 */}
            {stage === 'reading' && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  🧠 思考：这段内容的核心观点是什么？请用自己的话概括。
                </p>
                <Textarea
                  placeholder="写下你的理解..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="min-h-[100px]"
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
                      提示：注意材料中提到的"冷热不均"和"气压差"两个关键词。
                    </p>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!userAnswer.trim()}
                    className="gap-1"
                  >
                    提交回答 <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 反馈 */}
            {stage === 'feedback' && feedback && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                <p className="text-sm font-semibold text-emerald-800">✅ 反馈</p>
                <p className="text-sm text-emerald-700">{feedback}</p>
                <details className="rounded-lg border border-slate-200">
                  <summary className="cursor-pointer px-3 py-2 text-sm text-slate-600 hover:text-slate-800">
                    查看完整解析
                  </summary>
                  <div className="px-3 py-2 border-t bg-slate-50">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      热力环流是由于地面冷热不均而形成的空气环流。其形成过程为：
                      受热处空气膨胀上升，近地面形成低气压；冷却处空气收缩下沉，近地面形成高气压。
                      近地面空气从高气压流向低气压，形成风。
                      这是大气运动最简单的形式，也是理解全球大气环流、海陆风、山谷风等的基础。
                    </p>
                  </div>
                </details>
                <Button size="sm" onClick={handleNext} className="gap-1">
                  继续学习 <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 进度 */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>课本还原学习进度</span>
              <span>第1段 / 共3段</span>
            </div>
            <Progress value={33} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function GeographyTextbookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <TextbookPageContent />
    </Suspense>
  );
}
