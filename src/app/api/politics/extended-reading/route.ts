import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, findDocxImportByUnitId, findDocxImportByUnitTitle } from '@/lib/supabase';
import type { PoliticsParseResult } from '@/lib/politicsDocxParser';
import { POLITICS_UNIT1 } from '@/data/politics/unit1_data';

interface ExtendedReading {
  id: string;
  title: string;
  category: string;
  content: string;
  examAngles: string[];
}

export async function GET(request: NextRequest) {
  try {
    const unitId = request.nextUrl.searchParams.get('unitId') || '';

    let docxData: PoliticsParseResult | null = null;
    if (unitId) {
      const docxImport = await findDocxImportByUnitId(unitId);
      if (docxImport?.data) docxData = docxImport.data as PoliticsParseResult;
    }

    if (!docxData) {
      const found = await findDocxImportByUnitTitle('社会主义从空想到科学');
      if (found?.data) docxData = found.data as PoliticsParseResult;
    }

    const data = docxData || POLITICS_UNIT1;
    const readings: ExtendedReading[] = [
      {
        id: 'reading-1',
        title: '从空想到科学：马克思主义诞生的历史条件',
        category: '理论溯源',
        content: data.overview,
        examAngles: ['辽宁高考常考马克思主义诞生的历史背景', '唯物史观与剩余价值学说的意义'],
      },
      {
        id: 'reading-2',
        title: '资本主义社会基本矛盾与当代启示',
        category: '理论联系实际',
        content: '基于你导入的知识点，结合资本主义基本矛盾分析当代经济现象，理解生产社会化与生产资料私有制矛盾的现实表现。',
        examAngles: ['材料分析题高频考点', '辽宁命题倾向：高质量发展、新质生产力'],
      },
      {
        id: 'reading-3',
        title: '十月革命与中国特色社会主义',
        category: '历史逻辑',
        content: '十月革命建立了第一个社会主义国家，为中国特色社会主义提供了历史借鉴。结合辽宁全面振兴，理解社会主义从理论到实践的演进。',
        examAngles: ['党史相关论述题', '辽宁地方特色分析'],
      },
    ];

    return NextResponse.json({ success: true, data: readings });
  } catch (error) {
    console.error('[politics/extended-reading] error:', error);
    return NextResponse.json({ success: false, message: '加载失败' }, { status: 500 });
  }
}
