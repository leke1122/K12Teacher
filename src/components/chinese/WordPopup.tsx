'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader2, BookOpen, Save } from 'lucide-react';
import { WordNote } from '@/lib/chineseReadingProgress';
import { useSettingsStore } from '@/stores/settingsStore';

interface WordPopupProps {
  word: string;
  context: string;
  paragraphIndex: number;
  onSave: (note: WordNote) => void;
  onClose: () => void;
}

export function WordPopup({ word, context, paragraphIndex, onSave, onClose }: WordPopupProps) {
  const { settings } = useSettingsStore();
  const [explanation, setExplanation] = useState<{
    pinyin?: string;
    partOfSpeech?: string;
    ancientMeaning?: string;
    modernMeaning?: string;
    examples?: Array<{ text: string; source: string }>;
    specialUsage?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customNote, setCustomNote] = useState('');

  // 加载词语解释
  const fetchExplanation = async () => {
    if (!settings?.deepseekKey) {
      setError('请先配置 API Key');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chinese/reading/word-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          context,
          apiKey: settings.deepseekKey,
        }),
      });

      const data = await response.json();

      if (data.success && data.explanation) {
        setExplanation(data.explanation);
        setCustomNote(
          `${word}：${data.explanation.ancientMeaning || ''}`.trim()
        );
      } else {
        setError(data.error || '未找到解释');
      }
    } catch (err) {
      setError('获取解释失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化时自动获取解释
  useEffect(() => {
    fetchExplanation();
  }, [word, context]);

  const handleSave = () => {
    const note: WordNote = {
      word,
      explanation: customNote || explanation?.ancientMeaning || word,
      paragraph: paragraphIndex,
      timestamp: new Date().toISOString(),
    };
    onSave(note);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-lg mx-4 shadow-2xl">
        <CardContent className="p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-semibold">{word}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 内容 */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mr-2" />
              <span className="text-muted-foreground">正在查询...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchExplanation}>
                重试
              </Button>
            </div>
          ) : explanation ? (
            <div className="space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500">拼音</span>
                  <p className="font-medium">{explanation.pinyin || '-'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">词性</span>
                  <p className="font-medium">{explanation.partOfSpeech || '-'}</p>
                </div>
              </div>

              {/* 古义 */}
              <div>
                <span className="text-xs text-slate-500">古义</span>
                <p className="text-slate-800 dark:text-slate-200">
                  {explanation.ancientMeaning || '-'}
                </p>
              </div>

              {/* 今义 */}
              {explanation.modernMeaning && (
                <div>
                  <span className="text-xs text-slate-500">今义</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {explanation.modernMeaning}
                  </p>
                </div>
              )}

              {/* 例句 */}
              {explanation.examples && explanation.examples.length > 0 && (
                <div>
                  <span className="text-xs text-slate-500">例句</span>
                  <div className="space-y-1 mt-1">
                    {explanation.examples.map((ex, idx) => (
                      <p key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                        "{ex.text}"
                        <span className="text-slate-400 ml-2">—— {ex.source}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 特殊用法 */}
              {explanation.specialUsage && explanation.specialUsage !== '无' && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                  <span className="text-xs text-amber-600 dark:text-amber-400">特殊用法</span>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    {explanation.specialUsage}
                  </p>
                </div>
              )}

              {/* 自定义笔记 */}
              <div>
                <span className="text-xs text-slate-500">添加到笔记</span>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full mt-1 p-2 text-sm border rounded-lg bg-white dark:bg-slate-800 resize-none"
                  rows={2}
                  placeholder="编辑笔记内容..."
                />
              </div>
            </div>
          ) : null}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              保存到笔记
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
