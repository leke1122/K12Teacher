/**
 * 思维导图 AI 生成 API
 * POST /api/thinking/mindmap
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, chapterId, level } = body;

    if (!subject || !chapterId) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 构建 Prompt
    const chapterTitles: Record<string, string> = {
      // 历史
      unit1: '第一单元：从中华文明起源到秦汉统一多民族封建国家',
      unit2: '第二单元：三国两晋南北朝的民族交融与隋唐统一',
      unit3: '第三单元：辽宋夏金元多民族政权的并立与元朝统一',
      // 政治
      ch1: '第一课：社会主义从空想到科学',
      ch2: '第二课：社会主义从理论到现实',
      ch3: '第三课：只有坚持和发展中国特色社会主义',
      // 地理
      'geog-ch1': '第一章：宇宙中的地球',
      'geog-ch2': '第二章：地球上的大气',
      'geog-ch3': '第三章：地球上的水',
    };

    const chapterTitle = chapterTitles[chapterId] || chapterId;

    // 构建系统 Prompt
    const systemPrompt = `你是一位专业的中学教师，擅长为学生生成高质量的思维导图训练题目。
请严格按以下要求生成题目，确保输出有效的 JSON 格式。`;

    // 根据学科和难度生成不同风格的 Prompt
    let userPrompt = '';
    
    if (subject === 'history') {
      userPrompt = generateHistoryMindmapPrompt(chapterTitle, level || 'L1');
    } else if (subject === 'politics') {
      userPrompt = generatePoliticsMindmapPrompt(chapterTitle, level || 'L1');
    } else if (subject === 'geography') {
      userPrompt = generateGeographyMindmapPrompt(chapterTitle, level || 'L1');
    }

    // 调用 AI（通过 fetch 到 /api/chat）
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '') || '';
    
    // 调用 /api/chat（DeepSeek API）
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY || apiKey;
    
    if (!deepseekApiKey) {
      return NextResponse.json(
        { success: false, message: '请配置 DeepSeek API Key' },
        { status: 500 }
      );
    }
    
    const chatResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!chatResponse.ok) {
      return NextResponse.json(
        { success: false, message: 'AI 服务暂时不可用' },
        { status: 500 }
      );
    }

    const chatData = await chatResponse.json();
    const answer = chatData.choices?.[0]?.message?.content || '';
    const jsonData = extractJSON(answer);

    if (!jsonData) {
      return NextResponse.json(
        { success: false, message: '无法解析 AI 返回内容' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jsonData,
      subject,
      chapterId,
      level: level || 'L1',
    });

  } catch (error) {
    console.error('[Thinking/Mindmap] Error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// ==================== 历史 Prompt 生成 ====================

function generateHistoryMindmapPrompt(chapterTitle: string, level: string): string {
  if (level === 'L1') {
    return `请为【${chapterTitle}】生成一个历史时间轴思维导图训练题。

要求：
1. 生成一个包含3-5个历史事件节点的时间轴
2. 每个节点包含：时代、事件名称、关键年份、直接原因、主要影响
3. 只显示一半内容，另一半留空（userFill字段）
4. 提供完整的参考答案

输出JSON格式（直接输出JSON，不要有其他内容）：
{
  "title": "历史时间轴与因果链",
  "nodes": [
    {
      "id": "n1",
      "era": "时代",
      "event": "事件",
      "year": "年份",
      "causes": ["原因1", "原因2"],
      "effects": ["影响1", "影响2"],
      "revealed": true,
      "userFill": {
        "causes": "",
        "effects": ""
      }
    }
  ],
  "causalLinks": [
    { "from": "n1", "to": "n2", "label": "因果关系描述" }
  ]
}`;
  } else if (level === 'L2') {
    return `请为【${chapterTitle}】生成一个历史事件排序训练题。

要求：
1. 生成5-7个历史事件打乱顺序
2. 要求学生按正确的时间顺序排列
3. 并标注相邻事件之间的因果关系

输出JSON格式（直接输出JSON）：
{
  "title": "历史事件排序训练",
  "shuffledEvents": [
    { "id": "e1", "era": "时代", "event": "事件", "description": "简要描述" }
  ],
  "correctOrder": ["e3", "e1", "e5", "e2", "e4"],
  "causalPairs": [
    { "before": "e1", "after": "e2", "reason": "因果关系" }
  ]
}`;
  } else {
    return `请为【${chapterTitle}】生成一个自主构建历史知识框架的训练题。

要求：
1. 给出历史时期的背景和核心线索
2. 要求学生自主构建：时间轴、因果链、横向对比
3. 提供评分标准

输出JSON格式（直接输出JSON）：
{
  "title": "自主构建：历史知识框架",
  "background": "背景描述",
  "keyEvents": ["关键事件1", "关键事件2"],
  "comparisonPoints": ["对比点1", "对比点2"],
  "scoringCriteria": {
    "completeness": "完整性要求",
    "accuracy": "准确性要求",
    "logic": "逻辑性要求"
  }
}`;
  }
}

// ==================== 政治 Prompt 生成 ====================

function generatePoliticsMindmapPrompt(chapterTitle: string, level: string): string {
  if (level === 'L1') {
    return `请为【${chapterTitle}】生成一个政治原理树思维导图训练题。

要求：
1. 生成一个政治概念层级结构图
2. 根概念 → 二级概念 → 三级概念
3. 只显示根概念和二级概念，三级概念留空

输出JSON格式（直接输出JSON）：
{
  "title": "政治原理树",
  "rootConcept": "核心原理",
  "branches": [
    {
      "id": "b1",
      "concept": "二级概念",
      "definition": "概念定义",
      "childConcepts": [],
      "revealed": false
    }
  ]
}`;
  } else if (level === 'L2') {
    return `请为【${chapterTitle}】生成一个政治概念分类训练题。

要求：
1. 提供5-7个政治概念
2. 要求学生将概念分类到正确的维度

输出JSON格式（直接输出JSON）：
{
  "title": "概念分类训练",
  "concepts": [
    { "id": "c1", "name": "概念", "definition": "定义" }
  ],
  "categories": [
    { "id": "cat1", "name": "分类名称", "description": "分类标准" }
  ]
}`;
  } else {
    return `请为【${chapterTitle}】生成一个综合原理框架构建题。

输出JSON格式（直接输出JSON）：
{
  "title": "综合原理框架构建",
  "corePrinciples": [
    { "name": "核心原理", "content": "内容" }
  ],
  "relationships": [
    { "from": "p1", "to": "p2", "type": "关系类型", "description": "描述" }
  ]
}`;
  }
}

// ==================== 地理 Prompt 生成 ====================

function generateGeographyMindmapPrompt(chapterTitle: string, level: string): string {
  if (level === 'L1') {
    return `请为【${chapterTitle}】生成一个区域地理要素框架训练题。

要求：
1. 生成自然地理五大要素（气候、地形、水文、土壤、生物）的分析框架
2. 每个要素包含：要素名称、影响因素、特征描述
3. 部分内容留空让学生填写

输出JSON格式（直接输出JSON）：
{
  "title": "区域要素框架",
  "elements": [
    {
      "id": "e1",
      "name": "气候",
      "factors": ["影响因素1"],
      "characteristics": "特征描述",
      "revealed": true,
      "userFill": { "factors": "", "characteristics": "" }
    }
  ],
  "regionalContext": "区域背景"
}`;
  } else if (level === 'L2') {
    return `请为【${chapterTitle}】生成一个区位分析训练题。

输出JSON格式（直接输出JSON）：
{
  "title": "区位分析训练",
  "region": "区域名称",
  "naturalElements": [
    { "id": "n1", "name": "要素", "options": ["选项1", "选项2"] }
  ],
  "humanElements": [
    { "id": "h1", "name": "要素", "options": ["选项1", "选项2"] }
  ]
}`;
  } else {
    return `请为【${chapterTitle}】生成一个综合区域分析框架构建题。

输出JSON格式（直接输出JSON）：
{
  "title": "综合区域分析",
  "coreQuestion": "核心问题",
  "analysisFramework": {
    "location": "位置分析",
    "conditions": ["条件1", "条件2"],
    "problems": ["问题1", "问题2"],
    "solutions": ["对策1", "对策2"]
  }
}`;
  }
}

// ==================== 工具函数 ====================

function extractJSON(text: string): unknown {
  // 尝试多种方式提取 JSON
  const patterns = [
    /```json\n?([\s\S]*?)\n?```/,
    /```\n?([\s\S]*?)\n?```/,
    /(\{[\s\S]*\}|\[[\s\S]*\])/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        // 尝试修复
        try {
          const fixed = match[1]
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/'/g, '"');
          return JSON.parse(fixed);
        } catch {
          continue;
        }
      }
    }
  }

  return null;
}
