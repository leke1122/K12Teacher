import { NextRequest, NextResponse } from 'next/server';
import { getActiveTextbook, getTextbookChapters, getTextbookPDF } from '@/lib/textbookStorage.server';
import { getServerData, setServerData } from '@/lib/serverStorage';

interface HistoryEvent {
  id: string;
  chapterId: string;
  title: string;
  year: number;
  yearEnd?: number;
  dynasty?: string;
  location?: string;
  figures: string[];
  causes: string;
  effects: string;
  significance?: string;
  summary: string;
  relatedIds?: string[];
}

interface ChapterMeta {
  title: string;
  events: HistoryEvent[];
}

const CHAPTERS: Record<string, ChapterMeta> = {
  'modern-china': {
    title: '中国近代史',
    events: [
      {
        id: 'opium-war',
        chapterId: 'modern-china',
        title: '鸦片战争',
        year: 1840,
        yearEnd: 1842,
        location: '中国东南沿海',
        figures: ['林则徐', '道光皇帝', '查理·义律'],
        causes: '英国向中国走私鸦片，清政府开展禁烟运动，英国以保护通商为借口发动战争。',
        effects: '签订《南京条约》，中国开始沦为半殖民地半封建社会，近代史开端。',
        significance: '中国近代史的开端',
        summary: '英国因鸦片贸易与中国爆发战争，导致中国近代史开端。',
        relatedIds: ['second-opium-war'],
      },
      {
        id: 'second-opium-war',
        chapterId: 'modern-china',
        title: '第二次鸦片战争',
        year: 1856,
        yearEnd: 1860,
        location: '中国华北、华南',
        figures: ['咸丰皇帝', '英法联军'],
        causes: '英法为进一步打开中国市场，扩大侵略权益而发动。',
        effects: '签订《天津条约》《北京条约》，中国半殖民地化程度进一步加深。',
        significance: '中国半殖民地化程度进一步加深',
        summary: '英法联军为进一步打开中国市场而发动的侵华战争。',
        relatedIds: ['opium-war', 'self-strengthening'],
      },
      {
        id: 'self-strengthening',
        chapterId: 'modern-china',
        title: '洋务运动',
        year: 1861,
        yearEnd: 1895,
        location: '中国',
        figures: ['曾国藩', '李鸿章', '张之洞'],
        causes: '太平天国运动与第二次鸦片战争后，清政府内部主张学习西方技术以自强。',
        effects: '客观上刺激中国资本主义发展，开启近代化进程，但未改变封建制度。',
        significance: '开启中国近代化进程',
        summary: '清朝统治阶级掀起的“师夷长技以制夷”的洋务运动。',
        relatedIds: ['second-opium-war', 'japanese-war'],
      },
      {
        id: 'japanese-war',
        chapterId: 'modern-china',
        title: '甲午中日战争',
        year: 1894,
        yearEnd: 1895,
        location: '朝鲜半岛、黄海、辽东',
        figures: ['李鸿章', '慈禧太后', '明治天皇'],
        causes: '日本明治维新后走上扩张道路，为侵略朝鲜、中国而发动战争。',
        effects: '签订《马关条约》，大大加深了中国半殖民地化程度，列强掀起瓜分中国狂潮。',
        significance: '大大加深中国半殖民地化程度',
        summary: '日本明治维新后发动的侵华战争。',
        relatedIds: ['self-strengthening', 'hundred-days'],
      },
      {
        id: 'hundred-days',
        chapterId: 'modern-china',
        title: '戊戌变法',
        year: 1898,
        yearEnd: 1898,
        location: '北京',
        figures: ['康有为', '梁启超', '光绪帝'],
        causes: '甲午战败后民族危机加深，资产阶级维新派主张君主立宪变法图强。',
        effects: '失败告终，但起到思想启蒙作用，为辛亥革命奠定思想基础。',
        significance: '起到思想启蒙作用',
        summary: '资产阶级改良派发起的君主立宪改革运动。',
        relatedIds: ['japanese-war', 'xinhai-revolution'],
      },
      {
        id: 'xinhai-revolution',
        chapterId: 'modern-china',
        title: '辛亥革命',
        year: 1911,
        yearEnd: 1912,
        location: '武昌、南京',
        figures: ['孙中山', '黄兴', '袁世凯'],
        causes: '民族危机深重，革命派主张推翻清朝、建立共和。',
        effects: '推翻清朝统治，结束君主专制制度，建立中华民国。',
        significance: '结束君主专制制度',
        summary: '资产阶级革命派推翻清朝、建立中华民国的革命。',
        relatedIds: ['hundred-days', 'may-fourth'],
      },
      {
        id: 'may-fourth',
        chapterId: 'modern-china',
        title: '五四运动',
        year: 1919,
        yearEnd: 1919,
        location: '北京、上海',
        figures: ['陈独秀', '李大钊', '学生群体'],
        causes: '巴黎和会将德国在山东权益转让给日本，北京学生发起抗议运动。',
        effects: '中国工人阶级登上历史舞台，标志着新民主主义革命的开端。',
        significance: '新民主主义革命的开端',
        summary: '反帝反封建的爱国运动。',
        relatedIds: ['xinhai-revolution', 'founding-prc'],
      },
      {
        id: 'founding-prc',
        chapterId: 'modern-china',
        title: '中华人民共和国成立',
        year: 1949,
        yearEnd: 1949,
        location: '北京',
        figures: ['毛泽东', '周恩来'],
        causes: '中国人民在中国共产党领导下，经过长期革命斗争取得胜利。',
        effects: '中国结束半殖民地半封建社会，进入社会主义革命和建设时期。',
        significance: '中国历史的新纪元',
        summary: '中国共产党领导中国人民建立新中国的历史时刻。',
        relatedIds: ['may-fourth'],
      },
    ],
  },
};

export async function GET(
  _request: NextRequest,
  { params }: { params: { chapterId: string } },
) {
  const chapterId = params.chapterId || 'modern-china';

  try {
    const cached = getServerData<{ title: string; events: HistoryEvent[] }>(
      `history_events_${chapterId}`,
    );
    if (cached?.events?.length) {
      return NextResponse.json({ success: true, source: 'cache', data: { chapterId, ...cached } });
    }
  } catch {
    // ignore cache errors
  }

  const chapter = CHAPTERS[chapterId];
  if (!chapter) {
    return NextResponse.json(
      { success: false, message: '章节不存在' },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, source: 'demo', data: { chapterId, ...chapter } });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { chapterId: string } },
) {
  const chapterId = params.chapterId || 'modern-china';

  try {
    const textbook = await getActiveTextbook('history');
    if (!textbook) {
      return NextResponse.json({ success: false, message: '未找到历史教材，请先上传教材' }, { status: 404 });
    }

    const chapters = await getTextbookChapters(textbook.id);
    const matched = chapters?.find(
      (c) => String(c.chapterIndex) === chapterId || c.chapterTitle === chapterId,
    );
    if (!matched) {
      return NextResponse.json({ success: false, message: '章节不存在' }, { status: 404 });
    }

    const pdf = await getTextbookPDF(textbook.id);
    const text = pdf?.fullText || '';

    if (!text) {
      return NextResponse.json({ success: false, message: '教材内容为空' }, { status: 400 });
    }

    const { extractHistoryEvents } = await import('@/lib/historyExtractor');
    const events = await extractHistoryEvents(chapterId, text);

    const payload = { title: matched.chapterTitle, events };
    setServerData(`history_events_${chapterId}`, payload);

    return NextResponse.json({ success: true, source: 'extracted', data: { chapterId, ...payload } });
  } catch (error) {
    console.error('[history/timeline] 提取失败:', error);
    return NextResponse.json({ success: false, message: '提取历史事件失败' }, { status: 500 });
  }
}
