'use client';

import { Achievement, getRarityLabel } from '@/lib/achievements';

interface AchievementCardProps {
  achievement: Achievement;
  unlockedAt: Date;
  onShare?: () => void;
}

export function AchievementCard({ achievement, unlockedAt, onShare }: AchievementCardProps) {
  const rarityBg = {
    common: 'from-slate-500 to-slate-700',
    rare: 'from-blue-500 to-blue-700',
    epic: 'from-purple-500 to-purple-700',
    legendary: 'from-amber-500 to-amber-700',
  }[achievement.rarity];

  const handleShare = async () => {
    const text = `I just unlocked the "${achievement.name}" achievement on IELTSGo! ${achievement.icon}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IELTSGo Achievement',
          text,
          url: window.location.origin,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(text);
      onShare?.();
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
      {/* Header gradient */}
      <div className={`bg-gradient-to-r ${rarityBg} p-6 text-center text-white`}>
        <div className="mb-2 text-5xl">{achievement.icon}</div>
        <h3 className="text-xl font-bold">{achievement.name}</h3>
        <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
          {getRarityLabel(achievement.rarity)}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="mb-4 text-center text-slate-600">{achievement.description}</p>

        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-center">
          <div className="text-xs text-slate-500">Unlocked on</div>
          <div className="font-semibold text-slate-900">
            {unlockedAt.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 font-medium text-white transition-colors hover:bg-slate-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share Achievement
        </button>
      </div>
    </div>
  );
}
