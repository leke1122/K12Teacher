'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Loader2, ChevronRight, Lightbulb, RefreshCw, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { HISTORY_CHAPTERS } from '@/lib/historyData';
import { updateStepProgress } from '@/lib/historyProgress';
import { useSettingsStore } from '@/stores/settingsStore';

// 段落讲解类型
interface ParagraphExplain {
  paragraphText: string;
  time: string;
  location: string;
  figures: string[];
  core: string;
  effects: string;
  significance: string;
}

// 章节内容类型
interface ChapterContent {
  chapterId: string;
  title: string;
  paragraphs: ParagraphExplain[];
}

function TextbookPageContent() {
  const params = useParams();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : 'modern-china';
  const { settings } = useSettingsStore();

  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [content, setContent] = useState<ChapterContent | null>(null);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [stage, setStage] = useState<'reading' | 'question' | 'feedback'>('reading');
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chapterInfo = HISTORY_CHAPTERS[chapterId as keyof typeof HISTORY_CHAPTERS] || {
    title: chapterId,
    subtitle: '',
  };

  useEffect(() => {
    updateStepProgress('history', chapterId, 'textbook', 'in_progress');
    loadContent();
  }, [chapterId]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history/textbook/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, apiKey: settings?.deepseekKey }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || '加载失败');
      }
      setContent(json.data);
      setCurrentParagraphIndex(0);
      setStage('reading');
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setExplaining(true);
    setError(null);
    try {
      const res = await fetch('/api/history/textbook/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId, apiKey: settings?.deepseekKey }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || '刷新失败');
      }
      setContent(json.data);
      setCurrentParagraphIndex(0);
      setStage('reading');
      setUserAnswer('');
      setFeedback(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '刷新失败');
    } finally {
      setExplaining(false);
    }
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    setFeedback('很好！你已经理解了这部分内容的核心观点。');
    setStage('feedback');
  };

  const handleNext = () => {
    if (content && currentParagraphIndex < content.paragraphs.length - 1) {
      setCurrentParagraphIndex((p) => p + 1);
      setStage('reading');
      setUserAnswer('');
      setFeedback(null);
      setShowHint(false);
    } else {
      updateStepProgress('history', chapterId, 'textbook', 'completed');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        <p className="text-sm text-muted-foreground">正在从教材中提取讲解内容...</p>
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
        <div className="w-full px-4 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </div>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-700 mb-4">{error}</p>
              <Button onClick={loadContent}>重试</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentParagraph = content?.paragraphs[currentParagraphIndex];
  const totalParagraphs = content?.paragraphs.length || 0;
  const progress = totalParagraphs > 0 ? Math.round(((currentParagraphIndex + 1) / totalParagraphs) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <div className="w-full px-4 py-4 space-y-4">
        {/* 顶部 */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              历史课本还原 · {chapterInfo.title}
            </h1>
            <p className="text-xs text-muted-foreground">
              {chapterInfo.subtitle} · 基于教材原文，深度讲解历史要素
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleRefresh}
            disabled={explaining}
          >
            {explaining ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {explaining ? '生成中' : '重新讲解'}
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-3 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        {content && content.paragraphs.length > 0 && (
          <>
            {/* 进度 */}
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    第 {currentParagraphIndex + 1} / {totalParagraphs} 段
                  </span>
                  <Badge variant="outline" className="text-xs bg-amber-50">
                    课本还原
                  </Badge>
                </div>
                <Progress value={progress} className="h-1.5" />
              </CardContent>
            </Card>

            {/* 教材原文 */}
            <Card className="bg-white">
              <CardHeader className="pb-3 pt-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>📄 教材原文</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-slate-50 p-4">
                  <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {currentParagraph?.paragraphText || '暂无内容'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 历史讲解 */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader className="pb-3 pt-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>🎓 历史讲解</span>
                  <Badge className="bg-amber-500 text-xs">严格基于教材</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 历史要素 */}
                <div className="grid grid-cols-2 gap-3">
                  {/* 时间 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-slate-500">时间</span>
                    </div>
                    <p className="text-base text-slate-800">
                      {currentParagraph?.time || '教材未明确提及'}
                    </p>
                  </div>

                  {/* 地点 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-slate-500">地点</span>
                    </div>
                    <p className="text-base text-slate-800">
                      {currentParagraph?.location || '教材未明确提及'}
                    </p>
                  </div>
                </div>

                {/* 人物 */}
                {currentParagraph?.figures && currentParagraph.figures.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-slate-500">关键人物</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {currentParagraph.figures.map((figure, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {figure}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 核心内容 */}
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">📖 核心内容</p>
                  <p className="text-base text-slate-700">{currentParagraph?.core || '教材未明确提及'}</p>
                </div>

                {/* 影响 */}
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">📍 影响</p>
                  <p className="text-base text-slate-700">{currentParagraph?.effects || '教材未明确提及'}</p>
                </div>

                {/* 历史意义 */}
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                  <p className="text-xs font-medium text-purple-700 mb-1">⭐ 历史意义</p>
                  <p className="text-base text-slate-700">{currentParagraph?.significance || '教材未明确提及'}</p>
                </div>

                {/* 阅读提示 */}
                {stage === 'reading' && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm text-amber-800 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      阅读提示：仔细阅读上方教材原文，结合讲解理解历史要素。
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 思考题 */}
            <Card>
              <CardHeader className="pb-3 pt-3">
                <CardTitle className="text-base">🧠 思考</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stage === 'reading' && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">
                      请结合教材原文和讲解，思考：这段历史内容的时间、地点、人物、原因、影响各是什么？
                    </p>
                    <Textarea
                      placeholder="写下你的理解..."
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
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
                          提示：注意提取每个历史要素——时间、地点、人物、原因（背景）、影响（结果）。
                        </p>
                      )}
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!userAnswer.trim()}
                        className="gap-1"
                      >
                        提交思考 <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {stage === 'feedback' && feedback && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                    <p className="text-sm font-semibold text-emerald-800">✅ 反馈</p>
                    <p className="text-sm text-emerald-700">{feedback}</p>
                    <Button size="sm" onClick={handleNext} className="gap-1">
                      {currentParagraphIndex < totalParagraphs - 1 ? (
                        <>下一段 <ChevronRight className="h-4 w-4" /></>
                      ) : (
                        '完成学习'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {content && content.paragraphs.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">暂无教材内容</p>
              <p className="text-xs text-muted-foreground mb-4">
                请先上传历史教材
              </p>
              <Button variant="outline" onClick={handleRefresh}>
                刷新
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function HistoryTextbookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      }
    >
      <TextbookPageContent />
    </Suspense>
  );
}
