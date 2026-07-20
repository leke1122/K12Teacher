'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, BookOpen, Sparkles, Loader2,
  Languages, FileText, RotateCcw, ChevronRight,
  CheckCircle, XCircle, Volume2, Square,
  Target, Brain, Award
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { fallbackGetPDF } from '@/lib/localFallback';
import { extractSectionContent } from '@/lib/pdf-utils';
import { getSectionPageRange } from '@/lib/chapterPageMapping';
import { cn } from '@/lib/utils';
import { useTTS } from '@/hooks/useTTS';
import { toast } from 'sonner';

type WordCategory = '实词' | '虚词' | '句式' | '文化常识';

interface WordItem {
  word: string;
  meaning: string;
  category: string;
  note?: string;
  usage?: string;
  example?: string;
  pattern?: string;
  original?: string;
  explanation?: string;
  translation?: string;
  term?: string;
  context?: string;
}

interface TranslationSentence {
  original: string;
  translation: string;
  keyWords?: WordItem[];
  grammar?: string;
}

interface ClassicalAnalysis {
  title: string;
  realWords: WordItem[];
  functionWords: WordItem[];
  sentencePatterns: WordItem[];
  culturalKnowledge: WordItem[];
}

function ClassicalReadPageContent() {
  const params = useParams();
  const poemId = params.poemId as string;
  const { settings } = useSettingsStore();

  // TTS 状态
  const [ttsPlaying, setTtsPlaying] = useState(false);
  const { speak, stop, isPlaying, isLoading } = useTTS({
    onStart: () => setTtsPlaying(true),
    onEnd: () => setTtsPlaying(false),
    onError: (msg) => {
      toast.error(msg);
      setTtsPlaying(false);
    },
  });

  const getSubjectName = (id: string) => {
    const map: Record<string, string> = { math: '数学', physics: '物理', chemistry: '化学', chinese: '语文', biology: '生物', geography: '地理', politics: '政治', history: '历史' };
    return map[id] || id;
  };

  // 课文信息（硬编码，后续可从 API 获取）
  const classicalInfo: Record<string, { title: string; author: string; dynasty: string; category: string; subjectId: string; chapterId: string; sectionId: string }> = {
    '劝学': {
      title: '劝学',
      author: '荀子',
      dynasty: '战国',
      category: '议论性散文',
      subjectId: 'chinese',
      chapterId: '1',
      sectionId: '劝学',
    },
    '师说': {
      title: '师说',
      author: '韩愈',
      dynasty: '唐',
      category: '议论文',
      subjectId: 'chinese',
      chapterId: '1',
      sectionId: '师说',
    },
    '屈原列传': {
      title: '屈原列传',
      author: '司马迁',
      dynasty: '汉',
      category: '史传文',
      subjectId: 'chinese',
      chapterId: '2',
      sectionId: '屈原列传',
    },
    '苏武传': {
      title: '苏武传',
      author: '班固',
      dynasty: '汉',
      category: '史传文',
      subjectId: 'chinese',
      chapterId: '2',
      sectionId: '苏武传',
    },
    '过秦论': {
      title: '过秦论',
      author: '贾谊',
      dynasty: '汉',
      category: '政论散文',
      subjectId: 'chinese',
      chapterId: '2',
      sectionId: '过秦论',
    },
    '五代史伶官传序': {
      title: '五代史伶官传序',
      author: '欧阳修',
      dynasty: '宋',
      category: '史论',
      subjectId: 'chinese',
      chapterId: '2',
      sectionId: '五代史伶官传序',
    },
    '种树郭橐驼传': {
      title: '种树郭橐驼传',
      author: '柳宗元',
      dynasty: '唐',
      category: '传记散文',
      subjectId: 'chinese',
      chapterId: '3',
      sectionId: '种树郭橐驼传',
    },
    '登泰山记': {
      title: '登泰山记',
      author: '姚鼐',
      dynasty: '清',
      category: '游记散文',
      subjectId: 'chinese',
      chapterId: '3',
      sectionId: '登泰山记',
    },
  };

  const info = classicalInfo[poemId] || {
    title: poemId,
    author: '未知',
    dynasty: '',
    category: '文言文',
    subjectId: 'chinese',
    chapterId: '1',
    sectionId: poemId,
  };

  // 状态
  const [phase, setPhase] = useState<'loading' | 'learning'>('loading');
  const [originalText, setOriginalText] = useState('');
  const [activeTab, setActiveTab] = useState<'read' | 'translate' | 'words' | 'practice'>('read');
  const [wordFilter, setWordFilter] = useState<'全部' | '实词' | '虚词' | '句式' | '文化常识'>('全部');
  const [translations, setTranslations] = useState<TranslationSentence[]>([]);
  const [wordAnalysis, setWordAnalysis] = useState<ClassicalAnalysis | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());

  // 练习状态
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<{
    word: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });

  // 加载课本内容
  useEffect(() => {
    async function loadContent() {
      setLoadingPdf(true);
      try {
        const range = getSectionPageRange('chinese_b1', poemId);
        const fallbackData = await fallbackGetPDF('chinese');
        if (fallbackData?.full_text) {
          let content = '';
          if (range) {
            content = extractSectionContent(fallbackData, range.startPage, range.endPage);
          } else {
            content = fallbackData.full_text;
          }
          // 尝试提取对应课文
          const idx = content.indexOf(poemId);
          if (idx !== -1) {
            const nextMarker = content.indexOf('\n\n', idx + poemId.length);
            content = content.substring(idx, nextMarker !== -1 ? nextMarker + 200 : idx + 3000);
          }
          setOriginalText(content);
        }
      } catch (e) {
        console.error('[ClassicalRead] 加载失败:', e);
      } finally {
        setLoadingPdf(false);
        setPhase('learning');
      }
    }
    loadContent();
  }, [poemId]);

  // 调用逐句翻译
  const handleTranslate = useCallback(async () => {
    if (!settings?.deepseekKey) {
      alert('请先在设置中配置 DeepSeek API Key');
      return;
    }
    setLoadingTranslate(true);
    try {
      const response = await fetch('/api/translate-classical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: originalText,
          title: info.title,
          apiKey: settings.deepseekKey,
        }),
      });
      const data = await response.json();
      if (data.success && data.sentences?.length) {
        setTranslations(data.sentences);
        setShowTranslation(true);
        setActiveTab('translate');
      } else {
        alert('翻译失败：' + (data.error || '未知错误'));
      }
    } catch (e) {
      alert('翻译请求失败，请检查网络');
    } finally {
      setLoadingTranslate(false);
    }
  }, [originalText, info.title, settings?.deepseekKey]);

  // 调用实词/虚词提取
  const handleExtractWords = useCallback(async () => {
    if (!settings?.deepseekKey) {
      alert('请先在设置中配置 DeepSeek API Key');
      return;
    }
    setLoadingWords(true);
    try {
      const response = await fetch('/api/extract-classical-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: originalText,
          title: info.title,
          apiKey: settings.deepseekKey,
          sectionId: poemId,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setWordAnalysis(data.data);
        setActiveTab('words');
      } else {
        alert('提取失败：' + (data.error || '未知错误'));
      }
    } catch (e) {
      alert('提取请求失败，请检查网络');
    } finally {
      setLoadingWords(false);
    }
  }, [originalText, info.title, poemId, settings?.deepseekKey]);

  const toggleMastered = (key: string) => {
    setMasteredWords(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // 生成练习题（根据已提取的字词生成选择题）
  const generatePracticeQuestions = () => {
    if (!wordAnalysis) return;

    const questions: {
      word: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }[] = [];

    // 从实词生成题目
    const allRealWords = wordAnalysis.realWords.filter(w => w.meaning && w.meaning.length > 1);
    const allFunctionWords = wordAnalysis.functionWords.filter(w => w.meaning && w.meaning.length > 1);
    const allCulturalKnowledge = wordAnalysis.culturalKnowledge.filter(w => w.meaning && w.meaning.length > 1);
    
    // 合并所有有注释的字词
    const allMeaningfulWords = [
      ...allRealWords.map(w => ({ ...w, category: '实词' })),
      ...allFunctionWords.map(w => ({ ...w, category: '虚词' })),
      ...allCulturalKnowledge.map(w => ({ ...w, category: '文化常识' })),
    ].filter(w => w.meaning && w.meaning.length > 1);

    // 打乱顺序并取前8个
    const shuffled = allMeaningfulWords.sort(() => Math.random() - 0.5).slice(0, 8);

    shuffled.forEach(wordItem => {
      // 收集其他选项（从同一类别的词中选取）
      const sameCategory = allMeaningfulWords.filter(w => 
        w.category === wordItem.category && w.word !== wordItem.word
      );
      
      // 随机选取2-3个干扰项
      const distractors = sameCategory
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.meaning);

      // 如果干扰项不够，从其他类别补充
      while (distractors.length < 3) {
        const randomWord = allMeaningfulWords[Math.floor(Math.random() * allMeaningfulWords.length)];
        if (!distractors.includes(randomWord.meaning) && randomWord.word !== wordItem.word) {
          distractors.push(randomWord.meaning);
        }
      }

      // 构建选项
      const options = [wordItem.meaning, ...distractors.slice(0, 3)]
        .filter((v, i, a) => a.indexOf(v) === i) // 去重
        .sort(() => Math.random() - 0.5);

      questions.push({
        word: wordItem.word,
        question: `"${wordItem.word}"在文中的意思是？`,
        options: options.length >= 4 ? options.slice(0, 4) : [...options, '其他意思'],
        correctAnswer: wordItem.meaning,
        explanation: `${wordItem.category} "${wordItem.word}"：${wordItem.meaning}${wordItem.example ? `。例：${wordItem.example}` : ''}`,
      });
    });

    setPracticeQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setPracticeScore({ correct: 0, total: questions.length });
    setPracticeMode(true);
    setActiveTab('practice');
  };

  // 处理答题
  const handleAnswer = (answer: string) => {
    if (showAnswer) return;
    setSelectedAnswer(answer);
    setShowAnswer(true);
    
    if (answer === practiceQuestions[currentQuestionIndex].correctAnswer) {
      setPracticeScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
  };

  // 下一题
  const nextQuestion = () => {
    if (currentQuestionIndex < practiceQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const allWords = wordAnalysis
    ? [
        ...wordAnalysis.realWords.map(w => ({ ...w, category: '实词' as WordCategory })),
        ...wordAnalysis.functionWords.map(w => ({ ...w, category: '虚词' as WordCategory })),
        ...wordAnalysis.sentencePatterns.map(w => ({ ...w, category: '句式' as WordCategory })),
        ...wordAnalysis.culturalKnowledge.map(w => ({ ...w, category: '文化常识' as WordCategory })),
      ]
    : [];

  if (phase === 'loading' || loadingPdf) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl"><BookOpen className="h-10 w-10 text-white animate-pulse" /></div>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">正在加载课本内容...</h2>
          <p className="text-slate-500">《{info.title}》</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950">
      {/* 顶部导航 */}
      <header className="sticky top-16 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/subjects/${info.subjectId}`}>
                <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" />返回</Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{info.category}</Badge>
              <Badge variant="outline" className="text-xs">新高考Ⅱ卷</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 功能按钮区 */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button
            variant={activeTab === 'read' ? 'default' : 'outline'}
            onClick={() => setActiveTab('read')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />原文阅读
          </Button>
          <Button
            variant={activeTab === 'translate' ? 'default' : 'outline'}
            onClick={async () => {
              if (!showTranslation && translations.length === 0) {
                await handleTranslate();
              }
              setActiveTab('translate');
            }}
            disabled={loadingTranslate}
            className="gap-2"
          >
            {loadingTranslate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
            逐句翻译
          </Button>
          <Button
            variant={activeTab === 'words' ? 'default' : 'outline'}
            onClick={async () => {
              if (!wordAnalysis) {
                await handleExtractWords();
              }
              setActiveTab('words');
            }}
            disabled={loadingWords}
            className="gap-2"
          >
            {loadingWords ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            字词精析
          </Button>
          <Button
            variant={activeTab === 'practice' ? 'default' : 'outline'}
            onClick={() => {
              if (activeTab !== 'practice' || !practiceMode) {
                generatePracticeQuestions();
              }
            }}
            disabled={!wordAnalysis || wordAnalysis.realWords.length + wordAnalysis.functionWords.length < 4}
            className="gap-2"
            title="需要先提取字词"
          >
            <Target className="h-4 w-4" />
            注释练习
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>已掌握：{masteredWords.size}/{allWords.length}</span>
            <Progress value={allWords.length > 0 ? (masteredWords.size / allWords.length) * 100 : 0} className="h-2 w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧/上方：原文 + 翻译 或 练习 */}
          <div className={cn(
            'space-y-4',
            activeTab === 'practice' ? 'lg:col-span-3' : 'lg:col-span-2'
          )}>
            {/* 练习模式全宽显示 */}
            {activeTab === 'practice' && practiceQuestions.length > 0 && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                <CardHeader className="bg-gradient-to-r from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-500" />
                    <span>注释练习</span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {currentQuestionIndex + 1} / {practiceQuestions.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* 进度条 */}
                  <div className="space-y-2">
                    <Progress value={(currentQuestionIndex / practiceQuestions.length) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>正确率：{Math.round((practiceScore.correct / Math.max(1, currentQuestionIndex + (showAnswer ? 1 : 0))) * 100)}%</span>
                      <span>已答 {currentQuestionIndex + (showAnswer ? 1 : 0)} 题，答对 {practiceScore.correct} 题</span>
                    </div>
                  </div>

                  {/* 当前题目 */}
                  {practiceQuestions[currentQuestionIndex] && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-2">
                          {practiceQuestions[currentQuestionIndex].question}
                        </p>
                        <p className="text-sm text-slate-500 text-center">
                          选自《{info.title}》
                        </p>
                      </div>

                      {/* 选项 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {practiceQuestions[currentQuestionIndex].options.map((option, idx) => {
                          const isSelected = selectedAnswer === option;
                          const isCorrect = option === practiceQuestions[currentQuestionIndex].correctAnswer;
                          const showResult = showAnswer;

                          return (
                            <button
                              key={idx}
                              onClick={() => !showAnswer && handleAnswer(option)}
                              disabled={showAnswer}
                              className={cn(
                                'w-full p-4 rounded-xl border-2 text-left transition-all',
                                'hover:scale-[1.02] active:scale-[0.98]',
                                !showResult && 'hover:border-amber-400 hover:bg-amber-50/50',
                                showResult && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                                showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-950/30',
                                showResult && !isSelected && !isCorrect && 'border-slate-200 dark:border-slate-700 opacity-60',
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                                  showResult && isCorrect && 'bg-emerald-500 text-white',
                                  showResult && isSelected && !isCorrect && 'bg-red-500 text-white',
                                  !showResult && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                                )}>
                                  {showResult && isCorrect && <CheckCircle className="h-5 w-5" />}
                                  {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5" />}
                                  {!showResult && String.fromCharCode(65 + idx)}
                                </span>
                                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {option}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* 解析 */}
                      {showAnswer && (
                        <div className={cn(
                          'rounded-xl p-4 border',
                          selectedAnswer === practiceQuestions[currentQuestionIndex].correctAnswer
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                        )}>
                          <div className="flex items-start gap-3">
                            {selectedAnswer === practiceQuestions[currentQuestionIndex].correctAnswer ? (
                              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                                {selectedAnswer === practiceQuestions[currentQuestionIndex].correctAnswer
                                  ? '回答正确！'
                                  : '回答错误'}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                💡 {practiceQuestions[currentQuestionIndex].explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 下一题/完成按钮 */}
                      <div className="flex gap-3">
                        {showAnswer && currentQuestionIndex < practiceQuestions.length - 1 && (
                          <Button onClick={nextQuestion} className="flex-1 gap-2">
                            下一题
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                        {showAnswer && currentQuestionIndex === practiceQuestions.length - 1 && (
                          <Button
                            onClick={() => {
                              setPracticeMode(false);
                              setActiveTab('words');
                            }}
                            className="flex-1 gap-2"
                          >
                            <Award className="h-4 w-4" />
                            完成练习 · 得分 {practiceScore.correct}/{practiceQuestions.length}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 练习入口（当有字词但未开始练习时） */}
            {activeTab === 'practice' && practiceQuestions.length === 0 && wordAnalysis && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-2">检测到 {allWords.length} 个字词</p>
                  <p className="text-sm text-slate-500 mb-4">点击下方按钮生成注释练习</p>
                  <Button onClick={generatePracticeQuestions} className="gap-2">
                    <Target className="h-4 w-4" />
                    开始练习
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 原文卡片 */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <span>原文</span>
                  <Badge variant="outline" className="text-xs ml-auto">《{info.title}》</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-slate-500">
                    {originalText ? `${originalText.length} 字` : ''}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (ttsPlaying) {
                          stop();
                        } else {
                          speak(originalText);
                        }
                      }}
                      disabled={!originalText || isLoading}
                      className="gap-1"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : ttsPlaying ? (
                        <Square className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                      {ttsPlaying ? '停止' : '朗读全文'}
                    </Button>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <p className="text-lg leading-loose text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-serif">
                    {originalText || '暂无内容，请检查课本加载'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 翻译卡片 */}
            {(showTranslation || translations.length > 0) && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
                <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10">
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-emerald-500" />
                    <span>逐句翻译</span>
                    <span className="text-xs text-slate-400 ml-auto">共 {translations.length} 句</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {translations.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-slate-400 mt-1">{i + 1}</span>
                        <div className="flex-1 space-y-2">
                          <p className="text-base font-serif text-slate-700 dark:text-slate-300 leading-relaxed">
                            {item.original}
                          </p>
                          <div className="h-px bg-slate-100 dark:bg-slate-700" />
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {item.translation}
                          </p>
                          {item.keyWords && item.keyWords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.keyWords.map((kw, j) => (
                                <span
                                  key={j}
                                  className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  title={kw.note || kw.meaning}
                                >
                                  {kw.word}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.grammar && (
                            <Badge variant="outline" className="text-xs">{item.grammar}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 空翻译状态 */}
            {activeTab === 'translate' && translations.length === 0 && !loadingTranslate && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Languages className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">点击上方"逐句翻译"按钮，AI将为您逐句翻译并标注重点字词</p>
                  <Button onClick={handleTranslate} disabled={loadingTranslate} className="gap-2">
                    {loadingTranslate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {loadingTranslate ? '翻译中...' : '开始翻译'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 注释练习 */}
            {activeTab === 'practice' && practiceQuestions.length > 0 && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                <CardHeader className="bg-gradient-to-r from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-amber-500" />
                    <span>注释练习</span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {currentQuestionIndex + 1} / {practiceQuestions.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* 进度条 */}
                  <div className="space-y-2">
                    <Progress value={(currentQuestionIndex / practiceQuestions.length) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>正确率：{Math.round((practiceScore.correct / Math.max(1, currentQuestionIndex + (showAnswer ? 1 : 0))) * 100)}%</span>
                      <span>已答 {currentQuestionIndex + (showAnswer ? 1 : 0)} 题，答对 {practiceScore.correct} 题</span>
                    </div>
                  </div>

                  {/* 当前题目 */}
                  {practiceQuestions[currentQuestionIndex] && (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                        <p className="text-xl font-bold text-slate-800 dark:text-slate-200 text-center mb-2">
                          {practiceQuestions[currentQuestionIndex].question}
                        </p>
                        <p className="text-sm text-slate-500 text-center">
                          选自《{info.title}》
                        </p>
                      </div>

                      {/* 选项 */}
                      <div className="grid grid-cols-1 gap-3">
                        {practiceQuestions[currentQuestionIndex].options.map((option, idx) => {
                          const isSelected = selectedAnswer === option;
                          const isCorrect = option === practiceQuestions[currentQuestionIndex].correctAnswer;
                          const showResult = showAnswer;

                          return (
                            <button
                              key={idx}
                              onClick={() => !showAnswer && handleAnswer(option)}
                              disabled={showAnswer}
                              className={cn(
                                'w-full p-4 rounded-xl border-2 text-left transition-all',
                                'hover:scale-[1.02] active:scale-[0.98]',
                                !showResult && 'hover:border-amber-400 hover:bg-amber-50/50',
                                showResult && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                                showResult && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-950/30',
                                showResult && !isSelected && !isCorrect && 'border-slate-200 dark:border-slate-700 opacity-60',
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                                  showResult && isCorrect && 'bg-emerald-500 text-white',
                                  showResult && isSelected && !isCorrect && 'bg-red-500 text-white',
                                  !showResult && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                                )}>
                                  {showResult && isCorrect && <CheckCircle className="h-5 w-5" />}
                                  {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5" />}
                                  {!showResult && String.fromCharCode(65 + idx)}
                                </span>
                                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {option}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* 解析 */}
                      {showAnswer && (
                        <div className={cn(
                          'rounded-xl p-4 border',
                          selectedAnswer === practiceQuestions[currentQuestionIndex].correctAnswer
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                        )}>
                          <div className="flex items-start gap-3">
                            {selectedAnswer === practiceQuestions[currentQuestionIndex].correctAnswer ? (
                              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                                {selectedAnswer === practiceQuestions[currentQuestionIndex].correctAnswer
                                  ? '回答正确！'
                                  : '回答错误'}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                💡 {practiceQuestions[currentQuestionIndex].explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 下一题/完成按钮 */}
                      <div className="flex gap-3">
                        {showAnswer && currentQuestionIndex < practiceQuestions.length - 1 && (
                          <Button onClick={nextQuestion} className="flex-1 gap-2">
                            下一题
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                        {showAnswer && currentQuestionIndex === practiceQuestions.length - 1 && (
                          <Button
                            onClick={() => {
                              setPracticeMode(false);
                              setActiveTab('words');
                            }}
                            className="flex-1 gap-2"
                          >
                            <Award className="h-4 w-4" />
                            完成练习 · 得分 {practiceScore.correct}/{practiceQuestions.length}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 练习入口（当有字词但未开始练习时） */}
            {activeTab === 'practice' && practiceQuestions.length === 0 && wordAnalysis && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-2">检测到 {allWords.length} 个字词</p>
                  <p className="text-sm text-slate-500 mb-4">点击下方按钮生成注释练习</p>
                  <Button onClick={generatePracticeQuestions} className="gap-2">
                    <Target className="h-4 w-4" />
                    开始练习
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右侧/下方：字词精析（非练习模式时显示） */}
          {activeTab !== 'practice' && (
          <div className="space-y-4">
            {activeTab === 'words' && wordAnalysis ? (
              <>
                {/* 统计 */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="border-0 shadow">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{wordAnalysis.realWords.length}</p>
                      <p className="text-xs text-slate-500">实词</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-purple-600">{wordAnalysis.functionWords.length}</p>
                      <p className="text-xs text-slate-500">虚词</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-amber-600">{wordAnalysis.sentencePatterns.length}</p>
                      <p className="text-xs text-slate-500">句式</p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{wordAnalysis.culturalKnowledge.length}</p>
                      <p className="text-xs text-slate-500">文化常识</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 筛选标签 */}
                <div className="flex flex-wrap gap-2">
                  {(['全部', '实词', '虚词', '句式', '文化常识'] as const).map(tab => (
                    <Button
                      key={tab}
                      variant={wordFilter === tab ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setWordFilter(tab)}
                      className="text-xs"
                    >
                      {tab}
                    </Button>
                  ))}
                </div>

                {/* 字词列表 */}
                <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {allWords.map((item, i) => {
                    const key = `${item.category}-${i}`;
                    const isMastered = masteredWords.has(key);
                    return (
                      <Card
                        key={i}
                        className={cn(
                          'border-0 shadow-sm cursor-pointer transition-all hover:shadow-md',
                          isMastered && 'bg-green-50/50 dark:bg-green-950/10'
                        )}
                        onClick={() => {
                          setSelectedWord(item);
                          toggleMastered(key);
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <span className={cn(
                              'text-xs px-1.5 py-0.5 rounded flex-shrink-0',
                              item.category === '实词' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              item.category === '虚词' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                              item.category === '句式' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            )}>
                              {item.category}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                {item.word}
                                {isMastered && <CheckCircle className="h-3 w-3 text-green-500 inline ml-1" />}
                              </p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                {item.meaning || item.explanation || item.translation}
                              </p>
                              {item.note && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">💡 {item.note}</p>
                              )}
                              {item.usage && (
                                <p className="text-xs text-slate-500 mt-0.5">用法：{item.usage}</p>
                              )}
                              {item.example && (
                                <p className="text-xs text-slate-400 mt-0.5 font-serif">例：{item.example}</p>
                              )}
                              {item.original && (
                                <p className="text-xs text-slate-500 mt-0.5 font-serif">
                                  "{item.original}" → {item.translation}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : activeTab === 'words' && !wordAnalysis && !loadingWords ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">点击上方"字词精析"按钮，AI将提取所有高考考点词汇</p>
                  <Button onClick={handleExtractWords} disabled={loadingWords} className="gap-2">
                    {loadingWords ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {loadingWords ? '提取中...' : '开始提取'}
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {/* 作者信息卡片 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {info.dynasty[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{info.author}</p>
                    <p className="text-xs text-slate-500">{info.dynasty}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-bold">{info.title}</span> — {info.category}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  📌 辽宁新高考Ⅱ卷必考古文篇目
                </p>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClassicalReadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <ClassicalReadPageContent />
    </Suspense>
  );
}
