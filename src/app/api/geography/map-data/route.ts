import { NextRequest, NextResponse } from 'next/server';
import { LIAONING_REGIONS, type MapRegion } from '@/lib/geographyData';

export async function GET(request: NextRequest) {
  const regionId = request.nextUrl.searchParams.get('regionId') || '';
  const type = request.nextUrl.searchParams.get('type') || '';

  try {
    let regions: MapRegion[] = LIAONING_REGIONS;

    if (regionId) {
      const region = LIAONING_REGIONS.find((r) => r.id === regionId);
      return NextResponse.json({
        success: true,
        data: region || null,
      });
    }

    if (type) {
      regions = LIAONING_REGIONS.filter((r) => r.type === type);
    }

    return NextResponse.json({
      success: true,
      data: regions,
    });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}
