'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowRight, Lightbulb, Sparkles, ChevronRight, ChevronLeft,
  BookOpen, Brain, MessageCircle, Send, CheckCircle2, XCircle,
  Loader2, Star, Trophy, BookText
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  content: string;
  keyPoints: string[];
  thinkQuestions: string[];
  knowledgeLinks: string[];
  importantQuote?: string;
}

interface SocialForm {
  id: string;
  name: string;
  productivity: string;
  productionRelation: {
    ownership: string;
    distribution: string;
  };
  laborRelation: string;
  superstructure: {
    politics: string;
    culture: string;
  };
  mainContradiction: string;
  basicContradiction: string;
  evaluation: string;
  detail?: string;
}

interface PracticeQuestion {
  id: string;
  type: 'choice' | 'material' | 'blank';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  relatedSection: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type LearnStep = 'read' | 'think' | 'reveal' | 'practice' | 'complete';

export default function GuidedLearning() {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<LearnStep>('read');
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState<Record<string, number | string>>({});
  const [practiceRevealed, setPracticeRevealed] = useState<Set<string>>(new Set());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('learn');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentSection = sections[currentIndex];
  const overallProgress = sections.length > 0
    ? Math.round((completedSections.size / sections.length) * 100)
    : 0;

  // 加载章节列表
  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/politics/guided-learning?action=sections');
        const json = await res.json();
        if (json.success && json.data?.sections) {
          // 加载完整章节内容
          const fullSections: Section[] = [];
          for (const s of json.data.sections) {
            const detailRes = await fetch(`/api/politics/guided-learning?action=section&sectionId=${s.id}`);
            const detailJson = await detailRes.json();
            if (detailJson.success && detailJson.data?.section) {
              fullSections.push(detailJson.data.section);
            } else {
              fullSections.push(s as Section);
            }
          }
          setSections(fullSections);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, []);

  // 滚动到聊天底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 切换章节
  const handleSectionChange = (newIndex: number) => {
    setCurrentIndex(newIndex);
    setStep('read');
    setPracticeAnswer({});
    setPracticeRevealed(new Set());
    setPracticeQuestions([]);
    setChatMessages([]);
  };

  // 完成章节（进入下一章）
  const handleComplete = () => {
    if (!currentSection) return;
    setCompletedSections(prev => new Set([...prev, currentSection.id]));

    if (currentIndex < sections.length - 1) {
      handleSectionChange(currentIndex + 1);
      setActiveTab('learn');
    } else {
      setStep('complete');
    }
  };

  // 生成练习题
  const handleGeneratePractice = async () => {
    if (!currentSection) return;
    setPracticeLoading(true);
    try {
      const res = await fetch('/api/politics/guided-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-practice',
          sectionId: currentSection.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setPracticeQuestions(json.questions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPracticeLoading(false);
    }
  };

  // 提交练习答案
  const handleRevealPracticeAnswer = (qId: string, correct: number | string) => {
    setPracticeRevealed(prev => new Set([...prev, qId]));
  };

  // AI 聊天
  const handleSendChat = async () => {
    if (!chatInput.trim() || !currentSection) return;
    const userMsg = { role: 'user' as const, content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/politics/guided-learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          sectionId: currentSection.id,
          message: chatInput.trim(),
          history: chatMessages,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: json.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: '抱歉，我暂时无法回答，请稍后再试。' }]);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '网络错误，请检查连接后重试。' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!currentSection) {
    return <div className="text-center py-8 text-slate-500">暂无学习内容</div>;
  }

  // 完成全课
  if (step === 'complete' && completedSections.size === sections.length) {
    return (
      <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">🎉 恭喜完成第一课！</h2>
          <p className="text-slate-600 mb-6">你已经完整学习了社会主义从空想到科学、从理论到实践的发展全章节内容。</p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-pink-500">{sections.length}</div>
              <div className="text-xs text-slate-500">学习章节</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-500">{completedSections.size}</div>
              <div className="text-xs text-slate-500">完成章节</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-2xl font-bold text-emerald-500">100%</div>
              <div className="text-xs text-slate-500">完成率</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => { setCompletedSections(new Set()); handleSectionChange(0); setStep('read'); }}>
              重新学习
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/learn/politics/practice/politics-compulsory-1'}>
              进入综合练习
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 进度条 */}
      <Card className="border-pink-100">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium">学习进度</span>
            </div>
            <span className="text-xs text-slate-500">{completedSections.size}/{sections.length} 已完成</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="text-xs bg-pink-50">
              第 {currentIndex + 1} / {sections.length} 章
            </Badge>
            <Badge className="bg-pink-500 text-white text-xs">
              {currentSection.type === 'social-form' ? '📜 社会形态' :
               currentSection.type === 'detail' ? '🔍 深度解析' :
               currentSection.type === 'science' ? '🧠 科学理论' :
               currentSection.type === 'manifesto' ? '📖 经典文献' :
               currentSection.type === 'summary' ? '📝 总结' : '📘 概述'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 章节导航 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sections.map((s, idx) => {
          const isActive = idx === currentIndex;
          const isDone = completedSections.has(s.id);
          return (
            <button
              key={s.id}
              onClick={() => handleSectionChange(idx)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs text-left transition-all ${
                isActive
                  ? 'border-pink-400 bg-pink-50 text-pink-700 shadow-sm'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-pink-200'
              }`}
            >
              <div className="flex items-center gap-1">
                {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />}
                <span className="font-medium">{idx + 1}. {s.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 章节标题 */}
      <Card className="border-pink-100">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-pink-700">{currentSection.title}</CardTitle>
            {isAlreadyCompleted(currentSection.id) && (
              <Badge className="bg-emerald-100 text-emerald-700">已学习 ✓</Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">{currentSection.subtitle}</p>
        </CardHeader>
      </Card>

      {/* 主内容区 - 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="learn" className="gap-1 text-xs">
            <BookOpen className="h-3 w-3" /> 学习
          </TabsTrigger>
          <TabsTrigger value="think" className="gap-1 text-xs">
            <Brain className="h-3 w-3" /> 思考
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1 text-xs">
            <MessageCircle className="h-3 w-3" /> 问答
          </TabsTrigger>
          <TabsTrigger value="practice" className="gap-1 text-xs">
            <Star className="h-3 w-3" /> 练习
          </TabsTrigger>
        </TabsList>

        {/* 学习页 - 阅读原文 */}
        <TabsContent value="learn">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* 核心内容 */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                  <BookText className="h-4 w-4" /> 核心内容
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {currentSection.content}
                </p>
              </div>

              {/* 重要引文 */}
              {currentSection.importantQuote && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-pink-700 mb-2">💡 重要论断</h3>
                  <p className="text-sm italic text-pink-800">"{currentSection.importantQuote}"</p>
                </div>
              )}

              {/* 关键要点 */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">📌 关键要点</h3>
                <div className="space-y-2">
                  {currentSection.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-xs flex items-center justify-center font-medium">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 关联知识点 */}
              {currentSection.knowledgeLinks && currentSection.knowledgeLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-slate-500">关联概念：</span>
                  {currentSection.knowledgeLinks.map(link => (
                    <Badge key={link} variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                      {link}
                    </Badge>
                  ))}
                </div>
              )}

              {/* 行动按钮 */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setActiveTab('think')}
                >
                  <Brain className="h-4 w-4" /> 开始思考
                </Button>
                <Button
                  size="sm"
                  className="gap-1 bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={handleComplete}
                >
                  {completedSections.has(currentSection.id) ? '继续下一章' : '我学会了'} <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 思考页 - 引导问答 */}
        <TabsContent value="think">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <h3 className="text-sm font-semibold">引导思考</h3>
              </div>

              <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                请先思考以下问题，写下你的答案或想法，然后查看参考答案进行对比。
              </p>

              {currentSection.thinkQuestions.map((q, qIdx) => (
                <div key={qIdx} className="border border-purple-100 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs flex items-center justify-center font-medium">
                      Q{qIdx + 1}
                    </span>
                    <p className="text-sm font-medium text-slate-800">{q}</p>
                  </div>

                  <ThinkAnswer
                    question={q}
                    sectionId={currentSection.id}
                    onReveal={() => {}}
                  />
                </div>
              ))}

              <div className="flex justify-center pt-2">
                <Button
                  size="sm"
                  className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleComplete}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  思考完成，进入练习
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 问答页 - AI 导师 */}
        <TabsContent value="chat">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold">AI 导师问答</h3>
                <Badge variant="outline" className="text-xs ml-auto bg-blue-50">
                  基于当前章节
                </Badge>
              </div>

              {/* 聊天历史 */}
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {chatMessages.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>你可以问我关于"{currentSection.title}"的任何问题</p>
                    <p className="mt-1">比如："这个知识点高考怎么考？"、"能举个生活例子吗？"</p>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-pink-500 text-white'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-lg px-3 py-2 text-sm text-slate-500 flex items-center gap-1">
                      <Loader2 className="h-4 w-4 animate-spin" /> 思考中...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* 输入框 */}
              <div className="flex gap-2">
                <Textarea
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={`问关于"${currentSection.title}"的问题...`}
                  className="min-h-[60px] text-sm resize-none"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white h-auto"
                  onClick={handleSendChat}
                  disabled={chatLoading || !chatInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 练习页 */}
        <TabsContent value="practice">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-sm font-semibold">章节练习</h3>
                </div>
                {practiceQuestions.length === 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={handleGeneratePractice}
                    disabled={practiceLoading}
                  >
                    {practiceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    生成练习
                  </Button>
                )}
              </div>

              {practiceLoading && (
                <div className="flex items-center justify-center py-8 gap-2 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" /> 正在生成练习题...
                </div>
              )}

              {!practiceLoading && practiceQuestions.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-500">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>点击上方按钮生成章节练习题</p>
                </div>
              )}

              {practiceQuestions.map((q, qIdx) => {
                const isRevealed = practiceRevealed.has(q.id);
                const userAnswer = practiceAnswer[q.id];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <div key={q.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 text-xs flex items-center justify-center font-medium">
                        {qIdx + 1}
                      </span>
                      <p className="text-sm font-medium text-slate-800">{q.question}</p>
                    </div>

                    {q.type === 'choice' && q.options && (
                      <RadioGroup
                        value={String(userAnswer ?? '')}
                        onValueChange={val => setPracticeAnswer(prev => ({ ...prev, [q.id]: parseInt(val) }))}
                        className="space-y-2 ml-8"
                      >
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <RadioGroupItem value={String(oIdx)} id={`${q.id}-opt-${oIdx}`} />
                            <Label htmlFor={`${q.id}-opt-${oIdx}`} className="text-sm flex-1 cursor-pointer">
                              {String.fromCharCode(65 + oIdx).replace('A', 'A. ').replace('B', 'B. ').replace('C', 'C. ').replace('D', 'D. ')}{opt}
                              {isRevealed && oIdx === Number(q.correctAnswer) && (
                                <CheckCircle2 className="inline h-4 w-4 ml-2 text-emerald-500" />
                              )}
                              {isRevealed && userAnswer === oIdx && oIdx !== Number(q.correctAnswer) && (
                                <XCircle className="inline h-4 w-4 ml-2 text-red-500" />
                              )}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {!isRevealed && userAnswer !== undefined && (
                      <div className="ml-8">
                        <Button
                          size="sm"
                          className="gap-1 bg-pink-500 hover:bg-pink-600 text-white"
                          onClick={() => handleRevealPracticeAnswer(q.id, q.correctAnswer)}
                        >
                          <Lightbulb className="h-4 w-4" /> 查看解析
                        </Button>
                      </div>
                    )}

                    {isRevealed && (
                      <div className={`ml-8 rounded-lg p-3 ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                        <p className="text-xs font-medium mb-1">
                          {isCorrect ? (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" /> 回答正确！
                            </span>
                          ) : (
                            <span className="text-red-700 flex items-center gap-1">
                              <XCircle className="h-4 w-4" /> 回答错误，正确答案是 {String.fromCharCode(65 + Number(q.correctAnswer))}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {practiceQuestions.length > 0 && practiceQuestions.every(q => practiceRevealed.has(q.id)) && (
                <div className="text-center pt-2">
                  <p className="text-sm text-emerald-600 font-medium mb-2">🎉 本章练习完成！</p>
                  <Button
                    size="sm"
                    className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={handleComplete}
                  >
                    继续下一章 <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 底部导航 */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => handleSectionChange(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" /> 上一章
        </Button>
        <Button
          size="sm"
          className="gap-1 bg-pink-500 hover:bg-pink-600 text-white"
          onClick={() => handleSectionChange(Math.min(sections.length - 1, currentIndex + 1))}
          disabled={currentIndex === sections.length - 1}
        >
          下一章 <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// 思考题回答组件
function ThinkAnswer({ question, sectionId, onReveal }: {
  question: string;
  sectionId: string;
  onReveal: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const defaultAnswers: Record<string, Record<string, string>> = {
    'overview': {
      '为什么说第一课是本册教材的逻辑起点？':
        '因为第一课系统回顾了从原始社会到资本主义社会的演进历程，阐释了生产关系一定要适应生产力、上层建筑一定要适应经济基础这两大人类社会发展的基本规律。这些规律是理解整个人类社会发展逻辑的基础，也是理解中国特色社会主义由来、创立、发展、完善的理论前提。',
      '人类社会发展的基本规律指的是什么？':
        '人类社会发展的基本规律包括两个：①生产关系一定要适应生产力的规律；②上层建筑一定要适应经济基础的规律。这两个规律决定了人类社会形态从低级向高级演进。',
    },
    '资本主义社会': {
      '为什么经济危机是资本主义无法克服的痼疾？':
        '因为经济危机的根本原因是资本主义基本矛盾——生产社会化与生产资料私人占有之间的矛盾。这个矛盾在资本主义制度内无法消除，只能通过危机暂时强制性地缓解，因此经济危机会周期性爆发，成为资本主义无法克服的痼疾。',
      '资本主义基本矛盾在哪些方面表现出来？':
        '资本主义基本矛盾表现在两个方面：①生产无限扩大的趋势与劳动人民有支付能力的需求相对缩小之间的矛盾；②个别企业内部生产的有组织性与整个社会生产的无政府状态之间的矛盾。',
    },
    '空想社会主义': {
      '空想社会主义的三个局限性分别是什么？':
        '①只有理想没有行动——仅从理性正义原则出发，设计了美好蓝图但缺乏实现路径；②看不到无产阶级力量——主张阶级调和，反对阶级斗争，找错了依靠力量；③没有正确途径——没有找到通过什么方式实现社会变革。这三个局限性注定了空想社会主义只能是空想。',
      '为什么圣西门、傅立叶、欧文的努力最终失败了？':
        '因为他们的努力脱离了两大关键条件：一是脱离工人运动，他们的方案没有得到广大无产阶级的响应；二是缺乏科学理论指导，他们没有认识到社会发展的客观规律，因此无法找到正确的革命道路。',
    },
    '科学社会主义诞生': {
      '为什么唯物史观和剩余价值学说是科学社会主义的理论基石？':
        '唯物史观揭示了人类社会发展的一般规律（生产力与生产关系的矛盾运动），使社会主义从空想变为科学有了理论依据；剩余价值学说揭示了资本主义运行的特殊规律（资本家剥削工人的秘密），使无产阶级革命有了科学论证。两者共同回答了"为什么社会主义必然代替资本主义"这一根本问题。',
      '空想社会主义缺少什么，使它只能是"空想"？':
        '空想社会主义缺少两大关键：一是缺少科学的理论基础——没有认识到人类社会发展的客观规律；二是缺少现实的阶级基础——看不到无产阶级的历史使命，找不到实现理想社会的正确途径。这两点正是科学社会主义所克服的。',
    },
  };

  const getDefaultAnswer = () => {
    const sectionAnswers = defaultAnswers[sectionId];
    if (sectionAnswers && sectionAnswers[question as keyof typeof sectionAnswers]) {
      return sectionAnswers[question as keyof typeof sectionAnswers];
    }
    return '请结合章节内容，从关键词出发组织你的答案。提示：从原因、表现、意义等角度思考。';
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="写下你的思考答案..."
        className="min-h-[80px] text-sm"
      />
      <Button
        size="sm"
        variant="outline"
        className="gap-1"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <Lightbulb className="h-4 w-4" />
        {showAnswer ? '收起参考答案' : '查看参考答案'}
      </Button>
      {showAnswer && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-medium text-amber-800 mb-1">参考答案：</p>
          <p className="text-sm text-amber-900">{getDefaultAnswer()}</p>
        </div>
      )}
    </div>
  );
}

// 检查是否已完成
function isAlreadyCompleted(sectionId: string): boolean {
  return false; // 简化版，实际可从 localStorage 读取
}
