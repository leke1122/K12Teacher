import { NextRequest, NextResponse } from 'next/server';
import { getServerData, listServerKeys } from '@/lib/serverStorage';

export interface AnalysisListItem {
  id: string;
  title: string;
  chapterId: string;
  difficulty: '简单' | '中等' | '困难';
  year?: string;
  questionCount: number;
  lastAttemptAt?: string;
  bestScore?: number;
  status: '未开始' | '进行中' | '已完成';
}

export async function GET(request: NextRequest) {
  const chapterId = request.nextUrl.searchParams.get('chapterId') || '';
  const difficulty = request.nextUrl.searchParams.get('difficulty') || '';
  const status = request.nextUrl.searchParams.get('status') || '';
  const limit = Number(request.nextUrl.searchParams.get('limit') || '50');

  try {
    let keys: string[] = [];
    if (chapterId && difficulty) {
      keys = listServerKeys(`analysis_source_${chapterId}_${difficulty}_`);
    } else if (chapterId) {
      keys = listServerKeys(`analysis_source_${chapterId}_`);
    } else {
      keys = listServerKeys('analysis_source_');
    }

    const items: AnalysisListItem[] = [];
    for (const key of keys.slice(0, limit)) {
      try {
        const source = getServerData<{
          id?: string;
          title?: string;
          chapterId?: string;
          difficulty?: string;
          year?: string;
          questions?: unknown[];
        }>(key);
        if (!source) continue;

        const item: AnalysisListItem = {
          id: String(source.id || key),
          title: String(source.title || '未命名材料'),
          chapterId: String(source.chapterId || ''),
          difficulty: normalizeDifficulty(source.difficulty),
          year: source.year,
          questionCount: Array.isArray(source.questions) ? source.questions.length : 0,
          status: '未开始',
        };

        items.push(item);
      } catch {
        // ignore single item error
      }
    }

    items.sort((a, b) => (b.year || '').localeCompare(a.year || ''));

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

function normalizeDifficulty(value?: string): '简单' | '中等' | '困难' {
  const v = String(value || '');
  if (v === '简单' || v === '中等' || v === '困难') return v as '简单' | '中等' | '困难';
  return '中等';
}
