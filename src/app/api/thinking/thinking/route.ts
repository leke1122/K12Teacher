/**
 * 解题思维 AI 生成 API
 * POST /api/thinking/thinking
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

    // 章节标题映射
    const chapterTitles: Record<string, string> = {
      unit1: '第一单元：从中华文明起源到秦汉统一',
      unit2: '第二单元：三国两晋南北朝到隋唐',
      unit3: '第三单元：辽宋夏金元',
      ch1: '第一课：社会主义从空想到科学',
      ch2: '第二课：社会主义从理论到现实',
      ch3: '第三课：中国特色社会主义',
      'geog-ch1': '第一章：宇宙中的地球',
      'geog-ch2': '第二章：地球上的大气',
      'geog-ch3': '第三章：地球上的水',
    };

    const chapterTitle = chapterTitles[chapterId] || chapterId;

    const systemPrompt = `你是一位专业的高中教师，擅长为学生生成高质量的解题思维训练题目。请严格输出有效JSON格式。`;

    let userPrompt = '';

    if (subject === 'history') {
      userPrompt = generateHistoryThinkingPrompt(chapterTitle, level || 'L1');
    } else if (subject === 'politics') {
      userPrompt = generatePoliticsThinkingPrompt(chapterTitle, level || 'L1');
    } else if (subject === 'geography') {
      userPrompt = generateGeographyThinkingPrompt(chapterTitle, level || 'L1');
    }

    // 调用 AI
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '') || '';
    
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
    console.error('[Thinking/Thinking] Error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// ==================== 历史 Prompt ====================

function generateHistoryThinkingPrompt(chapterTitle: string, level: string): string {
  if (level === 'L1') {
    return `请为【${chapterTitle}】生成一个解题思维训练题（L1层次：题眼识别）。

要求：
1. 提供一段历史材料
2. 提出1-2个问题（评析类、比较类、原因类）
3. 标注材料中的关键词（题眼）3-5个
4. 提供时空定位提示
5. 给出分步骤的答题思路

输出JSON格式（直接输出JSON）：
{
  "material": "材料内容",
  "materialSource": "材料出处",
  "question": "问题",
  "type": "评价类",
  "questionEye": [
    { "keyword": "关键词", "explanation": "为什么是关键" }
  ],
  "timePosition": "时间定位",
  "spacePosition": "空间定位",
  "steps": [
    { "step": 1, "prompt": "引导问题", "keyPoint": "关键点" }
  ],
  "sampleAnswer": "参考答案要点"
}`;
  } else if (level === 'L2') {
    return `请为【${chapterTitle}】生成一个材料-概念匹配训练题（L2层次）。

要求：
1. 提供一段综合材料
2. 将材料拆分为3-5个片段
3. 提供5-7个历史概念选项
4. 要求将材料片段与正确的历史概念匹配

输出JSON格式（直接输出JSON）：
{
  "material": "综合材料内容",
  "fragments": [
    { "id": "f1", "content": "片段内容", "index": 1 }
  ],
  "concepts": [
    { "id": "c1", "name": "概念名称", "description": "概念解释" }
  ],
  "correctMatches": [
    { "fragmentId": "f1", "conceptId": "c3", "reason": "匹配原因" }
  ]
}`;
  } else {
    return `请为【${chapterTitle}】生成一个综合审题报告训练题（L3层次）。

要求：
1. 提供一段较复杂的历史材料
2. 提出一个综合性的评析题或论述题
3. 要求完成完整审题报告
4. 提供多维度AI评分标准

输出JSON格式（直接输出JSON）：
{
  "material": "材料内容",
  "question": "综合问题",
  "type": "评析类",
  "analysisFramework": {
    "eyeIdentification": ["题眼1", "题眼2"],
    "timePosition": "时间定位",
    "spacePosition": "空间定位",
    "answerAngles": ["角度1", "角度2"]
  },
  "referenceAnswer": "参考答案",
  "scoringRubric": {
    "completeness": { "weight": 0.3, "description": "完整性标准" },
    "accuracy": { "weight": 0.4, "description": "准确性标准" },
    "logic": { "weight": 0.3, "description": "逻辑性标准" }
  }
}`;
  }
}

// ==================== 政治 Prompt ====================

function generatePoliticsThinkingPrompt(chapterTitle: string, level: string): string {
  if (level === 'L1') {
    return `请为【${chapterTitle}】生成一个时政材料分析训练题（L1层次）。

要求：
1. 提供一段时政热点材料
2. 标注材料中的关键词
3. 匹配相应的政治原理
4. 提供多维分析角度

输出JSON格式（直接输出JSON）：
{
  "material": "时政材料内容",
  "source": "材料来源",
  "keywords": [
    { "keyword": "关键词", "principle": "对应原理", "reason": "匹配原因" }
  ],
  "principles": [
    { "id": "p1", "name": "原理名称", "content": "原理内容" }
  ],
  "analysisDimensions": ["经济角度", "政治角度", "文化角度"],
  "sampleAnalysis": "分析示例"
}`;
  } else if (level === 'L2') {
    return `请为【${chapterTitle}】生成一个材料-原理匹配训练题（L2层次）。

输出JSON格式（直接输出JSON）：
{
  "material": "综合材料",
  "fragments": [
    { "id": "f1", "content": "片段内容" }
  ],
  "principles": [
    { "id": "pr1", "name": "原理名称", "content": "原理内容" }
  ],
  "correctMatches": [
    { "fragmentId": "f1", "principleId": "pr3", "reason": "匹配原因" }
  ]
}`;
  } else {
    return `请为【${chapterTitle}】生成一个综合分析训练题（L3层次）。

要求：
1. 提供一个时政热点问题
2. 要求多维度分析（经济、政治、文化、社会）
3. 结合政治原理进行深入分析

输出JSON格式（直接输出JSON）：
{
  "topic": "时政热点主题",
  "question": "综合问题",
  "dimensions": [
    {
      "dimension": "经济",
      "analysis": "分析内容",
      "principles": ["相关原理1", "相关原理2"]
    }
  ],
  "answerFramework": {
    "introduction": "开头写法",
    "body": ["要点1", "要点2"],
    "conclusion": "结尾写法"
  },
  "sampleAnswer": "完整参考答案"
}`;
  }
}

// ==================== 地理 Prompt ====================

function generateGeographyThinkingPrompt(chapterTitle: string, level: string): string {
  if (level === 'L1') {
    return `请为【${chapterTitle}】生成一个图文信息提取训练题（L1层次）。

要求：
1. 提供一个地理图表描述或文字材料
2. 标注关键信息点
3. 提出分析问题

输出JSON格式（直接输出JSON）：
{
  "materialType": "图表",
  "materialDescription": "材料描述",
  "keyInformation": [
    { "info": "信息1", "significance": "意义" }
  ],
  "questions": [
    {
      "question": "问题",
      "answer": "参考答案",
      "keyPoint": "关键点"
    }
  ]
}`;
  } else if (level === 'L2') {
    return `请为【${chapterTitle}】生成一个要素匹配训练题（L2层次）。

要求：
1. 给出一个地理现象
2. 提供多个地理要素选项
3. 要求学生匹配正确的因果关系

输出JSON格式（直接输出JSON）：
{
  "phenomenon": "地理现象",
  "description": "现象描述",
  "elements": [
    { "id": "e1", "name": "要素", "description": "要素解释" }
  ],
  "correctAnalysis": {
    "primaryElement": "主导要素",
    "reasoning": "推理过程"
  }
}`;
  } else {
    return `请为【${chapterTitle}】生成一个综合分析训练题（L3层次）。

要求：
1. 结合区域背景提出综合问题
2. 要求多要素分析
3. 提供完整的分析框架

输出JSON格式（直接输出JSON）：
{
  "region": "区域",
  "question": "综合问题",
  "type": "区位分析",
  "analysisFramework": {
    "naturalFactors": ["自然因素"],
    "humanFactors": ["人文因素"],
    "comprehensive": "综合分析"
  },
  "referenceAnswer": "参考答案"
}`;
  }
}

// ==================== 工具函数 ====================

function extractJSON(text: string): unknown {
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
