export interface KeySentence {
  sentence: string;
  translation: string;
  highlight?: string;
}

export interface RecitationPoem {
  id: string;
  title: string;
  dynasty: string;
  author: string;
  text: string;
  keySentences: KeySentence[];
  fromSection: string;
  isRequired: boolean;
}

export const RECITATION_POEMS: RecitationPoem[] = [
  {
    id: 'quanxue',
    title: '劝学',
    dynasty: '先秦',
    author: '荀子',
    fromSection: '必修上册',
    isRequired: true,
    text: `君子曰：学不可以已。青，取之于蓝，而青于蓝；冰，水为之，而寒于水。木直中绳，輮以为轮，其曲中规。虽有槁暴，不复挺者，輮使之然也。故木受绳则直，金就砺则利，君子博学而日参省乎己，则知明而行无过矣。

吾尝终日而思矣，不如须臾之所学也；吾尝跂而望矣，不如登高之博见也。登高而招，臂非加长也，而见者远；顺风而呼，声非加疾也，而闻者彰。假舆马者，非利足也，而致千里；假舟楫者，非能水也，而绝江河。君子生非异也，善假于物也。

南方有鸟焉，名曰蒙鸠，以羽为巢，而编之以发，系之苇苕，风至苕折，卵破子死。巢非不完也，所系者然也。西方有木焉，名曰射干，茎长四寸，生于高山之上，而临百仞之渊，木茎非能长也，所立者然也。蓬生麻中，不扶而直；白沙在涅，与之俱黑。兰槐之根是为芷，其渐之滫，君子不近，庶人不服。其质非不美也，所渐者然也。故君子居必择乡，游必就士，所以防邪辟而近中正也。

故不登高山，不知天之高也；不临深溪，不知地之厚也；不闻先王之遗言，不知学问之大也。干、越、夷、貉之子，生而同声，长而异俗，教使之然也。诗云：“嗟尔君子，无恒安息。靖共尔位，好是正直。神之听之，介尔景福。”神莫大于化道，福莫长于无祸。`,
    keySentences: [
      { sentence: '学不可以已', translation: '学习不可以停止' },
      { sentence: '青，取之于蓝，而青于蓝', translation: '靛青从蓝草中提取，却比蓝草更青' },
      { sentence: '冰，水为之，而寒于水', translation: '冰是水凝结而成，却比水更寒冷' },
      { sentence: '木受绳则直，金就砺则利', translation: '木材经墨线校正就笔直，刀剑在磨刀石上磨过就锋利' },
      { sentence: '君子博学而日参省乎己，则知明而行无过矣', translation: '君子广泛学习并且每天反省自己，就会智慧明达，行为没有过错' },
      { sentence: '吾尝终日而思矣，不如须臾之所学也', translation: '我曾经整天思索，不如片刻学习收获大' },
      { sentence: '吾尝跂而望矣，不如登高之博见也', translation: '我曾经踮起脚远望，不如登到高处见得广' },
      { sentence: '君子生非异也，善假于物也', translation: '君子本性同一般人没有差别，只是善于借助外物' },
      { sentence: '假舆马者，非利足也，而致千里', translation: '借助车马的人，并不是脚走得快，却能到达千里之外' },
      { sentence: '假舟楫者，非能水也，而绝江河', translation: '借助船只的人，并不是会游泳，却能横渡江河' },
      { sentence: '蓬生麻中，不扶而直', translation: '蓬草长在麻丛中，不用扶持就长得直' },
      { sentence: '白沙在涅，与之俱黑', translation: '白沙混进黑土，就会和黑土一样黑' },
      { sentence: '故君子居必择乡，游必就士', translation: '所以君子居住要选择乡里，交游要接近贤士' },
      { sentence: '不登高山，不知天之高也', translation: '不登上高山，就不知道天有多高' },
      { sentence: '不闻先王之遗言，不知学问之大也', translation: '没听到古代圣王的遗言，就不知道学问的广博' },
      { sentence: '君子生非异也，善假于物也', translation: '君子本性没有不同，只是善于借助外物' },
      { sentence: '蚓无爪牙之利，筋骨之强，上食埃土，下饮黄泉，用心一也', translation: '蚯蚓没有锋利的爪牙，强健的筋骨，却能上吃泥土，下饮地下水，这是用心专一的缘故' },
      { sentence: '蟹六跪而二螯，非蛇鳝之穴无可寄托者，用心躁也', translation: '螃蟹有六条腿两只钳，却只能住在蛇鳝的洞穴中，这是用心浮躁的缘故' },
    ],
  },
  {
    id: 'chishi',
    title: '赤壁赋',
    dynasty: '宋',
    author: '苏轼',
    fromSection: '必修上册',
    isRequired: true,
    text: `壬戌之秋，七月既望，苏子与客泛舟游于赤壁之下。清风徐来，水波不兴。举酒属客，诵明月之诗，歌窈窕之章。少焉，月出于东山之上，徘徊于斗牛之间。白露横江，水光接天。纵一苇之所如，凌万顷之茫然。浩浩乎如冯虚御风，而不知其所止；飘飘乎如遗世独立，羽化而登仙。

于是饮酒乐甚，扣舷而歌之。歌曰：“桂棹兮兰桨，击空明兮溯流光。渺渺兮予怀，望美人兮天一方。”客有吹洞箫者，倚歌而和之。其声呜呜然，如怨如慕，如泣如诉，余音袅袅，不绝如缕。舞幽壑之潜蛟，泣孤舟之嫠妇。

苏子愀然，正襟危坐而问客曰：“何为其然也？”客曰：“‘月明星稀，乌鹊南飞’，此非曹孟德之诗乎？西望夏口，东望武昌，山川相缪，郁乎苍苍，此非孟德之困于周郎者乎？方其破荆州，下江陵，顺流而东也，舳舻千里，旌旗蔽空，酾酒临江，横槊赋诗，固一世之雄也，而今安在哉？况吾与子渔樵于江渚之上，侣鱼虾而友麋鹿，驾一叶之扁舟，举匏樽以相属。寄蜉蝣于天地，渺沧海之一粟。哀吾生之须臾，羡长江之无穷。挟飞仙以遨游，抱明月而长终。知不可乎骤得，托遗响于悲风。”

苏子曰：“客亦知夫水与月乎？逝者如斯，而未尝往也；盈虚者如彼，而卒莫消长也。盖将自其变者而观之，则天地曾不能以一瞬；自其不变者而观之，则物与我皆无尽也，而又何羡乎！且夫天地之间，物各有主，苟非吾之所有，虽一毫而莫取。惟江上之清风，与山间之明月，耳得之而为声，目遇之而成色，取之无禁，用之不竭。是造物者之无尽藏也，而吾与子之所共适。”

客喜而笑，洗盏更酌。肴核既尽，杯盘狼籍。相与枕藉乎舟中，不知东方之既白。`,
    keySentences: [
      { sentence: '清风徐来，水波不兴', translation: '清风缓缓吹来，水面波纹不兴' },
      { sentence: '白露横江，水光接天', translation: '白茫茫的水气横贯江面，水光与天相接' },
      { sentence: '纵一苇之所如，凌万顷之茫然', translation: '任凭小船漂去，越过那茫茫万顷江面' },
      { sentence: '浩浩乎如冯虚御风，而不知其所止', translation: '浩浩荡荡像凌空驾风，不知要到哪里才停' },
      { sentence: '飘飘乎如遗世独立，羽化而登仙', translation: '飘飘然像脱离尘世，飞升成仙' },
      { sentence: '其声呜呜然，如怨如慕，如泣如诉', translation: '箫声呜呜咽咽，像怨恨又像思慕，像哭泣又像倾诉' },
      { sentence: '舞幽壑之潜蛟，泣孤舟之嫠妇', translation: '能使深谷中的蛟龙起舞，使孤舟上的寡妇哭泣' },
      { sentence: '方其破荆州，下江陵，顺流而东也', translation: '当他攻破荆州，拿下江陵，顺江东下的时候' },
      { sentence: '舳舻千里，旌旗蔽空', translation: '战船千里相连，旗帜遮蔽天空' },
      { sentence: '酾酒临江，横槊赋诗', translation: '面对大江斟酒，横握长矛吟诗' },
      { sentence: '寄蜉蝣于天地，渺沧海之一粟', translation: '像蜉蝣一样寄托在天地之间，渺小得像大海里的一粒粟米' },
      { sentence: '哀吾生之须臾，羡长江之无穷', translation: '哀叹我们生命的短暂，羡慕长江的无穷无尽' },
      { sentence: '挟飞仙以遨游，抱明月而长终', translation: '希望同仙人遨游，与明月长存' },
      { sentence: '逝者如斯，而未尝往也', translation: '流去的水像这样不断流去，但实际并没有流走' },
      { sentence: '盈虚者如彼，而卒莫消长也', translation: '时圆时缺的月亮像那样，但最终没有消减或增长' },
      { sentence: '自其变者而观之，则天地曾不能以一瞬', translation: '从变化的一面看，天地万物连一眨眼的功夫都不能保持不变' },
      { sentence: '自其不变者而观之，则物与我皆无尽也', translation: '从不变的一面看，万物和我们都永恒无穷' },
      { sentence: '惟江上之清风，与山间之明月', translation: '只有江上的清风，和山间的明月' },
      { sentence: '取之无禁，用之不竭', translation: '取用不尽，享用不完' },
    ],
  },
];

export function getRecitationPoemById(id: string): RecitationPoem | undefined {
  return RECITATION_POEMS.find((p) => p.id === id);
}

export function getRequiredPoems(): RecitationPoem[] {
  return RECITATION_POEMS.filter((p) => p.isRequired);
}
