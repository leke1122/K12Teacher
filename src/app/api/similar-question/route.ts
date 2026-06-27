import { NextRequest, NextResponse } from 'next/server';

/**
 * 生成同类型题
 * 基于原题生成一道相似但不同的练习题
 */
export async function POST(request: NextRequest) {
  try {
    const {
      originalQuestion,
      knowledgePoint,
      difficulty = 'medium',
      pdfContext = '',
      apiKey,
    } = await request.json();

    if (!originalQuestion) {
      return NextResponse.json({ error: '原题不能为空' }, { status: 400 });
    }

    const systemPrompt = `你是一位高中数学教师，擅长设计变式练习题。

【核心能力】
基于已有题目，设计一道"同类型"的新题，要求：
1. 考察同一知识点（知识Point保持一致）
2. 题型相同但数据/情境不同
3. 难度相近
4. 选项设计保持一致风格

【出题原则】
- 新题必须是原创的，不能复制原题
- 保持核心考察点不变，但表现形式可以变化
- 数据可以改变，但必须合理`;

    const userPrompt = `【原题】
${originalQuestion}

${knowledgePoint ? `【相关知识点】\n${knowledgePoint}\n` : ''}
${pdfContext ? `【教材参考】\n${pdfContext}\n` : ''}

【出题要求】
请生成一道与上述题目"同类型"的变式练习题：
1. 考察相同的知识点
2. 题型相同（选择/填空/计算）
3. 难度：${difficulty === 'simple' ? '简单（基础应用）' : difficulty === 'hard' ? '困难（综合应用）' : '中等（变形应用）'}
4. 数据和情境可以不同，但解题方法相同

【返回格式】（严格JSON）
{
  "question": {
    "id": "q_similar_1",
    "text": "变式题目内容（数学公式用LaTeX）",
    "type": "choice|fill|calculation",
    "options": ["A. 选项", "B. 选项", "C. 选项", "D. 选项"],
    "correctAnswer": "A",
    "explanation": "解题思路",
    "knowledgePoint": "${knowledgePoint || '知识点'}",
    "difficulty": "${difficulty}",
    "commonMistakes": ["常错1", "常错2"]
  },
  "similarity": "与原题的相似点说明"
}`;

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
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.6,
            max_tokens: 3000,
          }),
        });

        if (!response.ok) throw new Error('API失败');
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const result = parseSimilarQuestion(content);
        return NextResponse.json({ success: true, ...result });
      } catch (err) {
        console.error('[SimilarQuestion] API失败:', err);
        return NextResponse.json({ success: true, question: generateDefaultSimilar(originalQuestion, knowledgePoint, difficulty) });
      }
    }

    return NextResponse.json({ success: true, question: generateDefaultSimilar(originalQuestion, knowledgePoint, difficulty) });
  } catch (error) {
    console.error('[SimilarQuestion] 处理失败:', error);
    return NextResponse.json({ error: '生成失败' }, { status: 500 });
  }
}

function parseSimilarQuestion(content: string): any {
  let jsonStr = content.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

  try {
    const parsed = JSON.parse(jsonStr);
    const q = parsed.question || parsed;
    return {
      question: {
        id: 'q_similar_' + Date.now(),
        text: q.text || q.question || '变式题',
        type: ['choice', 'fill', 'calculation'].includes(q.type) ? q.type : 'choice',
        options: Array.isArray(q.options) ? q.options.map((opt: string, i: number) =>
          opt.startsWith(String.fromCharCode(65 + i) + '.') ? opt : `${String.fromCharCode(65 + i)}. ${opt}`
        ) : [],
        correctAnswer: String(q.correctAnswer || 'A').toUpperCase().match(/[A-D]/) ? String(q.correctAnswer).toUpperCase().match(/[A-D]/)?.[0] || 'A' : 'A',
        explanation: q.explanation || '请参考解析',
        knowledgePoint: q.knowledgePoint || '',
        difficulty: q.difficulty || 'medium',
        commonMistakes: Array.isArray(q.commonMistakes) ? q.commonMistakes : [],
      },
      similarity: parsed.similarity || '基于原题改编',
    };
  } catch {
    return {
      question: generateDefaultSimilar('', '', 'medium'),
      similarity: '生成失败，使用默认题',
    };
  }
}

function generateDefaultSimilar(original: string, knowledgePoint: string, difficulty: string): any {
  return {
    id: 'q_similar_default',
    text: `变式练习：${knowledgePoint || '知识点'}相关练习题（请参考教材内容作答）`,
    type: 'choice',
    options: ['A. 正确', 'B. 错误', 'C. 不确定', 'D. 无法判断'],
    correctAnswer: 'A',
    explanation: '请结合教材内容分析判断',
    knowledgePoint: knowledgePoint || '',
    difficulty,
    commonMistakes: ['审题不清'],
  };
}
