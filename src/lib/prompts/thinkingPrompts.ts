/**
 * 政史地核心训练 - AI 出题 Prompt 模板库
 * 三科 × 三类型（思维导图/解题思维/答题模板）× 三层级（L1/L2/L3）
 */

// ==================== 历史 Prompt ====================

export const HISTORY_MINDMAP_PROMPTS = {
  L1: `你是一位高中历史教师。请为【{{chapterTitle}}】生成一个思维导图训练题。

要求：
1. 生成一个时间轴+因果链形式的导图骨架
2. 包含3-5个历史事件节点，每个节点有：
   - 时代/时期
   - 核心事件
   - 关键年份（可选）
   - 直接原因
   - 主要影响
3. 只给出一半的内容作为提示，另一半留空让学生填写
4. 提供完整答案用于评分对比

输出JSON格式：
{
  "title": "导图标题",
  "nodes": [
    {
      "id": "n1",
      "era": "时代",
      "event": "事件",
      "year": "年份",
      "causes": ["原因1", "原因2"],
      "effects": ["影响1", "影响2"],
      "revealed": true/false,
      "userFill": { "causes": "", "effects": "" }
    }
  ],
  "causalLinks": [
    { "from": "n1", "to": "n2", "label": "因果关系描述" }
  ],
  "answers": {
    "n1": { "causes": ["原因1"], "effects": ["影响1"] }
  }
}`,

  L2: `你是一位高中历史教师。请为【{{chapterTitle}}】生成一个拖拽排序式思维导图训练题。

要求：
1. 生成5-7个历史事件打乱顺序排列
2. 每个事件包含：时代、事件名称、简要描述
3. 要求学生按正确的时间顺序排列，并标注因果关系
4. 提供完整时间顺序和因果链

输出JSON格式：
{
  "title": "时间轴排序训练",
  "shuffledEvents": [
    { "id": "e1", "era": "时代", "event": "事件", "description": "描述" }
  ],
  "correctOrder": ["e3", "e1", "e5", "e2", "e4"],
  "causalPairs": [
    { "before": "e1", "after": "e2", "reason": "因果关系" }
  ]
}`,

  L3: `你是一位高中历史教师。请为【{{chapterTitle}}】生成一个自主构建式思维导图训练题。

要求：
1. 给出历史时期的背景和核心线索
2. 要求学生自主构建完整的知识框架，包含：
   - 时间轴（按年代排列重要事件）
   - 因果链（事件之间的逻辑关系）
   - 横向对比（同一时期不同地区/国家的比较）
3. 提供评分标准：完整性、准确性、逻辑性

输出JSON格式：
{
  "title": "自主构建：{{主题}}",
  "background": "背景描述",
  "keyEvents": ["关键事件1", "关键事件2", ...],
  "keyConcepts": ["核心概念1", "核心概念2", ...],
  "comparisonPoints": ["对比点1", "对比点2", ...],
  "scoringCriteria": {
    "completeness": "完整性要求",
    "accuracy": "准确性要求",
    "logic": "逻辑性要求"
  }
}`,
};

export const HISTORY_THINKING_PROMPTS = {
  L1: `你是一位高中历史教师。请为【{{chapterTitle}}】生成一个解题思维训练题（L1层次）。

要求：
1. 提供一段历史材料（原文或白话文）
2. 提出1-2个问题，类型包括：评析类、比较类、原因类
3. 标注出材料中的关键词（题眼）3-5个
4. 提供时空定位提示
5. 给出分步骤的答题思路

输出JSON格式：
{
  "material": "材料内容",
  "materialSource": "材料出处",
  "question": "问题",
  "type": "评价类/比较类/原因类",
  "questionEye": [
    { "keyword": "关键词", "highlight": "为什么是关键" }
  ],
  "timePosition": "时间定位",
  "spacePosition": "空间定位",
  "steps": [
    { "step": 1, "prompt": "引导问题", "keyPoint": "关键点" }
  ],
  "sampleAnswer": "参考答案"
}`,

  L2: `你是一位高中历史教师。请为【{{chapterTitle}}】生成一个材料-原理匹配训练题（L2层次）。

要求：
1. 提供一段综合材料
2. 将材料拆分为3-5个片段
3. 提供5-7个历史概念/原理选项
4. 要求学生将材料片段与正确的历史概念匹配
5. 解释每个匹配的原因

输出JSON格式：
{
  "material": "综合材料",
  "fragments": [
    { "id": "f1", "content": "片段内容", "index": 1 }
  ],
  "concepts": [
    { "id": "c1", "name": "概念名称", "description": "概念解释" }
  ],
  "correctMatches": [
    { "fragmentId": "f1", "conceptId": "c3", "reason": "匹配原因" }
  ]
}`,

  L3: `你是一位高中历史教师。请为【{{chapterTitle}}】生成一个综合审题报告训练题（L3层次）。

要求：
1. 提供一段较复杂的历史材料
2. 提出1个综合性的论述题或评析题
3. 要求学生完成完整的审题报告，包括：
   - 题眼识别
   - 时空定位
   - 答题角度
   - 完整作答
4. 提供多维度的AI评分标准

输出JSON格式：
{
  "material": "材料内容",
  "question": "综合问题",
  "type": "评析类/论述类/比较类",
  "difficulty": "困难",
  "analysisFramework": {
    "eyeIdentification": ["题眼1", "题眼2"],
    "timePosition": "时间定位",
    "spacePosition": "空间定位",
    "answerAngles": ["角度1", "角度2", "角度3"]
  },
  "referenceAnswer": {
    "structure": "答案结构",
    "keyPoints": ["要点1", "要点2"],
    "fullAnswer": "完整参考答案"
  },
  "scoringRubric": {
    "completeness": { "weight": 0.3, "description": "完整性评分标准" },
    "accuracy": { "weight": 0.4, "description": "准确性评分标准" },
    "logic": { "weight": 0.3, "description": "逻辑性评分标准" }
  }
}`,
};

export const HISTORY_TEMPLATE_PROMPTS = {
  L1: `你是一位高中历史教师。请为【{{chapterTitle}}】生成一个答题模板填空训练（L1层次）。

要求：
1. 针对高考历史常见题型（评析类、比较类、原因类、影响类）
2. 给出不完整的答题模板，空出2-3个关键要点让学生填写
3. 提供填写提示和参考答案

输出JSON格式：
{
  "templateType": "评析类/比较类/原因类/影响类",
  "templateTitle": "模板名称",
  "templateStructure": "【模板框架】主体结构描述",
  "blanks": [
    {
      "id": "b1",
      "position": "在模板中的位置",
      "hint": "填写提示",
      "answer": "参考答案",
      "example": "示例内容"
    }
  ],
  "exercise": {
    "material": "练习材料",
    "question": "练习问题",
    "filledTemplate": "填写后的完整模板"
  }
}`,

  L2: `你是一位高中历史教师。请为【{{chapterTitle}}】生成一个结构化答题训练（L2层次）。

要求：
1. 给出一个完整的历史大题
2. 要求学生按标准结构（背景-内容-影响/原因-分析-结论）作答
3. 提供结构化检查清单

输出JSON格式：
{
  "question": {
    "material": "材料",
    "question": "问题"
  },
  "requiredStructure": {
    "introduction": "开头要求",
    "body": ["要点1", "要点2", "要点3"],
    "conclusion": "结论要求"
  },
  "checklist": [
    { "item": "检查项1", "points": "得分点" }
  ]
}`,

  L3: `你是一位高中历史教师。请为【{{chapterTitle}}】生成一个高考模拟大题（L3层次）。

要求：
1. 出一道高考风格的历史大题
2. 包含2-3个小问
3. 提供详细的AI批改标准

输出JSON格式：
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
      { "level": "优秀", "score": "11-12", "description": "标准描述" },
      { "level": "良好", "score": "8-10", "description": "标准描述" }
    ]
  }
}`,
};

// ==================== 政治 Prompt ====================

export const POLITICS_MINDMAP_PROMPTS = {
  L1: `你是一位高中政治教师。请为【{{chapterTitle}}】生成一个原理树思维导图训练题（L1层次）。

要求：
1. 生成政治原理的概念树结构
2. 包含3-5个核心概念，每个概念有：
   - 概念名称
   - 定义
   - 上位概念（更一般的概念）
   - 下位概念（更具体的概念）
   - 举例
3. 只显示核心概念和上位概念，下位概念留空

输出JSON格式：
{
  "title": "原理树：{{主题}}",
  "rootConcept": "根概念",
  "branches": [
    {
      "id": "b1",
      "concept": "概念名称",
      "definition": "概念定义",
      "parentConcept": "上位概念",
      "childConcepts": ["子概念1", "子概念2"],
      "examples": ["例子1", "例子2"],
      "revealed": false
    }
  ],
  "answers": {
    "b1": { "childConcepts": ["子概念1", "子概念2"] }
  }
}`,

  L2: `你是一位高中政治教师。请为【{{chapterTitle}}】生成一个概念分类训练题（L2层次）。

要求：
1. 提供5-7个政治概念
2. 将概念按不同维度分类（如：经济/政治/文化、基本概念/应用概念等）
3. 要求学生将概念拖拽到正确的分类区域

输出JSON格式：
{
  "title": "概念分类训练",
  "concepts": [
    { "id": "c1", "name": "概念名称", "definition": "定义" }
  ],
  "categories": [
    { "id": "cat1", "name": "分类1", "description": "分类标准" }
  ],
  "correctClassification": [
    { "conceptId": "c1", "categoryId": "cat1", "reason": "分类原因" }
  ]
}`,

  L3: `你是一位高中政治教师。请为【{{chapterTitle}}】生成一个综合原理框架构建题（L3层次）。

要求：
1. 给出一个综合性主题
2. 要求学生构建完整的知识框架，包括：
   - 核心原理
   - 原理之间的关系
   - 原理的应用场景
   - 与其他单元的联系

输出JSON格式：
{
  "title": "综合原理框架构建",
  "topic": "综合主题",
  "corePrinciples": [
    { "id": "p1", "name": "核心原理", "content": "原理内容" }
  ],
  "relationships": [
    { "from": "p1", "to": "p2", "type": "包含/影响/对立", "description": "关系描述" }
  ],
  "applicationScenarios": ["场景1", "场景2"],
  "connections": [
    { "unit": "相关单元", "connection": "联系说明" }
  ]
}`,
};

export const POLITICS_THINKING_PROMPTS = {
  L1: `你是一位高中政治教师。请为【{{chapterTitle}}】生成一个时政材料分析训练题（L1层次）。

要求：
1. 提供一段时政热点材料
2. 标注材料中的关键词（连接政治原理的关键信息）
3. 匹配相应的政治原理
4. 提供多维分析角度

输出JSON格式：
{
  "material": "时政材料内容",
  "source": "材料来源（如：人民日报）",
  "keywords": [
    { "keyword": "关键词", "principle": "对应原理", "matchReason": "匹配原因" }
  ],
  "matchingPrinciples": [
    { "id": "p1", "principleName": "原理名称", "principleContent": "原理内容" }
  ],
  "analysisDimensions": ["经济角度", "政治角度", "文化角度"],
  "sampleAnalysis": "分析示例"
}`,

  L2: `你是一位高中政治教师。请为【{{chapterTitle}}】生成一个材料-原理匹配训练题（L2层次）。

要求：
1. 提供一段综合时政材料
2. 拆分为3-5个片段
3. 提供5-7个政治原理选项
4. 要求学生匹配正确的材料-原理对应关系

输出JSON格式：
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
}`,

  L3: `你是一位高中政治教师。请为【{{chapterTitle}}】生成一个综合分析训练题（L3层次）。

要求：
1. 提供一个时政热点问题
2. 要求多维度分析（经济、政治、文化、社会、生态）
3. 结合政治原理进行深入分析
4. 提供完整的答题框架和参考答案

输出JSON格式：
{
  "topic": "时政热点主题",
  "background": "背景介绍",
  "question": "综合问题",
  "dimensions": [
    {
      "dimension": "经济",
      "analysis": "分析内容",
      "relatedPrinciples": ["相关原理1", "相关原理2"]
    }
  ],
  "answerFramework": {
    "introduction": "开头写法",
    "body": ["要点1", "要点2", "要点3"],
    "conclusion": "结尾写法"
  },
  "sampleAnswer": "完整参考答案",
  "scoringRubric": {
    "dimensionCoverage": "维度覆盖评分",
    "principleApplication": "原理运用评分",
    "languageExpression": "语言表达评分"
  }
}`,
};

export const POLITICS_TEMPLATE_PROMPTS = {
  L1: `你是一位高中政治教师。请为【{{chapterTitle}}】生成一个原因意义类答题模板（L1层次）。

要求：
1. 针对"分析...原因/意义"类题型
2. 给出不完整的答题模板
3. 提供填写提示

输出JSON格式：
{
  "templateType": "原因意义类",
  "templateTitle": "模板名称",
  "templateStructure": "答题框架描述",
  "blanks": [
    { "id": "b1", "hint": "提示", "answer": "参考答案" }
  ],
  "exercise": {
    "question": "练习问题",
    "filledTemplate": "填写后模板"
  }
}`,

  L2: `你是一位高中政治教师。请为【{{chapterTitle}}】生成一个措施启示类答题训练（L2层次）。

要求：
1. 针对"如何..."、"启示"类题型
2. 要求学生按逻辑层次作答

输出JSON格式：
{
  "templateType": "措施启示类",
  "structure": {
    "fromProblem": "从问题出发",
    "fromGoal": "从目标出发",
    "fromSubject": "从主体出发"
  },
  "checklist": [
    { "item": "检查项", "score": "得分点" }
  ]
}`,

  L3: `你是一位高中政治教师。请为【{{chapterTitle}}】生成一个高考模拟大题（L3层次）。

要求：
1. 结合时政热点命题
2. 2-3个小问，多种题型组合
3. 详细的AI批改标准

输出JSON格式：
{
  "title": "高考模拟训练",
  "material": "材料内容",
  "questions": [
    {
      "subQuestion": "小问",
      "type": "原因类/措施类/评析类",
      "answerPoints": ["得分点"],
      "keyPhrase": "关键表述"
    }
  ],
  "gradingRubric": {
    "fullScore": 12,
    "criteria": []
  }
}`,
};

// ==================== 地理 Prompt ====================

export const GEOGRAPHY_MINDMAP_PROMPTS = {
  L1: `你是一位高中地理教师。请为【{{chapterTitle}}】生成一个区域要素框架训练题（L1层次）。

要求：
1. 针对自然地理五大要素（气候、地形、水文、土壤、生物）
2. 生成一个区域要素分析框架
3. 每个要素包含：要素名称、影响因素、特征描述
4. 留空让学生填写

输出JSON格式：
{
  "title": "区域要素框架：{{区域}}",
  "elements": [
    {
      "id": "e1",
      "name": "气候",
      "factors": ["影响因素1", "影响因素2"],
      "characteristics": "特征描述",
      "revealed": false
    }
  ],
  "regionalContext": "区域背景",
  "answers": {}
}`,

  L2: `你是一位高中地理教师。请为【{{chapterTitle}}】生成一个区位分析训练题（L2层次）。

要求：
1. 给出一个地理区域
2. 要求学生匹配自然/人文要素到该区域
3. 分析要素之间的相互关系

输出JSON格式：
{
  "title": "区位分析训练",
  "region": "区域名称",
  "naturalElements": [
    { "id": "n1", "name": "要素", "options": ["选项1", "选项2"] }
  ],
  "humanElements": [
    { "id": "h1", "name": "要素", "options": ["选项1", "选项2"] }
  ],
  "correctMatches": [],
  "relationships": [
    { "from": "n1", "to": "h1", "type": "影响关系", "description": "描述" }
  ]
}`,

  L3: `你是一位高中地理教师。请为【{{chapterTitle}}】生成一个综合区域分析框架构建题（L3层次）。

要求：
1. 给出一个综合性地理问题区域
2. 要求学生构建完整的分析框架

输出JSON格式：
{
  "title": "综合区域分析框架构建",
  "region": "区域",
  "coreQuestion": "核心问题",
  "analysisFramework": {
    "location": "位置分析",
    "conditions": ["条件1", "条件2"],
    "characteristics": ["特征1", "特征2"],
    "problems": ["问题1", "问题2"],
    "solutions": ["对策1", "对策2"]
  }
}`,
};

export const GEOGRAPHY_THINKING_PROMPTS = {
  L1: `你是一位高中地理教师。请为【{{chapterTitle}}】生成一个图文信息提取训练题（L1层次）。

要求：
1. 提供一个地理图表（描述形式）或文字材料
2. 标注关键信息点
3. 提出分析问题

输出JSON格式：
{
  "materialType": "图表/文字",
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
}`,

  L2: `你是一位高中地理教师。请为【{{chapterTitle}}】生成一个要素匹配训练题（L2层次）。

要求：
1. 给出一个地理现象
2. 提供多个地理要素选项
3. 要求学生匹配正确的因果关系

输出JSON格式：
{
  "phenomenon": "地理现象",
  "phenomenonDescription": "现象描述",
  "elements": [
    { "id": "e1", "name": "要素", "description": "要素解释" }
  ],
  "correctAnalysis": {
    "primaryElement": "主导要素",
    "secondaryElements": ["次要要素"],
    "reasoning": "推理过程"
  }
}`,

  L3: `你是一位高中地理教师。请为【{{chapterTitle}}】生成一个综合分析训练题（L3层次）。

要求：
1. 结合区域背景提出综合问题
2. 要求多要素分析
3. 提供完整的分析框架和参考答案

输出JSON格式：
{
  "region": "区域",
  "question": "综合问题",
  "type": "区位分析/成因分析/影响评价",
  "analysisFramework": {
    "naturalFactors": ["自然因素"],
    "humanFactors": ["人文因素"],
    "comprehensiveAnalysis": "综合分析"
  },
  "referenceAnswer": "参考答案",
  "scoringRubric": {
    "factorCoverage": "因素覆盖",
    "analysisDepth": "分析深度",
    "languageAccuracy": "语言准确性"
  }
}`,
};

export const GEOGRAPHY_TEMPLATE_PROMPTS = {
  L1: `你是一位高中地理教师。请为【{{chapterTitle}}】生成一个区位分析模板训练（L1层次）。

要求：
1. 针对"分析...区位条件"类题型
2. 给出模板框架

输出JSON格式：
{
  "templateType": "区位分析类",
  "templateTitle": "区位条件分析模板",
  "templateStructure": "自然+人文双维度框架",
  "blanks": [
    { "id": "b1", "category": "自然/人文", "hint": "提示", "answer": "答案" }
  ],
  "exercise": {
    "region": "练习区域",
    "question": "问题",
    "filledTemplate": "填写后模板"
  }
}`,

  L2: `你是一位高中地理教师。请为【{{chapterTitle}}】生成一个成因分析模板训练（L2层次）。

要求：
1. 针对"分析...成因"类题型
2. 自然原因+人为原因双维度

输出JSON格式：
{
  "templateType": "成因分析类",
  "structure": {
    "natural": ["自然原因1", "自然原因2"],
    "human": ["人为原因1", "人为原因2"]
  },
  "exercise": {
    "question": "问题",
    "analysisPoints": "分析要点"
  }
}`,

  L3: `你是一位高中地理教师。请为【{{chapterTitle}}】生成一个影响评价模板训练（L3层次）。

要求：
1. 针对"评价...影响"类题型
2. 积极影响+消极影响双维度
3. 提供可持续发展建议

输出JSON格式：
{
  "templateType": "影响评价类",
  "structure": {
    "positive": ["积极影响"],
    "negative": ["消极影响"],
    "sustainable": "可持续发展建议"
  },
  "exercise": {
    "question": "问题",
    "fullAnswer": "完整答案"
  },
  "gradingRubric": {}
}`,
};

// ==================== 通用工具函数 ====================

/**
 * 构建完整的 Prompt 字符串
 */
export function buildPrompt(
  subject: 'history' | 'politics' | 'geography',
  type: 'mindmap' | 'thinking' | 'template',
  level: 'L1' | 'L2' | 'L3',
  params: {
    chapterId: string;
    chapterTitle: string;
  }
): string {
  const prompts = {
    history: {
      mindmap: HISTORY_MINDMAP_PROMPTS,
      thinking: HISTORY_THINKING_PROMPTS,
      template: HISTORY_TEMPLATE_PROMPTS,
    },
    politics: {
      mindmap: POLITICS_MINDMAP_PROMPTS,
      thinking: POLITICS_THINKING_PROMPTS,
      template: POLITICS_TEMPLATE_PROMPTS,
    },
    geography: {
      mindmap: GEOGRAPHY_MINDMAP_PROMPTS,
      thinking: GEOGRAPHY_THINKING_PROMPTS,
      template: GEOGRAPHY_TEMPLATE_PROMPTS,
    },
  };

  const template = prompts[subject]?.[type]?.[level] || '';

  return template
    .replace('{{chapterId}}', params.chapterId)
    .replace('{{chapterTitle}}', params.chapterTitle);
}

/**
 * 获取系统提示词
 */
export function getSystemPrompt(): string {
  return `你是一位专业的中学教师，擅长为学生生成高质量的学习训练题目。
你的任务是：
1. 根据学生水平和学科特点生成合适的训练题
2. 题目要有针对性、层次性、挑战性
3. 提供详细的答案和评分标准
4. 确保题目符合高考考查方向

请以JSON格式输出题目内容。`;
}
