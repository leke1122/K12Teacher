/**
 * 函数智能学习引导 API
 * 基于知识图谱的多智能体引导式学习
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getNodeById,
  getPrerequisites,
  getNextNodes,
  functionGraphNodes,
} from '@/data/math/functionKnowledgeGraph';
import {
  getUserMastery,
  updateUserMastery,
  getNextRecommendedNode,
  NodeMastery,
  MasteryLevel,
} from '@/lib/math/knowledgeGraph';

interface GuideRequest {
  userId: string;
  action: 'start' | 'answer' | 'next' | 'get_status';
  nodeId?: string;
  userInput?: string;
  sessionId?: string;
  apiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GuideRequest = await request.json();
    const { userId, action, nodeId, userInput, sessionId } = body;

    // 获取用户掌握度
    const mastery = await getUserMastery(userId);

    switch (action) {
      case 'get_status':
        return handleGetStatus(mastery);
      
      case 'start':
        return handleStart(nodeId, mastery);
      
      case 'answer':
        return handleAnswer(userId, userInput, nodeId, mastery, body.apiKey);
      
      case 'next':
        return handleNext(mastery);
      
      default:
        return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    console.error('[FunctionGuide] 错误:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}

function handleGetStatus(mastery: Record<string, NodeMastery>) {
  const masteredNodes = Object.entries(mastery)
    .filter(([, m]) => m.level === 'mastered')
    .map(([id]) => id);
  
  const learningNodes = Object.entries(mastery)
    .filter(([, m]) => m.level === 'learning')
    .map(([id]) => id);

  const nextNode = getNextRecommendedNode(masteredNodes, learningNodes);

  const nodeStatus = Object.fromEntries(
    Object.entries(mastery).map(([id, m]) => [id, { level: m.level, score: m.score }])
  );

  return NextResponse.json({
    success: true,
    masteredCount: masteredNodes.length,
    learningCount: learningNodes.length,
    totalNodes: functionGraphNodes.length,
    nextRecommended: nextNode ? {
      id: nextNode.id,
      label: nextNode.label,
      description: nextNode.description,
    } : null,
    nodeStatus,
  });
}

function handleStart(nodeId: string | undefined, mastery: Record<string, NodeMastery>) {
  const node = nodeId ? getNodeById(nodeId) : null;
  
  if (nodeId && !node) {
    return NextResponse.json({ success: false, error: '知识点不存在' }, { status: 404 });
  }

  // 如果没有指定节点，获取推荐节点
  const targetNode = node || getNextRecommendedNode(
    Object.entries(mastery).filter(([, m]) => m.level === 'mastered').map(([id]) => id),
    Object.entries(mastery).filter(([, m]) => m.level === 'learning').map(([id]) => id)
  );

  if (!targetNode) {
    return NextResponse.json({
      success: true,
      message: '你已经完成了函数基础部分的学习！',
      currentNode: null,
      sessionId: `session_${Date.now()}`,
    });
  }

  const prerequisites = getPrerequisites(targetNode.id);
  const hasPrereqs = prerequisites.every(p => {
    const m = mastery[p.id];
    return m && m.level === 'mastered';
  });

  const greeting = hasPrereqs
    ? `我们来学习【${targetNode.label}】。${targetNode.description}`
    : `要学习【${targetNode.label}】，需要先掌握这些知识点：${prerequisites.map(p => p.label).join('、')}`;

  return NextResponse.json({
    success: true,
    message: greeting,
    currentNode: {
      id: targetNode.id,
      label: targetNode.label,
      description: targetNode.description,
      keyPoints: targetNode.keyPoints,
      formula: targetNode.formula,
      category: targetNode.category,
      canStart: hasPrereqs,
      prerequisites: prerequisites.map(p => ({
        id: p.id,
        label: p.label,
        mastered: (mastery[p.id]?.level ?? '') === 'mastered',
      })),
    },
    sessionId: `session_${Date.now()}`,
    nextAction: hasPrereqs ? 'explain' : 'prerequisites',
  });
}

async function handleAnswer(
  userId: string,
  userInput: string | undefined,
  nodeId: string | undefined,
  mastery: Record<string, NodeMastery>,
  apiKey?: string
) {
  if (!nodeId || !userInput) {
    return NextResponse.json({ success: false, error: '参数不足' }, { status: 400 });
  }

  const node = getNodeById(nodeId);
  if (!node) {
    return NextResponse.json({ success: false, error: '知识点不存在' }, { status: 404 });
  }

  // 使用 AI 分析用户回答
  const analysis = await analyzeAnswer(userInput, node, apiKey);

  // 更新掌握度
  const newLevel: MasteryLevel = analysis.isCorrect ? 'mastered' : (analysis.understandingLevel > 0.5 ? 'learning' : 'not_started');
  await updateUserMastery(userId, nodeId, newLevel);

  const nextNode = getNextNodes(node.id)[0];
  const nextRecommended = nextNode ? getNextRecommendedNode(
    [...Object.entries(mastery).filter(([, m]) => m.level === 'mastered').map(([id]) => id), nodeId],
    Object.entries(mastery).filter(([, m]) => m.level === 'learning').map(([id]) => id)
  ) : null;

  return NextResponse.json({
    success: true,
    isCorrect: analysis.isCorrect,
    feedback: analysis.feedback,
    nextAction: analysis.isCorrect ? 'next_node' : 'retry',
    currentNode: {
      id: node.id,
      label: node.label,
    },
    masteryUpdate: {
      nodeId,
      newLevel,
      newScore: analysis.score,
    },
    nextRecommended: nextRecommended ? {
      id: nextRecommended.id,
      label: nextRecommended.label,
    } : null,
  });
}

function handleNext(mastery: Record<string, NodeMastery>) {
  const masteredNodes = Object.entries(mastery)
    .filter(([, m]) => m.level === 'mastered')
    .map(([id]) => id);
  
  const learningNodes = Object.entries(mastery)
    .filter(([, m]) => m.level === 'learning')
    .map(([id]) => id);

  const nextNode = getNextRecommendedNode(masteredNodes, learningNodes);

  if (!nextNode) {
    return NextResponse.json({
      success: true,
      message: '恭喜！你已经完成了函数知识图谱的学习！',
      currentNode: null,
    });
  }

  const prerequisites = getPrerequisites(nextNode.id);
  const hasPrereqs = prerequisites.every(p => {
    const m = mastery[p.id];
    return m && m.level === 'mastered';
  });

  return NextResponse.json({
    success: true,
    message: hasPrereqs
      ? `推荐学习：${nextNode.label}`
      : `要学习【${nextNode.label}】，请先完成前置知识：${prerequisites.filter(p => (mastery[p.id]?.level ?? '') !== 'mastered').map(p => p.label).join('、')}`,
    currentNode: {
      id: nextNode.id,
      label: nextNode.label,
      description: nextNode.description,
      canStart: hasPrereqs,
    },
    nextAction: hasPrereqs ? 'explain' : 'prerequisites',
  });
}

interface AnswerAnalysis {
  isCorrect: boolean;
  score: number;
  feedback: string;
  understandingLevel: number;
}

async function analyzeAnswer(
  userInput: string,
  node: ReturnType<typeof getNodeById>,
  apiKey?: string
): Promise<AnswerAnalysis> {
  const lowerInput = userInput.toLowerCase();
  
  // 关键词检测（针对不同知识点）
  const keywordChecks: Record<string, { keywords: string[]; weight: number }> = {
    'func-basic': { keywords: ['函数', '定义域', '值域', '对应关系'], weight: 0.8 },
    'func-domain': { keywords: ['定义域', 'x', '自变量', '有意义'], weight: 0.8 },
    'func-monotonicity': { keywords: ['单调', '增', '减', '递增', '递减', 'x1', 'x2'], weight: 0.8 },
    'func-parity': { keywords: ['奇函数', '偶函数', 'f(-x)', '对称'], weight: 0.8 },
    'func-periodicity': { keywords: ['周期', 't', 'f(x+t)'], weight: 0.8 },
    'exp-function': { keywords: ['指数', 'a', 'a^x', '恒过点'], weight: 0.8 },
    'log-function': { keywords: ['对数', 'log', '真数', '底数'], weight: 0.8 },
    'quadratic-function': { keywords: ['二次', '顶点', '对称轴', '开口', 'a≠0'], weight: 0.8 },
    'derivative-concept': { keywords: ['导数', '极限', '切线', '斜率', "f'(x)"], weight: 0.8 },
  };

  const check = keywordChecks[node?.id || ''] || { keywords: [], weight: 0.5 };
  const matchedKeywords = check.keywords.filter(k => lowerInput.includes(k.toLowerCase()));
  const keywordScore = check.keywords.length > 0 
    ? matchedKeywords.length / check.keywords.length * check.weight 
    : 0.5;

  // 使用 AI 进行更深入的分析
  if (apiKey) {
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{
            role: 'user',
            content: `作为数学学习评估助手，分析学生对以下知识点的回答质量。
            
知识点：${node?.label}
知识点描述：${node?.description}
关键考点：${node?.keyPoints?.join('、')}

学生回答：${userInput}

请评估：
1. 学生是否正确理解了知识点？（是/否）
2. 回答的完整程度如何？
3. 给出一个简短的反馈（1-2句话）

请用JSON格式回复：{"correct": true/false, "completeness": 0-1, "feedback": "反馈内容"}`
          }],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      const aiResult = JSON.parse(data.choices?.[0]?.message?.content || '{}');
      
      if (aiResult.correct !== undefined) {
        return {
          isCorrect: aiResult.correct,
          score: Math.round(aiResult.completeness * 100),
          feedback: aiResult.feedback || (aiResult.correct ? '很好！' : '继续加油！'),
          understandingLevel: aiResult.completeness,
        };
      }
    } catch (err) {
      console.error('[FunctionGuide] AI分析失败:', err);
    }
  }

  // 回退到基于关键词的简单评估
  const isCorrect = keywordScore >= 0.5;
  const score = Math.round(keywordScore * 100);

  return {
    isCorrect,
    score,
    feedback: isCorrect 
      ? '很好！你已经理解了这个知识点。' 
      : `还需要继续学习。提示：${node?.keyPoints?.[0] || '请仔细阅读知识点内容'}`,
    understandingLevel: keywordScore,
  };
}
