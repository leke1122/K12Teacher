import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, getTextbooks, getTextbook, saveTextbookCache, getTextbookChapters, saveTextbookChapters, type TextbookChapter } from '@/lib/supabase';
import { setServerData } from '@/lib/serverStorage';

const USER_ID = 'personal-user';

// 教材目录结构（供前端选择）
const DEFAULT_TEXTBOOK_STRUCTURE = [
  {
    id: 'politics-compulsory-1',
    title: '必修1 中国特色社会主义',
    units: [
      { id: 'politics-compulsory-1-unit1', title: '第一单元 社会主义从空想到科学、从理论到实践的发展', sections: ['第一课 社会主义从空想到科学', '第二课 社会主义从理想到现实', '第三课 社会主义从理想到现实'] },
      { id: 'politics-compulsory-1-unit2', title: '第二单元 只有社会主义才能救中国', sections: ['第一课 新民主主义革命的胜利', '第二课 社会主义制度的确立'] },
      { id: 'politics-compulsory-1-unit3', title: '第三单元 只有中国特色社会主义才能发展中国', sections: ['第一课 伟大的改革开放', '第二课 中国特色社会主义的开创与发展'] },
      { id: 'politics-compulsory-1-unit4', title: '第四单元 只有坚持和发展中国特色社会主义才能实现中华民族伟大复兴', sections: ['第一课 中国特色社会主义进入新时代', '第二课 实现中华民族伟大复兴的中国梦', '第三课 习近平新时代中国特色社会主义思想'] },
    ],
  },
  {
    id: 'politics-compulsory-2',
    title: '必修2 经济与社会',
    units: [
      { id: 'politics-compulsory-2-unit1', title: '第一单元 生产与经济制度', sections: ['第一课 我国的生产资料所有制', '第二课 我国的个人收入分配'] },
      { id: 'politics-compulsory-2-unit2', title: '第二单元 经济发展', sections: ['第一课 我国的经济发展', '第二课 现代化经济体系'] },
      { id: 'politics-compulsory-2-unit3', title: '第三单元 社会与社会', sections: ['第一课 坚持新发展理念', '第二课 推动高质量发展', '第三课 我国的个人收入分配与社会保障'] },
    ],
  },
  {
    id: 'politics-compulsory-3',
    title: '必修3 政治与法治',
    units: [
      { id: 'politics-compulsory-3-unit1', title: '第一单元 中国共产党的领导', sections: ['第一课 历史和人民的选择', '第二课 中国共产党的先进性'] },
      { id: 'politics-compulsory-3-unit2', title: '第二单元 人民当家作主', sections: ['第一课 我国的基本政治制度', '第二课 我国的国体与根本政治制度', '第三课 我国的基本政治制度'] },
      { id: 'politics-compulsory-3-unit3', title: '第三单元 全面依法治国', sections: ['第一课 全面依法治国的地位', '第二课 全面推进依法治国'] },
    ],
  },
  {
    id: 'politics-compulsory-4',
    title: '必修4 哲学与文化',
    units: [
      { id: 'politics-compulsory-4-unit1', title: '第一单元 探索世界与把握规律', sections: ['第一课 时代精神的精华', '第二课 探究世界的本质', '第三课 把握世界的规律'] },
      { id: 'politics-compulsory-4-unit2', title: '第二单元 认识社会与价值选择', sections: ['第一课 探索认识的奥秘', '第二课 追求意义的学问'] },
      { id: 'politics-compulsory-4-unit3', title: '第三单元 思想方法与创新意识', sections: ['第一课 唯物辩证法的联系观', '第二课 唯物辩证法的发展观', '第三课 唯物辩证法的矛盾观', '第四课 创新思维'] },
      { id: 'politics-compulsory-4-unit4', title: '第四单元 文化传承与文化创新', sections: ['第一课 文化的功能', '第二课 文化的传承与创新', '第三课 弘扬中华优秀传统文化与民族精神', '第四课 发展中国特色社会主义文化'] },
    ],
  },
  {
    id: 'politics-selective-1',
    title: '选择性必修1 当代国际政治与经济',
    units: [
      { id: 'politics-selective-1-unit1', title: '第一单元 各具特色的国家', sections: ['第一课 国体与政体', '第二课 国家的结构形式', '第三课 国际组织'] },
      { id: 'politics-selective-1-unit2', title: '第二单元 世界多极化', sections: ['第一课 世界多极化的形成', '第二课 复杂多变的国际关系', '第三课 国际关系'] },
    ],
  },
  {
    id: 'politics-selective-2',
    title: '选择性必修2 法律与生活',
    units: [
      { id: 'politics-selective-2-unit1', title: '第一单元 民事权利与义务', sections: ['第一课 认真对待民事权利与义务', '第二课 积极维护人身权利', '第三课 依法保护财产权', '第四课 侵权责任'] },
      { id: 'politics-selective-2-unit2', title: '第二单元 家庭与婚姻', sections: ['第一课 家庭与婚姻', '第二课 婚姻家庭'] },
    ],
  },
  {
    id: 'politics-selective-3',
    title: '选择性必修3 逻辑与思维',
    units: [
      { id: 'politics-selective-3-unit1', title: '第一单元 树立科学思维', sections: ['第一课 走进思维', '第二课 逻辑思维的基本要求'] },
      { id: 'politics-selective-3-unit2', title: '第二单元 遵循逻辑思维的要求', sections: ['第一课 逻辑思维的基本要求', '第二课 把握逻辑规则'] },
    ],
  },
];

// 获取教材列表和目录结构
export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action') || 'list';
  const textbookId = request.nextUrl.searchParams.get('textbookId');

  if (action === 'list') {
    // 返回默认教材目录结构
    if (isSupabaseConfigured && supabase) {
      try {
        const textbooks = await getTextbooks('politics');
        const dbTextbooks = textbooks || [];
        return NextResponse.json({
          success: true,
          textbooks: dbTextbooks.length > 0 ? dbTextbooks : DEFAULT_TEXTBOOK_STRUCTURE,
          source: 'supabase',
        });
      } catch {
        return NextResponse.json({ success: true, textbooks: DEFAULT_TEXTBOOK_STRUCTURE, source: 'default' });
      }
    }
    return NextResponse.json({ success: true, textbooks: DEFAULT_TEXTBOOK_STRUCTURE, source: 'default' });
  }

  if (action === 'textbook' && textbookId) {
    const tb = await getTextbook(textbookId);
    if (tb) {
      return NextResponse.json({ success: true, textbook: tb });
    }
    // 从默认结构中查找
    for (const book of DEFAULT_TEXTBOOK_STRUCTURE) {
      if (book.id === textbookId) {
        return NextResponse.json({ success: true, textbook: book });
      }
    }
    return NextResponse.json({ success: false, message: '教材不存在' }, { status: 404 });
  }

  return NextResponse.json({ success: false, message: '未知操作' }, { status: 400 });
}

// 上传教材 PDF 并提取目录
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const textbookId = formData.get('textbookId') as string | null;
    const textbookName = formData.get('textbookName') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: '未接收到文件' }, { status: 400 });
    }

    // 简单检查文件类型
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
      return NextResponse.json({ success: false, message: '仅支持 PDF 或 Word 文档' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileSize = buffer.length;

    console.log('[politics/textbook/upload] 上传文件:', file.name, `${(fileSize / 1024 / 1024).toFixed(2)}MB`);

    // 保存到 Supabase 或本地存储
    const saveData = {
      subject_id: 'politics',
      textbook_id: textbookId || `textbook_${Date.now()}`,
      textbook_name: textbookName || file.name.replace(/\.(pdf|docx?|doc)$/i, ''),
      file_name: file.name,
      file_size: fileSize,
      uploaded_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      await saveTextbookCache(saveData);
    } else {
      setServerData(`textbook_${textbookId || Date.now()}`, saveData);
    }

    return NextResponse.json({
      success: true,
      message: '上传成功',
      textbookId: saveData.textbook_id,
      textbookName: saveData.textbook_name,
      fileSize: saveData.file_size,
    });
  } catch (error) {
    console.error('[politics/textbook/upload] error:', error);
    return NextResponse.json({
      success: false,
      message: '上传失败：' + (error instanceof Error ? error.message : '未知错误'),
    }, { status: 500 });
  }
}
