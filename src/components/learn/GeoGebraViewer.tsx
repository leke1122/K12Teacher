'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export interface GeoGebraViewerProps {
  script?: string;
  autoExecute?: boolean;
  onLoad?: () => void;
  onError?: (error: string) => void;
  className?: string;
  height?: string | number;
  materialId?: string;
}

export interface GeoGebraViewerRef {
  executeScript: (script: string) => void;
  clear: () => void;
  getApplet: () => unknown;
  resetView: () => void;
}

// 加载 GeoGebra 脚本
const SCRIPT_URL = 'https://cdn.geogebra.org/apps/deployggb.js';

function loadGeoGebraScript(retries = 2): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).GGBApplet) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      if (retries > 0) {
        setTimeout(() => loadGeoGebraScript(retries - 1).then(resolve).catch(reject), 1000);
      } else {
        reject(new Error('加载 GeoGebra 脚本失败'));
      }
    };
    document.head.appendChild(script);
  });
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
      materialId,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appletRef = useRef<unknown>(null);
    const isReadyRef = useRef(false);
    const pendingScriptRef = useRef<string | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingLog, setLoadingLog] = useState<string[]>([]);

    const addLog = useCallback((msg: string) => {
      setLoadingLog(prev => {
        const next = [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`];
        return next.slice(-8);
      });
    }, []);

    const executeGeoGebraScript = useCallback((scriptContent: string) => {
      if (!isReadyRef.current) {
        console.warn('[GeoGebraViewer] GeoGebra 未就绪，脚本将排队等待');
        pendingScriptRef.current = scriptContent;
        return;
      }

      try {
        const ggbApplet = (window as any).ggbApplet;
        if (!ggbApplet) {
          console.warn('[GeoGebraViewer] ggbApplet 不可用');
          return;
        }

        const lines = scriptContent.trim().split('\n').filter(l => l.trim());

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

          try {
            ggbApplet.evalCommand(trimmed);
          } catch (cmdError) {
            console.warn(`[GeoGebraViewer] 命令执行失败: ${trimmed}`, cmdError);
          }
        }

        addLog(`✅ 执行 ${lines.length} 条指令`);
      } catch (e) {
        const msg = '执行脚本失败: ' + (e instanceof Error ? e.message : String(e));
        console.error('[GeoGebraViewer] ' + msg);
        addLog(msg);
        onError?.(msg);
      }
    }, [addLog, onError]);

    const clearConstruction = useCallback(() => {
      try {
        const ggbApplet = (window as any).ggbApplet;
        if (ggbApplet) {
          ggbApplet.setXML('<geogebra></geogebra>');
          addLog('构造已清空');
        }
      } catch (e) {
        addLog('清空构造失败: ' + String(e));
      }
    }, [addLog]);

    useImperativeHandle(ref, () => ({
      executeScript: executeGeoGebraScript,
      clear: clearConstruction,
      getApplet: () => appletRef.current,
      resetView: () => {
        try {
          const ggbApplet = (window as any).ggbApplet;
          if (ggbApplet) {
            ggbApplet.evalCommand('SetViewDirection(Vector((0,0,1)))');
            ggbApplet.evalCommand('ZoomIn()');
          }
        } catch (e) {}
      },
    }));

    // 初始化 GeoGebra
    useEffect(() => {
      let mounted = true;

      const initGeoGebra = async () => {
        setIsReady(false);
        setIsLoading(true);
        setError(null);
        setLoadingLog([]);
        isReadyRef.current = false;
        pendingScriptRef.current = null;

        addLog('开始加载 GeoGebra...');

        try {
          // 加载 GeoGebra 脚本
          addLog('加载 GeoGebra 引擎...');
          await loadGeoGebraScript();

          if (!mounted) return;

          // 等待脚本加载完成
          await new Promise(resolve => setTimeout(resolve, 500));

          if (!mounted) return;

          const G = (window as any);
          if (!G || !G.GGBApplet) {
            throw new Error('GeoGebra API 未定义');
          }

          addLog('创建 GeoGebra 实例...');

          // 创建 applet 配置
          const parameters: Record<string, unknown> = {
            id: 'ggbApplet',
            width: containerRef.current?.clientWidth || 800,
            height: containerRef.current?.clientHeight || 600,
            showMenuBar: false,
            showToolBar: true,
            showAlgebraInput: true,
            showResetIcon: true,
            enableLabelDrags: true,
            enableRightClick: true,
            errorDialogsActive: false,
            showTutorialLink: false,
            showStartTooltip: true,
            capturingThreshold: 5000,
            appletOnLoad: () => {
              console.log('[GeoGebraViewer] ✅ applet onLoad 回调');
              isReadyRef.current = true;
              appletRef.current = G.ggbApplet;
              setIsReady(true);
              setIsLoading(false);
              addLog('✅ GeoGebra 就绪');

              setTimeout(() => {
                if (pendingScriptRef.current) {
                  const pending = pendingScriptRef.current;
                  pendingScriptRef.current = null;
                  executeGeoGebraScript(pending);
                } else if (script && autoExecute) {
                  executeGeoGebraScript(script);
                }
              }, 300);

              onLoad?.();
            },
          };

          if (materialId) {
            parameters.material_id = materialId;
          }

          // 创建并注入 applet
          const applet = new G.GGBApplet(parameters, true);

          if (containerRef.current) {
            containerRef.current.innerHTML = '';
            applet.inject(containerRef.current);
            addLog('GeoGebra 正在初始化...');
          }
        } catch (err) {
          if (!mounted) return;
          const msg = err instanceof Error ? err.message : '加载失败';
          console.error('[GeoGebraViewer] 初始化失败:', msg);
          setError(msg);
          setIsLoading(false);
          addLog('❌ ' + msg);
          onError?.(msg);
        }
      };

      initGeoGebra();

      return () => {
        mounted = false;
        // 清理
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        delete (window as any).ggbApplet;
      };
    }, [materialId, addLog, onLoad, onError]);

    // 当就绪且有脚本时执行
    useEffect(() => {
      if (isReady && script && autoExecute && !pendingScriptRef.current) {
        executeGeoGebraScript(script);
      }
    }, [isReady, script, autoExecute, executeGeoGebraScript]);

    return (
      <Card className={`relative overflow-hidden ${className}`} style={{ height }}>
        {/* GeoGebra 容器 */}
        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />

        {/* 加载状态 */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-3 text-sm text-gray-600 font-medium">加载 GeoGebra 渲染器...</p>
            {loadingLog.length > 0 && (
              <div className="mt-3 w-full max-w-sm space-y-1 text-xs text-gray-500 text-center">
                {loadingLog.slice(-4).map((item, index) => (
                  <div key={index} className="truncate">{item}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 错误状态 */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <p className="text-sm text-red-600 font-medium text-center px-4 max-w-md">
              {error}
            </p>
            <button
              onClick={() => {
                setError(null);
                // 重新触发初始化
                window.location.reload();
              }}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              刷新重试
            </button>
          </div>
        )}

        {/* 备选提示 */}
        {!isLoading && !error && !isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            <p className="mt-2 text-xs text-gray-500">等待 GeoGebra 初始化...</p>
          </div>
        )}
      </Card>
    );
  }
);

GeoGebraViewer.displayName = 'GeoGebraViewer';
