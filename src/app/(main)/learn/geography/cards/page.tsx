'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Sparkles, FlipHorizontal, Shuffle, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getTopicsByChapter, type KnowledgePoint, type Topic } from '@/lib/geographyDataService';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  keywords: string[];
  trap?: string;
  chapter: string;
}

function generateFlashCards(chapterId: string): FlashCard[] {
  const topics = getTopicsByChapter(chapterId);
  const cards: FlashCard[] = [];

  const chapterNames: Record<string, string> = {
    ch1: '第一章 宇宙中的地球',
    ch2: '第二章 地球上的大气',
  };

  for (const topic of topics) {
    for (const point of topic.points) {
      // 概念卡
      if (point.concept) {
        cards.push({
          id: `${point.id}-concept`,
          front: point.name,
          back: point.concept.substring(0, 200) + (point.concept.length > 200 ? '...' : ''),
          keywords: point.terms?.slice(0, 3) || [],
          chapter: chapterNames[chapterId] || chapterId,
        });
      }

      // 核心数据卡
      if (point.data && point.data.rows.length > 0) {
        const firstRow = point.data.rows[0];
        if (firstRow && firstRow.length >= 2) {
          cards.push({
            id: `${point.id}-data`,
            front: `${point.name} - ${firstRow[0]}`,
            back: firstRow.slice(1).join('\n'),
            keywords: point.terms?.slice(0, 2) || [],
            chapter: chapterNames[chapterId] || chapterId,
          });
        }
      }

      // 因果链卡
      if (point.causality) {
        cards.push({
          id: `${point.id}-causality`,
          front: `${point.name} - 核心因果链`,
          back: point.causality,
          keywords: point.terms?.slice(0, 3) || [],
          chapter: chapterNames[chapterId] || chapterId,
        });
      }
    }
  }

  return cards;
}

interface CardViewProps {
  cards: FlashCard[];
  currentIndex: number;
  setCurrentIndex: (idx: number) => void;
}

function CardView({ cards, currentIndex, setCurrentIndex }: CardViewProps) {
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="text-center">
          <p className="text-slate-500">暂无卡牌数据</p>
        </CardContent>
      </Card>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="space-y-4">
      <Card className={`min-h-[400px] transition-all duration-500 ${flipped ? 'scale-105' : ''}`}>
        <CardContent className="p-8 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-xs">
              {currentIndex + 1} / {cards.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={() => setFlipped(!flipped)} className="gap-2">
              <FlipHorizontal className="h-4 w-4" /> 翻转
            </Button>
          </div>
          
          <div className="flex-1 flex items-center justify-center cursor-pointer" onClick={() => setFlipped(!flipped)}>
            <div className="text-center max-w-lg">
              {!flipped ? (
                <>
                  <p className="text-xs text-slate-400 mb-4">点击翻转查看答案</p>
                  <h3 className="text-xl font-bold text-slate-800 mb-6">{card.front}</h3>
                  <p className="text-sm text-slate-400">提示：{card.keywords?.join(' · ')}</p>
                </>
              ) : (
                <>
                  <p className="text-xs text-emerald-500 mb-4">答案 / 解析</p>
                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap text-left">
                    {card.back}
                  </p>
                  {card.trap && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs text-red-600">
                        <strong>易错提醒：</strong> {card.trap}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {card.keywords && card.keywords.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2 justify-center">
                {card.keywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 导航按钮 */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setCurrentIndex(Math.max(0, currentIndex - 1));
            setFlipped(false);
          }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> 上一张
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1));
            setFlipped(false);
          }}
          disabled={currentIndex === cards.length - 1}
        >
          下一张 <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function CardsHubContent() {
  const [selectedChapter, setSelectedChapter] = useState<string>('ch1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  
  const cards = generateFlashCards(selectedChapter);
  const [displayCards, setDisplayCards] = useState(cards);

  const handleShuffle = () => {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setDisplayCards(shuffledCards);
    setCurrentIndex(0);
    setShuffled(true);
  };

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapter(chapterId);
    setCurrentIndex(0);
    setShuffled(false);
    setDisplayCards(generateFlashCards(chapterId));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/subjects/geography">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> 返回
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                🃏 地理记忆卡牌
              </h1>
              <p className="text-sm text-slate-500">翻转卡片，巩固核心知识</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleShuffle} className="gap-2">
            <Shuffle className="h-4 w-4" /> 随机排序
          </Button>
        </div>

        {/* 章节选择 */}
        <Tabs value={selectedChapter} onValueChange={handleChapterChange}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="ch1" className="gap-2">
              🌌 第一章
            </TabsTrigger>
            <TabsTrigger value="ch2" className="gap-2">
              🌫️ 第二章
            </TabsTrigger>
            <TabsTrigger value="all" disabled className="gap-2">
              第三章（待补充）
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedChapter} className="space-y-4">
            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-600">{cards.length}</div>
                  <div className="text-xs text-muted-foreground">总卡牌数</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{cards.filter(c => c.front.includes('概念')).length}</div>
                  <div className="text-xs text-muted-foreground">概念卡</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600">{cards.filter(c => c.front.includes('因果')).length}</div>
                  <div className="text-xs text-muted-foreground">因果链卡</div>
                </CardContent>
              </Card>
            </div>

            {/* 卡牌浏览区 */}
            <CardView
              cards={displayCards}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
            />

            {/* 学习提示 */}
            <Card className="bg-gradient-to-r from-slate-50 to-blue-50/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <strong className="text-slate-700">学习建议：</strong>
                    先看正面回忆概念，再翻面验证答案。遇到易错点记得截图保存！
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function GeographyCardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <CardsHubContent />
    </Suspense>
  );
}
