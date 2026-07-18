/**
 * 第一单元数据：从中华文明起源到秦汉统一多民族封建国家的建立与巩固
 * 高中历史统编版（2019）必修中外历史纲要上册
 * 基于新版自学提纲整理
 */

// 知识结构总览
export const knowledgeStructure = [
  { period: '旧石器—新石器', theme: '中华文明的起源', concepts: '旧石器时代、新石器时代文化遗存' },
  { period: '先秦（夏商西周）', theme: '早期国家制度', concepts: '分封制、宗法制、礼乐制、井田制' },
  { period: '春秋战国', theme: '社会大转型', concepts: '百家争鸣、变法运动、华夏认同' },
  { period: '秦朝', theme: '统一多民族封建国家确立', concepts: '皇帝制度、三公九卿、郡县制、书同文' },
  { period: '两汉', theme: '大一统巩固与发展', concepts: '汉武帝大一统、光武中兴、庄园经济、文化繁荣' },
];

// 朝代元数据
export const dynastyPeriods = [
  { id: 'paleolithic', name: '远古时期', startYear: '约前200万年前', endYear: '约前1万年前', color: '#8B5A2B' },
  { id: 'neolithic', name: '新石器时代', startYear: '约前1万年前', endYear: '约前5000年前', color: '#CD853F' },
  { id: 'xia', name: '夏朝', startYear: '约前2070年', endYear: '约前1600年', color: '#8B4513' },
  { id: 'shang', name: '商朝', startYear: '约前1600年', endYear: '约前1046年', color: '#CD853F' },
  { id: 'zhou_west', name: '西周', startYear: '约前1046年', endYear: '前771年', color: '#DAA520' },
  { id: 'spring_autumn', name: '春秋', startYear: '前770年', endYear: '前476年', color: '#228B22' },
  { id: 'warring_states', name: '战国', startYear: '前475年', endYear: '前221年', color: '#4169E1' },
  { id: 'qin', name: '秦朝', startYear: '前221年', endYear: '前207年', color: '#2F4F4F' },
  { id: 'han_west', name: '西汉', startYear: '前202年', endYear: '9年', color: '#B22222' },
  { id: 'han_east', name: '东汉', startYear: '25年', endYear: '220年', color: '#8B0000' },
];

// 时间轴事件
export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  dynasty: string;
  category: '政治' | '经济' | '思想' | '文化' | '军事' | '社会';
  summary: string;
  impact?: string;
  importance: 1 | 2 | 3 | 4 | 5;
  keyPeople?: string[];
}

export const timelineEvents: TimelineEvent[] = [
  // ====== 一、中华文明的起源 ======
  {
    id: 'paleolithic',
    year: '约200万年前—1万年前',
    title: '旧石器时代',
    dynasty: '远古',
    category: '社会',
    summary: '以元谋人、北京人为代表。生产工具以打制石器为主，生活方式为采集、渔猎、群居生活。社会形态为原始人群——共同劳动、共同分享劳动成果。',
    impact: '人类发展的最初阶段',
    importance: 3,
    keyPeople: ['元谋人', '北京人'],
  },
  {
    id: 'neolithic_yangshao',
    year: '约前7000—前5000年',
    title: '新石器时代·仰韶文化',
    dynasty: '远古',
    category: '文化',
    summary: '黄河中游地区代表性文化。标志：磨制石器、陶器出现。特征：彩绘陶器，以粟为主要栽培作物。代表：半坡遗址。',
    impact: '奠定了中华农业文明的基础',
    importance: 4,
  },
  {
    id: 'neolithic_hemudu',
    year: '约前7000—前5000年',
    title: '新石器时代·河姆渡文化',
    dynasty: '远古',
    category: '文化',
    summary: '长江下游地区代表性文化。特征：种植水稻，修建村落，掌握养蚕缫丝技术。',
    impact: '证明长江流域同样是中华文明重要发源地',
    importance: 4,
  },
  {
    id: 'neolithic_dawenkou',
    year: '约前4300—前2500年',
    title: '新石器时代·大汶口文化',
    dynasty: '远古',
    category: '文化',
    summary: '黄河下游地区代表性文化。特征：养猪较普遍，出现私有制和贫富分化。',
    impact: '体现了社会分化的早期迹象',
    importance: 3,
  },
  {
    id: 'neolithic_longshan',
    year: '约前5000—前1900年',
    title: '新石器时代·龙山文化',
    dynasty: '远古',
    category: '文化',
    summary: '黄河中下游地区代表性文化。特征：黑陶（蛋壳陶），社会分工扩大，军事民主制时期。传说中尧舜禹禅让发生于此。',
    impact: '为夏朝建立奠定基础',
    importance: 4,
  },
  {
    id: 'neolithic_liangzhu',
    year: '约前3400—前2250年',
    title: '良渚文化',
    dynasty: '远古',
    category: '文化',
    summary: '长江下游地区代表性文化。特征：精美玉器，大规模水利工程和城市规划，大规模祭坛神庙。',
    impact: '证明长江流域同样是中华文明重要发源地，玉器文化代表',
    importance: 4,
  },
  {
    id: 'neolithic_hongshan',
    year: '约前4500—前3000年',
    title: '红山文化',
    dynasty: '远古',
    category: '文化',
    summary: '东北地区（辽河流域）代表性文化。特征：精美玉器，大规模祭坛神庙，反映了早期宗教信仰。',
    importance: 3,
  },

  // ====== 二、夏商西周：早期国家与制度文明 ======
  {
    id: 'xia_establishment',
    year: '约前2070年',
    title: '夏朝建立·王位世袭制',
    dynasty: '夏朝',
    category: '政治',
    summary: '禹传位于启，结束禅让制，实行王位世袭制，标志着中国早期国家产生。',
    impact: '开创了"家天下"的王位继承模式，奴隶社会开始',
    importance: 5,
    keyPeople: ['禹', '启'],
  },
  {
    id: 'shang_bronze',
    year: '约前1600年',
    title: '商朝建立·青铜文明',
    dynasty: '商朝',
    category: '文化',
    summary: '商朝以青铜器铸造著称，甲骨文成熟，青铜时代鼎盛期，代表了高度发达的奴隶制文明。',
    impact: '创造了灿烂的青铜文化和文字体系',
    importance: 5,
    keyPeople: ['成汤'],
  },
  {
    id: 'western_zhou_found',
    year: '约前1046年',
    title: '武王伐纣·西周建立',
    dynasty: '西周',
    category: '政治',
    summary: '周武王灭商，建立西周。政治制度：分封制、宗法制、礼乐制。',
    impact: '确立了以血缘关系为基础的政治制度体系',
    importance: 5,
    keyPeople: ['周武王', '周公'],
  },
  {
    id: 'fengjian_system',
    year: '约前1046年',
    title: '分封制',
    dynasty: '西周',
    category: '政治',
    summary: '目的："封建亲戚，以藩屏周"，巩固周统治。对象：王族、功臣、先代贵族。权利：再分封、设置官员、建立武装、征派赋役。义务：镇守疆土、随从作战、缴纳贡赋、朝觐述职。',
    impact: '加强了周天子对地方的控制，扩大了统治区域；但后来导致诸侯割据，王权衰弱',
    importance: 5,
    keyPeople: ['周武王', '周公'],
  },
  {
    id: 'zongfa_system',
    year: '约前1046年',
    title: '宗法制',
    dynasty: '西周',
    category: '政治',
    summary: '目的：加强分封制形成的统治秩序，解决贵族之间在权力、财产和土地继承上的矛盾。含义：按照父系血缘关系亲疏分配政治权力。核心：嫡长子继承制度。特点：大小宗关系相对，小宗服从大宗；血缘和政治紧密结合。',
    impact: '保证了贵族集团内部的稳定和团结，形成家国同构的政治格局',
    importance: 5,
  },
  {
    id: 'liyue_system',
    year: '约前1046年',
    title: '礼乐制度',
    dynasty: '西周',
    category: '思想',
    summary: '目的：规范分封制和宗法制的等级秩序。关系：宗法制和分封制相辅相成、互为表里，共同维护西周政局稳定；礼乐制是维护宗法制和分封制的工具。',
    impact: '奠定了中国传统"礼乐文明"的基础',
    importance: 4,
  },
  {
    id: 'jingtian_system',
    year: '西周时期',
    title: '井田制',
    dynasty: '西周',
    category: '经济',
    summary: '本质：奴隶主土地国有制，土地不得随意买卖。公田和私田划分，收获物归公。工具：主要使用木、石、骨等，青铜农具很少。',
    impact: '是西周基本土地制度，后逐渐瓦解',
    importance: 4,
  },
  {
    id: 'early_nation_features',
    year: '夏商周',
    title: '早期国家政治制度特点',
    dynasty: '夏商周',
    category: '政治',
    summary: '①以血缘关系为纽带；②形成严格的等级秩序；③神权色彩浓厚；④地方权力较大，未实现权力高度集中；⑤家国同构，政权与族权相统一；⑥延续稳定。',
    impact: '影响此后两千多年的中国古代政治制度',
    importance: 3,
  },

  // ====== 三、春秋战国：大变革时期 ======
  {
    id: 'spring_autumn_declining',
    year: '前770年-前476年',
    title: '春秋时期·王室衰微',
    dynasty: '春秋',
    category: '政治',
    summary: '周王室权威衰落，诸侯争霸，分封制、宗法制遭到破坏。礼乐制度崩溃。',
    impact: '打破了贵族政治秩序，为战国变法运动开辟道路',
    importance: 4,
  },
  {
    id: 'iron_agriculture',
    year: '春秋战国',
    title: '铁器牛耕推广',
    dynasty: '春秋-战国',
    category: '经济',
    summary: '铁农具和牛耕技术的使用，提高了农业生产力。',
    impact: '推动了井田制瓦解和土地私有制形成，是春秋战国社会变革的根本原因',
    importance: 5,
  },
  {
    id: 'privatization_land',
    year: '春秋战国',
    title: '土地私有制确立',
    dynasty: '战国',
    category: '经济',
    summary: '"废井田，开阡陌"，授田于百姓。土地私有制逐步确立，允许买卖。',
    impact: '确立了小农经济的生产方式',
    importance: 4,
  },
  {
    id: 'small_peasant_economy',
    year: '春秋战国',
    title: '小农经济形成',
    dynasty: '战国',
    category: '经济',
    summary: '含义：以家庭为生产、生活单位，农业和家庭手工业相结合，生产主要是为满足自家基本生活的需要和交纳赋税，是一种自给自足的自然经济。特点：自给自足、男耕女织、分散性、封闭性、落后性、脆弱性。',
    impact: '成为中国封建经济的基础，延续两千多年',
    importance: 5,
  },
  {
    id: 'shangyang_reform',
    year: '前356年',
    title: '商鞅变法',
    dynasty: '战国·秦',
    category: '政治',
    summary: '背景：政治—王室衰微；经济—铁农具牛耕提高生产力；军事—争霸战争需要富国强兵；思想—法家学说为变法提供武器。主要内容：①重农抑商，奖励耕织；②奖励军功；③强制大家庭拆散为个体小家庭；④废井田开阡陌；⑤什伍连坐；⑥推行县制。',
    impact: '使秦国国富兵强，为秦统一六国奠定基础；推动社会从奴隶制向封建制转变',
    importance: 5,
    keyPeople: ['商鞅', '秦孝公'],
  },
  {
    id: 'huaxia_identity',
    year: '春秋时期',
    title: '华夏认同形成',
    dynasty: '春秋',
    category: '社会',
    summary: '"华夷"观念削弱，促进民族交融与华夏认同观念。从攘夷到融夷：①华夏族吸收新鲜血液，更加稳定；②促进民族交融，为中华文明多元一体奠定基础；③有利于形成对统一多民族国家的认同感。',
    impact: '为统一多民族国家奠定基础',
    importance: 4,
  },
  {
    id: 'hundred_schools',
    year: '前770年-前221年',
    title: '百家争鸣',
    dynasty: '春秋战国',
    category: '思想',
    summary: '背景：经济—井田制崩溃；政治—周王室衰微；阶级—士阶层崛起；文化—从"学在官府"到"学在民间"，私学兴起。意义：①是社会经济发展的反映；②奠定中国传统文化体系基础；③中国历史上第一次思想解放运动；④为新兴地主阶级提供思想理论。',
    impact: '奠定了中国传统文化体系的基础，是中国历史上第一次思想解放运动',
    importance: 5,
    keyPeople: ['孔子', '老子', '孟子', '荀子', '墨子', '韩非子'],
  },
  {
    id: 'confucius_thought',
    year: '前551年-前479年',
    title: '孔子与儒家思想',
    dynasty: '春秋',
    category: '思想',
    summary: '核心观念："仁"——爱人，主张统治者"为政以德"；"礼"——恢复西周礼乐制度。教育成就：创立私学，"有教无类"，整理六经。人文主义精神："仁"影响中国人谦恭性格；"礼"强调社会责任；"敬鬼神而远之"体现以人为本；"有教无类"发展个性。',
    impact: '奠定了儒家学说的基础，对中国思想文化产生深远影响',
    importance: 5,
    keyPeople: ['孔子'],
  },
  {
    id: 'laozi_taoism',
    year: '约前571年-前471年',
    title: '老子与道家思想',
    dynasty: '春秋',
    category: '思想',
    summary: '核心思想："道"是天地万物的本原，追求天人合一。朴素的辩证法：事物存在着矛盾，矛盾双方可以相互转化。政治主张：顺其自然，无为而治。',
    impact: '形成了道家思想体系，影响中国哲学',
    importance: 4,
    keyPeople: ['老子'],
  },
  {
    id: 'mengzi_rujia',
    year: '战国',
    title: '孟子与荀子',
    dynasty: '战国',
    category: '思想',
    summary: '孟子：人性善；"仁政"、"民贵君轻"。荀子：人性恶；隆礼重法；"制天命而用之"。',
    impact: '发展了儒家思想',
    importance: 4,
    keyPeople: ['孟子', '荀子'],
  },
  {
    id: 'hanfei_fajia',
    year: '战国',
    title: '韩非子与法家思想',
    dynasty: '战国',
    category: '思想',
    summary: '核心主张：法治、中央集权。特点：以法治国、法术势结合。代表新兴地主阶级利益。',
    impact: '成为秦朝建立专制主义中央集权的思想基础',
    importance: 4,
    keyPeople: ['韩非子'],
  },
  {
    id: 'mozhi_mojia',
    year: '战国',
    title: '墨子与墨家思想',
    dynasty: '战国',
    category: '思想',
    summary: '核心主张："兼爱"——无差别地爱所有人；"非攻"——反对战争；"尚贤"——任人唯贤；"节用"——节约费用。代表下层平民的利益。',
    impact: '代表小生产者利益',
    importance: 3,
    keyPeople: ['墨子'],
  },

  // ====== 四、秦朝：统一多民族封建国家的建立 ======
  {
    id: 'qin_unification',
    year: '前221年',
    title: '秦朝统一六国',
    dynasty: '秦朝',
    category: '政治',
    summary: '秦始皇灭六国，建立中国历史上第一个大一统封建王朝。统一条件：①长期战乱，人民渴望安定统一；②经济发展要求打破政治分裂；③秦国地理位置优越；④秦王嬴政善于用人；⑤商鞅变法奠定基础；⑥采用"远交近攻"战略；⑦法家思想指导。',
    impact: '建立起幅员辽阔的国家，奠定此后历代疆域基本版图',
    importance: 5,
    keyPeople: ['秦始皇'],
  },
  {
    id: 'emperor_system',
    year: '前221年',
    title: '皇帝制度确立',
    dynasty: '秦朝',
    category: '政治',
    summary: '确立皇帝称号：皇权至上、皇帝独尊、皇位世袭。',
    impact: '奠定了两千多年君主专制制度的基础',
    importance: 5,
    keyPeople: ['秦始皇'],
  },
  {
    id: 'san_gong_jiu_qing',
    year: '前221年',
    title: '三公九卿制',
    dynasty: '秦朝',
    category: '政治',
    summary: '三公：丞相（百官之首，处理政务）、御史大夫（副丞相，监察百官，下达诏令）、太尉（负责军事）。九卿：三公之下设置的诸卿，是中央各重要部门的主管官员。',
    impact: '建立了中央官制体系',
    importance: 4,
  },
  {
    id: 'junxian_system',
    year: '前221年',
    title: '郡县制推行',
    dynasty: '秦朝',
    category: '政治',
    summary: '废除分封制，在全境推行郡县制。设郡、县两级行政机构，县下设乡、里、亭。郡守和县令由中央任免和考核。',
    impact: '实现了中央对地方的直接有效控制，官僚政治取代贵族政治',
    importance: 5,
  },
  {
    id: 'qin_unification_measures',
    year: '前221年-前207年',
    title: '秦朝巩固统一措施',
    dynasty: '秦朝',
    category: '政治',
    summary: '政治：建立并巩固专制主义中央集权制度。经济：统一度量衡、统一货币。文化思想：统一文字、整顿风俗、颁行法律。交通：修驰道、直道、统一车轨。军事：修筑长城。',
    impact: '促进了经济文化交流，巩固了国家统一',
    importance: 4,
    keyPeople: ['秦始皇'],
  },
  {
    id: 'centralization_system',
    year: '秦朝',
    title: '专制主义中央集权制度',
    dynasty: '秦朝',
    category: '政治',
    summary: '君主专制：皇帝个人专断独裁，皇权不断增强，相权不断削弱。中央集权：地方政府绝对服从中央，中央权力不断增强，地方权力不断被削弱。',
    impact: '奠定两千多年政治制度的基本格局',
    importance: 5,
  },
  {
    id: 'qin_legalism',
    year: '战国-秦',
    title: '秦朝文官制度作用',
    dynasty: '秦朝',
    category: '政治',
    summary: '作用：①保障皇帝和中央的政令能够传送到全国各地；②提高行政效率，加强专制主义中央集权制；③为汉承秦制提供条件，具有较高史料价值。',
    impact: '保证了大一统帝国的有效运转',
    importance: 3,
  },
  {
    id: 'fenjun_vs_junxian',
    year: '西周-秦',
    title: '郡县制与分封制比较',
    dynasty: '秦朝',
    category: '政治',
    summary: '本质区别：分封制以血缘关系为基础，官吏世袭；郡县制按地域划分，官吏由皇帝和朝廷任免，不能世袭。相同点：都是地方行政制度；目的都是巩固王权；都在一定时期内产生过积极作用。',
    impact: '标志着官僚政治取代贵族政治',
    importance: 5,
  },
  {
    id: 'qin_unification_significance',
    year: '前221年后',
    title: '秦朝统一的历史意义',
    dynasty: '秦朝',
    category: '政治',
    summary: '①建立起幅员辽阔的国家，奠定此后历代疆域基本版图；②统一中央集权国家促进各民族交往交流交融；③推动统一多民族国家政治、经济、社会发展；④有利于小农经济稳定；⑤奠定两千多年政治制度的基本格局。',
    impact: '开创了中国历史的新纪元',
    importance: 5,
  },

  // ====== 五、两汉：大一统的巩固与发展 ======
  {
    id: 'wu_zeti_tianxia',
    year: '汉初',
    title: '汉初"无为而治"',
    dynasty: '西汉',
    category: '思想',
    summary: '原因：①现实原因：汉初民生凋敝，百废待兴；②前朝教训：秦朝刑法严苛，征发繁重，导致秦朝速亡。措施：减轻赋税、释放奴婢、与民休息。',
    impact: '促进了社会经济的恢复发展，为汉武帝大一统奠定基础',
    importance: 4,
    keyPeople: ['汉高祖', '汉文帝', '汉景帝'],
  },
  {
    id: 'han_wudi_hegemony',
    year: '前141年-前87年',
    title: '汉武帝大一统',
    dynasty: '西汉',
    category: '政治',
    summary: '政治：推恩令削弱诸侯；刺史制度监督地方；察举制选拔人才。中外朝制度：削弱相权。经济：盐铁官营、统一货币（五铢钱）、算缗告缗。思想："罢黜百家，独尊儒术"。民族：北击匈奴、通西域。',
    impact: '巩固了西汉大一统局面，奠定中国儒学正统地位',
    importance: 5,
    keyPeople: ['汉武帝'],
  },
  {
    id: 'dongzhongshu_ruxue',
    year: '西汉',
    title: '董仲舒新儒学体系',
    dynasty: '西汉',
    category: '思想',
    summary: '"春秋大一统"——加强中央集权；"罢黜百家，独尊儒术"——确立儒学正统；"君权神授""天人感应"——神化君权；"三纲五常"——规范社会秩序；"限田，薄敛，省役"——限制土地兼并。',
    impact: '确立了儒家学说的统治地位',
    importance: 4,
    keyPeople: ['董仲舒'],
  },
  {
    id: 'guangwu_zhongxing',
    year: '25年-57年',
    title: '光武中兴',
    dynasty: '东汉',
    category: '政治',
    summary: '刘秀建立东汉。政治：增强尚书台作用，严格控制外戚干政，裁并郡县，整顿吏治。经济：清查垦田人口数量，释放奴婢。社会稳定，经济恢复。文化：重视儒学。',
    impact: '东汉前期出现社会稳定、经济恢复的局面',
    importance: 3,
    keyPeople: ['刘秀（汉光武帝）'],
  },
  {
    id: 'manor_economy',
    year: '两汉',
    title: '东汉庄园经济',
    dynasty: '西汉-东汉',
    category: '经济',
    summary: '概念：豪强地主经营土地的主要方式。田庄经营：规模大，多种经营，聚族而居，拥有私人武装，自给自足。租佃经营：佃农依附性减弱，个体农耕。',
    impact: '成为东汉以后地方割据的经济基础',
    importance: 3,
  },
  {
    id: 'han_culture_flourish',
    year: '两汉',
    title: '两汉文化的繁荣',
    dynasty: '西汉-东汉',
    category: '文化',
    summary: '史学：司马迁《史记》（第一部纪传体通史）、班固《汉书》（第一部纪传体断代史）。文学：汉赋、乐府诗、五言诗。医学：《黄帝内经》《神农本草经》《伤寒杂病论》（张仲景，"医圣"）、华佗麻沸散。科技：《九章算术》、蔡伦造纸术、张衡地动仪。',
    impact: '奠定了中华文化的基本格局',
    importance: 4,
  },
];

// 概念词典
export interface Concept {
  id: string;
  name: string;
  category: '政治' | '经济' | '思想' | '文化' | '军事' | '社会';
  definition: string;
  keyPeople?: string[];
  relatedEvents?: string[];
}

export const concepts: Concept[] = [
  // 政治制度
  {
    id: 'fengjian',
    name: '分封制',
    category: '政治',
    definition: '西周实行的以宗法制为基础的贵族分封制度。周天子将土地和人民分封给王族、功臣、先代贵族，诸侯对天子有镇守疆土、随从作战、缴纳贡赋、朝觐述职等义务。',
    relatedEvents: ['western_zhou_found', 'fengjian_system'],
  },
  {
    id: 'zongfa',
    name: '宗法制',
    category: '政治',
    definition: '按照父系血缘关系亲疏分配政治权力和维护政治联系的制度。以嫡长子继承制为核心，大小宗关系相对，小宗服从大宗，血缘和政治紧密结合。',
    relatedEvents: ['western_zhou_found', 'zongfa_system'],
  },
  {
    id: 'liyue',
    name: '礼乐制度',
    category: '政治',
    definition: '维护宗法制和分封制的行为规范和准则。用礼来区分等级，用乐来协调秩序，二者相辅相成。',
    relatedEvents: ['liyue_system'],
  },
  {
    id: 'jingtian',
    name: '井田制',
    category: '经济',
    definition: '西周时期的土地国有制度。土地被划为"井"字形，分为公田和私田，劳动者无土地使用权，不得随意买卖。',
    relatedEvents: ['jingtian_system'],
  },
  {
    id: 'junxian',
    name: '郡县制',
    category: '政治',
    definition: '秦朝在废除分封制后推行的行政区划制度。设郡、县两级，郡守和县令由中央任免，实现了中央对地方的直接控制。',
    relatedEvents: ['junxian_system', 'qin_unification'],
  },
  {
    id: 'sangong_jiqing',
    name: '三公九卿制',
    category: '政治',
    definition: '秦朝中央官制。三公为丞相（百官之首，辅助皇帝处理政务）、御史大夫（副丞相，监察百官）、太尉（负责军事）；三公之下设九卿。',
    relatedEvents: ['san_gong_jiu_qing'],
  },
  {
    id: 'huangdi_zhidu',
    name: '皇帝制度',
    category: '政治',
    definition: '秦始皇创立的君主专制制度。特点：皇帝独尊、皇权至上、皇位世袭。奠定了中国两千多年君主专制制度的基础。',
    relatedEvents: ['emperor_system'],
  },
  {
    id: 'zhongyang_jiquan',
    name: '专制主义中央集权制度',
    category: '政治',
    definition: '包括君主专制（皇帝个人专断独裁）和中央集权（地方绝对服从中央）两方面。皇权不断加强，相权不断削弱；中央权力不断加强，地方权力不断削弱。',
    relatedEvents: ['qin_unification_measures'],
  },
  {
    id: 'xiaokang_jingji',
    name: '小农经济',
    category: '经济',
    definition: '以家庭为单位、分散经营、生产规模较小的自然经济。产生于春秋战国铁犁牛耕背景下，是封建社会统治的经济基础。',
    relatedEvents: ['small_peasant_economy', 'iron_agriculture'],
  },
  {
    id: 'ziranjingji',
    name: '自然经济',
    category: '经济',
    definition: '物质生产自给自足的经济形态，与商品经济相对。最早产生于原始社会，可包括多个家庭的经济单位（庄园）。',
  },
  {
    id: 'shangyong_duhua',
    name: '工商食官',
    category: '经济',
    definition: '西周时期的官营手工业和商业制度。手工业和商业由官府控制，工匠和商人依附于官府。',
    relatedEvents: ['privatize_economy'],
  },
  {
    id: 'shangyang_bianfa',
    name: '商鞅变法',
    category: '政治',
    definition: '战国时期商鞅在秦国推行的改革。主要内容：重农抑商、奖励军功、废井田开阡陌、推行县制、什伍连坐。是战国时期持续时间最长、涉及面最广、改革最彻底的变法。',
    relatedEvents: ['shangyang_reform'],
  },
  {
    id: 'baijia_chengming',
    name: '百家争鸣',
    category: '思想',
    definition: '春秋战国时期思想文化领域繁荣景象。私学兴起，士阶层崛起，儒、道、墨、法、名、阴阳等学派著书立说，相互辩论。是中国历史上第一次思想解放运动，奠定了中国传统文化体系的基础。',
    relatedEvents: ['hundred_schools'],
  },
  {
    id: 'ruanjia_sixiang',
    name: '儒家思想',
    category: '思想',
    definition: '孔子创立的学派。核心思想"仁"和"礼"，主张"德治"、"仁政"，有教无类。孟子发展为"民贵君轻"的民本思想，荀子提出"性恶论"。',
    keyPeople: ['孔子', '孟子', '荀子'],
    relatedEvents: ['confucius_thought'],
  },
  {
    id: 'daoja_sixiang',
    name: '道家思想',
    category: '思想',
    definition: '老子创立的学派。主张"道法自然"，无为而治，朴素的辩证法思想。庄子发展为追求精神自由的主观唯心主义。',
    keyPeople: ['老子', '庄子'],
  },
  {
    id: 'fajia_sixiang',
    name: '法家思想',
    category: '思想',
    definition: '代表新兴地主阶级利益的思想流派。主张以法治国、韩非子提出"法、术、势"结合的思想，为君主专制提供了理论依据。',
    keyPeople: ['韩非子', '商鞅'],
    relatedEvents: ['qin_legalism'],
  },
  {
    id: 'mojia_sixiang',
    name: '墨家思想',
    category: '思想',
    definition: '墨子创立的学派。主张"兼爱"、"非攻"、"尚贤"、"节用"，代表小生产者利益。',
    keyPeople: ['墨子'],
  },
  {
    id: 'huaxia_yishi',
    name: '华夏认同',
    category: '社会',
    definition: '春秋时期形成的华夷五方观念。通过"尊王攘夷"战争，华夏族吸收周边民族，逐渐形成中华民族的前身。促进了民族交融，为统一多民族国家奠定基础。',
    relatedEvents: ['huaxia_identity'],
  },
  {
    id: 'wuwuerzhi',
    name: '无为而治',
    category: '思想',
    definition: '汉初实行的统治思想。吸取秦朝严刑峻法导致灭亡的教训，实行与民休息的政策，减轻赋税徭役，促进社会经济的恢复。',
    relatedEvents: ['wu_zeti_tianxia'],
  },
  {
    id: 'baiyichu_duzhong',
    name: '罢黜百家，独尊儒术',
    category: '思想',
    definition: '汉武帝时期董仲舒提出的思想政策。确立儒家学说的正统地位，结束了百家争鸣的局面，奠定了中国儒学统治地位的基础。',
    keyPeople: ['汉武帝', '董仲舒'],
    relatedEvents: ['han_wudi_hegemony'],
  },
  {
    id: 'zhuangyuan_jingji',
    name: '庄园经济',
    category: '经济',
    definition: '两汉时期豪强地主经营土地的主要方式。大地主建立田庄，内部自给自足，形成独立的经济实体。',
    relatedEvents: ['manor_economy'],
  },
  {
    id: 'wangwei_shuxi',
    name: '王位世袭制',
    category: '政治',
    definition: '夏朝建立后确立的继承制度。禹传位于启，结束了禅让制，开始了"家天下"的时代。',
    relatedEvents: ['xia_establishment'],
  },
  {
    id: 'tianxia_yiti',
    name: '统一多民族国家',
    category: '政治',
    definition: '秦朝统一六国后形成的国家形态。结束了长期的诸侯割据局面，奠定了中国统一多民族国家的基础。',
    relatedEvents: ['qin_unification'],
  },
];

// 因果链
export interface CausalLink {
  id: string;
  sourceId: string;
  targetId: string;
  logic: string;
  type?: string;
}

export const causalLinks: CausalLink[] = [
  // 生产力发展
  {
    id: 'cl_iron_jingtian',
    sourceId: 'iron_agriculture',
    targetId: 'jingtian_system',
    logic: '铁器牛耕提高了生产力，井田制的集体劳作方式不再适应',
  },
  {
    id: 'cl_jingtian_land',
    sourceId: 'jingtian_system',
    targetId: 'privatization_land',
    logic: '井田制逐渐瓦解，土地私有制逐步确立',
  },
  {
    id: 'cl_land_xiangnong',
    sourceId: 'privatization_land',
    targetId: 'small_peasant_economy',
    logic: '土地私有制确立后，以家庭为单位的小农经济得以形成',
  },
  {
    id: 'cl_iron_qinshui',
    sourceId: 'iron_agriculture',
    targetId: 'shangyang_reform',
    logic: '生产力发展要求改革生产关系，商鞅顺应了这一历史潮流',
  },
  {
    id: 'cl_land_siyi',
    sourceId: 'small_peasant_economy',
    targetId: 'shangyang_reform',
    logic: '小农经济的兴起需要新的生产关系，商鞅变法确立了封建制度',
  },

  // 社会变革
  {
    id: 'cl_tianxia_xiaosheng',
    sourceId: 'iron_agriculture',
    targetId: 'spring_autumn_declining',
    logic: '生产力发展导致井田制瓦解，动摇了分封制的经济基础',
  },
  {
    id: 'cl_spring_warring',
    sourceId: 'spring_autumn_declining',
    targetId: 'hundred_schools',
    logic: '王室衰微、诸侯争霸，士阶层崛起，百家争鸣兴起',
  },
  {
    id: 'cl_spring_bianfa',
    sourceId: 'spring_autumn_declining',
    targetId: 'shangyang_reform',
    logic: '诸侯争霸需要"富国强兵"，推动了各国变法运动',
  },
  {
    id: 'cl_bianfa_qintongyi',
    sourceId: 'shangyang_reform',
    targetId: 'qin_unification',
    logic: '商鞅变法使秦国国富兵强，为统一六国奠定基础',
  },
  {
    id: 'cl_baijia_fajia',
    sourceId: 'hundred_schools',
    targetId: 'qin_unification',
    logic: '百家争鸣为秦统一提供了思想理论基础，特别是法家思想',
  },

  // 政治制度演进
  {
    id: 'cl_zongfa_fengjian',
    sourceId: 'zongfa_system',
    targetId: 'fengjian_system',
    logic: '宗法制是分封制的血缘基础，二者互为表里',
  },
  {
    id: 'cl_fengjian_liyue',
    sourceId: 'fengjian_system',
    targetId: 'liyue_system',
    logic: '礼乐制度是维护分封制和宗法制的行为规范',
  },
  {
    id: 'cl_fengjian_junxian',
    sourceId: 'fengjian_system',
    targetId: 'junxian_system',
    logic: '分封制最终导致诸侯割据，郡县制是其对立物',
  },
  {
    id: 'cl_junxian_centralization',
    sourceId: 'junxian_system',
    targetId: 'zhongyang_jiquan',
    logic: '郡县制是中央集权的制度保障',
  },
  {
    id: 'cl_fengjian_sanhuang',
    sourceId: 'fengjian_system',
    targetId: 'sangong_jiqing',
    logic: '从贵族世袭制到官僚任免制，是政治制度的重大进步',
  },

  // 秦朝建立与巩固
  {
    id: 'cl_empire_huangdi',
    sourceId: 'qin_unification',
    targetId: 'emperor_system',
    logic: '统一后秦始皇确立皇帝制度，以强化君权',
  },
  {
    id: 'cl_empire_sanqing',
    sourceId: 'emperor_system',
    targetId: 'san_gong_jiu_qing',
    logic: '皇帝制度下需要三公九卿制来处理政务',
  },
  {
    id: 'cl_sanqing_central',
    sourceId: 'san_gong_jiu_qing',
    targetId: 'zhongyang_jiquan',
    logic: '三公九卿制是中央集权的重要组成部分',
  },
  {
    id: 'cl_empire_measures',
    sourceId: 'qin_unification',
    targetId: 'qin_unification_measures',
    logic: '统一后需要一系列措施来巩固统一成果',
  },

  // 西汉
  {
    id: 'cl_qin_fan_wuwu',
    sourceId: 'qin_unification_measures',
    targetId: 'wu_zeti_tianxia',
    logic: '秦朝暴政导致灭亡，汉初吸取教训，实行无为而治',
  },
  {
    id: 'cl_wuwu_hanwu',
    sourceId: 'wu_zeti_tianxia',
    targetId: 'han_wudi_hegemony',
    logic: '汉初恢复发展后，汉武帝需要大一统来加强中央集权',
  },
  {
    id: 'cl_hanwu_zhongshu',
    sourceId: 'han_wudi_hegemony',
    targetId: 'baiyichu_duzhong',
    logic: '政治大一统需要思想大一统来支撑',
  },

  // 思想文化
  {
    id: 'cl_jingtian_baijia',
    sourceId: 'jingtian_system',
    targetId: 'hundred_schools',
    logic: '井田制崩溃后，学在官府变为学在民间',
  },
  {
    id: 'cl_ruanjia_zhongguo',
    sourceId: 'confucius_thought',
    targetId: 'baiyichu_duzhong',
    logic: '儒家思想成为汉武帝大一统的思想工具',
  },
  {
    id: 'cl_manor_hanjin',
    sourceId: 'manor_economy',
    targetId: 'han_wudi_hegemony',
    logic: '豪强地主势力膨胀威胁中央，汉武帝需要加强集权',
  },

  // 华夏认同
  {
    id: 'cl_huaxia_yiti',
    sourceId: 'huaxia_identity',
    targetId: 'qin_unification',
    logic: '华夏认同促进了民族凝聚力，为统一奠定思想基础',
  },
  {
    id: 'cl_qintongyi_yiti',
    sourceId: 'qin_unification',
    targetId: 'tianxia_yiti',
    logic: '秦统一促进了民族交融，形成统一多民族国家',
  },
];

// 导出所有数据供 AI 使用
export const unit1Data = {
  timelineEvents,
  concepts,
  causalLinks,
  dynastyPeriods,
};

// 生成 AI 上下文文本
export function generateAIContext(): string {
  let context = '# 第一单元 高中历史知识点\n\n';

  context += '## 时间轴事件\n\n';
  for (const event of timelineEvents) {
    context += `【${event.year}】${event.title}（${event.dynasty}）\n`;
    context += `  摘要：${event.summary}\n`;
    if (event.impact) {
      context += `  影响：${event.impact}\n`;
    }
    if (event.keyPeople) {
      context += `  关键人物：${event.keyPeople.join('、')}\n`;
    }
    context += '\n';
  }

  context += '## 核心概念\n\n';
  for (const concept of concepts) {
    context += `【${concept.name}】（${concept.category}类）\n`;
    context += `  定义：${concept.definition}\n`;
    if (concept.keyPeople) {
      context += `  关键人物：${concept.keyPeople.join('、')}\n`;
    }
    context += '\n';
  }

  context += '## 因果逻辑链\n\n';
  const sourceEvents = new Map(timelineEvents.map(e => [e.id, e]));
  for (const link of causalLinks) {
    const source = sourceEvents.get(link.sourceId);
    const target = sourceEvents.get(link.targetId);
    if (source && target) {
      context += `${source.title} → ${target.title}\n`;
      context += `  逻辑：${link.logic}\n\n`;
    }
  }

  return context;
}
