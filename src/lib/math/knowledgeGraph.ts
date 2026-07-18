/**
 * 数学知识图谱服务
 * 提供知识图谱查询、学习路径规划、掌握度管理等功能
 */

import { supabase } from '@/lib/supabase';
import {
  FunctionGraphNode,
  getNodeById,
  getStartingNodes,
  functionGraphNodes,
} from '@/data/math/functionKnowledgeGraph';

export type MasteryLevel = 'not_started' | 'learning' | 'mastered';

export interface NodeMastery {
  nodeId: string;
  level: MasteryLevel;
  score: number;
  lastPracticed: string;
  practiceCount: number;
}

export async function getUserMastery(userId: string): Promise<Record<string, NodeMastery>> {
  try {
    if (!supabase) {
      if (typeof window === 'undefined') return {};
      const stored = localStorage.getItem(`math_mastery_${userId}`);
      return stored ? JSON.parse(stored) : {};
    }

    const { data } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('sub_type', 'math_function_graph');

    const masteryMap: Record<string, NodeMastery> = {};
    for (const item of data || []) {
      masteryMap[item.chapter_id] = {
        nodeId: item.chapter_id,
        level: item.status as MasteryLevel,
        score: item.score || 0,
        lastPracticed: item.updated_at,
        practiceCount: item.practice_count || 0,
      };
    }
    return masteryMap;
  } catch (err) {
    console.error('[MathKnowledgeGraph] 获取掌握度失败:', err);
    return {};
  }
}

export async function updateUserMastery(
  userId: string,
  nodeId: string,
  level: MasteryLevel,
  score?: number
): Promise<boolean> {
  try {
    if (!supabase) {
      if (typeof window === 'undefined') return false;
      const stored = localStorage.getItem(`math_mastery_${userId}`);
      const mastery: Record<string, NodeMastery> = stored ? JSON.parse(stored) : {};
      mastery[nodeId] = {
        nodeId,
        level,
        score: score || mastery[nodeId]?.score || 0,
        lastPracticed: new Date().toISOString(),
        practiceCount: (mastery[nodeId]?.practiceCount || 0) + 1,
      };
      localStorage.setItem(`math_mastery_${userId}`, JSON.stringify(mastery));
      return true;
    }

    const existing = await supabase
      .from('learning_progress')
      .select('id, score, practice_count')
      .eq('user_id', userId)
      .eq('chapter_id', nodeId)
      .eq('sub_type', 'math_function_graph')
      .single();

    const now = new Date().toISOString();

    if (existing.data) {
      await supabase
        .from('learning_progress')
        .update({
          status: level,
          score: score ?? existing.data.score,
          practice_count: (existing.data.practice_count || 0) + 1,
          updated_at: now,
        })
        .eq('id', existing.data.id);
    } else {
      await supabase
        .from('learning_progress')
        .insert({
          user_id: userId,
          subject_id: 'math',
          chapter_id: nodeId,
          sub_type: 'math_function_graph',
          status: level,
          score: score ?? 0,
          practice_count: 1,
          created_at: now,
          updated_at: now,
        });
    }
    return true;
  } catch (err) {
    console.error('[MathKnowledgeGraph] 更新掌握度失败:', err);
    return false;
  }
}

export function getNextRecommendedNode(
  masteredNodes: string[],
  learningNodes: string[]
): FunctionGraphNode | null {
  const startingNodes = getStartingNodes();

  for (const nodeId of learningNodes) {
    const node = getNodeById(nodeId);
    if (node) return node;
  }

  for (const startNode of startingNodes) {
    if (!masteredNodes.includes(startNode.id)) {
      const prereqs = startNode.prerequisites;
      const allPrereqsMet = prereqs.length === 0 || 
        prereqs.every(p => masteredNodes.includes(p));
      if (allPrereqsMet) return startNode;
    }
  }

  for (const node of functionGraphNodes) {
    if (masteredNodes.includes(node.id) || learningNodes.includes(node.id)) continue;
    const prereqs = node.prerequisites;
    const allPrereqsMet = prereqs.length === 0 || 
      prereqs.every(p => masteredNodes.includes(p));
    if (allPrereqsMet) return node;
  }

  return null;
}

export function generateLearningPath(
  userMastery: Record<string, NodeMastery>,
  targetNodeId: string
): FunctionGraphNode[] {
  const targetNode = getNodeById(targetNodeId);
  if (!targetNode) return [];

  const path: FunctionGraphNode[] = [];
  const visited = new Set<string>();

  function collectPrereqs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = getNodeById(nodeId);
    if (!node) return;

    for (const prereq of node.prerequisites) {
      collectPrereqs(prereq);
    }

    const mastery = userMastery[nodeId];
    if (!mastery || mastery.level !== 'mastered') {
      path.push(node);
    }
  }

  collectPrereqs(targetNodeId);

  const uniquePath: FunctionGraphNode[] = [];
  const seen = new Set<string>();
  for (const node of path) {
    if (!seen.has(node.id)) {
      seen.add(node.id);
      uniquePath.push(node);
    }
  }

  return uniquePath;
}

export function getGraphData() {
  return {
    nodes: functionGraphNodes.map(node => ({
      id: node.id,
      label: node.label,
      category: node.category,
      difficulty: node.difficulty,
    })),
    edges: [], // 边由前端根据节点关系计算
  };
}
