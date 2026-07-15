/**
 * Word 原文完整数据结构
 * 来源：第一课 社会主义从空想到科学、从理论到实践的发展
 */

export interface SocialFormFull {
  id: string;
  name: string;
  productivity: string;
  productionRelation: {
    ownership: string;        // 生产资料所有制
    distribution: string;     // 分配制度
  };
  laborRelation: string;      // 人与人的关系（劳动关系）
  superstructure: {
    politics: string;         // 政治上层建筑
    culture: string;          // 思想上层建筑
  };
  mainContradiction: string; // 主要矛盾
  basicContradiction: string; // 基本矛盾
  evaluation: string;        // 总体评价
  detail?: string;           // 详细内容（部分社会有）
}

export interface CapitalistCrisis {
  basicFeature: string;      // 基本特征
  mainManifestations: string; // 主要表现
  directCauses: string[];     // 直接原因（3点）
  rootCause: string;         // 根本原因
}

export interface SocialistDevelopment {
  whyDoomed: string[];       // 为什么必然灭亡
  evaluation: {               // 资本主义社会评价
    progress: string;
    limitation: string;
  };
}

export interface UtopianSocialism {
  progress: string[];         // 进步性
  limitation: string[];       // 局限性（3点）
}

export interface ScientificSocialism {
  historicalConditions: {
    thoughtSource: string;
    historicalPremise: string;
  };
  founding: {
    theoreticalFoundation: {
      materialistHistory: string;
      surplusValue: string;
    };
    birthMark: string;
    marxismContent: string;
  };
  fromTheoryToPractice: string[];  // 5个过程
  threeLeaps: string[];            // 三次飞跃
  whyNotEnded: string[];           // 为什么不会终结
}

export interface CommunistManifesto {
  mainContents: string[];     // 三个主要内容
}

export interface GuidedSection {
  id: string;
  title: string;
  subtitle: string;
  type: 'overview' | 'social-form' | 'detail' | 'science' | 'manifesto' | 'summary';
  content: string;            // 核心叙述原文
  keyPoints: string[];        // 关键要点
  thinkQuestions: string[];   // 引导思考题
  knowledgeLinks: string[];    // 关联知识点
  importantQuote?: string;    // 重要引文
}

// ==================== 完整 Word 内容 ====================

export const FULL_BOOK_OVERVIEW = `本册教材紧紧围绕中国特色社会主义这个中心，讲述中特的由来、创立、发展、完善的过程。第一课回顾从原始社会到资本主义社会的历史发展，阐释生产关系一定要适应生产力，上层建筑一定要适应经济基础的规律是本册教材内容的逻辑起点。第二课《只有社会主义才能救中国》，第三课《只有中国特色社会主义才能发展中国》，第四课《只有坚持和发展中国特色社会主义才能实现中华民族伟大复兴》，层层递进，不断发展，是由人类社会发展的基本规律所决定的。`;

export const SOCIAL_FORMS_FULL: SocialFormFull[] = [
  {
    id: '原始社会',
    name: '原始社会',
    productivity: '石器时代；畜牧业、农业开始出现；生产力极其低下。',
    productionRelation: {
      ownership: '氏族公有；人们共同劳动，共同占有生产资料。',
      distribution: '平均分配劳动产品。',
    },
    laborRelation: '无剥削压迫，平等互助的关系。',
    superstructure: {
      politics: '血缘关系；氏族制度；氏族议事会；部落联盟。',
      culture: '自然崇拜、图腾崇拜等原始宗教。',
    },
    mainContradiction: '人与自然之间的矛盾。',
    basicContradiction: '生产力与生产关系之间的矛盾——但二者基本适应。',
    evaluation: '人类社会发展最初阶段和最低阶段。',
  },
  {
    id: '奴隶社会',
    name: '奴隶社会',
    productivity: '金属工具时代；社会分工越来越细；生产力有了一定发展。',
    productionRelation: {
      ownership: '奴隶主完全占有生产资料和奴隶；生产资料家庭私有；生产资料私有制。',
      distribution: '奴隶主占有和支配奴隶劳动的全部产品，只给奴隶最低限度的生活资料。',
    },
    laborRelation: '奴隶主完全占有奴隶，将其视之为个人财产，奴隶毫无人身自由，在奴隶主的强制下劳动。',
    superstructure: {
      politics: '阶级统治的工具——国家产生；城市出现。',
      culture: '文字的发明和应用；脑力劳动和体力劳动的分工。',
    },
    mainContradiction: '奴隶和奴隶主之间的阶级矛盾。',
    basicContradiction: '社会生产力同生产关系之间的矛盾。',
    evaluation: '人类社会发展中的第一个阶级社会；促进了生产力的发展，使人类摆脱蒙昧，进入文明时代的门槛，是历史的进步。',
    detail: '奴隶社会代替原始社会后，金属工具的广泛使用、城市的出现、文字的发明和应用、脑力劳动和体力劳动的分工等，促进了生产力的发展，使人类摆脱蒙昧野蛮的状态，迈入了文明时代的门槛，这是历史的进步。',
  },
  {
    id: '封建社会',
    name: '封建社会',
    productivity: '铁制农具、耕作技术、水利事业、手工业都有了进一步发展。',
    productionRelation: {
      ownership: '地主占有绝大部分土地，农民有自己的劳动工具甚至少量土地。封建土地私有制是地主剥削农民的基础。',
      distribution: '地主通过地租的方式，占有农民大部分劳动成果。农民除缴纳地租外，能留下一部分劳动成果归自己支配。',
    },
    laborRelation: '农民有一定的人身自由，能够比较自主地劳动，有生产积极性。但农民依附于地主，屈从于地主的奴役。',
    superstructure: {
      politics: '君主专制、等级森严。为维护封建统治，地主散布封建迷信、传播封建道德，鼓吹君权神授。',
      culture: '文化有了一定的发展。儒家思想成为封建正统思想。',
    },
    mainContradiction: '农民和地主之间的阶级矛盾。',
    basicContradiction: '社会生产力同生产关系之间的矛盾。',
    evaluation: '经济文化长期发展，创造了灿烂的古代文明，但周期性危机明显，农民起义频繁。',
  },
  {
    id: '资本主义社会',
    name: '资本主义社会',
    productivity: '工业革命；机器化大生产、社会化大生产；生产力和商品经济得到巨大发展。',
    productionRelation: {
      ownership: '资本家占有一切生产资料，劳动者失去生产资料。生产资料资本主义私人占有（私有制）。',
      distribution: '资本家通过无偿占有工人的剩余价值来剥削工人。',
    },
    laborRelation: '劳动者失去生产资料，有人身自由，不得不出卖自己的劳动力，受雇于资本家。',
    superstructure: {
      politics: '资产阶级革命，标志着资本主义社会的开始，人类社会进入了一个新的历史阶段。',
      culture: '"自由、平等、博爱"的口号；科学、教育、文化的发展达到了前所未有的高度。',
    },
    mainContradiction: '无产阶级和资产阶级的阶级矛盾。',
    basicContradiction: '生产社会化同生产资料资本主义私人占有之间的矛盾（即资本主义基本矛盾）。',
    evaluation: '带来了生产力的巨大飞跃，促进了人类思想的解放，使科学、教育、文化的发展达到了前所未有的高度。但经济危机是资本主义无法克服的痼疾，是资本主义一切矛盾和冲突的总根源。',
    detail: '进步性：资本主义制度的确立，工业革命的发生和完成，带来了资本主义社会生产力的巨大飞跃，促进了人类思想的解放，是科学教育文化的发展达到前所未有的高度。局限性：经济危机是资本主义无法克服的痼疾。生产社会化和生产资料资本主义私人占有之间的矛盾是资本主义社会的基本矛盾，是资本主义社会一切矛盾和冲突的总根源。资本主义终将要被社会主义所取代。',
  },
  {
    id: '社会主义社会',
    name: '社会主义社会',
    productivity: '社会化大生产；生产力高度发展。',
    productionRelation: {
      ownership: '劳动者共同占有生产资料（生产资料公有制）。',
      distribution: '个人消费品实行按劳分配。',
    },
    laborRelation: '消灭了剥削，人们在生产过程中是互助合作的关系。',
    superstructure: {
      politics: '建立无产阶级的政权，人民当家作主。',
      culture: '以马克思主义为指导，科学教育文化蓬勃发展。',
    },
    mainContradiction: '人们的需要同生产力之间的矛盾（在不同阶段有不同表现）。',
    basicContradiction: '生产力与生产关系之间的矛盾——但二者是相适应的（适应的一面是基本的）。',
    evaluation: '从理论走向实践，体现人类解放目标，实现共同富裕。',
  },
];

export const CAPITALIST_CRISIS: CapitalistCrisis = {
  basicFeature: '生产相对过剩。',
  mainManifestations: '大量商品卖不出去，大量生产资料被闲置，大批生产企业、银行破产，大批工人失业，生产迅速下降，信用关系被破坏，整个社会生活陷入混乱。',
  directCauses: [
    '生产无限扩大的趋势与劳动人民有支付能力的需求相对缩小之间的矛盾。',
    '个别企业内部生产的有组织性与整个社会生产的无政府状态之间的矛盾。',
    '当矛盾尖锐化时，社会生产结构会严重失调，从而造成生产严重过剩。',
  ],
  rootCause: '生产社会化和生产资料资本主义私人占有之间的矛盾。',
};

export const CAPITALIST_WHY_DOOMED: string[] = [
  '资本主义基本矛盾是资本主义社会一切矛盾和冲突的总根源。资本主义基本矛盾的发展贯穿于资本主义社会的始终，决定着资本主义的命运。',
  '生产社会化的程度越高，资本、生产资料、劳动产品就越集中在少数资本家手里，资本主义社会基本矛盾的尖锐化就越不可避免。',
  '资本主义终究要被社会主义所取代，虽然这是一个漫长的过程，但这是历史发展的必然趋势。',
];

export const UTOPIAN_SOCIALISM: UtopianSocialism = {
  progress: [
    '一些先进分子看到了资本主义的弊端，纷纷对资本主义进行揭露和批判，同时表达对未来理想社会的诉求。',
    '空想社会主义是科学社会主义的思想来源。',
  ],
  limitation: [
    '仅仅从理性正义的原则出发，揭露资本主义的弊端、设计美好蓝图（行动力不强）。',
    '他们主张阶级调和，反对阶级斗争，看不到广大人民群众，特别是无产阶级的力量（依靠的人不对）。',
    '也没有找到进行社会变革的正确途径（做事方法也不对）。',
  ],
};

export const SCIENTIFIC_SOCIALISM: ScientificSocialism = {
  historicalConditions: {
    thoughtSource: '空想社会主义',
    historicalPremise: '资本主义的发展和工人运动的兴起',
  },
  founding: {
    theoreticalFoundation: {
      materialistHistory: '揭示了人类社会发展的一般规律',
      surplusValue: '揭示了资本主义运行的特殊规律',
    },
    birthMark: '1848年《共产党宣言》的发表',
    marxismContent: '马克思主义是科学的理论，揭示了人类社会发展的规律；马克思主义是人民的理论，第一次创立了人民实现自身解放的思想体系；马克思主义是实践的理论，指引着人民改造世界；马克思主义是不断发展的、开放的理论，能够与时俱进、因地制宜。',
  },
  fromTheoryToPractice: [
    '①尝试：巴黎公社',
    '②建立：俄国十月革命',
    '③发展：二战后，一国到多国的发展',
    '④挫折：东欧剧变，苏联解体',
    '⑤新生：中国特色社会主义的伟大实践',
  ],
  threeLeaps: [
    '唯物史观和剩余价值学说，使社会主义实现了由空想到科学的伟大飞跃。',
    '十月革命实现了科学社会主义从理论到现实的历史性飞跃。',
    '二战后，社会主义在世界范围内获得大发展，实现了从一国实践到多国实践的历史性飞跃。',
  ],
  whyNotEnded: [
    '从人类社会发展的进程看，社会主义终将代替资本主义是不可逆转的。',
    '从人类社会发展的趋势看，共产主义一定要实现的信念是不可动摇的。',
    '中国特色社会主义是科学社会主义在中国的实践和发展，在21世纪焕发出了强大的生命力。',
  ],
};

export const COMMUNIST_MANIFESTO: CommunistManifesto = {
  mainContents: [
    '《共产党宣言》分析了资本主义生产方式的内在矛盾与人类社会的发展规律。科学论证了资本主义必然灭亡和社会主义必然胜利。',
    '《共产党宣言》系统论述了无产阶级政党的性质、特点、任务和策略原则，阐明了建立无产阶级政党的必要性。',
    '《共产党宣言》阐述了未来共产主义社会的理想目标。',
  ],
};

// ==================== 引导式学习的章节结构 ====================

export const GUIDED_SECTIONS: GuidedSection[] = [
  {
    id: 'overview',
    title: '全书整体感知',
    subtitle: '本册教材的逻辑起点与主线',
    type: 'overview',
    content: FULL_BOOK_OVERVIEW,
    keyPoints: [
      '中国特色社会主义是本册教材的核心主线',
      '第一课是全册教材的逻辑起点',
      '人类社会发展的基本规律决定了中国特色社会主义的历史必然',
    ],
    thinkQuestions: [
      '为什么说第一课是本册教材的逻辑起点？',
      '人类社会发展的基本规律指的是什么？',
    ],
    knowledgeLinks: ['唯物史观', '生产关系适应生产力', '上层建筑适应经济基础'],
    importantQuote: '生产关系一定要适应生产力，上层建筑一定要适应经济基础的规律。',
  },
  {
    id: '原始社会',
    title: '原始社会',
    subtitle: '人类社会的最初阶段',
    type: 'social-form',
    content: '原始社会是人类社会发展的最初阶段和最低阶段。生产力极其低下，石器是主要工具，人们共同劳动、共同占有生产资料，平均分配劳动产品。人与自然的矛盾是主要矛盾，氏族制度是上层建筑的核心。没有阶级、没有剥削。',
    keyPoints: [
      '生产力极其低下',
      '生产资料氏族公有',
      '平均分配',
      '平等互助关系',
      '主要矛盾：人与自然',
    ],
    thinkQuestions: [
      '原始社会没有剥削压迫，但为什么说它是人类社会发展的最低阶段？',
      '氏族议事会和现代民主有什么区别？',
    ],
    knowledgeLinks: ['生产力', '生产关系', '氏族制度'],
  },
  {
    id: '奴隶社会',
    title: '奴隶社会',
    subtitle: '人类进入文明时代的门槛',
    type: 'social-form',
    content: '奴隶社会代替原始社会是人类社会的第一个进步。金属工具使用、城市出现、文字发明、脑力劳动与体力劳动分工。奴隶主完全占有生产资料和奴隶，奴隶毫无人身自由。国家作为阶级统治工具产生。',
    keyPoints: [
      '金属工具时代，社会分工越来越细',
      '私有制确立——生产资料奴隶主占有',
      '奴隶毫无人身自由',
      '国家产生（阶级矛盾不可调和的产物）',
      '评价：历史的进步——使人类进入文明时代',
    ],
    thinkQuestions: [
      '奴隶社会代替原始社会是历史的进步，这个"进步"如何理解？与社会进步的标准有什么关系？',
      '文字的发明对人类社会发展有什么深远意义？',
    ],
    knowledgeLinks: ['私有制', '国家', '脑力劳动与体力劳动分工'],
    importantQuote: '评价奴隶社会：促进了生产力的发展，使人类摆脱蒙昧野蛮的状态，迈入了文明时代的门槛，这是历史的进步。',
  },
  {
    id: '封建社会',
    title: '封建社会',
    subtitle: '土地等级制度下的剥削社会',
    type: 'social-form',
    content: '铁制农具推广，生产力进一步提高。地主占有绝大部分土地，农民有一定人身自由但依附于地主。地租是主要剥削方式。君主专制、等级森严是政治特征。',
    keyPoints: [
      '铁制农具、耕作技术、水利事业进一步发展',
      '封建土地私有制——地主剥削农民的基础',
      '农民有一定人身自由，有生产积极性',
      '地租剥削（劳役地租、实物地租、货币地租）',
      '君主专制、等级森严的政治特征',
    ],
    thinkQuestions: [
      '封建社会的"进步性"和"局限性"分别是什么？',
      '农民起义为什么在封建社会频繁发生？',
    ],
    knowledgeLinks: ['封建土地私有制', '地租', '君主专制'],
  },
  {
    id: '资本主义社会',
    title: '资本主义社会',
    subtitle: '生产社会化与私有制的基本矛盾',
    type: 'social-form',
    content: '工业革命带来生产力飞跃，但资本家占有生产资料，劳动者被迫出卖劳动力。生产社会化与资本主义私人占有的矛盾是基本矛盾。经济危机不可避免。',
    keyPoints: [
      '工业革命：机器化、社会化大生产',
      '生产资料资本家私人占有',
      '雇佣劳动制度——资本家剥削工人',
      '基本矛盾：生产社会化 vs 生产资料私人占有',
      '经济危机：生产相对过剩',
    ],
    thinkQuestions: [
      '为什么经济危机是资本主义无法克服的痼疾？',
      '资本主义基本矛盾在哪些方面表现出来？',
    ],
    knowledgeLinks: ['剩余价值', '雇佣劳动', '经济危机', '资本主义基本矛盾'],
  },
  {
    id: '资本主义危机',
    title: '资本主义经济危机',
    subtitle: '无法克服的痼疾',
    type: 'detail',
    content: `基本特征：生产相对过剩。
主要表现：大量商品卖不出去，大量生产资料被闲置，大批生产企业、银行破产，大批工人失业，生产迅速下降，信用关系被破坏，整个社会生活陷入混乱。
直接原因：①生产无限扩大的趋势与劳动人民有支付能力的需求相对缩小之间的矛盾。②个别企业内部生产的有组织性与整个社会生产的无政府状态之间的矛盾。③当矛盾尖锐化时，社会生产结构会严重失调，从而造成生产严重过剩。
根本原因：生产社会化和生产资料资本主义私人占有之间的矛盾。`,
    keyPoints: [
      '基本特征：生产相对过剩',
      '直接原因①：生产无限扩大 vs 有支付能力的需求缩小',
      '直接原因②：企业有组织性 vs 社会生产无政府状态',
      '根本原因：资本主义基本矛盾',
      '经济危机证明：资本主义必然灭亡',
    ],
    thinkQuestions: [
      '资本主义经济危机与基本矛盾有什么关系？',
      '为什么说经济危机证明了资本主义必然灭亡？',
    ],
    knowledgeLinks: ['生产相对过剩', '社会再生产', '资本主义基本矛盾'],
  },
  {
    id: '资本主义必然灭亡',
    title: '资本主义必然灭亡',
    subtitle: '历史发展的必然趋势',
    type: 'detail',
    content: '为什么资本主义必然灭亡？①资本主义基本矛盾是资本主义社会一切矛盾和冲突的总根源，决定着资本主义的命运。②生产社会化程度越高，资本越集中在少数资本家手里，基本矛盾尖锐化越不可避免。③资本主义终究要被社会主义所取代，这是历史发展的必然趋势。',
    keyPoints: [
      '基本矛盾是一切矛盾的总根源',
      '生产社会化程度越高，矛盾越尖锐',
      '社会主义必然取代资本主义——历史必然',
    ],
    thinkQuestions: [
      '资本主义的基本矛盾能否在资本主义制度内解决？为什么？',
      '如何理解"社会主义必然取代资本主义是一个漫长的过程"？',
    ],
    knowledgeLinks: ['资本主义基本矛盾', '生产社会化', '社会主义必然胜利'],
  },
  {
    id: '空想社会主义',
    title: '空想社会主义',
    subtitle: '科学社会主义的思想来源',
    type: 'science',
    content: `空想社会主义的进步性：看到了资本主义的弊端，揭露批判资本主义，表达对未来理想社会的诉求；是科学社会主义的思想来源。
空想社会主义的局限性：①仅从理性正义出发，设计美好蓝图，但行动力不强。②主张阶级调和，反对阶级斗争，看不到无产阶级的力量（依靠的人不对）。③没有找到社会变革的正确途径（方法也不对）。——注定只能是空想！`,
    keyPoints: [
      '进步性：揭露批判资本主义，提供理想社会诉求',
      '局限性①：只有理想，没有行动路径',
      '局限性②：看不到无产阶级力量',
      '局限性③：没有找到正确途径',
      '结论：注定是空想！',
    ],
    thinkQuestions: [
      '空想社会主义的三个局限性分别是什么？',
      '为什么圣西门、傅立叶、欧文的努力最终失败了？',
    ],
    knowledgeLinks: ['圣西门', '傅立叶', '欧文', '科学社会主义'],
  },
  {
    id: '科学社会主义诞生',
    title: '科学社会主义的创立',
    subtitle: '两大理论基石与诞生标志',
    type: 'science',
    content: `历史条件：①思想来源：空想社会主义。②历史前提：资本主义的发展和工人运动的兴起。
两大理论基石：唯物史观（揭示人类社会发展一般规律）+ 剩余价值学说（揭示资本主义运行特殊规律）。
诞生标志：1848年《共产党宣言》发表。
意义：马克思主义揭示了人类社会发展的规律；是人民的理论，第一次创立了人民实现自身解放的思想体系；是实践的理论，指引人民改造世界；是不断发展的、开放的理论。`,
    keyPoints: [
      '思想来源：空想社会主义',
      '历史前提：资本主义发展 + 工人运动兴起',
      '两大基石①：唯物史观——社会发展一般规律',
      '两大基石②：剩余价值学说——资本主义特殊规律',
      '诞生标志：1848年《共产党宣言》',
    ],
    thinkQuestions: [
      '为什么唯物史观和剩余价值学说是科学社会主义的理论基石？',
      '空想社会主义缺少什么，使它只能是"空想"？',
    ],
    knowledgeLinks: ['唯物史观', '剩余价值学说', '《共产党宣言》', '马克思主义'],
    importantQuote: '唯物史观揭示了人类社会发展的一般规律，剩余价值学说揭示了资本主义运行的特殊规律。',
  },
  {
    id: '科学社会主义实践',
    title: '科学社会主义从理论到实践',
    subtitle: '五次实践进程与三次历史性飞跃',
    type: 'science',
    content: `五个过程：①尝试：巴黎公社。②建立：俄国十月革命。③发展：二战后一国到多国。④挫折：东欧剧变、苏联解体。⑤新生：中国特色社会主义。
三次飞跃：①唯物史观+剩余价值→空想到科学。②十月革命→理论到现实。③二战后→一国到多国。
为什么不会终结：①社会主义终将代替资本主义不可逆转。②共产主义一定要实现。③中国特色社会主义在21世纪焕发强大生命力。`,
    keyPoints: [
      '五个过程：尝试→建立→发展→挫折→新生',
      '十月革命：第一次从理论到现实',
      '中国特色社会主义：21世纪的新生力量',
      '三次飞跃：空想到科学、理论到现实、一国到多国',
      '社会主义必然胜利不可逆转',
    ],
    thinkQuestions: [
      '苏联解体说明了什么？社会主义因此终结了吗？',
      '为什么说中国特色社会主义是科学社会主义的继承和发展？',
    ],
    knowledgeLinks: ['巴黎公社', '十月革命', '中国特色社会主义', '东欧剧变'],
  },
  {
    id: '共产党宣言',
    title: '《共产党宣言》的主要内容',
    subtitle: '无产阶级革命的科学指南',
    type: 'manifesto',
    content: `《共产党宣言》分析了资本主义生产方式的内在矛盾与人类社会的发展规律，科学论证了资本主义必然灭亡和社会主义必然胜利。
系统论述了无产阶级政党的性质、特点、任务和策略原则，阐明了建立无产阶级政党的必要性。
阐述了未来共产主义社会的理想目标。`,
    keyPoints: [
      '论证了资本主义必然灭亡、社会主义必然胜利',
      '阐明了无产阶级政党的性质和任务',
      '阐述了共产主义社会的理想目标',
    ],
    thinkQuestions: [
      '《共产党宣言》如何论证"两个必然"？',
      '无产阶级政党与以往政党有什么区别？',
    ],
    knowledgeLinks: ['两个必然', '无产阶级政党', '共产主义'],
    importantQuote: '《共产党宣言》科学论证了资本主义必然灭亡和社会主义必然胜利。',
  },
  {
    id: '全课总结',
    title: '全课总结',
    subtitle: '社会主义从空想到科学、从理论到实践的发展',
    type: 'summary',
    content: `本课核心线索：从空想社会主义→科学社会主义→从理论到实践的发展。
核心规律：生产关系一定要适应生产力，上层建筑一定要适应经济基础。
核心矛盾：资本主义基本矛盾（生产社会化 vs 生产资料私人占有）。
核心结论：社会主义必然代替资本主义——这是人类社会发展的历史必然。`,
    keyPoints: [
      '核心规律：生产关系适应生产力',
      '核心矛盾：资本主义基本矛盾',
      '核心飞跃：空想到科学、理论到实践',
      '核心结论：两个必然（资本主义灭亡、社会主义胜利）',
    ],
    thinkQuestions: [
      '用本课所学，解释为什么社会主义代替资本主义是历史必然？',
      '学习本课后，你对中国特色社会主义有什么新的认识？',
    ],
    knowledgeLinks: ['唯物史观', '剩余价值学说', '资本主义基本矛盾', '两个必然'],
  },
];

// 导出完整的单元数据（供其他页面使用）
export interface Unit1FullData {
  bookOverview: string;
  socialForms: SocialFormFull[];
  capitalistCrisis: CapitalistCrisis;
  capitalistWhyDoomed: string[];
  capitalistEvaluation: {
    progress: string;
    limitation: string;
  };
  utopianSocialism: UtopianSocialism;
  scientificSocialism: ScientificSocialism;
  communistManifesto: CommunistManifesto;
  guidedSections: GuidedSection[];
}

export const UNIT1_FULL_DATA: Unit1FullData = {
  bookOverview: FULL_BOOK_OVERVIEW,
  socialForms: SOCIAL_FORMS_FULL,
  capitalistCrisis: CAPITALIST_CRISIS,
  capitalistWhyDoomed: CAPITALIST_WHY_DOOMED,
  capitalistEvaluation: {
    progress: '资本主义制度的确立，工业革命的发生和完成，带来了资本主义社会生产力的巨大飞跃，促进了人类思想的解放，是科学教育文化的发展达到前所未有的高度。',
    limitation: '经济危机是资本主义无法克服的痼疾。生产社会化和生产资料资本主义私人占有之间的矛盾是资本主义社会的基本矛盾，是资本主义社会一切矛盾和冲突的总根源。资本主义终将要被社会主义所取代。',
  },
  utopianSocialism: UTOPIAN_SOCIALISM,
  scientificSocialism: SCIENTIFIC_SOCIALISM,
  communistManifesto: COMMUNIST_MANIFESTO,
  guidedSections: GUIDED_SECTIONS,
};
