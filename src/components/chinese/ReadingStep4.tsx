'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Send, Sparkles, Loader2, CheckCircle2, Lightbulb } from 'lucide-react';
import { ReadingProgress } from '@/lib/chineseReadingProgress';
import { useSettingsStore } from '@/stores/settingsStore';

interface WritingFeedback {
  wordCount: number;
  charCount: number;
  structure: { score: number; comment: string };
  content: { score: number; comment: string };
  language: { score: number; comment: string };
  highlights: string[];
  suggestions: string[];
  overall: string;
}

interface Step4Props {
  text: string;
  chapterTitle: string;
  chapterId?: string;
  progress: ReadingProgress | null;
  onComplete: (data: { writingContent: string; writingFeedback: string }) => void;
}

// 写作任务示例
const WRITING_TASKS = [
  {
    id: 'argument',
    title: '论证模仿',
    description: '模仿本文的论证方式，写一段关于指定主题的论述',
    examples: ['坚持', '勤奋', '感恩', '责任'],
  },
  {
    id: 'perspective',
    title: '视角转换',
    description: '假如你是文中的主人公/作者，你会怎么做？',
    examples: ['写一篇短文', '续写故事', '书信对话'],
  },
  {
    id: 'reflection',
    title: '读后感',
    description: '读完这篇课文后，你有什么感悟？',
    examples: ['联系生活', '人物评价', '主题思考'],
  },
];

export function ReadingStep4({ text, chapterTitle, progress, onComplete }: Step4Props) {
  const { settings } = useSettingsStore();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [writingContent, setWritingContent] = useState(progress?.writingContent || '');
  const [feedback, setFeedback] = useState<WritingFeedback | null>(progress?.writingFeedback ? JSON.parse(progress.writingFeedback) : null);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(!!feedback);

  const handleSelectTask = (taskId: string) => {
    setSelectedTask(taskId);
    setFeedback(null);
    setShowFeedback(false);
  };

  const handleSubmit = async () => {
    if (!writingContent.trim() || !settings?.deepseekKey) return;

    setLoading(true);

    try {
      const task = WRITING_TASKS.find(t => t.id === selectedTask);
      const response = await fetch('/api/chinese/reading/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: task?.description || '基于课文的写作练习',
          content: writingContent,
          apiKey: settings.deepseekKey,
        }),
      });

      const data = await response.json();

      if (data.success && data.feedback) {
        setFeedback(data.feedback);
        setShowFeedback(true);
      } else {
        alert(data.error || '提交失败');
      }
    } catch (error) {
      alert('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete({
      writingContent,
      writingFeedback: feedback ? JSON.stringify(feedback) : '',
    });
  };

  const wordCount = writingContent.replace(/\s/g, '').length;

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">✍️ {chapterTitle} - 迁移输出</h3>

      {/* 任务选择 */}
      {!selectedTask && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {WRITING_TASKS.map(task => (
            <Card
              key={task.id}
              className="cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
              onClick={() => handleSelectTask(task.id)}
            >
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">{task.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                <div className="flex flex-wrap gap-1">
                  {task.examples.map((example, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{example}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 写作区域 */}
      {selectedTask && (
        <Card className="flex-1">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Badge variant="outline" className="mb-2">
                  {WRITING_TASKS.find(t => t.id === selectedTask)?.title}
                </Badge>
                <h4 className="font-semibold">
                  {WRITING_TASKS.find(t => t.id === selectedTask)?.description}
                </h4>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedTask(null)}>
                更换任务
              </Button>
            </div>

            <Textarea
              value={writingContent}
              onChange={(e) => setWritingContent(e.target.value)}
              placeholder="在这里开始你的写作..."
              className="flex-1 min-h-[300px] font-serif text-lg leading-relaxed"
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-slate-500">
                已写 {wordCount} 字
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!writingContent.trim() || loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {loading ? '提交中...' : '提交获取反馈'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI反馈 */}
      {showFeedback && feedback && (
        <Card className="mt-4 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-emerald-500" />
              <h4 className="font-semibold text-emerald-700 dark:text-emerald-400">AI 点评</h4>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{feedback.structure.score}</div>
                <div className="text-xs text-slate-500">结构</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">{feedback.content.score}</div>
                <div className="text-xs text-slate-500">内容</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{feedback.language.score}</div>
                <div className="text-xs text-slate-500">语言</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h5 className="text-sm font-medium mb-1">✨ 亮点</h5>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {feedback.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-1">💡 改进建议</h5>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {feedback.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-500 font-medium">{i + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <h5 className="text-sm font-medium mb-1">📝 综合评价</h5>
                <p className="text-sm text-slate-700 dark:text-slate-300">{feedback.overall}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 完成按钮 */}
      {selectedTask && (
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleComplete}
            className="gap-2 bg-indigo-500 hover:bg-indigo-600"
          >
            <Sparkles className="h-4 w-4" />
            完成迁移输出，进入反思对话
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
