'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  MessageCircle,
  ChevronRight,
  CheckCircle,
  Lightbulb,
  FileQuestion,
  Loader2,
  Star,
  Target,
  Brain,
  Send,
} from 'lucide-react';

interface MustKnowItem {
  id: string;
  chapterId: string;
  chapterTitle: string;
  title: string;
  content: string;
  explanation: string;
  gaokaoPoints: string[];
  relatedQuestions: {
    year: string;
    question: string;
    answer: string;
  }[];
  importance: 1 | 2 | 3 | 4 | 5;
}

interface PoliticsMustKnowListProps {
  chapterId?: string;
  chapterTitle?: string;
}

export function PoliticsMustKnowList({ chapterId, chapterTitle }: PoliticsMustKnowListProps) {
  const [items, setItems] = useState<MustKnowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MustKnowItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [filterImportance, setFilterImportance] = useState<number | null>(null);

  // 加载必背知识
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const url = chapterId
          ? `/api/politics/must-know?chapterId=${encodeURIComponent(chapterId)}`
          : '/api/politics/must-know';
        const response = await fetch(url);
        const data = await response.json();
        if (data.success && data.data?.items) {
          setItems(data.data.items);
        }
      } catch (error) {
        console.error('加载必背知识失败:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [chapterId]);

  // 获取讲解
  const getExplanation = async (item: MustKnowItem, question?: string) => {
    setSelectedItem(item);
    setDetailOpen(true);
    setExplanationLoading(true);
    setExplanation('');
    setChatAnswer('');

    try {
      const apiKey = localStorage.getItem('edumind-deepseek-key') || '';

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch('/api/politics/must-know', {
        method: 'POST',
        headers,
        body: JSON.stringify({ itemId: item.id, question }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setExplanation(data.data.explanation);
      }
    } catch (error) {
      console.error('获取讲解失败:', error);
      setExplanation(item.explanation);
    } finally {
      setExplanationLoading(false);
    }
  };

  // 发送聊天问题
  const sendChatQuestion = async () => {
    if (!chatQuestion.trim() || !selectedItem) return;

    setChatLoading(true);
    try {
      const apiKey = localStorage.getItem('edumind-deepseek-key') || '';

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch('/api/politics/qa', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: `关于"${selectedItem.title}"：${chatQuestion}`,
          context: `政治必背知识：${selectedItem.content}`
        }),
      });

      const data = await response.json();
      if (data.success) {
        setChatAnswer(data.data.answer);
      } else {
        setChatAnswer('抱歉，AI 服务暂时不可用。请检查是否已配置 DeepSeek API Key。');
      }
    } catch (error) {
      console.error('发送问题失败:', error);
      setChatAnswer('网络错误，请稍后重试。');
    } finally {
      setChatLoading(false);
    }
  };

  // 筛选必背知识
  const filteredItems = filterImportance
    ? items.filter(item => item.importance === filterImportance)
    : items;

  // 高频考点统计
  const highPriorityItems = items.filter(i => i.importance >= 4);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-pink-500" />
          <span className="text-muted-foreground">正在加载必背知识...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 顶部标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-pink-500" />
          <h2 className="text-lg font-bold">必背知识清单</h2>
          <Badge variant="outline" className="ml-2">
            {items.length} 条
          </Badge>
          {highPriorityItems.length > 0 && (
            <Badge className="bg-red-100 text-red-700 ml-1">
              {highPriorityItems.length} 条高频考点
            </Badge>
          )}
        </div>
      </div>

      {/* 重要性筛选 */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground mr-2">筛选难度：</span>
        <Button
          size="sm"
          variant={filterImportance === null ? 'default' : 'outline'}
          className="h-7 text-xs"
          onClick={() => setFilterImportance(null)}
        >
          全部
        </Button>
        {[5, 4, 3].map(level => (
          <Button
            key={level}
            size="sm"
            variant={filterImportance === level ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => setFilterImportance(level as 3 | 4 | 5)}
          >
            {level >= 4 ? (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {level === 5 ? '必背' : '重要'}
              </span>
            ) : (
              '一般'
            )}
          </Button>
        ))}
      </div>

      {/* 列表 */}
      {filteredItems.length === 0 ? (
        <Card className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <p className="text-muted-foreground">暂无符合条件的必背知识</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                item.importance >= 4 ? 'border-l-4 border-l-red-400' : ''
              }`}
              onClick={() => getExplanation(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {item.importance >= 5 && (
                        <Badge className="bg-red-500 text-white text-xs">必背</Badge>
                      )}
                      {item.importance === 4 && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">重要</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {item.chapterTitle}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.content}
                    </p>
                    {item.gaokaoPoints.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <GraduationCap className="h-3 w-3 text-indigo-500" />
                        <span className="text-xs text-indigo-600">
                          高考关联：{item.gaokaoPoints.slice(0, 2).join('、')}
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 详情对话框 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-pink-500" />
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {selectedItem && (
              <>
                {/* 必背内容 */}
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-pink-600" />
                    <span className="font-medium text-pink-800">必背原文</span>
                  </div>
                  <p className="text-sm text-pink-900 leading-relaxed">
                    {selectedItem.content}
                  </p>
                </div>

                {/* 详细讲解 */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-slate-800">详细讲解</span>
                  </div>
                  {explanationLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                      <span className="text-sm text-muted-foreground">AI 正在生成讲解...</span>
                    </div>
                  ) : explanation ? (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {explanation}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {selectedItem.explanation}
                    </p>
                  )}
                </div>

                {/* 高考关联 */}
                {selectedItem.gaokaoPoints.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium text-indigo-800">高考关联考点</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.gaokaoPoints.map((point, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-white">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 相关考题 */}
                {selectedItem.relatedQuestions.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileQuestion className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-amber-800">相关考题</span>
                    </div>
                    <div className="space-y-3">
                      {selectedItem.relatedQuestions.map((q, idx) => (
                        <div key={idx} className="bg-white rounded p-3">
                          <p className="text-sm font-medium text-slate-700 mb-1">
                            【{q.year}】{q.question}
                          </p>
                          <p className="text-sm text-green-600">
                            答案：{q.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI 问答 */}
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium text-slate-800">还有疑问？问问 AI</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatQuestion}
                      onChange={(e) => setChatQuestion(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChatQuestion()}
                      placeholder="输入你的疑问..."
                      className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <Button
                      size="sm"
                      onClick={sendChatQuestion}
                      disabled={chatLoading || !chatQuestion.trim()}
                    >
                      {chatLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {chatAnswer && (
                    <div className="mt-3 bg-indigo-50 rounded-lg p-3">
                      <p className="text-sm text-indigo-900 whitespace-pre-wrap">
                        {chatAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
