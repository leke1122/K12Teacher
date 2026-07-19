import { NextRequest, NextResponse } from 'next/server';

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { event, unitId } = body;

  if (!event || !unitId) {
    return NextResponse.json({
      success: false,
      message: '缺少必要参数：event 和 unitId'
    }, { status: 400 });
  }

  // 至少需要一个 API key
  if (!DEEPSEEK_API_KEY && !OPENAI_API_KEY) {
    return NextResponse.json({
      success: false,
      message: '未配置AI服务，请联系管理员配置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY'
    }, { status: 500 });
  }

  try {
    // 构建prompt
    const eventTitle = event.title || '未知事件';
    const eventYear = event.yearDisplay || event.year || '未知时间';
    const eventCategory = event.category || event.dynasty || '历史';
    const existingSummary = event.summary || event.description || '';
    
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

    // 优先使用 DeepSeek
    let generatedSummary = '';
    
    if (DEEPSEEK_API_KEY) {
      try {
        const response = await fetch(DEEPSEEK_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
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

        if (response.ok) {
          const data = await response.json();
          generatedSummary = data.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (e) {
        console.error('[ai-summary] DeepSeek API 错误:', e);
      }
    }

    // 如果 DeepSeek 失败，尝试 OpenAI
    if (!generatedSummary && OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
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

        if (response.ok) {
          const data = await response.json();
          generatedSummary = data.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (e) {
        console.error('[ai-summary] OpenAI API 错误:', e);
      }
    }

    if (!generatedSummary) {
      return NextResponse.json({
        success: false,
        message: 'AI服务调用失败，请检查API配置'
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
