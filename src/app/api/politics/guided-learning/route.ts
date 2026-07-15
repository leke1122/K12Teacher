import { NextRequest, NextResponse } from 'next/server';
import { UNIT1_FULL_DATA, GUIDED_SECTIONS, SOCIAL_FORMS_FULL, CAPITALIST_CRISIS } from '@/data/politics/unit1_full_data';

export interface GuidedProgress {
  sectionIndex: number;
  completedSections: string[];
  answers: Record<string, string>;
  practiceAnswers: Record<string, number | string>;
  startedAt: string;
}

export interface PracticeQuestion {
  id: string;
  type: 'choice' | 'material' | 'blank';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  relatedSection: string;
}

// 获取引导章节列表
export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'sections';

  if (action === 'sections') {
    return NextResponse.json({
      success: true,
      data: {
        sections: GUIDED_SECTIONS.map(s => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          type: s.type,
          keyPointsCount: s.keyPoints.length,
          thinkQuestionsCount: s.thinkQuestions.length,
        })),
        bookOverview: UNIT1_FULL_DATA.bookOverview,
        socialForms: SOCIAL_FORMS_FULL.map(sf => ({
          id: sf.id,
          name: sf.name,
        })),
      },
    });
  }

  if (action === 'section') {
    const sectionId = request.nextUrl.searchParams.get('sectionId');
    const section = GUIDED_SECTIONS.find(s => s.id === sectionId);
    if (!section) {
      return NextResponse.json({ success: false, message: '章节不存在' }, { status: 404 });
    }

    // 获取关联的社会形态详情（如果需要）
    let relatedSocialForm = null;
    const socialForm = SOCIAL_FORMS_FULL.find(sf => sf.id === sectionId);
    if (socialForm) {
      relatedSocialForm = socialForm;
    }

    // 获取资本主义经济危机详情（如果是资本主义危机章节）
    let capitalistCrisisDetail = null;
    if (sectionId === '资本主义危机') {
      capitalistCrisisDetail = CAPITALIST_CRISIS;
    }

    return NextResponse.json({
      success: true,
      data: {
        section,
        relatedSocialForm,
        capitalistCrisisDetail,
      },
    });
  }

  return NextResponse.json({ success: false, message: '未知操作' }, { status: 400 });
}

// 生成练习题（基于当前章节内容）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sectionId, action } = body;

    // 生成练习题
    if (action === 'generate-practice') {
      const section = GUIDED_SECTIONS.find(s => s.id === sectionId);
      if (!section) {
        return NextResponse.json({ success: false, message: '章节不存在' }, { status: 404 });
      }

      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        // 返回默认练习题
        return NextResponse.json({
          success: true,
          questions: generateFallbackQuestions(section),
        });
      }

      const prompt = `你是辽宁省高中政治命题专家，基于以下章节内容生成3道巩固练习题。

### 章节标题：${section.title}
### 章节副标题：${section.subtitle}
### 核心内容：${section.content}
### 关键要点：${section.keyPoints.join('；')}
### 引导思考题：${section.thinkQuestions.join('；')}

### 要求
1. 生成3道选择题，每道4个选项
2. 严格基于以上内容，不要脱离原文编造
3. 难度分布：1简单，1中等，1困难
4. 必须严格输出 JSON 数组，不要包含其他文本

### 输出格式（严格JSON数组）
[
  {
    "id": "q1",
    "type": "choice",
    "question": "题干",
    "options": ["A选项", "B选项", "C选项", "D选项"],
    "correctAnswer": 0,
    "explanation": "解析",
    "relatedSection": "${sectionId}"
  }
]`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是政治命题助手，只能返回 JSON 数组。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'AI 请求失败');
      }

      const json = await response.json();
      const content = json.choices?.[0]?.message?.content || '';
      const match = content.match(/\[[\s\S]*\]/);

      let questions: PracticeQuestion[] = [];
      if (match) {
        try {
          questions = JSON.parse(match[0]) as PracticeQuestion[];
        } catch {
          questions = generateFallbackQuestions(section);
        }
      } else {
        questions = generateFallbackQuestions(section);
      }

      return NextResponse.json({ success: true, questions });
    }

    // AI 辅导对话
    if (action === 'chat') {
      const { message, sectionId, history } = body;
      const section = GUIDED_SECTIONS.find(s => s.id === sectionId);

      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return NextResponse.json({
          success: false,
          message: '请先配置 DeepSeek API Key',
        }, { status: 400 });
      }

      const systemPrompt = `你是高中思想政治课的辅导教师，正在进行引导式教学。
当前章节：${section?.title || '全课'} - ${section?.subtitle || ''}
核心内容：${section?.content || ''}
关键要点：${section?.keyPoints?.join('；') || ''}
引导思考题：${section?.thinkQuestions?.join('；') || ''}

教学原则：
1. 采用苏格拉底式提问法，通过问题引导学生思考
2. 不要直接给出答案，而是通过追问启发学生
3. 结合辽宁高考命题方向，适当延伸
4. 用通俗易懂的语言解释抽象概念
5. 每次回复控制在100字以内，简洁有力
6. 鼓励学生思考，肯定学生的思考`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...(history || []).slice(-6),
        { role: 'user', content: message },
      ];

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'AI 请求失败');
      }

      const json = await response.json();
      const reply = json.choices?.[0]?.message?.content || '抱歉，我暂时无法回答。';

      return NextResponse.json({ success: true, reply });
    }

    return NextResponse.json({ success: false, message: '未知操作' }, { status: 400 });
  } catch (error) {
    console.error('[politics/guided-learning] error:', error);
    return NextResponse.json({
      success: false,
      message: '操作失败：' + (error instanceof Error ? error.message : '未知错误'),
    }, { status: 500 });
  }
}

function generateFallbackQuestions(section: typeof GUIDED_SECTIONS[0]): PracticeQuestion[] {
  const questionsMap: Record<string, PracticeQuestion[]> = {
    'overview': [
      {
        id: 'q-overview-1',
        type: 'choice',
        question: '本册教材的逻辑起点是哪个章节？',
        options: ['第一课', '第二课', '第三课', '第四课'],
        correctAnswer: 0,
        explanation: '第一课回顾从原始社会到资本主义社会的历史发展，阐释生产关系一定要适应生产力、上层建筑一定要适应经济基础的规律，是本册教材的逻辑起点。',
        relatedSection: 'overview',
      },
      {
        id: 'q-overview-2',
        type: 'choice',
        question: '人类社会发展的基本规律是什么？',
        options: [
          '生产关系适应生产力',
          '上层建筑适应经济基础',
          'A和B都是',
          '生产资料公有制',
        ],
        correctAnswer: 2,
        explanation: '人类社会发展的基本规律包括：生产关系一定要适应生产力，上层建筑一定要适应经济基础。这两个规律决定了人类社会形态的演进。',
        relatedSection: 'overview',
      },
      {
        id: 'q-overview-3',
        type: 'choice',
        question: '本册教材紧紧围绕的中心是什么？',
        options: ['改革开放', '中国特色社会主义', '社会主义现代化', '中华民族伟大复兴'],
        correctAnswer: 1,
        explanation: '本册教材紧紧围绕中国特色社会主义这个中心，讲述中特的由来、创立、发展、完善的过程。',
        relatedSection: 'overview',
      },
    ],
    '资本主义社会': [
      {
        id: 'q-capital-1',
        type: 'choice',
        question: '资本主义社会的基本矛盾是什么？',
        options: [
          '资产阶级与无产阶级矛盾',
          '生产社会化与生产资料私人占有矛盾',
          '企业家与工人矛盾',
          '市场与政府矛盾',
        ],
        correctAnswer: 1,
        explanation: '生产社会化与生产资料资本主义私人占有之间的矛盾，是资本主义社会的基本矛盾，是一切矛盾和冲突的总根源。',
        relatedSection: '资本主义社会',
      },
      {
        id: 'q-capital-2',
        type: 'choice',
        question: '资本主义经济危机的基本特征是什么？',
        options: ['生产绝对过剩', '生产相对过剩', '生产力严重不足', '需求严重不足'],
        correctAnswer: 1,
        explanation: '资本主义经济危机的基本特征是生产相对过剩，即相对于劳动人民有支付能力的需求而言，生产显得过剩了。',
        relatedSection: '资本主义危机',
      },
      {
        id: 'q-capital-3',
        type: 'choice',
        question: '为什么资本主义必然灭亡？',
        options: [
          '因为资本家太贪婪',
          '因为生产社会化程度越高，资本主义基本矛盾越尖锐',
          '因为社会主义制度更优越',
          '因为工人运动越来越激烈',
        ],
        correctAnswer: 1,
        explanation: '生产社会化的程度越高，资本、生产资料、劳动产品就越集中在少数资本家手里，资本主义社会基本矛盾的尖锐化就越不可避免。',
        relatedSection: '资本主义必然灭亡',
      },
    ],
    '空想社会主义': [
      {
        id: 'q-utopia-1',
        type: 'choice',
        question: '空想社会主义的历史局限性不包括哪一点？',
        options: [
          '只有理想，没有行动路径',
          '看不到无产阶级的力量',
          '揭示了资本主义的根本矛盾',
          '没有找到社会变革的正确途径',
        ],
        correctAnswer: 2,
        explanation: '空想社会主义的局限性在于：①只有理想没有行动②看不到无产阶级力量③没有正确途径。C选项"揭示了资本主义的根本矛盾"实际上是它的进步性表现。',
        relatedSection: '空想社会主义',
      },
      {
        id: 'q-utopia-2',
        type: 'choice',
        question: '空想社会主义是哪一理论的思想来源？',
        options: ['民主社会主义', '科学社会主义', '资本主义', '封建主义'],
        correctAnswer: 1,
        explanation: '空想社会主义是科学社会主义的思想来源，为科学社会主义的产生准备了条件。',
        relatedSection: '空想社会主义',
      },
    ],
    '科学社会主义诞生': [
      {
        id: 'q-science-1',
        type: 'choice',
        question: '科学社会主义的两大理论基石是什么？',
        options: [
          '空想社会主义 + 工人运动',
          '唯物史观 + 剩余价值学说',
          '辩证法 + 认识论',
          '阶级斗争 + 无产阶级革命',
        ],
        correctAnswer: 1,
        explanation: '唯物史观揭示了人类社会发展的一般规律，剩余价值学说揭示了资本主义运行的特殊规律，二者共同构成科学社会主义的理论基石。',
        relatedSection: '科学社会主义诞生',
      },
      {
        id: 'q-science-2',
        type: 'choice',
        question: '科学社会主义诞生的标志是什么？',
        options: ['《资本论》', '《德意志意识形态》', '《共产党宣言》', '巴黎公社'],
        correctAnswer: 2,
        explanation: '1848年《共产党宣言》的发表标志着马克思主义的诞生，标志着科学社会主义的正式诞生。',
        relatedSection: '科学社会主义诞生',
      },
    ],
    '共产党宣言': [
      {
        id: 'q-manifesto-1',
        type: 'choice',
        question: '《共产党宣言》论证的核心结论是什么？',
        options: [
          '资本家应该善待工人',
          '资本主义必然灭亡，社会主义必然胜利',
          '无产阶级应该获得选举权',
          '社会主义需要计划经济',
        ],
        correctAnswer: 1,
        explanation: '《共产党宣言》分析了资本主义的内在矛盾，科学论证了资本主义必然灭亡和社会主义必然胜利的"两个必然"。',
        relatedSection: '共产党宣言',
      },
    ],
  };

  return questionsMap[section.id] || [
    {
      id: `q-${section.id}-1`,
      type: 'choice',
      question: `${section.title}的核心内容是什么？`,
      options: ['略', '略', '略', '略'],
      correctAnswer: 0,
      explanation: '请结合章节内容理解。',
      relatedSection: section.id,
    },
  ];
}
