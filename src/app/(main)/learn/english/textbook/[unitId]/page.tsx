'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useEnglishProgress } from '@/hooks/useEnglishProgress';
import { toast } from '@/components/ui/toast';

interface Section {
  id: number;
  original: string;
  translation: string;
  explanation: string;
  vocabulary: Array<{ word: string; meaning: string; collocation?: string }>;
  grammarPoints: string[];
  keySentences: string[];
  question: { text: string; options: string[]; correct: string };
}

const ENGLISH_UNITS: Record<string, { title: string; content: string[] }> = {
  'unit-1': {
    title: 'Unit 1 A New Beginning',
    content: [
      'Welcome back to school! It is the beginning of a new semester. All the students are excited to see their friends again.',
      'My name is Li Ming. I am a senior high school student. I like English very much because it is interesting and useful.',
      'Last summer vacation, I traveled to Beijing with my parents. We visited the Great Wall and the Palace Museum. It was an unforgettable experience.',
    ],
  },
  'unit-2': {
    title: 'Unit 2 Travelling Around',
    content: [
      'Traveling is one of the best ways to broaden our horizons. By visiting different places, we can learn about various cultures and customs.',
      'When traveling abroad, it is important to respect local customs. For example, in some countries, tipping is not expected and may even be considered rude.',
      'The development of high-speed rail has made traveling much more convenient. You can reach many cities within just a few hours.',
    ],
  },
};

function EnglishTextbookContent() {
  const params = useParams();
  const unitId = params.unitId as string;
  const { settings } = useSettingsStore();
  const { updateStep, markVisited, getStepStatus } = useEnglishProgress('english');
  
  const unit = ENGLISH_UNITS[unitId] || ENGLISH_UNITS['unit-1'];

  const [sections, setSections] = useState<Section[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [currentVocab, setCurrentVocab] = useState<Section['vocabulary']>([]);
  const [currentGrammar, setCurrentGrammar] = useState<string[]>([]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Mark textbook step as visited when page loads
  useEffect(() => {
    markVisited('textbook');
  }, [markVisited]);

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const generateSectionContent = useCallback(async (original: string, index: number) => {
    if (!settings?.deepseekKey) {
      toast('请先配置 API Key', 'error');
      return;
    }
    setGenerating(true);
    try {
      const response = await fetch('/api/english/textbook/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: original,
          apiKey: settings.deepseekKey,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate explanation');

      const data = await response.json();

      setSections(prev => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          translation: data.translation,
          explanation: data.explanation,
          vocabulary: data.vocabulary || [],
          grammarPoints: data.grammarPoints || [],
          keySentences: data.keySentences || [],
        };
        return updated;
      });

      setCurrentTranslation(data.translation || '');
      setCurrentExplanation(data.explanation || '');
      setCurrentVocab(data.vocabulary || []);
      setCurrentGrammar(data.grammarPoints || []);
    } catch (error) {
      toast('生成讲解失败，请重试', 'error');
    } finally {
      setGenerating(false);
    }
  }, [settings?.deepseekKey]);

  useEffect(() => {
    const initialSections: Section[] = unit.content.map((text, idx) => ({
      id: idx,
      original: text,
      translation: '',
      explanation: '',
      vocabulary: [],
      grammarPoints: [],
      keySentences: [],
      question: {
        text: '这段的主旨是什么？',
        options: ['描述过去经历', '讨论未来计划', '介绍学习方法', '说明地理知识'],
        correct: '描述过去经历',
      },
    }));
    setSections(initialSections);
    setLoading(false);
  }, [unitId]);

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    const current = sections[currentIndex];
    const correct = selectedAnswer === current.question.correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCompletedSections(prev => [...prev, currentIndex]);
      toast('回答正确！', 'success');
    } else {
      toast('回答错误，请再思考一下', 'error');
    }
  };

  const handleNext = () => {
    if (currentIndex < sections.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedAnswer('');
      setShowFeedback(false);
      setShowTranslation(false);
      setShowExplanation(false);
      
      const nextSection = sections[nextIndex];
      if (!nextSection.translation) {
        generateSectionContent(nextSection.original, nextIndex);
      } else {
        setCurrentTranslation(nextSection.translation);
        setCurrentExplanation(nextSection.explanation);
        setCurrentVocab(nextSection.vocabulary);
        setCurrentGrammar(nextSection.grammarPoints);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setSelectedAnswer('');
      setShowFeedback(false);
      setShowTranslation(false);
      setShowExplanation(false);
      
      const prevSection = sections[prevIndex];
      if (prevSection.translation) {
        setCurrentTranslation(prevSection.translation);
        setCurrentExplanation(prevSection.explanation);
        setCurrentVocab(prevSection.vocabulary);
        setCurrentGrammar(prevSection.grammarPoints);
      }
    }
  };

  const handleShowTranslation = () => {
    setShowTranslation(true);
    if (!currentTranslation && sections[currentIndex]) {
      generateSectionContent(sections[currentIndex].original, currentIndex);
    }
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
    if (!currentExplanation && sections[currentIndex]) {
      generateSectionContent(sections[currentIndex].original, currentIndex);
    }
  };

  const handleMarkUnitComplete = () => {
    updateStep('textbook', 'completed');
    toast('单元学习完成！', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const current = sections[currentIndex];
  const progress = ((currentIndex + 1) / sections.length) * 100;
  const allCompleted = completedSections.length === sections.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        返回英语学习中心
      </Button>

      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          📖 {unit.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          第 {currentIndex + 1} 段 / 共 {sections.length} 段
        </p>
      </div>

      {/* 进度条 */}
      <Progress value={progress} className="h-2" />

      {allCompleted ? (
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">
              恭喜！本单元学习完成
            </h2>
            <p className="text-green-600 mb-4">
              你已经完成了所有段落的学习，继续下一单元吧！
            </p>
            <Button onClick={handleMarkUnitComplete} className="mt-2">
              标记为已完成
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 原文卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>📝 英文原文</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speak(current.original)}
                  className="gap-1"
                >
                  <Volume2 className="h-4 w-4" />
                  朗读
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                {current.original}
              </p>
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleShowTranslation}
              disabled={showTranslation}
              className="gap-1"
            >
              📖 查看翻译
            </Button>
            <Button
              variant="outline"
              onClick={handleShowExplanation}
              disabled={showExplanation}
              className="gap-1"
            >
              💡 查看讲解
            </Button>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              ← 上一段
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === sections.length - 1}
            >
              下一段 →
            </Button>
          </div>

          {/* 翻译 */}
          {showTranslation && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-base">📖 中文翻译</CardTitle>
              </CardHeader>
              <CardContent>
                {generating ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    正在生成翻译...
                  </div>
                ) : (
                  <p className="text-slate-700 dark:text-slate-200">
                    {currentTranslation || '正在生成翻译...'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* 讲解 */}
          {showExplanation && (
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader>
                <CardTitle className="text-base">💡 词汇与语法讲解</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generating ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    正在生成讲解...
                  </div>
                ) : (
                  <>
                    {/* 词汇 */}
                    {currentVocab.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">📚 重点词汇</h4>
                        <div className="space-y-2">
                          {currentVocab.map((v, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-blue-600">{v.word}</span>
                                <span className="text-sm text-muted-foreground">{v.meaning}</span>
                              </div>
                              {v.collocation && (
                                <p className="text-xs text-slate-500 mt-1">搭配：{v.collocation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 语法点 */}
                    {currentGrammar.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">📝 语法重点</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                          {currentGrammar.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI讲解 */}
                    {currentExplanation && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">🤖 AI讲解</h4>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {currentExplanation}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* 理解题 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🧠 理解检测</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium">{current.question.text}</p>
              <div className="grid gap-2">
                {current.question.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant={selectedAnswer === option ? 'default' : 'outline'}
                    className={`justify-start ${
                      showFeedback && option === current.question.correct
                        ? 'border-green-500 bg-green-50'
                        : showFeedback && selectedAnswer === option && !isCorrect
                          ? 'border-red-500 bg-red-50'
                          : ''
                    }`}
                    onClick={() => {
                      if (!showFeedback) {
                        setSelectedAnswer(option);
                      }
                    }}
                    disabled={showFeedback}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              
              {!showFeedback ? (
                <Button
                  onClick={handleCheckAnswer}
                  disabled={!selectedAnswer}
                  className="w-full"
                >
                  提交答案
                </Button>
              ) : (
                <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {isCorrect ? '回答正确！' : '回答错误'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <p className="text-sm text-red-600">
                      正确答案：{current.question.correct}
                    </p>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={currentIndex === sections.length - 1}
                    className="w-full mt-3"
                  >
                    {currentIndex === sections.length - 1 ? '完成学习' : '下一段 →'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function EnglishTextbookPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <EnglishTextbookContent />
    </Suspense>
  );
}
