export interface MapRegion {
  id: string;
  name: string;
  type: 'country' | 'province' | 'city' | 'landform' | 'climate_zone' | 'region';
  location: string;
  terrain: string;
  climate: string;
  hydrology: string;
  resources: string[];
  economy: string;
  parentId?: string;
}

export interface GeographyCardItem {
  id: string;
  type: 'climate' | 'landform' | 'region' | 'concept' | 'current' | 'vegetation';
  title: string;
  front: string;
  back: string;
  chapterId: string;
  tags: string[];
}

export interface LocationAnalysisCase {
  id: string;
  type: 'agriculture' | 'industry' | 'city' | 'ecology';
  region: string;
  question: string;
  framework: {
    natural: string[];
    human: string[];
    causes: string[];
    effects: string[];
    measures: string[];
  };
  referenceAnswer: string;
}

export interface PracticeSource {
  id: string;
  title: string;
  chapterId: string;
  difficulty: '简单' | '中等' | '困难';
  material: string;
  source: string;
  questions: PracticeQuestion[];
}

export interface PracticeQuestion {
  id: number;
  type: 'phenomenon' | 'cause' | 'effect' | 'measure';
  question: string;
  expectedKeywords: string[];
  modelAnswer: string;
  hints: string[];
}

export const LIAONING_REGIONS: MapRegion[] = [
  {
    id: 'liaohe-plain',
    name: '辽河平原',
    type: 'landform',
    location: '辽宁省中部，辽河下游',
    terrain: '冲积平原，地势低平，海拔多在50米以下',
    climate: '温带季风气候，夏季高温多雨，冬季寒冷干燥',
    hydrology: '辽河、浑河、太子河等河流流经，水资源丰富',
    resources: ['黑土', '水稻', '玉米', '石油'],
    economy: '辽宁省重要商品粮基地，农业发达',
    parentId: 'liaoning',
  },
  {
    id: 'liaodong-hill',
    name: '辽东丘陵',
    type: 'landform',
    location: '辽宁省东部',
    terrain: '低山丘陵，海拔200-500米，森林覆盖率高',
    climate: '温带季风气候，受海洋影响较大，降水较丰富',
    hydrology: '河流短小湍急，水能资源丰富',
    resources: ['柞蚕', '苹果', '木材', '铁矿'],
    economy: '林果业发达，柞蚕茧产量居全国之首',
    parentId: 'liaoning',
  },
  {
    id: 'liaoxi-hill',
    name: '辽西丘陵',
    type: 'landform',
    location: '辽宁省西部',
    terrain: '低山丘陵，海拔100-500米，地势起伏',
    climate: '温带大陆性季风气候，降水较少，干旱频发',
    hydrology: '河流较少，水资源短缺',
    resources: ['煤炭', '铁矿石', '水土保持林'],
    economy: '生态环境脆弱，生态治理重点区域',
    parentId: 'liaoning',
  },
  {
    id: 'liaozhongnan-industrial',
    name: '辽中南工业基地',
    type: 'region',
    location: '辽宁省中南部，沈阳、大连、鞍山为中心',
    terrain: '以平原和丘陵为主，地势平坦',
    climate: '温带季风气候',
    hydrology: '辽河、太子河、大凌河等河流',
    resources: ['煤炭', '铁矿', '石油', '海盐'],
    economy: '中国重要老工业基地，重工业为主',
    parentId: 'liaoning',
  },
  {
    id: 'liaoning-coastal',
    name: '辽东半岛沿海',
    type: 'region',
    location: '辽宁省东南部，大连、营口、丹东沿海',
    terrain: '丘陵台地，海岸线曲折',
    climate: '温带季风气候，受海洋调节明显',
    hydrology: '海岸线长，港口众多',
    resources: ['港口', '渔业', '旅游', '石油化工'],
    economy: '海洋经济发达，港口城市群',
    parentId: 'liaoning',
  },
  {
    id: 'khorchin-sand',
    name: '科尔沁沙地南缘',
    type: 'landform',
    location: '辽宁省西北部，与内蒙古交界',
    terrain: '沙地地貌，风沙活动频繁',
    climate: '温带大陆性季风气候，干旱少雨',
    hydrology: '地表水缺乏，地下水埋藏深',
    resources: ['风能', '草场'],
    economy: '生态脆弱区，重点治理区',
    parentId: 'liaoning',
  },
];

export const GEOGRAPHY_CARDS: GeographyCardItem[] = [
  {
    id: 'card-thermal-circulation',
    type: 'concept',
    title: '热力环流',
    front: '热力环流',
    back: '定义：由于地面冷热不均而形成的空气环流\n原理：受热处空气膨胀上升，冷却处空气收缩下沉\n应用：海陆风、山谷风、城市热岛效应\n辽宁案例：大连滨海风、辽东湾海陆风',
    chapterId: 'compulsory-1',
    tags: ['大气', '必修一', '高频'],
  },
  {
    id: 'card-three-circle',
    type: 'concept',
    title: '三圈环流',
    front: '三圈环流',
    back: '组成：哈德莱环流、费雷尔环流、极地环流\n气压带：赤道低气压带、副热带高气压带、副极地低气压带、极地高气压带\n风带：信风带、西风带、极地东风带\n辽宁位置：中纬度西风带影响',
    chapterId: 'compulsory-1',
    tags: ['大气', '必修一', '高频'],
  },
  {
    id: 'card-liaohe-plain',
    type: 'region',
    title: '辽河平原',
    front: '辽河平原',
    back: '位置：辽宁省中部，辽河下游\n特征：冲积平原，地势低平，黑土肥沃\n气候：温带季风气候，雨热同期\n农业：水稻、玉米主产区，商品粮基地\n问题：黑土退化、水资源短缺',
    chapterId: 'compulsory-2',
    tags: ['区域', '辽宁', '农业'],
  },
  {
    id: 'card-liaozhongnan',
    type: 'region',
    title: '辽中南工业基地',
    front: '辽中南工业基地',
    back: '位置：辽宁省中南部\n资源：煤、铁、石油丰富\n工业：钢铁、机械、化工、造船\n特点：中国重要老工业基地\n问题：资源枯竭、产业结构单一、环境污染\n转型方向：高新技术产业、现代服务业',
    chapterId: 'compulsory-2',
    tags: ['工业', '辽宁', '区位'],
  },
  {
    id: 'card-agricultural-location',
    type: 'concept',
    title: '农业区位因素',
    front: '农业区位因素',
    back: '自然因素：气候（光照、热量、降水）、地形、土壤、水源\n人文因素：市场、交通、政策、科技、劳动力、历史\n辽宁案例：辽河平原发展水稻种植的自然条件（温带季风、黑土、水源充足）和人文条件（市场需求大、交通便利）',
    chapterId: 'compulsory-2',
    tags: ['农业', '区位', '必考'],
  },
  {
    id: 'card-industrial-location',
    type: 'concept',
    title: '工业区位因素',
    front: '工业区位因素',
    back: '自然因素：原料、燃料、土地、水源\n人文因素：市场、交通、劳动力、技术、政策、环境\n主导因素变化：原料→市场→技术→环境\n辽中南案例：早期依赖煤铁资源，后期需转型发展高新技术产业',
    chapterId: 'compulsory-2',
    tags: ['工业', '区位', '必考'],
  },
];

export const LOCATION_ANALYSIS_CASES: LocationAnalysisCase[] = [
  {
    id: 'case-liaohe-rice',
    type: 'agriculture',
    region: '辽河平原水稻种植',
    question: '分析辽河平原发展水稻种植业的区位条件',
    framework: {
      natural: ['气候：温带季风，雨热同期', '地形：平原，地势平坦', '土壤：黑土肥沃', '水源：辽河等河流提供灌溉'],
      human: ['市场：人口密集，市场需求大', '交通：铁路公路网密集', '政策：国家商品粮基地政策', '科技：农业技术推广'],
      causes: ['自然条件优越，适合水稻生长', '市场需求旺盛', '政策支持'],
      effects: ['成为中国重要商品粮基地', '带动相关产业发展', '增加农民收入'],
      measures: ['推广节水灌溉', '培育优良品种', '保护黑土资源', '发展现代农业'],
    },
    referenceAnswer: '自然因素：辽河平原属于温带季风气候，夏季高温多雨，雨热同期；地势平坦，土壤肥沃（黑土）；有辽河等河流提供灌溉水源。人文因素：人口密集，粮食市场需求量大；交通便利，便于农产品运输；国家政策支持商品粮基地建设。这些条件使辽河平原成为中国重要的水稻主产区。',
  },
  {
    id: 'case-liaozhongnan-industry',
    type: 'industry',
    region: '辽中南工业基地',
    question: '分析辽中南工业基地的区位条件及转型方向',
    framework: {
      natural: ['资源：煤、铁、石油丰富', '土地：平原，地势平坦', '水源：河流众多'],
      human: ['交通：铁路公路海运便利', '劳动力：人口密集，劳动力充足', '历史：工业基础好', '市场：市场广阔'],
      causes: ['资源丰富，工业原料充足', '交通便利，利于产品运输', '工业历史悠久，基础雄厚'],
      effects: ['成为中国重要老工业基地', '推动区域经济发展', '但也面临资源枯竭、环境污染等问题'],
      measures: ['发展高新技术产业', '改造传统产业', '治理环境污染', '发展现代服务业'],
    },
    referenceAnswer: '自然因素：辽中南地区煤、铁、石油等矿产资源丰富；地势平坦，土地资源充足；河流众多，水源充足。人文因素：交通便利（铁路、公路、海运发达）；人口密集，劳动力丰富；工业历史悠久，基础雄厚；市场广阔。这些因素使其成为中国重要的老工业基地。当前面临资源枯竭、产业结构单一等问题，需向高新技术产业和服务业转型。',
  },
];

export const CHAPTERS = {
  'compulsory-1': '必修第一册',
  'compulsory-2': '必修第二册',
  'selective-1': '选择性必修一',
  'selective-2': '选择性必修二',
  'selective-3': '选择性必修三',
};

export const CHAPTER_TITLES: Record<string, string> = {
  'compulsory-1': '必修第一册（自然地理）',
  'compulsory-2': '必修第二册（人文地理）',
  'selective-1': '选择性必修一（自然地理进阶）',
  'selective-2': '选择性必修二（区域发展）',
  'selective-3': '选择性必修三（资源环境与国家安全）',
};
