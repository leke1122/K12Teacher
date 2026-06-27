'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeoGebraViewer, GeoGebraViewerRef } from '@/components/learn/GeoGebraViewer';
import { TutorialPanel } from '@/components/learn/TutorialPanel';
import { useTutorial } from '@/hooks/useTutorial';
import { ModelSelector } from '@/components/geogebra/ModelSelector';
import { generateGeoGebraScript } from '@/lib/geogebra/scriptGenerator';
import { Upload, Image as ImageIcon, Loader2, XCircle, Trash2, Download, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { GeometryData } from '@/types/geometry';
import { GEO_MODELS, type GeoGebraModelConfig } from '@/lib/geogebraModels';
import { useRouter } from 'next/navigation';
import { GeoGebraTutor } from '@/components/learn/GeoGebraTutor';
import { useSettingsStore } from '@/stores/settingsStore';
import type { SelectedObject } from '@/types/geogebra';

export default function GeoGebraUnifiedPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'basic' | 'ai'>('basic');
  const { settings } = useSettingsStore();

  // Basic mode state
  const [selectedModel, setSelectedModel] = useState<GeoGebraModelConfig | undefined>(GEO_MODELS[0]);

  // AI mode state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geometryData, setGeometryData] = useState<GeometryData | null>(null);
  const [ggbScript, setGgbScript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<'idle' | 'uploading' | 'analyzing' | 'rendering' | 'ready'>('idle');

  // Tutor integration state
  const [selectedObjects, setSelectedObjects] = useState<SelectedObject[]>([]);

  const viewerRef = useRef<GeoGebraViewerRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { steps, isLoading: isGeneratingSteps, generateSteps, reset: resetTutorial } = useTutorial();

  // Listen for GeoGebra selection change events from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type !== 'geogebra_selection_change') return;

      // Verify message comes from our GeoGebra iframe
      const geoGebraIframe = document.querySelector('iframe[src*="geogebra"]') as HTMLIFrameElement | null;
      if (geoGebraIframe && event.source === geoGebraIframe.contentWindow) {
        const objects = Array.isArray(data.selectedObjects) ? data.selectedObjects : [];
        setSelectedObjects(objects);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Reset tutor state when switching to basic mode
  useEffect(() => {
    if (mode === 'basic') {
      setSelectedObjects([]);
    }
  }, [mode]);

  // Basic mode handlers
  const handleModelChange = (model: GeoGebraModelConfig) => {
    setSelectedModel(model);
  };

  const handleOpenModel = () => {
    const modelId = selectedModel?.id || GEO_MODELS[0].id;
    router.push(`/learn/math/geogebra/model/${modelId}`);
  };

  // Execute GeoGebra commands returned by the tutor
  const handleExecuteGeoGebraCommand = useCallback((command: { action: string; target: string; params: Record<string, unknown> }) => {
    try {
      const applet = viewerRef.current?.getApplet() as Record<string, unknown> | undefined;
      if (!applet || typeof applet.evalCommand !== 'function') return;

      const { action, target, params } = command;

      switch (action) {
        case 'highlight': {
          const color = (params.color as string) || '#FF5722';
          applet.evalCommand(`SetColor(${target}, ${color})`);
          break;
        }
        case 'show':
          applet.evalCommand(`ShowObject(${target})`);
          break;
        case 'hide':
          applet.evalCommand(`HideObject(${target})`);
          break;
        case 'rotate': {
          const angle = (params.angle as number) || 45;
          applet.evalCommand(`RotateView(${angle}, 0)`);
          break;
        }
        case 'zoom': {
          const scale = (params.scale as number) || 1.5;
          applet.evalCommand(`ZoomIn(${scale})`);
          break;
        }
        case 'setColor': {
          const color = (params.color as string) || '#FF5722';
          applet.evalCommand(`SetColor(${target}, ${color})`);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error('执行 GeoGebra 命令失败:', err);
    }
  }, []);

  // AI mode handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }

    setImageFile(file);
    setError(null);
    setAnalysisStep('uploading');

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      setAnalysisStep('idle');
    };
    reader.onerror = () => {
      setError('图片读取失败，请重试');
      setAnalysisStep('idle');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('请先上传题目图片');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep('analyzing');
    setGeometryData(null);
    setGgbScript('');
    setSelectedObjects([]);
    resetTutorial();

    try {
      // 优先从 settingsStore 读取 API Key，兼容 localStorage 旧数据
      const apiKey = settings.qwenKey || (typeof window !== 'undefined' ? localStorage.getItem('qwen_api_key') : null);

      if (!apiKey) {
        throw new Error('请先在设置页面配置Qwen-VL的API Key');
      }

      const analyzeResponse = await fetch('/api/ai/vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-qwen-api-key': apiKey,
        },
        body: JSON.stringify({
          image: selectedImage.split(',')[1],
        }),
      });

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();
        throw new Error(errorData.error || 'AI分析失败');
      }

      const analyzeResult = await analyzeResponse.json();
      if (!analyzeResult.success) {
        throw new Error(analyzeResult.error || 'AI分析失败');
      }

      setGeometryData(analyzeResult.data);
      setAnalysisStep('rendering');

      try {
        const script = generateGeoGebraScript(analyzeResult.data);
        setGgbScript(script);
        setAnalysisStep('ready');
      } catch (scriptError) {
        throw new Error('生成3D图形失败: ' + (scriptError instanceof Error ? scriptError.message : String(scriptError)));
      }

      await generateSteps(analyzeResult.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '分析失败，请重试';
      setError(message);
      setAnalysisStep('idle');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setGeometryData(null);
    setGgbScript('');
    setError(null);
    setAnalysisStep('idle');
    setSelectedObjects([]);
    resetTutorial();
    viewerRef.current?.clear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteScript = () => {
    if (ggbScript && viewerRef.current) {
      viewerRef.current.executeScript(ggbScript);
    }
  };

  const renderStatusBadge = () => {
    switch (analysisStep) {
      case 'idle':
        return <Badge variant="secondary">等待上传</Badge>;
      case 'uploading':
        return <Badge variant="outline">已上传</Badge>;
      case 'analyzing':
        return <Badge variant="default" className="bg-blue-500">分析中...</Badge>;
      case 'rendering':
        return <Badge variant="default" className="bg-purple-500">渲染中...</Badge>;
      case 'ready':
        return <Badge variant="default" className="bg-green-500">就绪</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-slate-900">
      {/* Page title + mode tabs (not sticky; layout Header is sticky) */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔷</div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">GeoGebra 动态图形讲解</h1>
              <p className="text-sm text-muted-foreground">高中几何 · 交互式探索</p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm">整合版本</Badge>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'basic' | 'ai')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-11">
            <TabsTrigger value="basic" className="gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              📐 基础模式
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2 text-base">
              <Sparkles className="h-4 w-4" />
              🤖 AI智能模式
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-4 flex flex-col">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'basic' | 'ai')} className="w-full flex flex-col flex-1 min-h-0">
          {/* Basic Mode */}
          <TabsContent value="basic" className="mt-0">
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <ModelSelector value={selectedModel?.id} onChange={handleModelChange} />

                <Card className="rounded-xl border">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-lg">当前模型</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedModel ? (
                      <>
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{selectedModel.icon}</div>
                            <div>
                              <div className="text-base font-medium">{selectedModel.name}</div>
                              <div className="text-sm text-muted-foreground">公式：{selectedModel.formula}</div>
                            </div>
                          </div>
                          <Button onClick={handleOpenModel} className="gap-1">
                            进入交互模型
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedModel.description}</p>
                      </>
                    ) : (
                      <p className="text-base text-muted-foreground">请先在左侧选择一个模型。</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="rounded-xl border">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      使用说明
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>1. 从模型库选择一个几何或函数模型。</p>
                    <p>2. 进入交互模型页后，可旋转、缩放、调节参数。</p>
                    <p>3. 点击"引导讲解"后按步骤思考，不直接查看答案。</p>
                    <p>4. 切换到"AI智能模式"可上传题目图片自动分析。</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AI Mode */}
          <TabsContent value="ai" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Sparkles className="h-7 w-7 text-yellow-500" />
                  AI + 3D 交互式解题
                </h2>
                <p className="text-base text-gray-500 mt-1">
                  上传几何或函数题目图片，AI将自动生成3D模型和引导式解题步骤
                </p>
              </div>
              <div className="flex items-center gap-2">
                {renderStatusBadge()}
                <Button variant="outline" size="sm" onClick={handleReset} className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  重置
                </Button>
              </div>
            </div>

            {error && (
              <Card className="mb-4 border-red-200 bg-red-50">
                <CardContent className="flex items-center gap-2 text-red-700 p-4">
                  <XCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-red-600 hover:text-red-700"
                    onClick={() => setError(null)}
                  >
                    关闭
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 三栏布局：上传+调试 | 3D渲染(最大) | AI导师 */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 min-h-0">
              {/* 左栏：上传区 + 调试信息 */}
              <div className="xl:col-span-2 flex flex-col gap-3 overflow-y-auto">
                {/* 上传卡片 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">📤 上传题目</CardTitle>
                    <CardDescription>PNG、JPG 格式</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative">
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload-ai"
                      />
                      <label
                        htmlFor="image-upload-ai"
                        className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        {selectedImage ? (
                          <img src={selectedImage} alt="题目" className="max-h-24 object-contain" />
                        ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <Upload className="h-7 w-7 mb-1" />
                            <span className="text-xs">点击上传图片</span>
                          </div>
                        )}
                      </label>
                    </div>

                    {imageFile && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-1.5 rounded text-center">
                        {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}

                    <Button
                      className="w-full"
                      size="sm"
                      onClick={handleAnalyze}
                      disabled={!selectedImage || isAnalyzing || analysisStep === 'analyzing' || analysisStep === 'rendering'}
                    >
                      {isAnalyzing || analysisStep === 'analyzing' || analysisStep === 'rendering' ? (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" />{analysisStep === 'analyzing' ? '分析中...' : '渲染中...'}</>
                      ) : (
                        <><Sparkles className="h-3 w-3 mr-1" />开始分析</>
                      )}
                    </Button>

                    {geometryData && (
                      <div className="bg-blue-50 p-2 rounded text-xs space-y-0.5">
                        <p className="font-medium text-blue-700">📊 识别结果</p>
                        <p>类型: {geometryData.type}</p>
                        <p>顶点: {geometryData.points?.length || 0} | 面: {geometryData.faces?.length || 0}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 调试信息 */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">📋 调试信息</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-36">
                      <div className="space-y-0.5 text-xs font-mono">
                        <p>状态: {analysisStep}</p>
                        <p>数据: {geometryData ? '已加载' : '未加载'}</p>
                        <p>脚本: {ggbScript ? `${ggbScript.length}字符` : '未生成'}</p>
                        <p>步骤: {steps.length} 步</p>
                        <p>选中: {selectedObjects.length} 个</p>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* 中栏：3D 渲染区（占最大空间） */}
              <div className="xl:col-span-7 flex flex-col" style={{ minHeight: '450px' }}>
                {/* 标题栏 */}
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-sm font-medium text-gray-600">🎨 3D 模型渲染</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 hidden xl:inline">滚轮缩放 · 拖拽旋转</span>
                    {ggbScript && (
                      <Button variant="outline" size="sm" onClick={handleExecuteScript}>
                        <Download className="h-3 w-3 mr-1" />重绘
                      </Button>
                    )}
                  </div>
                </div>
                {/* GeoGebra iframe 直接占满剩余空间 */}
                <div className="flex-1 rounded-xl overflow-hidden border bg-white">
                  <GeoGebraViewer
                    ref={viewerRef}
                    script={ggbScript}
                    autoExecute
                    height="100%"
                    onError={(err) => {
                      setError('3D渲染失败: ' + err);
                    }}
                  />
                </div>
              </div>

              {/* 右栏：AI 几何导师 */}
              <div className="xl:col-span-3 flex flex-col overflow-y-auto">
                <GeoGebraTutor
                  selectedObjects={selectedObjects}
                  problemImage={selectedImage ?? undefined}
                  analysisStep={analysisStep}
                  apiKey={settings.qwenKey || (typeof window !== 'undefined' ? (localStorage.getItem('qwen_api_key') || undefined) : undefined)}
                  onExecuteCommand={handleExecuteGeoGebraCommand}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
