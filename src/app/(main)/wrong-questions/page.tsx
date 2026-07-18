'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Trash2, BookOpen, Search, CheckCircle,
  AlertTriangle, Filter, Sparkles, GraduationCap
} from 'lucide-react';
import { getWrongQuestions, deleteWrongQuestion, markWrongQuestionMastered, getWeakPoints, type WrongQuestion } from '@/services/practiceService';
import { cn } from '@/lib/utils';

// 学科映射
const SUBJECT_MAP: Record<string, { name: string; color: string; bg: string }> = {
  math: { name: '数学', color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  english: { name: '英语', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  chinese: { name: '语文', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  physics: { name: '物理', color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  chemistry: { name: '化学', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  biology: { name: '生物', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  politics: { name: '政治', color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  history: { name: '历史', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  geography: { name: '地理', color: 'text-lime-600', bg: 'bg-lime-100 dark:bg-lime-900/30' },
};

// 学习类型配置
const ACTIVITY_TYPE_MAP: Record<string, { label: string; icon: typeof BookOpen; color: string; bg: string }> = {
  knowledge: { label: '知识点问答', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  textbook: { label: '课本还原', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  practice: { label: '综合练习', icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  words: { label: '单词练习', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  geogebra: { label: '几何探索', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
};

// 解析选项：支持 "A. 选项内容" 和纯 "选项内容" 两种格式
interface ParsedOption {
  letter: string;
  content: string;
  full: string;
}

function parseOptions(options: string[] | undefined): ParsedOption[] {
  if (!options || options.length === 0) return [];
  return options.map(opt => {
    const trimmed = opt.trim();
    const letterMatch = trimmed.match(/^([A-Da-d])[.．、)]\s*(.*)/);
    if (letterMatch) {
      return { letter: letterMatch[1].toUpperCase(), content: letterMatch[2].trim(), full: trimmed };
    }
    // 纯内容，尝试推断字母
    const firstChar = trimmed[0];
    if (/[A-Da-d]/.test(firstChar)) {
      return { letter: firstChar.toUpperCase(), content: trimmed.slice(1).replace(/^[.．、)\s]+/, ''), full: trimmed };
    }
    return { letter: '', content: trimmed, full: trimmed };
  });
}

// 判断用户是否答错
function isWrong(wq: WrongQuestion): boolean {
  const user = (wq.userAnswer || '').toUpperCase().trim();
  const correct = (wq.correctAnswer || '').toUpperCase().trim();
  if (!user || !correct) return false;
  return user !== correct;
}

// 从 chapterId/sectionId 推断学习类型
function inferActivityType(wq: WrongQuestion): string {
  if (wq.sectionId && wq.chapterId) return 'practice';
  if (wq.chapterId) return 'textbook';
  if (wq.sectionId) return 'knowledge';
  return 'practice';
}

// 选项列表组件（卡片内用）
function OptionList({ wq, compact = false }: { wq: WrongQuestion; compact?: boolean }) {
  const opts = parseOptions(wq.options);
  const userLetter = (wq.userAnswer || '').toUpperCase().trim();
  const correctLetter = (wq.correctAnswer || '').toUpperCase().trim();
  const wrong = isWrong(wq);

  if (opts.length === 0) {
    // 无选项时，显示纯答案对比
    return (
      <div className="flex items-center gap-3 mt-2">
        <span className={cn(
          'px-2 py-1 rounded-lg text-xs font-bold border',
          wrong ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20' : 'bg-green-50 text-green-600 border-green-200'
        )}>
          你的答案：{wq.userAnswer || '未作答'}
        </span>
        <span className="px-2 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600 border border-green-200">
          正确答案：{wq.correctAnswer}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1.5 mt-2', compact ? '' : '')}>
      {opts.map((opt, i) => {
        const isUserAnswer = opt.letter === userLetter;
        const isCorrect = opt.letter === correctLetter;
        const isWrongChoice = isUserAnswer && !isCorrect;

        if (!isUserAnswer && !isCorrect && !wrong) return null; // 答对时只显示正确答案
        if (isCorrect && !isWrongChoice) {
          // 正确答案（用户也选对了）
          return (
            <div key={i} className={cn(
              'flex items-start gap-2 px-3 py-2 rounded-lg text-xs border',
              'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
            )}>
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                {opt.letter}
              </span>
              <span className="text-green-700 dark:text-green-400 font-medium">{opt.content}</span>
              <span className="ml-auto text-green-500 text-xs">✓ 正确</span>
            </div>
          );
        }
        if (isWrongChoice) {
          // 用户的错误选择
          return (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs border bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                {opt.letter}
              </span>
              <span className="text-red-700 dark:text-red-400 font-medium">{opt.content}</span>
              <span className="ml-auto text-red-500 text-xs">✗ 你的答案</span>
            </div>
          );
        }
        if (isCorrect && isWrongChoice) {
          // 既是正确答案也是错误答案（理论上不会发生但保留）
          return (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs border bg-amber-50 border-amber-200">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                {opt.letter}
              </span>
              <span className="text-amber-700 font-medium">{opt.content}</span>
            </div>
          );
        }
        // 未被选中的选项（答对时省略，答错时显示）
        if (wrong) {
          return (
            <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-xs border border-slate-200 dark:border-slate-700 opacity-50">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-600 text-white flex items-center justify-center text-xs font-bold">
                {opt.letter}
              </span>
              <span className="text-slate-500">{opt.content}</span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// 选项列表组件（详情弹窗用，显示所有选项）
function OptionListDetail({ wq }: { wq: WrongQuestion }) {
  const opts = parseOptions(wq.options);
  const userLetter = (wq.userAnswer || '').toUpperCase().trim();
  const correctLetter = (wq.correctAnswer || '').toUpperCase().trim();

  if (opts.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">选项</p>
      <div className="space-y-2">
        {opts.map((opt, i) => {
          const isUserAnswer = opt.letter === userLetter;
          const isCorrect = opt.letter === correctLetter;
          const isWrongChoice = isUserAnswer && !isCorrect;

          let cls = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800';
          let letterBg = 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300';
          let contentCls = 'text-slate-700 dark:text-slate-300';
          let rightLabel = '';

          if (isCorrect) {
            cls = 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/20';
            letterBg = 'bg-green-500 text-white';
            contentCls = 'text-green-700 dark:text-green-400 font-medium';
            rightLabel = '正确答案';
          }
          if (isWrongChoice) {
            cls = 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20';
            letterBg = 'bg-red-500 text-white';
            contentCls = 'text-red-700 dark:text-red-400 font-medium';
            rightLabel = '你的答案';
          }

          return (
            <div key={i} className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm border', cls)}>
              <span className={cn('flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold', letterBg)}>
                {opt.letter}
              </span>
              <span className={cn('flex-1', contentCls)}>{opt.content}</span>
              {rightLabel && (
                <span className={cn(
                  'flex-shrink-0 text-xs px-2 py-0.5 rounded-md font-medium',
                  isCorrect ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}>
                  {rightLabel}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WrongQuestionsContent() {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [weakPoints, setWeakPoints] = useState<{ id: string; subjectId: string; weakPoint: string; description: string; wrongCount: number; lastOccurred: string; createdAt: string }[]>([]);
  const [filter, setFilter] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<WrongQuestion | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const wq = await getWrongQuestions();
    setWrongQuestions(wq);
    setWeakPoints(getWeakPoints());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // 页面可见时刷新数据（用户从学习页返回时能看到新记录）
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadData();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const filtered = wrongQuestions
    .filter(wq => {
      if (filter === 'mastered') return wq.isMastered;
      if (filter === 'unmastered') return !wq.isMastered;
      return true;
    })
    .filter(wq => {
      if (subjectFilter !== 'all') return wq.subjectId === subjectFilter;
      return true;
    })
    .filter(wq => {
      if (activityTypeFilter !== 'all') return inferActivityType(wq) === activityTypeFilter;
      return true;
    })
    .filter(wq =>
      !search ||
      wq.question.includes(search) ||
      wq.knowledgePoint?.includes(search) ||
      wq.weakPoint?.includes(search)
    );

  const subjectStats = wrongQuestions.reduce<Record<string, number>>((acc, wq) => {
    acc[wq.subjectId] = (acc[wq.subjectId] || 0) + 1;
    return acc;
  }, {});

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setPassword('');
    setPasswordError(false);
  };

  const confirmDelete = async () => {
    if (password === 'qwe123456') {
      await deleteWrongQuestion(deleteId!);
      await loadData();
      if (selected?.id === deleteId) setSelected(null);
      setDeleteId(null);
      setPassword('');
    } else {
      setPasswordError(true);
    }
  };

  const handleMaster = async (id: string) => {
    await markWrongQuestionMastered(id);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部 */}
      <div className="sticky top-16 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowLeft className="h-4 w-4" />返回
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">错题集</h1>
            </div>
            <Badge variant="outline" className="text-sm">{filtered.length}题</Badge>
          </div>

          {/* 搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索错题、知识点..."
              className="pl-9 rounded-xl"
            />
          </div>

          {/* 学科筛选 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Filter className="h-3 w-3" />学科:</span>
            <button
              onClick={() => setSubjectFilter('all')}
              className={cn(
                'px-2 py-0.5 rounded-lg text-xs border transition-colors',
                subjectFilter === 'all'
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
              )}
            >
              全部
            </button>
            {Object.entries(subjectStats).map(([subj]) => {
              const info = SUBJECT_MAP[subj];
              if (!info) return null;
              return (
                <button
                  key={subj}
                  onClick={() => setSubjectFilter(subjectFilter === subj ? 'all' : subj)}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-xs border transition-colors',
                    subjectFilter === subj
                      ? `${info.bg} ${info.color} border-current`
                      : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
                  )}
                >
                  {info.name} ({subjectStats[subj]})
                </button>
              );
            })}
          </div>

          {/* 学习类型筛选 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1"><Sparkles className="h-3 w-3" />类型:</span>
            <button
              onClick={() => setActivityTypeFilter('all')}
              className={cn(
                'px-2 py-0.5 rounded-lg text-xs border transition-colors',
                activityTypeFilter === 'all'
                  ? 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
              )}
            >
              全部
            </button>
            {Object.entries(ACTIVITY_TYPE_MAP).map(([type, cfg]) => {
              const count = wrongQuestions.filter(wq => inferActivityType(wq) === type).length;
              if (count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setActivityTypeFilter(activityTypeFilter === type ? 'all' : type)}
                  className={cn(
                    'px-2 py-0.5 rounded-lg text-xs border transition-colors',
                    activityTypeFilter === type
                      ? `${cfg.bg} ${cfg.color} border-current`
                      : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300'
                  )}
                >
                  {cfg.label} ({count})
                </button>
              );
            })}
          </div>

          {/* 掌握状态筛选 */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: '全部' },
              { key: 'unmastered', label: '未掌握' },
              { key: 'mastered', label: '已掌握' },
            ].map(f => (
              <Button
                key={f.key}
                size="sm"
                variant={filter === f.key ? 'default' : 'outline'}
                onClick={() => setFilter(f.key as typeof filter)}
                className="rounded-lg text-xs"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-2xl space-y-4">
        {/* 薄弱项统计 */}
        {weakPoints.length > 0 && (
          <Card className="border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">薄弱项分布</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {weakPoints.sort((a, b) => b.wrongCount - a.wrongCount).slice(0, 8).map(wp => (
                  <Badge key={wp.id} variant="outline" className="text-xs">
                    {wp.weakPoint} <span className="text-red-500 ml-1">{wp.wrongCount}次</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 错题列表 */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-500 mb-2">
              {search ? '没有找到相关错题' : '暂无错题记录'}
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              {search ? '换个关键词试试' : '完成章节练习后，错题会自动收录到这里'}
            </p>
            <Link href="/subjects/math">
              <Button size="sm">去练习</Button>
            </Link>
          </div>
        ) : (
          filtered.map(wq => {
            const subjectInfo = SUBJECT_MAP[wq.subjectId] || { name: wq.subjectId, color: 'text-slate-600', bg: 'bg-slate-100' };
            const actType = inferActivityType(wq);
            const actInfo = ACTIVITY_TYPE_MAP[actType] || ACTIVITY_TYPE_MAP.practice;

            return (
              <Card key={wq.id} className={cn(
                'border-0 shadow-md transition-all hover:shadow-lg cursor-pointer',
                wq.isMastered ? 'opacity-70' : ''
              )}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0" onClick={() => setSelected(wq)}>
                      {/* 标签行：学科 + 类型 + 难度 */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={cn('text-xs font-medium', subjectInfo.bg, subjectInfo.color)}>
                          {subjectInfo.name}
                        </Badge>
                        <Badge className={cn('text-xs font-medium', actInfo.bg, actInfo.color)}>
                          {actInfo.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            wq.difficulty === 'simple' ? 'border-green-300 text-green-600' :
                            wq.difficulty === 'hard' ? 'border-red-300 text-red-600' :
                            'border-amber-300 text-amber-600'
                          )}
                        >
                          {wq.difficulty === 'simple' ? '简单' : wq.difficulty === 'hard' ? '困难' : '中等'}
                        </Badge>
                        {wq.knowledgePoint && (
                          <Badge variant="outline" className="text-xs">{wq.knowledgePoint}</Badge>
                        )}
                        {wq.isMastered && (
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200">已掌握</Badge>
                        )}
                      </div>

                      {/* 题目 */}
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                        {wq.question}
                      </p>

                      {/* 时间 + 薄弱项 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {wq.createdAt && (
                          <span className="text-xs text-slate-400">
                            错题时间：{new Date(wq.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {wq.weakPoint && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            薄弱项：{wq.weakPoint}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!wq.isMastered && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleMaster(wq.id); }}
                          title="标记为已掌握"
                          className="text-green-500 hover:text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDelete(wq.id); }}
                        title="删除"
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* 错题详情弹窗 */}
      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              错题详情
            </DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const subjectInfo = SUBJECT_MAP[selected.subjectId] || { name: selected.subjectId, color: 'text-slate-600', bg: 'bg-slate-100' };
            const actType = inferActivityType(selected);
            const actInfo = ACTIVITY_TYPE_MAP[actType] || ACTIVITY_TYPE_MAP.practice;
            return (
              <div className="space-y-5 mt-2">
                {/* 标签行 */}
                <div className="flex gap-2 flex-wrap">
                  <Badge className={cn('text-xs font-medium', subjectInfo.bg, subjectInfo.color)}>{subjectInfo.name}</Badge>
                  <Badge className={cn('text-xs font-medium', actInfo.bg, actInfo.color)}>{actInfo.label}</Badge>
                  {selected.knowledgePoint && <Badge variant="outline" className="text-xs">{selected.knowledgePoint}</Badge>}
                  {selected.chapterId && <Badge variant="outline" className="text-xs">第{selected.chapterId}章</Badge>}
                  {selected.sectionId && <Badge variant="outline" className="text-xs">第{selected.sectionId}节</Badge>}
                </div>

                {/* 题目 */}
                <Card className="bg-slate-50 dark:bg-slate-800/50">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {selected.question}
                    </p>
                  </CardContent>
                </Card>

                {/* 选项（详情展示所有选项） */}
                <OptionListDetail wq={selected} />

                {/* 答案对比（无选项时降级显示） */}
                {parseOptions(selected.options).length === 0 && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                      <p className="text-xs text-slate-500 mb-1">你的答案</p>
                      <p className="font-bold text-red-600">{selected.userAnswer || '未作答'}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-xs text-slate-500 mb-1">正确答案</p>
                      <p className="font-bold text-green-600">{selected.correctAnswer}</p>
                    </div>
                  </div>
                )}

                {/* 答案解析 */}
                {selected.wrongReason && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">答案解析</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-100 dark:border-blue-900">
                      {selected.wrongReason}
                    </p>
                  </div>
                )}

                {/* 步骤分析 */}
                {selected.stepAnalysis && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">步骤分析</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selected.stepAnalysis}</p>
                  </div>
                )}

                {/* 解题思路 */}
                {selected.solutionSteps && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">解题思路</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{selected.solutionSteps}</p>
                  </div>
                )}

                {/* 薄弱项 */}
                {selected.weakPoint && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      薄弱项：{selected.weakPoint}
                    </span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  {!selected.isMastered && (
                    <Button size="sm" onClick={() => { handleMaster(selected.id); setSelected(null); }} className="gap-1">
                      <CheckCircle className="h-4 w-4" />标记已掌握
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setSelected(null)}>关闭</Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={!!deleteId} onOpenChange={() => { setDeleteId(null); setPassword(''); setPasswordError(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              确认删除
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">确定要删除这条错题吗？</p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">请输入密码确认删除</label>
            <Input
              type="password"
              placeholder="输入密码"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
              className={passwordError ? 'border-red-500' : ''}
            />
            {passwordError && <p className="text-sm text-red-500">密码错误，请重试</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setDeleteId(null); setPassword(''); setPasswordError(false); }}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WrongQuestionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    }>
      <WrongQuestionsContent />
    </Suspense>
  );
}
