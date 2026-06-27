'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Sparkles, Send, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: {
    text: string;
    correctAnswer: string;
    knowledgePoint?: string;
  };
  onResolved: (correct: boolean) => void;
  apiKey?: string;
}

interface GuideStep {
  role: 'ai' | 'student';
  content: string;
}

const INITIAL_GUIDE = '看到这道题，你觉得它考察的是哪个知识点？\n\n（提示：题目中有没有出现你学过的概念？）';

export function GuideDialog({ open, onOpenChange, question, onResolved, apiKey }: GuideDialogProps) {
  const [step, setStep] = useState(1);
  const [guide, setGuide] = useState(INITIAL_GUIDE);
  const [hint, setHint] = useState('请先说说这道题想考什么');
  const [studentInput, setStudentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GuideStep[]>([]);
  const [finalAnswer, setFinalAnswer] = useState('');
  const [showFinalInput, setShowFinalInput] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    if (open && question.text) {
      setStep(1);
      setGuide(INITIAL_GUIDE);
      setHint('请先说说这道题想考什么');
      setStudentInput('');
      setHistory([]);
      setFinalAnswer('');
      setShowFinalInput(false);
      setResult(null);
    }
  }, [open, question]);

  const TOTAL_STEPS = 5;

  const handleSend = async () => {
    if (!studentInput.trim()) return;
    const userMsg = studentInput.trim();
    setLoading(true);

    const newHistory: GuideStep[] = [...history, { role: 'student', content: userMsg }];
    setHistory(newHistory);
    setStudentInput('');

    // 最后一步：用户重新作答
    if (step === TOTAL_STEPS - 1) {
      setShowFinalInput(true);
      setLoading(false);
      setGuide('现在你再试一次，这道题的答案是什么？');
      setHistory([...newHistory, { role: 'ai', content: '现在你再试一次，这道题的答案是什么？' }]);
      return;
    }

    // 第5步（最后一步）：判断答案
    if (step === TOTAL_STEPS) {
      const isCorrect = userMsg.toUpperCase().startsWith(question.correctAnswer.toUpperCase());
      setResult(isCorrect ? 'correct' : 'wrong');
      setLoading(false);
      setHistory(prev => [...prev, { role: 'student', content: userMsg }]);
      if (isCorrect) {
        setGuide('🎉 恭喜你完全理解了！答案正确！继续加油！');
        setHistory(prev => [...prev, { role: 'ai', content: '🎉 恭喜你完全理解了！答案正确！继续加油！' }]);
      }
      return;
    }

    // 中间步骤：调用API获取下一步引导
    if (apiKey) {
      try {
        const response = await fetch('/api/guide-wrong-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: question.text,
            correctAnswer: question.correctAnswer,
            knowledgePoint: question.knowledgePoint,
            step: step + 1,
            studentResponse: userMsg,
            history: newHistory.map(h => `${h.role}: ${h.content}`),
            apiKey,
          }),
        });
        const data = await response.json();
        if (data.success) {
          setStep(data.step);
          setGuide(data.guide || '');
          setHint(data.hint || '');
          setHistory(prev => [...prev, { role: 'ai', content: data.guide || '' }]);
        }
      } catch {
        setGuide(getDefaultGuide(step + 1));
        setHistory(prev => [...prev, { role: 'ai', content: getDefaultGuide(step + 1) }]);
      }
    } else {
      const defaultGuide = getDefaultGuide(step + 1);
      setGuide(defaultGuide);
      setHistory(prev => [...prev, { role: 'ai', content: defaultGuide }]);
    }

    setLoading(false);
  };

  const handleClose = () => {
    if (result) {
      onResolved(result === 'correct');
    }
    onOpenChange(false);
  };

  const handleViewSolution = () => {
    setResult('wrong');
    onResolved(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            引导式讲解
            <span className="ml-auto text-xs text-slate-500">第 {step}/{TOTAL_STEPS} 步</span>
          </DialogTitle>
        </DialogHeader>

        <Card className="border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20">
          <CardContent className="p-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {question.text}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {history.map((msg, i) => (
            <div key={i} className={cn('flex items-start gap-2', msg.role === 'student' ? 'flex-row-reverse' : '')}>
              <div className={cn(
                'max-w-[80%] px-3 py-2 rounded-xl text-sm',
                msg.role === 'student'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">思考中...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 结果展示 */}
        {result && (
          <Card className={cn(
            'border-2',
            result === 'correct'
              ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
              : 'border-amber-200 bg-amber-50 dark:bg-amber-950/20'
          )}>
            <CardContent className="p-4 text-center space-y-3">
              {result === 'correct' ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">太棒了！</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">你通过引导式学习成功解决了这道题！</p>
                </>
              ) : (
                <>
                  <div className="flex justify-center gap-4 mb-2">
                    <XCircle className="h-12 w-12 text-amber-500" />
                  </div>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-400">还需要继续努力！</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    正确答案是：<span className="font-bold text-indigo-600">{question.correctAnswer}</span>
                  </p>
                </>
              )}
              {result === 'correct' ? (
                <Button onClick={handleClose} className="w-full bg-green-500 hover:bg-green-600">
                  完成 <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button onClick={handleClose} className="w-full bg-indigo-500 hover:bg-indigo-600">
                    加入错题集，继续 <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 输入区域 */}
        {!result && (
          <div className="space-y-2">
            {showFinalInput ? (
              <div className="space-y-2">
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                  请输入你的最终答案：
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studentInput}
                    onChange={e => setStudentInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder={`输入答案（如：${question.correctAnswer}）`}
                    className="flex-1 px-3 py-2 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900"
                  />
                  <Button onClick={handleSend} disabled={loading || !studentInput.trim()} size="sm">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {guide && (
                  <Card className="border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                    <CardContent className="p-3">
                      <p className="text-sm text-amber-800 dark:text-amber-400 whitespace-pre-wrap">{guide}</p>
                      {hint && (
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">💡 {hint}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={studentInput}
                    onChange={e => setStudentInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="输入你的思考或回答..."
                    rows={2}
                    className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 resize-none"
                  />
                  <Button onClick={handleSend} disabled={loading || !studentInput.trim()} className="self-end">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getDefaultGuide(step: number): string {
  const guides: Record<number, string> = {
    2: '很好！这个知识点需要用到什么公式/定理/方法？\n\n（提示：回忆一下相关的定义和性质）',
    3: '对！现在把这个公式/方法应用到题目中，第一步应该怎么做？\n\n（提示：把已知条件代入公式）',
    4: '很好！那接下来怎么计算？\n\n（提示：仔细计算每一步）',
    5: '现在你再试一次，这道题的答案是什么？',
  };
  return guides[step] || '综合前面的分析再回答一次。';
}
