'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Lightbulb, AlertTriangle, ChevronRight, Star, Target, BookMarked } from 'lucide-react';
import type { GrammarPoint } from '@/types/grammar';

interface GrammarDetailProps {
  point: GrammarPoint;
  onAddToWordBook?: (words: string[]) => void;
  onPractice?: () => void;
  onTutor?: () => void;
  onMarkMastered?: () => void;
  mastered?: boolean;
}

const DIFFICULTY_COLOR = ['', 'text-green-600', 'text-lime-600', 'text-yellow-600', 'text-orange-600', 'text-red-600'];
const DIFFICULTY_BG = ['', 'bg-green-50', 'bg-lime-50', 'bg-yellow-50', 'bg-orange-50', 'bg-red-50'];
const FREQ_LABEL = ['', '低频', '较低', '中等', '较高', '高频'];

export function GrammarDetail({ point, onAddToWordBook, onPractice, onTutor, onMarkMastered, mastered }: GrammarDetailProps) {
  const [activeTab, setActiveTab] = useState('structure');
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());

  const allKeywords = point.examples.flatMap(e => e.keyWords);

  const toggleWord = (word: string) => {
    setSelectedWords(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const handleAddSelected = () => {
    if (onAddToWordBook && selectedWords.size > 0) {
      onAddToWordBook(Array.from(selectedWords));
      setSelectedWords(new Set());
    }
  };

  return (
    <div className="space-y-4">
      {/* 头部信息 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-mono bg-blue-100 text-blue-700">
                  {point.id}
                </Badge>
                <Badge variant="outline" className="text-xs">{point.category}</Badge>
                <Badge
                  className={`text-xs ${DIFFICULTY_BG[point.difficulty]} ${DIFFICULTY_COLOR[point.difficulty]}`}
                >
                  {Array.from({ length: point.difficulty }).map((_, i) => '⭐').join('')}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">{point.name}</h2>
              <p className="text-sm text-muted-foreground">{point.stageName}</p>
              {point.textbookRef && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {point.textbookRef}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {onTutor && (
                <Button size="sm" className="gap-1" onClick={onTutor}>
                  💬 AI讲解
                </Button>
              )}
              {onPractice && (
                <Button size="sm" variant="outline" className="gap-1" onClick={onPractice}>
                  📝 练习
                </Button>
              )}
              {onMarkMastered && (
                <Button
                  size="sm"
                  variant={mastered ? 'default' : 'outline'}
                  className="gap-1"
                  onClick={onMarkMastered}
                >
                  {mastered ? '✅ 已掌握' : '✓ 标记掌握'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="structure" className="text-xs">📐 结构</TabsTrigger>
          <TabsTrigger value="explanation" className="text-xs">📖 讲解</TabsTrigger>
          <TabsTrigger value="examples" className="text-xs">📝 例句</TabsTrigger>
          <TabsTrigger value="exam" className="text-xs">🎯 考点</TabsTrigger>
          <TabsTrigger value="mistakes" className="text-xs">⚠️ 易错</TabsTrigger>
        </TabsList>

        {/* 结构公式 */}
        <TabsContent value="structure" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span>📐</span> 结构公式
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm leading-relaxed">
                {point.structure.formula}
              </div>
              <div className="mt-3 space-y-1">
                {point.structure.components.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ChevronRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{c}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 固定搭配 */}
          {point.fixedCombinations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>🔗</span> 固定搭配
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {point.fixedCombinations.map((fc, i) => (
                  <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <div className="font-mono text-sm text-amber-800 mb-1">{fc.pattern}</div>
                    <div className="text-xs text-amber-600 mb-1">{fc.meaning}</div>
                    <div className="text-xs text-slate-500 italic">{fc.example}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 讲解 */}
        <TabsContent value="explanation" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                一句话解释
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-slate-700 leading-relaxed">{point.explanation.simple}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">📖 详细讲解</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{point.explanation.detailed}</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span>🏠</span> 生活类比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700 leading-relaxed italic">{point.explanation.analogy}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 例句 */}
        <TabsContent value="examples" className="space-y-3">
          {point.examples.map((ex, i) => (
            <Card key={i} className="border-blue-100">
              <CardContent className="p-4">
                <div className="mb-2">
                  <p className="text-base text-slate-800 leading-relaxed font-medium">{ex.sentence}</p>
                  <p className="text-sm text-blue-600 mt-1">{ex.translation}</p>
                </div>
                <div className="bg-slate-50 rounded p-2 mb-2">
                  <span className="text-xs font-medium text-slate-500">语法结构：</span>
                  <span className="text-xs text-slate-600 ml-1">{ex.grammarHighlight}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ex.keyWords.map((word, wi) => (
                    <Badge
                      key={wi}
                      variant={selectedWords.has(word) ? 'default' : 'secondary'}
                      className="text-xs cursor-pointer hover:bg-blue-100"
                      onClick={() => toggleWord(word)}
                    >
                      {selectedWords.has(word) ? '✓ ' : ''}{word}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {selectedWords.size > 0 && onAddToWordBook && (
            <div className="sticky bottom-4 bg-white border rounded-lg shadow-lg p-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">
                已选 {selectedWords.size} 个单词
              </span>
              <Button size="sm" className="gap-1" onClick={handleAddSelected}>
                <BookMarked className="h-4 w-4" />
                加入单词本
              </Button>
            </div>
          )}
        </TabsContent>

        {/* 考点 */}
        <TabsContent value="exam" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-red-500" />
                常见高考考点
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {point.examPoints.map((ep, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">{ep.point}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">{ep.example}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs flex-shrink-0 ${
                        ep.frequency >= 4
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : ep.frequency >= 3
                          ? 'bg-orange-50 text-orange-600 border-orange-200'
                          : 'bg-slate-50 text-slate-500'
                      }`}
                    >
                      {FREQ_LABEL[ep.frequency]}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {point.examType.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">📋 高考考查形式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {point.examType.map((t, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 易错点 */}
        <TabsContent value="mistakes" className="space-y-3">
          {point.commonMistakes.length > 0 ? (
            point.commonMistakes.map((cm, i) => (
              <Card key={i} className="border-red-100 bg-red-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-red-600 flex-shrink-0">✗ 错误：</span>
                        <span className="text-sm text-slate-700 font-mono bg-red-100 px-2 py-0.5 rounded">
                          {cm.mistake}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-green-600 flex-shrink-0">✓ 正确：</span>
                        <span className="text-sm text-slate-700 font-mono bg-green-100 px-2 py-0.5 rounded">
                          {cm.correct}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-blue-600 flex-shrink-0">💡 原因：</span>
                        <span className="text-sm text-slate-600">{cm.reason}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                暂无易错点记录
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
