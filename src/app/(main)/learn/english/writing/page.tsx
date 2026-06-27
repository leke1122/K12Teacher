'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Brain, PenLine, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { toast } from '@/components/ui/toast';
import { useEnglishProgress } from '@/hooks/useEnglishProgress';
import { updateStepProgress } from '@/lib/englishProgress';

interface WritingTask {
  id: string;
  title: string;
  type: 'application' | 'continuation';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  context: string;
  firstParagraph: string;
  secondParagraph: string;
  requirements: string[];
  rubric: {
    content: number;
    language: number;
    coherence: number;
    creativity: number;
  };
}

const WRITING_TASKS: WritingTask[] = [
  {
    id: 'task-1',
    title: '申请信：夏令营报名',
    type: 'application',
    difficulty: 'easy',
    prompt: '你校英语俱乐部将组织暑期夏令营活动，请你以李华的名义写一封申请信，说明你申请的理由、个人特长以及期望。',
    context: '学校英语俱乐部将在暑期组织英语夏令营，面向全校学生招募营员。活动包括英语演讲、戏剧表演、外教交流等。',
    firstParagraph: 'Dear Sir/Madam,',
    secondParagraph: 'Yours sincerely,\nLi Hua',
    requirements: [
      '词数80-100词',
      '包含申请理由、个人特长、期望',
      '格式正确（书信体）',
      '语言简洁得体',
    ],
    rubric: {
      content: 30,
      language: 30,
      coherence: 20,
      creativity: 20,
    },
  },
  {
    id: 'task-2',
    title: '申请信：环保志愿者',
    type: 'application',
    difficulty: 'medium',
    prompt: '你所在的社区正在招募环保志愿者，请你以李华的名义写一封申请信，说明你的环保理念、相关经历和未来计划。',
    context: '社区环保项目需要志愿者参与垃圾分类宣传、植树造林、河流清理等活动。项目为期三个月。',
    firstParagraph: 'Dear Sir/Madam,',
    secondParagraph: 'Yours sincerely,\nLi Hua',
    requirements: [
      '词数100-120词',
      '体现环保理念和实际行动',
      '包含具体经历或计划',
      '语气诚恳、有说服力',
    ],
    rubric: {
      content: 30,
      language: 30,
      coherence: 20,
      creativity: 20,
    },
  },
  {
    id: 'task-3',
    title: '读后续写：意外的相遇',
    type: 'continuation',
    difficulty: 'hard',
    prompt: '阅读下面短文，根据其情节续写两段，使之构成一个完整的故事。',
    context: `It was a rainy Saturday afternoon when Emma decided to visit her grandmother. She packed her bag and headed to the bus stop. As she was waiting, she noticed an old man sitting alone on the bench, holding a small violin case. He looked lost and worried.

Emma approached him gently. "Excuse me, are you alright?" she asked. The old man looked up, his eyes filled with tears. "I'm looking for the music school," he said in a trembling voice. "My grandson has a concert today, and I don't want to miss it. But I lost my way."`,
    firstParagraph: 'Paragraph 1: Emma decided to help the old man.',
    secondParagraph: 'Paragraph 2: The old man arrived at the concert hall just in time.',
    requirements: [
      '第一段约75词',
      '第二段约75词',
      '情节衔接自然',
      '语言丰富、有描写',
      '结尾积极向上',
    ],
    rubric: {
      content: 30,
      language: 30,
      coherence: 20,
      creativity: 20,
    },
  },
];

function WritingContent() {
  const { settings } = useSettingsStore();
  const { updateStep, markVisited, getStepStatus } = useEnglishProgress('english');
  
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [userWriting, setUserWriting] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState<Record<string, number> | null>(null);
  const [generating, setGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const currentTask = WRITING_TASKS[currentTaskIndex];
  const wordCount = userWriting.trim().split(/\s+/).filter(Boolean).length;
  const progress = ((currentTaskIndex + (submitted ? 1 : 0)) / WRITING_TASKS.length) * 100;

  useEffect(() => {
    markVisited('writing');
  }, [markVisited]);

  const handleSubmit = async () => {
    if (!userWriting.trim() || wordCount < 20) {
      toast('请至少写20个单词', 'error');
      return;
    }

    setGenerating(true);
    setSubmitted(true);

    try {
      const baseUrl = settings.apiProvider === 'deepseek' 
        ? 'https://api.deepseek.com/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

      const systemPrompt = `你是高中英语写作批改老师，专门批改辽宁高考英语作文。

评分标准（满分100分）：
1. 内容完整性（30%）：是否覆盖所有要点，内容是否充实
2. 语言准确性（30%）：语法、词汇、拼写是否正确
3. 连贯衔接（20%）：段落间、句子间衔接是否自然
4. 创新性（20%）：语言是否有亮点，表达是否新颖

请按以下格式给出反馈：
1. 总体评分（满分100）和分项得分
2. 亮点指出
3. 改进建议（语法、词汇、结构）
4. 参考范文（100-150词）

语言：中文`;

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.deepseekKey}`,
        },
        body: JSON.stringify({
          model: settings.apiProvider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `请批改以下作文：

题目：${currentTask.prompt}
${currentTask.type === 'continuation' ? `\n原文：\n${currentTask.context}` : ''}

学生作文：
${userWriting}

请给出详细批改。` },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) throw new Error('API调用失败');

      const data = await response.json();
      const aiFeedback = data.choices[0]?.message?.content || '';

      setFeedback(aiFeedback);
      setCompletedTasks(prev => [...prev, currentTask.id]);
      updateStep('writing', 'in_progress');
      toast('批改完成！', 'success');
    } catch {
      toast('批改失败，请重试', 'error');
      setSubmitted(false);
    } finally {
      setGenerating(false);
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex < WRITING_TASKS.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setUserWriting('');
      setFeedback('');
      setScore(null);
      setSubmitted(false);
    } else {
      updateStep('writing', 'completed');
      toast('写作训练完成！', 'success');
    }
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
      setUserWriting('');
      setFeedback('');
      setScore(null);
      setSubmitted(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 返回按钮 */}
      <Button variant="ghost" onClick={() => window.history.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        返回英语学习中心
      </Button>

      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            ✍️ 写作训练
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            第 {currentTaskIndex + 1} 题 / 共 {WRITING_TASKS.length} 题
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={currentTask.type === 'application' ? 'default' : 'secondary'}>
            {currentTask.type === 'application' ? '应用文' : '读后续写'}
          </Badge>
          <Badge variant="outline">
            {currentTask.difficulty === 'easy' ? '简单' : currentTask.difficulty === 'medium' ? '中等' : '困难'}
          </Badge>
        </div>
      </div>

      {/* 进度条 */}
      <Progress value={progress} className="h-2" />

      {/* 题目卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>{currentTask.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">📝 题目要求</h4>
            <p className="text-slate-700 dark:text-slate-200">{currentTask.prompt}</p>
          </div>

          {currentTask.type === 'continuation' && (
            <div>
              <h4 className="font-semibold text-sm mb-2">📖 原文梗概</h4>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-sm text-slate-600 leading-relaxed">
                {currentTask.context}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">✏️ 第一段开头</h4>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-sm font-mono">
                {currentTask.firstParagraph}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">🏁 第二段开头</h4>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-sm font-mono">
                {currentTask.secondParagraph}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-2">✅ 写作要求</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
              {currentTask.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 写作区域 */}
      <Card className={submitted ? 'border-green-200' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-pink-500" />
              你的作文
            </span>
            <Badge variant="outline" className="text-xs">
              {wordCount} 词
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={userWriting}
            onChange={(e) => setUserWriting(e.target.value)}
            placeholder="在这里写下你的作文..."
            className="w-full h-48 p-4 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm leading-relaxed"
            disabled={submitted}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!userWriting.trim() || wordCount < 20 || submitted}
              className="flex-1"
            >
              {submitted ? '已提交' : '提交批改'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI批改结果 */}
      {submitted && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              AI批改结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generating ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <span className="ml-2 text-muted-foreground">正在批改中...</span>
              </div>
            ) : feedback ? (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {feedback}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* 导航 */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePreviousTask}
          disabled={currentTaskIndex === 0}
        >
          ← 上一题
        </Button>
        <Button
          onClick={handleNextTask}
        >
          {currentTaskIndex < WRITING_TASKS.length - 1 ? '下一题 →' : '完成训练'}
        </Button>
      </div>
    </div>
  );
}

export default function EnglishWritingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      }
    >
      <WritingContent />
    </Suspense>
  );
}
