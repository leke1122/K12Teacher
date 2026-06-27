'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { GeogebraContainer } from '@/components/geogebra/GeogebraContainer';
import { ControlPanel } from '@/components/geogebra/ControlPanel';
import { GuideExplainer } from '@/components/geogebra/GuideExplainer';
import { GEO_MODELS, type GeoGebraModelConfig, resolveModelIdFromShapeType, resolveShapeLabel } from '@/lib/geogebraModels';

type TopicMode = 'model' | 'question';

function ModelDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawModelId = decodeURIComponent(String(params.modelId || ''));

  const [topicMode, setTopicMode] = useState<TopicMode>(searchParams.get('mode') === 'question' ? 'question' : 'model');
  const [paramsState, setParamsState] = useState<Record<string, number>>({});
  const [showGuide, setShowGuide] = useState(false);
  const [questionMeta, setQuestionMeta] = useState<{ shapeType?: string; question?: string }>({});

  const baseModel = useMemo(() => GEO_MODELS.find((item) => item.id === rawModelId) || GEO_MODELS[0], [rawModelId]);

  const questionModelId = useMemo(() => resolveModelIdFromShapeType(rawModelId), [rawModelId]);

  const questionBase = useMemo(() => GEO_MODELS.find((item) => item.id === questionModelId) || baseModel, [questionModelId, baseModel]);

  const model = useMemo<GeoGebraModelConfig>(() => {
    if (topicMode === 'model') {
      return baseModel;
    }

    if (topicMode === 'question') {
      const shapeLabel = resolveShapeLabel(rawModelId);
      return {
        ...questionBase,
        id: questionBase.id,
        name: shapeLabel + ' · 题目讲解',
        description: '根据题目图形「' + shapeLabel + '」生成的讲解模型。',
        guideIntro: '先观察图形，梳理已知条件，再尝试推导结论。',
        guideQuestions: [
          '图形的主要形状和已知条件分别是什么？',
          '哪些条件是解题的关键？',
          '要先求哪一个中间量最合理？',
          '用图形验证你的推导是否成立？',
          '你能给出最终结果吗？',
        ],
      };
    }

    return baseModel;
  }, [topicMode, rawModelId, baseModel, questionBase]);

  useEffect(() => {
    if (topicMode === 'model') {
      setParamsState({ ...model.defaultParams });
    }
  }, [topicMode, model]);

  const handleRotateLeft = () => {};
  const handleRotateRight = () => {};
  const handleZoomIn = () => {};
  const handleZoomOut = () => {};
  const handleReset = () => {
    setParamsState({ ...model.defaultParams });
  };

  const handleGuideComplete = (answers: string[]) => {
    console.log('[引导讲解] 学生回答:', answers);
  };

  const handleOpenRecognized = () => {
    if (questionMeta.question) {
      const targetModelId = resolveModelIdFromShapeType(questionMeta.shapeType);
      router.push('/learn/math/geogebra/model/' + encodeURIComponent(targetModelId) + '?mode=question');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-900 dark:to-slate-900">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                {model.name}
              </h1>
              <p className="text-xs text-slate-500">公式：{model.formula}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={topicMode === 'model' ? 'default' : 'outline'} size="sm" onClick={() => setTopicMode('model')}>
              模型探索
            </Button>
            <Button variant={topicMode === 'question' ? 'default' : 'outline'} size="sm" onClick={() => setTopicMode('question')}>
              题目引导
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4">
            <GeogebraContainer
              model={model}
              params={paramsState}
              showAuxiliaryLines
              onInteract={(data) => console.log('[GeoGebra]', data)}
              height={680}
            />

            {topicMode === 'question' && (
              <Card className="rounded-xl border bg-white">
                <CardHeader className="pb-3 pt-4">
                  <CardTitle className="text-base">题目信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="font-medium">{model.name}</p>
                  <p className="text-muted-foreground">{model.description}</p>
                  <p className="text-xs text-muted-foreground">当前为题目引导模式，请先观察图形，再思考引导问题。</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <ControlPanel
              model={model}
              params={paramsState}
              onParamsChange={setParamsState}
              onRotateLeft={handleRotateLeft}
              onRotateRight={handleRotateRight}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onReset={handleReset}
            />

            <Card className="rounded-xl border bg-white">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  模型信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{model.appName === '3d' ? '3D' : '2D'}</Badge>
                  <Badge variant="outline">{model.category === 'solid' ? '立体几何' : '函数'}</Badge>
                </div>
                <p className="text-muted-foreground">{model.description}</p>
              </CardContent>
            </Card>

            <GuideExplainer
              modelName={model.name}
              intro={model.guideIntro}
              guideQuestions={model.guideQuestions}
              onComplete={handleGuideComplete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GeoGebraModelPage() {
  return <ModelDetailPageContent />;
}
