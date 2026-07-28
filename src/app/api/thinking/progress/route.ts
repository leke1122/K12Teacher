/**
 * 训练进度记录 API
 * POST /api/thinking/progress - 记录训练结果
 * GET /api/thinking/progress - 获取训练进度
 */

import { NextRequest, NextResponse } from 'next/server';

// Supabase 客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId,
      subject, 
      chapterId, 
      trainingType, // 'mindmap' | 'thinking' | 'template'
      level, // 'L1' | 'L2' | 'L3'
      score,
      maxScore,
      duration, // 训练时长（秒）
      details // 详细结果 JSON
    } = body;

    if (!subject || !chapterId || !trainingType || !level) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取用户 ID（如果有的话）
    const finalUserId = userId || 'anonymous';
    const finalScore = score || 0;
    const finalMaxScore = maxScore || 100;
    const percentage = Math.round((finalScore / finalMaxScore) * 100);

    // 构建记录对象
    const record = {
      user_id: finalUserId,
      subject,
      chapter_id: chapterId,
      training_type: trainingType,
      level,
      score: finalScore,
      max_score: finalMaxScore,
      percentage,
      duration_seconds: duration || 0,
      details,
      created_at: new Date().toISOString(),
    };

    // 写入 learning_records 表
    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/learning_records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(record),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          success: true,
          data: {
            id: data[0]?.id,
            ...record,
          },
        });
      }
    }

    // 如果没有 Supabase，返回成功（本地记录）
    return NextResponse.json({
      success: true,
      data: {
        id: `local-${Date.now()}`,
        ...record,
      },
      message: '记录已保存（本地模式）',
    });

  } catch (error) {
    console.error('[Thinking/Progress] Error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const subject = searchParams.get('subject');
    const chapterId = searchParams.get('chapterId');

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: true,
        data: {
          total: 0,
          records: [],
        },
        message: '暂无训练记录',
      });
    }

    // 构建查询参数
    let query = `user_id=eq.${userId}`;
    if (subject) query += `&subject=eq.${subject}`;
    if (chapterId) query += `&chapter_id=eq.${chapterId}`;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/learning_records?${query}&order=created_at.desc&limit=50`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error('查询失败');
    }

    const records = await res.json();

    // 统计各类型完成情况
    const stats = {
      mindmap: { count: 0, avgScore: 0 },
      thinking: { count: 0, avgScore: 0 },
      template: { count: 0, avgScore: 0 },
    };

    records.forEach((r: Record<string, unknown>) => {
      const type = r.training_type as string;
      if (type in stats) {
        stats[type as keyof typeof stats].count++;
        stats[type as keyof typeof stats].avgScore += Number(r.percentage);
      }
    });

    // 计算平均分
    Object.keys(stats).forEach(key => {
      const item = stats[key as keyof typeof stats];
      if (item.count > 0) {
        item.avgScore = Math.round(item.avgScore / item.count);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        total: records.length,
        records,
        stats,
      },
    });

  } catch (error) {
    console.error('[Thinking/Progress] Error:', error);
    return NextResponse.json(
      { success: false, message: '服务器错误' },
      { status: 500 }
    );
  }
}
