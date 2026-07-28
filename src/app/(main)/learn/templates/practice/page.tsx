'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  Scroll,
  Sparkles,
  RefreshCw,
  Star,
  ThumbsUp,
} from 'lucide-react';

type Level = 1 | 2 | 3;

interface TemplateData {
  templateType?: string;
  templateTitle?: string;
  templateStructure?: string;
  blanks?: { id: string; position: string; hint: string; answer: string }[];
  exercise?: {
    question?: string;
    filledTemplate?: string;
  };
  structure?: Record<string, string[]>;
  checklist?: { item: string; points: string }[];
  question?: {
    material?: string;
    question?: string;
  };
  requiredStructure?: {
    introduction?: string;
    body?: string[];
    conclusion?: string;
  };
}

const SUBJECT_CONFIG: Record<string, {
  title: string;
  color: string;
  chapters: Record<string, { title: string }>;
}> = {
  history: {
    title: '历史',
    color: 'amber',
    chapters: {
      unit1: { title: '第一单元：从中华文明起源到秦汉统一' },
      unit2: { title: '第二单元：三国两晋南北朝到隋唐' },
      unit3: { title: '第三单元：辽宋夏金元' },
    },
  },
  politics: {
    title: '政治',
    color: 'pink',
    chapters: {
      ch1: { title: '第一课：社会主义从空想到科学' },
      ch2: { title: '第二课：社会主义从理论到现实' },
      ch3: { title: '第三课：中国特色社会主义' },
    },
  },
  geography: {
    title: '地理',
    color: 'emerald',
    chapters: {
      ch1: { title: '第一章：宇宙中的地球' },
      ch2: { title: '第二章：地球上的大气' },
      ch3: { title: '第三章：地球上的水' },
    },
  },
};

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string }> = {
  amber: { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-600' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-200', text: 'text-pink-600' },
  emerald: { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-600' },
};

export default function TemplatesPracticePage() {
  return (
    <Suspense fallback={<Loading />}>
      <TemplatesPracticeContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
        <p className="mt-2 text-sm text-slate-500">加载中...</p>
      </div>
    </div>
  );
}

function TemplatesPracticeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const subject = (searchParams.get('subject') || 'history') as string;
  const chapterId = (searchParams.get('chapter') || 'unit1') as string;
  
  const config = SUBJECT_CONFIG[subject] || SUBJECT_CONFIG.history;
  const chapter = config.chapters[chapterId] || { title: '' };
  const colors = COLOR_CLASSES[config.color] || COLOR_CLASSES.amber;

  const [level, setLevel] = useState<Level>(1);
  const [generating, setGenerating] = useState(false);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; feedback: string; improvements?: string[] } | null>(null);

  const generateTemplate = useCallback(async () => {
    setGenerating(true);
    setTemplateData(null);
    setUserInputs({});
    setShowResult(false);

    try {
      const res = await fetch('/api/thinking/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          chapterId,
          level: `L${level}`,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTemplateData(json.data);
      }
    } catch (err) {
      console.error('生成失败:', err);
    } finally {
      setGenerating(false);
    }
  }, [subject, chapterId, level]);

  useEffect(() => {
    generateTemplate();
  }, [generateTemplate]);

  const handleInputChange = (id: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmitScoring = async () => {
    if (!templateData) return;
    setLoading(true);

    try {
      const templateType = templateData.templateType || templateData.templateTitle || '';
      const templateStructure = templateData.templateStructure || '';
      const refAnswers = JSON.stringify(templateData.blanks || templateData.structure || {}, null, 2);
      const userAnswers = JSON.stringify(userInputs, null, 2);
      
      const userPrompt = '请评价学生以下答题模板填空表现：\n\n学生作答：\n' + userAnswers + '\n\n题目要求：\n模板类型：' + templateType + '\n模板结构：' + templateStructure + '\n\n参考答案：\n' + refAnswers + '\n\n评分维度：\n- 要点完整性\n- 表达准确性\n- 逻辑连贯性\n\n请返回 JSON 格式：\n{\n  "score": 分数(0-100),\n  "feedback": "整体评价",\n  "improvements": ["改进建议1", "改进建议2"]\n}';
      
      const res = await fetch('/api/thinking/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject,
          type: 'template',
          userAnswer: userInputs,
          referenceAnswer: templateData.blanks || templateData.structure,
          prompt: userPrompt,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setScoreResult(json.data);
        setShowResult(true);
      }
    } catch (err) {
      console.error('评分失败:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-50 dark:from-slate-900 dark:via-amber-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/learn/thinking">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div className="flex-1" />
          <Badge className={`${colors.bg} ${colors.text} gap-1`}>
            <Brain className="h-3 w-3" />
            {config.title} · 答题模板
          </Badge>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 rounded-full shadow-sm mb-4">
            <Scroll className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium">答题模板训练 · 怎么做</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            答题模板填空
          </h1>
          <p className="text-slate-500 text-sm">{chapter.title}</p>
        </div>

        {/* 难度选择 */}
        <Card className={`mb-6 ${colors.border.replace('border-', 'border-')}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className={`h-4 w-4 ${colors.text}`} />
                <span className="text-sm font-medium">难度选择</span>
              </div>
              <div className="flex gap-2">
                {([1, 2, 3] as Level[]).map((l) => (
                  <Button
                    key={l}
                    size="sm"
                    variant={level === l ? 'default' : 'outline'}
                    onClick={() => setLevel(l)}
                    className={level === l ? `bg-${config.color}-500` : ''}
                  >
                    L{l} {l === 1 ? '填空' : l === 2 ? '结构' : '自主'}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 生成按钮 */}
        <div className="flex justify-center mb-6">
          <Button onClick={generateTemplate} disabled={generating} className={`gap-2 bg-${config.color}-500 hover:bg-${config.color}-600`}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'AI 生成中...' : '生成新模板'}
          </Button>
        </div>

        {/* 内容 */}
        {generating ? (
          <Card className="mb-6">
            <CardContent className="p-12 text-center">
              <Loader2 className={`h-12 w-12 animate-spin mx-auto ${colors.text} mb-4`} />
              <p className="text-slate-500">AI 正在生成专属答题模板...</p>
            </CardContent>
          </Card>
        ) : templateData ? (
          <div className="space-y-6">
            {/* 模板介绍 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className={`h-5 w-5 ${colors.text}`} />
                  <span className="font-medium">{templateData.templateTitle || templateData.templateType || '答题模板'}</span>
                  {templateData.templateType && (
                    <Badge variant="outline" className="ml-2 text-xs">{templateData.templateType}</Badge>
                  )}
                </div>
                {templateData.templateStructure && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                    {templateData.templateStructure}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* L1: 填空模式 */}
            {level === 1 && templateData.blanks && templateData.blanks.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Scroll className={`h-5 w-5 ${colors.text}`} />
                    <span className="text-sm font-medium">模板填空</span>
                  </div>
                  <div className="space-y-4">
                    {templateData.blanks.map((blank) => (
                      <div key={blank.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{blank.position}</Badge>
                          <span className="text-xs text-slate-500">提示：{blank.hint}</span>
                        </div>
                        {!showResult ? (
                          <Input
                            placeholder="请填写..."
                            value={userInputs[blank.id] || ''}
                            onChange={(e) => handleInputChange(blank.id, e.target.value)}
                            className="mb-2"
                          />
                        ) : (
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200">
                            <p className="text-sm">
                              <span className="font-medium">你的答案：</span>{userInputs[blank.id] || '（未填写）'}
                            </p>
                            <p className="text-sm mt-1">
                              <span className="font-medium text-emerald-600">参考答案：</span>{blank.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* L2: 结构模式 */}
            {level === 2 && templateData.structure && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Scroll className={`h-5 w-5 ${colors.text}`} />
                    <span className="text-sm font-medium">结构化答题</span>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(templateData.structure).map(([key, items]) => (
                      <div key={key} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="font-medium mb-3 capitalize">{key}</p>
                        <div className="space-y-2">
                          {Array.isArray(items) && items.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-slate-400">•</span>
                              {!showResult ? (
                                <Input
                                  placeholder={`填写：${item}`}
                                  value={userInputs[`${key}-${idx}`] || ''}
                                  onChange={(e) => handleInputChange(`${key}-${idx}`, e.target.value)}
                                  className="flex-1"
                                />
                              ) : (
                                <span className="text-sm flex-1">{userInputs[`${key}-${idx}`] || '（未填写）'}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* L3: 完整作答 */}
            {level === 3 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className={`h-5 w-5 ${colors.text}`} />
                    <span className="text-sm font-medium">完整作答</span>
                  </div>
                  {templateData.question && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-2">练习问题：</p>
                      <p className="text-sm">{templateData.question.question || templateData.question.material}</p>
                    </div>
                  )}
                  <Textarea
                    placeholder="请运用答题模板完成作答..."
                    value={userInputs['fullAnswer'] || ''}
                    onChange={(e) => handleInputChange('fullAnswer', e.target.value)}
                    className="min-h-[200px] mb-4"
                  />
                </CardContent>
              </Card>
            )}

            {/* 提交按钮 */}
          {!showResult && (
            <div className="flex justify-center">
              <Button onClick={handleSubmitScoring} disabled={loading} className={`gap-2 bg-${config.color}-500`}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                提交 AI 评分
              </Button>
            </div>
          )}

            {/* 评分结果 */}
            {showResult && scoreResult && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ThumbsUp className={`h-5 w-5 ${colors.text}`} />
                    <span className="font-medium text-emerald-700">AI 评分</span>
                    <Badge className="bg-emerald-500 text-white">
                      {scoreResult.score}/100
                    </Badge>
                  </div>
                  <p className="text-sm text-emerald-700 mb-4">{scoreResult.feedback}</p>
                  {scoreResult.improvements && scoreResult.improvements.length > 0 && (
                    <div className="text-sm text-emerald-600">
                      <p className="font-medium mb-2">改进建议：</p>
                      <ul className="list-disc list-inside space-y-1">
                        {scoreResult.improvements.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}

        {/* 完成提示 */}
        {showResult && (
          <Card className="mt-6 border-emerald-200 bg-emerald-50">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
              <h3 className="text-lg font-bold text-emerald-700 mb-2">练习完成！</h3>
              <div className="flex justify-center gap-4">
                <Button onClick={generateTemplate} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  再练一次
                </Button>
                <Button onClick={() => router.push(`/learn/${subject}/framework`)} className="gap-2">
                  <FileText className="h-4 w-4" />
                  返回{config.title}学习
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
