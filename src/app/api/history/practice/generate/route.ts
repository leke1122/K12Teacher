import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, findDocxImportByUnitId, findDocxImportByUnitTitle } from '@/lib/supabase';
import type { DocxParseResult } from '@/lib/docxParser';

interface PracticeQuestion {
  id: string;
  type: 'choice' | 'material';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  relatedEvents?: string[];
  material?: {
    content: string;
    author?: string;
    source?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const unitId = String(body.unitId || '').trim();
    const type = String(body.type || 'choice').trim();
    const count = Math.min(Math.max(Number(body.count || 5), 1), 10);

    if (!unitId) {
      return NextResponse.json({ success: false, message: '缺少 unitId' }, { status: 400 });
    }

    let docxData: DocxParseResult | null = null;
    let importId: string | null = null;

    let docxImport = await findDocxImportByUnitId(unitId);
    if (!docxImport?.data) {
      const terms = [unitId, '第一单元', '中国古代史'].filter(Boolean);
      for (const term of terms) {
        const found = await findDocxImportByUnitTitle(term);
        if (found?.data) {
          docxImport = found;
          break;
        }
      }
    }

    if (docxImport?.data) {
      docxData = docxImport.data as DocxParseResult;
      importId = docxImport.id;
    }

    let textbookText = '';
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('textbook_cache')
          .select('full_text')
          .eq('user_id', 'personal-user')
          .eq('subject_id', 'history')
          .order('uploaded_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.full_text) {
          textbookText = data.full_text;
        }
      } catch {
        // 教材缺失也不阻断，继续基于 docx 生成
      }
    }

    const concepts = (docxData?.concepts || []).slice(0, 8);
    const events = (docxData?.timelineEvents || []).slice(0, 8);
    const focuses = (docxData?.examFocus || []).slice(0, 6);

    const prompt = `你是一位辽宁省高中历史命题专家。请基于以下知识点和教材原文，生成 ${count} 道${type === 'material' ? '材料分析题' : '选择题'}。

## 知识点
${JSON.stringify({ concepts, events, focuses }, null, 2)}

## 教材原文
${textbookText ? textbookText.slice(0, 4000) : '暂无教材原文，请仅基于上述知识点出题。'}

## 要求
1. 严格基于提供的知识点，不要脱离资料编造史实。
2. ${type === 'material' ? '每道题包含材料和设问，并给出参考答案与解析。' : '每道题包含题干、4个选项、正确答案与解析。'}
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
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: '你是一个严格输出 JSON 的历史命题助手，只能返回 JSON 数组。' },
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error('未提取到题目 JSON');
    }

    const questions = JSON.parse(jsonMatch[0]) as PracticeQuestion[];
    const normalized = questions.map((q, idx) => ({
      ...q,
      id: q.id || `practice-${idx + 1}`,
      difficulty: q.difficulty || 'medium',
      category: q.category || '综合',
    }));

    return NextResponse.json({
      success: true,
      source: docxData ? 'docx_import' : 'ai_generate',
      importId: importId || undefined,
      unitTitle: docxData?.unitTitle,
      questions: normalized.slice(0, count),
    });
  } catch (error) {
    console.error('[history/practice/generate] error:', error);
    return NextResponse.json(
      { success: false, message: '生成练习失败：' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}
