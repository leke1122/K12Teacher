'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, Loader2, PenTool, Sparkles, BookOpen,
  Target, CheckCircle2, XCircle, ChevronRight, Clock,
  Star, AlertCircle, Brain
} from 'lucide-react';
import Link from 'next/link';
import { POLITICS_CHAPTERS } from '@/lib/politicsData';

interface EssayQuestion {
  id: string;
  title: string;
  scenario: string;
  requirements: string[];
  scoringCriteria: {
    viewpoint: string;
    theory: string;
    material: string;
    conclusion: string;
    terminology: string;
  };
  referenceAnswer: string;
  difficulty: '简单' | '中等' | '困难';
  relatedChapter: string;
}

interface EvaluationResult {
  totalScore: number;
  viewpoint: number;
  theory: number;
  material: number;
  conclusion: number;
  terminology: number;
  feedback: string;
  improvements: string[];
}

const ESSAY_QUESTIONS_DATA: EssayQuestion[] = [
  {
    id: 'essay-1',
    title: '社会主义代替资本主义的历史必然性',
    scenario: '材料：资本主义经济危机的周期性爆发，使资本主义社会陷入了生产相对过剩的困境。与此同时，中国特色社会主义的蓬勃发展，充分显示了社会主义制度的优越性。结合材料，运用所学知识，分析社会主义代替资本主义为什么是历史必然。',
    requirements: [
      '紧扣题意，观点正确',
      '理论联系实际，分析透彻',
      '逻辑清晰，论述有力',
      '字数不少于300字',
    ],
    scoringCriteria: {
      viewpoint: '观点是否正确、鲜明（4分）',
      theory: '理论依据是否充分（4分）',
      material: '是否结合材料分析（4分）',
      conclusion: '结论是否有说服力（2分）',
      terminology: '术语使用是否准确（2分）',
    },
    referenceAnswer: '参考答案：①生产力与生产关系的矛盾运动规律决定了社会形态的演进。②资本主义基本矛盾（生产社会化与生产资料私人占有）是资本主义一切矛盾和冲突的总根源，随着生产社会化程度提高，这一矛盾日益尖锐。③经济危机证明：资本主义无法克服自身矛盾。④社会主义以公有制为基础，适应社会化大生产，能够避免经济危机，实现共同富裕。结论：社会主义代替资本主义是由人类社会发展规律决定的，是历史必然。但这一过程是长期的、曲折的。',
    difficulty: '中等',
    relatedChapter: 'politics-compulsory-1',
  },
  {
    id: 'essay-2',
    title: '科学社会主义的贡献与时代价值',
    scenario: '材料：1848年《共产党宣言》发表，标志着马克思主义的诞生。170多年来，科学社会主义经历了从理论到实践、从一国到多国的发展，深刻改变了世界历史的走向。结合材料，论述科学社会主义的历史贡献与当代价值。',
    requirements: [
      '紧扣题意，立论明确',
      '运用唯物史观分析',
      '结合历史与现实',
      '字数不少于300字',
    ],
    scoringCriteria: {
      viewpoint: '立论是否正确（4分）',
      theory: '唯物史观运用（4分）',
      material: '历史与现实结合（4分）',
      conclusion: '论证逻辑性（2分）',
      terminology: '政治术语准确（2分）',
    },
    referenceAnswer: '参考答案：①唯物史观和剩余价值学说是科学社会主义的理论基石，使社会主义从空想变为科学。②科学社会主义指导了巴黎公社、十月革命等实践，证明了从理论到现实的可能。③中国特色社会主义是科学社会主义在中国的成功实践，证明其当代价值。④在21世纪，科学社会主义仍然是指引人类社会发展的科学理论，为解决全球性问题贡献中国智慧。',
    difficulty: '中等',
    relatedChapter: 'politics-compulsory-1',
  },
  {
    id: 'essay-3',
    title: '社会主要矛盾与社会发展',
    scenario: '材料：党的十九大报告指出，中国特色社会主义进入新时代，我国社会主要矛盾已经转化为人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾。结合材料，运用生产力和生产关系矛盾运动规律，说明我国社会主要矛盾变化的依据。',
    requirements: [
      '紧扣题意，逻辑严密',
      '运用矛盾分析法',
      '理论联系实际',
      '字数不少于300字',
    ],
    scoringCriteria: {
      viewpoint: '分析角度（4分）',
      theory: '矛盾规律运用（4分）',
      material: '结合实际分析（4分）',
      conclusion: '论证深度（2分）',
      terminology: '术语准确（2分）',
    },
    referenceAnswer: '参考答案：①生产力与生产关系的矛盾运动规律决定社会主要矛盾的变化。随着生产力发展，原有生产关系不再适应时，主要矛盾就会转变。②改革开放以来，我国社会生产力显著提高，生产力落后的状况已总体解决，人民生活水平大幅提升。③但发展不平衡不充分的问题日益凸显，成为满足人民美好生活需要的主要制约。④社会主要矛盾的变化，没有改变我国社会主义所处的历史阶段，我们仍处于并将长期处于社会主义初级阶段。',
    difficulty: '困难',
    relatedChapter: 'politics-compulsory-1',
  },
  {
    id: 'essay-4',
    title: '辽宁产业发展与新质生产力',
    scenario: '材料：辽宁省着力推动产业转型升级，加快形成新质生产力。辽中南工业基地的传统制造业通过数字化改造焕发新生，新能源、人工智能等新兴产业蓬勃发展。结合材料，运用经济与社会相关知识，分析辽宁应如何通过发展新质生产力推动高质量发展。',
    requirements: [
      '结合辽宁实际',
      '运用经济发展理论',
      '分析具体可行',
      '字数不少于300字',
    ],
    scoringCriteria: {
      viewpoint: '分析角度（4分）',
      theory: '经济理论运用（4分）',
      material: '联系辽宁实际（4分）',
      conclusion: '建议可行性（2分）',
      terminology: '术语准确（2分）',
    },
    referenceAnswer: '参考答案：①新质生产力是由技术革命性突破、生产要素创新性配置、产业深度转型升级而催生的先进生产力。②辽宁应：a.推动传统产业数字化转型，利用辽中南工业基地优势，实现智能化改造；b.培育壮大新能源、人工智能等战略性新兴产业，形成新增长极；c.深化科技体制改革，加强原创性、引领性科技攻关；d.扩大高水平对外开放，吸引外资和技术；e.完善人才引进和培养机制，为新质生产力提供人才支撑。',
    difficulty: '中等',
    relatedChapter: 'politics-compulsory-2',
  },
  {
    id: 'essay-5',
    title: '全过程人民民主的显著优势',
    scenario: '材料：全国人民代表大会制度是我国的根本政治制度。在十三届全国人大五次会议上，近5000名全国人大代表围绕经济社会发展重大问题积极建言献策。某校拟举办"感悟全过程人民民主"主题演讲活动。请你结合材料和所学政治生活知识，自拟题目，写一篇演讲稿。',
    requirements: [
      '自拟题目，观点鲜明',
      '结合人民代表大会制度',
      '论述全过程人民民主',
      '字数不少于300字',
    ],
    scoringCriteria: {
      viewpoint: '立论角度（4分）',
      theory: '制度知识运用（4分）',
      material: '结合材料（4分）',
      conclusion: '情感升华（2分）',
      terminology: '政治术语准确（2分）',
    },
    referenceAnswer: '参考答案：我国是人民民主专政的社会主义国家，国家一切权力属于人民。人民代表大会制度是我国的根本政治制度，是实现全过程人民民主的重要制度载体。通过人民代表大会制度，人民能够参与国家治理，保障人民当家作主。全国人大代表来自人民、代表人民、服务人民，在立法、监督等工作中发挥重要作用。近年来，从立法征意见到基层民主恳谈，全过程人民民主不断深化，彰显了社会主义民主的显著优势。',
    difficulty: '中等',
    relatedChapter: 'politics-compulsory-3',
  },
];

export default function EssayTrainingPage() {
  const params = useParams();
  const chapterId = params.chapterId as string;

  const [selectedChapter, setSelectedChapter] = useState(POLITICS_CHAPTERS[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showReference, setShowReference] = useState(false);
  const [showScoring, setShowScoring] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ch = POLITICS_CHAPTERS.find(c => c.id === chapterId);
    if (ch) setSelectedChapter(ch);
  }, [chapterId]);

  const filteredQuestions = useMemo(() => {
    return ESSAY_QUESTIONS_DATA;
  }, []);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const progress = filteredQuestions.length > 0
    ? Math.round(((currentQuestionIndex + 1) / filteredQuestions.length) * 100)
    : 0;

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    setEvaluating(true);

    // 模拟 AI 评分（基于关键词匹配）
    await new Promise(resolve => setTimeout(resolve, 1500));

    const text = userAnswer.toLowerCase();
    let viewpointScore = 0;
    let theoryScore = 0;
    let materialScore = 0;
    let conclusionScore = 0;
    let terminologyScore = 0;

    // 观点评分：长度>100字且包含积极正面的论点
    if (userAnswer.length > 100) viewpointScore += 2;
    if (text.includes('必然') || text.includes('历史') || text.includes('规律')) viewpointScore += 2;

    // 理论评分：包含关键理论术语
    const theoryTerms = ['生产力', '生产关系', '基本矛盾', '唯物史观', '资本主义', '社会主义', '空想'];
    theoryTerms.forEach(term => {
      if (text.includes(term)) theoryScore += 0.5;
    });
    theoryScore = Math.min(theoryScore, 4);

    // 材料评分：引用材料或结合实际
    if (text.includes('材料') || text.includes('根据') || text.includes('结合')) materialScore += 2;
    if (text.includes('经济危机') || text.includes('发展')) materialScore += 2;

    // 结论评分：字数充分，逻辑完整
    if (userAnswer.length > 300) conclusionScore += 1;
    if (text.includes('因此') || text.includes('所以') || text.includes('总之')) conclusionScore += 1;

    // 术语评分：政治术语使用
    const politicalTerms = ['矛盾', '规律', '必然', '社会', '阶级', '革命'];
    politicalTerms.forEach(term => {
      if (text.includes(term)) terminologyScore += 0.3;
    });
    terminologyScore = Math.min(terminologyScore, 2);

    const total = Math.min(Math.round(viewpointScore + theoryScore + materialScore + conclusionScore + terminologyScore), 14);

    const result: EvaluationResult = {
      totalScore: total,
      viewpoint: Math.min(Math.round(viewpointScore), 4),
      theory: Math.min(Math.round(theoryScore), 4),
      material: Math.min(Math.round(materialScore), 4),
      conclusion: Math.round(conclusionScore),
      terminology: Math.round(terminologyScore),
      feedback: total >= 12 ? '优秀！论述逻辑清晰，理论依据充分。' :
                total >= 8 ? '良好！论点正确，建议加强理论深度。' :
                '建议：完善论述结构，增加理论依据。',
      improvements: total < 4 ? ['字数不足，请详细展开论述'] :
                  total < 8 ? [
                    '建议增加理论依据',
                    '注意结合材料分析',
                  ] : [
                    '可以进一步深化论点',
                    '适当增加辽宁本地案例',
                  ],
    };

    setEvaluation(result);
    setShowScoring(true);
    setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));
    setEvaluating(false);
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setUserAnswer('');
      setShowReference(false);
      setShowScoring(false);
      setEvaluation(null);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(i => i - 1);
      setUserAnswer('');
      setShowReference(false);
      setShowScoring(false);
      setEvaluation(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-rose-50 via-slate-50 to-pink-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/30">
      <div className="w-full px-4 py-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/politics">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-rose-500" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">论述训练</h1>
          </div>
          <Badge variant="outline" className="ml-auto bg-rose-50 text-rose-600 text-xs">
            高考风格论述题
          </Badge>
        </div>

        {/* 教材选择 */}
        <Card className="mb-4 border-rose-100">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">选择教材章节</span>
            </div>
            <select
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
              value={selectedChapter.id}
              onChange={(e) => {
                const ch = POLITICS_CHAPTERS.find(c => c.id === e.target.value);
                if (ch) setSelectedChapter(ch);
              }}
            >
              {POLITICS_CHAPTERS.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.title}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        {/* 进度 */}
        <Card className="mb-4 border-rose-100">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">论述进度：{currentQuestionIndex + 1}/{filteredQuestions.length}</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* 题目列表 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {filteredQuestions.map((q, idx) => {
            const isDone = completedQuestions.has(q.id);
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                  setUserAnswer('');
                  setShowReference(false);
                  setShowScoring(false);
                  setEvaluation(null);
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs transition-all ${
                  idx === currentQuestionIndex
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white dark:bg-slate-800 text-slate-600 hover:border-rose-200'
                }`}
              >
                {isDone && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                {idx + 1}. {q.title.slice(0, 8)}...
              </button>
            );
          })}
        </div>

        {/* 当前题目 */}
        {currentQuestion && (
          <Card className="mb-4 border-rose-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-rose-700 flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  {currentQuestion.title}
                </CardTitle>
                <Badge className={
                  currentQuestion.difficulty === '困难' ? 'bg-red-100 text-red-700' :
                  currentQuestion.difficulty === '中等' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 材料 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1 mb-2">
                  <BookOpen className="h-3 w-3 text-slate-500" />
                  <span className="text-xs text-slate-500 font-medium">材料</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentQuestion.scenario}
                </p>
              </div>

              {/* 要求 */}
              <div className="flex flex-wrap gap-2">
                {currentQuestion.requirements.map((req, idx) => (
                  <span key={idx} className="text-xs bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-300 px-2 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                    {req}
                  </span>
                ))}
              </div>

              {/* 评分标准 */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1 mb-2">
                  <Target className="h-3 w-3 text-slate-500" />
                  <span className="text-xs text-slate-500 font-medium">评分标准（满分14分）</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { key: 'viewpoint', label: '观点', max: 4 },
                    { key: 'theory', label: '理论', max: 4 },
                    { key: 'material', label: '材料', max: 4 },
                    { key: 'conclusion', label: '结论', max: 2 },
                    { key: 'terminology', label: '术语', max: 2 },
                  ].map(item => (
                    <div key={item.key} className="bg-white dark:bg-slate-800 rounded p-2 text-center">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.max}分</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 答题区 */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                  你的答案
                </label>
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="请在此作答，要求：紧扣题意、理论联系实际、逻辑清晰..."
                  className="min-h-[200px] text-sm"
                />
                <p className="text-xs text-slate-400 mt-1 text-right">
                  {userAnswer.length} 字（建议 300 字以上）
                </p>
              </div>

              {/* 评分结果 */}
              {showScoring && evaluation && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">评分结果</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{evaluation.totalScore}</span>
                        <span className="text-sm text-emerald-600 dark:text-emerald-400">/ 14分</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-3">
                      {[
                        { key: 'viewpoint', label: '观点' },
                        { key: 'theory', label: '理论' },
                        { key: 'material', label: '材料' },
                        { key: 'conclusion', label: '结论' },
                        { key: 'terminology', label: '术语' },
                      ].map(item => (
                        <div key={item.key} className="text-center bg-white dark:bg-slate-800 rounded p-1.5">
                          <p className="text-xs text-slate-500">{item.label}</p>
                          <p className="text-sm font-bold text-emerald-600">
                            {evaluation[item.key as keyof EvaluationResult] as number}分
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">{evaluation.feedback}</p>
                  </div>

                  {evaluation.improvements.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <AlertCircle className="h-3 w-3 text-amber-500" />
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">改进建议</span>
                      </div>
                      <ul className="space-y-1">
                        {evaluation.improvements.map((imp, idx) => (
                          <li key={idx} className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1">
                            <span>•</span> {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 参考答案 */}
              {showReference && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">参考答案</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-wrap">
                    {currentQuestion.referenceAnswer}
                  </p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-2">
                {!showScoring && (
                  <Button
                    size="sm"
                    className="gap-1 bg-rose-500 hover:bg-rose-600 text-white"
                    onClick={handleEvaluate}
                    disabled={evaluating || !userAnswer.trim()}
                  >
                    {evaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {evaluating ? '评分中...' : 'AI 评分'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setShowReference(!showReference)}
                >
                  <BookOpen className="h-4 w-4" />
                  {showReference ? '收起答案' : '查看参考答案'}
                </Button>
                {showScoring && (
                  <Button
                    size="sm"
                    className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={handleNext}
                    disabled={currentQuestionIndex >= filteredQuestions.length - 1}
                  >
                    下一题 <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 底部导航 */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" /> 上一题
          </Button>
          <span className="text-xs text-slate-500">
            已完成 {completedQuestions.size}/{filteredQuestions.length}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={handleNext}
            disabled={currentQuestionIndex >= filteredQuestions.length - 1}
          >
            下一题 <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
