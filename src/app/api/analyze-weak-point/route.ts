import { NextRequest, NextResponse } from 'next/server';

/**
 * 薄弱项分析
 * 分析错题原因，识别薄弱知识点
 */
export async function POST(request: NextRequest) {
  try {
    const {
      question,
      userAnswer,
      correctAnswer,
      knowledgePoint,
      pdfContext = '',
      apiKey,
    } = await request.json();

    if (!question) {
      return NextResponse.json({ error: '题目不能为空' }, { status: 400 });
    }

    const systemPrompt = `你是一位高中数学教学专家，擅长分析学生的薄弱知识点。

【分析维度】
1. 错题原因分类：
   - 概念理解不清：对定义、定理的理解有偏差
   - 公式记忆错误：记错了公式或适用条件
   - 计算粗心：计算过程出错
   - 方法不当：没有找到正确的解题思路
   - 审题不清：没有正确理解题目要求
   - 知识遗忘：对已学内容记忆模糊

2. 薄弱项识别：
   - 找出学生具体哪个知识点没掌握
   - 用简洁的词语描述薄弱项（如"一元二次方程配方法"）

3. 教学建议：
   - 针对薄弱项给出具体的学习建议
   - 推荐相关练习方向`;
    
    const userPrompt = `请分析以下错题：

【题目】
${question}

【正确答案】
${correctAnswer}

【学生答案】
${userAnswer || '（未作答）'}

${knowledgePoint ? `【相关知识点】\n${knowledgePoint}\n` : ''}
${pdfContext ? `【教材参考】\n${pdfContext}\n` : ''}

【分析要求】
请从以下维度分析：
1. 错题原因是什么？（6选1：概念不清/公式错误/计算粗心/方法不当/审题不清/知识遗忘）
2. 具体薄弱项是什么？（用简洁词语描述，如"配方法求解一元二次方程"）
3. 应该怎么改进？

【返回格式】（严格JSON）
{
  "wrongReason": "错题原因（6选1）",
  "weakPoint": "具体薄弱项（简洁词语，15字以内）",
  "stepAnalysis": "哪一步出了问题：详细说明",
  "solutionSteps": "正确解题步骤：详细说明",
  "improvement": "改进建议（1-2句话）"
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
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) throw new Error('API失败');
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        return NextResponse.json({ success: true, ...parseAnalysis(content) });
      } catch {
        return NextResponse.json({ success: true, ...getDefaultAnalysis() });
      }
    }

    return NextResponse.json({ success: true, ...getDefaultAnalysis() });
  } catch (error) {
    console.error('[AnalyzeWeakPoint] 处理失败:', error);
    return NextResponse.json({ error: '分析失败' }, { status: 500 });
  }
}

function parseAnalysis(content: string): any {
  let jsonStr = content.trim();
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      wrongReason: parsed.wrongReason || '方法不当',
      weakPoint: parsed.weakPoint || '解题方法',
      stepAnalysis: parsed.stepAnalysis || '解题思路有误',
      solutionSteps: parsed.solutionSteps || '请参考教材',
      improvement: parsed.improvement || '建议加强相关知识点的练习',
    };
  } catch {
    return getDefaultAnalysis();
  }
}

function getDefaultAnalysis(): any {
  return {
    wrongReason: '方法不当',
    weakPoint: '解题方法',
    stepAnalysis: '解题思路需要改进',
    solutionSteps: '请参考教材例题',
    improvement: '建议多练习相关题目',
  };
}
