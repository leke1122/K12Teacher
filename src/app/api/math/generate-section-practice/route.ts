import { NextRequest, NextResponse } from 'next/server';
import { 
  getSectionKnowledge, 
  getAllChapters, 
  getSectionsByChapter,
  validateTopic,
  validateQuestion,
  filterQuestions,
  type SectionKnowledge 
} from '@/data/math/chapterKnowledgeIndex';

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;

interface PracticeQuestion {
  id: string;
  type: 'choice' | 'fill' | 'solution';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  knowledgePoint: string;
  chapterId: string;
  sectionId: string;
}

interface GenerateRequest {
  chapterId: string;
  sectionId: string;
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
}

// 生成唯一ID
function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 调用DeepSeek API
async function callDeepSeek(prompt: string, systemPrompt: string): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('未配置DeepSeek API密钥');
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API错误: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// 解析生成的题目
function parseQuestions(text: string, chapterId: string, sectionId: string): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];
  
  // 匹配选择题
  const choicePattern = /题[。\.]\s*([^\n]+?)\n([A-D][．.][^\n]+?\n?){4}答案[：:]\s*([A-D])\n?解析[：:]\s*([^\n]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = choicePattern.exec(text)) !== null) {
    const questionText = match[1].trim();
    const options = [
      match[2].trim(),
      match[3].trim(),
      match[4].trim(),
      match[5].trim()
    ];
    const answer = match[6].trim().toUpperCase();
    const explanation = match[7].trim();
    
    questions.push({
      id: generateId(),
      type: 'choice',
      question: questionText,
      options: options.map(o => o.replace(/^[A-D][．.]/, '').trim()),
      answer,
      explanation,
      difficulty: 'medium',
      knowledgePoint: sectionId,
      chapterId,
      sectionId
    });
  }
  
  // 匹配填空题
  const fillPattern = /题[。\.]\s*([^\n]+?)\n?答案[：:]\s*([^\n]+?)\n?解析[：:]\s*([^\n]+)/gi;
  while ((match = fillPattern.exec(text)) !== null) {
    if (!questions.some(q => q.question.includes(match![1].trim()))) {
      questions.push({
        id: generateId(),
        type: 'fill',
        question: match[1].trim(),
        answer: match[2].trim(),
        explanation: match[3].trim(),
        difficulty: 'medium',
        knowledgePoint: sectionId,
        chapterId,
        sectionId
      });
    }
  }
  
  return questions;
}

// 生成练习题
async function generatePractice(knowledge: SectionKnowledge, chapterId: string, sectionId: string, count: number = 5): Promise<{ questions: PracticeQuestion[]; warning?: string }> {
  // 构建极端严格的系统提示
  const systemPrompt = `你是一位专业的高中数学教师。你需要根据给定的知识点生成练习题目。

【核心原则】
你必须严格在指定小节的知识点范围内出题，禁止出任何超纲题！

【允许的知识点】
${knowledge.allowedTopics.join('、')}

【严禁出现的知识点（后续章节内容）】
${knowledge.forbiddenTopics.join('、')}

【前置知识点（可辅助使用）】
${knowledge.prerequisiteTopics.length > 0 ? knowledge.prerequisiteTopics.join('、') : '无'}

【必须包含的题型特征】
${knowledge.requiredPatterns?.map(p => `- ${p.reason}`).join('\n') || '无'}

【严格禁止的题型模式】
${knowledge.forbiddenPatterns?.map(p => `- ${p.reason}`).join('\n') || '无'}

【错误示例（绝对不能出这种题）】
❌ "已知集合 A = {x | 1 ≤ x ≤ 5}，求 A ∪ B" → 这是集合题，超纲！
❌ "设 A ∩ B = {2, 3}，求..." → 这是集合题，超纲！
❌ "判断 {1,2} ⊆ {1,2,3} 是否成立" → 这是集合题，超纲！

【正确示例】
✅ "已知 f(x) = x² + 2x + 1，求 f(2) 的值" → 函数题，正确！
✅ "求函数 f(x) = √(x-1) 的定义域" → 函数题，正确！
✅ "判断函数 f(x) = x² 在 R 上是否为偶函数" → 错误，这是奇偶性，超纲！`;

  const prompt = `请为小节"${knowledge.name}"生成${count}道练习题。

【章节信息】
- 小节名称：${knowledge.name}
- 页数范围：${knowledge.pageRange}
- 小节描述：${knowledge.description}

【允许的知识点（只能考这些）】
${knowledge.allowedTopics.join('、')}

【严禁出现的知识点（出现即为超纲）】⚠️⚠️⚠️
${knowledge.forbiddenTopics.join('、')}

【必须包含的题型特征（每道题必须有这些）】✅
${knowledge.requiredPatterns?.map(p => `- ${p.reason}`).join('\n') || '无'}

【严格禁止的题型模式（出现即过滤）】🚫
${knowledge.forbiddenPatterns?.map(p => `- ${p.reason}`).join('\n') || '无'}

【🚨🚨🚨 极度重要：3.1函数的概念禁止出集合题 🚨🚨🚨】
如果选择"3.1函数的概念"，绝对不能出以下类型的题：
- "已知集合 A = {x | ...}，求..." 类型的题
- "求 A ∪ B"、"求 A ∩ B" 类型的题
- "判断 {1,2} 是否为集合..." 类型的题
- 任何包含 ∈、∩、∪ 符号的题
- 任何包含 ℕ、ℤ、ℚ、ℝ 数集符号的题
- 任何包含"集合"、"子集"、"交集"、"并集"、"补集"等词的题

【✅ 正确示例（3.1函数的概念应出的题）】
✅ 已知 f(x) = x² + 1，求 f(2)
✅ 求函数 y = √(x-1) 的定义域
✅ 判断函数 f(x) = x³ 的单调性（等等，这是单调性，3.1不能出）
✅ 已知 f(x) = 2x + 3，求 f(x) 的值域
✅ 判断函数 f(x) = x² + 1 和 g(x) = x² + 1 是否相等

【输出格式】
题1. [选择题题目，必须包含 f(x) 或函数关键词]
A. [选项]
B. [选项]
C. [选项]
D. [选项]
答案：[答案]
解析：[详细解析]

题2. [填空题题目]
答案：[答案]
解析：[详细解析]`;

  // 重试机制：最多重试3次以获得足够的合格题目
  const MAX_RETRIES = 3;
  let allValid: PracticeQuestion[] = [];
  const allInvalid: Array<{ question: PracticeQuestion; reason: string }> = [];
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // 每次重试请求更多题目
      const requestCount = count + (attempt - 1) * 3;
      const attemptPrompt = attempt === 1 
        ? prompt 
        : prompt
            .replace(`生成${count}道`, `生成${requestCount}道`)
            .replace(`生成${count} 道`, `生成${requestCount}道`);
      
      const generatedText = await callDeepSeek(attemptPrompt, systemPrompt);
      console.log(`[generatePractice] 第${attempt}次生成原始题目数量: ${generatedText.split('题').length - 1}`);
      
      const questions = parseQuestions(generatedText, chapterId, sectionId);
      console.log(`[generatePractice] 第${attempt}次解析后题目数量: ${questions.length}`);
      
      // 严格验证每道题目
      const { valid, invalid } = filterQuestions(questions, chapterId, sectionId, true);
      
      console.log(`[generatePractice] 第${attempt}次通过验证: ${valid.length} 道`);
      console.log(`[generatePractice] 第${attempt}次过滤超纲: ${invalid.length} 道`);
      
      // 累积合格题目
      allValid = [...allValid, ...valid];
      
      // 详细记录被过滤的题目
      invalid.forEach((item, index) => {
        console.log(`[generatePractice] 第${attempt}次过滤题目 ${index + 1}: ${item.question.question.substring(0, 50)}...`);
        console.log(`[generatePractice] 过滤原因: ${item.reason}`);
      });
      
      allInvalid.push(...invalid);
      
      // 如果合格题目数量足够，提前结束
      if (allValid.length >= count) {
        break;
      }
    } catch (error) {
      console.error(`[generatePractice] 第${attempt}次生成失败:`, error);
      if (attempt === MAX_RETRIES) throw error;
    }
  }
  
  // 截取所需数量的合格题目
  const finalValid = allValid.slice(0, count);
  
  const warnings = allInvalid.map(item => 
    `${item.question.question.substring(0, 30)}...: ${item.reason}`
  );
  
  // 关键修复：如果过滤后没有合格的题目，不能fallback到原始题目（包含超纲题）
  if (finalValid.length === 0) {
    console.error(`[generatePractice] ❌ 重试${MAX_RETRIES}次后仍无合格题目`);
    return {
      questions: [],
      warning: `经过${MAX_RETRIES}次重试后，仍未生成符合"${knowledge.name}"小节要求的题目。被过滤的题目：\n${warnings.slice(0, 5).join('\n')}${warnings.length > 5 ? `\n...还有 ${warnings.length - 5} 道` : ''}`
    };
  }
  
  return {
    questions: finalValid,
    warning: warnings.length > 0 
      ? `以下 ${warnings.length} 道题目已过滤（涉及超纲内容）：\n${warnings.slice(0, 5).join('\n')}${warnings.length > 5 ? `\n...还有 ${warnings.length - 5} 道` : ''}` 
      : undefined
  };
}

// 获取章节列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const chapterId = searchParams.get('chapterId');

  if (action === 'chapters') {
    // 返回所有章节
    return NextResponse.json({
      success: true,
      data: getAllChapters()
    });
  }

  if (action === 'sections' && chapterId) {
    // 返回指定章节的小节列表
    const sections = getSectionsByChapter(chapterId);
    return NextResponse.json({
      success: true,
      data: sections
    });
  }

  if (action === 'knowledge' && chapterId) {
    const sectionId = searchParams.get('sectionId');
    if (!sectionId) {
      return NextResponse.json({
        success: false,
        message: '缺少sectionId参数'
      }, { status: 400 });
    }
    const knowledge = getSectionKnowledge(chapterId, sectionId);
    return NextResponse.json({
      success: true,
      data: knowledge
    });
  }

  return NextResponse.json({
    success: false,
    message: '无效的action参数'
  }, { status: 400 });
}

// 生成练习题
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { chapterId, sectionId, count = 5, difficulty = 'mixed' } = body;

    if (!chapterId || !sectionId) {
      return NextResponse.json({
        success: false,
        message: '缺少必要参数：chapterId 和 sectionId'
      }, { status: 400 });
    }

    // 获取知识索引
    const knowledge = getSectionKnowledge(chapterId, sectionId);
    if (!knowledge) {
      return NextResponse.json({
        success: false,
        message: `未找到章节 ${chapterId} 小节 ${sectionId} 的知识索引`
      }, { status: 404 });
    }

    // 检查API密钥
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({
        success: false,
        message: '未配置DeepSeek API密钥，请联系管理员配置 DEEPSEEK_API_KEY'
      }, { status: 500 });
    }

    // 生成练习题
    const result = await generatePractice(knowledge, chapterId, sectionId, count);

    return NextResponse.json({
      success: true,
      data: {
        questions: result.questions,
        sectionInfo: {
          chapterId,
          sectionId,
          name: knowledge.name,
          pageRange: knowledge.pageRange,
          description: knowledge.description,
          allowedTopics: knowledge.allowedTopics
        },
        warning: result.warning,
        total: result.questions.length
      }
    });

  } catch (error) {
    console.error('[generate-section-practice] 生成失败:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : '生成失败'
    }, { status: 500 });
  }
}
