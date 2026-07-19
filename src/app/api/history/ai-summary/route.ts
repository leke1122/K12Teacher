import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { event, unitId } = body;

  if (!event || !unitId) {
    return NextResponse.json({
      success: false,
      message: '缺少必要参数：event 和 unitId'
    }, { status: 400 });
  }

  // 检查是否配置了OpenAI API
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    return NextResponse.json({
      success: false,
      message: '未配置AI服务，请联系管理员配置OPENAI_API_KEY'
    }, { status: 500 });
  }

  try {
    // 构建prompt
    const eventTitle = event.title || '未知事件';
    const eventYear = event.yearDisplay || event.year || '未知时间';
    const eventCategory = event.category || event.dynasty || '历史';
    const existingSummary = event.summary || '';
    
    // 如果已有较详细的summary，不需要再生成
    if (existingSummary && existingSummary.length > 50) {
      return NextResponse.json({
        success: true,
        data: {
          summary: existingSummary,
          generated: false,
          message: '已有详细概述，无需生成'
        }
      });
    }

    // 构建AI请求
    const prompt = `你是一位高中历史教师。请为以下历史事件生成一段详细的历史概述，用于帮助学生理解该事件。

事件信息：
- 事件名称：${eventTitle}
- 所属时代：${eventYear}
- 类别：${eventCategory}
${existingSummary ? `- 已有简要描述：${existingSummary}` : ''}

请生成一段150-200字的历史概述，包含：
1. 事件的主要内容和发展过程
2. 该事件在中国历史中的重要地位
3. 与高考相关的考点提示

请用简洁专业的历史语言撰写，避免口语化。`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的高中历史教师，擅长将复杂的历史知识用简洁清晰的方式讲解给学生。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[ai-summary] OpenAI API error:', errorData);
      return NextResponse.json({
        success: false,
        message: 'AI服务调用失败'
      }, { status: 500 });
    }

    const data = await response.json();
    const generatedSummary = data.choices?.[0]?.message?.content?.trim() || '';

    if (!generatedSummary) {
      return NextResponse.json({
        success: false,
        message: 'AI未能生成有效概述'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: generatedSummary,
        generated: true,
        eventId: event.id
      }
    });

  } catch (err) {
    console.error('[ai-summary] 生成概述失败:', err);
    return NextResponse.json({
      success: false,
      message: '生成概述时发生错误',
      error: err instanceof Error ? err.message : '未知错误'
    }, { status: 500 });
  }
}
