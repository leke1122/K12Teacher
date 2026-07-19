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
  // 构建严格的系统提示
  const systemPrompt = `你是一位专业的高中数学教师。你需要根据给定的知识点生成练习题目。

【重要规则】
1. 只能出本小节范围内的题目，禁止出现任何后续章节的知识点
2. 题目难度适中，适合刚学完该小节的学生
3. 每道题必须有详细的解析
4. 题目必须原创，不能照抄教材或教辅资料
5. 选择题和填空题混合

【允许的知识点】
${knowledge.allowedTopics.join('、')}

【禁止出现的知识点（后续章节）】
${knowledge.forbiddenTopics.join('、')}

【前置知识点（可以使用）】
${knowledge.prerequisiteTopics.length > 0 ? knowledge.prerequisiteTopics.join('、') : '无'}

【必须包含的题型特征】
${knowledge.requiredPatterns?.map(p => `${p.reason}（匹配模式：${p.regex}）`).join('\n') || '无'}

【严格禁止的题型特征】
${knowledge.forbiddenPatterns?.map(p => `${p.reason}（匹配模式：${p.regex}）`).join('\n') || '无'}

输出格式：
每道题格式如下：
题1. [题目内容]
A. [选项A]
B. [选项B]
C. [选项C]
D. [选项D]
答案：[答案]
解析：[详细解析]

题2. [填空题题目]
答案：[答案]
解析：[详细解析]`;

  const prompt = `请为以下小节生成${count}道练习题：

小节名称：${knowledge.name}
允许的知识点：${knowledge.allowedTopics.join('、')}
禁止的知识点（严禁出现任何以下内容）：${knowledge.forbiddenTopics.join('、')}
前置知识点（可辅助使用）：${knowledge.prerequisiteTopics.join('、') || '无'}
页数范围：${knowledge.pageRange}
小节描述：${knowledge.description}

【必须包含的题型特征】
${knowledge.requiredPatterns?.map(p => `- ${p.reason}`).join('\n') || '无'}

【严格禁止的题型特征】
${knowledge.forbiddenPatterns?.map(p => `- ${p.reason}`).join('\n') || '无'}

【关键要求】
1. 所有题目必须严格只涉及"允许的知识点"
2. 严禁出现"禁止的知识点"中的任何内容
3. 例如：如果选择"3.1函数的概念"，则不能出现集合、子集、交集、并集、补集、单调性、奇偶性、导数、三角函数等后续章节的内容
4. 只能出函数概念相关的题目，如：求定义域、求值域、函数三要素、函数表示法等`;

  try {
    const generatedText = await callDeepSeek(prompt, systemPrompt);
    const questions = parseQuestions(generatedText, chapterId, sectionId);
    
    // 严格验证每道题目（使用综合验证：关键词 + 模式）
    const { valid, invalid } = filterQuestions(questions, chapterId, sectionId, true);
    
    const warnings = invalid.map(item => 
      `${item.question.question.substring(0, 30)}...: ${item.reason}`
    );
    
    return {
      questions: valid.length > 0 ? valid : questions,
      warning: warnings.length > 0 
        ? `以下 ${warnings.length} 道题目已过滤（涉及超纲内容）：\n${warnings.join('\n')}` 
        : undefined
    };
  } catch (error) {
    throw error;
  }
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
