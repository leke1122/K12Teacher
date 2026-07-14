import { NextRequest, NextResponse } from 'next/server';
import { Grade } from '@/stores/gradeStore';

// 跨学科知识点数据库
interface CrossLink {
  concept: string;
  subject: string;
  subjectName: string;
  subjectIcon: string;
  topic: string;
  content: string;
  relevance: number;  // 0-1 相关度
}

// 预定义跨学科知识点库
const KNOWLEDGE_DB: Record<Grade, CrossLink[]> = {
  grade1: [
    // 价格
    { concept: '价格', subject: 'politics', subjectName: '政治', subjectIcon: '🏛️', topic: '价值规律', content: '价格由价值决定，受供求关系影响。供不应求时价格上涨，供过于求时价格下跌。', relevance: 0.95 },
    { concept: '价格', subject: 'history', subjectName: '历史', subjectIcon: '📜', topic: '价格革命', content: '新航路开辟后，白银大量流入欧洲，导致物价上涨，称为"价格革命"。', relevance: 0.85 },
    { concept: '价格', subject: 'math', subjectName: '数学', subjectIcon: '📐', topic: '价格函数', content: '价格P与需求量Q的关系可表示为一次函数或二次函数，如P = a - bQ。', relevance: 0.8 },
    { concept: '价格', subject: 'geography', subjectName: '地理', subjectIcon: '🌍', topic: '区位因素', content: '农产品价格受交通、气候、土壤等区位因素影响。', relevance: 0.7 },

    // 改革
    { concept: '改革', subject: 'history', subjectName: '历史', subjectIcon: '📜', topic: '商鞅变法', content: '公元前356年商鞅变法，通过奖励耕战，废除井田制，建立县制。', relevance: 0.95 },
    { concept: '改革', subject: 'politics', subjectName: '政治', subjectIcon: '🏛️', topic: '改革是社会发展动力', content: '改革是社会主义制度的自我完善和发展，是社会发展的强大动力。', relevance: 0.85 },
    { concept: '改革', subject: 'chinese', subjectName: '语文', subjectIcon: '📜', topic: '改革主题作文', content: '改革开放、新时代改革等是高考作文高频主题。', relevance: 0.7 },

    // 水
    { concept: '水', subject: 'geography', subjectName: '地理', subjectIcon: '🌍', topic: '水循环', content: '水循环：蒸发→凝结→降水→径流→蒸发，周而复始。', relevance: 0.95 },
    { concept: '水', subject: 'chemistry', subjectName: '化学', subjectIcon: '⚗️', topic: '水的性质', content: '水（H₂O）是极性分子，具有特殊的物理化学性质，是生命之源。', relevance: 0.9 },
    { concept: '水', subject: 'history', subjectName: '历史', subjectIcon: '📜', topic: '水利工程', content: '都江堰（公元前256年）、京杭大运河是中国古代著名水利工程。', relevance: 0.75 },
    { concept: '水', subject: 'physics', subjectName: '物理', subjectIcon: '🔬', topic: '水的力学', content: '水的压强、浮力、阿基米德原理：F浮=ρ液gV排。', relevance: 0.85 },

    // 矛盾
    { concept: '矛盾', subject: 'politics', subjectName: '政治', subjectIcon: '🏛️', topic: '矛盾的普遍性与特殊性', content: '矛盾存在于一切事物之中，存在于一切事物发展过程的始终。', relevance: 0.95 },
    { concept: '矛盾', subject: 'chinese', subjectName: '语文', subjectIcon: '📜', topic: '矛盾分析法', content: '阅读理解中，通过分析文章中的矛盾冲突来把握文章主题。', relevance: 0.8 },
    { concept: '矛盾', subject: 'english', subjectName: '英语', subjectIcon: '📖', topic: '矛盾冲突类阅读', content: '阅读理解中常考人物心理矛盾、行为矛盾的分析。', relevance: 0.7 },

    // 人口
    { concept: '人口', subject: 'geography', subjectName: '地理', subjectIcon: '🌍', topic: '人口增长模式', content: '人口增长模式：原始型→传统型→现代型。', relevance: 0.95 },
    { concept: '人口', subject: 'politics', subjectName: '政治', subjectIcon: '🏛️', topic: '人口政策', content: '我国人口政策：独生子女→全面二孩→三孩政策。', relevance: 0.9 },
    { concept: '人口', subject: 'history', subjectName: '历史', subjectIcon: '📜', topic: '人口迁移', content: '闯关东、走西口、下南洋是中国历史上的大规模人口迁移。', relevance: 0.75 },
    { concept: '人口', subject: 'math', subjectName: '数学', subjectIcon: '📐', topic: '人口增长模型', content: '人口增长可用指数函数模型：P(t)=P₀·e^(rt)。', relevance: 0.7 },

    // 文化
    { concept: '文化', subject: 'politics', subjectName: '政治', subjectIcon: '🏛️', topic: '文化的作用', content: '文化是一种精神力量，能够在人们认识世界、改造世界的过程中转化为物质力量。', relevance: 0.95 },
    { concept: '文化', subject: 'history', subjectName: '历史', subjectIcon: '📜', topic: '文化交流', content: '丝绸之路促进了东西方经济文化交流。', relevance: 0.85 },
    { concept: '文化', subject: 'chinese', subjectName: '语文', subjectIcon: '📜', topic: '传统文化', content: '中华优秀传统文化是中华民族的根与魂。', relevance: 0.9 },

    // 自然
    { concept: '自然', subject: 'geography', subjectName: '地理', subjectIcon: '🌍', topic: '自然地理环境', content: '自然地理环境由气候、地形、水文、生物、土壤等要素组成。', relevance: 0.95 },
    { concept: '自然', subject: 'history', subjectName: '历史', subjectIcon: '📜', topic: '人地关系', content: '人地关系经历了依赖自然→改造自然→与自然和谐共生的演变。', relevance: 0.85 },
    { concept: '自然', subject: 'chinese', subjectName: '语文', subjectIcon: '📜', topic: '自然主题诗歌', content: '《归园田居》《山居秋暝》等诗歌表达了对自然的向往。', relevance: 0.8 },
    { concept: '自然', subject: 'physics', subjectName: '物理', subjectIcon: '🔬', topic: '自然规律', content: '牛顿运动定律揭示了宏观物体的运动规律。', relevance: 0.7 },

    // 贸易
    { concept: '贸易', subject: 'history', subjectName: '历史', subjectIcon: '📜', topic: '丝绸之路', content: '丝绸之路是古代东西方贸易和文化交流的重要通道。', relevance: 0.9 },
    { concept: '贸易', subject: 'politics', subjectName: '政治', subjectIcon: '🏛️', topic: '国际贸易', content: '经济全球化下，各国通过国际贸易实现资源优化配置。', relevance: 0.9 },
    { concept: '贸易', subject: 'geography', subjectName: '地理', subjectIcon: '🌍', topic: '交通运输', content: '交通是贸易发展的基础，影响贸易成本和效率。', relevance: 0.8 },

    // 科技
    { concept: '科技', subject: 'history', subjectName: '历史', subjectIcon: '📜', topic: '三次科技革命', content: '第一次（蒸汽机）→第二次（电气）→第三次（信息技术）。', relevance: 0.95 },
    { concept: '科技', subject: 'physics', subjectName: '物理', subjectIcon: '🔬', topic: '物理学发展', content: '从牛顿力学到相对论、量子力学，物理学推动科技发展。', relevance: 0.85 },
    { concept: '科技', subject: 'politics', subjectName: '政治', subjectIcon: '🏛️', topic: '科技创新', content: '科技创新是推动经济发展和社会进步的决定性力量。', relevance: 0.85 },
    { concept: '科技', subject: 'english', subjectName: '英语', subjectIcon: '📖', topic: '科技词汇', content: 'AI, Big Data, Internet of Things 等是高频科技英语词汇。', relevance: 0.7 },

    // 发展
    { concept: '发展', subject: 'politics', subjectName: '政治', subjectIcon: '🏛️', topic: '新发展理念', content: '创新、协调、绿色、开放、共享的新发展理念。', relevance: 0.95 },
    { concept: '发展', subject: 'geography', subjectName: '地理', subjectIcon: '🌍', topic: '可持续发展', content: '可持续发展：满足当代人需求，不损害后代人满足需求的能力。', relevance: 0.9 },
    { concept: '发展', subject: 'history', subjectName: '历史', subjectIcon: '📜', topic: '社会发展阶段', content: '原始社会→奴隶社会→封建社会→资本主义社会→社会主义社会。', relevance: 0.85 },
  ],
  grade2: [],
  grade3: [],
};

// 填充 grade2 和 grade3（复用 grade1 但附加额外内容）
KNOWLEDGE_DB.grade2 = KNOWLEDGE_DB.grade1;
KNOWLEDGE_DB.grade3 = KNOWLEDGE_DB.grade1;

// AI生成串联讲解（模拟，实际用 LLM）
function generateConnectingExplanation(concept: string, relatedLinks: CrossLink[]): {
  steps: Array<{ step: number; prompt: string; answer: string }>;
  fullExplanation: string;
} {
  const steps = [
    { step: 1, prompt: `关于"${concept}"，你首先想到的是哪个学科？`, answer: '' },
    {
      step: 2,
      prompt: `好的！让我们从${relatedLinks[0]?.subjectName || '政治'}开始：${relatedLinks[0]?.topic || concept}是什么？`,
      answer: relatedLinks[0]?.content || '',
    },
  ];

  const otherLinks = relatedLinks.slice(1);
  otherLinks.forEach((link, idx) => {
    steps.push({
      step: steps.length + 1,
      prompt: `那${link.subjectName}中的"${link.topic}"呢？它们有什么联系？`,
      answer: link.content,
    });
  });

  steps.push({
    step: steps.length + 1,
    prompt: `把这些联系起来，你能得出什么结论？`,
    answer: `💡 总结："${concept}"是一个跨学科的核心概念，连接了${relatedLinks.map(l => l.subjectName).join('、')}等多个领域。理解这个概念的不同侧面，可以帮助我们形成更全面的认识。`,
  });

  const fullExplanation = `# ${concept}的跨学科串联\n\n${relatedLinks.map((link) => `## ${link.subjectIcon} ${link.subjectName} · ${link.topic}\n\n${link.content}\n\n`).join('---\n\n')}\n\n## 总结\n\n"${concept}"是一个典型的跨学科概念：\n- **政治视角**揭示了其社会本质\n- **历史视角**展示了其演变过程\n- **地理视角**分析了其空间分布\n- **理科视角**解释了其自然规律\n\n通过跨学科理解，你会发现很多知识是相通的！`;

  return { steps, fullExplanation };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const concept = body.concept?.trim() || '';
    const grade = (body.grade || 'grade1') as Grade;

    if (!concept) {
      return NextResponse.json({ success: false, error: '请输入核心概念' }, { status: 400 });
    }

    const db = KNOWLEDGE_DB[grade] || KNOWLEDGE_DB.grade1;

    // 模糊搜索相关知识点
    const relatedLinks = db.filter((link) =>
      link.concept.includes(concept) ||
      link.topic.includes(concept) ||
      link.content.includes(concept)
    );

    if (relatedLinks.length === 0) {
      // 返回空结果但仍提供引导
      return NextResponse.json({
        success: true,
        concept,
        grade,
        relatedLinks: [],
        steps: [
          { step: 1, prompt: `关于"${concept}"，我还没收录相关内容。但让我们一起来思考：`, answer: '' },
          { step: 2, prompt: `你觉得"${concept}"在生活中有什么例子？`, answer: '' },
          { step: 3, prompt: `在课堂上学过和"${concept}"相关的知识吗？`, answer: '' },
        ],
        fullExplanation: `关于"${concept}"，这是一个很有深度的话题。虽然我的知识库中还没有收录具体的跨学科联系，但建议你从以下角度思考：\n\n1. **课堂上**：各科老师讲过什么和"${concept}"相关的内容？\n2. **生活中**：日常生活中有什么和"${concept}"相关的现象？\n3. **新闻中**：有没有关于"${concept}"的时事热点？\n\n如果你有更多资料，可以上传教材，我会帮你建立更完整的知识联系！`,
      });
    }

    // 按相关度排序
    const sortedLinks = relatedLinks.sort((a, b) => b.relevance - a.relevance);

    const { steps, fullExplanation } = generateConnectingExplanation(concept, sortedLinks);

    return NextResponse.json({
      success: true,
      concept,
      grade,
      relatedLinks: sortedLinks,
      steps,
      fullExplanation,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: '处理失败' }, { status: 500 });
  }
}
