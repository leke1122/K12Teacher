import { NextRequest, NextResponse } from 'next/server';
import {
  historyTimelineData,
  unitGroups,
  highFrequencyEvents,
  searchEvents,
  getEventsByYearRange,
  type TimelineEvent,
} from '@/lib/historyTimelineData';
import { findDocxImportByUnitId, findDocxImportByUnitTitle } from '@/lib/supabase';
import type { DocxParseResult } from '@/lib/docxParser';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const unit = searchParams.get('unit');
  const unitId = searchParams.get('unitId');
  const yearStart = searchParams.get('yearStart');
  const yearEnd = searchParams.get('yearEnd');
  const difficulty = searchParams.get('difficulty');
  const book = searchParams.get('book');
  const source = searchParams.get('source'); // 'all' | 'docx' | 'builtin'

  let events: TimelineEvent[] = [];
  let dataSource: 'docx' | 'builtin' = 'builtin';
  let docxMeta: { importId?: string; unitTitle?: string; pageRange?: string } = {};

  // 1. 优先尝试 docx 导入数据
  if (!source || source === 'docx') {
    try {
      let docxImport: Awaited<ReturnType<typeof findDocxImportByUnitId>> = null;

      // 1a. 精确匹配 unitId
      if (unitId) {
        docxImport = await findDocxImportByUnitId(unitId);
      }

      // 1b. 按标题模糊匹配
      const titleTerms = [unit, unitId, '第一单元', '中国古代史'].filter(Boolean) as string[];
      if (!docxImport) {
        for (const term of titleTerms) {
          docxImport = await findDocxImportByUnitTitle(term);
          if (docxImport?.data) break;
        }
      }

      if (docxImport?.data) {
        const docxData = docxImport.data as DocxParseResult;
        if (docxData.timelineEvents?.length) {
          events = docxData.timelineEvents.map(e => ({
            id: e.id,
            year: parseYear(e.year),
            title: e.title,
            dynasty: e.dynasty,
            figures: e.keyPeople,
            causes: '',
            effects: '',
            summary: e.summary,
            location: '',
            difficulty: e.importance >= 4 ? '高频' as const : '中频' as const,
            book: '上册' as const,
            unit: docxData.unitTitle,
            significance: e.impact,
            importance: e.importance,
          }));
          dataSource = 'docx';
          docxMeta = {
            importId: docxImport.id,
            unitTitle: docxData.unitTitle,
            pageRange: docxData.pageRange,
          };
          console.log('[timeline-data] 使用 docx 数据:', events.length, '条事件');
        }
      }
    } catch (err) {
      console.warn('[timeline-data] docx 加载失败:', err);
    }
  }

  // 2. 如果没有 docx 数据，使用内置数据
  if (events.length === 0) {
    events = historyTimelineData;
    dataSource = 'builtin';
  }

  // 关键词搜索
  if (keyword) {
    events = searchEvents(keyword);
  }

  // 按册筛选
  if (book === '上册' || book === '下册') {
    events = events.filter(e => e.book === book);
  }

  // 按单元筛选
  if (unit) {
    events = events.filter(e => e.unit === unit);
  }

  // 按年代范围筛选
  if (yearStart && yearEnd) {
    const start = parseInt(yearStart, 10);
    const end = parseInt(yearEnd, 10);
    events = events.filter(e =>
      (e.year >= start && e.year <= end) ||
      (e.yearEnd && e.yearEnd >= start && e.yearEnd <= end)
    );
  }

  // 按难度筛选
  if (difficulty === '高频' || difficulty === '中频' || difficulty === '低频') {
    events = events.filter(e => e.difficulty === difficulty);
  }

  return NextResponse.json({
    success: true,
    data: {
      events,
      total: events.length,
      units: Object.keys(unitGroups),
      highFrequencyCount: highFrequencyEvents.length,
      title: dataSource === 'docx' ? 'docx导入时间轴' : '辽宁高考历史时间轴',
      chapterId: 'ln-gaokao-history',
      dataSource,
      ...docxMeta,
    },
  });
}

function parseYear(yearStr: string): number {
  if (!yearStr) return 0;
  if (yearStr.includes('前')) {
    const num = parseInt(yearStr.replace(/[^0-9]/g, ''), 10);
    return -num;
  }
  return parseInt(yearStr.replace(/[^0-9]/g, ''), 10) || 0;
}
