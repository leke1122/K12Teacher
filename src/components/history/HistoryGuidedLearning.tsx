'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  MessageCircle,
  Lightbulb,
  CheckCircle,
  ChevronRight,
  Loader2,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Target,
  Zap,
  AlertCircle,
  MemoryStick,
  Clock,
  Layers,
  Network,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'explanation' | 'question' | 'answer' | 'summary' | 'practice' | 'memory';
}

interface HistoryGuidedLearningProps {
  unitId?: string;
  unitTitle?: string;
}

// 内置第一单元知识点（备用）
const UNIT1_KNOWLEDGE = `
【第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固】

一、中华文明的起源
1. 旧石器时代：元谋人、北京人，打制石器，采集渔猎
2. 新石器时代：仰韶文化（黄河中游，彩陶，粟），河姆渡文化（长江下游，水稻），龙山文化（黑陶），良渚文化（玉器）

二、夏商西周：早期国家与制度
1. 分封制：目的"封建亲戚，以藩屏周"；对象：王族、功臣、先代贵族；义务：镇守、作战、贡赋、朝觐
2. 宗法制：核心是嫡长子继承制；血缘与政治结合
3. 礼乐制度：维护等级秩序
4. 井田制：奴隶主土地国有制

三、春秋战国：大变革
1. 阶段特征：奴隶制→封建制转变
2. 铁器牛耕：推动井田制瓦解
3. 小农经济：家庭为单位，自给自足
4. 商鞅变法：重农抑商、奖励军功、废井田开阡陌、推行县制
5. 百家争鸣：儒道法墨各家思想

四、秦朝：统一
1. 统一条件：商鞅变法、秦王嬴政、法家思想
2. 巩固措施：统一文字、货币、度量衡；修长城
3. 专制主义中央集权：皇帝制度、三公九卿、郡县制
4. 郡县制vs分封制：官吏任命vs世袭

五、两汉：大一统
1. 汉初无为而治：休养生息
2. 汉武帝大一统：推恩令、罢黜百家独尊儒术、盐铁官营
3. 光武中兴：东汉恢复
4. 庄园经济：豪强地主
5. 两汉文化：史记、汉赋、造纸术
`;

// 快速记忆口诀
const MEMORY_TIPS = {
  新石器文化: '仰韶彩陶种粟（黄河中游），河姆渡稻蚕丝（长江下游），龙山黑陶父系社会，红山玉器神庙祭，良渚长江下游玉水利',
  分封制: '封建亲戚目的是屏周，对象王族功臣旧贵族，义务镇守作战贡赋觐',
  宗法制: '嫡长子继承是核心，大小宗关系相对，血缘政治相结合',
  商鞅变法: '重农抑商奖励耕织，奖励军功限制贵族，拆散小家庭废井田，什伍连坐推行县',
  郡县vs分封: '分封制靠血缘世袭官，郡县制按地域任命官',
  汉武帝大一统: '政治推恩令刺史制，经济盐铁官营五铢钱，思想罢黜百家尊儒术',
  秦统一措施: '统一文字货币度量衡，修驰道直道车同轨，修长城巩固边疆',
};

export function HistoryGuidedLearning({ unitId = 'unit1', unitTitle }: HistoryGuidedLearningProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stepComplete, setStepComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [knowledgeLoaded, setKnowledgeLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 学习步骤
  const steps = [
    {
      id: 'intro',
      title: '背景导入',
      icon: BookOpen,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      prompt: `请介绍"${unitTitle || '第一单元'}"的历史背景，包括：1）这一时期的社会状况；2）主要矛盾和问题；3）历史发展趋势。请用通俗易懂的语言讲解，让学生能够理解为什么要学习这段历史。`,
    },
    {
      id: 'overview',
      title: '知识总览',
      icon: Layers,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100',
      prompt: `请根据以下知识点内容，全面讲解本单元的全部知识要点。必须涵盖以下五大模块的所有知识点，不要遗漏任何重要内容：

${UNIT1_KNOWLEDGE}

请按照以下格式详细讲解：
1. 每个历史时期的核心事件
2. 每个重要制度的内容、目的、影响
3. 关键人物的贡献
4. 各知识点之间的联系`,
    },
    {
      id: 'core_event',
      title: '核心事件详解',
      icon: Target,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100',
      prompt: `请详细讲解本单元最重要的历史事件，包括：1）事件的直接原因（是什么导致了这件事？）；2）事件的主要经过；3）事件的重要结果（这件事导致了什么？）。重点说明因果关系。重点讲清：商鞅变法、秦朝统一、汉武帝大一统。`,
    },
    {
      id: 'key_concepts',
      title: '关键概念',
      icon: Lightbulb,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      prompt: `请讲解本单元需要掌握的关键历史概念/制度，包括：1）每个概念的含义；2）为什么重要；3）与哪些其他概念有联系（因果关系）。重点讲清：分封制、宗法制、郡县制、小农经济。`,
    },
    {
      id: 'memory',
      title: '快速记忆',
      icon: MemoryStick,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100',
      prompt: `请根据本单元内容，生成一套有效的记忆方法，帮助学生快速记住和理解知识点。要求：
1. 为每个重要知识点提供记忆口诀或顺口溜
2. 用联想记忆法讲解
3. 用时间线串联法讲解
4. 找出知识点的规律和联系
5. 给出复习建议

参考记忆口诀：
${Object.entries(MEMORY_TIPS).map(([k, v]) => `${k}：${v}`).join('\n')}`,
    },
    {
      id: 'causal_chain',
      title: '因果链条',
      icon: Network,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      prompt: `请梳理本单元历史事件的因果链条，必须涵盖：
1. 铁器牛耕 → 井田制瓦解 → 土地私有制 → 小农经济
2. 生产发展 → 王室衰微 → 诸侯争霸 → 变法运动
3. 商鞅变法 → 秦朝强大 → 统一六国 → 郡县制确立
4. 秦朝暴政 → 楚汉战争 → 汉初休养 → 汉武帝大一统
5. 大一统 → 思想统一 → 儒学正统

请详细说明 A → B → C 的发展过程，讲解时要明确说明"因为...所以..."的逻辑。`,
    },
    {
      id: 'gaokao',
      title: '高考考点',
      icon: GraduationCap,
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      prompt: `请结合辽宁高考的特点，讲解本单元的常考知识点：1）哪些内容是高频考点；2）常见的题型有哪些；3）答题时需要注意什么；4）给出典型例题。必须涵盖所有重要考点。`,
    },
    {
      id: 'practice',
      title: '练习巩固',
      icon: Brain,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-100',
      prompt: `请根据本单元内容，生成3道高考风格的练习题（选择题），题目难度：${difficulty}。要求：
1. 覆盖本单元的重要知识点
2. 包含一道时间题（事件发生顺序）
3. 包含一道概念题（制度特点）
4. 包含一道因果题（事件关联）

每道题包含：题目、4个选项、正确答案、详细解析。`,
    },
  ];

  // 获取 API Key
  const getApiKey = () => {
    try {
      const raw = localStorage.getItem('edumind-settings');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.state?.settings?.deepseekKey || parsed?.settings?.deepseekKey || '';
    } catch {}
    return '';
  };

  // 发送消息到 AI
  const sendToAI = async (question: string, systemContext?: string) => {
    setLoading(true);
    try {
      const apiKey = getApiKey();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch('/api/history/qa', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question,
          context: systemContext || `高中历史学习：${unitTitle || '第一单元'}。这是引导式学习模式，需要详细、易懂、全面的讲解，特别要说明因果关系，不要遗漏任何重要知识点。`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        return data.data.answer;
      }
      return '抱歉，AI 服务暂时不可用。请检查是否已配置 DeepSeek API Key。';
    } catch (error) {
      console.error('AI 请求失败:', error);
      return '网络错误，请稍后重试。';
    } finally {
      setLoading(false);
    }
  };

  // 开始学习步骤
  const startStep = async (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setShowAnswer(false);
    setUserAnswer('');
    setStepComplete(false);

    const step = steps[stepIndex];

    // 添加系统消息
    setMessages((prev) => [
      ...prev,
      {
        role: 'system',
        content: `【${step.title}】开始学习`,
        type: 'summary',
      },
    ]);

    // 获取 AI 讲解
    const explanation = await sendToAI(step.prompt);

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: explanation,
        type: step.id === 'memory' ? 'memory' : 'explanation',
      },
    ]);

    // 如果是练习步骤，等待用户作答
    if (step.id === 'practice') {
      // 练习题已经在上面的讲解中生成了
    }
  };

  // 回答练习题
  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userAnswer,
        type: 'answer',
      },
    ]);

    // 生成反馈
    const feedback = await sendToAI(`学生回答：${userAnswer}。请评价这个回答，指出对错，并给出正确答案和解析。`);

    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: feedback,
        type: 'explanation',
      },
    ]);

    setStepComplete(true);
    setUserAnswer('');
  };

  // 进入下一步
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      startStep(currentStep + 1);
    }
  };

  // 滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 初始化
  const startLearning = () => {
    setMessages([]);
    startStep(0);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-4">
      {/* 步骤选择器 */}
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <button
              key={step.id}
              onClick={() => startStep(index)}
              disabled={loading && isActive}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                isActive
                  ? `${step.bgColor} border-${step.color.replace('text-', '')}`
                  : isCompleted
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : loading && isActive ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              ) : (
                <Icon className={`h-4 w-4 ${step.color}`} />
              )}
              <span className={`text-sm font-medium ${isActive ? step.color : 'text-slate-600'}`}>
                {index + 1}. {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* 难度选择（仅练习步骤显示） */}
      {currentStepData?.id === 'practice' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">题目难度：</span>
          <div className="flex gap-1">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <Button
                key={d}
                size="sm"
                variant={difficulty === d ? 'default' : 'outline'}
                className="h-7 text-xs"
                onClick={() => setDifficulty(d)}
              >
                {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 消息区域 */}
      {messages.length === 0 ? (
        <Card className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-amber-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            历史引导式学习 · 全面版
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {unitTitle || '第一单元'} · {steps.length} 个学习环节
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 text-xs text-left bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-1"><BookOpen className="h-3 w-3 text-blue-500" />背景导入</div>
            <div className="flex items-center gap-1"><Layers className="h-3 w-3 text-indigo-500" />知识总览</div>
            <div className="flex items-center gap-1"><Target className="h-3 w-3 text-amber-500" />核心事件</div>
            <div className="flex items-center gap-1"><MemoryStick className="h-3 w-3 text-pink-500" />快速记忆</div>
            <div className="flex items-center gap-1"><Network className="h-3 w-3 text-purple-500" />因果链条</div>
            <div className="flex items-center gap-1"><GraduationCap className="h-3 w-3 text-red-500" />高考考点</div>
            <div className="flex items-center gap-1"><Brain className="h-3 w-3 text-emerald-500" />练习巩固</div>
          </div>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            通过引导式对话学习，深入理解历史事件的背景、过程、因果关系和高考考点。
            点击下方按钮开始学习。
          </p>
          <Button onClick={startLearning} className="gap-2 bg-amber-500 hover:bg-amber-600">
            <Brain className="h-4 w-4" />
            开始学习
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <>
          <ScrollArea ref={scrollRef} className="h-[500px] border rounded-lg bg-slate-50 p-4">
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-white'
                        : msg.role === 'system'
                        ? 'bg-slate-200 text-slate-700 text-sm'
                        : msg.type === 'memory'
                        ? 'bg-pink-50 border border-pink-200'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.role === 'assistant' && (
                        msg.type === 'memory' ? (
                          <MemoryStick className="h-5 w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <GraduationCap className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        )
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI 思考中，请稍候...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 操作区域 */}
          <div className="flex justify-between items-center">
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={goToNextStep}
                disabled={loading}
                className="gap-2 bg-amber-500 hover:bg-amber-600"
              >
                {steps[currentStep].title}
                <ChevronRight className="h-4 w-4" />
                下一步：{steps[currentStep + 1]?.title}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={startLearning}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                重新开始学习
              </Button>
            )}

            {currentStepData?.id === 'practice' && !stepComplete && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                  placeholder="输入你的答案..."
                  className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
                />
                <Button
                  onClick={submitAnswer}
                  disabled={!userAnswer.trim() || loading}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  提交答案
                </Button>
              </div>
            )}

            {stepComplete && (
              <Badge className="bg-green-100 text-green-700 gap-1">
                <CheckCircle className="h-4 w-4" />
                本步骤已完成
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
}
