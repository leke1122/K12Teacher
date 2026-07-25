import { NextRequest, NextResponse } from 'next/server';

/**
 * 精准修复 PDF 文本中的"元/元素"混淆问题
 *
 * PDF 字体编码错误会把集合符号 A 错误渲染为汉字"元"，
 * 导致"元素"和"集合符号A"混淆。
 *
 * 策略：
 * 1. 用零宽空格保护"元素"（元素本身不需要替换）
 * 2. 识别独立的集合符号"元"（前后有明确分隔）→ "A"
 * 3. 还原所有零宽空格
 *
 * 原始文本: "如果a是集合元的元素,就记作a∈元,读作a属于元"
 * 处理后:   "如果a是集合A的元素,就记作a∈A,读作a属于A"
 */
function fixYuansuConfusion(text: string): string {
  if (!text) return text;
  let result = text;

  // 步骤1：保护"元素"——用零宽空格包裹，这样后续替换不会影响它
  result = result.replace(/元素/g, '\u200B元素\u200B');

  // 步骤2：修复 PDF 误拆产生的"A素"或"A 素"（"元素"被打散）
  result = result.replace(/A([\s　]+)素/g, '元素');
  result = result.replace(/A素/g, '元素');

  // 步骤3：精准替换集合符号"元" → "A"
  //
  // PDF 字体错误把 ∈、∈ 渲染成了"元"，产生两种情况：
  // (a) 独立符号元：有数学运算符/标点/空白作前后缀 → 替换为 A
  // (b) 元元相连：PDF把∈渲染成"元"导致两个"元"连在一起 → 都替换为 A
  //
  // 核心正则：用负向前查(?!)排除"元"后紧跟汉字/字母的情况

  // (a) 独立符号元：元前后有分隔符/运算符 → 替换为 A
  const leftSep  = '([\\s　,，;。.!！？、…—–\\(\\[∈∉⊆⊂⊇⊃∩∪])';
  const rightSep = '([\\s　,，;。.!！？、…—–\\)\\]∈∉⊆⊂⊇⊃∩∪]|$)';
  result = result.replace(new RegExp(leftSep + '元' + rightSep, 'g'), '$1A$2');

  // (a') 句首独立符号元
  result = result.replace(new RegExp('^元' + rightSep, 'g'), 'A$1');

  // (b) 元元相连：PDF把∈渲染成了元，两个元都要替换为A
  result = result.replace(/元元([。.!！？、…;，)）\]])?/g, 'AA$1');
  result = result.replace(/([(（\[{])元元/g, '$1AA');
  result = result.replace(/^元元/g, 'AA');
  // (c) ∈元 直接相连：∈后紧跟元（∈被渲染成元导致∈元相连）
  result = result.replace(/∈元/g, '∈A');

  // (d) 兜底修复：∈∈素 / ∈素 是 MATH_SYMBOL_MAP 中 '元': '∈' 把"元素"误转换后的残留
  result = result.replace(/∈∈素/g, '元素');
  result = result.replace(/∈素/g, '元素');

  // 步骤4：兜底还原——受保护的"元" + 空格/不可见 + "素" → "元素"
  result = result.replace(/(\u200B元)[\s　]+(素)/g, '$1$2');

  // 步骤5：移除所有零宽空格
  result = result.replace(/\u200B/g, '');

  // 步骤6：修复历史课本特有乱码（DOCX特殊字体映射错误，字母被拼在一起）
  const garbledPairs: [string, string][] = [
    ['cM', 'M'], ['cd', 'M'], ['CM', 'M'],
    ['CF', 'H'], ['cF', 'H'],
    ['D4', 'D'],
    ['DM', 'M'],
  ];
  for (const [garbled, correct] of garbledPairs) {
    result = result.split(garbled).join(correct);
  }

  return result;
}

/**
 * 检测文本中是否存在元/元素混淆（用于调试）
 * 使用与 fixYuansuConfusion 一致的匹配规则
 */
function detectYuansuConfusion(text: string): { problems: string[]; summary: string } {
  const problems: string[] = [];

  // 检测独立的"元"（非"元素"组成部分）
  // 包含：独立符号元（有分隔符）和元元相连（∈被打成元）
  const leftSep  = '[\\s　,，;。.!！？、…—–\\(\\[∈∉⊆⊂⊇⊃∩∪]';
  const rightSep = '[\\s　,，;。.!！？、…—–\\)\\]∈∉⊆⊂⊇⊃∩∪]|$';
  const standalonePattern = new RegExp(`(${leftSep})元(${rightSep})|(^元(${rightSep}))|(元元)`, 'g');
  const standaloneMatches = [...text.matchAll(standalonePattern)];
  for (const m of standaloneMatches) {
    const pos = m.index ?? 0;
    const snippet = text.slice(Math.max(0, pos - 5), pos + 10);
    problems.push(`"元"在位置${pos}：…${snippet}…`);
  }

  // 检测"A素"（本应是"元素"但被错误替换后又部分还原）
  const aSuMatches = [...text.matchAll(/A素|A\s素/g)];
  for (const m of aSuMatches) {
    problems.push(`"A素"疑似错误替换在位置${m.index}：${m[0]}`);
  }

  return {
    problems,
    summary: problems.length === 0 ? '未检测到元/元素混淆' : `发现${problems.length}处疑似混淆`
  };
}

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

    // 精准预处理：修复"元/元素"混淆，再送去 AI
    const fixedContent = fixYuansuConfusion(content);
    const detected = detectYuansuConfusion(content);
    if (detected.problems.length > 0) {
      console.log(`[AutoSegment] 原文检测到混淆: ${detected.summary}`, detected.problems);
    }

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

教材内容（已预处理）：
${fixedContent}

## 拆分要求
1. **不能跳过任何原文**：必须逐句处理教材内容，一字不漏
2. 每段必须是原文的一部分，一字不改（即使是很短的句子如"思考：为什么要进行分类"也要保留）
3. **按知识点/语义单元分段**：每段包含一个完整的小知识点；遇到新概念、新定义、新例子、新问题，都要独立成段
4. **不限制段落数量**：知识点多就多拆，知识点少就少拆，完全由内容决定
5. 优先按自然段落分割，遇到长段落可以拆分，但不得漏掉任何句子
6. 短定义、独立例子、思考问题各占一段，不要强行合并

【跳段检查】返回前请自检：
- 原文总字数 ≈ 所有段落原文总字数（允许5%以内的合理误差）
- 检查是否每个新概念/新定义/新例子都独立成段
- 如果发现段落数量过少，说明可能跳段了，请补充分段

## 精准符号还原说明（重要！）
教材中出现的"元"字有两种含义：
- **集合符号"元"**：表示集合的名称，如"集合通常用英文大写字母A,B,C,…表示"，这里"元"应替换为"A"
- **"元素"的组成部分**：如"组成集合的每个对象都是这个集合的元素"，这里"元素"是完整词汇，不能拆分

请在返回的 original 字段中，**将所有集合符号"元"正确还原为"A"**，保持其他"元"字不变。

**示例**：
- 原文输入："用英文大写字母元,B,C表示"
- 正确还原："用英文大写字母A,B,C表示"
- 原文输入："就记作a∈元，读作a属于元"
- 正确还原："就记作a∈A，读作a属于A"
- 原文输入："集合的元素"
- 保持不变："集合的元素"（不是"集合的A素"）

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
            model: 'deepseek-v4-flash',
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
          
          // 验证并标准化每个段落
          let normalized = result.sections.map((s: any, i: number) => ({
            id: s.id || i + 1,
            page: s.page || 3,
            original: s.original || s.content || '',
            explanation: s.explanation || '',
            keyPoints: Array.isArray(s.keyPoints) ? s.keyPoints : [],
            question: normalizeQuestion(s.question)
          })).filter((s: any) => s.original && s.original.length > 10);

          // 强制段落长度控制：每段 original ≤ 200字
          // 将超长段落按完整句子拆分为多个子段
          const MAX_ORIGINAL_LEN = 200;
          const expanded: typeof normalized = [];
          for (const s of normalized) {
            const parts = splitLongOriginal(s.original, MAX_ORIGINAL_LEN);
            if (parts.length === 1) {
              expanded.push(s);
            } else {
              // 每个子段复用父段的讲解和题目（子段共享同一知识点）
              for (let i = 0; i < parts.length; i++) {
                expanded.push({
                  ...s,
                  id: expanded.length + 1,
                  original: parts[i],
                  page: s.page + Math.floor(i / 3), // 估算子段页码
                });
              }
            }
          }

          console.log(`[AutoSegment] 长度控制后：${normalized.length} → ${expanded.length} 个段落`);
          return NextResponse.json({
            success: true,
            sections: expanded,
            total: expanded.length
          });
        }

        throw new Error('未能解析出有效的段落');
      } catch (apiError) {
        console.error(`[AutoSegment] API调用失败:`, apiError);
        // API失败，使用本地处理（使用已修复的文本）
        return generateLocalSegments(fixedContent);
      }
    }

    // 没有API Key，使用本地处理（使用已修复的文本）
    console.log(`[AutoSegment] 无API Key，使用本地处理`);
    return generateLocalSegments(fixedContent);

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
 * 将过长的原文按完整句子拆分为多个子段落
 * 每段不超过 maxLen（默认200字），确保不截断半句
 */
function splitLongOriginal(text: string, maxLen: number = 200): string[] {
  if (!text || text.length <= maxLen) return [text];

  // 按完整句子拆分（保留句子结束标点）
  const sentences = text.split(/(?<=[。！？「」；])/);
  const result: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length <= maxLen) {
      current += trimmed;
    } else {
      // 当前块够大，保存并开始新块
      if (current) result.push(current.trim());
      // 如果单个句子就超长了，按逗号再拆分
      if (trimmed.length > maxLen) {
        const parts = trimmed.split(/(?=[，、])/);
        let sub = '';
        for (const p of parts) {
          if (sub.length + p.length <= maxLen) {
            sub += p;
          } else {
            if (sub) result.push(sub.trim());
            sub = p.length <= maxLen ? p : p.slice(0, maxLen);
          }
        }
        current = sub;
      } else {
        current = trimmed;
      }
    }
  }

  if (current.trim()) result.push(current.trim());
  return result.length > 0 ? result : [text];
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
  const rawParagraphs = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split(/\n\s*\n/)
    .filter(p => p.trim().length >= 30)
    .slice(0, 10); // 最多10个段落

  if (rawParagraphs.length === 0) {
    return NextResponse.json({
      success: false,
      error: '内容太短，无法分段'
    }, { status: 400 });
  }

  // 强制段落长度控制：每段 original ≤ 200字
  const expanded: { id: number; page: number; original: string }[] = [];
  for (const p of rawParagraphs) {
    const parts = splitLongOriginal(p.trim(), 200);
    for (const part of parts) {
      expanded.push({
        id: expanded.length + 1,
        page: 3 + Math.floor(expanded.length / 3),
        original: part,
      });
    }
  }

  // 为每个段落生成基本结构
  const sections = expanded.map((s, i) => ({
    id: i + 1,
    page: s.page,
    original: s.original,
    explanation: '请结合上下文理解这段内容。',
    keyPoints: ['理解原文含义', '注意关键概念'],
    question: {
      text: '这段内容主要讲了什么？',
      options: ['A. 理解了', 'B. 部分理解', 'C. 不太理解', 'D. 完全不懂'],
      correct: 'A',
      explanation: '请确保理解原文内容'
    }
  }));

  console.log(`[AutoSegment] 本地生成 ${sections.length} 个段落（强制拆分后）`);

  return NextResponse.json({
    success: true,
    sections,
    total: sections.length,
    isLocal: true
  });
}
