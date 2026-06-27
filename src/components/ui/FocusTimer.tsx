'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useUserGradeStore, getTimerPreset } from '@/stores/gradeStore';
import { saveStudyDuration } from '@/lib/dataSync';
import { Play, Pause, RotateCcw, Timer, Target, Award } from 'lucide-react';

interface FocusTimerProps {
  subjectId?: string;
  onFocusEnd?: (minutes: number) => void;
}

type TimerState = 'idle' | 'running' | 'paused';

const PRESETS = [
  { label: '15分钟', minutes: 15 },
  { label: '25分钟', minutes: 25 },
  { label: '45分钟', minutes: 45 },
  { label: '60分钟', minutes: 60 },
];

export function FocusTimer({ subjectId, onFocusEnd }: FocusTimerProps) {
  const { grade } = useUserGradeStore();
  const preset = getTimerPreset(grade);

  const [duration, setDuration] = useState(preset.work); // 总时长（秒）
  const [timeLeft, setTimeLeft] = useState(preset.work * 60); // 剩余秒数
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [goal, setGoal] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [showGoal, setShowGoal] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  // 成就徽章
  const [streakCount, setStreakCount] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem('edumind_focus_streak') || '0', 10);
  });
  const [showBadge, setShowBadge] = useState(false);
  const [badgeName, setBadgeName] = useState('');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0); // 已专注秒数
  const pausedTimeRef = useRef<number>(0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 发送浏览器通知
  const sendNotification = useCallback(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification('🎉 专注完成！', {
        body: goal ? `目标「${goal}」已完成！你真棒！` : '恭喜你完成了一段专注学习！',
        icon: '/favicon.ico',
      });
    }
  }, [goal]);

  // 计时结束处理
  const handleComplete = useCallback(async () => {
    clearTimer();
    setTimerState('idle');
    sendNotification();

    const minutes = Math.round(elapsedRef.current / 60);
    if (minutes > 0 && subjectId) {
      await saveStudyDuration(subjectId, minutes);
      console.log('[专注计时] 已记录专注时长:', minutes, '分钟');
    }
    onFocusEnd?.(minutes);

    // 更新连续成就
    const newStreak = streakCount + 1;
    setStreakCount(newStreak);
    localStorage.setItem('edumind_focus_streak', String(newStreak));

    if (newStreak === 3) {
      setBadgeName('🏅 专注达人');
      setShowBadge(true);
    } else if (newStreak === 7) {
      setBadgeName('🌟 持之以恒');
      setShowBadge(true);
    }
  }, [clearTimer, sendNotification, subjectId, onFocusEnd, streakCount]);

  // 主计时循环
  useEffect(() => {
    if (timerState !== 'running') return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        elapsedRef.current += 1;
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [timerState, clearTimer, handleComplete]);

  // 重置
  const handleReset = () => {
    clearTimer();
    setTimerState('idle');
    setTimeLeft(duration * 60);
    elapsedRef.current = 0;
    pausedTimeRef.current = 0;
  };

  // 选择预设时长
  const handlePreset = (minutes: number) => {
    if (timerState === 'running') return;
    setDuration(minutes);
    setTimeLeft(minutes * 60);
    elapsedRef.current = 0;
    setShowCustom(false);
    setShowGoal(true);
  };

  // 自定义时长
  const handleCustomApply = () => {
    const m = parseInt(customMinutes, 10);
    if (!m || m < 1 || m > 120) return;
    setDuration(m);
    setTimeLeft(m * 60);
    elapsedRef.current = 0;
    setTimerState('idle');
    setShowCustom(false);
    setShowGoal(true);
  };

  // 目标设置
  const handleGoalConfirm = () => {
    if (!goal.trim()) return;
    setShowGoal(false);
    setTimerState('running');
  };

  // 请求通知权限
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <div className="flex flex-col gap-2">
      {/* 顶部：年级标签 + 连续次数 */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          <Timer className="h-3 w-3 mr-1" />
          {grade === 'grade1' ? '高一' : grade === 'grade2' ? '高二' : '高三'}
        </Badge>
        {streakCount >= 3 && (
          <Badge variant="secondary" className="text-xs">
            <Award className="h-3 w-3 mr-1" />
            连续{streakCount}次
          </Badge>
        )}
      </div>

      {/* 计时器显示 */}
      <div className="relative">
        {/* 进度条 */}
        <div className="absolute inset-0 h-12 rounded-lg overflow-hidden bg-muted">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="relative flex items-center justify-center h-12">
          <span className="text-2xl font-mono font-bold text-foreground drop-shadow-sm">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* 目标提示（计时中） */}
      {timerState === 'running' && goal && (
        <p className="text-xs text-center text-muted-foreground truncate">
          🎯 {goal}
        </p>
      )}

      {/* 预设按钮 */}
      {timerState === 'idle' && !showGoal && !showCustom && (
        <div className="flex gap-1 flex-wrap">
          {PRESETS.map((p) => (
            <Button
              key={p.minutes}
              variant="outline"
              size="sm"
              className="text-xs h-7"
              onClick={() => handlePreset(p.minutes)}
            >
              {p.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7"
            onClick={() => setShowCustom(true)}
          >
            自定义
          </Button>
        </div>
      )}

      {/* 自定义时长 */}
      {showCustom && (
        <div className="flex gap-1 items-center">
          <Input
            type="number"
            min={1}
            max={120}
            placeholder="分钟"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            className="w-20 h-8 text-sm"
          />
          <span className="text-xs text-muted-foreground">分钟</span>
          <Button size="sm" className="h-8 text-xs" onClick={handleCustomApply}>
            确定
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowCustom(false)}>
            取消
          </Button>
        </div>
      )}

      {/* 目标设置 */}
      {showGoal && (
        <div className="flex gap-1 items-center">
          <Input
            placeholder="本次目标（可选）"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="h-8 text-sm flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleGoalConfirm()}
          />
          <Button size="sm" className="h-8 text-xs" onClick={handleGoalConfirm}>
            开始
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setShowGoal(false); setTimerState('running'); }}>
            跳过
          </Button>
        </div>
      )}

      {/* 控制按钮 */}
      {timerState !== 'idle' && (
        <div className="flex gap-2 justify-center">
          {timerState === 'running' ? (
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => { setTimerState('paused'); clearTimer(); }}
            >
              <Pause className="h-4 w-4" />
              暂停
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="flex-1 gap-1"
              onClick={() => setTimerState('running')}
            >
              <Play className="h-4 w-4" />
              继续
            </Button>
          )}
          <Button variant="outline" size="sm" className="gap-1" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            重置
          </Button>
        </div>
      )}

      {/* 成就弹窗 */}
      {showBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="text-5xl mb-3">{badgeName.includes('持之以恒') ? '🌟' : '🏅'}</div>
            <h3 className="text-lg font-bold mb-2">{badgeName}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {badgeName === '🏅 专注达人'
                ? '连续专注3次！你已经掌握了番茄工作法的精髓！'
                : '连续专注7天！持之以恒的力量，你正在积累！'}
            </p>
            <Button onClick={() => setShowBadge(false)} className="w-full">
              太棒了，继续加油！
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
