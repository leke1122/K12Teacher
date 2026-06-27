'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { type GeoGebraModelConfig } from '@/lib/geogebraModels';

interface GeogebraContainerProps {
  model: GeoGebraModelConfig;
  params?: Record<string, number>;
  showAuxiliaryLines?: boolean;
  onInteract?: (data: { type: string; payload?: Record<string, number> }) => void;
  className?: string;
  height?: number | string;
}

export function GeogebraContainer({
  model,
  params,
  showAuxiliaryLines = false,
  onInteract,
  className = '',
  height = 520,
}: GeogebraContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [url, setUrl] = useState<string>('');

  const mergedParams = useMemo(() => ({ ...model.defaultParams, ...params }), [model.defaultParams, params]);

  useEffect(() => {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(mergedParams)) {
      parts.push(`${key}=${value}`);
    }

    for (const cmd of model.commands) {
      let resolved = cmd;
      for (const [key, value] of Object.entries(mergedParams)) {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        resolved = resolved.replace(regex, String(value));
      }
      parts.push(resolved);
    }

    if (showAuxiliaryLines && model.category === 'solid') {
      parts.push('SetVisibleAxes(1,1,1,true)');
      parts.push('ShowGrid(true)');
    }

    const commandString = parts.join(';');
    const encoded = encodeURIComponent(commandString);
    const appName = model.appName === '3d' ? '3d' : 'graphing';
    const h = typeof height === 'number' ? height : 520;
    const w = '100%';

    setUrl(`https://www.geogebra.org/${appName}?command=${encoded}&width=${w}&height=${h}&play=1&showResetIcon=true&showFullscreenButton=true`);
    setStatus('loading');
  }, [model, mergedParams, showAuxiliaryLines, height]);

  const handleLoad = () => {
    setStatus('ready');
  };

  const handleError = () => {
    setStatus('error');
  };

  const h = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      ref={containerRef}
      className={`geogebra-container rounded-xl border bg-white relative overflow-hidden ${className}`}
      style={{ height: h }}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">正在加载 GeoGebra...</span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-4">
          <span className="text-3xl">{model.icon}</span>
          <p className="text-base font-medium text-slate-700">{model.name}</p>
          <p className="text-sm text-muted-foreground">GeoGebra 加载失败，请检查网络后刷新页面。</p>
          <a
            href={model.appName === '3d' ? 'https://www.geogebra.org/3d' : 'https://www.geogebra.org/graphing'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            在 GeoGebra 中打开
          </a>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={url}
        className="w-full h-full"
        style={{ display: status === 'ready' ? 'block' : 'none' }}
        allowFullScreen
        title={model.name}
        onLoad={handleLoad}
        onError={handleError}
        allow="fullscreen"
      />
    </div>
  );
}
