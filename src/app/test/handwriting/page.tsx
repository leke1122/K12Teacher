'use client';

import { useState } from 'react';
import { HandwritingPad } from '@/components/canvas/HandwritingPad';

export default function HandwritingTestPage() {
  const [raw, setRaw] = useState({ clientX: 0, clientY: 0 });

  const handlePointerMove = (data: { rawX: number; rawY: number; mappedX: number; mappedY: number }) => {
    setRaw({ clientX: Math.round(data.rawX), clientY: Math.round(data.rawY) });
  };

  return (
    <div className="fixed inset-0 bg-slate-50">
      <div className="h-full w-full p-2">
        <HandwritingPad
          onSave={(data) => console.log('[test] saved', data.length)}
          onCancel={() => console.log('[test] cancel')}
          debugMode
          onPointerMove={handlePointerMove}
        />
      </div>

      <div className="absolute right-3 top-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-700 shadow-xl backdrop-blur">
        <p className="font-medium text-slate-800">指针坐标</p>
        <p>clientX={raw.clientX} clientY={raw.clientY}</p>
      </div>
    </div>
  );
}
