'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, BookOpen, Target, ChevronRight, CheckCircle, BarChart3, Filter, Sparkles } from 'lucide-react';
import { GrammarDetail } from '@/components/english/grammar/GrammarDetail';
import { GrammarTutor } from '@/components/english/grammar/GrammarTutor';
import { GrammarPractice } from '@/components/english/grammar/GrammarPractice';
import { GRAMMAR_STAGES, ALL_GRAMMAR_POINTS } from '@/data/grammarData';
import type { GrammarPoint } from '@/types/grammar';
import { useSettingsStore } from '@/stores/settingsStore';

interface ProgressMap {
  [key: string]: 'not_started' | 'learning' | 'mastered';
}

function GrammarPageContent() {
  const router = useRouter();
  const { settings } = useSettingsStore();

  const [progress, setProgress] = useState<ProgressMap>({});
  const [selectedStage, setSelectedStage] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState<GrammarPoint | null>(null);
  const [showMode, setShowMode] = useState<'detail' | 'tutor' | 'practice'>('detail');
  const [filterCategory, setFilterCategory] = useState<string>('全部');
  const [loading, setLoading] = useState(false);

  // 加载进度
  useEffect(() => {
    try {
      const saved = localStorage.getItem('grammar-progress');
      if (saved) {
        setProgress(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // 计算各阶段统计
  const getStageStats = (stageNum: number) => {
    const points = GRAMMAR_STAGES.find(s => s.stage === stageNum)?.points || [];
    const mastered = points.filter(p => progress[p.id] === 'mastered').length;
    const learned = points.filter(p => progress[p.id] === 'learning').length;
    return { total: points.length, mastered, learned };
  };

  // 全局统计
  const totalStats = () => {
    const total = ALL_GRAMMAR_POINTS.length;
    const mastered = ALL_GRAMMAR_POINTS.filter(p => progress[p.id] === 'mastered').length;
    const learned = ALL_GRAMMAR_POINTS.filter(p => progress[p.id] === 'learning').length;
    return { total, mastered, learned };
  };

  const currentStage = GRAMMAR_STAGES.find(s => s.stage === selectedStage);
  const currentPoints = currentStage?.points || [];

  // 分类过滤
  const categories = ['全部', ...Array.from(new Set(currentPoints.map(p => p.category)))];
  const filteredPoints = filterCategory === '全部'
    ? currentPoints
    : currentPoints.filter(p => p.category === filterCategory);

  // 更新进度
  const updateProgress = (grammarId: string, status: 'not_started' | 'learning' | 'mastered') => {
    const next = { ...progress, [grammarId]: status };
    setProgress(next);
    localStorage.setItem('grammar-progress', JSON.stringify(next));
  };

  // 加入单词本
  const handleAddToWordBook = async (words: string[]) => {
    if (!settings?.deepseekKey) {
      alert('请先配置 DeepSeek API Key');
      return;
    }
    try {
      const res = await fetch('/api/english/grammar/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: words.map(w => ({ word: w, grammarSource: selectedPoint?.name })),
          apiKey: settings.deepseekKey,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`已加入 ${words.length} 个单词到单词本`);
      }
    } catch {
      alert('加入单词本失败');
    }
  };

  const stats = totalStats();

  // 详情模式
  if (selectedPoint) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="w-full px-4 py-4 space-y-4">
          {/* 顶部导航 */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => { setSelectedPoint(null); setShowMode('detail'); }}
            >
              <ArrowLeft className="h-4 w-4" />
              返回列表
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                语法学习 · {selectedPoint.name}
              </h1>
            </div>
          </div>

          {/* 模式切换 */}
          <div className="flex gap-2">
            {[
              { key: 'detail', label: '📖 详情', icon: '📖' },
              { key: 'tutor', label: '💬 AI讲解', icon: '💬' },
              { key: 'practice', label: '📝 练习', icon: '📝' },
            ].map(m => (
              <Button
                key={m.key}
                size="sm"
                variant={showMode === m.key ? 'default' : 'outline'}
                onClick={() => setShowMode(m.key as 'detail' | 'tutor' | 'practice')}
                className="gap-1"
              >
                <span>{m.label}</span>
              </Button>
            ))}
          </div>

          {/* 内容 */}
          {showMode === 'detail' && (
            <GrammarDetail
              point={selectedPoint}
              mastered={progress[selectedPoint.id] === 'mastered'}
              onAddToWordBook={handleAddToWordBook}
              onTutor={() => setShowMode('tutor')}
              onPractice={() => setShowMode('practice')}
              onMarkMastered={() => {
                const next = progress[selectedPoint.id] === 'mastered'
                  ? 'learning'
                  : 'mastered';
                updateProgress(selectedPoint.id, next);
              }}
            />
          )}
          {showMode === 'tutor' && (
            <div className="h-[75vh]">
              <GrammarTutor
                grammarPoint={selectedPoint}
                onClose={() => setShowMode('detail')}
              />
            </div>
          )}
          {showMode === 'practice' && (
            <GrammarPractice
              grammarPoint={selectedPoint}
              onComplete={(correct, total) => {
                if (correct >= total * 0.8) {
                  updateProgress(selectedPoint.id, 'mastered');
                } else {
                  updateProgress(selectedPoint.id, 'learning');
                }
              }}
              onAddToWordBook={handleAddToWordBook}
            />
          )}
        </div>
      </div>
    );
  }

  // 列表模式
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="w-full px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {/* 顶部 */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              📚 语法学习
            </h1>
            <p className="text-xs text-muted-foreground">
              外研版高中英语 · 8个阶段 · 43个知识点
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={() => router.push('/learn/english/grammar/exam-focus')}
          >
            <Target className="h-4 w-4" />
            高考考点
          </Button>
        </div>

        {/* 全局进度 */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">总体进度</span>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    已掌握 {stats.mastered}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-blue-500" />
                    已学习 {stats.learned}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}%
              </span>
            </div>
            <Progress value={stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0} className="h-2" />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          {/* 左侧：阶段列表 */}
          <div className="w-64 flex-shrink-0 space-y-2">
            <h3 className="text-sm font-semibold text-slate-600 px-1">学习阶段</h3>
            {GRAMMAR_STAGES.map(stage => {
              const st = getStageStats(stage.stage);
              const isActive = stage.stage === selectedStage;
              return (
                <Card
                  key={stage.stage}
                  className={`cursor-pointer transition-all ${isActive ? 'border-blue-400 bg-blue-50 shadow-md' : 'hover:border-blue-200'}`}
                  onClick={() => { setSelectedStage(stage.stage); setSelectedPoint(null); }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-800">{stage.name}</span>
                      <Badge variant="outline" className="text-xs">{st.total}</Badge>
                    </div>
                    <Progress
                      value={st.total > 0 ? (st.mastered / st.total) * 100 : 0}
                      className="h-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 右侧：知识点列表 */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-600">
                {currentStage?.name}
                <span className="ml-2 text-muted-foreground">（{filteredPoints.length}个知识点）</span>
              </h3>
              {/* 分类筛选 */}
              <div className="flex gap-1">
                {categories.slice(0, 5).map(cat => (
                  <Button
                    key={cat}
                    size="sm"
                    variant={filterCategory === cat ? 'default' : 'ghost'}
                    className="text-xs h-7"
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {filteredPoints.map(point => {
              const pStatus = progress[point.id] || 'not_started';
              return (
                <Card
                  key={point.id}
                  className="cursor-pointer hover:border-blue-200 hover:shadow-sm transition-all"
                  onClick={() => { setSelectedPoint(point); setShowMode('detail'); }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-800">{point.name}</span>
                          {pStatus === 'mastered' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <Badge variant="outline" className="text-xs">{point.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {point.explanation.simple}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span>⭐{'⭐'.repeat(Math.min(point.difficulty, 5))}</span>
                          <span>高考权重: #{point.examWeight || '—'}</span>
                          <span>高频词: {point.examples[0]?.keyWords.slice(0, 3).join(', ') || '—'}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GrammarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <GrammarPageContent />
    </Suspense>
  );
}
