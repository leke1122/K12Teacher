import { useState, useEffect, useCallback } from 'react';
import type { AnalysisSource, AnalysisFeedback, AnalysisAttempt, AnalysisQuestion } from '@/types/history';

export interface UseAnalysisReturn {
  source: AnalysisSource | null;
  currentQuestion: AnalysisQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  stage: 'material' | 'answer' | 'feedback' | 'completed';
  answer: string;
  feedback: AnalysisFeedback | null;
  submitting: boolean;
  attempts: number;
  showHintIndex: number;
  scores: number[];
  completed: boolean;
  avgScore: number;
  progress: number;
  setAnswer: (value: string) => void;
  startAnswer: () => void;
  submitAnswer: () => Promise<void>;
  retryAnswer: () => void;
  nextQuestion: () => void;
  showNextHint: () => void;
  reset: () => void;
  loadSource: (sourceId: string) => Promise<void>;
}

export function useAnalysis(initialSourceId?: string): UseAnalysisReturn {
  const [source, setSource] = useState<AnalysisSource | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<'material' | 'answer' | 'feedback' | 'completed'>('material');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<AnalysisFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showHintIndex, setShowHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const totalQuestions = source?.questions?.length || 0;
  const currentQuestion = useCallback(() => {
    if (!source?.questions?.length) return null;
    return source.questions[currentIndex] || null;
  }, [source, currentIndex])();

  const progress = totalQuestions
    ? Math.round((currentIndex / totalQuestions) * 100)
    : 0;

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const loadSource = useCallback(async (sourceId: string) => {
    setSource(null);
    setCurrentIndex(0);
    setStage('material');
    setAnswer('');
    setFeedback(null);
    setShowHintIndex(0);
    setAttempts(0);
    setScores([]);
    setCompleted(false);

    try {
      const res = await fetch(`/api/history/analysis/generate?chapterId=${encodeURIComponent(sourceId)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSource(json.data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (initialSourceId) {
      loadSource(initialSourceId);
    }
  }, [initialSourceId, loadSource]);

  const startAnswer = useCallback(() => {
    setStage('answer');
    setAnswer('');
    setFeedback(null);
    setShowHintIndex(0);
    setAttempts(0);
  }, []);

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !source || !answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/history/analysis/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: source.id,
          questionId: currentQuestion.id,
          answer: answer.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(json.data.feedback);
        setAttempts((p) => p + 1);
        setScores((p) => [...p, json.data.feedback.score]);
        setStage('feedback');
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }, [answer, currentQuestion, source]);

  const retryAnswer = useCallback(() => {
    setAnswer('');
    setFeedback(null);
    setStage('answer');
    setShowHintIndex(0);
  }, []);

  const nextQuestion = useCallback(() => {
    if (!source?.questions?.length) return;
    if (currentIndex < source.questions.length - 1) {
      setCurrentIndex((p) => p + 1);
      setStage('material');
      setAnswer('');
      setFeedback(null);
      setShowHintIndex(0);
      setAttempts(0);
    } else {
      setCompleted(true);
      setStage('completed');
    }
  }, [currentIndex, source]);

  const showNextHint = useCallback(() => {
    if (!currentQuestion) return;
    setShowHintIndex((p) => Math.min(p + 1, currentQuestion.hints.length));
  }, [currentQuestion]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setStage('material');
    setAnswer('');
    setFeedback(null);
    setShowHintIndex(0);
    setAttempts(0);
    setScores([]);
    setCompleted(false);
  }, []);

  return {
    source,
    currentQuestion,
    currentIndex,
    totalQuestions,
    stage,
    answer,
    feedback,
    submitting,
    attempts,
    showHintIndex,
    scores,
    completed,
    avgScore,
    progress,
    setAnswer,
    startAnswer,
    submitAnswer,
    retryAnswer,
    nextQuestion,
    showNextHint,
    reset,
    loadSource,
  };
}
