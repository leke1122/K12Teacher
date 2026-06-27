import { NextRequest, NextResponse } from 'next/server';
import { LIAONING_REGIONS, type MapRegion } from '@/lib/geographyData';

export interface CompareRequest {
  regionA: string;
  regionB: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as CompareRequest;
    const { regionA, regionB } = body;

    if (!regionA || !regionB) {
      return NextResponse.json(
        { success: false, message: '请选择两个对比区域' },
        { status: 400 },
      );
    }

    const regionAData = LIAONING_REGIONS.find((r) => r.id === regionA || r.name === regionA);
    const regionBData = LIAONING_REGIONS.find((r) => r.id === regionB || r.name === regionB);

    if (!regionAData || !regionBData) {
      return NextResponse.json(
        { success: false, message: '未找到指定区域' },
        { status: 404 },
      );
    }

    const comparison = {
      regionA: regionAData.name,
      regionB: regionBData.name,
      dimensions: [
        {
          dimension: '位置',
          valueA: regionAData.location,
          valueB: regionBData.location,
        },
        {
          dimension: '地形',
          valueA: regionAData.terrain,
          valueB: regionBData.terrain,
        },
        {
          dimension: '气候',
          valueA: regionAData.climate,
          valueB: regionBData.climate,
        },
        {
          dimension: '水文',
          valueA: regionAData.hydrology,
          valueB: regionBData.hydrology,
        },
        {
          dimension: '资源',
          valueA: regionAData.resources.join('、'),
          valueB: regionBData.resources.join('、'),
        },
        {
          dimension: '经济',
          valueA: regionAData.economy,
          valueB: regionBData.economy,
        },
      ],
      summary: generateComparisonSummary(regionAData, regionBData),
    };

    return NextResponse.json({
      success: true,
      data: comparison,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: '对比失败' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: LIAONING_REGIONS.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
      })),
    });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

function generateComparisonSummary(regionA: MapRegion, regionB: MapRegion): string {
  const parts: string[] = [];

  if (regionA.terrain.includes('平原') && regionB.terrain.includes('丘陵')) {
    parts.push('地形差异是两区域最主要的自然差异，平原地区更适合农业发展');
  }

  if (regionA.climate.includes('海洋') || regionB.climate.includes('海洋')) {
    parts.push('受海洋影响程度的差异导致气候和降水分布不同');
  }

  if (regionA.resources.some((r) => r.includes('工业')) && regionB.resources.some((r) => r.includes('农业'))) {
    parts.push('资源禀赋差异导致产业发展方向不同');
  }

  if (parts.length === 0) {
    parts.push('两区域在地理位置、自然条件和经济发展方面各具特色');
  }

  return parts.join('；');
}
