import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const USER_ID = 'personal-user';

/**
 * 根据题目内容查找并补全错题的分析字段
 * 供练习结束后批量调用
 */
export async function POST(request: NextRequest) {
  try {
    const {
      subjectId,
      chapterId,
      sectionId,
      question,
      userAnswer,
      correctAnswer,
      knowledgePoint,
      pdfContext,
      wrongReason,
      weakPoint,
      stepAnalysis,
      solutionSteps,
      apiKey,
    } = await request.json();

    if (!subjectId || !question) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase 未配置' }, { status: 500 });
    }

    // 查找匹配的错题
    const { data: existing, error: findError } = await supabase
      .from('wrong_questions')
      .select('id, wrong_reason, weak_point, step_analysis, solution_steps')
      .eq('user_id', USER_ID)
      .eq('subject_id', subjectId)
      .eq('chapter_id', String(chapterId))
      .eq('section_id', String(sectionId))
      .eq('question', question)
      .eq('is_mastered', false)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ success: false, error: '未找到对应错题记录' });
    }

    // 如果已有分析数据，不再重复调用 AI
    if (existing.wrong_reason && existing.weak_point) {
      return NextResponse.json({ success: true, message: '已有分析数据，跳过AI调用' });
    }

    // 调用 AI 进行分析
    let analysis = { wrongReason, weakPoint, stepAnalysis, solutionSteps };
    if (apiKey && !wrongReason) {
      try {
        const resp = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-v4-flash',
            messages: [
              {
                role: 'system',
                content: '你是一位高中数学教师，擅长分析学生的解题错误并给出针对性的解题步骤。',
              },
              {
                role: 'user',
                content: `请分析以下错题：

题目：${question}
学生答案：${userAnswer}
正确答案：${correctAnswer}
知识点：${knowledgePoint || '未知'}
${pdfContext ? `教材参考：${pdfContext.substring(0, 500)}` : ''}

请按以下JSON格式返回分析结果（只需返回JSON，不要其他内容）：
{
  "wrongReason": "学生犯错的具体原因",
  "weakPoint": "学生薄弱的知识点",
  "stepAnalysis": "解题过程分析",
  "solutionSteps": "规范的解题步骤"
}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });
        const aiData = await resp.json();
        const content = aiData.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = { ...analysis, ...JSON.parse(jsonMatch[0]) };
        }
      } catch {
        // AI 分析失败，使用空值继续
      }
    }

    // 更新错题记录
    const { error: updateError } = await supabase
      .from('wrong_questions')
      .update({
        wrong_reason: analysis.wrongReason || wrongReason || '',
        weak_point: analysis.weakPoint || weakPoint || '',
        step_analysis: analysis.stepAnalysis || stepAnalysis || '',
        solution_steps: analysis.solutionSteps || solutionSteps || '',
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        knowledge_point: knowledgePoint || '',
      })
      .eq('id', existing.id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[EnrichWrongQuestion] 失败:', error);
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
