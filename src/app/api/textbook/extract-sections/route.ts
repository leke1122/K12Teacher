import { NextRequest, NextResponse } from 'next/server';
import { extractContentByPageRange } from '@/lib/pdf-utils';

/**
 * 提取并拆解课本内容为段落
 * 将教材内容按自然段落或语义块拆解为多个学习单元
 */
export async function POST(request: NextRequest) {
  try {
    const { fullText, startPage, endPage, chapterTitle, pageType, fileStart, fileEnd } = await request.json();

    if (!fullText) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    const effectiveStart = pageType === 'printed' && fileStart ? Number(fileStart) : Number(startPage);
    const effectiveEnd = pageType === 'printed' && fileEnd ? Number(fileEnd) : Number(endPage);

    console.log(`[TextbookExtract] 章节: ${chapterTitle || '未知'} | 页码: ${effectiveStart}-${effectiveEnd} | 内容长度: ${fullText.length}`);

    // 1. 安全检查：确保页码有效
    const safeStartPage = Math.max(1, Number.isFinite(effectiveStart) ? effectiveStart : 1);
    const safeEndPage = Math.max(safeStartPage, Number.isFinite(effectiveEnd) ? effectiveEnd : safeStartPage + 10);

    // 2. 尝试提取指定页码范围的内容
    let sectionContent = extractContentByPageRange(fullText, safeStartPage, safeEndPage);
    
    // 3. 内容有效性检测 - 排除封面、目录等
    const validation = validateContent(sectionContent);
    if (!validation.valid) {
      console.log(`[TextbookExtract] 内容验证失败: ${validation.reason}`);
      // 尝试向后偏移几页
      sectionContent = extractContentByPageRange(fullText, safeStartPage + 2, safeEndPage + 2);
      const revalidation = validateContent(sectionContent);
      if (!revalidation.valid) {
        return NextResponse.json({
          success: true,
          sections: [],
          total: 0,
          warning: `提取的内容可能不是正文: ${revalidation.reason}`,
          chapterTitle,
          startPage: safeStartPage,
          endPage: safeEndPage
        });
      }
    }

    console.log(`[TextbookExtract] 提取内容长度: ${sectionContent.length} 字符`);

    // 4. 按自然段落分割
    const paragraphs = splitIntoParagraphs(sectionContent);
    
    console.log(`[TextbookExtract] 原始段落数: ${paragraphs.length}`);

    // 5. 过滤掉极短的段落（空白行、页码标记等，真正的正文即使10字也要保留）
    const validParagraphs = paragraphs.filter(p => p.trim().length >= 5);
    
    console.log(`[TextbookExtract] 有效段落数: ${validParagraphs.length}`);

    // 6. 为每个段落生成元数据
    const sections = validParagraphs.map((content, index) => {
      // 提取关键词（简单方法：从段落中提取2-4字以上的词汇）
      const keywords = extractKeywords(content);
      
      return {
        id: index + 1,
        page: estimatePage(safeStartPage, safeEndPage, index, validParagraphs.length),
        content: content.trim(),
        keywords,
        charCount: content.trim().length
      };
    });

    // 7. 合并过短的相邻段落（小于50字的合并到下一个）
    const mergedSections = mergeShortParagraphs(sections);

    console.log(`[TextbookExtract] 合并后段落数: ${mergedSections.length}`);

    return NextResponse.json({
      success: true,
      sections: mergedSections,
      total: mergedSections.length,
      chapterTitle,
      startPage: safeStartPage,
      endPage: safeEndPage
    });

  } catch (error) {
    console.error('[TextbookExtract] 处理失败:', error);
    return NextResponse.json(
      { error: '处理失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

/**
 * 按页码范围提取内容
 */
function extractContentByPage(fullText: string, startPage: number, endPage: number): string {
  // 尝试多种页码标记格式
  const patterns = [
    /=====[\s\u4e00-\u9fa5第\s]+(\d+)[\s\u4e00-\u9fa5页]+\s*=====/g,
    /---[\s\u4e00-\u9fa5第\s]+(\d+)[\s\u4e00-\u9fa5页]+\s*---/g,
    /第\s*(\d+)\s*页/g,
    /Page\s*(\d+)/gi,
    /\[\s*(\d+)\s*\]$/gm,
  ];

  for (const pattern of patterns) {
    const pages: Map<number, { start: number; end: number }> = new Map();
    let match;
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(fullText)) !== null) {
      const pageNum = parseInt(match[1], 10);
      pages.set(pageNum, { start: match.index, end: 0 });
    }

    if (pages.size >= 2) {
      const sortedPages = Array.from(pages.entries()).sort((a, b) => a[0] - b[0]);
      
      for (let i = 0; i < sortedPages.length; i++) {
        const [pageNum, pos] = sortedPages[i] as [number, { start: number; end: number }];
        const nextEntry = sortedPages[i + 1] as [number, { start: number; end: number }];
        if (i < sortedPages.length - 1) {
          pos.end = nextEntry[1].start;
        } else {
          pos.end = fullText.length;
        }
      }

      // 提取指定范围
      let result = '';
      for (let i = startPage; i <= endPage; i++) {
        const pos = pages.get(i);
        if (pos) {
          result += fullText.slice(pos.start, pos.end) + '\n\n';
        }
      }

      if (result.trim().length > 100) {
        console.log(`[TextbookExtract] 使用模式提取到 ${result.length} 字符`);
        return result.trim();
      }
    }
  }

  // 如果没有找到页码标记，按字符数均分
  console.log('[TextbookExtract] 未找到页码标记，按字符数估算');
  const estimatedCharsPerPage = 2000;
  const contentStart = fullText.match(/^[\s\S]*?(\d)[\d\u4e00-\u9fa5]/)?.index || 0;
  const startIndex = contentStart + (startPage - 1) * estimatedCharsPerPage;
  const endIndex = contentStart + endPage * estimatedCharsPerPage;
  return fullText.slice(Math.max(0, startIndex), Math.min(fullText.length, endIndex));
}

/**
 * 内容有效性检测
 */
function validateContent(text: string): { valid: boolean; reason: string } {
  if (!text || text.length < 100) {
    return { valid: false, reason: '内容太短' };
  }

  // 封面/目录标志
  const coverPatterns = [
    '普通高中教科书',
    'SHUXUE',
    '数学',
    '定价',
    'ISBN',
    '人民教育出版社',
    '目录',
    'CONTENTS',
    ' Preface',
    '前言',
  ];

  // 正文标志（包含数学概念）
  const validPatterns = [
    '集合', '元素', '函数', '方程', '不等式', '定义', '性质',
    '定理', '证明', '例题', '练习', '思考', '符号', '∈', '⊂',
    '列举法', '描述法', '数集', '自然数', '整数', '有理数', '实数',
  ];

  let coverCount = 0;
  let validCount = 0;

  for (const pattern of coverPatterns) {
    if (text.includes(pattern)) coverCount++;
  }

  for (const pattern of validPatterns) {
    if (text.includes(pattern)) validCount++;
  }

  // 如果封面特征多但正文特征少，可能是封面/目录
  if (coverCount >= 2 && validCount < 2) {
    return { valid: false, reason: `检测到封面/目录特征 (封面标记:${coverCount}, 正文标记:${validCount})` };
  }

  return { valid: true, reason: '' };
}

/**
 * 将文本分割为段落
 * 原则：保留所有有意义的短句，即使只有5-10字（如"思考："、"要求："）
 */
function splitIntoParagraphs(text: string): string[] {
  // 替换多种换行符为统一格式
  let normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\\n/g, '\n');

  // 预处理：把教材常见的连续句分开处理
  // 格式如："例1：...。...。...。要求：...。思考：..."
  // 按"。"分割，但保留指示词开头的短句作为独立段落

  // 方法1: 按双换行分割（段落间有空行）
  let paragraphs = normalized.split(/\n\s*\n/);

  if (paragraphs.length < 3) {
    // 方法2: 按单换行分割
    paragraphs = normalized.split(/\n/);
  }

  // 过滤完全空白段落
  paragraphs = paragraphs.filter(p => p.trim().length > 0);

  // 进一步拆分：把包含多个完整句子的段落拆开
  // 匹配模式：以 "要求："、"思考："、"例X："、"练习："、"注意：" 开头的短句
  const result: string[] = [];
  for (const para of paragraphs) {
    // 按句子分隔符拆分
    const sentences = para.split(/(?<=[。！？])/);
    let current = '';
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;
      // 如果当前句子以指示词开头（短句），单独成段
      if (/^(要求|思考|例\d|练习|注意|证明|解|思考题)：/.test(trimmed) && trimmed.length <= 30) {
        if (current.trim()) result.push(current.trim());
        result.push(trimmed);
        current = '';
      } else if (current && current.length + trimmed.length > 300) {
        // 当前段落够长了，保存并开始新段落
        result.push(current.trim());
        current = trimmed;
      } else {
        current += trimmed;
      }
    }
    if (current.trim()) result.push(current.trim());
  }

  return result;
}

/**
 * 提取关键词（简单方法）
 */
function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  
  // 提取2-4个连续的中文字符作为关键词候选
  const matches = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
  
  // 统计词频
  const wordCount: Record<string, number> = {};
  matches.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // 取出现2次以上且长度>=2的词
  Object.entries(wordCount)
    .filter(([word, count]) => count >= 2 && word.length >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([word]) => keywords.push(word));
  
  return keywords;
}

/**
 * 估算段落所在页码
 */
function estimatePage(startPage: number, endPage: number, index: number, total: number): number {
  if (total <= 1) return startPage;
  
  const ratio = index / (total - 1);
  const pageRange = endPage - startPage;
  
  return Math.round(startPage + ratio * pageRange);
}

/**
 * 合并过短的相邻段落
 * 规则：只把真正无意义的短内容（如纯页码标记）合并到前一段
 * 有明确语义的内容（如"思考："、"整数分成正、负、零"）即使短也保留
 */
function mergeShortParagraphs(sections: Array<{ id: number; page: number; content: string; keywords: string[]; charCount: number }>): typeof sections {
  if (sections.length <= 1) return sections;

  const result: typeof sections = [];
  let buffer = sections[0];

  for (let i = 1; i < sections.length; i++) {
    const current = sections[i];

    // 只有真正无意义的短内容才合并（如页码行、纯空白残留）
    // 判断标准：少于15字 且 不包含常见语义词
    const isTrivial = current.charCount < 15 && !/[\u4e00-\u9fa5]{4,}/.test(current.content);
    if (isTrivial) {
      // 将无意义内容合并到前一段末尾（作为补充说明）
      buffer = {
        ...buffer,
        content: buffer.content + '\n' + current.content,
        charCount: buffer.charCount + current.charCount + 1
      };
    } else {
      // 有明确语义的内容，保留为独立段落
      result.push(buffer);
      buffer = current;
    }
  }

  // 最后一段
  if (buffer.charCount > 0) {
    result.push(buffer);
  }

  return result;
}
