'use client';

import { useState, useCallback } from 'react';
import { TutorialStep } from '@/types/geometry';

export function useTutorial(getApiKey?: () => string | null) {
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSteps = useCallback(async (geometryData: unknown) => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const apiKey = typeof getApiKey === 'function' ? getApiKey() : null;
      if (apiKey) {
        headers['x-qwen-api-key'] = apiKey;
      }

      const response = await fetch('/api/ai/tutorial', {
        method: 'POST',
        headers,
        body: JSON.stringify({ geometryData }),
      });

      if (!response.ok) {
        throw new Error('生成解题步骤失败');
      }

      const result = (await response.json()) as { success: boolean; data?: TutorialStep[]; error?: string };
      if (result.success && result.data) {
        setSteps(result.data);
        return result.data;
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getApiKey]);

  const reset = useCallback(() => {
    setSteps([]);
    setError(null);
  }, []);

  return {
    steps,
    isLoading,
    error,
    generateSteps,
    reset,
  };
}
