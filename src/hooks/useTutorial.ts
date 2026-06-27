'use client';

import { useState, useCallback } from 'react';
import { TutorialStep } from '@/types/geometry';

export function useTutorial() {
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSteps = useCallback(async (geometryData: unknown) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/tutorial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
  }, []);

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
