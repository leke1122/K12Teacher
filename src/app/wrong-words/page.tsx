'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertCircle, CheckCircle, Trash2, RotateCcw, Search,
  BookOpen, Volume2, ArrowLeft, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WrongQuestion {
  id: string;
  subject_id: string;
  question: string;
  correct_answer: string;
  user_answer: string;
  analysis: string;
  created_at: string;
}

// 发音函数
function speakWord(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  
  window.speechSynthesis.speak(utterance);
}

// 发音按钮
function SpeakButton({ text }: { text: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-full"
      onClick={(e) => {
        e.stopPropagation();
        speakWord(text);
      }}
    >
      <Volume2 className="h-4 w-4 text-slate-400 hover:text-indigo-500" />
    </Button>
  );
}

export default function WrongWordsPage() {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 加载错词列表
  const fetchWrongQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wrong-questions?subject=english');
      const data = await res.json();
      
      if (data.success) {
        setWrongQuestions(data.questions || []);
      }
    } catch (err) {
      console.error('Failed to fetch wrong questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWrongQuestions();
  }, [fetchWrongQuestions]);

  // 删除错词
  const handleDelete = async () => {
    if (!deleteId) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/wrong-questions/${deleteId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.success) {
        setWrongQuestions(prev => prev.filter(q => q.id !== deleteId));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  // 重新练习
  const handlePractice = async (question: WrongQuestion) => {
    // 存储到 sessionStorage 供练习页面使用
    sessionStorage.setItem('practiceWrongWords', JSON.stringify([{
      id: question.id,
      word: question.correct_answer,
      meaning: question.question,
      phonetic: '',
    }]));
    
    // 跳转到单词学习页面
    window.location.href = '/words?mode=practice&from=wrong';
  };

  // 练习所有错词
  const handlePracticeAll = () => {
    const words = wrongQuestions.map(q => ({
      id: q.id,
      word: q.correct_answer,
      meaning: q.question,
      phonetic: '',
    }));
    
    sessionStorage.setItem('practiceWrongWords', JSON.stringify(words));
    window.location.href = '/words?mode=practice&from=wrong';
  };

  // 过滤后的错词列表
  const filteredQuestions = wrongQuestions.filter(q => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      q.correct_answer.toLowerCase().includes(searchLower) ||
      q.question.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                错词本
              </h1>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索错词..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* 错词列表 */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">
              {search ? '没有找到匹配的错词' : '太棒了！没有错词！'}
            </h3>
            <p className="text-slate-400">
              {search ? '换个关键词试试' : '继续保持，语法练习中再接再厉'}
            </p>
          </div>
        ) : (
          <>
            {/* 批量操作 */}
            {filteredQuestions.length > 1 && (
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-500">
                  共 {filteredQuestions.length} 个错词
                </p>
                <Button
                  size="sm"
                  onClick={handlePracticeAll}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  练习全部
                </Button>
              </div>
            )}

            {/* 错词卡片列表 */}
            <div className="space-y-3">
              {filteredQuestions.map((q) => (
                <Card key={q.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* 单词 */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-slate-800">
                            {q.correct_answer}
                          </h3>
                          <SpeakButton text={q.correct_answer} />
                        </div>
                        
                        {/* 释义 */}
                        <p className="text-sm text-slate-600 mb-2">
                          {q.question}
                        </p>
                        
                        {/* 用户答案 */}
                        {q.user_answer && (
                          <p className="text-xs text-red-500 mb-2">
                            你的答案：{q.user_answer}
                          </p>
                        )}
                        
                        {/* 时间 */}
                        <p className="text-xs text-slate-400">
                          {new Date(q.created_at).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePractice(q)}
                          className="flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          练习
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(q.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 删除确认对话框 */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              确认删除
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">
            确定要移除这个错词吗？移除后将不再出现在错词本中。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
