import { NextRequest, NextResponse } from 'next/server';
import {
  historyTimelineData,
  unitGroups,
  highFrequencyEvents,
  searchEvents,
  getEventsByYearRange,
  type TimelineEvent,
} from '@/lib/historyTimelineData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const unit = searchParams.get('unit');
  const yearStart = searchParams.get('yearStart');
  const yearEnd = searchParams.get('yearEnd');
  const difficulty = searchParams.get('difficulty');
  const book = searchParams.get('book');

  try {
    let events: TimelineEvent[] = historyTimelineData;

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
        // 为前端兼容，返回与原API一致的格式
        title: '辽宁高考历史时间轴',
        chapterId: 'ln-gaokao-history',
      },
    });
  } catch (error) {
    console.error('[history timeline API] error:', error);
    return NextResponse.json(
      { success: false, message: '获取时间轴数据失败' },
      { status: 500 }
    );
  }
}
