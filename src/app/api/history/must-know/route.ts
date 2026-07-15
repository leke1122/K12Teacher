/**
 * 历史必背知识点 API
 * 提供历史必背知识列表、讲解、高考关联等功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { findDocxImportByUnitId } from '@/lib/supabase';

// 历史必背知识数据结构
export interface HistoryMustKnowItem {
  id: string;
  unitId: string;
  unitTitle: string;
  title: string;
  year?: string;
  dynasty?: string;
  content: string;
  explanation: string;
  gaokaoFocus: string;
  relatedEvents: string[];
  typicalQuestions: {
    year: string;
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  importance: 1 | 2 | 3 | 4 | 5;
  source: 'builtin' | 'docx_import' | 'ai_generated';
}

// 内置历史必背知识（第一单元）
const BUILT_IN_HISTORY_MUST_KNOW: HistoryMustKnowItem[] = [
  // 第一单元核心考点
  {
    id: 'history-unit1-1',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一',
    title: '分封制',
    year: '西周',
    dynasty: '西周',
    content: '分封制是周天子把土地和人民分封给诸侯的制度，诸侯在封国内享有世袭统治权，但必须服从周天子的命令并承担义务。',
    explanation: '分封制是西周最重要的政治制度。理解要点：1）目的是"封建亲戚，以藩屏周"，即巩固周朝统治；2）分封对象包括同姓王室子弟、功臣、先代贵族；3）诸侯义务：服从命令、缴纳贡赋、朝觐述职、随从作战；4）分封制的局限性在于诸侯国相对独立，随着时间推移，诸侯实力增强，周王室衰微，分封制必然瓦解。分封制与宗法制互为表里，是西周统治的两大支柱。',
    gaokaoFocus: '辽宁高考常考点，常与宗法制、礼乐制度对比考查',
    relatedEvents: ['宗法制', '礼乐制度', '井田制'],
    typicalQuestions: [
      {
        year: '2023辽宁高考',
        question: '西周分封制的主要目的是什么？',
        answer: '巩固周天子的统治，即"封建亲戚，以藩屏周"',
        difficulty: 'easy'
      },
      {
        year: '2022全国乙卷',
        question: '分封制与宗法制的关系是？',
        answer: '互为表里，宗法制是分封制的基础，分封制是宗法制的体现',
        difficulty: 'medium'
      }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'history-unit1-2',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一',
    title: '宗法制',
    year: '西周',
    dynasty: '西周',
    content: '宗法制是用血缘亲疏来划分政治等级、维护贵族统治的制度，其核心是嫡长子继承制。',
    explanation: '宗法制是西周政治制度的另一支柱。理解要点：1）宗法制以嫡长子继承制为核心，解决贵族在财产和权力继承上的矛盾；2）大宗与小宗的关系是相对的，如周天子对诸侯是大宗，诸侯对其国内卿大夫是大宗；3）宗法制保证了贵族等级秩序的稳定；4）宗法制影响深远，中国传统的家族观念、继承制度都深受其影响。分封制与宗法制相互依存，共同维护西周统治。',
    gaokaoFocus: '常与分封制结合考查，是理解西周政治制度的核心',
    relatedEvents: ['分封制', '礼乐制度', '井田制'],
    typicalQuestions: [
      {
        year: '2023全国甲卷',
        question: '宗法制的核心是什么？',
        answer: '嫡长子继承制',
        difficulty: 'easy'
      },
      {
        year: '2022辽宁高考',
        question: '宗法制与分封制的关系是？',
        answer: '互为表里，宗法制为"里"（内在血缘基础），分封制为"表"（外在政治形式）',
        difficulty: 'medium'
      }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'history-unit1-3',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一',
    title: '礼乐制度',
    year: '西周',
    dynasty: '西周',
    content: '礼乐制度是维护等级秩序的礼仪规范和音乐制度，"礼"区分尊卑等级，"乐"调和人们关系，共同维护社会秩序。',
    explanation: '礼乐制度是西周统治的重要工具。理解要点：1）"礼"规定了不同等级在祭祀、婚丧、朝聘等场合的行为规范，是等级分明的社会制度；2）"乐"通过音乐艺术陶冶情操，促进社会和谐；3）礼乐制度与分封制、宗法制相配合，形成完整的统治秩序；4）孔子对周礼极为推崇，主张"克己复礼"，但礼乐制度的本质是为统治阶级服务。',
    gaokaoFocus: '理解西周政治制度的完整体系，常与孔子思想结合',
    relatedEvents: ['分封制', '宗法制', '孔子'],
    typicalQuestions: [
      {
        year: '2021辽宁高考',
        question: '西周礼乐制度的作用是？',
        answer: '维护等级秩序，巩固西周统治',
        difficulty: 'easy'
      }
    ],
    importance: 4,
    source: 'builtin'
  },
  {
    id: 'history-unit1-4',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一',
    title: '商鞅变法',
    year: '公元前356年',
    dynasty: '战国',
    content: '商鞅变法是战国时期秦国的重大改革，通过废除井田制、奖励军功、建立县制等措施，建立了中央集权制度的基础。',
    explanation: '商鞅变法是战国时期最彻底的变法，也是高考重点。变法内容：1）经济上，废除井田制，允许土地买卖，承认土地私有，推行重农抑商政策；2）政治上，废除分封制，建立县制，废除世卿世禄制；3）军事上，奖励军功，按军功授爵；4）法律上，实行连坐法，严刑峻法。历史意义：1）使秦国富强，为统一六国奠定基础；2）建立中央集权制度的雏形；3）推动了中国由奴隶社会向封建社会的过渡。',
    gaokaoFocus: '超级高频考点，商鞅变法的内容、特点、历史意义必须全面掌握',
    relatedEvents: ['井田制', '秦统一', '郡县制', '重农抑商'],
    typicalQuestions: [
      {
        year: '2023全国乙卷',
        question: '商鞅变法中承认土地私有的措施是？',
        answer: '废井田，开阡陌',
        difficulty: 'easy'
      },
      {
        year: '2022全国甲卷',
        question: '商鞅变法对秦国的最大影响是？',
        answer: '使秦国国力大增，为统一六国奠定基础',
        difficulty: 'medium'
      },
      {
        year: '2021辽宁高考',
        question: '商鞅变法为什么会失败？但为何又成功？',
        answer: '商鞅本人被杀但新法被保留，说明变法符合历史发展趋势',
        difficulty: 'hard'
      }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'history-unit1-5',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一',
    title: '百家争鸣',
    year: '春秋战国',
    dynasty: '春秋战国',
    content: '百家争鸣是春秋战国时期各学派围绕社会变革展开的思想论战，形成了儒、道、墨、法等重要学派，开创了中华文化的源头。',
    explanation: '百家争鸣是中国历史上第一次大规模的思想解放运动。核心学派：1）儒家：孔子创立，孟子、荀子发展，主张"仁""礼"，重视道德教化；2）道家：老子创立，庄子发展，主张"无为而治"，追求自然逍遥；3）墨家：墨子创立，主张"兼爱""非攻"，代表小生产者利益；4）法家：韩非子集大成，主张以法治国，强调君主集权。历史意义：1）促进了思想文化的繁荣；2）为后世中华文化奠定了基础；3）各学派思想对后世政治制度、学术发展产生深远影响。',
    gaokaoFocus: '必考内容，各学派思想主张、代表人物必须掌握',
    relatedEvents: ['孔子', '老子', '孟子', '荀子', '墨子', '韩非子'],
    typicalQuestions: [
      {
        year: '2023全国乙卷',
        question: '百家争鸣中主张"兼爱""非攻"的是哪个学派？',
        answer: '墨家',
        difficulty: 'easy'
      },
      {
        year: '2022辽宁高考',
        question: '法家思想的核心主张是什么？',
        answer: '以法治国，君主集权',
        difficulty: 'medium'
      }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'history-unit1-6',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一',
    title: '秦统一',
    year: '公元前221年',
    dynasty: '秦朝',
    content: '公元前221年，秦王嬴政统一六国，建立了中国历史上第一个大一统的封建王朝。',
    explanation: '秦统一是中国历史上的里程碑事件。统一背景：1）春秋战国时期，诸侯割据混战，人民渴望统一；2）商鞅变法后秦国实力大增，具备统一条件；3）秦始皇雄才大略，抓住历史机遇。统一意义：1）结束了长期的诸侯割据局面，建立了统一的多民族国家；2）开创了专制主义中央集权制度；3）统一文字、度量衡、车轨等，促进经济文化交流；4）为后世中国统一多民族国家的发展奠定了基础。',
    gaokaoFocus: '必须掌握秦统一的时间、历史意义、巩固统一的措施',
    relatedEvents: ['商鞅变法', '郡县制', '皇帝制度', '统一度量衡'],
    typicalQuestions: [
      {
        year: '2023辽宁高考',
        question: '秦统一六国是在哪一年？',
        answer: '公元前221年',
        difficulty: 'easy'
      },
      {
        year: '2022全国甲卷',
        question: '秦统一的历史意义是？',
        answer: '结束割据，建立统一的多民族国家，开创中央集权制度',
        difficulty: 'medium'
      }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'history-unit1-7',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一',
    title: '专制主义中央集权制度',
    year: '秦朝',
    dynasty: '秦朝',
    content: '专制主义中央集权制度是皇帝总揽军政大权的政治制度，包括皇帝制度、三公九卿制、郡县制等组成部分。',
    explanation: '这是中国古代最重要的政治制度。组成部分：1）皇帝制度：皇权至上，皇位世袭，是整个制度的核心；2）三公九卿制：丞相（行政）、太尉（军事）、御史大夫（监察）三公，下设九卿；3）郡县制：废除分封制，在地方实行郡县两级制，郡守、县令由皇帝任免。历史影响：1）奠定了中国两千多年政治制度的基本格局；2）有利于维护国家统一和社会稳定；3）后期阻碍了资本主义萌芽的发展，束缚了社会进步。',
    gaokaoFocus: '超级高频考点，必须全面掌握制度的组成和历史影响',
    relatedEvents: ['皇帝制度', '郡县制', '三公九卿', '汉武帝'],
    typicalQuestions: [
      {
        year: '2023全国乙卷',
        question: '专制主义中央集权制度的核心是？',
        answer: '皇权至上，皇帝总揽一切大权',
        difficulty: 'easy'
      },
      {
        year: '2022辽宁高考',
        question: '秦朝在地方实行什么制度？',
        answer: '郡县制',
        difficulty: 'easy'
      }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'history-unit1-8',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一',
    title: '汉武帝大一统',
    year: '公元前141年-公元前87年',
    dynasty: '西汉',
    content: '汉武帝时期，通过政治、经济、思想文化等方面的改革，确立了中央集权制度的统治，形成了中国古代第一个大一统盛世。',
    explanation: '汉武帝大一统是高考重点。政治上：1）"推恩令"削弱诸侯国势力；2）设置刺史制度加强监督；3）建立察举制选拔人才。经济上：1）盐铁官营；2）统一货币（五铢钱）；3）抑制商业资本。思想上：采纳董仲舒"罢黜百家，独尊儒术"的建议，确立儒学的正统地位。这是高考的高频考点，需要全面掌握汉武帝加强中央集权的各项措施。',
    gaokaoFocus: '必考内容，各项措施及其作用必须掌握',
    relatedEvents: ['推恩令', '盐铁官营', '罢黜百家独尊儒术', '刺史制度'],
    typicalQuestions: [
      {
        year: '2023全国甲卷',
        question: '"罢黜百家，独尊儒术"是谁建议汉武帝实行的？',
        answer: '董仲舒',
        difficulty: 'easy'
      },
      {
        year: '2022辽宁高考',
        question: '汉武帝实行"推恩令"的目的是？',
        answer: '削弱诸侯国势力，加强中央集权',
        difficulty: 'medium'
      }
    ],
    importance: 5,
    source: 'builtin'
  }
];

// 获取必背知识列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const unitId = searchParams.get('unitId') || 'unit1';

  try {
    let items: HistoryMustKnowItem[] = [...BUILT_IN_HISTORY_MUST_KNOW];

    // 尝试从 Supabase 获取导入的数据
    if (isSupabaseConfigured) {
      try {
        const importData = await findDocxImportByUnitId(unitId);
        if (importData?.data?.concepts) {
          // 将 docx 导入的概念转换为必背知识
          const docxItems: HistoryMustKnowItem[] = importData.data.concepts
            .map((c: { id: string; name: string; category: string; definition: string; keyPoints?: string[]; impact?: string; gaokaoFocus?: string; importance?: number }, idx: number) => {
              const imp = c.importance ?? 3;
              return {
                id: `docx-${c.id}`,
                unitId,
                unitTitle: importData.data?.unitTitle || '历史单元',
                title: c.name,
                content: c.definition,
                explanation: [c.definition, ...(c.keyPoints || [])].join('\n'),
                gaokaoFocus: c.gaokaoFocus || '高考考点',
                relatedEvents: [],
                typicalQuestions: [],
                importance: (imp >= 1 && imp <= 5 ? imp : 3) as 1 | 2 | 3 | 4 | 5,
                source: 'docx_import' as const
              };
            });
          items = [...docxItems, ...items.filter(i => i.source === 'builtin')];
        }
      } catch (dbError) {
        console.warn('从 Supabase 加载数据失败，使用内置数据:', dbError);
      }
    }

    // 按单元筛选
    items = items.filter(item => item.unitId === unitId);

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
    console.error('获取历史必背知识失败:', error);
    return NextResponse.json(
      { success: false, message: '获取历史必背知识失败' },
      { status: 500 }
    );
  }
}

// 生成讲解
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, unitId, question } = body;

    // 查找指定知识项
    let item = BUILT_IN_HISTORY_MUST_KNOW.find(i => i.id === itemId);

    if (!item && unitId) {
      // 尝试从 Supabase 加载
      if (isSupabaseConfigured) {
        try {
          const importData = await findDocxImportByUnitId(unitId);
          if (importData?.data?.concepts) {
            const found = importData.data.concepts.find((c: { id: string; importance?: number }) => `docx-${c.id}` === itemId);
            if (found) {
              item = {
                id: `docx-${found.id}`,
                unitId,
                unitTitle: importData.data?.unitTitle || '历史单元',
                title: found.name,
                content: found.definition,
                explanation: [found.definition, ...(found.keyPoints || [])].join('\n'),
                gaokaoFocus: found.gaokaoFocus || '高考考点',
                relatedEvents: [],
                typicalQuestions: [],
                importance: Math.min(3, 5) as 1 | 2 | 3 | 4 | 5,
                source: 'docx_import'
              };
            }
          }
        } catch (dbError) {
          console.warn('从 Supabase 加载数据失败:', dbError);
        }
      }
    }

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
                content: '你是一位高中历史老师，负责帮助学生理解必背知识点。你的讲解要：1）历史严谨，依据教材；2）条理清晰，分点讲解；3）说明因果关系；4）结合高考考点；5）适当举例子。讲解时要说明"因为...所以..."的因果逻辑。'
              },
              {
                role: 'user',
                content: `请详细讲解以下历史必背知识，并说明因果关系：\n\n标题：${item.title}\n\n时间：${item.year || '未知'}（${item.dynasty || ''}）\n\n内容：${item.content}\n\n高考关联：${item.gaokaoFocus}\n\n学生问题：${question || '请给出详细讲解'}\n\n请结合辽宁高考的特点，详细说明：1）这个历史事件的背景和原因；2）事件的主要过程和内容；3）导致的结果和影响；4）高考常考形式和注意事项。`
              }
            ],
            max_tokens: 2000,
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
