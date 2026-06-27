'use client';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Lightbulb, BookOpen, Volume2 } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from '@/components/ui/toast';
import { useEnglishProgress } from '@/hooks/useEnglishProgress';

interface GrammarPoint {
  id: string;
  category: string;
  title: string;
  description: string;
  examples: string[];
  rules: string[];
  question?: {
    text: string;
    options: string[];
    correct: string;
    explanation: string;
  };
}

const GRAMMAR_POINTS: GrammarPoint[] = [
  {
    id: 'present-simple',
    category: '时态',
    title: '一般现在时',
    description: '表示经常性、习惯性的动作或现在的状态。',
    rules: [
      '肯定句：主语 + 动词原形（第三人称单数加 -s/-es）',
      '否定句：don\'t/doesn\'t + 动词原形',
      '疑问句：Do/Does + 主语 + 动词原形？',
    ],
    examples: [
      'I play basketball every weekend.',
      'She works in a hospital.',
      'Does he like coffee?',
    ],
    question: {
      text: '选择正确的句子：',
      options: [
        'She go to school by bus.',
        'She goes to school by bus.',
        'She going to school by bus.',
        'She is go to school by bus.',
      ],
      correct: 'She goes to school by bus.',
      explanation: '主语 She 是第三人称单数，一般现在时动词要加 -s，所以用 goes。',
    },
  },
  {
    id: 'present-perfect',
    category: '时态',
    title: '现在完成时',
    description: '表示过去发生的动作对现在造成的影响或结果。',
    rules: [
      '结构：have/has + 过去分词',
      'already, yet, just, ever, never 等是标志词',
      'have been to / have gone to 区别：前者去过已回，后者去了未回',
    ],
    examples: [
      'I have finished my homework.',
      'She has been to Paris twice.',
      'Have you ever seen a UFO?',
    ],
    question: {
      text: '选择正确的句子：',
      options: [
        'I have went to Beijing.',
        'I have gone to Beijing.',
        'I have been to Beijing.',
        'I have go to Beijing.',
      ],
      correct: 'I have been to Beijing.',
      explanation: 'have been to 表示去过已回，have gone to 表示去了未回。完成时要用过去分词 been。',
    },
  },
  {
    id: 'non-finite-1',
    category: '非谓语',
    title: '不定式 (to do)',
    description: '不定式可以作主语、宾语、表语、定语、状语、宾补。',
    rules: [
      '主语：To learn English well is important. / It\'s important to learn English well.',
      '宾语：want/wish/decide/plan/agree + to do',
      '定语：I have a lot of homework to do.',
      '目的状语：He got up early to catch the bus.',
    ],
    examples: [
      'To see is to believe.',
      'I decided to study abroad.',
      'There is nothing to worry about.',
    ],
    question: {
      text: '选择正确的句子：',
      options: [
        'I have nothing to do.',
        'I have nothing do.',
        'I have nothing doing.',
        'I have nothing done.',
      ],
      correct: 'I have nothing to do.',
      explanation: 'nothing to do 中，to do 是不定式作定语，修饰 nothing，表示"没什么要做的事情"。',
    },
  },
  {
    id: 'non-finite-2',
    category: '非谓语',
    title: '动名词 (doing)',
    description: '动名词由动词原形 +ing 构成，可作主语、宾语、表语、定语。',
    rules: [
      '主语：Swimming is good exercise.',
      '宾语：enjoy/finish/practice/suggest/mind + doing',
      '表语：My hobby is collecting stamps.',
      '介词后用 doing：be interested in / be good at / look forward to',
    ],
    examples: [
      'I enjoy reading books.',
      'He is good at playing basketball.',
      'My favorite sport is swimming.',
    ],
    question: {
      text: '选择正确的句子：',
      options: [
        'I enjoy to swim.',
        'I enjoy swimming.',
        'I enjoy swim.',
        'I enjoy swum.',
      ],
      correct: 'I enjoy swimming.',
      explanation: 'enjoy 后面接动名词 (doing)，不是不定式。类似的动词还有 finish, practice, suggest, mind 等。',
    },
  },
  {
    id: 'relative-clause',
    category: '从句',
    title: '定语从句',
    description: '定语从句修饰名词或代词，可限制性或非限制性。',
    rules: [
      '主语关系词：who(人), whom(人宾格), which(物), that(人/物)',
      '状语关系词：when(时间), where(地点), why(原因)',
      '只用 that 的情况：最高级、序数词、only、all 等修饰时',
      '介词提前只用 which/whom，不能用 that',
    ],
    examples: [
      'The man who is talking is my father.',
      'The book, which I bought yesterday, is interesting.',
      'This is the best movie that I have ever seen.',
    ],
    question: {
      text: '选择正确的句子：',
      options: [
        'This is the book which I bought it yesterday.',
        'This is the book that I bought yesterday.',
        'This is the book who I bought yesterday.',
        'This is the book when I bought yesterday.',
      ],
      correct: 'This is the book that I bought yesterday.',
      explanation: '修饰 the book 用关系词 that/which，且定语从句中不能重复加 it。',
    },
  },
  {
    id: 'noun-clause',
    category: '从句',
    title: '名词性从句',
    description: '名词性从句在句中作主语、宾语、表语、同位语。',
    rules: [
      '主语从句：I think (that) he is right.',
      '连接词：that(无意义), if/whether(是否), wh-(什么/谁/何时等)',
      '时态还原规则：主句过去时，从句时态要调整',
    ],
    examples: [
      'I don\'t know where he lives.',
      'The question is whether we can finish it.',
      'It is unclear who will win.',
    ],
    question: {
      text: '选择正确的句子：',
      options: [
        'I don\'t know where does he live.',
        'I don\'t know where he lives.',
        'I don\'t know where is he living.',
        'I don\'t know where he live.',
      ],
      correct: 'I don\'t know where he lives.',
      explanation: '宾语从句要用陈述语序（主语在前），不能用疑问语序。',
    },
  },
  {
    id: 'passive-voice',
    category: '语态',
    title: '被动语态',
    description: '当主语是动作的承受者时，用被动语态 be + 过去分词。',
    rules: [
      '主动句：A does B → 被动句：B is done (by A)',
      '不同时态：一般现在时 is/are done，过去时 was/were done',
      '现在完成时：has/have been done',
      'by 短语可省略，如果不必指出动作执行者',
    ],
    examples: [
      'English is spoken all over the world.',
      'The window was broken by the boy.',
      'The letter has been mailed.',
    ],
    question: {
      text: '选择正确的句子：',
      options: [
        'The homework is finished by me.',
        'The homework is finish by me.',
        'The homework was finish by me.',
        'The homework is finishing by me.',
      ],
      correct: 'The homework is finished by me.',
      explanation: '被动语态结构：be + 过去分词。finish 的过去分词是 finished。',
    },
  },
  {
    id: 'inversion',
    category: '特殊句式',
    title: '倒装句',
    description: '倒装句将谓语的一部分或全部放到主语之前。',
    rules: [
      '完全倒装：地点/时间状语在句首 + 谓语 + 主语 (Here comes the bus.)',
      '部分倒装：否定词在句首 + 助动词/情态动词 + 主语 + 动词原形 (Never have I seen...)',
      'Only + 状语在句首用部分倒装 (Only then did I realize...)',
      'so/neither/nor 用于倒装表示"也/也不"',
    ],
    examples: [
      'Here comes the bus.',
      'Never have I seen such a beautiful view.',
      'Only by working hard can you succeed.',
    ],
    question: {
      text: '选择正确的句子：',
      options: [
        'Never I have seen such a thing.',
        'Never have I seen such a thing.',
        'Never I seen such a thing.',
        'Never have I saw such a thing.',
      ],
      correct: 'Never have I seen such a thing.',
      explanation: '否定词 Never 在句首时用部分倒装，助动词 have 放到主语 I 之前。seen 是 see 的过去分词。',
    },
  },
  {
    id: 'subjunctive',
    category: '虚拟语气',
    title: '虚拟语气（if从句）',
    description: '表示与事实相反的假设。',
    rules: [
      '与现在相反：If + 过去式, would/could/might + do',
      '与过去相反：If + had done, would/could/might + have done',
      '与将来相反：If + did/were to do/should do, would/could/might + do',
      '省略 if 倒装：Had I known..., Were I you...',
    ],
    examples: [
      'If I were you, I would take the job.',
      'If he had studied harder, he would have passed.',
      'If it should rain, we would stay at home.',
    ],
    question: {
      text: '选择正确的句子（表示与现在事实相反）：',
      options: [
        'If I am you, I will take the job.',
        'If I was you, I would take the job.',
        'If I were you, I would take the job.',
        'If I were you, I will take the job.',
      ],
      correct: 'If I were you, I would take the job.',
      explanation: '虚拟语气与现在事实相反时，从句用过去式（be 动词用 were），主句用 would + 动词原形。',
    },
  },
];

function GrammarLearningContent() {
  const { settings } = useSettingsStore();
  const { updateStep, markVisited } = useEnglishProgress('english');

  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [completedPoints, setCompletedPoints] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [userResponse, setUserResponse] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');

  const currentPoint = GRAMMAR_POINTS[currentPointIndex];
  const progress = ((currentPointIndex + 1) / GRAMMAR_POINTS.length) * 100;

  useEffect(() => {
    markVisited('grammar');
    updateStep('grammar', 'in_progress');
  }, [markVisited, updateStep]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCheckAnswer = () => {
    if (!currentPoint.question) return;
    const correct = selectedAnswer === currentPoint.question.correct;
    setIsCorrect(correct);
    setShowFeedback(true);
    if (correct) {
      toast('回答正确！', 'success');
    } else {
      toast('回答错误，再想想！', 'error');
    }
  };

  const handleNext = () => {
    if (currentPointIndex < GRAMMAR_POINTS.length - 1) {
      setCurrentPointIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
      setShowExplanation(false);
      setUserResponse('');
    }
  };

  const handlePrevious = () => {
    if (currentPointIndex > 0) {
      setCurrentPointIndex(prev => prev - 1);
      setSelectedAnswer('');
      setShowFeedback(false);
      setShowExplanation(false);
      setUserResponse('');
    }
  };

  const handleMarkCompleted = () => {
    if (!completedPoints.includes(currentPoint.id)) {
      setCompletedPoints(prev => [...prev, currentPoint.id]);
    }
    updateStep('grammar', 'completed');
    toast('语法点已掌握！', 'success');
  };

  const handleUserResponseSubmit = () => {
    if (!userResponse.trim()) return;
    setShowExplanation(true);

    const hasKeywords = currentPoint.rules.some(rule =>
      userResponse.toLowerCase().includes(rule.split('：')[0].toLowerCase()) ||
      userResponse.toLowerCase().includes(rule.split(':')[0].toLowerCase())
    );

    if (hasKeywords || userResponse.length > 10) {
      setExplanation('非常好！你已经理解了这些语法点的重要概念。');
      setShowExplanation(true);
      toast('回答得很好！', 'success');
    } else {
      setExplanation('请更详细地描述这些语法点，确保理解透彻。');
      setShowExplanation(true);
    }
  };

  const allCompleted = completedPoints.length === GRAMMAR_POINTS.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        返回英语学习
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            语法系统学习
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            第 {currentPointIndex + 1} 个语法点 / 共 {GRAMMAR_POINTS.length} 个
          </p>
        </div>
        <Badge variant="outline">
          已掌握 {completedPoints.length}/{GRAMMAR_POINTS.length}
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      {allCompleted ? (
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-green-800 mb-2">
              恭喜语法系统学习完成！
            </h2>
            <p className="text-green-600">
              你已经掌握了所有核心语法点，继续练习吧！
            </p>
            <Button
              onClick={() => updateStep('grammar', 'completed')}
              className="mt-4"
            >
              完成语法学习
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary">{currentPoint.category}</Badge>
                  {currentPoint.title}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => speak(currentPoint.title)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                {currentPoint.description}
              </p>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  规则总结
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  {currentPoint.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  例句
                </h4>
                <div className="space-y-2">
                  {currentPoint.examples.map((example, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm">
                      <p className="text-slate-700 dark:text-slate-200">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentPointIndex === 0}
            >
              上一条
            </Button>
            <Button
              variant="default"
              onClick={handleMarkCompleted}
              disabled={completedPoints.includes(currentPoint.id)}
              className="gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              已掌握
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentPointIndex === GRAMMAR_POINTS.length - 1}
            >
              下一条
            </Button>
          </div>

          {currentPoint.question && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-base">练习一下</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{currentPoint.question.text}</p>
                <div className="grid gap-2">
                  {currentPoint.question.options.map((option, idx) => (
                    <Button
                      key={idx}
                      variant={selectedAnswer === option ? 'default' : 'outline'}
                      className={`justify-start ${
                        showFeedback && option === currentPoint.question!.correct
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
                    <p className="text-sm text-slate-600">{currentPoint.question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">写下你的理解</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                请用自己的话解释这些语法点，帮助你更好地理解和记忆。
              </p>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="例如：一般现在时主要用来描述..."
                className="w-full h-24 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
                disabled={showExplanation}
              />
              {!showExplanation ? (
                <Button
                  onClick={handleUserResponseSubmit}
                  disabled={!userResponse.trim()}
                  className="w-full"
                >
                  提交答案
                </Button>
              ) : (
                <div className="p-4 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-800">{explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function EnglishGrammarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <GrammarLearningContent />
    </Suspense>
  );
}
