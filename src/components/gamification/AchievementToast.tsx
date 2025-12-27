'use client';

import { useEffect, useState } from 'react';
import { Achievement, getRarityColor, getRarityLabel } from '@/lib/achievements';
import { ConfettiCelebration } from './ConfettiCelebration';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
  autoClose?: number;
}

export function AchievementToast({
  achievement,
  onClose,
  autoClose = 5000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
      // Show confetti for epic/legendary achievements
      if (achievement.rarity === 'epic' || achievement.rarity === 'legendary') {
        setShowConfetti(true);
      }
    });

    // Auto close
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, autoClose);

    return () => clearTimeout(timer);
  }, [achievement.rarity, autoClose, onClose]);

  const rarityColors = getRarityColor(achievement.rarity);

  return (
    <>
      <ConfettiCelebration trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div
        className={`fixed right-6 bottom-6 z-50 transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className={`rounded-xl border-2 bg-white p-4 shadow-2xl ${rarityColors}`}>
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${rarityColors}`}
            >
              {achievement.icon}
            </div>

            {/* Content */}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider text-amber-500 uppercase">
                  Achievement Unlocked!
                </span>
                <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${rarityColors}`}>
                  {getRarityLabel(achievement.rarity)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{achievement.name}</h3>
              <p className="text-sm text-slate-600">{achievement.description}</p>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="ml-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
