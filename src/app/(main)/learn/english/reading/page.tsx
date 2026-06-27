'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Brain, BookOpen, Eye } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from '@/components/ui/toast';
import { useEnglishProgress } from '@/hooks/useEnglishProgress';

interface ReadingPassage {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  content: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correct: string;
    explanation: string;
  }>;
}

const READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'passage-1',
    title: 'The Importance of Reading',
    difficulty: 'easy',
    topic: '??',
    content: `Reading is one of the most important skills we can learn. It opens doors to new worlds and ideas. When we read, we not only learn new words but also develop our thinking abilities.

Good readers can understand complex ideas and communicate them effectively. They can learn from other people's experiences without having to go through everything themselves. This is why reading is so valuable for students.

There are many types of reading material available today. Books, newspapers, magazines, and the internet all provide opportunities for us to practice and improve our reading skills.`,
    questions: [
      {
        id: 'q1',
        question: 'What is the main idea of this passage?',
        options: [
          'Reading is only important for students',
          'Reading is one of the most important skills',
          'We should only read books',
          'The internet is better than books'
        ],
        correct: 'Reading is one of the most important skills',
        explanation: '???????"Reading is one of the most important skills we can learn."??????'
      },
      {
        id: 'q2',
        question: 'According to the passage, what can good readers do?',
        options: [
          'Only read quickly',
          'Understand complex ideas and communicate them',
          'Only read easy books',
          'Avoid reading newspapers'
        ],
        correct: 'Understand complex ideas and communicate them',
        explanation: '??????"Good readers can understand complex ideas and communicate them effectively."'
      },
      {
        id: 'q3',
        question: 'Where can we find reading materials according to the passage?',
        options: [
          'Only in libraries',
          'Books, newspapers, magazines, and the internet',
          'Only in schools',
          'Only in books'
        ],
        correct: 'Books, newspapers, magazines, and the internet',
        explanation: '??????????????Books, newspapers, magazines, and the internet.'
      }
    ]
  },
  {
    id: 'passage-2',
    title: 'Climate Change',
    difficulty: 'medium',
    topic: '??',
    content: `Climate change has become one of the most serious challenges facing our planet today. Over the past century, global temperatures have risen by about 1 degree Celsius, mainly due to human activities.

The burning of fossil fuels releases carbon dioxide into the atmosphere, which traps heat and causes the greenhouse effect. This leads to melting ice caps, rising sea levels, and more extreme weather conditions.

Many countries are now working together to reduce carbon emissions and develop clean energy sources. However, individual actions also matter. We can all contribute by using less energy, recycling, and making environmentally friendly choices in our daily lives.`,
    questions: [
      {
        id: 'q1',
        question: 'What has caused global temperatures to rise according to the passage?',
        options: [
          'Natural climate cycles',
          'Human activities',
          'Only industrial factories',
          'Melting ice caps'
        ],
        correct: 'Human activities',
        explanation: '????"global temperatures have risen...mainly due to human activities."'
      },
      {
        id: 'q2',
        question: 'What does the greenhouse effect cause?',
        options: [
          'More rainfall',
          'Melting ice caps, rising sea levels, and extreme weather',
          'Colder winters',
          'Less carbon dioxide'
        ],
        correct: 'Melting ice caps, rising sea levels, and extreme weather',
        explanation: '???????????????melting ice caps, rising sea levels, and more extreme weather conditions.'
      },
      {
        id: 'q3',
        question: 'What can individuals do to help?',
        options: [
          'Wait for governments to solve the problem',
          'Use less energy, recycle, and make environmentally friendly choices',
          'Drive more cars',
          'Use more fossil fuels'
        ],
        correct: 'Use less energy, recycle, and make environmentally friendly choices',
        explanation: '??????????"using less energy, recycling, and making environmentally friendly choices"??????'
      }
    ]
  },
  {
    id: 'passage-3',
    title: 'Artificial Intelligence',
    difficulty: 'hard',
    topic: '??',
    content: `Artificial Intelligence, commonly referred to as AI, has revolutionized the way we live and work. From voice assistants like Siri and Alexa to self-driving cars, AI technologies have become increasingly integrated into our daily lives.

However, the rapid advancement of AI also raises important ethical questions. Issues such as job displacement, privacy concerns, and the potential misuse of AI technology have sparked debates among experts and the general public alike.

While some argue that AI will ultimately benefit humanity by creating new job opportunities and improving efficiency, others worry about the long-term implications of developing machines that can think and learn like humans. The key lies in establishing proper regulations and ensuring that AI development serves the best interests of society.`,
    questions: [
      {
        id: 'q1',
        question: 'What does the passage suggest about AI?',
        options: [
          'AI is only used in scientific research',
          'AI has become integrated into daily life',
          'AI will replace all human jobs',
          'AI is a new technology with no real applications'
        ],
        correct: 'AI has become integrated into daily life',
        explanation: '????"AI technologies have become increasingly integrated into our daily lives"????Siri?Alexa????????'
      },
      {
        id: 'q2',
        question: 'What ethical questions does the development of AI raise?',
        options: [
          'Only technical questions',
          'Job displacement, privacy concerns, and potential misuse',
          'Only questions about costs',
          'Only questions about speed'
        ],
        correct: 'Job displacement, privacy concerns, and potential misuse',
        explanation: '??????????????job displacement, privacy concerns, and the potential misuse of AI technology.'
      },
      {
        id: 'q3',
        question: 'What does the passage suggest is the key to beneficial AI development?',
        options: [
          'Developing AI as fast as possible',
          'Establishing proper regulations and ensuring AI serves society',
          'Stopping all AI research',
          'Limiting AI to scientific research only'
        ],
        correct: 'Establishing proper regulations and ensuring AI serves society',
        explanation: '??????"The key lies in establishing proper regulations and ensuring that AI development serves the best interests of society."'
      }
    ]
  }
];

function ReadingContent() {
  const { settings } = useSettingsStore();
  const { updateStep, markVisited } = useEnglishProgress('english');

  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [translation, setTranslation] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentPassage = READING_PASSAGES[currentPassageIndex];
  const currentQuestion = currentPassage?.questions[currentQuestionIndex];

  useEffect(() => {
    markVisited('reading');
    updateStep('reading', 'in_progress');
  }, [markVisited, updateStep]);

  const generateTranslation = async () => {
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
          text: currentPassage.content,
          apiKey: settings.deepseekKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslation(data.translation || currentPassage.content);
      }
    } catch {
      toast('生成翻译失败', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    const correct = selectedAnswer === currentQuestion.correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    setScore(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong: prev.wrong + (correct ? 0 : 1),
    }));

    if (correct) {
      toast('?????', 'success');
    } else {
      toast('????', 'error');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentPassage.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
      setProgress(0);
    } else {
      updateStep('reading', 'in_progress');
      toast(`??????????${score.correct + (isCorrect ? 1 : 0)}/${currentPassage.questions.length}`, 'success');
    }
  };

  const handleNextPassage = () => {
    if (currentPassageIndex < READING_PASSAGES.length - 1) {
      setCurrentPassageIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswer('');
      setShowFeedback(false);
      setScore({ correct: 0, wrong: 0 });
    }
  };

  const handleShowTranslation = () => {
    setShowTranslation(true);
    if (!translation) {
      generateTranslation();
    }
  };

  const isPassageComplete = currentQuestionIndex >= currentPassage.questions.length;
  const isAllPassagesComplete = isPassageComplete && currentPassageIndex >= READING_PASSAGES.length - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        ????????
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            ??????
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ? {currentPassageIndex + 1} ? / ? {READING_PASSAGES.length} ?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={currentPassage.difficulty === 'easy' ? 'secondary' : currentPassage.difficulty === 'medium' ? 'default' : 'destructive'}>
            {currentPassage.difficulty === 'easy' ? '??' : currentPassage.difficulty === 'medium' ? '??' : '??'}
          </Badge>
          <Badge variant="outline">{currentPassage.topic}</Badge>
        </div>
      </div>

      <Progress value={(currentQuestionIndex / currentPassage.questions.length) * 100} className="h-2" />

      {isAllPassagesComplete ? (
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">??</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">
              ???????????
            </h2>
            <p className="text-green-600">
              ????????????????
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ???? */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {currentPassage.title}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleShowTranslation}>
                  <Eye className="h-4 w-4 mr-1" />
                  ????
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {currentPassage.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ?? */}
          {showTranslation && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  ????
                  {generating && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {translation || '??????...'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ?? */}
          {currentQuestion && !isPassageComplete && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-base">
                  ? {currentQuestionIndex + 1} ? / {currentPassage.questions.length}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{currentQuestion.question}</p>
                <div className="grid gap-2">
                  {currentQuestion.options.map((option, idx) => (
                    <Button
                      key={idx}
                      variant={selectedAnswer === option ? 'default' : 'outline'}
                      className={`justify-start ${
                        showFeedback && option === currentQuestion.correct
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

                {!showFeedback ? (
                  <Button
                    onClick={handleCheckAnswer}
                    disabled={!selectedAnswer}
                    className="w-full"
                  >
                    ????
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
                        {isCorrect ? '?????' : '????'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{currentQuestion.explanation}</p>
                  </div>
                )}

                {showFeedback && currentQuestionIndex < currentPassage.questions.length - 1 && (
                  <Button onClick={handleNextQuestion} className="w-full">
                    ???
                  </Button>
                )}

                {showFeedback && currentQuestionIndex === currentPassage.questions.length - 1 && (
                  <Button onClick={handleNextPassage} className="w-full">
                    {currentPassageIndex < READING_PASSAGES.length - 1 ? '???' : '??'}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function EnglishReadingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ReadingContent />
    </Suspense>
  );
}
