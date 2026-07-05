/**
 * 单词数据导出 API
 * GET /api/words/export?type=words|wrong|records&format=csv|json
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseClient, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'words';
    const format = searchParams.get('format') || 'json';
    const userId = 'personal-user';

    let data: any[] = [];
    let filename = '';

    if (!isSupabaseConfigured || !supabaseClient) {
      return NextResponse.json(
        { success: false, error: '数据库未配置' },
        { status: 500 }
      );
    }

    switch (type) {
      case 'words': {
        // 导出已掌握的单词
        const { data: masteryData } = await supabaseClient
          .from('word_mastery')
          .select('word_id, mastery_level, last_review, next_review')
          .eq('user_id', userId)
          .gte('mastery_level', 5);

        if (masteryData && masteryData.length > 0) {
          const wordIds = masteryData.map(m => m.word_id);
          const { data: wordsData } = await supabaseClient
            .from('words')
            .select('*')
            .in('id', wordIds);

          const masteryMap = new Map(masteryData.map(m => [m.word_id, m]));

          data = (wordsData || []).map(w => ({
            单词: w.word,
            音标: w.phonetic,
            词性: w.part_of_speech,
            释义: w.meaning,
            例句: w.example,
            中文翻译: w.translation,
            频率级别: w.frequency_level === 'high' ? '高频' : w.frequency_level === 'medium' ? '中频' : '低频',
            掌握等级: masteryMap.get(w.id)?.mastery_level || 0,
            掌握时间: masteryMap.get(w.id)?.last_review || '',
          }));
        }
        filename = `已掌握单词_${new Date().toISOString().slice(0, 10)}`;
        break;
      }

      case 'wrong': {
        // 导出错词
        const { data: wrongData } = await supabaseClient
          .from('wrong_questions')
          .select('*')
          .eq('user_id', userId)
          .eq('subject_id', 'english')
          .order('created_at', { ascending: false });

        data = (wrongData || []).map(w => ({
          单词: w.correct_answer,
          释义: w.question,
          错误答案: w.user_answer,
          错误次数: 1,
          错误时间: w.created_at,
        }));
        filename = `错词本_${new Date().toISOString().slice(0, 10)}`;
        break;
      }

      case 'records': {
        // 导出学习记录
        const { data: recordsData } = await supabaseClient
          .from('word_learning_records')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1000);

        // 按日期聚合
        const dateMap = new Map<string, { learned: Set<string>; reviewed: Set<string> }>();
        
        (recordsData || []).forEach(r => {
          const date = r.created_at?.split('T')[0] || '';
          if (!dateMap.has(date)) {
            dateMap.set(date, { learned: new Set(), reviewed: new Set() });
          }
          const day = dateMap.get(date)!;
          if (r.action === 'mastered' || r.action === 'learned') {
            day.learned.add(r.word_id);
          } else if (r.action === 'reviewed') {
            day.reviewed.add(r.word_id);
          }
        });

        data = Array.from(dateMap.entries())
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([date, stats]) => ({
            日期: date,
            学习新词数: stats.learned.size,
            复习次数: stats.reviewed.size,
            总操作数: stats.learned.size + stats.reviewed.size,
          }));
        filename = `学习记录_${new Date().toISOString().slice(0, 10)}`;
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: '无效的导出类型' },
          { status: 400 }
        );
    }

    if (data.length === 0) {
      return NextResponse.json(
        { success: false, error: '暂无数据可导出' },
        { status: 404 }
      );
    }

    if (format === 'csv') {
      // 转换为 CSV
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(h => {
            const val = row[h];
            // 处理包含逗号或引号的值
            if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          }).join(',')
        ),
      ];
      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // JSON 格式
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}.json"`,
      },
    });
  } catch (error) {
    console.error('[API/words/export] Error:', error);
    return NextResponse.json(
      { success: false, error: '导出失败' },
      { status: 500 }
    );
  }
}
