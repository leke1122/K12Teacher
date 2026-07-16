import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useSettingsStore } from '@/stores/settingsStore';

const USER_ID = 'personal-user';

interface GenerateRequest {
  grammarId?: string;
  grammarName?: string;
  structure?: string;
  examPoints?: { point: string; example: string }[];
  examples?: { sentence: string; translation: string }[];
  type: 'fill' | 'correct' | 'translate' | 'choice';
  apiKey?: string;
}

const QUESTION_TEMPLATES = {
  fill: [
    { pattern: (g: any) => `用所给词的正确形式填空：${g.examples?.[0]?.sentence || 'Fill in the blank with the correct form.'}`, answer: (g: any) => '' },
  ],
  correct: [
    { pattern: () => `请改正下列句子中的错误：`, answer: () => '' },
  ],
  translate: [
    { pattern: (g: any) => `将下列中文翻译成英文：\n${g.examples?.[0]?.translation || 'Translate the following.'}`, answer: (g: any) => '' },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const {
      grammarId, grammarName, structure, examPoints, examples,
      type, apiKey,
    } = body;

    // 优先使用请求中的 Key，其次使用环境变量
    const deepseekKey = apiKey || process.env.DEEPSEEK_API_KEY;

    if (!deepseekKey) {
      return NextResponse.json(
        { success: false, message: '请先在设置页面配置 DeepSeek API Key' },
        { status: 400 }
      );
    }

    // 使用AI生成题目
    const prompt = `你是一位高中英语语法出题专家。请为以下语法知识点生成${type === 'fill' ? '填空' : type === 'correct' ? '改错' : type === 'translate' ? '翻译' : '选择'}练习题。

## 语法知识点
- 名称：${grammarName || '未知'}
- 结构公式：${structure || '未知'}
- 考点：${examPoints?.map((e: any) => e.point).join('；') || '无'}

## 生成要求
1. 生成3-5道练习题
2. 每道题包含：question（题目）、answer（答案）、explanation（解析）
3. 题目要结合实际语境，贴近高考风格
4. 答案要精确
5. 返回格式为JSON数组

## 返回格式
[
  {
    "question": "题目内容（完整句子）",
    "answer": "正确答案",
    "explanation": "简要解析"
  }
]

请只返回JSON数组，不要包含其他文本。`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个严格输出JSON的英语语法出题助手，必须只返回JSON数组。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'AI请求失败');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 解析JSON
    let questions = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('[API english/grammar/practice/generate] 解析错误:', parseError);
      // 回退：生成基础题目
      questions = generateFallbackQuestions(type, grammarName, examples);
    }

    if (!questions.length) {
      questions = generateFallbackQuestions(type, grammarName, examples);
    }

    return NextResponse.json({
      success: true,
      questions: questions.map((q: any, i: number) => ({
        id: `${grammarId || 'g'}-${type}-${i}`,
        grammarId: grammarId || '',
        type,
        difficulty: 3,
        ...q,
      })),
    });
  } catch (error) {
    console.error('[API english/grammar/practice/generate]', error);
    return NextResponse.json(
      { success: false, message: '生成失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

function generateFallbackQuestions(
  type: string,
  grammarName?: string,
  examples?: { sentence: string; translation: string }[]
): any[] {
  const ex = examples?.[0];

  if (type === 'fill' && ex) {
    return [
      {
        question: ex.sentence,
        answer: ex.translation,
        explanation: '请根据语法规则填写答案',
      },
    ];
  }
  if (type === 'translate' && ex) {
    return [
      {
        question: ex.translation,
        answer: ex.sentence,
        explanation: `${grammarName || '语法'}翻译练习`,
      },
    ];
  }

  return [
    {
      question: `请完成以下${type === 'fill' ? '填空' : type === 'correct' ? '改错' : '翻译'}练习（${grammarName || '语法'})`,
      answer: '略',
      explanation: '请参考知识点讲解',
    },
  ];
}
