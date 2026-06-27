import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { BANTU_MATH_B1 } from '@/lib/chapterPageMapping';
import { detectTextbookType, extractComplexStructure, type Chapter as ComplexChapter, type ExtractedStructure } from '@/lib/structureExtractor';

interface PageRange {
  type: 'printed' | 'file';
  start: number;
  end: number;
  fileStart?: number;
  fileEnd?: number;
}

interface SubSection {
  title: string;
  pages: PageRange;
}

interface Section {
  sectionIndex: string;
  sectionTitle: string;
  pages: PageRange;
  subSections?: SubSection[];
}

interface Chapter {
  chapterIndex: number;
  chapterTitle: string;
  pages: PageRange;
  sections?: Section[];
}

function resolvePageRange(input: unknown): PageRange {
  const raw = input as Record<string, unknown>;
  const type = raw.type === 'printed' ? 'printed' : 'file';
  const start = Number(raw.start ?? raw.startPage ?? 1);
  const end = Number(raw.end ?? raw.endPage ?? 999);
  const fileStart = raw.fileStart !== undefined ? Number(raw.fileStart) : undefined;
  const fileEnd = raw.fileEnd !== undefined ? Number(raw.fileEnd) : undefined;
  return {
    type,
    start: Number.isFinite(start) ? start : 1,
    end: Number.isFinite(end) ? end : 999,
    ...(Number.isFinite(fileStart!) ? { fileStart } : {}),
    ...(Number.isFinite(fileEnd!) ? { fileEnd } : {}),
  };
}

function toLegacyChapter(ch: unknown): { chapterIndex: number; chapterTitle: string; startPage: number; endPage: number; sections: { sectionIndex: string; sectionTitle: string; startPage: number; endPage: number; subSections?: { title: string; startPage: number; endPage: number }[] }[] } {
  const raw = ch as Record<string, unknown>;
  const pages = resolvePageRange(raw.pages);
  const sections = ((raw.sections || []) as unknown[]).map((s) => {
    const sectionPages = resolvePageRange((s as Record<string, unknown>).pages);
    return {
      sectionIndex: String((s as Record<string, unknown>).sectionIndex || '').trim(),
      sectionTitle: String((s as Record<string, unknown>).sectionTitle || '').trim(),
      startPage: sectionPages.start,
      endPage: sectionPages.end,
      subSections: (((s as Record<string, unknown>).subSections || []) as unknown[]).map((sub) => {
        const subPages = resolvePageRange((sub as Record<string, unknown>).pages);
        return {
          title: String((sub as Record<string, unknown>).title || '').trim(),
          startPage: subPages.start,
          endPage: subPages.end,
        };
      }),
    };
  });
  return {
    chapterIndex: Number(raw.chapterIndex) || 0,
    chapterTitle: String(raw.chapterTitle || '').trim(),
    startPage: pages.start,
    endPage: pages.end,
    sections,
  };
}

function findTocWindow(text: string): { start: number; end: number } | null {
  const keywords = [
    '目 录',
    '目录',
    'CONTENTS',
    'Contents',
    '目次',
    'TABLE OF CONTENTS',
    'Table of Contents',
  ];
  for (const kw of keywords) {
    const idx = text.indexOf(kw);
    if (idx !== -1) {
      const start = Math.max(0, idx - 200);
      const end = Math.min(text.length, idx + 6000);
      return { start, end };
    }
  }
  return null;
}

/** 从硬编码映射表构建完整章节结构 */
function buildHardcodedChapters(): Chapter[] {
  const chapterMap: Record<string, { title: string; sections: Record<string, string> }> = {
    '1': { title: '集合与常用逻辑用语', sections: {
      '1.1': '集合',
      '1.2': '常用逻辑用语',
    }},
    '2': { title: '相等关系与不等关系', sections: {
      '2.1': '等式与不等式',
      '2.2': '不等式',
    }},
    '3': { title: '函数', sections: {
      '3.1': '函数',
      '3.2': '函数与方程、不等式之间的关系',
      '3.3': '函数的应用（一）',
      '3.4': '数学建模活动：决定苹果的最佳出售时间点',
    }},
  };

  // 按 PDF 页码排序小节，确定章/节边界
  const orderedSections = Object.entries(BANTU_MATH_B1)
    .sort(([, a], [, b]) => a.startPage - b.startPage);

  const chapters: Chapter[] = [];
  let currentChapterNum = '';
  let currentChapter: Chapter | null = null;
  let currentSectionKey = '';
  let currentSection: Section | null = null;

  for (const [sectionId, range] of orderedSections) {
    const [chNum, secNum] = sectionId.split('.');
    const chapterNum = chNum;

    if (chapterNum !== currentChapterNum) {
      if (currentChapter) chapters.push(currentChapter);
      currentChapterNum = chapterNum;
      currentChapter = {
        chapterIndex: Number(chapterNum),
        chapterTitle: chapterMap[chapterNum]?.title ?? `第${chapterNum}章`,
        pages: { type: 'file', start: range.startPage, end: range.endPage },
        sections: [],
      };
      currentSectionKey = chapterNum;
      currentSection = null;
    }

    const sectionKey = `${chapterNum}.${secNum}`;
    if (sectionKey !== currentSectionKey) {
      currentSectionKey = sectionKey;
      currentSection = {
        sectionIndex: sectionKey,
        sectionTitle: chapterMap[chapterNum]?.sections[sectionKey] ?? sectionKey,
        pages: { type: 'file', start: range.startPage, end: range.endPage },
        subSections: [],
      };
      currentChapter!.sections!.push(currentSection);
    }

    if (currentSection) {
      currentSection.subSections!.push({
        title: BANTU_MATH_B1[sectionId] ? sectionId : sectionId,
        pages: { type: 'file', start: range.startPage, end: range.endPage },
      });
      currentSection.pages.end = range.endPage;
    }

    if (currentChapter) {
      currentChapter.pages.end = range.endPage;
    }
  }

  if (currentChapter) chapters.push(currentChapter);
  return chapters;
}

// 历史教材章节提取专用函数
async function extractHistoryChapters(text: string, apiKey: string, forceRefresh: boolean = false) {
  console.log('[历史提取] 🔍 开始历史教材章节提取');
  console.log('[历史提取] 文本长度:', text.length);
  console.log('[历史提取] 强制刷新:', forceRefresh);

  const tocWindow = findTocWindow(text);
  const tocHint = tocWindow
    ? `\n\n【目录片段】\n${text.slice(tocWindow.start, tocWindow.end)}\n`
    : '\n\n【提示】未找到明显目录关键词，请从全文自行识别章节结构。\n';

  if (tocWindow) {
    console.log('[历史提取] 📑 找到目录片段，位置:', tocWindow.start, '-', tocWindow.end);
  } else {
    console.log('[历史提取] ⚠️ 未找到明确目录，将从全文识别');
  }

  // 历史教材专用提示词
  const prompt = `你是一位历史教材解析专家。请从以下历史教材目录中提取完整的章节结构。

## 历史教材结构说明
历史教材的结构是：单元 → 课 → 子目
- 第1级：单元（如"第一单元 从中华文明起源到秦汉统一多民族封建国家的建立与巩固"）
- 第2级：课（如"第1课 中华文明的起源与早期国家"）
- 第3级：子目（如"一、石器时代的古人类和文化遗存"）

## 提取规则
1. 提取所有"单元"及其完整标题
2. 在每个单元下，提取所有"课"（如"第1课"、"第2课"等）
3. 如果目录中有"子目"（如"一、二、三"），也一并提取
4. 每课必须包含：课序号（如"第1课"）、课标题、起始页、结束页
5. 页码必须是数字，可以是教材页码或PDF文件页码
6. 严格按照教材目录提取，不要合并或省略任何课

## 输出格式（严格JSON）
{
  "meta": {
    "pageType": "printed" | "file",
    "offset": 0,
    "chapterFormat": "第X单元",
    "sectionFormat": "第X课"
  },
  "chapters": [
    {
      "chapterIndex": 1,
      "chapterTitle": "第一单元 从中华文明起源到秦汉统一多民族封建国家的建立与巩固",
      "pages": {
        "type": "file",
        "start": 1,
        "end": 48
      },
      "sections": [
        {
          "sectionIndex": "第1课",
          "sectionTitle": "中华文明的起源与早期国家",
          "pages": {
            "type": "file",
            "start": 1,
            "end": 8
          },
          "subSections": [
            {"title": "一、石器时代的古人类和文化遗存", "pages": {"type": "file", "start": 1, "end": 3}},
            {"title": "二、从部落到国家", "pages": {"type": "file", "start": 4, "end": 6}},
            {"title": "三、商周政治制度", "pages": {"type": "file", "start": 7, "end": 8}}
          ]
        },
        {
          "sectionIndex": "第2课",
          "sectionTitle": "诸侯纷争与变法运动",
          "pages": {
            "type": "file",
            "start": 9,
            "end": 16
          },
          "subSections": []
        },
        {
          "sectionIndex": "第3课",
          "sectionTitle": "秦统一多民族封建国家的建立",
          "pages": {
            "type": "file",
            "start": 17,
            "end": 24
          },
          "subSections": []
        },
        {
          "sectionIndex": "第4课",
          "sectionTitle": "西汉与东汉——统一多民族封建国家的巩固",
          "pages": {
            "type": "file",
            "start": 25,
            "end": 32
          },
          "subSections": []
        }
      ]
    },
    {
      "chapterIndex": 2,
      "chapterTitle": "第二单元 三国两晋南北朝民族交融与隋唐统一多民族封建国家的发展",
      "pages": {
        "type": "file",
        "start": 33,
        "end": 80
      },
      "sections": [
        {
          "sectionIndex": "第5课",
          "sectionTitle": "三国两晋南北朝的政权更迭与民族交融",
          "pages": {"type": "file", "start": 33, "end": 40},
          "subSections": []
        },
        {
          "sectionIndex": "第6课",
          "sectionTitle": "从隋唐盛世到安史之乱",
          "pages": {"type": "file", "start": 41, "end": 48},
          "subSections": []
        },
        {
          "sectionIndex": "第7课",
          "sectionTitle": "隋唐制度的变化与创新",
          "pages": {"type": "file", "start": 49, "end": 56},
          "subSections": []
        },
        {
          "sectionIndex": "第8课",
          "sectionTitle": "唐朝的中外文化交流",
          "pages": {"type": "file", "start": 57, "end": 64},
          "subSections": []
        }
      ]
    }
  ]
}

${tocHint}

## 教材文本
${text.slice(0, 40000)}

## 最终要求
1. 只输出 JSON，不要任何其他文字。
2. JSON 必须可被 JSON.parse 解析。
3. 页码必须是数字。
4. 必须提取所有课，不能遗漏任何一课。`;

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个严格输出 JSON 的历史教材目录解析助手，必须只返回 JSON 对象，不要包含任何其他文字。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      max_tokens: 8000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'AI 请求失败');
  }

  const data = await response.json();
  const result = data.choices?.[0]?.message?.content || '';

  console.log('[历史章节提取] AI 返回原文（前1000字符）:', result.slice(0, 1000));

  let parsed: Record<string, unknown> | null = null;
  const jsonMatch = result.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    } catch {
      const cleanedJson = jsonMatch[0]
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/'/g, '"');
      try {
        parsed = JSON.parse(cleanedJson) as Record<string, unknown>;
      } catch {
        console.error('[历史章节提取] JSON 解析失败:', jsonMatch[0].slice(0, 500));
        return NextResponse.json({
          chapters: [],
          error: 'AI 返回格式不正确',
          rawResponse: result.slice(0, 500)
        }, { status: 422 });
      }
    }
  }

  if (!parsed) {
    return NextResponse.json({
      chapters: [],
      error: 'AI 未返回有效的 JSON 格式'
    }, { status: 422 });
  }

  // 验证和转换章节数据
  const chapters = Array.isArray(parsed?.chapters) ? (parsed.chapters as unknown[]) : [];

  const validatedChapters: Chapter[] = chapters
    .filter((ch): ch is Record<string, unknown> => {
      const raw = ch as Record<string, unknown>;
      return Boolean(raw.chapterIndex != null && raw.chapterTitle && raw.pages);
    })
    .map((ch) => {
      const raw = ch as Record<string, unknown>;
      const pages = resolvePageRange(raw.pages);
      const sections = ((raw.sections || []) as unknown[])
        .filter((s): s is Record<string, unknown> => {
          const sr = s as Record<string, unknown>;
          return Boolean((sr.sectionIndex || sr.sectionTitle) && sr.pages);
        })
        .map((s) => {
          const sr = s as Record<string, unknown>;
          const sectionPages = resolvePageRange(sr.pages);
          const subSections = ((sr.subSections || []) as unknown[])
            .filter((sub): sub is Record<string, unknown> => {
              const subr = sub as Record<string, unknown>;
              return Boolean(subr.title && subr.pages);
            })
            .map((sub) => {
              const subr = sub as Record<string, unknown>;
              const subPages = resolvePageRange(subr.pages);
              return {
                title: String(subr.title).trim(),
                pages: subPages,
              };
            });
          return {
            sectionIndex: String(sr.sectionIndex || sr.sectionTitle || '').trim(),
            sectionTitle: String(sr.sectionTitle || sr.sectionIndex || '').trim(),
            pages: sectionPages,
            subSections,
          };
        });
      return {
        chapterIndex: Number(raw.chapterIndex),
        chapterTitle: String(raw.chapterTitle).trim(),
        pages,
        sections: sections || [],
      };
    });

  const legacyChapters = validatedChapters.map(toLegacyChapter);

  // 详细日志
  console.log(`[历史章节提取] ✅ 提取完成！`);
  console.log(`[历史章节提取] 📊 统计: ${validatedChapters.length} 个单元`);
  validatedChapters.forEach((ch, i) => {
    const sectionsCount = ch.sections?.length || 0;
    console.log(`[历史章节提取] ${i + 1}. ${ch.chapterTitle} (${sectionsCount}课)`);
    ch.sections?.forEach((sec, j) => {
      console.log(`[历史章节提取]   ${j + 1}. ${sec.sectionIndex} ${sec.sectionTitle}`);
    });
  });

  // 验证 sections 完整性
  const totalSections = validatedChapters.reduce((sum, ch) => sum + (ch.sections?.length || 0), 0);
  console.log(`[历史章节提取] 📈 总计: ${totalSections} 课`);
  if (totalSections === 0) {
    console.warn('[历史章节提取] ⚠️ 警告: 没有提取到任何课！');
  }

  return NextResponse.json({ chapters: validatedChapters, legacyChapters, source: 'history' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, apiKey, subjectId, textbookId, refresh } = body as Record<string, string | boolean>;

    // 强制刷新标志
    const forceRefresh = refresh === true || refresh === 'true';

    if (!apiKey) {
      return NextResponse.json({ error: '请先配置 DeepSeek API Key' }, { status: 400 });
    }
    const apiKeyStr = String(apiKey);

    if (!subjectId) {
      return NextResponse.json({ error: '缺少 subjectId 参数，无法按学科隔离存储' }, { status: 400 });
    }

    // 确保 text 是字符串类型
    const textContent = typeof text === 'string' ? text : '';

    if (!textContent || textContent.trim().length < 100) {
      return NextResponse.json({ error: 'PDF 文本内容不足，无法提取章节' }, { status: 400 });
    }

    console.log('[章节提取] 当前学科:', subjectId);
    console.log('[章节提取] 当前教材:', textbookId || '默认教材');
    console.log('[章节提取] 文本长度:', textContent.length);
    console.log('[章节提取] 强制刷新:', forceRefresh);
    console.log('[章节提取] 文本前200字:', textContent.substring(0, 200));

    // 仅数学学科允许使用硬编码兜底，避免其他学科误匹配为数学章节
    const isMathSubject = subjectId === 'math';
    if (isMathSubject) {
      const hasMathB = textContent.includes('数学（B版）');
      const hasMathBRequired = textContent.includes('数学（B版）必修');
      const hasAllMathRequired =
        !textContent.includes('语文') &&
        textContent.includes('普通高中教科书') &&
        textContent.includes('数学') &&
        textContent.includes('必修');
      const isBantuMathB1 = hasMathB || hasMathBRequired || hasAllMathRequired;

      console.log('[提取章节] 数学检测: hasMathB=' + hasMathB + ' hasMathBRequired=' + hasMathBRequired + ' hasAllMathRequired=' + hasAllMathRequired + ' => isBantuMathB1=' + isBantuMathB1);

      if (isBantuMathB1) {
        console.log('[提取章节] 检测到 B版数学必修第一册，使用硬编码章节数据');
        const validatedChapters = buildHardcodedChapters();
        const legacyChapters = validatedChapters.map(toLegacyChapter);
        return NextResponse.json({ chapters: validatedChapters, legacyChapters, source: 'hardcoded' });
      }
    }

    // 检测是否为历史教材 - 增强检测逻辑
    const isHistoryTextbook =
      textContent.includes('第一单元') ||
      textContent.includes('第1课') ||
      textContent.includes('中外历史纲要') ||
      textContent.includes('从中华文明起源到秦汉') ||
      textContent.includes('中华文明的起源') ||
      textContent.includes('鸦片战争') ||
      textContent.includes('辛亥革命') ||
      textContent.includes('新民主主义革命') ||
      textContent.includes('社会主义制度') ||
      textContent.includes('改革开放') ||
      /第[一二三四五六七八九十百]+单元/.test(textContent) ||
      /第[一二三四五六七八九十百零]+课/.test(textContent);

    if (isHistoryTextbook) {
      console.log('[提取章节] ✅ 检测到历史教材，使用历史专用提取逻辑');
      console.log('[提取章节] 历史教材检测依据:', {
        hasUnit: textContent.includes('单元'),
        hasLesson: textContent.includes('课'),
        hasOutline: textContent.includes('中外历史纲要'),
        hasAncientChina: textContent.includes('中华文明起源'),
        hasModernChina: textContent.includes('鸦片战争') || textContent.includes('辛亥革命')
      });
      return await extractHistoryChapters(textContent, apiKeyStr, forceRefresh);
    } else {
      console.log('[提取章节] ❌ 未检测到历史教材特征，使用通用提取逻辑');
    }

    const textbookType = detectTextbookType(textContent, typeof subjectId === 'string' ? subjectId : undefined);
    console.log('[结构提取] 📚 教材类型检测:', textbookType, '学科:', subjectId);

    if (textbookType === 'complex') {
      console.log('[结构提取] 🏗️ 检测到复杂结构教材，使用两阶段提取法');
      try {
        const complexResult = await extractComplexStructure(textContent, apiKeyStr);
        const legacyChapters = complexResult.chapters.map(toLegacyChapter);
        console.log(`[结构提取] ✅ 复杂教材提取完成，共 ${complexResult.chapters.length} 个单元`);
        return NextResponse.json({ chapters: complexResult.chapters, legacyChapters, source: complexResult.source });
      } catch (error) {
        console.error('[结构提取] ❌ 复杂教材提取失败，回退到通用提取:', error);
        console.log('[结构提取] ⚠️ 两阶段提取失败，使用通用单次提取作为兜底');
      }
    } else if (textbookType === 'linear') {
      console.log('[结构提取] 📐 检测到线性结构教材，使用原始单次提取逻辑');
    } else {
      console.log('[结构提取] ❓ 教材类型未知，使用原始单次提取逻辑');
    }

    const openai = createOpenAI({
      apiKey: apiKeyStr,
      baseURL: 'https://api.deepseek.com/v1',
    });

    const tocWindow = findTocWindow(textContent);
    const tocHint = tocWindow
      ? `\n\n【目录片段】\n${textContent.slice(tocWindow.start, tocWindow.end)}\n`
      : '\n\n【提示】未找到明显目录关键词，请从全文自行识别章节结构。\n';

    const prompt = `你是一个通用教材目录解析器，必须适配任意格式、任意语种、任意页码体系的教材。

## 任务
从给定教材文本中，自动识别目录位置，解析章/节/小节结构，并建立页码映射关系。

## 强制规则
1. 不得预设章节格式：支持“第X章 / X. / Chapter X / UNIT X / 第X单元”等任意形式。
2. 不得预设节的格式：支持“X.X / X.X.X / (1) / 1) / 一、 / A.”等任意形式。
3. 不得预设页码格式：正文页码可以是“第X页 / Page X / - X - / 行尾[1] / 无页码”等。
4. 必须完整提取：目录中出现的层级项必须逐条输出，不得概括、合并、省略。
5. 只输出 JSON，不输出解释。
6. 页码字段必须是数字。

## 输出格式
{
  "meta": {
    "pageType": "printed" | "file",
    "offset": 0,
    "chapterFormat": "第X章" | "X." | "Chapter X" | "UNIT X" | "第X单元" | "other",
    "sectionFormat": "X.X" | "X.X.X" | "number" | "other"
  },
  "chapters": [
    {
      "chapterIndex": 1,
      "chapterTitle": "字符串形式的章节标题",
      "pages": {
        "type": "printed" | "file",
        "start": 1,
        "end": 42,
        "fileStart": 8,
        "fileEnd": 49
      },
      "sections": [
        {
          "sectionIndex": "1.1",
          "sectionTitle": "小节标题",
          "pages": {
            "type": "printed",
            "start": 3,
            "end": 22,
            "fileStart": 10,
            "fileEnd": 29
          },
          "subSections": [
            {"title": "1.1.1 集合及其表示方法", "pages": {"type": "printed", "start": 3, "end": 9, "fileStart": 10, "fileEnd": 18}}
          ]
        }
      ]
    }
  ]
}

## 页码映射规则
- pageType = "printed"：目录中的页码是教材标注页码；需通过正文页码标记换算为 PDF 文件页码。
- pageType = "file"：目录中的页码本身就是 PDF 文件页码，或教材无页码；fileStart = start, fileEnd = end。
- offset = 正文第一个页码标记对应的文件页码 - 正文第一个页码标记对应的标注页码。
- 若正文没有任何页码标记，则 pageType = "file"，offset = 0，fileStart/fileEnd 省略。

## 容错规则
- 若无法判断页码类型，默认使用 "file"。
- 若某层级无小节，subSections 输出 []。
- 若无法确定章节边界，尽量按相邻下一项推断。
- 若某章/节在正文中找不到对应页码标记，允许沿用目录页码作为文件页码估算。

${tocHint}

## 教材文本
${textContent.slice(0, 40000)}

## 最终要求
1. 只输出 JSON，不要任何其他文字。
2. JSON 必须可被 JSON.parse 解析。
3. 页码必须是数字。
4. 目录有多少项就提取多少项，禁止概括、合并、省略。`;

    const { text: result } = await generateText({
      model: openai('deepseek-chat'),
      prompt,
      temperature: 0,
      maxTokens: 20000,
    });

    console.log('[提取章节] AI 返回原文（前1000字符）:', result.slice(0, 1000));

    let parsed: Record<string, unknown> | null = null;
    const jsonMatch = result.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      } catch {
        const cleanedJson = jsonMatch[0]
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']')
          .replace(/'/g, '"');
        try {
          parsed = JSON.parse(cleanedJson) as Record<string, unknown>;
        } catch {
          console.error('[提取章节] JSON 解析失败，原始内容:', jsonMatch[0].slice(0, 500));
          return NextResponse.json({
            chapters: [],
            error: 'AI 返回格式不正确，已记录，请重试',
            rawResponse: result.slice(0, 500)
          }, { status: 422 });
        }
      }
    } else {
      console.error('[提取章节] 未找到 JSON 对象，原始内容:', result.slice(0, 500));
      return NextResponse.json({
        chapters: [],
        error: 'AI 未返回有效的 JSON 格式',
        rawResponse: result.slice(0, 500)
      }, { status: 422 });
    }

    const chapters = Array.isArray(parsed?.chapters) ? (parsed.chapters as unknown[]) : [];

    const validatedChapters: Chapter[] = chapters
      .filter((ch): ch is Record<string, unknown> => {
        const raw = ch as Record<string, unknown>;
        return Boolean(raw.chapterIndex != null && raw.chapterTitle && raw.pages);
      })
      .map((ch) => {
        const raw = ch as Record<string, unknown>;
        const pages = resolvePageRange(raw.pages);
        const sections = ((raw.sections || []) as unknown[])
          .filter((s): s is Record<string, unknown> => {
            const sr = s as Record<string, unknown>;
            return Boolean((sr.sectionIndex || sr.sectionTitle) && sr.pages);
          })
          .map((s) => {
            const sr = s as Record<string, unknown>;
            const sectionPages = resolvePageRange(sr.pages);
            const subSections = ((sr.subSections || []) as unknown[])
              .filter((sub): sub is Record<string, unknown> => {
                const subr = sub as Record<string, unknown>;
                return Boolean(subr.title && subr.pages);
              })
              .map((sub) => {
                const subr = sub as Record<string, unknown>;
                const subPages = resolvePageRange(subr.pages);
                return {
                  title: String(subr.title).trim(),
                  pages: subPages,
                };
              });
            return {
              sectionIndex: String(sr.sectionIndex || sr.sectionTitle || '').trim(),
              sectionTitle: String(sr.sectionTitle || sr.sectionIndex || '').trim(),
              pages: sectionPages,
              subSections,
            };
          });
        return {
          chapterIndex: Number(raw.chapterIndex),
          chapterTitle: String(raw.chapterTitle).trim(),
          pages,
          sections: sections || [],
        };
      });

    const legacyChapters = validatedChapters.map(toLegacyChapter);

    const totalChapters = validatedChapters.length;
    const totalSections = validatedChapters.reduce((sum, ch) => sum + (ch.sections || []).length, 0);
    const totalSubSections = validatedChapters.reduce((sum, ch) =>
      sum + (ch.sections || []).reduce((sSum, s) => sSum + (s.subSections || []).length, 0), 0
    );

    console.log(`[提取章节] 找到 ${totalChapters} 章，${totalSections} 节，${totalSubSections} 小节`);

    if (validatedChapters.length > 0) {
      const firstChapter = validatedChapters[0];
      console.log(`[提取章节] 第1章: "${firstChapter.chapterTitle}" 页码 ${firstChapter.pages.start}-${firstChapter.pages.end} 类型: ${firstChapter.pages.type}`);
      const firstSection = firstChapter.sections?.[0];
      if (firstSection) {
        console.log(`[提取章节] 第1节: "${firstSection.sectionTitle}" 页码 ${firstSection.pages.start}-${firstSection.pages.end} 类型: ${firstSection.pages.type}`);
        const firstSub = firstSection.subSections?.[0];
        if (firstSub) {
          console.log(`[提取章节] 第1节第1小节: "${firstSub.title}" 页码 ${firstSub.pages.start}-${firstSub.pages.end}`);
        }
      }
    }

    return NextResponse.json({ chapters: validatedChapters, legacyChapters });
  } catch (error) {
    console.error('章节提取错误:', error);
    return NextResponse.json(
      { error: 'AI 解析失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
