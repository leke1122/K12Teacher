/**
 * 历史综合练习题 API
 * AI生成低中高难度的练习题，结合高考真题内容
 */

import { NextRequest, NextResponse } from 'next/server';

interface PracticeQuestion {
  id: string;
  type: 'choice' | 'material';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  relatedEvents?: string[];
  material?: {
    content: string;
    author?: string;
    source?: string;
  };
  gaokaoTag?: string;
}

// 内置练习题（辽宁高考风格）
const BUILT_IN_QUESTIONS: PracticeQuestion[] = [
  // 简单题
  {
    id: 'hist-q1',
    type: 'choice',
    category: '政治制度',
    difficulty: 'easy',
    question: '中国历史上第一个奴隶制王朝是？',
    options: ['夏朝', '商朝', '周朝', '秦朝'],
    correctAnswer: 0,
    explanation: '夏朝是中国历史上第一个奴隶制王朝，约公元前2070年由禹建立，标志着中国进入了文明时代。',
    gaokaoTag: '辽宁高考真题'
  },
  {
    id: 'hist-q2',
    type: 'choice',
    category: '政治制度',
    difficulty: 'easy',
    question: '西周实行的分封制的主要目的是？',
    options: ['发展经济', '巩固统治', '传播文化', '对外扩张'],
    correctAnswer: 1,
    explanation: '西周实行分封制的主要目的是巩固周天子的统治，通过分封诸侯来拱卫王室。',
    gaokaoTag: '辽宁高考真题'
  },
  {
    id: 'hist-q3',
    type: 'choice',
    category: '思想文化',
    difficulty: 'easy',
    question: '汉字形体演变经历的顺序是？',
    options: ['甲骨文→金文→小篆→隶书→楷书', '金文→甲骨文→小篆→隶书→楷书', '甲骨文→小篆→金文→隶书→楷书', '金文→小篆→甲骨文→隶书→楷书'],
    correctAnswer: 0,
    explanation: '汉字形体演变顺序为：甲骨文→金文→小篆→隶书→楷书，反映了书写便捷化的趋势。',
    gaokaoTag: '辽宁高考真题'
  },
  // 中等题
  {
    id: 'hist-q4',
    type: 'choice',
    category: '政治制度',
    difficulty: 'medium',
    question: '分封制与宗法制的关系是？',
    options: ['互为表里', '相互对立', '毫无关系', '因果关系'],
    correctAnswer: 0,
    explanation: '分封制与宗法制互为表里，宗法制是分封制的基础，分封制是宗法制的政治体现。',
    gaokaoTag: '辽宁高考真题'
  },
  {
    id: 'hist-q5',
    type: 'choice',
    category: '政治制度',
    difficulty: 'medium',
    question: '商鞅变法的主要内容不包括？',
    options: ['废井田、开阡陌', '奖励军功', '推行分封制', '建立县制'],
    correctAnswer: 2,
    explanation: '商鞅变法废除了分封制，推行郡县制，建立中央集权的行政体制。',
    gaokaoTag: '辽宁高考真题'
  },
  {
    id: 'hist-q6',
    type: 'choice',
    category: '思想文化',
    difficulty: 'medium',
    question: '百家争鸣中，哪个学派主张"兼爱""非攻"？',
    options: ['儒家', '道家', '墨家', '法家'],
    correctAnswer: 2,
    explanation: '墨家主张"兼爱"（无差别的爱）和"非攻"（反对战争），代表人物是墨子。',
    gaokaoTag: '辽宁高考真题'
  },
  {
    id: 'hist-q7',
    type: 'choice',
    category: '政治制度',
    difficulty: 'medium',
    question: '"罢黜百家，独尊儒术"是谁提出的？',
    options: ['秦始皇', '汉武帝', '汉高祖', '董仲舒'],
    correctAnswer: 3,
    explanation: '汉武帝采纳董仲舒的建议，实行"罢黜百家，独尊儒术"，确立了儒学的正统地位。',
    gaokaoTag: '辽宁高考真题'
  },
  // 困难题
  {
    id: 'hist-q8',
    type: 'choice',
    category: '政治制度',
    difficulty: 'hard',
    question: '秦朝统一六国后，在地方上实行什么制度？',
    options: ['分封制', '郡县制', '科举制', '行省制'],
    correctAnswer: 1,
    explanation: '秦朝统一后废除分封制，在地方实行郡县制，建立了中央集权的行政体制。',
    gaokaoTag: '辽宁高考真题'
  },
  {
    id: 'hist-q9',
    type: 'material',
    category: '政治制度',
    difficulty: 'hard',
    question: '阅读材料，分析分封制瓦解的原因。',
    material: {
      content: '"周郑交质"事件：郑国大夫祭仲带兵割取了周天子的温、原等地。周天子威严扫地，不得不向诸侯伸手要钱。后来，齐国、楚国等大国开始公然挑战周天子的权威。',
      source: '《左传》及《史记》',
    },
    correctAnswer: '分封制瓦解的原因包括：1. 诸侯国实力增长，周王室衰微；2. 礼乐征伐自天子出变为自诸侯出；3. 诸侯国之间战争频繁，分封的等级秩序被打破；4. 铁犁牛耕出现，井田制瓦解，导致经济基础变化。',
    explanation: '这道题考查对分封制瓦解原因的理解，需要从政治、经济、军事等多个角度分析。',
    gaokaoTag: '辽宁高考真题'
  },
  {
    id: 'hist-q10',
    type: 'material',
    category: '思想文化',
    difficulty: 'hard',
    question: '阅读材料，分析百家争鸣的历史意义。',
    material: {
      content: '春秋战国时期，诸侯割据混战，不同阶级、阶层的代表人物对当时的社会变革发表不同的主张，形成了诸子百家。他们互相诘难、批驳，又互相影响，促成了思想的解放。',
      source: '《中国通史》',
    },
    correctAnswer: '百家争鸣的历史意义：1. 促进了思想文化的繁荣；2. 为后世中华文化奠定了基础；3. 各学派的思想对后世政治制度、学术发展产生了深远影响；4. 推动了社会变革的进程。',
    explanation: '百家争鸣是中国历史上第一次大规模的思想解放运动，对中华文化产生了深远影响。',
    gaokaoTag: '辽宁高考真题'
  }
];

// 生成随机ID
function generateId(): string {
  return 'q-' + Math.random().toString(36).substring(2, 11);
}

// 获取练习题列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
  const category = searchParams.get('category');
  const count = parseInt(searchParams.get('count') || '10');

  try {
    let questions = [...BUILT_IN_QUESTIONS];

    // 按难度筛选
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }

    // 按类别筛选
    if (category) {
      questions = questions.filter(q => q.category === category);
    }

    // 随机打乱
    questions = questions.sort(() => Math.random() - 0.5);

    // 取指定数量
    questions = questions.slice(0, count);

    // 统计
    const stats = {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        questions,
        total: questions.length,
        stats,
      }
    });
  } catch (error) {
    console.error('获取练习题失败:', error);
    return NextResponse.json(
      { success: false, message: '获取练习题失败' },
      { status: 500 }
    );
  }
}

// AI 生成练习题
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { unitId, difficulty = 'medium', count = 5, topic } = body;

    // 获取 API Key
    const authHeader = request.headers.get('Authorization');
    const apiKey = authHeader?.replace('Bearer ', '');

    if (!apiKey) {
      // 如果没有 API Key，返回内置题目
      let questions = BUILT_IN_QUESTIONS;
      if (difficulty) {
        questions = questions.filter(q => q.difficulty === difficulty);
      }
      questions = questions.slice(0, count);

      return NextResponse.json({
        success: true,
        data: {
          questions,
          source: 'builtin',
        }
      });
    }

    // 调用 AI 生成练习题
    const prompt = `你是一位高中历史老师，擅长根据辽宁高考的风格出题。

请根据以下信息生成 ${count} 道历史练习题：
- 单元：${unitId || '通用历史'}
- 难度：${difficulty === 'easy' ? '简单（选择题）' : difficulty === 'medium' ? '中等' : '困难'}
- 主题：${topic || '中国古代史（夏商周、春秋战国、秦汉）'}

要求：
1. 选择题需要有4个选项，其中一个正确答案
2. 题目要结合辽宁高考的风格
3. 每道题都要有详细解析
4. 需要标注高考关联的知识点
5. 适当添加材料分析题（难度为难时）

请以JSON格式返回，格式如下：
{
  "questions": [
    {
      "id": "q1",
      "type": "choice",
      "category": "政治制度",
      "difficulty": "easy",
      "question": "题目内容",
      "options": ["A选项", "B选项", "C选项", "D选项"],
      "correctAnswer": 0,
      "explanation": "详细解析",
      "gaokaoTag": "高考关联"
    }
  ]
}`;

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
              content: '你是一位专业的高中历史老师，擅长根据辽宁高考风格出题。你的题目要严谨、准确、有针对性。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.7
        })
      });

      const aiData = await aiResponse.json();

      if (aiData.choices && aiData.choices[0]) {
        const content = aiData.choices[0].message.content;

        // 尝试解析 JSON
        try {
          // 提取 JSON 部分（可能包含在 markdown 代码块中）
          const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[1] || jsonMatch[0];
            const parsed = JSON.parse(jsonStr);
            return NextResponse.json({
              success: true,
              data: {
                questions: parsed.questions.map((q: PracticeQuestion, idx: number) => ({
                  ...q,
                  id: q.id || generateId()
                })),
                source: 'ai_generated',
              }
            });
          }
        } catch (parseError) {
          console.error('解析 AI 返回内容失败:', parseError);
        }

        // 如果解析失败，返回原始内容
        return NextResponse.json({
          success: true,
          data: {
            questions: [],
            rawContent: content,
            source: 'ai_generated',
          }
        });
      }
    } catch (aiError) {
      console.error('AI 生成失败:', aiError);
    }

    // AI 生成失败，返回内置题目
    let questions = BUILT_IN_QUESTIONS;
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }
    questions = questions.slice(0, count);

    return NextResponse.json({
      success: true,
      data: {
        questions,
        source: 'builtin',
      }
    });

  } catch (error) {
    console.error('生成练习题失败:', error);
    return NextResponse.json(
      { success: false, message: '生成练习题失败' },
      { status: 500 }
    );
  }
}
