import { NextRequest, NextResponse } from 'next/server';

/**
 * 历史引导学习 API
 * 支持对话问答功能
 */

interface ChatRequest {
  action: 'chat';
  sectionId: string;
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  apiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { action, sectionId, message, history = [] } = body;

    if (action === 'chat') {
      if (!message) {
        return NextResponse.json({ success: false, error: '消息不能为空' }, { status: 400 });
      }

      // 构建对话历史
      const messages: Array<{ role: string; content: string }> = [
        {
          role: 'system',
          content: `你是一位专业的高中历史老师，帮助学生理解历史知识。
请用通俗易懂的语言讲解历史内容，结合高考考点。
每次回答控制在200字以内，突出重点。
如果有历史时间、人物、事件，要准确说明。`
        }
      ];

      // 添加历史对话
      for (const msg of history.slice(-6)) {
        messages.push({ role: msg.role, content: msg.content });
      }

      // 添加当前问题
      messages.push({ role: 'user', content: message });

      // 获取 API Key
      const apiKey = process.env.DEEPSEEK_API_KEY || body.apiKey;
      if (!apiKey) {
        return NextResponse.json({
          success: false,
          reply: '请先在设置页面配置 DeepSeek API Key'
        });
      }

      // 调用 DeepSeek API
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-v4-flash',
          messages,
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      const reply = data?.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';

      return NextResponse.json({ success: true, reply });
    }

    return NextResponse.json({ success: false, error: '未知的操作' }, { status: 400 });
  } catch (error) {
    console.error('[History Guided Learning API Error]:', error);
    return NextResponse.json({
      success: false,
      reply: '服务器错误，请稍后再试。'
    }, { status: 500 });
  }
}
