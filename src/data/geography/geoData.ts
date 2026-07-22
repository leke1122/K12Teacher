/**
 * 地理数据：包含中国地形区域信息和世界气候洋流数据
 */

// ===== 中国地图数据类型 =====

export interface ChinaProvinceData {
  name: string;           // 全称
  shortName: string;       // 简称
  capital: string;        // 行政中心
  temperatureZone: string; // 温度带
  humidityZone: string;    // 干湿区
  terrain: string;        // 主要地形
  features: string[];     // 地形特征描述
  resources: string[];    // 主要资源
  economy: string;        // 经济特征
  gaokaoPoints?: string[]; // 高考考点（辽宁省份有）
  rivers?: string[];      // 主要河流
  mountains?: string[];   // 主要山脉
}

export interface ChinaTerrainMark {
  name: string;
  coord: [number, number];
  description: string;
  type: 'plain' | 'mountain' | 'plateau' | 'basin' | 'river' | 'hills';
}

export interface WorldOceanCurrent {
  name: string;
  type: 'warm' | 'cold';
  startCoord: [number, number];
  endCoord: [number, number];
  description: string;
}

export interface WorldClimateZone {
  name: string;
  color: string;
  countries: string[];
  features: string;
  cause: string;
  gaokaoPoints?: string;
}

// ===== 中国省份数据 =====

export const chinaProvincesData: Record<string, ChinaProvinceData> = {
  '辽宁': {
    name: '辽宁省',
    shortName: '辽',
    capital: '沈阳',
    temperatureZone: '中温带',
    humidityZone: '半湿润区',
    terrain: '山地丘陵分列东西，平原中部三分天下',
    features: ['辽东丘陵（长白山余脉）', '辽西低山丘陵', '辽河平原（东北平原南部）', '辽东半岛'],
    resources: ['鞍山/本溪铁矿', '辽河油田', '硼矿（丹东）', '菱镁矿（营口）'],
    economy: '老工业基地转型升级，沿海经济带发展迅速',
    gaokaoPoints: [
      '辽河平原农业发展（水稻种植、商品粮基地）',
      '鞍山/本溪矿产资源与钢铁工业',
      '沿海经济带（大连、丹东、营口、锦州）',
      '辽东半岛气候与港口优势',
      '长白山余脉林业与生态保护',
      '辽河治理与湿地保护',
    ],
    rivers: ['辽河', '浑河', '太子河', '大辽河'],
    mountains: ['长白山', '医巫闾山', '努鲁儿虎山'],
  },
  '黑龙江': {
    name: '黑龙江省',
    shortName: '黑',
    capital: '哈尔滨',
    temperatureZone: '中温带/寒温带',
    humidityZone: '半湿润区/湿润区',
    terrain: '西北高、东南低，呈山地、平原、水面三级阶梯',
    features: ['大兴安岭', '小兴安岭', '松嫩平原', '三江平原'],
    resources: ['石油（大庆油田）', '煤炭（鹤岗/双鸭山）', '森林资源', '耕地资源'],
    economy: '全国重要的商品粮基地和能源基地',
    rivers: ['黑龙江', '松花江', '乌苏里江', '嫩江'],
    mountains: ['大兴安岭', '小兴安岭', '张广才岭'],
  },
  '吉林': {
    name: '吉林省',
    shortName: '吉',
    capital: '长春',
    temperatureZone: '中温带',
    humidityZone: '半湿润区',
    terrain: '东南高、西北低',
    features: ['长白山', '松嫩平原', '东部山地'],
    resources: ['长白山自然保护区', '松花江水电', '玉米种植带', '人参/鹿茸'],
    economy: '汽车产业（长春）、农业（玉米之乡）',
    gaokaoPoints: ['长白山垂直自然带', '松花江流域水文特征', '东北平原农业条件'],
    rivers: ['松花江', '图们江', '鸭绿江'],
    mountains: ['长白山', '吉林哈达岭'],
  },
  '北京': {
    name: '北京市',
    shortName: '京',
    capital: '北京',
    temperatureZone: '暖温带',
    humidityZone: '半湿润区',
    terrain: '西北高、东南低',
    features: ['华北平原西北缘', '西北部为山地', '东南部为平原'],
    resources: ['人力资源', '科技资源'],
    economy: '全国政治文化中心，高新技术产业',
    gaokaoPoints: ['城市职能分散', '京津冀协同发展'],
  },
  '天津': {
    name: '天津市',
    shortName: '津',
    capital: '天津',
    temperatureZone: '暖温带',
    humidityZone: '半湿润区',
    terrain: '华北平原东部，海河入海口',
    features: ['海河平原', '滨海平原'],
    resources: ['港口资源', '盐场'],
    economy: '北方航运中心，先进制造业',
    gaokaoPoints: ['港口区位优势', '海河水系'],
  },
  '河北': {
    name: '河北省',
    shortName: '冀',
    capital: '石家庄',
    temperatureZone: '暖温带',
    humidityZone: '半湿润区/半干旱区',
    terrain: '西北高、东南低',
    features: ['坝上高原', '燕山', '华北平原'],
    resources: ['钢铁（唐山）', '煤炭', '华北油田'],
    economy: '钢铁、建材重工业',
    gaokaoPoints: ['华北平原农业区位', '资源型经济转型', '雄安新区'],
    rivers: ['海河', '滦河'],
    mountains: ['燕山', '太行山', '坝上高原'],
  },
  '山东': {
    name: '山东省',
    shortName: '鲁',
    capital: '济南',
    temperatureZone: '暖温带',
    humidityZone: '半湿润区',
    terrain: '中部突起，为鲁中南山地丘陵',
    features: ['山东丘陵', '华北平原', '黄河三角洲'],
    resources: ['胜利油田', '黄金', '海盐', '果品'],
    economy: '农业大省，工业基础好，海洋经济',
    gaokaoPoints: ['区域农业可持续发展', '海洋强国战略'],
    rivers: ['黄河', '京杭大运河', '沂河'],
    mountains: ['泰山', '鲁山', '昆嵛山'],
  },
  '山西': {
    name: '山西省',
    shortName: '晋',
    capital: '太原',
    temperatureZone: '暖温带',
    humidityZone: '半干旱区',
    terrain: '黄土覆盖的高原',
    features: ['黄土高原', '汾河谷地', '太行山脉'],
    resources: ['煤炭（储量大）', '铝土', '铁矿'],
    economy: '能源重化工业，正在转型',
    gaokaoPoints: ['黄土高原水土流失', '能源基地建设与环境保护', '产业转型升级'],
    rivers: ['汾河', '黄河'],
    mountains: ['太行山', '吕梁山', '恒山'],
  },
  '内蒙古': {
    name: '内蒙古自治区',
    shortName: '内蒙古',
    capital: '呼和浩特',
    temperatureZone: '中温带',
    humidityZone: '干旱区/半干旱区',
    terrain: '高原地形，辽阔坦荡',
    features: ['内蒙古高原', '大兴安岭', '鄂尔多斯高原'],
    resources: ['煤炭', '稀土', '天然气', '草原'],
    economy: '畜牧业，能源工业',
    gaokaoPoints: ['草原生态保护', '能源开发与环境保护', '荒漠化防治'],
    rivers: ['黄河', '额尔古纳河', '弱水'],
    mountains: ['大兴安岭', '阴山', '贺兰山'],
  },
  '陕西': {
    name: '陕西省',
    shortName: '陕/秦',
    capital: '西安',
    temperatureZone: '暖温带/亚热带',
    humidityZone: '半湿润区/半干旱区',
    terrain: '南北高、中间低',
    features: ['陕北高原', '关中平原', '秦巴山区'],
    resources: ['煤炭', '天然气', '石油'],
    economy: '航空航天、电子信息',
    gaokaoPoints: ['黄土高原治理', '秦岭生态保护', '区域协调发展'],
    rivers: ['黄河', '渭河', '汉江'],
    mountains: ['秦岭', '大巴山', '华山'],
  },
  '河南': {
    name: '河南省',
    shortName: '豫',
    capital: '郑州',
    temperatureZone: '暖温带/亚热带',
    humidityZone: '半湿润区',
    terrain: '地势西高东低',
    features: ['华北平原', '南阳盆地', '山地丘陵'],
    resources: ['耕地资源', '人力资源'],
    economy: '全国重要的粮食生产核心区，交通枢纽',
    gaokaoPoints: ['中原经济区', '南水北调', '粮食生产安全'],
    rivers: ['黄河', '淮河', '海河', '长江（支流汉江）'],
    mountains: ['伏牛山', '大别山', '太行山'],
  },
  '江苏': {
    name: '江苏省',
    shortName: '苏',
    capital: '南京',
    temperatureZone: '亚热带',
    humidityZone: '湿润区',
    terrain: '地势低平',
    features: ['长江三角洲', '江淮平原', '里下河平原'],
    resources: ['水系发达', '淡水养殖', '滩涂资源'],
    economy: '经济强省，制造业发达',
    gaokaoPoints: ['长三角一体化', '沿江开发与保护'],
    rivers: ['长江', '淮河', '京杭大运河', '太湖'],
  },
  '四川': {
    name: '四川省',
    shortName: '川/蜀',
    capital: '成都',
    temperatureZone: '亚热带/高原气候区',
    humidityZone: '湿润区/半湿润区',
    terrain: '西高东低，地形复杂',
    features: ['川西高原', '四川盆地', '山地高原'],
    resources: ['水能资源', '矿产资源', '生物资源'],
    economy: '电子信息、装备制造',
    gaokaoPoints: ['长江上游生态屏障', '横断山区垂直带谱', '都江堰水利工程'],
    rivers: ['长江', '金沙江', '雅砻江', '岷江', '嘉陵江'],
    mountains: ['贡嘎山', '峨眉山', '邛崃山'],
  },
  '广东': {
    name: '广东省',
    shortName: '粤',
    capital: '广州',
    temperatureZone: '热带/亚热带',
    humidityZone: '湿润区',
    terrain: '北高南低',
    features: ['珠江三角洲', '山地丘陵', '沿海平原'],
    resources: ['侨乡优势', '海洋资源', '热带作物'],
    economy: '经济第一大省，外贸出口',
    gaokaoPoints: ['粤港澳大湾区', '外向型经济', '珠三角城市群'],
    rivers: ['珠江', '韩江', '鉴江'],
    mountains: ['南岭', '丹霞山'],
  },
  '上海': {
    name: '上海市',
    shortName: '沪',
    capital: '上海',
    temperatureZone: '亚热带',
    humidityZone: '湿润区',
    terrain: '长江入海口，平均海拔4米',
    features: ['长江三角洲', '河网密布'],
    resources: ['港口资源', '人才资源'],
    economy: '国际经济/金融/贸易/航运中心',
    gaokaoPoints: ['长三角龙头', '城市群辐射作用'],
    rivers: ['黄浦江', '长江'],
  },
  '浙江': {
    name: '浙江省',
    shortName: '浙',
    capital: '杭州',
    temperatureZone: '亚热带',
    humidityZone: '湿润区',
    terrain: '七山一水两分田',
    features: ['浙东丘陵', '杭嘉湖平原', '沿海平原'],
    resources: ['海洋资源', '森林资源'],
    economy: '数字经济发达，民营经济活跃',
    gaokaoPoints: ['海洋经济发展', '义乌小商品', '数字经济'],
    rivers: ['钱塘江', '瓯江', '苕溪'],
    mountains: ['天目山', '雁荡山', '武夷山'],
  },
};

// 中国地形标注数据
export const chinaTerrainMarks: ChinaTerrainMark[] = [
  { name: '东北平原', coord: [127, 46], description: '中国最大平原，由松嫩平原、辽河平原、三江平原组成', type: 'plain' },
  { name: '长白山', coord: [128, 42], description: '辽东丘陵主脉，休眠火山，天池', type: 'mountain' },
  { name: '辽东丘陵', coord: [122, 40.5], description: '长白山余脉，林业为主', type: 'hills' },
  { name: '辽河平原', coord: [123, 43], description: '东北平原南部，辽宁省商品粮基地', type: 'plain' },
  { name: '大兴安岭', coord: [121, 51], description: '东北地区重要地理分界线', type: 'mountain' },
  { name: '小兴安岭', coord: [129, 48], description: '黑龙江与松嫩水系分水岭', type: 'mountain' },
  { name: '太行山', coord: [113, 38], description: '华北平原与黄土高原分界线', type: 'mountain' },
  { name: '秦岭', coord: [108, 34], description: '中国南北方分界线之一', type: 'mountain' },
  { name: '淮河', coord: [115, 33], description: '中国南北方分界线之一', type: 'river' },
  { name: '黄土高原', coord: [108, 37], description: '世界最大黄土覆盖区，水土流失严重', type: 'plateau' },
  { name: '华北平原', coord: [116, 37], description: '中国第二大平原，人口密集', type: 'plain' },
  { name: '山东丘陵', coord: [120, 36], description: '山东省中部山地', type: 'hills' },
  { name: '四川盆地', coord: [105, 30], description: '紫色土盆地，天府之国', type: 'basin' },
  { name: '青藏高原', coord: [90, 32], description: '世界最高最大高原，"世界屋脊"', type: 'plateau' },
  { name: '内蒙古高原', coord: [108, 43], description: '中国第二大高原，草原牧场', type: 'plateau' },
  { name: '云贵高原', coord: [104, 26], description: '喀斯特地貌典型发育区', type: 'plateau' },
  { name: '长江中下游平原', coord: [115, 30], description: '鱼米之乡，河网密布', type: 'plain' },
  { name: '珠江三角洲', coord: [113, 23], description: '中国第三大经济体，外向型经济', type: 'plain' },
  { name: '辽河', coord: [122, 43], description: '辽宁母亲河，辽河平原灌溉水源', type: 'river' },
  { name: '黄河', coord: [110, 37], description: '中华母亲河，含沙量大', type: 'river' },
  { name: '长江', coord: [112, 30], description: '中国第一长河，世界第三', type: 'river' },
  { name: '松花江', coord: [128, 47], description: '黑龙江最大支流', type: 'river' },
  { name: '渤海', coord: [119, 38], description: '中国最北端内海，辽宁省沿海', type: 'river' },
];

// 黄河、长江、淮河等主要河流
export const chinaMajorRivers = [
  { name: '黄河', color: '#8B4513', coords: [[105, 35], [110, 36], [115, 35], [118, 34], [120, 32]] },
  { name: '长江', color: '#4169E1', coords: [[90, 33], [100, 33], [110, 32], [118, 32], [121, 31]] },
  { name: '淮河', color: '#20B2AA', coords: [[112, 33], [115, 33], [118, 33], [120, 33]] },
  { name: '辽河', color: '#708090', coords: [[120, 44], [122, 43], [122, 41], [122, 40]] },
  { name: '松花江', color: '#87CEEB', coords: [[128, 44], [128, 46], [129, 48], [130, 48]] },
  { name: '珠江', color: '#008B8B', coords: [[105, 25], [110, 25], [113, 23], [116, 22], [117, 22]] },
];

// ===== 世界地图数据类型 =====

export const worldOceanCurrents: WorldOceanCurrent[] = [
  // 太平洋暖流
  { name: '日本暖流', type: 'warm', startCoord: [140, 35], endCoord: [160, 45], description: '北太平洋西部最强暖流，影响日本、朝鲜半岛气候' },
  { name: '北太平洋暖流', type: 'warm', startCoord: [160, 40], endCoord: [-130, 45], description: '北太平洋表层环流西风漂流段' },
  { name: '阿拉斯加暖流', type: 'warm', startCoord: [-130, 55], endCoord: [-125, 60], description: '影响阿拉斯加沿海气候' },
  { name: '东澳大利亚暖流', type: 'warm', startCoord: [150, -25], endCoord: [175, -35], description: '影响澳大利亚东海岸' },
  // 太平洋寒流
  { name: '千岛寒流', type: 'cold', startCoord: [155, 50], endCoord: [165, 45], description: '北太平洋西部寒流，与日本暖流交汇形成渔场' },
  { name: '加利福尼亚寒流', type: 'cold', startCoord: [-130, 50], endCoord: [-115, 25], description: '北美洲西海岸，影响沙漠气候分布' },
  { name: '秘鲁寒流', type: 'cold', startCoord: [-80, -5], endCoord: [-80, -20], description: '世界上最强大的寒流，形成秘鲁渔场' },
  { name: '西风漂流（太平洋段）', type: 'cold', startCoord: [-180, -50], endCoord: [-70, -50], description: '南半球高纬度西风带形成的寒流' },
  // 大西洋暖流
  { name: '北大西洋暖流', type: 'warm', startCoord: [-80, 30], endCoord: [-10, 55], description: '对西欧和北欧气候有重要调节作用，是重要考点' },
  { name: '墨西哥湾暖流', type: 'warm', startCoord: [-90, 25], endCoord: [-80, 30], description: '北大西洋暖流的重要源头' },
  { name: '巴西暖流', type: 'warm', startCoord: [-50, -10], endCoord: [-35, -30], description: '南大西洋西岸暖流' },
  // 大西洋寒流
  { name: '拉布拉多寒流', type: 'cold', startCoord: [-70, 65], endCoord: [-60, 45], description: '从北冰洋向南流动，与墨西哥湾暖流交汇' },
  { name: '加那利寒流', type: 'cold', startCoord: [-20, 30], endCoord: [-10, 15], description: '北非西海岸，影响撒哈拉沙漠气候' },
  { name: '本格拉寒流', type: 'cold', startCoord: [-5, -5], endCoord: [-15, -25], description: '西南非洲海岸，影响纳米布沙漠气候' },
  { name: '马尔维纳斯寒流', type: 'cold', startCoord: [-60, -50], endCoord: [-55, -40], description: '南大西洋西风漂流分支' },
  // 印度洋洋流
  { name: '索马里暖流', type: 'warm', startCoord: [45, 10], endCoord: [52, 0], description: '夏季顺时针环流形成，冬季逆流' },
  { name: '莫桑比克暖流', type: 'warm', startCoord: [40, -10], endCoord: [45, -25], description: '非洲东海岸南向暖流' },
  { name: '西澳大利亚寒流', type: 'cold', startCoord: [110, -25], endCoord: [115, -35], description: '影响澳大利亚西海岸荒漠气候' },
];

export const worldClimateZones: WorldClimateZone[] = [
  {
    name: '热带雨林气候',
    color: '#006400',
    countries: ['巴西（亚马逊）', '刚果（金）', '印度尼西亚', '马来西亚', '巴布亚新几内亚'],
    features: '全年高温多雨，年均温25-28°C，年降水量2000mm以上',
    cause: '赤道低气压带控制，盛行上升气流，对流雨频繁',
    gaokaoPoints: '热带雨林生态脆弱性保护、热带雨林分布规律',
  },
  {
    name: '热带草原气候',
    color: '#9ACD32',
    countries: ['非洲中部（萨瓦纳带）', '南美洲（巴西高原）', '澳大利亚北部', '印度半岛'],
    features: '全年高温，干湿季分明，年降水量750-1000mm',
    cause: '赤道低气压带与信风带交替控制',
    gaokaoPoints: '热带草原动物迁徙规律、热带草原与热带雨林对比',
  },
  {
    name: '热带沙漠气候',
    color: '#F4A460',
    countries: ['撒哈拉沙漠', '阿拉伯半岛', '澳大利亚内陆', '中亚地区', '南美洲西海岸（阿塔卡马）'],
    features: '全年炎热干燥，日较差大，年降水量不足250mm',
    cause: '副热带高气压带控制，气流下沉，降水少；寒流降温减湿（沿海沙漠）',
    gaokaoPoints: '撒哈拉沙漠扩张原因、荒漠化成因与防治',
  },
  {
    name: '地中海气候',
    color: '#FFD700',
    countries: ['地中海沿岸（欧洲南部）', '美国加州', '澳大利亚南部', '智利中部', '南非开普敦'],
    features: '夏季炎热干燥，冬季温和多雨，年降水量300-1000mm',
    cause: '夏季受副热带高气压带控制，冬季受西风带控制',
    gaokaoPoints: '地中海气候分布规律（南北纬30-40度大陆西岸）、气候成因分析',
  },
  {
    name: '温带海洋性气候',
    color: '#4682B4',
    countries: ['西欧（英国/爱尔兰/法国/荷兰）', '北美西海岸（阿拉斯加/加拿大）', '澳大利亚塔斯马尼亚', '新西兰'],
    features: '全年温和湿润，冬不冷夏不热，年降水量750-1000mm，季节分配均匀',
    cause: '终年受西风带控制，沿岸有暖流经过',
    gaokaoPoints: '温带海洋性气候与温带季风气候对比、欧洲温带海洋性气候分布广的原因',
  },
  {
    name: '温带大陆性气候',
    color: '#DEB887',
    countries: ['亚欧大陆内部（西伯利亚/中亚）', '北美大陆内部', '落基山脉以东'],
    features: '冬冷夏热，年较差大，降水少且集中夏季',
    cause: '深居内陆，距海遥远，水汽难以到达',
    gaokaoPoints: '亚欧大陆内部干旱成因、自然带经度地带性分布',
  },
  {
    name: '温带季风气候',
    color: '#87CEEB',
    countries: ['中国秦岭-淮河以北', '日本北部', '朝鲜半岛', '俄罗斯远东部分地区'],
    features: '夏季高温多雨（东南季风），冬季寒冷干燥，年降水量500-600mm',
    cause: '海陆热力性质差异，季风环流',
    gaokaoPoints: '季风气候成因、夏季风进退与雨带推移（江淮准静止锋/华北春旱）',
  },
  {
    name: '亚热带季风气候',
    color: '#98FB98',
    countries: ['中国秦岭-淮河以南', '日本南部', '韩国南部'],
    features: '夏季高温多雨，冬季温和少雨，年降水量800-1500mm',
    cause: '海陆热力性质差异',
    gaokaoPoints: '亚热带季风气候与亚热带湿润气候对比',
  },
  {
    name: '极地气候（苔原/冰原）',
    color: '#E0FFFF',
    countries: ['北极圈以内地区', '南极大陆', '格陵兰岛'],
    features: '终年严寒，最热月均温0-10°C，冰雪覆盖',
    cause: '纬度高，太阳高度角小，获得太阳辐射少',
    gaokaoPoints: '全球变暖与极地冰川融化',
  },
  {
    name: '高原山地气候',
    color: '#800080',
    countries: ['青藏高原', '安第斯山脉', '阿尔卑斯山脉', '落基山脉'],
    features: '气候垂直变化明显，日较差大，年较差小',
    cause: '海拔高，空气稀薄，气压低',
    gaokaoPoints: '垂直地带性分异规律、山地自然带谱分析',
  },
];

// 世界主要地形/地理区域标注
export const worldGeoRegions = [
  { name: '撒哈拉沙漠', coord: [15, 22] as [number, number], type: 'desert' },
  { name: '刚果盆地', coord: [25, -3] as [number, number], type: 'basin' },
  { name: '东非大裂谷', coord: [38, -5] as [number, number], type: 'rift' },
  { name: '阿拉伯半岛', coord: [48, 22] as [number, number], type: 'peninsula' },
  { name: '印度半岛', coord: [76, 15] as [number, number], type: 'peninsula' },
  { name: '中南半岛', coord: [102, 18] as [number, number], type: 'peninsula' },
  { name: '青藏高原', coord: [90, 32] as [number, number], type: 'plateau' },
  { name: '西西伯利亚平原', coord: [75, 62] as [number, number], type: 'plain' },
  { name: '澳大利亚大自流盆地', coord: [140, -28] as [number, number], type: 'basin' },
  { name: '大平原（美国）', coord: [-100, 40] as [number, number], type: 'plain' },
  { name: '亚马逊平原', coord: [-62, -4] as [number, number], type: 'plain' },
  { name: '拉普拉塔平原', coord: [-58, -32] as [number, number], type: 'plain' },
];

// 辅助函数：根据省份名称获取数据
export function getProvinceData(name: string): ChinaProvinceData | null {
  return chinaProvincesData[name] || null;
}

// 辅助函数：判断是否为辽宁省
export function isLiaoning(name: string): boolean {
  return name === '辽宁';
}

// 辅助函数：根据气候类型获取国家
export function getCountriesByClimate(climateName: string): string[] {
  const zone = worldClimateZones.find(z => z.name === climateName);
  return zone?.countries || [];
}
