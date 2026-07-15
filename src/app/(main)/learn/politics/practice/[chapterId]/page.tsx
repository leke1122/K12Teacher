'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, Sparkles, FileQuestion, Lightbulb } from 'lucide-react';
import Link from 'next/link';

type Question = {
  id: string;
  type: 'choice' | 'material' | 'essay';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  material?: { content: string; source?: string };
};

export default function PoliticsPracticePage() {
  const params = useParams();
  const chapterId = useMemo(() => (params.chapterId as string) || 'politics-compulsory-1', [params.chapterId]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [materialAnswer, setMaterialAnswer] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setShowExplanation(false);
      setMaterialAnswer('');
      try {
        const res = await fetch('/api/politics/practice/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ unitId: 'politics_unit1', type: 'choice', count: 8 }),
        });
        const json = await res.json();
        if (json.success) setQuestions(json.questions || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setCurrentIndex(0);
        setShowResult(false);
        setAnswers({});
      }
    };
    load();
  }, [chapterId]);

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round((Object.keys(answers).length / questions.length) * 100);
  }, [answers, questions.length]);

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-slate-50 to-purple-50/30">
      <div className="w-full px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/subjects/politics">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileQuestion className="h-5 w-5 text-pink-500" />
              政治综合练习
            </h1>
            <p className="text-xs text-slate-500">高中思想政治 · {questions.length} 道练习题</p>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">进度：{Object.keys(answers).length}/{questions.length} 题</span>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            正在生成练习题...
          </div>
        ) : showResult ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">练习完成</h2>
              <p className="text-slate-500 mb-4">你已完成全部题目，建议继续下一模块。</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setShowResult(false)}>继续查看</Button>
                <Link href="/subjects/politics"><Button>返回学习</Button></Link>
              </div>
            </CardContent>
          </Card>
        ) : currentQuestion ? (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">第 {currentIndex + 1}/{questions.length} 题</Badge>
                  <Badge>{currentQuestion.category}</Badge>
                </div>
                {answers[currentQuestion.id] !== undefined && <Badge variant="outline">已作答</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.type === 'material' && currentQuestion.material && (
                <div className="bg-slate-50 rounded-lg border p-4">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{currentQuestion.material.content}</p>
                  {currentQuestion.material.source && <p className="text-xs text-slate-400 mt-2 text-right">—— {currentQuestion.material.source}</p>}
                </div>
              )}
              <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
              {currentQuestion.type === 'choice' && currentQuestion.options && (
                <RadioGroup
                  value={answers[currentQuestion.id]?.toString() || ''}
                  onValueChange={(val) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: parseInt(val) }))}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {currentQuestion.type === 'material' && (
                <Textarea value={materialAnswer} onChange={(e) => setMaterialAnswer(e.target.value)} placeholder="请输入你的分析..." className="min-h-[120px]" />
              )}
              {showExplanation && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-pink-600" />
                    <span className="font-medium text-pink-800">答案解析</span>
                  </div>
                  <p className="text-sm text-pink-900">{currentQuestion.explanation}</p>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>上一题</Button>
                  <Button variant="outline" onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1}>下一题</Button>
                </div>
                {answers[currentQuestion.id] !== undefined && !showExplanation && (
                  <Button onClick={() => setShowExplanation(true)}>查看解析</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-sm text-slate-500">暂无练习题</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
