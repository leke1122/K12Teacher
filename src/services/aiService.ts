// AI服务 - 负责与AI大模型交互

interface KnowledgeItem {
  id: string;
  name: string;
  type: '概念' | '符号' | '方法' | '注意';
  description: string;
}

interface ExplanationResult {
  content: string;
  what: string;       // 讲什么
  why: string;         // 为什么
  how: string;        // 怎么记
  warning: string;     // 别踩坑
}

interface QuestionResult {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  type: 'choice' | 'fill';
}

interface AnswerCheckResult {
  correct: boolean;
  explanation: string;
  retryQuestion?: QuestionResult;
}

// 从PDF文本提取知识点列表
export async function extractKnowledgeFromText(
  pdfText: string,
  chapterId: string,
  sectionId: string
): Promise<KnowledgeItem[]> {
  const prompt = `你是一个高中数学教学专家。请从以下教材内容中提取所有知识点，形成详细列表。

要求：
1. 提取要全面详细，不遗漏任何知识点
2. 每个知识点包含：编号、名称、类型（概念/符号/方法/注意）、简要说明
3. 用JSON数组格式返回

教材内容：
${pdfText.substring(0, 8000)}

请返回JSON数组格式：
[
  {"id": "1", "name": "知识点名称", "type": "概念", "description": "简要说明"},
  ...
]`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: prompt }
        ],
        systemPrompt: '你是一个高中数学教学专家，擅长提取和组织知识点。'
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content;

    // 尝试解析JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // 如果解析失败，返回基础知识点
    return generateBasicKnowledge(chapterId, sectionId);
  } catch (error) {
    console.error('AI提取知识点失败:', error);
    return generateBasicKnowledge(chapterId, sectionId);
  }
}

// 讲解单个知识点
export async function explainKnowledge(
  knowledge: KnowledgeItem,
  pdfContext?: string,
  history?: Array<{ knowledge: string; correct: boolean }>,
  wrongAttempts?: number
): Promise<ExplanationResult> {
  const prompt = `你是一个耐心的高中数学老师。请讲解以下知识点，用通俗易懂的方式说明。

知识点：${knowledge.name}
类型：${knowledge.type}
${knowledge.description ? `说明：${knowledge.description}` : ''}
${pdfContext ? `\n相关教材内容：${pdfContext.substring(0, 2000)}` : ''}
${wrongAttempts && wrongAttempts > 0 ? `\n注意：学生之前答错了${wrongAttempts}次，需要重点讲解` : ''}

请用以下格式讲解：
📖 讲什么：[概念解释，用生活例子说明]
🤔 为什么：[为什么重要，有什么用]
💡 怎么记：[记忆技巧，联想法]
⚠️ 别踩坑：[常见错误，易错点]`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: '你是一个耐心的高中数学老师，善于用生活化的例子解释抽象概念。'
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content;

    return parseExplanation(content);
  } catch (error) {
    console.error('AI讲解知识点失败:', error);
    return getDefaultExplanation(knowledge);
  }
}

// 生成问题
export async function generateQuestion(
  knowledge: KnowledgeItem,
  pdfContext?: string
): Promise<QuestionResult> {
  const prompt = `你是一个高中数学出题专家。请为以下知识点生成一道练习题。

知识点：${knowledge.name}
类型：${knowledge.type}
${knowledge.description ? `说明：${knowledge.description}` : ''}
${pdfContext ? `\n相关教材内容：${pdfContext.substring(0, 1500)}` : ''}

请生成一道选择题或填空题，要求：
1. 题目简洁，考查核心概念
2. 选项要迷惑性强但有区分度
3. 用JSON格式返回：
{
  "question": "题目内容",
  "options": ["A. 选项", "B. 选项", "C. 选项", "D. 选项"],
  "answer": "A",
  "explanation": "答案解析",
  "type": "choice"
}

或者填空题：
{
  "question": "题目内容",
  "answer": "正确答案",
  "explanation": "答案解析",
  "type": "fill"
}`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: '你是一个高中数学出题专家，擅长设计有区分度的题目。'
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content;

    return parseQuestion(content);
  } catch (error) {
    console.error('AI生成问题失败:', error);
    return getDefaultQuestion(knowledge);
  }
}

// 检查答案
export async function checkAnswer(
  question: QuestionResult,
  userAnswer: string,
  knowledge: KnowledgeItem,
  pdfContext?: string
): Promise<AnswerCheckResult> {
  const prompt = `请检查用户对以下问题的回答是否正确。

题目：${question.question}
${question.options ? `选项：\n${question.options.join('\n')}` : ''}
正确答案：${question.answer}
用户回答：${userAnswer}

请分析：
1. 回答是否正确
2. 如果错误，说明为什么错了
3. 如果错误，提供一个新的类似问题继续练习

请用JSON格式返回：
{
  "correct": true/false,
  "explanation": "详细解释",
  "retryQuestion": null 或 { "question": "...", "options": [...], "answer": "...", "explanation": "...", "type": "choice" }
}`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: '你是一个严格的高中数学老师，擅长分析学生的错误原因。'
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.content;

    return parseAnswerCheck(content);
  } catch (error) {
    console.error('AI检查答案失败:', error);
    return { correct: false, explanation: '检查失败，请重试' };
  }
}

// 辅助函数：解析讲解内容
function parseExplanation(content: string): ExplanationResult {
  const whatMatch = content.match(/📖\s*讲什么[：:]\s*([\s\S]*?)(?=🤔|$)/i);
  const whyMatch = content.match(/🤔\s*为什么[：:]\s*([\s\S]*?)(?=💡|$)/i);
  const howMatch = content.match(/💡\s*怎么记[：:]\s*([\s\S]*?)(?=⚠️|$)/i);
  const warningMatch = content.match(/⚠️\s*别踩坑[：:]\s*([\s\S]*?)$/i);

  return {
    content,
    what: whatMatch?.[1]?.trim() || '讲解内容',
    why: whyMatch?.[1]?.trim() || '重要性说明',
    how: howMatch?.[1]?.trim() || '记忆技巧',
    warning: warningMatch?.[1]?.trim() || '注意事项'
  };
}

// 辅助函数：解析问题
function parseQuestion(content: string): QuestionResult {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // 解析失败，使用默认
  }
  return getDefaultQuestion({ name: '知识点', type: '概念', description: '', id: '' });
}

// 辅助函数：解析答案检查
function parseAnswerCheck(content: string): AnswerCheckResult {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // 解析失败
  }
  return { correct: false, explanation: '检查失败' };
}

// 生成基础知识点（当AI不可用时）
function generateBasicKnowledge(chapterId: string, sectionId: string): KnowledgeItem[] {
  return [
    { id: '1', name: '基本概念', type: '概念', description: '本章基础概念定义' },
    { id: '2', name: '核心原理', type: '概念', description: '本章核心原理' },
    { id: '3', name: '常用公式', type: '符号', description: '本章常用公式' },
    { id: '4', name: '解题方法', type: '方法', description: '常见解题方法' },
    { id: '5', name: '注意事项', type: '注意', description: '学习中需要特别注意的点' }
  ];
}

// 默认讲解
function getDefaultExplanation(knowledge: KnowledgeItem): ExplanationResult {
  return {
    content: `📖 讲什么：${knowledge.name}是本章的重要内容，需要认真理解。\n🤔 为什么：掌握这个知识点对后续学习很重要。\n💡 怎么记：通过多做练习来加深理解。\n⚠️ 别踩坑：注意区分容易混淆的概念。`,
    what: `${knowledge.name}是本章的重要内容`,
    why: '掌握这个知识点对后续学习很重要',
    how: '通过多做练习来加深理解',
    warning: '注意区分容易混淆的概念'
  };
}

// 默认问题
function getDefaultQuestion(knowledge: KnowledgeItem): QuestionResult {
  return {
    question: `关于"${knowledge.name}"的说法正确的是？`,
    options: [
      `A. ${knowledge.name}是正确的`,
      `B. ${knowledge.name}是错误的`,
      `C. ${knowledge.name}有时正确有时错误`,
      `D. 无法判断`
    ],
    answer: 'A',
    explanation: `${knowledge.name}是最基本的概念，需要掌握。`,
    type: 'choice'
  };
}
