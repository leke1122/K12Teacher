import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, getTextbook, getTextbookChapters } from '@/lib/supabase';

const USER_ID = 'personal-user';

// 获取指定教材的章节内容（供课本还原使用）
export async function GET(request: NextRequest) {
  const textbookId = request.nextUrl.searchParams.get('textbookId');
  const chapterId = request.nextUrl.searchParams.get('chapterId');

  if (!textbookId) {
    return NextResponse.json({ success: false, message: '缺少 textbookId 参数' }, { status: 400 });
  }

  try {
    // 尝试从数据库获取
    if (isSupabaseConfigured && supabase) {
      const textbook = await getTextbook(textbookId);
      if (textbook) {
        return NextResponse.json({ success: true, textbook, source: 'supabase' });
      }
    }
  } catch (e) {
    console.error('[textbook/read] 数据库查询失败:', e);
  }

  // 返回章节列表（基于已知的教材结构）
  const chapters = await getDefaultChapters(textbookId, chapterId);
  return NextResponse.json({ success: true, chapters, source: 'default' });
}

// 根据教材ID返回默认章节结构
async function getDefaultChapters(textbookId: string, focusChapterId?: string | null) {
  const structures: Record<string, Array<{ id: string; title: string; sections: string[]; content?: string; mustRemember?: string[] }>> = {
    'politics-compulsory-1': [
      {
        id: 'politics-compulsory-1-unit1',
        title: '第一单元 社会主义从空想到科学、从理论到实践的发展',
        sections: [
          '第一课 原始社会的解体和阶级社会的演进',
          '第二课 科学社会主义的理论与实践',
        ],
        mustRemember: [
          '生产关系一定要适应生产力，上层建筑一定要适应经济基础（人类社会发展的基本规律）',
          '生产社会化与生产资料私人占有的矛盾（资本主义基本矛盾）',
          '空想社会主义的三大局限性',
          '唯物史观+剩余价值学说=科学社会主义理论基石',
          '1848年《共产党宣言》标志科学社会主义诞生',
          '巴黎公社——第一个无产阶级政权',
          '十月革命——科学社会主义从理论到现实',
        ],
      },
      {
        id: 'politics-compulsory-1-unit2',
        title: '第二单元 只有社会主义才能救中国',
        sections: ['第一课 新民主主义革命的胜利', '第二课 社会主义制度的确立'],
        mustRemember: ['新民主主义革命的性质', '社会主义制度确立的意义'],
      },
      {
        id: 'politics-compulsory-1-unit3',
        title: '第三单元 只有中国特色社会主义才能发展中国',
        sections: ['第一课 伟大的改革开放', '第二课 中国特色社会主义的开创与发展'],
        mustRemember: ['改革开放的标志', '中国特色社会主义的创立与发展'],
      },
      {
        id: 'politics-compulsory-1-unit4',
        title: '第四单元 只有坚持和发展中国特色社会主义才能实现中华民族伟大复兴',
        sections: ['第一课 中国特色社会主义进入新时代', '第二课 实现中华民族伟大复兴的中国梦', '第三课 习近平新时代中国特色社会主义思想'],
        mustRemember: ['新时代的主要矛盾', '中国梦的本质', '习近平新时代中国特色社会主义思想'],
      },
    ],
  };

  return structures[textbookId] || [];
}
