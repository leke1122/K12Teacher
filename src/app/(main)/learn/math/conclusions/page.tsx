'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mathSecondLevelConclusions, groupedConclusions, SecondLevelConclusion } from '@/data/math/secondLevelConclusions';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  ArrowLeft, Search, Sparkles, BookOpen, Target, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Loader2, Upload, Pen, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function MathConclusionsPage() {
  const { settings } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConclusion, setSelectedConclusion] = useState<SecondLevelConclusion | null>(null);
  const [expandedConclusion, setExpandedConclusion] = useState<string | null>(null);
  const [aiQuestions, setAiQuestions] = useState<{
    question: string;
    options?: string[];
    answer: string;
    explanation: string;
  }[]>([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  // 练习状态
  const [practiceMode, setPracticeMode] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });

  // 手写板状态
  const [showDrawing, setShowDrawing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [checkingWork, setCheckingWork] = useState(false);
  const [workFeedback, setWorkFeedback] = useState<{
    correct: boolean;
    feedback: string;
    suggestions: string[];
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 筛选结论
  const filteredConclusions = searchQuery
    ? mathSecondLevelConclusions.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.conclusion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.typicalApplications.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : mathSecondLevelConclusions;

  // 按章节分组
  const groupedFiltered = {
    ch1: filteredConclusions.filter(c => c.chapter === 'ch1'),
    ch2: filteredConclusions.filter(c => c.chapter === 'ch2'),
    ch3: filteredConclusions.filter(c => c.chapter === 'ch3'),
  };

  // AI生成试题
  const generateQuestions = async (conclusion: SecondLevelConclusion) => {
    console.log('[MathConclusions] 生成试题被调用', conclusion.title);
    console.log('[MathConclusions] settings.deepseekKey:', settings?.deepseekKey ? '已设置' : '未设置');

    if (!settings?.deepseekKey) {
      toast.error('请先在设置中配置 DeepSeek API Key');
      return;
    }

    setSelectedConclusion(conclusion);
    setGeneratingQuestions(true);
    setAiQuestions([]);
    setPracticeMode(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);

    try {
      console.log('[MathConclusions] 发送请求到API...');
      const response = await fetch('/api/math/generate-conclusion-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conclusion,
          apiKey: settings.deepseekKey,
        }),
      });
      console.log('[MathConclusions] 收到响应，状态:', response.status);
      const data = await response.json();
      console.log('[MathConclusions] 响应数据:', data);

      if (data.success && data.questions) {
        setAiQuestions(data.questions);
        setPracticeScore({ correct: 0, total: data.questions.length });
        setActiveTab('practice');
        toast.success('生成成功！开始答题吧');
      } else {
        toast.error(data.error || '生成失败');
      }
    } catch (e) {
      console.error('[MathConclusions] 请求失败:', e);
      toast.error('请求失败，请检查网络');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  // 处理答题
  const handleAnswer = (answer: string) => {
    if (showAnswer) return;
    setSelectedAnswer(answer);
    setShowAnswer(true);
    if (answer === aiQuestions[currentQuestionIndex].answer) {
      setPracticeScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
  };

  // 下一题
  const nextQuestion = () => {
    if (currentQuestionIndex < aiQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  // 初始化画布
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // 开始绘制
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  // 绘制中
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  // 结束绘制
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // 清空画布
  const clearCanvas = () => {
    initCanvas();
  };

  // 上传图片
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 提交答题内容让Qwen-vl检查
  const submitForChecking = async () => {
    if (!settings?.deepseekKey) {
      toast.error('请先在设置中配置 DeepSeek API Key');
      return;
    }

    setCheckingWork(true);
    setWorkFeedback(null);

    try {
      // 获取图片内容
      let imageContent = '';
      if (uploadedImage) {
        imageContent = uploadedImage;
      } else if (canvasRef.current) {
        imageContent = canvasRef.current.toDataURL('image/png');
      }

      if (!imageContent) {
        toast.error('请先手写或上传答题内容');
        return;
      }

      const response = await fetch('/api/math/check-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageContent,
          question: aiQuestions[currentQuestionIndex]?.question || '',
          correctAnswer: aiQuestions[currentQuestionIndex]?.answer || '',
          apiKey: settings.deepseekKey,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setWorkFeedback(data.feedback);
      } else {
        toast.error(data.error || '检查失败');
      }
    } catch (e) {
      toast.error('请求失败，请检查网络');
    } finally {
      setCheckingWork(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
      {/* 顶部导航 */}
      <header className="z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/subjects/math">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
            </Link>
            <Badge variant="outline" className="ml-auto text-xs">{mathSecondLevelConclusions.length}条结论</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="list" className="gap-1">
              <BookOpen className="h-4 w-4" />
              结论列表
            </TabsTrigger>
            <TabsTrigger value="practice" className="gap-1" disabled={!practiceMode || aiQuestions.length === 0}>
              <Target className="h-4 w-4" />
              答题练习
            </TabsTrigger>
          </TabsList>

          {/* 结论列表 */}
          <TabsContent value="list">
            {/* 搜索 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="搜索结论名称或内容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 章节分组 */}
            <div className="space-y-6">
              {Object.entries(groupedFiltered).map(([key, conclusions]) => (
                conclusions.length > 0 && (
                  <div key={key}>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <Badge variant="outline">{conclusions.length}条</Badge>
                      {groupedConclusions[key as keyof typeof groupedConclusions].name}
                    </h2>
                    <div className="space-y-3">
                      {conclusions.map((conclusion) => (
                        <Card
                          key={conclusion.id}
                          className={cn(
                            'cursor-pointer transition-all',
                            expandedConclusion === conclusion.id && 'ring-2 ring-blue-400',
                            selectedConclusion?.id === conclusion.id && 'bg-blue-50 dark:bg-blue-950/20'
                          )}
                        >
                          <CardHeader className="pb-2" onClick={() => setExpandedConclusion(expandedConclusion === conclusion.id ? null : conclusion.id)}>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">{conclusion.id}</Badge>
                                <span>{conclusion.title.replace(/^\d+\.\d+\s*/, '')}</span>
                              </CardTitle>
                              <Button variant="ghost" size="sm">
                                {expandedConclusion === conclusion.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </div>
                          </CardHeader>

                          {expandedConclusion === conclusion.id && (
                            <CardContent className="space-y-4" onClick={(e) => e.stopPropagation()}>
                              {/* 结论 */}
                              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                                <h4 className="text-xs font-medium text-slate-500 mb-1">📌 结论</h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                                  {conclusion.conclusion}
                                </p>
                              </div>

                              {/* 推导 */}
                              <div>
                                <h4 className="text-xs font-medium text-slate-500 mb-1">🔍 推导与解释</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {conclusion.derivation}
                                </p>
                              </div>

                              {/* 适用条件 */}
                              <div>
                                <h4 className="text-xs font-medium text-slate-500 mb-1">✅ 适用条件</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {conclusion.applicableConditions}
                                </p>
                              </div>

                              {/* 典型应用 */}
                              <div>
                                <h4 className="text-xs font-medium text-slate-500 mb-1">📖 典型应用</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {conclusion.typicalApplications}
                                </p>
                              </div>

                              {/* 易错提醒 */}
                              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
                                <h4 className="text-xs font-medium text-amber-600 mb-1">⚠️ 易错提醒</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                  {conclusion.commonMistakes}
                                </p>
                              </div>

                              {/* 操作按钮 */}
                              <div className="flex gap-2 pt-2">
                                <Button
                                  onClick={() => generateQuestions(conclusion)}
                                  disabled={generatingQuestions}
                                  className="flex-1 gap-1"
                                >
                                  {generatingQuestions && selectedConclusion?.id === conclusion.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Sparkles className="h-4 w-4" />
                                  )}
                                  AI生成试题
                                </Button>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </TabsContent>

          {/* 答题练习 */}
          <TabsContent value="practice">
            {practiceMode && aiQuestions.length > 0 && (
              <div className="space-y-6">
                {/* 进度条 */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">答题进度</span>
                      <span className="text-sm text-slate-500">
                        {currentQuestionIndex + 1} / {aiQuestions.length}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                        style={{ width: `${((currentQuestionIndex + 1) / aiQuestions.length) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                      <span>正确率：{Math.round((practiceScore.correct / Math.max(1, currentQuestionIndex + (showAnswer ? 1 : 0))) * 100)}%</span>
                      <span>已答 {currentQuestionIndex + (showAnswer ? 1 : 0)} 题，答对 {practiceScore.correct} 题</span>
                    </div>
                  </CardContent>
                </Card>

                {/* 当前题目 */}
                <Card className="overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                  <CardContent className="p-6 space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                        {aiQuestions[currentQuestionIndex].question}
                      </p>
                    </div>

                    {/* 选项 */}
                    {aiQuestions[currentQuestionIndex].options && aiQuestions[currentQuestionIndex].options!.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {aiQuestions[currentQuestionIndex].options!.map((option, idx) => {
                          const isSelected = selectedAnswer === option;
                          const isCorrect = option === aiQuestions[currentQuestionIndex].answer;
                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswer(option)}
                              disabled={showAnswer}
                              className={cn(
                                'w-full p-4 rounded-xl border-2 text-left transition-all',
                                !showAnswer && 'hover:border-blue-400 hover:bg-blue-50/50',
                                showAnswer && isCorrect && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
                                showAnswer && isSelected && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-950/30',
                                showAnswer && !isSelected && !isCorrect && 'border-slate-200 dark:border-slate-700 opacity-60',
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                                  showAnswer && isCorrect && 'bg-emerald-500 text-white',
                                  showAnswer && isSelected && !isCorrect && 'bg-red-500 text-white',
                                  !showAnswer && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
                                )}>
                                  {showAnswer && isCorrect && <CheckCircle className="h-5 w-5" />}
                                  {showAnswer && isSelected && !isCorrect && <XCircle className="h-5 w-5" />}
                                  {!showAnswer && String.fromCharCode(65 + idx)}
                                </span>
                                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {option}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* 解析 */}
                    {showAnswer && (
                      <div className="space-y-4">
                        <div className={cn(
                          'rounded-xl p-4 border',
                          selectedAnswer === aiQuestions[currentQuestionIndex].answer
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                        )}>
                          <div className="flex items-start gap-3">
                            {selectedAnswer === aiQuestions[currentQuestionIndex].answer ? (
                              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-200">
                                {selectedAnswer === aiQuestions[currentQuestionIndex].answer ? '回答正确！' : '回答错误'}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                💡 {aiQuestions[currentQuestionIndex].explanation}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 手写板/图片上传 */}
                        <div className="border rounded-xl p-4 space-y-3">
                          <h4 className="font-medium text-sm">📝 手写答题或上传图片</h4>
                          <div className="flex gap-2">
                            <Button
                              variant={showDrawing ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setShowDrawing(true);
                                setUploadedImage(null);
                                setTimeout(initCanvas, 100);
                              }}
                              className="gap-1"
                            >
                              <Pen className="h-4 w-4" />
                              手写板
                            </Button>
                            <label className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                              <Button variant="outline" size="sm" className="w-full gap-1" asChild>
                                <span>
                                  <Upload className="h-4 w-4" />
                                  上传图片
                                </span>
                              </Button>
                            </label>
                          </div>

                          {showDrawing && (
                            <div className="space-y-2">
                              <canvas
                                ref={canvasRef}
                                width={600}
                                height={300}
                                className="w-full border rounded-lg bg-white cursor-crosshair"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                              />
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={clearCanvas} className="gap-1">
                                  <RefreshCw className="h-4 w-4" />
                                  清空
                                </Button>
                              </div>
                            </div>
                          )}

                          {uploadedImage && (
                            <div className="relative">
                              <img src={uploadedImage} alt="上传的图片" className="w-full border rounded-lg" />
                              <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setUploadedImage(null)}
                              >
                                ✕
                              </Button>
                            </div>
                          )}

                          <Button
                            onClick={submitForChecking}
                            disabled={checkingWork || (!showDrawing && !uploadedImage)}
                            className="w-full gap-1"
                          >
                            {checkingWork ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ImageIcon className="h-4 w-4" />
                            )}
                            {checkingWork ? 'AI分析中...' : '提交让Qwen-vl检查'}
                          </Button>

                          {workFeedback && (
                            <div className={cn(
                              'rounded-lg p-4 border',
                              workFeedback.correct
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-amber-50 border-amber-200'
                            )}>
                              <p className="font-medium mb-2">
                                {workFeedback.correct ? '✅ 答案正确！' : '❌ 需要修正'}
                              </p>
                              <p className="text-sm text-slate-600 mb-2">{workFeedback.feedback}</p>
                              {workFeedback.suggestions.length > 0 && (
                                <div className="text-sm">
                                  <p className="font-medium mb-1">建议：</p>
                                  <ul className="list-disc list-inside text-slate-600">
                                    {workFeedback.suggestions.map((s, i) => (
                                      <li key={i}>{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 下一题按钮 */}
                        <div className="flex gap-3">
                          {currentQuestionIndex < aiQuestions.length - 1 ? (
                            <Button onClick={nextQuestion} className="flex-1 gap-1">
                              下一题
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                setPracticeMode(false);
                                setAiQuestions([]);
                                setSelectedConclusion(null);
                              }}
                              className="flex-1 gap-1"
                            >
                              <Target className="h-4 w-4" />
                              完成练习 · 得分 {practiceScore.correct}/{aiQuestions.length}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {!practiceMode && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">点击结论列表中的"AI生成试题"开始练习</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
