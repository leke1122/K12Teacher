'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { validateScript } from '@/lib/geogebra/scriptValidator';

export interface GeoGebraViewerProps {
  script?: string;
  autoExecute?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  className?: string;
  height?: string | number;
}

export interface GeoGebraViewerRef {
  executeScript: (script: string) => void;
  clear: () => void;
  getApplet: () => unknown;
  resetView: () => void;
}

export const GeoGebraViewer = forwardRef<GeoGebraViewerRef, GeoGebraViewerProps>(
  (
    {
      script,
      autoExecute = true,
      onLoad,
      onError,
      className,
      height = '100%',
    },
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const appletRef = useRef<unknown>(null);
    const isReadyRef = useRef(false);
    const isLoadingRef = useRef(true);
    const iframeLoadedRef = useRef(false);
    const timeoutClearedRef = useRef(false);
    const pendingScriptRef = useRef<string | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingLog, setLoadingLog] = useState<string[]>([]);
    const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

    const addLog = useCallback((msg: string) => {
      setLoadingLog(prev => {
        const next = [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
        return next.slice(-8);
      });
    }, []);

    const clearConstruction = useCallback(() => {
      try {
        const iframe = iframeRef.current;
        const win = iframe?.contentWindow as Window & {
          ggbApplet?: { setXML: (xml: string) => void };
        };
        if (win?.ggbApplet) {
          win.ggbApplet.setXML('<geogebra></geogebra>');
          addLog('构造已清空');
        }
      } catch (e) {
        addLog('清空构造失败: ' + String(e));
      }
    }, [addLog]);

    const executeGeoGebraScript = useCallback((scriptContent: string) => {
      try {
        const iframe = iframeRef.current;
        const win = iframe?.contentWindow as Window & {
          ggbApplet?: { evalCommand: (cmd: string) => void; setXML?: (xml: string) => void };
          forceResize?: () => void;
        };

        if (!win?.ggbApplet) {
          console.warn('[GeoGebraViewer] ggbApplet 未就绪，脚本将排队等待');
          pendingScriptRef.current = scriptContent;
          return;
        }

        const lines = scriptContent.trim().split('\n').filter(l => l.trim());

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

          if (trimmed.startsWith('wait')) {
            const match = trimmed.match(/wait\s+(\d+)/i);
            const delay = match ? parseInt(match[1]) : 1000;
            return new Promise(resolve => setTimeout(() => {
              executeGeoGebraScript(scriptContent.replace(trimmed, '').trim());
              resolve(true);
            }, delay));
          }

          // 直接执行 GeoGebra 命令，不再解析嵌套的 evalCommand/setXML
          win.ggbApplet.evalCommand(trimmed);
        }

        if (typeof win.forceResize === 'function') {
          win.forceResize();
        }

        addLog(`✅ 执行 ${lines.length} 条指令`);
      } catch (e) {
        const msg = '执行脚本失败: ' + (e instanceof Error ? e.message : String(e));
        console.error('[GeoGebraViewer] ' + msg);
        addLog(msg);
        onError?.(msg);
      }
    }, [addLog, onError]);

    useImperativeHandle(ref, () => ({
      executeScript: executeGeoGebraScript,
      clear: clearConstruction,
      getApplet: () => appletRef.current,
      resetView: () => {
        try {
          const win = iframeRef.current?.contentWindow as Window & {
            ggbApplet?: { evalCommand: (cmd: string) => void };
          };
          win?.ggbApplet?.evalCommand('SetViewDirection(Vector((0,0,1)))');
          win?.ggbApplet?.evalCommand('ZoomIn()');
        } catch (e) {}
      },
    }));

    // 轮询 iframe.contentWindow.ggbApplet，直到就绪
    const startAppletPolling = useCallback(() => {
      if (pollIntervalRef.current) return;

      pollIntervalRef.current = setInterval(() => {
        const iframe = iframeRef.current;
        if (!iframe?.contentWindow) return;

        const win = iframe.contentWindow as Window & {
          ggbApplet?: unknown;
          forceResize?: () => void;
        };

        if (win.ggbApplet) {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;

          if (isReadyRef.current) return; // 防止重复触发
          isReadyRef.current = true;
          isLoadingRef.current = false;
          timeoutClearedRef.current = true;
          appletRef.current = win.ggbApplet;

          console.log('[GeoGebraViewer] ✅ ggbApplet 检测到就绪');
          setIsReady(true);
          setIsLoading(false);
          setLoadStartTime(null);
          addLog('✅ GeoGebra 就绪');

          // 触发 resize
          if (typeof win.forceResize === 'function') {
            win.forceResize();
          }

          // 执行队列中的脚本
          if (pendingScriptRef.current) {
            const pending = pendingScriptRef.current;
            pendingScriptRef.current = null;
            executeGeoGebraScript(pending);
          } else if (script && autoExecute) {
            executeGeoGebraScript(script);
          }

          onLoad?.();
        }
      }, 300);
    }, [script, autoExecute, executeGeoGebraScript, addLog, onLoad]);

    // iframe onLoad 后，启动轮询
    const handleIframeLoad = useCallback(() => {
      iframeLoadedRef.current = true;
      console.log('[GeoGebraViewer] ✅ iframe onLoad 触发');
      addLog('iframe 已加载，等待 GeoGebra 引擎初始化...');
      startAppletPolling();
    }, [addLog, startAppletPolling]);

    // iframe onLoad 触发后，每 3 秒更新一次日志
    useEffect(() => {
      if (!isLoading) return;

      const interval = setInterval(() => {
        if (isLoadingRef.current && loadStartTime) {
          const elapsed = Math.round((Date.now() - loadStartTime) / 1000);
          addLog(`⌛ 正在加载 GeoGebra... ${elapsed}s`);
        }
      }, 3000);

      return () => clearInterval(interval);
    }, [isLoading, loadStartTime, addLog]);

    // 超时逻辑（独立 useEffect，不依赖脚本 props）
    useEffect(() => {
      if (!isLoading) return;

      const startTime = Date.now();
      timeoutClearedRef.current = false;

      const timeout = setTimeout(() => {
        if (timeoutClearedRef.current) return;
        if (isReadyRef.current) return;

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const msg = '加载超时，请检查网络连接（已等待 ' + elapsed + ' 秒）';
        console.error('[GeoGebraViewer] ⏰ ' + msg);
        setError(msg);
        setIsLoading(false);
        addLog('⏰ ' + msg);
      }, 30000);

      return () => {
        clearTimeout(timeout);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      };
    }, [isLoading, addLog]);

    // 组件挂载时初始化
    useEffect(() => {
      console.log('[GeoGebraViewer] 组件挂载');
      setIsReady(false);
      setIsLoading(true);
      setError(null);
      setLoadingLog([]);
      setLoadStartTime(Date.now());
      isReadyRef.current = false;
      isLoadingRef.current = true;
      iframeLoadedRef.current = false;
      timeoutClearedRef.current = false;
      pendingScriptRef.current = null;

      addLog('开始加载 GeoGebra 渲染器...');
    }, [addLog]);

    // 当就绪且有脚本时执行
    useEffect(() => {
      if (isReady && script && autoExecute) {
        executeGeoGebraScript(script);
      }
    }, [isReady, script, autoExecute, executeGeoGebraScript]);

    return (
      <Card className={`relative overflow-hidden ${className}`} style={{ height }}>
        <iframe
          ref={iframeRef}
          src="/geogebra/index.html"
          className="w-full h-full border-0"
          style={{ display: 'block', width: '100%', height: '100%' }}
          allow="geolocation; microphone; camera; midi; encrypted-media"
          title="GeoGebra 3D渲染器"
          onLoad={handleIframeLoad}
          onError={() => {
            console.error('[GeoGebraViewer] ❌ iframe onError 触发');
            setError('GeoGebra iframe 加载失败，请检查网络连接');
            setIsLoading(false);
            addLog('❌ iframe 加载失败');
          }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-sm text-gray-600">加载GeoGebra渲染器...</p>
            {loadingLog.length > 0 && (
              <div className="mt-3 w-full max-w-sm space-y-1 text-xs text-gray-500">
                {loadingLog.slice(-4).map((item, index) => (
                  <div key={index} className="truncate">{item}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-sm text-red-600 font-medium text-center px-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                setLoadingLog([]);
                iframeLoadedRef.current = false;
                isReadyRef.current = false;
                if (iframeRef.current) {
                  iframeRef.current.src = '/geogebra/index.html';
                }
              }}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              重试
            </button>
          </div>
        )}
      </Card>
    );
  }
);

GeoGebraViewer.displayName = 'GeoGebraViewer';
