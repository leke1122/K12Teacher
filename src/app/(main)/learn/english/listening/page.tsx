'use client';

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Play, Pause, RotateCcw, Volume2, CheckCircle, XCircle, Eye, EyeOff, BookOpen, Headphones } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { useEnglishProgress } from '@/hooks/useEnglishProgress';
import { updateStepProgress } from '@/lib/englishProgress';

// 听力题目类型定义
interface ListeningQuestion {
  id: string;
  type: 'choice' | 'fill' | 'repeat';
  audio: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  transcript: string;
  difficulty: '简单' | '中等' | '困难';
  category: string;
}

// 听力材料数据
const LISTENING_MATERIALS: ListeningQuestion[] = [
  // 日常生活对话
  {
    id: 'daily-1',
    type: 'choice',
    category: '日常生活',
    difficulty: '简单',
    audio: 'Good morning! How are you today?',
    question: 'How is the speaker greeting?',
    options: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'],
    correctAnswer: 'Good morning',
    transcript: 'Good morning! How are you today? - Speaker A greets Speaker B in the morning. Speaker B replies, "I am fine, thank you."'
  },
  {
    id: 'daily-2',
    type: 'choice',
    category: '日常生活',
    difficulty: '简单',
    audio: 'Excuse me, where is the nearest supermarket?',
    question: 'What is the speaker asking for?',
    options: ['A restaurant', 'A supermarket', 'A hospital', 'A bank'],
    correctAnswer: 'A supermarket',
    transcript: 'A: Excuse me, where is the nearest supermarket? B: It is just around the corner on Main Street.'
  },
  {
    id: 'daily-3',
    type: 'choice',
    category: '日常生活',
    difficulty: '中等',
    audio: 'I would like to book a table for two for tonight at seven o\'clock, please.',
    question: 'What does the speaker want to do?',
    options: ['Book a hotel room', 'Book a restaurant table', 'Buy movie tickets', 'Reserve a taxi'],
    correctAnswer: 'Book a restaurant table',
    transcript: 'Customer: I would like to book a table for two for tonight at seven o\'clock. Waiter: Certainly, sir. Do you have a preference for smoking or non-smoking?'
  },
  {
    id: 'daily-4',
    type: 'choice',
    category: '日常生活',
    difficulty: '中等',
    audio: 'The weather report says it will rain tomorrow, so we should cancel the picnic.',
    question: 'What will the speakers probably do?',
    options: ['Go for a picnic', 'Cancel the picnic', 'Visit a museum', 'Go shopping'],
    correctAnswer: 'Cancel the picnic',
    transcript: 'A: Look at the weather forecast for tomorrow. It says there will be heavy rain. B: Oh no! We were planning to have a picnic in the park.'
  },
  {
    id: 'daily-5',
    type: 'fill',
    category: '日常生活',
    difficulty: '困难',
    audio: 'Could you please tell me how to get to the art gallery from here?',
    question: 'What place does the speaker want to find?',
    correctAnswer: 'art gallery',
    transcript: 'Tourist: Excuse me, could you please tell me how to get to the art gallery from here? Local: Sure, go straight for two blocks and turn left at the traffic lights.'
  },
  // 校园场景对话
  {
    id: 'campus-1',
    type: 'choice',
    category: '校园场景',
    difficulty: '简单',
    audio: 'When does the library close on weekends?',
    question: 'What are they talking about?',
    options: ['Library hours', 'Class schedule', 'Exam results', 'Teacher\'s office'],
    correctAnswer: 'Library hours',
    transcript: 'Student A: When does the library close on weekends? Student B: It closes at 5 PM on Saturday and 8 PM on Sunday.'
  },
  {
    id: 'campus-2',
    type: 'choice',
    category: '校园场景',
    difficulty: '简单',
    audio: 'I forgot to bring my textbook. Can I borrow yours?',
    question: 'What does the speaker need?',
    options: ['A pen', 'A notebook', 'A textbook', 'A calculator'],
    correctAnswer: 'A textbook',
    transcript: 'Tom: I forgot to bring my textbook. Can I borrow yours? Jerry: Sure, here you go. But please return it tomorrow.'
  },
  {
    id: 'campus-3',
    type: 'fill',
    category: '校园场景',
    difficulty: '中等',
    audio: 'The final exam will be held next Monday morning in the school gymnasium.',
    question: 'When will the final exam be held?',
    correctAnswer: 'next Monday',
    transcript: 'Teacher: Attention, everyone. The final exam will be held next Monday morning in the school gymnasium. Please bring your student ID cards.'
  },
  {
    id: 'campus-4',
    type: 'choice',
    category: '校园场景',
    difficulty: '中等',
    audio: 'We have a school trip to the science museum next Friday. Are you interested in joining us?',
    question: 'What event are they discussing?',
    options: ['A school trip', 'A sports day', 'A science fair', 'A music concert'],
    correctAnswer: 'A school trip',
    transcript: 'Class representative: We have a school trip to the science museum next Friday. Are you interested in joining us? Students: Yes, we would love to!'
  },
  {
    id: 'campus-5',
    type: 'repeat',
    category: '校园场景',
    difficulty: '困难',
    audio: 'Academic achievement is not measured solely by test scores, but by the knowledge and skills we acquire.',
    question: 'Please repeat the sentence clearly:',
    correctAnswer: 'Academic achievement is not measured solely by test scores, but by the knowledge and skills we acquire.',
    transcript: 'Professor: Academic achievement is not measured solely by test scores, but by the knowledge and skills we acquire throughout our educational journey.'
  },
  // 学术讲座片段
  {
    id: 'lecture-1',
    type: 'choice',
    category: '学术讲座',
    difficulty: '中等',
    audio: 'Photosynthesis is the process by which green plants convert sunlight into chemical energy.',
    question: 'What is photosynthesis?',
    options: ['A digestive process', 'An energy conversion process', 'A respiratory process', 'A reproductive process'],
    correctAnswer: 'An energy conversion process',
    transcript: 'Professor: Today we will learn about photosynthesis. Photosynthesis is the process by which green plants convert sunlight into chemical energy stored in glucose.'
  },
  {
    id: 'lecture-2',
    type: 'fill',
    category: '学术讲座',
    difficulty: '困难',
    audio: 'The Industrial Revolution began in Britain in the late eighteenth century and transformed society.',
    question: 'When did the Industrial Revolution begin?',
    correctAnswer: 'late eighteenth century',
    transcript: 'Historian: The Industrial Revolution began in Britain in the late eighteenth century and transformed society from agrarian to industrial.'
  },
  {
    id: 'lecture-3',
    type: 'choice',
    category: '学术讲座',
    difficulty: '困难',
    audio: 'Climate change poses significant challenges to biodiversity and ecosystem stability worldwide.',
    question: 'What is the main topic of this lecture?',
    options: ['Economic development', 'Climate change and biodiversity', 'Space exploration', 'Medical research'],
    correctAnswer: 'Climate change and biodiversity',
    transcript: 'Scientist: Climate change poses significant challenges to biodiversity and ecosystem stability worldwide. Rising temperatures affect species distribution and migration patterns.'
  },
  // 新闻播报片段
  {
    id: 'news-1',
    type: 'choice',
    category: '新闻播报',
    difficulty: '中等',
    audio: 'A new high-speed railway connecting the city center to the airport has officially opened yesterday.',
    question: 'What has opened yesterday?',
    options: ['A new bridge', 'A high-speed railway', 'A new airport', 'A subway line'],
    correctAnswer: 'A high-speed railway',
    transcript: 'Reporter: Breaking news! A new high-speed railway connecting the city center to the airport has officially opened yesterday. The journey time has been reduced from one hour to just twenty minutes.'
  },
  {
    id: 'news-2',
    type: 'fill',
    category: '新闻播报',
    difficulty: '困难',
    audio: 'The United Nations announced a global initiative to eliminate plastic pollution by the year 2050.',
    question: 'What did the United Nations announce?',
    correctAnswer: 'global initiative',
    transcript: 'UN Spokesperson: The United Nations announced a global initiative to eliminate plastic pollution by the year 2050. All member countries are encouraged to participate.'
  },
  {
    id: 'news-3',
    type: 'repeat',
    category: '新闻播报',
    difficulty: '困难',
    audio: 'International cooperation is essential for addressing global challenges such as climate change and pandemics.',
    question: 'Please repeat the sentence clearly:',
    correctAnswer: 'International cooperation is essential for addressing global challenges such as climate change and pandemics.',
    transcript: 'Anchor: In today\'s news, experts emphasize that international cooperation is essential for addressing global challenges such as climate change and pandemics.'
  },
];

function ListeningContent() {
  const { updateStep, markVisited } = useEnglishProgress('english');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const [completedQuestions, setCompletedQuestions] = useState<string[]>([]);

  const currentQuestion = LISTENING_MATERIALS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / LISTENING_MATERIALS.length) * 100;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 标记听力步骤为已访问
  useEffect(() => {
    markVisited('listening');
  }, [markVisited]);

  // 初始化语音列表
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // 优先选择英语语音
      const englishVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Microsoft'))
      ) || availableVoices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) {
        setSelectedVoice(englishVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // 播放语音
  const playAudio = useCallback(() => {
    if (!currentQuestion) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(currentQuestion.audio);
    utterance.rate = speechRate;
    utterance.lang = 'en-US';
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setHighlightedWordIndex(-1);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setHighlightedWordIndex(-1);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);

    // 逐词高亮模拟
    const words = currentQuestion.audio.split(' ');
    let wordIndex = 0;
    const highlightInterval = setInterval(() => {
      if (!isPlaying || wordIndex >= words.length) {
        clearInterval(highlightInterval);
        setHighlightedWordIndex(-1);
        return;
      }
      setHighlightedWordIndex(wordIndex);
      wordIndex++;
    }, (currentQuestion.audio.length / words.length) * 80 * (1 / speechRate));

    return () => clearInterval(highlightInterval);
  }, [currentQuestion, speechRate, selectedVoice, isPlaying]);

  const pauseAudio = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const resumeAudio = () => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const replayAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setHighlightedWordIndex(-1);
    setTimeout(() => playAudio(), 100);
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setHighlightedWordIndex(-1);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    const correct = selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowFeedback(true);
    
    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    setCompletedQuestions(prev => [...prev, currentQuestion.id]);

    if (correct) {
      toast('回答正确！', 'success');
    } else {
      toast('回答错误', 'error');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < LISTENING_MATERIALS.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer('');
      setShowFeedback(false);
      setShowTranscript(false);
      stopAudio();
      
      // 自动更新进度
      if (nextIndex === LISTENING_MATERIALS.length - 1) {
        updateStep('listening', 'in_progress');
      }
    } else {
      // 完成所有题目
      updateStep('listening', 'completed');
      toast(`听力训练完成！得分：${score.correct}/${LISTENING_MATERIALS.length}`, 'success');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setSelectedAnswer('');
      setShowFeedback(false);
      setShowTranscript(false);
      stopAudio();
    }
  };

  const handleRetry = () => {
    stopAudio();
    setTimeout(() => playAudio(), 100);
  };

  // 渲染听力原文（带高亮）
  const renderTranscript = () => {
    if (!currentQuestion) return null;
    const words = currentQuestion.audio.split(' ');
    
    return (
      <div className="text-lg leading-relaxed space-x-1">
        {words.map((word, idx) => (
          <span
            key={idx}
            className={`transition-all duration-200 ${
              idx === highlightedWordIndex
                ? 'bg-yellow-200 text-slate-900 rounded px-0.5'
                : 'text-slate-700'
            }`}
          >
            {word}{' '}
          </span>
        ))}
      </div>
    );
  };

  const isAllCompleted = currentQuestionIndex >= LISTENING_MATERIALS.length - 1 && showFeedback;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        返回英语学习中心
      </Button>

      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            🎧 听力训练
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            第 {currentQuestionIndex + 1} 题 / 共 {LISTENING_MATERIALS.length} 题
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{currentQuestion?.category}</Badge>
          <Badge variant={currentQuestion?.difficulty === '简单' ? 'secondary' : currentQuestion?.difficulty === '中等' ? 'default' : 'destructive'}>
            {currentQuestion?.difficulty}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {score.correct}/{score.total}
          </Badge>
        </div>
      </div>

      {/* 进度条 */}
      <Progress value={progress} className="h-2" />

      {isAllCompleted ? (
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">
              听力训练完成！
            </h2>
            <p className="text-green-600 mb-4">
              总得分：{score.correct} / {LISTENING_MATERIALS.length}
              （正确率：{Math.round((score.correct / LISTENING_MATERIALS.length) * 100)}%）
            </p>
            <Button onClick={() => updateStep('listening', 'completed')}>
              完成听力训练
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 音频播放器 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-blue-500" />
                音频播放器
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 播放控制 */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={replayAudio}
                  className="rounded-full h-12 w-12 p-0"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={isPlaying ? pauseAudio : playAudio}
                  className="rounded-full h-16 w-16 p-0 bg-blue-500 hover:bg-blue-600"
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7 ml-1" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleRetry}
                  className="rounded-full h-12 w-12 p-0"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>

              {/* 听力原文高亮显示 */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 min-h-[60px] flex items-center justify-center">
                {isPlaying ? (
                  renderTranscript()
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {showTranscript ? currentQuestion?.transcript : '点击播放按钮开始听力训练'}
                  </p>
                )}
              </div>

              {/* 播放设置 */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">语速：</span>
                  <select
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="text-sm border rounded px-2 py-1 bg-white dark:bg-slate-800"
                  >
                    <option value="0.8">0.8x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.2">1.2x</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">语音：</span>
                  <select
                    value={selectedVoice?.name || ''}
                    onChange={(e) => {
                      const voice = voices.find(v => v.name === e.target.value);
                      if (voice) setSelectedVoice(voice);
                    }}
                    className="text-sm border rounded px-2 py-1 bg-white dark:bg-slate-800 max-w-[200px]"
                  >
                    {voices.filter(v => v.lang.startsWith('en')).map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="gap-1"
                >
                  {showTranscript ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showTranscript ? '隐藏原文' : '查看原文'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 题目 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                {currentQuestion?.type === 'choice' ? '选择题' : 
                 currentQuestion?.type === 'fill' ? '填空题' : '跟读题'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium text-lg">{currentQuestion?.question}</p>

              {/* 选择题选项 */}
              {currentQuestion?.type === 'choice' && currentQuestion.options && (
                <div className="grid gap-2">
                  {currentQuestion.options.map((option, idx) => (
                    <Button
                      key={idx}
                      variant={selectedAnswer === option ? 'default' : 'outline'}
                      className={`justify-start ${
                        showFeedback && option === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : showFeedback && selectedAnswer === option && !isCorrect
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : ''
                      }`}
                      onClick={() => {
                        if (!showFeedback) setSelectedAnswer(option);
                      }}
                      disabled={showFeedback}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {/* 填空题输入 */}
              {currentQuestion?.type === 'fill' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="请输入你听到的单词..."
                    className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    disabled={showFeedback}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !showFeedback) {
                        handleCheckAnswer();
                      }
                    }}
                  />
                </div>
              )}

              {/* 跟读题 */}
              {currentQuestion?.type === 'repeat' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">请跟读以下句子：</p>
                    <p className="text-lg font-medium text-blue-800 dark:text-blue-200">
                      {currentQuestion.audio}
                    </p>
                  </div>
                  <input
                    type="text"
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="输入你听到的内容（可输入部分单词）..."
                    className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    disabled={showFeedback}
                  />
                </div>
              )}

              {/* 提交按钮 */}
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
                    <p className="text-sm text-red-600 mb-2">
                      正确答案：{currentQuestion?.correctAnswer}
                    </p>
                  )}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mt-2">
                    <p className="text-sm text-slate-600">
                      <strong>听力原文：</strong>{currentQuestion?.transcript}
                    </p>
                  </div>
                  <Button
                    onClick={handleNext}
                    className="w-full mt-3"
                  >
                    {currentQuestionIndex < LISTENING_MATERIALS.length - 1 ? '下一题 →' : '完成训练'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 导航 */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              ← 上一题
            </Button>
            <Button
              variant="outline"
              onClick={replayAudio}
              className="gap-2"
            >
              <Volume2 className="h-4 w-4" />
              重播音频
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function EnglishListeningPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <ListeningContent />
    </Suspense>
  );
}
