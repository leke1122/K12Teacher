/**
 * 答题模板 AI 生成 API
 * POST /api/thinking/template
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

    const systemPrompt = `你是一位专业的高中教师，擅长为学生生成高质量的答题模板训练题目。请严格输出有效JSON格式。`;

    let userPrompt = '';

    if (subject === 'history') {
      userPrompt = generateHistoryTemplatePrompt(chapterTitle, level || 'L1');
    } else if (subject === 'politics') {
      userPrompt = generatePoliticsTemplatePrompt(chapterTitle, level || 'L1');
    } else if (subject === 'geography') {
      userPrompt = generateGeographyTemplatePrompt(chapterTitle, level || 'L1');
    }

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
    console.error('[Thinking/Template] Error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

// ==================== 历史答题模板 Prompt ====================

function generateHistoryTemplatePrompt(chapterTitle: string, level: string): string {
  if (level === 'L1') {
    return `请为【${chapterTitle}】生成一个答题模板填空训练（L1层次）。

要求：
1. 针对高考历史常见题型（评析类、比较类、原因类、影响类）
2. 给出不完整的答题模板，空出2-3个关键要点
3. 提供填写提示和参考答案

输出JSON格式（直接输出JSON）：
{
  "templateType": "评析类",
  "templateTitle": "历史事件评析模板",
  "templateStructure": "【模板框架】\n1. 表明观点\n2. 结合史实分析积极面\n3. 分析局限性\n4. 总结评价",
  "blanks": [
    {
      "id": "b1",
      "position": "第2步：积极面",
      "hint": "从政治、经济、思想等角度分析",
      "answer": "政治上：...；经济上：...；思想上：..."
    },
    {
      "id": "b2",
      "position": "第3步：局限性",
      "hint": "从时代局限性角度分析",
      "answer": "受时代限制，存在...的不足"
    }
  ],
  "exercise": {
    "question": "练习问题",
    "filledTemplate": "填写后的完整模板"
  }
}`;
  } else if (level === 'L2') {
    return `请为【${chapterTitle}】生成一个结构化答题训练（L2层次）。

要求：
1. 给出一个完整的历史大题
2. 要求按标准结构作答

输出JSON格式（直接输出JSON）：
{
  "question": {
    "material": "材料",
    "question": "问题"
  },
  "requiredStructure": {
    "introduction": "开头：简要概括材料或表明观点",
    "body": ["要点1：史实+分析", "要点2：史实+分析"],
    "conclusion": "结尾：总结升华"
  },
  "checklist": [
    { "item": "是否结合材料", "points": "2分" },
    { "item": "是否运用所学知识", "points": "3分" }
  ]
}`;
  } else {
    return `请为【${chapterTitle}】生成一个高考模拟大题（L3层次）。

要求：
1. 出一道高考风格的历史大题
2. 2-3个小问
3. 提供详细的AI批改标准

输出JSON格式（直接输出JSON）：
{
  "title": "高考模拟训练",
  "source": "材料出处",
  "material": "完整材料",
  "questions": [
    {
      "subQuestion": "(1) 小问内容",
      "type": "评析类",
      "answerPoints": ["得分点1", "得分点2"],
      "keyPhrase": "关键表述"
    }
  ],
  "gradingRubric": {
    "fullScore": 12,
    "criteria": [
      { "level": "优秀", "score": "11-12", "description": "史实准确、分析透彻、逻辑清晰" },
      { "level": "良好", "score": "8-10", "description": "史实较准确、分析较透彻" }
    ]
  }
}`;
  }
}

// ==================== 政治答题模板 Prompt ====================

function generatePoliticsTemplatePrompt(chapterTitle: string, level: string): string {
  if (level === 'L1') {
    return `请为【${chapterTitle}】生成一个原因意义类答题模板（L1层次）。

要求：
1. 针对"分析...原因/意义"类题型
2. 给出不完整的答题模板

输出JSON格式（直接输出JSON）：
{
  "templateType": "原因意义类",
  "templateTitle": "原因/意义分析模板",
  "templateStructure": "【模板框架】\n1. 理论依据\n2. 现实依据\n3. 具体表现",
  "blanks": [
    {
      "id": "b1",
      "position": "理论依据",
      "hint": "运用政治原理回答",
      "answer": "依据...原理"
    }
  ],
  "exercise": {
    "question": "练习问题",
    "filledTemplate": "填写后模板"
  }
}`;
  } else if (level === 'L2') {
    return `请为【${chapterTitle}】生成一个措施启示类答题训练（L2层次）。

要求：
1. 针对"如何..."、"启示"类题型
2. 要求按逻辑层次作答

输出JSON格式（直接输出JSON）：
{
  "templateType": "措施启示类",
  "structure": {
    "fromProblem": "从问题出发：该问题源于...，因此需要...",
    "fromGoal": "从目标出发：要实现...目标，需要...",
    "fromSubject": "从主体出发：国家/企业/个人应该..."
  },
  "checklist": [
    { "item": "是否分角度作答", "points": "2分" },
    { "item": "是否结合材料", "points": "3分" }
  ]
}`;
  } else {
    return `请为【${chapterTitle}】生成一个高考模拟大题（L3层次）。

输出JSON格式（直接输出JSON）：
{
  "title": "高考模拟训练",
  "material": "材料内容",
  "questions": [
    {
      "subQuestion": "小问",
      "type": "原因类/措施类",
      "answerPoints": ["得分点"],
      "keyPhrase": "关键表述"
    }
  ],
  "gradingRubric": {
    "fullScore": 12,
    "criteria": []
  }
}`;
  }
}

// ==================== 地理答题模板 Prompt ====================

function generateGeographyTemplatePrompt(chapterTitle: string, level: string): string {
  if (level === 'L1') {
    return `请为【${chapterTitle}】生成一个区位分析模板训练（L1层次）。

要求：
1. 针对"分析...区位条件"类题型
2. 给出自然+人文双维度模板

输出JSON格式（直接输出JSON）：
{
  "templateType": "区位分析类",
  "templateTitle": "区位条件分析模板",
  "templateStructure": "【自然条件】\n1. 气候：...\n2. 地形：...\n3. 水源：...\n【人文条件】\n1. 市场：...\n2. 交通：...\n3. 劳动力：...",
  "blanks": [
    {
      "id": "b1",
      "position": "自然条件-气候",
      "hint": "从气温、降水角度分析",
      "answer": "气候温和/炎热，降水适中/充沛"
    }
  ],
  "exercise": {
    "region": "练习区域",
    "question": "分析该区域发展...的区位条件"
  }
}`;
  } else if (level === 'L2') {
    return `请为【${chapterTitle}】生成一个成因分析模板训练（L2层次）。

要求：
1. 针对"分析...成因"类题型
2. 自然原因+人为原因双维度

输出JSON格式（直接输出JSON）：
{
  "templateType": "成因分析类",
  "structure": {
    "natural": ["自然原因1：...", "自然原因2：..."],
    "human": ["人为原因1：...", "人为原因2：..."]
  },
  "exercise": {
    "question": "分析某地理现象的成因"
  }
}`;
  } else {
    return `请为【${chapterTitle}】生成一个影响评价模板训练（L3层次）。

要求：
1. 针对"评价...影响"类题型
2. 积极影响+消极影响+可持续发展建议

输出JSON格式（直接输出JSON）：
{
  "templateType": "影响评价类",
  "structure": {
    "positive": ["积极影响1", "积极影响2"],
    "negative": ["消极影响1", "消极影响2"],
    "sustainable": "可持续发展建议：..."
  },
  "exercise": {
    "question": "评价某工程的利与弊"
  },
  "gradingRubric": {
    "fullScore": 12,
    "criteria": []
  }
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
