import { NextRequest, NextResponse } from 'next/server';
import { setServerData } from '@/lib/serverStorage';

interface MindmapNode {
  id: string;
  label: string;
  children?: MindmapNode[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, text, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json({ error: '请先配置 DeepSeek API Key' }, { status: 400 });
    }

    if (!text || text.length < 100) {
      return NextResponse.json({ error: '课文内容不足' }, { status: 400 });
    }

    const prompt = `你是一位语文教学专家。请分析以下课文内容，生成一个结构化的思维导图JSON。

## 课文内容
${text.slice(0, 8000)}

## 要求
分析课文的结构，生成思维导图：
1. 中心节点：课文标题或主题
2. 一级子节点：文章的主要层次/段落大意/情感主线
3. 二级子节点：关键论据/重要意象/修辞手法/精彩语句
4. 叶子节点：具体解释或引用

## 输出格式（严格JSON）
{
  "id": "root",
  "label": "课文标题",
  "children": [
    {
      "id": "node1",
      "label": "层次1/论点1",
      "children": [
        {"id": "leaf1", "label": "关键论据或意象1"},
        {"id": "leaf2", "label": "关键论据或意象2"}
      ]
    }
  ]
}

请只输出JSON，不要其他文字。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位专业的语文教学专家。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // 解析JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('未能生成思维导图');
    }

    const mindmapData = JSON.parse(jsonMatch[0]) as MindmapNode;

    // 保存到服务器存储
    const key = `chinese_mindmap_${chapterId}_${Date.now()}`;
    setServerData(key, { chapterId, mindmapData, createdAt: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      mindmap: mindmapData,
    });
  } catch (error) {
    console.error('[chinese/reading/mindmap] 生成失败:', error);
    return NextResponse.json(
      { error: '生成思维导图失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get('chapterId');
  if (!chapterId) {
    return NextResponse.json({ error: '缺少 chapterId' }, { status: 400 });
  }

  // 从服务器存储获取最新的思维导图
  try {
    const allKeys = Object.keys(localStorage || {}).filter(k => k.includes(`chinese_mindmap_${chapterId}`));
    // 注意：这里需要用 serverStorage 的方法
    const { listServerKeys, getServerData } = await import('@/lib/serverStorage');
    const keys = listServerKeys(`chinese_mindmap_${chapterId}_`);
    if (keys.length > 0) {
      const latest = getServerData<{ mindmap?: unknown }>(keys[keys.length - 1]);
      return NextResponse.json({ success: true, mindmap: latest?.mindmap });
    }
    return NextResponse.json({ success: false, mindmap: null });
  } catch {
    return NextResponse.json({ success: false, mindmap: null });
  }
}
