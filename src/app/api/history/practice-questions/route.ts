import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const unitId = searchParams.get('unitId');

  if (!unitId) {
    return NextResponse.json({
      success: false,
      error: '缺少unitId参数',
    });
  }

  try {
    let concepts: any[] = [];
    let cards: any[] = [];

    // 从Supabase查询
    if (isSupabaseConfigured && supabase) {
      const { data: docxImport } = await supabase
        .from('docx_imports')
        .select('*')
        .eq('unit_id', unitId)
        .limit(1)
        .single();

      if (docxImport?.data) {
        const data = docxImport.data as any;
        concepts = data.concepts || [];
        cards = data.cards || [];
      }
    }

    // 生成练习题
    const questions = concepts
      .filter(c => c.importance >= 4) // 只选择重要知识点
      .slice(0, 10) // 最多10题
      .map((concept, idx) => {
        // 根据概念生成选择题
        const type = Math.random() > 0.3 ? 'choice' : 'fill';
        
        if (type === 'choice') {
          return {
            id: `q-${concept.id}`,
            type: 'choice',
            question: `【${concept.category}】${concept.name}是什么？`,
            options: [
              concept.keyPoints?.[0] || concept.definition.substring(0, 50),
              `其他相关概念${idx + 1}`,
              `相关历史事件${idx + 2}`,
              `古代制度${idx + 3}`,
            ].sort(() => Math.random() - 0.5),
            answer: concept.keyPoints?.[0] || concept.definition.substring(0, 50),
            explanation: concept.definition,
            difficulty: concept.importance >= 5 ? '困难' : concept.importance >= 4 ? '中等' : '简单',
            points: concept.importance >= 5 ? 2 : 1,
            unit: concept.subCategory || concept.category,
          };
        } else {
          return {
            id: `q-${concept.id}`,
            type: 'fill',
            question: `【${concept.category}】请简述${concept.name}的主要内容。`,
            answer: concept.keyPoints?.join('；') || concept.definition.substring(0, 100),
            explanation: concept.definition,
            difficulty: concept.importance >= 5 ? '困难' : concept.importance >= 4 ? '中等' : '简单',
            points: concept.importance >= 5 ? 3 : 2,
            unit: concept.subCategory || concept.category,
          };
        }
      });

    return NextResponse.json({
      success: true,
      data: {
        questions,
        total: questions.length,
        source: 'generated',
      },
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : '未知错误',
    });
  }
}
