import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const USER_ID = 'personal-user';

// 第四单元数据（简化版避免超时）
const UNIT4_DATA = {
  id: 'u4',
  unitTitle: '第四单元：明清中国版图的奠定与面临的挑战',
  textbookId: 'outline-upper',
  concepts: [
    { id: 'c4-1', name: '明朝建立', category: '政治', definition: '1368年朱元璋称帝，定都应天府（今南京），国号大明。结束元朝统治。', keyPoints: ['1368年', '朱元璋'], importance: 4, gaokaoFocus: '明朝建立' },
    { id: 'c4-2', name: '废除丞相制度', category: '政治', definition: '1380年诛杀胡惟庸，撤销中书省，六部直接对皇帝负责。丞相制度自秦延续1600余年至此废除。', keyPoints: ['1380年', '胡惟庸', '六部直属'], importance: 5, gaokaoFocus: '废除丞相是高频考点' },
    { id: 'c4-3', name: '内阁制度', category: '政治', definition: '明太祖设殿阁大学士；明成祖正式设内阁；明宣宗赐票拟权。内阁非宰相，票拟需皇帝批红生效。', keyPoints: ['票拟权', '批红', '内阁非宰相'], importance: 5, gaokaoFocus: '内阁制度是高频考点' },
    { id: 'c4-4', name: '宦官专权', category: '政治', definition: '皇帝怠政将批红权交司礼监太监。刘瑾、魏忠贤权倾朝野，加剧政治腐败。', keyPoints: ['司礼监', '魏忠贤'], importance: 4, gaokaoFocus: '宦官专权' },
    { id: 'c4-5', name: '郑和下西洋', category: '外交', definition: '1405-1433年郑和七下西洋，最远达非洲东海岸和红海沿岸。朝贡贸易，厚往薄来。', keyPoints: ['七次下西洋', '朝贡贸易'], importance: 4, gaokaoFocus: '郑和下西洋是高频考点' },
    { id: 'c4-6', name: '明朝海防', category: '政治', definition: '海禁政策：片板不许下海。倭寇：戚继光组建戚家军抗倭，九战九捷，平定倭患。', keyPoints: ['海禁', '戚继光抗倭'], importance: 4, gaokaoFocus: '明朝海防' },
    { id: 'c4-7', name: '西方殖民者东来', category: '外交', definition: '葡萄牙1553年占澳门；荷兰1624年占台湾；1662年郑成功收复台湾。', keyPoints: ['葡萄牙占澳门', '荷兰占台湾'], importance: 4, gaokaoFocus: '西方殖民者' },
    { id: 'c4-8', name: '清朝君主专制', category: '政治', definition: '奏折制度：官员直接呈递密折。军机处：跪受笔录皇帝旨意。文字狱：强化思想控制。', keyPoints: ['奏折制度', '军机处', '文字狱'], importance: 5, gaokaoFocus: '君主专制强化是高频考点' },
    { id: 'c4-9', name: '清朝疆域', category: '政治', definition: '西跨葱岭，西北达巴尔喀什湖，北接西伯利亚，东北至外兴安岭和库页岛，东临太平洋，东南包括台湾，南到南海诸岛。', keyPoints: ['疆域四至', '四大将军'], importance: 5, gaokaoFocus: '清朝疆域是高频考点' },
    { id: 'c4-10', name: '清朝民族政策', category: '民族', definition: '满蒙联姻；册封达赖班禅；改土归流；理藩院管理蒙古西藏事务。', keyPoints: ['满蒙联姻', '改土归流', '理藩院'], importance: 5, gaokaoFocus: '民族政策是高频考点' },
    { id: 'c4-11', name: '统一多民族国家巩固', category: '民族', definition: '平定准噶尔；收复新疆（大小和卓）；驻藏大臣管理西藏；1684年设台湾府。', keyPoints: ['伊犁将军', '驻藏大臣', '台湾设府'], importance: 5, gaokaoFocus: '统一多民族国家' },
    { id: 'c4-12', name: '闭关锁国', category: '外交', definition: '广州一口通商，十三行管理。对外贸易严格限制。影响：①抵御侵略；②阻碍交流；③使中国落后潮流。', keyPoints: ['一口通商', '十三行'], importance: 5, gaokaoFocus: '闭关锁国是高频考点' },
    { id: 'c4-13', name: '经济新现象', category: '经济', definition: '高产作物传入；手工业出现资本主义萌芽（苏州丝织业）；商帮兴起（晋商徽商）；白银货币化。', keyPoints: ['资本主义萌芽', '商帮', '白银货币化'], importance: 4, gaokaoFocus: '经济新现象' },
    { id: 'c4-14', name: '明清思想', category: '思想', definition: '黄宗羲批判君主专制；顾炎武倡导经世致用；王夫之唯物思想。', keyPoints: ['三大思想家', '批判君主'], importance: 4, gaokaoFocus: '明清思想' },
    { id: 'c4-15', name: '清朝统治危机', category: '政治', definition: '人口膨胀、人地矛盾；农民起义（白莲教）；鸦片走私、白银外流、国力衰退。', keyPoints: ['人口膨胀', '鸦片走私'], importance: 4, gaokaoFocus: '统治危机' }
  ],
  events: [
    { year: '1368年', title: '明朝建立', category: '政治', importance: 5, description: '朱元璋称帝，建立明朝，定都应天府（今南京）。' },
    { year: '1380年', title: '废除丞相', category: '政治', importance: 5, description: '朱元璋诛杀胡惟庸，撤销中书省，六部直接对皇帝负责。' },
    { year: '1405-1433年', title: '郑和下西洋', category: '外交', importance: 5, description: '郑和七次下西洋，最远到达非洲东海岸和红海沿岸。' },
    { year: '1644年', title: '清朝入关', category: '政治', importance: 5, description: '李自成攻入北京，明朝灭亡。清军入关，定都北京。' },
    { year: '1662年', title: '郑成功收复台湾', category: '外交', importance: 5, description: '郑成功率军驱逐荷兰殖民者，收复台湾。' },
    { year: '1684年', title: '台湾设府', category: '政治', importance: 4, description: '清朝在台湾设台湾府，隶属福建省。' },
    { year: '1729年', title: '设立军机处', category: '政治', importance: 5, description: '雍正帝设立军机处，君主专制达到顶峰。' },
    { year: '1757年', title: '广州一口通商', category: '外交', importance: 5, description: '乾隆关闭闽浙江三口，只留广州一口通商，实行闭关锁国。' },
    { year: '1840年', title: '鸦片战争', category: '政治', importance: 5, description: '英国发动鸦片战争，中国开始沦为半殖民地半封建社会。' }
  ],
  cards: [
    { id: 'card4-1', front: '明朝废除丞相制度的原因和内容？', back: '原因：吸取元朝宰相专权教训。内容：1380年诛杀胡惟庸，撤销中书省，六部直接对皇帝负责。', category: '政治' },
    { id: 'card4-2', front: '内阁制度的特点？内阁是宰相吗？', back: '特点：票拟权但需皇帝批红。内阁不是宰相！宰相有决策权，内阁只有建议权。', category: '政治' },
    { id: 'card4-3', front: '郑和下西洋的时间、次数？', back: '时间：1405-1433年，共七次。到达非洲东海岸和红海沿岸。朝贡贸易。', category: '外交' },
    { id: 'card4-4', front: '清朝强化君主专制的措施？', back: '奏折制度：直接呈递密折；军机处：跪受笔录；文字狱：强化思想控制。', category: '政治' },
    { id: 'card4-5', front: '清朝疆域范围？', back: '西跨葱岭，西北达巴尔喀什湖，北接西伯利亚，东北至外兴安岭和库页岛，东临太平洋，东南包括台湾，南到南海诸岛。', category: '政治' },
    { id: 'card4-6', front: '清朝如何管理边疆？', back: '蒙古：乌里雅苏台将军；新疆：伊犁将军；西藏：驻藏大臣；东北：黑龙江将军；台湾：台湾府。', category: '民族' },
    { id: 'card4-7', front: '闭关锁国的影响？', back: '①一定程度抵御外来侵略；②阻碍中外经济文化交流；③使中国逐渐落后于世界潮流。', category: '外交' },
    { id: 'card4-8', front: '明清经济新现象？', back: '高产作物传入；资本主义萌芽（苏州丝织业）；商帮兴起（晋商、徽商）；白银货币化。', category: '经济' },
    { id: 'card4-9', front: '明清三大思想家？', back: '黄宗羲：批判君主专制；顾炎武：经世致用；王夫之：唯物思想。', category: '思想' },
    { id: 'card4-10', front: '清朝统治危机？', back: '人口膨胀、人地矛盾；农民起义（白莲教）；鸦片走私、白银外流、国力衰退。', category: '政治' }
  ],
  causalLinks: [
    { from: '明朝废除丞相', to: '内阁制度形成', type: '政治', description: '废除丞相后设立内阁制度处理政务' },
    { from: '皇帝怠政', to: '宦官专权', type: '政治', description: '皇帝将批红权交给司礼监太监' },
    { from: '明朝海禁', to: '倭寇之患', type: '外交', description: '海禁导致沿海居民铤而走险' },
    { from: '倭寇之患', to: '戚继光抗倭', type: '军事', description: '戚继光组建戚家军平定倭患' },
    { from: '皇权集中', to: '军机处设立', type: '政治', description: '雍正设立军机处，君主专制达到顶峰' },
    { from: '闭关锁国', to: '中国落后', type: '历史', description: '闭关锁国使中国逐渐落后世界潮流' },
    { from: '鸦片走私', to: '白银外流', type: '经济', description: '英国走私鸦片导致白银外流' }
  ],
  examFocus: [
    { id: 'ef4-1', topic: '明朝君主专制强化', level: '★★★', reason: '2024辽吉黑第17题13分大题', unit: '第13课' },
    { id: 'ef4-2', topic: '清朝君主专制强化', level: '★★★', reason: '2023辽宁第5题', unit: '第14课' },
    { id: 'ef4-3', topic: '清朝民族政策与统一', level: '★★★', reason: '2023辽宁第5题', unit: '第14课' },
    { id: 'ef4-4', topic: '明清海防与对外关系', level: '★★☆', reason: '2025黑吉辽蒙第5题', unit: '第13课' },
    { id: 'ef4-5', topic: '清朝赋税与统治政策', level: '★★☆', reason: '2021辽宁第5题', unit: '第14课' },
    { id: 'ef4-6', topic: '明清思想文化', level: '★★☆', reason: '2021辽宁第4题', unit: '第15课' },
    { id: 'ef4-7', topic: '闭关锁国', level: '★★☆', reason: '高频考点', unit: '第14课' }
  ],
  memoryFormulas: [
    { formula: '废丞相，设内阁，宦官专权', period: '明朝', periodFeature: '君主专制强化' },
    { formula: '奏折制度，军机处，文字狱', period: '清朝前期', periodFeature: '君主专制顶峰' },
    { formula: '疆域奠定，四大将军，改土归流', period: '清朝', periodFeature: '统一多民族国家' },
    { formula: '广州一口通商，十三行', period: '清朝中期', periodFeature: '闭关锁国' }
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
        unit_id: 'u4',
        file_name: `${UNIT4_DATA.unitTitle}.json`,
        textbook_id: UNIT4_DATA.textbookId,
        unit_title: UNIT4_DATA.unitTitle,
        data: UNIT4_DATA,
        concepts_count: UNIT4_DATA.concepts.length,
        events_count: UNIT4_DATA.events.length,
        links_count: UNIT4_DATA.causalLinks.length,
        exam_focus_count: UNIT4_DATA.examFocus.length,
        imported_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,unit_id'
      });

    if (error) {
      console.error('导入u4失败:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    console.log('[历史数据导入] 成功 u4:', UNIT4_DATA.unitTitle);
    return NextResponse.json({ success: true, message: '第四单元导入成功', unitId: 'u4' });
  } catch (error: any) {
    console.error('导入错误:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
