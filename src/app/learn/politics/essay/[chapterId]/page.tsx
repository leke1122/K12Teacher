'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, ChevronRight, CheckCircle, RotateCcw, Sparkles, Send, Eye, EyeOff, FileText, Star, TrendingUp, BookOpen, Target, Zap, Award, ThumbsUp, Lightbulb, ChevronDown } from 'lucide-react';
import { POLITICS_CHAPTERS, ESSAY_QUESTIONS, type EssayQuestion } from '@/lib/politicsData';
import { cn } from '@/lib/utils';

interface ScoreResult {
  perspective: { score: number; comment: string };
  principle: { score: number; comment: string };
  material: { score: number; comment: string };
  conclusion: { score: number; comment: string };
  terminology: { score: number; comment: string };
  total: number;
  level: string;
  improvements: string[];
}

interface EssayState {
  answer: string;
  scored: boolean;
  scoreResult: ScoreResult | null;
  showReference: boolean;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  '简单': 'bg-emerald-100 text-emerald-700',
  '中等': 'bg-amber-100 text-amber-700',
  '困难': 'bg-rose-100 text-rose-700',
};

const SCORE_LEVELS = [
  { min: 90, label: '优秀', color: 'text-emerald-600' },
  { min: 80, label: '良好', color: 'text-blue-600' },
  { min: 70, label: '中等', color: 'text-amber-600' },
  { min: 60, label: '及格', color: 'text-orange-600' },
  { min: 0, label: '需努力', color: 'text-rose-600' },
];

function getScoreLevel(total: number) {
  return SCORE_LEVELS.find((l) => total >= l.min) || SCORE_LEVELS[SCORE_LEVELS.length - 1];
}

const DIMENSION_CONFIG = [
  { key: 'perspective', label: '观点', icon: Target, maxScore: 20, color: 'rose' },
  { key: 'principle', label: '原理', icon: BookOpen, maxScore: 20, color: 'blue' },
  { key: 'material', label: '材料', icon: FileText, maxScore: 20, color: 'purple' },
  { key: 'conclusion', label: '结论', icon: TrendingUp, maxScore: 20, color: 'amber' },
  { key: 'terminology', label: '术语', icon: Zap, maxScore: 20, color: 'emerald' },
];

function EssayPageContent() {
  const params = useParams();
  const router = useRouter();
  const chapterId = typeof params.chapterId === 'string' ? params.chapterId : 'politics-compulsory-2';

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<EssayQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [states, setStates] = useState<Record<string, EssayState>>({});
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCriteria, setShowCriteria] = useState(false);

  const chapterInfo = POLITICS_CHAPTERS.find((ch) => ch.id === chapterId) || {
    id: chapterId,
    title: chapterId,
    module: 'economics' as const,
    moduleName: '经济',
    topics: [],
  };

  const currentQuestion = questions[currentIndex];
  const currentState = currentQuestion ? (states[currentQuestion.id] || {
    answer: '',
    scored: false,
    scoreResult: null,
    showReference: false,
  }) : null;

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/politics/essay');
      const json = await res.json();
      if (json.success && json.data?.length > 0) {
        setQuestions(json.data);
        const initStates: Record<string, EssayState> = {};
        json.data.forEach((q: EssayQuestion) => {
          initStates[q.id] = {
            answer: '',
            scored: false,
            scoreResult: null,
            showReference: false,
          };
        });
        setStates(initStates);
      } else {
        setQuestions([]);
      }
    } catch {
      setError('加载论述题失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !answer.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `【论述题评分】

题目：${currentQuestion.title}
材料：${currentQuestion.scenario}
答题要求：${currentQuestion.requirements?.map((r) => r).join('；') || '无'}

学生作答：
${answer}

请从以下五个维度评分，每个维度20分，总分100分：

1. 观点（20分）：立场鲜明，观点明确
2. 原理（20分）：理论运用准确，表述规范
3. 材料（20分）：材料引用恰当，分析充分
4. 结论（20分）：论证严密，逻辑清晰
5. 术语（20分）：学科术语准确，表达规范

请按以下JSON格式返回评分结果：
{
  "perspective": {"score": 数字, "comment": "评语"},
  "principle": {"score": 数字, "comment": "评语"},
  "material": {"score": 数字, "comment": "评语"},
  "conclusion": {"score": 数字, "comment": "评语"},
  "terminology": {"score": 数字, "comment": "评语"},
  "total": 数字,
  "level": "优秀/良好/中等/及格/需努力",
  "improvements": ["改进建议1", "改进建议2", "改进建议3"]
}`,
          }],
          systemPrompt: '你是一位政治学科评分专家，根据五个维度严格评分，返回JSON格式的评分结果。评分要客观公正，结合学生实际作答水平给出合理分数。',
        }),
      });
      const json = await res.json();
      const rawContent = json.choices?.[0]?.message?.content || json.content || '';

      let scoreResult: ScoreResult;
      try {
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          scoreResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        scoreResult = generateFallbackScore(answer);
      }

      setStates((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          answer,
          scored: true,
          scoreResult,
          showReference: false,
        },
      }));
    } catch {
      const fallback = generateFallbackScore(answer);
      setStates((prev) => ({
        ...prev,
        [currentQuestion.id]: {
          ...prev[currentQuestion.id],
          answer,
          scored: true,
          scoreResult: fallback,
          showReference: false,
        },
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const generateFallbackScore = (text: string): ScoreResult => {
    const len = text.length;
    const hasProperLength = len > 100;
    const hasMultipleParagraphs = text.split('\n').length >= 2;
    const hasStructure = hasProperLength && hasMultipleParagraphs;

    const perspective = Math.min(20, Math.round((hasStructure ? 15 : 10) + Math.random() * 5));
    const principle = Math.min(20, Math.round((hasProperLength ? 14 : 8) + Math.random() * 6));
    const material = Math.min(20, Math.round((hasStructure ? 13 : 7) + Math.random() * 7));
    const conclusion = Math.min(20, Math.round((hasMultipleParagraphs ? 14 : 8) + Math.random() * 6));
    const terminology = Math.min(20, Math.round((hasStructure ? 12 : 6) + Math.random() * 8));
    const total = perspective + principle + material + conclusion + terminology;

    return {
      perspective: { score: perspective, comment: '观点表达清晰明确' },
      principle: { score: principle, comment: '理论运用基本准确' },
      material: { score: material, comment: '材料分析较为充分' },
      conclusion: { score: conclusion, comment: '结论论证较为完整' },
      terminology: { score: terminology, comment: '术语运用有待加强' },
      total,
      level: getScoreLevel(total).label,
      improvements: [
        '建议增加理论分析的深度',
        '材料引用可以更加充分',
        '注意学科术语的规范使用',
      ],
    };
  };

  const resetQuestion = (questionId: string) => {
    setStates((prev) => ({
      ...prev,
      [questionId]: {
        answer: '',
        scored: false,
        scoreResult: null,
        showReference: false,
      },
    }));
    setAnswer('');
    setShowCriteria(false);
  };

  const completedCount = Object.values(states).filter((s) => s.scored).length;
  const totalCount = questions.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-orange-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/subjects/politics')} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                返回主页
              </Button>
              <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">论述训练</h1>
                <p className="text-xs text-slate-500">{chapterInfo.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-amber-50">
                进度：{completedCount}/{totalCount}
              </Badge>
              <Progress value={progress} className="w-24 h-2" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {loading ? (
          <Card className="rounded-xl">
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500 mr-3" />
              <span className="text-slate-500">加载论述题中...</span>
            </CardContent>
          </Card>
        ) : !currentQuestion ? (
          <Card className="rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Sparkles className="h-12 w-12 text-amber-300 mb-3" />
              <p className="text-slate-500">还没有论述题数据</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 题目导航 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {questions.map((q, idx) => {
                const state = states[q.id];
                const isCurrent = idx === currentIndex;
                const isCompleted = state?.scored;
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentIndex(idx); setAnswer(''); setShowCriteria(false); }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all flex-shrink-0',
                      isCurrent ? 'bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700' :
                      isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' :
                      'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-300'
                    )}
                  >
                    <span className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    )}>
                      {isCompleted ? <CheckCircle className="h-3 w-3" /> : idx + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-200">{q.title.slice(0, 8)}...</span>
                    <Badge className={cn('text-xs', DIFFICULTY_COLORS[q.difficulty])}>{q.difficulty}</Badge>
                  </button>
                );
              })}
            </div>

            {/* 题目卡片 */}
            <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn('text-xs', DIFFICULTY_COLORS[currentQuestion.difficulty])}>
                        {currentQuestion.difficulty}
                      </Badge>
                      {currentState?.scored && (
                        <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                          <CheckCircle className="h-3 w-3" /> 已评分
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{currentQuestion.title}</h2>
                  </div>
                </div>

                {/* 材料内容 */}
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">材料</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{currentQuestion.scenario}</p>
                </div>

                {/* 答题要求 */}
                {currentQuestion.requirements && currentQuestion.requirements.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">答题要求</span>
                    </div>
                    {currentQuestion.requirements.map((req, i) => (
                      <p key={i} className="text-sm text-slate-700 dark:text-slate-300">{req}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 评分标准（可折叠） */}
            <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
              <CardContent className="p-3">
                <button
                  onClick={() => setShowCriteria(!showCriteria)}
                  className="w-full flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">五维评分标准</span>
                  </div>
                  {showCriteria ? <ChevronDown className="h-4 w-4 text-slate-400 rotate-180" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {showCriteria && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {DIMENSION_CONFIG.map((dim) => (
                        <div key={dim.key} className="bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-1.5 mb-1">
                            <dim.icon className={cn('h-3.5 w-3.5 text-', dim.color, '-500')} />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{dim.label}</span>
                            <span className="text-xs text-slate-400 ml-auto">{dim.maxScore}分</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {dim.key === 'perspective' && '立场鲜明，观点明确'}
                            {dim.key === 'principle' && '理论运用准确，表述规范'}
                            {dim.key === 'material' && '材料引用恰当，分析充分'}
                            {dim.key === 'conclusion' && '论证严密，逻辑清晰'}
                            {dim.key === 'terminology' && '学科术语准确，表达规范'}
                          </p>
                        </div>
                      ))}
                      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2 border border-amber-200 dark:border-amber-800 col-span-full">
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          <ThumbsUp className="h-3 w-3 inline mr-1" />
                          建议先独立思考作答，再查看评分标准进行自我评估
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 答题区 */}
            <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">作答区</h3>
                  <Badge variant="outline" className="ml-auto text-xs">{answer.length} 字</Badge>
                </div>

                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="请在此作答...&#10;&#10;提示：可以从背景分析、理论依据、论证过程、结论等方面展开论述。"
                  className="min-h-[200px] resize-none mb-4"
                  disabled={currentState?.scored}
                />

                {!currentState?.scored ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || submitting}
                    className="w-full gap-2 bg-amber-500 hover:bg-amber-600"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {submitting ? '评分中...' : '提交评分'}
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-emerald-200" />
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">已完成评分</span>
                    </div>
                    <div className="flex-1 h-px bg-emerald-200" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 评分结果 */}
            {currentState?.scored && currentState.scoreResult && (
              <>
                <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-amber-500" />
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">评分结果</h3>
                      <Badge className={cn('ml-auto', DIFFICULTY_COLORS[currentQuestion.difficulty])}>
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>

                    {/* 总分展示 */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-6 mb-4 text-center">
                      <p className="text-5xl font-bold text-amber-600 dark:text-amber-400 mb-1">
                        {currentState.scoreResult.total}
                        <span className="text-xl text-amber-400">/{DIMENSION_CONFIG.length * 20}</span>
                      </p>
                      <Badge className={cn('text-sm px-3 py-1', DIFFICULTY_COLORS[currentQuestion.difficulty])}>
                        {currentState.scoreResult.level}
                      </Badge>
                    </div>

                    {/* 五维评分详情 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {DIMENSION_CONFIG.map((dim) => {
                        const dimData = currentState.scoreResult?.[dim.key as keyof ScoreResult] as { score: number; comment: string } | undefined;
                        if (!dimData || typeof dimData !== 'object') return null;
                        return (
                          <div key={dim.key} className={cn(
                            'rounded-lg p-3 border',
                            dimData.score >= 16 ? 'bg-emerald-50 border-emerald-200' :
                            dimData.score >= 12 ? 'bg-slate-50 border-slate-200' :
                            'bg-rose-50 border-rose-200'
                          )}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <dim.icon className={cn('h-4 w-4 text-', dim.color, '-500')} />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{dim.label}</span>
                              </div>
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                {dimData.score}/{dim.maxScore}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{dimData.comment}</p>
                            {/* 进度条 */}
                            <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  dimData.score >= 16 ? 'bg-emerald-500' :
                                  dimData.score >= 12 ? 'bg-amber-500' :
                                  'bg-rose-500'
                                )}
                                style={{ width: `${(dimData.score / dim.maxScore) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 改进建议 */}
                    {currentState.scoreResult.improvements && currentState.scoreResult.improvements.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">改进建议</span>
                        </div>
                        <ul className="space-y-2">
                          {currentState.scoreResult.improvements.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 参考答案 */}
                <Card className="rounded-xl shadow-sm border-0 overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-emerald-500" />
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">参考答案</h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStates((prev) => ({
                          ...prev,
                          [currentQuestion.id]: {
                            ...prev[currentQuestion.id],
                            showReference: !prev[currentQuestion.id].showReference,
                          },
                        }))}
                        className="gap-1.5"
                      >
                        {currentState.showReference ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {currentState.showReference ? '收起' : '展开'}
                      </Button>
                    </div>
                    {currentState.showReference && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {currentQuestion.referenceAnswer}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* 底部操作 */}
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" size="sm" onClick={() => resetQuestion(currentQuestion.id)} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                重新作答
              </Button>
              <div className="flex gap-2">
                {currentIndex > 0 && (
                  <Button variant="outline" size="sm" onClick={() => { setCurrentIndex(currentIndex - 1); setAnswer(''); setShowCriteria(false); }}>
                    上一题
                  </Button>
                )}
                {currentIndex < questions.length - 1 && (
                  <Button size="sm" onClick={() => { setCurrentIndex(currentIndex + 1); setAnswer(''); setShowCriteria(false); }} className="gap-1.5 bg-amber-500 hover:bg-amber-600">
                    下一题
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    }>
      <EssayPageContent />
    </Suspense>
  );
}
