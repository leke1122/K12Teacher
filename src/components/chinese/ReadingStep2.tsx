'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, ChevronRight, ArrowRight, MessageCircle, 
  BookOpen, Loader2, Trash2, Sparkles, PanelRightClose, PanelRightOpen
} from 'lucide-react';
import { ReadingProgress, WordNote } from '@/lib/chineseReadingProgress';
import { WordPopup } from './WordPopup';
import { useSettingsStore } from '@/stores/settingsStore';

interface Step2Props {
  text: string;
  chapterTitle: string;
  chapterId: string;
  progress: ReadingProgress | null;
  onComplete: (data: { notes: WordNote[] }) => void;
}

export function ReadingStep2({ text, chapterTitle, chapterId, progress, onComplete }: Step2Props) {
  const { settings } = useSettingsStore();
  const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
  const [currentPage, setCurrentPage] = useState(0);
  const [notes, setNotes] = useState<WordNote[]>(progress?.notes || []);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedWord, setSelectedWord] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showWordPopup, setShowWordPopup] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < paragraphs.length - 1;

  // 处理文本选择
  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    
    if (selectedText && selectedText.length > 0 && selectedText.length < 20) {
      // 获取选中词周围的上下文
      const range = selection?.getRangeAt(0);
      const container = range?.commonAncestorContainer;
      const parentText = container?.textContent || '';
      
      setSelectedWord(selectedText);
      setSelectedContext(parentText.slice(0, 100));
      setShowWordPopup(true);
    }
  }, []);

  // 保存笔记
  const handleSaveNote = (note: WordNote) => {
    setNotes(prev => [...prev, note]);
    setShowWordPopup(false);
  };

  // 删除笔记
  const handleDeleteNote = (index: number) => {
    setNotes(prev => prev.filter((_, i) => i !== index));
  };

  // AI问答
  const handleAIQuestion = async () => {
    if (!aiQuestion.trim() || !settings?.deepseekKey) return;
    
    setAiLoading(true);
    setAiAnswer('');
    
    try {
      const response = await fetch('/api/chinese/reading/word-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: aiQuestion,
          context: paragraphs[currentPage],
          apiKey: settings.deepseekKey,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.explanation) {
        const exp = data.explanation;
        setAiAnswer(
          `【${exp.word}】\n` +
          `拼音：${exp.pinyin}\n` +
          `词性：${exp.partOfSpeech}\n` +
          `古义：${exp.ancientMeaning}\n` +
          `今义：${exp.modernMeaning}\n` +
          `例句：${exp.examples?.map((e: { text: string; source: string }) => `${e.text}（${e.source}）`).join('\n') || '无'}\n` +
          `特殊用法：${exp.specialUsage}`
        );
      } else {
        setAiAnswer(data.error || '抱歉，我无法回答这个问题。');
      }
    } catch {
      setAiAnswer('抱歉，发生了错误，请稍后再试。');
    } finally {
      setAiLoading(false);
    }
  };

  // 完成第二步
  const handleComplete = () => {
    onComplete({ notes });
  };

  return (
    <div className="flex h-full gap-4">
      {/* 左侧课文区域 */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              {chapterTitle} - 第 {currentPage + 1} 段
            </h3>
            
            {/* 可选择的课文内容 */}
            <div 
              ref={textRef}
              className="prose prose-slate dark:prose-invert max-w-none cursor-text select-text"
              onMouseUp={handleTextSelect}
            >
              <div 
                className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-serif p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                style={{ userSelect: 'text' }}
              >
                {paragraphs[currentPage] || text}
              </div>
            </div>

            <p className="text-sm text-slate-500 mt-4 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">💡 提示</Badge>
              选中文本查看词语解释，或在下方向AI提问
            </p>

            {/* AI问答区域 */}
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-blue-500" />
                问问AI
              </h4>
              <div className="flex gap-2 mb-3">
                <Textarea
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="例如：这段话用了什么修辞手法？为什么作者这样写？"
                  className="min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAIQuestion();
                    }
                  }}
                />
                <Button 
                  onClick={handleAIQuestion}
                  disabled={!aiQuestion.trim() || aiLoading}
                  className="self-end"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '提问'}
                </Button>
              </div>
              
              {aiAnswer && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-sm whitespace-pre-wrap">{aiAnswer}</p>
                </div>
              )}
            </div>

            {/* 页码导航 */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={!canGoPrev}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                上一段
              </Button>

              <div className="flex items-center gap-2">
                {paragraphs.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentPage
                        ? 'bg-indigo-500'
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!canGoNext}
                className="gap-1"
              >
                下一段
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 完成按钮 */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleComplete}
            className="gap-2 bg-indigo-500 hover:bg-indigo-600"
          >
            <Sparkles className="h-4 w-4" />
            完成探索，进入结构梳理
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 右侧笔记栏 */}
      {showSidebar && (
        <Card className="w-80 flex flex-col">
          <CardContent className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-500" />
                我的笔记
                <Badge variant="secondary" className="ml-1">{notes.length}</Badge>
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">
                  还没有笔记<br />
                  <span className="text-xs">选中文本或向AI提问来添加</span>
                </p>
              ) : (
                notes.map((note, idx) => (
                  <div 
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 relative group"
                  >
                    <button
                      onClick={() => handleDeleteNote(idx)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="font-medium text-indigo-600 dark:text-indigo-400">
                      {note.word}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {note.explanation.slice(0, 100)}
                      {note.explanation.length > 100 ? '...' : ''}
                    </p>
                    <div className="text-xs text-slate-400 mt-2">
                      第 {note.paragraph + 1} 段 · {new Date(note.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 隐藏侧边栏按钮 */}
      {!showSidebar && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSidebar(true)}
          className="self-start"
        >
          <PanelRightOpen className="h-4 w-4 mr-1" />
          笔记
        </Button>
      )}

      {/* 查词弹窗 */}
      {showWordPopup && (
        <WordPopup
          word={selectedWord}
          context={selectedContext}
          paragraphIndex={currentPage}
          onSave={handleSaveNote}
          onClose={() => setShowWordPopup(false)}
        />
      )}
    </div>
  );
}
