import { NextRequest, NextResponse } from 'next/server';

interface DialogueMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterTitle, firstImpression, conversationHistory, userMessage, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: '请先配置 DeepSeek API Key' }, { status: 400 });
    }

    if (!userMessage) {
      return NextResponse.json({ error: '请输入消息' }, { status: 400 });
    }

    // 构建对话历史
    const messages: DialogueMessage[] = [];

    // 系统提示
    const systemPrompt = `你是一位睿智的语文老师，正在引导学生进行深度阅读反思。请：
1. 根据学生在第1步写的第一印象，结合课文内容提问
2. 引导学生思考课文的深层含义、作者的写作意图
3. 鼓励学生表达自己的观点，培养批判性思维
4. 对学生的回答给予肯定和进一步引导
5. 用温暖、耐心的语气进行对话`;

    messages.push({ role: 'assistant', content: systemPrompt });

    // 添加课文标题
    if (chapterTitle) {
      messages.push({ role: 'assistant', content: `我们今天学习的课文是《${chapterTitle}》。` });
    }

    // 添加学生第一印象
    if (firstImpression) {
      messages.push({ role: 'assistant', content: `你在初读时写道：${firstImpression}。` });
    }

    // 添加对话历史
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: DialogueMessage) => {
        messages.push(msg);
      });
    }

    // 添加用户最新消息
    messages.push({ role: 'user', content: userMessage });

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages.map(m => ({
          role: m.role,
          content: m.role === 'assistant' && m.content.length > 500 ? m.content.slice(0, 500) : m.content,
        })),
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error('[chinese/reading/dialogue] 对话失败:', error);
    return NextResponse.json(
      { error: '对话失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
