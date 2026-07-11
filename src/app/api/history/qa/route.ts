import { NextRequest, NextResponse } from 'next/server';
import { generateAIContext, concepts, timelineEvents } from '@/data/history/unit1_data';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { success: false, message: '请提供有效的问题' },
        { status: 400 }
      );
    }

    // 优先从请求头获取 API Key（前端会传递 localStorage 中的 key）
    const authHeader = request.headers.get('authorization');
    let apiKey = authHeader?.replace('Bearer ', '');

    // 如果请求头没有，尝试从环境变量读取
    if (!apiKey) {
      apiKey = process.env.DEEPSEEK_API_KEY;
    }

    // 如果都没有，返回明确的错误信息
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: '请先在设置页面配置 DeepSeek API Key' },
        { status: 401 }
      );
    }

    // 生成 AI 上下文
    const context = generateAIContext();

    // 构建系统提示词
    const systemPrompt = `你是高中历史第一单元的专属学习助手。你必须严格根据提供的数据回答问题。

【核心原则】
1. 回答时必须引用提供的知识点数据，格式为"根据第一单元知识点：..."
2. 如果问题超出第一单元范围，请明确说明"这个问题超出了第一单元的知识点范围"
3. 严禁胡编乱造，只回答数据中明确包含的内容
4. 可以综合多个知识点来回答综合性问题
5. 可以解释历史概念、制度、事件的背景和影响

【第一单元知识点数据】
${context}

【回答格式】
请先用简短的总结回答问题，然后根据需要展开详细说明。可以引用相关的时间轴事件和核心概念。`;

    // 调用 DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepSeek API error:', response.status, errorData);
      return NextResponse.json(
        { success: false, message: 'AI 服务暂时不可用，请稍后重试' },
        { status: 502 }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || '抱歉，我无法回答这个问题';

    return NextResponse.json({
      success: true,
      data: {
        answer,
        relatedEvents: findRelatedEvents(question),
        relatedConcepts: findRelatedConcepts(question),
      },
    });
  } catch (error) {
    console.error('History QA error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}

// 简单关键词匹配，查找相关事件
function findRelatedEvents(question: string): Array<{ id: string; title: string; year: string }> {
  const keywords = extractKeywords(question);
  const related: Array<{ id: string; title: string; year: string }> = [];

  for (const event of timelineEvents) {
    let score = 0;
    const eventText = `${event.title} ${event.summary}`.toLowerCase();
    for (const keyword of keywords) {
      if (eventText.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    if (score > 0) {
      related.push({ id: event.id, title: event.title, year: event.year });
    }
  }

  return related.slice(0, 5);
}

// 简单关键词匹配，查找相关概念
function findRelatedConcepts(question: string): Array<{ id: string; name: string; category: string }> {
  const keywords = extractKeywords(question);
  const related: Array<{ id: string; name: string; category: string }> = [];

  for (const concept of concepts) {
    let score = 0;
    const conceptText = `${concept.name} ${concept.definition}`.toLowerCase();
    for (const keyword of keywords) {
      if (conceptText.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    if (score > 0) {
      related.push({ id: concept.id, name: concept.name, category: concept.category });
    }
  }

  return related.slice(0, 5);
}

// 提取关键词
function extractKeywords(text: string): string[] {
  const stopWords = ['的', '是', '了', '在', '和', '与', '对', '有', '什么', '怎么', '如何', '为什么', '哪个', '哪些', '历史', '单元', '第一', '高中'];
  const words = text
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !stopWords.includes(w));

  // 去重并限制数量
  return [...new Set(words)].slice(0, 10);
}
