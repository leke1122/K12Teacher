'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KnowledgePoint {
  id: number;
  name: string;
  type: string;
  description: string;
  keyPoints?: string[];
}

// 动态生成的讲解内容
export interface KnowledgeExplanation {
  what: string;
  analogy: string;
  example: string;
  rawContent?: string;
}

interface KnowledgeCardProps {
  knowledge: KnowledgePoint;
  explanation?: KnowledgeExplanation | null;
  index?: number;
  isCompleted?: boolean;
  isWeak?: boolean;
  className?: string;
  question?: string;
  onAnswer?: (correct: boolean) => Promise<void>;
  onNext?: () => void;
  answerFeedback?: { correct: boolean; explanation: string } | null;
  isLast?: boolean;
  loading?: boolean;
}

const typeConfig: Record<string, { color: string; icon: string; bgColor: string }> = {
  '定义': { color: 'text-blue-600', icon: '📖', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  '概念': { color: 'text-blue-600', icon: '📖', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  '符号': { color: 'text-purple-600', icon: '🔣', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  '性质': { color: 'text-green-600', icon: '⚡', bgColor: 'bg-green-50 dark:bg-green-950/30' },
  '方法': { color: 'text-orange-600', icon: '🔧', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  '注意': { color: 'text-amber-600', icon: '⚠️', bgColor: 'bg-amber-50 dark:bg-amber-950/30' },
  '关系': { color: 'text-pink-600', icon: '🔗', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
  '公式': { color: 'text-indigo-600', icon: '📐', bgColor: 'bg-indigo-50 dark:bg-indigo-950/30' },
};

// 将 **文本** 转换为 JSX 元素的辅助函数
function renderWithBold(text: string | undefined) {
  if (!text) return null;
  
  // 分割 **包裹的内容
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // 移除 ** 并返回加粗内容
      return (
        <strong key={index} className="text-indigo-600 dark:text-indigo-400 font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function KnowledgeCard({ 
  knowledge, 
  explanation, 
  index, 
  isCompleted, 
  isWeak, 
  className,
  question,
  onAnswer,
  onNext,
  answerFeedback,
  isLast,
  loading,
}: KnowledgeCardProps) {
  const typeInfo = typeConfig[knowledge.type] || typeConfig['概念'];

  // 检查是否有内容
  const hasExplanation = explanation && (explanation.what || explanation.analogy || explanation.example);

  return (
    <Card className={cn(
      'overflow-hidden border-0 shadow-xl',
      isCompleted && 'ring-2 ring-green-400',
      isWeak && 'ring-2 ring-amber-400',
      className
    )}>
      {/* 顶部渐变条 */}
      <div className={cn('h-1.5 bg-gradient-to-r', 
        isCompleted ? 'from-green-400 to-emerald-500' :
        isWeak ? 'from-amber-400 to-orange-500' :
        'from-indigo-500 via-purple-500 to-pink-500'
      )} />
      
      <CardHeader className={cn('pb-4', typeInfo.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 序号 */}
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg',
              isCompleted ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' :
              isWeak ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
              'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
            )}>
              {isCompleted ? <CheckCircle className="w-6 h-6" /> : (index ?? 0) + 1}
            </div>
            
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {knowledge.name}
                <Badge variant="outline" className={cn('ml-2 text-sm', typeInfo.color)}>
                  {typeInfo.icon} {knowledge.type}
                </Badge>
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                {isCompleted ? '✅ 已掌握' : isWeak ? '⚠️ 待巩固' : '学习中'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        {/* 讲什么 - 核心定义（支持加粗） */}
        <SectionBlock icon="📖" title="讲什么" color="blue">
          {hasExplanation ? (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {renderWithBold(explanation.what || knowledge.description)}
            </p>
          ) : (
            <p className="text-slate-400 italic">暂无讲解内容</p>
          )}
        </SectionBlock>

        {/* 怎么理解 - 生活化类比 */}
        <SectionBlock icon="💡" title="怎么理解" color="amber">
          {hasExplanation && explanation.analogy ? (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {explanation.analogy}
            </p>
          ) : (
            <p className="text-slate-400 italic">暂无类比说明</p>
          )}
        </SectionBlock>

        {/* 举个例子 - 具体示例 */}
        <SectionBlock icon="📝" title="举个例子" color="purple">
          {hasExplanation && explanation.example ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {explanation.example}
              </p>
            </div>
          ) : (
            <p className="text-slate-400 italic">暂无例子</p>
          )}
        </SectionBlock>
      </CardContent>
    </Card>
  );
}

// 章节块组件
interface SectionBlockProps {
  icon: string;
  title: string;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red' | 'indigo';
  children: React.ReactNode;
}

const sectionColors: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
  green: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
  amber: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
  purple: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
  red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800',
};

function SectionBlock({ icon, title, color, children }: SectionBlockProps) {
  return (
    <div className={cn('p-4 rounded-xl border', sectionColors[color])}>
      <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}
