'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Word, TabType, PracticeMode, PracticeScope, PracticeStats } from '@/data/words/types';
import { loadWords, saveWords, resetProgress, importWords, exportWords } from '@/data/words/storage';
import { WordCard } from '@/components/words/WordCard';
import { PracticeCard } from '@/components/words/PracticeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, RefreshCw, BookOpen, CheckCircle, Circle, TrendingUp } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export default function WordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'overwrite' | 'append'>('overwrite');
  const [showImport, setShowImport] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('chinese-to-english');
  const [practiceScope, setPracticeScope] = useState<PracticeScope>('unmastered');

  // Load words on mount
  useEffect(() => {
    const loaded = loadWords();
    setWords(loaded);
  }, []);

  // Save words when changed
  useEffect(() => {
    if (words.length > 0 || loadWords().length > 0) {
      saveWords(words);
    }
  }, [words]);

  const totalWords = words.length;
  const masteredCount = words.filter(w => w.mastered).length;
  const learningCount = totalWords - masteredCount;
  const progress = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  // Learning state
  const [learnIndex, setLearnIndex] = useState(0);
  const unmasteredWords = useMemo(() => words.filter(w => !w.mastered), [words]);

  useEffect(() => {
    if (unmasteredWords.length > 0 && learnIndex >= unmasteredWords.length) {
      setLearnIndex(unmasteredWords.length - 1);
    }
  }, [unmasteredWords.length, learnIndex]);

  const handleMastered = () => {
    setWords(prev => {
      const updated = [...prev];
      const word = unmasteredWords[learnIndex];
      if (word) {
        const idx = updated.findIndex(w => w.word === word.word);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], mastered: true };
        }
      }
      return updated;
    });
    // Move to next unmastered
    if (learnIndex < unmasteredWords.length - 1) {
      setLearnIndex(prev => prev + 1);
    } else if (learnIndex >= 0) {
      // All mastered
      setLearnIndex(0);
    }
  };

  const handleNext = () => {
    if (learnIndex < unmasteredWords.length - 1) {
      setLearnIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (learnIndex > 0) {
      setLearnIndex(prev => prev - 1);
    }
  };

  const handleImport = () => {
    try {
      const result = importWords(importText, importMode === 'overwrite');
      setWords(result.words);
      setImportText('');
      setShowImport(false);
      toast(`成功${result.action === 'imported' ? '导入' : '追加'} ${result.words.length} 个单词`, 'success');
    } catch (e) {
      toast('导入失败：' + (e instanceof Error ? e.message : '未知错误'), 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
      setShowImport(true);
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('确定要重置所有学习进度吗？所有单词将标记为未掌握。')) {
      const reset = resetProgress(words);
      setWords(reset);
      toast('学习进度已重置', 'success');
    }
  };

  const handleExport = () => {
    exportWords(words);
    toast('词库已导出', 'success');
  };

  const handlePracticeComplete = (stats: PracticeStats) => {
    toast(`练习完成！正确率：${stats.correct + stats.wrong > 0 ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) : 0}%`, 'success');
  };

  const currentLearnWord = unmasteredWords[learnIndex] || null;
  const allMastered = unmasteredWords.length === 0 && totalWords > 0;

  if (totalWords === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold mb-2">英语单词学习</h1>
          <p className="text-muted-foreground mb-6">
            请先导入词库，开始你的单词学习之旅
          </p>
          <Button onClick={() => setShowImport(true)} size="lg">
            <Upload className="h-4 w-4 mr-2" />
            前往设置导入词库
          </Button>
        </div>

        {showImport && (
          <Card>
            <CardHeader>
              <CardTitle>导入词库</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  粘贴 JSON 词库
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='[{"word": "hello", "phonetic": "/həˈloʊ/", "meaning": "你好", ...}]'
                  className="w-full h-40 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  或上传 JSON 文件
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-muted-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="overwrite"
                  checked={importMode === 'overwrite'}
                  onChange={(e) => setImportMode(e.target.checked ? 'overwrite' : 'append')}
                  className="rounded"
                />
                <label htmlFor="overwrite" className="text-sm">
                  覆盖词库并重置进度（取消则追加新词）
                </label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleImport} disabled={!importText.trim()}>
                  导入词库
                </Button>
                <Button variant="outline" onClick={() => setShowImport(false)}>
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            英语单词学习
          </h1>
          <p className="text-muted-foreground text-sm">
            共 {totalWords} 个单词 · 已掌握 {masteredCount} 个
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home">首页</TabsTrigger>
          <TabsTrigger value="learn">学习</TabsTrigger>
          <TabsTrigger value="practice">练习</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        {/* 首页 */}
        <TabsContent value="home" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{totalWords}</div>
                <div className="text-xs text-muted-foreground">总单词数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{masteredCount}</div>
                <div className="text-xs text-muted-foreground">已掌握</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-amber-600">{learningCount}</div>
                <div className="text-xs text-muted-foreground">学习中</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{progress}%</div>
                <div className="text-xs text-muted-foreground">学习进度</div>
              </CardContent>
            </Card>
          </div>

          {/* 进度条 */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>总体进度</span>
                  <span>{masteredCount} / {totalWords}</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {allMastered ? (
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                  太棒了！你已经掌握了所有单词！
                </h3>
                <p className="text-green-600 dark:text-green-400">
                  继续保持，复习巩固哦~
                </p>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={() => setActiveTab('learn')}
              size="lg"
              className="w-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              开始学习
            </Button>
          )}
        </TabsContent>

        {/* 学习页 */}
        <TabsContent value="learn">
          {allMastered ? (
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                  恭喜！全部掌握！
                </h3>
                <p className="text-green-600 dark:text-green-400 mb-4">
                  你已经完成了所有单词的学习
                </p>
                <Button onClick={() => setActiveTab('practice')} variant="outline">
                  去练习巩固
                </Button>
              </CardContent>
            </Card>
          ) : currentLearnWord ? (
            <WordCard
              word={currentLearnWord}
              currentIndex={learnIndex}
              totalWords={unmasteredWords.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onMastered={handleMastered}
              hasPrevious={learnIndex > 0}
              hasNext={learnIndex < unmasteredWords.length - 1}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无未掌握单词
            </div>
          )}
        </TabsContent>

        {/* 练习页 */}
        <TabsContent value="practice" className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">模式：</label>
              <select
                value={practiceMode}
                onChange={(e) => setPracticeMode(e.target.value as PracticeMode)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="chinese-to-english">中文 → 英文</option>
                <option value="pronunciation-to-english">发音 → 英文</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">范围：</label>
              <select
                value={practiceScope}
                onChange={(e) => setPracticeScope(e.target.value as PracticeScope)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="unmastered">仅未掌握</option>
                <option value="all">全部单词</option>
              </select>
            </div>
          </div>

          <PracticeCard
            words={words}
            mode={practiceMode}
            scope={practiceScope}
            onComplete={handlePracticeComplete}
          />
        </TabsContent>

        {/* 设置页 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>词库管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  导入词库（JSON 数组）
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='[{"word": "hello", "phonetic": "/həˈloʊ/", "meaning": "你好", "collocations": "say hello", "example": "Hello, how are you? 你好吗？", "synonyms": "hi", "antonyms": "", "mastered": false}]'
                  className="w-full h-40 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  或上传 JSON 文件
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-muted-foreground"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="overwrite-settings"
                  checked={importMode === 'overwrite'}
                  onChange={(e) => setImportMode(e.target.checked ? 'overwrite' : 'append')}
                  className="rounded"
                />
                <label htmlFor="overwrite-settings" className="text-sm">
                  覆盖词库并重置进度（取消则追加新词）
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleImport} disabled={!importText.trim()}>
                  <Upload className="h-4 w-4 mr-2" />
                  导入词库
                </Button>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  导出词库
                </Button>
                <Button variant="destructive" onClick={handleReset} disabled={totalWords === 0}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重置进度
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>当前词库信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">总单词数：</span>
                  <span className="font-medium">{totalWords}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">已掌握：</span>
                  <span className="font-medium">{masteredCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">学习中：</span>
                  <span className="font-medium">{learningCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">完成率：</span>
                  <span className="font-medium">{progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
