'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, BookOpen, Loader2, Sparkles, Volume2, VolumeX,
  CheckCircle, AlertTriangle, MessageSquare, Save, RotateCcw, PenLine
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from 'sonner';
import { pinyin } from 'pinyin-pro';

type ExamQuestion = {
  id: string;
  type: 'choice';
  question: string;
  options: string[];
  correct: string;
  analysis: string;
  userAnswer?: string;
};

type ChinesePoem = {
  id: string;
  title: string;
  author: string;
  dynasty?: string;
  category?: string;
  book_name?: string;
  original_text: string;
  translation?: string;
  annotations?: Record<string, string>;
  content_analysis?: string;
  exam_points?: string[];
};

function annotateChineseText(text: string) {
  const chars = Array.from(text);
  const nodes: Array<{ char: string; pinyin?: string; isPunctuation: boolean }> = [];

  for (const char of chars) {
    const code = char.codePointAt(0) || 0;
    const isChinese = (code >= 0x4E00 && code <= 0x9FFF) || (code >= 0x3400 && code <= 0x4DBF);
    if (!isChinese) {
      nodes.push({ char, isPunctuation: true });
      continue;
    }

    let py: string | undefined;
    try {
      py = pinyin(char, { toneType: 'symbol', type: 'array' })?.[0];
    } catch {
      py = undefined;
    }
    nodes.push({ char, pinyin: py, isPunctuation: false });
  }

  return nodes;
}

function buildAnnotatedHtml(text: string) {
  const nodes = annotateChineseText(text);
  return nodes
    .map((node) => {
      if (node.isPunctuation) {
        return node.char;
      }
      if (node.pinyin) {
        return `<ruby>${node.char}<rt class="text-[10px] leading-none">${node.pinyin}</rt></ruby>`;
      }
      return node.char;
    })
    .join('');
}

function splitForTts(text: string): string[] {
  const parts = text.split(/(?<=[。！？；\n])/g);
  return parts.map((s) => s.trim()).filter(Boolean);
}

function speakChinese(text: string, settings: ReturnType<typeof useSettingsStore.getState>['settings']) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const segments = splitForTts(text);
  if (!segments.length) return;

  const natural = settings.ttsNaturalMode !== false;
  let index = 0;

  function next() {
    if (index >= segments.length) return;
    const utterance = new SpeechSynthesisUtterance(segments[index]);
    utterance.lang = 'zh-CN';
    utterance.rate = natural ? (settings.ttsRate ?? 0.85) : 1;
    utterance.pitch = natural ? (settings.ttsPitch ?? 1.1) : 1;
    utterance.volume = 1;
    utterance.onend = () => {
      index += 1;
      next();
    };
    utterance.onerror = () => {
      index += 1;
      next();
    };
    window.speechSynthesis.speak(utterance);
  }

  next();
}

function ChinesePoemDetailPageContent() {
  const params = useParams();
  const poemId = params.poemId as string;
  const { settings } = useSettingsStore();
  const [poem, setPoem] = useState<ChinesePoem | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [mastery, setMastery] = useState(0);
  const [reciteCount, setReciteCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});

  const annotatedHtml = useMemo(() => {
    if (!poem?.original_text) return '';
    return buildAnnotatedHtml(poem.original_text);
  }, [poem?.original_text]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/chinese/classical-poems?id=${encodeURIComponent(poemId)}`);
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || '加载失败');
        }
        const record = (json.data || []).find((item: any) => item.id === poemId);
        if (!record) throw new Error('未找到该篇目');
        setPoem(record);
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };
    if (poemId) load();
  }, [poemId]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, []);

  const handleToggleSpeak = () => {
    if (!poem) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakChinese(poem.original_text, settings);
  };

  useEffect(() => {
    if (!speaking) return;
    const check = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setSpeaking(false);
        clearInterval(check);
      }
    }, 500);
    return () => clearInterval(check);
  }, [speaking]);

  const handleGenerateQuestions = async () => {
    if (!poem || !settings.deepseekKey) {
      toast.error('请先在设置中配置 DeepSeek API Key');
      return;
    }
    setLoadingQuestions(true);
    try {
      const res = await fetch('/api/chinese/classical-exam-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poem, apiKey: settings.deepseekKey }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '生成失败');
      setExamQuestions(json.data || []);
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : '生成失败');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleGenerateExplanation = async () => {
    if (!poem || !settings.deepseekKey) {
      toast.error('请先在设置中配置 DeepSeek API Key');
      return;
    }
    setLoadingExplanation(true);
    try {
      const res = await fetch('/api/chinese/classical-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poem, apiKey: settings.deepseekKey }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '生成失败');
      setExplanation(json.data || '');
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : '生成失败');
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleSubmitAnswer = async (question: ExamQuestion, answer: string) => {
    if (!settings.deepseekKey) {
      toast.error('请先在设置中配置 DeepSeek API Key');
      return;
    }
    try {
      const res = await fetch('/api/chinese/classical-answer-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, userAnswer: answer, apiKey: settings.deepseekKey }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || '反馈失败');
      toast.success('已批改完成');
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : '反馈失败');
    }
  };

  const handleSaveProgress = () => {
    if (!poem) return;
    const key = `chinese_poem_progress_${poemId}`;
    const payload = { mastery, reciteCount, lastStudied: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
    setSaved(true);
    toast.success('学习进度已保存');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReciteCount = () => {
    setReciteCount((v) => v + 1);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>未找到该篇目</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">该篇目不存在或尚未导入，请先导入古诗文数据。</p>
            <Button asChild>
              <Link href="/learn/chinese">返回语文学习中心</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/learn/chinese"><ArrowLeft className="mr-2 h-4 w-4" /> 返回列表</Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold">{poem.title}</h1>
          <p className="text-sm text-slate-500">{poem.author} {poem.dynasty} {poem.category} {poem.book_name ? `· ${poem.book_name}` : ''}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant={poem.category === '诗词曲' ? 'secondary' : 'outline'}>{poem.category || '古诗文'}</Badge>
          <Button type="button" variant={speaking ? 'destructive' : 'default'} onClick={handleToggleSpeak}>
            {speaking ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
            {speaking ? '停止朗读' : '朗读'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> 学习进度</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">掌握程度</p>
            <div className="flex items-center gap-2">
              <Progress value={mastery} className="h-2" />
              <span className="text-xs text-slate-600">{mastery}%</span>
            </div>
            <div className="mt-2 flex gap-2">
              <Button type="button" size="xs" variant="outline" onClick={() => setMastery((v) => Math.max(0, v - 10))}>-10%</Button>
              <Button type="button" size="xs" variant="outline" onClick={() => setMastery((v) => Math.min(100, v + 10))}>+10%</Button>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500">背诵次数</p>
            <p className="text-2xl font-semibold">{reciteCount}</p>
            <Button type="button" size="xs" className="mt-2" onClick={handleReciteCount}>完成背诵 +1</Button>
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={handleSaveProgress}>
              <Save className="mr-2 h-4 w-4" /> {saved ? '已保存' : '保存进度'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="original" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="original">原文+拼音</TabsTrigger>
          <TabsTrigger value="translation">翻译</TabsTrigger>
          <TabsTrigger value="notes">注释</TabsTrigger>
          <TabsTrigger value="analysis">讲解</TabsTrigger>
          <TabsTrigger value="exam">考点问答</TabsTrigger>
        </TabsList>

        <TabsContent value="original">
          <Card>
            <CardHeader>
              <CardTitle>原文</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px] rounded-md border p-4">
                <div
                  className="whitespace-pre-wrap font-serif leading-9 text-lg [&_rt]:text-slate-500"
                  dangerouslySetInnerHTML={{ __html: annotatedHtml }}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translation">
          <Card>
            <CardHeader>
              <CardTitle>全文翻译</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px] rounded-md border p-4">
                <p className="whitespace-pre-wrap font-serif text-base leading-8 text-slate-700">
                  {poem.translation || '暂无翻译'}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>重点字词注释</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px] rounded-md border">
                {poem.annotations && Object.keys(poem.annotations).length ? (
                  <div className="divide-y">
                    {Object.entries(poem.annotations).map(([word, meaning]) => (
                      <div key={word} className="flex flex-col gap-1 p-3 md:flex-row md:items-start md:gap-4">
                        <span className="font-mono text-base font-semibold text-slate-900">{word}</span>
                        <span className="text-sm text-slate-700">{meaning as string}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-sm text-slate-500">暂无注释</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> 内容讲解</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[240px] rounded-md border p-4">
                <p className="whitespace-pre-wrap font-serif text-base leading-8 text-slate-700">
                  {poem.content_analysis || '暂无讲解'}
                </p>
              </ScrollArea>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleGenerateExplanation} disabled={loadingExplanation}>
                  {loadingExplanation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  AI讲解
                </Button>
              </div>
              <ScrollArea className="h-[220px] rounded-md border p-4">
                <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{explanation || '点击“AI讲解”生成延伸讲解'}</div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exam">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> 考点问答</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[220px] rounded-md border p-4">
                <div className="flex flex-wrap gap-2">
                  {(poem.exam_points || []).map((item) => (
                    <Badge key={item} variant="outline">{item}</Badge>
                  ))}
                  {!poem.exam_points?.length && <p className="text-sm text-slate-500">暂无考点</p>}
                </div>
              </ScrollArea>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleGenerateQuestions} disabled={loadingQuestions}>
                  {loadingQuestions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  生成思考题
                </Button>
              </div>
              <div className="space-y-4">
                {examQuestions.map((q) => (
                  <Card key={q.id} className="space-y-3">
                    <CardHeader>
                      <CardTitle className="text-base">{q.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-2">
                        {q.options.map((option) => (
                          <label key={option} className="flex items-center gap-2 rounded-md border p-2 text-sm hover:bg-slate-50">
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={option}
                              disabled={showAnswer[q.id]}
                              onChange={async (e) => {
                                setExamQuestions((prev) => prev.map((item) => item.id === q.id ? { ...item, userAnswer: e.target.value } : item));
                                await handleSubmitAnswer(q, e.target.value);
                                setShowAnswer((prev) => ({ ...prev, [q.id]: true }));
                              }}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                      {showAnswer[q.id] && (
                        <div className="rounded-md border bg-slate-50 p-3 text-sm">
                          <p className="font-medium">正确答案：{q.correct}</p>
                          <p className="mt-1 text-slate-600">{q.analysis}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {!examQuestions.length && !loadingQuestions && <p className="text-sm text-slate-500">点击“生成思考题”开始练习</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ChinesePoemDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    }>
      <ChinesePoemDetailPageContent />
    </Suspense>
  );
}
