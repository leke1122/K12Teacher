// 历史单元引导式问答数据
export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  relatedKnowledge: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface KnowledgePoint {
  id: string;
  name: string;
  description: string;
}

export interface UnitQuizData {
  unitId: string;
  unitName: string;
  knowledgePoints: KnowledgePoint[];
  questions?: QuizQuestion[];
}

// 获取单元数据
export function getUnitQuizData(unitId: string): UnitQuizData | undefined {
  const dataMap: Record<string, UnitQuizData> = {
    'u1': {
      unitId: 'u1',
      unitName: '第一单元：从中华文明起源到秦汉统一多民族封建国家的建立与巩固',
      knowledgePoints: [
        { id: 'kp-1-1', name: '旧石器时代', description: '约200万年前至1万年前。人类使用打制石器，以采集、渔猎为生。代表：元谋人、北京人。' },
        { id: 'kp-1-2', name: '新石器时代', description: '约1万年前开始，人类使用磨制石器，发明了陶器，出现原始农业和畜牧业。' },
        { id: 'kp-1-3', name: '新石器时代文化遗存', description: '仰韶文化（黄河流域）、河姆渡文化（长江流域）、龙山文化、良渚文化等。' },
        { id: 'kp-1-4', name: '文明起源多元一体', description: '中华文明起源多元一体，黄河流域和长江流域是中华文明的两大摇篮。' },
        { id: 'kp-1-5', name: '氏族制度的瓦解', description: '随着生产发展，私有制出现，贫富分化加剧。禅让制被世袭制取代。' },
        { id: 'kp-1-6', name: '夏朝建立', description: '约前2070年，禹建立夏朝，标志着中国进入文明时代，是中国历史上第一个王朝。' },
        { id: 'kp-1-7', name: '商朝兴衰', description: '约前1600年，汤建立商朝。商朝青铜器铸造技术精湛，甲骨文是成熟的文字。' },
        { id: 'kp-1-8', name: '西周分封制', description: '前1046年周武王建立西周，实行分封制。周天子将土地和人民分封给诸侯。' },
        { id: 'kp-1-9', name: '宗法制', description: '宗法制是以血缘关系为纽带的政治制度。核心是嫡长子继承制。' },
        { id: 'kp-1-10', name: '礼乐制度', description: '礼乐制度是维护宗法等级秩序的政治制度。礼区分尊卑等级，乐协调人际关系。' },
        { id: 'kp-1-11', name: '井田制', description: '井田制是西周的土地制度。土地被划成井字形，中间为公田，周围为私田。' },
        { id: 'kp-1-12', name: '夏商周社会经济', description: '农业是主要生产部门，主要作物是粟、稻。青铜器制造业发达。' },
        { id: 'kp-1-13', name: '春秋争霸', description: '前770年至前476年为春秋时期。周王室衰微，诸侯争霸。' },
        { id: 'kp-1-14', name: '战国七雄', description: '前475年至前221年为战国时期。经过春秋战争，剩韩、赵、魏、楚、燕、齐、秦七国争雄。' },
        { id: 'kp-1-15', name: '商鞅变法', description: '前356年和前350年，秦孝公任用商鞅进行变法。内容：废井田、开阡陌；奖励军功。' },
        { id: 'kp-1-16', name: '战国变法运动', description: '为在竞争中取胜，各国纷纷变法。除商鞅变法外，还有魏国李悝变法、楚国吴起变法等。' },
        { id: 'kp-1-17', name: '百家争鸣', description: '春秋战国时期，知识分子创立不同学派，形成百家争鸣局面。主要学派：儒、道、法、墨。' },
        { id: 'kp-1-18', name: '儒家思想', description: '孔子：仁、礼、中庸；孟子：仁政、民贵君轻；荀子：性恶论。' },
        { id: 'kp-1-19', name: '道家与法家', description: '老子主张无为而治；韩非主张以法治国、君主专制中央集权。' },
        { id: 'kp-1-20', name: '墨家与其他学派', description: '墨子主张兼爱、非攻、尚贤、节用。纵横家：苏秦合纵、张仪连横。' },
        { id: 'kp-1-21', name: '华夏认同', description: '春秋战国时期，华夏概念形成。华夏族与周边民族不断交融。' },
        { id: 'kp-1-22', name: '秦朝统一', description: '前221年，秦王嬴政建立秦朝，定都咸阳，完成统一，建立中国历史上第一个大一统王朝。' },
        { id: 'kp-1-23', name: '皇帝制度', description: '秦始皇创建皇帝制度。最高统治者称皇帝，皇帝拥有至高无上的权力。' },
        { id: 'kp-1-24', name: '三公九卿制', description: '中央设丞相、太尉、御史大夫，辅佐皇帝。三公之下设九卿。' },
        { id: 'kp-1-25', name: '郡县制', description: '秦朝废除分封制，在全国推行郡县制。郡守、县令由中央任免。' },
        { id: 'kp-1-26', name: '统一文字货币度量衡', description: '秦朝统一文字（小篆）、货币（圆形方孔钱）、度量衡。' },
        { id: 'kp-1-27', name: '秦朝法律与思想控制', description: '秦朝颁布秦律，轻罪重刑。焚书坑儒，钳制思想。' },
        { id: 'kp-1-28', name: '秦朝疆域与工程', description: '秦朝疆域空前辽阔。修筑长城、直道、灵渠。' },
        { id: 'kp-1-29', name: '秦朝灭亡', description: '前209年陈胜吴广起义爆发。前207年巨鹿之战，项羽大败秦军。前206年刘邦入咸阳，秦朝灭亡。' },
        { id: 'kp-1-30', name: '楚汉战争', description: '秦亡后，刘邦与项羽争夺天下。前202年垓下之战，项羽兵败自刎。刘邦建立汉朝。' },
        { id: 'kp-1-31', name: '西汉建立与休养生息', description: '前202年刘邦建立西汉。刘邦实行休养生息政策，轻徭薄赋。' },
        { id: 'kp-1-32', name: '汉武帝大一统', description: '汉武帝时期，西汉达到鼎盛。推恩令削藩、盐铁官营、北击匈奴、独尊儒术。' },
        { id: 'kp-1-33', name: '推恩令与削藩', description: '汉武帝颁布推恩令，规定诸侯王将封地分给所有子弟，削弱诸侯势力。' },
        { id: 'kp-1-34', name: '盐铁官营', description: '汉武帝将盐、铁的经营收归官府，增加财政收入。' },
        { id: 'kp-1-35', name: '汉武帝北击匈奴', description: '汉武帝派卫青、霍去病出击匈奴，基本解除匈奴对汉朝威胁。' },
        { id: 'kp-1-36', name: '张骞通西域', description: '公元前138年和前119年，张骞两次出使西域，开辟丝绸之路。' },
        { id: 'kp-1-37', name: '察举制', description: '汉朝主要选官制度。由地方官员推荐人才，以德才为标准。' },
        { id: 'kp-1-38', name: '独尊儒术', description: '汉武帝采纳董仲舒建议，罢黜百家，独尊儒术。儒学成为官方正统思想。' },
        { id: 'kp-1-39', name: '太学与郡国学校', description: '汉武帝设立太学，是全国最高教育机构。郡国设学校，教授儒家经典。' },
        { id: 'kp-1-40', name: '丝绸之路', description: '张骞通西域后，丝绸之路成为东西方贸易要道。' },
        { id: 'kp-1-41', name: '两汉对外交流', description: '汉朝对外交往活跃，与朝鲜、日本、越南有密切交往。' },
        { id: 'kp-1-42', name: '汉代社会经济', description: '农业：牛耕普及，铁农具推广。手工业：丝织业发达。商业：长安、洛阳成为繁华都市。' },
        { id: 'kp-1-43', name: '光武中兴', description: '25年刘秀建立东汉，实行度田，安抚功臣，轻徭薄赋，史称光武中兴。' },
        { id: 'kp-1-44', name: '庄园经济', description: '东汉时期，豪强地主建立庄园，拥有私人武装。庄园经济发展导致地方割据势力膨胀。' },
        { id: 'kp-1-45', name: '汉代文化繁荣', description: '司马迁《史记》、班固《汉书》；张衡地动仪、蔡伦改进造纸术。' }
      ]
    },
    'u2': {
      unitId: 'u2',
      unitName: '第二单元：三国两晋南北朝的民族交融与隋唐统一多民族封建国家的发展',
      knowledgePoints: [
        { id: 'kp-2-1', name: '东汉衰亡', description: '东汉后期，外戚与宦官交替专权，政治黑暗。黄巾起义沉重打击东汉统治。' },
        { id: 'kp-2-2', name: '官渡之战', description: '200年，曹操与袁绍在官渡决战。曹操以少胜多，统一北方。' },
        { id: 'kp-2-3', name: '赤壁之战', description: '208年，曹操与孙权、刘备联军在赤壁大战。联军火攻曹军，曹军大败。' },
        { id: 'kp-2-4', name: '三国鼎立', description: '220年曹丕建魏，221年刘备建蜀，229年孙权建吴。三国鼎立局面正式形成。' },
        { id: 'kp-2-5', name: '西晋统一', description: '263年魏灭蜀。265年司马炎代魏建晋（西晋），280年灭吴，统一全国。' },
        { id: 'kp-2-6', name: '八王之乱', description: '惠帝时期，八王为争夺权力混战十六年（291-306年）。西晋衰落。' },
        { id: 'kp-2-7', name: '五胡乱华', description: '西晋末年，北方游牧民族内迁。316年匈奴灭西晋。北方进入十六国时期。' },
        { id: 'kp-2-8', name: '东晋偏安', description: '317年司马睿在建康建立东晋。北方士族南渡，与南方士族共同支持东晋。' },
        { id: 'kp-2-9', name: '南北朝对峙', description: '420年刘裕建宋，随后齐、梁、陈相继建立，南方进入南朝。北方五胡政权更迭。' },
        { id: 'kp-2-10', name: '江南开发', description: '北方人口南渡带来先进生产技术，江南农业、手工业、商业全面发展。' },
        { id: 'kp-2-11', name: '北魏孝文帝改革', description: '471年孝文帝即位，进行改革。494年迁都洛阳，改汉姓、穿汉服、说汉语。' },
        { id: 'kp-2-12', name: '民族交融', description: '魏晋南北朝时期，民族交融加强。各民族在碰撞中融合。' },
        { id: 'kp-2-13', name: '魏晋南北朝文化', description: '玄学兴起、佛教传播、道教发展。书法（王羲之）、绘画（顾恺之）。' },
        { id: 'kp-2-14', name: '隋朝统一', description: '581年杨坚代周建隋，589年灭陈，统一全国。' },
        { id: 'kp-2-15', name: '隋炀帝功过', description: '隋炀帝营建东都洛阳、开凿大运河、开创科举制。但滥用民力，隋朝速亡。' },
        { id: 'kp-2-16', name: '大运河', description: '605年至610年，隋炀帝征发民夫开凿大运河。全长2700多公里。' },
        { id: 'kp-2-17', name: '唐朝建立', description: '617年李渊在太原起兵，618年称帝建立唐朝，定都长安。' },
        { id: 'kp-2-18', name: '贞观之治', description: '626年唐太宗即位。他虚心纳谏、知人善任、轻徭薄赋。史称贞观之治。' },
        { id: 'kp-2-19', name: '科举制', description: '隋炀帝创立进士科，科举制形成。唐朝完善科举，打破门阀士族垄断。' },
        { id: 'kp-2-20', name: '武则天', description: '690年武则天称帝，建立武周政权。她是中国历史上唯一的女皇帝。' },
        { id: 'kp-2-21', name: '开元盛世', description: '唐玄宗开元年间（713-741年），唐朝达到鼎盛。' },
        { id: 'kp-2-22', name: '安史之乱', description: '755年安禄山、史思明发动叛乱，持续八年（755-763年）。唐朝由盛转衰。' },
        { id: 'kp-2-23', name: '藩镇割据', description: '安史之乱后，唐朝在各地设置藩镇。节度使掌握军政大权，形成割据势力。' },
        { id: 'kp-2-24', name: '唐朝衰落', description: '宦官专权、朋党之争；均田制破坏，土地兼并严重。' },
        { id: 'kp-2-25', name: '唐朝经济', description: '曲辕犁发明、筒车灌溉。瓷器形成南青北白格局。' },
        { id: 'kp-2-26', name: '唐朝对外交流', description: '朝鲜、日本留学生来唐学习，鉴真东渡，玄奘西行取经。' },
        { id: 'kp-2-27', name: '唐朝文化', description: '唐诗是巅峰，李白、杜甫、白居易是代表。书法（颜真卿、柳公权）。' }
      ]
    },
    'u3': {
      unitId: 'u3',
      unitName: '第三单元：辽宋夏金元多民族政权的并立与元朝统一',
      knowledgePoints: [
        { id: 'kp-3-1', name: '北宋建立', description: '960年赵匡胤发动陈桥兵变，建立宋朝，定都开封，史称北宋。' },
        { id: 'kp-3-2', name: '重文抑武', description: '北宋推行重文抑武政策。派文臣任地方官，削减武将兵权。' },
        { id: 'kp-3-3', name: '中央集权加强', description: '北宋分散地方权力：路、州、县三级。设转运使收财权。' },
        { id: 'kp-3-4', name: '辽朝建立', description: '916年耶律阿保机建立契丹国，后改称辽。' },
        { id: 'kp-3-5', name: '澶渊之盟', description: '1005年北宋与辽签订澶渊之盟。宋每年给辽银十万两、绢二十万匹。' },
        { id: 'kp-3-6', name: '西夏建立', description: '1038年元昊建立西夏，定都兴庆府。' },
        { id: 'kp-3-7', name: '女真崛起', description: '11世纪末，女真完颜部崛起。1115年阿骨打称帝建立金。' },
        { id: 'kp-3-8', name: '靖康之变', description: '1127年金军攻破开封，俘虏宋徽宗、宋钦宗，北宋灭亡。' },
        { id: 'kp-3-9', name: '南宋偏安', description: '1127年赵构在临安建立南宋。岳飞抗金，韩世忠阻击金军。' },
        { id: 'kp-3-10', name: '经济重心南移', description: '宋代经济重心完成南移。南方农业、手工业、商业全面超过北方。' },
        { id: 'kp-3-11', name: '宋代农业', description: '水稻产量提高，占城稻推广，双季稻种植。' },
        { id: 'kp-3-12', name: '宋代商业', description: '商业繁荣：打破坊市界限，出现夜市。纸币出现：北宋四川出现交子。' },
        { id: 'kp-3-13', name: '元朝建立', description: '1206年铁木真建立蒙古政权。1271年忽必烈改国号为元，1279年统一全国。' },
        { id: 'kp-3-14', name: '行省制度', description: '元朝实行行省制度。全国设中书省和行中书省（10个）。' },
        { id: 'kp-3-15', name: '元朝民族政策', description: '元朝实行四等人制：蒙古人、色目人、汉人、南人。' },
        { id: 'kp-3-16', name: '元朝统一意义', description: '元朝统一结束了长期分裂局面，疆域空前辽阔。' },
        { id: 'kp-3-17', name: '元朝经济', description: '棉花种植推广，农业生产恢复。青花瓷发达。' },
        { id: 'kp-3-18', name: '宋代社会生活', description: '城市繁荣，夜市兴盛。市民文化兴起：勾栏瓦肆说书。' },
        { id: 'kp-3-19', name: '宋代科技', description: '活字印刷术（毕昇）、指南针应用、火药武器化。' },
        { id: 'kp-3-20', name: '宋代文学艺术', description: '词（苏轼、李清照、辛弃疾）；张择端《清明上河图》。' }
      ]
    },
    'u4': {
      unitId: 'u4',
      unitName: '第四单元：明清中国版图的奠定与面临的挑战',
      knowledgePoints: [
        { id: 'kp-4-1', name: '明朝建立', description: '1368年朱元璋称帝，建立明朝，定都南京。' },
        { id: 'kp-4-2', name: '废除丞相制度', description: '朱元璋废除丞相制度和中书省，六部直接对皇帝负责。' },
        { id: 'kp-4-3', name: '厂卫制度', description: '明朝设立特务机构：锦衣卫、东厂、西厂。' },
        { id: 'kp-4-4', name: '内阁制度', description: '明成祖设内阁，为皇帝提供顾问。' },
        { id: 'kp-4-5', name: '明朝迁都', description: '1421年明成祖朱棣迁都北京。' },
        { id: 'kp-4-6', name: '郑和下西洋', description: '1405-1433年郑和七次下西洋，最远到达非洲东海岸。' },
        { id: 'kp-4-7', name: '倭寇与抗倭', description: '戚继光组建戚家军，在台州、福建等地抗倭，平定倭患。' },
        { id: 'kp-4-8', name: '明朝对外关系转变', description: '明朝前期开放，后期保守。郑和下西洋后，官方航海逐渐停止。' },
        { id: 'kp-4-9', name: '明朝经济', description: '玉米、番薯、马铃薯传入。苏州丝织业、景德镇瓷器发达。' },
        { id: 'kp-4-10', name: '明朝灭亡', description: '1644年李自成攻入北京，崇祯帝自缢，明朝灭亡。' },
        { id: 'kp-4-11', name: '清朝疆域奠定', description: '清朝疆域辽阔：西跨葱岭，北接西伯利亚，东北至库页岛。' },
        { id: 'kp-4-12', name: '军机处', description: '1729年雍正帝设立军机处。军机大臣跪受笔录。' },
        { id: 'kp-4-13', name: '理藩院', description: '理藩院是清朝管理蒙古、西藏、新疆等地区事务的机构。' },
        { id: 'kp-4-14', name: '驻藏大臣', description: '1727年清朝设立驻藏大臣，代表中央与达赖喇嘛共同管理西藏。' },
        { id: 'kp-4-15', name: '台湾统一', description: '1662年郑成功收复台湾。1683年清朝统一台湾，设台湾府。' },
        { id: 'kp-4-16', name: '边疆治理', description: '清朝对边疆地区实行因地制宜的统治：蒙古地区实行盟旗制度。' },
        { id: 'kp-4-17', name: '文字狱', description: '清朝实行文化专制，大兴文字狱，禁锢思想。' },
        { id: 'kp-4-18', name: '闭关锁国', description: '清朝实行闭关锁国政策。1757年只留广州一口通商。' },
        { id: 'kp-4-19', name: '康乾盛世', description: '康熙、雍正、乾隆三朝（1661-1796年）被称为康乾盛世。' },
        { id: 'kp-4-20', name: '明清文化', description: '四大名著《红楼梦》《西游记》《水浒传》《三国演义》。' }
      ]
    }
  };
  return dataMap[unitId];
}
