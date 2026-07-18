/**
 * 完整的历史单元数据导入
 * 包含：知识点、必背表、政治/经济/文化框架、时间轴、因果链、高考考点、记忆公式、历史卡牌
 */

import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const USER_ID = 'personal-user';

// ==================== 第一单元完整数据 ====================
const UNIT1_DATA = {
  id: 'u1',
  unitTitle: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
  textbookId: 'outline-upper',
  bookName: '中外历史纲要（上）',
  unitNo: 1,
  lessons: ['l1', 'l2', 'l3', 'l4'],
  period: '先秦-秦汉',
  pageRange: '第1-4课',

  // ========== 详细知识点（按政治/经济/文化分类） ==========
  concepts: [
    // ========== 政治领域 ==========
    { id: 'c1-1', name: '早期国家政治制度特点', category: '政治', subCategory: '早期国家', definition: '①以血缘关系为纽带；②形成严格的等级秩序；③神权色彩浓厚；④地方权力较大；⑤家国同构；⑥延续稳定。', keyPoints: ['血缘纽带', '等级森严', '神权色彩', '家国同构'], importance: 3, gaokaoFocus: '理解中国政治制度起源' },
    { id: 'c1-2', name: '分封制', category: '政治', subCategory: '西周制度', definition: '目的：封建亲戚，以藩屏周。对象：王族、功臣、先代贵族。权利：再分封、设置官员、建立武装、征派赋役。义务：镇守疆土、随从作战、缴纳贡赋、朝觐述职。', keyPoints: ['封建亲戚以藩屏周', '宗法制相辅相成', '礼乐制维护工具'], importance: 5, gaokaoFocus: '辽宁高考常考点' },
    { id: 'c1-3', name: '宗法制', category: '政治', subCategory: '西周制度', definition: '目的：加强分封制形成的统治秩序。核心：嫡长子继承制度。特点：①核心是嫡长子继承制；②大小宗关系相对；③血缘和政治紧密结合。', keyPoints: ['嫡长子继承制', '大小宗关系', '血缘政治结合'], importance: 5, gaokaoFocus: '常与分封制结合考查' },
    { id: 'c1-4', name: '礼乐制度', category: '政治', subCategory: '西周制度', definition: '目的：规范分封制和宗法制的等级秩序。宗法制和分封制是西周基本政治制度，相辅相成、互为表里；礼乐制是维护工具。', keyPoints: ['规范等级秩序', '三制关系'], importance: 4, gaokaoFocus: '理解西周政治制度完整体系' },
    { id: 'c1-5', name: '春秋战国阶段特征', category: '政治', subCategory: '社会转型', definition: '本质：奴隶制向封建制转变；大动荡、大变革、大发展时期。政治：王室衰微，诸侯纷争，分封制崩溃，郡县制出现。', keyPoints: ['王室衰微', '诸侯纷争', '分封制崩溃', '郡县制出现'], importance: 5, gaokaoFocus: '理解整个单元的宏观框架' },
    { id: 'c1-6', name: '商鞅变法', category: '政治', subCategory: '变法运动', definition: '内容：①重农抑商，奖励耕织；②奖励军功；③拆散大家庭；④废井田开阡陌；⑤什伍连坐；⑥推行县制。评价-积极：顺应历史潮流，使秦国国富兵强，推动社会转型。评价-局限：轻罪重罚。', keyPoints: ['废井田开阡陌', '奖励军功', '推行县制', '什伍连坐'], importance: 5, gaokaoFocus: '商鞅变法是超级高频考点' },
    { id: 'c1-7', name: '秦朝统一条件', category: '政治', subCategory: '秦朝', definition: '①人民渴望安定统一（政治）；②经济发展要求打破分裂（经济）；③秦国地理位置优越（地理）；④秦王善于用人（个人）；⑤商鞅变法奠定基础（经济）；⑥远交近攻战略（军事）；⑦采用法家思想（思想）。', keyPoints: ['商鞅变法奠定基础', '人民渴望统一', '法家思想'], importance: 5, gaokaoFocus: '常考综合分析题' },
    { id: 'c1-8', name: '秦朝巩固统一措施', category: '政治', subCategory: '秦朝', definition: '①政治：建立专制主义中央集权制度；②经济：统一度量衡、统一货币；③文化思想：统一文字、整顿风俗、颁行法律；④交通：修驰道直道、统一车轨；⑤军事：修筑长城。', keyPoints: ['书同文', '车同轨', '统一度量衡', '统一货币'], importance: 5, gaokaoFocus: '巩固统一措施是高频考点' },
    { id: 'c1-9', name: '专制主义中央集权制度', category: '政治', subCategory: '秦朝', definition: '君主专制：皇帝个人专断独裁，皇权不断增强，相权不断削弱。中央集权：地方必须服从中央，中央权力不断增强，地方权力不断削弱。', keyPoints: ['皇权至上', '中央集权'], importance: 5, gaokaoFocus: '超级高频考点' },
    { id: 'c1-10', name: '皇帝制度', category: '政治', subCategory: '秦朝', definition: '皇帝独尊、皇权至上、皇位世袭。', keyPoints: ['皇帝独尊', '皇权至上', '皇位世袭'], importance: 5, gaokaoFocus: '三公九卿是超级高频考点' },
    { id: 'c1-11', name: '三公九卿制', category: '政治', subCategory: '秦朝', definition: '三公：丞相（百官之首）、御史大夫（副丞相，监察）、太尉（军事）。九卿：中央各重要部门主管官员。', keyPoints: ['丞相', '御史大夫', '太尉', '九卿'], importance: 5, gaokaoFocus: '三公九卿是超级高频考点' },
    { id: 'c1-12', name: '郡县制', category: '政治', subCategory: '秦朝', definition: '在春秋战国基础上全面推行。设郡、县两级，县下设乡、里、亭。郡守和县令由中央任免考核。影响：①实现中央对地方直接有效控制；②官僚政治取代贵族政治，地缘政治取代血缘政治。', keyPoints: ['郡守县令中央任免', '官僚政治', '地缘政治'], importance: 5, gaokaoFocus: '郡县制与分封制比较是高频考点' },
    { id: 'c1-13', name: '秦朝统一的历史意义', category: '政治', subCategory: '秦朝', definition: '①建立幅员辽阔国家，奠定历代疆域基本版图；②促进各民族交往交流交融；③推动统一多民族国家政治经济社会发展；④有利于小农经济稳定；⑤奠定两千多年政治制度基本格局。', keyPoints: ['统一多民族国家', '两千多年制度基础'], importance: 5, gaokaoFocus: '秦统一的历史意义是必考内容' },
    { id: 'c1-14', name: '汉初无为而治', category: '政治', subCategory: '汉朝', definition: '原因：①现实原因：汉初民生凋敝，百废待兴；②前朝教训：秦朝刑法严苛，征发繁重，导致速亡。', keyPoints: ['休养生息', '为汉武帝大一统奠定基础'], importance: 4, gaokaoFocus: '常与汉武帝大一统结合' },
    { id: 'c1-15', name: '汉武帝大一统-政治', category: '政治', subCategory: '汉朝', definition: '政治领域：推恩令削弱诸侯；刺史制度；察举制选拔人才；中外朝制度削弱相权。', keyPoints: ['推恩令', '刺史制度', '察举制', '中外朝制度'], importance: 5, gaokaoFocus: '汉武帝大一统是超级高频考点' },
    { id: 'c1-16', name: '汉武帝大一统-经济', category: '政治', subCategory: '汉朝', definition: '经济领域：盐铁官营；统一货币（五铢钱）；算缗告缗。', keyPoints: ['盐铁官营', '五铢钱', '算缗告缗'], importance: 5, gaokaoFocus: '盐铁官营是高频考点' },
    { id: 'c1-17', name: '汉武帝大一统-思想', category: '政治', subCategory: '汉朝', definition: '思想领域：罢黜百家，独尊儒术。实质：思想文化专制。', keyPoints: ['罢黜百家', '独尊儒术', '思想专制'], importance: 5, gaokaoFocus: '独尊儒术是高频考点' },
    { id: 'c1-18', name: '董仲舒新儒学', category: '政治', subCategory: '汉朝', definition: '社会问题与解决：匈奴入侵→春秋大一统、罢黜百家独尊儒术；王国问题→君权神授，天人感应；土地兼并→限田薄敛省役；社会矛盾→三纲五常。', keyPoints: ['罢黜百家独尊儒术', '君权神授', '天人感应', '三纲五常'], importance: 4, gaokaoFocus: '理解儒学成为正统思想的原因' },
    { id: 'c1-19', name: '光武中兴', category: '政治', subCategory: '东汉', definition: '政治：增强尚书台作用；控制外戚干政；裁并郡县；整顿吏治。经济：清查垦田人口；释放奴婢。文化：重视儒学。', keyPoints: ['尚书台', '光武中兴'], importance: 3, gaokaoFocus: '理解东汉政治经济的恢复与发展' },

    // ========== 经济领域 ==========
    { id: 'c1-20', name: '旧石器时代', category: '经济', subCategory: '文明起源', definition: '距今约200万年前—约1万年前，代表：元谋人、北京人。打制石器为主，采集渔猎，群居生活。', keyPoints: ['元谋人约170万年前', '北京人约70-20万年前', '打制石器', '群居生活'], importance: 2, gaokaoFocus: '了解人类早期发展的基本特征' },
    { id: 'c1-21', name: '新石器时代文化遗存', category: '经济', subCategory: '文明起源', definition: '早期：仰韶文化（黄河中游，彩陶，粟，母系氏族）；河姆渡文化（长江下游，水稻，养蚕缫丝）。晚期：龙山文化（黑陶，父系氏族）；红山文化（辽河流域，玉器祭坛）；良渚文化（长江下游，玉器水利）。', keyPoints: ['仰韶彩陶种粟', '河姆渡水稻蚕丝', '龙山黑陶', '红山玉器祭坛', '良渚水利'], importance: 3, gaokaoFocus: '各文化的特点、时间和地理位置是常考点' },
    { id: 'c1-22', name: '商周经济', category: '经济', subCategory: '商周', definition: '农业：木、石、骨等工具，青铜农具很少。土地制度：井田制（奴隶主土地国有制）。手工业：青铜制造是主要部门。工商食官：官府垄断工商业。', keyPoints: ['井田制', '工商食官'], importance: 4, gaokaoFocus: '井田制是高频考点' },
    { id: 'c1-23', name: '小农经济', category: '经济', subCategory: '春秋战国', definition: '含义：以家庭为生产生活单位，自给自足的自然经济。形成原因：①铁犁牛耕；②土地私有制确立。特点：自给自足、男耕女织、分散性、封闭性、脆弱性。地位：中国封建经济的基础。', keyPoints: ['以家庭为单位', '铁犁牛耕', '自给自足', '封建经济基础'], importance: 5, gaokaoFocus: '小农经济的特点是高频考点' },

    // ========== 文化领域 ==========
    { id: 'c1-24', name: '华夏认同与民族交融', category: '文化', subCategory: '民族', definition: '影响：①华夏族吸收新鲜血液，更加稳定；②促进民族交融，为中华文明多元一体奠定基础；③有利于形成对统一多民族国家的认同感。', keyPoints: ['民族交融', '华夏认同', '多元一体'], importance: 4, gaokaoFocus: '中华民族多元一体' },
    { id: 'c1-25', name: '百家争鸣', category: '文化', subCategory: '思想', definition: '背景：经济井田制崩溃，政治王室衰微，阶级士阶层崛起，文化私学兴起。历史意义：①社会经济发展的反映；②奠定传统文化体系基础；③中国历史上第一次思想解放运动；④为新兴地主阶级奠定理论基础。', keyPoints: ['第一次思想解放', '儒道法墨', '学术下移'], importance: 5, gaokaoFocus: '百家争鸣的意义是必考内容' },
    { id: 'c1-26', name: '孔子', category: '文化', subCategory: '思想', definition: '核心观念是"仁"，主张统治者"为政以德"；恢复西周礼乐制度；创办私学，有教无类；整理六经。', keyPoints: ['仁', '为政以德', '有教无类'], importance: 5, gaokaoFocus: '孔子思想是必考内容' },
    { id: 'c1-27', name: '老子', category: '文化', subCategory: '思想', definition: '"道"是天地万物的本原，追求天人合一；主张顺其自然，无为而治。', keyPoints: ['道法自然', '无为而治', '天人合一'], importance: 5, gaokaoFocus: '老子思想是常考点' },
    { id: 'c1-28', name: '诸子百家', category: '文化', subCategory: '思想', definition: '儒家：孟子（人性善，仁政，民贵君轻）；荀子（人性恶，隆礼重法）。道家：庄子（崇尚逍遥）。法家：韩非（法治，中央集权）。墨家：墨子（兼爱，非攻，尚贤，节用）。阴阳家：邹衍（五行相生相胜）。', keyPoints: ['儒家：仁政', '法家：法治', '墨家：兼爱非攻', '道家：无为'], importance: 5, gaokaoFocus: '各派思想主张是必考内容' },
    { id: 'c1-29', name: '两汉文化', category: '文化', subCategory: '汉朝', definition: '史学：司马迁《史记》（第一部纪传体通史）；班固《汉书》（第一部纪传体断代史）。文学：汉赋、乐府诗。医学：《黄帝内经》；张仲景《伤寒杂病论》；华佗麻沸散。科技：《九章算术》；蔡伦改进造纸术；张衡地动仪。', keyPoints: ['《史记》司马迁', '《汉书》班固', '华佗麻沸散', '蔡伦造纸'], importance: 4, gaokaoFocus: '两汉文化成就是高频考点' },
    { id: 'c1-30', name: '东汉庄园经济', category: '经济', subCategory: '东汉', definition: '概念：豪强地主经营土地的方式。特点：①规模大，多种经营，自给自足；②聚族而居，宗族色彩深厚；③拥有私人武装；④具有很强的生存发展能力。', keyPoints: ['自给自足', '私人武装', '地方割据势力'], importance: 3, gaokaoFocus: '理解庄园经济与豪强地主的势力膨胀' },
  ],

  // ========== 必背知识表格（核心对比表） ==========
  mustRememberTables: [
    {
      id: 'mrt1',
      title: '新石器时代文化遗存对比表',
      headers: ['历史阶段', '文化遗存', '时间', '地域', '文明表现', '社会形态'],
      rows: [
        ['新石器时代早期', '仰韶文化', '距今约7000—5000年', '黄河中游', '彩绘陶器；以粟为主要栽培作物', '母系氏族社会'],
        ['新石器时代早期', '河姆渡文化', '距今约7000—5000年', '长江下游', '种植水稻；修建村落；养蚕缫丝', '母系氏族社会'],
        ['新石器时代晚期', '龙山文化', '距今约5000年', '黄河流域', '黑陶（蛋壳陶）', '父系氏族社会'],
        ['新石器时代晚期', '红山文化', '距今约5000年', '辽河流域', '精美玉器；大规模祭坛神庙', '父系氏族社会'],
        ['新石器时代晚期', '良渚文化', '距今约5000年', '长江下游', '玉器；水利设施', '父系氏族社会'],
      ],
      importance: 4,
    },
    {
      id: 'mrt2',
      title: '分封制vs郡县制对比表',
      headers: ['比较标准', '分封制', '郡县制'],
      rows: [
        ['划分标准', '以血缘关系为基础', '按地域划分'],
        ['官吏权力', '拥有封地，世袭爵位', '由皇帝和朝廷任免调动，不能世袭'],
        ['与中央关系', '诸侯国有很强的独立性', '郡县绝对服从中央'],
        ['历史作用', '容易发展成割据势力', '有利于加强中央集权'],
        ['实质', '贵族政治', '官僚政治'],
      ],
      importance: 5,
    },
    {
      id: 'mrt3',
      title: '诸子百家对比表',
      headers: ['学派', '代表人物', '主要观点'],
      rows: [
        ['儒家', '孔子', '仁、为政以德、有教无类'],
        ['儒家', '孟子', '人性善、仁政、民贵君轻'],
        ['儒家', '荀子', '人性恶、隆礼重法'],
        ['道家', '老子', '道法自然、无为而治'],
        ['道家', '庄子', '崇尚逍遥自在'],
        ['法家', '韩非', '法治、中央集权'],
        ['墨家', '墨子', '兼爱、非攻、尚贤'],
        ['阴阳家', '邹衍', '五行相生相胜'],
      ],
      importance: 5,
    },
    {
      id: 'mrt4',
      title: '孔子vs老子对比表',
      headers: ['维度', '孔子（儒家）', '老子（道家）'],
      rows: [
        ['思想主张', '核心是仁，主张为政以德', '道是天地万物的本原，追求天人合一'],
        ['政治主张', '恢复西周礼乐制度', '顺其自然，无为而治'],
        ['教育成就', '创办私学，有教无类', '—'],
      ],
      importance: 5,
    },
    {
      id: 'mrt5',
      title: '小农经济特点表',
      headers: ['项目', '内容'],
      rows: [
        ['含义', '以家庭为生产、生活单位，农业和家庭手工业相结合，自给自足的自然经济'],
        ['形成原因', '①铁犁牛耕的出现和逐渐普及；②封建土地私有制的确立'],
        ['特点', '自给自足、男耕女织、分散性、封闭性、落后性、脆弱性'],
        ['地位', '中国封建经济的基础'],
        ['评价-前期', '适应生产力的发展；利于提高生产积极性；利于政治稳定'],
        ['评价-后期', '阻碍商品经济和中国社会的发展进步'],
      ],
      importance: 5,
    },
    {
      id: 'mrt6',
      title: '董仲舒新儒学体系表',
      headers: ['社会问题', '解决之道', '董仲舒的学说'],
      rows: [
        ['匈奴入侵', '加强中央集权', '春秋大一统、罢黜百家独尊儒术'],
        ['王国问题', '—', '君权神授、天人感应'],
        ['土地兼并', '限制土地兼并和剥削', '限田、薄敛、省役'],
        ['社会矛盾', '制定规范约束人们', '三纲五常'],
      ],
      importance: 4,
    },
    {
      id: 'mrt7',
      title: '秦朝巩固统一措施表',
      headers: ['领域', '措施'],
      rows: [
        ['政治', '建立专制主义中央集权制度'],
        ['经济', '统一度量衡、统一货币'],
        ['文化思想', '统一文字、整顿风俗、颁行法律'],
        ['交通', '修驰道直道、统一车轨'],
        ['军事', '修筑长城'],
      ],
      importance: 5,
    },
    {
      id: 'mrt8',
      title: '汉武帝大一统措施表',
      headers: ['领域', '措施'],
      rows: [
        ['中央政治', '中外朝制度（削弱相权）'],
        ['地方政治', '推恩令、刺史制度'],
        ['选官', '察举制（品德）'],
        ['经济', '盐铁官营、统一货币（五铢钱）、算缗告缗'],
        ['思想', '罢黜百家、独尊儒术'],
        ['民族', '北击匈奴、通西域、设西域都护府'],
      ],
      importance: 5,
    },
  ],

  // ========== 时间轴事件 ==========
  events: [
    { year: '约200万年前', title: '旧石器时代开始', category: '起源', importance: 2 },
    { year: '约前7000年', title: '仰韶文化', category: '文化', importance: 3 },
    { year: '约前5000年', title: '河姆渡文化/龙山文化/红山文化/良渚文化', category: '文化', importance: 3 },
    { year: '约前2070年', title: '夏朝建立', category: '政治', importance: 3 },
    { year: '约前1600年', title: '商朝建立', category: '政治', importance: 3 },
    { year: '约前1046年', title: '西周建立', category: '政治', importance: 4 },
    { year: '前770年', title: '春秋时期开始', category: '政治', importance: 4 },
    { year: '前475年', title: '战国时期开始', category: '政治', importance: 4 },
    { year: '前356年', title: '商鞅变法', category: '政治', importance: 5 },
    { year: '前221年', title: '秦朝统一', category: '政治', importance: 5 },
    { year: '前207年', title: '秦朝灭亡', category: '政治', importance: 3 },
    { year: '前202年', title: '西汉建立', category: '政治', importance: 4 },
    { year: '前141年', title: '汉武帝即位', category: '政治', importance: 5 },
    { year: '25年', title: '东汉建立（光武中兴）', category: '政治', importance: 3 },
    { year: '220年', title: '东汉灭亡', category: '政治', importance: 4 },
  ],

  // ========== 因果链 ==========
  causalLinks: [
    { from: '商鞅变法', to: '秦朝统一', type: '因果', description: '商鞅变法使秦国国富兵强，为统一奠定基础' },
    { from: '秦朝统一', to: '专制主义中央集权制度', type: '因果', description: '秦朝统一后建立中央集权制度' },
    { from: '汉初无为而治', to: '汉武帝大一统', type: '因果', description: '无为而治为大一统奠定物质基础' },
    { from: '汉武帝大一统', to: '罢黜百家独尊儒术', type: '因果', description: '政治经济大一统需要思想大一统配合' },
    { from: '铁犁牛耕', to: '井田制瓦解', type: '因果', description: '生产工具改进促进土地私有制发展' },
    { from: '小农经济', to: '封建制度', type: '因果', description: '小农经济是封建制度的经济基础' },
    { from: '汉武帝大一统', to: '儒学正统地位', type: '因果', description: '罢黜百家独尊儒术确立儒学正统地位' },
  ],

  // ========== 高考考点 ==========
  examFocus: [
    { id: 'ef1', topic: '秦始皇统一与巩固措施', level: '★★★', reason: '2024辽吉黑第18题15分大题', unit: '第3课' },
    { id: 'ef2', topic: '汉武帝大一统', level: '★★★', reason: '2022辽宁第2题、2025黑吉辽蒙第2题', unit: '第4课' },
    { id: 'ef3', topic: '汉代政治理念与行政管理', level: '★★★', reason: '辽宁卷特色高频考点', unit: '第4课' },
    { id: 'ef4', topic: '新石器时代文化遗存', level: '★★☆', reason: '2021辽宁第1题、2024辽吉黑第1题', unit: '第1课' },
    { id: 'ef5', topic: '西周分封制', level: '★★☆', reason: '2023辽宁第1题辽宁地方特色', unit: '第2课' },
    { id: 'ef6', topic: '春秋战国诸子百家', level: '★★☆', reason: '2022辽宁第1题、2025黑吉辽蒙第1题', unit: '第2课' },
    { id: 'ef7', topic: '东汉世家大族与庄园经济', level: '★★☆', reason: '2021辽宁第2题', unit: '第4课' },
    { id: 'ef8', topic: '史学方法', level: '★★☆', reason: '2023辽宁第2题', unit: '第4课' },
    { id: 'ef9', topic: '民族交往交流交融', level: '★★☆', reason: '2022辽宁第20题12分大题', unit: '跨单元' },
  ],

  // ========== 记忆公式 ==========
  memoryFormulas: [
    { formula: '血缘纽带等级森严，神权浓厚地方大，家国同构延续稳', period: '早期国家', periodFeature: '政治' },
    { formula: '经济：铁犁牛耕、私有制、小农经济；政治：变法郡县制、官僚化；思想：百家争鸣；民族：华夏认同', period: '春秋战国', periodFeature: '大变革' },
    { formula: '皇帝独尊，三公九卿、郡县制、书同文、车同轨', period: '秦朝', periodFeature: '统一' },
    { formula: '政治：中外朝、推恩令、刺史、察举；经济：盐铁官营，五铢钱；思想：独尊儒术；民族：北击匈奴、西通西域', period: '汉武帝', periodFeature: '大一统' },
    { formula: '皇权强化（尚书台）、外戚宦官交替、豪强地主与庄园经济、党锢之祸', period: '东汉', periodFeature: '特征' },
  ],

  // ========== 历史卡牌 ==========
  cards: [
    { id: 'card1-1', front: '分封制的目的', back: '"封建亲戚，以藩屏周"，巩固周统治', category: '政治', difficulty: '中等' },
    { id: 'card1-2', front: '宗法制的核心', back: '嫡长子继承制度', category: '政治', difficulty: '简单' },
    { id: 'card1-3', front: '商鞅变法的内容', back: '①重农抑商，奖励耕织；②奖励军功；③拆散大家庭；④废井田开阡陌；⑤什伍连坐；⑥推行县制', category: '政治', difficulty: '困难' },
    { id: 'card1-4', front: '小农经济的特点', back: '自给自足、男耕女织、分散性、封闭性、脆弱性', category: '经济', difficulty: '中等' },
    { id: 'card1-5', front: '诸子百家的代表人物及观点', back: '儒家-孔子(仁)、孟子(仁政)、荀子(隆礼重法)；道家-老子(无为)、庄子(逍遥)；法家-韩非(法治)；墨家-墨子(兼爱非攻)', category: '思想', difficulty: '困难' },
    { id: 'card1-6', front: '秦朝三公', back: '丞相（百官之首）、御史大夫（副丞相，监察）、太尉（军事）', category: '政治', difficulty: '简单' },
    { id: 'card1-7', front: '郡县制vs分封制', back: '郡县制按地域划分，官吏由皇帝任免，官僚政治；分封制以血缘为基础，世袭爵位，贵族政治', category: '政治', difficulty: '困难' },
    { id: 'card1-8', front: '汉武帝大一统措施', back: '政治：推恩令、刺史、察举；经济：盐铁官营、五铢钱；思想：罢黜百家独尊儒术', category: '政治', difficulty: '困难' },
    { id: 'card1-9', front: '董仲舒新儒学', back: '君权神授、天人感应、三纲五常', category: '思想', difficulty: '中等' },
    { id: 'card1-10', front: '新石器时代文化', back: '仰韶(黄河中游/彩陶/粟/母系)、河姆渡(长江下游/水稻/蚕丝)、龙山(黑陶/父系)、红山(辽河/玉器)、良渚(长江下游/玉器水利)', category: '文化', difficulty: '困难' },
  ],

  // ========== 辽宁高考真题 ==========
  realQuestions: [
    { year: 2021, province: '辽宁', question: '良渚文化双钱结藤编', answer: 'C', points: 3, type: '选择', unit: '第1课' },
    { year: 2021, province: '辽宁', question: '东汉后期世家大族修家谱', answer: 'B', points: 3, type: '选择', unit: '第4课' },
    { year: 2022, province: '辽宁', question: '春秋末期太祝观点（民本思想）', answer: 'A', points: 3, type: '选择', unit: '第2课' },
    { year: 2022, province: '辽宁', question: '汉代文献"六合同风九州共贯"', answer: 'C', points: 3, type: '选择', unit: '第4课' },
    { year: 2024, province: '辽吉黑', question: '秦始皇刻石 vs 奥古斯都功德碑', answer: '—', points: 15, type: '材料分析', unit: '第3课' },
  ],
};

// ==================== 第二单元完整数据 ====================
const UNIT2_DATA = {
  id: 'u2',
  unitTitle: '第二单元：三国两晋南北朝的民族交融与隋唐统一多民族封建国家的发展',
  textbookId: 'outline-upper',
  bookName: '中外历史纲要（上）',
  unitNo: 2,
  lessons: ['l5', 'l6', 'l7', 'l8'],
  period: '三国-隋唐',
  pageRange: '第5-8课',

  concepts: [
    { id: 'c2-1', name: '三国鼎立', category: '政治', subCategory: '政治', definition: '魏（220年，曹丕，洛阳）；蜀汉（221年，刘备，成都）；吴（222年，孙权，建业）。评价：是东汉末年军阀混战走向局部统一的过渡形态；推动了江南和西南开发。', keyPoints: ['魏蜀吴三国', '220/221/222年建立', '局部统一'], importance: 4, gaokaoFocus: '三国建立时间、人物、都城' },
    { id: 'c2-2', name: '西晋统一与灭亡', category: '政治', subCategory: '政治', definition: '266年司马炎代魏建西晋；280年灭吴完成统一；291-306年八王之乱；316年西晋灭亡。原因：分封宗室→八王之乱→民族矛盾激化→匈奴灭西晋。', keyPoints: ['266年建立', '280年统一', '八王之乱', '316年灭亡'], importance: 4, gaokaoFocus: '西晋短暂统一及速亡原因' },
    { id: 'c2-3', name: '东晋与南朝', category: '政治', subCategory: '政治', definition: '东晋（317-420年，司马睿，建康）；宋（420-479年）；齐（479-502年）；梁（502-557年）；陈（557-589年）。衣冠南渡：北方士族大批南迁。门阀政治：王与马共天下。', keyPoints: ['东晋南朝', '衣冠南渡', '门阀政治', '建康都城'], importance: 4, gaokaoFocus: '南朝政权更迭' },
    { id: 'c2-4', name: '江南开发', category: '经济', subCategory: '经济', definition: '原因：①北方人口南迁带来劳动力和技术；②南方战乱较少；③自然条件优越；④统治者重视农业。表现：农业土地大量开垦；手工业丝织矿冶陶瓷；商业城市繁荣。影响：为经济重心南移奠定基础。', keyPoints: ['北人南迁', '经济重心南移奠基', '南宋才完成'], importance: 5, gaokaoFocus: '江南开发是辽宁卷高频考点' },
    { id: 'c2-5', name: '孝文帝改革', category: '政治', subCategory: '政治', definition: '背景：民族矛盾尖锐，接受汉族先进文化。前期（冯太后）：俸禄制、均田制，三长制。后期（孝文帝）：迁都洛阳（493-495年）；说汉语、穿汉服、改汉姓、与汉族通婚、改籍贯。影响-积极：大大促进民族交融；缓和民族矛盾；促进北方经济恢复；推动封建化进程；为隋唐大一统奠定基础。', keyPoints: ['均田制', '三长制', '迁都洛阳', '汉化改革'], importance: 5, gaokaoFocus: '孝文帝改革是高频考点' },
    { id: 'c2-6', name: '隋朝统一与灭亡', category: '政治', subCategory: '政治', definition: '581年杨坚代北周建隋；589年隋灭陈统一全国；618年隋炀帝被杀，隋朝灭亡。隋炀帝暴政：营建洛阳，开凿大运河，三征高句丽、滥用民力。', keyPoints: ['581年建立', '589年统一', '618年灭亡'], importance: 4, gaokaoFocus: '589年隋统一是基础识记' },
    { id: 'c2-7', name: '隋朝大运河', category: '经济', subCategory: '经济', definition: '目的：加强南北交通，巩固统治。中心：洛阳。南北端点：北至涿郡（今北京），南至余杭（今杭州）。四段：永济渠、通济渠、邗沟、江南河。作用-积极：沟通南北交通，促进经济文化交流，巩固统一。作用-消极：滥用民力，加速隋亡。', keyPoints: ['以洛阳为中心', '永济渠通济渠邗沟江南河', '南北交通大动脉'], importance: 4, gaokaoFocus: '大运河的目的、中心、四段名称、影响' },
    { id: 'c2-8', name: '唐朝盛世', category: '政治', subCategory: '政治', definition: '贞观之治（627-649年，唐太宗）：轻徭薄赋、纳谏如流、知人善任，完善科举与三省六部制。武周政治（690-705年，武则天）：唯一女皇帝；发展科举、创武举和殿试。开元盛世（713-741年，唐玄宗前期）：唐朝国力鼎盛，政治稳定、经济繁荣、文化昌盛。', keyPoints: ['贞观之治', '武则天', '开元盛世', '全盛顶点'], importance: 5, gaokaoFocus: '贞观之治vs开元盛世（前者是治世开端，后者是鼎盛）' },
    { id: 'c2-9', name: '唐朝民族关系', category: '政治', subCategory: '民族', definition: '总原则：开明、平等、友好的民族政策；主要方式：设置机构、册封、和亲、会盟、互市。东突厥：唐太宗击败，被尊为天可汗。吐蕃：文成公主入藏（641年）、金城公主入藏，长庆会盟。', keyPoints: ['天可汗', '文成公主入藏', '和亲'], importance: 4, gaokaoFocus: '文成公主入藏的意义' },
    { id: 'c2-10', name: '安史之乱', category: '政治', subCategory: '政治', definition: '时间：755-763年。发动者：安禄山、史思明。原因：①根本：唐玄宗后期政治腐败；②直接：节度使势力膨胀；③外重内轻。结果：唐朝由盛转衰。影响：①政治：藩镇割据，中央集权削弱；②经济：北方经济遭受破坏，人口南迁加速经济重心南移。', keyPoints: ['755-763年', '由盛转衰', '藩镇割据', '经济重心南移加速'], importance: 5, gaokaoFocus: '安史之乱是高频考点' },
    { id: 'c2-11', name: '五代十国', category: '政治', subCategory: '政治', definition: '时间：907-960年。五代：后梁、后唐、后晋、后汉、后周（黄河流域）。十国：南方及山西10个割据政权。实质：唐末藩镇割据的继续和扩大。后周世宗改革：为北宋统一奠定基础。', keyPoints: ['唐末藩镇割据继续', '五代更迭'], importance: 3, gaokaoFocus: '五代十国的实质' },
    { id: 'c2-12', name: '选官制度演变', category: '政治', subCategory: '政治', definition: '世卿世禄制（先秦）：血缘，贵族世袭。察举制（汉）：品行才学，地方推举。九品中正制（魏晋）：门第（家世），"上品无寒门，下品无势族"。科举制（隋唐至清）：考试成绩，公开考试择优录取。', keyPoints: ['察举制：品行才学', '九品中正：门第家世', '科举：考试成绩'], importance: 5, gaokaoFocus: '选官制度演变是超级高频考点' },
    { id: 'c2-13', name: '科举制', category: '政治', subCategory: '政治', definition: '创立：隋文帝分科考试；隋炀帝设进士科（正式形成）；唐太宗增加科目；武则天创武举和殿试；唐玄宗用高官主考。影响-积极：①把选官权收归中央，加强中央集权；②扩大统治基础，促进阶层流动；③提高官员素质；④促进教育发展；⑤体现公平公正。', keyPoints: ['进士科', '扩大统治基础', '促进社会流动'], importance: 5, gaokaoFocus: '科举制是超级高频考点' },
    { id: 'c2-14', name: '三省六部制', category: '政治', subCategory: '政治', definition: '结构：中书省（决策）、门下省（审议）、尚书省（执行），下设六部（吏户礼兵刑工）。特点：三省互不相属，互相牵制；分权明确；削弱相权，加强皇权。影响：①提高效率；②减少失误；③削弱相权加强皇权。', keyPoints: ['中书决策', '门下审议', '尚书执行', '削弱相权加强皇权'], importance: 5, gaokaoFocus: '三省六部制是高频考点' },
    { id: 'c2-15', name: '租庸调制与两税法', category: '经济', subCategory: '经济', definition: '租庸调制（唐前期）：租（田租谷物）、调（户调绢帛布麻）、庸（纳绢代役，保证生产时间）。两税法（780年，唐德宗，杨炎）：背景：均田制瓦解，财政困难。内容：①按土地和财产收税；②取消租庸调和杂税；③分夏秋两季征收。标准：从以人丁为主改为以财产为主。', keyPoints: ['租庸调：庸代役', '两税法：以财产为主', '夏秋两征'], importance: 5, gaokaoFocus: '租庸调制vs两税法是高频考点' },
    { id: 'c2-16', name: '三教合一与反佛', category: '文化', subCategory: '文化', definition: '三教并存：儒学（正统地位受挑战但未动摇）、道教（唐代受尊崇）、佛教（隋唐鼎盛，形成禅宗等中国化宗派）。三教合一趋势：隋唐儒学家主张以儒学为主吸收佛道思想，为宋代理学奠定基础。反佛：范缜《神灭论》；三武一宗灭佛。', keyPoints: ['三教合一', '范缜', '三武一宗灭佛'], importance: 3, gaokaoFocus: '理解儒学发展脉络' },
    { id: 'c2-17', name: '唐诗与书法绘画', category: '文化', subCategory: '文化', definition: '文学-唐诗：李白（诗仙，浪漫主义）、杜甫（诗圣，现实主义）、白居易（通俗）。书法：王羲之《兰亭序》（天下第一行书）；颜真卿（颜筋）；柳公权（柳骨）。绘画：顾恺之（以形写神）；阎立本《步辇图》；吴道子（画圣）。', keyPoints: ['李白杜甫白居易', '王羲之兰亭序', '吴道子'], importance: 4, gaokaoFocus: '唐代文学艺术成就是高频考点' },
    { id: 'c2-18', name: '三国至隋唐科技', category: '文化', subCategory: '文化', definition: '数学：祖冲之（圆周率精确到小数点后七位）。农学：贾思勰《齐民要术》（最早最完整农书）。地理：郦道元《水经注》。印刷术：868年《金刚经》（世界现存最早有日期的雕版印刷品）。天文：僧一行（测算子午线长度）。医学：孙思邈《千金方》；《唐本草》（世界首部国家颁布药典）。建筑：李春赵州桥（现存最古老石拱桥）。', keyPoints: ['祖冲之圆周率', '贾思勰齐民要术', '僧一行子午线', '赵州桥'], importance: 4, gaokaoFocus: '科技成就是高频考点' },
    { id: 'c2-19', name: '中外文化交流', category: '文化', subCategory: '文化', definition: '玄奘：唐太宗贞观年间，到天竺求法，著《大唐西域记》。鉴真：唐玄宗，六次东渡日本，传授佛学和唐朝文化。日本大化改新：受唐朝影响。交流频繁原因：①国家强盛经济繁荣；②对外开放兼容并蓄；③交通发达。', keyPoints: ['玄奘西行', '鉴真东渡', '大化改新'], importance: 4, gaokaoFocus: '中外交流代表事件及意义' },
  ],

  mustRememberTables: [
    {
      id: 'mrt2-1',
      title: '选官制度演变对比表',
      headers: ['制度', '时期', '选拔标准', '特点'],
      rows: [
        ['世卿世禄制', '先秦', '血缘', '贵族世袭'],
        ['察举制', '汉', '品行才学', '地方推举'],
        ['九品中正制', '魏晋', '门第（家世）', '"上品无寒门，下品无势族"'],
        ['科举制', '隋唐至清', '考试成绩', '公开考试择优录取'],
      ],
      importance: 5,
    },
    {
      id: 'mrt2-2',
      title: '贞观之治vs开元盛世对比表',
      headers: ['维度', '贞观之治', '开元盛世'],
      rows: [
        ['时间', '627-649年', '713-741年'],
        ['人物', '唐太宗', '唐玄宗前期'],
        ['特点', '治世开端', '唐朝鼎盛'],
        ['措施', '轻徭薄赋、纳谏如流、知人善任', '政治稳定、经济繁荣、文化昌盛'],
      ],
      importance: 4,
    },
  ],

  events: [
    { year: '220年', title: '曹丕代汉建魏', category: '政治', importance: 4 },
    { year: '221年', title: '刘备建蜀汉', category: '政治', importance: 4 },
    { year: '222年', title: '孙权建吴', category: '政治', importance: 4 },
    { year: '266年', title: '司马炎代魏建西晋', category: '政治', importance: 4 },
    { year: '280年', title: '西晋灭吴', category: '政治', importance: 4 },
    { year: '316年', title: '西晋灭亡', category: '政治', importance: 4 },
    { year: '317年', title: '东晋建立', category: '政治', importance: 4 },
    { year: '383年', title: '淝水之战', category: '战争', importance: 3 },
    { year: '420年', title: '刘裕建宋，南朝开始', category: '政治', importance: 4 },
    { year: '439年', title: '北魏统一北方', category: '政治', importance: 4 },
    { year: '471-499年', title: '孝文帝改革', category: '政治', importance: 5 },
    { year: '493-495年', title: '孝文帝迁都洛阳', category: '政治', importance: 5 },
    { year: '534年', title: '北魏分裂为东西魏', category: '政治', importance: 4 },
    { year: '581年', title: '杨坚建隋', category: '政治', importance: 4 },
    { year: '589年', title: '隋灭陈，统一', category: '政治', importance: 5 },
    { year: '618年', title: '唐朝建立', category: '政治', importance: 5 },
    { year: '627-649年', title: '贞观之治', category: '政治', importance: 5 },
    { year: '690-705年', title: '武周政治', category: '政治', importance: 4 },
    { year: '713-741年', title: '开元盛世', category: '政治', importance: 5 },
    { year: '755-763年', title: '安史之乱', category: '政治', importance: 5 },
    { year: '907年', title: '唐朝灭亡，五代十国开始', category: '政治', importance: 4 },
  ],

  causalLinks: [
    { from: '八王之乱', to: '西晋灭亡', type: '因果', description: '八王之乱消耗国力，民族矛盾激化导致灭亡' },
    { from: '衣冠南渡', to: '江南开发', type: '因果', description: '北方人口南迁带来先进技术和劳动力' },
    { from: '孝文帝改革', to: '民族交融', type: '因果', description: '汉化改革大大促进民族交融' },
    { from: '隋炀帝暴政', to: '隋朝灭亡', type: '因果', description: '滥用民力导致农民起义' },
    { from: '安史之乱', to: '经济重心南移', type: '因果', description: '北方遭受破坏，人口南迁加速经济重心南移' },
  ],

  examFocus: [
    { id: 'ef2-1', topic: '选官制度（科举制/九品中正制）', level: '★★★', reason: '2021-3、2022-20大题、2024-3', unit: '第7课' },
    { id: 'ef2-2', topic: '三国至隋唐文化（绘画/诗歌/史学）', level: '★★★', reason: '2023-3、2023-19大题、2025-6', unit: '第8课' },
    { id: 'ef2-3', topic: '孝文帝改革/北魏汉化', level: '★★☆', reason: '2024-2', unit: '第5课' },
    { id: 'ef2-4', topic: '江南开发', level: '★★☆', reason: '2025-4', unit: '第5课' },
    { id: 'ef2-5', topic: '隋朝统一与制度', level: '★★☆', reason: '2025-5', unit: '第6课' },
    { id: 'ef2-6', topic: '唐代经济（手工业/水运）', level: '★★☆', reason: '2022-3', unit: '第6课' },
    { id: 'ef2-7', topic: '三省六部制', level: '★★☆', reason: '全国高频', unit: '第7课' },
    { id: 'ef2-8', topic: '两税法/赋税制度', level: '★★☆', reason: '全国高频', unit: '第7课' },
    { id: 'ef2-9', topic: '安史之乱/藩镇割据', level: '★★☆', reason: '全国高频', unit: '第6课' },
  ],

  memoryFormulas: [
    { formula: '政权更迭三百载，三国两晋南北朝；衣冠南渡江南兴，五族内迁民族融；孝文改革推汉化，封建化进程由此开', period: '三国两晋南北朝', periodFeature: '分裂交融' },
    { formula: '隋文一统开皇治，炀帝暴政速亡隋；太宗贞观纳谏治，武后承前启开元；玄宗前期盛世现，民族友好天可汗', period: '隋唐', periodFeature: '统一繁盛' },
    { formula: '选官演变四阶段，世袭察举九品科；科举隋文炀帝始，武后殿试玄宗兴；三省六部分权制，相权三分皇权强', period: '制度创新', periodFeature: '贯穿全程' },
  ],

  cards: [
    { id: 'card2-1', front: '三国鼎立的建立', back: '魏（220年，曹丕，洛阳）、蜀汉（221年，刘备，成都）、吴（222年，孙权，建业）', category: '政治', difficulty: '简单' },
    { id: 'card2-2', front: '孝文帝改革内容', back: '说汉语、穿汉服、改汉姓、与汉族通婚、改籍贯、迁都洛阳', category: '政治', difficulty: '困难' },
    { id: 'card2-3', front: '科举制的影响', back: '①加强中央集权；②扩大统治基础；③促进阶层流动；④提高官员素质；⑤促进教育发展', category: '政治', difficulty: '中等' },
    { id: 'card2-4', front: '三省六部制结构', back: '中书省（决策）、门下省（审议）、尚书省（执行），下设六部（吏户礼兵刑工）', category: '政治', difficulty: '简单' },
    { id: 'card2-5', front: '安史之乱的影响', back: '唐朝由盛转衰；藩镇割据，中央集权削弱；北方经济破坏，人口南迁加速经济重心南移', category: '政治', difficulty: '困难' },
  ],

  realQuestions: [],
};

// ==================== 第三单元完整数据 ====================
const UNIT3_DATA = {
  id: 'u3',
  unitTitle: '第三单元：辽宋夏金元多民族政权的并立与元朝统一',
  textbookId: 'outline-upper',
  bookName: '中外历史纲要（上）',
  unitNo: 3,
  lessons: ['l9', 'l10', 'l11', 'l12'],
  period: '宋元',
  pageRange: '第9-12课',

  concepts: [
    { id: 'c3-1', name: '宋初中央集权加强', category: '政治', subCategory: '政治', definition: '背景：唐末五代藩镇割据。措施-分相权：设枢密院（军政）、三司（财政）、中书门下（行政）；参知政事分行政权（二府三司制）。措施-收地方权：文官任知州；设通判监督；设转运使收财权。措施-收兵权：杯酒释兵权；禁军分三衙；更戍法。影响-积极：结束分裂割据；加强中央集权。影响-消极：冗官冗兵冗费→积贫积弱。', keyPoints: ['二府三司', '杯酒释兵权', '更戍法', '积贫积弱'], importance: 5, gaokaoFocus: '宋初措施是高频考点' },
    { id: 'c3-2', name: '边防压力与和战', category: '政治', subCategory: '政治', definition: '宋辽：1005年澶渊之盟，宋给辽岁币（银10万两、绢20万匹）。宋夏：1043年庆历和议，宋给岁赐（银7.2万两、绢15.3万匹、茶3万斤）。宋金：1141年绍兴和议，南宋向金称臣，岁贡（银25万两、绢25万匹）。', keyPoints: ['岁币给辽', '岁赐给西夏', '岁贡给金'], importance: 4, gaokaoFocus: '岁币/岁赐/岁贡的区分是高频考点' },
    { id: 'c3-3', name: '王安石变法', category: '政治', subCategory: '政治', definition: '背景：积贫积弱局面。目的：富国强兵。内容-经济：青苗法、募役法、农田水利法、市易法、方田均税法。内容-军事：保甲法、将兵法、保马法。内容-教育：改革科举、整顿太学。结果：新法被废止，变法失败。', keyPoints: ['青苗法', '募役法', '保甲法', '富国强兵'], importance: 4, gaokaoFocus: '王安石变法是高频考点' },
    { id: 'c3-4', name: '辽夏金元政治制度', category: '政治', subCategory: '政治', definition: '辽：南北面官制（一国两制）。夏：汉制和蕃制并用。金：猛安谋克制（兵农合一）。元：行省制度（全国）；宣政院（西藏）；澎湖巡检司（台湾）。', keyPoints: ['南北面官制', '猛安谋克', '行省制度'], importance: 5, gaokaoFocus: '行省制度是超级高频考点' },
    { id: 'c3-5', name: '元朝统一与民族关系', category: '政治', subCategory: '民族', definition: '统一：1206年成吉思汗建蒙古国；1271年忽必烈建元；1279年灭南宋，完成统一。民族政策：四等人制（蒙古人、色目人、汉人、南人）。积极作用：结束分裂；促进民族交融。消极影响：民族压迫。', keyPoints: ['1279年统一', '四等人制', '行省制度'], importance: 5, gaokaoFocus: '元朝统一是高频考点' },
    { id: 'c3-6', name: '宋代经济繁荣', category: '经济', subCategory: '经济', definition: '农业：稻麦复种制推广；经济作物种植广泛。手工业：丝织业、陶瓷业（五大名窑）、矿冶业发达。商业：市突破时空限制；出现草市；出现最早纸币（交子）；出现工商业城镇；海外贸易发达（广州、泉州）。', keyPoints: ['交子', '市突破时空限制', '海外贸易'], importance: 4, gaokaoFocus: '宋代经济是高频考点' },
    { id: 'c3-7', name: '经济重心南移', category: '经济', subCategory: '经济', definition: '过程：①东汉末→西晋：北方战乱，人口南迁；②两宋：经济重心南移完成（"苏湖熟，天下足"）。原因：①北方战乱，南方相对稳定；②北方人口南迁带来先进技术和劳动力；③南方自然条件优越；④统治者重视农业。', keyPoints: ['苏湖熟天下足', '南宋时完成', '人口南迁'], importance: 5, gaokaoFocus: '经济重心南移是高频考点' },
    { id: 'c3-8', name: '元朝经济', category: '经济', subCategory: '经济', definition: '农业：推广棉花种植（松江乌泥泾）；重农抑商政策松弛。商业：元大都成为国际性大都市；纸币广泛流通；运河畅通；海运发达（刘家港）。', keyPoints: ['棉花推广', '纸币流通', '海运发达'], importance: 3, gaokaoFocus: '元朝经济特点' },
    { id: 'c3-9', name: '宋代儒学发展', category: '文化', subCategory: '文化', definition: '背景：儒学复兴运动。代表人物：程颢、程颐（理学的奠基者）；朱熹（理学的集大成者）。核心思想："理"是宇宙万物的本原；"格物致知"。陆九渊："心"是宇宙万物的本原；"发明本心"。影响：宋代理学成为官方哲学；影响后世数百年。', keyPoints: ['理学', '格物致知', '朱熹'], importance: 5, gaokaoFocus: '宋明理学是高频考点' },
    { id: 'c3-10', name: '元曲与明清小说', category: '文化', subCategory: '文化', definition: '元曲：元代文学主流，包括杂剧和散曲。代表：关汉卿《窦娥冤》、马致远《天净沙·秋思》。特点：内容丰富，反映社会现实。明清小说：四大名著（《三国演义》《水浒传》《西游记》《红楼梦》）。', keyPoints: ['关汉卿', '窦娥冤', '四大名著'], importance: 4, gaokaoFocus: '元曲和小说是常考点' },
    { id: 'c3-11', name: '三大发明外传', category: '文化', subCategory: '文化', definition: '印刷术：13世纪传入欧洲。火药：13世纪传入欧洲。指南针：12世纪传入欧洲。影响：促进了欧洲资本主义萌芽的产生；推动了新航路的开辟。', keyPoints: ['印刷术', '火药', '指南针', '欧洲影响'], importance: 4, gaokaoFocus: '三大发明外传是高频考点' },
    { id: 'c3-12', name: '宋元科技成就', category: '文化', subCategory: '文化', definition: '沈括《梦溪笔谈》：记述了大量科学技术成果，被李约瑟称为"中国科学史上的里程碑"。郭守敬《授时历》：天文历法，比欧洲早300年。', keyPoints: ['沈括', '梦溪笔谈', '郭守敬', '授时历'], importance: 4, gaokaoFocus: '宋元科技是常考点' },
  ],

  mustRememberTables: [
    {
      id: 'mrt3-1',
      title: '辽宋夏金元政治制度对比表',
      headers: ['政权', '政治制度', '特点'],
      rows: [
        ['宋', '二府三司制', '分相权、收兵权、收地方权'],
        ['辽', '南北面官制', '一国两制'],
        ['金', '猛安谋克制', '兵农合一'],
        ['元', '行省制度', '全国统一管理'],
      ],
      importance: 5,
    },
    {
      id: 'mrt3-2',
      title: '经济重心南移过程表',
      headers: ['时期', '状况', '原因'],
      rows: [
        ['东汉末', '开始南移', '北方战乱'],
        ['两晋', '大规模南移', '五胡乱华'],
        ['两宋', '完成南移', '"苏湖熟，天下足"'],
      ],
      importance: 5,
    },
    {
      id: 'mrt3-3',
      title: '宋代儒学发展表',
      headers: ['代表人物', '思想', '影响'],
      rows: [
        ['程颢、程颐', '理学奠基，"理"是宇宙本原', '开创理学'],
        ['朱熹', '理学集大成，"格物致知"', '成为官方哲学'],
        ['陆九渊', '心学，"心"是宇宙本原', '与理学分庭抗礼'],
      ],
      importance: 5,
    },
  ],

  events: [
    { year: '960年', title: '北宋建立', category: '政治', importance: 4 },
    { year: '916年', title: '辽朝建立', category: '政治', importance: 4 },
    { year: '1038年', title: '西夏建立', category: '政治', importance: 3 },
    { year: '1005年', title: '澶渊之盟', category: '政治', importance: 4 },
    { year: '1115年', title: '金朝建立', category: '政治', importance: 4 },
    { year: '1127年', title: '靖康之变，北宋灭亡', category: '政治', importance: 5 },
    { year: '1141年', title: '绍兴和议', category: '政治', importance: 4 },
    { year: '1206年', title: '成吉思汗建蒙古国', category: '政治', importance: 5 },
    { year: '1271年', title: '忽必烈建元', category: '政治', importance: 5 },
    { year: '1279年', title: '元朝统一全国', category: '政治', importance: 5 },
  ],

  causalLinks: [
    { from: '北宋建立', to: '加强中央集权', type: '因果', description: '宋初通过二府三司制加强中央集权' },
    { from: '经济重心南移', to: '宋代经济繁荣', type: '因果', description: '经济重心南移促进南方经济发展' },
    { from: '元朝统一', to: '行省制度', type: '因果', description: '统一后建立行省制度管理全国' },
  ],

  examFocus: [
    { id: 'ef3-1', topic: '宋元政治制度', level: '★★★', reason: '全国高频', unit: '第9-11课' },
    { id: 'ef3-2', topic: '经济重心南移', level: '★★★', reason: '2023-4、2024-5', unit: '第10课' },
    { id: 'ef3-3', topic: '宋元民族关系', level: '★★☆', reason: '2022-4', unit: '第9-11课' },
  ],

  memoryFormulas: [
    { formula: '宋辽金夏并立世，澶渊绍兴和议签；王安石变法失败终，经济重心南移成', period: '两宋', periodFeature: '并立' },
    { formula: '蒙古崛起铁木真，一代天骄成吉思；忽必烈建元统一，行省制度创新篇', period: '元', periodFeature: '统一' },
  ],

  cards: [
    { id: 'card3-1', front: '宋初加强中央集权的措施', back: '二府三司制分相权；杯酒释兵权收兵权；文官任知州收地方权', category: '政治', difficulty: '困难' },
    { id: 'card3-2', front: '行省制度', back: '全国设行省；宣政院管西藏；澎湖巡检司管台湾', category: '政治', difficulty: '中等' },
    { id: 'card3-3', front: '经济重心南移', back: '南宋时完成；"苏湖熟，天下足"；原因：北方战乱、人口南迁、自然条件', category: '经济', difficulty: '中等' },
    { id: 'card3-4', front: '宋代理学', back: '程朱理学："理"是宇宙本原，"格物致知"；陆九渊心学："心"是宇宙本原', category: '文化', difficulty: '困难' },
  ],

  realQuestions: [],
};

const allUnits = [UNIT1_DATA, UNIT2_DATA, UNIT3_DATA];

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      success: false,
      error: 'Supabase未配置，无法导入数据',
      configured: false,
    });
  }

  const results = [];

  for (const unitData of allUnits) {
    console.log(`[历史数据导入] 正在导入单元: ${unitData.id} - ${unitData.unitTitle}`);

    // 先删除旧记录
    await supabase
      .from('docx_imports')
      .delete()
      .eq('user_id', USER_ID)
      .eq('unit_id', unitData.id);

    // 构建导入记录
    const importRecord = {
      id: `${USER_ID}-${unitData.id}`,
      user_id: USER_ID,
      file_name: `${unitData.unitTitle}.json`,
      unit_id: unitData.id,
      textbook_id: unitData.textbookId,
      unit_title: unitData.unitTitle,
      data: unitData,
      concepts_count: unitData.concepts?.length || 0,
      events_count: unitData.events?.length || 0,
      links_count: unitData.causalLinks?.length || 0,
      exam_focus_count: unitData.examFocus?.length || 0,
      imported_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('docx_imports')
      .upsert(importRecord, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error(`[历史数据导入] 失败 ${unitData.id}:`, error);
      results.push({
        unitId: unitData.id,
        success: false,
        error: error.message,
      });
    } else {
      console.log(`[历史数据导入] 成功 ${unitData.id}:`, data);
      results.push({
        unitId: unitData.id,
        success: true,
        conceptsCount: unitData.concepts?.length || 0,
        eventsCount: unitData.events?.length || 0,
        mustRememberTablesCount: unitData.mustRememberTables?.length || 0,
        cardsCount: unitData.cards?.length || 0,
      });
    }
  }

  return NextResponse.json({
    success: true,
    message: `数据导入完成 ${results.filter(r => r.success).length}/${results.length} 个单元成功`,
    results,
  });
}
