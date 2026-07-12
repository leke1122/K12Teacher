import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, getTextbook, getTextbookChapters, getChapterDetail, findDocxImportByUnitTitle } from '@/lib/supabase';
import { getServerData, setServerData } from '@/lib/serverStorage';
import type { DocxParseResult } from '@/lib/docxParser';

// 辽宁高考历史知识点类型
export interface LnGaokaoKnowledgePoint {
  id: string;
  name: string;
  category: '政治' | '经济' | '思想' | '文化' | '军事' | '社会';
  time: string;
  dynasty: string;
  location: string;
  summary: string;
  impact: string;
  keyPeople: string[];
  importance: 1 | 2 | 3 | 4 | 5; // 重要性，5表示辽宁高考常考
  gaokaoFocus?: string; // 辽宁高考考点说明
  memoryTip?: string; // 记忆口诀
  relatedEvents: string[];
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  dynasty: string;
  summary: string;
  impact: string;
  category: string;
  importance: number;
  keyPeople: string[];
}

export interface CausalLink {
  id: string;
  sourceId: string;
  targetId: string;
  logic: string;
  type: '导致' | '促进' | '制约' | '推动';
}

export interface Concept {
  id: string;
  name: string;
  category: string;
  definition: string;
  keyPeople: string[];
  examples: string[];
}

export interface ExamFocus {
  conceptId: string;
  conceptName: string;
  frequency: '常考' | '必考' | '偶尔考';
  questionTypes: string[];
  difficulty: '易' | '中' | '难';
  typicalQuestions: string[];
}

export interface LnGaokaoKnowledge {
  timelineEvents: TimelineEvent[];
  causalLinks: CausalLink[];
  concepts: Concept[];
  examFocus: ExamFocus[];
  summary: string;
  unitTitle: string;
  pageRange: string;
}

// 辽宁高考历史命题特点
const LN_GAOKAO_FEATURES = `## 辽宁高考历史命题特点（必须遵循）

1. **唯物史观**：强调生产力决定生产关系，经济基础决定上层建筑
2. **家国情怀**：突出中华文明多元一体、统一多民族国家的发展
3. **时空观念**：重视时间轴和空间分布（如疆域变化、经济中心转移）
4. **史料实证**：常考从材料中提取信息的能力
5. **历史解释**：注重对历史事件的多角度评价
6. **周年热点**：重大历史事件的整数周年是命题重点
7. **阶段特征**：注重考查历史阶段的整体特征
8. **概念辨析**：对易混淆历史概念进行区分`;

interface ExtractRequest {
  textbookId?: string;
  chapterId: string;
  unitId?: string;
  pageStart?: number;
  pageEnd?: number;
  forceRefresh?: boolean;
  apiKey?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtractRequest = await request.json().catch(() => ({}));
    const { textbookId, chapterId, unitId, pageStart, pageEnd, forceRefresh, apiKey: requestApiKey } = body;

    if (!chapterId) {
      return NextResponse.json({ success: false, message: '缺少章节ID' }, { status: 400 });
    }

    // 构建缓存 key
    const cacheKey = `ln_gaokao_knowledge_${chapterId}_${unitId || ''}`;

    // ========== 优先级 1：检查是否有 docx 导入的数据 ==========
    // 多关键词兜底匹配，避免 chapterId/unitId 与 unit_title 不一致时漏掉已导入 docx
    const docxSearchTerms = [unitId, chapterId, '第一单元', '中国古代史'].filter(Boolean) as string[];
    for (const term of docxSearchTerms) {
      const docxImport = await findDocxImportByUnitTitle(term);
      if (docxImport?.data) {
        console.log('[extract-by-pages] 找到 docx 导入数据:', docxImport.id);
        return NextResponse.json({
          success: true,
          data: docxImport.data,
          source: 'docx_import',
          importId: docxImport.id,
          unitTitle: docxImport.unit_title,
          pageRange: docxImport.page_range,
          cached: false,
        });
      }
    }

    // ========== 优先级 2：检查 server 缓存 ==========
    if (!forceRefresh) {
      try {
        const cached = getServerData<LnGaokaoKnowledge>(cacheKey);
        if (cached && cached.timelineEvents?.length > 0) {
          return NextResponse.json({ success: true, data: cached, source: 'cache', cached: true });
        }
      } catch {
        // 继续提取
      }
    }

    // 获取教材内容和章节信息
    let pageContent = '';
    let unitTitle = chapterId;
    let actualPageStart = pageStart || 1;
    let actualPageEnd = pageEnd || 100;

    // 1. 尝试从 textbook_chapters 获取页数范围
    if (unitId || textbookId) {
      const chapters = await getTextbookChapters(textbookId || '');
      if (chapters && Array.isArray(chapters)) {
        const targetChapter = chapters.find(
          (ch: any) => ch.id === unitId || ch.chapter_title?.includes(chapterId)
        );
        if (targetChapter) {
          actualPageStart = targetChapter.page_start || actualPageStart;
          actualPageEnd = targetChapter.page_end || actualPageEnd;
          unitTitle = targetChapter.chapter_title || unitTitle;
        }
      }
    }

    // 2. 从 textbook_cache 读取指定页的文本
    if (isSupabaseConfigured && supabase) {
      try {
        // 获取教材缓存
        const textbookData = await getTextbook(textbookId || '');
        if (textbookData?.pages) {
          const pages = textbookData.pages as { pageNumber: number; content: string }[];
          const filteredPages = pages.filter(
            (p) => p.pageNumber >= actualPageStart && p.pageNumber <= actualPageEnd
          );
          pageContent = filteredPages.map((p) => `[第${p.pageNumber}页]\n${p.content}`).join('\n\n');
        } else if (textbookData?.full_text) {
          // 如果没有分页数据，返回提示
          pageContent = `[教材内容在第 ${actualPageStart}-${actualPageEnd} 页]\n\n注意：需要从 PDF 中提取指定页的文本内容`;
        }
      } catch (err) {
        console.error('[API history/knowledge/extract-by-pages] 获取教材失败:', err);
      }
    }

    // 如果没有获取到内容，返回友好提示
    if (!pageContent || pageContent.length < 100) {
      return NextResponse.json({
        success: false,
        message: `未找到教材第 ${actualPageStart}-${actualPageEnd} 页的内容。请确保已上传历史教材并导入目录。`,
        hint: '请先在"我的教材"页面上传历史教材 PDF，然后导入教材目录（单元/课/节及对应页数）',
      }, { status: 404 });
    }

    // 获取 API Key
    const apiKey = requestApiKey || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: '请先在设置页面配置 DeepSeek API Key' },
        { status: 400 }
      );
    }

    // 构建提取 Prompt（辽宁高考方向）
    const prompt = `你是一位辽宁省高中历史特级教师，精通辽宁高考历史命题规律。

${LN_GAOKAO_FEATURES}

## 教材内容（第 ${actualPageStart}-${actualPageEnd} 页）
${pageContent}

## 提取要求
请从以上教材内容中，按辽宁高考历史命题方向提取知识点，输出严格 JSON 格式：

### 1. timelineEvents（时间轴事件）
- 提取所有具有明确时间/朝代的历史事件（8-15个）
- 字段：id, year, title, dynasty, summary, impact, category, importance(1-5), keyPeople
- **重要**：辽宁高考常考的时间节点，importance 标记为 5
- category 只能是：政治/经济/思想/文化/军事/社会

### 2. causalLinks（因果链）
- 构建 "原因 → 结果" 的逻辑链条（5-8条）
- 字段：id, sourceId, targetId, logic, type
- type 只能是：导致/促进/制约/推动

### 3. concepts（核心概念）
- 提取名词解释（5-8个）
- 字段：id, name, category, definition, keyPeople, examples

### 4. examFocus（辽宁高考重点）
- 特别标注辽宁高考常考、必考的知识点（3-6个）
- 字段：conceptId, conceptName, frequency, questionTypes, difficulty, typicalQuestions

### 5. summary
- 该单元总体学习建议（3-5句话，辽宁高考视角）

## 输出格式（严格 JSON，不要任何其他文字）
{
  "timelineEvents": [...],
  "causalLinks": [...],
  "concepts": [...],
  "examFocus": [...],
  "summary": "..."
}`;

    // 调用 DeepSeek
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90秒超时

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个严格输出 JSON 的历史知识提取助手，必须只返回 JSON 数组或对象，不要包含任何其他文字。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'AI 请求失败');
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || '';

      // 解析 JSON
      let knowledge: LnGaokaoKnowledge;
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          knowledge = {
            timelineEvents: parsed.timelineEvents || [],
            causalLinks: parsed.causalLinks || [],
            concepts: parsed.concepts || [],
            examFocus: parsed.examFocus || [],
            summary: parsed.summary || '请参考教材内容学习',
            unitTitle: unitTitle,
            pageRange: `第 ${actualPageStart}-${actualPageEnd} 页`,
          };
        } else {
          throw new Error('无法解析返回内容');
        }
      } catch (parseError) {
        console.error('[API history/knowledge/extract-by-pages] parse error:', parseError);
        return NextResponse.json(
          { success: false, message: '知识点解析失败，请重试' },
          { status: 500 }
        );
      }

      // 保存到缓存
      try {
        setServerData(cacheKey, knowledge);
      } catch {
        // 缓存失败不影响返回
      }

      return NextResponse.json({ success: true, data: knowledge, source: 'ai_extraction', cached: false });
    } catch (apiError) {
      clearTimeout(timeoutId);
      if (apiError instanceof Error && apiError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, message: 'AI 处理超时，请减少内容或重试' },
          { status: 408 }
        );
      }
      throw apiError;
    }
  } catch (error) {
    console.error('[API history/knowledge/extract-by-pages] error:', error);
    return NextResponse.json(
      { success: false, message: '提取知识点失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

// GET 请求：获取章节列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const textbookId = searchParams.get('textbookId');
    const subjectId = searchParams.get('subject') || 'history';

    if (!textbookId) {
      return NextResponse.json({ success: false, message: '缺少 textbookId' }, { status: 400 });
    }

    const chapters = await getTextbookChapters(textbookId);
    if (!chapters) {
      return NextResponse.json({ success: true, chapters: [] });
    }

    // 按层级结构组织
    const unitChapters = chapters.filter((ch: any) => !ch.parent_id || ch.chapter_type === 'unit');
    const lessonChapters = chapters.filter((ch: any) => ch.parent_id && ch.chapter_type === 'lesson');

    return NextResponse.json({
      success: true,
      chapters,
      units: unitChapters,
      lessons: lessonChapters,
    });
  } catch (error) {
    console.error('[API history/knowledge/extract-by-pages] GET error:', error);
    return NextResponse.json(
      { success: false, message: '获取章节列表失败' },
      { status: 500 }
    );
  }
}
