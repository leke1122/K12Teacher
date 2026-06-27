import { NextRequest, NextResponse } from 'next/server';
import { getChapterTextByPages, getLessonContent, getLessonTitle, getChapterTitle } from '@/lib/historyData.server';
import { setServerData } from '@/lib/serverStorage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// 历史知识点类型定义
export interface HistoryKnowledgePoint {
  id: string;
  name: string;
  type: 'event' | 'figure' | 'system' | 'concept';
  time: string;
  location: string;
  figures: string[];
  causes: string;
  process: string;
  effects: string;
  significance: string;
  memoryTip: string;
  relatedEvents: string[];
  source: string;
}

interface ExtractRequest {
  chapterId: string;
  startPage?: number;
  endPage?: number;
  forceRefresh?: boolean;
}

// 从 Supabase 获取教材内容
async function getTextbookContentFromSupabase(): Promise<{
  fullText?: string;
  pages?: { pageNumber: number; content: string }[];
  chapters?: unknown[];
} | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[API history/knowledge] Supabase未配置');
    return null;
  }

  try {
    console.log('[API history/knowledge] 开始查询Supabase，条件: user_id=personal-user, subject_id=history');

    const { data, error } = await supabase
      .from('textbook_cache')
      .select('*')
      .eq('user_id', 'personal-user')
      .eq('subject_id', 'history')
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('[API history/knowledge] Supabase查询错误:', error);
      return null;
    }

    if (!data) {
      console.log('[API history/knowledge] Supabase中没有找到历史教材记录');
      return null;
    }

    console.log('[API history/knowledge] Supabase查询成功:', {
      textbook_id: data.textbook_id,
      textbook_name: data.textbook_name,
      total_pages: data.total_pages,
      pages_count: data.pages?.length || 0,
      chapters_count: data.chapters?.length || 0,
      has_full_text: !!data.full_text,
      uploaded_at: data.uploaded_at
    });

    return {
      fullText: data.full_text,
      pages: data.pages as { pageNumber: number; content: string }[] || [],
      chapters: data.chapters as unknown[] || [],
    };
  } catch (err) {
    console.error('[API history/knowledge] Supabase读取异常:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtractRequest & { apiKey?: string } = await request.json().catch(() => ({}));
    const { chapterId, startPage, endPage, forceRefresh, apiKey: requestApiKey } = body;

    if (!chapterId) {
      return NextResponse.json({ success: false, message: '缺少章节ID' }, { status: 400 });
    }

    // 尝试从缓存获取（除非强制刷新）
    if (!forceRefresh) {
      try {
        const { getServerData } = await import('@/lib/serverStorage');
        const cached = getServerData<HistoryKnowledgePoint[]>(`history_knowledge_${chapterId}`);
        if (cached && Array.isArray(cached) && cached.length > 0) {
          return NextResponse.json({ success: true, data: cached, cached: true });
        }
      } catch {
        // 继续尝试提取
      }
    }

    // 获取教材内容 - 优先从 Supabase 获取（Vercel部署）
    let text: string | null = null;
    let textbookData: { pages?: { pageNumber: number; content: string }[]; chapters?: unknown[] } | null = null;

    // 1. 首先尝试从 Supabase 获取
    textbookData = await getTextbookContentFromSupabase();

    if (textbookData?.pages?.length) {
      const pages = textbookData.pages;
      const chapters = textbookData.chapters;

      // 判断是"课"还是"单元"
      const isLesson = chapterId.includes('课') || /^\d+$/.test(chapterId.replace(/第/g, ''));

      if (isLesson && chapters) {
        // 查找课
        for (const chapter of chapters) {
          const c = chapter as { sections?: { sectionIndex: string; sectionTitle: string; startPage: number; endPage: number }[] };
          if (c.sections) {
            const normalizedId = chapterId.replace(/第/g, '').replace(/课/g, '').trim();
            const section = c.sections.find((s) => {
              const sIndex = s.sectionIndex.replace(/第/g, '').replace(/课/g, '').trim();
              return sIndex === normalizedId || s.sectionIndex.includes(chapterId) || s.sectionTitle.includes(chapterId);
            });
            if (section) {
              text = pages
                .filter((p) => p.pageNumber >= section.startPage && p.pageNumber <= section.endPage)
                .map((p) => p.content)
                .join('\n\n');
              break;
            }
          }
        }
      }

      // 如果没找到课，尝试按页数范围或返回全部
      if (!text) {
        if (startPage !== undefined && endPage !== undefined) {
          text = pages
            .filter((p) => p.pageNumber >= startPage && p.pageNumber <= endPage)
            .map((p) => p.content)
            .join('\n\n');
        } else if (chapters) {
          // 尝试匹配单元
          for (const chapter of chapters) {
            const c = chapter as { chapterIndex: string; chapterTitle: string; startPage: number; endPage: number };
            if (c.chapterIndex === chapterId || c.chapterTitle.includes(chapterId)) {
              text = pages
                .filter((p) => p.pageNumber >= c.startPage && p.pageNumber <= c.endPage)
                .map((p) => p.content)
                .join('\n\n');
              break;
            }
          }
        }

        // 如果还是没找到，返回前几页
        if (!text && pages.length > 0) {
          text = pages.slice(0, 5).map((p) => p.content).join('\n\n');
        }
      }
    }

    // 2. 如果 Supabase 没有，尝试本地 serverStorage
    if (!text) {
      const isLesson = chapterId.includes('课') || /^\d+$/.test(chapterId.replace(/第/g, ''));
      if (isLesson) {
        text = getLessonContent(chapterId);
      }
      if (!text) {
        text = getChapterTextByPages(chapterId, startPage, endPage);
      }
    }

    if (!text) {
      return NextResponse.json(
        { success: false, message: '未找到教材内容，请先上传历史教材' },
        { status: 404 }
      );
    }

    const isLesson = chapterId.includes('课') || /^\d+$/.test(chapterId.replace(/第/g, ''));
    const title = isLesson ? (getLessonTitle(chapterId) || chapterId) : getChapterTitle(chapterId);

    // 优先使用请求中的 Key，其次使用环境变量
    const apiKey = requestApiKey || process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: '请先在设置页面配置 DeepSeek API Key' },
        { status: 400 }
      );
    }

    // 历史专用 AI 提示词 - 提取详细知识点
    const prompt = `你是一位严谨的历史教师。请从以下历史教材内容中提取详细的知识点。

## 核心原则
1. **严格基于教材**：所有内容必须从教材原文提取，不编造任何内容
2. **准确无误**：时间、地点、人物、事件名称必须与教材一致，不产生幻觉
3. **完整详细**：每个知识点要包含详细说明，不只是概括
4. **记忆辅助**：为每个知识点提供记忆口诀或关键词串联

## 提取规则
每个知识点必须包含以下 JSON 字段：
- id: 唯一标识，如 "k001"、"k002"
- name: 知识点名称（如"元谋人"、"商鞅变法"）
- type: 类型，值为 event（事件）、figure（人物）、system（制度）、concept（概念）
- time: 时间（具体年份或时期，如"约170万年前"）
- location: 地点（地理范围，如"云南元谋县"）
- figures: 相关重要人物数组（如["商鞅","秦孝公"]）
- causes: 原因（背景和动机）
- process: 过程（简要经过）
- effects: 影响（直接结果）
- significance: 历史意义（长期影响）
- memoryTip: 记忆口诀或关键词串联（如"商鞅变法：立木取信 → 废井田 → 奖励军功 → 推行县制"）
- relatedEvents: 相关联的历史事件数组
- source: 教材来源说明（如"第1课 中华文明的起源与早期国家"）

## 重要提示
- 提取 **8-15个** 知识点，不要太少
- 每个知识点的详细说明要完整，不能只写一句话概括
- 如果教材中没有明确信息，标注"教材未明确提及"
- 按教材顺序排列知识点
- memoryTip 要简洁易记，可以用箭头串联关键要素

## 教材章节：${title}

## 教材内容：
${text}

请以 JSON 数组格式返回，不要包含任何其他文本。`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个严格输出 JSON 的历史知识提取助手，必须只返回 JSON 数组，不要包含任何其他文字。内容必须基于教材原文，不编造任何信息。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'AI 请求失败');
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    // 解析 JSON
    let knowledge: HistoryKnowledgePoint[] = [];
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        knowledge = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('[API history/knowledge/extract] parse error:', parseError);
      return NextResponse.json(
        { success: false, message: '知识点解析失败' },
        { status: 500 }
      );
    }

    if (knowledge.length === 0) {
      return NextResponse.json(
        { success: false, message: '未提取到知识点' },
        { status: 500 }
      );
    }

    // 保存到缓存
    try {
      const { setServerData } = await import('@/lib/serverStorage');
      setServerData(`history_knowledge_${chapterId}`, knowledge);
    } catch {
      // 缓存失败不影响返回
    }

    return NextResponse.json({ success: true, data: knowledge, cached: false });
  } catch (error) {
    console.error('[API history/knowledge/extract] error:', error);
    return NextResponse.json(
      { success: false, message: '提取知识点失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
