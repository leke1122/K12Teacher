/**
 * GeoGebra 几何导师 Prompt 模板
 * 采用苏格拉底式引导，不直接给答案，通过提问帮助学生自己发现答案
 */

import type { SelectedObject } from '@/types/geogebra';

/**
 * GeoGebra 几何导师系统 Prompt（Socratic 引导式）
 */
export const GEOMETRY_TUTOR_SYSTEM_PROMPT = `你是【几何导师】，一位专门帮助高中生理解立体几何和空间解析几何的 AI 助教。

## 核心原则（严格遵循）
1. **绝不直接给答案**：你的任务是引导学生自己发现答案，而不是告诉他们答案
2. **Socratic 提问法**：通过一连串精心设计的问题，引导学生逐步思考
3. **从具体到抽象**：先让学生观察图形的具体特征，再引出一般规律
4. **鼓励试错**：学生答错时不要否定，而是引导他们自己发现错误
5. **及时肯定**：学生答对时给予积极反馈，增强信心

## 提示分级策略
根据学生的回答情况，使用不同级别的提示：
- **hintLevel 0（无提示）**：只给出引导性问题，不提供任何方向
- **hintLevel 1（模糊提示）**：给出思考方向，如"想想对称性"、"看看边的数量"
- **hintLevel 2（具体提示）**：给出更具体的线索，如"试试数一下面的数量"、"看看对应边是否相等"
- **hintLevel 3（详细提示）**：给出接近答案的提示，如"连接对角线看看"、"用勾股定理试试"

## 输出格式
你必须严格返回以下 JSON 格式（不要返回 JSON 之外的任何内容）：

{
  "feedback": "对学生的回答给予反馈，50-150字。正确时肯定并递进，错误时委婉引导，部分正确时补充完善",
  "nextQuestion": "下一个引导问题，20-80字。要继续引导学生思考，不能直接给答案",
  "hintLevel": 0,
  "isComplete": false,
  "geogebraCommands": [
    {
      "action": "highlight | rotate | zoom | show | hide | setColor",
      "target": "对象名称",
      "params": { "color": "#FF5722", "angle": 45 },
      "reason": "执行原因"
    }
  ],
  "keyPoints": ["最终总结的知识点（仅isComplete为true时填写）"]
}

## 约束
- feedback 中绝对不能包含最终答案
- nextQuestion 必须是开放性问题，引导学生继续思考
- 只有当学生已经自己推导出正确答案时，才将 isComplete 设为 true
- isComplete 为 true 时，keyPoints 填写本主题的核心知识点

## 示例

### 示例1：正方体面数
输入：选中正方体，学生回答"6个面"
输出：
{
  "feedback": "很好！你数得很仔细。那你能发现这些面之间有什么关系吗？相对的面有什么特点？",
  "nextQuestion": "相对的两个面之间有什么关系？",
  "hintLevel": 0,
  "isComplete": false,
  "geogebraCommands": [],
  "keyPoints": []
}

### 示例2：学生答错
输入：选中正方体，学生回答"4个面"
输出：
{
  "feedback": "嗯，再仔细看看。正方体的每个面是什么形状？你可以试着数一数。",
  "nextQuestion": "你能说出这个正方体的每个面是什么形状吗？",
  "hintLevel": 1,
  "isComplete": false,
  "geogebraCommands": [],
  "keyPoints": []
}

### 示例3：学生完成
输入：学生已经推导出正方体对角线公式
输出：
{
  "feedback": "太棒了！你已经自己推导出了正方体体对角线的长度公式！这就是空间勾股定理的应用。",
  "nextQuestion": "",
  "hintLevel": 0,
  "isComplete": true,
  "geogebraCommands": [],
  "keyPoints": [
    "正方体体对角线 = 棱长 × √3",
    "空间勾股定理：$c^2 = a^2 + b^2 + h^2$",
    "体对角线是连接相对顶点的线段"
  ]
}
`;

/**
 * 题目录播模式：初始引导 Prompt
 */
export const INITIAL_TUTOR_PROMPT = (
  selectedObjects: SelectedObject[],
  quickAction?: string,
  topicMode?: boolean,
): string => {
  if (topicMode) {
    const topicPrompts: Record<string, string> = {
      '请介绍这道题的核心考点和解题方向': `这是一道几何题目。请完成以下任务：

1. 识别这是什么类型的几何题（立体几何 / 平面几何 / 解析几何）
2. 找出题目涉及的主要概念和定理
3. 用苏格拉底式提问引导学生思考，而不是直接讲解

格式要求：返回 JSON 对象，feedback 字段包含你的分析（50-150字），nextQuestion 是第一个引导问题，hintLevel=0，isComplete=false。`,

      '请从图中提取所有已知条件，包括数值、位置关系、特殊角等': `请完成以下任务：

1. 仔细观察题目图片，提取所有已知条件
2. 标注每个条件的作用（用于求什么）
3. 对每个条件提问引导学生自己发现

格式要求：返回 JSON 对象，feedback 字段列出条件分析，nextQuestion 是引导学生提取第一个条件的提问，hintLevel=0，isComplete=false。`,

      '这道题需要用到哪些公式或定理？请列出并简要说明每个公式的意义': `请完成以下任务：

1. 识别这道题需要用到的公式或定理
2. 简要说明每个公式的适用场景
3. 用苏格拉底式提问引导学生回忆相关公式

格式要求：返回 JSON 对象，feedback 字段包含公式分析，nextQuestion 是引导问题，hintLevel=0，isComplete=false。`,

      '请给出这道题的完整解题思路，用苏格拉底式提问引导学生一步步自己想出来': `这是一道需要解题思路的题目。

请完成以下任务：
1. 给出这道题的解题思路概述（2-3句话）
2. 设计3-5个递进式的引导问题，让学生一步步自己想出完整解法
3. 每一步都通过提问推进，不要直接给答案

格式要求：返回 JSON 对象，feedback 字段包含思路概述，nextQuestion 是第一个引导问题，hintLevel=0，isComplete=false。`,

      '请逐步求解这道题，每一步都解释为什么这样做。完成后引导学生总结关键步骤。': `请完成以下任务：

1. 给出这道题的完整逐步求解过程
2. 每一步都解释"为什么这样做"
3. 完成后引导学生总结关键步骤和易错点

格式要求：返回 JSON 对象，feedback 字段包含完整解答（分步骤），nextQuestion 是引导学生总结的提问，hintLevel=0，isComplete=false，keyPoints 包含关键步骤总结。`,
    };

    const customPrompt = topicPrompts[quickAction || ''];
    if (customPrompt) {
      return customPrompt;
    }

    // 默认题目录播 prompt
    return `## 题目分析模式
请仔细观察题目图片，完成以下任务：

1. 识别题目类型（立体几何/平面几何/解析几何）
2. 提取已知条件和求解目标
3. 用提问引导学生理解题意

## 输出要求
返回 JSON 格式，feedback 字段包含题目分析，nextQuestion 是第一个引导问题。`;
  }

  // 对象模式（原有逻辑）
  const objectsDescription = selectedObjects
    .map((obj) => {
      const name = obj.label || obj.id;
      const type = obj.type;
      return `${name}(${type})`;
    })
    .join('、');

  const actionPrompt = quickAction
    ? `\n\n学生选择了探索方向："${quickAction}"`
    : '';

  return `## 教学场景
学生刚刚选中了 GeoGebra 中的几何对象：${objectsDescription || '整体图形'}
${actionPrompt}

## 你的任务
1. 不要直接讲解，而是提出一个引导性问题
2. 问题要能激发学生的观察和思考
3. 问题难度适中，符合当前选中对象的特征
4. 如果学生选择了特定探索方向，围绕该方向设计问题

## 当前状态
这是第一次互动，还没有学生的回答。
请给出第一个引导性问题（nextQuestion），hintLevel 设为 0，isComplete 设为 false。`;
};

/**
 * 学生回答后的 Prompt
 */
export const ANSWER_PROMPT = (
  selectedObjects: SelectedObject[],
  question: string,
  studentAnswer: string,
  hintLevel: number,
  history: Array<{ role: string; content: string }>,
  topicMode?: boolean,
): string => {
  const recentHistory = history.slice(-6).map(h => `[${h.role === 'ai' ? '导师' : '学生'}] ${h.content}`).join('\n');

  if (topicMode) {
    return `## 题目录播对话
${recentHistory ? `## 对话历史\n${recentHistory}\n` : ''}
## 当前问题
导师问：${question}

## 学生回答
学生说：${studentAnswer}

## 你的任务
1. 评估学生的回答，给予恰当反馈
2. 如果学生理解了：继续递进到下一个知识点或引导总结
3. 如果学生没理解：给出更具体的提示（hintLevel + 1，但不超过3）
4. 在 feedback 中推进对话，在 nextQuestion 中提出下一个问题

## 输出格式
返回 JSON：{ "feedback": "反馈", "nextQuestion": "下一个问题", "hintLevel": 0-3, "isComplete": false/true, "keyPoints": ["知识点"] }`;
  }

  // 对象模式（原有逻辑）
  const objectsDescription = selectedObjects
    .map((obj) => `${obj.label || obj.id}(${obj.type})`)
    .join('、');

  return `## 教学场景
学生正在观察 GeoGebra 中的几何对象：${objectsDescription}

## 互动历史
${recentHistory || '暂无历史'}

## 当前问题
教师（AI）刚才问：${question}

## 学生回答
学生说：${studentAnswer}

## 当前提示级别
hintLevel = ${hintLevel}（0=无提示，1=模糊提示，2=具体提示，3=详细提示）

## 你的任务
1. 评估学生的回答
2. 给出反馈（feedback）：
   - 如果回答正确或接近正确：肯定并递进到更深层的问题
   - 如果回答部分正确：补充完善，不否定
   - 如果回答错误：委婉引导，将 hintLevel + 1（不超过3）
3. 设计下一个问题（nextQuestion）：
   - 如果学生还没掌握：继续围绕同一主题提问
   - 如果学生已经掌握：递进到相关的新问题
   - 如果学生已经完全理解：将 isComplete 设为 true，在 keyPoints 中总结知识点
4. 绝对不要直接给出答案或公式`;
};

/**
 * 解析 AI 返回的引导式 JSON
 */
export function parseTutorResponse(
  content: string,
): {
  feedback: string;
  nextQuestion: string;
  hintLevel: 0 | 1 | 2 | 3;
  isComplete: boolean;
  geogebraCommands: Array<{
    action: string;
    target: string;
    params: Record<string, unknown>;
    reason: string;
  }>;
  keyPoints: string[];
} | null {
  try {
    const cleaned = content.replace(/```(?:json)?/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end >= 0 && end > start) {
      const parsed = JSON.parse(cleaned.slice(start, end + 1));

      if (typeof parsed.feedback !== 'string') return null;

      return {
        feedback: parsed.feedback || '',
        nextQuestion: typeof parsed.nextQuestion === 'string' ? parsed.nextQuestion : '',
        hintLevel: Math.min(3, Math.max(0, parseInt(parsed.hintLevel) || 0)) as 0 | 1 | 2 | 3,
        isComplete: !!parsed.isComplete,
        geogebraCommands: Array.isArray(parsed.geogebraCommands) ? parsed.geogebraCommands : [],
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      };
    }
  } catch {}

  return null;
}
