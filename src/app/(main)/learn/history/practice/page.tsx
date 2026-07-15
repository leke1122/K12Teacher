'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
  Trophy,
  RotateCcw,
  ChevronRight,
  Brain,
  FileQuestion,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// 练习题类型
interface PracticeQuestion {
  id: string;
  type: 'choice' | 'material';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  relatedEvents?: string[];
  material?: {
    content: string;
    author?: string;
    source?: string;
  };
  gaokaoTag?: string;
}

// 从历史数据生成练习题
function generatePracticeQuestions(): PracticeQuestion[] {
  return [
    // 选择题
    {
      id: 'q1',
      type: 'choice',
      category: '政治',
      difficulty: 'easy',
      question: '中国历史上第一个奴隶制王朝是？',
      options: ['夏朝', '商朝', '周朝', '秦朝'],
      correctAnswer: 0,
      explanation: '夏朝是中国历史上第一个奴隶制王朝，约公元前2070年由禹建立，标志着中国进入了文明时代。',
      relatedEvents: ['xiaychao'],
    },
    {
      id: 'q2',
      type: 'choice',
      category: '政治',
      difficulty: 'medium',
      question: '西周实行的分封制的主要目的是？',
      options: ['发展经济', '巩固统治', '传播文化', '对外扩张'],
      correctAnswer: 1,
      explanation: '西周实行分封制的主要目的是巩固周天子的统治，通过分封诸侯来拱卫王室。',
      relatedEvents: ['zhoufenfeng'],
    },
    {
      id: 'q3',
      type: 'choice',
      category: '政治',
      difficulty: 'medium',
      question: '春秋战国时期，诸侯争霸的实质是？',
      options: ['争夺土地和人口', '传播先进文化', '消灭奴隶制度', '统一文字'],
      correctAnswer: 0,
      explanation: '春秋战国时期，诸侯争霸的实质是争夺土地和人口，即争夺更多的政治和经济利益。',
      relatedEvents: ['zhouchunqiu'],
    },
    {
      id: 'q4',
      type: 'choice',
      category: '思想',
      difficulty: 'hard',
      question: '百家争鸣中，哪个学派主张"兼爱""非攻"？',
      options: ['儒家', '道家', '墨家', '法家'],
      correctAnswer: 2,
      explanation: '墨家主张"兼爱"（无差别的爱）和"非攻"（反对战争），代表人物是墨子。',
      relatedEvents: ['baijia'],
    },
    {
      id: 'q5',
      type: 'choice',
      category: '政治',
      difficulty: 'medium',
      question: '商鞅变法的主要内容不包括？',
      options: ['废井田、开阡陌', '奖励军功', '推行分封制', '建立县制'],
      correctAnswer: 2,
      explanation: '商鞅变法废除了分封制，推行郡县制，建立中央集权的行政体制。',
      relatedEvents: ['shangyangbianfa'],
    },
    {
      id: 'q6',
      type: 'choice',
      category: '文化',
      difficulty: 'easy',
      question: '汉字形体演变经历的顺序是？',
      options: ['甲骨文→金文→小篆→隶书→楷书', '金文→甲骨文→小篆→隶书→楷书', '甲骨文→小篆→金文→隶书→楷书', '金文→小篆→甲骨文→隶书→楷书'],
      correctAnswer: 0,
      explanation: '汉字形体演变顺序为：甲骨文→金文→小篆→隶书→楷书，反映了书写便捷化的趋势。',
      relatedEvents: ['hanzi'],
    },
    {
      id: 'q7',
      type: 'choice',
      category: '政治',
      difficulty: 'hard',
      question: '秦朝统一六国后，在地方上实行什么制度？',
      options: ['分封制', '郡县制', '科举制', '行省制'],
      correctAnswer: 1,
      explanation: '秦朝统一后废除分封制，在地方实行郡县制，建立了中央集权的行政体制。',
      relatedEvents: ['qinshihuang'],
    },
    {
      id: 'q8',
      type: 'choice',
      category: '思想',
      difficulty: 'medium',
      question: '"罢黜百家，独尊儒术"是谁提出的？',
      options: ['秦始皇', '汉武帝', '汉高祖', '汉文帝'],
      correctAnswer: 1,
      explanation: '汉武帝采纳董仲舒的建议，实行"罢黜百家，独尊儒术"，确立了儒学的正统地位。',
      relatedEvents: ['hanwudi'],
    },
    // 材料分析题
    {
      id: 'q9',
      type: 'material',
      category: '政治',
      difficulty: 'hard',
      question: '阅读材料，分析分封制瓦解的原因。',
      material: {
        content: '"周郑交质"事件：郑国大夫祭仲带兵割取了周天子的温、原等地。周天子威严扫地，不得不向诸侯伸手要钱。后来，齐国、楚国等大国开始公然挑战周天子的权威。',
        source: '《左传》及《史记》',
      },
      correctAnswer: '分封制瓦解的原因包括：1. 诸侯国实力增长，周王室衰微；2. 礼乐征伐自天子出变为自诸侯出；3. 诸侯国之间战争频繁，分封的等级秩序被打破；4. 铁犁牛耕出现，井田制瓦解，导致经济基础变化。',
      explanation: '这道题考查对分封制瓦解原因的理解，需要从政治、经济、军事等多个角度分析。',
      relatedEvents: ['zhoufenfeng', 'zhouchunqiu'],
    },
    {
      id: 'q10',
      type: 'material',
      category: '思想',
      difficulty: 'hard',
      question: '阅读材料，分析百家争鸣的历史意义。',
      material: {
        content: '春秋战国时期，诸侯割据混战，不同阶级、阶层的代表人物对当时的社会变革发表不同的主张，形成了诸子百家。他们互相诘难、批驳，又互相影响，促成了思想的解放。',
        source: '《中国通史》',
      },
      correctAnswer: '百家争鸣的历史意义：1. 促进了思想文化的繁荣；2. 为后世中华文化奠定了基础；3. 各学派的思想对后世政治制度、学术发展产生了深远影响；4. 推动了社会变革的进程。',
      explanation: '百家争鸣是中国历史上第一次大规模的思想解放运动，对中华文化产生了深远影响。',
      relatedEvents: ['baijia'],
    },
  ];
}

const CATEGORY_COLORS: Record<string, string> = {
  政治: 'bg-amber-100 text-amber-700 border-amber-200',
  经济: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  思想: 'bg-violet-100 text-violet-700 border-violet-200',
  文化: 'bg-pink-100 text-pink-700 border-pink-200',
  军事: 'bg-red-100 text-red-700 border-red-200',
  社会: 'bg-slate-100 text-slate-700 border-slate-200',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export default function HistoryPracticePage() {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [materialAnswer, setMaterialAnswer] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [historyMode, setHistoryMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // 获取 API Key
  const getApiKey = () => {
    try {
      const stored = localStorage.getItem('edumind-settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed?.settings?.deepseekKey || parsed?.deepseekKey || '';
      }
    } catch {}
    return '';
  };

  // 加载练习题
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/history/practice');
      const data = await response.json();
      if (data.success && data.data?.questions) {
        setQuestions(data.data.questions);
      }
    } catch (error) {
      console.error('加载练习题失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载初始数据
  useEffect(() => {
    loadQuestions();
  }, []);

  // 生成新题目
  const generateNewQuestions = async () => {
    setGenerating(true);
    try {
      const apiKey = getApiKey();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch('/api/history/practice', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          unitId: 'unit1',
          difficulty: difficultyFilter === 'all' ? 'medium' : difficultyFilter,
          count: 10,
        }),
      });

      const data = await response.json();
      if (data.success && data.data?.questions) {
        setQuestions(data.data.questions);
        setAnswers({});
        setCurrentIndex(0);
        setShowResult(false);
      }
    } catch (error) {
      console.error('生成练习题失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
      if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [questions, categoryFilter, difficultyFilter]);

  const currentQuestion = filteredQuestions[currentIndex];

  const progress = useMemo(() => {
    return Math.round((Object.keys(answers).length / filteredQuestions.length) * 100);
  }, [answers, filteredQuestions]);

  const correctCount = useMemo(() => {
    let count = 0;
    for (const [qId, answer] of Object.entries(answers)) {
      const q = questions.find(q => q.id === qId);
      if (q) {
        if (q.type === 'choice' && answer === q.correctAnswer) count++;
        if (q.type === 'material') count++; // 材料题暂时算对
      }
    }
    return count;
  }, [answers, questions]);

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleMaterialSubmit = () => {
    if (materialAnswer.trim()) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: materialAnswer }));
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowExplanation(false);
      setMaterialAnswer('');
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIndex(0);
    setShowResult(false);
    setShowExplanation(false);
    setMaterialAnswer('');
  };

  // 统计
  const stats = useMemo(() => {
    const byCategory: Record<string, { total: number; correct: number }> = {};
    const byDifficulty: Record<string, { total: number; correct: number }> = {};

    for (const q of questions) {
      // 按类别统计
      if (!byCategory[q.category]) byCategory[q.category] = { total: 0, correct: 0 };
      byCategory[q.category].total++;
      if (answers[q.id] !== undefined) {
        if (q.type === 'choice' && answers[q.id] === q.correctAnswer) {
          byCategory[q.category].correct++;
        } else if (q.type === 'material') {
          byCategory[q.category].correct++;
        }
      }

      // 按难度统计
      if (!byDifficulty[q.difficulty]) byDifficulty[q.difficulty] = { total: 0, correct: 0 };
      byDifficulty[q.difficulty].total++;
      if (answers[q.id] !== undefined) {
        if (q.type === 'choice' && answers[q.id] === q.correctAnswer) {
          byDifficulty[q.difficulty].correct++;
        } else if (q.type === 'material') {
          byDifficulty[q.difficulty].correct++;
        }
      }
    }

    return { byCategory, byDifficulty };
  }, [questions, answers]);

  const categories = [...new Set(questions.map(q => q.category))];

  if (showResult) {
    const score = Math.round((correctCount / questions.length) * 100);
    const grade = score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
        <div className="w-full px-4 py-4">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/subjects/history">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-800">练习结果</h1>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold ${
                grade === 'S' ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
                grade === 'A' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white' :
                grade === 'B' ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white' :
                grade === 'C' ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white' :
                'bg-gradient-to-br from-red-400 to-red-500 text-white'
              }`}>
                {grade}
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {score >= 90 ? '太棒了！' : score >= 70 ? '不错！' : score >= 60 ? '继续加油！' : '需要多复习！'}
              </h2>

              <p className="text-muted-foreground mb-6">
                你答对了 {correctCount}/{questions.length} 题，正确率 {score}%
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {categories.map(cat => {
                  const stat = stats.byCategory[cat];
                  const catPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                  return (
                    <div key={cat} className="p-3 rounded-lg border bg-slate-50">
                      <Badge className={CATEGORY_COLORS[cat]}>{cat}</Badge>
                      <p className="text-2xl font-bold mt-2">{catPct}%</p>
                      <p className="text-xs text-muted-foreground">{stat.correct}/{stat.total}题</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleRestart} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  重新练习
                </Button>
                <Link href="/subjects/history">
                  <Button className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    返回学习
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30">
      <div className="w-full px-4 py-4">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/history">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-emerald-500" />
              历史综合练习
            </h1>
            <p className="text-xs text-muted-foreground">
              {loading ? '加载中...' : `高中历史统编版 · ${questions.length} 道练习题`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={generateNewQuestions}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generating ? '生成中...' : 'AI 生成新题'}
            </Button>
            <Button
              variant={historyMode ? 'default' : 'outline'}
              size="sm"
              className="gap-1"
              onClick={() => setHistoryMode(!historyMode)}
            >
              <Brain className="h-4 w-4" />
              历史模式
            </Button>
        </div>

        {/* 进度条 */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                进度：{Object.keys(answers).length}/{filteredQuestions.length} 题
              </span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* 筛选器 */}
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">类别：</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={categoryFilter === 'all' ? 'default' : 'outline'}
                    className="h-7 text-xs"
                    onClick={() => setCategoryFilter('all')}
                  >
                    全部
                  </Button>
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      size="sm"
                      variant={categoryFilter === cat ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">难度：</span>
                <div className="flex gap-1">
                  {(['all', 'easy', 'medium', 'hard'] as const).map(diff => (
                    <Button
                      key={diff}
                      size="sm"
                      variant={difficultyFilter === diff ? 'default' : 'outline'}
                      className="h-7 text-xs"
                      onClick={() => setDifficultyFilter(diff)}
                    >
                      {diff === 'all' ? '全部' : DIFFICULTY_LABELS[diff]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 题目卡片 */}
        {currentQuestion && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">
                    第 {currentIndex + 1}/{filteredQuestions.length} 题
                  </Badge>
                  <Badge className={CATEGORY_COLORS[currentQuestion.category]}>
                    {currentQuestion.category}
                  </Badge>
                  <Badge className={DIFFICULTY_COLORS[currentQuestion.difficulty]}>
                    {DIFFICULTY_LABELS[currentQuestion.difficulty]}
                  </Badge>
                </div>
                {answers[currentQuestion.id] !== undefined && !showExplanation && (
                  <Badge variant="outline" className="text-green-600 bg-green-50">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    已作答
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 材料题显示材料 */}
              {currentQuestion.type === 'material' && currentQuestion.material && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentQuestion.material.content}
                  </p>
                  {currentQuestion.material.source && (
                    <p className="text-xs text-slate-500 mt-2 text-right">
                      —— {currentQuestion.material.source}
                    </p>
                  )}
                </div>
              )}

              {/* 题目 */}
              <div>
                <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

                {/* 选择题 */}
                {currentQuestion.type === 'choice' && currentQuestion.options && (
                  <RadioGroup
                    value={answers[currentQuestion.id]?.toString() || ''}
                    onValueChange={(val) => handleSelectAnswer(currentQuestion.id, parseInt(val))}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = answers[currentQuestion.id] === index;
                      const isCorrect = index === currentQuestion.correctAnswer;
                      const showCorrect = showExplanation && isCorrect;
                      const showWrong = showExplanation && isSelected && !isCorrect;

                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected && !showExplanation ? 'border-indigo-500 bg-indigo-50' :
                            showCorrect ? 'border-green-500 bg-green-50' :
                            showWrong ? 'border-red-500 bg-red-50' :
                            'border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => !showExplanation && handleSelectAnswer(currentQuestion.id, index)}
                        >
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label
                            htmlFor={`option-${index}`}
                            className="flex-1 cursor-pointer"
                          >
                            {option}
                          </Label>
                          {showExplanation && showCorrect && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {showExplanation && showWrong && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}

                {/* 材料题 */}
                {currentQuestion.type === 'material' && (
                  <div className="space-y-3">
                    <Textarea
                      value={materialAnswer}
                      onChange={(e) => setMaterialAnswer(e.target.value)}
                      placeholder="请输入你的分析答案..."
                      className="min-h-[120px]"
                    />
                    {!showExplanation && (
                      <Button onClick={handleMaterialSubmit} disabled={!materialAnswer.trim()}>
                        提交答案
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* 解析 */}
              {showExplanation && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-800">答案解析</span>
                  </div>
                  <p className="text-sm text-amber-900 mb-3">
                    {currentQuestion.explanation}
                  </p>
                  {currentQuestion.relatedEvents && currentQuestion.relatedEvents.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-amber-700">相关事件：</span>
                      {currentQuestion.relatedEvents.map((eventId, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {eventId}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                  >
                    上一题
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentIndex(Math.min(filteredQuestions.length - 1, currentIndex + 1))}
                    disabled={currentIndex === filteredQuestions.length - 1}
                  >
                    下一题
                  </Button>
                </div>

                {currentQuestion.type === 'choice' && answers[currentQuestion.id] !== undefined && !showExplanation && (
                  <Button onClick={() => setShowExplanation(true)} className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    查看解析
                  </Button>
                )}

                {(showExplanation || answers[currentQuestion.id] !== undefined) && (
                  <Button onClick={handleNext} className="gap-2">
                    {currentIndex === filteredQuestions.length - 1 ? '查看结果' : '下一题'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 题目导航 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">题目导航</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filteredQuestions.map((q, index) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = index === currentIndex;

                return (
                  <Button
                    key={q.id}
                    size="sm"
                    variant={isCurrent ? 'default' : isAnswered ? 'secondary' : 'outline'}
                    className={`w-10 h-10 ${isCurrent ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
