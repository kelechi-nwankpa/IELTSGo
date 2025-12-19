'use client';

import { useState, useEffect, useCallback } from 'react';

interface TimerProps {
  initialMinutes?: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
}

export function Timer({ initialMinutes = 40, onTimeUp, autoStart = false }: TimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(autoStart);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  useEffect(() => {
    if (!isRunning || totalSeconds <= 0) return;

    const interval = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, totalSeconds, onTimeUp]);

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const reset = useCallback(() => {
    setTotalSeconds(initialMinutes * 60);
    setIsRunning(false);
  }, [initialMinutes]);

  const getTimerColor = () => {
    if (totalSeconds <= 300) return 'text-red-600'; // 5 minutes or less
    if (totalSeconds <= 600) return 'text-amber-500'; // 10 minutes or less
    return 'text-gray-700';
  };

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
      <div className={`font-mono text-2xl font-bold ${getTimerColor()}`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>

      <div className="flex gap-1">
        <button
          onClick={toggle}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <button
          onClick={reset}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title="Reset"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
