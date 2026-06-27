import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  if (typeof window === 'undefined') {
    return NextResponse.json({ error: 'server context' });
  }

  const allKeys = Object.keys(localStorage);
  const pdfKeys = allKeys.filter((k) => /pdf|chapter|subject/.test(k));
  const snapshot = pdfKeys.reduce<Record<string, string>>((acc, key) => {
    try {
      acc[key] = localStorage.getItem(key) ?? '';
    } catch {
      acc[key] = '<unreadable>';
    }
    return acc;
  }, {});

  return NextResponse.json({ keys: pdfKeys, snapshot });
}
