import { NextRequest, NextResponse } from 'next/server';
import { Grade } from '@/stores/gradeStore';

// 每日积累内容模板（按学科和年级）
const ACCUMULATION_TEMPLATES: Record<string, Record<Grade, Array<{
  subject: string;
  subjectIcon: string;
  type: string;
  content: string;
  meaning: string;
  example?: string;
  whyImportant: string;
  frequency?: string;
}>>> = {
  chinese: {
    grade1: [
      { subject: '语文', subjectIcon: '📜', type: '实词', content: '兵', meaning: '武器 → 士兵 → 军事', example: '兵来将挡，水来土掩', whyImportant: '高考文言文高频考点，近5年出现7次', frequency: '⭐⭐⭐⭐⭐' },
      { subject: '语文', subjectIcon: '📜', type: '实词', content: '亡', meaning: '逃跑 → 死亡 → 灭亡', example: '亡羊补牢', whyImportant: '一词多义，文言文必考', frequency: '⭐⭐⭐⭐' },
      { subject: '语文', subjectIcon: '📜', type: '成语', content: '见异思迁', meaning: '看到不同就想改变，意志不坚定', example: '学习不能见异思迁', whyImportant: '作文常用，形容态度不专一', frequency: '⭐⭐⭐' },
    ],
    grade2: [
      { subject: '语文', subjectIcon: '📜', type: '虚词', content: '之', meaning: '的 / 代词 / 动词去', example: '送杜少府之任蜀州', whyImportant: '文言虚词用法最多，必须掌握', frequency: '⭐⭐⭐⭐⭐' },
      { subject: '语文', subjectIcon: '📜', type: '诗歌手法', content: '借景抒情', meaning: '通过景物描写来表达情感', example: '春风又绿江南岸，明月何时照我还', whyImportant: '诗歌鉴赏核心手法', frequency: '⭐⭐⭐⭐' },
    ],
    grade3: [
      { subject: '语文', subjectIcon: '📜', type: '高频考点', content: '作文开头技巧', meaning: '引用名言/设置悬念/开门见山', example: '"生命是什么？..."', whyImportant: '高考作文60+的关键', frequency: '⭐⭐⭐⭐⭐' },
    ],
  },
  english: {
    grade1: [
      { subject: '英语', subjectIcon: '📖', type: '短语', content: 'take into account', meaning: '考虑，顾及', example: 'We must take all factors into account.', whyImportant: '读写常考，高频短语', frequency: '⭐⭐⭐⭐⭐' },
      { subject: '英语', subjectIcon: '📖', type: '高频词', content: 'significant', meaning: '重要的，有意义的', example: 'a significant discovery', whyImportant: '阅读理解核心词汇', frequency: '⭐⭐⭐⭐' },
    ],
    grade2: [
      { subject: '英语', subjectIcon: '📖', type: '短语', content: 'in terms of', meaning: '在...方面', example: 'Improvement in terms of quality.', whyImportant: '写作高分表达', frequency: '⭐⭐⭐⭐' },
    ],
    grade3: [
      { subject: '英语', subjectIcon: '📖', type: '写作句型', content: 'Not only..., but also...', meaning: '不仅...而且...', example: 'Not only is it beautiful, but also useful.', whyImportant: '高考写作必备句型', frequency: '⭐⭐⭐⭐⭐' },
    ],
  },
  politics: {
    grade1: [
      { subject: '政治', subjectIcon: '🏛️', type: '核心概念', content: '汇率', meaning: '两种货币之间的兑换比率', example: '人民币升值有利于进口，不利于出口', whyImportant: '汇率是国际贸易的核心概念', frequency: '⭐⭐⭐⭐' },
    ],
    grade2: [
      { subject: '政治', subjectIcon: '🏛️', type: '核心概念', content: '新质生产力', meaning: '创新起主导作用，具有高科技、高效能、高质量特征的生产力', example: '人工智能、量子计算属于新质生产力', whyImportant: '2024年时政热点，高考必考', frequency: '⭐⭐⭐⭐⭐' },
    ],
    grade3: [
      { subject: '政治', subjectIcon: '🏛️', type: '时事政治', content: '高质量发展', meaning: '体现新发展理念的发展，追求质量和效益', example: '绿色发展、共享发展', whyImportant: '二十大报告核心内容', frequency: '⭐⭐⭐⭐⭐' },
    ],
  },
  history: {
    grade1: [
      { subject: '历史', subjectIcon: '📜', type: '年代', content: '1840年', meaning: '鸦片战争爆发，中国近代史开端', example: '1840.6 鸦片战争 → 1842《南京条约》', whyImportant: '中国近代史起点，必背年代', frequency: '⭐⭐⭐⭐⭐' },
    ],
    grade2: [
      { subject: '历史', subjectIcon: '📜', type: '事件', content: '甲午战争 (1894-1895)', meaning: '日本发动的侵华战争，北洋水师全军覆没', example: '《马关条约》割让台湾', whyImportant: '中国近代史转折点', frequency: '⭐⭐⭐⭐' },
    ],
    grade3: [
      { subject: '历史', subjectIcon: '📜', type: '比较', content: '戊戌变法 vs 明治维新', meaning: '中日两国近代化道路的对比', example: '日本成功，中国失败 → 原因分析', whyImportant: '高考综合题高频考点', frequency: '⭐⭐⭐⭐⭐' },
    ],
  },
  geography: {
    grade1: [
      { subject: '地理', subjectIcon: '🌍', type: '气候类型', content: '地中海气候', meaning: '夏季炎热干燥，冬季温和多雨', example: '分布：南北纬30°-40°大陆西岸', whyImportant: '高考气候类型辨析常考', frequency: '⭐⭐⭐⭐' },
    ],
    grade2: [
      { subject: '地理', subjectIcon: '🌍', type: '地理名词', content: '水循环', meaning: '蒸发→凝结→降水→径流→蒸发', example: '海洋→大气→陆地→海洋', whyImportant: '自然地理核心过程', frequency: '⭐⭐⭐⭐' },
    ],
    grade3: [
      { subject: '地理', subjectIcon: '🌍', type: '区位因素', content: '农业区位因素', meaning: '自然：气候/地形/土壤/水源；社会经济：市场/交通/政策/技术', example: '东北平原发展商品粮的优势', whyImportant: '农业地理核心框架', frequency: '⭐⭐⭐⭐⭐' },
    ],
  },
  math: {
    grade1: [
      { subject: '数学', subjectIcon: '📐', type: '公式', content: '韦达定理', meaning: 'ax²+bx+c=0 → x₁+x₂=-b/a, x₁x₂=c/a', example: '已知两根2和3，求方程', whyImportant: '一元二次方程核心定理，高考必考', frequency: '⭐⭐⭐⭐⭐' },
    ],
    grade2: [
      { subject: '数学', subjectIcon: '📐', type: '公式', content: '向量点积', meaning: 'a·b = |a||b|cosθ = aₓbₓ + aᵧbᵧ', example: '计算两向量夹角', whyImportant: '空间向量基础，高考常考', frequency: '⭐⭐⭐⭐' },
    ],
    grade3: [
      { subject: '数学', subjectIcon: '📐', type: '核心技巧', content: '构造函数', meaning: '根据题目条件构造合适的函数', example: 'f\'(x)关系式 → 构造函数g(x)=eˣf(x)', whyImportant: '导数压轴题核心技巧', frequency: '⭐⭐⭐⭐⭐' },
    ],
  },
};

// 关联提醒
const CONNECTIONS: Array<{ today: string; related: string; hint: string }> = [
  { today: '兵', related: '卒', hint: '还记得昨天学的"兵"吗？今天这个"卒"和它有关联哦——都是象棋里的角色，也都和军事相关' },
  { today: '函数', related: '方程', hint: '"函数"和"方程"是近亲，但函数是y随x变化的规则，方程是求x的值' },
  { today: '价格', related: '价值', hint: '政治里学价格，历史里学价格革命，数学里价格可以写成函数' },
];

function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDailySeed(dateStr: string): number {
  return dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let m = result.length;
  while (m) {
    const i = Math.floor((seed = (seed * 9301 + 49297) % 233280) / 233280 * m--);
    [result[m], result[i]] = [result[i], result[m]];
  }
  return result;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const grade = (searchParams.get('grade') || 'grade1') as Grade;

  const today = getTodayDate();
  const seed = getDailySeed(today);

  // 收集当天可用的内容
  const allItems: Array<{
    subject: string;
    subjectIcon: string;
    type: string;
    content: string;
    meaning: string;
    example?: string;
    whyImportant: string;
    frequency?: string;
    connection?: { related: string; hint: string };
  }> = [];

  Object.entries(ACCUMULATION_TEMPLATES).forEach(([subjectKey, gradeData]) => {
    const items = gradeData[grade] || gradeData['grade1'] || [];
    items.forEach(item => {
      allItems.push({ ...item });
    });
  });

  // 用日期种子打乱，确保每天内容不同
  const shuffled = shuffleWithSeed(allItems, seed);

  // 取前4条作为今日内容
  const todayContent = shuffled.slice(0, 4).map((item, idx) => {
    // 检查是否有关联提醒
    const connection = CONNECTIONS.find(c => c.today === item.content);
    return {
      id: `acc_${today}_${idx}`,
      ...item,
      connection: connection?.related ? { related: connection.related, hint: connection.hint } : undefined,
    };
  });

  return NextResponse.json({
    success: true,
    date: today,
    grade,
    items: todayContent,
  });
}
