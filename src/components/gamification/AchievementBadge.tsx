'use client';

import { Achievement, getRarityColor, getRarityLabel } from '@/lib/achievements';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  unlockedAt?: Date;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function AchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
  size = 'md',
  showDetails = false,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: 'h-12 w-12 text-xl',
    md: 'h-16 w-16 text-2xl',
    lg: 'h-20 w-20 text-3xl',
  };

  const rarityColors = getRarityColor(achievement.rarity);

  return (
    <div className={`flex items-center gap-3 ${showDetails ? 'w-full' : ''}`}>
      {/* Badge Icon */}
      <div
        className={`flex shrink-0 items-center justify-center rounded-full border-2 ${sizeClasses[size]} ${
          unlocked ? `${rarityColors} shadow-lg` : 'border-slate-200 bg-slate-100 text-slate-300'
        } ${unlocked ? 'animate-badge-unlock' : ''}`}
      >
        <span className={unlocked ? '' : 'opacity-50 grayscale'}>{achievement.icon}</span>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${unlocked ? 'text-slate-900' : 'text-slate-400'}`}>
              {achievement.name}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                unlocked ? rarityColors : 'bg-slate-100 text-slate-400'
              }`}
            >
              {getRarityLabel(achievement.rarity)}
            </span>
          </div>
          <p className={`text-sm ${unlocked ? 'text-slate-600' : 'text-slate-400'}`}>
            {achievement.description}
          </p>
          {unlocked && unlockedAt && (
            <p className="mt-0.5 text-xs text-slate-400">
              Unlocked {formatRelativeTime(unlockedAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
