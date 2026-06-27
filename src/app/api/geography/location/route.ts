import { NextRequest, NextResponse } from 'next/server';
import { LOCATION_ANALYSIS_CASES, type LocationAnalysisCase } from '@/lib/geographyData';

export interface LocationAnalysisRequest {
  caseId?: string;
  region?: string;
  type?: 'agriculture' | 'industry' | 'city' | 'ecology';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as LocationAnalysisRequest;
    const { caseId, region, type } = body;

    let analysisCase: LocationAnalysisCase | undefined;

    if (caseId) {
      analysisCase = LOCATION_ANALYSIS_CASES.find((c) => c.id === caseId);
    } else if (type) {
      analysisCase = LOCATION_ANALYSIS_CASES.find((c) => c.type === type);
    } else if (region) {
      analysisCase = LOCATION_ANALYSIS_CASES.find((c) =>
        c.region.toLowerCase().includes(region.toLowerCase()),
      );
    }

    if (!analysisCase) {
      analysisCase = LOCATION_ANALYSIS_CASES[0];
    }

    return NextResponse.json({
      success: true,
      data: analysisCase,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: '获取区位分析案例失败' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get('type') || '';

    let cases = LOCATION_ANALYSIS_CASES;
    if (type) {
      cases = LOCATION_ANALYSIS_CASES.filter((c) => c.type === type);
    }

    return NextResponse.json({
      success: true,
      data: cases.map((c) => ({
        id: c.id,
        type: c.type,
        region: c.region,
        question: c.question,
      })),
    });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
