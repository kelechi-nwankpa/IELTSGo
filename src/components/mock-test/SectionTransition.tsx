'use client';

import { useState, useEffect } from 'react';

interface SectionTransitionProps {
  fromSection: string;
  toSection: string;
  countdownSeconds?: number;
  onCountdownComplete: () => void;
  onSkipCountdown?: () => void;
}

const SECTION_INFO: Record<string, { name: string; icon: string; tips: string[] }> = {
  LISTENING: {
    name: 'Listening',
    icon: '🎧',
    tips: [
      'Read questions before the audio starts',
      'Write answers as you listen',
      'Use the 10-minute transfer time wisely',
    ],
  },
  READING: {
    name: 'Reading',
    icon: '📖',
    tips: [
      'Skim the passage first for main ideas',
      "Don't spend too long on difficult questions",
      'Return to unanswered questions at the end',
    ],
  },
  WRITING: {
    name: 'Writing',
    icon: '✍️',
    tips: [
      'Spend 20 minutes on Task 1, 40 minutes on Task 2',
      'Plan your essays before writing',
      'Leave time to review and edit',
    ],
  },
  SPEAKING: {
    name: 'Speaking',
    icon: '🎤',
    tips: [
      'Speak clearly and at a natural pace',
      'Extend your answers with examples',
      "Don't worry about small mistakes",
    ],
  },
};

export function SectionTransition({
  fromSection,
  toSection,
  countdownSeconds = 10,
  onCountdownComplete,
  onSkipCountdown,
}: SectionTransitionProps) {
  const [countdown, setCountdown] = useState(countdownSeconds);

  useEffect(() => {
    if (countdown <= 0) {
      onCountdownComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onCountdownComplete]);

  const toSectionInfo = SECTION_INFO[toSection];
  const fromSectionInfo = SECTION_INFO[fromSection];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-lg text-center">
        {/* Completion message */}
        <div className="mb-8">
          <div className="mb-2 text-4xl">{fromSectionInfo?.icon}</div>
          <p className="text-lg text-green-400">✓ {fromSectionInfo?.name} section completed</p>
        </div>

        {/* Next section info */}
        <div className="mb-8">
          <div className="mb-4 text-6xl">{toSectionInfo?.icon}</div>
          <h2 className="text-3xl font-bold text-white">Next: {toSectionInfo?.name}</h2>
        </div>

        {/* Tips */}
        <div className="mb-8 rounded-xl bg-white/10 p-6 text-left">
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-blue-300 uppercase">
            Quick Tips
          </h3>
          <ul className="space-y-2">
            {toSectionInfo?.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-slate-300">
                <span className="mt-1 text-blue-400">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Countdown */}
        <div className="mb-6">
          <div className="mb-2 text-sm text-slate-400">Starting in</div>
          <div className="text-5xl font-bold text-white">{countdown}</div>
          <div className="text-sm text-slate-400">seconds</div>
        </div>

        {/* Skip button */}
        {onSkipCountdown && (
          <button
            onClick={onSkipCountdown}
            className="rounded-xl bg-white/10 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/20"
          >
            Start Now
          </button>
        )}
      </div>
    </div>
  );
}
