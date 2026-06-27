export interface PoetryPoem {
  id: string;
  title: string;
  dynasty: string;
  author: string;
  text: string;
  background: string;
  fromSection: string;
  isRequired: boolean;
}

export const POETRY_LIST: PoetryPoem[] = [
  {
    id: 'dengyueyanglou',
    title: '登岳阳楼',
    dynasty: '唐',
    author: '杜甫',
    fromSection: '必修上册',
    isRequired: true,
    text: '昔闻洞庭水，今上岳阳楼。吴楚东南坼，乾坤日夜浮。亲朋无一字，老病有孤舟。戎马关山北，凭轩涕泗流。',
    background: '大历三年（768年）杜甫漂泊至岳州，登临岳阳楼。此时诗人老病孤舟，面对动荡时局，写下此诗。',
  },
  {
    id: 'shuixiang',
    title: '望洞庭湖赠张丞相',
    dynasty: '唐',
    author: '孟浩然',
    fromSection: '必修上册',
    isRequired: true,
    text: '八月湖水平，涵虚混太清。气蒸云梦泽，波撼岳阳城。欲济无舟楫，端居耻圣明。坐观垂钓者，徒有羡鱼情。',
    background: '孟浩然西游长安，望洞庭湖作此干谒诗，希望张九龄引荐。',
  },
  {
    id: 'shuidiaogetou',
    title: '水调歌头·明月几时有',
    dynasty: '宋',
    author: '苏轼',
    fromSection: '必修上册',
    isRequired: true,
    text: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆？人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。',
    background: '宋神宗熙宁九年（1076年）中秋，苏轼任密州知州，思念弟弟苏辙而作。',
  },
  {
    id: 'yangguan-sanbie',
    title: '送杜少府之任蜀州',
    dynasty: '唐',
    author: '王勃',
    fromSection: '必修上册',
    isRequired: true,
    text: '城阙辅三秦，风烟望五津。与君离别意，同是宦游人。海内存知己，天涯若比邻。无为在歧路，儿女共沾巾。',
    background: '王勃在长安送友人赴蜀州任所，抒发旷达的离别情怀。',
  },
  {
    id: 'bai-xue-ge-ci',
    title: '白雪歌送武判官归京',
    dynasty: '唐',
    author: '岑参',
    fromSection: '必修上册',
    isRequired: true,
    text: '北风卷地白草折，胡天八月即飞雪。忽如一夜春风来，千树万树梨花开。散入珠帘湿罗幕，狐裘不暖锦衾薄。将军角弓不得控，都护铁衣冷难着。瀚海阑干百丈冰，愁云惨淡万里凝。中军置酒饮归客，胡琴琵琶与羌笛。纷纷暮雪下辕门，风掣红旗冻不翻。轮台东门送君去，去时雪满天山路。山回路转不见君，雪上空留马行处。',
    background: '岑参于轮台幕府送武判官归京，以奇丽想象描绘边塞雪景。',
  },
  {
    id: 'gui-qu-lai-xiang-ci',
    title: '归去来兮辞',
    dynasty: '晋',
    author: '陶渊明',
    fromSection: '选择性必修上册',
    isRequired: true,
    text: '归去来兮，田园将芜胡不归？既自以心为形役，奚惆怅而独悲？悟已往之不谏，知来者之可追。实迷途其未远，觉今是而昨非。舟遥遥以轻飏，风飘飘而吹衣。问征夫以前路，恨晨光之熹微。……',
    background: '东晋安帝义熙元年（405年），陶渊明辞彭泽令归隐，作此文表明心志。',
  },
  {
    id: 'mei-hua',
    title: '山园小梅二首·其一',
    dynasty: '宋',
    author: '林逋',
    fromSection: '选择性必修上册',
    isRequired: false,
    text: '众芳摇落独暄妍，占尽风情向小园。疏影横斜水清浅，暗香浮动月黄昏。霜禽欲下先偷眼，粉蝶如知合断魂。幸有微吟可相狎，不须檀板共金樽。',
    background: '林逋隐居杭州孤山，以梅为妻、以鹤为子，此诗为咏梅绝唱。',
  },
  {
    id: 'shu-ju',
    title: '蜀相',
    dynasty: '唐',
    author: '杜甫',
    fromSection: '必修上册',
    isRequired: true,
    text: '丞相祠堂何处寻？锦官城外柏森森。映阶碧草自春色，隔叶黄鹂空好音。三顾频烦天下计，两朝开济老臣心。出师未捷身先死，长使英雄泪满襟。',
    background: '唐肃宗上元元年（760年）杜甫寓居成都，拜谒武侯祠而作。',
  },
];

export function getPoemById(id: string): PoetryPoem | undefined {
  return POETRY_LIST.find((p) => p.id === id);
}

export function getRequiredPoems(): PoetryPoem[] {
  return POETRY_LIST.filter((p) => p.isRequired);
}
