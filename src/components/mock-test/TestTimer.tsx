'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface TestTimerProps {
  deadline: Date;
  onTimeUp?: () => void;
  onWarning?: (minutesLeft: number) => void;
  warningThresholds?: number[]; // minutes
  className?: string;
  showProgress?: boolean;
  totalDurationMinutes?: number;
}

export function TestTimer({
  deadline,
  onTimeUp,
  onWarning,
  warningThresholds = [10, 5, 1],
  className = '',
  showProgress = false,
  totalDurationMinutes,
}: TestTimerProps) {
  // Memoize deadline timestamp to use as dependency
  const deadlineTime = useMemo(() => new Date(deadline).getTime(), [deadline]);

  // Calculate initial values based on deadline
  const getInitialTimeRemaining = () => {
    const remaining = deadlineTime - Date.now();
    return Math.floor(remaining / 1000);
  };

  const [timeRemaining, setTimeRemaining] = useState(getInitialTimeRemaining);
  const [isOvertime, setIsOvertime] = useState(() => getInitialTimeRemaining() <= 0);
  const triggeredWarningsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Reset warnings when deadline changes
    triggeredWarningsRef.current = new Set();

    // Store callbacks in closure to avoid ref issues
    const timeUpCallback = onTimeUp;
    const warningCallback = onWarning;

    const interval = setInterval(() => {
      const remaining = Math.floor((deadlineTime - Date.now()) / 1000);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        setIsOvertime((prev) => {
          if (!prev) {
            timeUpCallback?.();
          }
          return true;
        });
      } else {
        setIsOvertime(false);
      }

      // Check warning thresholds
      const minutesLeft = Math.ceil(remaining / 60);
      warningThresholds.forEach((threshold) => {
        if (minutesLeft === threshold && !triggeredWarningsRef.current.has(threshold)) {
          triggeredWarningsRef.current.add(threshold);
          warningCallback?.(threshold);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [deadlineTime, warningThresholds, onTimeUp, onWarning]);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const absSeconds = Math.abs(seconds);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine color based on time remaining
  const getColorClass = (): string => {
    if (isOvertime) return 'text-red-600 bg-red-50 border-red-200';
    const minutes = timeRemaining / 60;
    if (minutes <= 1) return 'text-red-600 bg-red-50 border-red-200 animate-pulse';
    if (minutes <= 5) return 'text-red-600 bg-red-50 border-red-200';
    if (minutes <= 10) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-700 bg-white border-slate-200';
  };

  // Calculate progress percentage
  const progressPercent =
    showProgress && totalDurationMinutes
      ? Math.max(
          0,
          Math.min(
            100,
            ((totalDurationMinutes * 60 - timeRemaining) / (totalDurationMinutes * 60)) * 100
          )
        )
      : 0;

  return (
    <div className={`${className}`}>
      <div
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-lg font-bold transition-colors ${getColorClass()}`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          {isOvertime && '-'}
          {formatTime(timeRemaining)}
        </span>
      </div>

      {showProgress && totalDurationMinutes && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all duration-1000 ${
              isOvertime
                ? 'bg-red-500'
                : timeRemaining / 60 <= 5
                  ? 'bg-red-500'
                  : timeRemaining / 60 <= 10
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
