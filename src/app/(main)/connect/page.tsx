'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserGradeStore, GRADE_LABELS } from '@/stores/gradeStore';
import { SUBJECTS } from '@/stores/subjectStore';
import { FocusTimer } from '@/components/ui/FocusTimer';
import { HEURISTIC_PROMPTS } from '@/lib/gradeAdapter';
import {
  ArrowLeft, Search, Loader2, Brain, ChevronRight, ChevronDown, Lightbulb, Sparkles
} from 'lucide-react';

interface RelatedLink {
  concept: string;
  subject: string;
  subjectName: string;
  subjectIcon: string;
  topic: string;
  content: string;
  relevance: number;
}

interface ConnectStep {
  step: number;
  prompt: string;
  answer: string;
}

export default function ConnectPage() {
  const router = useRouter();
  const { grade } = useUserGradeStore();
  const [concept, setConcept] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    concept: string;
    relatedLinks: RelatedLink[];
    steps: ConnectStep[];
    fullExplanation: string;
  } | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState<Record<number, boolean>>({});

  const handleSearch = async () => {
    if (!concept.trim()) return;
    setLoading(true);
    setResult(null);
    setActiveStep(0);
    setShowAnswer({});
    try {
      const res = await fetch('/api/connect-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept: concept.trim(), grade }),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json);
      }
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStepAnswer = (step: number) => {
    setShowAnswer((prev) => ({ ...prev, [step]: true }));
    setActiveStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  🔗 串联学习
                </h1>
                <p className="text-xs text-slate-500">把书读乱，发现跨学科联系</p>
              </div>
            </div>
            <Badge variant="outline">{GRADE_LABELS[grade]}</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 概念输入 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              输入核心概念
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="例如：价格、改革、水、矛盾、人口..."
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="text-base"
              />
              <Button onClick={handleSearch} disabled={loading || !concept.trim()} className="gap-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    分析中
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    开始串联
                  </>
                )}
              </Button>
            </div>
            {/* 热门概念提示 */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">试试：</span>
              {['价格', '改革', '水', '矛盾', '人口', '文化', '自然', '贸易', '科技', '发展'].map((c) => (
                <Button
                  key={c}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => { setConcept(c); }}
                >
                  {c}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 结果区域 */}
        {result && (
          <>
            {/* 步骤引导 */}
            <Card className="border-purple-200 dark:border-purple-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  思维引导（分步展开）
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.steps.map((s) => {
                  const answered = showAnswer[s.step];
                  return (
                    <div key={s.step} className={`rounded-lg border p-3 transition-all ${
                      activeStep === s.step ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/30' : ''
                    }`}>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs font-bold text-purple-600 flex-shrink-0">
                          {s.step}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{s.prompt}</p>
                          {answered && s.answer && (
                            <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded border text-sm text-muted-foreground">
                              <p>{s.answer}</p>
                            </div>
                          )}
                          {!answered && s.answer && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2 h-7 text-xs gap-1"
                              onClick={() => handleStepAnswer(s.step)}
                            >
                              {HEURISTIC_PROMPTS.thinking}
                              揭示答案
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* 各学科关联 */}
            {result.relatedLinks.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">📚 各学科关联</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.relatedLinks.map((link, idx) => {
                    const subject = SUBJECTS.find(s => s.id === link.subject);
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-base flex-shrink-0">
                          {subject?.icon || link.subjectIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{link.subjectName}</span>
                            <Badge variant="outline" className="text-[10px]">{link.topic}</Badge>
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              相关度 {Math.round(link.relevance * 100)}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{link.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* 完整讲解 */}
            {result.fullExplanation && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    AI 串联讲解
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {result.fullExplanation}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 底部：专注学习入口 */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      串联学习后，专注攻克！
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      找准一个关联学科，深入学习，建立完整的知识网络
                    </p>
                  </div>
                  <div className="w-48">
                    <FocusTimer onFocusEnd={(mins) => console.log('[串联专注]', mins, '分钟')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 提示 */}
        {!result && !loading && (
          <Card className="text-center py-8">
            <CardContent>
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="font-bold mb-2">什么是串联学习？</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                很多知识不是孤立的！输入一个核心概念，系统会帮你找到各学科中相关的知识点，
                并用"分步引导"的方式，帮你建立跨学科的知识网络。
              </p>
              <div className="mt-6 text-left bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium">💡 示例：输入"价格"</p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>· 政治：价值规律、价格受供求影响</li>
                  <li>· 历史：价格革命（新航路后的物价上涨）</li>
                  <li>· 数学：价格函数 P = a - bQ</li>
                  <li>· 地理：农产品价格受区位因素影响</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
