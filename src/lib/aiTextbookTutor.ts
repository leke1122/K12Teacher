export interface TutorialResult {
  explanation: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

export async function generateTutorialForParagraph(
  paragraph: string,
  apiKey: string
): Promise<TutorialResult> {
  if (!apiKey) {
    return {
      explanation: '请仔细阅读这段内容，理解它的核心含义。',
      question: '这段内容主要想表达什么？',
      options: [
        'A. 对内容有清晰理解',
        'B. 部分理解内容',
        'C. 还需要再读一遍'
      ],
      correctIndex: 0,
      hint: '建议再仔细阅读原文，注意关键概念和语句。'
    };
  }

  const prompt = `你是一位耐心的高中数学老师。以下是教材中的一段内容，**请严格基于这段内容**生成讲解和题目。

## 核心要求
1. **讲解必须针对当前段落的核心内容**（如：如果段落讲的是 ∈/∉，讲解就围绕这两个符号）
2. **题目必须检验当前段落的核心内容**
3. **不要出其他段落的内容**
4. 讲解 50-80 字，选择题 3 个选项，给出答案索引（0、1 或 2）和选错时的提示

必须严格按 JSON 返回，不要包含其他内容：
{
  "explanation": "基于当前段落的讲解（50-80字）",
  "question": "检验当前段落理解的选择题",
  "options": ["A. ...", "B. ...", "C. ..."],
  "correctIndex": 0,
  "hint": "选错时的提示"
}

段落内容：
${paragraph}`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个只会输出标准 JSON 的数学辅导助手。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 400
      })
    });

    if (!response.ok) {
      throw new Error(`AI 请求失败：${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || '';
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    const parsed = jsonStart >= 0 && jsonEnd >= 0 ? JSON.parse(content.slice(jsonStart, jsonEnd + 1)) : null;

    if (!parsed || typeof parsed.explanation !== 'string' || !Array.isArray(parsed.options) || parsed.options.length !== 3 || typeof parsed.correctIndex !== 'number') {
      throw new Error('AI 返回格式不正确');
    }

    return {
      explanation: parsed.explanation,
      question: parsed.question || '请根据讲解内容判断正确选项。',
      options: parsed.options,
      correctIndex: Math.min(2, Math.max(0, parsed.correctIndex)),
      hint: parsed.hint || '建议再读一遍原文和讲解。'
    };
  } catch (error) {
    console.error('[Tutorial] 生成失败:', error);
    return {
      explanation: '请仔细阅读这段内容，理解它的核心含义。',
      question: '这段内容主要想表达什么？',
      options: [
        'A. 对内容有清晰理解',
        'B. 部分理解内容',
        'C. 还需要再读一遍'
      ],
      correctIndex: 0,
      hint: '建议再仔细阅读原文，注意关键概念和语句。'
    };
  }
}
