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

// 历史必背知识（第一单元 - 基于新版自学提纲全部知识点）
const BUILT_IN_HISTORY_MUST_KNOW: HistoryMustKnowItem[] = [
  // ====== 一、中华文明的起源 ======
  {
    id: 'unit1-1-1',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '旧石器时代',
    year: '约200万年前—1万年前',
    dynasty: '远古',
    content: '距今约200万年前—约1万年前，代表：元谋人、北京人。生产工具：以打制石器为主。生活方式：采集、渔猎、群居生活。社会形态：原始人群——共同劳动、共同分享劳动成果。',
    explanation: '旧石器时代是人类发展的最初阶段。元谋人（约170万年前）和北京人（约70-20万年前）是这一时期的代表。打制石器的使用是人类区别于动物的重要标志。群居生活、采集渔猎是这一时期人类生存的主要方式。',
    gaokaoFocus: '了解人类早期发展的基本特征',
    relatedEvents: ['新石器时代'],
    typicalQuestions: [],
    importance: 2,
    source: 'builtin'
  },
  {
    id: 'unit1-1-2',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '新石器时代代表性文化遗存',
    year: '约前1万年前—前5000年',
    dynasty: '远古',
    content: '【新石器时代早期】仰韶文化：黄河中游，彩陶文化，以粟为主栽培作物，母系氏族社会。大汶口文化：黄河下游，养猪较普遍。河姆渡文化：长江下游，种植水稻，修建村落，养蚕缫丝技术。【新石器时代晚期】龙山文化：黄河流域，黑陶（蛋壳陶），父系氏族社会，贫富分化。红山文化：辽河流域，精美玉器，大规模祭坛神庙。良渚文化：长江下游，玉器文化，大规模水利工程。',
    explanation: '新石器时代是人类社会发展史上的重要阶段，标志是磨制石器和陶器的出现。记忆口诀：仰韶彩陶种粟、大汶口养猪、河姆渡水稻蚕丝；龙山黑陶、红山玉器神庙、良渚长江下游。各文化遗存证明了中华文明的多元起源。',
    gaokaoFocus: '各文化的特点、时间和地理位置是常考点',
    relatedEvents: ['旧石器时代'],
    typicalQuestions: [
      { year: '2022全国甲卷', question: '以彩陶文化著称的新石器时代文化是？', answer: '仰韶文化', difficulty: 'easy' }
    ],
    importance: 3,
    source: 'builtin'
  },

  // ====== 二、夏商西周：早期国家与制度文明 ======
  {
    id: 'unit1-2-1',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '早期国家政治制度的特点',
    year: '夏商周',
    dynasty: '夏商周',
    content: '早期国家政治制度特点：①以血缘关系为纽带；②形成严格的等级秩序；③神权色彩浓厚；④地方权力较大，未实现权力高度集中；⑤家国同构，政权与族权相统一；⑥延续稳定。',
    explanation: '夏商周三代是中国早期国家形成和发展时期。其政治制度特点：1）以血缘关系为纽带——国家权力通过血缘宗法关系来分配和维系；2）严格的等级秩序——通过分封制和宗法制建立起森严的等级体系；3）神权色彩浓厚——商朝尤甚，用神权维护统治；4）地方权力较大——分封制下诸侯有很大的自主权；5）家国同构——"家天下"，国家被视为君主家族的延伸；6）制度具有延续性——周礼对后世影响深远。',
    gaokaoFocus: '理解中国政治制度的起源，常与后世对比考查',
    relatedEvents: ['分封制', '宗法制', '礼乐制度'],
    typicalQuestions: [],
    importance: 3,
    source: 'builtin'
  },
  {
    id: 'unit1-2-2',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '分封制',
    year: '西周',
    dynasty: '西周',
    content: '目的："封建亲戚，以藩屏周"，巩固周统治。对象：王族、功臣、先代贵族。权利：再分封、设置官员、建立武装、征派赋役。义务：镇守疆土、随从作战、缴纳贡赋、朝觐述职。【积极】加强了周天子对地方统治，巩固了王权；扩大了统治区域，开发了边远地区。【消极】西周后期，诸侯独立性大，王权衰弱，分封制遭到破坏。',
    explanation: '分封制是西周最重要的政治制度。理解要点：1）目的是"封建亲戚，以藩屏周"；2）分封对象包括同姓王室子弟、功臣、先代贵族；3）诸侯义务：镇守疆土、随从作战、缴纳贡赋、朝觐述职。分封制与宗法制互为表里，是西周统治的两大支柱。',
    gaokaoFocus: '辽宁高考常考点，常与宗法制、礼乐制度对比考查',
    relatedEvents: ['宗法制', '礼乐制度', '井田制'],
    typicalQuestions: [
      { year: '2023辽宁高考', question: '西周分封制的主要目的是什么？', answer: '巩固周天子的统治，即"封建亲戚，以藩屏周"', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-2-3',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '宗法制',
    year: '西周',
    dynasty: '西周',
    content: '目的：加强分封制形成的统治秩序，解决贵族之间在权力、财产和土地继承上的矛盾。含义：按照父系血缘关系亲疏分配政治权力，维护政治联系。【核心】嫡长子继承制度。【特点】①核心：嫡长子继承制；②大小宗关系相对，小宗服从大宗；③血缘和政治紧密地结合在一起。【影响】保证了各级贵族在政治上的垄断和特权地位，有利于统治集团内部的稳定和团结。',
    explanation: '宗法制是西周政治制度的另一支柱。理解要点：1）宗法制以嫡长子继承制为核心，解决贵族在财产和权力继承上的矛盾；2）大宗与小宗的关系是相对的，如周天子对诸侯是大宗，诸侯对其国内卿大夫是大宗；3）宗法制保证了贵族等级秩序的稳定。分封制与宗法制相互依存，共同维护西周统治。',
    gaokaoFocus: '常与分封制结合考查，是理解西周政治制度的核心',
    relatedEvents: ['分封制', '礼乐制度', '井田制'],
    typicalQuestions: [
      { year: '2023全国甲卷', question: '宗法制的核心是什么？', answer: '嫡长子继承制', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-2-4',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '礼乐制度',
    year: '西周',
    dynasty: '西周',
    content: '目的：规范分封制和宗法制的等级秩序而形成的行为规范和准则。【三制关系】①宗法制和分封制是西周的基本政治制度，两者相辅相成、互为表里，共同维护西周政局的稳定；②礼乐制是维护宗法制和分封制的工具。',
    explanation: '礼乐制度是西周统治的重要工具。理解要点：1）"礼"规定了不同等级在祭祀、婚丧、朝聘等场合的行为规范，是等级分明的社会制度；2）"乐"通过音乐艺术陶冶情操，促进社会和谐；3）礼乐制度与分封制、宗法制相配合，形成完整的统治秩序；4）孔子对周礼极为推崇，主张"克己复礼"。',
    gaokaoFocus: '理解西周政治制度的完整体系，常与孔子思想结合',
    relatedEvents: ['分封制', '宗法制', '孔子'],
    typicalQuestions: [
      { year: '2021辽宁高考', question: '西周礼乐制度的作用是？', answer: '维护等级秩序，巩固西周统治', difficulty: 'easy' }
    ],
    importance: 4,
    source: 'builtin'
  },
  {
    id: 'unit1-2-5',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '商周经济',
    year: '商周',
    dynasty: '商周',
    content: '【农业】工具：主要使用木、石、骨等，青铜农具很少。土地制度：井田制——奴隶主土地国有制，土地不得随意买卖。【手工业】青铜制造是手工业生产中的主要部门，种类繁多。"工商食官"——官府垄断工商业。',
    explanation: '商周时期是中国奴隶社会的繁荣期。农业上主要使用木器、石器、骨器，青铜农具很少使用。井田制是这一时期最重要的土地制度，土地属于周王所有（即国有），被划为"井"字形，不得随意买卖。手工业方面，青铜铸造是主要部门，"工商食官"说明手工业和商业由官府控制。',
    gaokaoFocus: '井田制是高频考点，常与土地制度演变结合',
    relatedEvents: ['井田制', '工商食官'],
    typicalQuestions: [
      { year: '2022全国乙卷', question: '井田制的本质是什么？', answer: '奴隶主土地国有制', difficulty: 'medium' }
    ],
    importance: 4,
    source: 'builtin'
  },

  // ====== 三、春秋战国：大变革时期 ======
  {
    id: 'unit1-3-1',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '春秋战国阶段特征',
    year: '前770年-前221年',
    dynasty: '春秋战国',
    content: '【本质】奴隶制向封建制转变；大动荡、大变革、大发展时期。【政治】王室衰微，诸侯纷争，各国变法；分封制逐渐崩溃，开始出现郡县制；由分裂走向统一；由奴隶制贵族政治向封建官僚政治演变。【经济】铁器牛耕使用，生产力飞跃；井田制逐渐瓦解，土地私有制逐渐确立；精耕细作的小农经济开始形成；工商食官局面被打破。【思想】礼乐制度崩溃，形成了百家争鸣局面。',
    explanation: '春秋战国是中国历史上最重要的大变革时期。政治上：周王室衰微，诸侯争霸战争频繁，各国变法（商鞅变法是最彻底的）。经济上：铁器和牛耕的使用使生产力大幅提高，井田制瓦解，土地私有制确立，小农经济形成。思想上：百家争鸣是中国第一次思想解放运动。这一时期为秦朝统一奠定了基础。',
    gaokaoFocus: '阶段特征是理解整个单元的宏观框架，高考常考综合分析',
    relatedEvents: ['商鞅变法', '百家争鸣', '小农经济'],
    typicalQuestions: [
      { year: '2023全国乙卷', question: '春秋战国时期最本质的特征是？', answer: '奴隶制向封建制转变', difficulty: 'medium' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-3-2',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '从攘夷到融夷，华夏认同',
    year: '春秋时期',
    dynasty: '春秋',
    content: '【从攘夷到融夷，华夏认同的影响】①华夏族吸收了大量新鲜血液，更加稳定，分布更为广泛；②促进了民族交融，为中华文明多元一体的政治格局奠定了基础；③有利于形成对统一多民族国家的认同感。',
    explanation: '春秋时期，中原诸侯国通过"尊王攘夷"的战争和会盟，逐渐形成了"华夷五方"的观念。在这一过程中，周边的夷狄民族被吸收进入华夏族，华夏族的地域和人口不断扩大。这一过程的意义：1）使华夏族更加稳定和扩大；2）促进了各民族之间的经济文化交流；3）形成了共同的华夏文化认同感，成为后世中国统一多民族国家的思想基础。',
    gaokaoFocus: '中华民族多元一体，常与民族交融、民族认同结合',
    relatedEvents: ['分封制', '宗法制'],
    typicalQuestions: [
      { year: '2022辽宁高考', question: '华夏认同的意义是什么？', answer: '促进了民族交融，为统一多民族国家奠定基础', difficulty: 'medium' }
    ],
    importance: 4,
    source: 'builtin'
  },
  {
    id: 'unit1-3-3',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '小农经济',
    year: '春秋战国',
    dynasty: '春秋战国',
    content: '【含义】以家庭为生产、生活单位，农业和家庭手工业相结合，生产主要是为满足自家基本生活的需要和交纳赋税，是一种自给自足的自然经济。【形成原因】①铁犁牛耕的出现和逐渐普及；②封建土地私有制的确立。【特点】自给自足、男耕女织、分散性、封闭性、落后性、脆弱性。【地位】中国封建经济的基础。【评价-前期】适应生产力发展；利于提高生产积极性；利于政治稳定、国家统一。【评价-后期】阻碍商品经济和社会发展进步。',
    explanation: '小农经济是中国封建社会的经济基础。理解这一知识点要注意区分几个概念：自然经济是自给自足的经济形态，最早产生于原始社会；小农经济以家庭为单位、经营规模较小，产生于春秋战国铁犁牛耕背景下，是封建社会统治的基础。小农经济具有分散性、封闭性、脆弱性的特点，它的稳固直接关系到封建社会的稳定和政权的兴衰。',
    gaokaoFocus: '小农经济的特点、地位是高频考点',
    relatedEvents: ['铁犁牛耕', '土地私有制'],
    typicalQuestions: [
      { year: '2023全国甲卷', question: '小农经济的本质属性是什么？', answer: '家庭经营，经营规模较小', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-3-4',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '变法运动背景',
    year: '战国时期',
    dynasty: '战国',
    content: '【政治】王室衰微，分封制、宗法制遭到破坏。【经济】铁农具、牛耕的使用提高了生产力。【军事】争霸兼并战争需要"富国强兵"。【思想】法家学说成为推行变法的思想武器。',
    explanation: '战国时期各国的变法运动（如商鞅变法、李悝变法等）都有共同的历史背景：政治上，周王室衰微，旧的宗法分封制度无法维持统治秩序；经济上，铁器和牛耕的使用使生产力大幅提高，井田制瓦解，新兴地主阶级要求确认土地私有权；军事上，诸侯国之间频繁的争霸战争迫使各国寻求富国强兵之道；思想上，法家思想强调以法治国、君主集权，为变法提供了理论依据。',
    gaokaoFocus: '常与商鞅变法结合，理解变法的根本原因',
    relatedEvents: ['商鞅变法', '法家思想', '铁犁牛耕'],
    typicalQuestions: [
      { year: '2022全国乙卷', question: '商鞅变法的根本目的是？', answer: '富国强兵，在争霸战争中取得优势', difficulty: 'medium' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-3-5',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '商鞅变法主要内容',
    year: '前356年',
    dynasty: '战国',
    content: '商鞅变法主要内容：①重农抑商，奖励耕织；②奖励军功，剥夺和限制贵族特权；③强制大家庭拆散为个体小家庭；④"废井田，开阡陌"，授田于百姓；⑤在民间实行什伍连坐，互相纠察告发；⑥推行县制，县的主要官员由君主任免。',
    explanation: '商鞅变法是战国时期最彻底的变法。六大内容解析：1）重农抑商——保护农业、限制商业，有利于增加国家赋税和粮食储备；2）奖励军功——按军功授爵，打破了贵族世袭特权，提高了军队战斗力；3）拆散大家庭——小家庭更容易管理，也增加了国家户口和赋税；4）废井田开阡陌——承认土地私有，允许买卖，从法律上确立了封建土地所有制；5）什伍连坐——强化了对百姓的控制，有利于社会稳定和国家动员；6）推行县制——加强了中央对地方的控制。',
    gaokaoFocus: '商鞅变法内容是超级高频考点，必须全部掌握',
    relatedEvents: ['变法运动背景', '郡县制', '土地私有制'],
    typicalQuestions: [
      { year: '2023全国乙卷', question: '商鞅变法中承认土地私有的措施是？', answer: '废井田，开阡陌', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-3-6',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '评价商鞅变法',
    year: '前356年',
    dynasty: '战国',
    content: '【积极性】①特点：商鞅变法顺应历史潮流，集列国变法之长，是战国时期持续时间最长、涉及面最广、改革最为彻底的一次变法；②变法使秦国国富兵强，为秦统一中国奠定了基础；③推动了社会转型，逐步建立起君主专制的政治制度。【局限性】轻罪重罚，压迫和剥削百姓，激化了阶级矛盾；文化高压政策等。',
    explanation: '评价商鞅变法要从积极和局限两方面全面把握。积极方面：1）从历史地位看，它顺应了从奴隶社会向封建社会转变的历史潮流，是战国时期最彻底、最全面的变法；2）从效果看，它使秦国迅速强大，为秦始皇统一六国奠定了坚实基础；3）从制度创新看，它确立了封建土地私有制，建立了君主专制中央集权的政治制度。局限性：轻罪重罚，用严酷的法律来维护统治；压制思想文化的发展。',
    gaokaoFocus: '商鞅变法的评价是高频考点，常考一分为二的辩证分析',
    relatedEvents: ['商鞅变法主要内容', '秦统一'],
    typicalQuestions: [
      { year: '2022辽宁高考', question: '商鞅变法的局限性有哪些？', answer: '轻罪重罚，压迫百姓，文化高压政策', difficulty: 'medium' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-3-7',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '商鞅变法为何能成功',
    year: '前356年',
    dynasty: '战国',
    content: '商鞅变法为何能成功：①根本原因：顺应历史潮流，符合新兴地主阶级的要求；②改革措施行之有效，符合秦国国情；③秦孝公的大力支持；④商鞅个人因素（政治才干、铁血手腕、赏罚分明、与旧贵族斗争）。',
    explanation: '商鞅变法成功的原因是多方面的：根本原因是变法顺应了历史发展趋势——新兴地主阶级要求获得政治地位，商鞅变法正好满足了这些要求；直接原因是改革措施符合秦国国情——秦国经济落后、旧贵族势力相对较弱，便于推行新法；政治保障是秦孝公的坚定支持；关键因素是商鞅本人的才能。这四点缺一不可，共同促成了变法的成功。',
    gaokaoFocus: '常与王安石变法、戊戌变法对比，理解改革成功的条件',
    relatedEvents: ['商鞅变法主要内容', '商鞅变法评价'],
    typicalQuestions: [
      { year: '2021全国乙卷', question: '商鞅变法成功的根本原因是？', answer: '顺应历史潮流，符合新兴地主阶级的要求', difficulty: 'medium' }
    ],
    importance: 4,
    source: 'builtin'
  },
  {
    id: 'unit1-3-8',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '百家争鸣的背景',
    year: '春秋战国',
    dynasty: '春秋战国',
    content: '百家争鸣的背景：【经济】井田制崩溃，封建经济迅速发展。【政治】周王室衰微，诸侯纷争，分封制瓦解。【阶级】士阶层崛起，并受到诸侯重用。【文化】从"学在官府"到"学在民间"，私学兴起。',
    explanation: '百家争鸣是中国历史上第一次大规模的思想解放运动。经济上：井田制崩溃，封建经济发展，为思想文化的繁荣提供了物质基础。政治上：周王室衰微，诸侯争霸，各国君主为了在竞争中取胜，纷纷招揽人才，"士"阶层获得了前所未有的政治舞台。阶级上：士阶层崛起，他们有自己的思想和主张，成为百家争鸣的主力军。文化上：私学兴起，打破了"学在官府"的传统。',
    gaokaoFocus: '理解思想解放与政治经济变革的关系',
    relatedEvents: ['百家争鸣', '私学兴起'],
    typicalQuestions: [
      { year: '2023辽宁高考', question: '百家争鸣出现的根本原因是？', answer: '社会经济变革', difficulty: 'medium' }
    ],
    importance: 4,
    source: 'builtin'
  },
  {
    id: 'unit1-3-9',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '百家争鸣历史意义',
    year: '春秋战国',
    dynasty: '春秋战国',
    content: '百家争鸣历史意义：①是春秋战国时期社会经济发展、政治变化在思想文化领域的反映；②是中国学术文化、思想道德发展的重要阶段，奠定了中国传统文化体系的基础；③是中国历史上第一次思想解放运动；④为新兴的地主阶级等登上历史舞台奠定了思想理论基础。',
    explanation: '百家争鸣是中国思想文化史上的里程碑。其历史意义：1）它是社会存在的反映——思想是时代的产物，百家争鸣正是春秋战国社会大变革在思想领域的体现；2）奠定了传统文化基础——儒道法墨等学派的思想成为中国传统文化的源头；3）思想解放——打破了西周以来思想文化上的大一统局面；4）为封建统治服务——新兴地主阶级通过思想论战，为建立封建制度进行了舆论准备。',
    gaokaoFocus: '百家争鸣的意义是必考内容，常与儒家思想结合',
    relatedEvents: ['百家争鸣', '儒道法墨'],
    typicalQuestions: [
      { year: '2022全国甲卷', question: '百家争鸣的历史意义是？', answer: '奠定了中国传统文化体系的基础', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-3-10',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '孔子的人文主义精神',
    year: '春秋',
    dynasty: '春秋',
    content: '孔子的人文主义精神：【"仁"】对中国人为人处世产生极大影响，形成了中国人谦恭的性格，有利于建立良好的人际关系，提供宽松社会环境。【"礼"】道德规范，强调社会成员承担相应权利和义务，有利于培养社会责任感和历史使命感。【对鬼神敬而远之】优先考虑和解决人世间的实际问题，渗透以人为本的理念。【"有教无类"等教育主张】发展个性，提高社会成员素质。',
    explanation: '孔子是儒家思想的创始人，其人文主义精神体现在四个方面："仁"是孔子思想的核心，"仁者爱人"，强调人际关系的和谐；"礼"是社会规范，强调等级秩序和社会责任；"敬鬼神而远之"体现了以人为本的思想；"有教无类"打破了官府对教育的垄断。孔子的这些思想对中华民族的性格形成和文化传统产生了深远影响。',
    gaokaoFocus: '孔子思想是必考内容，常与后世儒学发展结合',
    relatedEvents: ['儒家思想', '百家争鸣'],
    typicalQuestions: [
      { year: '2023辽宁高考', question: '孔子"仁"的核心含义是？', answer: '爱人', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-3-11',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '诸子百家',
    year: '春秋战国',
    dynasty: '春秋战国',
    content: '诸子百家主要派别：【儒家】孔子、孟子、荀子。"仁""礼"，德治仁政。孟子：人性善，"仁政"、"民贵君轻"。荀子：人性恶，隆礼重法。【道家】老子、庄子。"道法自然"，无为而治。【法家】韩非子、商鞅。以法治国，君主集权。【墨家】墨子。"兼爱""非攻""尚贤""节用"。【阴阳家】邹衍。五行相生相胜理论。',
    explanation: '诸子百家中最重要的四家：1）儒家——孔子创立，孟子发展"民贵君轻"思想，荀子提出"性恶论"。2）道家——老子创立，庄子发展，主张顺应自然，无为而治。3）法家——韩非子集大成，商鞅是实践者，主张以法治国，强调君主集权。4）墨家——墨子创立，代表小生产者利益，主张兼爱、非攻、尚贤、节用。各派思想都是针对当时的社会问题提出的解决方案，各有特色。',
    gaokaoFocus: '各派思想主张是必考内容，必须对比记忆',
    relatedEvents: ['百家争鸣', '法家思想', '道家思想'],
    typicalQuestions: [
      { year: '2023全国乙卷', question: '百家争鸣中主张"兼爱""非攻"的是哪个学派？', answer: '墨家', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },

  // ====== 四、秦朝：统一多民族封建国家的建立 ======
  {
    id: 'unit1-4-1',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '秦朝统一的条件',
    year: '前221年',
    dynasty: '秦朝',
    content: '秦朝统一的条件（背景）：①长期战乱，人民渴望安定统一（政治）；②经济发展，要求打破政治分裂所带来的阻碍（经济）；③秦国地理位置优越，物质基础雄厚（地理位置）；④秦王嬴政善于用人，吏治较为清明（个人）；⑤商鞅变法，推动了秦国经济的发展（经济）；⑥采用"远交近攻"战略得当（军事）；⑦采用了法家思想（思想）。',
    explanation: '秦朝统一六国不是偶然的，而是多种因素共同作用的结果。政治上，长期的诸侯混战给人民带来了巨大痛苦，人民渴望和平统一；经济上，封建经济的发展要求打破诸侯割据造成的经济割裂；领导上，秦王嬴政雄才大略，善于用人；基础上，商鞅变法为秦国积累了强大的经济军事实力；战略上，采用"远交近攻"的策略，逐一消灭六国；思想上，法家思想为统一提供了理论依据。这七个条件缺一不可。',
    gaokaoFocus: '常考综合分析题，需全面掌握',
    relatedEvents: ['秦统一', '商鞅变法'],
    typicalQuestions: [
      { year: '2022辽宁高考', question: '秦朝统一的根本原因是什么？', answer: '商鞅变法使秦国国富兵强', difficulty: 'medium' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-4-2',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '秦朝巩固统一的措施',
    year: '前221年后',
    dynasty: '秦朝',
    content: '秦朝巩固统一的措施：①政治：建立并巩固专制主义中央集权制度；②经济：统一度量衡；统一货币；③文化思想：统一文字；整顿风俗；颁行法律；④交通：修驰道、直道；统一车轨；⑤军事：扩大和巩固边疆，修筑长城。',
    explanation: '秦始皇统一六国后，为巩固统一采取了一系列措施。政治上：建立专制主义中央集权制度（皇帝制度，三公九卿、郡县制）；经济上：统一度量衡（便利了经济发展和赋税征收）、统一货币（圆形方孔钱）；文化上：统一文字（小篆，后通行隶书）；交通上：修筑驰道直道、统一车轨；军事上：北击匈奴修筑长城。这些措施对后世影响深远。',
    gaokaoFocus: '巩固统一措施是高频考点，常与后世对比',
    relatedEvents: ['秦统一', '郡县制', '皇帝制度'],
    typicalQuestions: [
      { year: '2023全国乙卷', question: '秦朝统一货币和度量衡的目的是？', answer: '巩固国家统一，促进经济发展', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-4-3',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '专制主义中央集权制度',
    year: '秦朝',
    dynasty: '秦朝',
    content: '专制主义中央集权制度：【君主专制】是一种决策方式，皇帝个人专断独裁，集国家最高权力于一身，皇权不断增强，相权不断削弱。【中央集权】是相对于地方分权的制度，地方政府在政治、经济、军事方面不具有独立性，必须严格服从中央政府的命令，中央权力不断增强，地方权力不断被削弱。',
    explanation: '专制主义中央集权制度是理解中国古代政治制度的核心。它包含两个层面：1）君主专制（中央层面）——皇帝拥有至高无上的权力，决策由皇帝个人决定，皇权不断加强，相权不断削弱；2）中央集权（中央与地方关系）——地方必须绝对服从中央，中央对地方拥有直接有效的控制权。这一制度在秦朝确立后，为后世历代王朝所沿用，奠定了中国两千多年政治制度的基本格局。',
    gaokaoFocus: '超级高频考点，必须全面掌握',
    relatedEvents: ['皇帝制度', '郡县制', '三公九卿'],
    typicalQuestions: [
      { year: '2023全国乙卷', question: '专制主义中央集权制度的核心是？', answer: '皇权至上', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-4-4',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '秦朝加强专制主义中央集权制度内容',
    year: '前221年',
    dynasty: '秦朝',
    content: '【皇帝制度】皇帝独尊、皇权至上、皇位世袭。【三公九卿制】三公——丞相（百官之首，处理政务）、御史大夫（副丞相，下达诏令，监察百官）、太尉（负责军事）；九卿——三公之下，中央各重要部门主管官员。【郡县制】在春秋战国基础上全面推行；设郡、县两级，县下设乡、里、亭；郡守和县令由中央任免和考核。【影响】①实现中央对地方政权的直接有效控制；②把全国纳入国家政治体制之中；③官僚政治取代贵族政治，地缘政治取代血缘政治。',
    explanation: '秦朝中央集权制度的具体内容是高考的核心考点。皇帝制度：确立了"皇帝"称号，皇权至高无上，皇位世袭。三公九卿制：丞相是百官之首，御史大夫负责监察，太尉负责军事。郡县制：县下设乡、里、亭，形成完整的基层行政网络；郡守县令由中央任免，打破了贵族世袭的特权，实现了从贵族政治向官僚政治的转变。',
    gaokaoFocus: '三公九卿、郡县制是超级高频考点',
    relatedEvents: ['专制主义中央集权制度', '郡县制'],
    typicalQuestions: [
      { year: '2022辽宁高考', question: '秦朝在地方实行什么制度？', answer: '郡县制', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-4-5',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '秦朝文书制度作用',
    year: '秦朝',
    dynasty: '秦朝',
    content: '秦朝文书制度作用：①保障皇帝和中央的政令能够传送到全国各地；②提高行政效率，加强专制主义中央集权制；③为汉承秦制提供条件，具有较高史料价值。',
    explanation: '秦朝的文书制度（诏令传达、公文往来）是维持庞大帝国运转的重要工具。在没有现代通讯手段的古代，如何将皇帝的政令快速准确地传达到全国各地，是巩固统一的关键问题。秦朝建立了从中央到地方的公文系统，保证了政令的上传下达。这一制度保证了大一统帝国的有效运转，被汉朝继承。',
    gaokaoFocus: '理解制度建设的整体性，常与汉承秦制结合',
    relatedEvents: ['专制主义中央集权制度'],
    typicalQuestions: [
      { year: '2021全国乙卷', question: '秦朝文书制度的主要作用是？', answer: '保障政令传达，提高行政效率', difficulty: 'medium' }
    ],
    importance: 3,
    source: 'builtin'
  },
  {
    id: 'unit1-4-6',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '郡县制与分封制比较',
    year: '西周-秦',
    dynasty: '秦朝',
    content: '分封制与郡县制是适应不同社会生产力条件之上的上层建筑。【本质区别】分封制以血缘关系为基础，官吏世袭；郡县制按地域划分，官吏由皇帝和朝廷任免，不能世袭。【相同点】都是地方行政制度；目的都是巩固王权；都在一定时期内产生过积极作用。【核心结论】从分封制到郡县制，反映了官吏任用原则由贵族世袭到行政任命的变化，是政治改革的进步，标志着官僚政治取代贵族政治。',
    explanation: '郡县制与分封制的比较是理解中国古代政治制度演变的重要知识点。两者最本质的区别在于：分封制下，诸侯是世袭的领主，对封地拥有相当大的自主权；郡县制下，郡守县令由中央任命，是皇帝的臣子，没有封地的自主权。从分封制到郡县制，反映了：1）选官制度的变化——从贵族世袭到中央任命；2）政治体制的变化——从贵族政治到官僚政治。秦朝确立郡县制后，虽然后世仍有分封制的反复，但郡县制始终是主流。',
    gaokaoFocus: '郡县制与分封制的比较是高频考点，常考对比分析',
    relatedEvents: ['分封制', '郡县制', '秦统一'],
    typicalQuestions: [
      { year: '2023全国甲卷', question: '郡县制与分封制最本质的区别是？', answer: '官吏任用方式不同（任命制vs世袭制）', difficulty: 'medium' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-4-7',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '秦朝统一的历史意义',
    year: '前221年',
    dynasty: '秦朝',
    content: '秦朝统一的历史意义：①建立起幅员辽阔的国家，奠定了此后历代疆域的基本版图；②统一中央集权国家的形成，促进各民族的交往交流交融；③推动统一多民族国家政治、经济、社会的发展；④有利于小农经济的稳定；⑤奠定两千多年政治制度的基本格局。',
    explanation: '秦朝统一是中国历史上的里程碑事件。疆域意义上，建立了第一个大一统的多民族国家，奠定了中国历代王朝疆域的基础；民族交融上，统一的政治实体促进了各地区各民族之间的经济文化交流；社会上，统一的政治环境有利于社会经济的持续发展；经济上，统一的度量衡、货币等制度有利于小农经济的稳定；制度史上，秦朝确立的专制主义中央集权制度、郡县制等，被此后两千多年的历代王朝所沿用。',
    gaokaoFocus: '秦统一的历史意义是必考内容，常与汉唐比较',
    relatedEvents: ['秦统一', '专制主义中央集权制度'],
    typicalQuestions: [
      { year: '2023辽宁高考', question: '秦统一的历史意义是？', answer: '结束割据，建立统一的多民族国家，奠定政治制度基础', difficulty: 'medium' }
    ],
    importance: 5,
    source: 'builtin'
  },

  // ====== 五、两汉：大一统的巩固与发展 ======
  {
    id: 'unit1-5-1',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '汉初实行无为而治的原因',
    year: '西汉初期',
    dynasty: '西汉',
    content: '汉初实行无为而治的原因：【现实原因】汉初民生凋敝，百废待兴。【前朝教训】秦朝刑法严苛，征发繁重，导致秦朝速亡。',
    explanation: '汉初实行"无为而治"的黄老之术，是有其深刻历史背景的。首先，从现实看，楚汉战争使社会经济遭到严重破坏，人口锐减，国库空虚，百姓生活困苦。其次，从历史教训看，秦朝实行严刑峻法，大兴土木，最终激起民变，导致秦朝二世而亡。这给汉初统治者敲响了警钟——必须改变统治方式，减轻百姓负担。"无为而治"的核心是"休养生息"，为后来的汉武帝大一统奠定了物质基础。',
    gaokaoFocus: '常与文景之治、汉武帝大一统结合',
    relatedEvents: ['无为而治', '汉武帝大一统'],
    typicalQuestions: [
      { year: '2022辽宁高考', question: '汉初实行无为而治的原因不包括？', answer: '道家思想占统治地位', difficulty: 'medium' }
    ],
    importance: 4,
    source: 'builtin'
  },
  {
    id: 'unit1-5-2',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '汉武帝的大一统',
    year: '前141年-前87年',
    dynasty: '西汉',
    content: '汉武帝大一统：【政治】推恩令削弱诸侯；刺史制度监督地方；察举制选拔人才；中外朝制度削弱相权。【经济】盐铁官营；统一货币（五铢钱）；算缗告缗抑制商业资本。【思想】"罢黜百家，独尊儒术"。【民族】北击匈奴；通西域，设西域都护府。',
    explanation: '汉武帝时期是中国历史上第一个大一统的黄金时代。政治上，推恩令巧妙地化解了诸侯王威胁中央的问题；刺史制度将全国分为十三部监督郡国；察举制打破了贵族对官位的垄断。经济上，盐铁官营将关系国计民生的关键物资收归国家经营；统一货币便于商品流通。思想上，"罢黜百家，独尊儒术"确立了儒家学说在中国思想界的统治地位。这些措施共同构建了专制主义中央集权的完整体系。',
    gaokaoFocus: '汉武帝大一统措施是超级高频考点，必须全面掌握',
    relatedEvents: ['推恩令', '盐铁官营', '罢黜百家独尊儒术'],
    typicalQuestions: [
      { year: '2023全国甲卷', question: '"罢黜百家，独尊儒术"是谁建议汉武帝实行的？', answer: '董仲舒', difficulty: 'easy' }
    ],
    importance: 5,
    source: 'builtin'
  },
  {
    id: 'unit1-5-3',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '董仲舒新儒学体系',
    year: '西汉',
    dynasty: '西汉',
    content: '董仲舒新儒学体系：【社会问题与解决】匈奴入侵→"春秋大一统"、"罢黜百家，独尊儒术"；王国问题→"君权神授""天人感应"；土地兼并→"限田，薄敛，省役"；社会矛盾→"三纲五常"。【实质】思想文化专制。',
    explanation: '董仲舒的新儒学体系是为汉武帝大一统服务的思想体系。"春秋大一统"强调加强中央集权；"君权神授"和"天人感应"神化君权，为皇权提供理论依据；"三纲五常"规范社会秩序；"限田"等措施试图限制土地兼并。这一体系的确立，结束了百家争鸣的局面，奠定了中国儒学统治地位的基础，对中国后世思想文化产生了深远影响。',
    gaokaoFocus: '理解儒学成为正统思想的原因',
    relatedEvents: ['汉武帝大一统', '罢黜百家独尊儒术'],
    typicalQuestions: [],
    importance: 4,
    source: 'builtin'
  },
  {
    id: 'unit1-5-4',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '"光武中兴"',
    year: '25年-57年',
    dynasty: '东汉',
    content: '"光武中兴"：【政治】增强尚书台的作用，加强皇权；严格控制外戚干政；裁并郡县，裁减官吏，节省开支；整顿吏治，惩处贪污腐败。【经济】清查全国垦田、人口数量，提高农民生产积极性；释放奴婢，缓和阶级矛盾。【文化】重视儒学，继承汉朝尊崇儒学传统。',
    explanation: '"光武中兴"是王莽新朝末年社会动荡后，刘秀重建汉朝、恢复社会秩序的历史时期。刘秀（汉光武帝）采取了多项恢复措施：政治上，削弱三公权力，以"尚书台"为处理政务的中枢；经济上，减轻田租（三十税一），释放奴婢，鼓励垦荒；文化上，提倡儒学。光武中兴使东汉前期出现了社会稳定、经济恢复的局面。但东汉王朝的根本矛盾并未解决——豪强地主的势力不断膨胀，为后来的军阀割据埋下了隐患。',
    gaokaoFocus: '理解东汉政治经济的恢复与发展',
    relatedEvents: ['汉武帝大一统'],
    typicalQuestions: [
      { year: '2021全国乙卷', question: '光武中兴的措施不包括？', answer: '推行推恩令', difficulty: 'medium' }
    ],
    importance: 3,
    source: 'builtin'
  },
  {
    id: 'unit1-5-5',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '东汉庄园经济',
    year: '两汉',
    dynasty: '两汉',
    content: '东汉庄园经济：【概念】豪强地主经营土地的主要方式。田庄是相对封闭的社会政治经济组织，内有依附农民和家内奴婢，拥有家兵，筑有坞堡壁垒，不用缴纳租赋，属于自给自足的自然经济，逐渐演变为地方割据势力。【特点】①规模大，多种经营，自给自足；②聚族而居，宗族宗法色彩深厚；③拥有私人武装；④具有很强的生存和发展能力。【评价】在一定程度上减少土地兼并的危害；易发展为割据势力。',
    explanation: '庄园经济是两汉时期豪强地主经营土地的主要方式。庄园内部有完整的生产体系，能够自给自足，形成独立的经济实体。庄园经济有三个特点：1）规模大——一个庄园往往占有大量的土地和人口；2）自给自足——庄园内部有农业、手工业、商业等多种产业；3）半独立——庄园主往往拥有私人武装（部曲、宾客），对地方政治有很大的影响力。庄园经济的发展是理解东汉末年军阀割据的重要背景。',
    gaokaoFocus: '理解庄园经济与豪强地主的势力膨胀',
    relatedEvents: ['小农经济', '东汉政治'],
    typicalQuestions: [
      { year: '2022全国甲卷', question: '庄园经济的特点是什么？', answer: '自给自足，半独立的经济实体', difficulty: 'medium' }
    ],
    importance: 3,
    source: 'builtin'
  },
  {
    id: 'unit1-5-6',
    unitId: 'unit1',
    unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
    title: '两汉文化的繁荣',
    year: '两汉',
    dynasty: '两汉',
    content: '两汉文化的繁荣：【史学】司马迁《史记》——中国第一部纪传体通史；班固《汉书》——中国第一部纪传体断代史。【文学】汉赋、乐府诗、五言诗。【医学】《黄帝内经》——奠定中医理论基础；《神农本草经》——中国古代第一部药物学专著；张仲景《伤寒杂病论》——"医圣"，奠定中医临床学基础；华佗——麻沸散、五禽戏。【科技】《九章算术》；蔡伦改进造纸术；张衡——候风地动仪（世界上最早的地震仪）。',
    explanation: '两汉时期是中国文化繁荣发展的重要时期。史学上，司马迁的《史记》是第一部纪传体通史，班固的《汉书》是第一部纪传体断代史；科技上，造纸术的发明推动了人类文明的进步，张衡发明的地动仪是世界上最早的地震仪器，华佗的麻沸散是世界上最早的麻醉剂；思想上，"罢黜百家，独尊儒术"确立了儒学在中国思想文化中的统治地位。这些成就说明两汉时期中国文明处于世界领先地位。',
    gaokaoFocus: '两汉文化成就是高频考点，常考具体人物和成就',
    relatedEvents: ['罢黜百家独尊儒术'],
    typicalQuestions: [
      { year: '2023辽宁高考', question: '《史记》的作者是谁？', answer: '司马迁', difficulty: 'easy' }
    ],
    importance: 4,
    source: 'builtin'
  },
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
