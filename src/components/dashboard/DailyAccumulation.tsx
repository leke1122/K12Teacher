'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserGradeStore, GRADE_LABELS } from '@/stores/gradeStore';
import { localFallback } from '@/lib/localFallback';
import { CheckCircle2, ChevronDown, ChevronUp, Brain, RotateCcw } from 'lucide-react';

interface AccumulationItem {
  id: string;
  subject: string;
  subjectIcon: string;
  type: string;
  content: string;
  meaning: string;
  example?: string;
  whyImportant: string;
  frequency?: string;
  connection?: { related: string; hint: string };
}

export function DailyAccumulation() {
  const { grade } = useUserGradeStore();
  const [items, setItems] = useState<AccumulationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  useEffect(() => {
    fetchContent();
    loadMastered();
    loadStreak();
  }, [grade]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily-accumulation?grade=${grade}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.items);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMastered = async () => {
    const saved = await localFallback.load<string[]>('mastered_accumulation');
    if (saved) {
      setMasteredIds(new Set(saved));
    }
  };

  const loadStreak = () => {
    const s = parseInt(localStorage.getItem('edumind_accumulation_streak') || '0', 10);
    setStreak(s);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleMastered = async (item: AccumulationItem) => {
    const next = new Set(masteredIds);
    next.add(item.id);
    setMasteredIds(next);
    await localFallback.save('mastered_accumulation', Array.from(next));

    // 更新连续天数
    const todayKey = new Date().toISOString().split('T')[0];
    const lastKey = localStorage.getItem('edumind_accumulation_last_date');
    const newStreak = lastKey === todayKey ? streak : streak + 1;
    localStorage.setItem('edumind_accumulation_last_date', todayKey);
    localStorage.setItem('edumind_accumulation_streak', String(newStreak));
    setStreak(newStreak);

    // 保存到单词掌握表
    await localFallback.save('word_mastery', [
      { word: item.content, level: 3, lastPracticed: new Date().toISOString(), meaning: item.meaning }
    ]);
  };

  const handleReset = () => {
    setMasteredIds(new Set());
    localFallback.save('mastered_accumulation', []);
  };

  const visibleItems = items.filter(i => !masteredIds.has(i.id));

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            📖 每日积累
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">加载中...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            📖 每日积累
            {streak >= 7 && <Badge variant="secondary" className="text-xs">🔥 连续{streak}天</Badge>}
          </CardTitle>
          <span className="text-xs text-muted-foreground">{today}</span>
        </div>
        <p className="text-xs text-muted-foreground">当前：{GRADE_LABELS[grade]}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleItems.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm text-muted-foreground">今日内容已全部掌握！</p>
            <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={handleReset}>
              <RotateCcw className="h-3 w-3 mr-1" />
              重置
            </Button>
          </div>
        ) : (
          visibleItems.map((item) => {
            const isExpanded = expandedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`rounded-lg border p-2 transition-all ${
                  masteredIds.has(item.id) ? 'opacity-50' : ''
                }`}
              >
                {/* 头部：学科 + 内容 */}
                <button
                  className="w-full text-left flex items-center justify-between gap-2"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-base flex-shrink-0">{item.subjectIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] px-1 py-0">
                          {item.type}
                        </Badge>
                        <span className="text-sm font-bold truncate">{item.content}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{item.meaning}</p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {/* 展开内容 */}
                {isExpanded && (
                  <div className="mt-2 pt-2 border-t space-y-2">
                    {/* 示例 */}
                    {item.example && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-2">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">例句</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">{item.example}</p>
                      </div>
                    )}

                    {/* 高考常考提示 */}
                    {item.whyImportant && (
                      <div className="flex items-start gap-1.5">
                        <Brain className="h-3 w-3 mt-0.5 text-amber-500 flex-shrink-0" />
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {item.whyImportant}
                          {item.frequency && <span className="ml-1">{item.frequency}</span>}
                        </p>
                      </div>
                    )}

                    {/* 关联提醒 */}
                    {item.connection && (
                      <div className="flex items-start gap-1.5">
                        <Brain className="h-3 w-3 mt-0.5 text-purple-500 flex-shrink-0" />
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          {item.connection.hint}
                        </p>
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs gap-1"
                        onClick={() => handleMastered(item)}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        已掌握
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => toggleExpand(item.id)}
                      >
                        收起
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
