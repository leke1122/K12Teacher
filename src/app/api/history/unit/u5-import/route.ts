import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const USER_ID = 'personal-user';

// 第五单元数据（晚清时期的内忧外患与救亡图存）
const UNIT5_DATA = {
  id: 'u5',
  unitTitle: '第五单元：晚清时期的内忧外患与救亡图存',
  textbookId: 'outline-upper',
  concepts: [
    { id: 'c5-1', name: '鸦片战争', category: '政治', definition: '1840-1842年英国发动侵略战争。《南京条约》割香港岛、赔款2100万银元、五口通商、协定关税。中国开始沦为半殖民地半封建社会。', keyPoints: ['工业革命是根本原因', '虎门销烟是直接原因'], importance: 5, gaokaoFocus: '★★★ 2023辽宁第6题、2025辽宁第6题' },
    { id: 'c5-2', name: '《南京条约》', category: '政治', definition: '1842年签订。内容：割香港岛、赔款2100万银元、开放广州厦门福州宁波上海五口通商、协定关税。附件：领事裁判权、片面最惠国待遇、租界。', keyPoints: ['协定关税', '领事裁判权', '片面最惠国待遇'], importance: 5, gaokaoFocus: '★★★ 领事裁判权和最惠国待遇是高频考点' },
    { id: 'c5-3', name: '第二次鸦片战争', category: '政治', definition: '1856-1860年英法发动。《天津条约》增开十口；《北京条约》承认条约有效、增开天津、割九龙、沙俄趁机割占100多万平方公里土地。火烧圆明园。', keyPoints: ['火烧圆明园', '沙俄趁火打劫'], importance: 4, gaokaoFocus: '★★☆ 侵略加深' },
    { id: 'c5-4', name: '开眼看世界', category: '文化', definition: '林则徐编译《四洲志》；魏源《海国图志》提出师夷长技以制夷；徐继畬《瀛寰志略》。意义：冲破闭关观念，为认识世界提供基础。', keyPoints: ['林则徐《四洲志》', '魏源《海国图志》', '师夷长技以制夷'], importance: 3, gaokaoFocus: '★★☆ 人物及思想' },
    { id: 'c5-5', name: '太平天国运动', category: '政治', definition: '1851年洪秀全金田起义，1853年定都天京。《天朝田亩制度》：废除封建土地所有制。《资政新篇》：向西方学习发展资本主义。1864年失败。', keyPoints: ['《天朝田亩制度》', '《资政新篇》'], importance: 4, gaokaoFocus: '★★☆ 两部著作对比' },
    { id: 'c5-6', name: '洋务运动', category: '政治', definition: '1860s-1895年。代表：曾国藩、李鸿章、左宗棠、张之洞。口号：师夷长技以自强、自求富。内容：军事工业、民用工业、新式学堂、海军。失败：甲午战争北洋水师覆没。', keyPoints: ['师夷长技', '自强求富', '北洋水师'], importance: 4, gaokaoFocus: '★★☆ 2021辽宁第6题' },
    { id: 'c5-7', name: '左宗棠收复新疆', category: '政治', definition: '1875年任钦差大臣，1878年收复新疆（除伊犁外）。1884年设新疆行省。意义：维护国家统一，增强国家认同。', keyPoints: ['塞防论', '收复新疆', '设新疆行省'], importance: 4, gaokaoFocus: '★★☆ 2024辽宁第6题' },
    { id: 'c5-8', name: '甲午中日战争', category: '政治', definition: '1894-1895年。《马关条约》：割辽东半岛（后因三国干涉还辽未成）、台湾及附属岛屿；赔款2亿两；开放沙市、重庆、苏州、杭州；设工厂。影响：列强瓜分中国狂潮，洋务运动破产。', keyPoints: ['黄海海战', '《马关条约》', '三国干涉还辽'], importance: 5, gaokaoFocus: '★★★ 必背《马关条约》' },
    { id: 'c5-9', name: '瓜分中国狂潮', category: '政治', definition: '《马关条约》后：德国占胶州湾、俄国占旅大、法国占广州湾、英国占威海九龙、美国门户开放政策（1899年）。', keyPoints: ['德国占胶州湾', '美国门户开放'], importance: 3, gaokaoFocus: '★★☆ 门户开放政策' },
    { id: 'c5-10', name: '戊戌维新运动', category: '政治', definition: '1898年百日维新。康有为、梁启超、谭嗣同等。内容：政治改革、经济奖励实业、军事练新军、文化废八股办新学。结果：慈禧政变，六君子遇难。', keyPoints: ['公车上书', '百日维新', '六君子'], importance: 4, gaokaoFocus: '★★☆ 2022辽宁第6题' },
    { id: 'c5-11', name: '义和团运动', category: '政治', definition: '1899年起源于山东，口号：扶清灭洋。1900年八国联军侵华，慈禧挟光绪西逃。《辛丑条约》：赔款4.5亿两、禁止反帝、拆毁大沽炮台、划东交民巷为使馆区。中国完全沦为半殖民地。', keyPoints: ['扶清灭洋', '《辛丑条约》', '4.5亿两'], importance: 5, gaokaoFocus: '★★★ 完全沦为半殖民地半封建' },
    { id: 'c5-12', name: '清末新政', category: '政治', definition: '1901-1911年。内容：政治（裁冗员）、经济（奖励实业）、军事（编新军）、教育（废科举、办新学、鼓励留学）。影响：客观促进近代化，培养新式人才。', keyPoints: ['废除科举', '创办新式学堂'], importance: 4, gaokaoFocus: '★★★ 2022辽宁第17题12分大题' },
    { id: 'c5-13', name: '近代社会变化', category: '经济', definition: '衣：西式服装传入。食：西式餐饮传入。住：租界出现西式建筑。行：轮船、火车、电车。习俗：剪辫、放足、改称谓。社会生活逐步近代化。', keyPoints: ['中山装', '轮船火车'], importance: 3, gaokaoFocus: '★★☆ 2021辽宁第6题' },
    { id: 'c5-14', name: '经济救国思潮', category: '经济', definition: '民族危机加深，实业救国兴起。张謇创办大生纱厂（状元办厂）。荣氏兄弟创办面粉纺织企业。发行报纸宣传实业。', keyPoints: ['张謇', '状元办厂', '实业救国'], importance: 3, gaokaoFocus: '★★☆ 2024辽宁第7题' }
  ],
  events: [
    { year: '1840年', title: '鸦片战争爆发', category: '政治', importance: 5, description: '英国为打开中国市场发动侵略战争。' },
    { year: '1842年', title: '《南京条约》', category: '政治', importance: 5, description: '中国近代第一个不平等条约，中国开始沦为半殖民地半封建社会。' },
    { year: '1856年', title: '第二次鸦片战争', category: '政治', importance: 4, description: '英法联军发动侵略战争，火烧圆明园。' },
    { year: '1864年', title: '太平天国失败', category: '政治', importance: 4, description: '太平天国运动失败。' },
    { year: '1894年', title: '甲午战争爆发', category: '政治', importance: 5, description: '日本发动侵华战争，北洋水师覆没。' },
    { year: '1895年', title: '《马关条约》', category: '政治', importance: 5, description: '中国割让台湾，赔款2亿两，开放工厂。' },
    { year: '1898年', title: '戊戌变法', category: '政治', importance: 4, description: '百日维新失败，六君子遇难。' },
    { year: '1900年', title: '八国联军侵华', category: '政治', importance: 5, description: '联军攻占北京，慈禧挟光绪西逃。' },
    { year: '1901年', title: '《辛丑条约》', category: '政治', importance: 5, description: '中国完全沦为半殖民地半封建社会。' }
  ],
  cards: [
    { id: 'card5-1', front: '鸦片战争的根本原因和直接原因？', back: '根本原因：英国工业革命完成，急需打开中国市场（经济动因）。直接原因：虎门销烟（导火索/借口）。', category: '政治' },
    { id: 'card5-2', front: '《南京条约》的主要内容？', back: '割香港岛、赔款2100万银元、开放广州厦门福州宁波上海五口通商、协定关税。', category: '政治' },
    { id: 'card5-3', front: '《马关条约》的危害？', back: '割让辽东半岛和台湾；赔款2亿两；开放沙市、重庆、苏州、杭州；允许设工厂。标志着洋务运动破产，列强掀起瓜分中国狂潮。', category: '政治' },
    { id: 'card5-4', front: '《辛丑条约》的危害？', back: '赔款4.5亿两（本息近10亿）；禁止中国人民反帝；拆毁大沽炮台；划东交民巷为使馆区。中国完全沦为半殖民地半封建社会。', category: '政治' },
    { id: 'card5-5', front: '洋务运动的口号和主要内容？', back: '口号：前期师夷长技以自强，后期师夷长技以求富。主要内容：军事工业（江南制造总局）、民用工业（轮船招商局）、新式学堂、京师同文馆、北洋水师。', category: '政治' },
    { id: 'card5-6', front: '戊戌变法的背景和结果？', back: '背景：甲午战后民族危机加深，民族资本主义初步发展。结果：慈禧发动政变，六君子遇难，变法失败。教训：改良道路在半殖民地半封建社会行不通。', category: '政治' },
    { id: 'card5-7', front: '清末新政的主要内容？', back: '政治：裁撤冗官、改革刑律；经济：奖励实业；军事：编练新军；教育：废除科举、创办新式学堂、鼓励留学。', category: '政治' }
  ],
  causalLinks: [
    { from: '工业革命', to: '鸦片战争', type: '因果', description: '英国工业革命后需要倾销商品掠夺原料，因此发动侵略战争' },
    { from: '鸦片战争', to: '半殖民地半封建', type: '因果', description: '不平等条约破坏中国主权，中国社会性质改变' },
    { from: '《马关条约》', to: '瓜分狂潮', type: '因果', description: '巨额赔款和开放工厂权益刺激列强掀起瓜分竞争' },
    { from: '民族危机', to: '救亡图存', type: '因果', description: '从太平天国到洋务、戊戌，各阶级探索救国道路' },
    { from: '《辛丑条约》', to: '完全半殖民地', type: '因果', description: '清政府成为列强工具，中国主权丧失殆尽' }
  ],
  examFocus: [
    { id: 'ef5-1', topic: '两次鸦片战争的影响', level: '★★★', reason: '2023辽宁第6题、2025辽宁第6题', unit: '第16课' },
    { id: 'ef5-2', topic: '清末新政与新式学堂', level: '★★★', reason: '2022辽宁第17题（12分大题）', unit: '第18课' },
    { id: 'ef5-3', topic: '左宗棠收复新疆', level: '★★☆', reason: '2024辽宁第6题', unit: '第17课' },
    { id: 'ef5-4', topic: '戊戌变法', level: '★★☆', reason: '2022辽宁第6题', unit: '第18课' },
    { id: 'ef5-5', topic: '经济救国思潮', level: '★★☆', reason: '2024辽宁第7题', unit: '第18课' },
    { id: 'ef5-6', topic: '洋务运动', level: '★★☆', reason: '2021辽宁第6题', unit: '第17课' }
  ],
  memoryFormulas: [
    { formula: '鸦片战争开国门，南京条约五口开；半殖半封由此始，近代史开端要记清', period: '鸦片战争', periodFeature: '中国近代史开端' },
    { formula: '英法联军烧圆明，二次鸦片更深入；沙俄趁火打劫忙，一百多万土地丢', period: '第二次鸦片战争', periodFeature: '侵略加深' },
    { formula: '太平天国反侵略，天朝田亩平均地；资政新篇学西方，洋务运动求自强', period: '农民与地主探索', periodFeature: '救亡图存' },
    { formula: '甲午战争北洋败，马关条约割台湾；瓜分狂潮纷纷起，列强掀起资本输', period: '甲午战争', periodFeature: '民族危机加深' },
    { formula: '戊戌变法百日新，六君喋血为国民；义和团起扶清灭洋，辛丑条约半殖沉', period: '资产阶级探索', periodFeature: '救亡图存' }
  ]
};

export async function POST() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: '数据库未配置' }, { status: 500 });
  }

  try {
    const { error } = await supabase
      .from('docx_imports')
      .upsert({
        user_id: USER_ID,
        unit_id: 'u5',
        file_name: `${UNIT5_DATA.unitTitle}.json`,
        textbook_id: UNIT5_DATA.textbookId,
        unit_title: UNIT5_DATA.unitTitle,
        data: UNIT5_DATA,
        concepts_count: UNIT5_DATA.concepts.length,
        events_count: UNIT5_DATA.events.length,
        links_count: UNIT5_DATA.causalLinks.length,
        exam_focus_count: UNIT5_DATA.examFocus.length,
        imported_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,unit_id'
      });

    if (error) {
      console.error('导入u5失败:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('[历史数据导入] 成功 u5:', UNIT5_DATA.unitTitle);
    return NextResponse.json({ success: true, message: '第五单元导入成功', unitId: 'u5' });
  } catch (error: any) {
    console.error('导入错误:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
