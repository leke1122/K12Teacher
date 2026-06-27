import { NextRequest, NextResponse } from 'next/server';

/**
 * 还原课本 - AI自动分段+生成（严谨版本）
 *
 * 将章节内容发送给AI，一次性完成：
 * 1. 按知识点/语义单元自动分段
 * 2. 每段生成：原文 + 讲解 + 要点 + 问题
 *
 * 问题生成遵循严格标准：
 * - 有明确的教材依据
 * - 无歧义
 * - 选项互斥
 * - 表述精确
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      content,           // 章节原文
      chapterTitle,      // 章节标题
      pageRange,        // 页码范围
      subjectId = 'math',
      sectionId = '',   // 小节ID（如"1.1.1"）
      chapterContext,    // 可选：传入的章节上下文
      apiKey            // API密钥
    } = await request.json();

    if (!content) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    // 章节上下文映射
    const CHAPTER_CONTEXT: Record<string, { coreConcept: string; learningGoal: string; sectionPurpose: string }> = {
      '1.1.1': { coreConcept: '集合', learningGoal: '理解集合的概念，学会用集合的语言描述数学对象', sectionPurpose: '通过分类引入集合思想——分类是为了让研究对象更有条理' },
      '1.1.2': { coreConcept: '集合的表示方法', learningGoal: '掌握列举法和描述法表示集合', sectionPurpose: '学习如何用数学语言精确描述集合' },
      '1.2.1': { coreConcept: '集合的基本关系', learningGoal: '理解子集、真子集、相等概念', sectionPurpose: '比较不同集合之间的关系' },
      default: { coreConcept: '本章核心概念', learningGoal: '理解本节内容，与已学知识建立联系', sectionPurpose: '通过具体例子理解抽象概念' }
    };
    const ctx = chapterContext || CHAPTER_CONTEXT[sectionId] || CHAPTER_CONTEXT.default;

    console.log(`[AutoSegment] 开始处理，章节: ${chapterTitle}，内容长度: ${content.length}，核心概念: ${ctx.coreConcept}`);

    // 构建严谨的提示词
    const systemPrompt = `你是一位严谨的高中数学教师，擅长将教材内容拆解为易于学习的知识点，并设计有明确教材依据的练习题。

你的任务：
1. 将教材内容按知识点/语义单元自然分段
2. 每段必须是原文的一部分，一字不改
3. 每段包含一个完整的概念或知识点
4. 为每段生成通俗讲解和练习题

【核心原则】
1. 不能跳过原文任何部分，必须逐句处理
2. 问题必须严谨：正确答案在教材原文中有明确表述，错误选项必须明显、彻底错误
3. 题目表述精确，不使用"通常""一般"等模糊词

【错误选项设计规则】
- ❌ 禁止：将原文关键词换成相近词（如"按学科"→"按作者"，"正、负、零"→"正、负"）
- ❌ 禁止：两个选项都部分正确、让人难以判断
- ✅ 必须：错误选项与原文有明显的、容易发现的矛盾
- ✅ 正确示范：
  原文："整数分成正、负、零"
  正确选项：A. 整数分成正、负和零
  错误选项：B. 整数只分成正数和负数（明显遗漏了"零"）
             C. 整数分成奇数和偶数（完全不同分类标准）
             D. 整数分成正、负、一（"一"不是整数分类）

【重要】如果原文没有明确表述某个知识点，不要强行出题。`;

    const userPrompt = `请将以下教材内容按知识点拆解为多个学习段落。

教材章节：${chapterTitle}（${pageRange}页）

【本章核心概念】${ctx.coreConcept}
【本节学习目标】${ctx.learningGoal}
【本段学习目的】${ctx.sectionPurpose}

教材内容：
${content}

## 拆分要求
1. **不能跳过任何原文**：必须逐句处理教材内容，一字不漏
2. 每段必须是原文的一部分，一字不改（即使是很短的句子如"思考：为什么要进行分类"也要保留）
3. 按知识点/语义单元自然分段（每段包含一个完整的概念）
4. 段落数量控制在5-15个，不要太碎也不要太少
5. 优先按自然段落分割，遇到长段落可以拆分，但不得漏掉任何句子

【跳段检查】返回前请自检：
- 原文总字数 ≈ 所有段落原文总字数（允许5%以内的合理误差）
- 如果发现段落数量过少（如原文很长但只返回5-8段），说明可能跳段了，请补充分段

## 每段输出格式
- original: 原文摘录（一字不改，简洁完整）
- page: 估算页码（根据内容判断大概在哪一页）
- explanation: 用通俗易懂的语言讲解这段原文
  * 用生活化类比帮助理解
  * 语言简单，基础薄弱的学生也能听懂
  * 直击核心，不要废话
- keyPoints: 核心要点（2-4个）
- question: 一道选择题（必须严格遵循以下要求）

## 问题设计要求（必须严格遵守）

【问题类型优先级】核心概念理解优先于表面信息记忆：

✅ 最高优先：考察段落目的/深层含义
  - "这段文字的主要目的是什么？"
  - "通过这段内容，作者想说明什么？"
  - "这段内容与【${ctx.coreConcept}】有什么关系？"
  - "这段文字想引导我们思考什么？"

✅ 次高优先：考察方法/思想理解
  - "为什么要这样分类/比较/定义？"
  - "这种方法在数学中有什么作用？"
  - "这种思想的核心是什么？"

❌ 最低优先（尽量避免）：表面信息记忆
  - "原文提到了哪几个具体例子？"（仅当例子对理解核心概念很关键时）
  - 禁止问"整数分几类""图书馆按什么分类"这种纯粹考记忆的问题

1. **核心关联**：问题必须与【${ctx.coreConcept}】有关，引导学生思考"这段内容如何帮助我理解核心概念"
2. **教材依据**：正确答案在原文中必须有明确依据或符合逻辑推导
3. **答案唯一**：只有一个正确答案，不能有歧义
4. **选项互斥**：错误选项必须是"明显彻底错误"的
5. **表述精确**：题目用词严谨，不使用"通常""一般""可能"等模糊词
6. **难度**：基础题，考察核心概念理解

【禁止】
- 不要问原文里"具体提到了哪些例子"这种只考记忆的问题
- 不要问偏离【核心概念】的表面细节
- 不要出"通常""一般""可能"这类模糊题
- 不要出多个选项都可能正确的问题
- 不要出有明显争议的问题
- 禁止将原文关键词替换为相近词作为错误选项

【示例对比】
❌ 差问题（问表面细节）：
   "整数可以分成哪几类？" → 只是记原文，没有理解目的

✅ 好问题（问深层含义）：
   "作者为什么要举整数分类的例子？" → 理解引入目的
   "这段文字的主要目的是什么？" → 理解核心意图

## 返回格式（严格JSON，不要包含任何其他内容）
{
  "sections": [
    {
      "id": 1,
      "page": 3,
      "original": "原文内容...",
      "explanation": "通俗讲解...",
      "keyPoints": ["要点1", "要点2", "要点3"],
      "question": {
        "text": "题目内容（精确表述）",
        "options": ["A. 选项内容", "B. 选项内容", "C. 选项内容", "D. 选项内容"],
        "correct": "B",
        "explanation": "答案解析，必须说明教材依据",
        "optionReasoning": {
          "A": "判断理由（为什么对或错，与原文哪里矛盾）",
          "B": "判断理由",
          "C": "判断理由",
          "D": "判断理由"
        }
      }
    }
  ]
}`;

    // 调用 DeepSeek API
    if (apiKey) {
      try {
        console.log(`[AutoSegment] 调用 DeepSeek API...`);
        
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 10000
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[AutoSegment] API错误: ${response.status}`, errorText);
          throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        
        console.log(`[AutoSegment] API返回长度: ${rawContent.length}`);

        // 解析返回的JSON
        const result = parseSectionsResponse(rawContent);
        
        if (result.sections && result.sections.length > 0) {
          console.log(`[AutoSegment] 成功解析 ${result.sections.length} 个段落`);
          
          // 验证每个段落
          result.sections = result.sections.map((s: any, i: number) => ({
            id: s.id || i + 1,
            page: s.page || 3,
            original: s.original || s.content || '',
            explanation: s.explanation || '',
            keyPoints: Array.isArray(s.keyPoints) ? s.keyPoints : [],
            question: normalizeQuestion(s.question)
          })).filter((s: any) => s.original && s.original.length > 10);

          return NextResponse.json({
            success: true,
            sections: result.sections,
            total: result.sections.length
          });
        }

        throw new Error('未能解析出有效的段落');
      } catch (apiError) {
        console.error(`[AutoSegment] API调用失败:`, apiError);
        // API失败，使用本地处理
        return generateLocalSegments(content);
      }
    }

    // 没有API Key，使用本地处理
    console.log(`[AutoSegment] 无API Key，使用本地处理`);
    return generateLocalSegments(content);

  } catch (error) {
    console.error('[AutoSegment] 处理失败:', error);
    return NextResponse.json(
      { error: '处理失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

/**
 * 解析AI返回的内容
 */
function parseSectionsResponse(content: string): { sections: any[] } {
  try {
    let jsonStr = content.trim();
    
    // 移除markdown代码块
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    // 尝试直接解析JSON
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.sections && Array.isArray(parsed.sections)) {
        return parsed;
      }
    } catch {}

    // 尝试提取sections数组
    const sectionsMatch = jsonStr.match(/"sections"\s*:\s*\[([\s\S]*?)\]\s*[,}]/);
    if (sectionsMatch) {
      const sectionsStr = '[' + sectionsMatch[1] + ']';
      try {
        const sections = JSON.parse(sectionsStr);
        return { sections };
      } catch {}
    }

    // 尝试整个jsonStr
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch {
      // 继续尝试其他方法
    }

    return { sections: [] };
  } catch {
    return { sections: [] };
  }
}

/**
 * 规范化问题格式
 */
function normalizeQuestion(question: any): { text: string; options: string[]; correct: string; explanation: string } | null {
  if (!question) {
    return {
      text: '请认真阅读上文内容，选择正确答案',
      options: ['A. 完全理解了', 'B. 部分理解', 'C. 不太理解', 'D. 完全不懂'],
      correct: 'A',
      explanation: '请确保理解原文内容'
    };
  }

  let text = question.text || question.question || '';
  let options = question.options || question.choices || [];
  let correct = question.correct || question.answer || '';
  let explanation = question.explanation || question.解析 || '';

  // 确保options是数组
  if (typeof options === 'string') {
    options = [options];
  }

  // 确保options中的选项有A. B. C. D.前缀
  options = options.map((opt: string, i: number) => {
    const letter = String.fromCharCode(65 + i); // A, B, C, D
    if (opt.startsWith(letter + '.') || opt.startsWith(letter + '、')) {
      return opt;
    }
    return `${letter}. ${opt}`;
  });

  // 规范化答案
  correct = correct.toUpperCase();
  if (!/^[A-D]$/.test(correct)) {
    correct = 'A';
  }

  // 如果没有解析，添加默认解析
  if (!explanation) {
    explanation = '请参考原文内容进行判断';
  }

  return { text, options, correct, explanation };
}

/**
 * 本地生成段落（当API不可用时）
 */
function generateLocalSegments(content: string): NextResponse {
  // 按段落分割
  const paragraphs = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split(/\n\s*\n/)
    .filter(p => p.trim().length >= 30)
    .slice(0, 10); // 最多10个段落

  if (paragraphs.length === 0) {
    return NextResponse.json({
      success: false,
      error: '内容太短，无法分段'
    }, { status: 400 });
  }

  // 为每个段落生成基本结构
  const sections = paragraphs.map((p, i) => ({
    id: i + 1,
    page: 3 + Math.floor(i / 3),
    original: p.trim(),
    explanation: '请结合上下文理解这段内容。',
    keyPoints: ['理解原文含义', '注意关键概念'],
    question: {
      text: '这段内容主要讲了什么？',
      options: ['A. 理解了', 'B. 部分理解', 'C. 不太理解', 'D. 完全不懂'],
      correct: 'A',
      explanation: '请确保理解原文内容'
    }
  }));

  console.log(`[AutoSegment] 本地生成 ${sections.length} 个段落`);

  return NextResponse.json({
    success: true,
    sections,
    total: sections.length,
    isLocal: true
  });
}
