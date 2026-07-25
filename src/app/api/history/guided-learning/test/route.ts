import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    console.log('Received text:', text);
    const body = JSON.parse(text);
    return NextResponse.json({ success: true, received: body });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error?.message || String(error), text: await request.text().catch(() => 'N/A') });
  }
}
