import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, findDocxImportByUnitId, findDocxImportByUnitTitle } from '@/lib/supabase';
import type { PoliticsParseResult } from '@/lib/politicsDocxParser';
import { POLITICS_UNIT1 } from '@/data/politics/unit1_data';

interface PracticeQuestion {
  id: string;
  type: 'choice' | 'material' | 'essay';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  relatedConcepts?: string[];
  material?: { content: string; source?: string };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const unitId = String(body.unitId || '').trim();
    const type = String(body.type || 'choice').trim();
    const count = Math.min(Math.max(Number(body.count || 5), 1), 8);

    let docxData: PoliticsParseResult | null = null;
    let importId: string | null = null;

    if (unitId) {
      const docxImport = await findDocxImportByUnitId(unitId);
      if (docxImport?.data) {
        docxData = docxImport.data as PoliticsParseResult;
        importId = docxImport.id;
      }
    }

    if (!docxData) {
      const found = await findDocxImportByUnitTitle('社会主义从空想到科学');
      if (found?.data) {
        docxData = found.data as PoliticsParseResult;
        importId = found.id;
      }
    }

    const data = docxData || POLITICS_UNIT1;
    const concepts = data.concepts.slice(0, 6);
    const events = data.timelineEvents.slice(0, 6);
    const focuses = data.examFocus.slice(0, 6);

    const prompt = `你是辽宁省高中政治命题专家，熟悉统编版教材和辽宁卷命题特点。请基于以下知识点生成 ${count} 道${type === 'material' ? '材料分析题' : type === 'essay' ? '论述题' : '选择题'}。

## 知识点
${JSON.stringify({ concepts, events, focuses }, null, 2)}

## 要求
1. 严格基于提供的知识点，不要脱离资料编造史实。
2. ${type === 'material' ? '每道题包含材料和设问，并给出参考答案与解析。' : type === 'essay' ? '每道题给出材料、设问、评分要点与参考答案。' : '每道题包含题干、4个选项、正确答案与解析。'}
3. 难度分布：简单、中等、困难均衡。
4. 必须严格输出 JSON 数组，不要包含其他文本。`;

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: '请先在设置中配置 DeepSeek API Key' }, { status: 400 });
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是政治命题助手，只能返回 JSON 数组。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.35,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'AI 请求失败');
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content || '';
    const match = content.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('未提取到题目 JSON');

    const questions = JSON.parse(match[0]) as PracticeQuestion[];
    const normalized = questions.map((q, idx) => ({
      ...q,
      id: q.id || `practice-${idx + 1}`,
      difficulty: q.difficulty || 'medium',
      category: q.category || '综合',
    }));

    return NextResponse.json({
      success: true,
      source: docxData ? 'docx_import' : 'local',
      importId: importId || undefined,
      unitTitle: data.unitTitle,
      questions: normalized.slice(0, count),
    });
  } catch (error) {
    console.error('[politics/practice/generate] error:', error);
    return NextResponse.json({ success: false, message: '生成练习失败：' + (error instanceof Error ? error.message : '未知错误') }, { status: 500 });
  }
}
