import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const USER_ID = 'personal-user';

interface ErrorAnalysisRequest {
  wrongQuestionId?: string;
  question?: string;
  userAnswer?: string;
  correctAnswer?: string;
  grammarId?: string;
  grammarName?: string;
  apiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ErrorAnalysisRequest = await request.json();
    const {
      wrongQuestionId,
      question,
      userAnswer,
      correctAnswer,
      grammarId,
      grammarName,
      apiKey,
    } = body;

    const deepseekKey = apiKey || process.env.DEEPSEEK_API_KEY;

    if (!deepseekKey) {
      return NextResponse.json(
        { success: false, message: '请先配置 DeepSeek API Key' },
        { status: 400 }
      );
    }

    const prompt = `你是高中英语语法错题分析专家。请分析以下错题，找出错误原因。

## 题目
${question || '无题目'}

## 你的答案
${userAnswer || '未填写'}

## 正确答案
${correctAnswer || '无正确答案'}

## 相关语法点
- 语法点ID: ${grammarId || '未知'}
- 语法点名称: ${grammarName || '未知'}

## 分析要求
请从以下角度分析：
1. 错误类型（时态、语态、主谓一致、词汇辨析、介词、冠词、其他）
2. 涉及的语法规则
3. 生词提取（从题目中找出高考高频词）
4. 改进建议
5. 一句鼓励的话

## 返回格式
{
  "errorType": "tense/voice/agreement/word/preposition/article/other",
  "rule": "涉及的语法规则说明",
  "unknownWords": ["word1", "word2"],
  "suggestion": "改进建议",
  "encouragement": "鼓励的话"
}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: '你是一个严谨的英语语法错题分析助手，必须严格输出JSON对象。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('AI请求失败');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch {
      analysis = {
        errorType: 'other',
        rule: '请参考正确答案',
        unknownWords: [],
        suggestion: '建议重新学习相关语法点',
        encouragement: '继续加油！',
      };
    }

    // 保存错题记录
    if (isSupabaseConfigured && supabase && wrongQuestionId) {
      await supabase
        .from('wrong_questions')
        .update({
          grammar_id: grammarId || null,
          grammar_name: grammarName || null,
          error_type: analysis.errorType || 'other',
          unknown_words: analysis.unknownWords || [],
        })
        .eq('id', wrongQuestionId)
        .eq('user_id', USER_ID);
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('[API english/grammar/error-analysis]', error);
    return NextResponse.json(
      { success: false, message: '分析失败' },
      { status: 500 }
    );
  }
}
