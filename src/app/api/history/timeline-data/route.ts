import { NextRequest, NextResponse } from 'next/server';
import {
  historyTimelineData,
  unitGroups,
  highFrequencyEvents,
  searchEvents,
  getEventsByYearRange,
  type TimelineEvent,
} from '@/lib/historyTimelineData';
import { findDocxImportByUnitId, findDocxImportByUnitTitle, supabase, isSupabaseConfigured } from '@/lib/supabase';
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
      let docxImport: any = null;

      // 1a. 直接查询，不依赖user_id过滤
      if (unitId && isSupabaseConfigured && supabase) {
        const { data: directData } = await supabase
          .from('docx_imports')
          .select('*')
          .eq('unit_id', unitId)
          .limit(1);
        
        if (directData && directData.length > 0) {
          docxImport = directData[0];
          console.log('[timeline-data] 直接查询找到记录:', docxImport.id, 'unit_id:', docxImport.unit_id);
        }
      }

      // 1b. 精确匹配 unitId (备用)
      if (!docxImport && unitId) {
        const found = await findDocxImportByUnitId(unitId);
        if (found) {
          docxImport = found;
          console.log('[timeline-data] findDocxImportByUnitId result:', 'found', 'unitId:', unitId);
        }
      }

      // 1c. 按标题模糊匹配
      const titleTerms = [unit, unitId, '第一单元', '中国古代史'].filter(Boolean) as string[];
      if (!docxImport) {
        for (const term of titleTerms) {
          const found = await findDocxImportByUnitTitle(term);
          if (found?.data) {
            docxImport = found;
            console.log('[timeline-data] findDocxImportByUnitTitle found:', term);
            break;
          }
        }
      }

      if (docxImport?.data) {
        const docxData = docxImport.data as any;
        console.log('[timeline-data] docxData keys:', Object.keys(docxData));
        // 兼容两种数据格式：events 或 timelineEvents
        const sourceEvents = docxData.events || docxData.timelineEvents || [];
        console.log('[timeline-data] sourceEvents count:', sourceEvents.length);
        if (sourceEvents.length) {
          events = sourceEvents.map((e: any) => ({
            id: e.id || `event-${Math.random().toString(36).substr(2, 9)}`,
            year: parseYear(e.year),
            title: e.title || e.name || '',
            dynasty: e.dynasty || e.category || '',
            figures: e.figures || e.keyPeople || [],
            causes: e.causes || '',
            effects: e.effects || '',
            summary: e.summary || e.description || e.definition || '',
            location: e.location || '',
            difficulty: (e.importance >= 4 ? '高频' : '中频') as '高频' | '中频',
            book: '上册',
            unit: docxData.unitTitle || unitId,
            significance: e.significance || e.impact || e.effects || '',
            importance: e.importance || 3,
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
