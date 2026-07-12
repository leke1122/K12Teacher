/**
 * 整页扫描批改 - 智能引导讲解 API v5
 * AI 分析题目后，生成针对性的引导问题引导学生一步步思考
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

interface ExplainRequest {
  question: string;
  knowledgePoint: string;
  phase: 'understanding' | 'thinking' | 'judge';
  step?: number;
  studentAnswer?: string;
  correctAnswer?: string;
  userResponse?: string;
  isHandwriting?: boolean;
  practiceAnswer?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 从请求头、请求体或环境变量获取 API Key
    const apiKey = request.headers.get('x-qwen-api-key') || process.env.QWEN_API_KEY || '';
    const body = await request.json().catch(() => ({}));
    const requestApiKey = body.apiKey;
    const effectiveApiKey = requestApiKey || apiKey;

    if (!effectiveApiKey) {
      return NextResponse.json({ success: false, error: '请配置 Qwen API Key' });
    }

    const { question, knowledgePoint, phase, step = 0, studentAnswer, correctAnswer, userResponse, isHandwriting } = body;

    let content = '';
    let isComplete = false;
    let isCorrect = false;
    let summary = '';
    let nextStep = step;
    let recognizedText: string | undefined;

    if (phase === 'understanding') {
      // 理解阶段：分析题目，给出针对性的引导问题
      const result = await generateTargetedGuidance(question, knowledgePoint, correctAnswer || '', effectiveApiKey);
      content = result.content;
      nextStep = result.nextStep;
      summary = result.summary;
    } else if (phase === 'thinking') {
      // 思考阶段：评判学生回答
      const result = await evaluateStudentResponse(
        question, knowledgePoint, step, correctAnswer || '', userResponse || '',
        isHandwriting || false, effectiveApiKey
      );
      content = result.content;
      isComplete = result.isComplete;
      isCorrect = result.isCorrect;
      nextStep = result.nextStep;
      summary = result.summary || '';
      recognizedText = result.recognizedText;
    } else if (phase === 'judge') {
      // judge 阶段：评判学生的手写或打字答案
      const { practiceAnswer, isHandwriting: practiceIsHandwriting } = body;

      const result = await evaluateStudentResponse(
        question, knowledgePoint, 0, correctAnswer || '', practiceAnswer || '',
        practiceIsHandwriting || false, effectiveApiKey
      );
      content = result.content;
      isComplete = result.isComplete;
      isCorrect = result.isCorrect;
      nextStep = result.nextStep;
      summary = result.summary || '';
      recognizedText = result.recognizedText;
    }

    console.log(`[BatchExplain] ${phase} 阶段处理耗时: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      content,
      isStepCorrect: isCorrect,
      isComplete,
      summary,
      nextStep,
      recognizedText,
    });
  } catch (error: any) {
    console.error('[BatchExplain] 处理失败:', error);
    return NextResponse.json({ success: false, error: error?.message || '处理失败' });
  }
}

// ============ 理解阶段：生成针对性的引导问题 ============
async function generateTargetedGuidance(
  question: string,
  knowledgePoint: string,
  correctAnswer: string,
  apiKey: string
): Promise<{ content: string; nextStep: number; summary: string }> {

  const openai = createOpenAI({ apiKey, baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' });

  const prompt = `你是一个耐心、细心的数学辅导老师，专门帮助数学基础薄弱的学生。你需要为这道题生成一个超级详细的引导，让学生不但知道怎么做，还完全理解为什么这么做。

**题目**：${question}
**知识点**：${knowledgePoint}
**正确答案**：${correctAnswer || '（未知）'}

## 【最重要的指导原则】

你生成的引导必须满足以下所有要求：

### 1. 极度详细的步骤拆解
- 把解题过程拆成最小的步骤，每一步都不能跳过
- 每个步骤都要解释"为什么这样做"
- 预判学生可能卡在哪里，提前解释清楚

### 2. 语言要像给数学差生讲题
- 假设学生是数学薄弱的学生，需要反复讲解才能理解
- 用最通俗易懂的语言，避免专业术语（除非必要）
- 多用类比、举例、对比来解释概念

### 3. 生成内容要求
- 生成 1 个具体的、有明确答案方向的问题
- 问题要让学生知道应该写什么
- 必须包含【详细解题思路】，这一步一步地讲解
- 控制在 80-150 字（包括详细思路）

### 4. 引导示例模板（针对集合证明题）

【问题】：请根据题目给出的定义，分别写出集合A和B的元素...

【详细解题思路】：
第1步 - 理解题目：题目给出了集合A和B的定义式...
第2步 - 代入计算：把n=0,1,2...代入公式...
第3步 - 列出元素：...
第4步 - 思考证明：如何说明B中每个元素都在A中？...

直接输出，不要加标题或多余格式。

**示例**：
- 题目：已知 A={x|x=2n, n∈N}，B={x|x=4n, n∈N}，证明 B⊆A
  输出：
  【问题】：请分别写出集合A和B中最小的3个元素，并说明为什么B中的每个元素都属于A。
  
  【详细解题思路】：
  第1步（理解集合定义）：A={x|x=2n, n∈N} 表示"A是所有形如2n的数，其中n是自然数"。B={x|x=4n, n∈N} 同理。
  第2步（代入n值）：把n=0,1,2...代入：A=0,2,4...；B=0,4,8...
  第3步（观察规律）：B中的每个数（如0,4,8）都是2的倍数吗？是的！因为4n = 2×(2n)，符合A的定义
  第4步（写出证明）：因为 B中的任意元素x = 4n = 2×(2n)，其中2n∈N，所以x∈A`;

  try {
    const result = await generateText({
      model: openai('qwen-plus'),
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 300,
    });

    let content = (result.text || '').trim();

    // 解析 AI 生成的引导问题（支持新旧两种格式）
    // 新格式：包含【详细解题思路】
    const questionMatch = content.match(/【问题】[：:]\s*([\s\S]*?)(?:【详细解题思路】|【提示】|$)/i);
    const hintMatch = content.match(/【详细解题思路】[：:]\s*([\s\S]*?)(?:【提示】|$)/i);
    const tipMatch = content.match(/(?:【提示】[：:]\s*)?([\s\S]*?)$/i);

    const mainQuestion = questionMatch ? questionMatch[1].trim() : content;
    const detailedHint = hintMatch ? hintMatch[1].trim() : '';
    const tip = tipMatch ? tipMatch[1].trim() : '';

    // 构建友好的输出
    let fullContent = mainQuestion;
    if (detailedHint) {
      fullContent += `\n\n**【详细解题思路】**\n${detailedHint}`;
    }
    if (tip && tip !== detailedHint) {
      fullContent += `\n\n**小提示**：${tip}`;
    }

    return {
      content: fullContent,
      nextStep: 1,
      summary: `解题思路：${mainQuestion}`,
    };

  } catch (error) {
    console.error('[generateTargetedGuidance] 失败:', error);
    // 备用：通用的引导
    return {
      content: `请仔细阅读题目，然后回答：

${question}

把你的解题过程写出来，我来帮你检查。`,
      nextStep: 1,
      summary: `解题思路：仔细审题，按步骤解答`,
    };
  }
}

// ============ 思考阶段：智能评判学生回答 ============
async function evaluateStudentResponse(
  question: string,
  knowledgePoint: string,
  step: number,
  correctAnswer: string,
  userResponse: string,
  isHandwriting: boolean,
  apiKey: string
): Promise<{
  content: string;
  isComplete: boolean;
  isCorrect: boolean;
  nextStep: number;
  summary?: string;
  recognizedText?: string;
}> {

  // 1. 如果是手写，先识别
  let recognizedText: string | undefined;
  let processedResponse = userResponse;

  if (isHandwriting && userResponse) {
    const recognized = await recognizeHandwritingContent(userResponse, apiKey);
    recognizedText = recognized.text;
    processedResponse = recognized.cleaned;
  }

  // 2. 如果学生没有回答
  if (!processedResponse || processedResponse.trim().length < 1) {
    return {
      content: '请把你的答案写出来，可以手写、拍照或打字。',
      isComplete: false,
      isCorrect: false,
      nextStep: step,
      recognizedText,
    };
  }

  // 3. 用 AI 评判回答是否正确
  const judgment = await judgeStudentAnswer(question, knowledgePoint, step, correctAnswer, processedResponse, apiKey);

  // 4. 根据评判结果生成反馈
  if (judgment.isCorrect && judgment.isComplete) {
    return {
      content: judgment.positiveFeedback,
      isComplete: true,
      isCorrect: true,
      nextStep: step + 1,
      summary: judgment.summary || `解题思路：${question}`,
      recognizedText,
    };
  } else if (judgment.isCorrect && !judgment.isComplete) {
    // 回答正确但不完整 - 温和引导
    const hint = judgment.hint || '请检查是否有遗漏，完整写出所有答案。';
    return {
      content: judgment.negativeFeedback,
      isComplete: false,
      isCorrect: true,
      nextStep: step,
      summary: `解题思路：${hint}`,
      recognizedText,
    };
  } else {
    return {
      content: judgment.negativeFeedback,
      isComplete: false,
      isCorrect: false,
      nextStep: step,
      summary: judgment.hint || '请重新思考解题思路。',
      recognizedText,
    };
  }
}

// ============ 手写识别 ============
async function recognizeHandwritingContent(imageBase64: string, apiKey: string): Promise<{
  text: string;
  cleaned: string;
}> {
  // 检查 API Key
  if (!apiKey) {
    return { text: '（未配置API，无法识别手写内容）', cleaned: '' };
  }

  const openai = createOpenAI({ apiKey, baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' });

  const prompt = `请仔细识别这张图片中的手写数学内容。这是学生用手写方式写的数学作业。

**识别要求**：
1. 识别数字、字母、符号、数学表达式
2. 识别等式，如 "m=0, x=-1" 或 "x=3m-1"
3. 识别集合，如 "{0, 1, 2}" 或 "{-1, 2, 5}"
4. 识别不等式，如 "x≠0" 或 "x≠1,2,3"
5. 识别空集符号，写成 "∅"
6. 识别关系符号，如 "∈"、"⊆"、"⊂"、"="、"≠"
7. 识别指数，如 "x²"、"x³"、"xⁿ"
8. 识别根号，如 "√x"、"√[3]{x}"

**【最重要】识别规则**：
- **严格原样输出**：只识别图片中实际写的内容，不要推断、补全、猜测或添加任何内容
- **数列处理**：如果图片中是 "2, 5, 8"，就输出 "2, 5, 8"，不要自己推断下一个数字是 "11"
- **只输出图片中存在的数字和符号**：不要根据数学规律"完善"学生的答案
- **每个数字都要忠实记录**：如果写了 3 个数字，就输出 3 个，不要"补全"成 4 个

**特别注意**：
- 不要输出 LaTeX 代码格式（如 \\begin{align}...）
- 把手写的数学表达式转成纯文本格式
- 例如：手写的 "x ≠ 1, 2, 3" 应该识别为 "x≠1,2,3"
- 例如：手写的 "phi" 应该识别为 "∅"（空集）

只输出识别到的文字内容，不要加任何解释或前缀。如果无法识别，输出"无法识别"。`;

  try {
    const result = await generateText({
      model: openai('qwen-vl-max'),
      messages: [{
        role: 'user',
        content: [
          { type: 'image', image: imageBase64 },
          { type: 'text', text: prompt },
        ],
      }],
      maxTokens: 300,
    });

    let text = (result.text || '').trim();
    let cleaned = text;

    // =============================================
    // 高中数学所有符号转换 - 完整版
    // =============================================

    // 1. LaTeX 环境标签（最先清理）
    cleaned = cleaned.replace(/\\begin\{[^}]*\}/gi, '');
    cleaned = cleaned.replace(/\\end\{[^}]*\}/gi, '');
    cleaned = cleaned.replace(/\\label\{[^}]*\}/gi, '');
    cleaned = cleaned.replace(/\\tag\{[^}]*\}/gi, '');

    // 2. 基本关系符号
    cleaned = cleaned.replace(/\\neq/gi, '≠');
    cleaned = cleaned.replace(/\\le/gi, '≤');
    cleaned = cleaned.replace(/\\leq/gi, '≤');
    cleaned = cleaned.replace(/\\ge/gi, '≥');
    cleaned = cleaned.replace(/\\geq/gi, '≥');
    cleaned = cleaned.replace(/\\approx/gi, '≈');
    cleaned = cleaned.replace(/\\equiv/gi, '≡');
    cleaned = cleaned.replace(/\\sim/gi, '～');

    // 3. 集合与逻辑符号
    cleaned = cleaned.replace(/\\in/gi, '∈');
    cleaned = cleaned.replace(/\\notin/gi, '∉');
    cleaned = cleaned.replace(/\\subset/gi, '⊂');
    cleaned = cleaned.replace(/\\subseteq/gi, '⊆');
    cleaned = cleaned.replace(/\\supset/gi, '⊃');
    cleaned = cleaned.replace(/\\supseteq/gi, '⊇');
    cleaned = cleaned.replace(/\\cup/gi, '∪');
    cleaned = cleaned.replace(/\\cap/gi, '∩');
    cleaned = cleaned.replace(/\\emptyset/gi, '∅');
    cleaned = cleaned.replace(/\\phi/gi, '∅');
    cleaned = cleaned.replace(/\\Phi/gi, 'Φ');
    cleaned = cleaned.replace(/\\xi/gi, 'ξ');
    cleaned = cleaned.replace(/\\xi/gi, 'Ξ');
    cleaned = cleaned.replace(/\\forall/gi, '∀');
    cleaned = cleaned.replace(/\\exists/gi, '∃');
    cleaned = cleaned.replace(/\\because/gi, '∵');
    cleaned = cleaned.replace(/\\therefore/gi, '∴');

    // 4. 几何符号
    cleaned = cleaned.replace(/\\angle/gi, '∠');
    cleaned = cleaned.replace(/\\perp/gi, '⊥');
    cleaned = cleaned.replace(/\\parallel/gi, '∥');
    cleaned = cleaned.replace(/\\triangle/gi, '△');
    cleaned = cleaned.replace(/\\Delta/gi, 'Δ');
    cleaned = cleaned.replace(/\\odot/gi, '⊙');
    cleaned = cleaned.replace(/\\circ/gi, '○');
    cleaned = cleaned.replace(/\\arc/gi, '⌒');
    cleaned = cleaned.replace(/\\cong/gi, '≅');
    cleaned = cleaned.replace(/\\similar/gi, '∽');

    // 5. 指数与根号
    cleaned = cleaned.replace(/\\sqrt\{([^}]*)\}/g, '√($1)');  // \sqrt{x} → √(x)
    cleaned = cleaned.replace(/\\sqrt/g, '√');
    cleaned = cleaned.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)');  // \frac{a}{b} → (a)/(b)
    cleaned = cleaned.replace(/\\cdot/gi, '·');
    cleaned = cleaned.replace(/\\times/gi, '×');
    cleaned = cleaned.replace(/\\div/gi, '÷');

    // 指数转换（使用 Unicode 上标）
    cleaned = cleaned.replace(/\^0/g, '⁰');
    cleaned = cleaned.replace(/\^1/g, '¹');
    cleaned = cleaned.replace(/\^2/g, '²');
    cleaned = cleaned.replace(/\^3/g, '³');
    cleaned = cleaned.replace(/\^4/g, '⁴');
    cleaned = cleaned.replace(/\^5/g, '⁵');
    cleaned = cleaned.replace(/\^6/g, '⁶');
    cleaned = cleaned.replace(/\^7/g, '⁷');
    cleaned = cleaned.replace(/\^8/g, '⁸');
    cleaned = cleaned.replace(/\^9/g, '⁹');
    cleaned = cleaned.replace(/\^\{([^}]*)\}/g, '^($1)');  // x^{n} → x^(n)
    cleaned = cleaned.replace(/\^(\d+)/g, (match: string, num: string) => {
      const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
      return num.split('').map((d: string) => superscripts[parseInt(d)]).join('');
    });

    // 下标转换
    cleaned = cleaned.replace(/_\{([^}]*)\}/g, '₍$1₎');
    cleaned = cleaned.replace(/_0/g, '₀');
    cleaned = cleaned.replace(/_1/g, '₁');
    cleaned = cleaned.replace(/_2/g, '₂');
    cleaned = cleaned.replace(/_3/g, '₃');
    cleaned = cleaned.replace(/_4/g, '₄');
    cleaned = cleaned.replace(/_5/g, '₅');
    cleaned = cleaned.replace(/_6/g, '₆');
    cleaned = cleaned.replace(/_7/g, '₇');
    cleaned = cleaned.replace(/_8/g, '₈');
    cleaned = cleaned.replace(/_9/g, '₉');
    cleaned = cleaned.replace(/_n/g, 'ₙ');
    cleaned = cleaned.replace(/_i/g, 'ᵢ');
    cleaned = cleaned.replace(/_j/g, 'ⱼ');
    cleaned = cleaned.replace(/_k/g, 'ₖ');

    // 6. 函数符号
    cleaned = cleaned.replace(/\\sin/gi, 'sin');
    cleaned = cleaned.replace(/\\cos/gi, 'cos');
    cleaned = cleaned.replace(/\\tan/gi, 'tan');
    cleaned = cleaned.replace(/\\cot/gi, 'cot');
    cleaned = cleaned.replace(/\\sec/gi, 'sec');
    cleaned = cleaned.replace(/\\csc/gi, 'csc');
    cleaned = cleaned.replace(/\\log/gi, 'log');
    cleaned = cleaned.replace(/\\ln/gi, 'ln');
    cleaned = cleaned.replace(/\\lg/gi, 'lg');
    cleaned = cleaned.replace(/\\lim/gi, 'lim');
    cleaned = cleaned.replace(/\\max/gi, 'max');
    cleaned = cleaned.replace(/\\min/gi, 'min');

    // 7. 极限与微积分
    cleaned = cleaned.replace(/\\infty/gi, '∞');
    cleaned = cleaned.replace(/\\pm/gi, '±');
    cleaned = cleaned.replace(/\\int/gi, '∫');
    cleaned = cleaned.replace(/\\oint/gi, '∮');
    cleaned = cleaned.replace(/\\sum/gi, 'Σ');
    cleaned = cleaned.replace(/\\prod/gi, '∏');
    cleaned = cleaned.replace(/\\partial/gi, '∂');
    cleaned = cleaned.replace(/\\nabla/gi, '∇');
    cleaned = cleaned.replace(/\\to/gi, '→');
    cleaned = cleaned.replace(/\\rightarrow/gi, '→');
    cleaned = cleaned.replace(/\\leftarrow/gi, '←');
    cleaned = cleaned.replace(/\\Rightarrow/gi, '⇒');
    cleaned = cleaned.replace(/\\Leftarrow/gi, '⇐');
    cleaned = cleaned.replace(/\\leftrightarrow/gi, '↔');
    cleaned = cleaned.replace(/\\mapsto/gi, '↦');

    // 8. 希腊字母
    cleaned = cleaned.replace(/\\alpha/gi, 'α');
    cleaned = cleaned.replace(/\\beta/gi, 'β');
    cleaned = cleaned.replace(/\\gamma/gi, 'γ');
    cleaned = cleaned.replace(/\\Gamma/gi, 'Γ');
    cleaned = cleaned.replace(/\\delta/gi, 'δ');
    cleaned = cleaned.replace(/\\Delta/gi, 'Δ');
    cleaned = cleaned.replace(/\\epsilon/gi, 'ε');
    cleaned = cleaned.replace(/\\varepsilon/gi, 'ε');
    cleaned = cleaned.replace(/\\zeta/gi, 'ζ');
    cleaned = cleaned.replace(/\\eta/gi, 'η');
    cleaned = cleaned.replace(/\\theta/gi, 'θ');
    cleaned = cleaned.replace(/\\Theta/gi, 'Θ');
    cleaned = cleaned.replace(/\\iota/gi, 'ι');
    cleaned = cleaned.replace(/\\kappa/gi, 'κ');
    cleaned = cleaned.replace(/\\lambda/gi, 'λ');
    cleaned = cleaned.replace(/\\Lambda/gi, 'Λ');
    cleaned = cleaned.replace(/\\mu/gi, 'μ');
    cleaned = cleaned.replace(/\\nu/gi, 'ν');
    cleaned = cleaned.replace(/\\pi/gi, 'π');
    cleaned = cleaned.replace(/\\Pi/gi, 'Π');
    cleaned = cleaned.replace(/\\rho/gi, 'ρ');
    cleaned = cleaned.replace(/\\sigma/gi, 'σ');
    cleaned = cleaned.replace(/\\Sigma/gi, 'Σ');
    cleaned = cleaned.replace(/\\tau/gi, 'τ');
    cleaned = cleaned.replace(/\\upsilon/gi, 'υ');
    cleaned = cleaned.replace(/\\omega/gi, 'ω');
    cleaned = cleaned.replace(/\\Omega/gi, 'Ω');

    // 9. 其他符号
    cleaned = cleaned.replace(/\\quad/gi, ' ');
    cleaned = cleaned.replace(/\\qquad/gi, '  ');
    cleaned = cleaned.replace(/\\ /gi, ' ');
    cleaned = cleaned.replace(/\\,/gi, ' ');
    cleaned = cleaned.replace(/\\!/gi, '');
    cleaned = cleaned.replace(/\\%/gi, '%');
    cleaned = cleaned.replace(/\\#\$/gi, '');
    cleaned = cleaned.replace(/\\\\/g, '\n');  // 换行符

    // 10. 清理残留的反斜杠（但保留花括号，因为它们是数学集合表达式的一部分）
    cleaned = cleaned.replace(/\\+/g, '');
    cleaned = cleaned.replace(/\$+/g, '');
    cleaned = cleaned.replace(/\^+/g, '^');
    cleaned = cleaned.replace(/_\+/g, '_');
    cleaned = cleaned.replace(/\s+/g, ' ');

    // 清理常见的识别错误前缀
    cleaned = cleaned.replace(/^text\s*/i, '');
    cleaned = cleaned.replace(/\s*text$/i, '');
    cleaned = cleaned.replace(/^识别[：:]\s*/i, '');
    cleaned = cleaned.replace(/^结果[：:]\s*/i, '');
    cleaned = cleaned.replace(/^output[：:]\s*/i, '');

    // 11. 纯文本希腊字母转符号（OCR 可能输出纯文本格式）
    cleaned = cleaned.replace(/\bvarnothing\b/g, '∅');  // varnothing → ∅（空集）
    cleaned = cleaned.replace(/\bphi\b/gi, '∅');  // phi → ∅（空集）
    cleaned = cleaned.replace(/\bPhi\b/g, 'Φ');    // Phi → Φ
    cleaned = cleaned.replace(/\balpha\b/gi, 'α');
    cleaned = cleaned.replace(/\bbeta\b/gi, 'β');
    cleaned = cleaned.replace(/\bgamma\b/gi, 'γ');
    cleaned = cleaned.replace(/\bdelta\b/gi, 'δ');
    cleaned = cleaned.replace(/\btheta\b/gi, 'θ');
    cleaned = cleaned.replace(/\blambda\b/gi, 'λ');
    cleaned = cleaned.replace(/\bmu\b/gi, 'μ');
    cleaned = cleaned.replace(/\bpi\b/gi, 'π');
    cleaned = cleaned.replace(/\bsigma\b/gi, 'σ');
    cleaned = cleaned.replace(/\bomega\b/gi, 'ω');
    cleaned = cleaned.replace(/\bepsilon\b/gi, 'ε');
    cleaned = cleaned.replace(/\bxi\b/gi, 'ξ');
    cleaned = cleaned.replace(/\beta\b/gi, 'η');
    cleaned = cleaned.replace(/\brho\b/gi, 'ρ');
    cleaned = cleaned.replace(/\btau\b/gi, 'τ');
    cleaned = cleaned.replace(/\binfinity\b/gi, '∞');
    cleaned = cleaned.replace(/\bPM\b/g, '±');

    // 11.1 常见 OCR 识别错误修正 - 空集符号的多种错误写法
    cleaned = cleaned.replace(/[（(]\s*pin\s*[）)]/gi, '∅');  // (pin) → ∅
    cleaned = cleaned.replace(/pin/gi, '∅');  // pin → ∅（空集）
    cleaned = cleaned.replace(/[pP][iI][nN]/g, '∅');  // 任何大小写的 pin
    cleaned = cleaned.replace(/p[i1!|l]?n/gi, '∅');  // p1n, p!n, pln 等变体 → ∅
    cleaned = cleaned.replace(/[qQ][iI][nN]/g, '∅');  // qin, Qin → ∅
    cleaned = cleaned.replace(/p[h4][i1!|l]n/gi, '∅');  // phin, p4n 等变体 → ∅
    cleaned = cleaned.replace(/\b0\b/g, '∅');  // 单独的 0 在集合语境可能是 ∅（但需上下文判断，这里保守处理）

    // 11.2 常见 OCR 识别错误修正 - 花括号
    // 场景：学生写了 {0,1,2}，OCR 识别成 9 或 5 等数字
    // 如果发现 数字9 紧跟在数字后面，可能是被误识别的 {
    cleaned = cleaned.replace(/(\d)9(\d)/g, '$1{$2');  // 数字之间的 9 → {
    cleaned = cleaned.replace(/(\d)5(\d)/g, '$1{$2');  // 数字之间的 5 → {
    cleaned = cleaned.replace(/9(\d)/g, '{$1');  // 数字开头的 9 → {
    cleaned = cleaned.replace(/5(\d)/g, '{$1');  // 数字开头的 5 → {

    // 11.3 常见 OCR 识别错误修正 - 其他符号
    cleaned = cleaned.replace(/[oO]或/g, '或');  // "o或" → "或"
    cleaned = cleaned.replace(/[,，]\s*或\s*[,，]/g, '，');  // ",或," → "，"
    cleaned = cleaned.replace(/\|\|/g, '∅');  // || → ∅（两条竖线）
    cleaned = cleaned.replace(/00/g, '∅');  // 00 在某些语境可能是 ∅

    // 11.4 常见 OCR 识别错误修正 - 数字与集合混淆
    // 在数学题中，如果看到类似 { } 的配对，但其中一个被识别成了数字
    // 尝试恢复：9 开头 + 数字结尾 → {数字}
    cleaned = cleaned.replace(/9(\d+)(?=[,，}])/g, '{$1');  // 9(数字)在逗号或}前 → {(数字)

    // 12. 清理 LaTeX align 环境残留
    cleaned = cleaned.replace(/&\s*/g, '');
    cleaned = cleaned.replace(/\$/g, '');

    // 移除无法识别的标记
    if (cleaned.includes('无法识别') || cleaned.includes('无法认') || cleaned.includes('cannot recognize') || cleaned.length < 2) {
      cleaned = '';
    }

    return { text, cleaned: cleaned.trim() };
  } catch (error) {
    console.error('[recognizeHandwritingContent] 识别失败:', error);
    return { text: '', cleaned: '' };
  }
}

// ============ AI 评判学生回答 ============
async function judgeStudentAnswer(
  question: string,
  knowledgePoint: string,
  step: number,
  correctAnswer: string,
  studentResponse: string,
  apiKey: string
): Promise<{
  isCorrect: boolean;
  isComplete: boolean;
  positiveFeedback: string;
  negativeFeedback: string;
  hint?: string;
  summary?: string;
}> {

  const openai = createOpenAI({ apiKey, baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' });

  const prompt = `你是一个极其耐心、细心的数学辅导老师，专门帮助数学基础薄弱的学生。你需要判断学生的回答，并给出极度详细的讲解，让学生不但知道答案，还完全理解为什么。

**题目**：${question}
**知识点**：${knowledgePoint}
**当前步骤**：第 ${step} 步
**正确答案**：${correctAnswer || '（未知）'}
**学生回答**：${studentResponse}

## 【最重要的规则：禁止幻觉！】

**绝对禁止的行为**（违反会导致评判失效）：
1. **不要捏造学生没写的内容**：学生回答里没有"空集"，你就不能说学生写了空集
2. **只分析学生实际写的**：基于学生写的来判断对错，不要脑补
3. **不要提学生没提的概念**：如果学生没说"空集"，绝对不要主动提
4. **逐字检查学生内容**：仔细对比学生的每个数字、每个词

## 评判标准：

### 如果学生回答正确且完整：
- 返回 isCorrect: true, isComplete: true
- 给出鼓励性反馈，详细解释为什么对
- 可以适当拓展知识点

### 如果学生回答正确但不完整：
- 返回 isCorrect: true, isComplete: false
- 温和指出遗漏的部分
- **必须详细解释**：用"第1步、第2步、第3步"的方式，讲解完整的解题思路
- 提示要像给差生讲题一样细致

### 如果学生回答有错误：
- 返回 isCorrect: false, isComplete: false
- 温和指出具体哪个地方错了
- **必须详细讲解**：用"第1步、第2步、第3步"的方式，讲解正确的解题思路
- 不要只说"错了"，要解释"为什么错了"和"正确应该怎么做"

## 【极度详细的反馈模板】

**如果学生部分正确**：
negativeFeedback 格式："你的第1步（代入n=0,1,2...）做对了！👍 但第2步（代入公式计算）还需要完善... 完整解法如下：\n\n【详细解题步骤】\n第1步 - 理解题意：这道题要求我们...（详细解释）\n第2步 - 代入计算：把n=0代入，得到x=...（详细解释为什么这样代）\n第3步 - 得到结果：所以A={...}，B={...}（详细解释）\n第4步 - 完成证明：因为...（详细解释证明思路）"

**如果学生完全正确**：
positiveFeedback 格式："太棒了！🎉 你的答案完全正确！\n【你的思路分析】\n你第1步...做对了，\n你第2步...做对了，\n（继续分析学生的思路，让学生明白为什么对）"

**如果学生完全错误**：
negativeFeedback 格式："别担心，这道题确实有点难！让我一步步教你：\n\n【从零开始的详细讲解】\n第1步 - 重新理解题目：题目说...，意思是...\n第2步 - 回忆相关知识：这类题通常要...（如果涉及新概念，要解释清楚）\n第3步 - 具体计算：n=0时，x=...（每一步都要解释为什么）\nn=1时，x=...（继续详细解释）\n第4步 - 得出结论：所以A={...}，B={...}\n第5步 - 完成证明：因为...，所以..."

**如果学生漏写了部分答案**：
negativeFeedback 格式："你的思路很好！👍 你已经列出了A={...}，B={...}。\n\n但是，这道题要求列出"最小的3个元素"，你好像少写了一部分...\n【检查一下】\n题目要求：列出A和B中最小的3个元素\n你写的A：{...}（有/没有）3个\n你写的B：{...}（有/没有）3个\n\n【提示】可以再代入n=2, n=3 试试看...（具体提示）"

## 输出格式（JSON）：
{
  "isCorrect": true或false,
  "isComplete": true或false,
  "positiveFeedback": "详细的鼓励反馈，60-150字，包括对正确部分的分析和为什么对",
  "negativeFeedback": "详细的错误分析和引导，80-200字，用【】包裹的详细步骤讲解",
  "hint": "具体的解题提示，30-80字",
  "summary": "解题思路总结，30-60字"
}

**【强制要求】**：
- negativeFeedback 必须包含【详细解题步骤】或【从零开始的详细讲解】
- 每个步骤后要解释"为什么"
- 假设学生是数学差生，需要手把手教
- 绝对不要在反馈中提及学生没有写的概念（如"空集"）

直接输出JSON，不要其他内容。`;

  try {
    const result = await generateText({
      model: openai('qwen-plus'),
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 500,
    });

    const responseText = result.text || '';

    // 尝试解析 JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const judgment = JSON.parse(jsonMatch[0]);
        return {
          isCorrect: judgment.isCorrect === true,
          isComplete: judgment.isComplete === true,
          positiveFeedback: judgment.positiveFeedback || '继续加油！',
          negativeFeedback: judgment.negativeFeedback || '请再想一想。',
          hint: judgment.hint || '',
          summary: judgment.summary,
        };
      } catch (e) {
        console.error('[judgeStudentAnswer] JSON解析失败:', e);
      }
    }

    // 备用：如果无法解析，尝试智能判断
    const lowerResponse = responseText.toLowerCase();
    const isLikelyCorrect = lowerResponse.includes('"isCorrect":true') || lowerResponse.includes('正确');
    const isLikelyComplete = lowerResponse.includes('"isComplete":true') || lowerResponse.includes('完成');

    return {
      isCorrect: isLikelyCorrect,
      isComplete: isLikelyComplete,
      positiveFeedback: '你的回答很好！继续下一题或下一个步骤吧！',
      negativeFeedback: '请检查一下你的回答，看看有没有遗漏或错误。',
      hint: '',
    };

  } catch (error) {
    console.error('[judgeStudentAnswer] 评判失败:', error);
    return {
      isCorrect: false,
      isComplete: false,
      positiveFeedback: '',
      negativeFeedback: '抱歉，评判过程中出现了问题，请重试。',
      hint: '',
    };
  }
}
