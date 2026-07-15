import type { PoliticsParseResult } from '@/lib/politicsDocxParser';

export const POLITICS_UNIT1: PoliticsParseResult = {
  unitId: 'politics_unit1',
  unitTitle: '第一单元：社会主义从空想到科学、从理论到实践的发展',
  overview: '本册教材紧紧围绕中国特色社会主义这个中心，讲述中特的由来、创立、发展、完善的过程。第一课回顾从原始社会到资本主义社会的历史发展，阐释生产关系一定要适应生产力，上层建筑一定要适应经济基础的规律是本册教材内容的逻辑起点。第二课《只有社会主义才能救中国》，第三课《只有中国特色社会主义才能发展中国》，第四课《只有坚持和发展中国特色社会主义才能实现中华民族伟大复兴》，层层递进，不断发展，是由人类社会发展的基本规律所决定的。',
  socialForms: [
    { id: '原始社会', name: '原始社会', productivity: '生产力低下，石器工具为主，集体劳动。', productionRelation: '生产资料公有，平均分配。', superstructure: '没有阶级和国家。', mainContradiction: '人与自然矛盾。', basicContradiction: '生产力与生产关系基本适应。', evaluation: '人类社会的第一阶段，促进早期文化发展。' },
    { id: '奴隶社会', name: '奴隶社会', productivity: '金属工具出现，生产力提高。', productionRelation: '奴隶主占有生产资料和奴隶。', superstructure: '阶级、国家、法律出现。', mainContradiction: '奴隶主与奴隶矛盾。', basicContradiction: '生产力发展与奴隶制生产关系矛盾。', evaluation: '人类进入文明时代，但剥削制度产生。' },
    { id: '封建社会', name: '封建社会', productivity: '铁器牛耕推广。', productionRelation: '地主占有土地，农民租地耕种。', superstructure: '君主专制、等级制度。', mainContradiction: '地主与农民矛盾。', basicContradiction: '生产力发展与封建生产关系矛盾。', evaluation: '经济文化长期发展，但周期性危机明显。' },
    { id: '资本主义社会', name: '资本主义社会', productivity: '工业革命、生产力飞跃。', productionRelation: '资本家占有生产资料，雇佣劳动。', superstructure: '资产阶级民主与法治。', mainContradiction: '资产阶级与无产阶级矛盾。', basicContradiction: '生产社会化与生产资料资本主义私有制矛盾。', evaluation: '人类生产力极大解放，但内在矛盾不可调和。' },
    { id: '社会主义社会', name: '社会主义社会', productivity: '高度发达的生产力，新质生产力发展。', productionRelation: '生产资料公有制为主体。', superstructure: '人民当家作主，共同富裕。', mainContradiction: '人民日益增长的美好生活需要和不平衡不充分的发展之间的矛盾。', basicContradiction: '生产力与生产关系相适应。', evaluation: '从理论走向实践，体现人类解放目标。' },
  ],
  concepts: [
    { id: '唯物史观', name: '唯物史观', category: '哲学', definition: '马克思创立的关于人类社会发展一般规律的科学理论，揭示生产力与生产关系、经济基础与上层建筑的矛盾运动。', keyPoints: ['生产力决定生产关系', '经济基础决定上层建筑', '社会基本矛盾推动社会发展'], importance: 5, gaokaoFocus: '辽宁高考必考，常考历史唯物主义应用题。' },
    { id: '剩余价值学说', name: '剩余价值学说', category: '马克思主义', definition: '马克思揭示资本主义剥削秘密的理论，指出资本家通过占有工人创造的剩余价值实现增殖。', keyPoints: ['劳动力成为商品', '剩余价值生产', '资本积累'], importance: 5, gaokaoFocus: '高考选择题与材料题高频考点。' },
    { id: '科学社会主义', name: '科学社会主义', category: '科学社会主义', definition: '以唯物史观和剩余价值学说为理论基石，阐明社会主义代替资本主义的历史必然性。', keyPoints: ['理论基石', '历史必然性', '实现路径'], importance: 5, gaokaoFocus: '必考知识点。' },
    { id: '空想社会主义', name: '空想社会主义', category: '科学社会主义', definition: '19世纪初圣西门、傅立叶、欧文提出的批判资本主义、理想社会方案，但未找到实现力量。', keyPoints: ['批判资本主义', '理想社会方案', '历史局限性'], importance: 4, gaokaoFocus: '常考概念辨析。' },
    { id: '资本主义基本矛盾', name: '资本主义基本矛盾', category: '政治经济学', definition: '生产社会化和生产资料资本主义私人占有之间的矛盾，是资本主义一切矛盾的根源。', keyPoints: ['生产社会化', '私人占有', '经济危机'], importance: 5, gaokaoFocus: '必考，选择题、材料题高频。' },
    { id: '共产党宣言', name: '共产党宣言', category: '科学社会主义', definition: '马克思、恩格斯为共产主义者同盟起草的纲领，标志着马克思主义的诞生。', keyPoints: ['马克思主义诞生', '无产阶级历史使命', '未来社会特征'], importance: 5, gaokaoFocus: '常考历史意义。' },
    { id: '十月革命', name: '十月革命', category: '党史', definition: '1917年列宁领导的布尔什维克党夺取政权，建立第一个社会主义国家。', keyPoints: ['第一个社会主义国家', '从理论到实践飞跃', '世界历史新纪元'], importance: 5, gaokaoFocus: '辽宁高考必考。' },
  ],
  timelineEvents: [
    { id: '1844', year: '1844', title: '《德意志意识形态》', summary: '阐述唯物史观。', impact: '奠定科学社会主义理论基础。', category: '理论', importance: 5 },
    { id: '1848', year: '1848', title: '《共产党宣言》', summary: '马克思主义诞生。', impact: '无产阶级斗争有了科学理论指导。', category: '理论', importance: 5 },
    { id: '1871', year: '1871', title: '巴黎公社', summary: '建立第一个无产阶级政权。', impact: '丰富科学社会主义学说。', category: '实践', importance: 4 },
    { id: '1917', year: '1917', title: '十月革命', summary: '建立第一个社会主义国家。', impact: '社会主义从理论变为现实。', category: '实践', importance: 5 },
  ],
  causalLinks: [
    { id: '唯物史观_剩余价值', sourceId: '唯物史观', targetId: '剩余价值学说', logic: '唯物史观揭示社会发展规律，剩余价值学说揭示资本主义剥削秘密，共同构成科学社会主义理论基石。', type: '导致' },
    { id: '剩余价值_科学社会主义', sourceId: '剩余价值学说', targetId: '科学社会主义', logic: '两大理论基石使社会主义从空想变为科学。', type: '导致' },
    { id: '科学社会主义_巴黎公社', sourceId: '科学社会主义', targetId: '巴黎公社', logic: '科学社会主义指导下建立无产阶级政权尝试。', type: '推动' },
    { id: '巴黎公社_十月革命', sourceId: '巴黎公社', targetId: '十月革命', logic: '巴黎公社为十月革命提供经验教训。', type: '促进' },
    { id: '空想_科学', sourceId: '空想社会主义', targetId: '科学社会主义', logic: '批判吸收空想社会主义发展为科学社会主义。', type: '促进' },
  ],
  examFocus: [
    { conceptId: '科学社会主义', conceptName: '科学社会主义', frequency: '必考', questionTypes: ['选择题', '论述题'], difficulty: '中', typicalQuestions: ['科学社会主义为什么是科学？'] },
    { conceptId: '剩余价值学说', conceptName: '剩余价值学说', frequency: '必考', questionTypes: ['选择题', '材料分析题'], difficulty: '中', typicalQuestions: ['剩余价值如何揭示资本主义剥削本质？'] },
    { conceptId: '唯物史观', conceptName: '唯物史观', frequency: '必考', questionTypes: ['选择题', '材料分析题'], difficulty: '中', typicalQuestions: ['如何用唯物史观分析社会形态更替？'] },
    { conceptId: '资本主义基本矛盾', conceptName: '资本主义基本矛盾', frequency: '必考', questionTypes: ['选择题', '论述题'], difficulty: '中', typicalQuestions: ['资本主义基本矛盾如何引发经济危机？'] },
    { conceptId: '十月革命', conceptName: '十月革命', frequency: '常考', questionTypes: ['选择题'], difficulty: '易', typicalQuestions: ['十月革命的历史意义是什么？'] },
  ],
  keyQuotes: [
    { id: 'manifesto-1', source: '《共产党宣言》', quote: '代替那存在着阶级和阶级对立的资产阶级旧社会的，将是这样一个联合体，在那里，每个人的自由发展是一切人的自由发展的条件。', explanation: '体现了马克思主义对共产主义社会的核心价值追求。' },
    { id: 'october-1', source: '列宁关于十月革命', quote: '国家是阶级矛盾不可调和的产物。', explanation: '马克思主义国家学说的重要论断。' },
  ],
  summary: '本课涵盖唯物史观、剩余价值学说、科学社会主义、空想社会主义、资本主义基本矛盾、《共产党宣言》和十月革命等核心概念与历程，建议结合辽宁高考命题方向强化概念辨析、材料分析和论述训练。',
  rawImportDate: new Date().toISOString(),
  source: 'docx_import',
  // 完整数据（来自 unit1_full_data.ts）
  socialFormsFull: [
    { id: '原始社会', name: '原始社会', productivity: '石器时代；畜牧业、农业开始出现；生产力极其低下。', productionRelation: { ownership: '氏族公有；人们共同劳动，共同占有生产资料。', distribution: '平均分配劳动产品。' }, laborRelation: '无剥削压迫，平等互助的关系。', superstructure: { politics: '血缘关系；氏族制度；氏族议事会；部落联盟。', culture: '自然崇拜、图腾崇拜等原始宗教。' }, mainContradiction: '人与自然之间的矛盾。', basicContradiction: '生产力与生产关系之间的矛盾——但二者基本适应。', evaluation: '人类社会发展最初阶段和最低阶段。' },
    { id: '奴隶社会', name: '奴隶社会', productivity: '金属工具时代；社会分工越来越细；生产力有了一定发展。', productionRelation: { ownership: '奴隶主完全占有生产资料和奴隶；生产资料家庭私有；生产资料私有制。', distribution: '奴隶主占有和支配奴隶劳动的全部产品，只给奴隶最低限度的生活资料。' }, laborRelation: '奴隶主完全占有奴隶，将其视之为个人财产，奴隶毫无人身自由，在奴隶主的强制下劳动。', superstructure: { politics: '阶级统治的工具——国家产生；城市出现。', culture: '文字的发明和应用；脑力劳动和体力劳动的分工。' }, mainContradiction: '奴隶和奴隶主之间的阶级矛盾。', basicContradiction: '社会生产力同生产关系之间的矛盾。', evaluation: '人类社会发展中的第一个阶级社会；促进了生产力的发展，使人类摆脱蒙昧，进入文明时代的门槛，是历史的进步。', detail: '奴隶社会代替原始社会后，金属工具的广泛使用、城市的出现、文字的发明和应用、脑力劳动和体力劳动的分工等，促进了生产力的发展，使人类摆脱蒙昧野蛮的状态，迈入了文明时代的门槛，这是历史的进步。' },
    { id: '封建社会', name: '封建社会', productivity: '铁制农具、耕作技术、水利事业、手工业都有了进一步发展。', productionRelation: { ownership: '地主占有绝大部分土地，农民有自己的劳动工具甚至少量土地。封建土地私有制是地主剥削农民的基础。', distribution: '地主通过地租的方式，占有农民大部分劳动成果。农民除缴纳地租外，能留下一部分劳动成果归自己支配。' }, laborRelation: '农民有一定的人身自由，能够比较自主地劳动，有生产积极性。但农民依附于地主，屈从于地主的奴役。', superstructure: { politics: '君主专制、等级森严。为维护封建统治，地主散布封建迷信、传播封建道德，鼓吹君权神授。', culture: '文化有了一定的发展。儒家思想成为封建正统思想。' }, mainContradiction: '农民和地主之间的阶级矛盾。', basicContradiction: '社会生产力同生产关系之间的矛盾。', evaluation: '经济文化长期发展，创造了灿烂的古代文明，但周期性危机明显，农民起义频繁。' },
    { id: '资本主义社会', name: '资本主义社会', productivity: '工业革命；机器化大生产、社会化大生产；生产力和商品经济得到巨大发展。', productionRelation: { ownership: '资本家占有一切生产资料，劳动者失去生产资料。生产资料资本主义私人占有（私有制）。', distribution: '资本家通过无偿占有工人的剩余价值来剥削工人。' }, laborRelation: '劳动者失去生产资料，有人身自由，不得不出卖自己的劳动力，受雇于资本家。', superstructure: { politics: '资产阶级革命，标志着资本主义社会的开始，人类社会进入了一个新的历史阶段。', culture: '"自由、平等、博爱"的口号；科学、教育、文化的发展达到了前所未有的高度。' }, mainContradiction: '无产阶级和资产阶级的阶级矛盾。', basicContradiction: '生产社会化同生产资料资本主义私人占有之间的矛盾（即资本主义基本矛盾）。', evaluation: '带来了生产力的巨大飞跃，促进了人类思想的解放，使科学、教育、文化的发展达到了前所未有的高度。但经济危机是资本主义无法克服的痼疾，是资本主义一切矛盾和冲突的总根源。', detail: '进步性：资本主义制度的确立，工业革命的发生和完成，带来了资本主义社会生产力的巨大飞跃，促进了人类思想的解放，是科学教育文化的发展达到前所未有的高度。局限性：经济危机是资本主义无法克服的痼疾。生产社会化和生产资料资本主义私人占有之间的矛盾是资本主义社会的基本矛盾，是资本主义社会一切矛盾和冲突的总根源。资本主义终将要被社会主义所取代。' },
    { id: '社会主义社会', name: '社会主义社会', productivity: '社会化大生产；生产力高度发展。', productionRelation: { ownership: '劳动者共同占有生产资料（生产资料公有制）。', distribution: '个人消费品实行按劳分配。' }, laborRelation: '消灭了剥削，人们在生产过程中是互助合作的关系。', superstructure: { politics: '建立无产阶级的政权，人民当家作主。', culture: '以马克思主义为指导，科学教育文化蓬勃发展。' }, mainContradiction: '人们的需要同生产力之间的矛盾（在不同阶段有不同表现）。', basicContradiction: '生产力与生产关系之间的矛盾——但二者是相适应的（适应的一面是基本的）。', evaluation: '从理论走向实践，体现人类解放目标，实现共同富裕。' },
  ],
  capitalistCrisis: { basicFeature: '生产相对过剩。', mainManifestations: '大量商品卖不出去，大量生产资料被闲置，大批生产企业、银行破产，大批工人失业，生产迅速下降，信用关系被破坏，整个社会生活陷入混乱。', directCauses: ['生产无限扩大的趋势与劳动人民有支付能力的需求相对缩小之间的矛盾。', '个别企业内部生产的有组织性与整个社会生产的无政府状态之间的矛盾。', '当矛盾尖锐化时，社会生产结构会严重失调，从而造成生产严重过剩。'], rootCause: '生产社会化和生产资料资本主义私人占有之间的矛盾。' },
  capitalistWhyDoomed: ['资本主义基本矛盾是资本主义社会一切矛盾和冲突的总根源。资本主义基本矛盾的发展贯穿于资本主义社会的始终，决定着资本主义的命运。', '生产社会化的程度越高，资本、生产资料、劳动产品就越集中在少数资本家手里，资本主义社会基本矛盾的尖锐化就越不可避免。', '资本主义终究要被社会主义所取代，虽然这是一个漫长的过程，但这是历史发展的必然趋势。'],
  utopianSocialism: { progress: ['一些先进分子看到了资本主义的弊端，纷纷对资本主义进行揭露和批判，同时表达对未来理想社会的诉求。', '空想社会主义是科学社会主义的思想来源。'], limitation: ['仅仅从理性正义的原则出发，揭露资本主义的弊端、设计美好蓝图（行动力不强）。', '他们主张阶级调和，反对阶级斗争，看不到广大人民群众，特别是无产阶级的力量（依靠的人不对）。', '也没有找到进行社会变革的正确途径（做事方法也不对）。'] },
  scientificSocialism: { historicalConditions: { thoughtSource: '空想社会主义', historicalPremise: '资本主义的发展和工人运动的兴起' }, founding: { theoreticalFoundation: { materialistHistory: '揭示了人类社会发展的一般规律', surplusValue: '揭示了资本主义运行的特殊规律' }, birthMark: '1848年《共产党宣言》的发表', marxismContent: '马克思主义是科学的理论，揭示了人类社会发展的规律；马克思主义是人民的理论，第一次创立了人民实现自身解放的思想体系；马克思主义是实践的理论，指引着人民改造世界；马克思主义是不断发展的、开放的理论，能够与时俱进、因地制宜。' }, fromTheoryToPractice: ['①尝试：巴黎公社', '②建立：俄国十月革命', '③发展：二战后，一国到多国的发展', '④挫折：东欧剧变，苏联解体', '⑤新生：中国特色社会主义的伟大实践'], threeLeaps: ['唯物史观和剩余价值学说，使社会主义实现了由空想到科学的伟大飞跃。', '十月革命实现了科学社会主义从理论到现实的历史性飞跃。', '二战后，社会主义在世界范围内获得大发展，实现了从一国实践到多国实践的历史性飞跃。'], whyNotEnded: ['从人类社会发展的进程看，社会主义终将代替资本主义是不可逆转的。', '从人类社会发展的趋势看，共产主义一定要实现的信念是不可动摇的。', '中国特色社会主义是科学社会主义在中国的实践和发展，在21世纪焕发出了强大的生命力。'] },
  communistManifesto: { mainContents: ['《共产党宣言》分析了资本主义生产方式的内在矛盾与人类社会的发展规律。科学论证了资本主义必然灭亡和社会主义必然胜利。', '《共产党宣言》系统论述了无产阶级政党的性质、特点、任务和策略原则，阐明了建立无产阶级政党的必要性。', '《共产党宣言》阐述了未来共产主义社会的理想目标。'] },
};
