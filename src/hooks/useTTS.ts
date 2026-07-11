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

      // 15秒超时
      const timeout = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, 15000);

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
        return {
          taskId: data.taskId,
          provider: 'iflytek',
        };
      }

      options.onError?.(data.message || '讯飞任务创建失败');
      return null;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        options.onError?.('讯飞请求超时，已自动切换到浏览器朗读');
        return null;
      }
      options.onError?.(error instanceof Error ? error.message : '讯飞请求失败');
      return null;
    }
  }, [settings, options]);

  // 查询讯飞任务结果
  // 返回值: audioUrl | 'pending' | null
  const queryIFlyTekTask = useCallback(async (taskId: string): Promise<string | 'pending' | null> => {
    const { iflytekTtsApiKey, iflytekTtsApiSecret, iflytekTtsAppId } = settings;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

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

      if (data.success) {
        if (data.audioUrl) {
          return data.audioUrl;
        }
        return 'pending';
      }

      options.onError?.(data.message || '查询失败');
      return null;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        options.onError?.('讯飞查询超时');
        return null;
      }
      options.onError?.(error instanceof Error ? error.message : '查询失败');
      return null;
    }
  }, [settings, options]);

  // 等待讯飞任务完成（最多等待30秒）
  const waitForIFlyTekTask = useCallback(async (taskId: string): Promise<string | null> => {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 30; // 最多30秒

      pollingRef.current = setInterval(async () => {
        attempts++;

        if (attempts >= maxAttempts) {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          options.onError?.('讯飞合成超时（30秒），已自动切换到浏览器朗读');
          resolve(null);
          return;
        }

        const result = await queryIFlyTekTask(taskId);
        
        if (result === null) {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          resolve(null);
        } else if (result === 'pending') {
          // 任务进行中，继续轮询
        } else {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          resolve(result);
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
