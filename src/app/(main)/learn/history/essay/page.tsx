'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ExamFrequencyBadge } from '@/components/history/ExamFrequencyBadge';
import { essayQuestions, getEssaysByUnitId } from '@/data/history/essays';
import { releasedUnits, getUnitById } from '@/data/history/units';
import type { EssayQuestion, SampleLevel } from '@/types/history';
import { 
  ArrowLeft, FileText, Clock, CheckCircle2, 
  Loader2, Send, ChevronDown, ChevronUp, BookOpen, Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function EssayPage() {
  const [selectedEssay, setSelectedEssay] = useState<EssayQuestion | null>(null);
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [showAnswer, setShowAnswer] = useState(false);

  const filteredEssays = useMemo(() => {
    if (filterUnit === 'all') return essayQuestions;
    return essayQuestions.filter(e => e.unitId === filterUnit);
  }, [filterUnit]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* 顶部导航 */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/subjects/history">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-6 w-6 text-indigo-500" />
              论述大题专项
            </h1>
            <p className="text-sm text-muted-foreground">
              辽宁高考论述大题训练 · AI 评分 · 答题模板
            </p>
          </div>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
            {essayQuestions.length} 道大题
          </Badge>
        </div>

        {/* 筛选器 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm text-muted-foreground">筛选单元：</span>
              <select 
                className="border rounded-md px-3 py-2 text-sm"
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
              >
                <option value="all">全部单元</option>
                {releasedUnits.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
              <Badge variant="outline" className="ml-auto">
                {filteredEssays.length} 道大题
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧：大题列表 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">大题列表</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                {filteredEssays.map((essay) => {
                  const unit = getUnitById(essay.unitId);
                  const isSelected = selectedEssay?.id === essay.id;
                  
                  return (
                    <button
                      key={essay.id}
                      onClick={() => {
                        setSelectedEssay(essay);
                        setShowAnswer(false);
                      }}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        isSelected 
                          ? 'border-indigo-400 bg-indigo-50 shadow-md' 
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{essay.knowledgePoint}</span>
                            <ExamFrequencyBadge frequency={essay.examFrequency} showLabel={false} />
                          </div>
                          <div className="text-xs text-muted-foreground">{unit?.name}</div>
                        </div>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{essay.question}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 右侧：大题详情和作答 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {selectedEssay ? selectedEssay.knowledgePoint : '选择大题开始练习'}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto">
              {selectedEssay ? (
                <EssayDetail essay={selectedEssay} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p>请从左侧选择一道大题开始练习</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EssayDetail({ essay }: { essay: EssayQuestion }) {
  const [answer, setAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showSampleAnswers, setShowSampleAnswers] = useState<SampleLevel | null>(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  return (
    <div className="space-y-4">
      {/* 题目信息 */}
      <div className="flex flex-wrap gap-2">
        <ExamFrequencyBadge frequency={essay.examFrequency} />
      </div>

      {/* 题目 */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <h4 className="font-medium mb-2">📝 题目</h4>
        <p className="text-sm leading-relaxed">{essay.question}</p>
      </div>

      {/* 材料 */}
      {essay.material && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium mb-2 text-blue-800">📄 材料</h4>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{essay.material}</p>
        </div>
      )}

      {/* 计时器 */}
      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
        <Clock className="h-5 w-5 text-amber-600" />
        <span className="text-sm font-medium">
          {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        </span>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setIsTimerRunning(!isTimerRunning)}
        >
          {isTimerRunning ? '暂停' : '开始'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setTimeLeft(25 * 60)}>
          重置
        </Button>
      </div>

      {/* 作答区 */}
      <div>
        <h4 className="font-medium mb-2">✍️ 作答区</h4>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="请在此作答..."
          className="min-h-[200px] font-mono text-sm"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {answer.length} 字
          </span>
          <Button 
            size="sm" 
            disabled={!answer.trim() || isGrading}
            onClick={() => {
              setIsGrading(true);
              // 模拟AI评分
              setTimeout(() => {
                setGradeResult({
                  total: 35,
                  feedback: '答案基本完整，但深度不够，建议增加具体史实。',
                });
                setIsGrading(false);
              }, 2000);
            }}
          >
            {isGrading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                AI 评分中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1" />
                提交评分
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 评分结果 */}
      {gradeResult && (
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <h4 className="font-medium mb-2 text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            AI 评分结果
          </h4>
          <p className="text-2xl font-bold text-emerald-700 mb-2">{gradeResult.total}分</p>
          <p className="text-sm text-emerald-700">{gradeResult.feedback}</p>
        </div>
      )}

      {/* 答题模板 */}
      <div>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => setShowTemplate(!showTemplate)}
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            答题模板
          </span>
          {showTemplate ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {showTemplate && (
          <div className="mt-2 p-4 bg-slate-100 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap font-sans">{essay.template}</pre>
          </div>
        )}
      </div>

      {/* 评分标准 */}
      <div>
        <h4 className="font-medium mb-2">📊 评分标准</h4>
        <div className="space-y-2">
          {essay.scoringCriteria.map((criteria, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
              <span className="text-sm flex-1">{criteria.dimension}</span>
              <Badge variant="outline">{criteria.points}分</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* 范文参考 */}
      <div>
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => setShowSampleAnswers(showSampleAnswers ? null : '合格')}
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            范文参考
          </span>
          {showSampleAnswers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {showSampleAnswers && (
          <div className="mt-2 space-y-3">
            {(['基础', '合格', '优秀'] as SampleLevel[]).map((level) => {
              const sample = essay.sampleAnswers.find(s => s.level === level);
              if (!sample) return null;
              return (
                <div key={level} className={`p-4 rounded-lg border ${
                  level === '优秀' ? 'bg-emerald-50 border-emerald-200' :
                  level === '合格' ? 'bg-blue-50 border-blue-200' :
                  'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{level}范文</span>
                    <div className="flex items-center gap-2">
                      <Badge>{sample.score}分</Badge>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{sample.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">评语：{sample.commentary}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
