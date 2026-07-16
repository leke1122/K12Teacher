// 外研版高中英语语法自学路径清单
// 8个阶段 · 43个知识点 · 高考全覆盖
import type { GrammarPoint, GrammarStage } from '@/types/grammar';

// ===================== 阶段一：词法基础 =====================
const STAGE1_POINTS: GrammarPoint[] = [
  {
    id: 'stage1-01',
    stage: 1,
    stageName: '阶段一：词法基础',
    category: '词类',
    name: '名词的数与格',
    structure: {
      formula: '可数名词 + s/es | 不可数名词（无复数） | 所有格（\'s / of）',
      components: ['可数名词可单独使用，需加-s或-es', '不可数名词无复数形式', '所有格表示所属关系'],
    },
    explanation: {
      simple: '名词有两种形态：能数的一个变两个，不能数的就一个表示一类。',
      detailed: '名词分为可数名词和不可数名词。可数名词有单复数变化：一般加-s，以s/x/ch/sh/o结尾加-es，以辅音+y结尾改y为i加-es。不可数名词如water, information, advice没有复数形式。所有格有两种：\'s用于有生命的东西或时间距离等，of用于无生命的东西。',
      analogy: '就像中文里的"苹果"(可数)和"水"(不可数)，苹果可以一个、两个，水你不能说"一个水"。',
    },
    examPoints: [
      { point: '名词所有格辨析', example: 'my brother\'s book vs. a book of my brother', frequency: 5 },
      { point: '不可数名词的可数化表达', example: 'Two coffees, please. (两杯咖啡)', frequency: 4 },
      { point: '复合名词所有格', example: 'my mother-in-law\'s phone', frequency: 3 },
    ],
    fixedCombinations: [
      { pattern: 'a piece/piece of news/information/work/furniture', meaning: '一条/项/件', example: 'a piece of good news' },
      { pattern: 'Kinds/sorts/types of + 名词', meaning: '各种...', example: 'different kinds of flowers' },
      { pattern: 'with the help of', meaning: '在...帮助下', example: 'With the help of my teacher, I passed the exam.' },
    ],
    examples: [
      { sentence: 'There are many kinds of books in the library.', translation: '图书馆里有许多种类的书。', keyWords: ['kinds', 'library', 'many'], grammarHighlight: 'kinds of [复数名词]' },
      { sentence: 'She gave me a piece of advice on how to study English.', translation: '她给了我一条如何学英语的建议。', keyWords: ['advice', 'advice (不可数)', 'study'], grammarHighlight: 'a piece of advice [不可数名词量化]' },
      { sentence: 'This is my mother\'s phone, not my father\'s.', translation: '这是我妈妈的手机，不是我爸爸的。', keyWords: ['phone', 'mother\'s', 'father\'s'], grammarHighlight: '\'s 所有格' },
    ],
    commonMistakes: [
      { mistake: 'I bought many furnitures.', correct: 'I bought a piece of furniture.', reason: 'furniture是不可数名词，不能加-s' },
      { mistake: 'The window of the classroom is broken.', correct: 'The classroom\'s window is broken.', reason: '有生命的名词所有格用\'s' },
    ],
    textbookRef: '必修① Unit 1',
    difficulty: 2,
    examType: ['语法填空', '改错'],
    examWeight: 12,
  },
  {
    id: 'stage1-02',
    stage: 1,
    stageName: '阶段一：词法基础',
    category: '词类',
    name: '冠词',
    structure: {
      formula: 'a/an + 单数可数 | the + 特指/唯一/姓氏/乐器 | 零冠词',
      components: ['a用于辅音音素开头', 'an用于元音音素开头', 'the用于特指、唯一、姓氏、乐器', '零冠词用于复数、不可数、专有名词、学科等'],
    },
    explanation: {
      simple: '冠词就是"一个""这个"的小词，a/an表示泛指，the表示特指。',
      detailed: '英语中冠词分为不定冠词(a/an)、定冠词(the)和零冠词。不定冠词表示泛指，a用于辅音音素开头，an用于元音音素开头。定冠词the表示特指，用于上文已提及、独一无二的事物、形容词最高级/序数词前、乐器名称、西洋乐器等。零冠词用于复数名词、不可数名词、专有名词、三餐球类运动等。',
      analogy: '"a dog"像说"一只狗"（随便哪只），"the dog"像说"那只狗"（你们都知道是哪只）。',
    },
    examPoints: [
      { point: 'a vs an 发音判断', example: 'a university, an honest man, an hour', frequency: 5 },
      { point: 'the 唯一性', example: 'the sun, the moon, the earth', frequency: 5 },
      { point: '零冠词固定搭配', example: 'go to school, in hospital, at table', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'a/an + 单数名词（泛指）', meaning: '一个...', example: 'She is a teacher.' },
      { pattern: 'the + 姓氏复数（一家人）', meaning: '...一家人', example: 'The Browns are having dinner.' },
      { pattern: 'by the + 单位（按...计）', meaning: '按...计算', example: 'paid by the hour' },
      { pattern: 'go to school/hospital/prison/church', meaning: '去上学/医院/监狱/教堂', example: 'He went to school yesterday.' },
    ],
    examples: [
      { sentence: 'The teacher gave us a lot of homework.', translation: '老师给了我们很多作业。', keyWords: ['teacher', 'homework', 'lot'], grammarHighlight: 'the teacher [特指]; a lot of [大量]' },
      { sentence: 'She plays the piano every day.', translation: '她每天弹钢琴。', keyWords: ['plays', 'piano', 'every'], grammarHighlight: 'the + 乐器' },
      { sentence: 'An hour is too long to wait.', translation: '等一个小时太长了。', keyWords: ['hour', 'long', 'wait'], grammarHighlight: 'an [元音音素开头]' },
    ],
    commonMistakes: [
      { mistake: 'She is a university student.', correct: 'She is a university student. (u发ju:)', reason: 'university虽以u开头但发/ju:/音，是辅音音素' },
      { mistake: 'He went to the school to visit his teacher.', correct: 'He went to school to visit his teacher.', reason: 'go to school是固定搭配，表示"上学"' },
    ],
    textbookRef: '必修① Unit 2',
    difficulty: 2,
    examType: ['语法填空', '完形填空', '阅读'],
    examWeight: 15,
  },
  {
    id: 'stage1-03',
    stage: 1,
    stageName: '阶段一：词法基础',
    category: '词类',
    name: '代词',
    structure: {
      formula: '人称代词 | 物主代词 | 指示代词 | 疑问代词 | 不定代词 | 反身代词',
      components: ['人称代词: I/me, he/him, they/them', '物主代词: my/mine, your/yours', '指示代词: this/that, these/those', '疑问代词: who, whom, whose, which, what'],
    },
    explanation: {
      simple: '代词就是代替名词的小词，避免重复。',
      detailed: '代词分为人称代词（主格/宾格）、物主代词（形容词性/名词性）、指示代词（this/that, these/those）、疑问代词（5W1H）、不定代词（some/any/no/every及其合成词）、反身代词（myself/themselves等）。注意：形容词性物主代词后接名词，名词性物主代词单独使用。',
      analogy: '就像中文里说"那个人"而不重复说人名，代词帮我们避免重复。',
    },
    examPoints: [
      { point: '人称代词主宾格', example: 'It is I. vs. It is me.', frequency: 4 },
      { point: 'both/all/neither/none辨析', example: 'Both of them came. None of us knew.', frequency: 5 },
      { point: 'another/the other/others/the others', example: 'another book / the other book / other books / the others', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'one...the other', meaning: '一个...另一个', example: 'I have two books. One is English, the other is Chinese.' },
      { pattern: 'some...others', meaning: '一些...另一些', example: 'Some students like math, others prefer English.' },
      { pattern: 'each other / one another', meaning: '互相', example: 'We should help each other.' },
      { pattern: 'something wrong / nothing special', meaning: '某物/没什么特别的', example: 'There is something wrong with my computer.' },
    ],
    examples: [
      { sentence: 'Everyone should do their best to protect the environment.', translation: '每个人都应该尽自己所能保护环境。', keyWords: ['everyone', 'protect', 'environment'], grammarHighlight: 'their [泛指]' },
      { sentence: 'Neither of the two answers is correct.', translation: '两个答案都不对。', keyWords: ['neither', 'answers', 'correct'], grammarHighlight: 'Neither of + 复数，谓语单数' },
      { sentence: 'This is the very thing I need.', translation: '这正是我需要的东西。', keyWords: ['very', 'thing', 'need'], grammarHighlight: 'the very + 名词 [强调]' },
    ],
    commonMistakes: [
      { mistake: 'This is my own keys.', correct: 'These are my own keys.', reason: 'keys是复数，主语要匹配' },
      { mistake: 'Everyone should bring their book.', correct: 'Everyone should bring his/her book. / Everyone should bring their book.', reason: '传统语法要求his/her，现代用法接受their' },
    ],
    textbookRef: '必修① Unit 3',
    difficulty: 2,
    examType: ['语法填空', '完形填空'],
    examWeight: 14,
  },
  {
    id: 'stage1-04',
    stage: 1,
    stageName: '阶段一：词法基础',
    category: '词类',
    name: '数词',
    structure: {
      formula: '基数词 + hundred/thousand/million | 序数词（the + 数字th） | 分数/小数/百分数',
      components: ['hundred/thousand/million具体数字不加s', '加s+of表示数百/千等', '序数词前一般加the', '分数：分子基数分母序数，分子>1分母加s'],
    },
    explanation: {
      simple: '数词分基数词（多少）和序数词（第几）。',
      detailed: '基数词表示数量，注意hundred/thousand/million：与具体数字连用不加s，如five hundred；但表示概数加s+of，如hundreds of。序数词表示顺序，前面一般加the，如the first。分数表达：分子用基数词，分母用序数词，分子大于1分母加-s。百分数用percent或per cent。',
      analogy: '就像中文说"五百人"和"第五百个人"，英语规则类似。',
    },
    examPoints: [
      { point: 'hundreds of 概数用法', example: 'Hundreds of people attended the meeting.', frequency: 5 },
      { point: '分数表达', example: 'Two thirds of the students are girls.', frequency: 4 },
      { point: '序数词与冠词', example: 'the first time, for the first time', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'hundreds/thousands/millions of', meaning: '数百/千/百万...', example: 'Millions of tourists visit the city every year.' },
      { pattern: 'one in ten / one out of ten', meaning: '十分之一', example: 'One in ten students passed the exam.' },
      { pattern: 'a pair of / three pairs of', meaning: '一双/三双', example: 'I need a new pair of glasses.' },
      { pattern: 'in the 2020s / in the 21st century', meaning: '在2020年代/21世纪', example: 'Technology developed rapidly in the 2020s.' },
    ],
    examples: [
      { sentence: 'Three quarters of the earth\'s surface is covered with water.', translation: '地球表面四分之三被水覆盖。', keyWords: ['quarters', 'surface', 'covered'], grammarHighlight: 'Three quarters [分子>1，分母用复数]' },
      { sentence: 'About ninety percent of the population lives in cities.', translation: '大约90%的人口居住在城市。', keyWords: ['percent', 'population', 'cities'], grammarHighlight: 'percent + 单数谓语' },
      { sentence: 'The first time I met her, she was wearing a blue dress.', translation: '我第一次见她时，她穿着蓝色连衣裙。', keyWords: ['first', 'wearing', 'dress'], grammarHighlight: 'The first time [名词性连接词]' },
    ],
    commonMistakes: [
      { mistake: 'There are three hundreds students.', correct: 'There are three hundred students.', reason: '具体数字不加固化名词s' },
      { mistake: 'About 70 percent of the earth surface are water.', correct: 'About 70 percent of the earth\'s surface is water.', reason: 'percent + of + 名词，谓语与名词一致；earth唯一事物用\'s' },
    ],
    textbookRef: '必修② Unit 1',
    difficulty: 2,
    examType: ['阅读', '完形填空'],
    examWeight: 8,
  },
];

// ===================== 阶段二：时态与被动语态 =====================
const STAGE2_POINTS: GrammarPoint[] = [
  {
    id: 'stage2-01',
    stage: 2,
    stageName: '阶段二：时态与被动语态',
    category: '时态',
    name: '一般现在时',
    structure: {
      formula: 'S + V原形（单三V-s/es）',
      components: ['主语为单三时动词加-s或-es', '否定：don\'t/doesn\'t + V原形', '疑问：Do/Does + S + V原形', '时间状语：always, usually, every day'],
    },
    explanation: {
      simple: '一般现在时表示习惯性动作、普遍真理和现在状态。',
      detailed: '一般现在时表示经常性、习惯性动作（often, usually, every day），普遍真理（The sun rises in the east），以及当前的状态。主语为第三人称单数时，动词要加-s或-es。规则：一般加-s；以s/x/ch/sh/o结尾加-es；以辅音+y结尾改y为i加-es。',
      analogy: '就像说"我每天早上七点起床"——这是你长期的习惯，不是一次性的动作。',
    },
    examPoints: [
      { point: '第三人称单数动词变化', example: 'She watches TV every evening.', frequency: 5 },
      { point: '一般现在时表将来', example: 'The train leaves at 8 pm.', frequency: 4 },
      { point: '客观真理', example: 'Light travels faster than sound.', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'It is+形容词+to do sth', meaning: '做某事是...的', example: 'It is important to learn English well.' },
      { pattern: 'sb/sth is + adj + to do', meaning: '某人/事做...是...的', example: 'The book is easy to understand.' },
      { pattern: '主语+V原形（祈使句省略You）', meaning: '命令/请求', example: 'Sit down, please.' },
    ],
    examples: [
      { sentence: 'The earth moves around the sun.', translation: '地球绕着太阳转。', keyWords: ['earth', 'moves', 'sun'], grammarHighlight: 'moves [客观真理，第三人称单数]' },
      { sentence: 'Does she usually get up early on weekdays?', translation: '她平时工作日通常早起吗？', keyWords: ['usually', 'weekdays', 'early'], grammarHighlight: 'Does she get [疑问句]' },
      { sentence: 'Water boils at 100 degrees Celsius.', translation: '水在100摄氏度沸腾。', keyWords: ['boils', 'degrees', 'Celsius'], grammarHighlight: 'boils [科学事实]' },
    ],
    commonMistakes: [
      { mistake: 'He usually goes to school by bus.', correct: 'He usually goes to school by bus.', reason: 'by bus交通方式不加冠词' },
      { mistake: 'She don\'t like coffee.', correct: 'She doesn\'t like coffee.', reason: '第三人称单数用doesn\'t' },
    ],
    textbookRef: '必修① Unit 1',
    difficulty: 1,
    examType: ['语法填空', '短文改错', '写作'],
    examWeight: 18,
  },
  {
    id: 'stage2-02',
    stage: 2,
    stageName: '阶段二：时态与被动语态',
    category: '时态',
    name: '现在进行时',
    structure: {
      formula: 'S + am/is/are + V-ing',
      components: ['be动词现在式 + 动词ing', '现在分词构成：一般+ing，以e结尾去e+ing，重读闭音节双写尾字母+ing'],
    },
    explanation: {
      simple: '现在进行时表示说话时正在发生的动作。',
      detailed: '现在进行时表示说话时刻正在进行的动作，或现阶段持续的行为（常与these days, currently等连用）。也可表示将来的安排（常与go, come, leave, fly等动词连用）。特殊用法：always/constantly/never等+进行时，表示反复发生的动作，带感情色彩。',
      analogy: '就像"我现在正在吃饭"——强调正在进行的这个时刻。',
    },
    examPoints: [
      { point: '现在分词构成', example: 'make→making, write→writing, sit→sitting, run→running', frequency: 5 },
      { point: '与always等连用表情感', example: 'He is always coming late!', frequency: 4 },
      { point: '表将来的进行时', example: 'I am meeting John tomorrow.', frequency: 3 },
    ],
    fixedCombinations: [
      { pattern: 'be + V-ing + 时间状语', meaning: '正在...（具体时间）', example: 'I am reading a novel this evening.' },
      { pattern: 'What are you doing?', meaning: '你正在做什么？（询问正在进行的动作）', example: '—What are you doing? —I am cooking dinner.' },
      { pattern: 'can\'t be + V-ing', meaning: '不可能正在...', example: 'He can\'t be sleeping at this time.' },
    ],
    examples: [
      { sentence: 'Look! The children are playing in the garden.', translation: '看！孩子们正在花园里玩耍。', keyWords: ['children', 'playing', 'garden'], grammarHighlight: 'are playing [现在进行时]' },
      { sentence: 'The weather is getting colder and colder these days.', translation: '最近天气越来越冷了。', keyWords: ['weather', 'getting', 'colder'], grammarHighlight: 'is getting [现阶段持续]' },
      { sentence: 'He is always complaining about his job.', translation: '他总是抱怨他的工作。', keyWords: ['always', 'complaining', 'job'], grammarHighlight: 'is complaining [不满情绪]' },
    ],
    commonMistakes: [
      { mistake: 'I am read a book now.', correct: 'I am reading a book now.', reason: '现在进行时结构必须是be+ing' },
      { mistake: 'The teacher is not allow us to use phones.', correct: 'The teacher is not allowing us to use phones.', reason: '现在进行时需要动词ing形式' },
    ],
    textbookRef: '必修① Unit 2',
    difficulty: 1,
    examType: ['语法填空', '完形填空', '阅读'],
    examWeight: 15,
  },
  {
    id: 'stage2-03',
    stage: 2,
    stageName: '阶段二：时态与被动语态',
    category: '时态',
    name: '一般过去时',
    structure: {
      formula: 'S + V-ed（规则动词）| V不规则过去式',
      components: ['规则动词加-ed', '不规则动词需单独记忆', '否定：didn\'t + V原形', '疑问：Did + S + V原形'],
    },
    explanation: {
      simple: '一般过去时表示过去发生的动作或存在的状态。',
      detailed: '一般过去时表示过去某一时间发生的动作或存在的状态，常与yesterday, last week, in 2020, two days ago, just now等连用。动词变化：规则动词加-ed；以e结尾加-d；以辅音+y结尾改y为ied。不规则动词需单独记忆（如go-went, eat-ate, see-saw）。',
      analogy: '就像说"我昨天看了电影"——这是一个已经完成的过去动作。',
    },
    examPoints: [
      { point: '不规则动词过去式', example: 'go-went, come-came, take-took, write-wrote', frequency: 5 },
      { point: '过去时与时间状语匹配', example: 'yesterday / last night / three years ago', frequency: 5 },
      { point: 'used to 用法', example: 'He used to smoke, but now he doesn\'t.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'once upon a time', meaning: '从前', example: 'Once upon a time, there lived a princess.' },
      { pattern: 'the other day = a few days ago', meaning: '前几天', example: 'I met an old friend the other day.' },
      { pattern: 'It is/has been + 时间 + since', meaning: '自从...已经...时间了', example: 'It is three years since we met.' },
      { pattern: 'would rather/had better', meaning: '宁愿/最好', example: 'You had better finish your homework first.' },
    ],
    examples: [
      { sentence: 'When I was a child, I used to play in the park every day.', translation: '我小时候每天都去公园玩。', keyWords: ['child', 'used to', 'park'], grammarHighlight: 'used to [过去习惯]' },
      { sentence: 'The famous writer died in 2010.', translation: '这位著名作家于2010年去世。', keyWords: ['famous', 'writer', 'died'], grammarHighlight: 'died [过去时，表已故]' },
      { sentence: 'I didn\'t expect you to come here so early.', translation: '我没料到你会这么早来。', keyWords: ['expect', 'come', 'early'], grammarHighlight: 'didn\'t expect [过去否定]' },
    ],
    commonMistakes: [
      { mistake: 'He goed to Beijing last year.', correct: 'He went to Beijing last year.', reason: 'go的过去式是不规则变化went' },
      { mistake: 'I have seen the movie yesterday.', correct: 'I saw the movie yesterday.', reason: 'yesterday是过去时间，用一般过去时' },
    ],
    textbookRef: '必修① Unit 3',
    difficulty: 2,
    examType: ['语法填空', '短文改错', '写作'],
    examWeight: 20,
  },
  {
    id: 'stage2-04',
    stage: 2,
    stageName: '阶段二：时态与被动语态',
    category: '时态',
    name: '现在完成时',
    structure: {
      formula: 'S + have/has + 过去分词',
      components: ['主语三单用has', '其他用have', '过去分词：规则V-ed / 不规则V³', '常与already, yet, just, ever, never, for, since连用'],
    },
    explanation: {
      simple: '现在完成时连接过去和现在：过去发生的事对现在有影响，或持续到现在。',
      detailed: '现在完成时有两种用法：1）已完成用法——过去的动作已完成，但对现在有影响或结果；2）未完成用法——动作从过去持续到现在，常与for/since连用。注意：现在完成时不能与明确的过去时间状语（yesterday, last week, in 2020）连用，但可与just/already/yet等连用。',
      analogy: '"我已经吃了饭"——过去吃的饭，但现在不饿了（影响）。"我已经学英语五年了"——从五年前持续到现在。',
    },
    examPoints: [
      { point: 'have gone to vs have been to', example: 'He has gone to Beijing. vs. He has been to Beijing.', frequency: 5 },
      { point: 'for vs since', example: 'for three years / since 2020', frequency: 5 },
      { point: 'just/already/yet位置', example: 'I have already finished. / Have you finished yet?', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'have been to + 地点', meaning: '去过（已回来）', example: 'I have been to Shanghai twice.' },
      { pattern: 'have gone to + 地点', meaning: '去了（还没回来）', example: 'She has gone to the library.' },
      { pattern: 'It is the first/second time that...', meaning: '这是第一/二次...', example: 'It is the first time that I have met her.' },
      { pattern: 'have just/have already/have ever', meaning: '刚刚/已经/曾经', example: 'Have you ever been to Japan?' },
    ],
    examples: [
      { sentence: 'I have already finished my homework, so I can play games now.', translation: '我已经完成了作业，所以现在可以玩游戏了。', keyWords: ['already', 'finished', 'games'], grammarHighlight: 'have finished [已完成，影响现在]' },
      { sentence: 'How long have you studied English?', translation: '你学英语多久了？', keyWords: ['studied', 'English', 'long'], grammarHighlight: 'have studied [持续至今]' },
      { sentence: 'This is the best film I have ever seen.', translation: '这是我看过的最好的电影。', keyWords: ['best', 'film', 'ever'], grammarHighlight: 'have ever seen [现在完成时定语从句]' },
    ],
    commonMistakes: [
      { mistake: 'I have went to Beijing.', correct: 'I have gone to Beijing.', reason: 'go的过去分词是gone不是went' },
      { mistake: 'I have finished this work yesterday.', correct: 'I finished this work yesterday.', reason: 'yesterday是过去时间，不能与现在完成时连用' },
    ],
    textbookRef: '必修② Unit 2',
    difficulty: 3,
    examType: ['语法填空', '完形填空', '短文改错'],
    examWeight: 22,
  },
  {
    id: 'stage2-05',
    stage: 2,
    stageName: '阶段二：时态与被动语态',
    category: '时态',
    name: '过去进行时',
    structure: {
      formula: 'S + was/were + V-ing',
      components: ['was用于I/he/she/it', 'were用于you/we/they', '动词ing形式', '常与when/while/as连用'],
    },
    explanation: {
      simple: '过去进行时表示过去某一时刻正在进行的动作。',
      detailed: '过去进行时表示过去某一时刻或时段正在进行的动作，常与at that time, at this time yesterday, when, while等连用。与when连用时：when引导的短动作可打断长进行时（was about to do...when...did）。while只能接进行时。',
      analogy: '就像说"昨天这个时候我正在上班"——描述过去某个时刻正在进行的动作。',
    },
    examPoints: [
      { point: 'when vs while', example: 'I was reading when she came in.', frequency: 5 },
      { point: 'was about to...when（刚要...这时...）', example: 'I was about to leave when it started to rain.', frequency: 4 },
      { point: '过去进行时表过去将来', example: 'She told me she was leaving the next day.', frequency: 3 },
    ],
    fixedCombinations: [
      { pattern: 'be doing...when...did', meaning: '正在做...这时...（when为并列连词）', example: 'I was walking in the park when I met an old friend.' },
      { pattern: 'while + 主语 + was/were doing', meaning: '在...期间', example: 'While I was cooking, the phone rang.' },
      { pattern: 'all the time/morning/evening', meaning: '整个...一直', example: 'It was raining all morning yesterday.' },
    ],
    examples: [
      { sentence: 'I was watching TV when the electricity went out.', translation: '我正在看电视，这时停电了。', keyWords: ['watching', 'electricity', 'out'], grammarHighlight: 'was watching...when [when为并列连词]' },
      { sentence: 'While the children were playing outside, their mother was cooking inside.', translation: '孩子们在外面玩的时候，妈妈在厨房做饭。', keyWords: ['children', 'playing', 'mother'], grammarHighlight: 'were playing...was cooking [同时进行的过去动作]' },
      { sentence: 'We were about to give up when the teacher came to help us.', translation: '我们正要放弃，这时老师来帮助我们了。', keyWords: ['about to', 'give up', 'help'], grammarHighlight: 'were about to...when [刚要...时]' },
    ],
    commonMistakes: [
      { mistake: 'I was working here since 2019.', correct: 'I have been working here since 2019.', reason: 'since...表持续，要用完成时' },
      { mistake: 'When I opened the door, I heard a strange sound.', correct: 'When I opened the door, I heard... / I opened the door and heard...', reason: 'opened是点动作，不用进行时' },
    ],
    textbookRef: '必修② Unit 3',
    difficulty: 3,
    examType: ['语法填空', '完形填空', '阅读'],
    examWeight: 16,
  },
  {
    id: 'stage2-06',
    stage: 2,
    stageName: '阶段二：时态与被动语态',
    category: '被动语态',
    name: '被动语态',
    structure: {
      formula: 'S + be + 过去分词（by...）',
      components: ['不同时态的被动：am/is/are done, was/were done, have/has been done, will be done, etc.', 'by + 施动者（可省略', '及物动词和短语动词可被动'],
    },
    explanation: {
      simple: '被动语态强调动作的承受者，不说或不知道动作的执行者时用。',
      detailed: '被动语态强调动作的承受者或不知道/不必说出执行者。构成：be + 过去分词。不同时态的被动：一般现在时am/is/are + V-ed；一般过去时was/were + V-ed；现在完成时have/has been + V-ed；过去完成时had been + V-ed；将来时will be + V-ed；情态动词can/may be + V-ed。短语动词的被动不能漏掉介词或副词。',
      analogy: '就像"作业被交了"——强调作业交了这件事，而不关心谁交的。',
    },
    examPoints: [
      { point: '各时态被动结构', example: 'is done / was done / has been done / will be done / can be done', frequency: 5 },
      { point: '短语动词被动', example: 'The children were taken care of by the babysitter.', frequency: 4 },
      { point: '主动表被动', example: 'The book sells well. / The door won\'t open.', frequency: 3 },
    ],
    fixedCombinations: [
      { pattern: 'be worth + doing', meaning: '值得...', example: 'This book is worth reading twice.' },
      { pattern: 'It is said/believed/reported that...', meaning: '据说/人们认为/据报道...', example: 'It is said that he has returned to his hometown.' },
      { pattern: 'remain/keep + done', meaning: '保持...状态', example: 'The door remained locked all day.' },
      { pattern: 'want/need/require + doing = want/need/require + to be done', meaning: '需要被...', example: 'The car needs washing. = The car needs to be washed.' },
    ],
    examples: [
      { sentence: 'English is spoken by more and more people worldwide.', translation: '英语被全球越来越多的人使用。', keyWords: ['English', 'worldwide', 'people'], grammarHighlight: 'is spoken [一般现在时被动]' },
      { sentence: 'The bridge is being built at the moment.', translation: '那座桥此刻正在建设中。', keyWords: ['bridge', 'being', 'moment'], grammarHighlight: 'is being built [现在进行时被动]' },
      { sentence: 'Many houses were destroyed in the earthquake.', translation: '许多房屋在地震中被毁了。', keyWords: ['houses', 'destroyed', 'earthquake'], grammarHighlight: 'were destroyed [一般过去时被动]' },
    ],
    commonMistakes: [
      { mistake: 'The matter was never heard before.', correct: 'The matter was never heard of before.', reason: 'hear of是短语动词，被动时要保留of' },
      { mistake: 'The book is easy to read.', correct: 'The book is easy to read. / The book is easily read.', reason: '主动表被动：easy/pleasant/difficult + to do' },
    ],
    textbookRef: '必修③ Unit 1',
    difficulty: 3,
    examType: ['语法填空', '短文改错', '阅读'],
    examWeight: 20,
  },
];

// ===================== 阶段三：非谓语动词 =====================
const STAGE3_POINTS: GrammarPoint[] = [
  {
    id: 'stage3-01',
    stage: 3,
    stageName: '阶段三：非谓语动词',
    category: '非谓语',
    name: '不定式（to do）',
    structure: {
      formula: 'to + V原形 | 否定：not to do | 完成式：to have done | 进行式：to be doing',
      components: ['不定式可作主语、宾语、表语、定语、状语', 'It作形式主语：It is adj to do sth', '感官/使役动词后省to，但变被动要还原'],
    },
    explanation: {
      simple: '不定式是"to+动词原形"，表示将来的动作或目的。',
      detailed: '不定式（to + V原形）是一种非谓语动词，不能作谓语。可在句中充当多种成分：主语（To learn English is important / It is important to learn English）、宾语（I want to go）、表语（My dream is to be a doctor）、定语（I have a lot of homework to do）、状语（I study hard to pass the exam）。感官动词（see/hear/watch/feel）+ O + do；使役动词（make/let/have）+ O + do；变被动要还原to（was seen to do）。',
      analogy: '不定式像"我要做什么"——计划将来做的事。',
    },
    examPoints: [
      { point: '感官/使役动词后省to', example: 'I saw him enter the room. / He was seen to enter the room.', frequency: 5 },
      { point: 'It is + adj + to do', example: 'It is necessary to learn a foreign language.', frequency: 5 },
      { point: '不定式作后置定语', example: 'I have a meeting to attend.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'too...to... = enough to...', meaning: '太...以至于不能/足够...可以', example: 'He is too tired to walk. / He is young enough to learn.' },
      { pattern: 'would like/love/hate/prefer to do', meaning: '想要/喜欢/讨厌/宁愿做', example: 'I would like to have a cup of tea.' },
      { pattern: 'be supposed to do', meaning: '应该/被期望做', example: 'You are supposed to finish the work today.' },
      { pattern: 'can\'t wait to do', meaning: '迫不及待做', example: 'I can\'t wait to open the gift.' },
      { pattern: 'do nothing but/except do', meaning: '只能做...', example: 'He did nothing but complain all day.' },
    ],
    examples: [
      { sentence: 'To achieve success, one must work hard.', translation: '要取得成功，就必须努力工作。', keyWords: ['achieve', 'success', 'work hard'], grammarHighlight: 'To achieve [目的状语]' },
      { sentence: 'I saw him leave the office just now.', translation: '我刚才看见他离开了办公室。', keyWords: ['saw', 'leave', 'office'], grammarHighlight: 'see O do [省to]' },
      { sentence: 'The teacher asked me to hand in the paper before Friday.', translation: '老师让我周五前交论文。', keyWords: ['asked', 'hand in', 'paper'], grammarHighlight: 'ask O to do' },
    ],
    commonMistakes: [
      { mistake: 'I saw him to leave.', correct: 'I saw him leave.', reason: '感官动词see后省to' },
      { mistake: 'To work hard is very important.', correct: 'It is very important to work hard.', reason: '不定式作主语太长，用it作形式主语' },
    ],
    textbookRef: '必修② Unit 4',
    difficulty: 4,
    examType: ['语法填空', '短文改错', '阅读', '写作'],
    examWeight: 25,
  },
  {
    id: 'stage3-02',
    stage: 3,
    stageName: '阶段三：非谓语动词',
    category: '非谓语',
    name: '动名词（doing）',
    structure: {
      formula: 'V-ing | 否定：not doing | 完成式：having done | 被动式：being done',
      components: ['动名词可作主语、宾语、表语、定语', '及物动词后可用动名词作宾语', '介词后接动名词', '动名词有主动式和被动式'],
    },
    explanation: {
      simple: '动名词（V-ing）既有名词性质（可作主语/宾语），又有动词性质（可带宾语/状语）。',
      detailed: '动名词（doing）是动词的名词形式，可作主语（Learning English is fun）、宾语（I enjoy reading）、表语（My hobby is painting）、定语（a sleeping bag）。既可接不定式又可接动名词的动词：like/enjoy/prefer/hate/love + doing（习惯性）；want/wish/hope/decide/plan + to do（一次性）。remember/forget/stop/try + doing vs + to do 意思不同。',
      analogy: '动名词就像说"我喜欢游泳"——游泳是一个活动名词。',
    },
    examPoints: [
      { point: '接动名词的动词', example: 'enjoy, finish, suggest, practice, mind, avoid, keep, consider', frequency: 5 },
      { point: 'remember/forget/stop/try doing vs to do', example: 'Remember to lock the door. vs. I remember locking the door.', frequency: 5 },
      { point: '动名词主动表被动', example: 'The book is worth reading. / The machine needs repairing.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'look forward to + doing', meaning: '期待做', example: 'I am looking forward to hearing from you soon.' },
      { pattern: 'be used to + doing', meaning: '习惯于', example: 'I am used to getting up early.' },
      { pattern: 'pay attention to + doing', meaning: '注意/重视', example: 'Pay attention to protecting the environment.' },
      { pattern: 'devote...to + doing', meaning: '致力于', example: 'He devoted his life to helping the poor.' },
      { pattern: 'stick to / lead to / object to / prefer...to... + doing', meaning: '坚持/导致/反对/比起...更喜欢...', example: 'I prefer reading to watching TV.' },
    ],
    examples: [
      { sentence: 'Learning a foreign language requires patience and practice.', translation: '学习外语需要耐心和练习。', keyWords: ['learning', 'language', 'requires'], grammarHighlight: 'Learning [主语]' },
      { sentence: 'I suggest taking a break before we continue.', translation: '我建议休息一下再继续。', keyWords: ['suggest', 'taking', 'break'], grammarHighlight: 'suggest doing' },
      { sentence: 'I remember meeting her at the party last year.', translation: '我记得去年在派对上见过她。', keyWords: ['remember', 'meeting', 'party'], grammarHighlight: 'remember doing [记得已做过的事]' },
    ],
    commonMistakes: [
      { mistake: 'I enjoy to read books.', correct: 'I enjoy reading books.', reason: 'enjoy后接动名词' },
      { mistake: 'I am used to study English every morning.', correct: 'I am used to studying English every morning.', reason: 'be used to中to是介词，后接动名词' },
    ],
    textbookRef: '必修② Unit 4',
    difficulty: 4,
    examType: ['语法填空', '短文改错', '阅读'],
    examWeight: 22,
  },
  {
    id: 'stage3-03',
    stage: 3,
    stageName: '阶段三：非谓语动词',
    category: '非谓语',
    name: '现在分词（V-ing）',
    structure: {
      formula: 'V-ing | 否定：not V-ing | 完成式：having done | 被动式：being done / having been done',
      components: ['现在分词可作定语、表语、状语、补语', '与逻辑主语构成独立主格', '完成式表示分词动作先于谓语发生', 'being done表示正在进行且被动'],
    },
    explanation: {
      simple: '现在分词表示主动、进行的动作，相当于一个形容词或副词。',
      detailed: '现在分词（V-ing）有两种用法：1）形容词性——作定语修饰名词（a sleeping baby = a baby who is sleeping）或作表语（The news is exciting）；2）副词性——作状语表示时间、原因、条件、结果、伴随等。现在分词与逻辑主语构成独立主格结构：逻辑主语 + V-ing。完成式（having done）表示分词动作先于谓语发生。',
      analogy: '现在分词就像"正在...的"，强调动作正在进行且与主句主语是主动关系。',
    },
    examPoints: [
      { point: 'V-ing作状语（时间/原因/伴随）', example: 'Seeing the teacher, the students stood up.', frequency: 5 },
      { point: 'having done作状语', example: 'Having finished the work, I went home.', frequency: 4 },
      { point: '独立主格结构', example: 'Weather permitting, we will go outing.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'considering (that)...', meaning: '考虑到...', example: 'Considering he is a beginner, he speaks quite well.' },
      { pattern: 'Judging from/by...', meaning: '从...判断', example: 'Judging from his expression, he must be angry.' },
      { pattern: 'Generally/Strictly speaking', meaning: '一般来说/严格来说', example: 'Generally speaking, women live longer than men.' },
      { pattern: 'supposing (that)...', meaning: '假设...', example: 'Supposing it rains, what shall we do?' },
    ],
    examples: [
      { sentence: 'Having waited for an hour, we finally gave up.', translation: '等了一个小时后，我们最终放弃了。', keyWords: ['waited', 'finally', 'gave up'], grammarHighlight: 'Having waited [完成式，先于谓语]' },
      { sentence: 'The students sat in the classroom, listening to the teacher carefully.', translation: '学生们坐在教室里，认真听老师讲课。', keyWords: ['sat', 'listening', 'carefully'], grammarHighlight: 'listening [伴随状语，主动]' },
      { sentence: 'Weather permitting, we will have a picnic tomorrow.', translation: '如果天气允许，我们明天去野餐。', keyWords: ['permitting', 'picnic', 'tomorrow'], grammarHighlight: 'Weather permitting [独立主格]' },
    ],
    commonMistakes: [
      { mistake: 'Because being tired, I went to bed early.', correct: 'Being tired, I went to bed early. / Because I was tired, I went to bed early.', reason: '现在分词作原因状语不能有独立be动词' },
      { mistake: 'I saw him crossed the road.', correct: 'I saw him crossing the road.', reason: 'see O doing表示看见动作正在进行' },
    ],
    textbookRef: '选择性必修① Unit 1',
    difficulty: 4,
    examType: ['语法填空', '短文改错', '阅读'],
    examWeight: 20,
  },
  {
    id: 'stage3-04',
    stage: 3,
    stageName: '阶段三：非谓语动词',
    category: '非谓语',
    name: '过去分词（V-ed/不规则）',
    structure: {
      formula: 'V-ed（规则）| 不规则V³ | 否定：not having been done | being done',
      components: ['过去分词表示被动、完成的动作', '可作定语、表语、宾补、状语', '与逻辑主语构成独立主格', '完成被动式having been done'],
    },
    explanation: {
      simple: '过去分词表示被动、完成的含义，相当于一个形容词或副词。',
      detailed: '过去分词（V-ed/不规则过去分词）表示被动和完成两层含义。可作：1）定语——the broken window（被打破的窗户）；2）表语——I am interested（我对...感兴趣）；3）宾补——I had my hair cut；4）状语——时间、原因、条件、让步等。过去分词独立主格：All things considered, ...。',
      analogy: '过去分词就像"被...的"或"...过了的"，强调动作已经完成且与主语是被动关系。',
    },
    examPoints: [
      { point: 'V-ed作后置定语', example: 'The computer repaired last week works well now.', frequency: 5 },
      { point: 'V-ed作状语', example: 'Given more time, I could do it better.', frequency: 4 },
      { point: '过去分词与现在分词被动对比', example: 'The building being built is our library. vs. The building built last year is ours.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'given (that)...', meaning: '考虑到/鉴于', example: 'Given that he is only ten, he did a good job.' },
      { pattern: 'compared with/to...', meaning: '与...相比', example: 'Compared with Beijing, Shanghai is more crowded.' },
      { pattern: 'seen/heard + O + doing / done', meaning: '被看到/听到...正在被...', example: 'Seen from space, the earth looks like a blue ball.' },
      { pattern: 'provided/providing (that)...', meaning: '只要/假如', example: 'You can borrow my book provided you return it on time.' },
    ],
    examples: [
      { sentence: 'The visitors, exhausted from the long journey, took a rest in the hotel.', translation: '游客们因长途旅行疲惫，在酒店休息了。', keyWords: ['visitors', 'exhausted', 'journey'], grammarHighlight: 'exhausted [过去分词作原因状语/表语]' },
      { sentence: 'The book written by Mo Yan won the Nobel Prize.', translation: '莫言写的这本书获得了诺贝尔奖。', keyWords: ['written', 'Mo Yan', 'Nobel'], grammarHighlight: 'written by [过去分词短语后置定语]' },
      { sentence: 'Given enough time, we would have done it better.', translation: '如果给足够的时间，我们会做得更好。', keyWords: ['given', 'enough', 'time'], grammarHighlight: 'Given [条件状语，独立主格]' },
    ],
    commonMistakes: [
      { mistake: 'I found the window break.', correct: 'I found the window broken.', reason: 'find O done表示发现某物被...' },
      { mistake: 'The work finish, we went home.', correct: 'The work finished, we went home. / The work being finished, we went home.', reason: '独立主格中过去分词前可加being或直接用过去式' },
    ],
    textbookRef: '选择性必修① Unit 1',
    difficulty: 4,
    examType: ['语法填空', '短文改错', '阅读'],
    examWeight: 20,
  },
];

// ===================== 阶段四：三大从句 =====================
const STAGE4_POINTS: GrammarPoint[] = [
  {
    id: 'stage4-01',
    stage: 4,
    stageName: '阶段四：三大从句',
    category: '定语从句',
    name: '定语从句（关系代词）',
    structure: {
      formula: 'n. + who/whom/whose/which/that + 句子',
      components: ['who/whom指人，which指物，that可指人可指物', 'who在从句中作主语，whom作宾语（可省略）', 'whose表所属', 'which/that在从句中作主语或宾语'],
    },
    explanation: {
      simple: '定语从句用来说明前面的名词，就像"一个...的..."。',
      detailed: '定语从句修饰名词或代词，在句中作定语。由关系代词（who, whom, whose, which, that）或关系副词（when, where, why）引导。who指人，在从句中作主语；whom指人，在从句中作宾语，可省略；whose指人或物，在从句中作定语；which指物；that可指人可指物，在从句中作主语或宾语。',
      analogy: '就像中文说"我喜欢的人"——"我喜欢的人"就是一个定语从句。',
    },
    examPoints: [
      { point: 'that vs which', example: 'The book that/which I bought is interesting.', frequency: 5 },
      { point: '只用that的情况', example: 'Everything that I saw impressed me. / The only person that came was...', frequency: 5 },
      { point: '介词+关系代词', example: 'The man to whom I spoke is my teacher.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'the same...as / the same...that', meaning: '与...相同/正是...', example: 'He is the same man as I saw. / He is the same man that I saw yesterday.' },
      { pattern: 'such...as / such...that', meaning: '像...一样（定语）/如此...以至于（结果）', example: 'Such students as work hard will succeed. / It was such a cold day that we stayed home.' },
      { pattern: 'as 引导的非限制性定语从句', meaning: '正如/这一点', example: 'As is known to all, the earth is round.' },
    ],
    examples: [
      { sentence: 'The woman who lives next door is a doctor.', translation: '住在隔壁的那位女士是医生。', keyWords: ['woman', 'lives', 'doctor'], grammarHighlight: 'who [关系代词/主语]' },
      { sentence: 'The book (which/that) I bought yesterday is very interesting.', translation: '我昨天买的那本书很有趣。', keyWords: ['bought', 'yesterday', 'interesting'], grammarHighlight: '(which/that) [关系代词/宾语，可省略]' },
      { sentence: 'The boy whose parents died in the accident is now living with his uncle.', translation: '父母在事故中去世的那个男孩现在和他的叔叔住在一起。', keyWords: ['parents', 'died', 'accident'], grammarHighlight: 'whose [关系代词/定语]' },
    ],
    commonMistakes: [
      { mistake: 'This is the book which I bought it.', correct: 'This is the book which I bought.', reason: '定语从句中关系代词作宾语时不能再加it' },
      { mistake: 'Who is the teacher you are waiting?', correct: 'Who is the teacher you are waiting for?', reason: 'wait是不及物动词，需加介词for' },
    ],
    textbookRef: '必修③ Unit 2',
    difficulty: 4,
    examType: ['语法填空', '短文改错', '阅读', '写作'],
    examWeight: 28,
  },
  {
    id: 'stage4-02',
    stage: 4,
    stageName: '阶段四：三大从句',
    category: '定语从句',
    name: '定语从句（关系副词）',
    structure: {
      formula: 'n. + when/where/why (+ 主谓) = n. + 介词+which',
      components: ['when = at/on/in/during which', 'where = in/at/on which', 'why = for which', '关系副词在从句中作状语'],
    },
    explanation: {
      simple: '关系副词when/where/why替代"介词+which"，在从句中作时间/地点/原因状语。',
      detailed: 'when表示时间，where表示地点，why表示原因。它们的用法可以转化为：the day when = the day on which；the place where = the place in which；the reason why = the reason for which。关系副词在从句中充当状语成分，修饰从句的谓语动词。',
      analogy: '就像说"我买书的那天"——when替代了"在那一天"。',
    },
    examPoints: [
      { point: 'when/where/why = 介词+which', example: 'the day when = the day on which', frequency: 5 },
      { point: '关系副词在从句中作状语', example: 'I still remember the day when we first met.', frequency: 4 },
      { point: 'reason why结构', example: 'The reason why he was late is that he missed the bus.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'the moment/Instant + when = as soon as', meaning: '一...就', example: 'The moment he arrived, he called me.' },
      { pattern: 'every time / each time / next time + 从句', meaning: '每次/下次...', example: 'Every time I see him, he is reading.' },
      { pattern: 'the first/second/last time + 从句', meaning: '第一/二/最后一次...', example: 'The first time I went to Beijing, I visited the Great Wall.' },
    ],
    examples: [
      { sentence: 'I will never forget the day when we visited the museum.', translation: '我永远不会忘记我们去博物馆的那一天。', keyWords: ['forget', 'visited', 'museum'], grammarHighlight: 'when [关系副词/时间状语]' },
      { sentence: 'The factory where my father works is far from here.', translation: '我父亲工作的那个工厂离这里很远。', keyWords: ['factory', 'father', 'works'], grammarHighlight: 'where [关系副词/地点状语]' },
      { sentence: 'Do you know the reason why he refused our invitation?', translation: '你知道他拒绝我们邀请的原因吗？', keyWords: ['reason', 'refused', 'invitation'], grammarHighlight: 'why [关系副词/原因状语]' },
    ],
    commonMistakes: [
      { mistake: 'I still remember the day when we met it.', correct: 'I still remember the day (when we met).', reason: '关系副词在从句中作状语不能再加it' },
      { mistake: 'This is the place where we visited last year.', correct: 'This is the place (which/that) we visited last year. / This is the place where we had a good time.', reason: 'where在从句中作地点状语，不作visit的宾语' },
    ],
    textbookRef: '必修③ Unit 2',
    difficulty: 4,
    examType: ['语法填空', '短文改错', '阅读'],
    examWeight: 18,
  },
  {
    id: 'stage4-03',
    stage: 4,
    stageName: '阶段四：三大从句',
    category: '名词性从句',
    name: '名词性从句（主语/宾语从句）',
    structure: {
      formula: 'that / whether / if / what / who / which / whose + 主谓',
      components: ['that引导陈述内容，不作成分', 'whether/if表示是否', 'what/who/which/whose提问并作成分', '从句用陈述语序'],
    },
    explanation: {
      simple: '名词性从句就是把一个完整的句子当作名词来用，可在句中作主语、宾语、表语等。',
      detailed: '名词性从句包括主语从句、宾语从句、表语从句和同位语从句。连接词：that（无意义，不作成分）；whether/if（是否）；what/who/whom/which/whose（有意义，作成分）。特殊：what = the thing(s) that；whatever = anything that；whoever = anyone who。whether和if在宾语从句可互换，但whether可与or not连用，if不行。',
      analogy: '就像说"我喜欢你"——"你喜欢我"是一个名词性从句，可以作主语（喜欢你让我开心）或宾语（我喜欢你）。',
    },
    examPoints: [
      { point: 'that在宾语从句中可省略', example: 'I think (that) he is right.', frequency: 5 },
      { point: 'what/whatever/whoever', example: 'What you need is more practice.', frequency: 5 },
      { point: 'whether/if选择', example: 'I don\'t know whether/if he will come. / I don\'t know whether or not he will come.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'It is said/believed/reported that...', meaning: '据说/人们认为/据报道...', example: 'It is said that the building will be finished next month.' },
      { pattern: 'What strikes/shocks me most is that...', meaning: '最让我震惊的是...', example: 'What shocks me most is that he didn\'t apologize.' },
      { pattern: 'No matter what/who/how... vs Whatever/Whoever/However...', meaning: '无论什么/谁/如何...', example: 'Whatever you say, I won\'t believe it. / No matter what you say, I won\'t believe it.' },
    ],
    examples: [
      { sentence: 'That the earth moves around the sun is known to all.', translation: '地球绕太阳转是众所周知的。', keyWords: ['earth', 'moves', 'sun'], grammarHighlight: 'That... [主语从句]' },
      { sentence: 'I don\'t know whether he will come or not.', translation: '我不知道他是否会来。', keyWords: ['whether', 'come', 'not'], grammarHighlight: 'whether...or not [宾语从句]' },
      { sentence: 'What made me angry was that he didn\'t tell me the truth.', translation: '让我生气的是他没有告诉我真相。', keyWords: ['angry', 'truth', 'didn\'t'], grammarHighlight: 'What... [主语从句] + that... [表语从句]' },
    ],
    commonMistakes: [
      { mistake: 'I don\'t know that he is right or wrong.', correct: 'I don\'t know whether he is right or wrong.', reason: 'whether可与or not连用，that不行' },
      { mistake: 'What did you say? I said that I would come.', correct: 'What did you say? I said (that) I would come.', reason: 'that在宾语从句中可省略，但what本身是连接词' },
    ],
    textbookRef: '必修③ Unit 3',
    difficulty: 4,
    examType: ['语法填空', '完形填空', '阅读', '写作'],
    examWeight: 25,
  },
  {
    id: 'stage4-04',
    stage: 4,
    stageName: '阶段四：三大从句',
    category: '名词性从句',
    name: '名词性从句（表语/同位语从句）',
    structure: {
      formula: 'S + be + 连接词 + 主谓（表语从句） | n. + 连接词 + 主谓（同位语从句）',
      components: ['表语从句跟在系动词后', '同位语从句解释抽象名词（fact, news, idea等）', 'that引导同位语从句只起连接作用，不作成分'],
    },
    explanation: {
      simple: '表语从句在系动词后解释主语，同位语从句解释说明抽象名词。',
      detailed: '表语从句跟在be动词或其他系动词后，说明主语是什么。同位语从句跟在抽象名词（fact, news, idea, thought, hope, belief, question, problem, order等）后，进一步解释说明这个名词的内容。that引导同位语从句只起连接作用，不作成分，不能省略，也不可以用which替代。',
      analogy: '同位语从句就像"也就是说..."——用另一种方式解释前面的名词。',
    },
    examPoints: [
      { point: '同位语从句与定语从句的区别', example: 'The news that he won the prize made us happy. (同位语: that=这件事) vs The news that he told us was false. (定语: that=人称代词)', frequency: 5 },
      { point: 'the reason is that...', example: 'The reason is that he was ill.', frequency: 4 },
      { point: 'as if/as though引导表语从句', example: 'It looks as if it is going to rain.', frequency: 3 },
    ],
    fixedCombinations: [
      { pattern: 'The fact is that / The truth is that', meaning: '事实是...', example: 'The fact is that he has never been to Beijing.' },
      { pattern: 'There is a chance that...', meaning: '有可能...', example: 'There is a chance that he will succeed this time.' },
      { pattern: 'I have the feeling/belief/idea that...', meaning: '我有一种感觉/相信/认为...', example: 'I have the feeling that something is wrong.' },
      { pattern: 'with the exception that...', meaning: '除了...之外', example: 'All the students passed the exam, with the exception that Tom failed.' },
    ],
    examples: [
      { sentence: 'My opinion is that you should read more books.', translation: '我的意见是你应该多读书。', keyWords: ['opinion', 'should', 'books'], grammarHighlight: 'that... [表语从句]' },
      { sentence: 'The news that our team won the championship excited everyone.', translation: '我们队赢得冠军的消息让每个人都很兴奋。', keyWords: ['news', 'won', 'championship'], grammarHighlight: 'that... [同位语从句，解释news的内容]' },
      { sentence: 'The problem is whether we can finish the work on time.', translation: '问题是我们能否按时完成工作。', keyWords: ['problem', 'whether', 'finish'], grammarHighlight: 'whether... [表语从句]' },
    ],
    commonMistakes: [
      { mistake: 'The fact which he told me was true.', correct: 'The fact (that) he told me was true. / The fact is that he told me the truth.', reason: '同位语从句that只起连接作用，不作成分；定语从句that/which才在从句中作宾语' },
      { mistake: 'I have a doubt if he is honest.', correct: 'I have a doubt whether he is honest.', reason: 'doubt后whether表示怀疑，that表示相信' },
    ],
    textbookRef: '选择性必修② Unit 1',
    difficulty: 4,
    examType: ['语法填空', '阅读'],
    examWeight: 18,
  },
  {
    id: 'stage4-05',
    stage: 4,
    stageName: '阶段四：三大从句',
    category: '状语从句',
    name: '状语从句（时间/条件）',
    structure: {
      formula: 'when/while/as/after/before/since/until + 主谓 | if/unless/provided that... + 主谓',
      components: ['when/while/as: 当...时', 'after/before: 在...之后/之前', 'since: 自从', 'until/till: 直到', 'if/unless: 如果/除非', 'provided that: 只要'],
    },
    explanation: {
      simple: '状语从句用来说明时间、条件等背景，让主句的动作有语境。',
      detailed: '时间状语从句：when（当...时），while（当...时，强调持续），as（一边...一边...），after（在...之后），before（在...之前），since（自从），until/till（直到），as soon as/the moment（一...就）。条件状语从句：if（如果），unless（除非=if not），provided that/providing（that）（只要），on condition that（在...条件下），in case（万一）。注意：主将从现，主情从现，主祈从现。',
      analogy: '就像说"当我到家时，我打开了门"——"当我到家时"就是时间状语从句。',
    },
    examPoints: [
      { point: 'when/while/as区别', example: 'When I arrived, she was cooking. / While I was cooking, the phone rang.', frequency: 5 },
      { point: '主将从现/主情从现', example: 'If it rains tomorrow, I will stay home. / If you practice more, you will improve.', frequency: 5 },
      { point: 'unless = if not', example: 'Unless you try harder, you won\'t succeed. = If you don\'t try harder...', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'as soon as / the moment / the instant / directly / immediately + 主谓', meaning: '一...就', example: 'I will call you the moment I arrive.' },
      { pattern: 'each time / every time / next time + 主谓', meaning: '每次/下次', example: 'Every time I see her, she is smiling.' },
      { pattern: 'hardly/scarcely...when, no sooner...than', meaning: '一...就（主句倒装）', example: 'Hardly had I sat down when the phone rang.' },
      { pattern: 'once + 主谓', meaning: '一旦', example: 'Once you finish the course, you will get a certificate.' },
    ],
    examples: [
      { sentence: 'I will call you as soon as I arrive at the airport.', translation: '我一到机场就给你打电话。', keyWords: ['call', 'arrive', 'airport'], grammarHighlight: 'as soon as [一...就]' },
      { sentence: 'You will fail the exam unless you study harder.', translation: '除非你更努力学习，否则你会考试不及格。', keyWords: ['fail', 'unless', 'study'], grammarHighlight: 'unless [除非]' },
      { sentence: 'While I was walking in the park, I found a wallet.', translation: '我在公园散步时，发现了一个钱包。', keyWords: ['walking', 'park', 'found'], grammarHighlight: 'While...was doing [进行时态的when从句]' },
    ],
    commonMistakes: [
      { mistake: 'When I will arrive, I will call you.', correct: 'When I arrive/arrive tomorrow, I will call you.', reason: '时间状语从句用现在时代替将来时' },
      { mistake: 'I won\'t go unless he will come.', correct: 'I won\'t go unless he comes.', reason: 'unless条件从句用现在时代替将来时' },
    ],
    textbookRef: '必修② Unit 3',
    difficulty: 3,
    examType: ['语法填空', '完形填空', '短文改错', '阅读', '写作'],
    examWeight: 25,
  },
  {
    id: 'stage4-06',
    stage: 4,
    stageName: '阶段四：三大从句',
    category: '状语从句',
    name: '状语从句（原因/让步/结果）',
    structure: {
      formula: 'because/since/as/because of + 原因 | although/though/even if + 让步 | so...that/such...that + 结果',
      components: ['because最强调，since次之，as最轻', 'although/though/though/even if让步', 'so that/to such a degree that结果'],
    },
    explanation: {
      simple: '原因从句解释为什么，让步从句"虽然...但是...，结果从句说明"如此...以至于..."。',
      detailed: '原因状语从句：because（因为），since（既然），as（由于），now that（既然）。because不和so连用。让步状语从句：although/though（虽然），even if/even though（即使），however/no matter how（无论多么），whatever/no matter what（无论什么）。although不和but连用。结果状语从句：so+形容词/副词+that，such+名词+that，so...that/such...that可互换。',
      analogy: '"因为下雨，所以地湿"——because...so是原因结果；"虽然难，但是我坚持"——although...but是让步转折。',
    },
    examPoints: [
      { point: 'because不与so连用，although不与but连用', example: 'Because it rained, the ground was wet. / Although it rained, I went out.', frequency: 5 },
      { point: 'so that / such that', example: 'He was so tired that he fell asleep. / It was such a cold day that we stayed home.', frequency: 5 },
      { point: '让步状语从句倒装', example: 'Child as he is, he knows a lot. / Try as he might, he failed.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'in case (that)...', meaning: '以防万一', example: 'Take an umbrella in case it rains.' },
      { pattern: 'for fear (that)...', meaning: '生怕/以免', example: 'He studied hard for fear that he would fail.' },
      { pattern: 'in order that... = so that...', meaning: '为了/以便', example: 'He studied hard so that/in order that he could pass the exam.' },
      { pattern: 'given (that)...', meaning: '考虑到', example: 'Given that he is a beginner, he did well.' },
    ],
    examples: [
      { sentence: 'Since everyone is here, let\'s start the meeting.', translation: '既然大家都到了，让我们开始会议吧。', keyWords: ['everyone', 'start', 'meeting'], grammarHighlight: 'Since [既然]' },
      { sentence: 'Although he was exhausted, he continued working.', translation: '虽然他精疲力竭，但他继续工作。', keyWords: ['exhausted', 'continued', 'working'], grammarHighlight: 'Although... [让步]' },
      { sentence: 'It was such an interesting book that I read it twice.', translation: '这本书太有趣了，我读了两遍。', keyWords: ['interesting', 'book', 'twice'], grammarHighlight: 'such...that [结果]' },
    ],
    commonMistakes: [
      { mistake: 'Because he was late, so he missed the bus.', correct: 'Because he was late, he missed the bus.', reason: 'because和so不能同时用' },
      { mistake: 'Although he is rich, but he is not happy.', correct: 'Although/Though he is rich, he is not happy.', reason: 'although和but不能同时用' },
    ],
    textbookRef: '必修③ Unit 4',
    difficulty: 3,
    examType: ['语法填空', '短文改错', '阅读', '写作'],
    examWeight: 22,
  },
];

// ===================== 阶段五：特殊句式 =====================
const STAGE5_POINTS: GrammarPoint[] = [
  {
    id: 'stage5-01',
    stage: 5,
    stageName: '阶段五：特殊句式',
    category: '特殊句式',
    name: '倒装句',
    structure: {
      formula: '完全倒装：表语/状语 + be + 主语 | 部分倒装：助动词/情态动词 + 主语 + 动词',
      components: ['地点状语提前完全倒装：Here comes the bus.', '否定词提前部分倒装：Never have I seen such a thing.', 'Only + 状语提前部分倒装'],
    },
    explanation: {
      simple: '倒装就是调换主语和谓语的顺序，像把句子"颠倒"一下。',
      detailed: '倒装分为完全倒装（谓语全部提到主语前）和部分倒装（只把助动词/情态动词提到主语前）。完全倒装：方位副词（here, there, up, down等）+ 谓语 + 主语（主语为代词时不倒装）。部分倒装：否定副词/连词（never, seldom, rarely, hardly, barely, not until, only, little, neither/nor）提前；so/neither/nor + 助动词 + 主语（表示"也/也不"）；虚拟语气条件句中省略if时。',
      analogy: '就像说"来了来了！"——把动作提到前面，制造强调效果。',
    },
    examPoints: [
      { point: '否定词提前部分倒装', example: 'Never before have I seen such a beautiful sunset.', frequency: 5 },
      { point: 'Only + 状语提前部分倒装', example: 'Only in this way can you succeed.', frequency: 5 },
      { point: 'so/neither/nor 倒装', example: 'I like English. So does she. / I don\'t like math. Neither does he.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'Hardly/Scarcely had + S + done when + 主句', meaning: '一...就...', example: 'Hardly had I arrived when it started to rain.' },
      { pattern: 'Not until + 主句 + did/does/will + 主语 + 谓语', meaning: '直到...才...', example: 'Not until I met her did I know what happiness meant.' },
      { pattern: 'Here/There + 谓语 + 主语（名） / Here/There + 主语（代）+ 谓语', meaning: '这儿有/那儿是', example: 'Here comes the bus! / Here it comes!' },
      { pattern: 'Only then/did/much/later + 主句', meaning: '只有那时/更多/更晚', example: 'Only then did I realize my mistake.' },
    ],
    examples: [
      { sentence: 'Never have I heard such a wonderful speech.', translation: '我从未听过如此精彩的演讲。', keyWords: ['heard', 'wonderful', 'speech'], grammarHighlight: 'Never have I heard [否定词提前部分倒装]' },
      { sentence: 'Only when you understand the grammar can you master the language.', translation: '只有当你理解语法时，你才能掌握这门语言。', keyWords: ['understand', 'grammar', 'master'], grammarHighlight: 'Only when...can you [Only+状语提前部分倒装]' },
      { sentence: 'Here comes the teacher!', translation: '老师来了！', keyWords: ['teacher', 'comes', 'here'], grammarHighlight: 'Here comes the teacher [完全倒装]' },
    ],
    commonMistakes: [
      { mistake: 'Only when he came, I left.', correct: 'Only when he came did I leave.', reason: 'Only+时间状语提前，主句要部分倒装' },
      { mistake: 'Never I have seen it.', correct: 'Never have I seen it.', reason: '否定词提前要部分倒装（助动词提前）' },
    ],
    textbookRef: '选择性必修② Unit 2',
    difficulty: 4,
    examType: ['语法填空', '短文改错', '阅读'],
    examWeight: 18,
  },
  {
    id: 'stage5-02',
    stage: 5,
    stageName: '阶段五：特殊句式',
    category: '特殊句式',
    name: '虚拟语气',
    structure: {
      formula: 'If + 主语 + were/did, 主语 + would/could/should/might + do',
      components: ['与现在相反：were/did, would do', '与过去相反：had done, would have done', '与将来相反：were to do/should do, would do', 'If省略were/should/had倒装'],
    },
    explanation: {
      simple: '虚拟语气用来表达与事实相反或不可能发生的情况。',
      detailed: '虚拟语气表达与事实相反的假设或不太可能实现的情况。与现在相反：从句if+were/did，主句would/could/might+do。与过去相反：从句if+had done，主句would/could/might+have done。与将来相反：从句if+were to do/should do，主句would/could/might+do。含蓄虚拟：without/but for/otherwise/or + 句子。if省略时，were/had/should提到句首构成倒装。',
      analogy: '就像说"如果我是你，我就不会这样做"——实际上我不是你，这是假设。',
    },
    examPoints: [
      { point: 'if虚拟语气三种时态', example: 'If I were rich, I would travel. / If I had studied, I would have passed.', frequency: 5 },
      { point: 'if省略倒装', example: 'Were I you, I would accept the offer.', frequency: 4 },
      { point: 'wish/if only + 虚拟', example: 'I wish I were taller. / If only I had studied harder!', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'It is (high/about) time that + 主语 + did/were', meaning: '早该...了', example: 'It is high time that we took action.' },
      { pattern: 'as if/as though + 主语 + did/had done', meaning: '好像/似乎', example: 'He speaks as if he knew everything.' },
      { pattern: 'If only + 主语 + were/had done/would do', meaning: '要是...就好了', example: 'If only I had more time!' },
      { pattern: 'suggest/demand/propose/insist + (should) do', meaning: '建议/要求/坚持', example: 'I suggest that he (should) go at once.' },
      { pattern: 'but for / without + n., 主语 + would have done', meaning: '要不是...', example: 'But for your help, I would have failed.' },
    ],
    examples: [
      { sentence: 'If I had known your phone number, I would have called you.', translation: '如果我知道你的电话号码，我就给你打电话了。（但我不知道）', keyWords: ['known', 'phone', 'called'], grammarHighlight: 'had known...would have called [与过去相反]' },
      { sentence: 'Were I you, I would take this job.', translation: '如果我是你，我会接受这份工作。', keyWords: ['take', 'job', 'would'], grammarHighlight: 'Were I you [if倒装]' },
      { sentence: 'I suggest that he should finish the task today.', translation: '我建议他今天完成任务。', keyWords: ['suggest', 'finish', 'task'], grammarHighlight: '(should) finish [虚拟语气，should可省略]' },
    ],
    commonMistakes: [
      { mistake: 'If I was you, I would accept.', correct: 'If I were you, I would accept.', reason: '虚拟语气中be动词一律用were' },
      { mistake: 'I wish I have more money.', correct: 'I wish I had more money.', reason: 'wish后的虚拟语气用过去式' },
    ],
    textbookRef: '选择性必修③ Unit 1',
    difficulty: 5,
    examType: ['语法填空', '短文改错', '阅读'],
    examWeight: 20,
  },
  {
    id: 'stage5-03',
    stage: 5,
    stageName: '阶段五：特殊句式',
    category: '特殊句式',
    name: '强调句',
    structure: {
      formula: 'It is/was + 被强调部分 + that/who + 其他',
      components: ['It is/was + ... + that/who + ...', '强调人用who/that，其他一律用that', '可强调除谓语外的所有成分', '疑问句：Is it/was it...that...'],
    },
    explanation: {
      simple: '强调句就是用"It is...that..."把你想强调的部分提到前面。',
      detailed: '强调句结构：It is/was + 被强调部分 + that/who + 句子其他部分。可以强调主语、宾语、状语等任何成分（不能强调谓语）。强调人时可用who或that，其他一律用that。强调时间/地点时不能换用when/where。判断方法：去掉It is/was...that/who，句子仍然完整通顺。',
      analogy: '就像说"是昨天（不是前天）我见到了他"——用"是...的"结构强调"昨天"。',
    },
    examPoints: [
      { point: '强调句基本结构', example: 'It was because he was ill that he was absent.', frequency: 5 },
      { point: '强调句的一般疑问', example: 'Was it in Beijing that you met her?', frequency: 4 },
      { point: '强调not until', example: 'It was not until he finished the work that he went home.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'It is/was not until...that...', meaning: '直到...才...', example: 'It was not until midnight that he finished his homework.' },
      { pattern: 'It is/was + because + that...', meaning: '正是因为...', example: 'It was because she studied hard that she succeeded.' },
      { pattern: 'What is it that...?', meaning: '到底是什么...?', example: 'What is it that makes you so worried?' },
    ],
    examples: [
      { sentence: 'It was in the park that I met your sister.', translation: '正是在公园里，我遇到了你的姐姐。', keyWords: ['park', 'met', 'sister'], grammarHighlight: 'It was...that [强调地点]' },
      { sentence: 'It was not until I lost my health that I realized its value.', translation: '直到失去健康我才意识到它的价值。', keyWords: ['realized', 'health', 'value'], grammarHighlight: 'It was not until...that [强调not until]' },
      { sentence: 'Who was it that broke the window?', translation: '到底是谁打破了窗户？', keyWords: ['broke', 'window', 'who'], grammarHighlight: 'Who was it that [强调句疑问式]' },
    ],
    commonMistakes: [
      { mistake: 'It was in Beijing where I met her.', correct: 'It was in Beijing that I met her.', reason: '强调句中即使强调地点也要用that，不用where' },
      { mistake: 'It is I who am wrong.', correct: 'It is I who am wrong. / It is me who is wrong.', reason: '强调句的be动词与原句一致，who/that后动词与被强调的名词一致' },
    ],
    textbookRef: '选择性必修② Unit 2',
    difficulty: 3,
    examType: ['语法填空', '短文改错'],
    examWeight: 15,
  },
  {
    id: 'stage5-04',
    stage: 5,
    stageName: '阶段五：特殊句式',
    category: '特殊句式',
    name: '祈使句与感叹句',
    structure: {
      formula: '祈使句：V原形 / Don\'t V / Let\'s V | 感叹句：What + (a/an) + adj + n. + (S + V)! | How + adj/adv + S + V!',
      components: ['祈使句省略主语You', 'Let\'s包括对方，Let us不包括', 'What感叹句：What + a/an + adj + 可数名词单数', 'How感叹句：How + adj/adv + 主谓'],
    },
    explanation: {
      simple: '祈使句是命令或请求，感叹句是强烈感情。',
      detailed: '祈使句用来发出命令、请求或建议，句子开头为动词原形，否定在动词前加Don\'t。Let\'s do表示包括说话者在内的"让我们...；表示建议包括对方，Let us do不包括对方。感叹句用来表达惊讶、赞美、愤怒等强烈感情。What + a/an + adj + 单数可数名词 + (主谓)！How + adj + 主语 + be！How + adv + 主语 + 谓语！',
      analogy: '祈使句就像"坐下！"——命令。感叹句就像"多美啊！"——感叹。',
    },
    examPoints: [
      { point: 'What/How感叹句转换', example: 'What a beautiful flower (it is)! = How beautiful the flower is!', frequency: 4 },
      { point: '祈使句的反义疑问', example: 'Don\'t be late, will you? / Come here, will you?', frequency: 3 },
      { point: 'Let\'s vs Let us', example: 'Let\'s go, shall we? vs Let us go, will you?', frequency: 3 },
    ],
    fixedCombinations: [
      { pattern: 'Don\'t/Do + V + ..., will you?', meaning: '祈使句反意疑问', example: 'Sit down, will you? / Don\'t be late, will you?' },
      { pattern: 'What a pity/shame + (that)...!', meaning: '真遗憾...！', example: 'What a pity that you can\'t come!' },
      { pattern: 'If only...!', meaning: '要是...就好了！', example: 'If only I had worked harder!' },
      { pattern: 'Would you please...? / Could you...? / Will you...? / Can you...?', meaning: '礼貌请求', example: 'Would you please pass me the salt?' },
    ],
    examples: [
      { sentence: 'What an amazing performance it was!', translation: '多么精彩的表演啊！', keyWords: ['amazing', 'performance', 'was'], grammarHighlight: 'What an amazing... [What感叹句]' },
      { sentence: 'How beautiful the sunset is over the sea!', translation: '海上的日落多美啊！', keyWords: ['beautiful', 'sunset', 'sea'], grammarHighlight: 'How beautiful...is! [How感叹句]' },
      { sentence: 'Let\'s start the meeting now, shall we?', translation: '我们现在开始开会吧，好吗？', keyWords: ['start', 'meeting', 'shall'], grammarHighlight: 'Let\'s...shall we [包括对方]' },
    ],
    commonMistakes: [
      { mistake: 'How wonderful the weather is today!', correct: 'How wonderful the weather is today!', reason: 'How感叹句：How + adj + 主语 + 谓语' },
      { mistake: 'What terrible weather it is today!', correct: 'What terrible weather it is today!', reason: 'weather不可数，不能加a' },
    ],
    textbookRef: '必修① Unit 1',
    difficulty: 2,
    examType: ['语法填空', '阅读'],
    examWeight: 10,
  },
];

// ===================== 阶段六：情态动词与连词 =====================
const STAGE6_POINTS: GrammarPoint[] = [
  {
    id: 'stage6-01',
    stage: 6,
    stageName: '阶段六：情态动词与连词',
    category: '情态动词',
    name: '情态动词（can/could/may/might）',
    structure: {
      formula: 'can/could/be able to | may/might',
      components: ['can表示能力/可能性/许可', 'could是can的过去式，也表更委婉', 'may表示许可/可能性/祝愿', 'might是may的过去式，也表更委婉'],
    },
    explanation: {
      simple: '情态动词表达"能不能/可不可以/或许"等语气。',
      detailed: 'can表示能力（会/能）、可能性（可能）和许可（可以）。could是can的过去式，也可表示更委婉的建议或请求。may表示许可（可以）、可能性（也许）和祝愿（祝）。might是may的过去式，也可表示更委婉的推测。注意：can\'t表示"不可能"，may not表示"可能不"。could/might + have done表示对过去的推测。',
      analogy: '"你能帮我吗？"——can表示能力。"你可以走了"——may表示许可。"他可能已经离开了"——might表示推测。',
    },
    examPoints: [
      { point: 'can vs be able to', example: 'I can swim. = I am able to swim. / I could/was able to swim.', frequency: 4 },
      { point: 'can\'t vs may not', example: 'He can\'t be at home. (他不可能在家) vs He may not be at home. (他可能不在家)', frequency: 5 },
      { point: 'could/might have done', example: 'He could have passed the exam if he had studied.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'can\'t help doing = can\'t help but do', meaning: '忍不住/情不自禁', example: 'I can\'t help laughing when I see his face.' },
      { pattern: 'can\'t wait to do', meaning: '迫不及待做', example: 'I can\'t wait to see you again.' },
      { pattern: 'may/might as well do = had better do', meaning: '不如/最好', example: 'You might as well go home now.' },
      { pattern: 'May + 主语 + V...!', meaning: '祝...', example: 'May you have a happy new year!' },
    ],
    examples: [
      { sentence: 'Can you speak English?', translation: '你会说英语吗？', keyWords: ['speak', 'English', 'can'], grammarHighlight: 'Can you [能力]' },
      { sentence: 'Could you please open the window?', translation: '你能打开窗户吗？', keyWords: ['please', 'open', 'window'], grammarHighlight: 'Could you [委婉请求]' },
      { sentence: 'He might have missed the last bus.', translation: '他可能错过了末班车。', keyWords: ['missed', 'bus', 'might'], grammarHighlight: 'might have done [对过去的推测]' },
    ],
    commonMistakes: [
      { mistake: 'He can be at home now.', correct: 'He may be at home now.', reason: 'can\'t be表示推测时只用于否定/疑问，肯定推测用must be/may be' },
      { mistake: 'Can I use your phone?', correct: 'Can/May I use your phone?', reason: '两者都表示许可，可以互换' },
    ],
    textbookRef: '必修① Unit 4',
    difficulty: 2,
    examType: ['语法填空', '完形填空', '阅读'],
    examWeight: 16,
  },
  {
    id: 'stage6-02',
    stage: 6,
    stageName: '阶段六：情态动词与连词',
    category: '情态动词',
    name: '情态动词（must/have to/should）',
    structure: {
      formula: 'must / have (got) to / should / ought to',
      components: ['must表必须/禁止/肯定推测', 'have to表客观必要', 'should/ought to表应该/可能性'],
    },
    explanation: {
      simple: 'must"必须"，have to"不得不"，should"应该"。',
      detailed: 'must表示主观认为必须做的事，have to表示客观条件要求做的事。must的否定mustn\'t表示"禁止/不允许"，don\'t have to表示"不必"。must作推测表示"一定/肯定"（肯定），can\'t表示"不可能"（否定）。should/ought to表示"应该/理应"，should have done表示"本应该做但没做"。',
      analogy: '"你必须完成作业"——must表示你的老师要求你。"我得去买菜"——have to表示生活需要。',
    },
    examPoints: [
      { point: 'mustn\'t vs don\'t have to', example: 'You mustn\'t tell lies. (禁止) vs You don\'t have to tell lies. (不必)', frequency: 5 },
      { point: 'must have done vs can\'t have done', example: 'He must have studied hard. vs He can\'t have cheated on the exam.', frequency: 5 },
      { point: 'should have done', example: 'You should have arrived earlier.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'must have done（对过去的肯定推测）', meaning: '一定已经...', example: 'It must have rained last night because the ground is wet.' },
      { pattern: 'can\'t have done（对过去的否定推测）', meaning: '不可能...', example: 'He can\'t have stolen the money; he was with me all day.' },
      { pattern: 'should/ought to have done（本应该）', meaning: '本应该...（但没做）', example: 'You should have told me the truth earlier.' },
      { pattern: 'needn\'t have done（不必做却做了）', meaning: '本不必...（但做了）', example: 'You needn\'t have brought so much food.' },
    ],
    examples: [
      { sentence: 'You must finish the assignment before the deadline.', translation: '你必须在截止日期前完成作业。', keyWords: ['finish', 'deadline', 'must'], grammarHighlight: 'must [必须]' },
      { sentence: 'It must have been John who called you last night.', translation: '昨晚给你打电话的肯定是约翰。', keyWords: ['called', 'night', 'must'], grammarHighlight: 'must have been [对过去的肯定推测]' },
      { sentence: 'You should have apologized to her for being late.', translation: '你本应该因为迟到向她道歉的。', keyWords: ['apologized', 'late', 'should'], grammarHighlight: 'should have apologized [本应该]' },
    ],
    commonMistakes: [
      { mistake: 'You mustn\'t leave now. You can leave now.', correct: 'You mustn\'t leave now. (禁止) / You don\'t have to leave now. (不必)', reason: 'mustn\'t是禁止，don\'t have to才是不必' },
      { mistake: 'He must have gone home, can\'t he?', correct: 'He must have gone home, hasn\'t he?', reason: 'must have done反意疑问与must的时间一致' },
    ],
    textbookRef: '必修② Unit 1',
    difficulty: 3,
    examType: ['语法填空', '完形填空'],
    examWeight: 18,
  },
  {
    id: 'stage6-03',
    stage: 6,
    stageName: '阶段六：情态动词与连词',
    category: '情态动词',
    name: '情态动词辨析',
    structure: {
      formula: 'need/dare/will/would',
      components: ['need作情态动词：need do / needn\'t do / need have done', 'dare作情态动词：dare (to) do', 'will表示意愿/习惯/请求', 'would表示过去习惯/委婉请求'],
    },
    explanation: {
      simple: 'need"需要"，dare"敢"，will"愿意/将"，would"过去愿意/将会"。',
      detailed: 'need可作情态动词（need do）和实义动词（need to do）。needn\'t have done表示"本不必做（但做了）"。dare可作情态动词（dare (to) do）和实义动词。will表示将来的趋势、意愿或习惯性动作（肯定倾向）。would表示过去的意愿、习惯性动作（过去的倾向）或委婉请求（would you...?）。used to表示"过去常常"。',
      analogy: '"你需要帮忙吗？"——need是情态动词。"我过去常常跑步"——used to表示过去的习惯。',
    },
    examPoints: [
      { point: 'needn\'t have done vs didn\'t need to do', example: 'You needn\'t have walked so fast. (不必走那么快但走了) vs You didn\'t need to walk so fast. (不必走那么快所以没走)', frequency: 5 },
      { point: 'will vs would', example: 'She will sit there for hours. vs She would sit there for hours when she was young.', frequency: 4 },
      { point: 'used to vs would', example: 'I used to smoke. (过去习惯，不强调反复) vs He would visit his grandmother every Sunday. (过去反复发生)', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'needn\'t have done（做了但不必）', meaning: '本不必...（但做了）', example: 'I needn\'t have bought so much food; we have so little now.' },
      { pattern: 'would rather/would prefer to do', meaning: '宁愿做...', example: 'I would rather stay at home than go out.' },
      { pattern: 'would you mind + doing?', meaning: '你介意做...吗？', example: 'Would you mind opening the window?' },
      { pattern: 'would like/want/hope + to do', meaning: '想要/希望做...', example: 'I would like to reserve a table for dinner.' },
    ],
    examples: [
      { sentence: 'You needn\'t have brought so many books. We have enough already.', translation: '你本不必带这么多书来。我们已经够用了。', keyWords: ['brought', 'books', 'enough'], grammarHighlight: 'needn\'t have done [做了但不必]' },
      { sentence: 'I used to get up early when I was a student.', translation: '我当学生的时候常常早起。', keyWords: ['used to', 'student', 'early'], grammarHighlight: 'used to [过去习惯]' },
      { sentence: 'Would you like to have some tea?', translation: '你想喝点茶吗？', keyWords: ['like', 'tea', 'would'], grammarHighlight: 'Would you like [委婉邀请]' },
    ],
    commonMistakes: [
      { mistake: 'I didn\'t need to go there, so I didn\'t go.', correct: 'I didn\'t need to go there, so I didn\'t go.', reason: '两者都可表示"不必去"但动作结果相同' },
      { mistake: 'I needn\'t have watered the flowers. It rained.', correct: 'I needn\'t have watered the flowers because it rained.', reason: 'needn\'t have done指已做了但本不必做（结果已发生）' },
    ],
    textbookRef: '选择性必修① Unit 2',
    difficulty: 3,
    examType: ['语法填空', '完形填空'],
    examWeight: 14,
  },
];

// ===================== 阶段七：介词与介词短语 =====================
const STAGE7_POINTS: GrammarPoint[] = [
  {
    id: 'stage7-01',
    stage: 7,
    stageName: '阶段七：介词与介词短语',
    category: '介词',
    name: '时间介词',
    structure: {
      formula: 'at/on/in + 时间 | by/before/after/until + 时间 | in + 年月季 | on + 具体日期',
      components: ['at: 时刻钟点/节日', 'on: 具体日期/星期', 'in: 年月季/上午下午晚上/时间段', 'by: 截止到', 'before/after: 之前/之后'],
    },
    explanation: {
      simple: 'at/on/in是最常用时间介词，分别对应"时刻"、"日期"、"时间段"。',
      detailed: 'at用于时刻钟点（at 6 o\'clock）、节日（at Christmas）、小地点（at the station）。on用于具体日期（on Monday, on July 1st, on the weekend）、特定 morning/afternoon/night（on a rainy night）。in用于年（in 2020）、月（in May）、季（in summer）、上午下午晚上（in the morning）、较长时间段。by表示"到...为止"，before表示"在...之前"，after表示"在...之后"，until表示"直到..."。',
      analogy: '"在六点"用at，"在周一"用on，"在夏天"用in。',
    },
    examPoints: [
      { point: 'at/on/in精细辨析', example: 'at noon / on Monday morning / in the morning', frequency: 5 },
      { point: 'in/on the way vs by the way', example: 'on the way to... / by the way', frequency: 4 },
      { point: 'by + 时间 vs before + 时间', example: 'by Friday = before Friday = not later than Friday', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'at the age of / at that time / at present', meaning: '在...岁/在那时/目前', example: 'At the age of 18, he left home.' },
      { pattern: 'on behalf of / on purpose / on average', meaning: '代表/故意/平均', example: 'On behalf of our school, I welcome you.' },
      { pattern: 'in advance / in addition / in return', meaning: '提前/另外/作为回报', example: 'You should book tickets in advance.' },
      { pattern: 'in the end = finally = at last', meaning: '最终', example: 'In the end, they reached an agreement.' },
      { pattern: 'to date = so far = up to now = until now', meaning: '到目前为止', example: 'To date, over 1000 students have signed up.' },
    ],
    examples: [
      { sentence: 'We usually have classes in the morning and do homework in the evening.', translation: '我们通常上午上课，晚上做作业。', keyWords: ['classes', 'morning', 'evening'], grammarHighlight: 'in the morning/evening' },
      { sentence: 'The conference will be held on October 15th, 2025.', translation: '会议将于2025年10月15日举行。', keyWords: ['conference', 'October', 'held'], grammarHighlight: 'on October 15th [具体日期]' },
      { sentence: 'By the time I got to the station, the train had already left.', translation: '当我到达车站时，火车已经开走了。', keyWords: ['station', 'train', 'already'], grammarHighlight: 'By the time...had left [by+完成时]' },
    ],
    commonMistakes: [
      { mistake: 'I will finish it in next Monday.', correct: 'I will finish it by next Monday. / on next Monday.', reason: 'in next Monday错误，应用by next Monday或on Monday next week' },
      { mistake: 'We will meet at the evening.', correct: 'We will meet in the evening.', reason: 'evening是时间段，用in不用at' },
    ],
    textbookRef: '必修① Unit 2',
    difficulty: 2,
    examType: ['语法填空', '完形填空'],
    examWeight: 15,
  },
  {
    id: 'stage7-02',
    stage: 7,
    stageName: '阶段七：介词与介词短语',
    category: '介词',
    name: '地点/方向介词',
    structure: {
      formula: 'at/in/on + 地点 | to/from/towards + 方向 | over/under/above/below + 位置',
      components: ['at: 小地点/具体位置', 'in: 大地方/内部', 'on: 表面', 'over/under: 正上方/正下方', 'above/below: 不强调正上方/下方'],
    },
    explanation: {
      simple: 'at是小地点，in是大地方，on是表面；over是"正上方"，above是"上方"。',
      detailed: 'at表示较小地点或具体位置（at home, at the door）；in表示大地方内部（in Beijing）；on表示表面接触（on the table）。over表示正上方且覆盖（fly over the mountain），above表示上方但不一定是正上（the picture above the sofa）。under是over的反义词，below是above的反义词。through穿过内部，across穿过表面。',
      analogy: '"在桌子上"用on，"在房间里"用in，"在门口"用at。',
    },
    examPoints: [
      { point: 'in/at/on地点精细辨析', example: 'in the world / at the door / on the wall', frequency: 5 },
      { point: 'over vs above vs on', example: 'The plane flew over the city. / The city is above us. / Put it on the desk.', frequency: 4 },
      { point: 'through vs across vs past', example: 'through the forest / across the street / walk past the school', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'in front of vs in the front of（在...前面/前部）', meaning: '在...前面（外部）/在...前部（内部）', example: 'in front of the classroom vs in the front of the classroom' },
      { pattern: 'to the north/south of / in the north/south of', meaning: '在...北/南方（外部）/在...北部/南部（内部）', example: 'Japan is to the east of China. / Shanghai is in the east of China.' },
      { pattern: 'on the left/right of', meaning: '在...左/右边', example: 'The bank is on the right of the post office.' },
    ],
    examples: [
      { sentence: 'My hometown lies in the south of China.', translation: '我的家乡位于中国南方。', keyWords: ['hometown', 'south', 'China'], grammarHighlight: 'in the south of [内部]' },
      { sentence: 'The bridge over the river was built 200 years ago.', translation: '河上的那座桥建于200年前。', keyWords: ['bridge', 'river', 'built'], grammarHighlight: 'over [正上方/跨越]' },
      { sentence: 'We walked through the forest and arrived at a small village.', translation: '我们穿过森林，到达了一个小村庄。', keyWords: ['walked', 'through', 'forest'], grammarHighlight: 'through [穿过内部]' },
    ],
    commonMistakes: [
      { mistake: 'Japan is in the east of China.', correct: 'Japan is to the east of China.', reason: 'Japan不在中国内部，用to' },
      { mistake: 'The cat is above the table.', correct: 'The cat is on the table. / above the table.', reason: '如果猫在桌子上，用on；above只表示上方位置关系' },
    ],
    textbookRef: '必修① Unit 5',
    difficulty: 2,
    examType: ['语法填空', '完形填空', '阅读'],
    examWeight: 12,
  },
  {
    id: 'stage7-03',
    stage: 7,
    stageName: '阶段七：介词与介词短语',
    category: '介词',
    name: '动词+介词/副词短语',
    structure: {
      formula: 'V + 介词 + O | V + 副词',
      components: ['动介短语：及物，必须带宾语', '动副短语：不及物，可不带宾语', '可分离：动副可分开（动词+名词+副词）', '不可分离：介词必须紧跟动词'],
    },
    explanation: {
      simple: '动词+介词（look at）后必须接宾语，动词+副词（turn on）可分开。',
      detailed: '短语动词分为：1）不及物动词+介词：look at, listen to, arrive at, laugh at（不可分）；2）不及物动词+副词：turn on, look up, put away（可分开）。可分离时，名词可放中间或后面（pick up the book = pick the book up），代词必须放中间（pick it up）。介词和连词：because of, thanks to, instead of, in addition to, in spite of, despite。',
      analogy: '"看我"——look at，at是介词，必须有东西可看。"打开灯"——turn on，副词on可以让"灯"放中间（turn the light on）或放前面（turn on the light）。',
    },
    examPoints: [
      { point: '动副可分离：动词+副词+名词=动词+名词+副词', example: 'turn on the TV = turn the TV on / pick up the book = pick the book up', frequency: 5 },
      { point: '动介不可分离', example: 'look at, listen to, arrive at, wait for, laugh at', frequency: 5 },
      { point: '代词必须放中间', example: 'turn it on / pick them up', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'take off / put on / pick up / put away / turn off / switch on', meaning: '脱下/穿上/捡起/收拾/关掉/打开', example: 'Please pick up the papers on the floor.' },
      { pattern: 'come across / run into / look forward to / lead to / belong to', meaning: '遇到/撞上/期待/导致/属于', example: 'I came across an old friend in the supermarket.' },
      { pattern: 'make up / make out / make for / make up for', meaning: '组成/理解/走向/弥补', example: 'Hard work will make up for the lack of experience.' },
      { pattern: 'get along/on (with) / get up / get over / get through', meaning: '相处/起床/克服/通过', example: 'How are you getting along with your classmates?' },
    ],
    examples: [
      { sentence: 'We should look forward to the future with optimism.', translation: '我们应该乐观地展望未来。', keyWords: ['forward', 'future', 'optimism'], grammarHighlight: 'look forward to [动词+副词+介词，to为介词]' },
      { sentence: 'Please turn off the lights before you leave.', translation: '离开前请关灯。', keyWords: ['turn off', 'lights', 'leave'], grammarHighlight: 'turn off [动副，可分]' },
      { sentence: 'He is waiting for his girlfriend at the school gate.', translation: '他正在校门口等他的女朋友。', keyWords: ['waiting', 'girlfriend', 'gate'], grammarHighlight: 'wait for [动介，不可分]' },
    ],
    commonMistakes: [
      { mistake: 'Please turn it off the lights.', correct: 'Please turn off the lights. / Please turn it off.', reason: '名词可放中间或后面，但两个名词不能同时出现' },
      { mistake: 'I look forward to meet you.', correct: 'I look forward to meeting you.', reason: 'look forward to中to是介词，后接动名词' },
    ],
    textbookRef: '必修② Unit 5',
    difficulty: 3,
    examType: ['语法填空', '短文改错', '阅读'],
    examWeight: 18,
  },
];

// ===================== 阶段八：高考综合与特殊结构 =====================
const STAGE8_POINTS: GrammarPoint[] = [
  {
    id: 'stage8-01',
    stage: 8,
    stageName: '阶段八：高考综合与特殊结构',
    category: '综合',
    name: '并列结构与省略',
    structure: {
      formula: 'A and/or/but/nor/yet/so + B | 承前省略：同样的词不再重复',
      components: ['and和, or或者, but但是, nor也不, yet然而, so所以', 'both...and...两者都', 'either...or...或者...或者', 'neither...nor...既不...也不', 'not only...but also...不仅...而且...'],
    },
    explanation: {
      simple: '并列结构用连词连接两个对等的成分，省略是为了避免重复。',
      detailed: '并列连词and, or, but, nor, yet, so连接对等的词、短语或句子。注意：not only...but also...连接主语时，谓语与最近的主语一致（Not only you but also he is wrong.）。承前省略：在并列句中，后一分句与前一分句相同的部分可以省略（I like English and she likes English too. → I like English and she does too.）。so/neither/nor + 助动词 + 主语。',
      analogy: '就像说"我吃苹果和香蕉"——and连接两个对等的东西。',
    },
    examPoints: [
      { point: 'Not only...but also...主谓一致', example: 'Not only the teacher but also the students were excited.', frequency: 4 },
      { point: '承前省略', example: 'I passed the exam and so did she.', frequency: 5 },
      { point: 'neither/nor/so替代结构', example: 'I don\'t smoke. Neither/Nor do I. / I work hard. So do I.', frequency: 5 },
    ],
    fixedCombinations: [
      { pattern: 'either...or... / neither...nor...', meaning: '或者...或者.../既不...也不...', example: 'Either you come with me or you stay here alone.' },
      { pattern: 'both...and... / not only...but also...', meaning: '两者都.../不仅...而且...', example: 'Both you and I are students. / Not only is he smart, but also he is kind.' },
      { pattern: 'and yet / and so / and therefore', meaning: '然而/所以/因此', example: 'He studied hard, and yet he failed.' },
    ],
    examples: [
      { sentence: 'Not only did he finish his homework, but he also helped his mother with housework.', translation: '他不仅完成了作业，还帮妈妈做家务。', keyWords: ['finish', 'homework', 'helped'], grammarHighlight: 'Not only...but also [倒装]' },
      { sentence: 'I enjoy reading novels and my sister enjoys watching movies.', translation: '我喜欢看小说，我姐姐喜欢看电影。', keyWords: ['reading', 'novels', 'sister'], grammarHighlight: 'and [并列谓语]' },
      { sentence: 'You can\'t sing, and neither can I.', translation: '你不会唱歌，我也不会。', keyWords: ['sing', 'neither', 'can'], grammarHighlight: 'neither can I [倒装]' },
    ],
    commonMistakes: [
      { mistake: 'Not only he but also his parents is coming.', correct: 'Not only he but also his parents are coming.', reason: 'not only...but also连接主语时，谓语与最近的主语一致' },
      { mistake: 'He is a teacher and writer.', correct: 'He is a teacher and writer.', reason: 'a teacher and writer指同一个人有两种身份' },
    ],
    textbookRef: '必修① Unit 1',
    difficulty: 2,
    examType: ['语法填空', '短文改错'],
    examWeight: 14,
  },
  {
    id: 'stage8-02',
    stage: 8,
    stageName: '阶段八：高考综合与特殊结构',
    category: '综合',
    name: '主谓一致',
    structure: {
      formula: '语法一致 | 意义一致 | 就近一致',
      components: ['语法一致：主语是单数谓语单数', '意义一致：主语表单数概念谓语单数', '就近一致：谓语与最近的主语一致'],
    },
    explanation: {
      simple: '主谓一致就是谓语动词的形式要和主语的数量保持一致。',
      detailed: '主谓一致遵循三个原则：1）语法一致：主语是单数名词/代词，谓语用单数；复数谓语复数。2）意义一致：主语表单数概念用单数谓语（The news is good. / Mathematics is hard.）；表单数整体的复数名词用单数谓语（The United States is...）。3）就近一致：either...or..., neither...nor..., not only...but also...，谓语与最近的主语一致。特别：a number of + 复数谓语复数，the number of + 单数谓语单数。',
      analogy: '就像"一只猫在跑"说is，"两只猫在跑"说are。',
    },
    examPoints: [
      { point: '集体名词谓语选择', example: 'The family is large. / The family are all teachers.', frequency: 4 },
      { point: '就近一致', example: 'Neither you nor I am right.', frequency: 5 },
      { point: '分数/百分数 of + 名词谓语选择', example: 'Half of the students have finished the work.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'each/every/no + 单数名词 + and + each/every/no + 单数名词 → 单数谓语', meaning: '每个...和每个...（表单数整体）', example: 'Every teacher and every student was asked to attend.' },
      { pattern: 'A number of / Numbers of + 复数名词 → 复数谓语', meaning: '许多', example: 'A number of students are absent today.' },
      { pattern: 'the number of + 复数名词 → 单数谓语', meaning: '...的数量', example: 'The number of students in our school is 2000.' },
      { pattern: 'more than one + 单数名词 → 单数谓语（习惯用法）', meaning: '不只一个', example: 'More than one student has made the same mistake.' },
    ],
    examples: [
      { sentence: 'Either you or he is wrong.', translation: '不是你错就是他错。', keyWords: ['wrong', 'either', 'either'], grammarHighlight: 'is wrong [就近一致，he是最近主语]' },
      { sentence: 'Three-fourths of the surface of the earth is covered with water.', translation: '地球表面四分之三被水覆盖。', keyWords: ['surface', 'earth', 'covered'], grammarHighlight: 'is [三分之四作为整体]' },
      { sentence: 'The police are investigating the case.', translation: '警察正在调查这个案件。', keyWords: ['police', 'investigating', 'case'], grammarHighlight: 'The police [集体名词表复数]' },
    ],
    commonMistakes: [
      { mistake: 'The news are good today.', correct: 'The news is good today.', reason: 'news是不可数的抽象名词概念，谓语用单数' },
      { mistake: 'Each of the students have a dictionary.', correct: 'Each of the students has a dictionary.', reason: 'Each of + 复数名词/代词，谓语用单数' },
    ],
    textbookRef: '选择性必修③ Unit 2',
    difficulty: 3,
    examType: ['语法填空', '短文改错'],
    examWeight: 16,
  },
  {
    id: 'stage8-03',
    stage: 8,
    stageName: '阶段八：高考综合与特殊结构',
    category: '综合',
    name: '高考长难句分析',
    structure: {
      formula: '识别主干：主谓 → 从句 → 修饰成分 → 特殊结构',
      components: ['找谓语动词确定主句', '找从属连词确定从句', '找介词短语/分词作修饰', '找特殊结构（强调/倒装/省略/插入语）'],
    },
    explanation: {
      simple: '长难句分析的关键是化繁为简：先找主谓，再逐层剥离修饰成分。',
      detailed: '分析步骤：1）找谓语动词（确定主句数量）；2）找从属连词（who, which, that, because, when, if等——确定从句边界）；3）识别并列结构（and/or/but）；4）识别修饰成分（介词短语、分词、不定式）；5）识别特殊结构（强调、倒装、省略、插入语）。特别注意：非限制性定语从句（前有逗号）不能用that。定语从句与同位语从句的区别：that在定语从句中作成分，在同位语从句中只起连接作用。',
      analogy: '就像拆解积木：先找到地基（主谓），再看哪些是附加的（从句），哪些是装饰的（修饰语）。',
    },
    examPoints: [
      { point: '识别并列句', example: '并列连词and/or/but的识别和句子简化', frequency: 5 },
      { point: '识别嵌套从句', example: 'I think that the girl who is dancing is my sister.', frequency: 5 },
      { point: '识别特殊结构干扰', example: 'Not only did he come late, but (he) also caused trouble.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: '主句主谓 + [who/which/that + ...] + [介词短语/分词/不定式]', meaning: '主干 + 定语/状语/补语', example: 'The man (who I met yesterday) (at the station) (holding a red bag) is my uncle.' },
      { pattern: 'It is...that... / It is...who...（强调句）', meaning: '正是...', example: 'It was at midnight that I finally solved the problem.' },
      { pattern: 'No matter what/who/how... = Whatever/Whoever/However...', meaning: '无论...', example: 'No matter what happens, / Whatever happens, I will support you.' },
    ],
    examples: [
      { sentence: 'The scientist (who won the Nobel Prize) (in 2023) is working (in a lab) (in Beijing).', translation: '2023年获得诺贝尔奖的那位科学家正在北京的一个实验室工作。', keyWords: ['scientist', 'Nobel', 'working'], grammarHighlight: 'who...in 2023 [定语从句]; in a lab [介词短语作地点状语]' },
      { sentence: 'The book (which is on the desk) (which I bought yesterday) is very interesting.', translation: '桌上那本我昨天买的书很有趣。', keyWords: ['book', 'desk', 'interesting'], grammarHighlight: 'which...on the desk + which I bought yesterday [两个定语从句并列]' },
      { sentence: 'The reason (why he failed) (is that he didn\'t work hard enough).', translation: '他失败的原因是他不够努力。', keyWords: ['reason', 'failed', 'didn\'t'], grammarHighlight: 'why he failed [定语从句]; that he didn\'t work hard [表语从句]' },
    ],
    commonMistakes: [
      { mistake: '不识别插入语', correct: 'The book, I think, is interesting. → I think the book is interesting.', reason: 'I think等插入语不影响句子主干' },
      { mistake: '混淆定语从句和同位语从句', correct: 'The news that he told us is true. (定语，that作宾语) vs The news that he won is true. (同位语，that只连接)', reason: 'that在定语从句中作成分，在同位语从句中只起连接作用' },
    ],
    textbookRef: '高考综合',
    difficulty: 5,
    examType: ['阅读', '完形填空', '语法填空', '短文改错', '写作'],
    examWeight: 30,
  },
  {
    id: 'stage8-04',
    stage: 8,
    stageName: '阶段八：高考综合与特殊结构',
    category: '综合',
    name: '特殊动词用法总结',
    structure: {
      formula: '感官动词 + O + doing/do | 使役动词 + O + doing/to do | 延续性动词用于完成时',
      components: ['感官：see/watch/hear/feel + O + doing（进行）/do（全过程）', '使役：have/make/let + O + do；get + O + to do', '延续性vs终止性动词用于完成时'],
    },
    explanation: {
      simple: '感官和使役动词后接省to的不定式或动名词，用法有讲究。',
      detailed: '感官动词see/watch/observe/hear/feel + 宾语 + doing（正在进行）或do（全过程）。使役动词：have/make/let + 宾语 + do（主动）；get + 宾语 + to do（主动）。变被动时：see/watch/hear O be done；have/get O done（让别 人做某事）。终止性动词（come, go, arrive, leave, start, begin）用于完成时不能与for/since连用，要用be + 延续性动词。',
      analogy: '"我看见她在跳舞"——用doing。"我看见她跳完了舞"——用do表示全过程。',
    },
    examPoints: [
      { point: '感官动词后doing vs do', example: 'I heard her singing. (正在唱) vs I heard her sing the National Anthem. (唱完了)', frequency: 5 },
      { point: 'have sth done', example: 'I had my hair cut yesterday. (让别人剪)', frequency: 5 },
      { point: '终止性→延续性转换', example: 'He has come. → He has been here. / He has left. → He has been away.', frequency: 4 },
    ],
    fixedCombinations: [
      { pattern: 'have/get + O + done', meaning: '让（别人）做... / 遭遇...', example: 'I had my bike stolen last night.' },
      { pattern: 'can\'t help doing = can\'t help but do', meaning: '忍不住...', example: 'She couldn\'t help laughing when she heard the joke.' },
      { pattern: 'find it + adj + to do', meaning: '发现做...是...的', example: 'I find it important to learn English well.' },
      { pattern: 'leave + O + doing/done/to do', meaning: '让...保持...状态/被...', example: 'Leave the door unlocked. / Leave the work to be done tomorrow.' },
    ],
    examples: [
      { sentence: 'I saw him crossing the road when the accident happened.', translation: '事故发生时，我看见他正在过马路。', keyWords: ['crossing', 'accident', 'happened'], grammarHighlight: 'saw O doing [正在进行]' },
      { sentence: 'I had my car repaired yesterday.', translation: '昨天我（让人）修了车。', keyWords: ['repaired', 'car', 'yesterday'], grammarHighlight: 'had O done [让别人做]' },
      { sentence: 'The story has moved me deeply.', translation: '这个故事深深打动了我。', keyWords: ['story', 'moved', 'deeply'], grammarHighlight: 'moved [及物动词，主语为受影响者]' },
    ],
    commonMistakes: [
      { mistake: 'I heard him to sing a song.', correct: 'I heard him sing a song. / I heard him singing a song.', reason: '感官动词后不定式要省to' },
      { mistake: 'He has come here for three days.', correct: 'He has been here for three days.', reason: '终止性动词不能与for/since连用' },
    ],
    textbookRef: '高考综合',
    difficulty: 4,
    examType: ['语法填空', '短文改错', '阅读'],
    examWeight: 25,
  },
];

// ===================== 汇总导出 =====================

export const GRAMMAR_STAGES: GrammarStage[] = [
  { stage: 1, name: '阶段一：词法基础', description: '名词、冠词、代词、数词', points: STAGE1_POINTS },
  { stage: 2, name: '阶段二：时态与被动语态', description: '六种基本时态 + 被动语态', points: STAGE2_POINTS },
  { stage: 3, name: '阶段三：非谓语动词', description: '不定式、动名词、分词', points: STAGE3_POINTS },
  { stage: 4, name: '阶段四：三大从句', description: '定语从句、名词性从句、状语从句', points: STAGE4_POINTS },
  { stage: 5, name: '阶段五：特殊句式', description: '倒装句、虚拟语气、强调句、祈使感叹', points: STAGE5_POINTS },
  { stage: 6, name: '阶段六：情态动词与连词', description: '情态动词精细辨析', points: STAGE6_POINTS },
  { stage: 7, name: '阶段七：介词与介词短语', description: '时间、地点、动词短语介词', points: STAGE7_POINTS },
  { stage: 8, name: '阶段八：高考综合与特殊结构', description: '并列、省略、主谓一致、长难句', points: STAGE8_POINTS },
];

// 所有语法点的扁平数组
export const ALL_GRAMMAR_POINTS: GrammarPoint[] = GRAMMAR_STAGES.flatMap(s => s.points);

// 按ID索引
export const GRAMMAR_POINTS_BY_ID: Record<string, GrammarPoint> = Object.fromEntries(
  ALL_GRAMMAR_POINTS.map(p => [p.id, p])
);

// 高考考点权重速查表（按权重排序）
export const GRAMMAR_EXAM_FOCUS: { id: string; name: string; weight: number; category: string }[] =
  [...ALL_GRAMMAR_POINTS]
    .filter(p => p.examWeight !== undefined)
    .sort((a, b) => (b.examWeight || 0) - (a.examWeight || 0))
    .map(p => ({ id: p.id, name: p.name, weight: p.examWeight || 0, category: p.category }));

// 固定搭配总表（用于AI识别）
export const FIXED_EXPRESSIONS = [
  ...ALL_GRAMMAR_POINTS.flatMap(p => p.fixedCombinations.map(c => ({ ...c, grammarId: p.id }))),
];
