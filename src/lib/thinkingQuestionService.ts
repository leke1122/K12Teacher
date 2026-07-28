/**
 * 政史地核心训练 - AI 出题服务层
 * 封装调用 /api/chat 生成题目的逻辑
 */

import { buildPrompt, getSystemPrompt } from '@/lib/prompts/thinkingPrompts';

type Subject = 'history' | 'politics' | 'geography';
type TrainingType = 'mindmap' | 'thinking' | 'template';
type Level = 'L1' | 'L2' | 'L3';

interface QuestionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * 获取 API Key（从 localStorage 读取用户配置）
 */
function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem('edumind-settings');
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    return parsed?.state?.settings?.deepseekKey || parsed?.settings?.deepseekKey || '';
  } catch {
    return '';
  }
}

/**
 * 调用 AI 生成题目
 */
async function callAI(prompt: string): Promise<string> {
  const apiKey = getApiKey();
  
  // 直接调用 DeepSeek API
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error('AI 服务暂时不可用');
  }

  const data = await response.json();
  const answer = data.choices?.[0]?.message?.content || '';
  
  if (!answer) {
    throw new Error('AI 返回内容为空');
  }
  
  return answer;
}

/**
 * 解析 AI 返回的 JSON
 */
function parseAIResponse(response: string): unknown {
  // 尝试提取 JSON 块
  const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) ||
                    response.match(/```\n?([\s\S]*?)\n?```/) ||
                    response.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      // 尝试修复常见的 JSON 问题
      const fixed = jsonMatch[1]
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      try {
        return JSON.parse(fixed);
      } catch {
        return null;
      }
    }
  }
  
  return null;
}

// ==================== 思维导图题目生成 ====================

export async function generateMindmapQuestion(
  subject: Subject,
  chapterId: string,
  chapterTitle: string,
  level: Level
): Promise<QuestionResult> {
  try {
    const prompt = buildPrompt(subject, 'mindmap', level, { chapterId, chapterTitle });
    const response = await callAI(prompt);
    const data = parseAIResponse(response);
    
    if (!data) {
      return { success: false, error: '无法解析 AI 返回内容' };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '生成失败' 
    };
  }
}

// ==================== 解题思维题目生成 ====================

export async function generateThinkingQuestion(
  subject: Subject,
  chapterId: string,
  chapterTitle: string,
  level: Level
): Promise<QuestionResult> {
  try {
    const prompt = buildPrompt(subject, 'thinking', level, { chapterId, chapterTitle });
    const response = await callAI(prompt);
    const data = parseAIResponse(response);
    
    if (!data) {
      return { success: false, error: '无法解析 AI 返回内容' };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '生成失败' 
    };
  }
}

// ==================== 答题模板题目生成 ====================

export async function generateTemplateQuestion(
  subject: Subject,
  chapterId: string,
  chapterTitle: string,
  level: Level
): Promise<QuestionResult> {
  try {
    const prompt = buildPrompt(subject, 'template', level, { chapterId, chapterTitle });
    const response = await callAI(prompt);
    const data = parseAIResponse(response);
    
    if (!data) {
      return { success: false, error: '无法解析 AI 返回内容' };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '生成失败' 
    };
  }
}

// ==================== 评分服务 ====================

interface ScoreResult {
  score: number;
  maxScore: number;
  feedback: string;
  improvements: string[];
}

export async function gradeMindmapAnswer(
  userAnswer: Record<string, unknown>,
  correctAnswer: Record<string, unknown>,
  level: Level
): Promise<ScoreResult> {
  try {
    const prompt = `
请对比以下学生答案和参考答案，为学生的思维导图答题打分。

学生答案：
${JSON.stringify(userAnswer, null, 2)}

参考答案：
${JSON.stringify(correctAnswer, null, 2)}

评分标准（L${level.replace('L', '')}）：
- L1：关键词匹配度
- L2：排序正确率 + 因果关系准确性
- L3：完整性 + 准确性 + 逻辑性

请返回 JSON 格式：
{
  "score": 分数,
  "maxScore": 满分,
  "feedback": "整体评价",
  "improvements": ["改进建议1", "改进建议2"]
}`;

    const response = await callAI(prompt);
    const data = parseAIResponse(response);
    
    if (data && typeof data === 'object' && 'score' in data) {
      return data as ScoreResult;
    }
    
    return {
      score: 0,
      maxScore: 100,
      feedback: '无法评分，请重试',
      improvements: [],
    };
  } catch {
    return {
      score: 0,
      maxScore: 100,
      feedback: '评分服务暂时不可用',
      improvements: [],
    };
  }
}

export async function gradeThinkingAnswer(
  userAnswer: string,
  question: unknown,
  level: Level
): Promise<ScoreResult> {
  try {
    const prompt = `
请评价学生以下答题表现：

学生答案：
${userAnswer}

题目要求：
${JSON.stringify(question, null, 2)}

评分维度（L${level.replace('L', '')}）：
- L1：题眼识别准确性
- L2：材料-概念匹配正确性
- L3：审题报告完整性 + 分析深度

请返回 JSON 格式：
{
  "score": 分数,
  "maxScore": 满分,
  "feedback": "详细评价",
  "improvements": ["改进建议1", "改进建议2"]
}`;

    const response = await callAI(prompt);
    const data = parseAIResponse(response);
    
    if (data && typeof data === 'object' && 'score' in data) {
      return data as ScoreResult;
    }
    
    return {
      score: 0,
      maxScore: 100,
      feedback: '无法评分，请重试',
      improvements: [],
    };
  } catch {
    return {
      score: 0,
      maxScore: 100,
      feedback: '评分服务暂时不可用',
      improvements: [],
    };
  }
}

export async function gradeTemplateAnswer(
  userAnswer: Record<string, string>,
  template: unknown,
  level: Level
): Promise<ScoreResult> {
  try {
    const prompt = `
请评价学生以下答题模板填空表现：

学生填写：
${JSON.stringify(userAnswer, null, 2)}

模板要求：
${JSON.stringify(template, null, 2)}

评分维度：
- 要点完整性
- 表达准确性
- 逻辑连贯性

请返回 JSON 格式：
{
  "score": 分数,
  "maxScore": 满分,
  "feedback": "详细评价",
  "improvements": ["改进建议1", "改进建议2"]
}`;

    const response = await callAI(prompt);
    const data = parseAIResponse(response);
    
    if (data && typeof data === 'object' && 'score' in data) {
      return data as ScoreResult;
    }
    
    return {
      score: 0,
      maxScore: 100,
      feedback: '无法评分，请重试',
      improvements: [],
    };
  } catch {
    return {
      score: 0,
      maxScore: 100,
      feedback: '评分服务暂时不可用',
      improvements: [],
    };
  }
}

// ==================== 章节标题映射 ====================

export const CHAPTER_TITLES: Record<Subject, Record<string, string>> = {
  history: {
    unit1: '第一单元：从中华文明起源到秦汉统一',
    unit2: '第二单元：三国两晋南北朝到隋唐',
    unit3: '第三单元：辽宋夏金元',
  },
  politics: {
    ch1: '第一课：社会主义从空想到科学',
    ch2: '第二课：社会主义从理论到现实',
    ch3: '第三课：中国特色社会主义',
  },
  geography: {
    ch1: '第一章：宇宙中的地球',
    ch2: '第二章：地球上的大气',
    ch3: '第三章：地球上的水',
  },
};

export function getChapterTitle(subject: Subject, chapterId: string): string {
  return CHAPTER_TITLES[subject]?.[chapterId] || chapterId;
}
