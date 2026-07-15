/**
 * 政治必背知识点 API
 * 提供必背知识列表、讲解、高考关联等功能
 */

import { NextRequest, NextResponse } from 'next/server';

// 政治必背知识数据结构
export interface PoliticsMustKnowItem {
  id: string;
  chapterId: string;
  chapterTitle: string;
  title: string;
  content: string;
  explanation: string;
  gaokaoPoints: string[];
  relatedQuestions: {
    year: string;
    question: string;
    answer: string;
  }[];
  importance: 1 | 2 | 3 | 4 | 5;
}

// 内置政治必背知识（基于您提供的Word文档内容）
const BUILT_IN_MUST_KNOW: PoliticsMustKnowItem[] = [
  // 第一课：社会主义从空想到科学、从理论到实践的发展
  {
    id: 'politics-1-1',
    chapterId: 'politics-compulsory-1',
    chapterTitle: '必修1 · 中国特色社会主义 · 第一课',
    title: '科学社会主义的理论与实践',
    content: '社会主义从空想到科学、从理论到实践的发展，是人类社会发展的一般进程。',
    explanation: '这句话的核心是理解社会主义发展的三个阶段：空想社会主义（理想阶段）→科学社会主义（理论阶段）→社会主义实践（实践阶段）。空想社会主义虽然提出了美好的社会理想，但由于缺乏科学理论基础和实现途径，最终只能是空想。马克思、恩格斯在深入研究资本主义社会矛盾的基础上，创立了唯物史观和剩余价值学说，使社会主义从空想变成了科学。',
    gaokaoPoints: [
      '空想社会主义的局限性',
      '科学社会主义创立的理论基础',
      '社会主义从理论到实践的飞跃'
    ],
    relatedQuestions: [
      {
        year: '2023辽宁',
        question: '科学社会主义创立的理论基础是？',
        answer: '唯物史观和剩余价值学说'
      }
    ],
    importance: 5
  },
  {
    id: 'politics-1-2',
    chapterId: 'politics-compulsory-1',
    chapterTitle: '必修1 · 中国特色社会主义 · 第一课',
    title: '资本主义发展的基本进程',
    content: '资本主义发展的基本进程：资本主义从产生到灭亡，社会主义从空想到科学、从理论到实践的发展，社会主义从一国到多国的发展。',
    explanation: '这句话概括了人类社会发展的客观规律。资本主义必然被社会主义代替，这是由资本主义社会的基本矛盾决定的。理解这个知识点要注意：1）这是人类社会发展的"一般进程"，意味着这是历史发展的总趋势；2）社会主义代替资本主义的道路是曲折的，不是一帆风顺的；3）中国选择社会主义道路是历史的必然。',
    gaokaoPoints: [
      '人类社会发展的基本进程',
      '社会主义代替资本主义的历史必然性',
      '社会主义发展的总趋势'
    ],
    relatedQuestions: [
      {
        year: '2022全国',
        question: '人类社会发展的基本进程是？',
        answer: '原始社会→奴隶社会→封建社会→资本主义社会→共产主义社会'
      }
    ],
    importance: 5
  },
  {
    id: 'politics-1-3',
    chapterId: 'politics-compulsory-1',
    chapterTitle: '必修1 · 中国特色社会主义 · 第一课',
    title: '社会主义最终取代资本主义',
    content: '社会主义最终取代资本主义是历史发展的必然趋势。',
    explanation: '这句话是理解社会主义必然性的核心。为什么要用"最终"？因为社会主义代替资本主义是一个长期的历史过程，不是一蹴而就的。这个必然性来自于：1）资本主义基本矛盾的存在和发展；2）生产社会化与生产资料私人占有之间的矛盾无法调和；3）工人阶级与资产阶级之间的对立日益加深。',
    gaokaoPoints: [
      '社会主义代替资本主义的历史必然性',
      '资本主义基本矛盾',
      '历史发展的总趋势'
    ],
    relatedQuestions: [
      {
        year: '2021辽宁',
        question: '资本主义基本矛盾是什么？',
        answer: '生产社会化与生产资料私人占有之间的矛盾'
      }
    ],
    importance: 5
  },
  {
    id: 'politics-1-4',
    chapterId: 'politics-compulsory-1',
    chapterTitle: '必修1 · 中国特色社会主义 · 第一课',
    title: '科学社会主义创立的意义',
    content: '唯物史观和剩余价值学说揭示了人类社会发展的一般规律，为科学社会主义奠定了理论基石，使社会主义实现了由空想到科学的伟大飞跃。',
    explanation: '这是关于科学社会主义创立意义的经典表述。需要掌握的要点：1）唯物史观揭示了人类社会发展的基本动力和规律；2）剩余价值学说揭露了资本家剥削工人的秘密；3）这两大发现使社会主义从"应该是什么样"（空想）变为"为什么会这样、怎样才能这样"（科学）。这是高考的高频考点，经常以选择题或主观题的形式出现。',
    gaokaoPoints: [
      '唯物史观的核心内容',
      '剩余价值学说的核心内容',
      '科学社会主义的理论基石'
    ],
    relatedQuestions: [
      {
        year: '2023全国乙卷',
        question: '唯物史观揭示了什么？',
        answer: '人类社会发展的基本动力和一般规律'
      }
    ],
    importance: 5
  },
  {
    id: 'politics-1-5',
    chapterId: 'politics-compulsory-1',
    chapterTitle: '必修1 · 中国特色社会主义 · 第一课',
    title: '《共产党宣言》发表的意义',
    content: '1848年《共产党宣言》发表，标志着科学社会主义的诞生。',
    explanation: '这是社会主义发展史上的里程碑事件。《共产党宣言》是马克思、恩格斯为共产主义者同盟起草的纲领，系统阐述了科学社会主义的基本原理。记住这个时间节点：1848年。意义在于：1）它第一次系统阐述了科学社会主义原理；2）它为无产阶级革命提供了强大的思想武器；3）它深刻影响了人类社会的发展进程。',
    gaokaoPoints: [
      '《共产党宣言》发表的时间',
      '《共产党宣言》发表的意义',
      '科学社会主义的诞生'
    ],
    relatedQuestions: [
      {
        year: '2022辽宁',
        question: '《共产党宣言》发表于哪一年？',
        answer: '1848年'
      }
    ],
    importance: 4
  },
  {
    id: 'politics-1-6',
    chapterId: 'politics-compulsory-1',
    chapterTitle: '必修1 · 中国特色社会主义 · 第一课',
    title: '社会主义从理论到实践的飞跃',
    content: '1917年俄国十月革命胜利，建立了世界上第一个社会主义国家，实现了社会主义从理论到实践的伟大飞跃。',
    explanation: '十月革命是社会主义发展史上的重大转折点。理解这个知识点要注意：1）十月革命把马克思主义理论变成了现实；2）它开辟了无产阶级革命的新时代；3）它为其他国家的无产阶级革命提供了经验。但要注意：十月革命是在经济相对落后的俄国取得的，这与马克思原来的设想不同，这说明社会主义革命可以在一国或数国首先胜利。',
    gaokaoPoints: [
      '十月革命的历史意义',
      '社会主义从理论到实践的飞跃',
      '第一个社会主义国家'
    ],
    relatedQuestions: [
      {
        year: '2023全国甲卷',
        question: '世界上第一个社会主义国家是？',
        answer: '苏维埃俄国（苏联）'
      }
    ],
    importance: 5
  },
  {
    id: 'politics-1-7',
    chapterId: 'politics-compulsory-1',
    chapterTitle: '必修1 · 中国特色社会主义 · 第一课',
    title: '社会主义制度在中国的建立',
    content: '中华人民共和国的成立，社会主义制度的确立，是中华民族有史以来最深刻最伟大的社会变革。',
    explanation: '这句话高度概括了新中国的成立和社会主义制度确立的历史意义。理解要点：1）"中华民族有史以来"强调了这是中国几千年历史上的根本性变革；2）"最深刻最伟大"说明这是质的飞跃，不是简单的量的变化；3）这为当代中国一切发展进步奠定了根本政治前提和制度基础。注意：新中国成立（1949年）和社会主义制度确立（1956年）是两个不同的时间节点。',
    gaokaoPoints: [
      '新中国成立的意义',
      '社会主义制度确立的意义',
      '中国历史发展的里程碑'
    ],
    relatedQuestions: [
      {
        year: '2022辽宁',
        question: '社会主义制度在我国确立的标志是？',
        answer: '1956年三大改造基本完成'
      }
    ],
    importance: 5
  },
  // 更多必背知识...
  {
    id: 'politics-1-8',
    chapterId: 'politics-compulsory-1',
    chapterTitle: '必修1 · 中国特色社会主义 · 第一课',
    title: '社会主义初级阶段',
    content: '我国仍处于并将长期处于社会主义初级阶段，这是我国的基本国情。',
    explanation: '社会主义初级阶段是特指我国在生产力落后、商品经济不发达条件下建设社会主义必然要经历的特定阶段。这不是任何国家的社会主义都要经历的阶段，而是中国特有的。需要把握：1）这个阶段至少需要上百年；2）这个阶段的主要矛盾是人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾；3）这个阶段必须坚持党的基本路线不动摇。',
    gaokaoPoints: [
      '社会主义初级阶段的含义',
      '社会主义初级阶段的时间跨度',
      '社会主义初级阶段的主要矛盾'
    ],
    relatedQuestions: [
      {
        year: '2021全国乙卷',
        question: '我国社会主义初级阶段的时间跨度大约是？',
        answer: '从上世纪五十年代中期到本世纪中叶，至少上百年'
      }
    ],
    importance: 5
  },
  {
    id: 'politics-1-9',
    chapterId: 'politics-compulsory-1',
    chapterTitle: '必修1 · 中国特色社会主义 · 第一课',
    title: '中国特色社会主义的创立和发展',
    content: '中国特色社会主义是改革开放以来党的全部理论和实践的主题，是党和人民历尽千辛万苦、付出巨大代价取得的根本成就。',
    explanation: '这句话深刻阐述了坚持和发展中国特色社会主义的重要意义。理解要点：1）"全部理论和实践的主题"说明中国特色社会主义是贯穿改革开放以来一切工作的主线；2）"根本成就"说明这是我们取得一切成绩的根本原因；3）强调"历尽千辛万苦、付出巨大代价"说明这条道路来之不易，我们要倍加珍惜。',
    gaokaoPoints: [
      '中国特色社会主义的科学内涵',
      '坚持和发展中国特色社会主义的意义',
      '中国特色社会主义的来之不易'
    ],
    relatedQuestions: [
      {
        year: '2023辽宁',
        question: '改革开放以来党的全部理论和实践的主题是？',
        answer: '中国特色社会主义'
      }
    ],
    importance: 5
  },
  {
    id: 'politics-1-10',
    chapterId: 'politics-compulsory-1',
    chapterTitle: '必修1 · 中国特色社会主义 · 第一课',
    title: '习近平新时代中国特色社会主义思想',
    content: '习近平新时代中国特色社会主义思想是当代中国马克思主义、21世纪马克思主义，是中华文化和中国精神的时代精华，为实现中华民族伟大复兴提供了行动指南。',
    explanation: '这是对习近平新时代中国特色社会主义思想历史地位的最新表述。需要掌握的要点：1）两个定位——当代中国马克思主义、21世纪马克思主义；2）一个精华——中华文化和中国精神的时代精华；3）一个指南——为实现中华民族伟大复兴提供了行动指南。这是党的二十大的重要论断，是必须掌握的政治理论内容。',
    gaokaoPoints: [
      '习近平新时代中国特色社会主义思想的历史地位',
      '两个定位的具体含义',
      '这一思想的重要作用'
    ],
    relatedQuestions: [
      {
        year: '2023全国两会',
        question: '习近平新时代中国特色社会主义思想是中华文化和中国精神的什么？',
        answer: '时代精华'
      }
    ],
    importance: 5
  }
];

// 获取必背知识列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chapterId = searchParams.get('chapterId');

  try {
    let items = BUILT_IN_MUST_KNOW;

    // 按章节筛选
    if (chapterId) {
      items = items.filter(item => item.chapterId === chapterId);
    }

    // 按重要性排序
    items.sort((a, b) => b.importance - a.importance);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total: items.length,
        highPriority: items.filter(i => i.importance >= 4).length
      }
    });
  } catch (error) {
    console.error('获取必背知识失败:', error);
    return NextResponse.json(
      { success: false, message: '获取必背知识失败' },
      { status: 500 }
    );
  }
}

// 生成讲解
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, question } = body;

    // 查找指定知识项
    const item = BUILT_IN_MUST_KNOW.find(i => i.id === itemId);

    if (!item) {
      return NextResponse.json(
        { success: false, message: '未找到指定的必背知识' },
        { status: 404 }
      );
    }

    // 获取 API Key（如果有的话）
    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (apiKey) {
      // 调用 AI 生成更详细的讲解
      try {
        const aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: '你是一位高中政治老师，负责帮助学生理解必背知识点。你的讲解要：1）通俗易懂，用学生能理解的语言；2）结合高考考点；3）适当举例子；4）引导学生思考。'
              },
              {
                role: 'user',
                content: `请讲解以下政治必背知识：\n\n标题：${item.title}\n\n内容：${item.content}\n\n原有解释：${item.explanation}\n\n高考关联：${item.gaokaoPoints.join('、')}\n\n学生可能的问题：${question || '请给出一般性的详细讲解'}\n\n请结合辽宁高考的特点，给出详细、易懂的讲解。`
              }
            ],
            max_tokens: 1500,
            temperature: 0.7
          })
        });

        const aiData = await aiResponse.json();
        if (aiData.choices && aiData.choices[0]) {
          return NextResponse.json({
            success: true,
            data: {
              item,
              explanation: aiData.choices[0].message.content
            }
          });
        }
      } catch (aiError) {
        console.error('AI 讲解生成失败，使用内置讲解:', aiError);
      }
    }

    // 返回内置讲解
    return NextResponse.json({
      success: true,
      data: {
        item,
        explanation: item.explanation
      }
    });
  } catch (error) {
    console.error('生成讲解失败:', error);
    return NextResponse.json(
      { success: false, message: '生成讲解失败' },
      { status: 500 }
    );
  }
}
