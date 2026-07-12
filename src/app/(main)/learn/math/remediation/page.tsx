'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Camera, Upload, Loader2, CheckCircle, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRemediationStore } from '@/stores/remediationStore';

// 动态导入以避免 SSR 问题
const TutorChat = dynamic(() => import('@/components/math/TutorChat'), {
  ssr: false,
  loading: () => (
    <Card className="h-full flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </Card>
  ),
});

// 进度配置
const STEPS = [
  { id: 'scan', label: '拍照', icon: Camera },
  { id: 'diagnose', label: '诊断', icon: AlertCircle },
  { id: 'remediate', label: '巩固', icon: BookOpen },
  { id: 'complete', label: '完成', icon: CheckCircle },
];

interface RecognitionResult {
  recognizedText: string;
  isCorrect: boolean;
  stepAnalysis: Array<{ step: number; content: string; isCorrect: boolean; comment: string }>;
  wrongStep: string;
  wrongReason: string;
  correctSolution: string;
  score: number;
  feedback: string;
  question_text?: string;
  student_answer?: string;
  correct_answer?: string;
  knowledge_point?: string;
}

function MathRemediationContent() {
  const searchParams = useSearchParams();
  const questionIdParam = searchParams.get('question_id');

  const {
    status,
    setStatus,
    currentQuestion,
    setCurrentQuestion,
    setProgress,
    reset,
  } = useRemediationStore();

  // 上传状态
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 从 URL 参数加载已有错题
  useEffect(() => {
    if (questionIdParam) {
      loadExistingQuestion(questionIdParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIdParam]);

  const loadExistingQuestion = async (id: string) => {
    try {
      const response = await fetch(`/api/wrong-questions?id=${id}`);
      const data = await response.json();
      
      if (data.success && data.questions?.[0]) {
        const q = data.questions[0];
        setCurrentQuestion({
          id: q.id,
          question: q.question,
          correctAnswer: q.correct_answer,
          userAnswer: q.user_answer,
          knowledgePoint: q.knowledge_point,
          imageUrl: q.image_url,
        });
        setStatus('tutoring');
        setProgress(3, 4);
      }
    } catch (err) {
      console.error('加载错题失败:', err);
    }
  };

  // 处理图片选择
  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }

    setImageFile(file);
    setError(null);

    // 生成预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // 处理拖放
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  // 上传并识别
  const handleUpload = async () => {
    if (!imageFile) return;

    setUploading(true);
    setError(null);
    setStatus('scanning');
    setProgress(1, 4);

    try {
      // 转换为 base64
      const imageData = await fileToBase64(imageFile);

      // 从 localStorage 读取 Qwen API Key (zustand persist 格式)
      let apiKey = '';
      try {
        const stored = localStorage.getItem('edumind-settings');
        if (stored) {
          const parsed = JSON.parse(stored);
          // zustand persist 格式: { state: { settings: {...} }, ... }
          apiKey = parsed?.state?.settings?.qwenKey || parsed?.qwenKey || '';
        }
      } catch {
        // 解析失败，尝试其他方式
        const settings = JSON.parse(localStorage.getItem('edumind-settings') || '{}');
        apiKey = settings?.qwenKey || '';
      }

      if (!apiKey) {
        throw new Error('请先在设置页面配置 Qwen-VL API Key');
      }

      // 调用识别 API
      const response = await fetch('/api/recognize-math', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-qwen-api-key': apiKey,
        },
        body: JSON.stringify({ imageData }),
      });

      const result = await response.json();

      if (result.success || result.recognizedText) {
        setRecognitionResult(result);
        setProgress(2, 4);

        // 保存到数据库
        const questionText = result.question_text || result.recognizedText || '未识别出题目';
        const correctAnswer = result.correct_answer || result.correctSolution || '';
        const knowledgePoint = result.knowledge_point || '';

        const addResponse = await fetch('/api/wrong-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId: 'math',
            question: questionText,
            correctAnswer,
            userAnswer: result.student_answer || '',
            analysis: result.wrongReason || result.feedback || '',
            knowledgePoint,
            imageUrl: imagePreview,
          }),
        });

        const addData = await addResponse.json();

        if (!addData.success || !addData.id) {
          throw new Error('保存错题失败');
        }

        setCurrentQuestion({
          id: addData.id,
          question: questionText,
          correctAnswer,
          userAnswer: result.student_answer || '',
          knowledgePoint,
          imageUrl: imagePreview || undefined,
          recognizedText: result.recognizedText,
          stepAnalysis: result.stepAnalysis,
        });
        setStatus('tutoring');
        setProgress(3, 4);
      } else {
        throw new Error(result.error || '识别失败');
      }
    } catch (err) {
      console.error('识别失败:', err);
      setError(err instanceof Error ? err.message : '识别失败，请重试');
      setStatus('idle');
    } finally {
      setUploading(false);
    }
  };

  // 文件转 base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 重置
  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setRecognitionResult(null);
    setError(null);
    reset();
  };

  // 获取当前进度
  const getCurrentStep = () => {
    switch (status) {
      case 'idle': return 1;
      case 'scanning': return 1;
      case 'tutoring': return 3;
      case 'mastered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="w-full px-4 py-4 max-w-6xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/math">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Camera className="h-5 w-5 text-indigo-500" />
              数学错题拍照纠错
            </h1>
            <p className="text-xs text-muted-foreground">
              拍照上传错题，AI 导师引导你自主思考解题
            </p>
          </div>
          <Badge variant="outline" className="bg-indigo-50">
            <Sparkles className="h-3 w-3 mr-1" />
            苏格拉底模式
          </Badge>
        </div>

        {/* 进度条 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const currentStep = getCurrentStep();
                const isActive = index + 1 <= currentStep;
                const isCurrent = index + 1 === currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 text-slate-400'
                        } ${isCurrent ? 'ring-2 ring-indigo-300 ring-offset-2' : ''}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs mt-1 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-12 h-0.5 mx-2 ${
                          index + 1 < currentStep ? 'bg-indigo-500' : 'bg-slate-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={(getCurrentStep() / 4) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* 主内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左半边：图片上传和识别结果 */}
          <div className="space-y-4">
            {/* 上传区域 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4 text-indigo-500" />
                  拍照上传
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!imagePreview ? (
                  <div
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('imageInput')?.click()}
                  >
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                    />
                    <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-lg font-medium text-slate-600 mb-2">
                      点击或拖拽上传图片
                    </p>
                    <p className="text-sm text-slate-400">
                      支持 JPG、PNG 格式，最大 10MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview}
                        alt="预览"
                        className="w-full max-h-[400px] object-contain bg-slate-100"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleReset}
                      >
                        重新上传
                      </Button>
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          识别中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          开始识别
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 识别结果 */}
            {recognitionResult && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>识别结果</span>
                    <Badge variant={recognitionResult.isCorrect ? 'default' : 'destructive'}>
                      {recognitionResult.isCorrect ? '正确' : '有误'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 题目 */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">识别题目</p>
                    <p className="text-sm bg-slate-50 rounded-lg p-3">
                      {recognitionResult.question_text || recognitionResult.recognizedText || '未识别出题目'}
                    </p>
                  </div>

                  {/* 分数 */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">得分</p>
                    <div className="flex items-center gap-2">
                      <Progress value={recognitionResult.score} className="flex-1" />
                      <span className="text-sm font-medium">{recognitionResult.score}分</span>
                    </div>
                  </div>

                  {/* 反馈 */}
                  {recognitionResult.feedback && (
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <p className="text-sm text-indigo-800">{recognitionResult.feedback}</p>
                    </div>
                  )}

                  {/* 错误分析 */}
                  {recognitionResult.wrongReason && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                      <p className="text-xs text-amber-700 font-medium mb-1">错误原因</p>
                      <p className="text-sm text-amber-900">{recognitionResult.wrongReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 右半边：导师对话 */}
          <div className="h-[calc(100vh-280px)] min-h-[500px]">
            {status === 'tutoring' && currentQuestion ? (
              <TutorChat questionId={currentQuestion.id} />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <BookOpen className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-lg font-medium text-slate-500 mb-2">
                    上传图片开始学习
                  </p>
                  <p className="text-sm text-slate-400">
                    拍下你的错题，AI 导师将引导你一步步分析解题思路
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* 功能说明 */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              苏格拉底式学习法
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">分析题意</p>
                  <p className="text-xs text-slate-500">导师引导你识别题目中的已知条件和求解目标</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">分步引导</p>
                  <p className="text-xs text-slate-500">不直接给答案，通过提问引导你自己找到解题思路</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">变式巩固</p>
                  <p className="text-xs text-slate-500">答对后自动生成变式题，检验你是否真正掌握</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MathRemediationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    }>
      <MathRemediationContent />
    </Suspense>
  );
}
