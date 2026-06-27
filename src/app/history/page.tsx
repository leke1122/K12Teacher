'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, Clock, CheckCircle, AlertCircle,
  Play, Eye, GraduationCap, Calendar, ArrowLeft,
  X, Trash2, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSubjectStore } from '@/stores/subjectStore';
import { useHistoryStore } from '@/stores/historyStore';
import { LearningRecord, deleteLearningRecord } from '@/services/supabaseService';
import { formatDuration } from '@/components/learning/Timer';

interface LocalLearningRecord extends LearningRecord {}

const modeLabels: Record<string, { label: string; icon: typeof BookOpen }> = {
  KNOWLEDGE: { label: '知识点学习', icon: GraduationCap },
  TEXTBOOK: { label: '课本还原', icon: BookOpen },
  PRACTICE: { label: '章节练习', icon: AlertCircle }
};

const modeColors: Record<string, string> = {
  KNOWLEDGE: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  TEXTBOOK: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PRACTICE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
};

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
      <HistoryPageContent />
    </Suspense>
  );
}

function HistoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentSubject } = useSubjectStore();
  const { records, loading, setRecords, setLoading, addRecord, removeRecord, setStats, setLoading: setHistoryLoading } = useHistoryStore();
  const [filter, setFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<LocalLearningRecord | null>(null);

  useEffect(() => {
    const resumeId = searchParams.get('recordId');
    if (resumeId) {
      // 返回此页时避免重复拉取，直接使用 store 中的记录
      if (!records.length) loadRecords();
      return;
    }
    loadRecords();
  }, [currentSubject]);

  const loadRecords = async () => {
    setHistoryLoading(true);
    setLoading(true);
    try {
      const response = await fetch('/api/progress?limit=100');
      const data = await response.json();
      let apiRecords: LocalLearningRecord[] = [];
      if (data.success) apiRecords = (data.data || []) as LocalLearningRecord[];
      try {
        const raw = localStorage.getItem('edumind_learning_records');
        if (raw) {
          const localRecords = JSON.parse(raw) as LocalLearningRecord[];
          const apiIds = new Set(apiRecords.map(r => r.id));
          const uniqueLocal = localRecords.filter(r => !apiIds.has(r.id));
          const merged = [...apiRecords, ...uniqueLocal].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setRecords(merged);
        } else {
          setRecords(apiRecords);
        }
      } catch {
        setRecords(apiRecords);
      }
    } catch (err) {
      console.error('获取学习记录失败:', err);
      try {
        const raw = localStorage.getItem('edumind_learning_records');
        if (raw) setRecords(JSON.parse(raw) as LocalLearningRecord[]);
      } catch {}
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  };

  const filteredRecords = filter === 'all'
    ? records
    : records.filter(r => r.mode === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAccuracy = (record: LocalLearningRecord) => {
    // 优先使用保存时计算的精确值
    if (record.progress.correctRate !== undefined) {
      return record.progress.correctRate;
    }
    // 降级：从 history 数组计算
    const history = record.progress.history || [];
    if (history.length === 0) return 0;
    const correct = history.filter(h => h.correct).length;
    return Math.round(correct / history.length * 100);
  };

  const getProgressText = (record: LocalLearningRecord) => {
    if (record.mode === 'KNOWLEDGE') {
      return `${record.progress.completed || 0}/${record.progress.total || 0} 个知识点`;
    }
    if (record.mode === 'TEXTBOOK') {
      return `第 ${(record.progress.currentIndex || 0) + 1} / ${record.progress.totalParagraphs || '-'} 段`;
    }
    return '';
  };

  const handleContinue = (record: LocalLearningRecord) => {
    const path = record.mode === 'TEXTBOOK'
      ? `/learn/textbook/${record.subjectId}/${record.chapterId}/${record.sectionId}?recordId=${record.id}&resume=true`
      : `/learn/knowledge/${record.subjectId}/${record.chapterId}/${record.sectionId}?recordId=${record.id}&resume=true`;
    router.replace(path);
  };

  const handleViewDetail = (record: LocalLearningRecord) => {
    setSelectedRecord(record);
  };

  const handleDelete = async (record: LocalLearningRecord) => {
    if (!confirm('确定要删除这条学习记录吗？')) return;
    try {
      await deleteLearningRecord(record.id);
    } catch {}
    try {
      const raw = localStorage.getItem('edumind_learning_records');
      if (raw) {
        const all = JSON.parse(raw) as LocalLearningRecord[];
        const filtered = all.filter(r => r.id !== record.id);
        localStorage.setItem('edumind_learning_records', JSON.stringify(filtered));
      }
    } catch {}
    removeRecord(record.id);
    setSelectedRecord(null);
  };

  const getDetailSections = (record: LocalLearningRecord) => {
    if (record.mode === 'KNOWLEDGE') {
      const mastered = ((record.progress as any).masteredList || (record.progress as any).completedList || []).slice(0, 20);
      const weak = (record.progress.wrongList || []).slice(0, 20);
      return (
        <div className="space-y-3">
          <Card className="p-4">
            <p className="text-xs text-slate-500 mb-2">已学知识点</p>
            <div className="flex flex-wrap gap-2">
              {mastered.length ? mastered.map((item: string, idx: number) => (
                <span key={idx} className="px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">{item}</span>
              )) : <span className="text-xs text-slate-500">暂无</span>}
            </div>
          </Card>
          {weak.length > 0 && (
            <Card className="p-4">
              <p className="text-xs text-slate-500 mb-2">薄弱项</p>
              <div className="flex flex-wrap gap-2">
                {weak.map((item, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">{item}</span>
                ))}
              </div>
            </Card>
          )}
          <Card className="p-4">
            <p className="text-xs text-slate-500 mb-2">知识点进度</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${((record.progress.completed || 0) / (record.progress.total || 1)) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-500">{record.progress.completed || 0}/{record.progress.total || 0}</span>
            </div>
          </Card>
        </div>
      );
    }
    return (
      <Card className="p-4">
        <p className="text-xs text-slate-500 mb-2">段落进度</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${((record.progress.currentIndex || 0) / ((record.progress.totalParagraphs || 1))) * 100}%` }} />
          </div>
          <span className="text-xs text-slate-500">{record.progress.currentIndex || 0}/{record.progress.totalParagraphs || '-'}</span>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                📋 学习记录
              </h1>
              <Link href="/wrong-questions">
                <Button variant="outline" size="sm" className="gap-1 text-amber-600 border-amber-200 hover:bg-amber-50">
                  <AlertTriangle className="h-4 w-4" />错题集
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>全部</Button>
              <Button size="sm" variant={filter === 'KNOWLEDGE' ? 'default' : 'outline'} onClick={() => setFilter('KNOWLEDGE')}>知识点</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4"><BookOpen className="h-8 w-8 text-slate-400" /></div>
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">暂无学习记录</h3>
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">开始学习后，记录会显示在这里</p>
            <Button onClick={() => router.push('/')}>去学习</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => {
              const ModeIcon = modeLabels[record.mode]?.icon || BookOpen;
              const accuracy = calculateAccuracy(record);
              const isComplete = record.mode === 'KNOWLEDGE'
                ? (record.progress.completed || 0) >= (record.progress.total || 1)
                : (record.progress.currentIndex || 0) >= ((record.progress.totalParagraphs || 1) - 1);

              return (
                <Card key={record.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium', modeColors[record.mode] || modeColors.KNOWLEDGE)}>
                      <ModeIcon className="h-4 w-4" />
                      <span>{modeLabels[record.mode]?.label || '学习'}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate((record as any).created_at || record.timestamp || record.date)}</span>
                        <span>{record.subjectName || record.subjectId} · 第{record.chapterId}章 › 第{record.sectionId}节</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><Clock className="h-4 w-4" />学习时长：{formatDuration(record.duration || (record.progress as any)?.duration || 0)}</span>
                        <span className="text-slate-600 dark:text-slate-400">进度：{getProgressText(record)}</span>
                        <span className={cn('flex items-center gap-1', accuracy >= 70 ? 'text-green-600' : accuracy >= 50 ? 'text-amber-600' : 'text-red-600')}>正确率：{accuracy}%</span>
                      </div>
                      {((record.progress as any)?.wrongList || []).length > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600 dark:text-red-400">薄弱项：{(record.progress.wrongList || []).slice(0, 3).join('、')}{(record.progress.wrongList || []).length > 3 && `等${(record.progress.wrongList || []).length}项`}</span>
                        </div>
                      )}
                      {((record.progress as any)?.summary) && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{(record.progress as any).summary}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isComplete && (
                        <Button size="sm" onClick={() => handleContinue(record)} className="gap-1"><Play className="h-3.5 w-3.5" />继续学习</Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleViewDetail(record)} className="gap-1"><Eye className="h-3.5 w-3.5" />查看详情</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(record)} className="gap-1 text-red-600 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500">学习进度</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${(record.progress.completed || 0) / Math.max(record.progress.total || 1, 1) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{Math.round((record.progress.completed || 0) / Math.max(record.progress.total || 1, 1) * 100)}%</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  学习详情
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">章节</p>
                    <p className="text-sm font-medium">第{selectedRecord.chapterId}章 › 第{selectedRecord.sectionId}节</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">学习时间</p>
                    <p className="text-sm font-medium">{formatDate((selectedRecord as any).created_at || selectedRecord.timestamp || selectedRecord.date)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">学习时长</p>
                    <p className="text-sm font-medium flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" />{formatDuration(selectedRecord.duration || (selectedRecord.progress as any)?.duration || 0)}</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">正确率</p>
                    <p className={`text-sm font-medium ${calculateAccuracy(selectedRecord) >= 70 ? 'text-green-600' : calculateAccuracy(selectedRecord) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{calculateAccuracy(selectedRecord)}%</p>
                  </Card>
                  <Card className="p-4">
                    <p className="text-xs text-slate-500 mb-1">答题统计</p>
                    <p className="text-sm font-medium">
                      {selectedRecord.progress.correctAttempts ?? '-'} 对 / {selectedRecord.progress.totalAttempts ?? '-'} 题
                    </p>
                  </Card>
                </div>
                {getDetailSections(selectedRecord)}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => handleDelete(selectedRecord)} className="gap-1"><Trash2 className="h-4 w-4" />删除</Button>
                  <Button variant="outline" onClick={() => setSelectedRecord(null)}><X className="h-4 w-4 mr-1" />关闭</Button>
                  <Button onClick={() => { handleContinue(selectedRecord); setSelectedRecord(null); }}><Play className="h-4 w-4 mr-1" />继续学习</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
