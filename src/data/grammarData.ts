// 外研版高中英语语法自学路径清单 - 基于《外研版高中英语语法自学路径清单.docx》
// 8个阶段 · 43个知识点 · 高考全覆盖
// 教材版本：外研版2019新课标版（必修+选择性必修，共7册42单元）
import type { GrammarPoint, GrammarStage } from '@/types/grammar';

// ===================== 阶段一：句法基础与词法 =====================
const STAGE1_POINTS: GrammarPoint[] = [
  {
    id: 'stage1-01',
    stage: 1,
    stageName: '阶段一：句法基础与词法',
    category: '句法基础',
    name: '五种基本句型',
    structure: {
      formula: 'S+V | S+V+O | S+L+P | S+V+IO+DO | S+V+O+C',
      components: [
        'S+V（主谓）：The bird sings.',
        'S+V+O（主谓宾）：I love English.',
        'S+L+P（主系表）：She is a teacher.',
        'S+V+IO+DO（主谓双宾）：She gave me a book.',
        'S+V+O+C（主谓宾补）：We call him Tom.',
      ],
    },
    explanation: {
      simple: '英语有五种基本句型，其他所有句子都是这五种的变化。',
      detailed: '五种基本句型是英语语法的骨架：1. 主谓（S+V）：The sun rises. 2. 主谓宾（S+V+O）：I read books. 3. 主系表（S+L+P）：She is happy. 系动词包括be, become, get, turn, look, seem等. 4. 主谓双宾（S+V+IO+DO）：He gave me a pen. 5. 主谓宾补（S+V+O+C）：We made him captain.',
      analogy: '就像建房子要先打地基，五种基本句型就是英语句子的地基。',
    },
    examPoints: [
      { point: '五种基本句型识别', example: 'The story sounds interesting. (S+L+P)', frequency: 3 },
      { point: '双宾语vs宾语补足语', example: 'She painted the wall white. vs She bought me a book.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'S + V + IO + DO（间宾+直宾）', meaning: '主谓双宾', example: 'She told us a story.' },
      { pattern: 'S + V + O + C（宾+补）', meaning: '主谓宾补', example: 'We elected him president.' },
    ],
    examples: [
      { sentence: 'Time flies.', translation: '时光飞逝。', keyWords: ['time', 'flies', 'time'], grammarHighlight: 'S+V [主谓结构]' },
      { sentence: 'The teacher called on Tom to answer the question.', translation: '老师点名让Tom回答问题。', keyWords: ['called', 'Tom', 'answer'], grammarHighlight: 'S+V+O+C [call on O to do]' },
    ],
    commonMistakes: [
      { mistake: 'I am a student and study English.', correct: 'I am a student. I study English.', reason: '一个句子只有一个谓语动词，两个并列句需要连词' },
    ],
    textbookRef: '必修一 U1',
    difficulty: 1,
    examType: ['语法填空'],
    examWeight: 8,
  },
  {
    id: 'stage1-02',
    stage: 1,
    stageName: '阶段一：句法基础与词法',
    category: '句法基础',
    name: '句子成分分析',
    structure: {
      formula: '主语 + 谓语 + (宾语) + (表语) + (定语) + (状语) + (宾补)',
      components: [
        '主语：句子陈述的对象（名词/代词/动名词/从句）',
        '谓语：主语发出的动作（动词）',
        '宾语：动作的承受者（名词/代词）',
        '表语：说明主语身份/状态（名词/形容词）',
        '定语：修饰名词（形容词/从句）',
        '状语：修饰动词/形容词/副词（副词/介词短语/从句）',
        '宾补：补充说明宾语（名词/形容词/不定式/分词）',
      ],
    },
    explanation: {
      simple: '每个句子都由不同"部件"组成，理解这些部件的位置和功能，就能分析任何句子。',
      detailed: '句子成分分析是语法学习的基础能力。主语和谓语是核心成分（每个句子必须有），宾语是动作的承受者，表语与系动词搭配说明主语状态。定语修饰名词，位置灵活（前置或后置）。状语修饰动词、形容词或整个句子，表示时间、地点、原因、结果等。',
      analogy: '就像中文说"我（主语）认真地（状语）学习（谓语）英语（宾语）"——每个词都有自己的"岗位"。',
    },
    examPoints: [
      { point: '主谓宾辨认', example: '找出句子的主语和谓语', frequency: 3 },
      { point: '定语后置', example: 'The boy standing there is my brother.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: '名词 + 定语从句', meaning: '后置定语', example: 'The book (which I bought yesterday) is interesting.' },
      { pattern: '及物动词 + 宾语 + 宾补', meaning: '复合宾语', example: 'We found the task difficult.' },
    ],
    examples: [
      { sentence: 'The tall building built last year is our library.', translation: '去年建的那座高楼是我们的图书馆。', keyWords: ['tall', 'building', 'built'], grammarHighlight: 'tall[定语] building[主语] built last year[定语从句]' },
      { sentence: 'I find the book easy to understand.', translation: '我发现这本书容易理解。', keyWords: ['find', 'book', 'easy'], grammarHighlight: 'I[主语] find[谓语] the book[宾语] easy[宾补] to understand[状语]' },
    ],
    commonMistakes: [
      { mistake: 'I to school yesterday went.', correct: 'I went to school yesterday.', reason: '状语位置错误，地点状语在时间状语前' },
    ],
    textbookRef: '必修一 U2',
    difficulty: 1,
    examType: ['语法填空'],
    examWeight: 6,
  },
  {
    id: 'stage1-03',
    stage: 1,
    stageName: '阶段一：句法基础与词法',
    category: '词法',
    name: '构词法',
    structure: {
      formula: '派生法（前缀+词根+后缀）| 合成法（词+词）| 转化法（词性转换）| 缩略法',
      components: [
        '派生法：un+happy（否定）→ unhappy；happy+ly（副词）→ happily',
        '常见前缀：un-/dis-/im-/in-/re-/pre-/mis-/over-/semi-',
        '常见后缀：-tion/-sion/-ment/-ness/-able/-al/-ful/-less/-ly/-er/-ist',
        '合成词：classroom, homework, bedroom, spaceship',
        '转化：water(n)→water(v)；hand(n)→hand(v)',
        '缩略：advertisement→ad, information→info, exam→exam',
      ],
    },
    explanation: {
      simple: '英语单词有规律可循——前缀改变意思，后缀改变词性，合成词把两个词拼一起。',
      detailed: '构词法是扩大词汇量的关键技能：1）派生法通过添加前缀（改变意义）和后缀（改变词性）生成新词；2）合成法将两个或多个词合成一个词；3）转化法不改变拼写但改变词性；4）缩略法截取部分字母。高考语法填空中"给词填空"题常考词性转换，如need→necessary，possible→possibly。',
      analogy: '就像中文的"电脑"（电+脑）和"美丽"（美+丽），英语也有自己的造词规律。',
    },
    examPoints: [
      { point: '词性转换（语法填空高频）', example: 'improve → improvement / success → successful / biology → biological', frequency: 5 },
      { point: '前缀含义判断', example: 'unhappy / discover / impossible / rewrite', frequency: 4 },
      { point: '名词→形容词→副词转换', example: 'science → scientific → scientifically', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: '-tion/-sion 名词后缀', meaning: '...的动作/状态', example: 'education, decision, attention' },
      { pattern: '-able/-ible 形容词后缀', meaning: '可...的', example: 'comfortable, possible, responsible' },
      { pattern: '-ful/-less 形容词后缀', meaning: '充满...的/无...的', example: 'helpful, careless, meaningful' },
    ],
    examples: [
      { sentence: 'His success was a great encouragement to the rest of us.', translation: '他的成功对我们其余的人是一个很大的鼓励。', keyWords: ['success', 'encouragement', 'great'], grammarHighlight: 'success→successful→successfully词性转换链' },
      { sentence: 'The invention of the printing press was of great historical significance.', translation: '印刷术的发明具有重大的历史意义。', keyWords: ['invention', 'printing', 'historical'], grammarHighlight: 'invent→invention→invention of' },
    ],
    commonMistakes: [
      { mistake: 'He is complete unaware of the danger.', correct: 'He is completely unaware of the danger.', reason: 'unaware是形容词，需用副词completely修饰' },
      { mistake: 'The student performed good in the exam.', correct: 'The student performed well in the exam.', reason: '动词perform用副词well修饰，不是形容词good' },
    ],
    textbookRef: '必修一 U2',
    difficulty: 1,
    examType: ['语法填空（高频）'],
    examWeight: 25,
  },
];

// ===================== 阶段二：时态体系 =====================
const STAGE2_POINTS: GrammarPoint[] = [
  {
    id: 'stage2-01',
    stage: 2,
    stageName: '阶段二：时态体系',
    category: '时态',
    name: '基本时态复习',
    structure: {
      formula: '一般现在：S+V-s/es | 现在进行：S+am/is/are+V-ing | 一般过去：S+V-ed | 一般将来：S+will+V原',
      components: [
        '一般现在时：习惯/真理/状态',
        '现在进行时：正在进行的动作',
        '一般过去时：过去发生的动作',
        '现在完成时：过去的动作对现在的影响',
      ],
    },
    explanation: {
      simple: '四种最常用的时态：现在做的事、正在做的事、过去做的事、过去对现在有影响的事。',
      detailed: '四种基本时态覆盖了大部分日常表达。一般现在时表示习惯性动作（always, usually）和客观真理。现在进行时表示说话时正在进行的动作，或现阶段持续的行为（与these days连用）。一般过去时表示过去某个特定时间发生的动作。现在完成时表示过去的动作对现在有影响，或动作从过去持续到现在。',
      analogy: '"我每天跑步"（习惯）vs"我正在跑步"（进行）vs"我昨天跑了步"（过去）vs"我已经跑完了"（完成+影响）。',
    },
    examPoints: [
      { point: '一般现在时第三人称单数', example: 'She watches TV every day.', frequency: 5 },
      { point: '现在完成时与一般过去时区别', example: 'I have lived here for 10 years. vs I lived here 10 years ago.', frequency: 5 },
      { point: '时间状语判断时态', example: 'already, yet, just, since, for', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'have/has + 过去分词（现在完成时）', meaning: '已经...', example: 'I have already finished my homework.' },
      { pattern: 'used to + V原（过去习惯）', meaning: '过去常常...', example: 'He used to smoke a lot.' },
      { pattern: 'be going to / will + V原（将来时）', meaning: '将要...', example: 'It is going to rain tomorrow.' },
    ],
    examples: [
      { sentence: 'The earth moves around the sun.', translation: '地球绕着太阳转。', keyWords: ['earth', 'moves', 'sun'], grammarHighlight: '一般现在时 [客观真理]' },
      { sentence: 'I have studied English for five years.', translation: '我学英语五年了。', keyWords: ['studied', 'English', 'years'], grammarHighlight: '现在完成时 [持续至今]' },
      { sentence: 'By the time I got home, my mother had already cooked dinner.', translation: '我到家时，妈妈已经做好了晚饭。', keyWords: ['got', 'already', 'cooked'], grammarHighlight: '过去完成时 [过去的过去]' },
    ],
    commonMistakes: [
      { mistake: 'I have seen the movie yesterday.', correct: 'I saw the movie yesterday.', reason: 'yesterday是明确的过去时间，用一般过去时' },
      { mistake: 'He goes to school every day. (无错)', correct: 'He goes to school every day.', reason: '一般现在时表示习惯' },
    ],
    textbookRef: '必修一 U3',
    difficulty: 2,
    examType: ['语法填空', '完形填空'],
    examWeight: 20,
  },
  {
    id: 'stage2-02',
    stage: 2,
    stageName: '阶段二：时态体系',
    category: '时态',
    name: '过去将来时',
    structure: {
      formula: 'S + would/could/might + V原形 | S + was/were going to + V原形',
      components: [
        '过去将来时表示从过去某一时间看将要发生的动作',
        '常用于宾语从句（said, thought, hoped等后）',
        'was/were going to + V原形表示计划或打算',
      ],
    },
    explanation: {
      simple: '过去将来时就是"站在过去看未来"——从过去的视角看将要发生的事。',
      detailed: '过去将来时表示从过去某一时间看将要发生的动作。构成：would/could/might + V原形，或was/were going to + V原形。主要用于：1）宾语从句中（主句用过去时态时）：He said he would come tomorrow. 2）表示过去的计划或打算：I was going to visit her when I heard the news.',
      analogy: '就像"昨天我想今天要去学校"——从昨天看今天就是过去将来。',
    },
    examPoints: [
      { point: '宾语从句中的过去将来时', example: 'He told me he would arrive the next day.', frequency: 4 },
      { point: 'was/were going to表示过去的打算', example: 'I was going to call you, but I was too busy.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'was/were going to + have done', meaning: '本打算做...（却没做）', example: 'I was going to have called you, but I was busy.' },
      { pattern: 'would like to have done', meaning: '本想...', example: 'I would like to have gone to the party.' },
    ],
    examples: [
      { sentence: 'He said he would visit Beijing the next month.', translation: '他说他下个月要来北京。', keyWords: ['said', 'would', 'visit'], grammarHighlight: '过去将来时 [宾语从句]' },
      { sentence: 'I was going to leave when the phone rang.', translation: '我正要离开时电话响了。', keyWords: ['going to', 'leave', 'rang'], grammarHighlight: 'was going to [过去将来的打算]' },
    ],
    commonMistakes: [
      { mistake: 'He said he will come tomorrow.', correct: 'He said he would come tomorrow.', reason: '宾语从句主句过去时，从句用过去将来时' },
    ],
    textbookRef: '必修三 U5',
    difficulty: 3,
    examType: ['语法填空'],
    examWeight: 12,
  },
  {
    id: 'stage2-03',
    stage: 2,
    stageName: '阶段二：时态体系',
    category: '时态',
    name: '过去完成时',
    structure: {
      formula: 'S + had + 过去分词',
      components: [
        '表示"过去的过去"——在某个过去的动作之前发生的动作',
        '常与by the time, before, after, already, just, never等连用',
        '在宾语从句中，先发生的动作用过去完成时',
      ],
    },
    explanation: {
      simple: '过去完成时就是"过去的过去"——说一件事时，要提到比这更早发生的事。',
      detailed: '过去完成时表示在过去某一时间或动作之前已经发生的动作，即"过去的过去"。常用于：1）by + 过去时间（by 2010, by the time）：I had finished the work by 5 pm. 2）宾语从句中（主句过去，从句先发生）：She realized she had made a mistake. 3）与when/before/after连用表示两个过去的动作先后关系。',
      analogy: '"我到车站时，火车已经开了"——"火车开"是过去的过去，用过去完成时；"我到"是过去，用一般过去时。',
    },
    examPoints: [
      { point: '过去完成时基本结构', example: 'Had he finished the work before the deadline?', frequency: 5 },
      { point: 'by the time + 过去时 → 主句过去完成时', example: 'By the time I arrived, she had left.', frequency: 5 },
      { point: '宾语从句中的过去完成时', example: 'He told me he had never been there before.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'by the time + 一般过去时 → 过去完成时', meaning: '到...时已经...', example: 'By the time I got there, the movie had started.' },
      { pattern: 'hardly/scarcely...when... = no sooner...than...', meaning: '一...就...', example: 'Hardly had I sat down when the phone rang.' },
      { pattern: 'It was the first/second time that...', meaning: '第一/二次...', example: 'It was the first time that I had met her.' },
    ],
    examples: [
      { sentence: 'By the time the teacher came in, the students had already finished the exercise.', translation: '老师进来时，学生们已经完成了练习。', keyWords: ['already', 'finished', 'exercise'], grammarHighlight: '过去完成时 [过去的过去]' },
      { sentence: 'She discovered she had left her keys at home.', translation: '她发现她把钥匙落在家里了。', keyWords: ['discovered', 'had', 'left'], grammarHighlight: '过去完成时 [宾语从句，先发生]' },
    ],
    commonMistakes: [
      { mistake: 'I had went to Beijing before.', correct: 'I had gone to Beijing before.', reason: 'go的过去分词是gone不是went' },
      { mistake: 'When I arrived, she left.', correct: 'When I arrived, she had left. / When I arrived, she left.', reason: '如果强调她"已经"离开，用过去完成时' },
    ],
    textbookRef: '选择性必修一 U5',
    difficulty: 4,
    examType: ['语法填空（高频）'],
    examWeight: 18,
  },
  {
    id: 'stage2-04',
    stage: 2,
    stageName: '阶段二：时态体系',
    category: '时态',
    name: '现在完成进行时',
    structure: {
      formula: 'S + have/has + been + V-ing',
      components: [
        '现在完成进行时 = 现在完成时 + 进行时',
        '强调动作从过去持续到现在且仍在进行/刚刚结束',
        '常与for + 时间段 / since + 起点 / all morning/afternoon等连用',
      ],
    },
    explanation: {
      simple: '现在完成进行时强调"一直做，一直做到现在"——不只是"做过"，而是"一直在做"。',
      detailed: '现在完成进行时由have/has + been + doing构成，强调动作从过去开始，持续到现在，且可能仍在进行。它与现在完成时的区别在于：完成进行时强调动作的持续性和未完成性。现在完成时可以表示已完成的动作对现在的影响，而完成进行时更强调动作本身。',
      analogy: '"我已经跑步跑了一个小时了"——强调跑步这个动作持续了一个小时，可能还要继续。',
    },
    examPoints: [
      { point: '现在完成进行时与现在完成时对比', example: 'I have been reading the book (还在读). vs I have read the book (已读完).', frequency: 5 },
      { point: '与for/since连用', example: 'I have been waiting for you for two hours.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'have/has been doing + for/since', meaning: '一直...（持续）', example: 'It has been raining for three days.' },
      { pattern: 'have/has been working on', meaning: '一直在忙于...', example: 'We have been working on this project since March.' },
    ],
    examples: [
      { sentence: 'I have been learning English for ten years.', translation: '我一直在学英语，已经十年了。', keyWords: ['learning', 'English', 'years'], grammarHighlight: '现在完成进行时 [持续]' },
      { sentence: 'She looks tired. She has been studying all night.', translation: '她看起来很累。她学了一整夜的习。', keyWords: ['looks', 'tired', 'studying'], grammarHighlight: '现在完成进行时 [刚刚结束，仍有影响]' },
    ],
    commonMistakes: [
      { mistake: 'I have been reading this book yesterday.', correct: 'I read this book yesterday. / I have been reading this book recently.', reason: 'yesterday是明确的过去时间，不能与现在完成进行时连用' },
    ],
    textbookRef: '选择性必修一 U6',
    difficulty: 4,
    examType: ['语法填空'],
    examWeight: 15,
  },
  {
    id: 'stage2-05',
    stage: 2,
    stageName: '阶段二：时态体系',
    category: '时态',
    name: '将来进行时',
    structure: {
      formula: 'S + will + be + V-ing',
      components: [
        '将来进行时 = will be doing',
        '表示将来某时刻正在进行的动作',
        '常与at this time tomorrow, tomorrow evening等具体将来时间连用',
      ],
    },
    explanation: {
      simple: '将来进行时表示将来某个时刻正在发生的动作——"到那时正在..."。',
      detailed: '将来进行时由will + be + V-ing构成，表示在将来某一时刻或时段正在进行的动作。它比一般将来时（will do）更强调动作的进行性。常用于：1）描述将来某时刻正在发生的事：At this time tomorrow, I will be flying to Paris. 2) 表示将来某事已安排好/预计发生：The train will be leaving in ten minutes.',
      analogy: '"明天下午三点，我正在开会"——描述的是将来某个时刻正在进行的动作。',
    },
    examPoints: [
      { point: '将来进行时与一般将来时对比', example: 'I will be meeting him at the station (我会在车站接他——安排好的). vs I will meet him at the station (我会去接他).', frequency: 4 },
      { point: '将来进行时在时间/条件状语从句中', example: 'When you come tomorrow, I will be working in the office.', frequency: 3 },
    ],
    fixedCombinations: [
      { pattern: 'will be + V-ing + at this time / tomorrow evening等', meaning: '将来某时刻正在...', example: 'At this time next week, I will be lying on the beach.' },
    ],
    examples: [
      { sentence: 'This time tomorrow, I will be sitting in the examination room.', translation: '明天的这个时候，我将坐在考场里。', keyWords: ['sitting', 'tomorrow', 'examination'], grammarHighlight: '将来进行时 [将来某时刻]' },
      { sentence: 'Don\'t call me at 8 o\'clock tomorrow. I will be having breakfast.', translation: '明天8点别给我打电话。我将在吃早餐。', keyWords: ['breakfast', 'tomorrow', 'having'], grammarHighlight: '将来进行时 [预计发生]' },
    ],
    commonMistakes: [
      { mistake: 'I will be meeting him tomorrow. (无错)', correct: 'I will meet him tomorrow.', reason: '两者都可，但将来进行时更自然/委婉' },
    ],
    textbookRef: '选择性必修二 U1',
    difficulty: 3,
    examType: ['语法填空'],
    examWeight: 10,
  },
  {
    id: 'stage2-06',
    stage: 2,
    stageName: '阶段二：时态体系',
    category: '时态',
    name: '时态综合辨析',
    structure: {
      formula: '一般过去 vs 现在完成 | 过去完成 vs 现在完成 | 现在完成 vs 现在完成进行',
      components: [
        '一般过去 vs 现在完成：是否有明确的过去时间/对现在的影响',
        '过去完成 vs 现在完成：是否以过去为基准',
        '现在完成 vs 现在完成进行：动作是否仍在进行',
      ],
    },
    explanation: {
      simple: '时态辨析的关键是抓住"时间信号词"和"对现在的影响"。',
      detailed: '高考语法填空中时态题最常见。辨析方法：1）找时间状语——already/yet/since/for用完成时，yesterday/last week用过去时；2）看对现在的影响——如果过去动作对现在有影响，用现在完成时；3）看两个动作的先后——先发生的动作用过去完成时；4）判断是否持续——用现在完成时或现在完成进行时。',
      analogy: '做时态题就像侦探看时间线——先找"时间证人"（时间状语），再看"影响"（对现在的结果）。',
    },
    examPoints: [
      { point: '时间状语判断时态', example: 'already/yet/since/for → 完成时；yesterday/last week → 过去时', frequency: 5 },
      { point: '现在完成时 vs 一般过去时', example: 'I have visited Beijing. (我访问过北京——经验/影响) vs I visited Beijing last year. (我去年访问了北京——具体时间)', frequency: 5 },
      { point: 'by the time + 过去时 → 过去完成时', example: 'By the time he arrived, I had finished dinner.', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'already → 现在完成时', meaning: '已经', example: 'I have already finished my homework.' },
      { pattern: 'yet → 现在完成时（疑问/否定）', meaning: '还', example: 'Have you finished yet?' },
      { pattern: 'since + 起点 → 完成时', meaning: '自从', example: 'I have lived here since 2010.' },
      { pattern: 'for + 时间段 → 完成时', meaning: '持续...时间', example: 'I have lived here for 14 years.' },
    ],
    examples: [
      { sentence: 'By the time the program starts, we will have waited for two hours.', translation: '节目开始时，我们将已经等了两个小时。', keyWords: ['waiting', 'starts', 'will have'], grammarHighlight: '将来完成时 [will have waited]' },
      { sentence: 'No sooner had I reached home than it began to rain.', translation: '我一到家天就下雨了。', keyWords: ['reached', 'began', 'no sooner'], grammarHighlight: 'no sooner...than + 过去完成时' },
    ],
    commonMistakes: [
      { mistake: 'I have finished this work yesterday.', correct: 'I finished this work yesterday.', reason: 'yesterday是明确的过去时间' },
      { mistake: 'He has left home since 2020.', correct: 'He has been away from home since 2020.', reason: 'since+时间点，主句用完成时；终止性动词不能直接与since连用' },
    ],
    textbookRef: '综合复习',
    difficulty: 4,
    examType: ['语法填空', '完形填空'],
    examWeight: 20,
  },
];

// ===================== 阶段三：被动语态 =====================
const STAGE3_POINTS: GrammarPoint[] = [
  {
    id: 'stage3-01',
    stage: 3,
    stageName: '阶段三：被动语态',
    category: '被动语态',
    name: '被动语态基本结构',
    structure: {
      formula: 'S + be + 过去分词（done）',
      components: [
        '被动语态的核心：be + 过去分词',
        'be随时态变化，done不变',
        '各时态被动：am/is/are done（一般现在）；was/were done（一般过去）',
      ],
    },
    explanation: {
      simple: '被动语态把"做某事"变成"某事被做"——强调动作的承受者。',
      detailed: '被动语态用于不知道动作执行者、不必说出执行者或强调动作承受者的场合。构成：be + 过去分词。be动词随时态变化：一般现在时am/is/are done；一般过去时was/were done；一般将来时will be done。被动语态的by+执行者可以省略。',
      analogy: '"老师教我们英语"变成"英语被我们学"——用被动的视角描述同一件事。',
    },
    examPoints: [
      { point: '各时态被动语态结构', example: 'is done / was done / will be done / have been done', frequency: 5 },
      { point: '主动表被动的常见情况', example: 'The book sells well. / The door won\'t open.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'It is said/believed/reported that...', meaning: '据说/人们认为/据报道', example: 'It is said that he has returned to his hometown.' },
      { pattern: 'be worth doing = be well worth doing', meaning: '值得...', example: 'The book is worth reading twice.' },
    ],
    examples: [
      { sentence: 'English is spoken by more than 400 million people as a first language.', translation: '英语作为母语被超过4亿人使用。', keyWords: ['English', 'spoken', 'million'], grammarHighlight: '一般现在时被动 [is spoken]' },
      { sentence: 'Many houses were destroyed in the earthquake.', translation: '许多房屋在地震中被毁了。', keyWords: ['houses', 'destroyed', 'earthquake'], grammarHighlight: '一般过去时被动 [were destroyed]' },
    ],
    commonMistakes: [
      { mistake: 'The letter was sent yesterday.', correct: 'The letter was sent yesterday. (无错)', reason: '被动语态正确' },
    ],
    textbookRef: '必修一 U3',
    difficulty: 2,
    examType: ['语法填空'],
    examWeight: 18,
  },
  {
    id: 'stage3-02',
    stage: 3,
    stageName: '阶段三：被动语态',
    category: '被动语态',
    name: '现在完成时被动语态',
    structure: {
      formula: 'S + have/has + been + 过去分词',
      components: [
        '现在完成时 + 被动 = have/has been + done',
        '表示过去的动作已完成，且对现在有影响',
        '常与already, yet, just, recently, so far等连用',
      ],
    },
    explanation: {
      simple: '现在完成时被动 = "已经被...了"——强调已完成且有影响。',
      detailed: '现在完成时被动语态表示过去的动作在现在已经完成，且其结果对现在有影响。构成：have/has + been + 过去分词。注意区分：have been doing（现在完成进行时）与have been done（现在完成时被动）的区别。',
      analogy: '"作业已经被交了"——老师已经收到了作业，这就是对现在的影响。',
    },
    examPoints: [
      { point: '现在完成时被动结构', example: 'The work has been finished.', frequency: 5 },
      { point: '与by+时间连用', example: 'The bridge has been built by the end of last year.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'has/have been done + already/yet/just', meaning: '已经/还', example: 'The letter has already been sent.' },
      { pattern: 'It has been proved that...', meaning: '已被证明...', example: 'It has been proved that exercise is good for health.' },
    ],
    examples: [
      { sentence: 'The novel has been translated into many languages since it was published.', translation: '这本小说自出版以来已被翻译成多种语言。', keyWords: ['translated', 'languages', 'published'], grammarHighlight: '现在完成时被动 [has been translated]' },
    ],
    commonMistakes: [
      { mistake: 'The work has been finish.', correct: 'The work has been finished.', reason: '被动语态过去分词不变，finish→finished' },
    ],
    textbookRef: '必修三 U3',
    difficulty: 3,
    examType: ['语法填空（高频）'],
    examWeight: 15,
  },
  {
    id: 'stage3-03',
    stage: 3,
    stageName: '阶段三：被动语态',
    category: '被动语态',
    name: '现在进行时被动语态',
    structure: {
      formula: 'S + am/is/are + being + 过去分词',
      components: [
        '现在进行时 + 被动 = am/is/are being + done',
        '表示说话时正在被做的动作',
        '常与now, at the moment, right now等连用',
      ],
    },
    explanation: {
      simple: '现在进行时被动 = "正在被..."——正在发生的被动动作。',
      detailed: '现在进行时被动语态表示说话时某个动作正在被进行。构成：am/is/are + being + 过去分词。这是被动语态中最容易出错的时态之一，因为有两个be动词（一个是助动词，一个用于被动结构）。',
      analogy: '"门正在被油漆"——强调门这个对象正在被施加动作。',
    },
    examPoints: [
      { point: '现在进行时被动结构', example: 'The road is being repaired.', frequency: 5 },
      { point: '与now/at the moment连用', example: 'The children are being looked after by their grandmother now.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'is/are being + done + now / at the moment', meaning: '现在正在被...', example: 'A new museum is being built in our town.' },
    ],
    examples: [
      { sentence: 'The question is being discussed at the meeting now.', translation: '这个问题现在正在会上讨论。', keyWords: ['question', 'discussed', 'meeting'], grammarHighlight: '现在进行时被动 [is being discussed]' },
    ],
    commonMistakes: [
      { mistake: 'The bridge is being built last year.', correct: 'The bridge was being built last year. / The bridge has been built.', reason: '过去进行时被动表示过去某时刻正在进行，不能与last year连用' },
    ],
    textbookRef: '必修三 U5',
    difficulty: 3,
    examType: ['语法填空'],
    examWeight: 12,
  },
  {
    id: 'stage3-04',
    stage: 3,
    stageName: '阶段三：被动语态',
    category: '被动语态',
    name: '过去完成时被动 & 过去进行时被动',
    structure: {
      formula: 'S + had been + 过去分词（过去完成被动） | S + was/were being + 过去分词（过去进行被动）',
      components: [
        '过去完成时被动：had been + done',
        '过去进行时被动：was/were being + done',
        '过去进行时被动表示过去某时刻正在被...',
      ],
    },
    explanation: {
      simple: '过去完成时被动 = "在那之前已经被..."；过去进行时被动 = "那时正在被..."。',
      detailed: '过去完成时被动（had been + done）表示在过去的某一时刻之前已经完成且被动的动作。过去进行时被动（was/were being + done）表示过去某一时刻正在被进行的动作，要注意"过去的过去"用过去完成时被动，"过去进行中的被动"用过去进行时被动。',
      analogy: '"他说他已经被选为队长了"（过去完成被动）vs "当时他正在被选为队长"（过去进行时被动）。',
    },
    examPoints: [
      { point: '过去完成时被动', example: 'The house had been sold before he returned.', frequency: 4 },
      { point: '过去进行时被动', example: 'A new school was being built at that time.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'had been + done + by + 时间/动作', meaning: '到...时已被...', example: 'The work had been finished by 6 pm.' },
      { pattern: 'was/were being + done + when...', meaning: '正在被...时突然...', example: 'I was being examined when the lights went out.' },
    ],
    examples: [
      { sentence: 'By the end of last month, the factory had produced 10,000 cars.', translation: '到上个月底，工厂已生产了1万辆汽车。', keyWords: ['produced', 'factory', 'cars'], grammarHighlight: '过去完成时 [had produced]' },
    ],
    commonMistakes: [
      { mistake: 'The letter was being sent yesterday.', correct: 'The letter was sent yesterday. / The letter was being sent when I called.', reason: '过去进行时被动需要具体的时间点/时间段' },
    ],
    textbookRef: '选择性必修二 U2-U3',
    difficulty: 4,
    examType: ['语法填空'],
    examWeight: 12,
  },
  {
    id: 'stage3-05',
    stage: 3,
    stageName: '阶段三：被动语态',
    category: '被动语态',
    name: '五种时态被动语态综合',
    structure: {
      formula: 'am/is/are done（现在）| was/were done（过去）| will be done（将来）| have/has been done（现在完成）| had been done（过去完成）',
      components: [
        '一般现在时被动：am/is/are + done',
        '一般过去时被动：was/were + done',
        '一般将来时被动：will + be + done',
        '现在完成时被动：have/has + been + done',
        '过去完成时被动：had + been + done',
      ],
    },
    explanation: {
      simple: '被动语态的五个基本时态变化——关键是be动词的变化。',
      detailed: '五种时态的被动语态复习：1. 一般现在时被动：is/are done；2. 一般过去时被动：was/were done；3. 一般将来时被动：will be done；4. 现在完成时被动：have/has been done；5. 过去完成时被动：had been done。注意：现在进行时被动is/are being done，过去进行时被动was/were being done。',
      analogy: '被动语态的be动词就是时态的"时间标签"——你是什么时态，be就变成什么形式。',
    },
    examPoints: [
      { point: '根据时间状语判断被动时态', example: 'already → have been done; tomorrow → will be done; by last year → had been done', frequency: 5 },
      { point: '主动语态变被动语态', example: 'He wrote the book. → The book was written by him.', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'by the time + 过去时 → 过去完成时被动', meaning: '到...时已被...', example: 'The homework had been done by the time class started.' },
    ],
    examples: [
      { sentence: 'By the end of last year, the road had been widened to four lanes.', translation: '到去年年底，这条路已拓宽为四车道。', keyWords: ['widened', 'road', 'lanes'], grammarHighlight: '过去完成时被动 [had been widened]' },
    ],
    commonMistakes: [
      { mistake: 'The letter has wrote by him.', correct: 'The letter has been written by him.', reason: '现在完成时被动：has been + 过去分词written' },
    ],
    textbookRef: '选择性必修四 U2',
    difficulty: 3,
    examType: ['语法填空（高频）'],
    examWeight: 15,
  },
];

// ===================== 阶段四：非谓语动词（最高频考点） =====================
const STAGE4_POINTS: GrammarPoint[] = [
  {
    id: 'stage4-01',
    stage: 4,
    stageName: '阶段四：非谓语动词',
    category: '非谓语',
    name: '不定式作定语和结果状语',
    structure: {
      formula: '名词 + to do（不定式作定语）| 主句结果, to do（不定式作结果状语）',
      components: [
        '不定式作定语：修饰名词，位于名词后',
        '常见结构：名词/代词 + to do, the ability to learn, something to eat',
        '不定式作结果状语：only to do（意外结果）, enough to do, too...to...',
      ],
    },
    explanation: {
      simple: '不定式作定语就是"要...的"，作结果状语表示"结果..."。',
      detailed: '不定式（to do）可作定语修饰名词，常用于：ability, chance, decision, plan, way, something/anything/nothing等词后。不定式作结果状语：only to do表示"不料/意外结果"（He hurried there, only to find it closed.）；enough to do和too...to...也是常见结构。',
      analogy: '"我要买的东西"——"要买的"就是修饰"东西"的不定式。',
    },
    examPoints: [
      { point: '不定式作后置定语', example: 'I have a lot of homework to do.', frequency: 5 },
      { point: 'only to do 意外结果', example: 'He arrived home, only to find his house had been broken into.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: '名词/代词 + to do', meaning: '...要/要...的', example: 'There is nothing to worry about.' },
      { pattern: '主句, only to do', meaning: '结果却...（意外）', example: 'I visited the museum, only to discover it was closed.' },
      { pattern: 'too...to... / enough to...', meaning: '太...以至于不能/足够...可以', example: 'He is too young to understand. / He is old enough to go to school.' },
    ],
    examples: [
      { sentence: 'I have an important meeting to attend tomorrow.', translation: '我明天有一个重要的会议要参加。', keyWords: ['meeting', 'attend', 'important'], grammarHighlight: 'to attend [不定式作定语]' },
      { sentence: 'He worked hard, only to fail the exam.', translation: '他努力学习，结果却考试失败了。', keyWords: ['worked', 'only to', 'fail'], grammarHighlight: 'only to fail [意外结果]' },
    ],
    commonMistakes: [
      { mistake: 'I have something to do it.', correct: 'I have something to do.', reason: '不定式作定语，to do修饰something，不再加it' },
    ],
    textbookRef: '必修二 U2-U3',
    difficulty: 3,
    examType: ['语法填空', '写作'],
    examWeight: 22,
  },
  {
    id: 'stage4-02',
    stage: 4,
    stageName: '阶段四：非谓语动词',
    category: '非谓语',
    name: '不定式作主语和宾语',
    structure: {
      formula: 'To do + 谓语（不定式作主语）| 主语 + V + to do（不定式作宾语）',
      components: [
        '不定式作主语：To learn English is important.',
        'It形式主语：It is important to learn English.',
        '不定式作宾语：I want to go.',
        'It形式宾语：I find it difficult to learn English.',
      ],
    },
    explanation: {
      simple: '不定式可以作句子的主语（开头）或宾语（动词后面）。',
      detailed: '不定式（to do）可作主语，通常用it作形式主语（It is + adj + to do = To do is + adj）。不定式也可作宾语，放在某些动词后面，如want, hope, decide, plan, agree, refuse, pretend, manage, afford等。也可作"it形式宾语"：动词 + it + adj + to do。',
      analogy: '"学英语很重要"——可以说"To learn English is important"或"It is important to learn English"。',
    },
    examPoints: [
      { point: 'It is + adj + to do（形式主语）', example: 'It is necessary to learn a foreign language.', frequency: 5 },
      { point: '动词 + it + adj + to do（形式宾语）', example: 'I find it challenging to learn a new language.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'It is + adj + (for/of + sb) + to do', meaning: '做某事是...的', example: 'It is kind of you to help me. / It is important for us to learn English.' },
      { pattern: '主语 + V + it + adj + to do', meaning: '觉得...做...', example: 'I think it necessary to review the lesson.' },
    ],
    examples: [
      { sentence: 'It is a great honor to be invited to give a speech here.', translation: '很荣幸被邀请在这里发表演讲。', keyWords: ['honor', 'invited', 'speech'], grammarHighlight: 'to be invited [不定式被动式作主语]' },
      { sentence: 'We found it impossible to finish the work in one day.', translation: '我们发现一天内完成这项工作是不可能的。', keyWords: ['found', 'impossible', 'finish'], grammarHighlight: 'it[形式宾语] to finish [不定式]' },
    ],
    commonMistakes: [
      { mistake: 'To learn English is very important.', correct: 'It is very important to learn English.', reason: '不定式主语太长时，用it作形式主语' },
      { mistake: 'I enjoy to read books.', correct: 'I enjoy reading books.', reason: 'enjoy后接动名词，不是动词不定式' },
    ],
    textbookRef: '必修三 U2',
    difficulty: 3,
    examType: ['语法填空'],
    examWeight: 18,
  },
  {
    id: 'stage4-03',
    stage: 4,
    stageName: '阶段四：非谓语动词',
    category: '非谓语',
    name: '动名词作主语和宾语',
    structure: {
      formula: 'V-ing + 谓语（动名词作主语）| 主语 + V + V-ing（动名词作宾语）',
      components: [
        '动名词（V-ing）作主语：Learning English takes time.',
        '动名词作宾语：I enjoy reading.',
        '动名词作定语：a sleeping bag（装睡的袋子）',
        '作主语时可用it作形式主语：It is no use crying.',
      ],
    },
    explanation: {
      simple: '动名词（V-ing）既有名词性质（可作主语/宾语），又有动词性质（可带宾语/状语）。',
      detailed: '动名词（doing）是动词的名词形式。可作：1）主语——Learning English is fun. 2）宾语——I enjoy reading. 3）表语——My hobby is painting. 4）定语——a sleeping bag。注意：动名词的否定式是not + doing；完成式是having done；被动式是being done。',
      analogy: '动名词就像"游泳"——既是名词（我喜欢游泳），又保留动词的特征（可以"游"）。',
    },
    examPoints: [
      { point: '动名词作主语', example: 'Learning a foreign language takes a lot of time.', frequency: 4 },
      { point: '动名词作宾语', example: 'I suggest starting the meeting right now.', frequency: 5 },
      { point: '动名词的复合结构', example: 'I appreciate your helping me.', frequency: 3 },
    ],
    fixedCombinations: [
      { pattern: 'look forward to + doing', meaning: '期待做...', example: 'I am looking forward to hearing from you soon.' },
      { pattern: 'be used to + doing', meaning: '习惯于...', example: 'I am used to getting up early.' },
      { pattern: 'pay attention to + doing', meaning: '注意...', example: 'Pay attention to protecting the environment.' },
      { pattern: 'can\'t help doing', meaning: '忍不住...', example: 'I can\'t help laughing when I hear this joke.' },
    ],
    examples: [
      { sentence: 'Learning English requires patience and practice.', translation: '学英语需要耐心和练习。', keyWords: ['learning', 'requires', 'patience'], grammarHighlight: 'Learning [动名词作主语]' },
      { sentence: 'I suggest taking a break before we continue.', translation: '我建议休息一下再继续。', keyWords: ['suggest', 'taking', 'break'], grammarHighlight: 'taking [动名词作宾语]' },
    ],
    commonMistakes: [
      { mistake: 'I enjoy to read books.', correct: 'I enjoy reading books.', reason: 'enjoy后接动名词，不接不定式' },
      { mistake: 'I am used to study English every morning.', correct: 'I am used to studying English every morning.', reason: 'be used to中to是介词，后接动名词' },
    ],
    textbookRef: '必修二 U4-U6',
    difficulty: 3,
    examType: ['语法填空'],
    examWeight: 18,
  },
  {
    id: 'stage4-04',
    stage: 4,
    stageName: '阶段四：非谓语动词',
    category: '非谓语',
    name: '现在分词作状语和定语',
    structure: {
      formula: 'V-ing（主动/进行）→ 作状语/定语/表语/宾补',
      components: [
        '现在分词作状语：表时间、原因、条件、让步、结果、伴随',
        '现在分词作定语：前置或后置',
        '现在分词作表语：主系表结构中描述主语的特征',
        '现在分词作宾补：see/hear/watch/find + O + V-ing',
      ],
    },
    explanation: {
      simple: '现在分词（doing）表示"主动/进行"——正在进行或主动的动作。',
      detailed: '现在分词（V-ing）在句中可充当多种成分：1）状语——Walking in the park, I met an old friend.（时间）；2）定语——the rising sun；3）表语——The news is exciting；4）宾补——I saw him crossing the road。注意：现在分词作状语时，其逻辑主语必须与主句主语一致；不一致时要用独立主格结构。',
      analogy: '现在分词doing就像"正在...的"——强调动作正在发生或主动发生。',
    },
    examPoints: [
      { point: '现在分词作状语', example: 'Seeing the teacher, the students stood up.', frequency: 5 },
      { point: '现在分词作定语', example: 'The student sitting by the window is my sister.', frequency: 4 },
      { point: '感官动词+宾语+现在分词', example: 'I heard her singing in the next room.', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'considering (that)...', meaning: '考虑到...', example: 'Considering he is a beginner, he speaks quite well.' },
      { pattern: 'Judging from/by...', meaning: '从...判断', example: 'Judging from his expression, he must be angry.' },
      { pattern: 'Generally speaking', meaning: '一般来说', example: 'Generally speaking, women live longer than men.' },
    ],
    examples: [
      { sentence: 'Having finished the work, I went home.', translation: '完成工作后，我回家了。', keyWords: ['finished', 'work', 'went'], grammarHighlight: 'Having finished [现在分词完成式，先于谓语]' },
      { sentence: 'The students sat in the classroom, listening to the teacher carefully.', translation: '学生们坐在教室里，认真听老师讲课。', keyWords: ['sat', 'listening', 'carefully'], grammarHighlight: 'listening [伴随状语，主动]' },
    ],
    commonMistakes: [
      { mistake: 'Being tired, I went to bed early. (正确，但逻辑主语需一致)', correct: 'Tired, I went to bed early.', reason: 'Tired是形容词，不是分词，但两者都可接受' },
      { mistake: 'I saw him cross the road.', correct: 'I saw him crossing the road.', reason: 'see O doing表示看见动作正在进行；see O do表示看见全过程' },
    ],
    textbookRef: '必修三 U1',
    difficulty: 4,
    examType: ['语法填空（高频）'],
    examWeight: 25,
  },
  {
    id: 'stage4-05',
    stage: 4,
    stageName: '阶段四：非谓语动词',
    category: '非谓语',
    name: '过去分词作状语和定语',
    structure: {
      formula: 'V-ed（被动/完成）→ 作状语/定语/表语/宾补',
      components: [
        '过去分词作状语：表被动、完成、时间、原因',
        '过去分词作定语：the broken window（被打破的窗户）',
        '过去分词作表语：I am interested in English.',
        '过去分词作宾补：get/have + O + done',
      ],
    },
    explanation: {
      simple: '过去分词（done）表示"被动/完成"——被...的或...过了的。',
      detailed: '过去分词（V-ed/不规则）表示被动和完成的两层含义。作状语时：Given more time, I would do it better. 作定语时：the written letter。作表语时：I am excited。注意区分：The book is interesting.（现在分词——物作主语，主动含义）；I am interested.（过去分词——人作主语，被动含义）。',
      analogy: '过去分词就像"被...的"——强调动作已被施加或已完成。',
    },
    examPoints: [
      { point: '过去分词作后置定语', example: 'The bridge built last year is very strong.', frequency: 5 },
      { point: '过去分词作状语', example: 'Given more time, we could do it better.', frequency: 4 },
      { point: 'have/get sth done', example: 'I had my hair cut yesterday.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'given (that)...', meaning: '考虑到/鉴于', example: 'Given that he is only ten, he did a good job.' },
      { pattern: 'compared with/to...', meaning: '与...相比', example: 'Compared with Beijing, Shanghai is more crowded.' },
      { pattern: 'provided/providing (that)...', meaning: '只要/假如', example: 'You can borrow my book provided you return it on time.' },
    ],
    examples: [
      { sentence: 'The book written by Mo Yan won the Nobel Prize.', translation: '莫言写的这本书获得了诺贝尔奖。', keyWords: ['written', 'won', 'Nobel'], grammarHighlight: 'written by [过去分词后置定语]' },
      { sentence: 'Given enough time, we would have done it better.', translation: '如果有足够的时间，我们会做得更好。', keyWords: ['given', 'enough', 'time'], grammarHighlight: 'Given [条件状语，独立主格]' },
    ],
    commonMistakes: [
      { mistake: 'I found the window break.', correct: 'I found the window broken.', reason: 'find O done表示发现某物被...' },
      { mistake: 'The teacher is interesting.', correct: 'The teacher is interested.', reason: '人作主语用interested；物作主语用interesting' },
    ],
    textbookRef: '必修三 U3-U4',
    difficulty: 4,
    examType: ['语法填空（高频）'],
    examWeight: 25,
  },
  {
    id: 'stage4-06',
    stage: 4,
    stageName: '阶段四：非谓语动词',
    category: '非谓语',
    name: '非谓语作宾语补足语',
    structure: {
      formula: 'see/hear/watch/feel + O + do（省to）/ doing / done | make/let/have + O + do（省to）/ doing / done | get + O + to do / done',
      components: [
        '感官动词see/hear/watch/feel + O + do（全过程）/ doing（进行）/ done（被动）',
        '使役动词make/let/have + O + do（主动）；get + O + to do（主动）',
        '变被动时，感官/使役后要还原to',
      ],
    },
    explanation: {
      simple: '非谓语作宾补就是"让/使/看/听..."后接补充说明宾语的动作。',
      detailed: '宾语补足语用来补充说明宾语的状态或动作。感官动词：see/hear/watch/feel + O + do/doing/done（see sb do看见全过程；see sb doing看见正在进行）。使役动词：make/let/have + O + do；get + O + to do。have sth done表示"让/使某事被做"。注意：感官/使役动词变被动时要还原to。',
      analogy: '"我让他走了"——"他"是宾语，"走了"是补充说明宾语的——宾语补足语。',
    },
    examPoints: [
      { point: '感官动词后doing vs do', example: 'I saw her cross the road (全过程). vs I saw her crossing the road (正在进行).', frequency: 5 },
      { point: '变被动后还原to', example: 'He was seen to enter the building.', frequency: 5 },
      { point: 'have/get sth done', example: 'I must have my bike repaired.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'have/get + O + done', meaning: '让（别人）做...', example: 'I had my car repaired yesterday.' },
      { pattern: 'have sb doing', meaning: '使某人一直做...', example: 'The boss had us working all night.' },
      { pattern: 'get sb to do', meaning: '让某人做...', example: 'Can you get the students to hand in their papers?' },
    ],
    examples: [
      { sentence: 'I saw him crossing the road when the accident happened.', translation: '事故发生时，我看见他正在过马路。', keyWords: ['crossing', 'accident', 'happened'], grammarHighlight: 'saw O doing [正在进行]' },
      { sentence: 'He was made to repeat the whole story.', translation: '他被迫把整个故事重述了一遍。', keyWords: ['made', 'repeat', 'story'], grammarHighlight: 'was made to [被动后还原to]' },
    ],
    commonMistakes: [
      { mistake: 'I heard him to sing a song.', correct: 'I heard him sing a song.', reason: '感官动词后省to' },
      { mistake: 'She had her baby to cry.', correct: 'She had her baby crying. / She had her baby cry.', reason: 'have sb doing表示持续状态' },
    ],
    textbookRef: '选择性必修一 U2',
    difficulty: 4,
    examType: ['语法填空（高频）'],
    examWeight: 20,
  },
  {
    id: 'stage4-07',
    stage: 4,
    stageName: '阶段四：非谓语动词',
    category: '非谓语',
    name: '后接V-ing vs to do的关键动词辨析',
    structure: {
      formula: 'V + doing（表示习惯/一次动作）| V + to do（表示目的/将来的事）',
      components: [
        'remember doing（记得做过）vs remember to do（记得要去做）',
        'forget doing（忘记做过）vs forget to do（忘记要去做）',
        'stop doing（停止做）vs stop to do（停下来去做）',
        'try doing（尝试做）vs try to do（努力做）',
        'mean doing（意味着）vs mean to do（打算做）',
        'go on doing（继续做同一件事）vs go on to do（继续做另一件事）',
        'regret doing（后悔做了）vs regret to do（很遗憾要...）',
        'can\'t help doing（忍不住）',
        'consider doing（考虑）',
      ],
    },
    explanation: {
      simple: '同一个动词后接doing和to do意思完全不同——关键是理解动作发生的"时间点"。',
      detailed: '这是非谓语中最易混淆的知识点。核心规律：doing通常表示已经发生的动作或习惯性动作；to do通常表示将来的目的或尚未发生的动作。具体辨析：remember/forget/regret + doing表示已做；+ to do表示要做。stop + doing停止正在做的事；+ to do停下来去做另一件事。try + doing尝试；+ to do努力。',
      analogy: '"记得锁门"——remember to lock（要去做）vs remember locking（记得锁了）。',
    },
    examPoints: [
      { point: 'remember/forget/stop/try doing vs to do', example: 'Remember to lock the door (要去锁). vs I remember locking the door (记得锁了).', frequency: 5 },
      { point: 'mean/regret/go on + doing/to do', example: 'I regret telling him the truth (后悔). vs I regret to tell you (很遗憾要告诉你).', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'can\'t help doing', meaning: '忍不住...', example: 'I can\'t help laughing when I see his face.' },
      { pattern: 'look forward to + doing', meaning: '期待做...', example: 'We are looking forward to meeting you soon.' },
      { pattern: 'be used to + doing', meaning: '习惯于...', example: 'I am used to getting up early now.' },
      { pattern: 'devote...to + doing', meaning: '致力于...', example: 'He devoted his life to helping the poor.' },
    ],
    examples: [
      { sentence: 'I remember meeting her at the party last year.', translation: '我记得去年在派对上见过她。', keyWords: ['remember', 'meeting', 'party'], grammarHighlight: 'remember doing [记得已做过的事]' },
      { sentence: 'Remember to submit your homework before 11:59 pm.', translation: '记得在晚上11:59前提交作业。', keyWords: ['remember', 'submit', 'homework'], grammarHighlight: 'remember to do [记得要去做]' },
    ],
    commonMistakes: [
      { mistake: 'I tried to climb the mountain, and I succeeded.', correct: 'I tried climbing the mountain, and I succeeded.', reason: 'try doing表示尝试了并成功了；try to do表示尝试但不一定成功' },
      { mistake: 'I stopped to smoke.', correct: 'I stopped smoking.', reason: 'stop smoking停止吸烟；stop to smoke停下来去吸烟' },
    ],
    textbookRef: '选择性必修一 U3',
    difficulty: 5,
    examType: ['语法填空（高频/必考）'],
    examWeight: 28,
  },
  {
    id: 'stage4-08',
    stage: 4,
    stageName: '阶段四：非谓语动词',
    category: '非谓语',
    name: 'doing vs done 核心辨析',
    structure: {
      formula: 'doing = 主动/进行/一般性 | done = 被动/完成',
      components: [
        'doing表示逻辑主语与动作是主动关系，或动作正在进行',
        'done表示逻辑主语与动作是被动关系，或动作已完成',
        '判断方法：看逻辑主语和动作的关系',
      ],
    },
    explanation: {
      simple: 'doing和done的本质区别在于"谁做"和"做了什么"——主动用doing，被动用done。',
      detailed: 'doing vs done是高考非谓语最高频考点。判断步骤：1）找出非谓语的逻辑主语（通常是其前面的名词）；2）判断逻辑主语与动作的关系——主动用doing，被动用done；3）判断时间——正在进行用doing，已完成或被动用done。特别注意：有些动词如interest, excite, surprise的现在分词（interesting）和过去分词（interested）都可作表语，但含义不同——现在分词表"令人...的"，过去分词表"感到...的"。',
      analogy: '就像中文"正在吃苹果的人"（主动）和"被吃掉的苹果"（被动）。',
    },
    examPoints: [
      { point: 'doing vs done作状语', example: 'Having finished the work, I went home (主动/先完成). vs Filled with hope, he left (被动/充满).', frequency: 5 },
      { point: '现在分词vs过去分词作表语', example: 'The story is interesting (令人感兴趣). vs I am interested in the story (感到感兴趣).', frequency: 5 },
      { point: 'doing vs done作定语', example: 'the rising sun (正在升起的). vs the risen sun (已升起的).', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'be + V-ing（主动进行）', meaning: '正在...', example: 'The situation is developing rapidly.' },
      { pattern: 'be + V-ed（被动完成）', meaning: '被.../已经...', example: 'The window is broken.' },
    ],
    examples: [
      { sentence: 'Compared with the flat, the house is more expensive.', translation: '与公寓相比，这座房子更贵。', keyWords: ['compared', 'flat', 'expensive'], grammarHighlight: 'Compared with [过去分词，被动]' },
      { sentence: 'Having been told the bad news, she burst into tears.', translation: '被告知这个坏消息后，她哭了起来。', keyWords: ['told', 'bad', 'news'], grammarHighlight: 'Having been told [现在分词完成式被动，先于谓语]' },
    ],
    commonMistakes: [
      { mistake: 'The news is very exciting.', correct: 'The news is very exciting. / I am very excited about the news.', reason: 'news是物，用exciting；人作主语用excited' },
      { mistake: 'I saw the boy was crying.', correct: 'I saw the boy crying.', reason: '感官动词+宾+现在分词' },
    ],
    textbookRef: '选择性必修一 U4',
    difficulty: 5,
    examType: ['语法填空（必考核心）'],
    examWeight: 30,
  },
];

// ===================== 阶段五：三大从句（最高频考点） =====================
const STAGE5_POINTS: GrammarPoint[] = [
  {
    id: 'stage5-01',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '定语从句',
    name: '定语从句（关系代词）',
    structure: {
      formula: 'n. + who/whom/whose/which/that + 主谓',
      components: [
        'who（人，主语）',
        'whom（人，宾语，可省略）',
        'which（物，主语/宾语）',
        'that（人/物，主语/宾语）',
        'whose（人/物，定语）',
      ],
    },
    explanation: {
      simple: '定语从句就是用来说明前面那个名词的句子，像给名词加一个描述。',
      detailed: '定语从句修饰名词或代词，由关系代词（who, whom, whose, which, that）或关系副词引导。who指人，在从句中作主语；whom指人，在从句中作宾语，可省略；which指物；that可指人可指物，在从句中作主语或宾语。whose指人或物，在从句中作定语。注意：介词后只能用which/whom，不用that；非限制性定语从句不用that。',
      analogy: '"我喜欢的那本书"——"我喜欢"就是定语从句，修饰"书"。',
    },
    examPoints: [
      { point: '只用that的情况', example: 'Everything that I saw impressed me. / The only person that came was...', frequency: 5 },
      { point: '只用which的情况', example: 'which前有介词 / 非限制性定语从句', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'the same...as / the same...that', meaning: '与...相同/正是...', example: 'He is the same man that I saw yesterday.' },
      { pattern: 'such...as / such...that', meaning: '像...一样/如此...以至于', example: 'Such students as work hard will succeed.' },
      { pattern: 'as 引导的非限制性定语从句', meaning: '正如/这一点', example: 'As is known to all, the earth is round.' },
    ],
    examples: [
      { sentence: 'The woman who lives next door is a doctor.', translation: '住在隔壁的那位女士是医生。', keyWords: ['woman', 'lives', 'doctor'], grammarHighlight: 'who [关系代词/主语]' },
      { sentence: 'The book (which/that) I bought yesterday is very interesting.', translation: '我昨天买的那本书很有趣。', keyWords: ['bought', 'interesting', 'yesterday'], grammarHighlight: '(which/that) [关系代词/宾语，可省略]' },
    ],
    commonMistakes: [
      { mistake: 'This is the book which I bought it.', correct: 'This is the book which I bought.', reason: '关系代词作宾语时不能再加it' },
      { mistake: 'The teacher who is speaking is my father.', correct: 'The teacher who is speaking is my father. (无错)', reason: '正确，who作主语不能省略' },
    ],
    textbookRef: '必修一 U4-U5',
    difficulty: 4,
    examType: ['语法填空（必考）'],
    examWeight: 25,
  },
  {
    id: 'stage5-02',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '定语从句',
    name: '定语从句（关系副词）',
    structure: {
      formula: 'n. + when/where/why + 主谓 = n. + 介词+which',
      components: [
        'when = at/on/in/during which（时间）',
        'where = in/at/on which（地点）',
        'why = for which（原因）',
        '关系副词在从句中作状语',
      ],
    },
    explanation: {
      simple: '关系副词when/where/why替代"介词+which"，在从句中作时间/地点/原因状语。',
      detailed: 'when表示时间，where表示地点，why表示原因。它们的用法可以转化为：the day when = the day on which；the place where = the place in which；the reason why = the reason for which。关系副词在从句中充当状语成分。注意：reason why结构中，why后可接定语从句修饰the reason。',
      analogy: '"我买书的那天"——when替代了"在那一天"。',
    },
    examPoints: [
      { point: 'when/where/why = 介词+which', example: 'the day when = the day on which', frequency: 5 },
      { point: 'reason why结构', example: 'The reason why he was late was that he missed the bus.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'the moment/instant + when = as soon as', meaning: '一...就', example: 'The moment I saw him, I knew something was wrong.' },
      { pattern: 'every time / each time + 主谓', meaning: '每次...', example: 'Every time I see him, he is reading.' },
    ],
    examples: [
      { sentence: 'I will never forget the day when we visited the museum.', translation: '我永远不会忘记我们去博物馆的那一天。', keyWords: ['forget', 'visited', 'museum'], grammarHighlight: 'when [关系副词/时间状语]' },
      { sentence: 'The factory where my father works is far from here.', translation: '我父亲工作的那个工厂离这里很远。', keyWords: ['factory', 'father', 'works'], grammarHighlight: 'where [关系副词/地点状语]' },
    ],
    commonMistakes: [
      { mistake: 'This is the place where we visited last year.', correct: 'This is the place (which/that) we visited last year.', reason: 'where在从句中作状语，visit是及物动词需要宾语' },
    ],
    textbookRef: '必修一 U6',
    difficulty: 4,
    examType: ['语法填空'],
    examWeight: 18,
  },
  {
    id: 'stage5-03',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '定语从句',
    name: '定语从句（介词+关系代词）',
    structure: {
      formula: 'n. + 介词 + which/whom + 主谓',
      components: [
        '介词后只能用which（物）或whom（人）',
        '不能用that',
        '介词的选择取决于从句中的固定搭配或先行词',
      ],
    },
    explanation: {
      simple: '介词+关系代词就是"把介词放到关系代词前面"，常见于正式书面语。',
      detailed: '定语从句中，介词可以放在关系代词前，此时只能用which（指物）或whom（指人），不能用that。注意：介词的选择取决于：1）从句中动词或形容词的固定搭配（depend on, look at, wait for等）；2）先行词与介词的固定搭配。介词提前时关系代词不能省略，但如果介词不提前，关系代词在从句中作宾语时可以省略。',
      analogy: '"我住的那个城市"可以变成"The city in which I live"或"I live in the city"——介词in提前到which前。',
    },
    examPoints: [
      { point: '介词+which/whom（不能用that）', example: 'The man to whom I spoke is my teacher.', frequency: 5 },
      { point: '介词的选择（根据固定搭配）', example: 'The book (which/that) I am looking for is here. vs The book for which I am looking is here.', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'the key to doing = the key to which...', meaning: '...的关键', example: 'Practice is the key to mastering English.' },
      { pattern: 'a way of doing = a way in which...', meaning: '做...的方式', example: 'I found a way of solving the problem.' },
    ],
    examples: [
      { sentence: 'The man to whom I spoke yesterday is my teacher.', translation: '昨天我和他说话的那个人是我的老师。', keyWords: ['man', 'spoke', 'teacher'], grammarHighlight: 'to whom [介词+关系代词]' },
      { sentence: 'Is this the reason for which he was late?', translation: '这就是他迟到的原因吗？', keyWords: ['reason', 'late', 'for'], grammarHighlight: 'for which [介词+关系代词]' },
    ],
    commonMistakes: [
      { mistake: 'The man to that I spoke is my teacher.', correct: 'The man (whom/that) I spoke to is my teacher. / The man to whom I spoke is my teacher.', reason: '介词后不能用that' },
    ],
    textbookRef: '必修一 U6',
    difficulty: 4,
    examType: ['语法填空（高频难点）'],
    examWeight: 20,
  },
  {
    id: 'stage5-04',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '定语从句',
    name: '非限制性定语从句',
    structure: {
      formula: 'n., which/who/whom/whose/when/where + 主谓,（前后有逗号）',
      components: [
        '非限制性定语从句前后有逗号',
        '不能用that',
        'which可指代前面整句话',
        'as也可引导非限制性定语从句',
      ],
    },
    explanation: {
      simple: '非限制性定语从句就是用逗号隔开、对名词进行补充说明的从句。',
      detailed: '非限制性定语从句与限制性定语从句的主要区别：1）有逗号隔开；2）不能用that；3）which可指代前面整句话；4）省略后主句意思仍然完整。as也可引导非限制性定语从句，表示"正如"。as和which的区别：as可位于句首、句中或句末，which只能位于句末或句中。',
      analogy: '"我的老师，她非常严格"——逗号后的"她非常严格"是非限制性定语从句，删掉它"我的老师"仍然有意义。',
    },
    examPoints: [
      { point: 'which指代整句话', example: 'He passed the exam, which made his parents happy.', frequency: 5 },
      { point: 'as vs which引导非限制性定语从句', example: 'As is known to all... vs ...which is known to all.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'as is known to all / as we all know / as is mentioned above', meaning: '众所周知', example: 'As is known to all, the earth moves around the sun.' },
      { pattern: 'which is often the case', meaning: '情况往往如此', example: 'He didn\'t come to the party, which was not surprising.' },
    ],
    examples: [
      { sentence: 'He has passed the exam, which is really good news.', translation: '他通过了考试，这是个好消息。', keyWords: ['passed', 'exam', 'good news'], grammarHighlight: 'which [指代整句话]' },
      { sentence: 'As is mentioned above, practice is essential for learning English.', translation: '如上所述，练习对学英语至关重要。', keyWords: ['mentioned', 'practice', 'essential'], grammarHighlight: 'As [非限制性定语从句，可放句首]' },
    ],
    commonMistakes: [
      { mistake: 'My brother, that is a teacher, lives in Beijing.', correct: 'My brother, who is a teacher, lives in Beijing.', reason: '非限制性定语从句不能用that' },
    ],
    textbookRef: '选择性必修一 U1',
    difficulty: 4,
    examType: ['语法填空', '写作'],
    examWeight: 18,
  },
  {
    id: 'stage5-05',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '名词性从句',
    name: '宾语从句',
    structure: {
      formula: 'V + that/wh-词/whether/if + 主谓（陈述语序）',
      components: [
        'that引导（that在口语中可省略）',
        'whether/if表示"是否"',
        'wh-词（what/who/which/whose）提问并作成分',
        '宾语从句必须用陈述语序',
      ],
    },
    explanation: {
      simple: '宾语从句就是"把一个问句变成名词"，放在动词后面作宾语。',
      detailed: '宾语从句在句中作宾语。连接词：that（无意义，不作成分，口语中可省略）；whether/if（是否）；what/who/which/whose/when/where/why/how（有意义，作成分）。注意：宾语从句必须用陈述语序（主谓不倒装）。whether和if在宾语从句中一般可互换，但whether可以与or not连用，if不行；在介词后只能用whether；在if可能导致歧义时用whether。',
      analogy: '"我不知道他去哪里了"——"他去哪里了"变成宾语从句"他去哪里（I don\'t know where he went）"。',
    },
    examPoints: [
      { point: '宾语从句陈述语序', example: 'I don\'t know where he lives (NOT where does he live).', frequency: 5 },
      { point: 'whether vs if', example: 'I don\'t know whether or not he will come. (OR: if he will come)', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'It seems/appears that...', meaning: '似乎...', example: 'It seems that he is not telling the truth.' },
      { pattern: 'make sure that / make certain that...', meaning: '确保...', example: 'Make sure that you finish the work on time.' },
    ],
    examples: [
      { sentence: 'I believe that he will succeed.', translation: '我相信他会成功。', keyWords: ['believe', 'succeed', 'will'], grammarHighlight: 'that引导宾语从句（可省略）' },
      { sentence: 'I wonder whether/if he is coming tomorrow.', translation: '我想知道他明天是否会来。', keyWords: ['wonder', 'whether', 'coming'], grammarHighlight: 'whether引导宾语从句' },
    ],
    commonMistakes: [
      { mistake: 'I don\'t know where does he live.', correct: 'I don\'t know where he lives.', reason: '宾语从句用陈述语序' },
      { mistake: 'I\'m not sure if or not he will come.', correct: 'I\'m not sure whether or not he will come.', reason: 'whether可与or not连用，if不行' },
    ],
    textbookRef: '必修三 U5',
    difficulty: 3,
    examType: ['语法填空'],
    examWeight: 18,
  },
  {
    id: 'stage5-06',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '名词性从句',
    name: '主语从句',
    structure: {
      formula: 'That/Whether/Wh-词 + 主谓 | It + V + that/whether/Wh-词 + 主谓',
      components: [
        '主语从句放在句首',
        '常以it作形式主语',
        'that引导无意义，wh-词有意义',
      ],
    },
    explanation: {
      simple: '主语从句就是一个完整的句子作主语——"某人说的话"就是主语。',
      detailed: '主语从句在句中作主语。that引导时只起连接作用，不作成分；whether/if表示是否；wh-词（what, who, which, where等）既连接句子又在从句中作成分。常用it作形式主语：It is + adj/n. + that... / It is + p.p. + that... / It + V + that...。that引导主语从句时通常不省略。',
      analogy: '"他通过了考试是事实"——"他通过了考试"就是主语从句。',
    },
    examPoints: [
      { point: 'It作形式主语的主语从句', example: 'It is important that we (should) learn English well.', frequency: 5 },
      { point: '主语从句中that不能省略', example: 'That he passed the exam made us happy.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'It is + adj + that + 主语从句', meaning: '...是...的', example: 'It is necessary that we (should) work hard.' },
      { pattern: 'It is + p.p. + that + 主语从句', meaning: '...已经...', example: 'It is said that he has returned.' },
      { pattern: 'What + 主语 + V... = 主语从句', meaning: '...的事情/东西', example: 'What impressed me most was his kindness.' },
    ],
    examples: [
      { sentence: 'That the earth moves around the sun is known to all.', translation: '地球绕太阳转是众所周知的。', keyWords: ['earth', 'moves', 'sun'], grammarHighlight: 'That... [主语从句]' },
      { sentence: 'It is believed that the project will be completed next month.', translation: '人们相信这个项目将于下月完成。', keyWords: ['believed', 'project', 'completed'], grammarHighlight: 'It is believed that... [形式主语]' },
    ],
    commonMistakes: [
      { mistake: 'Is that he will come true?', correct: 'Whether he will come is not known.', reason: '主语从句不能用if引导' },
      { mistake: 'He is likely to succeed is true.', correct: 'It is true that he is likely to succeed.', reason: '用it作形式主语更自然' },
    ],
    textbookRef: '选择性必修三 U1',
    difficulty: 4,
    examType: ['语法填空', '写作加分'],
    examWeight: 20,
  },
  {
    id: 'stage5-07',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '名词性从句',
    name: '表语从句',
    structure: {
      formula: 'S + be + that/whether/wh-词 + 主谓',
      components: [
        '表语从句位于系动词（be/become/get/remain/look/seem等）之后',
        'that引导无意义，whether/wh-词有意义',
        'as if/as though也可引导表语从句',
      ],
    },
    explanation: {
      simple: '表语从句就是系动词后的"名词性从句"，解释主语是什么或怎么样。',
      detailed: '表语从句在句中作表语，位于系动词（be, become, get, remain, look, seem, taste, sound等）之后。that引导时只起连接作用；whether/wh-词既连接又在从句中作成分。常见结构：The reason is that...（不用because）；It seems/looks as if...。表语从句中that通常不省略。',
      analogy: '"问题是他不够努力"——"他不够努力"就是表语从句，说明"问题"是什么。',
    },
    examPoints: [
      { point: 'The reason is that...（不用because）', example: 'The reason he was late was that he missed the bus.', frequency: 5 },
      { point: 'as if/as though引导表语从句', example: 'It looks as if it is going to rain.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'The fact/problem is that...', meaning: '事实/问题是...', example: 'The fact is that I have no money.' },
      { pattern: 'The reason is that...', meaning: '原因是...', example: 'The reason he failed was that he didn\'t study.' },
      { pattern: 'It seems/looks as if/as though...', meaning: '似乎...', example: 'It seems as if he knows everything.' },
    ],
    examples: [
      { sentence: 'My opinion is that you should read more books.', translation: '我的意见是你应该多读书。', keyWords: ['opinion', 'should', 'books'], grammarHighlight: 'that... [表语从句]' },
      { sentence: 'The question is whether we can finish the work on time.', translation: '问题是我们能否按时完成工作。', keyWords: ['question', 'whether', 'finish'], grammarHighlight: 'whether... [表语从句]' },
    ],
    commonMistakes: [
      { mistake: 'The reason is because he was ill.', correct: 'The reason is that he was ill.', reason: 'reason后用that引导表语从句，不用because' },
    ],
    textbookRef: '选择性必修三 U2',
    difficulty: 3,
    examType: ['语法填空'],
    examWeight: 15,
  },
  {
    id: 'stage5-08',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '名词性从句',
    name: '同位语从句',
    structure: {
      formula: 'n. + that/wh-词 + 主谓（同位语从句）',
      components: [
        '同位语从句解释说明抽象名词的内容',
        '常见抽象名词：fact, news, idea, hope, belief, question, problem, order, suggestion等',
        'that只起连接作用，不作成分（与定语从句的关键区别）',
      ],
    },
    explanation: {
      simple: '同位语从句就是用句子"解释"一个抽象名词——说明这个名词的具体内容是什么。',
      detailed: '同位语从句跟在抽象名词后，进一步解释说明这个名词的内容。常见名词：fact, news, idea, hope, belief, question, problem, order, suggestion, promise, evidence等。that引导时只起连接作用，不在从句中作任何成分（这是与定语从句的关键区别）。如果去掉that后句子意思不完整，则可能是定语从句。',
      analogy: '"他成功的消息"——"他成功了"就是同位语从句，解释"消息"的内容。',
    },
    examPoints: [
      { point: '同位语从句与定语从句的区别（高频易混点）', example: 'The news that he won (同位: 这件事/他赢了) vs The news that he told us (定语: 他告诉我们的/that是宾语)', frequency: 5 },
      { point: 'that引导同位语从句不省略', example: 'The fact that she passed the exam is encouraging.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'The fact/note/sign/idea that...', meaning: '...的事实/便条/标志/想法', example: 'The fact that practice makes perfect is well known.' },
      { pattern: 'There is a chance/belief/evidence that...', meaning: '有机会/相信/有证据...', example: 'There is evidence that the earth is round.' },
    ],
    examples: [
      { sentence: 'The news that our team won the championship excited everyone.', translation: '我们队赢得冠军的消息让每个人都很兴奋。', keyWords: ['news', 'won', 'championship'], grammarHighlight: 'that... [同位语从句，解释news的内容]' },
      { sentence: 'He made a promise that he would help us.', translation: '他承诺他会帮助我们。', keyWords: ['promise', 'help', 'would'], grammarHighlight: 'that... [同位语从句，解释promise的内容]' },
    ],
    commonMistakes: [
      { mistake: 'The news which he told us was false.', correct: 'The news (that) he told us was false. / The news he told us was false.', reason: '定语从句that作宾语可省；同位语从句that不省' },
    ],
    textbookRef: '选择性必修三 U5',
    difficulty: 4,
    examType: ['语法填空（高频易混点）'],
    examWeight: 22,
  },
  {
    id: 'stage5-09',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '名词性从句',
    name: '名词性从句综合辨析',
    structure: {
      formula: 'that vs what/whatever | whether vs if | when/where/why/how',
      components: [
        'that：只起连接作用，不作成分',
        'what：既连接又在从句中作主语/宾语/表语 = the thing(s) that',
        'whether：是否（不能被替代）',
        'if：是否（只用于宾语从句，有局限性）',
      ],
    },
    explanation: {
      simple: '名词性从句辨析的核心是"连接词是否在从句中作成分"——作成分用what，不作成分用that。',
      detailed: '名词性从句辨析是高考最高频考点之一。关键辨析：1）that vs what：that不在从句中作成分，what = the thing(s) that；2）whether vs if：whether可用于所有名词性从句，if仅用于宾语从句；3）whatever/whoever = anyone/things that，比what/who语气更强；4）when/where/how在名词性从句中作状语。',
      analogy: '"我知道他在哪"——where在从句中作地点状语；"我知道他要什么"——what在从句中作want的宾语。',
    },
    examPoints: [
      { point: 'that vs what', example: 'What you said is important. vs That you said something is not important.', frequency: 5 },
      { point: 'whether vs if', example: 'I don\'t know if/whether he will come. / The question is whether he will come.', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'Whatever/No matter what...', meaning: '无论什么...', example: 'Whatever you say, I won\'t believe it.' },
      { pattern: 'Whoever/No matter who...', meaning: '无论谁...', example: 'Whoever comes first will get the prize.' },
    ],
    examples: [
      { sentence: 'What made me angry was that he didn\'t apologize.', translation: '让我生气的是他没有道歉。', keyWords: ['angry', 'apologize', 'didn\'t'], grammarHighlight: 'What... [主语从句] + that... [表语从句]' },
      { sentence: 'I will give the book to whoever wants it.', translation: '我把书给任何想要它的人。', keyWords: ['book', 'whoever', 'wants'], grammarHighlight: 'whoever [主语，在从句中作主语]' },
    ],
    commonMistakes: [
      { mistake: 'I doubt that he is honest.', correct: 'I doubt whether/if he is honest.', reason: 'doubt后用whether/if（怀疑），肯定句用whether' },
    ],
    textbookRef: '选择性必修四 U5',
    difficulty: 4,
    examType: ['语法填空', '完形填空'],
    examWeight: 22,
  },
  {
    id: 'stage5-10',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '状语从句',
    name: '让步状语从句',
    structure: {
      formula: 'Although/Though/While/Even if/Even though/No matter wh-/Wh-ever + 主谓',
      components: [
        'although/though/while = 虽然',
        'even if/even though = 即使',
        'no matter what/who/how... = 无论什么/谁/如何...',
        'whatever/whoever... = 无论什么/谁...（= no matter what/who...）',
      ],
    },
    explanation: {
      simple: '让步状语从句就是"虽然...但是..."——承认一个事实，转入另一个事实。',
      detailed: '让步状语从句表示"虽然/即使..."。although/though/while引导时，主句前不能用but（但可用副词still/yet）。even if/even though表示假设性让步。no matter what/who...和whatever/whoever...可互换。although/though引导时可用倒装（though/although+adj/n.+主语+be）。',
      analogy: '"虽然下雨了，但是我们还是去了"——让步就是"退一步说"。',
    },
    examPoints: [
      { point: 'although/though + 主语 + V... (主句)', example: 'Although it was raining, we went out.', frequency: 5 },
      { point: 'although不能与but连用', example: 'Although he is rich, but he is not happy. (错误) / Although he is rich, he is not happy. (正确)', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'Child/Young as he is...', meaning: '虽然他是个孩子', example: 'Child as he is, he knows a lot.' },
      { pattern: 'Try/Do what he might...', meaning: '无论他怎么尝试', example: 'Try as he might, he couldn\'t solve the problem.' },
    ],
    examples: [
      { sentence: 'Although he was exhausted, he continued working.', translation: '虽然他精疲力竭，但他继续工作。', keyWords: ['exhausted', 'continued', 'working'], grammarHighlight: 'Although... [让步状语从句]' },
      { sentence: 'Whatever you may say, I won\'t change my mind.', translation: '无论你说什么，我都不会改变主意。', keyWords: ['whatever', 'change', 'mind'], grammarHighlight: 'Whatever... [让步状语从句]' },
    ],
    commonMistakes: [
      { mistake: 'Although he is rich, but he is not happy.', correct: 'Although he is rich, he is not happy.', reason: 'although和but不能同时用' },
      { mistake: 'No matter what he says, but I don\'t believe.', correct: 'No matter what he says, I don\'t believe.', reason: 'no matter what不能与but连用' },
    ],
    textbookRef: '选择性必修二 U6',
    difficulty: 3,
    examType: ['语法填空', '写作'],
    examWeight: 18,
  },
  {
    id: 'stage5-11',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '状语从句',
    name: '条件状语从句 & 方式状语从句',
    structure: {
      formula: 'if/unless/as long as/provided that + 主谓（条件）| as/as if/as though + 主谓（方式）',
      components: [
        'if：如果（主将从现）',
        'unless = if not（除非）',
        'as long as / provided (that) = 只要',
        'as：随着/当...时（方式/时间）',
        'as if / as though：好像/似乎',
      ],
    },
    explanation: {
      simple: '条件从句说"如果...就..."，方式从句说"像...一样"。',
      detailed: '条件状语从句：if（如果），unless（除非=if not），as long as/provided (that)（只要），on condition that（在...条件下）。条件从句用现在时表将来（主将从现）。方式状语从句：as（随着；像...一样），as if/as though（好像/似乎——用虚拟语气时与现在相反用一般过去时）。',
      analogy: '"如果你努力，你就会成功"（条件）vs"他走得像往常一样慢"（方式）。',
    },
    examPoints: [
      { point: 'unless = if not', example: 'Unless you try harder, you won\'t succeed. = If you don\'t try harder...', frequency: 5 },
      { point: '主将从现', example: 'If it rains tomorrow, I will stay home.', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'as long as / so long as + 主谓', meaning: '只要...', example: 'As long as you study hard, you will succeed.' },
      { pattern: 'provided (that) / on condition that...', meaning: '只要/在...条件下', example: 'You can borrow my book provided that you return it on time.' },
      { pattern: 'as if / as though + 主语 + did/were', meaning: '好像/似乎...', example: 'He speaks as if he knew everything.' },
    ],
    examples: [
      { sentence: 'You will fail unless you study harder.', translation: '除非你更努力学习，否则你会考试不及格。', keyWords: ['fail', 'unless', 'study'], grammarHighlight: 'unless [除非/如果不]' },
      { sentence: 'He speaks as if he were a professor.', translation: '他说起话来就好像是个教授。', keyWords: ['speaks', 'professor', 'were'], grammarHighlight: 'as if...were [虚拟语气/与现在相反]' },
    ],
    commonMistakes: [
      { mistake: 'I will call you if I will arrive.', correct: 'I will call you if I arrive.', reason: '条件状语从句用现在时表将来' },
      { mistake: 'As if he knows everything.', correct: 'As if he knew everything. / He acts as if he knew everything.', reason: 'as if后接虚拟语气（与现在相反用过去时）' },
    ],
    textbookRef: '选择性必修四 U3',
    difficulty: 3,
    examType: ['语法填空'],
    examWeight: 15,
  },
  {
    id: 'stage5-12',
    stage: 5,
    stageName: '阶段五：三大从句',
    category: '状语从句',
    name: '三大从句综合辨析',
    structure: {
      formula: '定语从句 vs 名词性从句 vs 状语从句',
      components: [
        '定语从句：修饰名词，有先行词，位置紧跟名词',
        '名词性从句：在句中担当主语/宾语/表语/同位语',
        '状语从句：修饰动词/形容词/副词，说明时间/原因/条件等',
      ],
    },
    explanation: {
      simple: '判断从句类型的核心是"它在句中做什么"——修饰名词=定语，担当主语/宾语/表语=名词性，其他=状语。',
      detailed: '三大从句综合辨析是高考核心能力。判断步骤：1）找先行词（定语从句）or判断功能（名词性）；2）看连接词——that/whether/if/wh-词可引导名词性从句；关系代词/副词引导定语从句；because/although/if等引导状语从句；3）看位置——紧跟名词是定语从句，在句首或动宾后是主语/宾语从句。',
      analogy: '判断从句类型就像问："这个句子中的这个从句在做什么？"——修饰名词是定语，代替名词位置是名词性，描述背景（时间/原因等）是状语。',
    },
    examPoints: [
      { point: '综合判断从句类型', example: 'This is the factory where we worked. (定语) vs This is where we worked. (表语/名词性)', frequency: 5 },
      { point: '名词性从句中that与which/what的选择', example: 'The fact is that he is right. vs The fact is which one he prefers.', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'the way (in which / that) = how', meaning: '...的方式', example: 'I don\'t like the way (in which / that / /) he talks.' },
    ],
    examples: [
      { sentence: 'The reason (why / /) he was late was that he missed the bus.', translation: '他迟到的原因是他没赶上车。', keyWords: ['reason', 'late', 'missed'], grammarHighlight: 'why/that... [定语] + that... [表语]' },
      { sentence: 'Where we will hold the meeting has not been decided yet.', translation: '我们在哪里开会还没决定。', keyWords: ['hold', 'meeting', 'decided'], grammarHighlight: 'Where... [主语从句]' },
    ],
    commonMistakes: [
      { mistake: 'This is the reason because he came late.', correct: 'This is the reason why he came late. / The reason is that he came late.', reason: 'reason后用why引导定语从句，或用that引导表语从句，不能用because' },
    ],
    textbookRef: '综合复习',
    difficulty: 5,
    examType: ['语法填空（核心能力）'],
    examWeight: 28,
  },
];

// ===================== 阶段六：情态动词 =====================
const STAGE6_POINTS: GrammarPoint[] = [
  {
    id: 'stage6-01',
    stage: 6,
    stageName: '阶段六：情态动词',
    category: '情态动词',
    name: '情态动词基本用法',
    structure: {
      formula: 'can/could | may/might | must | shall/should | will/would | need | dare',
      components: [
        'can：能力/可能性/许可（could为过去式/委婉）',
        'may/might：许可/可能性（might为过去式/更委婉）',
        'must：必须/肯定推测',
        'should：应该/建议',
        'will/would：意愿/将来/过去习惯（would更委婉）',
        'need：需要（情态动词/实义动词）',
        'dare：敢（情态动词/实义动词）',
      ],
    },
    explanation: {
      simple: '情态动词就是给动词加上"语气"——能/可能/必须/应该。',
      detailed: '情态动词是高考完形填空的高频考点。核心辨析：can\'t（不可能）vs may not（可能不）；must（一定/必须）vs have to（不得不/客观）；should（应该/建议）vs ought to；will（意愿/将来倾向）vs would（过去意愿/委婉）。mustn\'t（禁止）和don\'t have to（不必要）的区别也是高频考点。',
      analogy: '"你会弹钢琴吗？"（can——能力）；"你可以走了"（may——许可）；"你必须做作业"（must——必须）。',
    },
    examPoints: [
      { point: 'can\'t vs may not', example: 'He can\'t be at home. (他不可能在家) vs He may not be at home. (他可能不在家)', frequency: 5 },
      { point: 'must vs have to', example: 'You must finish it today (主观要求) vs I have to go now (客观需要)', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'can\'t help doing = can\'t help but do', meaning: '忍不住...', example: 'I can\'t help laughing when I hear this joke.' },
      { pattern: 'can\'t wait to do', meaning: '迫不及待做...', example: 'I can\'t wait to see you again.' },
      { pattern: 'may/might as well do = had better do', meaning: '不如...', example: 'You might as well go home now.' },
      { pattern: 'May + 主语 + V...!', meaning: '祝...', example: 'May you succeed in your new job!' },
    ],
    examples: [
      { sentence: 'You must finish the assignment before the deadline.', translation: '你必须在截止日期前完成作业。', keyWords: ['must', 'finish', 'deadline'], grammarHighlight: 'must [必须]' },
      { sentence: 'It can\'t be John. He is in Beijing now.', translation: '不可能是约翰。他现在在北京。', keyWords: ['can\'t', 'John', 'Beijing'], grammarHighlight: 'can\'t be [否定推测/不可能]' },
    ],
    commonMistakes: [
      { mistake: 'You mustn\'t leave now. You can leave now.', correct: 'You mustn\'t leave now. (禁止) / You don\'t have to leave now. (不必要)', reason: 'mustn\'t是禁止，don\'t have to才是不必' },
    ],
    textbookRef: '必修二 U1-U2',
    difficulty: 3,
    examType: ['完形填空'],
    examWeight: 18,
  },
  {
    id: 'stage6-02',
    stage: 6,
    stageName: '阶段六：情态动词',
    category: '情态动词',
    name: '情态动词 + have done（表对过去的推测）',
    structure: {
      formula: 'must have done | can\'t have done | may/might have done | should/ought to have done | needn\'t have done',
      components: [
        'must have done：一定已经...（肯定推测）',
        'can\'t have done：不可能已经...（否定推测）',
        'may/might have done：可能已经...（不确定推测）',
        'should/ought to have done：本应该做（却没做）',
        'needn\'t have done：本不必做（却做了）',
        'could have done：本可以做（却没做）',
      ],
    },
    explanation: {
      simple: '"情态动词+have done"是对过去情况的推测或评价——"一定/不可能/应该/本不必..."。',
      detailed: '这是高考完形填空和语法填空的高频考点。must have done表示对过去的肯定推测（"一定已经..."）；can\'t have done表示否定推测（"不可能已经..."）；may/might have done表示不确定推测（"可能已经..."）；should have done表示"本应该做但实际没做"；needn\'t have done表示"本不必做但实际做了"。',
      analogy: '"他一定已经回家了"——must have gone home——对过去的肯定推测。',
    },
    examPoints: [
      { point: 'must have done vs can\'t have done', example: 'He must have studied hard. (一定努力学习过) vs He can\'t have cheated. (不可能作弊)', frequency: 5 },
      { point: 'should have done vs needn\'t have done', example: 'You should have apologized. (本应该道歉但没道) vs You needn\'t have brought so much food. (本不必带这么多但带了)', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'must have done（肯定推测）', meaning: '一定已经...', example: 'It must have rained last night because the ground is wet.' },
      { pattern: 'can\'t have done（否定推测）', meaning: '不可能已经...', example: 'He can\'t have stolen the money; he was with me all day.' },
      { pattern: 'should/ought to have done（本应该做但没做）', meaning: '本应该...', example: 'You should have told me the truth earlier.' },
      { pattern: 'needn\'t have done（不必做却做了）', meaning: '本不必...', example: 'I needn\'t have worried about the exam.' },
    ],
    examples: [
      { sentence: 'It must have rained last night because the ground is wet.', translation: '昨晚一定下过雨，因为地面是湿的。', keyWords: ['rained', 'ground', 'wet'], grammarHighlight: 'must have rained [对过去的肯定推测]' },
      { sentence: 'You should have apologized to her for being late.', translation: '你本应该因为迟到向她道歉的。', keyWords: ['apologized', 'late', 'should'], grammarHighlight: 'should have apologized [本应该但没做]' },
    ],
    commonMistakes: [
      { mistake: 'He must have gone home, can\'t he?', correct: 'He must have gone home, hasn\'t he?', reason: 'must have done的反意疑问与must的时间一致' },
      { mistake: 'I needn\'t have watered the flowers. It rained.', correct: 'I needn\'t have watered the flowers because it rained.', reason: 'needn\'t have done指已做了但本不必做（结果已发生）' },
    ],
    textbookRef: '选择性必修四 U6',
    difficulty: 4,
    examType: ['语法填空', '完形填空（高频）'],
    examWeight: 22,
  },
];

// ===================== 阶段七：特殊句式 =====================
const STAGE7_POINTS: GrammarPoint[] = [
  {
    id: 'stage7-01',
    stage: 7,
    stageName: '阶段七：特殊句式',
    category: '特殊句式',
    name: '省略',
    structure: {
      formula: '简单句省略 | 并列句省略 | 复合句省略 | 条件句省略if',
      components: [
        '简单句省略：省略主语、谓语等',
        '并列句省略：相同成分省略',
        '复合句省略：than, as, if等引导的省略',
        '条件句：If necessary/possible/so...',
      ],
    },
    explanation: {
      simple: '省略就是"能省则省"——只要不会造成误解，能省的词就省掉。',
      detailed: '省略是为了避免重复，使语言更简洁。1）简单句中的省略：It doesn\'t matter.; Nice to meet you. 2）并列句中的省略：I like English and she (likes English) too. 3）than/as引导的比较状语从句：He is taller than I (am). 4）if引导的条件从句：If possible, call me.; If not, let me know.',
      analogy: '就像中文说"吃了吗？"——省略了主语"你"和谓语"饭"，但意思清楚。',
    },
    examPoints: [
      { point: 'than/as引导的省略', example: 'He works harder than I (work).', frequency: 4 },
      { point: '条件句中if的省略', example: 'If possible, come tomorrow. = If it is possible, come tomorrow.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'If possible/necessary/convenient...', meaning: '如果可能/必要/方便的话', example: 'If possible, I would like to meet you tomorrow.' },
      { pattern: 'than/as + 主语 + be/do', meaning: '比/如...', example: 'He is taller than I am.' },
      { pattern: 'So + be/助动词/情态动词 + 主语（倒装）', meaning: '...也是', example: 'I like English. So does she.' },
    ],
    examples: [
      { sentence: 'He speaks English better than I (do).', translation: '他说英语比我说得好。', keyWords: ['better', 'do', 'than'], grammarHighlight: 'than I do [省略谓语]' },
      { sentence: 'If necessary, call me at once.', translation: '如果有必要的话，立刻给我打电话。', keyWords: ['necessary', 'call', 'once'], grammarHighlight: 'If necessary [条件句省略]' },
    ],
    commonMistakes: [
      { mistake: 'He is taller than me.', correct: 'He is taller than I (am).', reason: 'than后是比较状语从句，省略了主语I和be动词am' },
    ],
    textbookRef: '必修三 U6',
    difficulty: 2,
    examType: ['语法填空', '写作简洁性'],
    examWeight: 12,
  },
  {
    id: 'stage7-02',
    stage: 7,
    stageName: '阶段七：特殊句式',
    category: '特殊句式',
    name: 'it作形式主语/形式宾语',
    structure: {
      formula: 'It is + adj/n. + to do/that...（形式主语） | V + it + adj/n. + to do/that...（形式宾语）',
      components: [
        'It is + adj + to do（形式主语）',
        'It is + that + 主语从句（形式主语）',
        'V + it + adj + to do（形式宾语）',
        '常见it句型：It is said/believed/reported that...',
      ],
    },
    explanation: {
      simple: 'it作形式主语就是"用it顶替后面那个长长的真主语"，让句子更稳当。',
      detailed: 'it作形式主语和形式宾语是英语中非常常见的句型。形式主语：It is + adj/n. + to do/that...；It is + p.p. + that...。形式宾语：动词 + it + adj/n. + to do/that...，如find it difficult to learn, make it possible to...。常用it句型：It is said/believed/reported/known/ thought that...；It takes (sb) + 时间 + to do；It is no use/good doing.',
      analogy: '"学英语很重要"变成"It is important to learn English"——it就像一个"占位符"，把真正的主语to learn English"顶替"到后面去。',
    },
    examPoints: [
      { point: 'It is said/believed/reported that...', example: 'It is said that he has returned to his hometown.', frequency: 5 },
      { point: 'V + it + adj + to do（形式宾语）', example: 'I find it interesting to learn English.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'It is said/believed/reported that...', meaning: '据说/人们认为/据报道', example: 'It is reported that a new school will be built next year.' },
      { pattern: 'It is no use/good doing', meaning: '做...是没用的', example: 'It is no use crying over spilled milk.' },
      { pattern: 'It is (high) time that + 主语 + did/were', meaning: '早该...了', example: 'It is high time that we took action.' },
      { pattern: 'It is up to sb to do', meaning: '由某人决定做...', example: 'It is up to you to decide where to go.' },
    ],
    examples: [
      { sentence: 'It is necessary to learn a foreign language in today\'s world.', translation: '在当今世界，学一门外语是必要的。', keyWords: ['necessary', 'language', 'world'], grammarHighlight: 'It is necessary to... [形式主语]' },
      { sentence: 'We find it challenging to master a new language.', translation: '我们觉得掌握一门新语言很有挑战性。', keyWords: ['challenging', 'master', 'language'], grammarHighlight: 'it [形式宾语] to master' },
    ],
    commonMistakes: [
      { mistake: 'To learn English is important. (太长)', correct: 'It is important to learn English.', reason: '不定式主语太长时，用it作形式主语' },
    ],
    textbookRef: '选择性必修二 U4-U5',
    difficulty: 3,
    examType: ['写作加分（必备句型）'],
    examWeight: 20,
  },
  {
    id: 'stage7-03',
    stage: 7,
    stageName: '阶段七：特殊句式',
    category: '特殊句式',
    name: '主谓一致',
    structure: {
      formula: '语法一致 | 意义一致 | 就近一致',
      components: [
        '语法一致：主语单数→谓语单数',
        '意义一致：集体名词表单数概念→谓语单数',
        '就近一致：either...or.../neither...nor.../not only...but also...→谓语与最近主语一致',
      ],
    },
    explanation: {
      simple: '主谓一致就是谓语动词的形式要和主语"配合好"——单数配单数，复数配复数。',
      detailed: '主谓一致的三个原则：1）语法一致：主语形式决定谓语形式；2）意义一致：主语表单数概念（family, class, team等）→谓语单数（整体）或复数（成员）；3）就近一致：either...or..., neither...nor..., not only...but also...，谓语与最近的主语一致。特别注意：a number of + 复数名词 → 复数谓语；the number of + 复数名词 → 单数谓语。',
      analogy: '就像中文"一只猫在跑"用is，"两只猫在跑"用are——英语的主谓也要"匹配"。',
    },
    examPoints: [
      { point: '就近一致', example: 'Neither you nor I am right.', frequency: 5 },
      { point: 'a number of vs the number of', example: 'A number of students are absent. / The number of students is 2000.', frequency: 5 },
      { point: '集体名词谓语选择', example: 'The family is large. / The family are all teachers.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'A number of / Numbers of + 复数名词 → 复数谓语', meaning: '许多...', example: 'A number of students have applied for the scholarship.' },
      { pattern: 'The number of + 复数名词 → 单数谓语', meaning: '...的数量', example: 'The number of people attending the meeting is 500.' },
      { pattern: 'more than one + 单数名词 → 单数谓语', meaning: '不只一个...', example: 'More than one student has made the same mistake.' },
    ],
    examples: [
      { sentence: 'Either you or he is wrong.', translation: '不是你错就是他错。', keyWords: ['wrong', 'either', 'either'], grammarHighlight: 'is wrong [就近一致，he是最近主语]' },
      { sentence: 'The police are investigating the case.', translation: '警察正在调查这个案件。', keyWords: ['police', 'investigating', 'case'], grammarHighlight: 'The police [集体名词表单复数]' },
    ],
    commonMistakes: [
      { mistake: 'The news are good today.', correct: 'The news is good today.', reason: 'news是不可数名词，谓语用单数' },
      { mistake: 'Each of the students have a dictionary.', correct: 'Each of the students has a dictionary.', reason: 'Each of + 复数名词/代词，谓语用单数' },
    ],
    textbookRef: '选择性必修三 U3-U4',
    difficulty: 3,
    examType: ['语法填空'],
    examWeight: 15,
  },
  {
    id: 'stage7-04',
    stage: 7,
    stageName: '阶段七：特殊句式',
    category: '特殊句式',
    name: '特殊倒装',
    structure: {
      formula: 'Only + 状语 + 部分倒装 | 否定词/否定结构 + 部分倒装',
      components: [
        'Only + 状语（副词/介词短语/从句）+ 部分倒装',
        '否定词/否定结构：Never/Hardly/Seldom/Rarely + 倒装',
        '否定词连用：Not only...but also... + 倒装',
        'Hardly/Scarcely...when... / No sooner...than...',
      ],
    },
    explanation: {
      simple: '倒装就是把谓语（或助动词）提前——当"只有..."或"否定..."时用倒装，制造强调效果。',
      detailed: '倒装分完全倒装（谓语全部提前）和部分倒装（助动词/情态动词提前）。部分倒装规则：1）Only + 状语提前时，主句倒装；2）否定词（never, hardly, rarely, seldom, little, no sooner）提前时倒装；3）Not only...but also...连接句子时，Not only开头要倒装；4）Hardly/Scarcely...when...和No sooner...than...中，主句倒装。',
      analogy: '"只有这样你才能成功"——Only in this way can you succeed，倒装让句子更有力量。',
    },
    examPoints: [
      { point: 'Only + 状语提前部分倒装', example: 'Only then did I realize my mistake.', frequency: 5 },
      { point: '否定词提前部分倒装', example: 'Never have I seen such a beautiful sunset.', frequency: 5 },
      { point: 'Not only...but also...倒装', example: 'Not only did he finish the work, but he also helped others.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'Hardly/Scarcely had + S + done when + 主句', meaning: '一...就...', example: 'Hardly had I sat down when the phone rang.' },
      { pattern: 'No sooner had + S + done than + 主句', meaning: '一...就...', example: 'No sooner had I arrived than the rain started.' },
      { pattern: 'Not only had + S + done, but also...', meaning: '不仅...而且...', example: 'Not only had he studied hard, but he also helped others.' },
    ],
    examples: [
      { sentence: 'Never have I heard such a wonderful speech.', translation: '我从未听过如此精彩的演讲。', keyWords: ['heard', 'wonderful', 'speech'], grammarHighlight: 'Never have I heard [否定词提前部分倒装]' },
      { sentence: 'Only in this way can you improve your English.', translation: '只有用这种方法你才能提高英语。', keyWords: ['improve', 'way', 'English'], grammarHighlight: 'Only in this way...can you [Only+状语提前部分倒装]' },
    ],
    commonMistakes: [
      { mistake: 'Only when he came, I left.', correct: 'Only when he came did I leave.', reason: 'Only+状语从句不倒装，主句要倒装' },
      { mistake: 'Never I have seen it.', correct: 'Never have I seen it.', reason: '否定词提前要部分倒装' },
    ],
    textbookRef: '选择性必修三 U1',
    difficulty: 4,
    examType: ['语法填空', '写作加分'],
    examWeight: 18,
  },
  {
    id: 'stage7-05',
    stage: 7,
    stageName: '阶段七：特殊句式',
    category: '特殊句式',
    name: '强调句',
    structure: {
      formula: 'It is/was + 被强调部分 + that/who + 句子其他部分',
      components: [
        'It is...that...是最常用的强调句结构',
        '强调人时可用who（也可用that）',
        '强调时间/地点/原因时也用that（不用when/where/why）',
        '判断方法：去掉It is/was...that...，句子仍然完整',
      ],
    },
    explanation: {
      simple: '强调句就是"是...的"结构——用It is/was...that...把你想强调的部分提到最前面。',
      detailed: '强调句结构：It is/was + 被强调部分 + that/who + 句子其他部分。可以强调除谓语外的所有成分（主语、宾语、状语等）。强调人时可用who或that；强调时间/地点/原因时也用that，不用when/where/why。判断是否为强调句的方法：去掉It is/was...that...后，句子仍然完整且意思不变。注意：not until的强调句要写成It was not until...that...。',
      analogy: '"是在北京，不是在上海，我遇见了他"——用强调句把"在北京"这个地点强调出来。',
    },
    examPoints: [
      { point: '强调句基本结构', example: 'It was in Beijing that I met her.', frequency: 5 },
      { point: '强调句的特殊疑问句', example: 'Who was it that broke the window?', frequency: 4 },
      { point: 'not until的强调', example: 'It was not until midnight that he finished his homework.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'It is/was not until...that...', meaning: '直到...才...', example: 'It was not until I lost my health that I realized its value.' },
      { pattern: 'It is/was + because + that...', meaning: '正是因为...', example: 'It was because she studied hard that she succeeded.' },
    ],
    examples: [
      { sentence: 'It was in the park that I met your sister.', translation: '正是在公园里，我遇到了你的姐姐。', keyWords: ['park', 'met', 'sister'], grammarHighlight: 'It was...that [强调地点]' },
      { sentence: 'It was not until he failed that he realized his mistakes.', translation: '直到他失败了，他才意识到自己的错误。', keyWords: ['failed', 'realized', 'mistakes'], grammarHighlight: 'It was not until...that [强调not until]' },
    ],
    commonMistakes: [
      { mistake: 'It was in Beijing where I met her.', correct: 'It was in Beijing that I met her.', reason: '强调句即使强调地点也用that，不用where' },
      { mistake: 'It is I who am wrong.', correct: 'It is I who am wrong. / It is me who is wrong.', reason: '强调句be动词与原句一致' },
    ],
    textbookRef: '各册均有涉及',
    difficulty: 3,
    examType: ['语法填空', '写作加分'],
    examWeight: 18,
  },
];

// ===================== 阶段八：虚拟语气（难度最高考点） =====================
const STAGE8_POINTS: GrammarPoint[] = [
  {
    id: 'stage8-01',
    stage: 8,
    stageName: '阶段八：虚拟语气',
    category: '虚拟语气',
    name: '虚拟条件句（与现在事实相反）',
    structure: {
      formula: 'If + 主语 + were/did, 主语 + would/could/might + do',
      components: [
        '与现在事实相反：if + were/did, would do',
        'were可以用于所有人称（if I were = if he was，但were更正式）',
        'were to do和should do也可用于与将来相反',
      ],
    },
    explanation: {
      simple: '虚拟语气就是"假设"——与现在事实相反的假设，用一般过去时表示。',
      detailed: '虚拟条件句表达与事实相反的假设。与现在事实相反：if + were/did → would/could/might + do。注意：be动词在虚拟语气中用were（可用于所有人称）。if I were you = 如果我是你（与现在不符）。were to do和should do也可用于表示与将来事实相反的可能性很小的情况。',
      analogy: '"如果我是你，我就接受这个工作"——实际上我不是你，这是假设。',
    },
    examPoints: [
      { point: 'if + were/did → would do', example: 'If I were you, I would accept the offer.', frequency: 5 },
      { point: 'were to do表示可能性极小的将来', example: 'If you were to succeed, everything would change.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'If I were you...', meaning: '如果我是你...（最常用虚拟语气）', example: 'If I were you, I would take this job.' },
      { pattern: 'If it weren\'t for / But for + n...., ...would...', meaning: '要不是...', example: 'But for your help, I would have failed.' },
    ],
    examples: [
      { sentence: 'If I were rich, I would travel around the world.', translation: '如果我有钱（但我没有），我会环游世界。', keyWords: ['rich', 'travel', 'world'], grammarHighlight: 'If I were...would... [与现在相反]' },
      { sentence: 'Were I you, I would take this job.', translation: '如果我是你，我会接受这份工作。', keyWords: ['were', 'take', 'job'], grammarHighlight: 'Were I you [if省略倒装]' },
    ],
    commonMistakes: [
      { mistake: 'If I was you, I would accept.', correct: 'If I were you, I would accept.', reason: '虚拟语气中be动词一律用were' },
    ],
    textbookRef: '高三系统复习',
    difficulty: 4,
    examType: ['语法填空', '写作'],
    examWeight: 18,
  },
  {
    id: 'stage8-02',
    stage: 8,
    stageName: '阶段八：虚拟语气',
    category: '虚拟语气',
    name: '虚拟条件句（与过去事实相反）',
    structure: {
      formula: 'If + 主语 + had + done, 主语 + would/could/might + have + done',
      components: [
        '与过去事实相反：if + had done → would have done',
        '表示"本应该做但实际没做"',
      ],
    },
    explanation: {
      simple: '与过去事实相反的虚拟语气——"如果当时...，我早就..."，用过去完成时表示。',
      detailed: '与过去事实相反的虚拟语气：if + had done → would/could/might + have done。表示"本应该/本可以/本想...但实际上没有"。if省略时，把had提前构成倒装（Had I known...）。',
      analogy: '"如果我昨天早一点到，我就见到他了"——实际上昨天没见到。',
    },
    examPoints: [
      { point: 'if + had done → would have done', example: 'If I had known your phone number, I would have called you.', frequency: 5 },
      { point: 'if省略倒装', example: 'Had I known earlier, I would have helped.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'Had + S + done...', meaning: '如果...的话（省略if）', example: 'Had I seen the accident, I would have helped.' },
      { pattern: 'If only + 主语 + had done...!', meaning: '要是...就好了！（但没有）', example: 'If only I had studied harder!' },
    ],
    examples: [
      { sentence: 'If I had known your phone number, I would have called you.', translation: '如果我知道你的电话号码（但我不知道），我就给你打电话了（但没打）。', keyWords: ['known', 'called', 'would'], grammarHighlight: 'had known...would have called [与过去相反]' },
      { sentence: 'Had I arrived earlier, I would have met him.', translation: '如果我早一点到，我就见到他了。', keyWords: ['arrived', 'earlier', 'met'], grammarHighlight: 'Had I arrived [if倒装]' },
    ],
    commonMistakes: [
      { mistake: 'If I knew, I would have told you.', correct: 'If I had known, I would have told you.', reason: '与过去相反，从句用过去完成时' },
    ],
    textbookRef: '高三系统复习',
    difficulty: 4,
    examType: ['语法填空'],
    examWeight: 18,
  },
  {
    id: 'stage8-03',
    stage: 8,
    stageName: '阶段八：虚拟语气',
    category: '虚拟语气',
    name: '虚拟条件句（与将来事实相反）',
    structure: {
      formula: 'If + 主语 + were to do/should do, 主语 + would/could/might + do',
      components: [
        '与将来事实相反：if + were to do / should do',
        '可能性很小/几乎不可能',
        'would/could/might + do',
      ],
    },
    explanation: {
      simple: '与将来事实相反的虚拟语气——可能性很小的将来假设。',
      detailed: '与将来事实相反的虚拟语气（可能性很小）：if + were to do / should do → would/could/might + do。were to do表示"万一..."，语气更强；should do表示"万一...的话"，可以省略if提前should。',
      analogy: '"如果明天会下陨石雨（几乎不可能），我们该怎么办？"——这就是将来相反的虚拟。',
    },
    examPoints: [
      { point: 'if + were to do / should do → would do', example: 'If it were to rain tomorrow, I would stay at home.', frequency: 4 },
      { point: 'should提前省略if', example: 'Should it rain tomorrow, I would stay at home.', frequency: 3 },
    ],
    fixedCombinations: [
      { pattern: 'Were + 主语 + to do...', meaning: '万一...的话（省略if）', example: 'Were you to fail, what would you do?' },
      { pattern: 'Should + 主语 + do...', meaning: '万一...的话', example: 'Should you need help, call me.' },
    ],
    examples: [
      { sentence: 'If it were to snow tomorrow, the match would be cancelled.', translation: '万一明天下雪，比赛就会被取消。', keyWords: ['snow', 'match', 'cancelled'], grammarHighlight: 'were to snow [与将来相反]' },
    ],
    commonMistakes: [
      { mistake: 'If it would rain tomorrow, I would stay home.', correct: 'If it were to rain tomorrow, I would stay home.', reason: '与将来相反用were to do，不用would rain' },
    ],
    textbookRef: '高三系统复习',
    difficulty: 4,
    examType: ['语法填空'],
    examWeight: 15,
  },
  {
    id: 'stage8-04',
    stage: 8,
    stageName: '阶段八：虚拟语气',
    category: '虚拟语气',
    name: '虚拟语气特殊用法',
    structure: {
      formula: 'wish/as if/It\'s time/should do + 虚拟 | if省略倒装',
      components: [
        'wish + were/did（现在）/ had done（过去）/ would do（将来）',
        'as if/as though + were/did/had done',
        'It is (high) time that + did/were',
        'suggest/recommend/demand/propose/insist + (should) do',
        'if倒装：Had I known → Were I you → Should it rain',
      ],
    },
    explanation: {
      simple: '虚拟语气不只在if从句里——wish、as if、suggest等后也有虚拟。',
      detailed: '虚拟语气的特殊用法：1）wish后：与现在相反→were/did；与过去相反→had done；与将来相反→would do。2）as if/as though后：与现在/过去相反用相应的过去时态。3）It is time that后：用did/were。4）某些动词后的that从句用(should) do：suggest, recommend, demand, propose, insist, command, require等（坚持建议命令）。5）if省略倒装：Had/Were/Should提前。',
      analogy: '"我多希望我能回到过去"——wish后面用had done，因为是与过去相反的愿望。',
    },
    examPoints: [
      { point: 'wish + 虚拟语气', example: 'I wish I were taller. / I wish I had studied harder. / I wish you would come.', frequency: 5 },
      { point: 'suggest/recommend等+(should) do', example: 'I suggest that he (should) go at once.', frequency: 5 },
      { point: 'as if/as though + 虚拟', example: 'He speaks as if he knew everything.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'wish + were/did（与现在相反）', meaning: '希望...（但不是）', example: 'I wish I were a bird.' },
      { pattern: 'wish + had done（与过去相反）', meaning: '希望...过（但没有）', example: 'I wish I had taken your advice.' },
      { pattern: 'suggest/recommend/demand + (should) do', meaning: '建议/要求做...', example: 'I suggest that the meeting (should) be postponed.' },
      { pattern: 'It is (high) time that + did/were', meaning: '早该...了', example: 'It is high time that we took action.' },
    ],
    examples: [
      { sentence: 'I wish I had studied harder when I was in high school.', translation: '我真希望我高中时学习更努力些。（但没有）', keyWords: ['studied', 'harder', 'wish'], grammarHighlight: 'wish...had studied [与过去相反]' },
      { sentence: 'He speaks as if he were a professor.', translation: '他说起话来就好像是个教授。', keyWords: ['speaks', 'professor', 'were'], grammarHighlight: 'as if...were [虚拟语气/与现在相反]' },
    ],
    commonMistakes: [
      { mistake: 'I suggest that he goes right now.', correct: 'I suggest that he (should) go right now.', reason: 'suggest后that从句用(should) do' },
      { mistake: 'I wish I can fly.', correct: 'I wish I could fly.', reason: 'wish后与现在相反用一般过去时' },
    ],
    textbookRef: '选择性必修三 U1/U6',
    difficulty: 5,
    examType: ['语法填空（全题型覆盖）'],
    examWeight: 25,
  },
];

// ===================== 汇总导出 =====================

export const GRAMMAR_STAGES: GrammarStage[] = [
  { stage: 1, name: '阶段一：句法基础与词法', description: '五种基本句型 · 句子成分 · 构词法', points: STAGE1_POINTS },
  { stage: 2, name: '阶段二：时态体系', description: '8种核心时态 · 时态综合辨析', points: STAGE2_POINTS },
  { stage: 3, name: '阶段三：被动语态', description: '5种时态被动语态 · 综合复习', points: STAGE3_POINTS },
  { stage: 4, name: '阶段四：非谓语动词', description: '不定式 · 动名词 · 分词 · 核心辨析', points: STAGE4_POINTS },
  { stage: 5, name: '阶段五：三大从句', description: '定语从句 · 名词性从句 · 状语从句', points: STAGE5_POINTS },
  { stage: 6, name: '阶段六：情态动词', description: '基本用法 · have done推测', points: STAGE6_POINTS },
  { stage: 7, name: '阶段七：特殊句式', description: '省略 · it句型 · 主谓一致 · 倒装 · 强调', points: STAGE7_POINTS },
  { stage: 8, name: '阶段八：虚拟语气', description: '与现在/过去/将来相反 · 特殊用法', points: STAGE8_POINTS },
];

export const ALL_GRAMMAR_POINTS: GrammarPoint[] = GRAMMAR_STAGES.flatMap(s => s.points);

export const GRAMMAR_POINTS_BY_ID: Record<string, GrammarPoint> = Object.fromEntries(
  ALL_GRAMMAR_POINTS.map(p => [p.id, p])
);

// 高考考点权重速查表（按权重排序，基于文档第七章数据）
export const GRAMMAR_EXAM_FOCUS: { id: string; name: string; weight: number; category: string }[] =
  [...ALL_GRAMMAR_POINTS]
    .filter(p => p.examWeight !== undefined)
    .sort((a, b) => (b.examWeight || 0) - (a.examWeight || 0))
    .map(p => ({ id: p.id, name: p.name, weight: p.examWeight || 0, category: p.category }));

// 固定搭配总表
export const FIXED_EXPRESSIONS = [
  ...ALL_GRAMMAR_POINTS.flatMap(p => p.fixedCombinations.map(c => ({ ...c, grammarId: p.id }))),
];
