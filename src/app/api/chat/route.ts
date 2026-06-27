import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, apiKey, messages, systemPrompt } = body;
    
    // 支持两种格式：1. message+context 2. messages+systemPrompt
    let userMessage: string;
    let systemPromptFinal: string;
    
    if (messages && Array.isArray(messages)) {
      // 新格式：messages 数组
      userMessage = messages.filter(m => m.role === 'user').map(m => m.content).join('\n\n');
      systemPromptFinal = systemPrompt || '你是一个有用的AI助手。';
    } else if (message) {
      // 旧格式：message + context
      userMessage = context 
        ? `相关知识内容：\n${context}\n\n用户问题：${message}`
        : `用户问题：${message}`;
      systemPromptFinal = `你是一位专业的高中教师，擅长用简洁易懂的方式讲解知识点。
请根据提供的内容回答用户的问题。
回答要：
1. 简洁明了
2. 通俗易懂
3. 适当举例
4. 如有需要可以追问`;
    } else {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: '请配置 DeepSeek API Key' }, { status: 400 });
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPromptFinal },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'API 请求失败' }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '抱歉，我无法回答这个问题。';

    return NextResponse.json({ 
      content: aiResponse,
      response: aiResponse 
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: '处理失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
