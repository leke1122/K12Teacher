export interface PoliticsChapter {
  id: string;
  title: string;
  module: 'economics' | 'politics' | 'philosophy' | 'culture';
  moduleName: string;
  topics: string[];
}

export interface PoliticsKnowledgeItem {
  id: string;
  type: 'concept' | 'theory' | 'assertion' | 'principle';
  title: string;
  definition: string;
  elements: string[];
  analogy: string;
  liaoningExample: string;
  chapterId: string;
}

export interface ConceptPair {
  id: string;
  group: string;
  concepts: {
    name: string;
    definition: string;
    core: string;
    distinction: string;
    example: string;
  }[];
  question: string;
  options: { label: string; text: string; correct: boolean }[];
  explanation: string;
  synthesisQuestion: string;
  synthesisHint: string;
}

export interface CurrentAffair {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
  relatedKnowledge: string[];
  examAngles: string[];
  questions: {
    question: string;
    hint: string;
  }[];
}

export interface SynthesisCase {
  id: string;
  title: string;
  scenario: string;
  modules: ('economics' | 'politics' | 'philosophy' | 'culture')[];
  questions: {
    angle: string;
    question: string;
    hint: string;
  }[];
  referenceFramework: string;
  referenceAnswer: string;
}

export interface EssayQuestion {
  id: string;
  title: string;
  scenario: string;
  requirements: string[];
  scoringCriteria: {
    viewpoint: string;
    theory: string;
    material: string;
    conclusion: string;
    terminology: string;
  };
  referenceAnswer: string;
  improvementTips: string[];
  difficulty: '简单' | '中等' | '困难';
}

export const POLITICS_CHAPTERS: PoliticsChapter[] = [
  { id: 'politics-compulsory-1', title: '必修1 中国特色社会主义', module: 'economics', moduleName: '经济', topics: ['社会主义从空想到科学', '新民主主义革命', '社会主义制度建立', '中国特色社会主义'] },
  { id: 'politics-compulsory-2', title: '必修2 经济与社会', module: 'economics', moduleName: '经济', topics: ['生产与经济制度', '分配与社会保障', '消费与交换', '经济发展', '对外开放'] },
  { id: 'politics-compulsory-3', title: '必修3 政治与法治', module: 'politics', moduleName: '政治', topics: '中国共产党的领导、人民当家作主、全面依法治国'.split('、') },
  { id: 'politics-compulsory-4', title: '必修4 哲学与文化', module: 'philosophy', moduleName: '哲学与文化', topics: ['唯物论', '认识论', '辩证法', '历史唯物主义', '文化传承'] },
  { id: 'politics-selective-1', title: '选择性必修1 当代国际政治与经济', module: 'politics', moduleName: '政治', topics: ['国家主权', '世界多极化', '经济全球化', '国际组织'] },
  { id: 'politics-selective-2', title: '选择性必修2 法律与生活', module: 'politics', moduleName: '政治', topics: ['民事权利与义务', '家庭与婚姻', '就业与创业', '诉讼与维权'] },
  { id: 'politics-selective-3', title: '选择性必修3 逻辑与思维', module: 'philosophy', moduleName: '逻辑', topics: ['形式逻辑', '辩证思维', '创新思维'] },
];

export const CHAPTER_TITLES: Record<string, string> = Object.fromEntries(
  POLITICS_CHAPTERS.map((ch) => [ch.id, ch.title])
);

export const CONCEPT_PAIRS: ConceptPair[] = [
  {
    id: 'concept-pair-1',
    group: '经济制度辨析',
    concepts: [
      {
        name: '公有制',
        definition: '生产资料归全体人民或部分劳动者共同所有的形式。',
        core: '强调生产资料的归属权，是社会主义经济制度的基础。',
        distinction: '是更上位的概念，包括国有经济、集体经济以及混合所有制经济中的国有成分和集体成分。',
        example: '国有铁路、集体合作社、混合所有制中的国有股。',
      },
      {
        name: '国有经济',
        definition: '生产资料归国家所有的经济形式。',
        core: '公有制经济的主导力量，控制国民经济命脉。',
        distinction: '是公有制的组成部分之一，不等于全部公有制。',
        example: '中国石油、国家电网、中国铁路。',
      },
    ],
    question: '关于公有制与国有经济的关系，下列说法正确的是：',
    options: [
      { label: 'A', text: '公有制就是国有经济', correct: false },
      { label: 'B', text: '国有经济是公有制经济的组成部分', correct: true },
      { label: 'C', text: '公有制不包括集体经济', correct: false },
      { label: 'D', text: '国有经济与公有制相互独立', correct: false },
    ],
    explanation: '公有制是整体概念，国有经济是公有制的重要组成部分。我国实行公有制为主体、多种所有制经济共同发展的基本经济制度。',
    synthesisQuestion: '请结合辽宁实际，举例说明公有制经济在辽宁振兴中的作用。',
    synthesisHint: '可以从辽中南工业基地的国有企业改革、集体经济（农村合作组织）等角度思考。',
  },
  {
    id: 'concept-pair-2',
    group: '市场与政府关系',
    concepts: [
      {
        name: '有效市场',
        definition: '市场在资源配置中起决定性作用。',
        core: '强调价格机制、竞争机制、供求机制对资源配置的高效性。',
        distinction: '主要解决"效率"问题，让资源流向最需要的地方。',
        example: '菜市场中价格涨落调节供需。',
      },
      {
        name: '有为政府',
        definition: '政府科学履行经济职能，进行宏观调控和市场监管。',
        core: '强调弥补市场失灵、维护公平竞争、提供公共服务。',
        distinction: '主要解决"公平"和"稳定"问题，不替代市场。',
        example: ' antitrust法、环保标准、最低工资政策。',
      },
    ],
    question: '关于"有效市场"和"有为政府"的关系，正确的是：',
    options: [
      { label: 'A', text: '二者是对立的，市场好就不需要政府', correct: false },
      { label: 'B', text: '二者要统一，市场决定性作用与政府作用相结合', correct: true },
      { label: 'C', text: '政府应直接干预企业经营', correct: false },
      { label: 'D', text: '市场可以解决一切问题', correct: false },
    ],
    explanation: '我国坚持使市场在资源配置中起决定性作用，更好发挥政府作用。市场不是万能的，政府也不能越位。',
    synthesisQuestion: '结合辽宁老工业基地转型，分析如何处理好"有效市场"和"有为政府"的关系？',
    synthesisHint: '可以从政府引导产业转型、市场配置资源、营商环境建设等角度分析。',
  },
  {
    id: 'concept-pair-3',
    group: '党的领导与依法治国',
    concepts: [
      {
        name: '党的领导',
        definition: '中国共产党是中国特色社会主义事业的领导核心。',
        core: '政治领导、思想领导、组织领导。',
        distinction: '是中国特色社会主义最本质的特征，是最大优势。',
        example: '党中央决策部署、党委领导一切工作。',
      },
      {
        name: '依法治国',
        definition: '依照宪法和法律治理国家。',
        core: '科学立法、严格执法、公正司法、全民守法。',
        distinction: '党领导人民制定和实施宪法法律，党自身也必须在宪法法律范围内活动。',
        example: '民法典、司法体制改革、法治政府建设。',
      },
    ],
    question: '党的领导与依法治国的关系是：',
    options: [
      { label: 'A', text: '二者相互矛盾', correct: false },
      { label: 'B', text: '党的领导是依法治国的根本保证，依法治国是党领导人民治理国家的基本方式', correct: true },
      { label: 'C', text: '依法治国可以替代党的领导', correct: false },
      { label: 'D', text: '党的领导可以超越法律', correct: false },
    ],
    explanation: '坚持党的领导、人民当家作主、依法治国有机统一。党的领导是依法治国的根本保证。',
    synthesisQuestion: '论述党的领导、人民当家作主、依法治国三者的关系。',
    synthesisHint: '可以从本质特征、实现途径、辩证统一等角度展开。',
  },
  {
    id: 'concept-pair-4',
    group: '矛盾观辨析',
    concepts: [
      {
        name: '主要矛盾',
        definition: '在事物发展过程中处于支配地位、对事物发展起决定作用的矛盾。',
        core: '决定事物的性质和发展方向。',
        distinction: '在复杂事物发展过程中只有一个，起主导作用。',
        example: '人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾。',
      },
      {
        name: '次要矛盾',
        definition: '在事物发展过程中处于从属地位、对事物发展不起决定作用的矛盾。',
        core: '影响事物发展，但不起决定作用。',
        distinction: '在复杂事物发展过程中有多个，需要统筹兼顾。',
        example: '经济发展中的就业、教育、医疗、环保等具体问题。',
      },
    ],
    question: '关于主要矛盾和次要矛盾，下列说法正确的是：',
    options: [
      { label: 'A', text: '主要矛盾只有一个，次要矛盾可以有多个', correct: true },
      { label: 'B', text: '主要矛盾和次要矛盾相互对立，不能兼顾', correct: false },
      { label: 'C', text: '解决了主要矛盾，次要矛盾就会自动解决', correct: false },
      { label: 'D', text: '次要矛盾决定事物的性质', correct: false },
    ],
    explanation: '主次矛盾辩证关系要求我们坚持两点论与重点论的统一。既要抓主要矛盾，又要统筹兼顾次要矛盾。',
    synthesisQuestion: '结合辽宁全面振兴，分析如何把握主要矛盾和次要矛盾？',
    synthesisHint: '可以从东北全面振兴的主要任务（经济高质量发展）和次要任务（民生、生态、安全等）角度思考。',
  },
];

export const CURRENT_AFFAIRS: CurrentAffair[] = [
  {
    id: 'affair-1',
    title: '东北全面振兴战略',
    date: '2023-2026',
    category: '区域发展',
    content: '2023年9月，习近平总书记在黑龙江考察时主持召开新时代推动东北全面振兴座谈会，强调以科技创新引领产业全面振兴，以高水平对外开放合作塑造发展新优势。辽宁作为东北三省之一，承担着重要使命。',
    relatedKnowledge: ['新发展理念', '高质量发展', '区域协调发展战略', '创新驱动发展战略', '高水平对外开放'],
    examAngles: ['东北全面振兴与高质量发展的关系', '辽宁如何实现产业转型升级', '东北全面振兴中的政府与市场作用'],
    questions: [
      {
        question: '东北全面振兴体现了什么发展理念？',
        hint: '从创新、协调、绿色、开放、共享五个方面思考。',
      },
      {
        question: '辽宁在东北全面振兴中应如何发挥自身优势？',
        hint: '结合辽中南工业基地基础、沿海区位、科教资源等思考。',
      },
    ],
  },
  {
    id: 'affair-2',
    title: '新质生产力',
    date: '2023-2026',
    category: '经济发展',
    content: '2023年9月，习近平总书记在黑龙江考察时首次提出"新质生产力"。新质生产力是创新起主导作用，摆脱传统经济增长方式、生产力发展路径，具有高科技、高效能、高质量特征，符合新发展理念的先进生产力质态。',
    relatedKnowledge: ['生产力与生产关系', '科技创新', '供给侧结构性改革', '高质量发展', '实体经济'],
    examAngles: ['新质生产力的科学内涵', '如何发展新质生产力', '新质生产力与传统生产力的关系'],
    questions: [
      {
        question: '发展新质生产力为什么要坚持创新引领？',
        hint: '从科技是第一生产力、创新是第一动力的角度思考。',
      },
      {
        question: '辽宁发展新质生产力有哪些优势和挑战？',
        hint: '从装备制造业基础、科教资源、产业结构等角度分析。',
      },
    ],
  },
  {
    id: 'affair-3',
    title: '北方生态安全屏障建设',
    date: '2024-2026',
    category: '生态文明',
    content: '2024年，国家启动北方生态安全屏障建设工程。辽宁位于东北亚生态安全屏障的核心区域，承担着科尔沁沙地南缘治理、辽河口湿地保护、浑河太子河治理等重要生态任务。',
    relatedKnowledge: ['绿水青山就是金山银山', '生态文明建设', '人与自然和谐共生', '绿色发展'],
    examAngles: ['北方生态安全屏障建设的意义', '辽宁如何参与生态安全屏障建设', '生态保护与经济发展的关系'],
    questions: [
      {
        question: '建设北方生态安全屏障体现了什么生态文明理念？',
        hint: '从人与自然和谐共生、绿水青山就是金山银山的角度思考。',
      },
    ],
  },
];

export const SYNTHESIS_CASES: SynthesisCase[] = [
  {
    id: 'synthesis-1',
    title: '东北全面振兴：经济、政治、哲学的融合',
    scenario: '材料一：2023年，辽宁省GDP增速达到5.3%，高于全国平均水平；装备制造业增加值增长12.8%，高新技术产业增加值增长15.2%。\n材料二：辽宁全面优化营商环境，深化"放管服"改革，政务服务事项网上可办率达到95%以上。\n材料三：习近平总书记强调："新时代东北全面振兴，面临新的重大机遇，也面临新的风险挑战。"\n结合上述材料，从经济、政治、哲学三个角度分析东北全面振兴的路径。',
    modules: ['economics', 'politics', 'philosophy'],
    questions: [
      { angle: '经济角度', question: '从经济角度，辽宁应如何推动高质量发展？', hint: '可以从新发展理念、供给侧结构性改革、科技创新、产业升级等角度思考。' },
      { angle: '政治角度', question: '从政治角度，政府应如何发挥作用？', hint: '可以从党的领导、政府职能、营商环境、依法行政等角度思考。' },
      { angle: '哲学角度', question: '从哲学角度，如何理解"机遇与挑战并存"？', hint: '可以从矛盾分析法、事物发展前进性与曲折性统一、发挥主观能动性等角度思考。' },
    ],
    referenceFramework: '经济角度：贯彻新发展理念，推动科技创新，优化产业结构。政治角度：坚持党的领导，转变政府职能，建设服务型政府。哲学角度：坚持矛盾分析法，把握机遇，迎接挑战。',
    referenceAnswer: '经济：贯彻创新、协调、绿色、开放、共享的新发展理念；深化供给侧结构性改革；推动装备制造业高端化智能化绿色化发展；培育壮大战略性新兴产业。政治：坚持和加强党的全面领导，为振兴提供政治保证；转变政府职能，深化"放管服"改革，优化营商环境；坚持依法行政，保护各类市场主体合法权益。哲学：矛盾具有普遍性，要正视困难与挑战；矛盾具有同一性，要在危机中育新机、于变局中开新局；坚持发挥主观能动性与尊重客观规律相结合。',
  },
  {
    id: 'synthesis-2',
    title: '北方生态安全屏障：政治、哲学、文化的融合',
    scenario: '材料一：辽宁实施科尔沁沙地南缘治理工程，完成沙化土地治理面积120万亩。材料二：辽宁建立辽河口湿地自然保护区，修复湿地生态面积30万亩。材料三：某市提出"生态美市"战略，将生态建设纳入干部考核体系。结合上述材料，从政治、哲学、文化角度分析生态建设的路径。',
    modules: ['politics', 'philosophy', 'culture'],
    questions: [
      { angle: '政治角度', question: '从政治角度，政府应如何推进生态治理？', hint: '可以从政府职能、生态文明建设、制度保障等角度思考。' },
      { angle: '哲学角度', question: '从哲学角度，如何理解人与自然的关系？', hint: '可以从自然界的客观性、人与自然和谐共生、价值观导向等角度思考。' },
      { angle: '文化角度', question: '从文化角度，如何培育生态文化？', hint: '可以从文化对人的影响、社会主义核心价值观、生态文明宣传教育等角度思考。' },
    ],
    referenceFramework: '政治角度：履行生态文明建设职能，完善生态制度体系，强化监督问责。哲学角度：自然界客观性要求尊重自然，人与自然和谐共生，价值观引导行动。文化角度：培育生态文化，发挥文化教化功能，践行绿色生活方式。',
    referenceAnswer: '政治：政府履行推进生态文明建设职能，加强生态保护和修复；建立生态环境监测和考核体系，落实生态补偿机制；完善环境保护法律法规，严格执法监督。哲学：自然界具有客观性，承认自然的客观性是人类处理人与自然关系的前提；坚持人与自然和谐共生，保护自然就是保护人类自身；正确的价值观引导人们做出正确的价值判断和价值选择。文化：培育生态文化，发挥文化对人的潜移默化影响；开展生态文明宣传教育，提高公众生态意识；将生态理念融入文化建设，形成绿色生产生活方式。',
  },
  {
    id: 'synthesis-3',
    title: '辽宁老工业基地转型：经济、政治、哲学的融合',
    scenario: '材料一：2024年，辽宁推进结构调整"三篇大文章"，培育壮大新兴产业，改造提升传统产业。材料二：辽宁实施人才强省战略，出台"兴辽英才计划"，引进高层次人才2000余人。材料三：某老国企通过混合所有制改革，引入民营资本，实现扭亏为盈。结合上述材料，分析老工业基地转型的路径。',
    modules: ['economics', 'politics', 'philosophy'],
    questions: [
      { angle: '经济角度', question: '从经济角度，老工业基地如何实现转型发展？', hint: '可以从供给侧结构性改革、创新驱动、产业多元化、混合所有制改革等角度思考。' },
      { angle: '政治角度', question: '从政治角度，如何为转型提供保障？', hint: '可以从党的领导、政府政策支持、营商环境、人才引进等角度思考。' },
      { angle: '哲学角度', question: '从哲学角度，如何理解"转型升级"？', hint: '可以从辩证否定观、创新意识、事物发展曲折性等角度思考。' },
    ],
    referenceFramework: '经济角度：深化供给侧结构性改革，培育新兴产业，改造传统产业，发展混合所有制经济。政治角度：坚持党的领导，政府提供政策支持，营造良好营商环境，实施人才强省战略。哲学角度：坚持辩证否定观，扬弃传统，创新发展；重视意识能动作用，解放思想，更新观念。',
    referenceAnswer: '经济：深化供给侧结构性改革，推进结构调整"三篇大文章"；培育壮大战略性新兴产业，改造提升传统装备制造业；坚持公有制为主体、多种所有制经济共同发展，深化国企改革，发展混合所有制经济；实施创新驱动发展战略，以科技创新引领产业振兴。政治：坚持和加强党的全面领导，为转型发展提供坚强政治保证；政府履行经济职能，出台产业政策、人才政策支持转型；优化营商环境，吸引各类要素集聚；实施人才强省战略，为振兴提供人才支撑。哲学：坚持辩证否定观，对传统产业不是简单抛弃，而是"扬弃"，在继承中发展；树立创新意识，突破传统路径依赖；坚持事物发展前进性与曲折性统一，既要坚定信心，又要做好充分准备。',
  },
];

export const ESSAY_QUESTIONS: EssayQuestion[] = [
  {
    id: 'essay-1',
    title: '东北全面振兴与高质量发展',
    scenario: '材料一：2023年，辽宁省装备制造业占全省工业比重超过30%，高端装备制造业增速超过15%。材料二：辽宁实施创新驱动发展战略，全省高新技术企业突破1万家。材料三：习近平总书记强调："高质量发展是新时代的硬道理。"',
    requirements: [
      '请运用经济知识，分析辽宁如何以高质量发展推动东北全面振兴。',
      '要求：观点明确，原理运用恰当，逻辑清晰，论述合理。',
    ],
    scoringCriteria: {
      viewpoint: '能够准确提炼观点，如"贯彻新发展理念""推动产业转型升级"等',
      theory: '能够准确运用经济知识，如新发展理念、供给侧结构性改革、创新驱动发展战略等',
      material: '能够结合材料信息进行分析，如装备制造业占比、高新技术企业数量等',
      conclusion: '能够得出合理结论，如高质量发展是东北全面振兴的必由之路',
      terminology: '能够准确使用政治术语，表述规范',
    },
    referenceAnswer: '①辽宁要以高质量发展推动东北全面振兴，必须完整、准确、全面贯彻创新、协调、绿色、开放、共享的新发展理念。②创新是第一动力，要实施创新驱动发展战略，推动科技创新与产业创新深度融合，培育壮大战略性新兴产业，改造提升传统装备制造业，形成新质生产力。③协调是内生特点，要统筹区域、城乡协调发展，推进产业结构优化升级，促进一、二、三产业协调发展。④绿色是普遍形态，要坚持绿色发展，推进产业生态化、生态产业化，实现经济发展与生态保护双赢。⑤开放是必由之路，要以高水平对外开放吸引外资，深度融入"一带一路"建设，打造对外开放新前沿。⑥共享是根本目的，要坚持发展为了人民、发展依靠人民、发展成果由人民共享，在振兴发展中保障和改善民生。⑦总之，辽宁必须坚定不移走高质量发展之路，以新发展理念引领全面振兴，实现经济高质量发展与社会全面进步。',
    improvementTips: ['注意区分"新发展理念"五个方面的具体内涵，不要混淆', '每个观点最好对应材料中的一个具体信息', '注意段落之间的逻辑衔接，可以使用"首先""其次""总之"等连接词', '结尾要有总结升华，不要简单重复前面的观点'],
    difficulty: '中等',
  },
  {
    id: 'essay-2',
    title: '党的领导是东北全面振兴的根本保证',
    scenario: '材料一：辽宁省委深入实施全面振兴新突破三年行动，建立省市县三级领导包抓机制。材料二：辽宁各级党组织在重大改革、重大工程、重大任务中发挥战斗堡垒作用。材料三：辽宁开展"清风辽宁"行动，营造风清气正的政治生态。',
    requirements: [
      '请运用政治知识，论述为什么党的领导是东北全面振兴的根本保证。',
      '要求：观点明确，原理运用恰当，逻辑清晰，论述合理。',
    ],
    scoringCriteria: {
      viewpoint: '能够准确提炼观点，如"党的领导是中国特色社会主义最本质的特征"等',
      theory: '能够准确运用政治知识，如党的领导方式、党的执政理念、党的建设等',
      material: '能够结合材料信息进行分析，如三年行动、包抓机制、战斗堡垒作用等',
      conclusion: '能够得出合理结论，如坚持党的领导是东北全面振兴的根本政治保证',
      terminology: '能够准确使用政治术语，表述规范',
    },
    referenceAnswer: '①党的领导是中国特色社会主义最本质的特征，是中国特色社会主义制度的最大优势。东北全面振兴必须坚持和加强党的全面领导。②党是最高政治领导力量，党是政治方向的引领者、政治体系的构建者、重大战略的谋划者。辽宁实施全面振兴新突破三年行动，正是党领导辽宁振兴发展的生动体现。③党坚持科学执政、民主执政、依法执政。建立省市县三级领导包抓机制，体现了党科学决策、精准施策的执政能力。④党始终坚持以人民为中心的发展思想。各级党组织在重大改革、重大工程、重大任务中发挥战斗堡垒作用，体现了党全心全意为人民服务的宗旨。⑤党勇于自我革命，坚持全面从严治党。"清风辽宁"行动营造风清气正的政治生态，为振兴发展提供坚强政治保证。⑥总之，只有坚持党的全面领导，才能确保东北全面振兴沿着正确方向前进，才能凝聚起磅礴力量实现全面振兴新突破。',
    improvementTips: ['注意区分党的领导方式：政治领导、思想领导、组织领导', '可以结合"两个维护"、党的全面领导等最新表述', '每个观点最好结合材料中的具体做法', '注意论述的逻辑层次：是什么-为什么-怎么做'],
    difficulty: '困难',
  },
  {
    id: 'essay-3',
    title: '矛盾分析法在辽宁振兴中的应用',
    scenario: '材料一：辽宁振兴既面临产业转型升级的机遇，也面临传统产业比重偏大、体制机制障碍等挑战。材料二：辽宁坚持"两个毫不动摇"，既做强做大国有经济，又鼓励支持民营经济发展。材料三：辽宁在生态保护中既绿水青山，又金山银山，探索生态价值实现路径。',
    requirements: [
      '请运用哲学知识，论述如何用矛盾分析法看待辽宁振兴中的机遇与挑战。',
      '要求：观点明确，原理运用恰当，逻辑清晰，论述合理。',
    ],
    scoringCriteria: {
      viewpoint: '能够准确提炼观点，如"矛盾具有普遍性""矛盾具有特殊性"等',
      theory: '能够准确运用哲学知识，如矛盾分析法、两点论与重点论、具体问题具体分析等',
      material: '能够结合材料信息进行分析，如机遇与挑战、两个毫不动摇、绿水青山就是金山银山等',
      conclusion: '能够得出合理结论，如坚持矛盾分析法推动辽宁振兴',
      terminology: '能够准确使用哲学术语，表述规范',
    },
    referenceAnswer: '①矛盾具有普遍性，要敢于承认矛盾、分析矛盾、勇于揭露矛盾。辽宁振兴中机遇与挑战并存，我们要正视困难，不回避问题，在解决矛盾中推动发展。②矛盾具有特殊性，要坚持具体问题具体分析。辽宁振兴要根据自身产业基础、资源禀赋、区位条件，探索具有辽宁特色的振兴路径，不能照搬其他地区经验。③要坚持两点论与重点论的统一。既要看到辽宁装备制造业基础雄厚、科教资源丰富等优势（重点），又要正视体制机制障碍、产业结构偏重等挑战（两点），抓住主要矛盾，以经济高质量发展引领全面振兴。④矛盾双方在一定条件下相互转化。辽宁要善于化挑战为机遇，将传统产业基础转化为转型升级优势，将生态压力转化为绿色发展动能。⑤矛盾是事物发展的源泉和动力。辽宁要在解决矛盾中实现发展，在深化改革中破除体制机制障碍，在创新驱动中培育新质生产力。⑥总之，坚持矛盾分析法，有助于我们科学认识辽宁振兴的复杂形势，找到正确的解题思路，推动全面振兴取得新突破。',
    improvementTips: ['注意准确区分矛盾的普遍性、特殊性、同一性、斗争性', '每个原理最好结合材料中的一个具体例子', '注意"两点论"和"重点论"的区别与联系', '论述中要体现"方法论"意义，不只是原理复述'],
    difficulty: '困难',
  },
];
