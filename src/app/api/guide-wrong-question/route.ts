import { NextRequest, NextResponse } from 'next/server';

/**
 * 引导式错题讲解
 * 不直接给答案，通过逐步引导让学生自己找到答案
 */
export async function POST(request: NextRequest) {
  try {
    const {
      question,
      userAnswer,
      correctAnswer,
      knowledgePoint,
      step = 1,
      studentResponse = '',
      history = [],
      apiKey,
    } = await request.json();

    if (!question) {
      return NextResponse.json({ error: '题目不能为空' }, { status: 400 });
    }

    const systemPrompt = `你是一位循循善诱的高中数学老师，擅长通过启发式提问引导学生自主思考。

【核心原则】
1. 绝不直接告诉学生答案
2. 通过提问让学生一步步自己思考
3. 每一步只提一个问题，引导学生聚焦当前关键点
4. 学生回答后，根据回答内容判断理解程度，给予针对性反馈
5. 最多引导5步，超过则不再继续引导

【引导步骤设计】
- 第1步：询问学生对题目考察知识点的理解
- 第2步：引导学生回忆相关公式/定理/方法
- 第3步：引导将公式应用到题目的具体步骤
- 第4步：引导学生进行计算或推理
- 第5步：让学生重新作答

【语气要求】
- 温和鼓励，不要批评
- 用"你真棒！"、"很好！"等正面反馈
- 用"再想想"、"换个角度"等引导`;
    
    const steps = [
      {
        question: `看到这道题，你觉得它考察的是哪个知识点？\n\n（提示：题目中有没有出现你学过的概念？）`,
        hint: '请先说说这道题想考什么',
      },
      {
        question: `很好！这个知识点需要用到什么公式/定理/方法？\n\n（提示：回忆一下相关的定义和性质）`,
        hint: '想想这个知识点有哪些重要的公式',
      },
      {
        question: `对！现在把这个公式/方法应用到题目中，第一步应该怎么做？\n\n（提示：把已知条件代入公式）`,
        hint: '把已知条件代入公式试试',
      },
      {
        question: `很好！那接下来怎么计算？\n\n（提示：按照运算顺序一步步来）`,
        hint: '仔细计算每一步',
      },
      {
        question: `现在你再试一次，这道题的答案是什么？\n\n（提示：结合前面的分析）`,
        hint: '综合前面的分析再回答一次',
      },
    ];

    const stepInfo = steps[Math.min(step - 1, steps.length - 1)];
    const isLastStep = step >= steps.length;

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        guide: stepInfo.question,
        hint: stepInfo.hint,
        step,
        totalSteps: steps.length,
        isLastStep,
        done: false,
        shouldShowAnswer: false,
      });
    }

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
            { role: 'user', content: buildConversation(question, studentResponse, history, stepInfo, step, isLastStep, correctAnswer) },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) throw new Error('API失败');
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return NextResponse.json({
        success: true,
        guide: extractGuide(content),
        hint: stepInfo.hint,
        step,
        totalSteps: steps.length,
        isLastStep,
        done: false,
        shouldShowAnswer: false,
      });
    } catch {
      return NextResponse.json({
        success: true,
        guide: stepInfo.question,
        hint: stepInfo.hint,
        step,
        totalSteps: steps.length,
        isLastStep,
        done: false,
        shouldShowAnswer: false,
      });
    }
  } catch (error) {
    console.error('[GuideWrongQuestion] 处理失败:', error);
    return NextResponse.json({ error: '引导失败' }, { status: 500 });
  }
}

function buildConversation(question: string, studentResponse: string, history: string[], stepInfo: any, step: number, isLastStep: boolean, correctAnswer: string): string {
  let conversation = `【当前题目】\n${question}\n\n`;
  
  if (history.length > 0) {
    conversation += `【对话历史】\n`;
    history.forEach((h, i) => { conversation += `${i + 1}. ${h}\n`; });
  }

  if (studentResponse) {
    conversation += `\n【学生回答】\n${studentResponse}\n`;
  }

  conversation += `\n【引导步骤】第${step}步（共${stepInfo.totalSteps}步）\n`;
  conversation += `请根据以上内容，按照以下要求回复：\n`;
  conversation += `1. 如果学生有回答，先评价学生的回答（鼓励或指出问题）\n`;
  conversation += `2. 提出下一个引导问题（简洁，一句话）\n`;
  conversation += `3. 如果是最后一步(${step}步)，提示学生重新作答\n`;
  conversation += `4. 答案正确时给予热烈鼓励\n`;
  conversation += `5. 如果学生回答正确(${correctAnswer})，明确告知并鼓励\n`;
  conversation += `\n回复格式：\n评价：...（1-2句话）\n问题：...（下一个引导问题）`;

  return conversation;
}

function extractGuide(content: string): string {
  const lines = content.split('\n');
  const guideLine = lines.find(l => l.startsWith('问题：') || l.startsWith('【问题】'));
  if (guideLine) return guideLine.replace(/^(问题：|【问题】)\s*/, '');
  
  const colonIdx = content.indexOf('：');
  if (colonIdx > 0 && colonIdx < 100) {
    return content.substring(colonIdx + 1).trim();
  }
  return content.trim().substring(0, 300);
}
