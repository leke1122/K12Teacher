// TTS Hook - 用于文言文和古文朗读
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

interface UseTTSOptions {
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

interface TTSTask {
  taskId: string;
  provider: 'iflytek' | 'aliyun';
}

export function useTTS(options: UseTTSOptions = {}) {
  const { settings } = useSettingsStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 清理函数
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 停止播放
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setProgress(0);
  }, []);

  // 播放音频
  const playAudio = useCallback((audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    audioRef.current = new Audio(audioUrl);
    audioRef.current.play();
    setIsPlaying(true);
    setIsLoading(false);

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setProgress(100);
      options.onEnd?.();
    };

    audioRef.current.onerror = () => {
      setIsPlaying(false);
      options.onError?.('音频播放失败');
    };

    audioRef.current.ontimeupdate = () => {
      if (audioRef.current) {
        const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(percent);
      }
    };
  }, [options]);

  // 播放本地音频数据
  const playAudioBuffer = useCallback((buffer: ArrayBuffer | Blob, mimeType: string = 'audio/mpeg') => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const blob = buffer instanceof Blob ? buffer : new Blob([buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    audioRef.current = new Audio(url);
    audioRef.current.play();
    setIsPlaying(true);
    setIsLoading(false);

    audioRef.current.onended = () => {
      URL.revokeObjectURL(url);
      setIsPlaying(false);
      setProgress(100);
      options.onEnd?.();
    };

    audioRef.current.onerror = () => {
      URL.revokeObjectURL(url);
      setIsPlaying(false);
      options.onError?.('音频播放失败');
    };
  }, [options]);

  // 讯飞长文合成（异步，需要轮询）
  const synthesizeWithIFlyTek = useCallback(async (text: string): Promise<TTSTask | null> => {
    const { iflytekTtsApiKey, iflytekTtsApiSecret, iflytekTtsAppId } = settings;

    if (!iflytekTtsApiKey || !iflytekTtsApiSecret || !iflytekTtsAppId) {
      options.onError?.('请先在设置中配置讯飞 TTS');
      return null;
    }

    try {
      abortControllerRef.current = new AbortController();

      // 30秒超时（讯飞长文本合成可能需要更久）
      const timeout = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, 30000);

      const controller = abortControllerRef.current;
      
      const response = await fetch('/api/tts/iflytek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          appId: iflytekTtsAppId,
          apiKey: iflytekTtsApiKey,
          apiSecret: iflytekTtsApiSecret,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await response.json();

      if (data.success && data.taskId) {
        console.log('[TTS] 讯飞任务创建成功:', data.taskId);
        return {
          taskId: data.taskId,
          provider: 'iflytek',
        };
      }

      console.error('[TTS] 讯飞任务创建失败:', data);
      options.onError?.(data.message || '讯飞任务创建失败');
      return null;
    } catch (error) {
      console.error('[TTS] 讯飞创建任务异常:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        options.onError?.('讯飞请求超时，已自动切换到浏览器朗读');
        return null;
      }
      options.onError?.(error instanceof Error ? error.message : '讯飞请求失败');
      return null;
    }
  }, [settings, options]);

  // 查询讯飞任务结果
  // 返回值: { audioUrl: string } | 'pending' | { error: string }
  const queryIFlyTekTask = useCallback(async (taskId: string): Promise<{ audioUrl: string } | 'pending' | { error: string }> => {
    const { iflytekTtsApiKey, iflytekTtsApiSecret, iflytekTtsAppId } = settings;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/tts/iflytek/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          appId: iflytekTtsAppId,
          apiKey: iflytekTtsApiKey,
          apiSecret: iflytekTtsApiSecret,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await response.json();
      console.log('[TTS] query result:', data);

      // 讯飞服务端出错
      if (data.success === false) {
        console.error('[TTS] 讯飞 query 出错:', data.message, '— 切换到浏览器朗读');
        return { error: data.message || '讯飞服务不可用' };
      }

      // 服务端直接返回了音频数据（base64）
      if (data.success && data.audioData) {
        const audioUrl = 'data:' + (data.mimeType || 'audio/mpeg') + ';base64,' + data.audioData;
        console.log('[TTS] 讯飞音频就绪(base64), 大小:', Math.round(data.audioData.length * 0.75), 'bytes');
        return { audioUrl };
      }

      // 服务端返回了音频下载地址，让浏览器直接下载（绕过 Vercel 无法访问讯飞音频的问题）
      if (data.success && data.audioUrl) {
        console.log('[TTS] 讯飞音频下载地址:', data.audioUrl, '— 浏览器直连');
        return { audioUrl: data.audioUrl };
      }

      // 任务进行中，继续轮询
      return 'pending';
    } catch (error) {
      console.error('[TTS] 讯飞 query 网络异常:', error instanceof Error ? error.message : error);
      return { error: error instanceof Error && error.name === 'AbortError' ? '讯飞查询超时' : '讯飞查询失败' };
    }
  }, [settings]);

  // 等待讯飞任务完成（最多等待60秒）
  const waitForIFlyTekTask = useCallback(async (taskId: string): Promise<string | null> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 60; // 最多60秒（长文本合成可能需要更久）

      pollingRef.current = setInterval(async () => {
        attempts++;

        if (attempts >= maxAttempts) {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          console.error('[TTS] 讯飞轮询超时（60秒）');
          resolve(null);
          return;
        }

        const result = await queryIFlyTekTask(taskId);
        
        if (!result || result === 'pending') {
          // 任务进行中，继续轮询
        } else if ('audioUrl' in result) {
          // 音频就绪
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          resolve(result.audioUrl);
        } else if ('error' in result) {
          // 讯飞出错，停止轮询并通知上层切换降级
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          options.onError?.(result.error);
          resolve(null);
        }
      }, 1000);
    });
  }, [queryIFlyTekTask, options]);

  // 阿里云 TTS（同步，直接返回音频）
  const synthesizeWithAliyun = useCallback(async (text: string): Promise<ArrayBuffer | null> => {
    const { aliyunTtsApiKey, aliyunTtsApiSecret, aliyunTtsAppKey } = settings;

    if (!aliyunTtsApiKey || !aliyunTtsApiSecret || !aliyunTtsAppKey) {
      options.onError?.('请先在设置中配置阿里云 TTS');
      return null;
    }

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          provider: 'aliyun',
          aliyunAccessKeyId: aliyunTtsApiKey,
          aliyunAccessKeySecret: aliyunTtsApiSecret,
          aliyunAppKey: aliyunTtsAppKey,
        }),
        signal: abortControllerRef.current.signal,
      });

      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('audio')) {
        const buffer = await response.arrayBuffer();
        return buffer;
      }

      const data = await response.json();
      options.onError?.(data.message || '合成失败');
      return null;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      options.onError?.(error instanceof Error ? error.message : '请求失败');
      return null;
    }
  }, [settings, options]);

  // 浏览器 TTS
  const speakWithBrowser = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      options.onError?.('浏览器不支持语音合成');
      return;
    }

    stop(); // 停止之前的播放

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = settings.ttsRate ?? 0.85;
    utterance.pitch = settings.ttsPitch ?? 1.1;

    // 尝试使用用户选择的语音，或默认使用男声
    const voices = window.speechSynthesis.getVoices();
    const targetVoiceName = settings.ttsVoice || 'zh-CN-YunyangNeural';
    let selectedVoice = voices.find(v => v.name === targetVoiceName);
    
    // 如果没找到指定语音，找一个中文男声备选
    if (!selectedVoice) {
      // 常见中文男声：云扬、凯楠等
      const maleVoiceNames = ['Yunyang', 'YunyangNeural', 'Kangkang', 'Yunfei', 'Yunfeng'];
      selectedVoice = voices.find(v => 
        v.lang.startsWith('zh') && 
        maleVoiceNames.some(name => v.name.includes(name))
      );
    }
    
    // 再找任何中文语音
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('zh'));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      options.onStart?.();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      options.onEnd?.();
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      options.onError?.('播放失败');
    };

    window.speechSynthesis.speak(utterance);
  }, [stop, settings.ttsRate, settings.ttsPitch, settings.ttsVoice, options]);

  // 主合成函数
  const speak = useCallback(async (text: string) => {
    stop();
    setIsLoading(true);
    setProgress(0);
    options.onStart?.();

    const provider = settings.ttsProvider || 'web';

    try {
      if (provider === 'iflytek') {
        const task = await synthesizeWithIFlyTek(text);
        if (task) {
          const audioUrl = await waitForIFlyTekTask(task.taskId);
          if (audioUrl) {
            playAudio(audioUrl);
          }
        }
        if (!task) {
          setIsLoading(false);
          speakWithBrowser(text);
          return;
        }
      } else if (provider === 'aliyun') {
        const buffer = await synthesizeWithAliyun(text);
        if (buffer) {
          playAudioBuffer(buffer);
        } else {
          setIsLoading(false);
          speakWithBrowser(text);
          return;
        }
      } else {
        speakWithBrowser(text);
      }
    } catch (error) {
      options.onError?.(error instanceof Error ? error.message : '合成失败');
      setIsLoading(false);
      speakWithBrowser(text);
    } finally {
      setIsLoading(false);
    }
  }, [
    stop,
    settings.ttsProvider,
    synthesizeWithIFlyTek,
    waitForIFlyTekTask,
    synthesizeWithAliyun,
    speakWithBrowser,
    playAudio,
    playAudioBuffer,
    options,
    queryIFlyTekTask,
  ]);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
    progress,
  };
}
