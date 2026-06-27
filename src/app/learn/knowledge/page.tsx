'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, X, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timer } from '@/components/learning/Timer';
import { KnowledgeList } from '@/components/learning/KnowledgeList';
import { KnowledgeCard } from '@/components/learning/KnowledgeCard';
import { useSubjectStore } from '@/stores/subjectStore';
import { usePdfStore } from '@/stores/pdfStore';

interface KnowledgeItem {
  id: string;
  name: string;
  type: '概念' | '符号' | '方法' | '注意';
  description: string;
}

interface Explanation {
  content: string;
  what: string;
  why: string;
  how: string;
  warning: string;
}

interface Question {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  type: 'choice' | 'fill';
}

interface HistoryItem {
  knowledge: string;
  correct: boolean;
  attempts: number;
}

export default function KnowledgeLearningPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" /></div>}>
      <KnowledgeLearningPageContent />
    </Suspense>
  );
}

function KnowledgeLearningPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentSubject } = useSubjectStore();
  const { pdfText } = usePdfStore();

  const chapterId = searchParams.get('chapter') || '1';
  const sectionId = searchParams.get('section') || '1.1';
  const subSection = searchParams.get('sub');

  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [wrongList, setWrongList] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [duration, setDuration] = useState(0);

  const [currentExplanation, setCurrentExplanation] = useState<Explanation | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentKnowledge = knowledgeList[currentIndex];
  const progress = knowledgeList.length > 0 ? `${completedList.length}/${knowledgeList.length}` : '0/0';

  // 提取知识点
  const extractKnowledge = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const pdfContext = pdfText || '这是一个高中数学知识点学习页面，请根据章节内容提取知识点。';

      const response = await fetch('/api/extract-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfText: pdfContext,
          chapterId,
          sectionId,
          subjectId: currentSubject
        })
      });

      const data = await response.json();
      
      if (data.success && data.data) {
        setKnowledgeList(data.data);
      } else {
        // 使用默认知识点
        setKnowledgeList(getDefaultKnowledge(chapterId, sectionId));
      }
    } catch (err) {
      console.error('提取知识点失败:', err);
      setKnowledgeList(getDefaultKnowledge(chapterId, sectionId));
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  }, [chapterId, sectionId, currentSubject, pdfText]);

  // 获取知识点讲解
  const fetchExplanation = useCallback(async (knowledge: KnowledgeItem, isRetry: boolean = false) => {
    setLoading(true);
    setCurrentExplanation(null);
    setCurrentQuestion(null);
    setAnswerFeedback(null);

    try {
      const response = await fetch('/api/explain-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          knowledge,
          pdfContext: pdfText,
          history,
          wrongAttempts: isRetry ? 1 : 0
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentExplanation(data.data.explanation);
        setCurrentQuestion(data.data.question);
      } else {
        // 使用默认内容
        setCurrentExplanation({
          content: '正在加载讲解...',
          what: `${knowledge.name}是本节的重要内容。`,
          why: '掌握这个知识点对于理解整个章节非常关键。',
          how: '可以通过类比生活中的例子来记忆。',
          warning: '注意区分相似概念，避免混淆。'
        });
        setCurrentQuestion({
          question: `关于"${knowledge.name}"的说法正确的是？`,
          options: ['A. 正确', 'B. 错误', 'C. 不确定', 'D. 以上都不对'],
          answer: 'A',
          explanation: `${knowledge.name}是最基本的概念。`,
          type: 'choice'
        });
      }
    } catch (err) {
      console.error('获取讲解失败:', err);
      setCurrentExplanation({
        content: '讲解加载失败，请重试',
        what: '内容加载中...',
        why: '',
        how: '',
        warning: ''
      });
    } finally {
      setLoading(false);
    }
  }, [history, pdfText]);

  // 初始化
  useEffect(() => {
    extractKnowledge();
  }, [extractKnowledge]);

  // 当知识点加载完成后，获取第一个的讲解
  useEffect(() => {
    if (knowledgeList.length > 0 && !currentExplanation && !loading) {
      fetchExplanation(knowledgeList[0]);
    }
  }, [knowledgeList, currentExplanation, loading, fetchExplanation]);

  // 处理答案提交
  const handleAnswer = async (correct: boolean) => {
    const knowledge = knowledgeList[currentIndex];
    
    if (correct) {
      setAnswerFeedback({
        correct: true,
        explanation: '太棒了！这个知识点掌握得很好！'
      });
      
      if (!completedList.includes(knowledge.name)) {
        setCompletedList(prev => [...prev, knowledge.name]);
      }
      
      setHistory(prev => [...prev, { 
        knowledge: knowledge.name, 
        correct: true, 
        attempts: 1 
      }]);
    } else {
      // 错误处理
      setAnswerFeedback({
        correct: false,
        explanation: currentQuestion?.explanation || '回答错误，请查看解析并重试。'
      });
      
      if (!wrongList.includes(knowledge.name)) {
        setWrongList(prev => [...prev, knowledge.name]);
      }
      
      setHistory(prev => {
        const existing = prev.findIndex(h => h.knowledge === knowledge.name);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { 
            ...updated[existing], 
            attempts: updated[existing].attempts + 1 
          };
          return updated;
        }
        return [...prev, { 
          knowledge: knowledge.name, 
          correct: false, 
          attempts: 1 
        }];
      });

      // 重新获取讲解（针对错误）
      setTimeout(() => {
        fetchExplanation(knowledge, true);
      }, 2000);
    }
  };

  // 下一题
  const handleNext = () => {
    if (currentIndex < knowledgeList.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setAnswerFeedback(null);
      setCurrentExplanation(null);
      setCurrentQuestion(null);
      fetchExplanation(knowledgeList[nextIndex]);
    }
  };

  // 保存进度
  const handleSave = async () => {
    try {
      const progressData = {
        subjectId: currentSubject,
        chapterId,
        sectionId,
        mode: 'KNOWLEDGE',
        progress: {
          total: knowledgeList.length,
          completed: completedList.length,
          currentIndex,
          currentKnowledge: currentKnowledge?.name,
          completedList,
          wrongList,
          history,
          startTime: new Date().toISOString(),
          duration,
          summary: `本次学习了${currentKnowledge?.name || '知识点'}等${completedList.length}个概念`
        }
      };

      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progressData)
      });

      alert('学习进度已保存！');
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败，请重试');
    }
  };

  // 停止并保存
  const handleStopAndSave = () => {
    handleSave();
    router.push('/history');
  };

  // 生成默认知识点
  const getDefaultKnowledge = (chapter: string, section: string): KnowledgeItem[] => {
    return [
      { id: '1', name: '集合的定义', type: '概念', description: '由确定的不同对象组成的整体' },
      { id: '2', name: '元素', type: '概念', description: '组成集合的对象称为元素' },
      { id: '3', name: '集合的确定性', type: '概念', description: '任何一个对象都能确定是否属于某个集合' },
      { id: '4', name: '集合的互异性', type: '概念', description: '集合中的元素互不相同' },
      { id: '5', name: '空集', type: '概念', description: '不含任何元素的集合称为空集' },
      { id: '6', name: '集合的表示方法', type: '方法', description: '列举法、描述法、图示法' },
      { id: '7', name: '元素与集合的关系', type: '概念', description: '属于（∈）和不属于（∉）' },
      { id: '8', name: '常见数集符号', type: '符号', description: 'N、N*、Z、Q、R等' },
      { id: '9', name: '子集的定义', type: '概念', description: 'A中所有元素都在B中，则A是B的子集' },
      { id: '10', name: '真子集', type: '概念', description: 'A是B的子集且A≠B' },
      { id: '11', name: '空集是任何集合的子集', type: '注意', description: '这是容易出错的重要知识点' },
      { id: '12', name: '集合相等', type: '概念', description: '两个集合元素完全相同则相等' }
    ];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                返回
              </Button>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <BookOpen className="h-4 w-4" />
                <span>第{chapterId}章</span>
                <span className="text-slate-400">›</span>
                <span>第{sectionId}节</span>
                {subSection && (
                  <>
                    <span className="text-slate-400">›</span>
                    <span className="truncate max-w-[200px]">{decodeURIComponent(subSection)}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  进度：{progress}
                </span>
              </div>
              <Timer onSave={(d) => setDuration(d)} autoStart />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSave}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                保存
              </Button>
              <Button 
                variant="destructive"
                size="sm"
                onClick={handleStopAndSave}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                停止并保存
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧知识点列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <KnowledgeList
                items={knowledgeList}
                currentIndex={currentIndex}
                completedList={completedList}
                wrongList={wrongList}
                onSelect={(item, index) => {
                  setCurrentIndex(index);
                  fetchExplanation(item);
                }}
              />
            </div>
          </div>

          {/* 右侧学习内容 */}
          <div className="lg:col-span-2">
            {initializing ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-500">正在提取知识点...</p>
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <Button 
                  onClick={extractKnowledge}
                  className="mt-4"
                >
                  重试
                </Button>
              </div>
            ) : currentKnowledge ? (
              <KnowledgeCard
                knowledge={currentKnowledge as any}
                explanation={currentExplanation as any || undefined}
                question={typeof currentQuestion === 'string' ? currentQuestion : undefined}
                onAnswer={handleAnswer}
                onNext={handleNext}
                answerFeedback={answerFeedback}
                isLast={currentIndex === knowledgeList.length - 1 && answerFeedback?.correct}
                loading={loading}
              />
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                <p className="text-slate-500">暂无学习内容</p>
              </div>
            )}

            {/* 学习统计 */}
            {completedList.length > 0 && (
              <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">📊 本次学习统计</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{completedList.length}</div>
                    <div className="text-xs text-slate-500">答对次数</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{wrongList.length}</div>
                    <div className="text-xs text-slate-500">答错次数</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {completedList.length > 0 
                        ? Math.round((completedList.length - wrongList.length) / completedList.length * 100) 
                        : 0}%
                    </div>
                    <div className="text-xs text-slate-500">正确率</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{knowledgeList.length - completedList.length}</div>
                    <div className="text-xs text-slate-500">剩余知识点</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
