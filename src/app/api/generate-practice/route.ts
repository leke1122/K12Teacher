import { NextRequest, NextResponse } from 'next/server';
import {
  getKnowledgeRange,
  formatKnowledgeForPrompt,
  getSubjectName,
  type PracticeSectionKnowledge,
} from '@/lib/knowledgeScope';
import {
  generateQuestionTypeList,
  generateSeed,
  formatQuestionForAPI,
  buildTypeDescription,
  type QuestionType,
} from '@/lib/questionUtils';

/**
 * 生成章节练习题
 * 通用适配：数学、物理、化学、语文、英语等所有学科
 * 支持出题范围控制、题型分配、不重复保证
 */
export async function POST(request: NextRequest) {
  try {
    const {
      subjectId,
      chapterId,
      sectionId,
      difficulty = 'medium',
      pdfContext = '',
      questionCount = 10,
      apiKey,
    } = await request.json();

    if (!subjectId || !chapterId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const seed = generateSeed();
    const subjectName = getSubjectName(subjectId);

    // 获取知识点范围
    const { currentKnowledge, previousKnowledge } = getKnowledgeRange(
      subjectId,
      String(chapterId),
      sectionId
    );
    const { currentStr, previousStr } = formatKnowledgeForPrompt(currentKnowledge, previousKnowledge);

    // 生成题型列表
    const typeList = generateQuestionTypeList(difficulty as 'simple' | 'medium' | 'hard', questionCount);

    // 构建学科特定的出题提示词
    const subjectPrompt = buildSubjectPrompt(subjectId, difficulty, typeList, seed, currentStr, previousStr, pdfContext);

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
            messages: [
              { role: 'system', content: subjectPrompt.system },
              { role: 'user', content: subjectPrompt.user },
            ],
            temperature: 0.6,
            max_tokens: 8000,
          }),
        });

        if (!response.ok) throw new Error('API请求失败');
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const result = parseQuestions(content);
        return NextResponse.json({ success: true, questions: result.questions, seed });
      } catch (err) {
        console.error('[GeneratePractice] API失败，使用默认题目:', err);
        return NextResponse.json({
          success: true,
          questions: generateDefaultQuestions(subjectId, chapterId, sectionId, difficulty),
          seed,
        });
      }
    }

    return NextResponse.json({
      success: true,
      questions: generateDefaultQuestions(subjectId, chapterId, sectionId, difficulty),
      seed,
    });
  } catch (error) {
    console.error('[GeneratePractice] 处理失败:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}

// ===== 构建各学科出题提示词 =====

function buildSubjectPrompt(
  subjectId: string,
  difficulty: string,
  typeList: QuestionType[],
  seed: number,
  currentStr: string,
  previousStr: string,
  pdfContext: string
): { system: string; user: string } {
  const diffLabel = { simple: '简单', medium: '中等', hard: '困难' }[difficulty] || '中等';

  // 根据学科选择不同的提示词模板
  if (subjectId === 'math') {
    return buildMathPrompt(difficulty, diffLabel, typeList, seed, currentStr, previousStr, pdfContext);
  }
  if (subjectId === 'physics') {
    return buildPhysicsPrompt(difficulty, diffLabel, typeList, seed, currentStr, previousStr, pdfContext);
  }
  if (subjectId === 'chemistry') {
    return buildChemistryPrompt(difficulty, diffLabel, typeList, seed, currentStr, previousStr, pdfContext);
  }
  if (subjectId === 'chinese') {
    return buildChinesePrompt(difficulty, diffLabel, typeList, seed, currentStr, previousStr, pdfContext);
  }
  if (subjectId === 'english') {
    return buildEnglishPrompt(difficulty, diffLabel, typeList, seed, currentStr, previousStr, pdfContext);
  }
  // 默认通用模板
  return buildGenericPrompt(subjectId, difficulty, diffLabel, typeList, seed, currentStr, previousStr, pdfContext);
}

function buildMathPrompt(
  difficulty: string,
  diffLabel: string,
  typeList: QuestionType[],
  seed: number,
  currentStr: string,
  previousStr: string,
  pdfContext: string
): { system: string; user: string } {
  const systemPrompt = `你是一位资深高中数学教师，精通辽宁高考出题规律，擅长设计原创练习题。

【核心原则】
1. 绝对原创：题目必须是你原创设计的，严禁复制任何已有题目
2. 不超纲：只考察当前及之前学过的知识点
3. 不重复：每次生成的题目必须不同，通过改变数值、表述、角度实现
4. 严谨规范：使用标准数学符号和术语

【难度标准】
- 简单：直接考察概念或公式的直接应用，1步解答
- 中等：需要1-2步推理或计算
- 困难：综合性强，需多步推理或多个知识点融合

【题型要求】
- 选择题（choice）：4个选项，干扰项合理，不能似是而非
- 填空题（fill）：答案唯一，考察计算准确性
- 计算题（calculation）：考察解题步骤规范性

【数学符号规范】
集合：∈, ∉, ⊆, ⊂, ⊇, ⊃, ∪, ∩, ∅, ∁
运算：+, −, ×, ÷, ±, √, ², ³, π, Δ
关系：=, ≠, <, >, ≤, ≥, ≈, ⇒, ⇔, →
其他：∀, ∃, ∞, ∑, ∫, {, }, [, ]

【选项设计规则】
- 干扰项必须是"明显错误"或"容易发现的矛盾"
- 禁止：把正确关键词换成相近词（❌）
- 正确：错误选项与正确选项有明显不同点（✅）`;

  const userPrompt = `请生成一套高中数学章节练习题。

### 基本信息
- 学科：高中数学
- 难度：${diffLabel}（全部为${diffLabel}难度）
- 随机种子：${seed}（确保每次题目不同）
- 题目数量：${typeList.length}道

### 出题范围（严格遵守！）
当前小节知识点（占60%左右）：
${currentStr}

之前小节知识点（占40%左右，用于复习巩固）：
${previousStr}

${pdfContext ? `### 教材内容参考\n${pdfContext.substring(0, 2000)}\n` : ''}

### 题型分配（共${typeList.length}题）
${typeList.map((t, i) => `  第${i + 1}题：${t === 'choice' ? '选择题' : t === 'fill' ? '填空题' : '计算题'}`).join('\n')}

### 出题规则
1. 题目必须覆盖上述所有知识点
2. 每道题不同，不能重复或高度相似
3. 变化角度：概念理解 / 计算 / 判断 / 应用 / 综合
4. 同一知识点可通过改变数值或表述出多道不同题目

### 格式要求（严格JSON）
{
  "questions": [
    {
      "id": 1,
      "type": "choice|fill|calculation",
      "difficulty": "${difficulty}",
      "knowledgePoint": "知识点名称",
      "source": "current|previous",
      "question": "题目内容（使用Unicode数学符号，如：A∩B, x², √2）",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "正确答案",
      "explanation": "解题思路",
      "steps": ["第1步：...", "第2步：..."]
    }
  ]
}`;

  return { system: systemPrompt, user: userPrompt };
}

function buildPhysicsPrompt(
  difficulty: string,
  diffLabel: string,
  typeList: QuestionType[],
  seed: number,
  currentStr: string,
  previousStr: string,
  pdfContext: string
): { system: string; user: string } {
  const systemPrompt = `你是一位资深高中物理教师，精通辽宁高考物理出题规律，擅长设计原创练习题。

【核心原则】
1. 绝对原创：题目必须是你原创设计的
2. 不超纲：只考察当前及之前学过的知识点
3. 不重复：通过改变情境、数值、条件实现题目差异化
4. 注重物理意义：每道题都要有明确的物理意义

【难度标准】
- 简单：直接套公式，1步完成
- 中等：需要理解物理过程，1-2步计算
- 困难：综合性强，需分析多个物理过程

【题型要求】
- 选择题：考察概念理解和简单计算
- 填空题：考察物理量计算结果
- 计算题：考察分析过程和步骤规范

【物理符号规范】
位移：x, Δx, s  速度：v, v₀, vt  加速度：a
力：F, N, f, G  功：W  功率：P  能：Ek, Ep
时间：t  质量：m  密度：ρ  压强：p`;

  const userPrompt = `请生成一套高中物理章节练习题。

### 基本信息
- 学科：高中物理
- 难度：${diffLabel}
- 随机种子：${seed}
- 题目数量：${typeList.length}道

### 出题范围
当前小节知识点（60%）：
${currentStr}

之前小节知识点（40%）：
${previousStr}

${pdfContext ? `### 教材内容参考\n${pdfContext.substring(0, 2000)}\n` : ''}

### 题型分配
${typeList.map((t, i) => `  第${i + 1}题：${t === 'choice' ? '选择题' : t === 'fill' ? '填空题' : '计算题'}`).join('\n')}

### 格式要求（严格JSON）
{
  "questions": [
    {
      "id": 1,
      "type": "choice|fill|calculation",
      "difficulty": "${difficulty}",
      "knowledgePoint": "知识点名称",
      "source": "current|previous",
      "question": "题目内容（物理量用标准符号）",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "正确答案",
      "explanation": "解题思路",
      "steps": ["第1步：...", "第2步：..."]
    }
  ]
}`;

  return { system: systemPrompt, user: userPrompt };
}

function buildChemistryPrompt(
  difficulty: string,
  diffLabel: string,
  typeList: QuestionType[],
  seed: number,
  currentStr: string,
  previousStr: string,
  pdfContext: string
): { system: string; user: string } {
  const systemPrompt = `你是一位资深高中化学教师，精通辽宁高考化学出题规律。

【核心原则】
1. 绝对原创：题目必须是你原创设计的
2. 不超纲：只考察当前及之前学过的知识点
3. 注重化学思维：宏观辨识与微观探析相结合

【难度标准】
- 简单：直接考察化学概念或方程式
- 中等：需要化学方程式计算或物质性质判断
- 困难：综合性强，融合多个知识点

【题型要求】
- 选择题：概念辨析、物质性质、反应判断
- 填空题：方程式书写、计算结果
- 计算题：化学计算步骤规范

【化学符号规范】
原子：H, O, C, Na, Cl, Fe, Cu  离子：H⁺, OH⁻, Na⁺, Cl⁻
方程式：→, ⇌, ↑, ↓, Δ
结构式：—OH, —COOH, —NH₂`;

  const userPrompt = `请生成一套高中化学章节练习题。

### 基本信息
- 学科：高中化学
- 难度：${diffLabel}
- 随机种子：${seed}
- 题目数量：${typeList.length}道

### 出题范围
当前小节知识点（60%）：
${currentStr}

之前小节知识点（40%）：
${previousStr}

${pdfContext ? `### 教材内容参考\n${pdfContext.substring(0, 2000)}\n` : ''}

### 题型分配
${typeList.map((t, i) => `  第${i + 1}题：${t === 'choice' ? '选择题' : t === 'fill' ? '填空题' : '计算题'}`).join('\n')}

### 格式要求（严格JSON）
{
  "questions": [
    {
      "id": 1,
      "type": "choice|fill|calculation",
      "difficulty": "${difficulty}",
      "knowledgePoint": "知识点名称",
      "source": "current|previous",
      "question": "题目内容",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "正确答案",
      "explanation": "解题思路",
      "steps": ["第1步：...", "第2步：..."]
    }
  ]
}`;

  return { system: systemPrompt, user: userPrompt };
}

function buildChinesePrompt(
  difficulty: string,
  diffLabel: string,
  typeList: QuestionType[],
  seed: number,
  currentStr: string,
  previousStr: string,
  pdfContext: string
): { system: string; user: string } {
  const systemPrompt = `你是一位资深高中语文教师，精通辽宁高考语文出题规律。

【核心原则】
1. 绝对原创：题目必须是你原创设计的
2. 不超纲：只考察当前及之前学过的知识点
3. 注重语言运用：字词句篇综合考察

【难度标准】
- 简单：直接考察识记内容（字音、字形、默写）
- 中等：需要理解分析（诗词鉴赏、文言文阅读）
- 困难：综合性强，需要深度理解和表达

【题型要求】
- 选择题：字词辨析、诗词鉴赏、文言文语法
- 填空题：名句默写、文言词汇
- 计算题（简答题）：阅读理解、鉴赏分析`;

  const userPrompt = `请生成一套高中语文章节练习题。

### 基本信息
- 学科：高中语文
- 难度：${diffLabel}
- 随机种子：${seed}
- 题目数量：${typeList.length}道

### 出题范围
当前小节知识点（60%）：
${currentStr}

之前小节知识点（40%）：
${previousStr}

${pdfContext ? `### 教材内容参考\n${pdfContext.substring(0, 2000)}\n` : ''}

### 题型分配
${typeList.map((t, i) => `  第${i + 1}题：${t === 'choice' ? '选择题' : t === 'fill' ? '填空题' : '简答题'}`).join('\n')}

### 格式要求（严格JSON）
{
  "questions": [
    {
      "id": 1,
      "type": "choice|fill|calculation",
      "difficulty": "${difficulty}",
      "knowledgePoint": "知识点名称",
      "source": "current|previous",
      "question": "题目内容",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "正确答案",
      "explanation": "解题思路",
      "steps": ["第1步：...", "第2步：..."]
    }
  ]
}`;

  return { system: systemPrompt, user: userPrompt };
}

function buildEnglishPrompt(
  difficulty: string,
  diffLabel: string,
  typeList: QuestionType[],
  seed: number,
  currentStr: string,
  previousStr: string,
  pdfContext: string
): { system: string; user: string } {
  const systemPrompt = `你是一位资深高中英语教师，精通辽宁高考英语出题规律。

【核心原则】
1. 绝对原创：题目必须是你原创设计的
2. 不超纲：只考察当前及之前学过的词汇和语法
3. 注重语境：所有题目在真实语境中考察

【难度标准】
- 简单：直接考察词汇含义或基础语法
- 中等：需要理解语境和语篇
- 困难：需要综合分析和推断

【题型要求】
- 选择题：语法、完形填空、阅读理解
- 填空题：词汇运用、语法填空
- 计算题（简答题）：阅读理解简答、写作`;

  const userPrompt = `请生成一套高中英语章节练习题。

### 基本信息
- 学科：高中英语
- 难度：${diffLabel}
- 随机种子：${seed}
- 题目数量：${typeList.length}道

### 出题范围
当前小节知识点（60%）：
${currentStr}

之前小节知识点（40%）：
${previousStr}

${pdfContext ? `### 教材内容参考\n${pdfContext.substring(0, 2000)}\n` : ''}

### 题型分配
${typeList.map((t, i) => `  第${i + 1}题：${t === 'choice' ? '选择题' : t === 'fill' ? '填空题' : '简答题'}`).join('\n')}

### 格式要求（严格JSON）
{
  "questions": [
    {
      "id": 1,
      "type": "choice|fill|calculation",
      "difficulty": "${difficulty}",
      "knowledgePoint": "知识点名称",
      "source": "current|previous",
      "question": "题目内容",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "正确答案",
      "explanation": "解题思路",
      "steps": ["第1步：...", "第2步：..."]
    }
  ]
}`;

  return { system: systemPrompt, user: userPrompt };
}

function buildGenericPrompt(
  subjectId: string,
  difficulty: string,
  diffLabel: string,
  typeList: QuestionType[],
  seed: number,
  currentStr: string,
  previousStr: string,
  pdfContext: string
): { system: string; user: string } {
  const systemPrompt = `你是一位资深高中${getSubjectName(subjectId)}教师，精通出题规律，擅长设计原创练习题。

【核心原则】
1. 绝对原创：题目必须是你原创设计的
2. 不超纲：只考察当前及之前学过的知识点
3. 不重复：每次生成的题目必须不同`;

  const userPrompt = `请生成一套高中${getSubjectName(subjectId)}章节练习题。

### 基本信息
- 学科：${getSubjectName(subjectId)}
- 难度：${diffLabel}
- 随机种子：${seed}
- 题目数量：${typeList.length}道

### 出题范围
当前小节知识点（60%）：
${currentStr}

之前小节知识点（40%）：
${previousStr}

${pdfContext ? `### 教材内容参考\n${pdfContext.substring(0, 2000)}\n` : ''}

### 题型分配
${typeList.map((t, i) => `  第${i + 1}题：${t === 'choice' ? '选择题' : t === 'fill' ? '填空题' : '解答题'}`).join('\n')}

### 格式要求（严格JSON）
{
  "questions": [
    {
      "id": 1,
      "type": "choice|fill|calculation",
      "difficulty": "${difficulty}",
      "knowledgePoint": "知识点名称",
      "source": "current|previous",
      "question": "题目内容",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "正确答案",
      "explanation": "解题思路",
      "steps": []
    }
  ]
}`;

  return { system: systemPrompt, user: userPrompt };
}

// ===== 解析和规范化 =====

function parseQuestions(content: string): { questions: any[] } {
  let jsonStr = content.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

  try {
    const parsed = JSON.parse(jsonStr);
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];
    return { questions: questions.map(formatQuestionForAPI) };
  } catch {
    return { questions: [] };
  }
}

function generateDefaultQuestions(subjectId: string, chapterId: string, sectionId: string, difficulty: string): any[] {
  const typeList = generateQuestionTypeList(difficulty as 'simple' | 'medium' | 'hard', 10);
  const diffLabel = { simple: '简单', medium: '中等', hard: '困难' }[difficulty] || '中等';

  return typeList.map((type, i) => ({
    id: `q_${i + 1}_${Date.now()}`,
    type,
    difficulty,
    knowledgePoint: '基础知识',
    source: 'current',
    text: `第${chapterId}章第${sectionId}节练习题（第${i + 1}题）：请根据教材内容作答。`,
    options: type === 'choice'
      ? ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D']
      : [],
    correctAnswer: 'A',
    explanation: '请参考教材内容',
    steps: [],
    commonMistakes: [],
  }));
}
