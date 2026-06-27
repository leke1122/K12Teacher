import { NextRequest, NextResponse } from 'next/server';
import { getChapterTextByPages, getChapterTitle } from '@/lib/historyData.server';

// 历史课本还原请求类型
interface ExplainRequest {
  chapterId: string;
  startPage?: number;
  endPage?: number;
  apiKey?: string;
}

// 历史课本还原结果类型
interface ParagraphExplain {
  paragraphText: string;
  time: string;
  location: string;
  figures: string[];
  core: string;
  effects: string;
  significance: string;
}

interface ExplainResponse {
  chapterId: string;
  title: string;
  paragraphs: ParagraphExplain[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ExplainRequest = await request.json().catch(() => ({}));
    const { chapterId, startPage, endPage, apiKey: requestApiKey } = body;

    if (!chapterId) {
      return NextResponse.json({ success: false, message: '缺少章节ID' }, { status: 400 });
    }

    // 获取教材内容
    const text = getChapterTextByPages(chapterId, startPage, endPage);

    if (!text) {
      return NextResponse.json(
        { success: false, message: '未找到教材内容，请先上传历史教材' },
        { status: 404 }
      );
    }

    const title = getChapterTitle(chapterId);

    // 优先使用请求中的 Key，其次使用环境变量
    const apiKey = requestApiKey || process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: '请先在设置页面配置 DeepSeek API Key' },
        { status: 400 }
      );
    }

    // 历史专用 AI 提示词 - 课本还原
    const prompt = `你是一位严谨的历史教师。请为以下历史教材段落生成讲解内容。

## 核心原则
1. **严格基于教材**：所有讲解必须基于教材原文，不添加教材外的内容
2. **准确无误**：时间、地点、人物、事件名称必须与教材一致，不产生幻觉
3. **不使用类比**：历史不需要"生活化类比"，只需要事实和逻辑

## 讲解结构
请将教材内容分段讲解，每段讲解必须包含：
- paragraphText: 原文内容（完整保留）
- time: 该事件发生的具体时间（教材未提及则写"教材未明确提及"）
- location: 涉及的地理范围
- figures: 关键人物及其作用
- core: 核心内容（发生了什么，基于教材）
- effects: 带来的变化
- significance: 历史意义

## 教材章节：${title}

## 教材内容：
${text}

请以 JSON 数组格式返回，每段教材对应一个讲解对象。不要包含任何其他文本。格式：
[
  {
    "paragraphText": "原文...",
    "time": "时间",
    "location": "地点",
    "figures": ["人物1", "人物2"],
    "core": "核心内容",
    "effects": "影响",
    "significance": "历史意义"
  }
]`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个严格输出 JSON 的历史课本讲解助手，必须只返回 JSON 数组。内容必须基于教材原文，不编造任何信息，不使用类比。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'AI 请求失败');
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    // 解析 JSON
    let paragraphs: ParagraphExplain[] = [];
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        paragraphs = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('[API history/textbook/explain] parse error:', parseError);
      return NextResponse.json(
        { success: false, message: '讲解解析失败' },
        { status: 500 }
      );
    }

    if (paragraphs.length === 0) {
      return NextResponse.json(
        { success: false, message: '未生成讲解内容' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        chapterId,
        title,
        paragraphs,
      } as ExplainResponse,
    });
  } catch (error) {
    console.error('[API history/textbook/explain] error:', error);
    return NextResponse.json(
      { success: false, message: '生成讲解失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
