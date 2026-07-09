'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, Brain, Loader2, ChevronRight, Clock, MapPin, Users,
  CheckCircle, XCircle, Sparkles, AlertCircle, RefreshCw, BookOpen
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

interface HistoryKnowledgePoint {
  id: string;
  name: string;
  type: 'event' | 'figure' | 'system' | 'concept';
  time: string;
  location: string;
  figures: string[];
  causes: string;
  process: string;
  effects: string;
  significance: string;
  memoryTip: string;
  relatedEvents: string[];
  source: string;
}

interface HistoryKnowledgeListProps {
  chapterId: string;
  sectionId: string;
  sectionTitle: string;
  onModuleJump?: (moduleId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  event: '历史事件',
  figure: '历史人物',
  system: '政治制度',
  concept: '历史概念',
};

const TYPE_COLORS: Record<string, string> = {
  event: 'bg-red-100 text-red-700',
  figure: 'bg-blue-100 text-blue-700',
  system: 'bg-purple-100 text-purple-700',
  concept: 'bg-green-100 text-green-700',
};

export function HistoryKnowledgeList({ chapterId, sectionId, sectionTitle, onModuleJump }: HistoryKnowledgeListProps) {
  const { settings } = useSettingsStore();
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [items, setItems] = useState<HistoryKnowledgePoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<'definition' | 'quiz' | 'result'>('definition');
  const [question, setQuestion] = useState<{ question: string; options: string[]; correct: number; explanation: string } | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const loadKnowledge = async (forceRefresh = false) => {
    if (forceRefresh) setExtracting(true); else setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/history/knowledge/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          sectionId,
          forceRefresh,
          apiKey: settings?.deepseekKey,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '加载失败');
      setItems(json.data || []);
      setCached(json.cached || false);
      setCurrentIndex(0);
      setStage('definition');
      setQuestion(null);
      setSelectedAnswer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
      setExtracting(false);
    }
  };

  useEffect(() => { loadKnowledge(); }, [chapterId, sectionId]);

  const generateQuiz = async () => {
    if (!currentItem) return;
    try {
      const res = await fetch('/api/history/knowledge/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knowledge: {
            name: currentItem.name,
            time: currentItem.time,
            location: currentItem.location,
            figures: currentItem.figures,
            effects: currentItem.effects,
            significance: currentItem.significance,
          },
          apiKey: settings?.deepseekKey,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '生成失败');
      setQuestion(json.data);
      setStage('quiz');
      setSelectedAnswer(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setStage('result');
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((p) => p + 1);
      setStage('definition');
      setQuestion(null);
      setSelectedAnswer(null);
    }
  };

  const currentItem = items[currentIndex];
  const progress = items.length ? Math.round(((currentIndex + 1) / items.length) * 100) : 0;
  const isCorrect = selectedAnswer === question?.correct;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm text-muted-foreground">正在提取知识点...</span>
        </CardContent>
      </Card>
    );
  }

  if (error && items.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
          <Button size="sm" onClick={() => loadKnowledge()}>重试</Button>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">暂无知识点</p>
          <Button size="sm" variant="outline" onClick={() => loadKnowledge(true)} disabled={extracting}>
            {extracting ? '提取中...' : '从教材提取'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* 进度 */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                知识点 {currentIndex + 1} / {items.length}
              </span>
              {cached && <Badge variant="outline" className="text-xs bg-emerald-50">已缓存</Badge>}
            </div>
            <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs" onClick={() => loadKnowledge(true)} disabled={extracting}>
              {extracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              重新提取
            </Button>
          </div>
          <Progress value={progress} className="h-1.5" />
        </CardContent>
      </Card>

      {/* 知识点卡片 */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              <h3 className="font-semibold text-slate-800">{currentItem?.name}</h3>
            </div>
            {currentItem && (
              <Badge variant="outline" className={`text-xs ${TYPE_COLORS[currentItem.type]}`}>
                {TYPE_LABELS[currentItem.type]}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">来源：{currentItem?.source || '教材'}</p>

          {/* 历史要素 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border p-2">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-slate-500">时间</span>
              </div>
              <p className="text-sm">{currentItem?.time || '-'}</p>
            </div>
            <div className="rounded-lg border p-2">
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-slate-500">地点</span>
              </div>
              <p className="text-sm">{currentItem?.location || '-'}</p>
            </div>
          </div>

          {currentItem?.figures?.length > 0 && (
            <div className="rounded-lg border p-2">
              <div className="flex items-center gap-1 mb-1">
                <Users className="h-3 w-3 text-amber-500" />
                <span className="text-xs text-slate-500">相关人物</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentItem.figures.map((f, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-2">
            <p className="text-xs font-medium text-amber-700 mb-1">原因</p>
            <p className="text-sm text-slate-700">{currentItem?.causes || '-'}</p>
          </div>

          <div className="rounded-lg border p-2">
            <p className="text-xs font-medium text-slate-500 mb-1">过程</p>
            <p className="text-sm text-slate-700">{currentItem?.process || '-'}</p>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-2">
            <p className="text-xs font-medium text-red-700 mb-1">影响</p>
            <p className="text-sm text-slate-700">{currentItem?.effects || '-'}</p>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-2">
            <p className="text-xs font-medium text-purple-700 mb-1">历史意义</p>
            <p className="text-sm text-slate-700">{currentItem?.significance || '-'}</p>
          </div>

          {currentItem?.memoryTip && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-medium text-emerald-700 mb-1">记忆小贴士</p>
              <p className="text-sm text-emerald-800">{currentItem.memoryTip}</p>
            </div>
          )}

          {/* 练习 */}
          {stage === 'definition' && (
            <div className="pt-2 border-t flex justify-between items-center">
              <Button size="sm" variant="outline" className="gap-1" onClick={generateQuiz} disabled={!settings?.deepseekKey}>
                <Sparkles className="h-3.5 w-3.5" />
                生成练习题
              </Button>
              <Button size="sm" variant="ghost" className="gap-1" onClick={handleNext}>
                {currentIndex < items.length - 1 ? <>下一个 <ChevronRight className="h-4 w-4" /></> : '完成'}
              </Button>
            </div>
          )}

          {stage === 'quiz' && question && (
            <div className="pt-2 border-t space-y-2">
              <p className="text-sm font-medium text-slate-700">{question.question}</p>
              <div className="space-y-1">
                {question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg border text-sm transition-all",
                      selectedAnswer === idx
                        ? idx === question.correct ? "bg-emerald-100 border-emerald-300" : "bg-red-100 border-red-300"
                        : "bg-white border-slate-200 hover:border-indigo-300"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {stage === 'result' && question && (
            <div className={cn("rounded-lg p-3 space-y-2", isCorrect ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200")}>
              <div className="flex items-center gap-2">
                {isCorrect ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                <p className="text-sm font-semibold">{isCorrect ? '回答正确！' : '回答错误'}</p>
              </div>
              <p className="text-sm text-slate-700">{question.explanation}</p>
              <Button size="sm" onClick={handleNext}>
                {currentIndex < items.length - 1 ? <>下一个 <ChevronRight className="h-4 w-4" /></> : '完成'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 知识点导航 */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-2">知识点列表</p>
          <div className="flex flex-wrap gap-1">
            {items.map((item, idx) => (
              <Button
                key={item.id}
                size="sm"
                variant={idx === currentIndex ? 'default' : 'ghost'}
                className="text-xs h-7"
                onClick={() => { setCurrentIndex(idx); setStage('definition'); setQuestion(null); setSelectedAnswer(null); }}
              >
                {idx + 1}. {item.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
