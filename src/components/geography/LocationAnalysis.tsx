'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Loader2, ChevronRight, Target, GitBranch, Trophy, RotateCcw } from 'lucide-react';
import type { LocationAnalysisCase } from '@/lib/geographyData';

interface LocationAnalysisProps {
  cases: LocationAnalysisCase[];
}

type AnalysisStep = 'select' | 'natural' | 'human' | 'causes' | 'effects' | 'measures' | 'completed';

const STEP_CONFIG: { key: AnalysisStep; label: string; description: string; icon: React.ReactNode }[] = [
  { key: 'select', label: '选择案例', description: '选择区位分析案例', icon: <Target className="h-4 w-4" /> },
  { key: 'natural', label: '自然因素', description: '气候、地形、水源、土壤、资源', icon: <Target className="h-4 w-4" /> },
  { key: 'human', label: '人文因素', description: '市场、交通、政策、劳动力、科技', icon: <Target className="h-4 w-4" /> },
  { key: 'causes', label: '成因分析', description: '为什么形成这样的区位', icon: <GitBranch className="h-4 w-4" /> },
  { key: 'effects', label: '影响分析', description: '带来了什么影响', icon: <GitBranch className="h-4 w-4" /> },
  { key: 'measures', label: '措施建议', description: '提出合理的解决措施', icon: <GitBranch className="h-4 w-4" /> },
  { key: 'completed', label: '分析完成', description: '查看完整分析报告', icon: <Trophy className="h-4 w-4" /> },
];

function LocationAnalysis({ cases }: LocationAnalysisProps) {
  const [selectedCase, setSelectedCase] = useState<LocationAnalysisCase | null>(null);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('select');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showReference, setShowReference] = useState(false);
  const [completed, setCompleted] = useState(false);

  const stepIndex = STEP_CONFIG.findIndex((s) => s.key === currentStep);
  const progress = Math.round(((stepIndex) / (STEP_CONFIG.length - 1)) * 100);

  const handleSelectCase = (caseItem: LocationAnalysisCase) => {
    setSelectedCase(caseItem);
    setCurrentStep('natural');
    setUserAnswers({});
    setFeedback(null);
    setShowReference(false);
    setCompleted(false);
  };

  const handleAnswerSubmit = (field: string, value: string) => {
    if (!value.trim()) return;
    setUserAnswers((prev) => ({ ...prev, [field]: value }));
    setFeedback(null);
    setShowReference(false);
  };

  const handleNextStep = () => {
    if (!selectedCase) return;

    const stepOrder: AnalysisStep[] = ['select', 'natural', 'human', 'causes', 'effects', 'measures', 'completed'];
    const currentIdx = stepOrder.indexOf(currentStep);

    if (currentStep === 'measures') {
      setCompleted(true);
      setCurrentStep('completed');
      return;
    }

    const nextStep = stepOrder[currentIdx + 1];
    if (nextStep) {
      setCurrentStep(nextStep);
      setFeedback(null);
      setShowReference(false);
    }
  };

  const handleRetry = () => {
    setFeedback(null);
    setShowReference(false);
  };

  const handleReset = () => {
    setSelectedCase(null);
    setCurrentStep('select');
    setUserAnswers({});
    setFeedback(null);
    setShowReference(false);
    setCompleted(false);
  };

  if (!selectedCase) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              选择区位分析案例
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {cases.map((c) => (
                <Card
                  key={c.id}
                  className="cursor-pointer transition-all hover:shadow-sm"
                  onClick={() => handleSelectCase(c)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {c.type === 'agriculture' ? '农业' : c.type === 'industry' ? '工业' : c.type === 'city' ? '城市' : '生态'}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold">{c.region}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {c.question}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentConfig = STEP_CONFIG.find((s) => s.key === currentStep) || STEP_CONFIG[0];

  return (
    <div className="space-y-4">
      {/* 进度 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              {currentConfig.icon}
              {currentConfig.label}
            </p>
            <span className="text-xs text-muted-foreground">
              步骤 {stepIndex + 1}/{STEP_CONFIG.length - 1}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">{currentConfig.description}</p>
        </CardContent>
      </Card>

      {/* 案例信息 */}
      <Card className="bg-blue-50/60 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">{selectedCase.region}</p>
              <p className="text-xs text-blue-600 mt-1">{selectedCase.question}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              更换案例
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 自然因素 */}
      {currentStep === 'natural' && (
        <Card>
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base">🌍 自然因素分析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              请分析该区域的自然区位条件（气候、地形、水源、土壤、资源）：
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCase.framework.natural.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="请写出自然因素分析..."
              value={userAnswers.natural || ''}
              onChange={(e) => setUserAnswers((prev) => ({ ...prev, natural: e.target.value }))}
              className="min-h-[100px]"
            />
            <Button
              size="sm"
              onClick={() => {
                handleAnswerSubmit('natural', userAnswers.natural || '');
                handleNextStep();
              }}
              disabled={!userAnswers.natural?.trim()}
              className="gap-1"
            >
              下一步 <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 人文因素 */}
      {currentStep === 'human' && (
        <Card>
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base">🏙️ 人文因素分析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              请分析该区域的人文区位条件（市场、交通、政策、劳动力、科技）：
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCase.framework.human.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="请写出人文因素分析..."
              value={userAnswers.human || ''}
              onChange={(e) => setUserAnswers((prev) => ({ ...prev, human: e.target.value }))}
              className="min-h-[100px]"
            />
            <Button
              size="sm"
              onClick={() => {
                handleAnswerSubmit('human', userAnswers.human || '');
                handleNextStep();
              }}
              disabled={!userAnswers.human?.trim()}
              className="gap-1"
            >
              下一步 <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 成因分析 */}
      {currentStep === 'causes' && (
        <Card>
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base">🔍 成因分析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              综合以上因素，分析该区位形成的根本原因：
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCase.framework.causes.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="请写出成因分析..."
              value={userAnswers.causes || ''}
              onChange={(e) => setUserAnswers((prev) => ({ ...prev, causes: e.target.value }))}
              className="min-h-[100px]"
            />
            <Button
              size="sm"
              onClick={() => {
                handleAnswerSubmit('causes', userAnswers.causes || '');
                handleNextStep();
              }}
              disabled={!userAnswers.causes?.trim()}
              className="gap-1"
            >
              下一步 <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 影响分析 */}
      {currentStep === 'effects' && (
        <Card>
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base">📊 影响分析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              该区位带来了什么影响或问题？
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCase.framework.effects.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="请写出影响分析..."
              value={userAnswers.effects || ''}
              onChange={(e) => setUserAnswers((prev) => ({ ...prev, effects: e.target.value }))}
              className="min-h-[100px]"
            />
            <Button
              size="sm"
              onClick={() => {
                handleAnswerSubmit('effects', userAnswers.effects || '');
                handleNextStep();
              }}
              disabled={!userAnswers.effects?.trim()}
              className="gap-1"
            >
              下一步 <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 措施建议 */}
      {currentStep === 'measures' && (
        <Card>
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base">💡 措施建议</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              针对该区位发展中的问题，提出合理的解决措施：
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedCase.framework.measures.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="请写出措施建议..."
              value={userAnswers.measures || ''}
              onChange={(e) => setUserAnswers((prev) => ({ ...prev, measures: e.target.value }))}
              className="min-h-[100px]"
            />
            <Button
              size="sm"
              onClick={() => {
                handleAnswerSubmit('measures', userAnswers.measures || '');
                handleNextStep();
              }}
              disabled={!userAnswers.measures?.trim()}
              className="gap-1"
            >
              完成分析 <Trophy className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 完成状态 */}
      {currentStep === 'completed' && (
        <Card className="bg-emerald-50/60 border-emerald-200">
          <CardHeader className="pb-3 pt-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-emerald-500" />
              🎉 区位分析完成
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">🌍 自然因素</p>
                <p className="text-sm text-slate-700">{userAnswers.natural || '未填写'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">🏙️ 人文因素</p>
                <p className="text-sm text-slate-700">{userAnswers.human || '未填写'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">🔍 成因分析</p>
                <p className="text-sm text-slate-700">{userAnswers.causes || '未填写'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">📊 影响分析</p>
                <p className="text-sm text-slate-700">{userAnswers.effects || '未填写'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-medium text-slate-500 mb-1">💡 措施建议</p>
                <p className="text-sm text-slate-700">{userAnswers.measures || '未填写'}</p>
              </div>
            </div>

            <details className="rounded-lg border border-slate-200">
              <summary className="cursor-pointer px-3 py-2 text-sm text-slate-600 hover:text-slate-800">
                查看参考答案
              </summary>
              <div className="px-3 py-2 border-t bg-slate-50">
                <ScrollArea className="h-40">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedCase.referenceAnswer}
                  </p>
                </ScrollArea>
              </div>
            </details>

            <Button size="sm" variant="outline" onClick={handleReset} className="gap-1">
              <RotateCcw className="h-4 w-4" />
              分析其他案例
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { LocationAnalysis };
